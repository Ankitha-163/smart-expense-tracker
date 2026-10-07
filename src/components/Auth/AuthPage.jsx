// src/components/Auth/AuthPage.jsx
// ─────────────────────────────────────────────────────────────
// Handles user signup and login with Firebase Auth.
// Switches between Login / Register modes with smooth transition.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

export default function AuthPage() {
  const { login, signup, isFirebaseConfigured } = useAuth();
  const [isLogin, setIsLogin]   = useState(true);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({ name:"", email:"", password:"" });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      toast.error("Firebase is not configured. Add your Firebase values in the .env file and restart the app.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success("Welcome back!");
      } else {
        if (!form.name.trim()) { toast.error("Name is required"); return; }
        await signup(form.email, form.password, form.name);
        toast.success("Account created! Welcome 🎉");
      }
    } catch (err) {
      const msgs = {
        "auth/user-not-found":        "No account with that email.",
        "auth/wrong-password":        "Incorrect password.",
        "auth/email-already-in-use":  "Email already registered.",
        "auth/weak-password":         "Password must be ≥ 6 characters.",
        "auth/invalid-email":         "Please enter a valid email.",
        "auth/invalid-credential":    "Invalid email or password.",
      };
      toast.error(msgs[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Brand glow */}
      <div style={styles.glow} />

      <div style={styles.container} className="animate-fadeUp">
        {!isFirebaseConfigured && (
          <div style={styles.configWarning}>
            Firebase is not configured yet. Add your project settings in the .env file and restart the app.
          </div>
        )}

        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>💰</span>
          <span style={styles.logoText}>Spendr</span>
        </div>
        <p style={styles.tagline}>
          {isLogin ? "Track every rupee, master your money." : "Start your financial journey."}
        </p>

        {/* Mode toggle */}
        <div style={styles.toggleRow}>
          <button
            style={{ ...styles.toggleBtn, ...(isLogin ? styles.toggleActive : {}) }}
            onClick={() => setIsLogin(true)}
          >Login</button>
          <button
            style={{ ...styles.toggleBtn, ...(!isLogin ? styles.toggleActive : {}) }}
            onClick={() => setIsLogin(false)}
          >Sign Up</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div style={styles.field} className="animate-slideIn">
              <label className="label">Full Name</label>
              <input
                className="input"
                name="name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div style={styles.field}>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.field}>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ ...styles.submitBtn, opacity: !isFirebaseConfigured ? 0.7 : 1 }}
            type="submit"
            disabled={loading || !isFirebaseConfigured}
          >
            {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p style={styles.switchText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            style={styles.link}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign up" : "Log in"}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
  },
  glow: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  container: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: "40px 36px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 4px 40px rgba(0,0,0,0.5)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  logoIcon: { fontSize: 32 },
  logoText: {
    fontSize: 28,
    fontWeight: 800,
    fontFamily: "'Sora', sans-serif",
    color: "#F5A623",
    letterSpacing: "-0.04em",
  },
  configWarning: {
    marginBottom: 18,
    padding: "12px 14px",
    borderRadius: 12,
    background: "rgba(245, 166, 35, 0.12)",
    border: "1px solid rgba(245, 166, 35, 0.35)",
    color: "#f6d88a",
    fontSize: 13,
    lineHeight: 1.5,
  },
  tagline: {
    color: "var(--text-secondary)",
    fontSize: 14,
    marginBottom: 28,
  },
  toggleRow: {
    display: "flex",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: 4,
    marginBottom: 28,
  },
  toggleBtn: {
    flex: 1,
    padding: "8px 0",
    border: "none",
    borderRadius: 8,
    background: "transparent",
    color: "var(--text-secondary)",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  toggleActive: {
    background: "var(--accent)",
    color: "#0D0F14",
    boxShadow: "0 4px 12px rgba(245,166,35,0.3)",
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: {},
  submitBtn: { width: "100%", justifyContent: "center", padding: "13px", fontSize: 15, marginTop: 4 },
  switchText: { textAlign: "center", color: "var(--text-secondary)", fontSize: 13, marginTop: 20 },
  link: { color: "var(--accent)", cursor: "pointer", fontWeight: 600 },
};
