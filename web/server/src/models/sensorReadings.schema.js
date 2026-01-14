import { pgTable, uuid, real, timestamp } from "drizzle-orm/pg-core";

export const sensorReadings = pgTable("sensor_readings", {
  id: uuid("id").defaultRandom().primaryKey(),

  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),

  pm25: real("pm25").notNull(),
  pm10: real("pm10").notNull(), // ✅ NEW COLUMN

  mq135: real("mq135").notNull(),
  aqi: real("aqi").notNull(),

  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});
