import Stripe from 'stripe';
import admin from 'firebase-admin';

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'VERVANG_MET_ECHTE_STRIPE_TEST_SECRET_KEY') {
  console.error('STRIPE_SECRET_KEY is missing or not configured properly');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Initialize Firebase Admin SDK safely (server-side only)
let adminInitialized = false;
try {
  if (!admin.apps.length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
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
      console.log('Firebase Admin SDK initialized successfully');
    }
  } else {
    adminInitialized = true;
    console.log('Firebase Admin SDK already initialized');
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
 * Map Stripe price ID to subscription tier
 */
function getSubscriptionTier(priceId) {
  const priceToTierMap = {
    'price_1QKjJJP8Ej8Ej8Ej8Ej8Ej8E': 'silver',
    'price_1QKjJKP8Ej8Ej8Ej8Ej8Ej8E': 'gold',
    'price_1QKjJLP8Ej8Ej8Ej8Ej8Ej8E': 'diamond'
  };
  return priceToTierMap[priceId] || 'free';
}

/**
 * Update user subscription data in Firebase
 */
async function updateUserSubscription(customerId, subscriptionData) {
  try {
    if (!customerId || typeof customerId !== 'string') {
      throw new Error('Invalid Stripe customer ID');
    }
    
    if (!adminInitialized) {
      console.warn('Firebase Admin not initialized, skipping Firebase update');
      return null;
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

    const updateData = {
      ...subscriptionData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await userRef.update(updateData);

    console.log(`Subscription updated for user ${userDoc.id} (customer ${customerId}):`, subscriptionData);
    return userDoc.id;
  } catch (error) {
    console.error('Failed to update user subscription:', error);
    throw error;
  }
}

/**
 * Reactivate a canceled subscription by creating a new subscription
 * with a start date at the end of the current period
 */
export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          error: 'Stripe configuration error',
          details: 'STRIPE_SECRET_KEY is not set for serverless functions. Configure it in your Netlify environment or .env file.',
          availableStripeVars: Object.keys(process.env).filter(key => key.includes('STRIPE'))
        })
      };
    }

    const { customerId, priceId, startDate } = JSON.parse(event.body);

    // Validate required parameters
    if (!customerId || !priceId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ 
          error: 'Missing required parameters: customerId, priceId' 
        })
      };
    }

    // Validate startDate if provided
    let subscriptionStartDate = null;
    if (startDate) {
      subscriptionStartDate = Math.floor(new Date(startDate).getTime() / 1000);
      if (isNaN(subscriptionStartDate)) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({ 
            error: 'Invalid startDate format. Use ISO 8601 format.' 
          })
        };
      }
    }

    // Create new subscription
    const subscriptionParams = {
      customer: customerId,
      items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        reactivated: 'true',
        reactivated_at: new Date().toISOString()
      }
    };

    // Add start_date if provided
    if (subscriptionStartDate) {
      subscriptionParams.billing_cycle_anchor = subscriptionStartDate;
      subscriptionParams.proration_behavior = 'none';
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);

    // Update Firebase immediately after creating subscription (optional)
    let firebaseUpdated = false;
    try {
      if (adminInitialized) {
        const subscriptionData = {
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price?.id,
          currentSubscriptionStatus: subscription.status,
          currentSubscriptionStartDate: new Date(subscription.current_period_start * 1000),
          nextBillingDate: new Date(subscription.current_period_end * 1000),
          subscriptionTier: getSubscriptionTier(subscription.items.data[0]?.price?.id),
          hasHadPaidSubscription: true,
          scheduledTierChange: null // Clear any scheduled cancellation
        };

        const updateResult = await updateUserSubscription(customerId, subscriptionData);
        if (updateResult !== null) {
          firebaseUpdated = true;
          console.log('Firebase updated successfully after reactivation');
        } else {
          console.log('Firebase update skipped - user not found or Firebase not available');
        }
      } else {
        console.log('Firebase update skipped - Firebase Admin not initialized');
      }
    } catch (firebaseError) {
      console.error('Failed to update Firebase after reactivation:', firebaseError);
      // Don't fail the entire request if Firebase update fails
      // The webhook will handle it as a fallback
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
        firebaseUpdated: firebaseUpdated // Indicate whether Firebase was updated
      })
    };

  } catch (error) {
    console.error('Error reactivating subscription:', error);
    
    // Handle specific Stripe errors
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    let stripeErrorType = null;
    
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid Stripe request';
      statusCode = 400;
      stripeErrorType = 'StripeInvalidRequestError';
    } else if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe authentication failed';
      statusCode = 401;
      stripeErrorType = 'StripeAuthenticationError';
    } else if (error.type === 'StripePermissionError') {
      errorMessage = 'Stripe permission denied';
      statusCode = 403;
      stripeErrorType = 'StripePermissionError';
    } else if (error.type === 'StripeRateLimitError') {
      errorMessage = 'Stripe rate limit exceeded';
      statusCode = 429;
      stripeErrorType = 'StripeRateLimitError';
    } else if (error.type === 'StripeConnectionError') {
      errorMessage = 'Stripe connection error';
      statusCode = 502;
      stripeErrorType = 'StripeConnectionError';
    } else if (error.type === 'StripeAPIError') {
      errorMessage = 'Stripe API error';
      statusCode = 502;
      stripeErrorType = 'StripeAPIError';
    }
    
    return {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        error: errorMessage,
        details: error.message,
        stripeErrorType: stripeErrorType
      })
    };
  }
}