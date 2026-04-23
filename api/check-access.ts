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
    const { email, action, type } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    const userDocRef = firestore.collection('users').doc(email);

    if (action === 'check') {
      // Check access without deducting
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      const credits = userData.credits || 2;
      const unlimitedExpiry = userData.unlimitedExpiry?.toDate();
      const purchasedReports = userData.purchasedReports || [];
      const reportCredits = userData.reportCredits || 0;
      const compatibilityCredits = userData.compatibilitycredits || 0;

      // Priority check
      let hasAccess = false;
      if (unlimitedExpiry && new Date() < unlimitedExpiry) {
        hasAccess = true; // Day Pass active
      } else if (credits > 0) {
        hasAccess = true; // Has credits
      }

      return res.status(200).json({
        hasAccess,
        credits,
        unlimitedExpiry: unlimitedExpiry?.toISOString() || null,
        purchasedReports,
        reportCredits,
        compatibilityCredits,
      });

    } else if (action === 'deduct') {
      // Atomic credit deduction using transaction
      const result = await firestore.runTransaction(async (transaction: any) => {
        const userDoc = await transaction.get(userDocRef);
        
        if (!userDoc.exists) {
          // Auto-create user document if not found
          console.log('Auto-creating user document for:', email);
          transaction.create(userDocRef, {
            email: email,
            planName: "Free",
            credits: 2,
            reportCredits: 0,
            compatibilitycredits: 0,
            purchasedReports: [],
            unlimitedExpiry: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          
          // Return appropriate response based on action type
          if (type === 'report') {
            return {
              deducted: false,
              credits: 2,
              reportCredits: 0,
              compatibilityCredits: 0,
              reason: 'no_report_credits'
            };
          } else if (type === 'compatibility') {
            return {
              deducted: false,
              credits: 2,
              reportCredits: 0,
              compatibilityCredits: 0,
              reason: 'no_compatibility_credits'
            };
          } else {
            return {
              deducted: false,
              credits: 2,
              reportCredits: 0,
              compatibilityCredits: 0,
              reason: 'new_user_created'
            };
          }
        }

        const userData = userDoc.data();
        const credits = userData.credits || 2;
        const reportCredits = userData.reportCredits || 0;
        const compatibilityCredits = userData.compatibilitycredits || 0;
        const unlimitedExpiry = userData.unlimitedExpiry?.toDate();

        // Check if this is a report deduction
        if (type === 'report') {
          // Handle report credit deduction
          if (reportCredits <= 0) {
            // No report credits available
            return {
              deducted: false,
              credits: credits,
              reportCredits: 0,
              compatibilityCredits: compatibilityCredits,
              reason: 'no_report_credits'
            };
          }

          // Deduct one report credit atomically
          const newReportCredits = reportCredits - 1;
          transaction.update(userDocRef, {
            reportCredits: newReportCredits,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          return {
            deducted: true,
            credits: credits,
            reportCredits: newReportCredits,
            compatibilityCredits: compatibilityCredits,
            reason: 'report_deducted'
          };
        }

        // Check if this is a compatibility deduction
        if (type === 'compatibility') {
          // Handle compatibility credit deduction
          if (compatibilityCredits <= 0) {
            // No compatibility credits available
            return {
              deducted: false,
              credits: credits,
              reportCredits: reportCredits,
              compatibilityCredits: 0,
              reason: 'no_compatibility_credits'
            };
          }

          // Deduct one compatibility credit atomically
          const newCompatibilityCredits = compatibilityCredits - 1;
          transaction.update(userDocRef, {
            compatibilitycredits: newCompatibilityCredits,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          return {
            deducted: true,
            credits: credits,
            reportCredits: reportCredits,
            compatibilityCredits: newCompatibilityCredits,
            reason: 'compatibility_deducted'
          };
        }

        // Handle question credit deduction (existing logic)
        if (unlimitedExpiry && new Date() < unlimitedExpiry) {
          // Day Pass active - no deduction needed
          return {
            deducted: false,
            credits: credits,
            reportCredits: reportCredits,
            compatibilityCredits: compatibilityCredits,
            reason: 'unlimited'
          };
        }

        if (credits <= 0) {
          // No credits available
          return {
            deducted: false,
            credits: 0,
            reportCredits: reportCredits,
            compatibilityCredits: compatibilityCredits,
            reason: 'no_credits'
          };
        }

        // Deduct one credit atomically
        const newCredits = credits - 1;
        transaction.update(userDocRef, {
          credits: newCredits,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          deducted: true,
          credits: newCredits,
          reportCredits: reportCredits,
          compatibilityCredits: compatibilityCredits,
          reason: 'deducted'
        };
      });

      return res.status(200).json(result);

    } else {
      return res.status(400).json({ error: 'Invalid action. Use "check" or "deduct"' });
    }

  } catch (error: any) {
    console.error('Error in check-access:', error);
    return res.status(500).json({
      error: error?.message || 'Unable to process access request',
    });
  }
}