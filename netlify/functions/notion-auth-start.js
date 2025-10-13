// Notion OAuth start - redirects user to Notion consent screen
export async function handler(event) {
  try {
    const clientId = process.env.NOTION_CLIENT_ID;
    const redirectUri = process.env.NOTION_REDIRECT_URI; // e.g. https://your-site/.netlify/functions/notion-auth-callback or http://localhost:8888/.netlify/functions/notion-auth-callback
    const sessionSecret = process.env.SESSION_SECRET;

    if (!clientId || !redirectUri || !sessionSecret) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server auth not configured. Missing NOTION_CLIENT_ID / NOTION_REDIRECT_URI / SESSION_SECRET.' }) };
    }

    const crypto = await import('node:crypto');
    const stateRaw = crypto.randomBytes(24).toString('hex') + ':' + Date.now();
    const hmac = crypto.createHmac('sha256', sessionSecret).update(stateRaw).digest('hex');
    const stateSigned = `${stateRaw}.${hmac}`;

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      owner: 'user',
      redirect_uri: redirectUri,
      state: stateSigned
    });

    const authorizeUrl = `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;

    const insecure = (event.headers['x-forwarded-proto'] || event.headers['X-Forwarded-Proto'] || '').toLowerCase() !== 'https';
    const base = 'HttpOnly; SameSite=Lax; Path=/; Max-Age=600';
    const attrs = insecure ? base : base + '; Secure';
    const headers = {
      Location: authorizeUrl,
      'Set-Cookie': [`ns_state=${encodeURIComponent(stateSigned)}; ${attrs}`]
    };
    return { statusCode: 302, headers };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Auth start failed', detail: String(err?.message || err) }) };
  }
}