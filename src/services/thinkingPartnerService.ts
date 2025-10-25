import { ThinkingTopic, ThinkingPartner } from '../../types';
import { 
  AIProviderManager, 
  AIFunction, 
  SubscriptionTier, 
  ProviderSelectionRequest 
} from '../utils/aiProviderManager';

/**
 * Generate thinking topics from transcript and summary
 */
export async function generateThinkingTopics(
  transcript: string,
  summary?: string,
  language: string = 'nl',
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.FREE
): Promise<ThinkingTopic[]> {
  const content = summary || transcript;
  
  if (!content || content.trim().length === 0) {
    throw new Error('No content provided for topic generation');
  }

  const prompt = createTopicGenerationPrompt(content, language);
  
  try {
    // Create provider selection request
    const request: ProviderSelectionRequest = {
      userId,
      functionType: AIFunction.ANALYSIS_GENERATION,
      userTier
    };

    const response = await AIProviderManager.generateContentWithProviderSelection(
      request,
      prompt,
      false // No streaming for topic generation
    );

    return parseTopicsFromResponse(response.content);
  } catch (error) {
    console.error('Error generating thinking topics:', error);
    throw new Error('Failed to generate thinking topics');
  }
}

/**
 * Generate thinking partner analysis
 */
export async function generateThinkingPartnerAnalysis(
  topic: ThinkingTopic,
  partner: ThinkingPartner,
  language: string = 'nl',
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.FREE
): Promise<string> {
  const prompt = createAnalysisPrompt(topic, partner, language);
  
  try {
    // Create provider selection request
    const request: ProviderSelectionRequest = {
      userId,
      functionType: AIFunction.ANALYSIS_GENERATION,
      userTier
    };

    const response = await AIProviderManager.generateContentWithProviderSelection(
      request,
      prompt,
      false // No streaming for analysis
    );

    return response.content;
  } catch (error) {
    console.error('Error generating thinking partner analysis:', error);
    throw new Error('Failed to generate thinking partner analysis');
  }
}

/**
 * Create prompt for topic generation
 */
function createTopicGenerationPrompt(content: string, language: string): string {
  const languageInstructions = getLanguageInstructions(language);
  
  return `${languageInstructions.systemPrompt}

Analyseer de volgende content en genereer 5-8 strategische denkonderwerpen die geschikt zijn voor diepere reflectie met een denkpartner.

Elk onderwerp moet:
- Een specifieke strategische vraag of uitdaging identificeren
- Relevant zijn voor besluitvorming of planning
- Geschikt zijn voor verschillende denkmethodologieën
- Concreet genoeg zijn om mee te werken

Content om te analyseren:
${content}

${languageInstructions.outputFormat}

Genereer de onderwerpen in het volgende JSON-formaat:
[
  {
    "id": "unique-id-1",
    "title": "Korte, pakkende titel",
    "description": "Uitgebreide beschrijving van het onderwerp en waarom het relevant is"
  },
  {
    "id": "unique-id-2", 
    "title": "Korte, pakkende titel",
    "description": "Uitgebreide beschrijving van het onderwerp en waarom het relevant is"
  }
]

Zorg ervoor dat de output alleen geldige JSON is, zonder extra tekst.`;
}

/**
 * Create prompt for thinking partner analysis
 */
function createAnalysisPrompt(topic: ThinkingTopic, partner: ThinkingPartner, language: string): string {
  const languageInstructions = getLanguageInstructions(language);
  
  // Replace placeholders in partner's prompt template
  const constructedPrompt = partner.promptTemplate
    .replace('{TOPIC_TITLE}', topic.title)
    .replace('{TOPIC_DESCRIPTION}', topic.description);

  return `${languageInstructions.systemPrompt}

Je bent een ervaren denkpartner die helpt bij strategische reflectie en besluitvorming.

${constructedPrompt}

${languageInstructions.analysisInstructions}

Geef een doordachte, gestructureerde analyse die:
- Direct ingaat op de specifieke vraag of uitdaging
- Concrete inzichten en perspectieven biedt
- Actionable suggesties bevat waar relevant
- Een heldere structuur heeft met kopjes en bullet points
- Tussen de 300-500 woorden lang is

Gebruik een professionele maar toegankelijke toon.`;
}

/**
 * Parse topics from AI response
 */
function parseTopicsFromResponse(response: string): ThinkingTopic[] {
  try {
    // Clean the response to extract JSON
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    
    const topics = JSON.parse(jsonMatch[0]);
    
    // Validate and ensure proper structure
    return topics.map((topic: any, index: number) => ({
      id: topic.id || `topic-${index + 1}`,
      title: topic.title || `Onderwerp ${index + 1}`,
      description: topic.description || 'Geen beschrijving beschikbaar'
    }));
  } catch (error) {
    console.error('Error parsing topics from response:', error);
    
    // Fallback: create generic topics
    return [
      {
        id: 'fallback-1',
        title: 'Strategische prioriteiten',
        description: 'Analyseer de belangrijkste strategische prioriteiten en hun onderlinge relaties'
      },
      {
        id: 'fallback-2', 
        title: 'Besluitvorming',
        description: 'Onderzoek de kernbeslissingen die genomen moeten worden'
      },
      {
        id: 'fallback-3',
        title: 'Uitvoering en risicos',
        description: 'Evalueer uitvoeringsplannen en potentiële risicofactoren'
      }
    ];
  }
}

/**
 * Get language-specific instructions
 */
function getLanguageInstructions(language: string) {
  switch (language.toLowerCase()) {
    case 'en':
      return {
        systemPrompt: 'You are an expert strategic thinking facilitator who helps identify key topics for deeper reflection.',
        outputFormat: 'Generate the topics in English. Use clear, professional language that is accessible to business professionals.',
        analysisInstructions: 'Provide your analysis in English. Use clear, professional language that is accessible to business professionals.'
      };
    case 'de':
      return {
        systemPrompt: 'Du bist ein Experte für strategisches Denken, der dabei hilft, wichtige Themen für tiefere Reflexion zu identifizieren.',
        outputFormat: 'Generiere die Themen auf Deutsch. Verwende eine klare, professionelle Sprache, die für Geschäftsleute zugänglich ist.',
        analysisInstructions: 'Gib deine Analyse auf Deutsch ab. Verwende eine klare, professionelle Sprache, die für Geschäftsleute zugänglich ist.'
      };
    case 'fr':
      return {
        systemPrompt: 'Vous êtes un expert en facilitation de la pensée stratégique qui aide à identifier les sujets clés pour une réflexion plus approfondie.',
        outputFormat: 'Générez les sujets en français. Utilisez un langage clair et professionnel accessible aux professionnels des affaires.',
        analysisInstructions: 'Fournissez votre analyse en français. Utilisez un langage clair et professionnel accessible aux professionnels des affaires.'
      };
    default: // Dutch
      return {
        systemPrompt: 'Je bent een expert strategische denkfacilitator die helpt bij het identificeren van belangrijke onderwerpen voor diepere reflectie.',
        outputFormat: 'Genereer de onderwerpen in het Nederlands. Gebruik heldere, professionele taal die toegankelijk is voor zakelijke professionals.',
        analysisInstructions: 'Geef je analyse in het Nederlands. Gebruik heldere, professionele taal die toegankelijk is voor zakelijke professionals.'
      };
  }
}