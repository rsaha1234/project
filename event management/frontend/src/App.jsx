// frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./auth/ProtectedRoute";
import styles from "./styles/layout.module.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventApply from "./pages/EventApply";
import Announcements from "./pages/Announcements";
import AdminEvents from "./pages/AdminEvents";
import AdminRegistrations from "./pages/AdminRegistrations";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import MyRegistrations from "./pages/MyRegistrations";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import AddAdmin from "./pages/AddAdmin"; // ✅ new
import AdminAttendance from "./pages/AdminAttendance";
import AttendanceReport from "./pages/AttendanceReport";

export default function App() {
  const { user } = useAuth();

  // if not logged in -> show only login & register routes (centered)
  if (!user) {
    return (
      <div className={styles.centerPage}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  // logged-in layout (navbar + sidebar + content)
  return (
    <div>
      <Navbar />
      <div className={styles.layout}>
        <Sidebar />
        <div className={styles.content}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Student dashboard */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin dashboard */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/events" element={<Events />} />

            <Route
              path="/events/:id/apply"
              element={
                <ProtectedRoute>
                  <EventApply />
                </ProtectedRoute>
              }
            />

            <Route path="/announcements" element={<Announcements />} />

            <Route
              path="/my-registrations"
              element={
                <ProtectedRoute roles={["student", "admin"]}>
                  <MyRegistrations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/events"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminEvents />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/registrations"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminRegistrations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminAnnouncements />
                </ProtectedRoute>
              }
            />

            {/* ✅ Only admin (HOD/teacher) can see AddAdmin page */}
            <Route
              path="/admin/add-admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AddAdmin />
                </ProtectedRoute>
              }
            />

                <Route
                   path="/admin-attendance"
                     element={
                     <ProtectedRoute roles={["admin"]}>
                     <AdminAttendance />
                    </ProtectedRoute>
                     }
                 />
                 <Route
                     path="/attendance-report"
                    element={
                   <ProtectedRoute roles={["admin"]}>
                      <AttendanceReport />
                    </ProtectedRoute>
                       }
                     />

            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
