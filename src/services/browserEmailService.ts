// Browser-compatible email service that uses serverless functions
export interface EmailData {
  email: string;
  confirmationCode?: string;
  expiryHours?: number;
  supportEmail?: string;
  language?: string;
  [key: string]: any;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class BrowserEmailService {
  private baseUrl: string;

  constructor() {
    // In development and production, use the current domain
    // Netlify functions are proxied through the same server
    this.baseUrl = window.location.origin;
  }

  async send2FAWaitlistEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      const response = await fetch(`${this.baseUrl}/.netlify/functions/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailType: '2fa_waitlist',
          emailData: {
            email: emailData.email,
            confirmationCode: emailData.confirmationCode,
            expiryHours: emailData.expiryHours || 24,
            supportEmail: emailData.supportEmail || 'support@recaphorizon.com',
            language: emailData.language || 'en'
          }
        })
      });

      // Check if response is ok first
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Check if response has content before parsing JSON
      const responseText = await response.text();
      if (!responseText.trim()) {
        throw new Error('Empty response from server');
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error
      };

    } catch (error) {
      console.error('Error sending 2FA waitlist email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async send2FAReferralEmail(emailData: EmailData): Promise<EmailResult> {
    // For now, use the same template - can be extended later
    return this.send2FAWaitlistEmail(emailData);
  }

  async sendActivationEmail(emailData: EmailData): Promise<EmailResult> {
    // For now, use the same template - can be extended later
    return this.send2FAWaitlistEmail(emailData);
  }

  async sendEnterpriseContactEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      const response = await fetch(`${this.baseUrl}/.netlify/functions/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailType: 'enterprise_contact',
          emailData: {
            email: emailData.email,
            name: emailData.name,
            company: emailData.company,
            estimatedUsers: emailData.estimatedUsers,
            message: emailData.message || '',
            language: emailData.language || 'en',
            timestamp: emailData.timestamp || new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseText = await response.text();
      if (!responseText.trim()) {
        throw new Error('Empty response from server');
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error
      };

    } catch (error) {
      console.error('Error sending enterprise contact email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async logEmailDelivery(messageId: string, email: string, type: string, language: string, result: EmailResult): Promise<void> {
    // Log email delivery status - can be implemented later if needed
    if (import.meta.env.DEV) console.debug(`Email delivery logged: ${messageId} | email=${email} | type=${type} | lang=${language} | success=${result.success} | error=${result.error ?? ''}`);
  }
}

// Create a singleton instance
export const browserEmailService = new BrowserEmailService();