// src/firebase.js
// ─────────────────────────────────────────────────────────────
// Firebase initialization with env-based config.
// If values are missing, the app keeps running and shows a clear
// configuration warning instead of failing with a broken API key.
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.warn(
    "Firebase is not configured yet. Add REACT_APP_FIREBASE_* values to your .env file and restart the app."
  );
}

export { app, auth, db };
