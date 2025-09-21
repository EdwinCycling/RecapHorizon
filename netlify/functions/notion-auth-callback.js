// Notion OAuth callback - exchanges code for access token and stores it in an encrypted, HttpOnly cookie
export async function handler(event) {
  try {
    if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };

    const { queryStringParameters = {} } = event;
    const { code, state } = queryStringParameters;

    const clientId = process.env.NOTION_CLIENT_ID;
    const clientSecret = process.env.NOTION_CLIENT_SECRET;
    const redirectUri = process.env.NOTION_REDIRECT_URI;
    const sessionSecret = process.env.SESSION_SECRET;

    if (!clientId || !clientSecret || !redirectUri || !sessionSecret) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server auth not configured.' }) };
    }

    // Verify state (against HMAC and freshness)
    const cookieHeader = event.headers.cookie || event.headers.Cookie || '';
    const cookieMap = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')));
    const stateCookie = decodeURIComponent(cookieMap['ns_state'] || '');
    if (!state || !stateCookie || state !== stateCookie) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid state' }) };
    }

    const crypto = await import('node:crypto');
    const parts = state.split('.');
    const raw = parts[0];
    const sig = parts[1];
    const hmac = crypto.createHmac('sha256', sessionSecret).update(raw).digest('hex');
    if (hmac !== sig) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid state signature' }) };
    const ts = Number(raw.split(':')[1] || 0);
    if (!ts || Date.now() - ts > 10 * 60 * 1000) return { statusCode: 400, body: JSON.stringify({ error: 'State expired' }) };

    // Exchange code for token
    const res = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      return { statusCode: res.status, body: JSON.stringify({ error: 'Token exchange failed', detail: txt }) };
    }

    const token = await res.json(); // contains access_token, workspace_id, bot_id, etc.

    // Encrypt minimal token for cookie storage (short-lived)
    const iv = crypto.randomBytes(12);
    const key = crypto.createHash('sha256').update(sessionSecret).digest();
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([cipher.update(JSON.stringify({
      access_token: token.access_token,
      workspace_id: token.workspace_id,
      expires_at: Date.now() + 2 * 60 * 60 * 1000 // 2h
    }), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    const payload = Buffer.concat([iv, tag, enc]).toString('base64url');

    const insecure = (event.headers['x-forwarded-proto'] || event.headers['X-Forwarded-Proto'] || '').toLowerCase() !== 'https';
    const baseToken = `HttpOnly; SameSite=Lax; Path=/; Max-Age=${2 * 60 * 60}`;
    const baseState = 'HttpOnly; SameSite=Lax; Path=/; Max-Age=0';
    const attrToken = insecure ? baseToken : baseToken + '; Secure';
    const attrState = insecure ? baseState : baseState + '; Secure';
    const headers = {
      'Set-Cookie': [
        `ns_token=${payload}; ${attrToken}`,
        `ns_state=; ${attrState}`
      ],
      Location: '/'
    };
    return { statusCode: 302, headers };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Auth callback failed', detail: String(err?.message || err) }) };
  }
}