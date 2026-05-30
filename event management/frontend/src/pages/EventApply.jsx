// frontend/src/pages/EventApply.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";


export default function EventApply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [qrImage, setQrImage] = useState("");

  useEffect(() => {
    let alive = true;
    api.get(`/events`)
      .then(res => {
        if (!alive) return;
        const ev = (res.data || []).find(e => String(e.id) === String(id));
        setEvent(ev || null);
      })
      .catch(err => {
        console.error("Load event error", err);
        setMessage("Failed to load event.");
      })
      .finally(() => alive && setLoading(false));
    return () => (alive = false);
  }, [id]);

  async function handleApply() {
    setSubmitting(true);
    setMessage("");
    try {
      const res = await api.post("/registrations", { event_id: Number(id) });
     if (res.data?.ok) {
  setMessage("Registration submitted successfully.");

  if (res.data.qrImage) {
    setQrImage(res.data.qrImage);
  }
        // optionally redirect to student's registrations page
       // setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        setMessage(res.data?.message || "Failed to register.");
      }
    } catch (err) {
      console.error("Apply error", err);
      const msg = err.response?.data?.message || err.message;
      setMessage("Error: " + msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!event) return <div>Event not found.</div>;

  return (
    <div>
      <h2>Apply for: {event.title}</h2>
      <div style={{ marginBottom: 8 }}>
        <strong>When:</strong> {new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Venue:</strong> {event.venue || "TBA"}
      </div>
      <p>{event.description}</p>

      {message && <div style={{ marginTop: 10, color: message.startsWith("Error") ? "red" : "green" }}>{message}</div>}
      {qrImage && (
  <div style={{ marginTop: 20 }}>
    <h3>Your Event QR Code</h3>

    <img
      src={qrImage}
      alt="QR Code"
      style={{
        width: 220,
        height: 220,
        border: "1px solid #ccc",
        padding: 10,
        borderRadius: 10,
      }}
    />

    <div style={{ marginTop: 10 }}>
      <a href={qrImage} download="event-qr.png">
        <button>Download QR</button>
      </a>
    </div>
  </div>
)}

      <button onClick={handleApply} disabled={submitting}>
        {submitting ? "Applying..." : "Apply for this event"}
      </button>
    </div>
  );
}
