// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "../styles/form.module.css";

/**
 * Login page
 * - uses useAuth().login(email, password) which should return an object like { ok: true } on success
 * - uses useAuth().loading to show a loading state
 * - navigates to /dashboard on success
 */
export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(form.email, form.password);

      // support both a boolean return and an object return (backwards compatible)
      if ((res && res.ok) || res === true) {
        navigate("/dashboard");
      } else {
        const msg = (res && (res.message || res.error)) || "Invalid email or password";
        setError(msg);
      }
    } catch (err) {
      setError(err?.message || "Login failed");
    }
  };

  return (
    <div
      className={styles.container || ""}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "linear-gradient(to bottom right, #eef2ff, #f8fafc)",
      }}
    >
      <form
        onSubmit={submit}
        className={styles.card || ""}
        style={{
          width: 420,
          maxWidth: "95%",
          padding: 28,
          borderRadius: 12,
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
          background: "#fff",
        }}
      >
        <h2 style={{ marginBottom: 6 }}>Sign in</h2>
        <p style={{ marginTop: 0, marginBottom: 16, color: "#6b7280" }}>
          Welcome back — sign in to continue to Dept Events
        </p>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "8px 12px",
              borderRadius: 8,
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
            placeholder="you@college.edu"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #e6e9ee",
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>Password</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
              placeholder="Your password"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #e6e9ee",
                fontSize: 14,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              style={{
                background: "transparent",
                border: "1px solid #e6e9ee",
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                color: "#374151",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              background: "#2563eb",
              color: "white",
              cursor: loading ? "default" : "pointer",
              fontWeight: 600,
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div style={{ marginLeft: "auto", fontSize: 14 }}>
            <span>New here? </span>
            <Link to="/register" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
              Create account
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 14, fontSize: 13, color: "#666" }}>
          Note: Register creates a <strong>student</strong> account. Admins must be created by admin or seeded in DB.
        </div>
      </form>
    </div>
  );
}
