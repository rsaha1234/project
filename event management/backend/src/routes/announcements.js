// backend/src/routes/announcements.js
import { Router } from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "../utils/authMiddleware.js";
import { sendMail } from "../utils/mailer.js";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

// Split large recipient arrays into small chunks
function chunkArray(arr, size = 50) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Background email sender
async function sendAnnouncementEmailsInBackground(
  announcementId,
  recipientsSpec,
  announcement
) {
  try {
    let recipients = [];

    // 1) Custom emails
    if (
      recipientsSpec.type === "custom" &&
      Array.isArray(recipientsSpec.custom_emails)
    ) {
      recipients = recipientsSpec.custom_emails.map((em) => ({
        email: em,
        name: "",
      }));

      // 2) Registrants of a specific event
    } else if (recipientsSpec.type === "registrants") {
      if (!recipientsSpec.event_id) {
        console.warn("registrants selected but no event_id provided");
        recipients = [];
      } else {
        const [rows] = await pool.execute(
          `SELECT u.id, u.email, u.name 
           FROM registrations r
           JOIN users u ON r.student_id = u.id
           WHERE r.event_id = ? AND u.email_subscribed = 1`,
          [recipientsSpec.event_id]
        );
        recipients = rows;
      }

      // 3) Only students
    } else if (recipientsSpec.type === "students_only") {
      const [rows] = await pool.execute(
        `SELECT id, email, name 
         FROM users 
         WHERE role = 'student' AND email_subscribed = 1`
      );
      recipients = rows;

      // 4) Default: all subscribed users
    } else {
      const [rows] = await pool.execute(
        `SELECT id, email, name 
         FROM users 
         WHERE email_subscribed = 1`
      );
      recipients = rows;
    }

    if (!recipients || recipients.length === 0) {
      console.log("No recipients for announcement", announcementId);
      return;
    }

    const origin = process.env.ORIGIN || "http://localhost:5173";
    const eventLink = announcement.event_id
      ? `<p><a href="${origin}/events/${announcement.event_id}">View event</a></p>`
      : "";

    const subject = `Announcement: ${announcement.title}`;
    const htmlBody = `
      <p>Hi,</p>
      <p>${announcement.body}</p>
      ${eventLink}
      <hr />
      <p style="font-size:12px;color:#666">
        To stop receiving these emails, update your preferences in your profile.
      </p>
    `;

    const batches = chunkArray(recipients, 50);

    for (const batch of batches) {
      const promises = batch.map(async (u) => {
        try {
          const mailRes = await sendMail(u.email, subject, htmlBody);
          if (!mailRes.ok) {
            console.error(
              `Announcement ${announcementId} - failed send to ${u.email}:`,
              mailRes.error
            );
          }
        } catch (err) {
          console.error(
            `Announcement ${announcementId} - send error for ${u.email}:`,
            err
          );
        }
      });

      await Promise.allSettled(promises);

      // throttle a bit
      await new Promise((r) => setTimeout(r, 300));
    }

    console.log(
      `Announcement ${announcementId} emails processed for ${recipients.length} recipients.`
    );
  } catch (err) {
    console.error("Background announcement sender error:", err);
  }
}

/**
 * GET /api/announcements
 * Public listing of recent announcements (most recent first)
 * optional query: ?limit=10
 */
router.get("/", async (req, res) => {
  try {
    let limit = parseInt(req.query.limit, 10);
    if (!Number.isFinite(limit) || limit <= 0) limit = 20;
    if (limit > 200) limit = 200;

    const sql = `
      SELECT id, title, body, event_id, created_by, created_at 
      FROM announcements 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    const [rows] = await pool.execute(sql);
    return res.json(rows);
  } catch (err) {
    console.error("GET /announcements error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

/**
 * POST /api/announcements
 * body: {
 *   title,
 *   body,
 *   event_id?,       // only for "registrants"
 *   notify = false,  // send emails or not
 *   recipients = "all" | "students_only" | "registrants" | "custom",
 *   custom_emails?   // array of emails if recipients = "custom"
 * }
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    if (!["admin", "coordinator"].includes(req.user.role)) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    const {
      title,
      body,
      event_id = null,
      notify = false,
      recipients = "all",
      custom_emails,
    } = req.body;

    if (!title || !body) {
      return res
        .status(400)
        .json({ ok: false, message: "Title and body are required" });
    }

    // Insert announcement
    const [result] = await pool.execute(
      `INSERT INTO announcements (title, body, event_id, created_by) 
       VALUES (?, ?, ?, ?)`,
      [title, body, event_id, req.user.id]
    );
    const announcementId = result.insertId;

    // Respond immediately
    res.json({ ok: true, id: announcementId });

    // If notify flag is true, send emails in background
    if (notify) {
      const recipientsSpec = {
        type: recipients,
        event_id: event_id || null,
        custom_emails: Array.isArray(custom_emails) ? custom_emails : [],
      };

      const [[announcementRow]] = await pool.execute(
        "SELECT * FROM announcements WHERE id = ?",
        [announcementId]
      );
      const announcement = announcementRow || { title, body, event_id };

      setImmediate(() => {
        sendAnnouncementEmailsInBackground(
          announcementId,
          recipientsSpec,
          announcement
        ).catch((err) =>
          console.error(
            "sendAnnouncementEmailsInBackground error:",
            err
          )
        );
      });
    }
  } catch (err) {
    console.error("POST /announcements error:", err);
    return res
      .status(500)
      .json({ ok: false, message: err.message || "Server error" });
  }
});

export default router;
