import { Language } from '../locales';

// Email template types
export type EmailType = '2fa_waitlist' | '2fa_referral' | 'activation' | 'welcome';

// Email template data interfaces
interface BaseEmailData {
  email: string;
  language: Language;
  supportEmail: string;
}

interface TwoFactorEmailData extends BaseEmailData {
  confirmationCode: string;
  expiryHours: number;
  unsubscribeUrl?: string;
}

interface ReferralEmailData extends TwoFactorEmailData {
  referrerName: string;
  referralCode: string;
}

interface ActivationEmailData extends BaseEmailData {
  activationUrl: string;
}

// Email sending result
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  mailerSendResponse?: any;
}

// Email delivery status from MailerSend webhooks
export interface EmailDeliveryStatus {
  messageId: string;
  email: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'spam';
  timestamp: Date;
  reason?: string;
}

class MailerSendService {
  private apiKey: string | null = null;
  private isInitialized: boolean = false;
  private baseUrl = 'https://api.mailersend.com/v1';

  constructor() {
    // Constructor is empty, initialization happens in initialize()
  }

  /**
   * Initialize MailerSend API with API key
   */
  private initialize(): void {
    if (this.isInitialized) return;

    const apiKey = import.meta.env.VITE_MAILERSEND_API_KEY || process.env.MAILERSEND_API_KEY;
    
    if (!apiKey) {
      throw new Error('MAILERSEND_API_KEY not found in environment variables');
    }

    this.apiKey = apiKey;
    this.isInitialized = true;
  }

  /**
   * Send email using MailerSend API
   */
  private async sendEmail(emailData: any): Promise<EmailResult> {
    try {
      this.initialize();

      const response = await fetch(`${this.baseUrl}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`MailerSend API error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        messageId: result.message_id || result.id,
        mailerSendResponse: result
      };
    } catch (error: any) {
      console.error('Error sending email via MailerSend:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
        mailerSendResponse: error.response
      };
    }
  }

  /**
   * Generate HTML email content based on type and language
   */
  private generateEmailContent(type: EmailType, data: any, language: Language): { subject: string; htmlContent: string } {
    const templates = this.getEmailTemplates();
    const template = templates[type][language];
    
    if (!template) {
      throw new Error(`Email template not found for type: ${type}, language: ${language}`);
    }

    // Replace placeholders in template
    let htmlContent = template.html;
    let subject = template.subject;

    // Replace common placeholders
    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = data[key];
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    });

    return { subject, htmlContent };
  }

  /**
   * Send 2FA email for waitlist registration
   */
  async send2FAWaitlistEmail(data: TwoFactorEmailData): Promise<EmailResult> {
    try {
      const { subject, htmlContent } = this.generateEmailContent('2fa_waitlist', data, data.language);

      const emailData = {
        from: {
          email: import.meta.env.VITE_MAILERSEND_SENDER_EMAIL || process.env.MAILERSEND_SENDER_EMAIL || 'RecapHorizonOffice@gmail.com',
          name: import.meta.env.VITE_MAILERSEND_SENDER_NAME || process.env.MAILERSEND_SENDER_NAME || 'RecapHorizon'
        },
        to: [{
          email: data.email,
          name: data.email.split('@')[0] // Use email prefix as name
        }],
        subject: subject,
        html: htmlContent,
        tags: ['2fa', 'waitlist', data.language],
        settings: {
          track_clicks: true,
          track_opens: true,
          track_content: true
        }
      };

      if (data.unsubscribeUrl) {
        emailData['reply_to'] = {
          email: data.supportEmail
        };
      }

      return await this.sendEmail(emailData);
    } catch (error: any) {
      console.error('Error sending 2FA waitlist email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  /**
   * Send 2FA email for referral registration
   */
  async send2FAReferralEmail(data: ReferralEmailData): Promise<EmailResult> {
    try {
      const { subject, htmlContent } = this.generateEmailContent('2fa_referral', data, data.language);

      const emailData = {
        from: {
          email: import.meta.env.VITE_MAILERSEND_SENDER_EMAIL || process.env.MAILERSEND_SENDER_EMAIL || 'RecapHorizonOffice@gmail.com',
          name: import.meta.env.VITE_MAILERSEND_SENDER_NAME || process.env.MAILERSEND_SENDER_NAME || 'RecapHorizon'
        },
        to: [{
          email: data.email,
          name: data.email.split('@')[0]
        }],
        subject: subject,
        html: htmlContent,
        tags: ['2fa', 'referral', data.language, data.referralCode],
        reply_to: {
          email: data.supportEmail
        },
        settings: {
          track_clicks: true,
          track_opens: true,
          track_content: true
        }
      };

      return await this.sendEmail(emailData);
    } catch (error: any) {
      console.error('Error sending 2FA referral email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  /**
   * Send activation email to approved waitlist users
   */
  async sendActivationEmail(data: ActivationEmailData): Promise<EmailResult> {
    try {
      const { subject, htmlContent } = this.generateEmailContent('activation', data, data.language);

      const emailData = {
        from: {
          email: import.meta.env.VITE_MAILERSEND_SENDER_EMAIL || process.env.MAILERSEND_SENDER_EMAIL || 'RecapHorizonOffice@gmail.com',
          name: import.meta.env.VITE_MAILERSEND_SENDER_NAME || process.env.MAILERSEND_SENDER_NAME || 'RecapHorizon'
        },
        to: [{
          email: data.email,
          name: data.email.split('@')[0]
        }],
        subject: subject,
        html: htmlContent,
        tags: ['activation', data.language],
        reply_to: {
          email: data.supportEmail
        },
        settings: {
          track_clicks: true,
          track_opens: true,
          track_content: true
        }
      };

      return await this.sendEmail(emailData);
    } catch (error: any) {
      console.error('Error sending activation email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  /**
   * Get email templates for all supported languages
   */
  private getEmailTemplates() {
    return {
      '2fa_waitlist': {
        'nl': {
          subject: 'Bevestig je e-mailadres voor RecapHorizon',
          html: `
            <!DOCTYPE html>
            <html lang="nl">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>E-mail bevestiging</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .code-box { background: white; border: 2px solid #0891b2; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .code { font-size: 32px; font-weight: bold; color: #0891b2; letter-spacing: 4px; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
                .button { display: inline-block; background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">RecapHorizon</div>
                <p>Bevestig je e-mailadres</p>
              </div>
              <div class="content">
                <h2>Hallo!</h2>
                <p>Bedankt voor je aanmelding bij RecapHorizon! Om je registratie voor de wachtlijst te voltooien, voer de onderstaande bevestigingscode in:</p>
                
                <div class="code-box">
                  <div class="code">{{confirmationCode}}</div>
                </div>
                
                <p><strong>Belangrijk:</strong></p>
                <ul>
                  <li>Deze code is {{expiryHours}} uur geldig</li>
                  <li>Gebruik deze code alleen als je je hebt aangemeld voor RecapHorizon</li>
                  <li>Deel deze code nooit met anderen</li>
                </ul>
                
                <p>Zodra je je e-mailadres hebt bevestigd, word je toegevoegd aan onze wachtlijst. We nemen zo snel mogelijk contact met je op zodra er plek is!</p>
                
                <p>Heb je vragen of hulp nodig? Neem contact met ons op via {{supportEmail}}</p>
                
                <p>Met vriendelijke groet,<br>Het RecapHorizon Team</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. Alle rechten voorbehouden.</p>
                <p>Je ontvangt deze e-mail omdat je je hebt aangemeld voor onze wachtlijst.</p>
              </div>
            </body>
            </html>
          `
        },
        'en': {
          subject: 'Confirm your email address for RecapHorizon',
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Email Confirmation</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .code-box { background: white; border: 2px solid #0891b2; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .code { font-size: 32px; font-weight: bold; color: #0891b2; letter-spacing: 4px; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
                .button { display: inline-block; background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">RecapHorizon</div>
                <p>Confirm your email address</p>
              </div>
              <div class="content">
                <h2>Hello!</h2>
                <p>Thank you for signing up for RecapHorizon! To complete your waitlist registration, please enter the confirmation code below:</p>
                
                <div class="code-box">
                  <div class="code">{{confirmationCode}}</div>
                </div>
                
                <p><strong>Important:</strong></p>
                <ul>
                  <li>This code is valid for {{expiryHours}} hours</li>
                  <li>Only use this code if you signed up for RecapHorizon</li>
                  <li>Never share this code with others</li>
                </ul>
                
                <p>Once you confirm your email address, you'll be added to our waitlist. We'll contact you as soon as a spot becomes available!</p>
                
                <p>Questions or need help? Contact us at {{supportEmail}}</p>
                
                <p>Best regards,<br>The RecapHorizon Team</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. All rights reserved.</p>
                <p>You're receiving this email because you signed up for our waitlist.</p>
              </div>
            </body>
            </html>
          `
        }
      }
    };
  }

  /**
   * Log email delivery to Firestore for admin monitoring
   */
  async logEmailDelivery(emailConfirmationId: string, email: string, type: EmailType, language: Language, result: EmailResult): Promise<void> {
    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../firebase');

      await addDoc(collection(db, 'email_delivery_logs'), {
        emailConfirmationId,
        email,
        type,
        language,
        mailerSendMessageId: result.messageId,
        status: result.success ? 'sent' : 'failed',
        sentAt: serverTimestamp(),
        error: result.error,
        mailerSendResponse: result.mailerSendResponse,
        provider: 'mailersend'
      });
    } catch (error) {
      console.error('Error logging email delivery:', error);
      // Don't throw - logging failure shouldn't break email sending
    }
  }
}

export const mailerSendService = new MailerSendService();
export default mailerSendService;