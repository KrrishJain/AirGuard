import os
os.environ["PYTHONHASHSEED"] = "42"
os.environ["TF_DETERMINISTIC_OPS"] = "1"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import random
import numpy as np
import tensorflow as tf

random.seed(42)
np.random.seed(42)
tf.random.set_seed(42)

import pandas as pd
from datetime import timedelta

from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input

import psycopg2
from dotenv import load_dotenv

load_dotenv()
NEON_DB_URL = os.getenv("NEON_DB_URL")

if not NEON_DB_URL:
    raise ValueError("NEON_DB_URL not found in .env file")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "BandraKurlaComplexMumbaiIITM.csv")

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"CSV not found at: {DATA_PATH}")

df_raw = pd.read_csv(DATA_PATH)
df_raw["From Date"] = pd.to_datetime(df_raw["From Date"])
df_raw = df_raw.sort_values("From Date")


if "AQI" not in df_raw.columns:
    def calculate_aqi_pm25(pm25):
        if pm25 <= 30:
            return (50 / 30) * pm25
        elif pm25 <= 60:
            return 50 + ((pm25 - 30) / 30) * 50
        elif pm25 <= 90:
            return 100 + ((pm25 - 60) / 30) * 100
        elif pm25 <= 120:
            return 200 + ((pm25 - 90) / 30) * 100
        elif pm25 <= 250:
            return 300 + ((pm25 - 120) / 130) * 100
        else:
            return 400 + ((pm25 - 250) / 130) * 100

    df_raw["AQI"] = df_raw["PM2.5"].apply(calculate_aqi_pm25)

# FEATURES & TARGET
ALL_FEATURES = ["PM2.5", "PM10", "Temp", "RH", "NO2", "CO"]
FEATURES = [f for f in ALL_FEATURES if f in df_raw.columns]
TARGET = "AQI"

# MODEL DATAFRAME (NO TIME)

df_model = df_raw[FEATURES + [TARGET]].dropna()

# SCALE DATA

scaler_X = MinMaxScaler()
scaler_y = MinMaxScaler()

X_scaled = scaler_X.fit_transform(df_model[FEATURES])
y_scaled = scaler_y.fit_transform(df_model[[TARGET]])

# CREATE SEQUENCES
LOOKBACK = 24   # 6 hours
HORIZON = 24    # 6 hours ahead

X_seq, y_seq = [], []

for i in range(len(X_scaled) - LOOKBACK - HORIZON):
    X_seq.append(X_scaled[i:i + LOOKBACK])
    y_seq.append(y_scaled[i + LOOKBACK + HORIZON - 1])

X_seq = np.array(X_seq)
y_seq = np.array(y_seq)

# TRAIN ENSEMBLE MODELS

predictions = []

for run in range(3):
    print(f"\n🔁 Training model {run + 1}/3")

    model = Sequential([
        Input(shape=(LOOKBACK, X_seq.shape[2])),
        LSTM(64, return_sequences=True),
        Dropout(0.3),
        LSTM(32),
        Dense(1)
    ])

    model.compile(optimizer="adam", loss="mse")

    model.fit(
        X_seq,
        y_seq,
        epochs=20,
        batch_size=32,
        verbose=1
    )

    last_6_hours = X_scaled[-LOOKBACK:].reshape(1, LOOKBACK, X_seq.shape[2])
    pred_scaled = model.predict(last_6_hours, verbose=0)
    pred = scaler_y.inverse_transform(pred_scaled)[0][0]

    predictions.append(pred)

# FINAL STABLE AQI
final_prediction = float(np.mean(predictions))
final_prediction = max(0, min(final_prediction, 500))
final_prediction = round(final_prediction, 2)

# FUTURE TIMESTAMP

last_timestamp = df_raw["From Date"].max()
prediction_time = last_timestamp + timedelta(hours=6)

conn = psycopg2.connect(NEON_DB_URL)
cursor = conn.cursor()

cursor.execute(
    """
    INSERT INTO aqi_predictions (predicted_aqi, prediction_time)
    VALUES (%s, %s)
    """,
    (final_prediction, prediction_time)
)

conn.commit()
cursor.close()
conn.close()

print(" AQI Prediction Completed")
print(" Prediction Time:", prediction_time)
print(" Predicted AQI :", final_prediction)
print(" Stored in NeonDB")

