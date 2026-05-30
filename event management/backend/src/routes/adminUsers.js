// backend/src/routes/adminUsers.js
import { Router } from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "../utils/authMiddleware.js";
import bcrypt from "bcrypt";

const router = Router();

/**
 * POST /api/admin/users
 * Body: { name, email, password }
 * Only admin can use this (your HOD + any teacher admins).
 */
router.post("/users", requireAuth, async (req, res) => {
  try {
    // ✅ only admin allowed (no coordinator needed)
    if (req.user.role !== "admin") {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "Name, email, and password are required" });
    }

    // check for duplicate email
    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ ok: false, message: "User with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, 'admin')`,
      [name, email, passwordHash]
    );

    return res.json({
      ok: true,
      message: "Admin user created",
      id: result.insertId,
    });
  } catch (err) {
    console.error("POST /api/admin/users error:", err);
    return res
      .status(500)
      .json({ ok: false, message: err.message || "Server error" });
  }
});

export default router;
