// src/components/Dashboard/BudgetPage.jsx
// ─────────────────────────────────────────────────────────────
// Budget settings page — lets user set/update monthly limit.
// Shows current spend vs budget with visual ring.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { useBudget } from "../../hooks/useBudget";
import { useExpenses } from "../../hooks/useExpenses";
import { CATEGORIES, getCategoryById } from "../../utils/categorize";
import toast from "react-hot-toast";
import { startOfMonth, endOfMonth, format } from "date-fns";

export default function BudgetPage() {
  const { budget, saveBudget }  = useBudget();
  const { expenses }            = useExpenses();
  const [input, setInput]       = useState("");
  const [saving, setSaving]     = useState(false);

  const now        = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd   = endOfMonth(now);

  // Current month expenses
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date + "T00:00:00");
    return d >= monthStart && d <= monthEnd;
  });
  const spent = thisMonth.reduce((s, e) => s + e.amount, 0);
  const pct   = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  // Per-category breakdown
  const catBreakdown = CATEGORIES.map((c) => ({
    ...c,
    total: thisMonth.filter((e) => e.category === c.id).reduce((s,e) => s+e.amount, 0),
  })).filter((c) => c.total > 0).sort((a,b) => b.total - a.total);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!input || parseFloat(input) < 0) { toast.error("Enter a valid amount."); return; }
    setSaving(true);
    try {
      await saveBudget(input);
      toast.success(`Budget set to ₹${parseFloat(input).toLocaleString("en-IN")} 🎯`);
      setInput("");
    } catch { toast.error("Failed to save budget."); }
    finally { setSaving(false); }
  };

  const ringColor = pct >= 100 ? "#FF5757" : pct >= 80 ? "#F5A623" : "#34D399";
  const dashOffset = 339.3 * (1 - pct / 100);   // circumference = 2π×54 ≈ 339.3

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Budget</h2>
      <p style={styles.sub}>Set a monthly spending limit and track your progress.</p>

      <div style={styles.grid}>
        {/* Ring progress card */}
        <div style={styles.ringCard} className="card">
          <h3 style={styles.cardTitle}>This Month — {format(now, "MMMM yyyy")}</h3>

          <div style={styles.ringWrap}>
            <svg width={140} height={140} viewBox="0 0 120 120">
              {/* Track */}
              <circle cx={60} cy={60} r={54} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
              {/* Fill */}
              <circle
                cx={60} cy={60} r={54}
                fill="none"
                stroke={ringColor}
                strokeWidth={10}
                strokeDasharray={339.3}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition:"stroke-dashoffset 0.8s ease, stroke 0.4s ease" }}
              />
              <text x={60} y={56} textAnchor="middle" fill="#F1F0EE" fontSize={16} fontWeight={700} fontFamily="Sora">
                {pct.toFixed(0)}%
              </text>
              <text x={60} y={72} textAnchor="middle" fill="#8E8D8A" fontSize={9} fontFamily="DM Sans">
                used
              </text>
            </svg>
          </div>

          <div style={styles.ringStats}>
            <div style={styles.ringStat}>
              <span style={{ color:"var(--text-muted)", fontSize:12 }}>Spent</span>
              <span style={{ color: ringColor, fontWeight:700 }}>
                ₹{spent.toLocaleString("en-IN", { minimumFractionDigits:2 })}
              </span>
            </div>
            <div style={{ width:1, background:"var(--border)" }} />
            <div style={styles.ringStat}>
              <span style={{ color:"var(--text-muted)", fontSize:12 }}>Limit</span>
              <span style={{ fontWeight:700 }}>
                {budget > 0 ? `₹${budget.toLocaleString("en-IN")}` : "—"}
              </span>
            </div>
            <div style={{ width:1, background:"var(--border)" }} />
            <div style={styles.ringStat}>
              <span style={{ color:"var(--text-muted)", fontSize:12 }}>Remaining</span>
              <span style={{ color: budget > 0 && spent > budget ? "var(--danger)" : "var(--success)", fontWeight:700 }}>
                {budget > 0
                  ? `₹${Math.abs(budget - spent).toLocaleString("en-IN", { minimumFractionDigits:2 })} ${spent > budget ? "over" : "left"}`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Set budget form */}
        <div style={styles.formCard} className="card">
          <h3 style={styles.cardTitle}>Update Budget Limit</h3>
          <p style={{ color:"var(--text-muted)", fontSize:13, marginBottom:20 }}>
            Set a monthly spending cap. We'll alert you when you approach or exceed it.
          </p>

          {budget > 0 && (
            <div style={styles.currentBudget}>
              <span>Current limit</span>
              <span style={{ color:"var(--accent)", fontWeight:700 }}>
                ₹{budget.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label className="label">New Monthly Budget (₹)</label>
              <input
                className="input"
                type="number"
                placeholder="e.g. 25000"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                min="1"
                step="1"
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ justifyContent:"center" }}>
              {saving ? "Saving…" : "Save Budget"}
            </button>
            {budget > 0 && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ justifyContent:"center" }}
                onClick={async () => { await saveBudget(0); toast("Budget cleared"); }}
              >
                Clear Budget Limit
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Category breakdown */}
      {catBreakdown.length > 0 && (
        <div style={styles.breakCard} className="card">
          <h3 style={styles.cardTitle}>Category Breakdown — {format(now, "MMMM")}</h3>
          <div style={styles.catGrid}>
            {catBreakdown.map((c) => {
              const catPct = spent > 0 ? (c.total / spent) * 100 : 0;
              return (
                <div key={c.id} style={styles.catRow}>
                  <div style={styles.catLeft}>
                    <span style={{ ...styles.catDot, background: c.color }} />
                    <span style={{ fontSize:15 }}>{c.emoji}</span>
                    <span style={{ fontSize:13, fontWeight:500 }}>{c.label}</span>
                  </div>
                  <div style={{ flex:1, margin:"0 16px" }}>
                    <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:99 }}>
                      <div style={{ height:"100%", width:`${catPct}%`, background:c.color, borderRadius:99, transition:"width 0.5s ease" }} />
                    </div>
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, minWidth:100, textAlign:"right" }}>
                    ₹{c.total.toLocaleString("en-IN", { minimumFractionDigits:2 })}
                    <span style={{ color:"var(--text-muted)", fontWeight:400, marginLeft:4 }}>({catPct.toFixed(0)}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding:"28px 24px", maxWidth:960, margin:"0 auto" },
  title: { fontSize:24, fontWeight:700, letterSpacing:"-0.03em" },
  sub: { color:"var(--text-muted)", fontSize:14, marginBottom:24, marginTop:2 },
  grid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 },
  ringCard: { padding:24, display:"flex", flexDirection:"column", alignItems:"center" },
  cardTitle: { fontSize:15, fontWeight:700, alignSelf:"flex-start", width:"100%", marginBottom:16 },
  ringWrap: { margin:"8px 0" },
  ringStats: { display:"flex", gap:0, width:"100%", marginTop:16, borderTop:"1px solid var(--border)", paddingTop:16 },
  ringStat: { flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, fontSize:14 },
  formCard: { padding:24 },
  currentBudget: {
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"10px 14px", background:"var(--accent-dim)", borderRadius:10,
    border:"1px solid rgba(245,166,35,0.2)", marginBottom:16, fontSize:13,
  },
  breakCard: { padding:24 },
  catGrid: { display:"flex", flexDirection:"column", gap:12, marginTop:16 },
  catRow: { display:"flex", alignItems:"center" },
  catLeft: { display:"flex", alignItems:"center", gap:8, minWidth:160 },
  catDot: { width:8, height:8, borderRadius:"50%", flexShrink:0 },
};
