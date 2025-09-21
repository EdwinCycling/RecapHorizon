async function fetchPageBlocks(pageId, token) {
  let results = [];
  let next = undefined;
  do {
    const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100${next ? `&start_cursor=${next}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28'
      }
    });
    if (!res.ok) throw new Error(`Notion blocks error ${res.status}`);
    const data = await res.json();
    results = results.concat(data.results || []);
    next = data.has_more ? data.next_cursor : undefined;
  } while (next);
  return results;
}

function blocksToText(blocks) {
  const lines = [];
  const push = s => lines.push(s);
  for (const b of blocks) {
    const t = (arr) => (arr||[]).map(x => x.plain_text||'').join('');
    switch (b.type) {
      case 'paragraph': push(t(b.paragraph?.rich_text)); break;
      case 'heading_1': push(`# ${t(b.heading_1?.rich_text)}`); break;
      case 'heading_2': push(`## ${t(b.heading_2?.rich_text)}`); break;
      case 'heading_3': push(`### ${t(b.heading_3?.rich_text)}`); break;
      case 'bulleted_list_item': push(`- ${t(b.bulleted_list_item?.rich_text)}`); break;
      case 'numbered_list_item': push(`1. ${t(b.numbered_list_item?.rich_text)}`); break;
      case 'to_do': push(`[${b.to_do?.checked ? 'x':' '}] ${t(b.to_do?.rich_text)}`); break;
      case 'quote': push(`> ${t(b.quote?.rich_text)}`); break;
      case 'code': push(t(b.code?.rich_text)); break;
      default: break;
    }
  }
  return lines.join('\n');
}

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
    const { page_id } = JSON.parse(event.body || '{}');
    if (!page_id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing page_id' }) };

    // Normalize Notion ID (accept URLs or IDs)
    const idMatch = String(page_id).match(/[0-9a-fA-F-]{32,}/);
    if (!idMatch) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid Notion page id or url' }) };
    const id = idMatch[0].replace(/-/g, '');

    const blocks = await fetchPageBlocks(id, TOKEN);
    const text = blocksToText(blocks);

    return { statusCode: 200, body: JSON.stringify({ text }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error', detail: String(err && err.message || err) }) };
  }
}