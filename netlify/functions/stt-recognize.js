export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { projectId, location = 'global', recognizer = '_', base64Audio, languageCode = 'nl-NL', encoding = 'WEBM_OPUS', sampleRateHertz = 16000, enableWordTimeOffsets = false, model = 'latest_long' } = JSON.parse(event.body || '{}');

    // Validate required inputs
    if (!base64Audio) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ error: 'Missing required parameter: base64Audio' })
      };
    }

    // Obtain an OAuth access token for Google Cloud using a service account
    const { GoogleAuth } = await import('google-auth-library');

    let credentialsObj = null;
    const rawCreds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (rawCreds) {
      try { credentialsObj = JSON.parse(rawCreds); } catch { /* ignore parse error */ }
    }

    const auth = new GoogleAuth({
      credentials: credentialsObj || undefined,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    let resolvedProjectId = projectId;
    if (!resolvedProjectId) {
      try { resolvedProjectId = await auth.getProjectId(); } catch { /* ignore */ }
    }

    if (!accessToken || !resolvedProjectId) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Error: Unable to obtain Google access token or projectId' })
      };
    }

    // Build request to Speech-to-Text v2 recognize endpoint
    const endpoint = location === 'global' ? 'speech.googleapis.com' : `${location}-speech.googleapis.com`;
    const recognizerName = `projects/${resolvedProjectId}/locations/${location}/recognizers/${recognizer}`;
    const url = `https://${endpoint}/v2/${encodeURIComponent(recognizerName)}:recognize`;

    const config = {
      languageCodes: [languageCode],
      model,
      features: {
        enableWordTimeOffsets,
      },
      explicitDecodingConfig: {
        encoding,
        sampleRateHertz,
        audioChannelCount: 1
      }
    };

    const requestBody = {
      config,
      content: base64Audio
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const text = await res.text();

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'STT recognize failed', detail: text })
      };
    }

    let data;
    try { data = JSON.parse(text); } catch {
      data = { raw: text };
    }

    const results = (data.results || []).map(r => ({
      transcript: (r.alternatives && r.alternatives[0] && r.alternatives[0].transcript) || '',
      confidence: (r.alternatives && r.alternatives[0] && r.alternatives[0].confidence) || undefined,
      words: (r.alternatives && r.alternatives[0] && r.alternatives[0].words) || []
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ results, raw: data })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Server error', detail: String(err && err.message || err) })
    };
  }
}