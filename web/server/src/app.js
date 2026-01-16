import express from "express";
import cors from "cors";
import aqiRoutes from "./routes/aqi.routes.js";
import windRiskAnalysisRoute from "./routes/windRiskAnalysis.route.js";
import pollutionSiteRoutes from "./routes/pollutionSite.routes.js";
import complaintRoute from "./routes/complaint.routes.js";
import testEmailRoutes from "./routes/testEmail.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

/* ✅ JSON FIRST */
const allowed = [
  "http://localhost:5173",
  "https://air-guard-9h62.vercel.app",
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // postman/thunder
    if (allowed.includes(origin) || origin.endsWith(".vercel.app")) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));


/* 🔍 GLOBAL DEBUG LOGGER */
app.use((req, res, next) => {
  console.log("=================================");
  console.log("📥 Incoming Request");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("=================================");
  next();
});

/* ✅ ROUTES */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "pipeline working" });
});

app.use(aqiRoutes);
app.use(windRiskAnalysisRoute);
app.use(pollutionSiteRoutes);
app.use(complaintRoute);
app.use(authRoutes);
app.use(testEmailRoutes);



/* ❌ 404 HANDLER — MUST BE LAST */
app.use((req, res) => {
  console.error("❌ ROUTE NOT FOUND:", req.method, req.originalUrl);
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

export default app;
