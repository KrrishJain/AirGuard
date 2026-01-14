// src/routes/aqi.routes.js
import { Router } from "express";
import {
  getCurrentAqi,
  getAqiHistory,
  storeSensorData,
  getLatestPredictedAqi
} from "../controller/aqi.controller.js";

const router = Router();

// current aqi
router.get("/api/current-aqi", getCurrentAqi);

// aqi history
router.get("/api/aqi-history", getAqiHistory);

// predicted aqi
router.get("/api/predicted-aqi", getLatestPredictedAqi);

// store sensor data
router.post("/api/sensor-data", storeSensorData);



export default router;
