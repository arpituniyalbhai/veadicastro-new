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
    console.log('[Webhook] Razorpay webhook received');

    // Get Razorpay webhook secret
    const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
    
    if (!razorpayWebhookSecret) {
      console.error('[Webhook] Missing RAZORPAY_WEBHOOK_SECRET');
      return res.status(500).json({ error: 'Webhook configuration error' });
    }

    // Verify webhook signature
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const webhookBody = JSON.stringify(req.body);

    if (!webhookSignature) {
      console.error('[Webhook] Missing webhook signature');
      return res.status(400).json({ error: 'Invalid webhook: missing signature' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', razorpayWebhookSecret)
      .update(webhookBody)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      console.error('[Webhook] Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;
    const eventType = event.event;
    const eventPayload = event.payload;
    const subscription = eventPayload?.subscription?.entity;
    const payment = eventPayload?.payment?.entity;

    console.log('[Webhook] Event type:', eventType);
    console.log('[Webhook] Subscription ID:', subscription?.id);
    console.log('[Webhook] Payment ID:', payment?.id);

    // Handle subscription payment success (monthly renewal)
    if (eventType === 'subscription.activated' || eventType === 'subscription.charged') {
      const subscriptionId = subscription?.id;
      const paymentId = payment?.id;
      const amount = payment?.amount;
      const email = subscription?.notes?.email;

      if (!subscriptionId || !paymentId || !email) {
        console.error('[Webhook] Missing required fields in subscription event');
        return res.status(400).json({ error: 'Invalid subscription event data' });
      }

      console.log('[Webhook] Processing subscription renewal:', {
        subscriptionId,
        paymentId,
        email,
        amount,
      });

      try {
        const firestore = initializeFirebaseAdmin();

        // IDEMPOTENCY CHECK: Check if this payment has already been processed
        const paymentDoc = await firestore.collection('subscription_payments').doc(paymentId).get();
        if (paymentDoc.exists) {
          console.log('[Webhook] Payment already processed, skipping (idempotency):', paymentId);
          return res.status(200).json({ success: true, message: 'Payment already processed' });
        }

        const userDocRef = firestore.collection('users').doc(email);
        
        // Get current user data
        const userDoc = await userDocRef.get();
        if (!userDoc.exists) {
          console.error('[Webhook] User not found:', email);
          return res.status(404).json({ error: 'User not found' });
        }

        const existingUserData = userDoc.data();

        // Calculate next billing date (1 month from now)
        const subscriptionExpiresAt = new Date();
        subscriptionExpiresAt.setMonth(subscriptionExpiresAt.getMonth() + 1);

        // Update user with renewed credits
        await userDocRef.set({
          credits: 20, // Reset to 20 credits monthly (NOT increment)
          reportCredits: admin.firestore.FieldValue.increment(1), // Add 1 report credit
          subscriptionExpiresAt: admin.firestore.Timestamp.fromDate(subscriptionExpiresAt),
          subscriptionStatus: 'active',
          lastPaymentId: paymentId,
          lastPaymentAmount: amount,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          // Preserve all existing fields
          uid: existingUserData?.uid || email,
          email: existingUserData?.email || email,
          displayName: existingUserData?.displayName || null,
          planName: existingUserData?.planName || 'Premium Subscription',
          isPremium: true,
          subscriptionId: existingUserData?.subscriptionId || subscriptionId,
          autoRenew: true,
          subscriptionStartedAt: existingUserData?.subscriptionStartedAt || admin.firestore.FieldValue.serverTimestamp(),
          verificationStatus: existingUserData?.verificationStatus || 'verified',
          createdAt: existingUserData?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
          premiumSince: existingUserData?.premiumSince || admin.firestore.FieldValue.serverTimestamp(),
          purchasedReports: existingUserData?.purchasedReports || [],
          compatibilitycredits: existingUserData?.compatibilitycredits || 0,
          questionPacks: existingUserData?.questionPacks || {},
          questionsUsed: existingUserData?.questionsUsed || {},
          reportsUsed: existingUserData?.reportsUsed || {},
          unlimitedExpiry: existingUserData?.unlimitedExpiry || null,
        }, { merge: true });

        // Log renewal payment (this also serves as idempotency marker)
        await firestore.collection('subscription_payments').doc(paymentId).set({
          uid: email,
          subscriptionId: subscriptionId,
          planName: 'Premium Subscription',
          amount: amount,
          paymentId: paymentId,
          verificationStatus: 'verified',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          eventType: eventType,
          isRenewal: true,
        }, { merge: true });

        console.log('[Webhook] ✅ Monthly Renewal processed successfully:', {
          email,
          subscriptionId,
          paymentId,
          credits: 20,
          reportCredits: (existingUserData?.reportCredits || 0) + 1,
          expiresAt: subscriptionExpiresAt.toISOString(),
        });

        return res.status(200).json({ success: true, message: 'Subscription renewal processed' });

      } catch (firestoreError: any) {
        console.error('[Webhook] Firestore update failed:', firestoreError);
        return res.status(500).json({ error: 'Failed to process renewal' });
      }
    }

    // Handle subscription cancellation
    if (eventType === 'subscription.cancelled' || eventType === 'subscription.paused') {
      const subscriptionId = subscription?.id;
      const email = subscription?.notes?.email;

      if (!subscriptionId || !email) {
        console.error('[Webhook] Missing required fields in cancellation event');
        return res.status(400).json({ error: 'Invalid cancellation event data' });
      }

      console.log('[Webhook] Processing subscription cancellation:', {
        subscriptionId,
        email,
      });

      try {
        const firestore = initializeFirebaseAdmin();
        const userDocRef = firestore.collection('users').doc(email);
        
        // Update subscription status but keep premium active until expiry
        await userDocRef.set({
          subscriptionStatus: 'cancelled',
          autoRenew: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        console.log('[Webhook] ✅ Subscription cancellation processed:', {
          email,
          subscriptionId,
        });

        return res.status(200).json({ success: true, message: 'Subscription cancellation processed' });

      } catch (firestoreError: any) {
        console.error('[Webhook] Firestore update failed:', firestoreError);
        return res.status(500).json({ error: 'Failed to process cancellation' });
      }
    }

    // Handle failed renewal
    if (eventType === 'subscription.payment_failed' || eventType === 'subscription.halted') {
      const subscriptionId = subscription?.id;
      const email = subscription?.notes?.email;

      if (!subscriptionId || !email) {
        console.error('[Webhook] Missing required fields in failed renewal event');
        return res.status(400).json({ error: 'Invalid failed renewal event data' });
      }

      console.log('[Webhook] Processing failed renewal:', {
        subscriptionId,
        email,
        eventType,
      });

      try {
        const firestore = initializeFirebaseAdmin();
        const userDocRef = firestore.collection('users').doc(email);
        
        // Update subscription status to reflect failure
        await userDocRef.set({
          subscriptionStatus: eventType === 'subscription.halted' ? 'halted' : 'payment_failed',
          autoRenew: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        console.log('[Webhook] ✅ Failed renewal processed:', {
          email,
          subscriptionId,
          newStatus: eventType === 'subscription.halted' ? 'halted' : 'payment_failed',
        });

        return res.status(200).json({ success: true, message: 'Failed renewal processed' });

      } catch (firestoreError: any) {
        console.error('[Webhook] Firestore update failed:', firestoreError);
        return res.status(500).json({ error: 'Failed to process failed renewal' });
      }
    }

    // Handle subscription completed (all payments done)
    if (eventType === 'subscription.completed') {
      const subscriptionId = subscription?.id;
      const email = subscription?.notes?.email;

      if (!subscriptionId || !email) {
        console.error('[Webhook] Missing required fields in completed event');
        return res.status(400).json({ error: 'Invalid completed event data' });
      }

      console.log('[Webhook] Processing subscription completion:', {
        subscriptionId,
        email,
      });

      try {
        const firestore = initializeFirebaseAdmin();
        const userDocRef = firestore.collection('users').doc(email);
        
        // Mark subscription as completed
        await userDocRef.set({
          subscriptionStatus: 'completed',
          autoRenew: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        console.log('[Webhook] ✅ Subscription Completed:', {
          email,
          subscriptionId,
          timestamp: new Date().toISOString(),
        });

        return res.status(200).json({ success: true, message: 'Subscription completion processed' });

      } catch (firestoreError: any) {
        console.error('[Webhook] Firestore update failed:', firestoreError);
        return res.status(500).json({ error: 'Failed to process completion' });
      }
    }

    // Acknowledge other events without processing
    console.log('[Webhook] Event acknowledged (no processing needed):', eventType);
    return res.status(200).json({ success: true, message: 'Event acknowledged' });

  } catch (error: any) {
    console.error('[Webhook] Error processing webhook:', error);
    return res.status(500).json({ 
      error: error?.message || 'Webhook processing error' 
    });
  }
}
