import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Create a Stripe Customer Portal Session
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
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('STRIPE')));
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

    const { customerId, returnUrl } = JSON.parse(event.body);

    // Validate required parameters
    if (!customerId || !returnUrl) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ 
          error: 'Missing required parameters: customerId, returnUrl' 
        })
      };
    }

    // Create Customer Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        error: errorMessage,
        details: (error && error.message) ? error.message : String(error),
        stripeErrorType: error.type || 'unknown'
      })
    };
  }
}