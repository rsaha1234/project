// frontend/src/pages/MyRegistrations.jsx

import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import api from "../api/client";
import styles from "./MyRegistrations.module.css";

export default function MyRegistrations() {

  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function loadRegistrations() {

    setLoading(true);
    setError("");

    try {

      const res = await api.get("/registrations/my");

      setRegs(res.data || []);

    } catch (err) {

      console.error("MyRegistrations load error:", err);

      setError("Failed to load your registrations.");

    } finally {

      setLoading(false);
    }
  }

  const formatDateTime = (ts) =>
    ts ? new Date(ts).toLocaleString() : "—";

  const statusLabel = (status) => {

    if (!status) return "Pending";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  async function handleCancel(registrationId) {
  const ok = window.confirm(
    "Are you sure you want to cancel this registration?"
  );

  if (!ok) return;

  try {
    await api.delete(`/registrations/${registrationId}`);

    alert("Registration cancelled successfully.");

    loadRegistrations();
  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.message ||
      "Failed to cancel registration."
    );
  }
}

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <h2 className={styles.title}>
          My Event Registrations
        </h2>

        <p className={styles.subtitle}>
          All events you have registered for.
        </p>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {loading ? (

        <div className={styles.empty}>
          Loading your registrations…
        </div>

      ) : regs.length === 0 ? (

        <div className={styles.empty}>
          You haven&apos;t registered for any events yet.
        </div>

      ) : (

        <div className={styles.list}>

          {regs.map((r) => (

            <div key={r.id} className={styles.card}>

              <div className={styles.cardMain}>

                <div className={styles.cardHeader}>

                  <h3 className={styles.eventTitle}>
                    {r.event_title}
                  </h3>

                  <span
                    className={`${styles.status} ${
                      styles["status_" + (r.status || "pending")]
                    }`}
                  >
                    {statusLabel(r.status)}
                  </span>
                </div>

                <div className={styles.metaRow}>

                  <div>
                    <span className={styles.metaLabel}>
                      Date:
                    </span>

                    <span className={styles.metaValue}>
                      {formatDateTime(r.start_time)}
                    </span>
                  </div>

                  <div>
                    <span className={styles.metaLabel}>
                      Venue:
                    </span>

                    <span className={styles.metaValue}>
                      {r.venue || "—"}
                    </span>
                  </div>

                </div>

                <div className={styles.registeredRow}>
                  Registered on{" "}

                  <span className={styles.metaValue}>
                    {formatDateTime(r.created_at)}
                  </span>
                </div>

              </div>

              <div className={styles.cardActions}>

  {r.status === "approved" && (
    <button
      className={styles.secondaryBtn}
      onClick={() => setSelectedQR(r)}
    >
      Download Ticket
    </button>
  )}

  {r.status === "pending" && (
    <>
      <button
        className={styles.secondaryBtn}
        disabled
        style={{
          background: "#f59e0b",
          cursor: "not-allowed",
          opacity: 0.8,
        }}
      >
        Awaiting Approval
      </button>

      <button
        className={styles.dangerBtn}
        onClick={() => handleCancel(r.id)}
      >
        Cancel Registration
      </button>
    </>
  )}

  {r.status === "rejected" && (
    <button
      className={styles.secondaryBtn}
      disabled
      style={{
        background: "#9ca3af",
        cursor: "not-allowed",
        opacity: 0.6,
      }}
    >
      Application Rejected
    </button>
  )}

</div>

            </div>

          ))}

        </div>

      )}

      {/* QR POPUP */}

      {selectedQR && (

        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >

          <div
            style={{
              background: "#fff",
              padding: 30,
              borderRadius: 12,
              textAlign: "center",
              minWidth: 320,
            }}
          >

            <h2>{selectedQR.event_title}</h2>

            <div style={{ marginTop: 20 }}>

              <QRCodeCanvas
                value={selectedQR.qr_token}
                size={250}
              />

            </div>

            <div style={{ marginTop: 20 }}>

              <button onClick={() => window.print()}>
                Download
              </button>

              <button
                style={{ marginLeft: 10 }}
                onClick={() => setSelectedQR(null)}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}