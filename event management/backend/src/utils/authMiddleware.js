// backend/src/utils/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ ok: false, message: "Missing token" });
    const token = auth.split(" ")[1];
    if (!token) return res.status(401).json({ ok: false, message: "Invalid token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, name, email, iat, exp }
    return next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ ok: false, message: "Invalid token" });
  }
}
