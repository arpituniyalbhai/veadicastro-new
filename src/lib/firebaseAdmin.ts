import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  try {
    // Initialize Firebase Admin SDK
    const serviceAccount = {
      projectId: process.env.FIREBASE_DATA_PROJECT_ID || "vedicastro111",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.projectId,
      storageBucket: `${serviceAccount.projectId}.firebasestorage.app`,
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// Export Firestore and Auth instances
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = getStorage();
