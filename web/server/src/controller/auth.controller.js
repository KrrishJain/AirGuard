// src/controller/auth.controller.js
import bcrypt from "bcrypt";
import { db } from "../db/db.js";
import { users } from "../models/users.schema.js";
import { eq } from "drizzle-orm";
import { sendEmail } from "../utils/email.utils.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000)); // 6 digits

const sendOtpEmail = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: "AirGuard Email Verification Code",
    html: `
      <h2>Your verification code</h2>
      <p style="font-size:18px;"><b>${otp}</b></p>
      <p>This code will expire in 10 minutes.</p>
    `,
  });
};

const makeOtpData = async (otp) => {
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return { otpHash, expiresAt };
};

export const signUp = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    const found = await db.select().from(users).where(eq(users.email, email)).limit(1);

    // ✅ If user already exists
    if (found.length > 0) {
      const existingUser = found[0];

      // already verified -> cannot signup again
      if (existingUser.isEmailVerified) {
        return res.status(409).json({ message: "Email already registered and verified" });
      }

      // not verified -> resend OTP (no delete)
      const otp = generateOtp();
      const { otpHash, expiresAt } = await makeOtpData(otp);

      await db
        .update(users)
        .set({
          name, // optional: keep latest name
          phone: phone || existingUser.phone || null,
          passwordHash: await bcrypt.hash(password, 10), // optional: allow updating password before verify
          emailVerificationCodeHash: otpHash,
          emailVerificationCodeExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(users.email, email));

      await sendOtpEmail(email, otp);

      return res.status(200).json({
        message: "Account exists but not verified. New verification code sent.",
        user: { id: existingUser.id, name: existingUser.name, email: existingUser.email },
      });
    }

    // ✅ New user create
    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const { otpHash, expiresAt } = await makeOtpData(otp);

    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: "USER",
        isEmailVerified: false,
        emailVerificationCodeHash: otpHash,
        emailVerificationCodeExpiresAt: expiresAt,
      })
      .returning({ id: users.id, name: users.name, email: users.email });

    await sendOtpEmail(email, otp);

    return res.status(201).json({
      message: "Signup successful. Verification code sent to email.",
      user,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "email and code are required" });
    }

    const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (found.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = found[0];

    if (user.isEmailVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    // if no OTP stored, send new one
    if (!user.emailVerificationCodeHash || !user.emailVerificationCodeExpiresAt) {
      const otp = generateOtp();
      const { otpHash, expiresAt } = await makeOtpData(otp);

      await db
        .update(users)
        .set({
          emailVerificationCodeHash: otpHash,
          emailVerificationCodeExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(users.email, email));

      await sendOtpEmail(email, otp);

      return res.status(400).json({ message: "No code found. New code sent to email." });
    }

    const expired = new Date(user.emailVerificationCodeExpiresAt).getTime() < Date.now();

    // ✅ OTP expired -> resend automatically
    if (expired) {
      const otp = generateOtp();
      const { otpHash, expiresAt } = await makeOtpData(otp);

      await db
        .update(users)
        .set({
          emailVerificationCodeHash: otpHash,
          emailVerificationCodeExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(users.email, email));

      await sendOtpEmail(email, otp);

      return res.status(400).json({ message: "Code expired. New code sent to email." });
    }

    const ok = await bcrypt.compare(String(code), user.emailVerificationCodeHash);
    if (!ok) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    await db
      .update(users)
      .set({
        isEmailVerified: true,
        emailVerificationCodeHash: null,
        emailVerificationCodeExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify email error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (found.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = found[0];

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

