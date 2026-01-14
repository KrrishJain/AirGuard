// src/controllers/complaint.controller.js
import { desc, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { complaints } from "../models/complaints.schema.js";
import { complaintAnswers } from "../models/complaintAnswers.schema.js";
import { pollutionSites } from "../models/pollutionSites.schema.js";
import { generateExplanation } from "../utils/llm.js";
import { calculateDistanceKm } from "../utils/geo.utils..js"
import { fetchCurrentWind } from "../utils/currentWind.js";

/* ------------------------------------
   POST: Report Complaint
------------------------------------ */
export const reportComplaint = async (req, res) => {
  try {
    const { complaintType, description, latitude, longitude, pollutant } =
      req.body;

    if (!complaintType || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "complaintType, latitude and longitude are required",
      });
    }

    /* 1️⃣ Fetch wind data */
    const wind = await fetchCurrentWind(latitude, longitude);

    /* 2️⃣ Save complaint */
    const [complaint] = await db
      .insert(complaints)
      .values({
        complaintType,
        description,
        latitude,
        longitude,
        windDirection: wind.direction,
        windSpeed: wind.speed,
        pollutant,
      })
      .returning();

    /* 3️⃣ Fetch pollution sites */
    const sites = await db.select().from(pollutionSites);

    /* 4️⃣ Risk calculation */
    const rankedSites = sites
      .map((site) => {
        const distanceKm = calculateDistanceKm(
          latitude,
          longitude,
          site.latitude,
          site.longitude
        );

        const distanceScore = Math.max(0, 1 - distanceKm / 10);

        const windScore =
          wind.direction_short === "S" && site.latitude > latitude ? 1 : 0.5;

        const emissionScore =
          pollutant && site.emissionType === pollutant ? 1 : 0.5;

        const riskScore =
          distanceScore * 0.4 + windScore * 0.35 + emissionScore * 0.25;

        return {
          siteId: site.id,
          name: site.name,
          distanceKm: Number(distanceKm.toFixed(2)),
          riskScore: Number(riskScore.toFixed(2)),
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 3);

    /* 5️⃣ LLM explanation */
    const analysisSummary = await generateExplanation({
      context: "complaint_analysis",
      location: "Complaint Location",
      aqi: null,
      category: null,
      trend: null,
      wind: {
        direction: wind.direction,
        speed: wind.speed,
      },
      sources: rankedSites.map((s) => s.name),
      confidence: "high",
    });

    /* 6️⃣ Save answer */
    const [answer] = await db
      .insert(complaintAnswers)
      .values({
        complaintId: complaint.id,
        rankedSitesJson: rankedSites,
        analysisSummary,
      })
      .returning();

    return res.status(201).json({ complaint, answer });
  } catch (error) {
    console.error("Report complaint error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ------------------------------------
   GET: All Complaints + Answers
------------------------------------ */
export const getAllComplaints = async (req, res) => {
  try {
    const result = await db
      .select({
        complaintId: complaints.id,
        complaintType: complaints.complaintType,
        description: complaints.description,
        latitude: complaints.latitude,
        longitude: complaints.longitude,
        createdAt: complaints.createdAt,
        rankedSites: complaintAnswers.rankedSitesJson,
        analysisSummary: complaintAnswers.analysisSummary,
      })
      .from(complaints)
      .leftJoin(complaintAnswers, eq(complaintAnswers.complaintId, complaints.id))
      .orderBy(desc(complaints.createdAt));

    return res.status(200).json({
      message: "Complaints fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get complaints error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
