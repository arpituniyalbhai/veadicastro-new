export const runtime = 'edge';

import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    const { 
      email,
      displayName,
      customerName,
      customerContact,
      customerEmail,
    } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Missing required field: email' });
    }

    // Get Razorpay credentials from environment
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.trim();
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    const razorpayMonthlyPlanId = process.env.RAZORPAY_MONTHLY_PLAN_ID?.trim();

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('[Create Subscription] Missing Razorpay credentials');
      return res.status(500).json({ 
        error: 'Payment gateway configuration error',
        details: 'Razorpay credentials not found'
      });
    }

    if (!razorpayMonthlyPlanId) {
      console.error('[Create Subscription] Missing Razorpay Monthly Plan ID');
      return res.status(500).json({ 
        error: 'Subscription configuration error',
        details: 'Razorpay Monthly Plan ID not found'
      });
    }

    console.log('[Create Subscription] Creating subscription:', {
      email,
      planId: razorpayMonthlyPlanId,
      hasCustomerName: !!customerName,
      hasCustomerContact: !!customerContact,
    });

    // Create subscription via Razorpay API
    const subscriptionData: any = {
      plan_id: razorpayMonthlyPlanId,
      total_count: 12, // 12 months billing cycle
      customer_notify: true,
      notes: {
        email: email,
        displayName: displayName || null,
        customerName: customerName || null,
        customerEmail: customerEmail || email,
        timestamp: new Date().toISOString(),
      },
    };

    const authString = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      let errorMessage = 'Failed to create subscription. Please try again.';
      
      try {
        const errorData = JSON.parse(errorText);
        console.error('[Create Subscription] Razorpay API error:', errorData);
        if (errorData.error?.description) {
          errorMessage = `Subscription error: ${errorData.error.description}`;
        } else if (errorData.error?.code === 'BAD_REQUEST_ERROR') {
          errorMessage = 'Invalid subscription request. Please check your details.';
        } else if (errorData.error?.code === 'AUTHENTICATION_ERROR') {
          errorMessage = 'Payment gateway authentication failed. Please contact support.';
        }
      } catch (e) {
        console.error('[Create Subscription] Razorpay API error (raw):', errorText);
      }
      
      return res.status(razorpayResponse.status).json({ 
        error: errorMessage,
        statusCode: razorpayResponse.status
      });
    }

    const subscription = await razorpayResponse.json();

    console.log('[Create Subscription] ✅ Subscription Created:', {
      subscriptionId: subscription.id,
      planId: subscription.plan_id,
      status: subscription.status,
      email,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      subscriptionId: subscription.id,
      planId: subscription.plan_id,
      status: subscription.status,
      keyId: razorpayKeyId,
      amount: subscription.amount,
      currency: subscription.currency,
    });

  } catch (error: any) {
    console.error('[Create Subscription] Error:', error);
    return res.status(500).json({ 
      error: error?.message || 'Internal server error. Please try again later.' 
    });
  }
}
