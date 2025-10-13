// Netlify Function: referral-dashboard-pdf
const admin = require('firebase-admin');
const PDFDocument = require('pdfkit');

// Rate limiting configuration for PDF generation
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_PDF_DOWNLOADS_PER_HOUR = 10; // Maximum PDF downloads per hour

function initAdmin() {
  if (admin.apps.length === 0) {
    const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (sa) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(sa))
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}

function payingTiers() {
  return new Set(['silver', 'gold', 'enterprise', 'diamond']);
}

async function checkPdfRateLimit(db, uid) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Check rate limit collection for PDF downloads
  const rateLimitRef = db.collection('rateLimits').doc(`pdf_download_${uid}`);
  const rateLimitDoc = await rateLimitRef.get();
  
  if (rateLimitDoc.exists) {
    const data = rateLimitDoc.data();
    const attempts = data.attempts || [];
    
    // Filter attempts within the current window
    const recentAttempts = attempts.filter(timestamp => timestamp > windowStart);
    
    if (recentAttempts.length >= MAX_PDF_DOWNLOADS_PER_HOUR) {
      const oldestAttempt = Math.min(...recentAttempts);
      const timeUntilReset = Math.ceil((oldestAttempt + RATE_LIMIT_WINDOW - now) / 1000 / 60); // minutes
      throw new Error(`rate-limit-exceeded:${timeUntilReset}`);
    }
    
    // Update with new attempt
    const updatedAttempts = [...recentAttempts, now];
    await rateLimitRef.set({ attempts: updatedAttempts }, { merge: true });
  } else {
    // First attempt for this user
    await rateLimitRef.set({ attempts: [now] });
  }
}

async function makePdfBuffer({ entries, totals }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Title
      doc.fontSize(18).fillColor('#000').text('Referral Dashboard', { align: 'center' });
      doc.moveDown(1);

      // Summary section with three columns
      doc.fontSize(14).fillColor('#333').text('Overzicht Verdiensten', { underline: true });
      doc.moveDown(0.5);
      
      // Calculate current and previous month earnings
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      // Count paying referrals for current month
      const currentMonthEarnings = entries.filter(e => {
        if (!['silver', 'gold', 'enterprise', 'diamond'].includes(e.currentTier?.toLowerCase())) return false;
        if (!e.signupDate) return false;
        
        const signupMonth = e.signupDate.getMonth();
        const signupYear = e.signupDate.getFullYear();
        
        return (signupYear < currentYear) || 
               (signupYear === currentYear && signupMonth <= currentMonth);
      }).length;
      
      // Count paying referrals for previous month
      const previousMonthEarnings = entries.filter(e => {
        if (!['silver', 'gold', 'enterprise', 'diamond'].includes(e.currentTier?.toLowerCase())) return false;
        if (!e.signupDate) return false;
        
        const signupMonth = e.signupDate.getMonth();
        const signupYear = e.signupDate.getFullYear();
        
        return (signupYear < previousYear) || 
               (signupYear === previousYear && signupMonth <= previousMonth);
      }).length;

      doc.fontSize(12).fillColor('#666');
      doc.text(`Totale verdiensten: $${totals.total.toFixed(2)}`);
      doc.text(`Verdiensten deze maand: $${currentMonthEarnings.toFixed(2)}`);
      doc.text(`Verdiensten vorige maand: $${previousMonthEarnings.toFixed(2)}`);
      doc.moveDown(1);

      // Referrals list
      doc.fontSize(14).fillColor('#333').text('Referral Lijst', { underline: true });
      doc.moveDown(0.5);

      // Table headers
      const col1 = 50;
      const col2 = 200;
      const col3 = 350;
      doc.fontSize(12).fillColor('#000');
      doc.text('Email', col1, doc.y, { width: 140 });
      doc.text('Huidige Abonnement', col2, doc.y, { width: 140 });
      doc.text('Aanmelddatum', col3, doc.y, { width: 140 });
      doc.moveDown(0.5);
      
      // Sort entries by signup date (descending)
      const sortedEntries = [...entries].sort((a, b) => {
        if (!a.signupDate && !b.signupDate) return 0;
        if (!a.signupDate) return 1;
        if (!b.signupDate) return -1;
        return b.signupDate.getTime() - a.signupDate.getTime();
      });

      if (!sortedEntries || sortedEntries.length === 0) {
        doc.fontSize(11).fillColor('#666').text('Geen referrals gevonden.');
      } else {
        for (const e of sortedEntries) {
          doc.fillColor('#000').fontSize(11);
          const y = doc.y;
          doc.text(e.emailMasked || '***', col1, y, { width: 140 });
          doc.text(String(e.currentTier || 'free'), col2, y, { width: 140 });
          
          // Format signup date
          let dateText = 'Onbekend';
          if (e.signupDate) {
            dateText = e.signupDate.toLocaleDateString('nl-NL', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }
          doc.text(dateText, col3, y, { width: 140 });
          doc.moveDown(0.5);
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  try {
    initAdmin();

    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, headers: corsHeaders(), body: 'Unauthorized' };
    }
    const idToken = authHeader.substring('Bearer '.length);
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      return { statusCode: 401, headers: corsHeaders(), body: 'Invalid token' };
    }

    const uid = decoded.uid;
    const db = admin.firestore();

    // Check rate limit before proceeding with PDF generation
    try {
      await checkPdfRateLimit(db, uid);
    } catch (error) {
      if (error.message.startsWith('rate-limit-exceeded:')) {
        const minutes = error.message.split(':')[1];
        return { 
          statusCode: 429, 
          headers: corsHeaders(), 
          body: JSON.stringify({
            error: 'rate-limit-exceeded',
            message: `Te veel PDF downloads. Probeer opnieuw over ${minutes} minuten.`,
            retryAfterMinutes: parseInt(minutes)
          })
        };
      }
      throw error;
    }

    // Query referrals where current user is the referrer
    const qSnap = await db.collection('referrals').where('referrerUid', '==', uid).get();
    const entries = [];
    const tiersPaid = payingTiers();
    let payingCount = 0;

    qSnap.forEach((d) => {
      const data = d.data() || {};
      const currentTier = String(data.currentTier || 'free').toLowerCase();
      if (tiersPaid.has(currentTier)) payingCount += 1;
      
      // Parse signup date from createdAt
      let signupDate = null;
      const createdAt = data.createdAt;
      if (createdAt) {
        if (createdAt.toDate) {
          signupDate = createdAt.toDate();
        } else if (createdAt.seconds) {
          signupDate = new Date(createdAt.seconds * 1000);
        } else if (createdAt._seconds) {
          signupDate = new Date(createdAt._seconds * 1000);
        }
      }
      
      entries.push({
        emailMasked: data.emailMasked || '***',
        currentTier: data.currentTier || 'free',
        monthStartTier: data.monthStartTier || 'free',
        signupDate
      });
    });

    const totals = {
      total: payingCount * 1,
      month: payingCount * 1
    };

    const pdfBuffer = await makePdfBuffer({ entries, totals });
    const base64 = pdfBuffer.toString('base64');

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="referral-dashboard.pdf"'
      },
      body: base64,
      isBase64Encoded: true
    };
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders(), body: 'Server error' };
  }
};