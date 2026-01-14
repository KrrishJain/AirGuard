import { pgTable, uuid, text, real, timestamp, foreignKey, jsonb, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const pollutionSites = pgTable("pollution_sites", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	siteType: text("site_type").notNull(),
	latitude: real().notNull(),
	longitude: real().notNull(),
	emissionType: text("emission_type").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const sensorReadings = pgTable("sensor_readings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	temperature: real().notNull(),
	humidity: real().notNull(),
	pm25: real().notNull(),
	pm10: real().notNull(),
	mq135: real().notNull(),
	aqi: real().notNull(),
	latitude: real().notNull(),
	longitude: real().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const complaints = pgTable("complaints", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	complaintType: text("complaint_type").notNull(),
	description: text(),
	latitude: real().notNull(),
	longitude: real().notNull(),
	windDirection: text("wind_direction").notNull(),
	windSpeed: real("wind_speed").notNull(),
	pollutant: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const complaintAnswers = pgTable("complaint_answers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	complaintId: uuid("complaint_id").notNull(),
	rankedSitesJson: jsonb("ranked_sites_json").notNull(),
	analysisSummary: text("analysis_summary").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.complaintId],
			foreignColumns: [complaints.id],
			name: "complaint_answers_complaint_id_complaints_id_fk"
		}).onDelete("cascade"),
]);

export const aqiPredictions = pgTable("aqi_predictions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	predictedAqi: real("predicted_aqi").notNull(),
	predictionTime: timestamp("prediction_time", { mode: 'string' }).notNull(),
	alertMessage: text("alert_message"),
	isMessageSent: boolean("is_message_sent").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});
