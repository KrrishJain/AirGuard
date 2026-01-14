// src/routes/auth.routes.js
import { Router } from "express";
import { login, signUp, verifyEmail } from "../controller/auth.controller.js";

const router = Router();

router.post("/api/auth/signup", signUp);
router.post("/api/auth/verify-email", verifyEmail);
router.post("/api/auth/login", login);

export default router;
