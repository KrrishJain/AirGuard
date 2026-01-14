#include <WiFi.h>

// ================= WIFI =================
const char* ssid = "SAKEC-TBI";
const char* password = "Tb!S@kec";

// ================= SERVER =================
const char* host = "172.18.4.106";
const int port = 3000;

// ================= TIMERS =================
unsigned long lastSend = 0;
unsigned long lastPredictionFetch = 0;

// ================= AQI =================
int calculateAQI(float pm25) {
  int aqi = (pm25 / 250.0) * 500.0;
  if (aqi > 500) aqi = 500;
  return aqi;
}

/*
// ================= GSM (COMMENTED) =================
// #include <HardwareSerial.h>
// HardwareSerial gsm(1);

// const char* phoneNumbers[] = {
//   "+91XXXXXXXXXX",
//   "+91YYYYYYYYYY"
// };
// const int PHONE_COUNT = sizeof(phoneNumbers) / sizeof(phoneNumbers[0]);

// void sendSMS(String message) {
//   for (int i = 0; i < PHONE_COUNT; i++) {
//     gsm.println("AT+CMGF=1");
//     delay(1000);
//     gsm.print("AT+CMGS=\"");
//     gsm.print(phoneNumbers[i]);
//     gsm.println("\"");
//     delay(1000);
//     gsm.print(message);
//     gsm.write(26);
//     delay(3000);
//   }
// }
*/

/*
// ================= SENSORS (COMMENTED) =================
// #include <Wire.h>
// #include <Adafruit_AHTX0.h>
// Adafruit_AHTX0 aht;

// float readPM25() { }
// float readMQ135() { }
// void readAHT20(float &t, float &h) { }
*/

void setup() {
  Serial.begin(115200);

  // -------- WiFi --------
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected");

  /*
  // -------- GSM INIT (COMMENTED) --------
  gsm.begin(9600, SERIAL_8N1, 16, 17);
  */

  /*
  // -------- SENSOR INIT (COMMENTED) --------
  Wire.begin();
  aht.begin();
  */
}

void loop() {
  unsigned long now = millis();

  // ========= SEND STATIC SENSOR DATA =========
  if (now - lastSend > 60000) {
    lastSend = now;

    // -------- STATIC VALUES --------
    float temperature = 28;
    float humidity = 65;
    float pm25 = 120;
    float mq135 = 350;
    float latitude = 19.180;
    float longitude = 72.840;

    int aqi = calculateAQI(pm25);

    WiFiClient client;
    if (client.connect(host, port)) {
      String json =
        "{"
        "\"temperature\":" + String(temperature) + "," +
        "\"humidity\":" + String(humidity) + "," +
        "\"pm25\":" + String(pm25) + "," +
        "\"mq135\":" + String(mq135) + "," +
        "\"aqi\":" + String(aqi) + "," +
        "\"latitude\":" + String(latitude, 6) + "," +
        "\"longitude\":" + String(longitude, 6) +
        "}";

      client.println("POST /api/sensor-data HTTP/1.1");
      client.println("Host: 172.18.4.106");
      client.println("Content-Type: application/json");
      client.print("Content-Length: ");
      client.println(json.length());
      client.println();
      client.print(json);

      Serial.print("Static AQI Sent: ");
      Serial.println(aqi);
    }
    client.stop();
  }

  // ========= FETCH PREDICTED AQI (STATIC MODE) =========
  if (now - lastPredictionFetch > 300000) {
    lastPredictionFetch = now;

    WiFiClient client;
    if (client.connect(host, port)) {
      client.println("GET /api/predicted-aqi HTTP/1.1");
      client.println("Host: 192.168.1.5");
      client.println("Connection: close");
      client.println();

      Serial.println("Fetching predicted AQI...");

      while (client.connected() || client.available()) {
        if (client.available()) {
          String line = client.readStringUntil('\n');
          Serial.println(line);
        }
      }
    }
    client.stop();
  }
}
