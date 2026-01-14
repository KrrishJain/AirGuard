import express from "express";
import {
  reportComplaint,
  getAllComplaints,
} from "../controller/complaint.controller.js";

const router = express.Router();

router.post("/api/report-complaint", reportComplaint);
router.get("/api/get-all-complaints", getAllComplaints);

export default router;
