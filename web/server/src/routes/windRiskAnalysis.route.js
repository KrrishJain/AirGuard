import { Router } from "express";
import { windRiskAnalysis } from "../controller/windAnalysis.controller.js";

const router = Router();

router.get("/api/wind-risk-analysis", windRiskAnalysis);

export default router;