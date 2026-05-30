// frontend/src/layout/MainLayout.jsx
import React from "react";
import styles from "./MainLayout.module.css";
import Topbar from "../components/Topbar";

/**
 * MainLayout is only responsible for Topbar + content wrapper.
 * Sidebar must NOT be inside MainLayout — App.jsx already renders it.
 */
const MainLayout = ({ children }) => {
  return (
    <div className={styles.appShell}>
      <div className={styles.mainArea}>
        <Topbar />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
