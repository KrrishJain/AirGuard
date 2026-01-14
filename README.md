# Air Pollution Monitoring – Setup Guide

This repo has three parts that work together: the ESP32 firmware pushes sensor readings, the Node/Express server ingests, stores, analyzes, and sends alerts, and the React/Vite frontend visualizes data.

## Repo layout
- `ESP32/` – Arduino sketch for the ESP32 with AHT20 (temp/humidity), MQ-135 (gas), PMS5303 (PM2.5/PM10), and SSD1306 OLED. Posts JSON to the backend every minute.
- `server/` – Node.js + Express API with Drizzle ORM on PostgreSQL, cron-based AQI alerting, Gemini-based messaging, and Twilio WhatsApp delivery.
- `frontend/` – React + Vite dashboard (Leaflet maps, Recharts, axios) that consumes the server API.

## Prerequisites
- Node.js 18+ and pnpm (`npm i -g pnpm`).
- PostgreSQL database and a `DATABASE_URL` connection string.
- API keys (see env section) and a Twilio WhatsApp sandbox-enabled number.
- Arduino IDE (or PlatformIO) with ESP32 board support for flashing `ESP32/code.ino`.

## 1) Backend (server)
1) Install deps
```bash
cd server
pnpm install
```
2) Environment variables (create `.env` in `server/`):
```bash
DATABASE_URL=postgres://user:pass@host:5432/dbname
PORT=3001                       # optional, defaults to 3001
OPENWEATHER_API_KEY=...         # for wind risk & complaints
GEMINI_API_KEY=...              # for LLM explanations/alerts
TWILIO_ACCOUNT_SID=...          # for WhatsApp alerts
TWILIO_AUTH_TOKEN=...
```
3) Run database migrations (Drizzle, uses `drizzle.config.js`):
```bash
pnpm dlx drizzle-kit push
```
4) Start the API (+cron):
```bash
pnpm run dev
```
   - Starts Express on `0.0.0.0:PORT` and schedules the AQI alert cron (runs every 5 minutes).
5) Twilio alert recipients: edit `server/src/utils/aqi.js` to set `ALERT_PHONE_NUMBERS` (E.164 format, joined to the sandbox). Messages are sent when predicted AQI >= `AQI_ALERT_THRESHOLD` (default 300).

### Key endpoints
- `POST /api/sensor-data` – ingest from ESP32 `{ temperature, humidity, pm25, pm10, mq135, aqi?, latitude, longitude }`.
- `GET /api/current-aqi` – latest reading.
- `GET /api/aqi-history` – historical readings.
- `GET /api/predicted-aqi` – latest prediction (also drives cron alerts).
- `GET /api/wind-risk-analysis` – wind speed/direction (OpenWeather).
- `GET /api/get-pollution-site` and `POST /api/add-pollution-site`.
- `GET /api/get-all-complaints` and `POST /api/report-complaint`.

## 2) Frontend (dashboard)
1) Install deps
```bash
cd frontend
pnpm install
```
2) Start Vite dev server
```bash
pnpm run dev
```
   - Opens on `http://localhost:5173`.
3) API base URL
   - Components call `http://localhost:3001/...` directly. If your backend runs elsewhere, update those URLs in the files under `frontend/src` (search for `localhost:3001`) or add a small axios base URL helper.

## 3) ESP32 firmware
1) Open `ESP32/code.ino` in Arduino IDE.
2) Update Wi‑Fi credentials and backend endpoint near the top:
   - `ssid`, `password` — must be the **same Wi‑Fi network that the laptop/server is on** so the ESP32 can reach it.
   - `serverURL` — use your laptop’s IP on that network, e.g. `http://192.168.x.x:3001/api/sensor-data`. Confirm with `ipconfig` (Windows) and keep port 3001 open to the LAN.
3) Wiring (per current pin usage):
   - AHT20 (I2C) on SDA 21, SCL 22.
   - PMS5303 on UART2: PMS TX → GPIO16 (RX2), PMS RX → GPIO17 (TX2).
   - MQ-135 analog signal on GPIO34.
   - SSD1306 OLED on I2C address 0x3C.
4) Flash the sketch; the loop:
   - Reads temp/humidity (AHT20), particulate PM2.5/PM10 (PMS5303), gas (MQ-135), computes AQI, updates OLED, and POSTs JSON every 60s to the server.
5) Verify in serial monitor: Wi‑Fi connect logs, `Server Response` HTTP code, and OLED data. The server console should log incoming requests and DB inserts.

## Typical bring-up order
1) Start PostgreSQL and ensure `DATABASE_URL` works.
2) Run backend (`server/`) so the `/api/sensor-data` route is ready.
3) Flash and power the ESP32; confirm it posts successfully.
4) Run the frontend (`frontend/`) and open the dashboard.

## Notes
- Cron alerts: `server/src/cron/aqiAlert.cron.js` checks predicted AQI every 5 minutes and sends WhatsApp messages via Twilio. LLM-generated text uses Gemini; failures fall back to a static alert.
- CORS: backend allows `http://localhost:5173` by default; adjust in `server/src/app.js` if the frontend hosts elsewhere.
- Mapping/geocode: frontend uses OpenStreetMap/Leaflet and Nominatim; be mindful of rate limits in production.
