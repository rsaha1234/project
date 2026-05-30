// frontend/src/pages/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalRegistrations: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [eventsRes, regsRes] = await Promise.all([
          api.get("/events"),
          api.get("/registrations"),
        ]);

        const events = eventsRes.data || [];
        const regs = regsRes.data || [];

        const now = new Date();

        const upcoming = events.filter((e) => {
          if (!e.end_time) return false;
          return new Date(e.end_time) >= now;
        }).length;

        setStats({
          totalEvents: events.length,
          upcomingEvents: upcoming,
          totalRegistrations: regs.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className={styles.container}>
      {/* Hero */}
      <div className={styles.hero}>
        <h1>👋 Welcome Back Admin</h1>
        <p>
          Manage events, registrations, attendance and announcements
          from one place.
        </p>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.icon}>🎉</div>
          <h3>{loading ? "..." : stats.totalEvents}</h3>
          <span>Total Events</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.icon}>📅</div>
          <h3>{loading ? "..." : stats.upcomingEvents}</h3>
          <span>Upcoming Events</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.icon}>👨‍🎓</div>
          <h3>{loading ? "..." : stats.totalRegistrations}</h3>
          <span>Registrations</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCard}>
  <div className={styles.icon}>✅</div>
  <h3>{loading ? "..." : stats.totalRegistrations}</h3>
  <span>Attendance Ready</span>
</div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={styles.bottomGrid}>
        <div className={styles.quickActions}>
          <h3>Quick Actions</h3>

          <div className={styles.actionButtons}>
            <Link to="/admin/events" className={styles.actionBtn}>
              ➕ Create Event
            </Link>

            <Link to="/admin-attendance" className={styles.actionBtn}>
              📷 Attendance Scanner
            </Link>

            <Link
              to="/admin/announcements"
              className={styles.actionBtn}
            >
              📢 Announcements
            </Link>

            <Link
              to="/admin/add-admin"
              className={styles.actionBtn}
            >
              👨‍🏫 Add Admin
            </Link>
          </div>
        </div>

        <div className={styles.infoCard}>
  <h3>📊 Admin Insights</h3>

  <div className={styles.insightBox}>
    <span>Event Completion</span>
    <strong>{stats.totalEvents - stats.upcomingEvents}</strong>
  </div>

  <div className={styles.insightBox}>
    <span>Upcoming Events</span>
    <strong>{stats.upcomingEvents}</strong>
  </div>

  <div className={styles.insightBox}>
    <span>Student Registrations</span>
    <strong>{stats.totalRegistrations}</strong>
  </div>
</div>
      </div>
    </div>
  );
}