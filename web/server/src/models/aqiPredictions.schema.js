// src/models/aqiPredictions.schema.js
import {
  pgTable,
  uuid,
  real,
  timestamp,
  boolean,
  text,
} from "drizzle-orm/pg-core";

export const aqiPredictions = pgTable("aqi_predictions", {
  id: uuid("id").defaultRandom().primaryKey(),

  predictedAqi: real("predicted_aqi").notNull(),

  predictionTime: timestamp("prediction_time").notNull(),

  // 🔔 NEW FIELDS
  alertMessage: text("alert_message"),
  isMessageSent: boolean("is_message_sent").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});
