// src/hooks/useAuth.js
// ─────────────────────────────────────────────────────────────
// React context + hook for Firebase authentication.
// Provides: currentUser, login, signup, logout helpers.
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "../firebase";

const AuthContext = createContext(null);

function ensureFirebaseReady() {
  if (!isFirebaseConfigured || !auth || !db) {
    return Promise.reject(
      new Error("Firebase is not configured. Add your Firebase values to the .env file and restart the app.")
    );
  }
  return Promise.resolve();
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Sign up ────────────────────────────────────────────────
  async function signup(email, password, name) {
    await ensureFirebaseReady();
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });

    await setDoc(doc(db, "users", user.uid), {
      user_id: user.uid,
      name,
      email,
      budget: 0,
      createdAt: new Date().toISOString(),
    });
    return user;
  }

  // ── Sign in ────────────────────────────────────────────────
  async function login(email, password) {
    await ensureFirebaseReady();
    return signInWithEmailAndPassword(auth, email, password);
  }

  // ── Sign out ───────────────────────────────────────────────
  function logout() {
    if (!auth) return Promise.resolve();
    return signOut(auth);
  }

  // ── Fetch user profile from Firestore ─────────────────────
  async function getUserProfile(uid) {
    if (!db || !uid) return null;
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  }

  // ── Listen to auth state changes ──────────────────────────
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setCurrentUser(null);
      setLoading(false);
      return undefined;
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = { currentUser, login, signup, logout, getUserProfile, isFirebaseConfigured };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/** Consume auth context anywhere in the tree */
export function useAuth() {
  return useContext(AuthContext);
}
