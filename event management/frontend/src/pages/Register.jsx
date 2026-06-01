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

  const handleChange = (e) => {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
};

 const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  const deptCodes = {
    "Electronics and Communication Engineering": "ECE",
    "Computer Science and Engineering": "CSE",
    "Information Technology": "IT",
    "Electrical Engineering": "EE",
    "Mechanical Engineering": "ME",
    "Civil Engineering": "CE",
  };

  const expectedCode = deptCodes[form.department];

  const rollRegex = new RegExp(
    `^\\d{2}\\/${expectedCode}\\/\\d+$`
  );

  if (!rollRegex.test(form.roll_number)) {
    setError(
      `Roll Number must be in format: 22/${expectedCode}/001`
    );
    setLoading(false);
    return;
  }

  try {
    const res = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      roll_number: form.roll_number,
      department: form.department,
    });

    if (res?.ok) {
      navigate("/login");
    } else {
      setError(
        res?.message ||
          "Registration failed. Use a unique email."
      );
    }
  } catch (err) {
    console.error(err);

    setError(
      err?.response?.data?.message ||
        err?.message ||
        "Registration failed."
    );
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
             name="roll_number"
             placeholder="22/ECE/001"
             value={form.roll_number}
             onChange={handleChange}
             required
          />

<small
  style={{
    color: "#666",
    marginTop: "-8px",
    marginBottom: "10px",
  }}
>Format: 22/DEPT_CODE/001 (e.g. 22/ECE/001)
</small>

          <label>Department</label>

<select
  name="department"
  value={form.department}
  onChange={handleChange}
  required
>
  <option value="">
    Select Department
  </option>

  <option value="Electronics and Communication Engineering">
    Electronics and Communication Engineering
  </option>

  <option value="Computer Science and Engineering">
    Computer Science and Engineering
  </option>

  <option value="Information Technology">
    Information Technology
  </option>

  <option value="Electrical Engineering">
    Electrical Engineering
  </option>

  <option value="Mechanical Engineering">
    Mechanical Engineering
  </option>

  <option value="Civil Engineering">
    Civil Engineering
  </option>
</select>
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
