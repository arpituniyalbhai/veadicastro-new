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

const buildWelcomeEmail = (username: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Welcome to Veadicastro</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#000000;font-family:'Segoe UI',Arial,sans-serif;color:#ffffff;padding:40px 15px;}
.wrap{max-width:560px;margin:0 auto;background:#000000;border:1px solid #1a1a1a;border-radius:14px;overflow:hidden;}
.head{background:#000000;padding:36px 28px 28px;text-align:center;border-bottom:1px solid #1a1a1a;}
.logo-row{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:8px;}
.logo-icon{width:36px;height:36px;background:#d9277a;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;}
.logo-name{font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;}
.tagline{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#333;margin-top:6px;}
.sep{width:40px;height:2px;background:#d9277a;margin:14px auto 0;border-radius:2px;}
.body{padding:32px 28px;background:#000000;}
.greet{font-size:20px;font-weight:600;color:#ffffff;margin-bottom:12px;}
.intro{font-size:14px;color:#555;line-height:1.8;margin-bottom:26px;}
.intro strong{color:#d9277a;font-weight:600;}
.credits-box{background:#0f0000;border:1px solid #d9277a44;border-radius:12px;padding:18px 20px;margin-bottom:28px;display:flex;align-items:center;gap:16px;}
.cred-num{font-size:36px;font-weight:700;color:#d9277a;line-height:1;flex-shrink:0;}
.cred-title{font-size:14px;font-weight:600;color:#ffffff;margin-bottom:4px;}
.cred-sub{font-size:12px;color:#444;}
.sec-label{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#333;margin-bottom:14px;}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:28px;}
.card{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:10px;padding:14px;}
.card-top{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
.dot{width:6px;height:6px;background:#d9277a;border-radius:50%;flex-shrink:0;}
.card-name{font-size:13px;font-weight:600;color:#ffffff;}
.card-desc{font-size:11px;color:#444;line-height:1.6;padding-left:14px;}
.hr{border:none;border-top:1px solid #111;margin:4px 0 24px;}
.quote{border-left:2px solid #d9277a;padding:12px 16px;margin-bottom:28px;background:#d9277a08;border-radius:0 8px 8px 0;}
.quote p{font-size:13px;font-style:italic;color:#444;line-height:1.7;}
.cta-wrap{text-align:center;margin-bottom:8px;}
.cta-btn{display:inline-block;padding:14px 44px;background:#d9277a;color:#ffffff;text-decoration:none;border-radius:50px;font-size:14px;font-weight:600;letter-spacing:0.3px;}
.cta-sub{margin-top:10px;font-size:11px;color:#333;}
.foot{background:#000000;border-top:1px solid #111;padding:20px 28px;text-align:center;}
.foot-logo-row{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;}
.foot-icon{width:20px;height:20px;background:#d9277a;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;}
.foot-name{font-size:12px;font-weight:600;color:#d9277a;letter-spacing:1px;}
.foot-copy{font-size:10px;color:#222;}
</style>
</head>
<body>
<div class="wrap">
  <div class="head">
    <div class="logo-row">
      <div class="logo-icon">V</div>
      <div class="logo-name">Veadicastro</div>
    </div>
    <div class="tagline">Ancient Wisdom · Modern AI</div>
    <div class="sep"></div>
  </div>
  <div class="body">
    <div class="greet">Namaste, ${username}</div>
    <div class="intro">
      Your account is now live. You are now part of a platform built on
      <strong>5000 years of Vedic knowledge</strong> — powered by AI that understands
      your chart, your dashas, and your life path. This is not generic astrology.
    </div>
    <div class="credits-box">
      <div class="cred-num">2</div>
      <div>
        <div class="cred-title">Free chat credits, ready to use</div>
        <div class="cred-sub">Ask Vedika AI anything — no payment needed to start</div>
      </div>
    </div>
    <div class="sec-label">Everything inside your account</div>
    <div class="grid">
      <div class="card"><div class="card-top"><div class="dot"></div><div class="card-name">Kundali Report</div></div><div class="card-desc">Full birth chart, planetary positions & life predictions</div></div>
      <div class="card"><div class="card-top"><div class="dot"></div><div class="card-name">Chat with Astrologer</div></div><div class="card-desc">Real Vedic expert for personal, in-depth guidance</div></div>
      <div class="card"><div class="card-top"><div class="dot"></div><div class="card-name">Today & Tomorrow</div></div><div class="card-desc">Daily forecast so you always know what energy is ahead</div></div>
      <div class="card"><div class="card-top"><div class="dot"></div><div class="card-name">Weekly & Monthly</div></div><div class="card-desc">Plan your decisions with Vedic planetary guidance</div></div>
      <div class="card"><div class="card-top"><div class="dot"></div><div class="card-name">Kundali Matching</div></div><div class="card-desc">Compatibility analysis for relationships & marriage</div></div>
      <div class="card"><div class="card-top"><div class="dot"></div><div class="card-name">Competitor Analytics</div></div><div class="card-desc">Vedic-based business & rival intelligence insights</div></div>
    </div>
    <hr class="hr">
    <div class="quote"><p>"The planets don't dictate your life — but knowing their movement gives you the power to move with intention."</p></div>
    <div class="cta-wrap">
      <a href="https://veadicastro.in/chat" class="cta-btn">Use Your Free Credits</a>
      <div class="cta-sub">No card required · Start your first reading now</div>
    </div>
  </div>
  <div class="foot">
    <div class="foot-logo-row"><div class="foot-icon">V</div><div class="foot-name">veadicastro.in</div></div>
    <div class="foot-copy">© 2026 Veadicastro · You received this because you created an account.</div>
  </div>
</div>
</body>
</html>
`;

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
      const rawUsername = body.username || email.split('@')[0];
      username = rawUsername.split(' ')[0];
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
      oldHtml: `
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
      html: buildWelcomeEmail(username),
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
