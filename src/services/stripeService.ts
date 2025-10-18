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

interface ReactivateSubscriptionRequest {
  customerId: string;
  priceId: string;
  startDate?: string;
}

interface ReactivateSubscriptionResponse {
  subscriptionId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
}

class StripeService {
  private baseUrl: string;

  constructor() {
    // Voor development gebruik je de huidige origin (Netlify dev proxy), voor productie je Netlify URL
    // Dit voorkomt harde koppeling aan een specifieke poort (zoals 8888) die kan wisselen.
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    this.baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://recaphorizon.netlify.app/.netlify/functions'
      : `${origin}/.netlify/functions`;
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
        let errorText = 'Failed to create portal session';
        try {
          const errorData = await response.json();
          if (errorData) {
            if (errorData.error && errorData.details) {
              errorText = `${errorData.error}: ${errorData.details}`;
            } else if (errorData.error) {
              errorText = errorData.error;
            } else if (errorData.details) {
              errorText = errorData.details;
            }
          }
        } catch {
          try {
            const text = await response.text();
            if (text) errorText = text;
          } catch {}
        }
        throw new Error(errorText);
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

  /**
   * Annuleer abonnement aan einde van de periode (zonder Customer Portal)
   */
  async cancelSubscriptionAtPeriodEnd(customerId: string): Promise<{ effectiveDate: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId })
      });

      if (!response.ok) {
        let errorText = 'Failed to cancel subscription';
        try {
          const errorData = await response.json();
          if (errorData) {
            if (errorData.error && errorData.details) {
              errorText = `${errorData.error}: ${errorData.details}`;
            } else if (errorData.error) {
              errorText = errorData.error;
            } else if (errorData.details) {
              errorText = errorData.details;
            }
          }
        } catch {
          try {
            const text = await response.text();
            if (text) errorText = text;
          } catch {}
        }
        throw new Error(errorText);
      }

      const data = await response.json();
      return { effectiveDate: data.effectiveDate };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Heractiveer een geannuleerd abonnement door een nieuw abonnement aan te maken
   */
  async reactivateSubscription({
    customerId,
    priceId,
    startDate
  }: ReactivateSubscriptionRequest): Promise<ReactivateSubscriptionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/reactivate-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          priceId,
          startDate
        })
      });

      if (!response.ok) {
        let errorText = 'Failed to reactivate subscription';
        try {
          const errorData = await response.json();
          if (errorData) {
            if (errorData.error && errorData.details) {
              errorText = `${errorData.error}: ${errorData.details}`;
            } else if (errorData.error) {
              errorText = errorData.error;
            } else if (errorData.details) {
              errorText = errorData.details;
            }
          }
        } catch {
          try {
            const text = await response.text();
            if (text) errorText = text;
          } catch {}
        }
        throw new Error(errorText);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }
}

export const stripeService = new StripeService();
export default stripeService;