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
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;color:#111111;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">

  <!-- HEADER -->
  <tr>
    <td style="padding:28px 32px 20px;border-bottom:1px solid #f0f0f0;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:10px;">
            <img src="https://veadicastro.in/optimized/logo.webp" alt="Veadicastro" height="36" style="display:block;height:36px;width:auto;"/>
          </td>
          <td style="font-size:18px;font-weight:700;color:#111111;letter-spacing:-0.3px;">Veadicastro</td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="padding:32px 32px 8px;">

      <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111111;">Namaste, ${username} 🙏</p>
      <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.7;">
        Your Veadicastro account is live. Welcome to a platform that combines 
        <strong style="color:#111111;">5000 years of Vedic knowledge</strong> with modern AI — 
        built to give you real answers, not generic horoscopes.
      </p>

      <!-- CREDITS BOX -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7f9;border:1px solid #f5c0d4;border-radius:10px;margin-bottom:28px;">
        <tr>
          <td style="padding:18px 20px;">
            <p style="margin:0 0 2px;font-size:13px;color:#9f1239;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your free credits</p>
            <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#d9277a;line-height:1.2;">2 free chats</p>
            <p style="margin:0;font-size:13px;color:#71717a;">Ask Vedika AI anything — no payment needed to start</p>
          </td>
        </tr>
      </table>

      <!-- FEATURES -->
      <p style="margin:0 0 14px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:1px;">What you can do</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;vertical-align:top;width:20px;padding-right:12px;font-size:16px;">🔮</td>
          <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;">
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111111;">Kundali Report</p>
            <p style="margin:0;font-size:13px;color:#71717a;">Full birth chart, planetary positions & life predictions</p>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;vertical-align:top;width:20px;padding-right:12px;font-size:16px;">💬</td>
          <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;">
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111111;">Chat with Astrologer</p>
            <p style="margin:0;font-size:13px;color:#71717a;">Real Vedic expert for personal, in-depth guidance</p>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;vertical-align:top;width:20px;padding-right:12px;font-size:16px;">📅</td>
          <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;">
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111111;">Daily, Weekly & Monthly</p>
            <p style="margin:0;font-size:13px;color:#71717a;">Vedic forecasts so you always know what's ahead</p>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;vertical-align:top;width:20px;padding-right:12px;font-size:16px;">💑</td>
          <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;">
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111111;">Kundali Matching</p>
            <p style="margin:0;font-size:13px;color:#71717a;">Compatibility analysis for relationships & marriage</p>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;vertical-align:top;width:20px;padding-right:12px;font-size:16px;">📊</td>
          <td style="padding:10px 0;">
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111111;">Competitor Analytics</p>
            <p style="margin:0;font-size:13px;color:#71717a;">Vedic-based business & rival intelligence insights</p>
          </td>
        </tr>
      </table>

      <!-- QUOTE -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="border-left:3px solid #d9277a;padding:10px 16px;background:#fafafa;border-radius:0 6px 6px 0;">
            <p style="margin:0;font-size:13px;font-style:italic;color:#71717a;line-height:1.7;">"The planets don't dictate your life — but knowing their movement gives you the power to move with intention."</p>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td align="center">
            <a href="https://veadicastro.in/chat" style="display:inline-block;background:#d9277a;color:#ffffff;text-decoration:none;padding:13px 36px;border-radius:8px;font-size:15px;font-weight:600;">Start Your Free Reading</a>
            <p style="margin:10px 0 0;font-size:12px;color:#a1a1aa;">No card required · 2 free chats included</p>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="padding:20px 32px;border-top:1px solid #f0f0f0;background:#fafafa;">
      <p style="margin:0 0 4px;font-size:12px;color:#71717a;">Veadicastro · <a href="https://veadicastro.in" style="color:#d9277a;text-decoration:none;">veadicastro.in</a></p>
      <p style="margin:0;font-size:11px;color:#a1a1aa;">You received this because you created an account at Veadicastro. © 2026 Veadicastro.</p>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>
`;

// Use the same Zoho SMTP configuration as the OTP sender.
let welcomeTransporter: any;

try {
  welcomeTransporter = nodemailer.createTransport({
    host: process.env.ZOHO_HOST || 'smtp.zoho.in',
    port: parseInt(process.env.ZOHO_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.ZOHO_USER || 'support@veadicastro.in',
      pass: process.env.ZOHO_PASS,
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

    // Check duplicate
    try {
      const logDoc = await adminDb
        .collection('email_logs')
        .doc(`${email.toLowerCase()}_welcome`)
        .get();

      if (logDoc.exists) {
        return new Response(JSON.stringify({ success: true, message: 'Welcome email already sent' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (err) {
      console.error('Firestore duplicate check failed:', err);
    }

    const mailOptions = {
      from: `"Veadicastro" <${process.env.ZOHO_USER || 'support@veadicastro.in'}>`,
      to: email,
      subject: `🌟 Welcome to Veadicastro, ${username}!`,
      html: buildWelcomeEmail(username),
    };

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
    } catch (firestoreError) {
      console.error('Firestore log error:', firestoreError);
    }

    return new Response(JSON.stringify({ success: true, message: 'Welcome email sent successfully' }), {
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
