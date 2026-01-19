import os
import pandas as pd
import xgboost as xgb
import psycopg2
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()
NEON_DB_URL = os.getenv("NEON_DB_URL")

def run_prediction_cycle():
    conn = psycopg2.connect(NEON_DB_URL, sslmode='require')
    
    # 1. Fetch the very latest reading
    query = "SELECT pm25, pm10, temperature, humidity, mq135, created_at FROM sensor_readings ORDER BY created_at DESC LIMIT 1"
    df_latest = pd.read_sql(query, conn)
    
    if df_latest.empty: return print("❌ No data found.")

    latest = df_latest.iloc[0]
    last_time = pd.to_datetime(latest['created_at'])

    # 2. Prepare 2D feature matrix
    X_input = pd.DataFrame([{
        'pm25': latest['pm25'], 'pm10': latest['pm10'],
        'temperature': latest['temperature'], 'humidity': latest['humidity'],
        'mq135': latest['mq135'], 
        'hour': last_time.hour, 'day_of_week': last_time.dayofweek
    }])

    # 3. Load Model and Predict
    model = xgb.XGBRegressor()
    model.load_model("aqi_xgboost_3hr.json")
    prediction = float(model.predict(X_input)[0])

    # 4. Target time is 3 hours after the sensor log
    prediction_time = last_time + timedelta(hours=3)

    # 5. Insert into aqi_predictions
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO aqi_predictions (predicted_aqi, prediction_time) VALUES (%s, %s)",
            (round(prediction, 2), prediction_time)
        )
        conn.commit()
    
    conn.close()
    print(f"🚀 Prediction stored: {prediction:.2f} for {prediction_time}")

if __name__ == "__main__":
    run_prediction_cycle()