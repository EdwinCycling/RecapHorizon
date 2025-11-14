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
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error('BREVO_API_KEY not configured');
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
        },
        'de': {
          subject: 'Bestätige deine E-Mail-Adresse für RecapHorizon',
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
                <p>Bestätige deine E-Mail-Adresse</p>
              </div>
              <div class="content">
                <h2>Hallo!</h2>
                <p>Danke für deine Anmeldung bei RecapHorizon! Um deine Registrierung für die Warteliste abzuschließen, gib bitte den folgenden Bestätigungscode ein:</p>
                <div class="code-box">
                  <div class="code">{{confirmationCode}}</div>
                </div>
                <p><strong>Wichtig:</strong></p>
                <ul>
                  <li>Dieser Code ist {{expiryHours}} Stunden gültig</li>
                  <li>Verwende diesen Code nur, wenn du dich bei RecapHorizon angemeldet hast</li>
                  <li>Teile diesen Code niemals mit anderen</li>
                </ul>
                <p>Sobald du deine E-Mail-Adresse bestätigt hast, fügen wir dich unserer Warteliste hinzu. Wir melden uns, sobald ein Platz verfügbar ist!</p>
                <p>Fragen? Kontaktiere uns unter {{supportEmail}}</p>
                <p>Viele Grüße,<br>Das RecapHorizon-Team</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. Alle Rechte vorbehalten.</p>
                <p>Du erhältst diese E-Mail, weil du dich für unsere Warteliste angemeldet hast.</p>
              </div>
            </body>
            </html>
          `
        },
        'fr': {
          subject: 'Confirmez votre adresse e‑mail pour RecapHorizon',
          html: `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Confirmation de l’e‑mail</title>
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
                <p>Confirmez votre adresse e‑mail</p>
              </div>
              <div class="content">
                <h2>Bonjour&nbsp;!</h2>
                <p>Merci de votre inscription à RecapHorizon&nbsp;! Pour terminer votre inscription sur la liste d’attente, veuillez saisir le code de confirmation ci‑dessous&nbsp;:</p>
                <div class="code-box">
                  <div class="code">{{confirmationCode}}</div>
                </div>
                <p><strong>Important&nbsp;:</strong></p>
                <ul>
                  <li>Ce code est valable {{expiryHours}} heures</li>
                  <li>N’utilisez ce code que si vous vous êtes inscrit(e) à RecapHorizon</li>
                  <li>Ne partagez jamais ce code avec d’autres personnes</li>
                </ul>
                <p>Une fois votre adresse e‑mail confirmée, vous serez ajouté(e) à notre liste d’attente. Nous vous contacterons dès qu’une place sera disponible&nbsp;!</p>
                <p>Des questions&nbsp;? Contactez‑nous à {{supportEmail}}</p>
                <p>Cordialement,<br>L’équipe RecapHorizon</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. Tous droits réservés.</p>
                <p>Vous recevez cet e‑mail car vous vous êtes inscrit(e) sur notre liste d’attente.</p>
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
              <title>Confirmación de correo</title>
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
                <p>Confirma tu dirección de correo</p>
              </div>
              <div class="content">
                <h2>¡Hola!</h2>
                <p>Gracias por registrarte en RecapHorizon. Para completar tu inscripción en la lista de espera, introduce el siguiente código de confirmación:</p>
                <div class="code-box">
                  <div class="code">{{confirmationCode}}</div>
                </div>
                <p><strong>Importante:</strong></p>
                <ul>
                  <li>Este código es válido durante {{expiryHours}} horas</li>
                  <li>Usa este código solo si te registraste en RecapHorizon</li>
                  <li>No compartas este código con otras personas</li>
                </ul>
                <p>Una vez confirmes tu dirección de correo, te añadiremos a nuestra lista de espera. ¡Te contactaremos en cuanto haya espacio disponible!</p>
                <p>¿Tienes preguntas? Escríbenos a {{supportEmail}}</p>
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
          subject: 'Confirme seu endereço de e‑mail para RecapHorizon',
          html: `
            <!DOCTYPE html>
            <html lang="pt">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Confirmação de e‑mail</title>
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
                <p>Confirme seu e‑mail</p>
              </div>
              <div class="content">
                <h2>Olá!</h2>
                <p>Obrigado por se cadastrar no RecapHorizon! Para concluir sua inscrição na lista de espera, insira o código de confirmação abaixo:</p>
                <div class="code-box">
                  <div class="code">{{confirmationCode}}</div>
                </div>
                <p><strong>Importante:</strong></p>
                <ul>
                  <li>Este código é válido por {{expiryHours}} horas</li>
                  <li>Use este código apenas se você se cadastrou no RecapHorizon</li>
                  <li>Nunca compartilhe este código com outras pessoas</li>
                </ul>
                <p>Depois de confirmar seu e‑mail, você será adicionado à nossa lista de espera. Entraremos em contato assim que houver vaga disponível!</p>
                <p>Dúvidas? Fale conosco em {{supportEmail}}</p>
                <p>Atenciosamente,<br>Equipe RecapHorizon</p>
              </div>
              <div class="footer">
                <p>© 2024 RecapHorizon. Todos os direitos reservados.</p>
                <p>Você está recebendo este e‑mail porque se cadastrou em nossa lista de espera.</p>
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

    // Prepare Brevo email data
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.MAILERSEND_SENDER_EMAIL || 'noreply@recaphorizon.com';
    const senderName = process.env.BREVO_SENDER_NAME || process.env.MAILERSEND_SENDER_NAME || 'RecapHorizon';

    // Recipient logic
    const enterpriseRecipient = process.env.ENTERPRISE_CONTACT_RECIPIENT || process.env.MAILERSEND_ADMIN_EMAIL || 'RecapHorizonOffice@gmail.com';
    const userRecipient = emailData.email;
    const toEmail = emailType === 'enterprise_contact' ? enterpriseRecipient : userRecipient;

    const emailPayload = {
      sender: {
        name: senderName,
        email: senderEmail
      },
      to: [
        {
          email: toEmail,
          name: emailType === 'enterprise_contact' ? 'RecapHorizon Office' : (userRecipient ? userRecipient.split('@')[0] : 'User')
        }
      ],
      subject: subject,
      htmlContent: htmlContent,
      tags: emailType === 'enterprise_contact' ? ['enterprise', 'contact', language] : ['2fa', 'waitlist', language]
    };

    // Set reply-to
    if (emailType === 'enterprise_contact' && emailData.email) {
      emailPayload.replyTo = { email: emailData.email };
    } else if (emailData.supportEmail) {
      emailPayload.replyTo = { email: emailData.supportEmail };
    }

    // Send email via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'accept': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Brevo API Error Details:', {
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
      
      throw new Error(`Brevo API error: ${response.status} - ${parsedError.message || errorData}`);
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
        messageId: result.messageId || result.message_id || result.id
      })
    };

  } catch (error) {
    // Log full error server-side only
    console.error('Error sending email:', error);

    const unauthorized = error?.message?.includes('401') || error?.message?.toLowerCase()?.includes('unauthorized');

    const safeMessage = unauthorized
      ? 'Email service not authorized. Please check your Brevo API key configuration.'
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
        code: unauthorized ? 'BREVO_UNAUTHORIZED' : 'EMAIL_SEND_ERROR'
      })
    };
  }
};