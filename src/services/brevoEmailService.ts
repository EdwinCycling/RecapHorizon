import * as brevo from '@getbrevo/brevo';
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
  brevoResponse?: any;
}

// Email delivery status from Brevo webhooks
export interface EmailDeliveryStatus {
  messageId: string;
  email: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'spam';
  timestamp: Date;
  reason?: string;
}

class BrevoEmailService {
  private apiInstance: brevo.TransactionalEmailsApi;
  private isInitialized: boolean = false;

  constructor() {
    this.apiInstance = new brevo.TransactionalEmailsApi();
  }

  /**
   * Initialize Brevo API with API key
   */
  private initialize(): void {
    if (this.isInitialized) return;

    const apiKey = import.meta.env.VITE_BREVO_API_KEY || process.env.BREVO_API_KEY;
    
    if (!apiKey) {
      throw new Error('BREVO_API_KEY not found in environment variables');
    }

    // Configure API key authorization
    const instAny = (this.apiInstance as any);
    if (typeof instAny.setApiKey === 'function') {
      // Newer Brevo SDK variants expose setApiKey
      try {
        instAny.setApiKey('api-key', apiKey);
      } catch {
        // fallback below
      }
    }
    if (instAny.authentications?.['api-key']) {
      instAny.authentications['api-key'].apiKey = apiKey;
    } else if (instAny.apiKey !== undefined) {
      instAny.apiKey = apiKey;
    }

     
     this.isInitialized = true;
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
      this.initialize();

      const { subject, htmlContent } = this.generateEmailContent('2fa_waitlist', data, data.language);

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.sender = {
        name: 'RecapHorizon',
        email: 'RecapHorizonOffice@gmail.com'
      };
      sendSmtpEmail.to = [{
        email: data.email,
        name: data.email.split('@')[0] // Use email prefix as name
      }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.tags = ['2fa', 'waitlist', data.language];
      
      if (data.unsubscribeUrl) {
        sendSmtpEmail.replyTo = {
          email: data.supportEmail
        };
      }

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      const messageId = (response as any)?.messageId
        ?? (response as any)?.messageIds?.[0]
        ?? (response as any)?.body?.messageId
        ?? (response as any)?.body?.messageIds?.[0];
      
      return {
        success: true,
        messageId,
        brevoResponse: (response as any)?.body ?? response
      };
    } catch (error: any) {
      console.error('Error sending 2FA waitlist email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
        brevoResponse: error.response?.body
      };
    }
  }

  /**
   * Send 2FA email for referral registration
   */
  async send2FAReferralEmail(data: ReferralEmailData): Promise<EmailResult> {
    try {
      this.initialize();

      const { subject, htmlContent } = this.generateEmailContent('2fa_referral', data, data.language);

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.sender = {
        name: 'RecapHorizon',
        email: 'RecapHorizonOffice@gmail.com'
      };
      sendSmtpEmail.to = [{
        email: data.email,
        name: data.email.split('@')[0]
      }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.tags = ['2fa', 'referral', data.language, data.referralCode];
      sendSmtpEmail.replyTo = {
        email: data.supportEmail
      };

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      const messageId = (response as any)?.messageId
        ?? (response as any)?.messageIds?.[0]
        ?? (response as any)?.body?.messageId
        ?? (response as any)?.body?.messageIds?.[0];
      
      return {
        success: true,
        messageId,
        brevoResponse: (response as any)?.body ?? response
      };
    } catch (error: any) {
      console.error('Error sending 2FA referral email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
        brevoResponse: error.response?.body
      };
    }
  }

  /**
   * Send activation email to approved waitlist users
   */
  async sendActivationEmail(data: ActivationEmailData): Promise<EmailResult> {
    try {
      this.initialize();

      const { subject, htmlContent } = this.generateEmailContent('activation', data, data.language);

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.sender = {
        name: 'RecapHorizon',
        email: 'RecapHorizonOffice@gmail.com'
      };
      sendSmtpEmail.to = [{
        email: data.email,
        name: data.email.split('@')[0]
      }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.tags = ['activation', data.language];
      sendSmtpEmail.replyTo = {
        email: data.supportEmail
      };

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      const messageId = (response as any)?.messageId
        ?? (response as any)?.messageIds?.[0]
        ?? (response as any)?.body?.messageId
        ?? (response as any)?.body?.messageIds?.[0];
      
      return {
        success: true,
        messageId,
        brevoResponse: (response as any)?.body ?? response
      };
    } catch (error: any) {
      console.error('Error sending activation email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
        brevoResponse: error.response?.body
      };
    }
  }

  /**
   * Get email templates for all types and languages
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
                
                <p>Heb je vragen? Neem contact met ons op via {{supportEmail}}</p>
                
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
                
                <p>Have questions? Contact us at {{supportEmail}}</p>
                
                <p>Best regards,<br>The RecapHorizon Team</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. All rights reserved.</p>
                <p>You're receiving this email because you signed up for our waitlist.</p>
              </div>
            </body>
            </html>
          `
        },
        'de': {
          subject: 'Bestätigen Sie Ihre E-Mail-Adresse für RecapHorizon',
          html: `
            <!DOCTYPE html>
            <html lang="de">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>E-Mail-Bestätigung</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .code-box { background: white; border: 2px solid #0891b2; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .code { font-size: 32px; font-weight: bold; color: #0891b2; letter-spacing: 4px; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">RecapHorizon</div>
                <p>Bestätigen Sie Ihre E-Mail-Adresse</p>
              </div>
              <div class="content">
                <h2>Hallo!</h2>
                <p>Vielen Dank für Ihre Anmeldung bei RecapHorizon! Um Ihre Wartelisten-Registrierung abzuschließen, geben Sie bitte den folgenden Bestätigungscode ein:</p>
                
                <div class="code-box">
                  <div class="code">{{confirmationCode}}</div>
                </div>
                
                <p><strong>Wichtig:</strong></p>
                <ul>
                  <li>Dieser Code ist {{expiryHours}} Stunden gültig</li>
                  <li>Verwenden Sie diesen Code nur, wenn Sie sich für RecapHorizon angemeldet haben</li>
                  <li>Teilen Sie diesen Code niemals mit anderen</li>
                </ul>
                
                <p>Sobald Sie Ihre E-Mail-Adresse bestätigt haben, werden Sie zu unserer Warteliste hinzugefügt. Wir werden uns so schnell wie möglich bei Ihnen melden, sobald ein Platz verfügbar ist!</p>
                
                <p>Haben Sie Fragen? Kontaktieren Sie uns unter {{supportEmail}}</p>
                
                <p>Mit freundlichen Grüßen,<br>Das RecapHorizon Team</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. Alle Rechte vorbehalten.</p>
                <p>Sie erhalten diese E-Mail, weil Sie sich für unsere Warteliste angemeldet haben.</p>
              </div>
            </body>
            </html>
          `
        },
        'fr': {
          subject: 'Confirmez votre adresse e-mail pour RecapHorizon',
          html: `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Confirmation d'e-mail</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .code-box { background: white; border: 2px solid #0891b2; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .code { font-size: 32px; font-weight: bold; color: #0891b2; letter-spacing: 4px; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">RecapHorizon</div>
                <p>Confirmez votre adresse e-mail</p>
              </div>
              <div class="content">
                <h2>Bonjour !</h2>
                <p>Merci de vous être inscrit à RecapHorizon ! Pour terminer votre inscription sur la liste d'attente, veuillez saisir le code de confirmation ci-dessous :</p>
                
                <div class="code-box">
                  <div class="code">{{confirmationCode}}</div>
                </div>
                
                <p><strong>Important :</strong></p>
                <ul>
                  <li>Ce code est valide pendant {{expiryHours}} heures</li>
                  <li>N'utilisez ce code que si vous vous êtes inscrit à RecapHorizon</li>
                  <li>Ne partagez jamais ce code avec d'autres</li>
                </ul>
                
                <p>Une fois que vous aurez confirmé votre adresse e-mail, vous serez ajouté à notre liste d'attente. Nous vous contacterons dès qu'une place se libère !</p>
                
                <p>Vous avez des questions ? Contactez-nous à {{supportEmail}}</p>
                
                <p>Cordialement,<br>L'équipe RecapHorizon</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. Tous droits réservés.</p>
                <p>Vous recevez cet e-mail car vous vous êtes inscrit à notre liste d'attente.</p>
              </div>
            </body>
            </html>
          `
        },
        'es': {
          subject: 'Confirma tu dirección de correo electrónico para RecapHorizon',
          html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Confirmación de correo electrónico</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .code-box { background: white; border: 2px solid #0891b2; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .code { font-size: 32px; font-weight: bold; color: #0891b2; letter-spacing: 4px; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">RecapHorizon</div>
                <p>Confirma tu dirección de correo electrónico</p>
              </div>
              <div class="content">
                <h2>¡Hola!</h2>
                <p>¡Gracias por registrarte en RecapHorizon! Para completar tu registro en la lista de espera, ingresa el código de confirmación a continuación:</p>
                
                <div class="code-box">
                  <div class="code">{{confirmationCode}}</div>
                </div>
                
                <p><strong>Importante:</strong></p>
                <ul>
                  <li>Este código es válido por {{expiryHours}} horas</li>
                  <li>Solo usa este código si te registraste en RecapHorizon</li>
                  <li>Nunca compartas este código con otros</li>
                </ul>
                
                <p>Una vez que confirmes tu dirección de correo electrónico, serás agregado a nuestra lista de espera. ¡Te contactaremos tan pronto como haya un lugar disponible!</p>
                
                <p>¿Tienes preguntas? Contáctanos en {{supportEmail}}</p>
                
                <p>Saludos cordiales,<br>El equipo de RecapHorizon</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. Todos los derechos reservados.</p>
                <p>Recibes este correo porque te registraste en nuestra lista de espera.</p>
              </div>
            </body>
            </html>
          `
        },
        'pt': {
          subject: 'Confirme seu endereço de e-mail para RecapHorizon',
          html: `
            <!DOCTYPE html>
            <html lang="pt">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Confirmação de e-mail</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .code-box { background: white; border: 2px solid #0891b2; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .code { font-size: 32px; font-weight: bold; color: #0891b2; letter-spacing: 4px; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">RecapHorizon</div>
                <p>Confirme seu endereço de e-mail</p>
              </div>
              <div class="content">
                <h2>Olá!</h2>
                <p>Obrigado por se inscrever no RecapHorizon! Para completar seu registro na lista de espera, digite o código de confirmação abaixo:</p>
                
                <div class="code-box">
                  <div class="code">{{confirmationCode}}</div>
                </div>
                
                <p><strong>Importante:</strong></p>
                <ul>
                  <li>Este código é válido por {{expiryHours}} horas</li>
                  <li>Use este código apenas se você se inscreveu no RecapHorizon</li>
                  <li>Nunca compartilhe este código com outros</li>
                </ul>
                
                <p>Assim que você confirmar seu endereço de e-mail, será adicionado à nossa lista de espera. Entraremos em contato assim que uma vaga estiver disponível!</p>
                
                <p>Tem dúvidas? Entre em contato conosco em {{supportEmail}}</p>
                
                <p>Atenciosamente,<br>A equipe RecapHorizon</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. Todos os direitos reservados.</p>
                <p>Você está recebendo este e-mail porque se inscreveu em nossa lista de espera.</p>
              </div>
            </body>
            </html>
          `
        }
      },
      '2fa_referral': {
        'nl': {
          subject: 'Bevestig je e-mailadres - Uitnodiging van {{referrerName}}',
          html: `
            <!DOCTYPE html>
            <html lang="nl">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Referral bevestiging</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .code-box { background: white; border: 2px solid #0891b2; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .code { font-size: 32px; font-weight: bold; color: #0891b2; letter-spacing: 4px; }
                .referral-box { background: #e0f2fe; border-left: 4px solid #0891b2; padding: 15px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">RecapHorizon</div>
                <p>Je bent uitgenodigd!</p>
              </div>
              <div class="content">
                <h2>Hallo!</h2>
                <p>{{referrerName}} heeft je uitgenodigd om deel te nemen aan RecapHorizon! Om je account aan te maken, voer de onderstaande bevestigingscode in:</p>
                
                <div class="referral-box">
                  <strong>🎉 Uitnodiging van:</strong> {{referrerName}}<br>
                  <strong>📝 Referral code:</strong> {{referralCode}}
                </div>
                
                <div class="code-box">
                  <div class="code">{{confirmationCode}}</div>
                </div>
                
                <p><strong>Belangrijk:</strong></p>
                <ul>
                  <li>Deze code is {{expiryHours}} uur geldig</li>
                  <li>Gebruik deze code alleen als je bent uitgenodigd door {{referrerName}}</li>
                  <li>Deel deze code nooit met anderen</li>
                </ul>
                
                <p>Zodra je je e-mailadres hebt bevestigd, kun je direct aan de slag met RecapHorizon!</p>
                
                <p>Heb je vragen? Neem contact met ons op via {{supportEmail}}</p>
                
                <p>Met vriendelijke groet,<br>Het RecapHorizon Team</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. Alle rechten voorbehouden.</p>
                <p>Je ontvangt deze e-mail omdat {{referrerName}} je heeft uitgenodigd.</p>
              </div>
            </body>
            </html>
          `
        },
        'en': {
          subject: 'Confirm your email - Invitation from {{referrerName}}',
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Referral Confirmation</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .code-box { background: white; border: 2px solid #0891b2; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .code { font-size: 32px; font-weight: bold; color: #0891b2; letter-spacing: 4px; }
                .referral-box { background: #e0f2fe; border-left: 4px solid #0891b2; padding: 15px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">RecapHorizon</div>
                <p>You're invited!</p>
              </div>
              <div class="content">
                <h2>Hello!</h2>
                <p>{{referrerName}} has invited you to join RecapHorizon! To create your account, please enter the confirmation code below:</p>
                
                <div class="referral-box">
                  <strong>🎉 Invitation from:</strong> {{referrerName}}<br>
                  <strong>📝 Referral code:</strong> {{referralCode}}
                </div>
                
                <div class="code-box">
                  <div class="code">{{confirmationCode}}</div>
                </div>
                
                <p><strong>Important:</strong></p>
                <ul>
                  <li>This code is valid for {{expiryHours}} hours</li>
                  <li>Only use this code if you were invited by {{referrerName}}</li>
                  <li>Never share this code with others</li>
                </ul>
                
                <p>Once you confirm your email address, you can start using RecapHorizon immediately!</p>
                
                <p>Have questions? Contact us at {{supportEmail}}</p>
                
                <p>Best regards,<br>The RecapHorizon Team</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. All rights reserved.</p>
                <p>You're receiving this email because {{referrerName}} invited you.</p>
              </div>
            </body>
            </html>
          `
        },
        // Add other languages (de, fr, es, pt) with similar structure...
        'de': {
          subject: 'Bestätigen Sie Ihre E-Mail - Einladung von {{referrerName}}',
          html: `[Similar German template structure]`
        },
        'fr': {
          subject: 'Confirmez votre e-mail - Invitation de {{referrerName}}',
          html: `[Similar French template structure]`
        },
        'es': {
          subject: 'Confirma tu correo - Invitación de {{referrerName}}',
          html: `[Similar Spanish template structure]`
        },
        'pt': {
          subject: 'Confirme seu e-mail - Convite de {{referrerName}}',
          html: `[Similar Portuguese template structure]`
        }
      },
      'activation': {
        'nl': {
          subject: 'Je RecapHorizon account is geactiveerd!',
          html: `
            <!DOCTYPE html>
            <html lang="nl">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Account geactiveerd</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">RecapHorizon</div>
                <p>🎉 Welkom bij RecapHorizon!</p>
              </div>
              <div class="content">
                <h2>Gefeliciteerd!</h2>
                <p>Je account is geactiveerd en je kunt nu aan de slag met RecapHorizon. Klik op de onderstaande knop om in te loggen en je eerste sessie te starten:</p>
                
                <div style="text-align: center;">
                  <a href="{{activationUrl}}" class="button">Inloggen en starten</a>
                </div>
                
                <p><strong>Wat kun je nu doen:</strong></p>
                <ul>
                  <li>🎤 Audio opnemen en transcriberen</li>
                  <li>📄 Documenten uploaden en analyseren</li>
                  <li>🤖 AI-gestuurde samenvattingen genereren</li>
                  <li>📊 Rapporten en presentaties maken</li>
                </ul>
                
                <p>Heb je vragen of hulp nodig? Neem contact met ons op via {{supportEmail}}</p>
                
                <p>Veel plezier met RecapHorizon!<br>Het RecapHorizon Team</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. Alle rechten voorbehouden.</p>
              </div>
            </body>
            </html>
          `
        },
        // Add other languages for activation emails...
        'en': {
          subject: 'Your RecapHorizon account is activated!',
          html: `[Similar English activation template]`
        }
        // Add de, fr, es, pt...
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
        brevoMessageId: result.messageId,
        status: result.success ? 'sent' : 'failed',
        sentAt: serverTimestamp(),
        failureReason: result.error,
        brevoResponse: result.brevoResponse,
        retryCount: 0,
        maxRetries: 3
      });
    } catch (error) {
      console.error('Error logging email delivery:', error);
    }
  }
}

// Export singleton instance
export const brevoEmailService = new BrevoEmailService();
export default brevoEmailService;