// Netlify Function: referral-enroll
const crypto = require('crypto');
const admin = require('firebase-admin');

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_ATTEMPTS_PER_HOUR = 3; // Maximum referral enrollment attempts per hour

function initAdmin() {
  if (admin.apps.length === 0) {
    const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (sa) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(sa))
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}

function isValidPayPalMe(link) {
  const trimmed = String(link || '').trim();
  if (!trimmed) return false;
  // Allow with or without protocol, but must contain paypal.me/<handle>
  const re = /^(https?:\/\/)?(www\.)?paypal\.me\/[A-Za-z0-9_.-]+(\/)?$/i;
  return re.test(trimmed);
}

function generateCode(len = 20) {
  return crypto.randomBytes(len)
    .toString('base64')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, len);
}

async function checkRateLimit(db, uid) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Check rate limit collection for this user
  const rateLimitRef = db.collection('rateLimits').doc(`referral_enroll_${uid}`);
  const rateLimitDoc = await rateLimitRef.get();
  
  if (rateLimitDoc.exists) {
    const data = rateLimitDoc.data();
    const attempts = data.attempts || [];
    
    // Filter attempts within the current window
    const recentAttempts = attempts.filter(timestamp => timestamp > windowStart);
    
    if (recentAttempts.length >= MAX_ATTEMPTS_PER_HOUR) {
      const oldestAttempt = Math.min(...recentAttempts);
      const timeUntilReset = Math.ceil((oldestAttempt + RATE_LIMIT_WINDOW - now) / 1000 / 60); // minutes
      throw new Error(`rate-limit-exceeded:${timeUntilReset}`);
    }
    
    // Update with new attempt
    const updatedAttempts = [...recentAttempts, now];
    await rateLimitRef.set({ attempts: updatedAttempts }, { merge: true });
  } else {
    // First attempt for this user
    await rateLimitRef.set({ attempts: [now] });
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  try {
    initAdmin();

    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, headers: corsHeaders(), body: 'Unauthorized' };
    }
    const idToken = authHeader.substring('Bearer '.length);
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      return { statusCode: 401, headers: corsHeaders(), body: 'Invalid token' };
    }

    const uid = decoded.uid;
    const body = JSON.parse(event.body || '{}');
    const paypalMeLink = body.paypalMeLink;

    if (!isValidPayPalMe(paypalMeLink)) {
      return { statusCode: 400, headers: corsHeaders(), body: 'Invalid PayPal.Me link' };
    }

    const db = admin.firestore();
    
    // Check rate limit before proceeding
    try {
      await checkRateLimit(db, uid);
    } catch (error) {
      if (error.message.startsWith('rate-limit-exceeded:')) {
        const minutes = error.message.split(':')[1];
        return { 
          statusCode: 429, 
          headers: corsHeaders(), 
          body: JSON.stringify({
            error: 'rate-limit-exceeded',
            message: `Te veel pogingen. Probeer opnieuw over ${minutes} minuten.`,
            retryAfterMinutes: parseInt(minutes)
          })
        };
      }
      throw error;
    }
    
    let generatedCode = null;

    await db.runTransaction(async (tx) => {
      const userRef = db.collection('users').doc(uid);
      const snap = await tx.get(userRef);
      if (!snap.exists) {
        throw new Error('user-not-found');
      }
      const data = snap.data() || {};
      if (data.referralProfile) {
        throw new Error('already-enrolled');
      }

      // Generate unique code
      let code = generateCode(20);
      for (let attempts = 0; attempts < 5; attempts++) {
        const qSnap = await db.collection('users')
          .where('referralProfile.code', '==', code)
          .get();
        if (qSnap.empty) {
          generatedCode = code;
          break;
        }
        code = generateCode(20);
      }
      if (!generatedCode) {
        throw new Error('code-collision');
      }

      tx.update(userRef, {
        referralProfile: {
          code: generatedCode,
          paypalMeLink,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    const base = process.env.SITE_URL || '';
    const baseClean = base ? String(base).replace(/\/$/, '') : '';
    const joinUrl = `${baseClean}/?ref=${encodeURIComponent(generatedCode)}`;

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ code: generatedCode, joinUrl })
    };
  } catch (err) {
    const msg = String((err && err.message) || 'Error');
    if (msg === 'already-enrolled') {
      return { statusCode: 409, headers: corsHeaders(), body: 'Already enrolled' };
    }
    if (msg === 'user-not-found') {
      return { statusCode: 404, headers: corsHeaders(), body: 'User not found' };
    }
    if (msg === 'code-collision') {
      return { statusCode: 503, headers: corsHeaders(), body: 'Please try again' };
    }
    return { statusCode: 500, headers: corsHeaders(), body: 'Server error' };
  }
};