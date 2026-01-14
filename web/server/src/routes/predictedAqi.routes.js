// src/routes/predictedAqi.routes.js
import { Router } from "express";
import { getLatestPredictedAqi } from "../controller/predictedAqi.controller.js";

const router = Router();

router.get("/api/predicted-aqi", getLatestPredictedAqi);

export default router;
