import express from "express";
import { createPollutionSite } from "../controller/pollutionSite.controller.js";
import { getAllPollutionSites } from "../controller/pollutionSite.controller.js";

const router = express.Router();

router.post("/api/add-pollution-site", createPollutionSite);
router.get("/api/get-pollution-site", getAllPollutionSites);

export default router;
