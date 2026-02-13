// src/controller/sensor.controller.js
import { db } from "../db/db.js";
import { sensorReadings } from "../models/sensorReadings.schema.js";
import { aqiPredictions } from "../models/aqiPredictions.schema.js";
import { desc, sql } from "drizzle-orm";
import { fetchCurrentWind } from "../utils/currentWind.js";

export const storeSensorData = async (req, res) => {
  try {
    const {
      temperature,
      humidity,
      pm25,
      pm10,
      mq135,
      aqi,
      latitude,
      longitude,
    } = req.body;

    if (
      temperature === undefined ||
      humidity === undefined ||
      pm25 === undefined ||
      pm10 === undefined ||
      mq135 === undefined ||
      latitude === undefined ||
      longitude === undefined
    ) {
      console.error("❌ Missing fields");
      return res.status(400).json({
        error: "Missing fields",
        received: req.body,
      });
    }

    console.log("✅ Fields OK, inserting into DB...");

    await db.insert(sensorReadings).values({
      temperature,
      humidity,
      pm25,
      pm10,
      mq135,
      aqi: aqi ?? null,
      latitude,
      longitude,
    });

    return res.status(201).json({
      message: "Sensor data stored successfully",
    });
  } catch (err) {
    console.error("🔥 CONTROLLER ERROR 🔥");
    console.error(err.stack || err);

    return res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
};

export const getCurrentAqi = async (req, res) => {
  console.log("=================================");
  console.log("🧠 getCurrentAqi controller HIT");
  console.log("➡️ URL:", req.originalUrl);
  console.log("➡️ Query params:", req.query);
  console.log("=================================");

  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      console.error("❌ Missing latitude or longitude");
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    const distanceExpr = sql`
      6371 * acos(
        cos(radians(${latitude})) *
        cos(radians(${sensorReadings.latitude})) *
        cos(radians(${sensorReadings.longitude}) - radians(${longitude})) +
        sin(radians(${latitude})) *
        sin(radians(${sensorReadings.latitude}))
      )
    `;

    const result = await db
      .select({
        aqi: sensorReadings.aqi,
        temperature: sensorReadings.temperature,
        humidity: sensorReadings.humidity,
        pm25: sensorReadings.pm25,
        pm10: sensorReadings.pm10,
        mq135: sensorReadings.mq135,
        latitude: sensorReadings.latitude,
        longitude: sensorReadings.longitude,
        time: sensorReadings.createdAt,
        distance_km: distanceExpr,
      })
      .from(sensorReadings)
      .where(sql`${distanceExpr} <= 10`)
      .orderBy(desc(sensorReadings.createdAt))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({
        message:
          "Since this is a prototype, AQI data is available only for the Matunga region. Please enter Matunga in the search location above.",
      });
    }

    const data = result[0];

    const wind = await fetchCurrentWind(data.latitude, data.longitude);

    return res.json({
      ...data,
      wind_speed: wind.wind_speed,
      wind_direction: wind.wind_direction,
    });
  } catch (err) {
    console.error("🔥 getCurrentAqi ERROR:", err);
    return res.status(500).json({
      message: "Failed to fetch current AQI",
    });
  }
};

export const getAqiHistory = async (req, res) => {
  try {
    const result = await db.execute(
      sql`
        SELECT
          DATE_TRUNC('hour', created_at) AS hour,
          ROUND(AVG(aqi))::INT AS avg_aqi,
          AVG(latitude) AS latitude,
          AVG(longitude) AS longitude
        FROM sensor_readings
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY hour
        ORDER BY hour ASC
      `,
    );

    const rows = result;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No AQI history found" });
    }

    return res.json({
      min: Math.min(...rows.map((r) => r.avg_aqi)),
      max: Math.max(...rows.map((r) => r.avg_aqi)),
      data: rows.map((r) => ({
        time: r.hour,
        aqi: r.avg_aqi,
        latitude: r.latitude,
        longitude: r.longitude,
      })),
    });
  } catch (err) {
    console.error("AQI History Error:", err);
    return res.status(500).json({ message: "Failed to fetch AQI history" });
  }
};

export const getLatestPredictedAqi = async (req, res) => {
  try {
    const result = await db
      .select({
        predicted_aqi: aqiPredictions.predictedAqi,
        prediction_time: aqiPredictions.predictionTime,
        created_at: aqiPredictions.createdAt,
      })
      .from(aqiPredictions)
      .orderBy(desc(aqiPredictions.createdAt))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "No predicted AQI found" });
    }

    return res.json(result[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch predicted AQI" });
  }
};
