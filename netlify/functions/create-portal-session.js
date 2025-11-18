import Stripe from 'stripe';
import admin from 'firebase-admin';
import zlib from 'zlib';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

function normalizeOrigin(url) {
  try { return new URL(url).origin; } catch { return (url || '').trim(); }
}

function getOrigin(event) {
  const o = event.headers?.origin || '';
  return o;
}

function isOriginAllowed(event) {
  const list = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const maybeEnvOrigins = [process.env.URL, process.env.DEPLOY_URL, process.env.DEPLOY_PRIME_URL, process.env.SITE_URL]
    .map(v => (v || '').trim())
    .filter(Boolean)
    .map(normalizeOrigin);
  const allowed = new Set([...list.map(normalizeOrigin), ...maybeEnvOrigins]);
  if (allowed.size === 0) return true;
  const origin = normalizeOrigin(getOrigin(event));
  return allowed.has(origin);
}

let adminInitialized = false;
try {
  if (!admin.apps.length) {
    const getServiceAccountJson = () => {
      const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
      if (b64 && b64.trim().length > 0) {
        try {
          const buf = Buffer.from(b64, 'base64');
          try { return zlib.gunzipSync(buf).toString('utf8'); } catch { return buf.toString('utf8'); }
        } catch {}
      }
      return process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    };
    const serviceAccountJson = getServiceAccountJson();
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      const privateKey = (serviceAccount.private_key || '').replace(/\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey
        })
      });
      adminInitialized = true;
    }
  } else {
    adminInitialized = true;
  }
} catch {}

async function requireAuth(event) {
  const authz = event.headers?.authorization || event.headers?.Authorization || '';
  const token = authz.startsWith('Bearer ') ? authz.slice(7).trim() : '';
  if (!token || !adminInitialized) throw new Error('Unauthorized');
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded;
}

/**
 * Create a Stripe Customer Portal Session
 */
export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': isOriginAllowed(event) ? getOrigin(event) : 'null',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': isOriginAllowed(event) ? getOrigin(event) : 'null',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Validate environment configuration
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.trim().length === 0) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': getOrigin(event),
          'Access-Control-Allow-Headers': 'Content-Type',
          'Vary': 'Origin'
        },
        body: JSON.stringify({
          error: 'Stripe configuration error',
          details: 'STRIPE_SECRET_KEY is not set for serverless functions. Configure it in your Netlify environment or .env file.'
        })
      };
    }

    if (!isOriginAllowed(event)) {
      return { statusCode: 403, headers: { 'Access-Control-Allow-Origin': 'null', 'Vary': 'Origin' }, body: JSON.stringify({ error: 'Error: Origin not allowed' }) };
    }

    const ct = String(event.headers?.['content-type'] || event.headers?.['Content-Type'] || '').toLowerCase();
    if (!ct.includes('application/json')) {
      return { statusCode: 415, headers: { 'Access-Control-Allow-Origin': getOrigin(event), 'Vary': 'Origin' }, body: JSON.stringify({ error: 'Unsupported Media Type' }) };
    }

    const { customerId, returnUrl } = JSON.parse(event.body);

    // Validate required parameters
    if (!customerId || !returnUrl) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': getOrigin(event),
          'Access-Control-Allow-Headers': 'Content-Type',
          'Vary': 'Origin'
        },
        body: JSON.stringify({ 
          error: 'Missing required parameters: customerId, returnUrl' 
        })
      };
    }

    let decoded;
    try { decoded = await requireAuth(event); } catch {
      return { statusCode: 401, headers: { 'Access-Control-Allow-Origin': getOrigin(event), 'Vary': 'Origin' }, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    try {
      const db = adminInitialized ? admin.firestore() : null;
      if (!db) throw new Error('Firebase Admin not available');
      const usersRef = db.collection('users');
      const q = usersRef.where('stripeCustomerId', '==', customerId).limit(1);
      const snap = await q.get();
      if (snap.empty || snap.docs[0].id !== decoded.uid) {
        return { statusCode: 403, headers: { 'Access-Control-Allow-Origin': getOrigin(event), 'Vary': 'Origin' }, body: JSON.stringify({ error: 'Forbidden: customer mismatch' }) };
      }
    } catch {}

    // Create Customer Portal Session
    const base = normalizeOrigin(process.env.URL || process.env.SITE_URL || process.env.DEPLOY_URL || process.env.DEPLOY_PRIME_URL || getOrigin(event));
    const returnPath = (process.env.PORTAL_RETURN_PATH || '/account').trim();
    const returnUrlFinal = `${base}${returnPath.startsWith('/') ? returnPath : `/${returnPath}`}`;
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrlFinal,
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': getOrigin(event),
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin'
      },
      body: JSON.stringify({
        url: session.url
      })
    };

  } catch (error) {
    console.error('Error creating portal session:', error);
    
    // Handle specific Stripe errors
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid Stripe request';
      statusCode = 400;
    } else if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe authentication failed';
      statusCode = 401;
    } else if (error.type === 'StripePermissionError') {
      errorMessage = 'Stripe permission denied';
      statusCode = 403;
    } else if (error.type === 'StripeRateLimitError') {
      errorMessage = 'Stripe rate limit exceeded';
      statusCode = 429;
    }
    
    return {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': getOrigin(event),
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin'
      },
      body: JSON.stringify({ 
        error: errorMessage,
        details: (error && error.message) ? error.message : String(error),
        stripeErrorType: error.type || 'unknown'
      })
    };
  }
}