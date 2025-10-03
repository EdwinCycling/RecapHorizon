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

// Hulpprogramma om multipart/form-data te parsen
async function parseMultipartForm(event: HandlerEvent): Promise<{ audioBuffer: Buffer; contentType: string }> {
  return new Promise((resolve, reject) => {
    
    const busboy = Busboy({ headers: event.headers });
    let audioBuffer: Buffer = Buffer.alloc(0);
    let contentType: string = '';
    let fileCount = 0;

    busboy.on('file', (fieldname, file, info) => {
      fileCount++;
      const { filename, encoding, mimeType } = info;
      
      if (fieldname === 'audio') {
        contentType = mimeType || 'audio/mp4'; // Fallback to audio/mp4 if mimeType is undefined
        file.on('data', (data) => {
          audioBuffer = Buffer.concat([audioBuffer, data]);
        });
        file.on('end', () => {
          // File processing completed
        });
      } else {
        file.resume();
      }
    });

    busboy.on('finish', () => {
      if (audioBuffer.length > 0 && contentType) {
        resolve({ audioBuffer, contentType });
      } else {
        reject(new Error('Geen audiobestand ontvangen.'));
      }
    });

    busboy.on('error', (err) => {
      console.error('parseMultipartForm: Busboy error:', err);
      reject(err);
    });

    const decodedBody = Buffer.from(event.body as string, 'base64');
    busboy.end(decodedBody);
  });
}

const handler: Handler = async (event) => {
  
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
    const { audioBuffer, contentType } = await parseMultipartForm(event);

    // 1. Upload audio naar AssemblyAI's upload endpoint
    
    const uploadResponse = await axios.post<AssemblyAIUploadResponse>(
      `${ASSEMBLYAI_BASE_URL}/upload`,
      audioBuffer,
      {
        headers: {
          ...assemblyAIHeaders,
          'Content-Type': contentType,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    const uploadUrl = uploadResponse.data.upload_url;

    // 2. Start transcriptie met de verkregen upload URL
    const transcriptRequestData = {
      audio_url: uploadUrl,
      language_code: "nl", // Voor Nederlands
      // speaker_labels: true // Optioneel
    };

    const transcriptResponse = await axios.post<AssemblyAITranscriptResponseMinimal>(
      `${ASSEMBLYAI_BASE_URL}/transcript`,
      transcriptRequestData,
      { headers: assemblyAIHeaders }
    );
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
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Fout bij het starten van de transcriptie.', details: error.message }),
    };
  }
};

export { handler };