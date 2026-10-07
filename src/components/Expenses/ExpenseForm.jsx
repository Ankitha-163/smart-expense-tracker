// src/components/Expenses/ExpenseForm.jsx
// ─────────────────────────────────────────────────────────────
// Add / Edit expense modal.
// Auto-fills category on description blur using the categorizer.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { CATEGORIES, autoCategory } from "../../utils/categorize";
import { X } from "lucide-react";

export default function ExpenseForm({ onSubmit, onClose, initial }) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    amount:      "",
    description: "",
    category:    "other",
    date:        today,
    ...initial,
  });
  const [autoDetected, setAutoDetected] = useState(false);

  // Pre-fill when editing
  useEffect(() => {
    if (initial) setForm({ ...initial });
  }, [initial]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Auto-detect category when description loses focus
  const handleDescriptionBlur = () => {
    if (!initial?.category) {                     // don't override on edit
      const cat = autoCategory(form.description);
      setForm((p) => ({ ...p, category: cat }));
      setAutoDetected(cat !== "other");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    onSubmit(form);
  };

  return (
    /* Backdrop */
    <div style={styles.backdrop} onClick={onClose}>
      <div
        style={styles.modal}
        className="card animate-fadeUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>{initial ? "Edit Expense" : "Add Expense"}</h3>
          <button className="btn btn-ghost" style={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Amount */}
          <div>
            <label className="label">Amount (₹)</label>
            <input
              className="input"
              type="number"
              name="amount"
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <input
              className="input"
              name="description"
              placeholder="e.g. Uber to office, Pizza with friends…"
              value={form.description}
              onChange={handleChange}
              onBlur={handleDescriptionBlur}
              required
            />
            {autoDetected && (
              <p style={styles.hint}>✨ Category auto-detected from description</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="label">Date</label>
            <input
              className="input"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              max={today}
              required
            />
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button type="button" className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex:2, justifyContent:"center" }}>
              {initial ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position:"fixed", inset:0,
    background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)",
    display:"flex", alignItems:"center", justifyContent:"center",
    zIndex:200, padding:16,
  },
  modal: { width:"100%", maxWidth:440, padding:28 },
  header: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 },
  title: { fontSize:18, fontWeight:700 },
  closeBtn: { padding:"6px 8px" },
  form: { display:"flex", flexDirection:"column", gap:16 },
  hint: { fontSize:12, color:"var(--accent)", marginTop:5 },
  actions: { display:"flex", gap:10, marginTop:4 },
};
