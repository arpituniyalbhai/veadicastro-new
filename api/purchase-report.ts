export const runtime = 'edge';

import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

// INIT FIREBASE ADMIN
let db: any;

function initializeFirebaseAdmin() {
  // Check if already initialized
  if (db) {
    return db;
  }

  if (
    !process.env.FIREBASE_DATA_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    throw new Error(
      'Missing Firebase Admin ENV: FIREBASE_DATA_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    );
  }

  // Initialize Firebase Admin SDK
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_DATA_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }

  db = admin.firestore();
  return db;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const firestore = initializeFirebaseAdmin();
    const { email, reportId, action } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    const userDoc = await firestore.collection('users').doc(email).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    if (action === 'purchase') {
      // Purchase a report credit for ₹299
      const newReportCredits = (userData.reportCredits || 0) + 1;
      
      await firestore.collection('users').doc(email).update({
        reportCredits: newReportCredits,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        success: true,
        reportCredits: newReportCredits,
        message: 'Report credit purchased successfully'
      });

    } else if (action === 'use') {
      // Use a report credit
      if ((userData.reportCredits || 0) <= 0) {
        return res.status(400).json({ error: 'No report credits available' });
      }

      const newReportCredits = (userData.reportCredits || 0) - 1;
      const purchasedReports = userData.purchasedReports || [];
      purchasedReports.push(reportId);

      await firestore.collection('users').doc(email).update({
        reportCredits: newReportCredits,
        purchasedReports: purchasedReports,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({
        success: true,
        reportCredits: newReportCredits,
        reportId,
        message: 'Report credit used successfully'
      });

    } else {
      return res.status(400).json({ error: 'Invalid action. Use "purchase" or "use"' });
    }

  } catch (error: any) {
    console.error('Error in purchase-report:', error);
    return res.status(500).json({
      error: error?.message || 'Unable to process report request',
    });
  }
}
