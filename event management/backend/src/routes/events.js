import { Router } from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "../utils/authMiddleware.js";

const router = Router();

// GET public events
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM events ORDER BY start_time DESC"
    );

    return res.json(rows);

  } catch (err) {

    console.error("GET /events error:", err);

    return res.status(500).json({
      ok: false,
      message: "Server error",
    });
  }
});

// POST create event
router.post("/", requireAuth, async (req, res) => {
  try {

    if (!req.user || !["admin", "coordinator"].includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        message: "Forbidden",
      });
    }

    const {
      title,
      description,
      venue,
      start_time,
      end_time,
      max_seats,
    } = req.body;

    if (!title || !start_time || !end_time) {
      return res.status(400).json({
        ok: false,
        message: "Missing fields",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO events 
      (title, description, venue, start_time, end_time, max_seats, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        venue || null,
        start_time,
        end_time,
        max_seats || null,
        req.user.id,
      ]
    );

    return res.json({
      ok: true,
      id: result.insertId,
    });

  } catch (err) {

    console.error("POST /events error:", err);

    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
});

// DELETE event
router.delete("/:id", requireAuth, async (req, res) => {
  try {

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        ok: false,
        message: "Forbidden",
      });
    }

    const { id } = req.params;

    // delete registrations first
    await pool.execute(
      "DELETE FROM registrations WHERE event_id = ?",
      [id]
    );

    // delete event
    const [result] = await pool.execute(
      "DELETE FROM events WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Event not found",
      });
    }

    return res.json({
      ok: true,
      message: "Event deleted successfully",
    });

  } catch (err) {

    console.error("DELETE /events error:", err);

    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
});

export default router;