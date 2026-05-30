// backend/src/routes/registrations.js
import { Router } from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "../utils/authMiddleware.js";
import { sendMail } from "../utils/mailer.js";
import QRCode from "qrcode";

const router = Router();

/* --------------------------------------------------------
   1) STUDENT — Create registration
--------------------------------------------------------- */
router.post("/", requireAuth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { event_id } = req.body;

    if (!event_id) {
      return res
        .status(400)
        .json({ ok: false, message: "event_id required" });
    }

    // Try insert
   // get student details
const [studentRows] = await pool.execute(
  `SELECT name, email, roll_number, department
   FROM users
   WHERE id = ?`,
  [studentId]
);

const student = studentRows[0];

if (!student) {
  return res.status(404).json({
    ok: false,
    message: "Student not found",
  });
}

// get event details
const [eventRows] = await pool.execute(
  `SELECT title
   FROM events
   WHERE id = ?`,
  [event_id]
);

const event = eventRows[0];

if (!event) {
  return res.status(404).json({
    ok: false,
    message: "Event not found",
  });
}

// QR data object
const qrData = {
  studentId,
  studentName: student.name,
  email: student.email,
  rollNumber: student.roll_number,
  department: student.department,
  eventId: event_id,
  eventTitle: event.title,
  timestamp: Date.now(),
};

// convert object to string
const qrToken = JSON.stringify(qrData);

// save in database
await pool.execute(
  `INSERT INTO registrations
   (event_id, student_id, qr_token)
   VALUES (?, ?, ?)`,
  [event_id, studentId, qrToken]
);

// generate QR image
const qrImage = await QRCode.toDataURL(qrToken);
    return res.json({
  ok: true,
  message: "Registration submitted",
  qrToken,
  qrImage,
});
  } catch (err) {
    console.error("POST /registrations error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        ok: false,
        message: "You are already registered for this event",
      });
    }

    // e.g. foreign key issues, invalid event_id, etc.
    return res
      .status(500)
      .json({ ok: false, message: "Server error creating registration" });
  }
});

/* --------------------------------------------------------
   2) STUDENT — My registrations
   GET /api/registrations/my
--------------------------------------------------------- */
router.get("/my", requireAuth, async (req, res) => {
  try {
    const studentId = req.user.id;

    const [rows] = await pool.execute(
      `SELECT 
            r.id,
            r.created_at,
            r.status,
            r.qr_token,
            e.title AS event_title,
            e.start_time,
            e.venue
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        WHERE r.student_id = ?
        ORDER BY r.created_at DESC`,
      [studentId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("GET /registrations/my error:", err);
    return res.status(500).json({
      ok: false,
      message: "Server error fetching registrations",
    });
  }
});

/* --------------------------------------------------------
   3) ADMIN — List all registrations
   GET /api/registrations
--------------------------------------------------------- */
router.get("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role === "student") {
      // For SPA, better to just send forbidden instead of redirect
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    const [rows] = await pool.execute(
      `SELECT 
          r.*, 
          e.title as event_title, 
          u.name as student_name,
          u.email as student_email
        FROM registrations r
        JOIN events e ON r.event_id = e.id
        JOIN users u ON r.student_id = u.id
        ORDER BY r.created_at DESC`
    );

    return res.json(rows);
  } catch (err) {
    console.error("GET /registrations admin error:", err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

/* --------------------------------------------------------
   4) ADMIN — Update status + email
   PATCH /api/registrations/:id/status
--------------------------------------------------------- */
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    // ✅ you said only "admin" should exist with power
    if (req.user.role !== "admin") {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ ok: false, message: "Invalid status" });
    }

    const [rows] = await pool.execute(
      `SELECT 
          r.*, 
          u.email AS student_email, 
          u.name AS student_name, 
          e.title AS event_title
        FROM registrations r
        JOIN users u ON r.student_id = u.id
        JOIN events e ON r.event_id = e.id
        WHERE r.id = ?`,
      [id]
    );

    const reg = rows[0];
    if (!reg) {
      return res
        .status(404)
        .json({ ok: false, message: "Registration not found" });
    }

    await pool.execute(
      "UPDATE registrations SET status = ? WHERE id = ?",
      [status, id]
    );

    // optional email notification
    if (process.env.SMTP_PASS && reg.student_email) {
      try {
        const subject = `Your registration for "${reg.event_title}" — ${status}`;
        const html = `
          <p>Hi ${reg.student_name || "Student"},</p>
          <p>Your registration for the event <strong>${reg.event_title}</strong> has been <strong>${status}</strong>.</p>
          <p>Regards,<br/>Department Events Team</p>
        `;
        await sendMail(reg.student_email, subject, html);
      } catch (mailErr) {
        console.error("Error sending status email:", mailErr);
      }
    }

    return res.json({ ok: true, message: "Status updated" });
  } catch (err) {
    console.error("PATCH /registrations/:id/status error:", err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});
/*---------------------------------------------------
// 4.STUDENT — Cancel registration
// DELETE /api/registrations/:id
// -----------------------------------------------*/
router.delete("/:id", requireAuth, async (req, res) => {
  try {

    const studentId = req.user.id;
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT *
       FROM registrations
       WHERE id = ?
       AND student_id = ?`,
      [id, studentId]
    );

    const reg = rows[0];

    if (!reg) {
      return res.status(404).json({
        ok: false,
        message: "Registration not found",
      });
    }

    if (reg.status === "approved") {
      return res.status(400).json({
        ok: false,
        message: "Approved registrations cannot be cancelled",
      });
    }

    await pool.execute(
      "DELETE FROM registrations WHERE id = ?",
      [id]
    );

    return res.json({
      ok: true,
      message: "Registration cancelled",
    });

  } catch (err) {

    console.error("DELETE registration error:", err);

    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
});
/* --------------------------------------------------------
   5) (Optional) QR code verification endpoint
   POST /api/registrations/verify
   -------------------------------*/
   router.post("/scan", requireAuth, async (req, res) => {
  try {

    if (req.user.role !== "admin") {
      return res.status(403).json({
        ok: false,
        message: "Only admin can scan attendance",
      });
    }

    const { qr_token } = req.body;

    if (!qr_token) {
      return res.status(400).json({
        ok: false,
        message: "QR token required",
      });
    }

    const [rows] = await pool.execute(
      `SELECT
          r.id,
          r.attendance_status,
          u.name,
          u.roll_number,
          e.title
       FROM registrations r
       JOIN users u ON r.student_id = u.id
       JOIN events e ON r.event_id = e.id
       WHERE r.qr_token = ?`,
      [qr_token]
    );

    if (!rows.length) {
      return res.status(404).json({
        ok: false,
        message: "Invalid QR",
      });
    }

    const reg = rows[0];

    if (reg.attendance_status) {
      return res.json({
        ok: false,
        message: "Attendance already marked",
      });
    }

    await pool.execute(
      `UPDATE registrations
       SET attendance_status = TRUE
       WHERE id = ?`,
      [reg.id]
    );

    return res.json({
      ok: true,
      student: reg.name,
      roll: reg.roll_number,
      event: reg.title,
      message: "Attendance marked",
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
});
/* --------------------------------------------------------
   ADMIN — Attendance Report
   GET /api/registrations/attendance-report
--------------------------------------------------------- */
router.get("/attendance-report", requireAuth, async (req, res) => {
  try {

    if (req.user.role !== "admin") {
      return res.status(403).json({
        ok: false,
        message: "Forbidden",
      });
    }

    const [rows] = await pool.execute(
      `SELECT
          r.id,
          u.name,
          u.roll_number,
          u.department,
          e.id AS event_id,
          e.title AS event_title,
          r.attendance_status
       FROM registrations r
       JOIN users u ON r.student_id = u.id
       JOIN events e ON r.event_id = e.id
       ORDER BY e.title ASC`
    );

    return res.json(rows);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
});

export default router;
