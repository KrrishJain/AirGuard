ALTER TABLE "users" ADD COLUMN "email_verification_code_hash" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_code_expires_at" timestamp;