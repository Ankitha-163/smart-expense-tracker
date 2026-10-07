// src/components/Dashboard/Dashboard.jsx
// ─────────────────────────────────────────────────────────────
// Main dashboard: stat cards, category pie chart, monthly bar
// chart, recent transactions, and budget alert banner.
// ─────────────────────────────────────────────────────────────

import { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { useExpenses } from "../../hooks/useExpenses";
import { useBudget } from "../../hooks/useBudget";
import { CATEGORIES, getCategoryById } from "../../utils/categorize";
import { useAuth } from "../../hooks/useAuth";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard({ setActivePage }) {
  const { expenses, loading } = useExpenses();
  const { budget } = useBudget();
  const { currentUser } = useAuth();

  const now             = new Date();
  const monthStart      = startOfMonth(now);
  const monthEnd        = endOfMonth(now);

  // ── Current month expenses ────────────────────────────────
  const thisMonthExp = useMemo(() =>
    expenses.filter((e) => {
      const d = new Date(e.date + "T00:00:00");
      return d >= monthStart && d <= monthEnd;
    }),
  [expenses]);

  const totalThisMonth  = useMemo(() => thisMonthExp.reduce((s, e) => s + e.amount, 0), [thisMonthExp]);
  const totalAllTime    = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const budgetUsed      = budget > 0 ? (totalThisMonth / budget) * 100 : 0;
  const overBudget      = budget > 0 && totalThisMonth > budget;

  // ── Category breakdown (current month) ───────────────────
  const categoryData = useMemo(() => {
    const map = {};
    thisMonthExp.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    const sorted = Object.entries(map).sort((a,b) => b[1]-a[1]);
    return {
      labels: sorted.map((x) => {
        const c = getCategoryById(x[0]);
        return `${c.emoji} ${c.label}`;
      }),
      datasets: [{
        data: sorted.map((x) => x[1]),
        backgroundColor: sorted.map((x) => getCategoryById(x[0]).color + "CC"),
        borderColor:     sorted.map((x) => getCategoryById(x[0]).color),
        borderWidth: 2,
        hoverOffset: 6,
      }],
    };
  }, [thisMonthExp]);

  // ── Monthly totals (last 6 months) ───────────────────────
  const monthlyData = useMemo(() => {
    const months = Array.from({ length:6 }, (_, i) => subMonths(now, 5 - i));
    const labels  = months.map((m) => format(m, "MMM yy"));
    const totals  = months.map((m) => {
      const s = startOfMonth(m), e = endOfMonth(m);
      return expenses
        .filter((x) => { const d = new Date(x.date+"T00:00:00"); return d>=s && d<=e; })
        .reduce((sum, x) => sum + x.amount, 0);
    });
    return {
      labels,
      datasets: [{
        label: "Spending (₹)",
        data: totals,
        backgroundColor: totals.map((_, i) => i === 5 ? "#F5A623CC" : "rgba(255,255,255,0.08)"),
        borderColor:     totals.map((_, i) => i === 5 ? "#F5A623"    : "rgba(255,255,255,0.15)"),
        borderWidth: 1.5,
        borderRadius: 8,
        borderSkipped: false,
      }],
    };
  }, [expenses]);

  // ── Top categories ────────────────────────────────────────
  const topCats = useMemo(() => {
    const map = {};
    thisMonthExp.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,4)
      .map(([id, amt]) => ({ ...getCategoryById(id), amt }));
  }, [thisMonthExp]);

  if (loading) return <div style={{ padding:80, textAlign:"center", color:"var(--text-muted)" }}>Loading dashboard…</div>;

  return (
    <div style={styles.page}>
      {/* Budget over-limit alert */}
      {overBudget && (
        <div style={styles.alert} className="animate-slideIn">
          ⚠️ You've exceeded your monthly budget of ₹{budget.toLocaleString("en-IN")} by ₹{(totalThisMonth - budget).toLocaleString("en-IN", { minimumFractionDigits:2 })}. Consider reviewing your expenses.
        </div>
      )}
      {!overBudget && budget > 0 && budgetUsed >= 80 && (
        <div style={{ ...styles.alert, background:"rgba(245,166,35,0.12)", borderColor:"rgba(245,166,35,0.3)", color:"var(--accent-light)" }} className="animate-slideIn">
          🔔 You've used {budgetUsed.toFixed(0)}% of your monthly budget.
        </div>
      )}

      {/* Greeting */}
      <div style={styles.greeting}>
        <h2 style={styles.greetTitle}>
          {getGreeting()}, {currentUser?.displayName?.split(" ")[0] || "there"} 👋
        </h2>
        <p style={{ color:"var(--text-muted)", fontSize:14 }}>
          {format(now, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Stat cards */}
      <div style={styles.statsGrid}>
        <StatCard
          label="This Month"
          value={`₹${totalThisMonth.toLocaleString("en-IN", { minimumFractionDigits:2 })}`}
          sub={`${thisMonthExp.length} transactions`}
          accent="#F5A623"
          emoji="📅"
        />
        <StatCard
          label="All Time"
          value={`₹${totalAllTime.toLocaleString("en-IN", { minimumFractionDigits:2 })}`}
          sub={`${expenses.length} total`}
          accent="#60A5FA"
          emoji="💳"
        />
        <StatCard
          label="Monthly Budget"
          value={budget > 0 ? `₹${budget.toLocaleString("en-IN")}` : "Not set"}
          sub={budget > 0 ? `${budgetUsed.toFixed(0)}% used` : "Set a limit →"}
          accent={overBudget ? "#FF5757" : "#34D399"}
          emoji="🎯"
          onClick={() => setActivePage("budget")}
        />
        <StatCard
          label="Avg / Transaction"
          value={expenses.length > 0
            ? `₹${(totalAllTime / expenses.length).toLocaleString("en-IN", { maximumFractionDigits:0 })}`
            : "—"}
          sub="all time average"
          accent="#A78BFA"
          emoji="📊"
        />
      </div>

      {/* Budget progress bar */}
      {budget > 0 && (
        <div style={styles.budgetBar} className="card">
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
            <span style={{ color:"var(--text-secondary)", fontWeight:600 }}>Budget Progress</span>
            <span style={{ color: overBudget ? "var(--danger)" : "var(--accent)" }}>
              ₹{totalThisMonth.toLocaleString("en-IN")} / ₹{budget.toLocaleString("en-IN")}
            </span>
          </div>
          <div style={styles.barTrack}>
            <div style={{
              ...styles.barFill,
              width: `${Math.min(budgetUsed, 100)}%`,
              background: overBudget ? "var(--danger)" : budgetUsed > 80 ? "var(--accent)" : "var(--success)",
            }} />
          </div>
        </div>
      )}

      {/* Charts */}
      <div style={styles.chartsRow}>
        {/* Doughnut — category breakdown */}
        <div style={styles.chartCard} className="card">
          <h3 style={styles.chartTitle}>Spending by Category</h3>
          <p style={styles.chartSub}>{format(now, "MMMM yyyy")}</p>
          {thisMonthExp.length > 0 ? (
            <div style={{ position:"relative", height:240 }}>
              <Doughnut data={categoryData} options={doughnutOpts} />
            </div>
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* Bar — monthly totals */}
        <div style={styles.chartCard} className="card">
          <h3 style={styles.chartTitle}>Monthly Spending</h3>
          <p style={styles.chartSub}>Last 6 months</p>
          <div style={{ position:"relative", height:240 }}>
            <Bar data={monthlyData} options={barOpts} />
          </div>
        </div>
      </div>

      {/* Top categories + recent expenses */}
      <div style={styles.bottomRow}>
        {/* Top categories */}
        <div style={styles.topCatCard} className="card">
          <h3 style={styles.chartTitle}>Top Categories</h3>
          <p style={styles.chartSub}>{format(now, "MMMM yyyy")}</p>
          {topCats.length > 0 ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:16 }}>
              {topCats.map((c) => {
                const pct = totalThisMonth > 0 ? (c.amt / totalThisMonth) * 100 : 0;
                return (
                  <div key={c.id}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}>
                      <span>{c.emoji} {c.label}</span>
                      <span style={{ color:"var(--text-secondary)" }}>
                        ₹{c.amt.toLocaleString("en-IN", { minimumFractionDigits:2 })} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div style={styles.barTrack}>
                      <div style={{ ...styles.barFill, width:`${pct}%`, background:c.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* Recent expenses */}
        <div style={styles.recentCard} className="card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <h3 style={styles.chartTitle}>Recent Expenses</h3>
              <p style={styles.chartSub}>Latest 5</p>
            </div>
            <button className="btn btn-ghost" style={{ fontSize:12, padding:"6px 12px" }} onClick={() => setActivePage("expenses")}>
              View all →
            </button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:16 }}>
            {expenses.slice(0,5).map((e) => {
              const c = getCategoryById(e.category);
              return (
                <div key={e.id} style={styles.recentRow}>
                  <span style={{ fontSize:18 }}>{c.emoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.description}</p>
                    <p style={{ fontSize:11, color:"var(--text-muted)" }}>{e.date}</p>
                  </div>
                  <span style={{ fontWeight:700, fontSize:14, color:"var(--text-primary)", flexShrink:0 }}>
                    ₹{e.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })}
            {expenses.length === 0 && <EmptyChart />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────
function StatCard({ label, value, sub, accent, emoji, onClick }) {
  return (
    <div
      className="card animate-fadeUp"
      style={{ ...styles.statCard, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <p style={styles.statLabel}>{label}</p>
        <span style={{ fontSize:22 }}>{emoji}</span>
      </div>
      <p style={{ ...styles.statValue, color: accent }}>{value}</p>
      <p style={styles.statSub}>{sub}</p>
    </div>
  );
}

function EmptyChart() {
  return (
    <div style={{ textAlign:"center", padding:"32px 0", color:"var(--text-muted)", fontSize:13 }}>
      No data for this period
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Chart.js options ───────────────────────────────────────────
const doughnutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: { color:"#8E8D8A", boxWidth:10, padding:12, font:{ size:11, family:"DM Sans" } },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ₹${ctx.parsed.toLocaleString("en-IN", { minimumFractionDigits:2 })}`,
      },
    },
  },
  cutout: "65%",
};

const barOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString("en-IN", { minimumFractionDigits:2 })}`,
      },
    },
  },
  scales: {
    x: { grid:{ color:"rgba(255,255,255,0.04)" }, ticks:{ color:"#8E8D8A", font:{ size:11 } } },
    y: {
      grid:{ color:"rgba(255,255,255,0.04)" },
      ticks:{ color:"#8E8D8A", font:{ size:11 }, callback:(v) => `₹${v.toLocaleString("en-IN")}` },
    },
  },
};

const styles = {
  page: { padding:"28px 24px", maxWidth:1100, margin:"0 auto" },
  alert: {
    padding:"12px 16px", borderRadius:"var(--radius-sm)", marginBottom:20,
    background:"rgba(255,87,87,0.12)", border:"1px solid rgba(255,87,87,0.3)",
    color:"#FF8A8A", fontSize:14, fontWeight:500,
  },
  greeting: { marginBottom:24 },
  greetTitle: { fontSize:24, fontWeight:700, letterSpacing:"-0.03em" },
  statsGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:14, marginBottom:16 },
  statCard: { padding:"18px 20px" },
  statLabel: { fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-muted)", marginBottom:8 },
  statValue: { fontSize:22, fontWeight:800, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.03em" },
  statSub: { fontSize:12, color:"var(--text-muted)", marginTop:4 },
  budgetBar: { padding:"14px 18px", marginBottom:16 },
  barTrack: { height:6, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" },
  barFill: { height:"100%", borderRadius:99, transition:"width 0.6s ease" },
  chartsRow: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 },
  chartCard: { padding:"20px 20px 16px" },
  chartTitle: { fontSize:15, fontWeight:700 },
  chartSub: { fontSize:12, color:"var(--text-muted)", marginBottom:4 },
  bottomRow: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 },
  topCatCard: { padding:"20px" },
  recentCard: { padding:"20px" },
  recentRow: { display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid var(--border)" },
};
