// frontend/src/pages/Events.jsx
import React, { useEffect, useState } from "react";
import api from "../api/client";
import styles from "./Events.module.css";
import { useAuth } from "../auth/AuthContext";

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null); // event details for modal
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const res = await api.get("/events");
      setEvents(res.data || []);
    } catch (err) {
      console.error("loadEvents:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  function filtered() {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        (e.title || "").toLowerCase().includes(q) ||
        (e.description || "").toLowerCase().includes(q) ||
        (e.venue || "").toLowerCase().includes(q)
    );
  }

  async function openDetail(eventId) {
    try {
      const res = await api.get(`/events/${eventId}`);
      setDetail(res.data || null);
    } catch (err) {
      console.error("openDetail:", err);
      // fallback: find in existing list
      const local = events.find((ev) => ev.id === eventId);
      setDetail(local || null);
    }
  }

  async function handleRegister(eventId) {
    if (!user) {
      return alert("Please login to register for events.");
    }
    if (!confirm("Confirm registration for this event?")) return;

    setRegistering(true);
    try {
      await api.post("/registrations", { event_id: eventId });
      alert("Registered successfully.");
      loadEvents(); // refresh; registration counts (if shown) will update
    } catch (err) {
      console.error("register:", err);
      alert(err?.response?.data?.message || "Registration failed.");
    } finally {
      setRegistering(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Events</h2>
          <div className={styles.subtitle}>Browse and register for upcoming events</div>
        </div>

        <div className={styles.controls}>
          <input
            className={styles.search}
            placeholder="Search by title, venue or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className={styles.refresh} onClick={loadEvents} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {loading ? (
          <div className={styles.empty}>Loading events…</div>
        ) : filtered().length === 0 ? (
          <div className={styles.empty}>No events found.</div>
        ) : (
          filtered().map((ev) => (
            <article key={ev.id} className={styles.card}>
              <div className={styles.cardLeft}>
                <div className={styles.evTitle}>{ev.title}</div>
                <div className={styles.evMeta}>
                  {ev.venue || "Venue TBA"} •{" "}
                  {ev.start_time ? new Date(ev.start_time).toLocaleString() : "Date TBA"}
                </div>
                <div className={styles.evDesc}>
                  {ev.description ? (ev.description.length > 160 ? ev.description.slice(0, 160) + "…" : ev.description) : "No description."}
                </div>
              </div>

              <div className={styles.cardRight}>
                <div className={styles.seats}>
                  {ev.max_seats ? `Seats: ${ev.max_seats}` : "Seats: unlimited"}
                </div>

                <div className={styles.actions}>
                  <button className={styles.linkBtn} onClick={() => openDetail(ev.id)}>
                    Details
                  </button>

                  <button
                    className={styles.primary}
                    onClick={() => handleRegister(ev.id)}
                    disabled={registering}
                    title={user ? "Register" : "Login to register"}
                  >
                    {registering ? "Registering..." : "Register"}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Details modal */}
      {detail && (
        <div className={styles.modalBackdrop} onClick={() => setDetail(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{detail.title}</h3>
              <button className={styles.close} onClick={() => setDetail(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalMeta}>
                <strong>When:</strong>{" "}
                {detail.start_time ? new Date(detail.start_time).toLocaleString() : "TBA"}
                {" • "}
                <strong>Where:</strong> {detail.venue || "TBA"}
              </div>
              <p style={{ marginTop: 10 }}>{detail.description || "No description"}</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.secondary} onClick={() => setDetail(null)}>Close</button>
              <button
                className={styles.primary}
                onClick={() => {
                  setDetail(null);
                  handleRegister(detail.id);
                }}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
