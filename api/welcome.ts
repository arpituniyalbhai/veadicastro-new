export const runtime = 'edge';

import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_DATA_PROJECT_ID || "vedicastro111",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin init error:', error);
  }
}

const adminDb = admin.firestore();

// Welcome email transporter
let welcomeTransporter: any;

try {
  welcomeTransporter = nodemailer.createTransport({
    host: process.env.ZOHO_HOST || 'smtp.zoho.in',
    port: parseInt(process.env.ZOHO_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.WELCOME_EMAIL_USER || 'no-reply@veadicastro.in',
      pass: process.env.WELCOME_EMAIL_PASS,
    },
  });
} catch (error) {
  console.error('Welcome transporter init failed:', error);
  welcomeTransporter = null;
}

export async function POST(req: any) {
  try {
    if (!welcomeTransporter) {
      return new Response(JSON.stringify({ error: 'Email service not available' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let email: string;
    let username: string;

    try {
      const body = await req.json();
      email = body.email;
      username = body.username || email.split('@')[0];
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if welcome email already sent (avoid duplicates)
    try {
      const logDoc = await adminDb
        .collection('email_logs')
        .doc(`${email.toLowerCase()}_welcome`)
        .get();

      if (logDoc.exists) {
        console.log('Welcome email already sent to:', email);
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Welcome email already sent' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (err) {
      console.error('Firestore duplicate check failed:', err);
    }

    const mailOptions = {
      from: `"Veadicastro" <${process.env.WELCOME_EMAIL_USER || 'no-reply@veadicastro.in'}>`,
      to: email,
      subject: `Welcome to Veadicastro, ${username}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Welcome to Veadicastro</title>

        <style>
        body{
          margin:0;
          padding:0;
          background:#050505;
          font-family:Arial,sans-serif;
          color:#ffffff;
        }

        .wrapper{
          width:100%;
          padding:40px 15px;
          background:#050505;
        }

        .container{
          max-width:600px;
          margin:auto;
          background:#000000;
          border:1px solid #151515;
          border-radius:18px;
          overflow:hidden;
        }

        .header{
          text-align:center;
          padding:40px 30px 25px;
          border-bottom:1px solid #111;
        }

        .logo{
          width:170px;
          margin-bottom:18px;
        }

        .tagline{
          color:#6f7fa8;
          font-size:11px;
          letter-spacing:3px;
          text-transform:uppercase;
        }

        .content{
          padding:38px 32px;
        }

        .title{
          font-size:28px;
          font-weight:700;
          margin-bottom:18px;
          color:#ffffff;
        }

        .text{
          font-size:15px;
          line-height:1.8;
          color:#b8b8c7;
          margin-bottom:28px;
        }

        .highlight{
          color:#4da3ff;
          font-weight:600;
        }

        .credits-box{
          background:#07111f;
          border:1px solid #123055;
          border-radius:14px;
          padding:22px;
          margin-bottom:30px;
        }

        .credit-number{
          font-size:32px;
          font-weight:700;
          color:#4da3ff;
        }

        .credit-title{
          font-size:16px;
          font-weight:600;
          margin-top:6px;
          color:#ffffff;
        }

        .credit-sub{
          font-size:13px;
          color:#9ba3b5;
          margin-top:5px;
        }

        .section-title{
          font-size:11px;
          color:#5d6b87;
          letter-spacing:3px;
          margin-bottom:18px;
          text-transform:uppercase;
        }

        .grid{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
          margin-bottom:30px;
        }

        .card{
          border:1px solid #161616;
          background:#090909;
          border-radius:12px;
          padding:16px;
        }

        .card-title{
          color:#ffffff;
          font-size:14px;
          font-weight:600;
          margin-bottom:6px;
        }

        .card-text{
          color:#7f8798;
          font-size:12px;
          line-height:1.6;
        }

        .quote{
          border-left:2px solid #4da3ff;
          padding-left:16px;
          color:#7d8597;
          font-style:italic;
          font-size:14px;
          margin-bottom:30px;
        }

        .cta-wrap{
          text-align:center;
        }

        .cta{
          display:inline-block;
          background:#4da3ff;
          color:#ffffff !important;
          text-decoration:none;
          padding:15px 34px;
          border-radius:999px;
          font-size:15px;
          font-weight:600;
        }

        .cta-sub{
          margin-top:12px;
          font-size:12px;
          color:#6d7385;
        }

        .footer{
          border-top:1px solid #111;
          padding:26px;
          text-align:center;
        }

        .footer-site{
          color:#4da3ff;
          font-size:13px;
          font-weight:600;
          margin-bottom:10px;
        }

        .footer-copy{
          color:#555;
          font-size:11px;
        }
        </style>
        </head>

        <body>

        <div class="wrapper">

        <div class="container">

        <div class="header">

        <img 
        class="logo"
        src="https://veadicastro.in/optimized/logo.webp"
        alt="Veadicastro"
        />

        <div class="tagline">
        ANCIENT WISDOM · MODERN AI
        </div>

        </div>

        <div class="content">

        <div class="title">
        Namaste, ${username}
        </div>

        <div class="text">
        Your account is now live.

        You are now part of a platform built on 
        <span class="highlight">5000 years of Vedic knowledge</span> 
        powered by AI that understands your chart, your dashas, and your life path.

        This is not generic app-based astrology.
        </div>

        <div class="credits-box">

        <div class="credit-number">
        2
        </div>

        <div class="credit-title">
        Free chat credits ready to use
        </div>

        <div class="credit-sub">
        Ask Vedika AI anything — no payment needed to start
        </div>

        </div>

        <div class="section-title">
        Everything inside your account
        </div>

        <div class="grid">

        <div class="card">
        <div class="card-title">Kundali Report</div>
        <div class="card-text">
        Full birth chart, planetary positions & life predictions
        </div>
        </div>

        <div class="card">
        <div class="card-title">Chat with Astrologer</div>
        <div class="card-text">
        AI advice expert for personal, career and relationship guidance
        </div>
        </div>

        <div class="card">
        <div class="card-title">Today & Tomorrow</div>
        <div class="card-text">
        Daily forecasts for your energy and emotions
        </div>
        </div>

        <div class="card">
        <div class="card-title">Weekly & Monthly</div>
        <div class="card-text">
        Major life sections with Vedic planetary guidance
        </div>
        </div>

        <div class="card">
        <div class="card-title">Kundali Matching</div>
        <div class="card-text">
        Compatibility analysis for relationships & marriage
        </div>
        </div>

        <div class="card">
        <div class="card-title">Competitor Analytics</div>
        <div class="card-text">
        Vedic-based business & mind intelligence insights
        </div>
        </div>

        </div>

        <div class="quote">
        "The planets don't dictate your life — but knowing their movement gives you the power to move with intention."
        </div>

        <div class="cta-wrap">

        <a href="https://veadicastro.in/chat" class="cta">
        Use Your Free Credits
        </a>

        <div class="cta-sub">
        No card required · Start your first reading now
        </div>

        </div>

        </div>

        <div class="footer">

        <div class="footer-site">
        veadicastro.in
        </div>

        <div class="footer-copy">
        2026 Veadicastro. You received this because you created an account.
        </div>

        </div>

        </div>

        </div>

        </body>
        </html>
      `,
    };

    // Send email
    try {
      await welcomeTransporter.sendMail(mailOptions);
      console.log('Welcome email sent to:', email);
    } catch (emailError) {
      console.error('Welcome email send error:', emailError);
      return new Response(JSON.stringify({ error: 'Failed to send welcome email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Log to Firestore
    try {
      await adminDb
        .collection('email_logs')
        .doc(`${email.toLowerCase()}_welcome`)
        .set({
          email: email.toLowerCase(),
          sentAt: new Date(),
          type: 'welcome_email',
          username: username,
        });
      console.log('Email log saved to Firestore');
    } catch (firestoreError) {
      console.error('Firestore log error:', firestoreError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Welcome email sent successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Welcome route error:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}