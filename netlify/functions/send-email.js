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
    const apiKey = process.env.MAILERSEND_API_KEY;
    if (!apiKey) {
      throw new Error('MAILERSEND_API_KEY not configured');
    }

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
              <title>Enterprise Contact</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; border-left: 4px solid #0891b2; padding: 20px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">RecapHorizon</div>
                <p>Enterprise Contact Request</p>
              </div>
              <div class="content">
                <h2>Nieuwe Enterprise-aanvraag</h2>
                <div class="info-box">
                  <p><strong>Naam:</strong> {{name}}</p>
                  <p><strong>E-mail:</strong> {{email}}</p>
                  <p><strong>Bedrijf:</strong> {{company}}</p>
                  <p><strong>Geschatte gebruikers:</strong> {{estimatedUsers}}</p>
                  <p><strong>Bericht:</strong> {{message}}</p>
                </div>
                <p>Deze aanvraag is ingediend via de RecapHorizon website.</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. Alle rechten voorbehouden.</p>
              </div>
            </body>
            </html>
          `
        },
        'en': {
          subject: 'New Enterprise Request from {{name}} ({{company}})',
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Enterprise Contact</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; border-left: 4px solid #0891b2; padding: 20px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">RecapHorizon</div>
                <p>Enterprise Contact Request</p>
              </div>
              <div class="content">
                <h2>New Enterprise Request</h2>
                <div class="info-box">
                  <p><strong>Name:</strong> {{name}}</p>
                  <p><strong>Email:</strong> {{email}}</p>
                  <p><strong>Company:</strong> {{company}}</p>
                  <p><strong>Estimated Users:</strong> {{estimatedUsers}}</p>
                  <p><strong>Message:</strong> {{message}}</p>
                </div>
                <p>This request was submitted through the RecapHorizon website.</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. All rights reserved.</p>
              </div>
            </body>
            </html>
          `
        }
      }
    };

    // Get template
    const language = emailData.language || 'en';
    const template = templates[emailType]?.[language] || templates[emailType]?.['en'];
    
    if (!template) {
      throw new Error(`Email template not found for type: ${emailType}, language: ${language}`);
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

    // Prepare MailerSend email data
    // For trial accounts, we need to use a verified sender email
    // The default should be the account owner's email, not a Gmail address
    const senderEmail = process.env.MAILERSEND_SENDER_EMAIL || 'noreply@trial.mailersend.com';
    const senderName = process.env.MAILERSEND_SENDER_NAME || 'RecapHorizon';

    // Recipient logic: enterprise goes to office inbox, waitlist goes to user
    // For trial accounts, all emails must go to the administrator's email
    const enterpriseRecipient = process.env.ENTERPRISE_CONTACT_RECIPIENT || process.env.MAILERSEND_ADMIN_EMAIL || 'RecapHorizonOffice@gmail.com';
    const adminEmail = process.env.MAILERSEND_ADMIN_EMAIL || enterpriseRecipient;
    
    // For trial accounts, always send to admin email
    const toEmail = emailType === 'enterprise_contact' ? enterpriseRecipient : adminEmail;

    const emailPayload = {
      from: {
        email: senderEmail,
        name: senderName
      },
      to: [{
        email: toEmail,
        name: emailType === 'enterprise_contact' ? 'RecapHorizon Office' : emailData.email.split('@')[0]
      }],
      subject: subject,
      html: htmlContent,
      tags: emailType === 'enterprise_contact' 
        ? ['enterprise', 'contact', language]
        : ['2fa', 'waitlist', language],
      settings: {
        track_clicks: true,
        track_opens: true,
        track_content: true
      }
    };

    // For enterprise, set reply-to to the user's email so office can reply directly
    if (emailType === 'enterprise_contact' && emailData.email) {
      emailPayload.reply_to = { email: emailData.email };
    } else if (emailData.supportEmail) {
      emailPayload.reply_to = { email: emailData.supportEmail };
    }

    // Send email via MailerSend API
    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('MailerSend API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData,
        emailPayload: JSON.stringify(emailPayload, null, 2)
      });
      
      // Parse error response for better error messages
      let parsedError;
      try {
        parsedError = JSON.parse(errorData);
      } catch (e) {
        parsedError = { message: errorData };
      }
      
      // Provide specific error messages for common issues
       if (response.status === 422) {
         if (parsedError.errors?.from?.some(err => err.includes('domain must be verified'))) {
           throw new Error('MailerSend Configuration Error: The sender email domain is not verified. Please either: 1) Verify your domain in MailerSend dashboard, or 2) Use a verified sender email address.');
         }
         if (parsedError.errors?.to?.some(err => err.includes('Trial accounts'))) {
           throw new Error('MailerSend Trial Account Limitation: Emails can only be sent to the administrator email address. Please check your MailerSend account settings to find the correct administrator email, or upgrade to a paid plan.');
         }
       }
      
      throw new Error(`MailerSend API error: ${response.status} - ${parsedError.message || errorData}`);
    }

    const result = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        messageId: result.message_id || result.id
      })
    };

  } catch (error) {
    // Log full error server-side only
    console.error('Error sending email:', error);

    const unauthorized = error?.message?.includes('401') || error?.message?.includes('unauthorized');

    const safeMessage = unauthorized
      ? 'Email service not authorized. Please check your MailerSend API key configuration.'
      : (error?.message || 'Failed to send email');

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
        code: unauthorized ? 'MAILERSEND_UNAUTHORIZED' : 'EMAIL_SEND_ERROR'
      })
    };
  }
};