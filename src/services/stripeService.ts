import { SubscriptionTier } from '../../types';

// Stripe Price IDs - echte test price IDs uit Stripe Dashboard
const STRIPE_PRICE_IDS = {
  [SubscriptionTier.SILVER]: {
    monthly: 'price_1SAqtAESsR0kFO8LXWG9X96B'
  },
  [SubscriptionTier.GOLD]: {
    monthly: 'price_1SAqtZESsR0kFO8LCZfX6PzK'
  },
  [SubscriptionTier.ENTERPRISE]: {
    monthly: 'price_enterprise_monthly' // Nog niet aangemaakt
  }
};

interface CreateCheckoutSessionRequest {
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

class StripeService {
  private baseUrl: string;

  constructor() {
    // Voor development gebruik je localhost, voor productie je Netlify URL
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://recaphorizon.netlify.app/.netlify/functions' 
      : 'http://localhost:8888/.netlify/functions';
  }

  /**
   * Krijg de Stripe Price ID voor een specifieke tier (alleen monthly voor nu)
   */
  getPriceId(tier: SubscriptionTier): string | null {
    const tierPrices = STRIPE_PRICE_IDS[tier];
    return tierPrices ? tierPrices.monthly : null;
  }

  /**
   * Maak een Stripe Checkout sessie aan
   */
  async createCheckoutSession({
    priceId,
    userId,
    userEmail,
    successUrl,
    cancelUrl
  }: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          userEmail,
          successUrl,
          cancelUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Redirect naar Stripe Checkout (alleen monthly billing)
   */
  async redirectToCheckout(tier: SubscriptionTier, userId: string, userEmail: string): Promise<void> {
    const priceId = this.getPriceId(tier);
    
    if (!priceId) {
      throw new Error(`No price ID found for tier ${tier}`);
    }

    // Store tier and email for success modal
    localStorage.setItem('checkout_tier', tier);
    localStorage.setItem('checkout_email', userEmail);

    const successUrl = `${window.location.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/pricing?canceled=true`;

    try {
      const { url } = await this.createCheckoutSession({
        priceId,
        userId,
        userEmail,
        successUrl,
        cancelUrl
      });

      // Redirect naar Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }

  /**
   * Maak een Customer Portal sessie aan voor bestaande klanten
   */
  async createCustomerPortalSession(customerId: string): Promise<{ url: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: `${window.location.origin}?portal_return=true`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create portal session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }

  /**
   * Redirect naar Stripe Customer Portal
   */
  async redirectToCustomerPortal(customerId: string): Promise<void> {
    try {
      const { url } = await this.createCustomerPortalSession(customerId);
      window.location.href = url;
    } catch (error) {
      console.error('Error redirecting to customer portal:', error);
      throw error;
    }
  }
}

export const stripeService = new StripeService();
export default stripeService;