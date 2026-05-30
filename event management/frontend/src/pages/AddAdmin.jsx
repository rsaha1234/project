// frontend/src/pages/AddAdmin.jsx
import React, { useState } from "react";
import api from "../api/client";
import styles from "./AddAdmin.module.css";

export default function AddAdmin() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/admin/users", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (res.data?.ok) {
        setSuccess("Admin created successfully.");
        setForm({ name: "", email: "", password: "" });
      } else {
        setError(res.data?.message || "Failed to create admin.");
      }
    } catch (err) {
      console.error("AddAdmin error:", err);
      setError(
        err?.response?.data?.message || "Failed to create admin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Add New Admin</h2>
          <p className={styles.subtitle}>
            Create admin accounts for teachers. Students should always register from the normal registration page.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              className={styles.input}
              value={form.name}
              onChange={handleChange("name")}
              placeholder="Enter teacher name"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              value={form.email}
              onChange={handleChange("email")}
              placeholder="teacher@example.com"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              value={form.password}
              onChange={handleChange("password")}
              placeholder="Set a password for this admin"
            />
            <p className={styles.hint}>
              Share this password with the teacher. They can change it later from the login system (if you add that feature).
            </p>
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.button}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>

      <div className={styles.noteBox}>
        <h4 className={styles.noteTitle}>Important</h4>
        <p className={styles.noteText}>
          Use this page only to create admin accounts for faculty members.
          Students must use the normal registration form and will always have the{" "}
          <strong>student</strong> role.
        </p>
      </div>
    </div>
  );
}
