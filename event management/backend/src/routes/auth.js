// backend/src/routes/auth.js
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../config/db.js";

dotenv.config();

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, roll_number, department } = req.body;
    console.log("REGISTER BODY:", req.body); // 👈 debug

    // basic validation
    if (!name || !email || !password || !roll_number || !department) {
  return res.status(400).json({
    ok: false,
    message: "All fields are required",
  });
}

    // always student from here
    const role = "student";

    // check whether email already exists
    const [existingRows] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    console.log("REGISTER existingRows:", existingRows.length); // 👈 debug

    if (existingRows && existingRows.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Registration failed. Use a unique email.",
      });
    }

    // hash password and insert
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
  `INSERT INTO users 
   (name, email, password_hash, role, roll_number, department) 
   VALUES (?, ?, ?, ?, ?, ?)`,
  [name, email, hash, role, roll_number, department]
  );

    console.log("REGISTER insert id:", result.insertId); // 👈 debug

    return res.json({
      ok: true,
      id: result.insertId,
      message: "Registration successful",
    });
  } catch (err) {
    console.error("POST /auth/register error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("LOGIN BODY:", req.body); // 👈 debug
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const user = rows[0];
    console.log("LOGIN user:", user && { id: user.id, email: user.email, role: user.role }); // 👈 debug

    if (!user) {
      return res.status(401).json({ ok: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    console.log("LOGIN password match:", match); // 👈 debug

    if (!match) {
      return res.status(401).json({ ok: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("POST /auth/login error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

export default router;
