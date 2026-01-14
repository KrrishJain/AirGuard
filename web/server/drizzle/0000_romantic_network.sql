-- drizzle/0000_romantic_network.sql

CREATE TABLE IF NOT EXISTS "aqi_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"predicted_aqi" real NOT NULL,
	"prediction_time" timestamp NOT NULL,
	"alert_message" text,
	"is_message_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "complaint_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_id" uuid NOT NULL,
	"ranked_sites_json" jsonb NOT NULL,
	"analysis_summary" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complaint_type" text NOT NULL,
	"description" text,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"wind_direction" text NOT NULL,
	"wind_speed" real NOT NULL,
	"pollutant" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pollution_sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"site_type" text NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"emission_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sensor_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"temperature" real NOT NULL,
	"humidity" real NOT NULL,
	"pm25" real NOT NULL,
	"pm10" real NOT NULL,
	"mq135" real NOT NULL,
	"aqi" real NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(150) NOT NULL,
	"phone" varchar(20),
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'USER' NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint

DO $$
BEGIN
  ALTER TABLE "complaint_answers"
    ADD CONSTRAINT "complaint_answers_complaint_id_complaints_id_fk"
    FOREIGN KEY ("complaint_id")
    REFERENCES "public"."complaints"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
