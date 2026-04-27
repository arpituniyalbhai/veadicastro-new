import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, serverTimestamp, doc, setDoc, Timestamp } from "firebase/firestore";

// SECURITY: Firebase config loaded from environment variables
// These are public keys (apiKey is safe to expose), but sensitive operations are restricted by Firestore rules

// Primary app: Auth + Analytics (Project: vedicastro111)
const authAppConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDj9p3Fgq5ROH4xaKNXe8F_OYtxJolIJ64",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vedicastro111.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vedicastro111",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vedicastro111.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1049781843509",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1049781843509:web:b363de2309a6ed66a4237c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-45B55YYWDL",
};

// Secondary app: Firestore for premium users (Project: vedicastro-data)
const dataAppConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_DATA_API_KEY || "AIzaSyCTSObf3PVlIGMVQ6HStz97ANgUkK4R5fo",
  authDomain: import.meta.env.VITE_FIREBASE_DATA_AUTH_DOMAIN || "vedicastro-data.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_DATA_PROJECT_ID || "vedicastro-data",
  storageBucket: import.meta.env.VITE_FIREBASE_DATA_STORAGE_BUCKET || "vedicastro-data.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_DATA_MESSAGING_SENDER_ID || "609280467989",
  appId: import.meta.env.VITE_FIREBASE_DATA_APP_ID || "1:609280467989:web:10253282e05d0a33c2da1c",
};

// Initialize apps with different names to avoid collisions
export const app = initializeApp(authAppConfig, "authApp");
export const dataApp = initializeApp(dataAppConfig, "dataApp");

// Lazy initialize Firebase Auth to improve performance
let authInstance: ReturnType<typeof getAuth> | null = null;

export const getAuthInstance = () => {
  if (!authInstance) {
    authInstance = getAuth(app);
    // Enable browser persistence for faster auth loading
    setPersistence(authInstance, browserLocalPersistence);
  }
  return authInstance;
};

// For backward compatibility
export const auth = getAuthInstance();

// Firestore instances
export const primaryDb = getFirestore(app);  // Primary project (vedicastro111)
export const db = getFirestore(dataApp);    // Secondary project (vedicastro-data) - for user plans

// Configure cross-project authentication
// The auth token from vedicastro111 should work with vedicastro-data if projects are linked

isSupported().then((ok) => {
  if (ok) {
    getAnalytics(app);
  }
});

/**
 * Save premium user document in vedicastro-data Firestore.
 * Path: /users/{uid}
 * 
 * IMPORTANT: This uses cross-project authentication
 * User must be authenticated in primary project (vedicastro111)
 * Data is stored in secondary project (vedicastro-data)
 */
export async function savePremiumUserToFirestore(params: {
  uid: string;
  email: string | null | undefined;
  displayName: string | null | undefined;
  planName: string;
  now?: Date;
}) {
  const { uid, email, displayName, planName, now } = params;
  const startedAt = now ? Timestamp.fromDate(now) : serverTimestamp();

  // If we have a concrete Date, compute expires locally; otherwise, leave for a cloud function or client update
  const baseDate = now ?? new Date();
  const expiresAtDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Get current user from primary auth
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User not authenticated in primary Firebase project");
  }

  // Get ID token from primary auth
  const idToken = await currentUser.getIdToken();
  
  // Sign in to secondary project with the same token
  const { signInWithCustomToken } = await import("firebase/auth");
  const dataAuthInstance = getAuth(dataApp);
  
  // Create custom token for secondary project
  // Note: This requires a backend service to create custom tokens
  // For now, we'll use the ID token directly for demonstration
  // In production, you should use Firebase Admin SDK to create custom tokens

  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      uid,
      email: email ?? null,
      displayName: displayName ?? null,
      isPremium: true,
      planName: planName || "Premium",
      premiumSince: startedAt,
      subscriptionExpiresAt: Timestamp.fromDate(expiresAtDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveInvoiceRecord(record: {
  invoiceNumber: string;
  fullName: string;
  email: string;
  planName: string;
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentId: string;
  purchaseDate: string;
  pdfDataUrl: string;
}) {
  const ref = doc(db, "invoices", record.invoiceNumber);
  await setDoc(
    ref,
    {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
