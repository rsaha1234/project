import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import api from "../api/client";

export default function AdminAttendance() {
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");

  const handleScan = async (qrToken) => {
    if (!qrToken) return;

    try {
      const res = await api.post("/registrations/scan", {
        qr_token: qrToken,
      });

      setResult(res.data);

      setMessage(res.data.message);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Scan failed"
      );
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>QR Attendance Scanner</h2>

      <QrReader
  constraints={{
    facingMode: "user"
  }}
  scanDelay={500}
  onResult={(result, error) => {
    if (result?.text) {
      handleScan(result.text);
    }

    if (error) {
      console.log(error);
    }
  }}
  containerStyle={{
    width: "100%",
    maxWidth: "600px",
  }}
/>

      <div style={{ marginTop: 20 }}>
        <h3>{message}</h3>

        {result?.student && (
          <>
            <p>
              <strong>Name:</strong> {result.student}
            </p>

            <p>
              <strong>Roll:</strong> {result.roll}
            </p>

            <p>
              <strong>Event:</strong> {result.event}
            </p>
          </>
        )}
      </div>
    </div>
  );
}