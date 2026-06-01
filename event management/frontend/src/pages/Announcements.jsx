// frontend/src/pages/Announcements.jsx
import React, { useEffect, useState } from "react";
import api from "../api/client";
import styles from "./Announcements.module.css";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error("load announcements:", err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }

  function visible() {
    const q = filter.trim().toLowerCase();
    if (!q) return announcements;
    return announcements.filter((a) => (a.title + a.body).toLowerCase().includes(q));
  }

  function timeLabel(ts) {
    if (!ts) return "";
    return new Date(ts).toLocaleString();
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Announcements</h2>
          <div className={styles.subtitle}>Latest updates from your department</div>
        </div>

        <div className={styles.controls}>
          <input
            placeholder="Search announcements..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.search}
          />
          <button onClick={load} className={styles.refresh}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className={styles.list}>
        {loading ? (
          <div className={styles.empty}>Loading announcements…</div>
        ) : visible().length === 0 ? (
          <div className={styles.empty}>No announcements found.</div>
        ) : (
          visible().map((a) => (
            <article key={a.id} className={styles.annCard}>
              <div className={styles.annLeft}>
                <div className={styles.annTitle}>{a.title}</div>
                <div className={styles.annMeta}>{timeLabel(a.created_at)}</div>
                <div className={styles.annBody}>{a.body}</div>
              </div>
              <div className={styles.annRight}>
                {a.event_title && <div className={styles.badge}>Event: {a.event_title}</div>}
                {/* <button
                  className={styles.readBtn}
                  onClick={() => alert("Marked as read (UI only)")}
                >
                  Mark read
                </button> */}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
