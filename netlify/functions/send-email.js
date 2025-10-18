const brevo = require('@getbrevo/brevo');

exports.handler = async (event, context) => {
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

  // Only allow POST requests (after handling OPTIONS)
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
    const { emailType, emailData } = JSON.parse(event.body);

    // Basic payload validation for security
    if (emailType !== '2fa_waitlist' && emailType !== 'enterprise_contact') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ success: false, error: 'Unsupported email type' })
      };
    }

    const email = emailData?.email;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ success: false, error: 'Invalid email address' })
      };
    }

    // Additional validation for enterprise contact
    if (emailType === 'enterprise_contact') {
      const requiredFields = ['name', 'company', 'estimatedUsers'];
      const missing = requiredFields.filter(f => !emailData?.[f] || String(emailData?.[f]).trim().length === 0);
      if (missing.length > 0) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          },
          body: JSON.stringify({ success: false, error: `Missing required fields: ${missing.join(', ')}` })
        };
      }
    }

    // Validate required environment variables
    const apiKey = process.env.VITE_BREVO_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_BREVO_API_KEY not configured');
    }

    // Initialize Brevo API
    const apiInstance = new brevo.TransactionalEmailsApi();
    const apiKeyAuth = apiInstance.authentications['apiKey'];
    apiKeyAuth.apiKey = apiKey;

    // Email templates
    const templates = {
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
                
                <p>Once you confirm your email address, you'll be added to our waitlist. We'll contact you as soon as there's space available!</p>
                
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
        }
      },
      'enterprise_contact': {
        'nl': {
          subject: 'Nieuwe Enterprise-aanvraag van {{name}} ({{company}})',
          html: `
            <!DOCTYPE html>
            <html lang="nl">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Enterprise contact aanvraag</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6b21a8 0%, #7e22ce 100%); color: white; padding: 24px; border-radius: 10px 10px 0 0; }
                .content { background: #f8fafc; padding: 24px; border-radius: 0 0 10px 10px; }
                .item { margin-bottom: 12px; }
                .label { font-weight: bold; color: #111827; }
                .footer { text-align: center; margin-top: 24px; color: #64748b; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h2>Enterprise contact aanvraag</h2>
                <p>RecapHorizon</p>
              </div>
              <div class="content">
                <p>Er is een nieuwe enterprise-aanvraag binnengekomen. Details:</p>
                <div class="item"><span class="label">Naam:</span> {{name}}</div>
                <div class="item"><span class="label">E-mail:</span> {{email}}</div>
                <div class="item"><span class="label">Bedrijf:</span> {{company}}</div>
                <div class="item"><span class="label">Geschat aantal gebruikers:</span> {{estimatedUsers}}</div>
                <div class="item"><span class="label">Bericht:</span><br/>{{message}}</div>
                <div class="item"><span class="label">Tijdstip:</span> {{timestamp}}</div>
              </div>
              <div class="footer">© 2024 RecapHorizon</div>
            </body>
            </html>
          `
        },
        'en': {
          subject: 'New Enterprise contact from {{name}} ({{company}})',
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Enterprise Contact Request</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6b21a8 0%, #7e22ce 100%); color: white; padding: 24px; border-radius: 10px 10px 0 0; }
                .content { background: #f8fafc; padding: 24px; border-radius: 0 0 10px 10px; }
                .item { margin-bottom: 12px; }
                .label { font-weight: bold; color: #111827; }
                .footer { text-align: center; margin-top: 24px; color: #64748b; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h2>Enterprise Contact Request</h2>
                <p>RecapHorizon</p>
              </div>
              <div class="content">
                <p>A new enterprise contact has been submitted. Details:</p>
                <div class="item"><span class="label">Name:</span> {{name}}</div>
                <div class="item"><span class="label">Email:</span> {{email}}</div>
                <div class="item"><span class="label">Company:</span> {{company}}</div>
                <div class="item"><span class="label">Estimated users:</span> {{estimatedUsers}}</div>
                <div class="item"><span class="label">Message:</span><br/>{{message}}</div>
                <div class="item"><span class="label">Timestamp:</span> {{timestamp}}</div>
              </div>
              <div class="footer">© 2024 RecapHorizon</div>
            </body>
            </html>
          `
        },
        'de': {
          subject: 'Neue Enterprise-Anfrage von {{name}} ({{company}})',
          html: `<html><body><p>Enterprise-Anfrage:</p><p><b>Name:</b> {{name}}</p><p><b>E‑Mail:</b> {{email}}</p><p><b>Firma:</b> {{company}}</p><p><b>Nutzer:</b> {{estimatedUsers}}</p><p><b>Nachricht:</b><br/>{{message}}</p><p><b>Zeitpunkt:</b> {{timestamp}}</p></body></html>`
        },
        'fr': {
          subject: 'Nouvelle demande Entreprise de {{name}} ({{company}})',
          html: `<html><body><p>Demande Entreprise:</p><p><b>Nom:</b> {{name}}</p><p><b>Email:</b> {{email}}</p><p><b>Entreprise:</b> {{company}}</p><p><b>Utilisateurs estimés:</b> {{estimatedUsers}}</p><p><b>Message:</b><br/>{{message}}</p><p><b>Horodatage:</b> {{timestamp}}</p></body></html>`
        },
        'es': {
          subject: 'Nueva solicitud Enterprise de {{name}} ({{company}})',
          html: `<html><body><p>Solicitud Enterprise:</p><p><b>Nombre:</b> {{name}}</p><p><b>Email:</b> {{email}}</p><p><b>Empresa:</b> {{company}}</p><p><b>Usuarios estimados:</b> {{estimatedUsers}}</p><p><b>Mensaje:</b><br/>{{message}}</p><p><b>Hora:</b> {{timestamp}}</p></body></html>`
        },
        'pt': {
          subject: 'Novo contato Enterprise de {{name}} ({{company}})',
          html: `<html><body><p>Contato Enterprise:</p><p><b>Nome:</b> {{name}}</p><p><b>Email:</b> {{email}}</p><p><b>Empresa:</b> {{company}}</p><p><b>Usuários estimados:</b> {{estimatedUsers}}</p><p><b>Mensagem:</b><br/>{{message}}</p><p><b>Data/hora:</b> {{timestamp}}</p></body></html>`
        }
      }
    };

    // Get template
    const template = templates[emailType]?.[emailData.language] || templates[emailType]?.['en'];
    if (!template) {
      throw new Error(`Email template not found for type: ${emailType}, language: ${emailData.language}`);
    }

    // Replace placeholders
    let htmlContent = template.html;
    let subject = template.subject;

    Object.keys(emailData).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = emailData[key];
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    });

    // Prepare email
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: process.env.VITE_BREVO_SENDER_NAME || 'RecapHorizon',
      email: process.env.VITE_BREVO_SENDER_EMAIL || 'RecapHorizonOffice@gmail.com'
    };

    // Recipient logic: enterprise goes to office inbox, waitlist goes to user
    const enterpriseRecipient = process.env.VITE_ENTERPRISE_CONTACT_RECIPIENT || 'RecapHorizonOffice@gmail.com';
    const toEmail = emailType === 'enterprise_contact' ? enterpriseRecipient : emailData.email;

    sendSmtpEmail.to = [{
      email: toEmail,
      name: emailType === 'enterprise_contact' ? 'RecapHorizon Office' : emailData.email.split('@')[0]
    }];

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.tags = emailType === 'enterprise_contact' 
      ? ['enterprise', 'contact', emailData.language]
      : ['2fa', 'waitlist', emailData.language];

    // For enterprise, set reply-to to the user's email so office can reply directly
    if (emailType === 'enterprise_contact' && emailData.email) {
      sendSmtpEmail.replyTo = { email: emailData.email };
    } else if (emailData.supportEmail) {
      sendSmtpEmail.replyTo = { email: emailData.supportEmail };
    }

    // Send email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        messageId: response.messageId
      })
    };

  } catch (error) {
    // Log full error server-side only
    console.error('Error sending email:', error);

    const unauthorized = error?.response?.statusCode === 401 && (
      error?.response?.body?.code === 'unauthorized' ||
      /authorised_ips/i.test(error?.response?.body?.message || '')
    );

    const safeMessage = unauthorized
      ? 'Email service not authorized from this IP. Please add your current IP to Brevo Authorized IPs or use a dev API key without IP restrictions.'
      : (error?.response?.body?.message || error?.message || 'Failed to send email');

    return {
      statusCode: unauthorized ? 403 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        error: safeMessage,
        code: unauthorized ? 'BREVO_UNAUTHORIZED_IP' : 'EMAIL_SEND_ERROR'
      })
    };
  }
};