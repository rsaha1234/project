// frontend/src/pages/AdminEvents.jsx
import React, { useEffect, useState } from "react";
import api from "../api/client";
import styles from "./AdminEvents.module.css";
import { useNavigate } from "react-router-dom";

const EMPTY_FORM = {
  title: "",
  description: "",
  venue: "",
  start_time: "",
  end_time: "",
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await api.get("/events");
      setEvents(res.data || []);
    } catch (err) {
      console.error("fetchEvents:", err);
      alert("Unable to fetch events. Check console.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
     const payload = {
  title: form.title.trim(),
  description: form.description.trim(),
  venue: form.venue.trim(),

  start_time: new Date(form.start_time)
    .toISOString()
    .slice(0, 19)
    .replace("T", " "),

  end_time: new Date(form.end_time)
    .toISOString()
    .slice(0, 19)
    .replace("T", " "),
  };
      await api.post("/events", payload);
      setForm(EMPTY_FORM);
      fetchEvents();
      alert("Event created.");
    } catch (err) {
      console.error("create event:", err.response?.data || err);
      alert(err?.response?.data?.message || "Failed to create event");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
      alert("Event deleted.");
    } catch (err) {
      console.error("delete event:", err.response?.data || err);
      alert("Failed to delete event.");
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Event Management</h2>
        <p className={styles.sub}>Create, manage and organize department events</p>
      </header>

      <section className={styles.grid}>
        <form className={styles.form} onSubmit={handleSave}>
          <h3>Create new event</h3>

          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="Event title"
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Short description"
            />
          </label>

          <label>
            Venue
            <input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="Room / hall"
            />
          </label>

         <label>
  Start Date

  <input
    type="date"
    required
    value={form.start_time}
    onChange={(e) =>
      setForm({ ...form, start_time: e.target.value })
    }
  />
</label>

<label>
  End Date

  <input
    type="date"
    required
    value={form.end_time}
    onChange={(e) =>
      setForm({ ...form, end_time: e.target.value })
    }
  />
</label>

          {/* 🔹 Max seats block removed */}

          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={saving}>
              {saving ? "Saving..." : "Create Event"}
            </button>
            <button
              type="button"
              onClick={() => setForm(EMPTY_FORM)}
              className={styles.ghost}
            >
              Reset
            </button>
          </div>
        </form>

        <div className={styles.listPanel}>
          <h3>Existing events</h3>
          {loading ? (
            <p>Loading events…</p>
          ) : events.length === 0 ? (
            <p>No events yet.</p>
          ) : (
            <ul className={styles.list}>
              {events.map((ev) => (
                <li key={ev.id} className={styles.eventItem}>
                  <div>
                    <div className={styles.title}>{ev.title}</div>
                    <div className={styles.meta}>
                      {ev.venue || "—"} •{" "}
                      {ev.start_time
                        ? new Date(ev.start_time).toLocaleString()
                        : "—"}
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      className={styles.small}
                      onClick={() => navigate(`/events/${ev.id}`)}
                    >
                      View
                    </button>
                    <button
                      className={styles.danger}
                      onClick={() => handleDelete(ev.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
