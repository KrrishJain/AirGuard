import { pgTable, uuid, text, real, timestamp } from "drizzle-orm/pg-core";

export const pollutionSites = pgTable("pollution_sites", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(), // e.g. "Malad Construction Site"

  siteType: text("site_type").notNull(), 
  // construction | industry | traffic | waste

  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),

  emissionType: text("emission_type").notNull(), 
  // PM10 | PM2.5 | mixed

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
