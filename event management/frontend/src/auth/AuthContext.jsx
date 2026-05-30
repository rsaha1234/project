// src/auth/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Load user from localStorage on reload
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      localStorage.removeItem("user");
    }
  }, []);

  /* ---------------------------
     LOGIN FUNCTION
  --------------------------- */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (data?.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role); // keep role

        setUser(data.user);
        return { ok: true, user: data.user, token: data.token };
      }

      return { ok: false, message: data?.message || "Login failed" };
    } catch (err) {
      return {
        ok: false,
        message: err.response?.data?.message || "Login error",
      };
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------
     REGISTER FUNCTION (FIXED)
  --------------------------- */
  const register = async ({
  name,
  email,
  password,
  roll_number,
  department,
}) => {

  try {

    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      roll_number,
      department,
    });

    return data;

  } catch (err) {

    return {
      ok: false,
      message:
        err.response?.data?.message || "Registration failed",
    };
  }
};
  /* ---------------------------
     LOGOUT FUNCTION
  --------------------------- */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register, // ⭐ added here
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
