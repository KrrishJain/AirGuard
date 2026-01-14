// src/controllers/predictedAqi.controller.js
import { db } from "../db/db.js";
import { aqiPredictions } from "../models/aqiPredictions.schema.js";
import { desc } from "drizzle-orm";

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

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch predicted AQI" });
  }
};
