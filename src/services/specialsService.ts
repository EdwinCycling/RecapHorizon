import { PromptDocument } from '../../types';
import { 
  AIProviderManager, 
  AIFunction, 
  SubscriptionTier, 
  ProviderSelectionRequest 
} from '../utils/aiProviderManager';
import { tokenManager } from '../utils/tokenManager';
import { tokenCounter } from '../tokenCounter';

/**
 * Load available prompts from Firestore for Specials functionality
 */
export async function loadAvailablePrompts(): Promise<PromptDocument[]> {
  try {
    const { db } = await import('../firebase');
    const { collection, getDocs } = await import('firebase/firestore');
    
    // First try to get all documents without any filters
    const promptsRef = collection(db, 'prompts');
    const snapshot = await getDocs(promptsRef);
    
    const prompts: PromptDocument[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Support both 'prompt_text' and 'prompt' field names from Firestore
      const text: string =
        (typeof data.prompt_text === 'string' && data.prompt_text) ||
        (typeof data.prompt === 'string' && data.prompt) ||
        '';
      
      // Only include active prompts with valid prompt text
      if (data.is_active && text.trim().length > 0) {
        prompts.push({
          id: doc.id,
          title: typeof data.title === 'string' ? data.title : '',
          prompt_text: text,
          requires_topic: !!data.requires_topic,
          is_active: !!data.is_active,
          created_at: data.created_at,
          updated_at: data.updated_at,
          language: data.language ?? null
        });
      } else {
        // Skip inactive prompts or ones without valid text
      }
    });
    return prompts;
  } catch (error) {
    console.error('❌ [SpecialsService] Error loading prompts:', error);
    throw new Error('Failed to load prompts');
  }
}

/**
 * Generate topics for Specials functionality using shared topics
 */
export async function generateSpecialsTopics(
  transcript: string,
  summary?: string,
  topicLanguage: string = 'nl',
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.FREE
): Promise<string[]> {
  const content = summary || transcript;
  
  if (!content || content.trim().length === 0) {
    throw new Error('No content provided for topic generation');
  }

  const prompt = createTopicGenerationPrompt(content, topicLanguage);
  
  try {
    const request: ProviderSelectionRequest = {
      userId,
      functionType: AIFunction.ANALYSIS_GENERATION,
      userTier
    };

    const response = await AIProviderManager.generateContentWithProviderSelection(
      request,
      prompt,
      false
    );

    // Record token usage
    try {
      const promptTokens = tokenCounter.countPromptTokens(prompt);
      const responseTokens = tokenCounter.countResponseTokens(response.content);
      await tokenManager.recordTokenUsage(userId, promptTokens, responseTokens);
    } catch (error) {
      console.error('❌ [SpecialsService] Error recording token usage for specials topic generation:', error);
    }

    // Parse response to extract topics
    let text = response.content || '';
    text = text.replace(/```[a-z]*|```/gi, '').trim();
    let topics: any[];
    try {
      topics = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ [SpecialsService] Failed to parse topics JSON', { raw: text });
      throw new Error('Failed to parse topics JSON for specials topics');
    }
    return topics.map((topic: any) => topic.title || topic.name || topic);
  } catch (error) {
    console.error('❌ [SpecialsService] Error generating specials topics:', error);
    throw new Error('Failed to generate topics for specials');
  }
}

/**
 * Generate Specials result based on selected prompt and topic
 */
export async function generateSpecialsResult(
  prompt: PromptDocument,
  topic: string | null,
  transcript: string,
  summary?: string,
  language: string = 'nl',
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.FREE
): Promise<string> {
  const content = summary || transcript;
  
  if (!content || content.trim().length === 0) {
    throw new Error('No content provided for result generation');
  }

  if (!prompt.prompt_text || prompt.prompt_text.trim().length === 0) {
    throw new Error('Invalid prompt provided');
  }

  // Build the final prompt
  let finalPrompt = prompt.prompt_text;
  
  // Replace placeholders in the prompt
  finalPrompt = finalPrompt.replace(/\{transcript\}/g, content);
  finalPrompt = finalPrompt.replace(/\{summary\}/g, summary || content);
  
  if (prompt.requires_topic && topic) {
    finalPrompt = finalPrompt.replace(/\{topic\}/g, topic);
  }
  
  // Add strict output directives (do not ask for more data; start directly with the result)
  const outputDirectives = [
    'Start directly with the result. Do not include introductions, prefaces, or meta commentary.',
    'Never ask for additional data, fields, or questions. Use only the provided context.',
    'If information is missing, proceed with best-effort analysis without requesting more input.'
  ].join('\n');

  // Add language instruction and the output directives
  const languageInstruction = getLanguageInstruction(language);
  finalPrompt = `${languageInstruction}\n\n${outputDirectives}\n\n${finalPrompt}`;

  try {
    const request: ProviderSelectionRequest = {
      userId,
      functionType: AIFunction.ANALYSIS_GENERATION,
      userTier
    };

    const response = await AIProviderManager.generateContentWithProviderSelection(
      request,
      finalPrompt,
      false
    );

    // Record token usage
    try {
      const promptTokens = tokenCounter.countPromptTokens(finalPrompt);
      const responseTokens = tokenCounter.countResponseTokens(response.content);
      await tokenManager.recordTokenUsage(userId, promptTokens, responseTokens);
    } catch (error) {
      console.error('❌ [SpecialsService] Error recording token usage for specials result generation:', error);
    }
    const contentOut = response.content.trim();
    return contentOut;
  } catch (error) {
    console.error('❌ [SpecialsService] Error generating specials result:', error);
    throw new Error('Failed to generate specials result');
  }
}

/**
 * Create topic generation prompt for Specials
 */
function createTopicGenerationPrompt(content: string, language: string): string {
  const languageInstruction = getLanguageInstruction(language);
  
  return `${languageInstruction}

Analyseer de volgende content en genereer 5-8 relevante onderwerpen die geschikt zijn voor verdere analyse en discussie.

Elk onderwerp moet:
- Direct gebaseerd zijn op de inhoud van het transcript
- Specifiek en concreet zijn
- Geschikt zijn voor verschillende soorten analyses
- Relevant zijn voor de context van de content

Content om te analyseren:
${content}

Genereer de onderwerpen in het volgende JSON-formaat:
[
  {
    "id": "unique-id-1",
    "title": "Korte, duidelijke titel",
    "description": "Uitgebreide beschrijving van het onderwerp"
  },
  {
    "id": "unique-id-2",
    "title": "Korte, duidelijke titel", 
    "description": "Uitgebreide beschrijving van het onderwerp"
  }
]

Zorg ervoor dat de output alleen geldige JSON is, zonder extra tekst.`;
}

/**
 * Get language instruction based on language code
 */
function getLanguageInstruction(language: string): string {
  switch (language) {
    case 'en':
      return 'Please respond in English.';
    case 'fr':
      return 'Veuillez répondre en français.';
    case 'de':
      return 'Bitte antworten Sie auf Deutsch.';
    case 'es':
      return 'Por favor responde en español.';
    case 'pt':
      return 'Por favor responda em português.';
    case 'nl':
    default:
      return 'Antwoord alsjeblieft in het Nederlands.';
  }
}