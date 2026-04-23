export const runtime = 'edge';

import admin from 'firebase-admin';

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

export async function POST(req: any, res: any) {
  try {
    // Parse request body from Vercel serverless function
    let email, otp;
    try {
      const body = await req.json();
      email = body.email;
      otp = body.otp;
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!email || !otp || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Email and OTP are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailLower = email.toLowerCase();

    // Get OTP document from Firestore
    const otpDoc = await adminDb.collection('otp_codes').doc(emailLower).get();

    if (!otpDoc.exists) {
      return new Response(JSON.stringify({ error: 'Invalid OTP or OTP expired' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const otpData = otpDoc.data();
    if (!otpData) {
      return new Response(JSON.stringify({ error: 'Invalid OTP or OTP expired' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt.toMillis()) {
      // Clean up expired OTP
      await adminDb.collection('otp_codes').doc(emailLower).delete();
      return new Response(JSON.stringify({ error: 'OTP expired. Please request a new one.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check OTP attempts (max 3 attempts)
    if (otpData.attempts >= 3) {
      // Delete OTP after 3 failed attempts
      await adminDb.collection('otp_codes').doc(emailLower).delete();
      return new Response(JSON.stringify({ error: 'Too many failed attempts. Please request a new OTP.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      // Increment attempt count
      await adminDb.collection('otp_codes').doc(emailLower).update({
        attempts: otpData.attempts + 1,
      });

      const remainingAttempts = 3 - (otpData.attempts + 1);
      return new Response(JSON.stringify({ 
        error: 'Invalid OTP',
        remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // OTP is valid - delete it to prevent reuse
    await adminDb.collection('otp_codes').doc(emailLower).delete();

    // Check if user exists, create if not
    const userDoc = await adminDb.collection('users').doc(emailLower).get();

    if (!userDoc.exists) {
      // Create new user
      const newUser = {
        email: emailLower,
        planName: 'Free',
        isPremium: false,
        questionsUsed: 0,
        reportsUsed: 0,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      try {
        await adminDb.collection('users').doc(emailLower).set(newUser);
      } catch (firestoreError) {
        console.error('Failed to create user in Firestore:', firestoreError);
        // Continue anyway - email verification is more important
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Login successful',
        user: newUser,
        isNewUser: true,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update existing user's last login
    const userData = userDoc.data();
    try {
      await adminDb.collection('users').doc(emailLower).update({
        lastLoginAt: new Date(),
      });
    } catch (firestoreError) {
      console.error('Failed to update user in Firestore:', firestoreError);
      // Continue anyway - email verification is more important
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Login successful',
      user: {
        ...userData,
        email: emailLower,
        lastLoginAt: new Date(),
      },
      isNewUser: false,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return new Response(JSON.stringify({ error: 'Failed to verify OTP. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
