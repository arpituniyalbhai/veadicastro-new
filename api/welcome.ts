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
      subject: `Welcome to Veadicastro, ${username}! Your cosmic journey begins 🌟`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Veadicastro</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #0d0d1a;
              color: #ffffff;
              padding: 30px 15px;
              line-height: 1.6;
            }

            .wrapper {
              max-width: 580px;
              margin: 0 auto;
            }

            .header {
              background: linear-gradient(135deg, #6b2060 0%, #3d1040 100%);
              border-radius: 16px 16px 0 0;
              padding: 40px 30px 35px;
              text-align: center;
            }

            .logo-text {
              font-size: 11px;
              letter-spacing: 4px;
              color: #d4a0c8;
              text-transform: uppercase;
              margin-bottom: 12px;
            }

            .header h1 {
              font-size: 30px;
              font-weight: 700;
              color: #ffffff;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }

            .header-sub {
              font-size: 13px;
              color: #c9a0bc;
              letter-spacing: 0.5px;
            }

            .divider-stars {
              color: #883377;
              font-size: 18px;
              letter-spacing: 6px;
              margin-top: 18px;
            }

            .body-card {
              background: #12102a;
              padding: 38px 32px;
              border-left: 1px solid rgba(136, 51, 119, 0.3);
              border-right: 1px solid rgba(136, 51, 119, 0.3);
            }

            .greeting {
              font-size: 20px;
              font-weight: 600;
              color: #e8b4d8;
              margin-bottom: 16px;
            }

            .intro {
              font-size: 15px;
              color: #c8c8e0;
              margin-bottom: 28px;
            }

            .intro strong {
              color: #e8b4d8;
            }

            .features-box {
              background: rgba(136, 51, 119, 0.1);
              border: 1px solid rgba(136, 51, 119, 0.35);
              border-radius: 12px;
              padding: 24px;
              margin-bottom: 28px;
            }

            .features-title {
              font-size: 13px;
              font-weight: 600;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #c080b0;
              margin-bottom: 18px;
            }

            .feature-row {
              display: flex;
              align-items: flex-start;
              margin-bottom: 14px;
            }

            .feature-row:last-child { margin-bottom: 0; }

            .feat-icon {
              font-size: 20px;
              margin-right: 14px;
              flex-shrink: 0;
              margin-top: 1px;
            }

            .feat-text strong {
              display: block;
              font-size: 14px;
              color: #e0c8d8;
              margin-bottom: 2px;
            }

            .feat-text span {
              font-size: 13px;
              color: #a090b0;
            }

            .quote-block {
              border-left: 3px solid #883377;
              padding: 14px 18px;
              margin-bottom: 30px;
              background: rgba(136, 51, 119, 0.07);
              border-radius: 0 8px 8px 0;
            }

            .quote-block p {
              font-size: 14px;
              font-style: italic;
              color: #b090a8;
            }

            .cta-wrapper {
              text-align: center;
              margin-bottom: 28px;
            }

            .cta-btn {
              display: inline-block;
              padding: 16px 44px;
              background: linear-gradient(135deg, #883377 0%, #5c1f45 100%);
              color: #ffffff;
              text-decoration: none;
              border-radius: 50px;
              font-size: 15px;
              font-weight: 600;
              letter-spacing: 0.5px;
            }

            .cta-sub {
              margin-top: 10px;
              font-size: 12px;
              color: #7a6888;
            }

            .credits-note {
              background: rgba(255,255,255,0.03);
              border: 1px solid rgba(255,255,255,0.07);
              border-radius: 10px;
              padding: 16px 20px;
              font-size: 13px;
              color: #9090b0;
              text-align: center;
              margin-bottom: 10px;
            }

            .credits-note span {
              color: #c080b0;
              font-weight: 600;
            }

            .footer {
              background: #0a0814;
              border: 1px solid rgba(136, 51, 119, 0.2);
              border-top: none;
              border-radius: 0 0 16px 16px;
              padding: 24px 30px;
              text-align: center;
            }

            .footer-site {
              color: #883377;
              font-size: 13px;
              font-weight: 600;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }

            .footer-copy {
              font-size: 11px;
              color: #504860;
              margin-bottom: 6px;
            }

            .footer-unsub {
              font-size: 11px;
              color: #3a3050;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">

            <div class="header">
              <div class="logo-text">AI-Powered Vedic Astrology</div>
              <h1>⭐ Veadicastro</h1>
              <div class="header-sub">The World's Most Accurate AI Astrology Platform</div>
              <div class="divider-stars">✦ ✦ ✦</div>
            </div>

            <div class="body-card">

              <div class="greeting">Welcome aboard, ${username}! 🙏</div>

              <div class="intro">
                Your account is now active. You've just joined thousands of people 
                discovering the power of <strong>ancient Vedic wisdom</strong> combined 
                with <strong>modern AI</strong>. Our AI astrologer <strong>Vedika AI</strong> 
                is ready to guide you — anytime, instantly.
              </div>

              <div class="features-box">
                <div class="features-title">What you can explore</div>

                <div class="feature-row">
                  <div class="feat-icon">🔮</div>
                  <div class="feat-text">
                    <strong>Kundali & Birth Chart Analysis</strong>
                    <span>Deep insights into your planetary positions and their life impact</span>
                  </div>
                </div>

                <div class="feature-row">
                  <div class="feat-icon">📅</div>
                  <div class="feat-text">
                    <strong>Monthly & Daily Predictions</strong>
                    <span>Career, love, health, and finance forecasts personalized for you</span>
                  </div>
                </div>

                <div class="feature-row">
                  <div class="feat-icon">💑</div>
                  <div class="feat-text">
                    <strong>Kundali Matching</strong>
                    <span>Vedic compatibility analysis for relationships and marriage</span>
                  </div>
                </div>

                <div class="feature-row">
                  <div class="feat-icon">👨‍🏫</div>
                  <div class="feat-text">
                    <strong>Human Astrologer Consultation</strong>
                    <span>Talk directly with our expert Vedic astrologer for in-depth guidance</span>
                  </div>
                </div>

              </div>

              <div class="quote-block">
                <p>"The stars don't control your destiny — but understanding them gives you 
                the clarity to shape it." 🌙</p>
              </div>

              <div class="cta-wrapper">
                <a href="https://veadicastro.in/chat" class="cta-btn">
                  Start Your Reading →
                </a>
                <div class="cta-sub">Free credits included with your account</div>
              </div>

              <div class="credits-note">
                💡 Pro tip: Start by asking Vedika AI about your 
                <span>Rashi, current Dasha period,</span> or 
                <span>this month's planetary transits</span> for you.
              </div>

            </div>

            <div class="footer">
              <div class="footer-site">veadicastro.in</div>
              <div class="footer-copy">© 2026 Veadicastro. All rights reserved.</div>
              <div class="footer-unsub">
                You received this because you created an account at Veadicastro.
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