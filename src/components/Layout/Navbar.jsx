// src/components/Layout/Navbar.jsx
// ─────────────────────────────────────────────────────────────
// Top navigation bar with user info, nav links, and logout.
// ─────────────────────────────────────────────────────────────

import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

export default function Navbar({ activePage, setActivePage }) {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast("See you soon 👋", { icon: "💰" });
  };

  const initials = currentUser?.displayName
    ? currentUser.displayName.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase()
    : "?";

  const navItems = [
    { id: "dashboard", label: "Dashboard", emoji: "📊" },
    { id: "expenses",  label: "Expenses",  emoji: "📋" },
    { id: "budget",    label: "Budget",    emoji: "🎯" },
  ];

  return (
    <nav style={styles.nav}>
      {/* Brand */}
      <div style={styles.brand}>
        <span style={{ fontSize: 22 }}>💰</span>
        <span style={styles.brandName}>Spendr</span>
      </div>

      {/* Nav links */}
      <div style={styles.links}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              ...styles.link,
              ...(activePage === item.id ? styles.linkActive : {}),
            }}
          >
            <span>{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* User + logout */}
      <div style={styles.right}>
        <div style={styles.avatar}>{initials}</div>
        <span style={styles.username}>
          {currentUser?.displayName?.split(" ")[0] || "User"}
        </span>
        <button className="btn btn-ghost" style={{ padding:"8px 14px", fontSize:13 }} onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 24px",
    height: 64,
    background: "rgba(13,15,20,0.85)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    backdropFilter: "blur(20px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: { display:"flex", alignItems:"center", gap:8, marginRight:16 },
  brandName: {
    fontSize:20, fontWeight:800, fontFamily:"'Sora',sans-serif",
    color:"var(--accent)", letterSpacing:"-0.04em",
  },
  links: { display:"flex", gap:4, flex:1 },
  link: {
    display:"flex", alignItems:"center", gap:6,
    padding:"7px 14px", border:"none", background:"transparent",
    color:"var(--text-secondary)", cursor:"pointer",
    borderRadius:8, fontWeight:500, fontSize:14,
    fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s",
  },
  linkActive: {
    background:"var(--accent-dim)",
    color:"var(--accent)",
  },
  right: { display:"flex", alignItems:"center", gap:10, marginLeft:"auto" },
  avatar: {
    width:32, height:32, borderRadius:"50%",
    background:"var(--accent)", color:"#0D0F14",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:12, fontWeight:700, fontFamily:"'Sora',sans-serif",
  },
  username: { fontSize:14, color:"var(--text-secondary)", fontWeight:500 },
};
