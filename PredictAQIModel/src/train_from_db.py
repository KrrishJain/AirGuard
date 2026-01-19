import os
import pandas as pd
import xgboost as xgb
import psycopg2
from dotenv import load_dotenv

load_dotenv()
NEON_DB_URL = os.getenv("NEON_DB_URL")

def train_from_db():
    conn = psycopg2.connect(NEON_DB_URL, sslmode='require')
    
    # Query all data from your actual table
    query = "SELECT pm25, pm10, temperature, humidity, mq135, aqi, created_at FROM sensor_readings ORDER BY created_at ASC"
    df = pd.read_sql(query, conn)
    conn.close()

    # 1. Feature Engineering: Create the 3-hour future target
    # Shift 'aqi' back by 3 steps (assuming 1-hour recording intervals)
    df['target_aqi'] = df['aqi'].shift(-3) 

    # 2. Extract time features for the tree-based model
    df['created_at'] = pd.to_datetime(df['created_at'])
    df['hour'] = df['created_at'].dt.hour
    df['day_of_week'] = df['created_at'].dt.dayofweek

    # 3. Clean and define features
    features = ['pm25', 'pm10', 'temperature', 'humidity', 'mq135', 'hour', 'day_of_week']
    df_train = df[features + ['target_aqi']].dropna()

    # 4. Train and Save
    model = xgb.XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.1)
    model.fit(df_train[features], df_train['target_aqi'])
    model.save_model("aqi_xgboost_3hr.json")
    print("✅ Model trained using 'sensor_readings' and saved.")

if __name__ == "__main__":
    train_from_db()