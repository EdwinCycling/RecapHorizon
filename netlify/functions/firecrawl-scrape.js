const ipRequests = new Map();
const userRequests = new Map();

function getOrigin(event) {
  const o = event.headers?.origin || '';
  return o;
}

function isOriginAllowed(event) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.length === 0) return true;
  const origin = getOrigin(event);
  return allowed.includes(origin);
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin'
      },
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin'
      },
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

    const { urls, userId } = JSON.parse(event.body || '{}');
    const list = Array.isArray(urls) ? urls.filter(u => typeof u === 'string' && u.trim().length > 0) : [];
    if (list.length === 0) {
      const origin = getOrigin(event);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ success: false, error: 'Invalid URLs' })
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
          'Retry-After': String(ipCheck.retryAfter),
          'Vary': 'Origin'
        },
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
          'Retry-After': String(userCheck.retryAfter),
          'Vary': 'Origin'
        },
        body: JSON.stringify({ success: false, error: 'Error: Rate limit exceeded for user' })
      };
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;
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
        body: JSON.stringify({ success: false, error: 'Error: Missing FIRECRAWL_API_KEY' })
      };
    }

    const results = [];
    for (const u of list) {
      try {
        const response = await fetch('https://api.firecrawl.dev/v2/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            url: u,
            formats: ['markdown'],
            onlyMainContent: true,
            includeTags: ['title', 'meta', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'article', 'section'],
            removeBase64Images: true,
            blockAds: true
          })
        });
        if (!response.ok) continue;
        const data = await response.json();
        if (data && data.success && data.data) {
          results.push({
            url: u,
            markdown: data.data.markdown || data.data.content || '',
            metadata: data.data.metadata || {}
          });
        }
      } catch (_) {
        continue;
      }
    }

    if (results.length === 0) {
      const origin = getOrigin(event);
      return {
        statusCode: 502,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ success: false, error: 'Error: No content retrieved from provided URLs' })
      };
    }

    const origin = getOrigin(event);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin'
      },
      body: JSON.stringify({ success: true, results })
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