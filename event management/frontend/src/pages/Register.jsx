// frontend/src/pages/Register.jsx
import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

 const [form, setForm] = useState({
  name: "",
  email: "",
  password: "",
  roll_number: "",
  department: "",
});

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // call backend register via AuthContext
      const res = await register({
         name: form.name,
        email: form.email,
        password: form.password,
        roll_number: form.roll_number,
        department: form.department,
      });

      // ✅ if AuthContext.register returns backend data
      if (res?.ok) {
        navigate("/login");
      } else {
        setError(res?.message || "Registration failed. Use a unique email.");
      }
    } catch (err) {
      console.error("Register submit error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Use a unique email.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create Account</h2>
        <p className={styles.subtitle}>Join the Dept Event Portal</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
               <label>Roll Number</label>

          <input
            type="text"
            placeholder="Enter Roll Number"
            value={form.roll_number}
            onChange={(e) =>
              setForm({
                ...form,
                roll_number: e.target.value,
              })
            }
            required
          />

          <label>Department</label>

          <input
            type="text"
            placeholder="Enter Department"
            value={form.department}
            onChange={(e) =>
              setForm({
                ...form,
                department: e.target.value,
              })
            }
            required
          />
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{" "}
          <span className={styles.link} onClick={() => navigate("/login")}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
