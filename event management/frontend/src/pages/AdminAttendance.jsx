import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
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

      <Scanner
  onScan={(detectedCodes) => {
    if (detectedCodes?.length > 0) {
      handleScan(detectedCodes[0].rawValue);
    }
  }}
  onError={(error) => {
    console.error(error);
  }}
  styles={{
    container: {
      width: "100%",
      maxWidth: "600px",
    },
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