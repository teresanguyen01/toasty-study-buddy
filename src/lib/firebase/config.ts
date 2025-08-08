import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB5mcj3qNQi9InlIYruvNaDXx2V1Dw6NmY",
  authDomain: "toasty-study-buddy.firebaseapp.com",
  projectId: "toasty-study-buddy",
  storageBucket: "toasty-study-buddy.firebasestorage.app",
  messagingSenderId: "1086053877084",
  appId: "1:1086053877084:web:9fb11810834639dacbed99",
  measurementId: "G-KKQV3QTXL2",
};

// Initialize Firebase
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (only in browser)
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

// Enable offline persistence for Firestore
if (typeof window !== "undefined") {
  // Enable offline persistence
  import("firebase/firestore").then(({ enableNetwork, disableNetwork }) => {
    // Enable offline persistence by default
    console.log("Firestore offline persistence enabled");
  });
}

export default app;
