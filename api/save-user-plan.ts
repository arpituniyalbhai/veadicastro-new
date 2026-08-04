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
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_DATA_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });

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

    const { uid, email, displayName, planName, paymentId, amount } = req.body;

    // Use email as primary identifier, uid as fallback
    const primaryId = email || uid;

    if (!primaryId || !planName) {
      return res.status(400).json({ error: 'Missing fields: email/uid, planName' });
    }

    const validPlans = ['Quick Ask', 'Deep Dive', 'The Power Pack', 'Day Pass', 'Free', 'Standard', 'Premium', 'Quick Pack'];
    if (!validPlans.includes(planName)) {
      return res.status(400).json({ error: `Invalid plan: ${planName}` });
    }

    // First, check if user already exists and get their current data
    const userDoc = await firestore.collection('users').doc(primaryId).get();
    let existingUserData = null;
    
    if (userDoc.exists) {
      existingUserData = userDoc.data();
      console.log('Existing user data found:', existingUserData);
    }

    // Calculate expiry based on plan type
    const expiresAt = new Date();
    let unlimitedExpiry = null;
    
    if (planName === 'Quick Ask') {
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    } else if (planName === 'Deep Dive') {
      expiresAt.setDate(expiresAt.getDate() + 60); // 60 days
    } else if (planName === 'The Power Pack') {
      expiresAt.setMonth(expiresAt.getMonth() + 6); // 6 months
    } else if (planName === 'Day Pass') {
      // Set unlimited expiry to 11:59:59 PM IST of current day
      const istTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      unlimitedExpiry = new Date(istTime);
      unlimitedExpiry.setHours(23, 59, 59, 999); // 11:59:59 PM IST
      
      // Convert to UTC for storage
      const utcExpiry = new Date(unlimitedExpiry.toLocaleString("en-US", { timeZone: "UTC" }));
      unlimitedExpiry = utcExpiry;
      
      expiresAt.setDate(expiresAt.getDate() + 1); // Minimal expiry for record
      console.log("Day Pass expiry set to IST 11:59:59 PM (UTC:", unlimitedExpiry.toISOString(), ")");
    } else {
      expiresAt.setDate(expiresAt.getDate() + 30); // Default 30 days for other plans
    }

    // USER PLAN SAVE - Update existing user or create new
    const userPlanData = {
      uid: primaryId,
      email: email || primaryId, // Use email as primary
      displayName: displayName || existingUserData?.displayName || email?.split('@')[0] || null,
      planName,
      isPremium: !['Free', 'Quick Ask', 'Deep Dive', 'The Power Pack', 'Day Pass'].includes(planName),
      premiumSince: !['Free', 'Quick Ask', 'Deep Dive', 'The Power Pack', 'Day Pass'].includes(planName) ? admin.firestore.FieldValue.serverTimestamp() : existingUserData?.premiumSince || null,
      subscriptionExpiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      unlimitedExpiry: unlimitedExpiry ? admin.firestore.Timestamp.fromDate(unlimitedExpiry) : null,
      // Add credits based on plan
      credits: planName === 'Quick Ask' ? 5 : 
               planName === 'Deep Dive' ? 15 : 
               planName === 'The Power Pack' ? 24 : 
               planName === 'Day Pass' ? 999 : // Unlimited represented as 999
               planName === 'Premium' ? 30 :
               (existingUserData?.credits || 0), // Preserve existing credits for other plans
      reportCredits: existingUserData?.reportCredits || 0, // No free reports
      lastPaymentId: paymentId || null,
      lastPaymentAmount: amount || null,
      // Initialize question pack data
      questionPacks: existingUserData?.questionPacks || {},
      // Preserve existing usage data
      questionsUsed: existingUserData?.questionsUsed || {},
      reportsUsed: existingUserData?.reportsUsed || {},
      purchasedReports: existingUserData?.purchasedReports || [],
      createdAt: existingUserData?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await firestore.collection('users').doc(primaryId).set(userPlanData, { merge: true });

    // PAYMENT LOG
    if (paymentId) {
      await firestore.collection('payments').doc(paymentId).set(
        {
          uid,
          planName,
          amount,
          paymentId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'User plan saved successfully',
      planName,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error saving plan:', error);
    return res.status(500).json({
      error: error?.message || 'Unable to save user plan',
    });
  }
}
