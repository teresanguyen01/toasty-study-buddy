import { auth, db } from "./config";
import { collection, doc, getDoc } from "firebase/firestore";

export async function checkFirebaseStatus() {
  const status = {
    auth: false,
    firestore: false,
    error: null as string | null,
  };

  try {
    // Check Auth
    const currentUser = auth.currentUser;
    status.auth = true;
    console.log("Firebase Auth is working");

    // Check Firestore
    try {
      const testDoc = doc(db, "test", "test");
      await getDoc(testDoc);
      status.firestore = true;
      console.log("Firebase Firestore is working");
    } catch (firestoreError) {
      console.error("Firestore error:", firestoreError);
      status.error = `Firestore error: ${firestoreError}`;
    }
  } catch (error) {
    console.error("Firebase status check error:", error);
    status.error = `Firebase error: ${error}`;
  }

  return status;
}

export function getFirebaseConfig() {
  return {
    apiKey: "AIzaSyB5mcj3qNQi9InlIYruvNaDXx2V1Dw6NmY",
    authDomain: "toasty-study-buddy.firebaseapp.com",
    projectId: "toasty-study-buddy",
    storageBucket: "toasty-study-buddy.firebasestorage.app",
    messagingSenderId: "1086053877084",
    appId: "1:1086053877084:web:9fb11810834639dacbed99",
    measurementId: "G-KKQV3QTXL2",
  };
}
