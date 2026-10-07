// src/hooks/useBudget.js
// ─────────────────────────────────────────────────────────────
// Read / write the monthly budget limit stored on the user doc.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";

export function useBudget() {
  const { currentUser } = useAuth();
  const [budget, setBudget] = useState(0);

  // ── Listen to budget field on user document ───────────────
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
      if (snap.exists()) setBudget(snap.data().budget ?? 0);
    });
    return unsub;
  }, [currentUser]);

  // ── Persist updated budget ────────────────────────────────
  async function saveBudget(amount) {
    await updateDoc(doc(db, "users", currentUser.uid), {
      budget: parseFloat(amount) || 0,
    });
  }

  return { budget, saveBudget };
}
