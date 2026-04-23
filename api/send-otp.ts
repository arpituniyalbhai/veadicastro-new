export const runtime = 'edge';

import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Rate limiting store (in production, use Redis)
const otpRequests = new Map<string, { count: number; lastRequest: number }>();

// Nodemailer transporter
let transporter: any;

console.log('Environment variables check:', {
  ZOHO_HOST: process.env.ZOHO_HOST,
  ZOHO_PORT: process.env.ZOHO_PORT,
  ZOHO_USER: process.env.ZOHO_USER,
  ZOHO_PASS: process.env.ZOHO_PASS ? '***SET***' : 'NOT_SET',
  FIREBASE_DATA_PROJECT_ID: process.env.FIREBASE_DATA_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? '***SET***' : 'NOT_SET',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? '***SET***' : 'NOT_SET',
});

try {
  transporter = nodemailer.createTransport({
    host: process.env.ZOHO_HOST || 'smtp.zoho.in',
    port: parseInt(process.env.ZOHO_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.ZOHO_USER || 'support@veadicastro.in',
      pass: process.env.ZOHO_PASS,
    },
  });
  console.log('Email transporter created successfully');
} catch (error) {
  console.error('Failed to create email transporter:', error);
  transporter = null;
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
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

const adminDb = admin.firestore();

// Rate limiting check
function checkRateLimit(email: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const userRequests = otpRequests.get(email);

  if (!userRequests) {
    otpRequests.set(email, { count: 1, lastRequest: now });
    return { allowed: true };
  }

  // Reset count if more than 60 seconds have passed
  if (now - userRequests.lastRequest > 60000) {
    otpRequests.set(email, { count: 1, lastRequest: now });
    return { allowed: true };
  }

  // Check if limit exceeded (3 requests per minute)
  if (userRequests.count >= 3) {
    return { allowed: false, error: 'Too many OTP requests. Please wait 1 minute.' };
  }

  // Increment count
  userRequests.count++;
  return { allowed: true };
}

export async function POST(req: any, res: any) {
  try {
    console.log('OTP Request received:', { 
      timestamp: new Date().toISOString(),
      headers: req.headers,
    });

    // Check if transporter is available
    if (!transporter) {
      console.error('Transporter not available');
      return new Response(JSON.stringify({ error: 'Email service not available' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body from Vercel serverless function
    let email;
    try {
      const body = await req.json();
      email = body.email;
      console.log('Email extracted:', email);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!email || !email.includes('@')) {
      console.error('Invalid email:', email);
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Rate limiting
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      console.error('Rate limit exceeded:', rateLimit.error);
      return new Response(JSON.stringify({ error: rateLimit.error }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    const createdAt = new Date();
    
    console.log('OTP generated:', { email, otp, expiresAt });

    // Save OTP to Firestore
    const otpDoc = {
      email: email.toLowerCase(),
      otp,
      expiresAt,
      createdAt,
      attempts: 0,
    };

    try {
      console.log('Saving OTP to Firestore:', { email: email.toLowerCase(), otp });
      await adminDb.collection('otp_codes').doc(email.toLowerCase()).set(otpDoc);
      console.log('OTP saved to Firestore successfully');
    } catch (firestoreError) {
      console.error('Firestore save error:', firestoreError);
      // Continue even if Firestore fails - email is more important
      console.log('Continuing with email send despite Firestore error');
    }

    // Send OTP email
    const mailOptions = {
      from: `"Veadicastro" <${process.env.ZOHO_USER}>`,
      to: email,
      subject: `🚀✨ Welcome to Veadicastro - Your code is ${otp}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="color-scheme" content="light dark">
          <title>Welcome to Veadicastro - OTP Verification</title>
          <style>
            /* Light theme (default) */
            :root {
              --bg-color: #ffffff;
              --text-color: #000000;
              --secondary-text: #666666;
              --accent-color: #883377;
              --border-color: #e0e0e0;
              --card-bg: #f8f9fa;
              --hr-color: #e0e0e0;
            }
            
            /* Dark theme (if user prefers dark) */
            @media (prefers-color-scheme: dark) {
              :root {
                --bg-color: #1a1a2e;
                --text-color: #ffffff;
                --secondary-text: #d1d5db;
                --accent-color: #883377;
                --border-color: #333333;
                --card-bg: #2a2a3e;
                --hr-color: #333333;
              }
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: var(--bg-color);
              color: var(--text-color);
              margin: 0;
              padding: 20px;
              line-height: 1.6;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: var(--bg-color);
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            
            h2 {
              color: var(--accent-color);
              font-size: 24px;
              font-weight: 600;
              margin: 0 0 20px 0;
            }
            
            .otp-container {
              text-align: center;
              margin: 30px 0;
            }
            
            .otp-box {
              display: inline-block;
              padding: 20px 30px;
              border: 2px solid var(--accent-color);
              border-radius: 8px;
            }
            
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 4px;
              color: var(--accent-color);
            }
            
            .info-text {
              color: var(--text-color);
              font-size: 16px;
              margin: 20px 0 0 0;
              line-height: 1.6;
            }
            
            .secondary-text {
              color: var(--secondary-text);
              font-size: 14px;
              opacity: 0.8;
            }
            
            .footer-text {
              color: var(--secondary-text);
              font-size: 12px;
              opacity: 0.7;
            }
            
            hr {
              border: none;
              border-top: 1px solid var(--hr-color);
              margin: 30px 0 10px 0;
            }
            
            /* Fallback for email clients that don't support media queries */
            .force-light {
              background-color: #ffffff !important;
              color: #000000 !important;
            }
            
            .force-dark {
              background-color: #1a1a2e !important;
              color: #ffffff !important;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <!-- Light theme content -->
            <div class="light-content">
              <h2>Hey ${email.split('@')[0]},</h2>
              <div class="info-text">Thanks for choosing Veadicastro. This is your OTP:</div>
              
              <div class="otp-container">
                <div class="otp-box">
                  <span class="otp-code">${otp}</span>
                </div>
              </div>
              
              <div class="secondary-text">This code will expire in 5 minutes.</div>
              <div class="secondary-text">If you did not request this login, please ignore this email.</div>
              
              <hr>
              
              <div class="footer-text">© 2026 Veadicastro - World's Most Accurate AI Astrology Platform</div>
            </div>
            
            <!-- Dark theme override for email clients that don't support prefers-color-scheme -->
            <!--[if mso]>
            <style>
              .force-dark {
                background-color: #1a1a2e !important;
                color: #ffffff !important;
              }
              .force-dark h2 { color: #883377 !important; }
              .force-dark .info-text { color: #ffffff !important; }
              .force-dark .otp-code { color: #883377 !important; }
              .force-dark .secondary-text { color: #d1d5db !important; opacity: 0.8; }
              .force-dark .footer-text { color: #d1d5db !important; opacity: 0.7; }
            </style>
            <div class="force-dark">
              <h2>Hey ${email.split('@')[0]},</h2>
              <div class="info-text">Thanks for choosing Veadicastro. This is your OTP:</div>
              
              <div class="otp-container">
                <div class="otp-box">
                  <span class="otp-code">${otp}</span>
                </div>
              </div>
              
              <div class="secondary-text">This code will expire in 5 minutes.</div>
              <div class="secondary-text">If you did not request this login, please ignore this email.</div>
              
              <hr>
              
              <div class="footer-text">© 2026 Veadicastro - World's Most Accurate AI Astrology Platform</div>
            </div>
            <![endif]-->
          </div>
        </body>
        </html>
      `,
    };

    try {
      console.log('Sending email to:', email);
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Email send error:', emailError);
      return new Response(JSON.stringify({ error: 'Failed to send OTP email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'OTP sent successfully',
      // For development only, remove in production
      ...(process.env.NODE_ENV === 'development' && { otp })
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('OTP generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send OTP. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}