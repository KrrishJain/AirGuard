import axios from "axios";
import { db } from "../db/db.js";
import { sensorReadings } from "../models/sensorReadings.schema.js";
import { desc } from "drizzle-orm";

export const windRiskAnalysis = async (req, res) => {
  try {
    // 1️⃣ Get latest AQI data
    const [latest] = await db
      .select()
      .from(sensorReadings)
      .orderBy(desc(sensorReadings.createdAt))
      .limit(1);

    if (!latest) {
      return res.status(404).json({ message: "No AQI data available" });
    }

    // 2️⃣ Call OpenWeather API
    const weatherRes = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat: "19.0269",
          lon: "72.8553",
          appid: process.env.OPENWEATHER_API_KEY,
        },
      }
    );

    const windSpeed = weatherRes.data.wind.speed; // m/s
    const windDeg = weatherRes.data.wind.deg; // degrees

    // 3️⃣ Convert wind degrees to direction
    let direction;
    if (windDeg >= 135 && windDeg <= 225) direction = "S";
    else if (windDeg >= 315 || windDeg <= 45) direction = "N";
    else if (windDeg > 45 && windDeg < 135) direction = "E";
    else direction = "W";

    // 4️⃣ Static nearby locations
    const locations = [
      { name: "Sion", lat: 19.043, lng: 72.864 },
      { name: "Dadar", lat: 19.018, lng: 72.843 },
      { name: "GTB Nagar", lat: 19.045, lng: 72.883 },
      { name: "Kurla", lat: 19.072, lng: 72.884 },
      { name: "Kings Circle", lat: 19.028, lng: 72.855 },
    ];

    // 5️⃣ Downwind + risk calculation
    const affectedLocations = [];

    for (const loc of locations) {
      let isDownwind = false;

      if (direction === "S" && loc.lat < latest.latitude) isDownwind = true;
      if (direction === "N" && loc.lat > latest.latitude) isDownwind = true;
      if (direction === "E" && loc.lng > latest.longitude) isDownwind = true;
      if (direction === "W" && loc.lng < latest.longitude) isDownwind = true;

      if (!isDownwind) continue;

      // distance (rough km)
      const distanceKm =
        Math.sqrt(
          Math.pow(loc.lat - latest.latitude, 2) +
            Math.pow(loc.lng - latest.longitude, 2)
        ) * 111;

      // risk score
      const riskScore = Number(
        ((latest.aqi / 500) * (windSpeed / 20) * (1 / distanceKm)).toFixed(2)
      );

      affectedLocations.push({
        name: loc.name,
        risk_score: riskScore,
        distance_km: Number(distanceKm.toFixed(1)),
      });
    }

    // 6️⃣ Response (no wind direction exposed)
    res.json({
      source_aqi: latest.aqi,
      affected_locations: affectedLocations,
      confidence: "Medium",
      assumptions: "Stable wind direction and constant emission levels",
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};
