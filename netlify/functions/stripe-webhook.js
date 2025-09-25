import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Webhook endpoint secret for signature verification
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
    // Import Firebase functions
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, query, where, getDocs, updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
    
    // Initialize Firebase (using environment variables)
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    };
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Find user by Stripe customer ID
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('stripeCustomerId', '==', customerId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.warn(`No user found with Stripe customer ID: ${customerId}`);
      return null;
    }
    
    // Update the first matching user (should be unique)
    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, 'users', userDoc.id);
    
    const updateData = {
      ...subscriptionData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(userRef, updateData);
    
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

  // Handle cancellation at period end
  if (subscription.cancel_at_period_end) {
    subscriptionData.scheduledTierChange = {
      newTier: 'free',
      effectiveDate: new Date(subscription.current_period_end * 1000),
      reason: 'cancellation'
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
    // Import Firebase functions
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, query, where, getDocs, updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
    
    // Initialize Firebase (using environment variables)
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID
    };
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Find user by userId from session metadata
    const userId = session.metadata?.userId;
    if (!userId) {
      console.warn('No userId found in checkout session metadata');
      return;
    }
    
    // Update user with Stripe customer ID
    const userRef = doc(db, 'users', userId);
    const updateData = {
      stripeCustomerId: session.customer,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(userRef, updateData);
    
    console.log(`Stripe customer ID ${session.customer} linked to user ${userId}`);
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
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    // Verify webhook signature
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Webhook signature verification failed' })
    };
  }

  // Log the webhook event
  await logWebhookEvent(stripeEvent);

  try {
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
    await logWebhookEvent(stripeEvent, 'error', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}