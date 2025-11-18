const { GoogleGenerativeAI } = require('@google/generative-ai');

const ipRequests = new Map();
const userRequests = new Map();

function getOrigin(event) {
  const o = event.headers?.origin || '';
  return o;
}

function normalizeOrigin(url) {
  try { return new URL(url).origin; } catch { return (url || '').trim(); }
}

function isOriginAllowed(event) {
  const list = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const maybeEnvOrigins = [process.env.URL, process.env.DEPLOY_URL, process.env.DEPLOY_PRIME_URL, process.env.SITE_URL]
    .map(v => (v || '').trim())
    .filter(Boolean)
    .map(normalizeOrigin);
  const allowed = new Set([...list.map(normalizeOrigin), ...maybeEnvOrigins]);
  if (allowed.size === 0) return true;
  const origin = normalizeOrigin(getOrigin(event));
  return allowed.has(origin);
}

function getClientIp(event) {
  const cip = event.headers?.['client-ip'] || event.headers?.['Client-Ip'] || '';
  if (cip) return cip.trim();
  const xf = event.headers?.['x-forwarded-for'] || event.headers?.['X-Forwarded-For'] || '';
  if (xf) return xf.split(',')[0].trim();
  return 'unknown';
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

function checkRateLimitUser(userId, limitPerMinute) {
  if (!userId) return { allowed: true };
  const now = Date.now();
  const windowMs = 60000;
  const arr = userRequests.get(userId) || [];
  const recent = arr.filter(ts => now - ts < windowMs);
  if (recent.length >= limitPerMinute) {
    const oldest = Math.min(...recent);
    const retryAfter = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, retryAfter };
  }
  recent.push(now);
  userRequests.set(userId, recent);
  return { allowed: true };
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    const allowed = isOriginAllowed(event);
    const origin = getOrigin(event);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': allowed ? origin : 'null',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      , 'Vary': 'Origin'},
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    const allowed = isOriginAllowed(event);
    const origin = getOrigin(event);
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': allowed ? origin : 'null',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      , 'Vary': 'Origin'},
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!isOriginAllowed(event)) {
      return {
        statusCode: 403,
        headers: { 'Access-Control-Allow-Origin': 'null', 'Vary': 'Origin' },
        body: JSON.stringify({ success: false, error: 'Error: Origin not allowed' })
      };
    }

    const ct = String(event.headers?.['content-type'] || event.headers?.['Content-Type'] || '').toLowerCase();
    if (!ct.includes('application/json')) {
      const origin = getOrigin(event);
      return {
        statusCode: 415,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Vary': 'Origin'
        },
        body: JSON.stringify({ success: false, error: 'Unsupported Media Type' })
      };
    }

    if ((event.body || '').length > 100 * 1024) {
      const origin = getOrigin(event);
      return {
        statusCode: 413,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Vary': 'Origin'
        },
        body: JSON.stringify({ success: false, error: 'Payload too large' })
      };
    }

    const { prompt, model, temperature, maxTokens, userId } = JSON.parse(event.body || '{}');

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      const origin = getOrigin(event);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Vary': 'Origin'
        },
        body: JSON.stringify({ success: false, error: 'Invalid prompt' })
      };
    }

    const ip = getClientIp(event);
    const ipLimit = parseInt(process.env.RATE_LIMIT_PER_MINUTE || '20', 10);
    const userLimit = parseInt(process.env.USER_RATE_LIMIT_PER_MINUTE || '30', 10);
    const ipCheck = checkRateLimitIp(ip, ipLimit);
    if (!ipCheck.allowed) {
      const origin = getOrigin(event);
      return {
        statusCode: 429,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Retry-After': String(ipCheck.retryAfter)
        , 'Vary': 'Origin'},
        body: JSON.stringify({ success: false, error: 'Error: Rate limit exceeded for IP' })
      };
    }
    const userCheck = checkRateLimitUser(userId, userLimit);
    if (!userCheck.allowed) {
      const origin = getOrigin(event);
      return {
        statusCode: 429,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Retry-After': String(userCheck.retryAfter)
        , 'Vary': 'Origin'},
        body: JSON.stringify({ success: false, error: 'Error: Rate limit exceeded for user' })
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
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Vary': 'Origin'
        },
        body: JSON.stringify({ success: false, error: 'Error: Missing GEMINI_API_KEY' })
      };
    }

    const safePrompt = prompt.slice(0, 20000);
    const allowedModels = new Set(['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']);
    const selectedModel = typeof model === 'string' && allowedModels.has(model.trim()) ? model.trim() : 'gemini-2.5-flash';
    const tRaw = typeof temperature === 'number' ? temperature : 0.7;
    const temp = Math.max(0, Math.min(1, tRaw));
    const mRaw = typeof maxTokens === 'number' ? maxTokens : 4000;
    const maxOut = Math.max(1, Math.min(4000, mRaw));

    const genai = new GoogleGenerativeAI(apiKey);
    const generativeModel = genai.getGenerativeModel({
      model: selectedModel,
      generationConfig: {
        temperature: temp,
        maxOutputTokens: maxOut
      }
    });

    const result = await generativeModel.generateContent(safePrompt);
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin'
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin'
      },
      body: JSON.stringify({ success: false, error: `Error: ${message}` })
    };
  }
};