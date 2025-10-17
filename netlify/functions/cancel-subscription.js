import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Schedule subscription cancellation at period end for a given Stripe customer.
 * This avoids sending users to the Customer Portal and keeps the UI in-sync.
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
          details: 'STRIPE_SECRET_KEY is not set for serverless functions. Configure it in your Netlify environment or .env file.'
        })
      };
    }

    const { customerId } = JSON.parse(event.body || '{}');

    // Validate required parameters
    if (!customerId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ 
          error: 'Missing required parameter: customerId' 
        })
      };
    }

    // Find the active subscription for this customer
    const list = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (!list.data || list.data.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ error: 'No active subscription found for customer' })
      };
    }

    const subscription = list.data[0];

    // If already scheduled, just return information
    if (subscription.cancel_at_period_end) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          scheduled: true,
          effectiveDate: new Date(subscription.current_period_end * 1000).toISOString(),
          subscriptionId: subscription.id
        })
      };
    }

    // Schedule cancellation at period end
    const updated = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        scheduled: true,
        effectiveDate: new Date(updated.current_period_end * 1000).toISOString(),
        subscriptionId: updated.id
      })
    };

  } catch (error) {
    console.error('Error scheduling subscription cancellation:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: (error && error.message) ? error.message : String(error)
      })
    };
  }
}