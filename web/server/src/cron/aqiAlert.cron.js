import cron from "node-cron";
import { db } from "../db/db.js";
import { aqiPredictions } from "../models/aqiPredictions.schema.js";
import { desc, eq } from "drizzle-orm";

import { sendWhatsApp } from "../utils/whatsapp.http.js";
import { generateAqiAlert } from "../utils/llm.js";
import {
  AQI_ALERT_THRESHOLD,
  ALERT_PHONE_NUMBERS,
} from "../utils/aqi.js";

/**
 * Runs every 5 minutes
 */
export const startAqiAlertCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("⏱️ AQI Alert Cron running...");

    try {
      /* 1️⃣ Fetch latest prediction */
      const [latest] = await db
        .select()
        .from(aqiPredictions)
        .orderBy(desc(aqiPredictions.createdAt))
        .limit(1);

      if (!latest) {
        console.log("ℹ️ No AQI predictions found");
        return;
      }

      /* 2️⃣ Already sent? */
      if (latest.isMessageSent) {
        console.log("ℹ️ Alert already sent for latest prediction");
        return;
      }

      /* 3️⃣ Threshold check */
      if (latest.predictedAqi < AQI_ALERT_THRESHOLD) {
        console.log(
          `ℹ️ AQI ${latest.predictedAqi} below threshold ${AQI_ALERT_THRESHOLD}`
        );
        return;
      }

      let alertMessage = latest.alertMessage;

      /* 4️⃣ Generate alert via LLM (once) */
      if (!alertMessage) {
        console.log("🧠 Generating alert message via LLM...");

        alertMessage = await generateAqiAlert({
          aqi: latest.predictedAqi,
          predictionTime: latest.predictionTime,
        });

        await db
          .update(aqiPredictions)
          .set({ alertMessage })
          .where(eq(aqiPredictions.id, latest.id));
      }

      /* 5️⃣ Send WhatsApp to ALL numbers */
      let successCount = 0;

      for (const phone of ALERT_PHONE_NUMBERS) {
        console.log(`📤 Sending alert to ${phone}`);

        const sent = await sendWhatsApp(phone, alertMessage);

        if (sent) {
          successCount++;
        } else {
          console.error(`❌ Failed to send alert to ${phone}`);
        }
      }

      /* 6️⃣ Mark as sent ONLY if at least one message succeeded */
      if (successCount > 0) {
        await db
          .update(aqiPredictions)
          .set({ isMessageSent: true })
          .where(eq(aqiPredictions.id, latest.id));

        console.log(
          `✅ AQI alert sent to ${successCount}/${ALERT_PHONE_NUMBERS.length} users`
        );
      } else {
        console.log("❌ Alert not sent to any user, will retry next run");
      }
    } catch (error) {
      console.error("❌ AQI Cron Error:", error);
    }
  });
};
