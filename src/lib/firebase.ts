// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCmDb1OqYYmhEwFkfuGsn7uq_2PpQxOIUU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "login-bbm-tracker-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "login-bbm-tracker-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "login-bbm-tracker-app.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "52863244882",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:52863244882:web:bbd9a752d489bb5bf09d8b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
