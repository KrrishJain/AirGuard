import { pollutionSites } from "../models/pollutionSites.schema.js";
import { sql } from "drizzle-orm";
import { db } from "../db/db.js";
import { calculateDistanceKm } from "../utils/geo.utils..js"


export const createPollutionSite = async (req, res) => {
  try {
    const { name, siteType, latitude, longitude, emissionType } = req.body;

    // Basic validation
    if (!name || !siteType || !latitude || !longitude || !emissionType) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const result = await db
      .insert(pollutionSites)
      .values({
        name,
        siteType,
        latitude,
        longitude,
        emissionType,
      })
      .returning();

    return res.status(201).json({
      message: "Pollution site created successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Create pollution site error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};



export const getAllPollutionSites = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const userLat = Number(lat);
    const userLng = Number(lng);
    const maxRadius = Number(radius) || 10;

    // 1️⃣ Fetch from Postgres (simple, reliable)
    const sites = await db.select().from(pollutionSites);

    // 2️⃣ Node.js distance logic
    const nearbySites = sites
      .map((site) => {
        const distanceKm = calculateDistanceKm(
          userLat,
          userLng,
          site.latitude,
          site.longitude
        );

        return {
          ...site,
          distance_km: Number(distanceKm.toFixed(2)),
        };
      })
      .filter((site) => site.distance_km <= maxRadius)
      .sort((a, b) => a.distance_km - b.distance_km);

    return res.json({
      source: "node-js-distance",
      radius_km: maxRadius,
      count: nearbySites.length,
      data: nearbySites,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


