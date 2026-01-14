// src/models/users.schema.js
import { pgTable, serial, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),

  passwordHash: varchar("password_hash", { length: 255 }).notNull(),

  role: varchar("role", { length: 20 }).notNull().default("USER"),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),

  // ✅ OTP fields
  emailVerificationCodeHash: varchar("email_verification_code_hash", { length: 255 }),
  emailVerificationCodeExpiresAt: timestamp("email_verification_code_expires_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
