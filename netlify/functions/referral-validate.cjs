// Netlify Function: referral-validate
const admin = require('firebase-admin');

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_ATTEMPTS_PER_HOUR = 20; // Maximum validation attempts per hour per IP

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
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}

async function checkRateLimit(db, clientIP) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Check rate limit collection for this IP
  const rateLimitRef = db.collection('rateLimits').doc(`referral_validate_${clientIP.replace(/[^a-zA-Z0-9]/g, '_')}`);
  const rateLimitDoc = await rateLimitRef.get();
  
  if (rateLimitDoc.exists) {
    const data = rateLimitDoc.data();
    const attempts = data.attempts || [];
    
    // Filter attempts within the current window
    const recentAttempts = attempts.filter(timestamp => timestamp > windowStart);
    
    if (recentAttempts.length >= MAX_ATTEMPTS_PER_HOUR) {
      const oldestAttempt = Math.min(...recentAttempts);
      const timeUntilReset = Math.ceil((oldestAttempt + RATE_LIMIT_WINDOW - now) / 1000 / 60); // minutes
      throw new Error(`Rate limit exceeded. Try again in ${timeUntilReset} minutes.`);
    }
    
    // Update with new attempt
    const updatedAttempts = [...recentAttempts, now];
    await rateLimitRef.set({ attempts: updatedAttempts }, { merge: true });
  } else {
    // First attempt for this IP
    await rateLimitRef.set({ attempts: [now] });
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: corsHeaders(), 
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    initAdmin();
    const db = admin.firestore();

    // Get client IP for rate limiting
    const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
    
    // Check rate limit
    await checkRateLimit(db, clientIP);

    const body = JSON.parse(event.body || '{}');
    const { referralCode } = body;

    if (!referralCode || typeof referralCode !== 'string') {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ 
          isValid: false, 
          error: 'Invalid referral code format' 
        })
      };
    }

    // Validate referral code
    const referralCodeRef = db.collection('referral_codes').doc(referralCode);
    const referralCodeDoc = await referralCodeRef.get();

    if (!referralCodeDoc.exists) {
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ 
          isValid: false, 
          error: 'Referral code not found' 
        })
      };
    }

    const referralData = referralCodeDoc.data();

    // Check if referral code is active
    if (!referralData.active) {
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ 
          isValid: false, 
          error: 'Referral code is inactive' 
        })
      };
    }

    // Return validation result with safe referrer data
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        isValid: true,
        referrerData: {
          userEmail: referralData.userEmail,
          createdAt: referralData.createdAt,
          // Only include safe, non-sensitive data
        }
      })
    };

  } catch (error) {
    console.error('Referral validation error:', error);
    
    if (error.message.includes('Rate limit exceeded')) {
      return {
        statusCode: 429,
        headers: corsHeaders(),
        body: JSON.stringify({ 
          isValid: false, 
          error: error.message 
        })
      };
    }

    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ 
        isValid: false, 
        error: 'Internal server error' 
      })
    };
  }
};