// src/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * usage:
 * <ProtectedRoute roles={['admin']}>
 *   <AdminPage />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length && !roles.includes(user.role)) {
    // unauthorized
    return <div style={{ padding: 20 }}>You do not have access to this page.</div>;
  }

  return children;
}
