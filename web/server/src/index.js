import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./db/db.js";
import { startAqiAlertCron } from "./cron/aqiAlert.cron.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();          // ✅ DB first
    // startAqiAlertCron();        // 🔥 START CRON ONCE

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
