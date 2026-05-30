import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useAuth } from "../auth/AuthContext";


const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role; // "student" | "admin"

  let navItems = [];

  if (role === "admin") {
    // ✅ Admin sidebar: no "My Registrations"
    navItems = [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/events", label: "Events" },
      { to: "/announcements", label: "Announcements" },
      { to: "/admin/events", label: "Manage Events" },
      { to: "/admin-attendance", label: "Attendance Scanner" },
      { to: "/attendance-report", label: "Attendance Report" },
      { to: "/admin/registrations", label: "View Registrations" },
      { to: "/admin/announcements", label: "Manage Announcements" },
      { to: "/admin/add-admin", label: "Add Admin" },
    ];
  } else {
    // ✅ Student sidebar (original)
    navItems = [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/events", label: "Events" },
      { to: "/my-registrations", label: "My Registrations" },
      { to: "/announcements", label: "Announcements" },
    ];
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoDot}></span>
        <div>
          <div className={styles.logoTitle}>Dept Events</div>
          <div className={styles.logoSub}>HIT ECE</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
