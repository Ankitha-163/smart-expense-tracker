// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root component. Handles auth gating and page routing.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AuthPage    from "./components/Auth/AuthPage";
import Navbar      from "./components/Layout/Navbar";
import Dashboard   from "./components/Dashboard/Dashboard";
import ExpensesPage from "./components/Expenses/ExpensesPage";
import BudgetPage  from "./components/Dashboard/BudgetPage";
import "./styles/global.css";

// ── Inner app (rendered only when authenticated) ───────────
function AppInner() {
  const { currentUser } = useAuth();
  const [page, setPage] = useState("dashboard");

  if (!currentUser) return <AuthPage />;

  const pages = {
    dashboard: <Dashboard setActivePage={setPage} />,
    expenses:  <ExpensesPage />,
    budget:    <BudgetPage />,
  };

  return (
    <>
      <Navbar activePage={page} setActivePage={setPage} />
      <main>{pages[page] ?? pages.dashboard}</main>
    </>
  );
}

// ── Root with providers ────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1c22",
            color: "#F1F0EE",
            border: "1px solid rgba(255,255,255,0.08)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
          },
        }}
      />
      <AppInner />
    </AuthProvider>
  );
}
