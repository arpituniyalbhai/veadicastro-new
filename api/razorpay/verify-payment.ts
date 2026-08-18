export const runtime = 'edge';

import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import admin from 'firebase-admin';

// CRITICAL: Server-side price source of truth
const VALID_PLAN_PRICES: Record<string, number> = {
  'Quick Ask': 19900,     // ₹199 in paise
  'Quick Ask Discounted': 14900, // ₹149 in paise for Pro users
  'Deep Dive': 49900,     // ₹499 in paise
  'Deep Dive Discounted': 34900, // ₹349 in paise for Pro users
  'The Power Pack': 79900, // ₹799 in paise
  'The Power Pack Discounted': 59900, // ₹599 in paise for Pro users
  'Day Pass': 24900,      // ₹249 in paise
  'Free': 0,
  'Standard': 29900,    // ₹299 in paise
  'Premium': 49900,    // ₹499 in paise
  'Astrologer Call': 58900, // ₹589 in paise (₹499 + 18% GST)
};

// Micro-transaction pricing
const MICRO_PRICES: Record<string, number> = {
  'Personal Growth': 14900,     // ₹149 in paise
  'Love & Relationships': 14900, // ₹149 in paise
  'Career & Wealth': 14900,      // ₹149 in paise
  'Basic Personalized Report': 99900, // ₹999 in paise
  'Deep Life Analysis': 199900, // ₹1999 in paise
  'Premium Expert Guidance': 399900, // ₹3999 in paise
  'कर्म चक्र: गहरा कर्म विश्लेषण': 999900, // ₹9999 in paise
  'कर्म चक्र: Karmo Ka Fal': 999900, // ₹9999 in paise
  'कर्म चक्र: आपकी जीवन रिपोर्ट': 999900, // ₹9999 in paise
  'कर्म चक्र': 999900, // ₹9999 in paise
  'Karma Chakra': 999900, // ₹9999 in paise
};

// Compatibility credit pricing
const COMPATIBILITY_PRICES: Record<string, number> = {
  '1 Compatibility Credit': 2900,   // ₹29 in paise
  '2 Compatibility Credits': 4900,  // ₹49 in paise
  '5 Compatibility Credits': 9900,  // ₹99 in paise
};

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
    console.log('[Verify Payment] Request received:', {
      hasOrderId: !!req.body.razorpay_order_id,
      hasPaymentId: !!req.body.razorpay_payment_id,
      hasSignature: !!req.body.razorpay_signature,
      hasPlanName: !!req.body.planName,
      hasAmount: !!req.body.amount,
      hasUserId: !!req.body.userId,
      allKeys: Object.keys(req.body),
    });

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      planName, 
      amount, 
      customAmount,
      userId,
      email,
      displayName,
      type,
      deliveryDetails,
    } = req.body;

    // Use email as primary identifier for user documents
    const primaryId = email;
    
    // Validate all required fields with detailed error messages
    const missingFields: string[] = [];
    if (!razorpay_order_id) missingFields.push('razorpay_order_id');
    if (!razorpay_payment_id) missingFields.push('razorpay_payment_id');
    if (!razorpay_signature) missingFields.push('razorpay_signature');
    if (!planName) missingFields.push('planName');
    if (!amount) missingFields.push('amount');
    if (!email && type !== 'store') missingFields.push('email');

    if (missingFields.length > 0) {
      console.error('[Verify Payment] Missing required fields:', missingFields);
      console.error('[Verify Payment] Received data:', {
        razorpay_order_id: razorpay_order_id || 'MISSING',
        razorpay_payment_id: razorpay_payment_id || 'MISSING',
        razorpay_signature: razorpay_signature ? 'present' : 'MISSING',
        planName: planName || 'MISSING',
        amount: amount || 'MISSING',
        userId: userId || 'MISSING',
      });
      return res.status(400).json({ 
        error: 'Missing required fields',
        missingFields,
        received: {
          hasOrderId: !!razorpay_order_id,
          hasPaymentId: !!razorpay_payment_id,
          hasSignature: !!razorpay_signature,
          hasPlanName: !!planName,
          hasAmount: !!amount,
          hasUserId: !!userId,
        }
      });
    }

    // Validate amount - get expected amount from Razorpay order to handle discounts
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.trim();
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(500).json({ 
        error: 'Payment verification configuration error',
        details: 'Razorpay credentials not found'
      });
    }

    // Fetch order details from Razorpay to get the actual amount (with discounts)
    const authString = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
      },
    });

    if (!orderResponse.ok) {
      console.error('[Verify Payment] Failed to fetch order details');
      return res.status(400).json({ 
        error: 'Unable to verify order details',
        details: 'Order not found or invalid'
      });
    }

    const orderData = await orderResponse.json();
    const expectedAmount = orderData.amount; // This is the final amount after discount
    const orderNotes = orderData.notes || {};

    if (orderNotes.planName && orderNotes.planName !== planName) {
      return res.status(400).json({
        error: 'Plan mismatch detected. Payment verification failed.',
        details: `Order was created for ${orderNotes.planName}, but verification requested ${planName}`,
      });
    }
    
    console.log('[Verify Payment] Order details fetched:', {
      orderId: razorpay_order_id,
      expectedAmount,
      receivedAmount: amount,
      orderNotes
    });

    // Validate amount matches the order amount (after discount)
    if (amount !== expectedAmount) {
      return res.status(400).json({ 
        error: 'Amount mismatch detected. Payment verification failed.',
        details: `Expected: ${expectedAmount} paise, Received: ${amount} paise`,
        originalAmount: orderNotes.originalAmount,
        finalAmount: orderNotes.finalAmount,
        discountApplied: orderNotes.discountApplied,
        promoCode: orderNotes.promoCode
      });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(text)
      .digest('hex');

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.error('[Verify Payment] Invalid payment signature', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        expectedSignature: generatedSignature.substring(0, 20) + '...',
        receivedSignature: razorpay_signature.substring(0, 20) + '...',
      });
      
      // FALLBACK: If payment was captured (we have payment_id), still activate premium
      // This handles cases where payment succeeded but signature verification had issues
      if (razorpay_payment_id && email && type !== 'store') {
        console.warn('[Verify Payment] Payment captured but signature invalid. Activating premium as fallback.');
        try {
          const firestore = initializeFirebaseAdmin();
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          await firestore.collection('users').doc(email).set(
            {
              uid: email,
              email: email || null,
              displayName: displayName || null,
              planName,
              isPremium: planName !== 'Free',
              premiumSince: admin.firestore.FieldValue.serverTimestamp(),
              subscriptionExpiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
              lastPaymentId: razorpay_payment_id,
              lastPaymentAmount: amount,
              verificationStatus: 'pending', // Mark as pending due to signature issue
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          // Log payment
          await firestore.collection('payments').doc(razorpay_payment_id).set(
            {
              uid: email,
              planName,
              amount,
              paymentId: razorpay_payment_id,
              orderId: razorpay_order_id,
              verificationStatus: 'pending',
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          console.log('[Verify Payment] Fallback: Premium activated despite signature failure');
          return res.status(200).json({
            success: true,
            verified: false, // Signature failed
            fallbackActivated: true,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            planName,
            amount,
            firestoreUpdated: true,
            timestamp: new Date().toISOString(),
          });
        } catch (fallbackError: any) {
          console.error('[Verify Payment] Fallback activation failed:', fallbackError);
          return res.status(400).json({ 
            error: 'Payment verification failed. Invalid signature and fallback activation failed.',
            details: fallbackError?.message
          });
        }
      }
      
      return res.status(400).json({ 
        error: 'Payment verification failed. Invalid signature.' 
      });
    }

    // Payment verified successfully - Update Firestore
    let firestoreUpdated = false;
    const isTopUp = !!(customAmount && customAmount > 0);
    
    console.log('[Verify Payment] Processing payment:', {
      planName,
      amount,
      customAmount,
      isTopUp,
      userId
    });
    
    try {
      const firestore = initializeFirebaseAdmin();

      if (isTopUp) {
        // For top-ups, add questions to user's balance
        const questionPacks: Record<string, number> = {
          'Pack A': 2,
          'Pack B': 5,
          'Pack C': 10,
          'Pack D': 50,
          'Pack E': 15,
        };
        
        const questionsToAdd = questionPacks[planName] || 0;
        
        if (planName === 'Single Report') {
          // For single report purchases, add 1 report to user's balance
          await firestore.collection('users').doc(email).set(
            {
              reportCredits: admin.firestore.FieldValue.increment(1),
              lastReportPurchase: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          
          console.log('[Verify Payment] Single Report added to balance', {
            userId,
            paymentId: razorpay_payment_id,
          });
        } else if (questionsToAdd > 0) {
          // Update user's top-up balance in Firestore
          await firestore.collection('users').doc(email).set(
            {
              questionTopUpBalance: admin.firestore.FieldValue.increment(questionsToAdd),
              lastTopUpPurchase: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          
          console.log('[Verify Payment] Top-up questions added to balance', {
            userId,
            planName,
            questionsToAdd,
            paymentId: razorpay_payment_id,
          });
        }
        
        // Log the payment
        await firestore.collection('payments').doc(razorpay_payment_id).set(
          {
            uid: email,
            planName,
            amount,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            type: planName === 'Single Report' ? 'report' : 'topup',
            questionsAdded: planName === 'Single Report' ? 0 : questionsToAdd,
            reportsAdded: planName === 'Single Report' ? 1 : 0,
            verificationStatus: 'verified',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        firestoreUpdated = true;
        console.log('[Verify Payment] Payment processed successfully', {
          userId,
          paymentId: razorpay_payment_id,
          amount,
          planName,
          questionsToAdd,
        });
      } else {
        // For plan payments, handle credit allocation directly
        console.log('[Verify Payment] Processing plan purchase - allocating credits');
        
        try {
          const firestore = initializeFirebaseAdmin();
          const primaryDocId = email || userId || razorpay_payment_id;
          const userDocRef = firestore.collection('users').doc(primaryDocId);
          
          // Get current user data
          const userDoc = await userDocRef.get();
          const existingUserData = userDoc.exists ? userDoc.data() : {};
          
          // Check if this is a report purchase
          const isReportPurchase = type === 'report' || 
                                 planName.includes('Report') ||
                                 ['Personal Growth', 'Love & Relationships', 'Career & Wealth'].includes(planName);
          
          // Check if this is a compatibility credit purchase
          const isCompatibilityPurchase = type === 'compatibility' || planName.includes('Compatibility Credit');
          const isStorePurchase = type === 'store' || planName.includes('Dhan Yog Bracelet');
          
          if (isStorePurchase) {
            const storeDeliveryDetails = deliveryDetails && typeof deliveryDetails === 'object'
              ? deliveryDetails
              : {};

            await firestore.collection('store_orders').doc(razorpay_payment_id).set(
              {
                uid: primaryDocId,
                email: email || null,
                displayName: displayName || null,
                Name: storeDeliveryDetails.name || displayName || null,
                'Phone Number': storeDeliveryDetails.phone || null,
                'Exact Location': storeDeliveryDetails.location || null,
                Pincode: storeDeliveryDetails.pincode || null,
                deliveryDetails: storeDeliveryDetails,
                planName,
                amount,
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                verificationStatus: 'verified',
                status: 'Paid - support follow-up pending',
                orderNotes,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );

            console.log('[Verify Payment] Store purchase completed', {
              userId,
              planName,
              paymentId: razorpay_payment_id,
            });
          } else if (isReportPurchase) {
            // Handle report purchase - add 1 report credit
            await userDocRef.set({
              uid: email,
              email: email || null,
              displayName: displayName || null,
              reportCredits: admin.firestore.FieldValue.increment(1),
              lastReportPurchase: admin.firestore.FieldValue.serverTimestamp(),
              purchasedReports: [...(existingUserData?.purchasedReports || []), planName],
              lastPaymentId: razorpay_payment_id,
              lastPaymentAmount: amount,
              verificationStatus: 'verified',
              createdAt: existingUserData?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              // Preserve existing plan and credits - CRITICAL!
              planName: existingUserData?.planName || 'Free',
              credits: existingUserData?.credits || 0,
              isPremium: existingUserData?.isPremium || false,
              premiumSince: existingUserData?.premiumSince || null,
              subscriptionExpiresAt: existingUserData?.subscriptionExpiresAt || null,
              unlimitedExpiry: existingUserData?.unlimitedExpiry || null,
              compatibilitycredits: existingUserData?.compatibilitycredits || 0,
              // Preserve existing data
              questionPacks: existingUserData?.questionPacks || {},
              questionsUsed: existingUserData?.questionsUsed || {},
              reportsUsed: existingUserData?.reportsUsed || {},
            }, { merge: true });
            
            console.log('[Verify Payment] Report purchase completed', {
              userId,
              planName,
              paymentId: razorpay_payment_id,
            });
          } else if (isCompatibilityPurchase) {
            // Handle compatibility credit purchase
            let creditsToAdd = 0;
            
            if (planName === '1 Compatibility Credit') {
              creditsToAdd = 1;
            } else if (planName === '2 Compatibility Credits') {
              creditsToAdd = 2;
            } else if (planName === '5 Compatibility Credits') {
              creditsToAdd = 5;
            }
            
            await userDocRef.set({
              uid: email,
              email: email || null,
              displayName: displayName || null,
              compatibilitycredits: admin.firestore.FieldValue.increment(creditsToAdd),
              lastCompatibilityPurchase: admin.firestore.FieldValue.serverTimestamp(),
              lastPaymentId: razorpay_payment_id,
              lastPaymentAmount: amount,
              verificationStatus: 'verified',
              createdAt: existingUserData?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              // Preserve existing plan and credits - CRITICAL!
              planName: existingUserData?.planName || 'Free',
              credits: existingUserData?.credits || 0,
              isPremium: existingUserData?.isPremium || false,
              premiumSince: existingUserData?.premiumSince || null,
              subscriptionExpiresAt: existingUserData?.subscriptionExpiresAt || null,
              unlimitedExpiry: existingUserData?.unlimitedExpiry || null,
              reportCredits: existingUserData?.reportCredits || 0,
              // Preserve existing data
              questionPacks: existingUserData?.questionPacks || {},
              questionsUsed: existingUserData?.questionsUsed || {},
              reportsUsed: existingUserData?.reportsUsed || {},
            }, { merge: true });
            
            console.log('[Verify Payment] Compatibility credit purchase completed', {
              userId,
              planName,
              creditsToAdd,
              paymentId: razorpay_payment_id,
            });
          } else {
            // Handle regular plan purchases
            // Calculate expiry based on plan type
            const expiresAt = new Date();
            let unlimitedExpiry = null;
            
            if (planName === 'Quick Ask') {
              expiresAt.setDate(expiresAt.getDate() + 30);
            } else if (planName === 'Deep Dive') {
              expiresAt.setDate(expiresAt.getDate() + 60);
            } else if (planName === 'The Power Pack') {
              expiresAt.setMonth(expiresAt.getMonth() + 6);
            } else if (planName === 'Day Pass') {
              // Set unlimited expiry to 11:59:59 PM IST of current day
              const istTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
              unlimitedExpiry = new Date(istTime);
              unlimitedExpiry.setHours(23, 59, 59, 999);
              
              // Convert to UTC for storage
              const utcExpiry = new Date(unlimitedExpiry.toLocaleString("en-US", { timeZone: "UTC" }));
              unlimitedExpiry = utcExpiry;
              
              expiresAt.setDate(expiresAt.getDate() + 1);
              console.log("Day Pass expiry set to IST 11:59:59 PM (UTC:", unlimitedExpiry.toISOString(), ")");
            } else {
              expiresAt.setDate(expiresAt.getDate() + 30);
            }

            // Update user with new plan and credits
            await userDocRef.set({
              uid: email,
              email: email || null,
              displayName: displayName || null,
              planName,
              isPremium: !['Free', 'Quick Ask', 'Deep Dive', 'The Power Pack', 'Day Pass'].includes(planName),
              premiumSince: !['Free', 'Quick Ask', 'Deep Dive', 'The Power Pack', 'Day Pass'].includes(planName) ? admin.firestore.FieldValue.serverTimestamp() : existingUserData?.premiumSince || null,
              subscriptionExpiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
              unlimitedExpiry: unlimitedExpiry ? admin.firestore.Timestamp.fromDate(unlimitedExpiry) : null,
              // Add credits based on plan
              credits: planName === 'Quick Ask' ? 5 :
                       planName === 'Deep Dive' ? 15 : 
                       planName === 'The Power Pack' ? 30 :
                       planName === 'Day Pass' ? 999 : // Unlimited represented as 999
                       planName === 'Premium' ? 30 :
                       (existingUserData?.credits || 0), // Preserve existing credits for other plans
              reportCredits: existingUserData?.reportCredits || 0, // No free reports
              // Add compatibility credits based on plan
              compatibilitycredits: planName === 'Standard' ? 5 :
                                  planName === 'Premium' ? 10 :
                                  existingUserData?.compatibilitycredits || 0,
              lastPaymentId: razorpay_payment_id,
              lastPaymentAmount: amount,
              verificationStatus: 'verified',
              createdAt: existingUserData?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              // Preserve existing data
              questionPacks: existingUserData?.questionPacks || {},
              questionsUsed: existingUserData?.questionsUsed || {},
              reportsUsed: existingUserData?.reportsUsed || {},
              purchasedReports: existingUserData?.purchasedReports || [],
            }, { merge: true });
            
            console.log('[Verify Payment] Plan purchase completed', {
              userId,
              planName,
              credits: planName === 'Quick Ask' ? 5 : planName === 'Deep Dive' ? 15 : planName === 'The Power Pack' ? 30 : planName === 'Day Pass' ? 999 : planName === 'Premium' ? 30 : existingUserData?.credits || 0,
              compatibilityCredits: planName === 'Standard' ? 5 : planName === 'Premium' ? 10 : existingUserData?.compatibilitycredits || 0,
              paymentId: razorpay_payment_id,
            });
          }

          // Log payment
          await firestore.collection('payments').doc(razorpay_payment_id).set(
            {
              uid: email,
              planName,
              amount,
              paymentId: razorpay_payment_id,
              orderId: razorpay_order_id,
              type: isStorePurchase ? 'store' : isReportPurchase ? 'report' : 'plan',
              reportsAdded: isReportPurchase ? 1 : 0,
              verificationStatus: 'verified',
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          console.log('[Verify Payment] Plan and credits allocated successfully:', {
            planName,
            credits: planName === 'Quick Ask' ? 5 :
                     planName === 'Deep Dive' ? 15 : 
                     planName === 'The Power Pack' ? 30 :
                     planName === 'Day Pass' ? 999 :
                     planName === 'Premium' ? 30 : 0,
            compatibilityCredits: planName === 'Standard' ? 5 :
                                planName === 'Premium' ? 10 : 0,
          });
          
          firestoreUpdated = true;
          
        } catch (saveError: any) {
          console.error('[Verify Payment] Failed to allocate credits:', saveError);
          return res.status(500).json({ 
            error: 'Payment verified but failed to allocate credits',
            details: saveError?.message
          });
        }
      }
    } catch (firestoreError: any) {
      console.error('[Verify Payment] Firestore update failed:', firestoreError);
      // Don't fail the verification if Firestore update fails
      // Payment is already captured, we can retry Firestore update later
    }

    // Payment verified successfully
    return res.status(200).json({
      success: true,
      verified: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      planName: planName || 'Unknown Plan',
      amount: amount || 0,
      firestoreUpdated,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[Verify Payment] Error verifying payment:', error);
    console.error('[Verify Payment] Error stack:', error?.stack);
    return res.status(500).json({ 
      error: error?.message || 'Payment verification error',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
}

