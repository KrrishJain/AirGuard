
import schedule
import time
import subprocess
import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PREDICT_SCRIPT = os.path.join(BASE_DIR, "src", "predict_aqi.py")

def run_prediction():
    print("🔄 Running AQI prediction job...")
    subprocess.run([sys.executable, PREDICT_SCRIPT], check=True)

# Schedule every 5 minutes
schedule.every(5).minutes.do(run_prediction)

print("🚀 AQI Auto-run Scheduler Started (Every 5 Minutes)")

# Run once immediately (optional but useful)
run_prediction()

while True:
    schedule.run_pending()
    time.sleep(1)
