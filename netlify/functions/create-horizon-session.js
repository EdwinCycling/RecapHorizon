import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'VERVANG_MET_ECHTE_STRIPE_TEST_SECRET_KEY') {
  console.error('STRIPE_SECRET_KEY is missing or not configured properly');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function handler(event) {
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
    const { productId, priceId, userId, userEmail, successUrl, cancelUrl } = JSON.parse(event.body);

    if ((!productId && !priceId) || !userId || !userEmail || !successUrl || !cancelUrl) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          error: 'Missing required parameters: productId or priceId, userId, userEmail, successUrl, cancelUrl'
        })
      };
    }

    let resolvedPriceId = priceId || null;
    if (!resolvedPriceId && productId) {
      const prices = await stripe.prices.list({ product: productId, active: true, limit: 1 });
      if (!prices.data.length) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({ error: 'No active price found for product' })
        };
      }
      resolvedPriceId = prices.data[0].id;
    }

    let customerId;
    const existingCustomers = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId }
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        { price: resolvedPriceId, quantity: 1 }
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, horizon_addon: 'true' }
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ sessionId: session.id, url: session.url })
    };
  } catch (error) {
    console.error('Error creating horizon payment session:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
}