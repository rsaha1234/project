// backend/scripts/create-admin.js

import bcrypt from "bcrypt";
import { createPool } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Create MySQL pool using your backend environment variables
const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 1,
});

async function run() {
  // Your admin data
  const name = "Admin User";
  const email = "saharitam2026@gmail.com";
  const plainPassword = "saha2026";

  // Generate bcrypt hash
  const passHash = await bcrypt.hash(plainPassword, 10);

  try {
    // Insert into DB
    const [res] = await pool.execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)",
      [name, email, passHash, "admin"]
    );

    console.log("=====================================");
    console.log("   ✅ ADMIN ACCOUNT CREATED SUCCESSFULLY");
    console.log("=====================================");
    console.log("Email:    ", email);
    console.log("Password: ", plainPassword);
    console.log("User ID:  ", res.insertId);
    console.log("=====================================");
  } catch (err) {
    console.error("❌ Failed to create admin:", err.message);
  } finally {
    await pool.end();
    process.exit();
  }
}

run();
