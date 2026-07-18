export const runtime = 'edge';

import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
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

  // Initialize Firebase Admin SDK (only if not already initialized)
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
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log incoming request for debugging
    console.log('[Verify Subscription] Request received:', {
      hasSubscriptionId: !!req.body.razorpay_subscription_id,
      hasPaymentId: !!req.body.razorpay_payment_id,
      hasSignature: !!req.body.razorpay_signature,
      hasEmail: !!req.body.email,
      allKeys: Object.keys(req.body),
    });

    const { 
      razorpay_subscription_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      email,
      displayName,
    } = req.body;

    // Validate all required fields
    const missingFields: string[] = [];
    if (!razorpay_subscription_id) missingFields.push('razorpay_subscription_id');
    if (!razorpay_payment_id) missingFields.push('razorpay_payment_id');
    if (!razorpay_signature) missingFields.push('razorpay_signature');
    if (!email) missingFields.push('email');

    if (missingFields.length > 0) {
      console.error('[Verify Subscription] Missing required fields:', missingFields);
      return res.status(400).json({ 
        error: 'Missing required fields',
        missingFields,
      });
    }

    // Get Razorpay credentials
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.trim();
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(500).json({ 
        error: 'Subscription verification configuration error',
        details: 'Razorpay credentials not found'
      });
    }

    // Verify signature
    const text = `${razorpay_payment_id}|${razorpay_signature}`;
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(text)
      .digest('hex');

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error('[Verify Subscription] Invalid subscription signature', {
        subscriptionId: razorpay_subscription_id,
        paymentId: razorpay_payment_id,
        expectedSignature: generatedSignature.substring(0, 20) + '...',
        receivedSignature: razorpay_signature.substring(0, 20) + '...',
      });
      
      return res.status(400).json({ 
        error: 'Subscription verification failed. Invalid signature.' 
      });
    }

    // Fetch subscription details from Razorpay
    const authString = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
    const subscriptionResponse = await fetch(`https://api.razorpay.com/v1/subscriptions/${razorpay_subscription_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
      },
    });

    if (!subscriptionResponse.ok) {
      console.error('[Verify Subscription] Failed to fetch subscription details');
      return res.status(400).json({ 
        error: 'Unable to verify subscription details',
        details: 'Subscription not found or invalid'
      });
    }

    const subscriptionData = await subscriptionResponse.json();
    
    console.log('[Verify Subscription] Subscription details fetched:', {
      subscriptionId: razorpay_subscription_id,
      status: subscriptionData.status,
      planId: subscriptionData.plan_id,
    });

    // SECURITY CHECK: Verify subscription belongs to the authenticated user
    const subscriptionEmail = subscriptionData.notes?.email;
    if (subscriptionEmail && subscriptionEmail !== email) {
      console.error('[Verify Subscription] Security violation: Subscription email does not match user email', {
        subscriptionEmail,
        userEmail: email,
        subscriptionId: razorpay_subscription_id,
      });
      return res.status(403).json({ 
        error: 'Subscription does not belong to this user',
        details: 'Security verification failed'
      });
    }

    // Verify subscription is active
    if (subscriptionData.status !== 'active' && subscriptionData.status !== 'created') {
      console.error('[Verify Subscription] Subscription not active:', subscriptionData.status);
      return res.status(400).json({ 
        error: 'Subscription is not active',
        status: subscriptionData.status
      });
    }

    // Calculate next billing date (subscription renews monthly)
    const startedAt = new Date();
    const subscriptionExpiresAt = new Date();
    subscriptionExpiresAt.setMonth(subscriptionExpiresAt.getMonth() + 1);

    // Update Firestore with subscription details
    let firestoreUpdated = false;
    
    try {
      const firestore = initializeFirebaseAdmin();
      const userDocRef = firestore.collection('users').doc(email);
      
      // Get current user data to preserve existing fields
      const userDoc = await userDocRef.get();
      const existingUserData = userDoc.exists ? userDoc.data() : {};
      
      // Update user document with subscription details
      await userDocRef.set({
        uid: email,
        email: email || null,
        displayName: displayName || existingUserData?.displayName || null,
        planName: 'Premium Subscription',
        isPremium: true,
        credits: 20, // Monthly credit allocation
        reportCredits: (existingUserData?.reportCredits || 0) + 1, // Add 1 report credit
        subscriptionId: razorpay_subscription_id,
        subscriptionStatus: 'active',
        autoRenew: true,
        subscriptionStartedAt: admin.firestore.FieldValue.serverTimestamp(),
        subscriptionExpiresAt: admin.firestore.Timestamp.fromDate(subscriptionExpiresAt),
        lastPaymentId: razorpay_payment_id,
        lastPaymentAmount: subscriptionData.amount,
        verificationStatus: 'verified',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // CRITICAL: Preserve all existing fields
        createdAt: existingUserData?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        premiumSince: existingUserData?.premiumSince || admin.firestore.FieldValue.serverTimestamp(),
        purchasedReports: existingUserData?.purchasedReports || [],
        compatibilitycredits: existingUserData?.compatibilitycredits || 0,
        questionPacks: existingUserData?.questionPacks || {},
        questionsUsed: existingUserData?.questionsUsed || {},
        reportsUsed: existingUserData?.reportsUsed || {},
        unlimitedExpiry: existingUserData?.unlimitedExpiry || null,
      }, { merge: true });

      // Log subscription payment
      await firestore.collection('subscription_payments').doc(razorpay_payment_id).set(
        {
          uid: email,
          subscriptionId: razorpay_subscription_id,
          planName: 'Premium Subscription',
          amount: subscriptionData.amount,
          paymentId: razorpay_payment_id,
          verificationStatus: 'verified',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          billingCycle: 1, // First payment
        },
        { merge: true }
      );

      firestoreUpdated = true;
      
      console.log('[Verify Subscription] ✅ Subscription Activated:', {
        email,
        subscriptionId: razorpay_subscription_id,
        paymentId: razorpay_payment_id,
        credits: 20,
        reportCredits: (existingUserData?.reportCredits || 0) + 1,
        expiresAt: subscriptionExpiresAt.toISOString(),
        timestamp: new Date().toISOString(),
      });

    } catch (firestoreError: any) {
      console.error('[Verify Subscription] Firestore update failed:', firestoreError);
      // Don't fail the verification if Firestore update fails
      // Subscription is already active, we can retry Firestore update later
    }

    // Subscription verified successfully
    return res.status(200).json({
      success: true,
      verified: true,
      subscriptionId: razorpay_subscription_id,
      paymentId: razorpay_payment_id,
      planName: 'Premium Subscription',
      amount: subscriptionData.amount,
      firestoreUpdated,
      subscriptionExpiresAt: subscriptionExpiresAt.toISOString(),
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[Verify Subscription] Error verifying subscription:', error);
    console.error('[Verify Subscription] Error stack:', error?.stack);
    return res.status(500).json({ 
      error: error?.message || 'Subscription verification error',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
}
