// backend/src/app.js

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.js";
import eventsRoutes from "./routes/events.js";
import regsRoutes from "./routes/registrations.js";
import annsRoutes from "./routes/announcements.js";
import emailTestRoutes from "./routes/emailTest.js";
import adminUsersRoutes from "./routes/adminUsers.js";

const app = express();

/**
 * CORS FIX
 * Allow all frontend origins during development
 */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// small dev request logger
app.use((req, res, next) => {
  console.log("<<REQ>>", req.method, req.originalUrl);
  next();
});

app.use(express.json());
app.use(morgan("dev"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/registrations", regsRoutes);
app.use("/api/announcements", annsRoutes);
app.use("/api/email-test", emailTestRoutes);
app.use("/api/admin", adminUsersRoutes);

// Health check route
app.get("/", (_req, res) => {
  res.send("Event API running");
});

// Server Port
const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});