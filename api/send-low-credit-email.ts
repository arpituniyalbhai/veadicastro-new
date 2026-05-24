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

// Vedika's personalized messages — one is randomly picked per send
const VEDIKA_MESSAGES = [
  {
    hook: "Your stars have more to say.",
    body: "You asked, I answered — but your chart holds threads I haven't pulled yet. There's a pattern forming in your planetary positions right now that most people miss entirely.",
    teaser: "The next 90 days carry something unusual for your sign. I'd rather tell you now than have you find out later.",
  },
  {
    hook: "I noticed something in your Kundali.",
    body: "Before you left, I was mid-reading on a transit that doesn't come often. It touches your 7th and 10th house simultaneously — relationships and career, in the same window.",
    teaser: "This alignment closes soon. Once it does, the opportunity it carries moves on too.",
  },
  {
    hook: "There's a shift coming.",
    body: "Your Dasha cycle is at a turning point — the kind that either opens doors or quietly closes them, depending on awareness. Most people don't notice until after.",
    teaser: "I can tell you exactly what to watch for. You just need to come back.",
  },
  {
    hook: "Your reading wasn't finished.",
    body: "The questions you asked touched the surface of something deeper in your chart. Saturn's current position relative to your Lagna is doing something I don't see often.",
    teaser: "It explains a lot about the pattern you've been feeling lately. I'll be here when you're ready.",
  },
];

const buildZeroCreditEmail = (username: string) => {
  const msg = VEDIKA_MESSAGES[Math.floor(Math.random() * VEDIKA_MESSAGES.length)];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Vedika has something to tell you</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;color:#e5e5e5;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#111111;border-radius:14px;overflow:hidden;border:1px solid #1e1e1e;">

  <!-- HEADER -->
  <tr>
    <td style="padding:28px 32px 20px;border-bottom:1px solid #1a1a1a;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:10px;">
            <img src="https://veadicastro.in/optimized/logo.webp" alt="Veadicastro" height="34" style="display:block;height:34px;width:auto;"/>
          </td>
          <td style="font-size:16px;font-weight:600;color:#e5e5e5;letter-spacing:0.3px;">Veadicastro</td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- VEDIKA INTRO -->
  <tr>
    <td style="padding:32px 32px 0;">
      <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
        <tr>
          <td style="vertical-align:middle;width:54px;padding-right:14px;">
            <img src="https://veadicastro.in/optimized/vedika.webp" alt="Vedika" width="54" height="54"
              style="display:block;width:54px;height:54px;border-radius:50%;border:2px solid #d9277a;object-fit:cover;"/>
          </td>
          <td style="vertical-align:middle;">
            <p style="margin:0 0 3px;font-size:13px;color:#d9277a;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;font-family:'Segoe UI',Arial,sans-serif;">Vedika AI</p>
            <p style="margin:0;font-size:11px;color:#555;font-family:'Segoe UI',Arial,sans-serif;">Your Vedic Astrologer</p>
          </td>
        </tr>
      </table>

      <!-- GREETING -->
      <p style="margin:0 0 8px;font-size:24px;font-weight:400;color:#ffffff;line-height:1.3;letter-spacing:-0.3px;">
        ${username}, ${msg.hook}
      </p>

      <!-- BODY -->
      <p style="margin:0 0 20px;font-size:15px;color:#999;line-height:1.8;font-family:'Segoe UI',Arial,sans-serif;">
        ${msg.body}
      </p>

      <!-- TEASER QUOTE -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="border-left:2px solid #d9277a;padding:12px 18px;background:#1a0a10;border-radius:0 8px 8px 0;">
            <p style="margin:0;font-size:14px;font-style:italic;color:#c084a0;line-height:1.7;font-family:'Georgia',serif;">"${msg.teaser}"</p>
          </td>
        </tr>
      </table>

      <!-- CREDITS INFO -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#161616;border:1px solid #2a2a2a;border-radius:10px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 4px;font-size:12px;color:#555;font-family:'Segoe UI',Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Your current balance</p>
            <p style="margin:0 0 2px;font-size:26px;font-weight:700;color:#d9277a;line-height:1.2;font-family:'Segoe UI',Arial,sans-serif;">0 credits</p>
            <p style="margin:0;font-size:12px;color:#555;font-family:'Segoe UI',Arial,sans-serif;">Top up to continue your reading with Vedika</p>
          </td>
        </tr>
      </table>

      <!-- PLANS -->
      <p style="margin:0 0 14px;font-size:12px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:1px;font-family:'Segoe UI',Arial,sans-serif;">Choose your pack</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <!-- Starter -->
        <tr>
          <td style="padding:10px 16px;border:1px solid #2a2a2a;border-radius:8px;margin-bottom:8px;display:block;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#e5e5e5;font-family:'Segoe UI',Arial,sans-serif;">Starter</p>
                  <p style="margin:0;font-size:12px;color:#555;font-family:'Segoe UI',Arial,sans-serif;">5 questions</p>
                </td>
                <td align="right" style="font-size:15px;font-weight:700;color:#e5e5e5;font-family:'Segoe UI',Arial,sans-serif;">₹149</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="height:8px;"></td></tr>
        <!-- Popular -->
        <tr>
          <td style="padding:12px 16px;border:2px solid #d9277a;border-radius:8px;background:#1a0a10;display:block;position:relative;">
            <p style="margin:0 0 8px;display:inline-block;background:#d9277a;color:#fff;font-size:10px;font-weight:600;padding:2px 10px;border-radius:100px;font-family:'Segoe UI',Arial,sans-serif;letter-spacing:0.5px;">MOST POPULAR</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#ffffff;font-family:'Segoe UI',Arial,sans-serif;">Deep Dive</p>
                  <p style="margin:0;font-size:12px;color:#c084a0;font-family:'Segoe UI',Arial,sans-serif;">15 questions · Full chart analysis</p>
                </td>
                <td align="right" style="font-size:16px;font-weight:700;color:#d9277a;font-family:'Segoe UI',Arial,sans-serif;">₹399</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="height:8px;"></td></tr>
        <!-- Power -->
        <tr>
          <td style="padding:10px 16px;border:1px solid #2a2a2a;border-radius:8px;display:block;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#e5e5e5;font-family:'Segoe UI',Arial,sans-serif;">The Power Pack</p>
                  <p style="margin:0;font-size:12px;color:#555;font-family:'Segoe UI',Arial,sans-serif;">30 questions</p>
                </td>
                <td align="right" style="font-size:15px;font-weight:700;color:#e5e5e5;font-family:'Segoe UI',Arial,sans-serif;">₹699</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
        <tr>
          <td align="center">
            <a href="https://veadicastro.in/pricing" style="display:inline-block;background:#d9277a;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:600;font-family:'Segoe UI',Arial,sans-serif;letter-spacing:0.2px;">Continue My Reading</a>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td align="center">
            <p style="margin:8px 0 0;font-size:12px;color:#444;font-family:'Segoe UI',Arial,sans-serif;">No subscription · Pay once · Use anytime</p>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="padding:20px 32px;border-top:1px solid #1a1a1a;background:#0d0d0d;">
      <p style="margin:0 0 4px;font-size:12px;color:#444;font-family:'Segoe UI',Arial,sans-serif;">Veadicastro · <a href="https://veadicastro.in" style="color:#d9277a;text-decoration:none;">veadicastro.in</a></p>
      <p style="margin:0;font-size:11px;color:#333;font-family:'Segoe UI',Arial,sans-serif;">You received this because your Veadicastro credits ran out. © 2026 Veadicastro.</p>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>
`;
};

// Transporter
let zeroCreditTransporter: any;

try {
  zeroCreditTransporter = nodemailer.createTransport({
    host: process.env.ZOHO_HOST || 'smtp.zoho.in',
    port: parseInt(process.env.ZOHO_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.WELCOME_EMAIL_USER || 'no-reply@veadicastro.in',
      pass: process.env.WELCOME_EMAIL_PASS,
    },
  });
} catch (error) {
  console.error('Zero credit transporter init failed:', error);
  zeroCreditTransporter = null;
}

export async function POST(req: any) {
  try {
    if (!zeroCreditTransporter) {
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
      username = rawUsername.split(' ')[0]; // first name only
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

    // Dedup: only send once per 24 hours per user
    const logKey = `${email.toLowerCase()}_zero_credit`;
    try {
      const logDoc = await adminDb.collection('email_logs').doc(logKey).get();
      if (logDoc.exists) {
        const sentAt: Date = logDoc.data()?.sentAt?.toDate?.() || new Date(0);
        const hoursSince = (Date.now() - sentAt.getTime()) / (1000 * 60 * 60);
        if (hoursSince < 24) {
          return new Response(JSON.stringify({ success: true, message: 'Zero credit email already sent recently' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    } catch (err) {
      console.error('Firestore dedup check failed:', err);
    }

    const mailOptions = {
      from: `"Vedika from Veadicastro" <${process.env.WELCOME_EMAIL_USER || 'no-reply@veadicastro.in'}>`,
      to: email,
      subject: `Your reading paused, ${username}`,
      html: buildZeroCreditEmail(username),
    };

    try {
      await zeroCreditTransporter.sendMail(mailOptions);
      console.log('Zero credit email sent to:', email);
    } catch (emailError) {
      console.error('Zero credit email send error:', emailError);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Log it (update sentAt if exists, create if not)
    try {
      await adminDb.collection('email_logs').doc(logKey).set({
        email: email.toLowerCase(),
        sentAt: new Date(),
        type: 'zero_credit_email',
        username,
      });
    } catch (err) {
      console.error('Firestore log error:', err);
    }

    return new Response(JSON.stringify({ success: true, message: 'Zero credit email sent' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Zero credit route error:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}