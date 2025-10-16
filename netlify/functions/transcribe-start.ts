// netlify/functions/transcribe-start.ts
import { Handler, HandlerEvent } from '@netlify/functions';
import axios from 'axios';
import Busboy from 'busboy';
import { gunzipSync, brotliDecompressSync } from 'zlib';
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
    console.log('parseMultipartForm: Starting to parse multipart data');
    console.log('parseMultipartForm: Event headers:', JSON.stringify(event.headers, null, 2));
    console.log('parseMultipartForm: Body length:', event.body?.length || 0);
    console.log('parseMultipartForm: isBase64Encoded:', (event as any).isBase64Encoded);
    
    // Validate that we have a body
    if (!event.body) {
      console.error('parseMultipartForm: No body in request');
      reject(new Error('Geen request body ontvangen.'));
      return;
    }

    // Validate content-type header
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    if (!contentType || !contentType.startsWith('multipart/form-data')) {
      console.error('parseMultipartForm: Invalid content-type:', contentType);
      reject(new Error('Verwacht multipart/form-data content-type.'));
      return;
    }

    try {
      // Zorg dat Busboy altijd de juiste content-type header met boundary krijgt
      const busboy = Busboy({ headers: { 'content-type': contentType } });
      let audioBuffer: Buffer = Buffer.alloc(0);
      let audioContentType: string = '';
      let languageCode: string = 'nl'; // default to Dutch if not provided
      let fileCount = 0;
      let totalSize = 0;
      let hasReceivedFile = false;

      busboy.on('file', (fieldname, file, info) => {
        console.log(`parseMultipartForm: Received file field: ${fieldname}`, info);
        fileCount++;
        const { filename, encoding, mimeType } = info;
        
        if (fieldname === 'audio') {
          hasReceivedFile = true;
          audioContentType = mimeType || 'audio/mp4'; // Fallback to audio/mp4 if mimeType is undefined
          console.log(`parseMultipartForm: Processing audio file - type: ${audioContentType}, filename: ${filename}`);
          
          file.on('data', (data) => {
            totalSize += data.length;
            console.log(`parseMultipartForm: Received data chunk: ${data.length} bytes, total: ${totalSize} bytes`);
            
            // Check file size limit
            if (totalSize > MAX_FILE_SIZE) {
              console.error(`parseMultipartForm: File too large: ${totalSize} > ${MAX_FILE_SIZE}`);
              file.destroy();
              reject(new Error(`Bestand te groot. Maximum grootte is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`));
              return;
            }
            
            audioBuffer = Buffer.concat([audioBuffer, data]);
          });
          
          file.on('end', () => {
            console.log(`parseMultipartForm: Audio file processing completed: ${totalSize} bytes`);
          });
          
          file.on('error', (err) => {
            console.error('parseMultipartForm: File stream error:', err);
            reject(err);
          });
        } else {
          console.log(`parseMultipartForm: Skipping non-audio field: ${fieldname}`);
          file.resume();
        }
      });

      // Capture additional fields (e.g., language_code)
      busboy.on('field', (fieldname, val) => {
        console.log(`parseMultipartForm: Received field: ${fieldname} = ${val}`);
        if (fieldname === 'language_code') {
          const v = (val || '').toString().trim();
          // Basic sanitize: only allow letters and dashes, take primary subtag
          const primary = v.split(/[\s,]/)[0];
          const match = primary.match(/^[A-Za-z]{2,3}(-[A-Za-z0-9-]+)?$/);
          if (match) {
            // AssemblyAI expects ISO language codes like 'en', 'nl', 'de', etc.
            languageCode = primary.split('-')[0].toLowerCase();
            console.log(`parseMultipartForm: Set language code to: ${languageCode}`);
          }
        }
      });

      busboy.on('finish', () => {
        console.log(`parseMultipartForm: Parsing finished - hasReceivedFile: ${hasReceivedFile}, audioBuffer length: ${audioBuffer.length}, contentType: ${audioContentType}`);
        if (hasReceivedFile && audioBuffer.length > 0 && audioContentType) {
          resolve({ audioBuffer, contentType: audioContentType, languageCode });
        } else {
          const errorMsg = !hasReceivedFile 
            ? 'Geen audio field ontvangen in multipart data.'
            : audioBuffer.length === 0 
              ? 'Audio buffer is leeg.'
              : 'Geen content type bepaald voor audio.';
          console.error('parseMultipartForm: Validation failed:', errorMsg);
          reject(new Error(errorMsg));
        }
      });

      busboy.on('error', (err) => {
        console.error('parseMultipartForm: Busboy error:', err);
        reject(err);
      });

      // Netlify sets isBase64Encoded=true for binary bodies in production.
      // In netlify dev, it may be false. Decode accordingly to avoid corrupting the multipart stream.
      const isBase64 = (event as any).isBase64Encoded === true;
      console.log(`parseMultipartForm: Processing body - isBase64: ${isBase64}, body type: ${typeof event.body}`);
      
      let bodyBuffer: Buffer;
      try {
        if (isBase64) {
          // Netlify productie: body is base64 encoded
          bodyBuffer = Buffer.from(event.body as string, 'base64');
          console.log(`parseMultipartForm: Decoded base64 body to ${bodyBuffer.length} bytes`);
        } else {
          // Netlify dev of andere omgevingen
          if (typeof event.body === 'string') {
            // Probeer eerst latin1 encoding voor binary data in strings
            try {
              bodyBuffer = Buffer.from(event.body, 'latin1');
              console.log(`parseMultipartForm: Processed string body (latin1) to ${bodyBuffer.length} bytes`);
            } catch (latin1Error) {
              // Fallback naar binary encoding
              bodyBuffer = Buffer.from(event.body, 'binary');
              console.log(`parseMultipartForm: Processed string body (binary) to ${bodyBuffer.length} bytes`);
            }
          } else {
            bodyBuffer = Buffer.from(event.body || '');
            console.log(`parseMultipartForm: Processed buffer body to ${bodyBuffer.length} bytes`);
          }
        }

        // Indien de body gecomprimeerd is (gzip of brotli), eerst decomprimeren
        const contentEncoding = (event.headers['content-encoding'] || event.headers['Content-Encoding'] || '').toLowerCase();
        if (contentEncoding.includes('gzip')) {
          try {
            const decompressed = gunzipSync(bodyBuffer);
            console.log(`parseMultipartForm: GZIP decompressed body from ${bodyBuffer.length} to ${decompressed.length} bytes`);
            bodyBuffer = decompressed;
          } catch (gzipErr) {
            console.error('parseMultipartForm: Failed to gunzip body:', gzipErr);
            // Ga door zonder decomprimeren; Busboy zal dan falen en we geven een duidelijke fout terug
          }
        } else if (contentEncoding.includes('br')) {
          try {
            const decompressed = brotliDecompressSync(bodyBuffer);
            console.log(`parseMultipartForm: Brotli decompressed body from ${bodyBuffer.length} to ${decompressed.length} bytes`);
            bodyBuffer = decompressed;
          } catch (brErr) {
            console.error('parseMultipartForm: Failed to brotli-decompress body:', brErr);
          }
        }
        
        // Extra validatie voor Netlify productie
        if (bodyBuffer.length === 0) {
          console.error('parseMultipartForm: Body buffer is empty after processing');
          reject(new Error('Request body is leeg na verwerking.'));
          return;
        }
        
        // Log eerste paar bytes voor debugging
        const preview = bodyBuffer.slice(0, 50).toString('ascii').replace(/[^\x20-\x7E]/g, '.');
        console.log(`parseMultipartForm: Body preview (first 50 bytes): ${preview}`);
        
        try {
          busboy.end(bodyBuffer);
        } catch (endErr) {
          console.error('parseMultipartForm: Error ending busboy stream:', endErr);
          reject(new Error('Fout bij afronden van multipart parser.'));
          return;
        }
      } catch (bufferError) {
        console.error('parseMultipartForm: Error processing body buffer:', bufferError);
        reject(new Error('Fout bij verwerken van request body.'));
      }
    } catch (busboyError) {
      console.error('parseMultipartForm: Error creating Busboy instance:', busboyError);
      reject(new Error('Fout bij initialiseren van multipart parser.'));
    }
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
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

  const contentType = event.headers['content-type'] || event.headers['Content-Type'];
  if (!contentType?.startsWith('multipart/form-data')) {
    console.error('transcribe-start: Invalid content-type received:', contentType);
    console.error('transcribe-start: Available headers:', Object.keys(event.headers));
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Verwacht multipart/form-data content-type.',
        received: contentType || 'geen content-type header',
        availableHeaders: Object.keys(event.headers)
      }),
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
    console.error('transcribe-start: Error stack:', error.stack);
    if (error.response) {
      console.error('transcribe-start: Error response status:', error.response.status);
      console.error('transcribe-start: Error response data:', error.response.data);
    }
    
    // Specifieke fouten voor multipart parsing
    if (error.message && /multipart/i.test(error.message)) {
      console.error('transcribe-start: Multipart parsing error detected');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Fout bij verwerken van multipart data.',
          details: error.message,
          isBase64: (event as any).isBase64Encoded,
          bodyLength: event.body?.length || 0,
          contentType: event.headers['content-type'] || 'geen content-type'
        }),
      };
    }
    
    // Specifieke fouten voor body processing
    if (error.message && (/body/i.test(error.message) || /buffer/i.test(error.message))) {
      console.error('transcribe-start: Body processing error detected');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Fout bij verwerken van request body.',
          details: error.message,
          isBase64: (event as any).isBase64Encoded,
          bodyType: typeof event.body
        }),
      };
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
      body: JSON.stringify({ 
        error: 'Fout bij het starten van de transcriptie.', 
        details: error.message,
        type: error.constructor.name
      }),
    };
  }
};

export { handler };