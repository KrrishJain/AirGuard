import { pgTable, uuid, text, real, timestamp } from "drizzle-orm/pg-core";

export const complaints = pgTable("complaints", {
  id: uuid("id").defaultRandom().primaryKey(),

  complaintType: text("complaint_type").notNull(),
  // dust | smoke | smell | general

  description: text("description"),

  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),

  windDirection: text("wind_direction").notNull(),
  // North | South | East | West | etc.

  windSpeed: real("wind_speed").notNull(),

  pollutant: text("pollutant"),
  // PM10 | PM2.5 (optional)

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
