import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import styles from "./StudentDashboard.module.css";

export default function StudentDashboard() {
const [events, setEvents] = useState([]);
const [announcements, setAnnouncements] = useState([]);

useEffect(() => {
fetchData();
}, []);

async function fetchData() {
try {
const [evRes, anRes] = await Promise.all([
api.get("/events"),
api.get("/announcements"),
]);

  setEvents(evRes.data || []);
  setAnnouncements(anRes.data || []);
} catch (err) {
  console.error("Dashboard load error:", err);
}

}

return ( <div className={styles.dashboard}>
{/* HERO */} <div className={styles.hero}> <h1>🎓 Welcome Back Student</h1> <p>
Stay updated with upcoming events and announcements. </p> </div>
  {/* STATS */}
  <div className={styles.statsGrid}>
    <div className={styles.statCard}>
      <div className={styles.icon}>📅</div>
      <h3>{events.length}</h3>
      <span>Total Events</span>
    </div>

    <div className={styles.statCard}>
      <div className={styles.icon}>🔥</div>
      <h3>
        {
          events.filter(
            (e) =>
              e.start_time &&
              new Date(e.start_time) > new Date()
          ).length
        }
      </h3>
      <span>Upcoming</span>
    </div>

    <div className={styles.statCard}>
      <div className={styles.icon}>📢</div>
      <h3>{announcements.length}</h3>
      <span>Announcements</span>
    </div>

    <div className={styles.statCard}>
      <div className={styles.icon}>🎫</div>
      <h3>Active</h3>
      <span>Student Portal</span>
    </div>
  </div>

  {/* QUICK ACTIONS */}
  <div className={styles.quickActions}>
    <Link to="/events" className={styles.actionBtn}>
      Browse Events
    </Link>

    <Link
      to="/my-registrations"
      className={styles.actionBtn}
    >
      My Registrations
    </Link>

    <Link
      to="/announcements"
      className={styles.actionBtn}
    >
      Announcements
    </Link>
  </div>

  {/* MAIN GRID */}
  <div className={styles.grid}>
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>
        📅 Upcoming Events
      </h3>

      {events.length === 0 ? (
        <p className={styles.empty}>
          No upcoming events.
        </p>
      ) : (
        <ul className={styles.list}>
          {events.slice(0, 5).map((ev) => (
            <li key={ev.id} className={styles.item}>
              <div className={styles.itemTitle}>
                {ev.title}
              </div>

              <div className={styles.itemMeta}>
                📍 {ev.venue || "TBA"}
              </div>

              <div className={styles.itemMeta}>
                🕒{" "}
                {ev.start_time
                  ? new Date(
                      ev.start_time
                    ).toLocaleString()
                  : "TBA"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className={styles.card}>
      <h3 className={styles.cardTitle}>
        📢 Latest Announcements
      </h3>

      {announcements.length === 0 ? (
        <p className={styles.empty}>
          No announcements yet.
        </p>
      ) : (
        <ul className={styles.list}>
          {announcements
            .slice(0, 5)
            .map((a) => (
              <li key={a.id} className={styles.item}>
                <div className={styles.itemTitle}>
                  {a.title}
                </div>

                <div className={styles.itemMeta}>
                  {new Date(
                    a.created_at
                  ).toLocaleString()}
                </div>

                <div className={styles.itemBody}>
                  {a.body}
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  </div>
</div>
);
}
