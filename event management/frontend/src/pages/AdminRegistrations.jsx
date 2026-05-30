// frontend/src/pages/AdminRegistrations.jsx
import React, { useEffect, useState } from "react";
import api from "../api/client";
// import styles from "../styles/table.module.css"; // optional

export default function AdminRegistrations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // id being updated
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRegs();
  }, []);

  async function fetchRegs() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/registrations");
      setRows(res.data || []);
    } catch (err) {
      console.error("Load regs error:", err);
      setError("Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    if (!window.confirm(`Are you sure you want to mark this registration as "${status}"?`)) return;
    setUpdating(id);
    try {
      const res = await api.patch(`/registrations/${id}/status`, { status });
      if (res.data?.ok) {
        // update local state
        setRows((r) => r.map((item) => (item.id === id ? { ...item, status } : item)));
      } else {
        alert("Failed: " + (res.data?.message || "Unknown"));
      }
    } catch (err) {
      console.error("Update status error:", err);
      alert("Server error updating status.");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <div>Loading registrations...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!rows.length) return <div>No registrations yet.</div>;

  return (
    <div>
      <h2>Registrations</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th>#</th>
            <th>Student</th>
            <th>Event</th>
            <th>Email</th>
            <th>Created</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "8px 4px" }}>{idx + 1}</td>
              <td style={{ padding: "8px 4px" }}>{r.student_name || r.name || "Unknown"}</td>
              <td style={{ padding: "8px 4px" }}>{r.event_title || r.title}</td>
              <td style={{ padding: "8px 4px" }}>{r.student_email || r.email || "-"}</td>
              <td style={{ padding: "8px 4px" }}>{new Date(r.created_at).toLocaleString()}</td>
              <td style={{ padding: "8px 4px" }}>
                <strong style={{ textTransform: "capitalize" }}>{r.status}</strong>
              </td>
              <td style={{ padding: "8px 4px" }}>
                {r.status !== "approved" && (
                  <button
                    disabled={updating === r.id}
                    onClick={() => updateStatus(r.id, "approved")}
                    style={{ marginRight: 8 }}
                  >
                    {updating === r.id ? "..." : "Approve"}
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button disabled={updating === r.id} onClick={() => updateStatus(r.id, "rejected")}>
                    {updating === r.id ? "..." : "Reject"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
