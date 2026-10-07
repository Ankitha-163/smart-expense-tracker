// src/components/Expenses/ExpensesPage.jsx
// ─────────────────────────────────────────────────────────────
// Full expenses list with search, filter by category/month,
// inline edit and delete.
// ─────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { useExpenses } from "../../hooks/useExpenses";
import { CATEGORIES, getCategoryById } from "../../utils/categorize";
import ExpenseForm from "./ExpenseForm";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { format } from "date-fns";

export default function ExpensesPage() {
  const { expenses, loading, addExpense, updateExpense, deleteExpense } = useExpenses();

  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);     // expense being edited
  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  // ── Derived: available months from data ───────────────────
  const months = useMemo(() => {
    const set = new Set(expenses.map((e) => e.date?.slice(0,7)));
    return ["all", ...Array.from(set).sort().reverse()];
  }, [expenses]);

  // ── Filtered list ─────────────────────────────────────────
  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch  = e.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat     = filterCat   === "all" || e.category === filterCat;
      const matchMonth   = filterMonth === "all" || e.date?.startsWith(filterMonth);
      return matchSearch && matchCat && matchMonth;
    });
  }, [expenses, search, filterCat, filterMonth]);

  // ── Handlers ──────────────────────────────────────────────
  const handleAdd = async (data) => {
    try {
      await addExpense(data);
      toast.success("Expense added ✓");
      setShowForm(false);
    } catch { toast.error("Failed to add expense."); }
  };

  const handleUpdate = async (data) => {
    try {
      await updateExpense(editing.id, data);
      toast.success("Updated ✓");
      setEditing(null);
    } catch { toast.error("Failed to update."); }
  };

  const handleDelete = async (id, desc) => {
    if (!window.confirm(`Delete "${desc}"?`)) return;
    try {
      await deleteExpense(id);
      toast.success("Deleted");
    } catch { toast.error("Failed to delete."); }
  };

  if (loading) return <PageLoader />;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Expenses</h2>
          <p style={styles.pageSubtitle}>{expenses.length} transactions recorded</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filterRow} className="card">
        <div style={styles.searchWrap}>
          <Search size={15} style={{ color:"var(--text-muted)", flexShrink:0 }} />
          <input
            className="input"
            style={{ border:"none", background:"transparent", padding:"4px 0" }}
            placeholder="Search descriptions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input" style={styles.filterSelect} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <select className="input" style={styles.filterSelect} value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          {months.map((m) => (
            <option key={m} value={m}>{m === "all" ? "All Months" : formatMonth(m)}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState onAdd={() => setShowForm(true)} />
      ) : (
        <div style={styles.list}>
          {filtered.map((exp, i) => (
            <ExpenseRow
              key={exp.id}
              exp={exp}
              index={i}
              onEdit={() => setEditing(exp)}
              onDelete={() => handleDelete(exp.id, exp.description)}
            />
          ))}
        </div>
      )}

      {/* Total */}
      {filtered.length > 0 && (
        <div style={styles.total}>
          <span style={{ color:"var(--text-secondary)" }}>Total shown</span>
          <span style={{ color:"var(--accent)", fontWeight:700, fontSize:18 }}>
            ₹{filtered.reduce((s, e) => s + e.amount, 0).toLocaleString("en-IN", { minimumFractionDigits:2 })}
          </span>
        </div>
      )}

      {/* Modals */}
      {showForm && <ExpenseForm onSubmit={handleAdd} onClose={() => setShowForm(false)} />}
      {editing   && <ExpenseForm onSubmit={handleUpdate} onClose={() => setEditing(null)} initial={editing} />}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────
function ExpenseRow({ exp, index, onEdit, onDelete }) {
  const cat = getCategoryById(exp.category);
  return (
    <div
      className="card animate-fadeUp"
      style={{ ...styles.row, animationDelay: `${index * 30}ms` }}
    >
      {/* Category icon */}
      <div style={{ ...styles.catIcon, background: cat.color + "20", color: cat.color }}>
        {cat.emoji}
      </div>

      {/* Info */}
      <div style={styles.rowInfo}>
        <p style={styles.rowDesc}>{exp.description}</p>
        <div style={styles.rowMeta}>
          <span className="badge" style={{ background: cat.color+"20", color: cat.color }}>
            {cat.label}
          </span>
          <span style={{ color:"var(--text-muted)", fontSize:12 }}>
            {exp.date ? format(new Date(exp.date + "T00:00:00"), "MMM d, yyyy") : "—"}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div style={styles.amount}>
        ₹{exp.amount.toLocaleString("en-IN", { minimumFractionDigits:2 })}
      </div>

      {/* Actions */}
      <div style={styles.rowActions}>
        <button className="btn btn-ghost" style={styles.iconBtn} onClick={onEdit} title="Edit">
          <Pencil size={14} />
        </button>
        <button className="btn btn-danger" style={styles.iconBtn} onClick={onDelete} title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div style={styles.empty} className="card animate-fadeIn">
      <p style={{ fontSize:40 }}>🧾</p>
      <p style={{ fontWeight:600, marginTop:12 }}>No expenses found</p>
      <p style={{ color:"var(--text-muted)", fontSize:14, marginTop:4 }}>
        Add your first expense to get started.
      </p>
      <button className="btn btn-primary" style={{ marginTop:20 }} onClick={onAdd}>
        <Plus size={15} /> Add Expense
      </button>
    </div>
  );
}

function PageLoader() {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:80 }}>
      <div style={{ color:"var(--text-muted)", animation:"pulse 1.5s infinite" }}>Loading…</div>
    </div>
  );
}

function formatMonth(ym) {
  const [y, m] = ym.split("-");
  return new Date(y, parseInt(m) - 1).toLocaleString("default", { month:"long", year:"numeric" });
}

const styles = {
  page: { padding:"28px 24px", maxWidth:960, margin:"0 auto" },
  pageHeader: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 },
  pageTitle: { fontSize:24, fontWeight:700, letterSpacing:"-0.03em" },
  pageSubtitle: { color:"var(--text-muted)", fontSize:13, marginTop:2 },
  filterRow: { display:"flex", gap:10, padding:"12px 14px", marginBottom:20, flexWrap:"wrap", alignItems:"center" },
  searchWrap: { display:"flex", alignItems:"center", gap:8, flex:1, minWidth:180 },
  filterSelect: { width:"auto", minWidth:150 },
  list: { display:"flex", flexDirection:"column", gap:10 },
  row: { display:"flex", alignItems:"center", gap:14, padding:"14px 16px" },
  catIcon: { width:40, height:40, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 },
  rowInfo: { flex:1, minWidth:0 },
  rowDesc: { fontWeight:600, fontSize:14, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  rowMeta: { display:"flex", gap:8, alignItems:"center", marginTop:4, flexWrap:"wrap" },
  amount: { fontWeight:700, fontSize:16, color:"var(--text-primary)", flexShrink:0 },
  rowActions: { display:"flex", gap:6, flexShrink:0 },
  iconBtn: { padding:"6px 8px" },
  empty: { textAlign:"center", padding:52, marginTop:8 },
  total: { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20, padding:"14px 18px", background:"var(--accent-dim)", border:"1px solid rgba(245,166,35,0.2)", borderRadius:"var(--radius)" },
};
