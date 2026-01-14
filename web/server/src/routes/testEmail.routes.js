import { Router } from "express";
import { sendEmail } from "../utils/email.utils.js";

const router = Router();

router.get("/api/test-email", async (req, res) => {
  try {
    const { to } = req.query;
    if (!to) return res.status(400).json({ message: "to is required" });

    await sendEmail({
      to,
      subject: "AirGuard Email Test",
      html: "<h2>Email working ✅</h2><p>This is a test email.</p>",
    });

    return res.json({ message: "Email sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to send email", error: err.message });
  }
});

export default router;
