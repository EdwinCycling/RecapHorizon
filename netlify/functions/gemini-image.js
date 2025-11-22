const { GoogleGenerativeAI } = require('@google/generative-ai');

function getOrigin(event) {
  return event.headers?.origin || '';
}

function isOriginAllowed(event) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.length === 0) return true;
  const origin = getOrigin(event);
  if ((origin || '').includes('localhost')) return true;
  return allowed.includes(origin);
}

const ipRequests = new Map();
function getClientIp(event) {
  const xf = event.headers?.['x-forwarded-for'] || event.headers?.['X-Forwarded-For'] || '';
  if (xf) return xf.split(',')[0].trim();
  const cip = event.headers?.['client-ip'] || event.headers?.['Client-Ip'] || '';
  return cip || 'unknown';
}

function checkRateLimitIp(ip, limitPerMinute) {
  const now = Date.now();
  const windowMs = 60000;
  const arr = ipRequests.get(ip) || [];
  const recent = arr.filter(ts => now - ts < windowMs);
  if (recent.length >= limitPerMinute) {
    const oldest = Math.min(...recent);
    const retryAfter = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, retryAfter };
  }
  recent.push(now);
  ipRequests.set(ip, recent);
  return { allowed: true };
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    const origin = getOrigin(event);
    const allowed = isOriginAllowed(event);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': allowed ? origin : 'null',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    const origin = getOrigin(event);
    const allowed = isOriginAllowed(event);
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': allowed ? origin : 'null',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!isOriginAllowed(event)) {
      return {
        statusCode: 403,
        headers: { 'Access-Control-Allow-Origin': 'null' },
        body: JSON.stringify({ success: false, error: 'Error: Origin not allowed' })
      };
    }

    const { prompt, model, imageBase64, mimeType, temperature, maxTokens, userId } = JSON.parse(event.body || '{}');
    if (!prompt || typeof prompt !== 'string') {
      const origin = getOrigin(event);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ success: false, error: 'Invalid prompt' })
      };
    }
    if (!imageBase64 || !mimeType) {
      const origin = getOrigin(event);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ success: false, error: 'Invalid image payload' })
      };
    }

    const ip = getClientIp(event);
    const ipLimit = parseInt(process.env.RATE_LIMIT_PER_MINUTE || '20', 10);
    const ipCheck = checkRateLimitIp(ip, ipLimit);
    if (!ipCheck.allowed) {
      const origin = getOrigin(event);
      return {
        statusCode: 429,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Retry-After': String(ipCheck.retryAfter)
        },
        body: JSON.stringify({ success: false, error: 'Error: Rate limit exceeded for IP' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      const origin = getOrigin(event);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ success: false, error: 'Error: Missing GEMINI_API_KEY' })
      };
    }

    const genai = new GoogleGenerativeAI(apiKey);
    const selectedModel = typeof model === 'string' && model.trim().length > 0 ? model : 'gemini-2.5-flash';
    const temp = typeof temperature === 'number' ? temperature : 0.7;
    const maxOut = typeof maxTokens === 'number' ? maxTokens : 2000;

    const parts = [
      { text: prompt.slice(0, 10000) },
      { inlineData: { mimeType, data: imageBase64 } }
    ];

    const generativeModel = genai.getGenerativeModel({
      model: selectedModel,
      generationConfig: { temperature: temp, maxOutputTokens: maxOut }
    });

    const result = await generativeModel.generateContent({ contents: { parts } });
    const response = await result.response;
    const text = response.text();

    const usage = {
      inputTokens: response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount || 0
    };

    const origin = getOrigin(event);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ success: true, content: text, model: selectedModel, usage })
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const origin = getOrigin(event);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ success: false, error: `Error: ${message}` })
    };
  }
};