// netlify/functions/transcribe-status.ts
import { Handler } from '@netlify/functions';
import axios from 'axios';

// Typen voor AssemblyAI responses
interface AssemblyAITranscriptResponseFull {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  error?: string;
}

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_BASE_URL = 'https://api.assemblyai.com/v2';

if (!ASSEMBLYAI_API_KEY) {
  console.error('ASSEMBLYAI_API_KEY is niet ingesteld.');
}

const assemblyAIHeaders = {
  authorization: ASSEMBLYAI_API_KEY as string,
};

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
  
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Methode niet toegestaan. Gebruik GET.' }),
    };
  }

  const transcriptId = event.queryStringParameters?.id;

  if (!transcriptId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Ontbrekende transcriptId parameter.' }),
    };
  }

  try {
    const pollingResponse = await axios.get<AssemblyAITranscriptResponseFull>(
      `${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}`,
      { headers: assemblyAIHeaders }
    );
    
    const transcriptionResult = pollingResponse.data;

    const responseData = {
      id: transcriptionResult.id,
      status: transcriptionResult.status,
      text: transcriptionResult.text, // Zal alleen aanwezig zijn bij 'completed'
      error: transcriptionResult.error, // Zal alleen aanwezig zijn bij 'error'
    };
    
    // Stuur de huidige status en eventueel de tekst terug naar de client
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(responseData),
    };

  } catch (error: any) {
    console.error('transcribe-status: ERROR - Fout bij het ophalen van transcriptiestatus voor ID', transcriptId);
    console.error('transcribe-status: Error message:', error.message);
    if (error.response) {
      console.error('transcribe-status: Error response status:', error.response.status);
      console.error('transcribe-status: Error response data:', error.response.data);
    }
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Fout bij het ophalen van de transcriptiestatus.', details: error.message }),
    };
  }
};

export { handler };