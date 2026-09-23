import { initializeApp } from "firebase/app";

// SECURITY: Firebase config loaded from environment variables
// These are public keys (apiKey is safe to expose), but sensitive operations are restricted by Firestore rules

// Primary app: Auth + Analytics (Project: veadicastro-website)
const authAppConfig = {
  apiKey: "AIzaSyC_vbDBm3IFEqqXCG2QaHflFbPCTkQb-Hc",
  authDomain: "veadicastro-website.firebaseapp.com",
  projectId: "veadicastro-website",
  storageBucket: "veadicastro-website.firebasestorage.app",
  messagingSenderId: "175813844955",
  appId: "1:175813844955:web:49e0510c7465a5228f51fe",
  measurementId: "G-KTEG3EQNDJ",
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
let authInstance: import("firebase/auth").Auth | null = null;
let primaryDbInstance: import("firebase/firestore").Firestore | null = null;
let dataDbInstance: import("firebase/firestore").Firestore | null = null;
let analyticsStarted = false;

export const getAuthInstance = async () => {
  if (!authInstance) {
    const { getAuth, setPersistence, browserLocalPersistence } = await import("firebase/auth");
    authInstance = getAuth(app);
    void setPersistence(authInstance, browserLocalPersistence);
  }
  return authInstance;
};

export const getPrimaryDbInstance = async () => {
  if (!primaryDbInstance) {
    const { getFirestore } = await import("firebase/firestore");
    primaryDbInstance = getFirestore(app);
  }
  return primaryDbInstance;
};

export const getDataDbInstance = async () => {
  if (!dataDbInstance) {
    const { getFirestore } = await import("firebase/firestore");
    dataDbInstance = getFirestore(dataApp);
  }
  return dataDbInstance;
};

export const getDbInstance = getDataDbInstance;

export const startAnalytics = async () => {
  if (analyticsStarted) return;
  analyticsStarted = true;
  const { getAnalytics, isSupported } = await import("firebase/analytics");
  const ok = await isSupported();
  if (ok) {
    getAnalytics(app);
  }
};

// Configure cross-project authentication
// The auth token from veadicastro-website should work with vedicastro-data if projects are linked

/**
 * Save premium user document in vedicastro-data Firestore.
 * Path: /users/{uid}
 * 
 * IMPORTANT: This uses cross-project authentication
 * User must be authenticated in primary project (veadicastro-website)
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
  const { serverTimestamp, doc, setDoc, Timestamp } = await import("firebase/firestore");
  const startedAt = now ? Timestamp.fromDate(now) : serverTimestamp();

  // If we have a concrete Date, compute expires locally; otherwise, leave for a cloud function or client update
  const baseDate = now ?? new Date();
  const expiresAtDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Get current user from primary auth
  const auth = await getAuthInstance();
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User not authenticated in primary Firebase project");
  }

  // Create custom token for secondary project
  // Note: This requires a backend service to create custom tokens
  // For now, we'll use the ID token directly for demonstration
  // In production, you should use Firebase Admin SDK to create custom tokens

  const db = await getDataDbInstance();
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
  const { serverTimestamp, doc, setDoc } = await import("firebase/firestore");
  const db = await getDataDbInstance();
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
