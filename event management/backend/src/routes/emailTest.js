// backend/src/routes/emailTest.js
import { Router } from "express";
import { sendMail } from "../utils/mailer.js";

const router = Router();

// simple email test endpoint
router.post("/", async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ ok: false, message: "Email 'to' required" });

    const subject = "Test Email - Dept Event System";
    const html = `
      <h2>Dept Event Email Test</h2>
      <p>This is a test email sent from your Node.js backend using Gmail App Password.</p>
      <p>If you received this email, your email configuration works perfectly! 🎉</p>
    `;

    const mailRes = await sendMail(to, subject, html);

    if (!mailRes.ok) {
      return res.status(500).json({ ok: false, message: mailRes.error });
    }

    return res.json({ ok: true, message: "Email sent!", info: mailRes.info });
  } catch (err) {
    console.error("Email test error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

export default router;
