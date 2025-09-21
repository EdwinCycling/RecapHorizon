// Returns { connected: boolean, workspace_id?: string }
export async function handler(event) {
  try {
    const sessionSecret = process.env.SESSION_SECRET;
    const cookieHeader = event.headers.cookie || event.headers.Cookie || '';
    const cookie = (name) => {
      const parts = cookieHeader.split(';').map(p => p.trim());
      const hit = parts.find(p => p.startsWith(name + '='));
      return hit ? decodeURIComponent(hit.substring(name.length + 1)) : '';
    };
    const tokenPayload = cookie('ns_token');
    if (!tokenPayload || !sessionSecret) {
      // Enforce OAuth-only: do not fallback to NOTION_SECRET
      return { statusCode: 200, body: JSON.stringify({ connected: false }) };
    }

    const crypto = await import('node:crypto');
    try {
      const buf = Buffer.from(tokenPayload, 'base64url');
      const iv = buf.subarray(0, 12);
      const tag = buf.subarray(12, 28);
      const enc = buf.subarray(28);
      const key = crypto.createHash('sha256').update(sessionSecret).digest();
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
      const data = JSON.parse(dec.toString('utf8'));
      const connected = !!data?.access_token && (!data.expires_at || data.expires_at > Date.now());
      return { statusCode: 200, body: JSON.stringify({ connected, workspace_id: data?.workspace_id || null }) };
    } catch {
      return { statusCode: 200, body: JSON.stringify({ connected: false }) };
    }
  } catch (err) {
    return { statusCode: 200, body: JSON.stringify({ connected: false }) };
  }
}