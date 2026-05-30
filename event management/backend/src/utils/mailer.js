// backend/src/utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify()
  .then(() => console.log("✔ SMTP transporter verified"))
  .catch(err => console.error("✖ SMTP transporter verify failed:", err && err.message ? err.message : err));

export async function sendMail(to, subject, html) {
  try {
    const info = await transporter.sendMail({ from: process.env.FROM_EMAIL, to, subject, html });
    console.log(`Mail sent to ${to} messageId=${info.messageId}`);
    return { ok: true, info };
  } catch (err) {
    console.error("Mail send error to", to, err && err.message ? err.message : err);
    return { ok: false, error: err && err.message ? err.message : String(err) };
  }
}
