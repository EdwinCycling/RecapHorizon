import Stripe from 'stripe';
import admin from 'firebase-admin';
import zlib from 'zlib';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Webhook endpoint secret for signature verification
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize Firebase Admin SDK safely (server-side only)
let adminInitialized = false;
try {
  if (!admin.apps.length) {
    const getServiceAccountJson = () => {
      const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
      if (b64 && b64.trim().length > 0) {
        try {
          const buf = Buffer.from(b64, 'base64');
          try {
            return zlib.gunzipSync(buf).toString('utf8');
          } catch {
            return buf.toString('utf8');
          }
        } catch (e) {
          console.error('Failed to decode FIREBASE_SERVICE_ACCOUNT_B64:', e);
        }
      }
      return process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    };
    const serviceAccountJson = getServiceAccountJson();
    if (!serviceAccountJson) {
      console.error('Firebase Admin not initialized: missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
    } else {
      const serviceAccount = JSON.parse(serviceAccountJson);
      const privateKey = (serviceAccount.private_key || '').replace(/\\n/g, '\n');
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
} catch (adminErr) {
  console.error('Failed to initialize Firebase Admin SDK:', adminErr);
}

function getAdminDb() {
  if (!adminInitialized) {
    throw new Error('Firebase Admin is not initialized');
  }
  return admin.firestore();
}

/**
 * Log webhook event to console (simplified for development)
 */
async function logWebhookEvent(event, status = 'received', error = null) {
  try {
    console.log(`Webhook Event: ${event.type} (${status})`, {
      eventId: event.id,
      eventType: event.type,
      status,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    });
  } catch (logError) {
    console.error('Failed to log webhook event:', logError);
  }
}

/**
 * Update user subscription data in Firebase
 */
async function updateUserSubscription(customerId, subscriptionData) {
  try {
    if (!customerId || typeof customerId !== 'string') {
      throw new Error('Invalid Stripe customer ID');
    }
    const db = getAdminDb();

    // Find user by Stripe customer ID
    const usersRef = db.collection('users');
    const q = usersRef.where('stripeCustomerId', '==', customerId).limit(1);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      console.warn(`No user found with Stripe customer ID: ${customerId}`);
      return null;
    }

    // Update the first matching user (should be unique)
    const userDoc = querySnapshot.docs[0];
    const userRef = usersRef.doc(userDoc.id);

    // Read current doc to avoid downgrading admin/diamond accounts unintentionally
    const currentData = userDoc.data() || {};
    const currentTier = (currentData.subscriptionTier || '').toLowerCase();

    const updateData = {
      ...subscriptionData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Preserve DIAMOND tier regardless of incoming subscription tier from Stripe
    if (currentTier === 'diamond' && typeof updateData.subscriptionTier === 'string') {
      delete updateData.subscriptionTier;
    }

    await userRef.update(updateData);

    console.log(`Subscription updated for user ${userDoc.id} (customer ${customerId}):`, subscriptionData);
    return userDoc.id;
  } catch (error) {
    console.error('Failed to update user subscription:', error);
    throw error;
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(subscription) {
  const subscriptionData = {
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0]?.price?.id,
    currentSubscriptionStatus: subscription.status,
    currentSubscriptionStartDate: new Date(subscription.current_period_start * 1000),
    nextBillingDate: new Date(subscription.current_period_end * 1000),
    subscriptionTier: getSubscriptionTier(subscription.items.data[0]?.price?.id),
    hasHadPaidSubscription: true // Mark that this user has a paid subscription
  };
  subscriptionData.periodStart = new Date(subscription.current_period_start * 1000);
  subscriptionData.periodEnd = new Date(subscription.current_period_end * 1000);
  subscriptionData.periodInputTokens = 0;
  subscriptionData.periodOutputTokens = 0;
  subscriptionData.periodSessionsCount = 0;
  subscriptionData.periodExtraTokens = 0;

  await updateUserSubscription(subscription.customer, subscriptionData);
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription) {
  const subscriptionData = {
    stripePriceId: subscription.items.data[0]?.price?.id,
    currentSubscriptionStatus: subscription.status,
    nextBillingDate: new Date(subscription.current_period_end * 1000),
    subscriptionTier: getSubscriptionTier(subscription.items.data[0]?.price?.id)
  };
  subscriptionData.periodStart = new Date(subscription.current_period_start * 1000);
  subscriptionData.periodEnd = new Date(subscription.current_period_end * 1000);

  // Handle cancellation at period end
  if (subscription.cancel_at_period_end) {
    subscriptionData.scheduledTierChange = {
      tier: 'free',
      effectiveDate: new Date(subscription.current_period_end * 1000),
      action: 'cancel'
    };
    subscriptionData.hasHadPaidSubscription = true; // Mark that this user had a paid subscription
  } else {
    // Clear any scheduled tier change if subscription is reactivated
    subscriptionData.scheduledTierChange = null;
  }

  await updateUserSubscription(subscription.customer, subscriptionData);
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription) {
  const subscriptionData = {
    stripeSubscriptionId: null,
    stripePriceId: null,
    currentSubscriptionStatus: 'canceled',
    subscriptionTier: 'free',
    scheduledTierChange: null,
    hasHadPaidSubscription: true // Mark that this user had a paid subscription
  };

  await updateUserSubscription(subscription.customer, subscriptionData);
}

/**
 * Handle invoice payment succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice) {
  if (invoice.subscription) {
    // Update next billing date based on the invoice
    const subscriptionData = {
      nextBillingDate: new Date(invoice.period_end * 1000),
      currentSubscriptionStatus: 'active'
    };

    await updateUserSubscription(invoice.customer, subscriptionData);

    try {
      const db = getAdminDb();
      const usersRef = db.collection('users');
      const q = usersRef.where('stripeCustomerId', '==', invoice.customer).limit(1);
      const querySnapshot = await q.get();
      if (!querySnapshot.empty) {
        const userRef = usersRef.doc(querySnapshot.docs[0].id);
        await userRef.set({
          periodEnd: new Date(invoice.period_end * 1000),
          periodInputTokens: 0,
          periodOutputTokens: 0,
          periodSessionsCount: 0,
          periodExtraTokens: 0,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.warn('Failed to reset period counters on invoice payment succeeded:', e);
    }
  }
}

/**
 * Handle invoice payment failed event
 */
async function handleInvoicePaymentFailed(invoice) {
  if (invoice.subscription) {
    const subscriptionData = {
      currentSubscriptionStatus: 'past_due'
    };

    await updateUserSubscription(invoice.customer, subscriptionData);
  }
}

/**
 * Handle checkout session completed event
 */
async function handleCheckoutSessionCompleted(session) {
  try {
    const db = getAdminDb();

    // Find user by userId from session metadata
    const userId = session.metadata?.userId;
    if (!userId || typeof userId !== 'string') {
      console.warn('No valid userId found in checkout session metadata');
      return;
    }

    const userRef = db.collection('users').doc(userId);
    await userRef.set({ stripeCustomerId: session.customer, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

    if (session.mode === 'payment') {
      try {
        const expandedSession = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items'] });
        const lineItems = expandedSession.line_items?.data || [];
        const horizonProductId = process.env.STRIPE_HORIZON_PRODUCT_ID || '';
        const hasHorizon = lineItems.some(li => li.price?.product === horizonProductId);
        if (hasHorizon) {
          const extraTokens = parseInt(process.env.STRIPE_HORIZON_EXTRA_TOKENS || process.env.VITE_HORIZON_EXTRA_TOKENS || '25000', 10);
          const extraAudio = parseInt(process.env.STRIPE_HORIZON_EXTRA_AUDIO_MINUTES || process.env.VITE_HORIZON_EXTRA_AUDIO_MINUTES || '240', 10);
          await userRef.set({
            periodExtraTokens: admin.firestore.FieldValue.increment(isNaN(extraTokens) ? 25000 : extraTokens),
            extraAudioMinutesBalance: admin.firestore.FieldValue.increment(isNaN(extraAudio) ? 240 : extraAudio),
            // Optional: store extra audio minutes if applicable in UI later
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
      } catch (ex) {
        console.warn('Failed to process horizon addon from checkout session:', ex);
      }
    }
  } catch (error) {
    console.error('Failed to handle checkout session completed:', error);
    throw error;
  }
}

/**
 * Get subscription tier based on Stripe price ID
 */
function getSubscriptionTier(priceId) {
  // Mapping met echte Stripe price IDs
  const priceToTierMap = {
    // Echte test price IDs
    'price_1SAqtAESsR0kFO8LXWG9X96B': 'silver',
    'price_1SAqtZESsR0kFO8LCZfX6PzK': 'gold',
    // Enterprise nog niet aangemaakt
    'price_enterprise_monthly': 'enterprise'
  };

  return priceToTierMap[priceId] || 'free';
}

/**
 * Main webhook handler
 */
export async function handler(event) {
  console.log('Webhook received:', event.httpMethod, event.headers);
  
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Error: Method not allowed' })
      };
    }
    
    // Check for required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error: Server configuration error (missing STRIPE_SECRET_KEY)' })
      };
    }
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error: Server configuration error (missing STRIPE_WEBHOOK_SECRET)' })
      };
    }

    // Decode raw body correctly for Stripe signature verification
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : (event.body || '');

    const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'] || event.headers['STRIPE-SIGNATURE'];
    if (!sig) {
      console.error('Missing Stripe signature header');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Error: Missing Stripe signature header' })
      };
    }

    let stripeEvent;

    try {
      // Verify webhook signature
      stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Error: Webhook signature verification failed' })
      };
    }

    // Check Firebase Admin configuration
    if (!adminInitialized) {
      console.error('Firebase Admin not initialized - ensure FIREBASE_SERVICE_ACCOUNT is set');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error: Firebase Admin configuration error (missing FIREBASE_SERVICE_ACCOUNT)' })
      };
    }

    // Log the webhook event
    await logWebhookEvent(stripeEvent);
 
    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(stripeEvent.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripeEvent.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    // Update webhook log status to processed
    await logWebhookEvent(stripeEvent, 'processed');

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Log the error
    if (typeof stripeEvent !== 'undefined') {
      await logWebhookEvent(stripeEvent, 'error', error);
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error: Internal server error' })
    };
  }
}