import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export interface Prompt {
  id: string;
  title: string;
  prompt_text: string;
  requires_topic: boolean;
  is_active: boolean;
  created_at: any;
  updated_at: any;
  language?: string | null;
}

/**
 * Haalt alle actieve prompts op uit Firestore
 */
export const getActivePrompts = async (language?: string): Promise<Prompt[]> => {
  try {
    const promptsRef = collection(db, 'prompts');
    
    // Query voor actieve prompts
    let q = query(
      promptsRef,
      where('is_active', '==', true),
      orderBy('created_at', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const prompts: Prompt[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const text: string =
        (typeof data.prompt_text === 'string' && data.prompt_text) ||
        (typeof data.prompt === 'string' && data.prompt) ||
        '';
      const normalized: Prompt = {
        id: doc.id,
        title: typeof data.title === 'string' ? data.title : '',
        prompt_text: text,
        requires_topic: !!data.requires_topic,
        is_active: !!data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
        language: data.language ?? null
      };
      return normalized;
    });
    
    // Filter op taal indien opgegeven
    if (language) {
      return prompts.filter(prompt => 
        prompt.language === null || 
        prompt.language === language
      );
    }
    
    return prompts;
  } catch (error) {
    console.error('Error fetching active prompts:', error);
    // Re-throw the error so it can be handled by the calling function
    throw error;
  }
};

/**
 * Haalt een specifieke prompt op basis van ID
 */
export const getPromptById = async (promptId: string): Promise<Prompt | null> => {
  try {
    const prompts = await getActivePrompts();
    return prompts.find(prompt => prompt.id === promptId) || null;
  } catch (error) {
    console.error('Error fetching prompt by ID:', error);
    return null;
  }
};

/**
 * Genereert de finale AI prompt voor een special
 */
export const generateFinalPrompt = (
  prompt: Prompt,
  transcriptText: string,
  userSelectedTopic?: string,
  outputLanguage: string = 'nl'
): string => {
  const contextInfo = userSelectedTopic 
    ? `Richt je specifiek op het onderwerp: '${userSelectedTopic}' in je analyse.`
    : 'Analyseer de volledige transcriptie.';

  return `Je bent een gespecialiseerde AI die inzichten genereert uit transcripties.

**Huidige Transcriptie:**
"""
${transcriptText}
"""

**Instructie voor jou:**
${prompt.prompt_text}

**Contextuele Informatie:**
${contextInfo}

**Output Formaat:**
Genereer je antwoord in ${outputLanguage === 'nl' ? 'het Nederlands' : outputLanguage === 'en' ? 'English' : outputLanguage}. Zorg voor een gestructureerde en duidelijke output.`;
};