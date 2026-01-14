import { pgTable, uuid, integer, jsonb, text, timestamp } from "drizzle-orm/pg-core";
import { complaints } from "./complaints.schema.js";

export const complaintAnswers = pgTable("complaint_answers", {
  id: uuid("id").defaultRandom().primaryKey(),

  complaintId: uuid("complaint_id")
    .notNull()
    .references(() => complaints.id, { onDelete: "cascade" }),

  rankedSitesJson: jsonb("ranked_sites_json").notNull(),
  analysisSummary: text("analysis_summary").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
