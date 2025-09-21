export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Try to extract per-user token from encrypted cookie
  const sessionSecret = process.env.SESSION_SECRET;
  const cookieHeader = event.headers.cookie || event.headers.Cookie || '';
  const getCookie = (name) => {
    const parts = cookieHeader.split(';').map(p => p.trim());
    const hit = parts.find(p => p.startsWith(name + '='));
    return hit ? decodeURIComponent(hit.substring(name.length + 1)) : '';
  };
  let TOKEN = '';
  try {
    const payload = getCookie('ns_token');
    if (payload && sessionSecret) {
      const crypto = await import('node:crypto');
      const buf = Buffer.from(payload, 'base64url');
      const iv = buf.subarray(0, 12);
      const tag = buf.subarray(12, 28);
      const enc = buf.subarray(28);
      const key = crypto.createHash('sha256').update(sessionSecret).digest();
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
      const data = JSON.parse(dec.toString('utf8'));
      if (data?.access_token && (!data.expires_at || data.expires_at > Date.now())) {
        TOKEN = data.access_token;
      }
    }
  } catch { /* ignore, will enforce OAuth-only */ }

  // Enforce OAuth-only: require per-user token, do not fallback to NOTION_SECRET
  if (!TOKEN) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Not connected to Notion. Please connect your Notion account.' }) };
  }

  try {
    const { query = '', page_size = 25, start_cursor } = JSON.parse(event.body || '{}');

    const res = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        page_size,
        start_cursor,
        filter: { property: 'object', value: 'page' },
        sort: { direction: 'descending', timestamp: 'last_edited_time' }
      })
    });

    if (!res.ok) {
      const text = await res.text();
      return { statusCode: res.status, body: JSON.stringify({ error: 'Notion search failed', detail: text }) };
    }

    const data = await res.json();

    const pages = (data.results || []).filter(r => r.object === 'page').map(page => {
      let title = 'Untitled';
      try {
        const props = page.properties || {};
        for (const key of Object.keys(props)) {
          const prop = props[key];
          if (prop && prop.type === 'title' && Array.isArray(prop.title) && prop.title.length) {
            title = prop.title.map(t => t.plain_text || '').join('') || title;
            break;
          }
        }
      } catch (e) { /* ignore */ }

      const icon = page.icon && page.icon.type === 'emoji' ? page.icon.emoji : null;

      return {
        id: page.id,
        title,
        icon,
        last_edited_time: page.last_edited_time
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ pages, has_more: data.has_more, next_cursor: data.next_cursor })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error', detail: String(err && err.message || err) }) };
  }
}