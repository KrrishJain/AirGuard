#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_AHTX0.h>

// ================= WIFI =================
const char* ssid = "your-wifi-ssid"; // Same as Node.js server
const char* password = "your-wifi-password";

// Node.js API
const char* serverURL = "http://add-your-server-ip/api/sensor-data";

// ================= OLED =================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// ================= AHT20 =================
Adafruit_AHTX0 aht;

// ================= MQ-135 =================
#define MQ135_PIN 34

// ================= PMS5303 =================
#define PMS_RX 16   // PMS TX → ESP32 RX2
#define PMS_TX 17   // PMS RX → ESP32 TX2
HardwareSerial pmsSerial(2);

uint16_t pm25 = 0;
uint16_t pm10 = 0;

// ================= LOCATION (MATUNGA) =================
float latitude  = 19.0269;
float longitude = 72.8553;

// ================= AQI FUNCTIONS =================
int calculateAQI(float pm25) {
  if (pm25 <= 12.0) {
    return map(pm25, 0, 12, 0, 50);
  } 
  else if (pm25 <= 35.4) {
    return map(pm25, 12.1, 35.4, 51, 100);
  } 
  else if (pm25 <= 55.4) {
    return map(pm25, 35.5, 55.4, 101, 150);
  } 
  else if (pm25 <= 150.4) {
    return map(pm25, 55.5, 150.4, 151, 200);
  } 
  else {
    return 300; // Hazardous
  }
}

String aqiStatus(int aqi) {
  if (aqi <= 50) return "GOOD";
  else if (aqi <= 100) return "MODERATE";
  else if (aqi <= 150) return "UNHEALTHY";
  else if (aqi <= 200) return "V.UNHEALTHY";
  else return "HAZARDOUS";
}

// ================= PMS READ FUNCTION (WORKING) =================
bool readPMS() {
  if (pmsSerial.available() >= 32) {

    if (pmsSerial.peek() != 0x42) {
      pmsSerial.read();   // discard junk byte
      return false;
    }

    uint8_t buffer[32];
    pmsSerial.readBytes(buffer, 32);

    if (buffer[0] == 0x42 && buffer[1] == 0x4D) {
      pm25 = (buffer[12] << 8) | buffer[13];   // PM2.5
      pm10 = (buffer[14] << 8) | buffer[15];   // PM10
      return true;
    }
  }
  return false;
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);

  // I2C
  Wire.begin(21, 22);

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED not found");
    while (1);
  }
  display.setTextColor(WHITE);
  display.setTextSize(1);

  // AHT20
  if (!aht.begin()) {
    Serial.println("AHT20 not found");
    while (1);
  }

  // PMS5303
  pmsSerial.begin(9600, SERIAL_8N1, PMS_RX, PMS_TX);

  // WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected");
}

// ================= LOOP =================
void loop() {

  // ---- AHT20 ----
  sensors_event_t humidity, temp;
  aht.getEvent(&humidity, &temp);

  float temperature = temp.temperature;
  float hum = humidity.relative_humidity;

  // ---- MQ-135 ----
  int mqValue = analogRead(MQ135_PIN);

  // ---- PMS ----
  readPMS();

  // ---- AQI ----
  int aqi = calculateAQI(pm25);
  String aqiText = aqiStatus(aqi);

  // ================= OLED =================
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Air Quality Monitor");
  display.println("------------------");

  display.print("Temp: "); display.print(temperature); display.println(" C");
  display.print("Hum : "); display.print(hum); display.println(" %");
  display.print("PM2.5: "); display.println(pm25);
  display.print("PM10 : "); display.println(pm10);
  display.print("Gas  : "); display.println(mqValue);

  display.print("AQI  : ");
  display.print(aqi);
  display.print(" ");
  display.println(aqiText);

  display.display();

  // ================= SEND TO NODE SERVER =================
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    String json = "{";
    json += "\"temperature\":" + String(temperature) + ",";
    json += "\"humidity\":" + String(hum) + ",";
    json += "\"pm25\":" + String(pm25) + ",";
    json += "\"pm10\":" + String(pm10) + ",";
    json += "\"mq135\":" + String(mqValue) + ",";
    json += "\"aqi\":" + String(aqi) + ",";
    json += "\"latitude\":" + String(latitude, 6) + ",";
    json += "\"longitude\":" + String(longitude, 6);
    json += "}";

    int httpResponseCode = http.POST(json);
    Serial.print("Server Response: ");
    Serial.println(httpResponseCode);

    http.end();
  }

  delay(60000); // 1 minute
}
