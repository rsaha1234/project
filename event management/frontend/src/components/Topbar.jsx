import React from "react";
import styles from "./Topbar.module.css";

const Topbar = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <header className={styles.topbar}>
      <h1 className={styles.pageTitle}>Event Management Portal</h1>
      <div className={styles.right}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{(user.name || "U")[0]}</div>
          <div>
            <div className={styles.userName}>{user.name || "Student"}</div>
            <div className={styles.userRole}>
              {user.role === "admin" ? "Admin" : "Student"}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
