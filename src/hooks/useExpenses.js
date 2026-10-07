// src/hooks/useExpenses.js
// ─────────────────────────────────────────────────────────────
// CRUD operations for the "expenses" Firestore collection.
// All queries are scoped to the authenticated user.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";
import { autoCategory } from "../utils/categorize";

export function useExpenses() {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading]   = useState(true);

  // ── Real-time listener ────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "expenses"),
      where("user_id", "==", currentUser.uid),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setExpenses(docs);
      setLoading(false);
    });

    return unsub;
  }, [currentUser]);

  // ── Add expense ───────────────────────────────────────────
  async function addExpense({ amount, description, category, date }) {
    // Auto-detect category if not manually set
    const resolvedCategory = category || autoCategory(description);
    return addDoc(collection(db, "expenses"), {
      user_id:     currentUser.uid,
      amount:      parseFloat(amount),
      description: description.trim(),
      category:    resolvedCategory,
      date:        date || new Date().toISOString().split("T")[0],
      createdAt:   new Date().toISOString(),
    });
  }

  // ── Update expense ────────────────────────────────────────
  async function updateExpense(id, data) {
    const ref = doc(db, "expenses", id);
    return updateDoc(ref, {
      ...data,
      amount: parseFloat(data.amount),
      updatedAt: new Date().toISOString(),
    });
  }

  // ── Delete expense ────────────────────────────────────────
  async function deleteExpense(id) {
    return deleteDoc(doc(db, "expenses", id));
  }

  return { expenses, loading, addExpense, updateExpense, deleteExpense };
}
