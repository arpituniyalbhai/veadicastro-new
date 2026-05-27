import type { VercelRequest, VercelResponse } from '@vercel/node';

// CRITICAL: Server-side price source of truth
// Frontend CANNOT override these prices
const VALID_PLAN_PRICES: Record<string, number> = {
  'Quick Ask': 14900,      // ₹49 in paise
  'Deep Dive': 39900,      // ₹99 in paise
  'The Power Pack': 69900, // ₹199 in paise
  'Day Pass': 24900,      // ₹249 in paise
  'Free': 0,
  'Standard': 19900,    // ₹199 in paise
  'Premium': 49900,    // ₹499 in paise
  'Quick Pack': 4900,   // ₹49 in paise (legacy support)
};

// Micro-transaction pricing
const MICRO_PRICES: Record<string, number> = {
  'Personal Growth': 19900,      // ₹199 in paise
  'Love & Relationships': 19900, // ₹199 in paise
  'Career & Wealth': 19900,      // ₹199 in paise
  'Basic Personalized Report': 99900, // ₹999 in paise
  'Deep Life Analysis': 199900, // ₹1999 in paise
  'Premium Expert Guidance': 399900, // ₹3999 in paise
};

// Compatibility credit pricing
const COMPATIBILITY_PRICES: Record<string, number> = {
  '1 Compatibility Credit': 2900,   // ₹29 in paise
  '2 Compatibility Credits': 4900,  // ₹49 in paise
  '5 Compatibility Credits': 9900,  // ₹99 in paise
};

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
    const { currency, planName, customAmount, promoCode } = req.body;

    if (!currency || !planName) {
      return res.status(400).json({ error: 'Missing required fields: currency, planName' });
    }

    // Validate currency
    if (currency !== 'INR') {
      return res.status(400).json({ error: 'Only INR currency is supported' });
    }

    // Get original price from server-side mapping
    let originalAmount: number;
    if (customAmount && typeof customAmount === 'number' && customAmount > 0) {
      // For custom amounts (like single reports), use the provided amount
      originalAmount = customAmount;
      console.log('[Create Order] Using custom amount:', { planName, customAmount });
    } else if (MICRO_PRICES[planName]) {
      // For micro-transactions
      originalAmount = MICRO_PRICES[planName];
      console.log('[Create Order] Using micro price:', { planName, originalAmount });
    } else if (COMPATIBILITY_PRICES[planName]) {
      // For compatibility credits
      originalAmount = COMPATIBILITY_PRICES[planName];
      console.log('[Create Order] Using compatibility price:', { planName, originalAmount });
    } else {
      // For plans, get from server-side price mapping
      originalAmount = VALID_PLAN_PRICES[planName];
      console.log('[Create Order] Using plan price:', { planName, originalAmount });
      
      if (originalAmount === undefined) {
        return res.status(400).json({ error: `Invalid plan: ${planName}` });
      }
    }

    // Apply 33% discount if promo code is valid
    let finalAmount = originalAmount;
    let discountApplied = false;
    
    if (promoCode && promoCode.toUpperCase() === "NEW33") {
      finalAmount = Math.round(originalAmount * 0.67); // 33% off = 67% of original
      discountApplied = true;
      console.log('[Create Order] Applied 33% discount:', { 
        planName, 
        promoCode, 
        originalAmount: originalAmount / 100, // Convert to rupees for logging
        finalAmount: finalAmount / 100, // Convert to rupees for logging
        discount: (originalAmount - finalAmount) / 100 // Discount in rupees
      });
    }

    // Free plan doesn't need payment
    if (finalAmount === 0) {
      return res.status(400).json({ error: 'Free plan does not require payment' });
    }

    // Get Razorpay credentials from environment
    // Note: VITE_ prefixed variables are only available at build time for frontend, not in serverless functions
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.trim();
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!razorpayKeyId || !razorpayKeySecret || razorpayKeyId.length === 0 || razorpayKeySecret.length === 0) {
      console.error('Missing Razorpay credentials in environment');
      console.error('Environment check:', {
        hasRAZORPAY_KEY_ID: !!process.env.RAZORPAY_KEY_ID,
        hasRAZORPAY_KEY_SECRET: !!process.env.RAZORPAY_KEY_SECRET,
        keyIdLength: razorpayKeyId?.length || 0,
        keySecretLength: razorpayKeySecret?.length || 0,
        allEnvKeys: Object.keys(process.env).filter(k => k.toUpperCase().includes('RAZORPAY')),
      });
      return res.status(500).json({ 
        error: 'Payment gateway configuration error. Please contact support.',
        details: 'Razorpay credentials not found in environment variables. Please ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in Vercel environment variables and the deployment has been redeployed.'
      });
    }

    // Create order via Razorpay API
    // SECURITY: finalAmount is already in paise
    const orderData = {
      amount: finalAmount, // Final amount in paise (with discount if applied)
      currency: currency,
      receipt: `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      notes: {
        planName: planName || 'Unknown Plan',
        originalAmount: originalAmount, // Original amount before discount
        finalAmount: finalAmount, // Final amount after discount
        discountApplied: discountApplied,
        promoCode: promoCode || null,
        discount: discountApplied ? originalAmount - finalAmount : 0, // Discount amount in paise
        timestamp: new Date().toISOString(),
      },
    };

    const authString = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      let errorMessage = 'Failed to create payment order. Please try again.';
      
      try {
        const errorData = JSON.parse(errorText);
        console.error('Razorpay API error:', errorData);
        // Provide more specific error messages for common issues
        if (errorData.error?.description) {
          errorMessage = `Payment gateway error: ${errorData.error.description}`;
        } else if (errorData.error?.code === 'BAD_REQUEST_ERROR') {
          errorMessage = 'Invalid payment request. Please check your payment details.';
        } else if (errorData.error?.code === 'AUTHENTICATION_ERROR') {
          errorMessage = 'Payment gateway authentication failed. Please contact support.';
        }
      } catch (e) {
        console.error('Razorpay API error (raw):', errorText);
      }
      
      return res.status(razorpayResponse.status).json({ 
        error: errorMessage,
        statusCode: razorpayResponse.status
      });
    }

    const order = await razorpayResponse.json();

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId, // Return key ID for frontend
    });

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({ 
      error: error?.message || 'Internal server error. Please try again later.' 
    });
  }
}

