import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Use explicit cast to avoid TS errors when vite types are not detected
const env = (import.meta as any).env;

const firebaseConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY || "AIzaSyCI-TotJ-fit_NvSLijVq5IA6vf_BiKN_I",
  authDomain: "improvement-hub.firebaseapp.com",
  projectId: "improvement-hub",
  storageBucket: "improvement-hub.firebasestorage.app",
  messagingSenderId: "959158397000",
  appId: env?.VITE_FIREBASE_APP_ID || "1:959158397000:web:f319ef603d7d5b7845107d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// FORCE PERSISTENCE: This ensures users stay logged in even if the app reloads or is redeployed.
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth Persistence Error:", error);
});

export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;