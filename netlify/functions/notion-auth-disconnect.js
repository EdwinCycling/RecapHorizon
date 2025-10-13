// Clears encrypted Notion session cookie
export async function handler(event) {
  const cookieAttrs = () => {
    const insecure = (event.headers['x-forwarded-proto'] || event.headers['X-Forwarded-Proto'] || '').toLowerCase() !== 'https';
    // In dev (http), omit Secure; in prod, include Secure
    const base = 'HttpOnly; SameSite=Lax; Path=/; Max-Age=0';
    return insecure ? base : base + '; Secure';
  };
  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': [`ns_token=; ${cookieAttrs()}`]
    },
    body: JSON.stringify({ ok: true })
  };
}