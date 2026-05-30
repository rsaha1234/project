import { useAuth } from '../auth/AuthContext';
import styles from '../styles/layout.module.css';
import { useEffect, useState } from "react";

export default function Navbar(){
const { user, logout } = useAuth();
return (
<div className={styles.navbar}>
<div className={styles.brand}>Dept Events</div>
<div className={styles.spacer} />
{user ? (
<div className={styles.userBox}>
<span>{user.name} ({user.role})</span>
<button onClick={logout}>Logout</button>
</div>
) : null}
</div>
);
}