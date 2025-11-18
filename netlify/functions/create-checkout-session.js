import Stripe from 'stripe';
import admin from 'firebase-admin';
import zlib from 'zlib';

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'VERVANG_MET_ECHTE_STRIPE_TEST_SECRET_KEY') {
  console.error('STRIPE_SECRET_KEY is missing or not configured properly');
}

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
 * Create a Stripe Checkout Session
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
    if (!isOriginAllowed(event)) {
      return {
        statusCode: 403,
        headers: { 'Access-Control-Allow-Origin': 'null', 'Vary': 'Origin' },
        body: JSON.stringify({ error: 'Error: Origin not allowed' })
      };
    }

    const ct = String(event.headers?.['content-type'] || event.headers?.['Content-Type'] || '').toLowerCase();
    if (!ct.includes('application/json')) {
      return {
        statusCode: 415,
        headers: { 'Access-Control-Allow-Origin': getOrigin(event), 'Vary': 'Origin' },
        body: JSON.stringify({ error: 'Unsupported Media Type' })
      };
    }

    if ((event.body || '').length > 100 * 1024) {
      return {
        statusCode: 413,
        headers: { 'Access-Control-Allow-Origin': getOrigin(event), 'Vary': 'Origin' },
        body: JSON.stringify({ error: 'Payload too large' })
      };
    }

    const { priceId, userId, userEmail, successUrl, cancelUrl } = JSON.parse(event.body || '{}');

    // Validate required parameters
    if (!priceId || !userId || !userEmail) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': getOrigin(event),
          'Access-Control-Allow-Headers': 'Content-Type',
          'Vary': 'Origin'
        },
        body: JSON.stringify({ 
          error: 'Missing required parameters: priceId, userId, userEmail' 
        })
      };
    }

    let decoded;
    try { decoded = await requireAuth(event); } catch {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': getOrigin(event), 'Vary': 'Origin' },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    if (decoded.uid !== userId || (decoded.email && decoded.email !== userEmail)) {
      return {
        statusCode: 403,
        headers: { 'Access-Control-Allow-Origin': getOrigin(event), 'Vary': 'Origin' },
        body: JSON.stringify({ error: 'Forbidden: user mismatch' })
      };
    }

    const envPriceIds = (process.env.ALLOWED_PRICE_IDS || process.env.STRIPE_ALLOWED_PRICE_IDS || '')
      .split(',').map(s => s.trim()).filter(Boolean);
    const fallbackIds = ['price_1SAqtAESsR0kFO8LXWG9X96B','price_1SAqtZESsR0kFO8LCZfX6PzK'];
    const allowedSet = new Set([...envPriceIds, ...fallbackIds]);
    if (!allowedSet.has(priceId)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': getOrigin(event), 'Vary': 'Origin' },
        body: JSON.stringify({ error: 'Invalid priceId' })
      };
    }

    const base = normalizeOrigin(process.env.URL || process.env.SITE_URL || process.env.DEPLOY_URL || process.env.DEPLOY_PRIME_URL || getOrigin(event));
    const okPath = (process.env.CHECKOUT_SUCCESS_PATH || '/checkout/success').trim();
    const cancelPath = (process.env.CHECKOUT_CANCEL_PATH || '/checkout/cancel').trim();
    const successUrlFinal = `${base}${okPath.startsWith('/') ? okPath : `/${okPath}`}`;
    const cancelUrlFinal = `${base}${cancelPath.startsWith('/') ? cancelPath : `/${cancelPath}`}`;

    // Create or retrieve Stripe customer
    let customerId;
    
    // Try to find existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });
    
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId
        }
      });
      customerId = customer.id;
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrlFinal,
      cancel_url: cancelUrlFinal,
      metadata: {
        userId: userId
      },
      subscription_data: {
        metadata: {
          userId: userId
        }
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': getOrigin(event),
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin'
      },
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url
      })
    };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Check for Stripe authentication errors
    if (error.statusCode === 401) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': getOrigin(event),
          'Access-Control-Allow-Headers': 'Content-Type',
          'Vary': 'Origin'
        },
        body: JSON.stringify({ 
          error: 'Stripe configuration error',
          details: 'Invalid Stripe secret key. Please check your STRIPE_SECRET_KEY environment variable.'
        })
      };
    }
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': getOrigin(event),
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
}