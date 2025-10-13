// netlify/functions/transcribe-start.ts
import { Handler, HandlerEvent } from '@netlify/functions';
import axios from 'axios';
import Busboy from 'busboy';
import { Buffer } from 'buffer';
// import { SubscriptionTier } from '../../src/types'; // Not needed in this function

// Typen voor AssemblyAI responses
interface AssemblyAIUploadResponse {
  upload_url: string;
}

interface AssemblyAITranscriptResponseMinimal {
  id: string;
  status: 'queued' | 'processing';
}

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com/v2';

if (!ASSEMBLYAI_API_KEY) {
  console.error('ASSEMBLYAI_API_KEY is niet ingesteld.');
  // Exit in productie, maar in een functieafhandelaar retourneren we een fout
}

const assemblyAIHeaders = {
  authorization: ASSEMBLYAI_API_KEY as string,
};

// Maximum file size: 25MB (Netlify function limit is around 50MB)
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

// Hulpprogramma om multipart/form-data te parsen
async function parseMultipartForm(event: HandlerEvent): Promise<{ audioBuffer: Buffer; contentType: string; languageCode: string }> {
  return new Promise((resolve, reject) => {
    
    const busboy = Busboy({ headers: event.headers });
    let audioBuffer: Buffer = Buffer.alloc(0);
    let contentType: string = '';
    let languageCode: string = 'nl'; // default to Dutch if not provided
    let fileCount = 0;
    let totalSize = 0;

    busboy.on('file', (fieldname, file, info) => {
      fileCount++;
      const { filename, encoding, mimeType } = info;
      
      if (fieldname === 'audio') {
        contentType = mimeType || 'audio/mp4'; // Fallback to audio/mp4 if mimeType is undefined
        
        file.on('data', (data) => {
          totalSize += data.length;
          
          // Check file size limit
          if (totalSize > MAX_FILE_SIZE) {
            file.destroy();
            reject(new Error(`Bestand te groot. Maximum grootte is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`));
            return;
          }
          
          audioBuffer = Buffer.concat([audioBuffer, data]);
        });
        
        file.on('end', () => {
          console.log(`Audio file processed: ${totalSize} bytes`);
        });
        
        file.on('error', (err) => {
          console.error('File stream error:', err);
          reject(err);
        });
      } else {
        file.resume();
      }
    });

    // Capture additional fields (e.g., language_code)
    busboy.on('field', (fieldname, val) => {
      if (fieldname === 'language_code') {
        const v = (val || '').toString().trim();
        // Basic sanitize: only allow letters and dashes, take primary subtag
        const primary = v.split(/[\s,]/)[0];
        const match = primary.match(/^[A-Za-z]{2,3}(-[A-Za-z0-9-]+)?$/);
        if (match) {
          // AssemblyAI expects ISO language codes like 'en', 'nl', 'de', etc.
          languageCode = primary.split('-')[0].toLowerCase();
        }
      }
    });

    busboy.on('finish', () => {
      if (audioBuffer.length > 0 && contentType) {
        resolve({ audioBuffer, contentType, languageCode });
      } else {
        reject(new Error('Geen audiobestand ontvangen.'));
      }
    });

    busboy.on('error', (err) => {
      console.error('parseMultipartForm: Busboy error:', err);
      reject(err);
    });

    // Netlify sets isBase64Encoded=true for binary bodies in production.
    // In netlify dev, it may be false. Decode accordingly to avoid corrupting the multipart stream.
    const isBase64 = (event as any).isBase64Encoded === true;
    const bodyBuffer = isBase64
      ? Buffer.from(event.body as string, 'base64')
      : Buffer.from((event.body as string) || '', 'utf8');
    busboy.end(bodyBuffer);
  });
}

const handler: Handler = async (event) => {
  console.log('🎯 transcribe-start: Function called');
  console.log('📊 transcribe-start: Method:', event.httpMethod);
  console.log('📊 transcribe-start: Headers:', JSON.stringify(event.headers, null, 2));
  console.log('📊 transcribe-start: Body length:', event.body?.length || 0);
  console.log('📊 transcribe-start: IsBase64Encoded:', event.isBase64Encoded);
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  // Handle GET request for testing connectivity
  if (event.httpMethod === 'GET') {
    console.log('🔍 transcribe-start: GET request received - returning test response');
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        ok: true, 
        message: "Function alive",
        timestamp: new Date().toISOString(),
        endpoint: "transcribe-start"
      }),
    };
  }

  // Check if API key is available
  if (!ASSEMBLYAI_API_KEY) {
    console.error('transcribe-start: ERROR - ASSEMBLYAI_API_KEY niet beschikbaar');
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'AssemblyAI API key niet geconfigureerd.' }),
    };
  }
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Methode niet toegestaan. Gebruik POST.' }),
    };
  }

  if (!event.headers['content-type']?.startsWith('multipart/form-data')) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Verwacht multipart/form-data content-type.' }),
    };
  }

  try {
    console.log('transcribe-start: REQUEST INFO', {
      method: event.httpMethod,
      contentType: event.headers['content-type'],
      contentLength: event.headers['content-length'],
      isBase64Encoded: (event as any).isBase64Encoded,
    });
    const { audioBuffer, contentType, languageCode } = await parseMultipartForm(event);

    // Check file size before processing
    if (audioBuffer.length > MAX_FILE_SIZE) {
      return {
        statusCode: 413,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: `Bestand te groot. Maximum grootte is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
          maxSize: MAX_FILE_SIZE 
        }),
      };
    }

    console.log(`Processing audio file: ${audioBuffer.length} bytes, type: ${contentType}`);

    // 1. Upload audio naar AssemblyAI's upload endpoint
    const uploadStart = Date.now();
    const uploadResponse = await axios.post<AssemblyAIUploadResponse>(
      `${ASSEMBLYAI_BASE_URL}/upload`,
      audioBuffer,
      {
        headers: {
          ...assemblyAIHeaders,
          'Content-Type': contentType,
        },
        timeout: 60000, // 60 second timeout
        maxContentLength: MAX_FILE_SIZE,
        maxBodyLength: MAX_FILE_SIZE,
      }
    );
    console.log(`transcribe-start: Upload completed in ${Date.now() - uploadStart}ms`);
    const uploadUrl = uploadResponse.data.upload_url;

    // 2. Start transcriptie met de verkregen upload URL
    const transcriptRequestData = {
      audio_url: uploadUrl,
      language_code: languageCode || 'nl', // client-provided bron taal (fallback nl)
      // speaker_labels: true // Optioneel
    };

    const transcriptStart = Date.now();
    const transcriptResponse = await axios.post<AssemblyAITranscriptResponseMinimal>(
      `${ASSEMBLYAI_BASE_URL}/transcript`,
      transcriptRequestData,
      { headers: assemblyAIHeaders }
    );
    console.log(`transcribe-start: Transcript creation completed in ${Date.now() - transcriptStart}ms`);
    const transcriptId = transcriptResponse.data.id;

    // Retourneer direct de transcriptId naar de client
    const responseData = { transcriptId: transcriptId, status: 'started' };
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(responseData),
    };

  } catch (error: any) {
    console.error('transcribe-start: ERROR - Fout bij het starten van transcriptie');
    console.error('transcribe-start: Error message:', error.message);
    if (error.response) {
      console.error('transcribe-start: Error response status:', error.response.status);
      console.error('transcribe-start: Error response data:', error.response.data);
    }
    // Specifieke fouten voor bestandsgrootte en timeouts
    if (error.message && /Bestand te groot/i.test(error.message)) {
      return {
        statusCode: 413,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Bestand te groot voor transcriptie.', maxSize: MAX_FILE_SIZE }),
      };
    }
    if (error.code === 'ECONNABORTED') {
      return {
        statusCode: 504,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Timeout bij upload of transcript aanmaken.' }),
      };
    }
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Fout bij het starten van de transcriptie.', details: error.message }),
    };
  }
};

export { handler };