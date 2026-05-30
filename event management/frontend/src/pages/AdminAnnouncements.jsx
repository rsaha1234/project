// frontend/src/pages/AdminAnnouncements.jsx
import React, { useEffect, useState } from "react";
import api from "../api/client";
import styles from "./AdminAnnouncements.module.css";

// values here MUST match backend: "all" | "students_only" | "registrants" | "custom"
const RECIPIENT_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "students_only", label: "Only Students" },
  { value: "registrants", label: "Registrants of Event" },
  { value: "custom", label: "Custom Emails" },
];

export default function AdminAnnouncements() {
  const [form, setForm] = useState({
    title: "",
    body: "",
    recipientType: "all", // will map to backend "recipients"
    eventId: "",
    customEmails: "",
    notify: true, // will map to backend "notify"
  });

  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInitial();
  }, []);

  async function loadInitial() {
    setLoading(true);
    try {
      const [annRes, evRes] = await Promise.all([
        api.get("/announcements"),
        api.get("/events"),
      ]);
      setAnnouncements(annRes.data || []);
      setEvents(evRes.data || []);
    } catch (err) {
      console.error("AdminAnnouncements load error:", err);
      setError("Failed to load announcements or events.");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (field) => (e) => {
    const value = field === "notify" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        title: form.title,
        body: form.body,

        // backend expects event_id only when recipients = "registrants"
        event_id:
          form.recipientType === "registrants"
            ? Number(form.eventId) || null
            : null,

        // backend expects "notify" boolean
        notify: form.notify,

        // backend expects "recipients" = one of "all" | "students_only" | "registrants" | "custom"
        recipients: form.recipientType,

        // backend expects custom_emails as ARRAY when recipients = "custom"
        custom_emails:
          form.recipientType === "custom"
            ? form.customEmails
                .split(",")
                .map((em) => em.trim())
                .filter(Boolean)
            : [],
      };

      await api.post("/announcements", payload);

      // reset form
      setForm({
        title: "",
        body: "",
        recipientType: "all",
        eventId: "",
        customEmails: "",
        notify: true,
      });

      await loadInitial();
    } catch (err) {
      console.error("Create announcement error:", err);
      setError(
        err?.response?.data?.message || "Failed to create announcement."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredEventOptions = events || [];
  const visibleAnnouncements = announcements || [];

  const recipientLabel = (a) => {
    // backend might store recipients as "recipients" or "recipient_type"
    const type = a.recipients || a.recipient_type || a.recipientType || "all";
    switch (type) {
      case "students_only":
        return "Students";
      case "registrants":
        return "Event Registrants";
      case "custom":
        return "Custom Emails";
      default:
        return "All Users";
    }
  };

  const formatDate = (ts) =>
    ts ? new Date(ts).toLocaleString() : "";

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Admin Announcements</h2>

      {/* CREATE FORM */}
      <section className={styles.card}>
        <h3 className={styles.sectionTitle}>Create Announcement</h3>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={handleChange("title")}
              required
              placeholder="Short announcement title"
            />
          </div>

          <div className={styles.field}>
            <label>Body</label>
            <textarea
              rows={4}
              value={form.body}
              onChange={handleChange("body")}
              required
              placeholder="Describe the announcement details..."
            />
          </div>

          <div className={styles.field}>
            <label>Recipients</label>
            <select
              value={form.recipientType}
              onChange={handleChange("recipientType")}
            >
              {RECIPIENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {form.recipientType === "registrants" && (
            <div className={styles.field}>
              <label>Event</label>
              <select
                value={form.eventId}
                onChange={handleChange("eventId")}
                required
              >
                <option value="">Select an event…</option>
                {filteredEventOptions.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.recipientType === "custom" && (
            <div className={styles.field}>
              <label>Custom Emails (comma-separated)</label>
              <textarea
                rows={2}
                value={form.customEmails}
                onChange={handleChange("customEmails")}
                placeholder="user1@example.com, user2@example.com"
              />
            </div>
          )}

          <div className={styles.inlineRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.notify}
                onChange={handleChange("notify")}
              />
              Also send email notification
            </label>

            <button
              type="submit"
              className={styles.primary}
              disabled={saving}
            >
              {saving ? "Sending…" : "Send Announcement"}
            </button>
          </div>
        </form>
      </section>

      {/* LIST OF ANNOUNCEMENTS */}
      <section className={styles.listSection}>
        <h3 className={styles.sectionTitle}>All Announcements</h3>

        {loading ? (
          <div className={styles.empty}>Loading announcements…</div>
        ) : visibleAnnouncements.length === 0 ? (
          <div className={styles.empty}>No announcements yet.</div>
        ) : (
          <ul className={styles.list}>
            {visibleAnnouncements.map((a) => (
              <li key={a.id} className={styles.annItem}>
                <div className={styles.annMain}>
                  <div className={styles.annHeader}>
                    <span className={styles.annTitle}>{a.title}</span>
                    <span className={styles.badge}>
                      {recipientLabel(a)}
                    </span>
                  </div>
                  <div className={styles.annMeta}>
                    {formatDate(a.created_at)}
                    {a.event_title && (
                      <>
                        {" • "}
                        Event: {a.event_title}
                      </>
                    )}
                  </div>
                  <div className={styles.annBody}>{a.body}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
