import { 
  AIProviderManager, 
  AIFunction, 
  SubscriptionTier, 
  ProviderSelectionRequest 
} from '../utils/aiProviderManager';

// Types for Opportunities module
export interface OpportunityTopic {
  id: string;
  title: string;
  description: string;
}

export interface OpportunityRole {
  id: string;
  name: string;
  description: string;
  category: 'strategy' | 'analysis' | 'innovation' | 'operations' | 'leadership';
  promptTemplate: string;
}

export interface OpportunityType {
  id: string;
  name: string;
  description: string;
  nameEn: string;
  descriptionEn: string;
  promptInstructions: string;
}

export interface OpportunityResult {
  id: string;
  type: string;
  role: string;
  topic: string;
  content: string;
  generatedAt: string;
}

export interface OpportunitySession {
  sessionId: string;
  transcript: string;
  selectedTopics: OpportunityTopic[];
  selectedRoles: OpportunityRole[];
  selectedOpportunityTypes: OpportunityType[];
  results: OpportunityResult[];
  language: string;
  userId: string;
  createdAt: string;
}

// Static data: AI Roles Configuration (25 roles)
export const OPPORTUNITY_ROLES: OpportunityRole[] = [
  {
    id: 'strategic-advisor',
    name: 'De Strategisch Adviseur',
    description: 'Focus op langetermijnvisie, marktleiderschap en overkoepelende groeistrategieën.',
    category: 'strategy',
    promptTemplate: 'Als Strategisch Adviseur focus ik op langetermijnvisie, marktleiderschap en overkoepelende groeistrategieën. Ik analyseer trends, concurrentie en groei mogelijkheden vanuit een strategisch perspectief.'
  },
  {
    id: 'marketing-director',
    name: 'De Marketing Directeur',
    description: 'Richt zich op merkpositionering, campagne-ideeën en effectief doelgroepbereik.',
    category: 'strategy',
    promptTemplate: 'Als Marketing Directeur richt ik me op merkpositionering, campagne-ideeën en effectief doelgroepbereik. Ik ontwikkel marketingstrategieën die de merkwaarde versterken.'
  },
  {
    id: 'sales-expert',
    name: 'De Sales Expert',
    description: 'Analyseert verkoopstrategieën, leadgeneratie en conversie-optimalisatie.',
    category: 'operations',
    promptTemplate: 'Als Sales Expert analyseer ik verkoopstrategieën, leadgeneratie en conversie-optimalisatie. Ik focus op het maximaliseren van verkoopresultaten en klantacquisitie.'
  },
  {
    id: 'product-manager',
    name: 'De Product Manager',
    description: 'Specificeert productontwikkeling, feature-uitbreiding en verbetering van de gebruikerservaring (UX).',
    category: 'innovation',
    promptTemplate: 'Als Product Manager specificeer ik productontwikkeling, feature-uitbreiding en verbetering van de gebruikerservaring. Ik focus op het creëren van waardevolle producten.'
  },
  {
    id: 'innovation-specialist',
    name: 'De Innovatie Specialist',
    description: 'Genereert disruptieve ideeën, R&D-richtingen en oplossingen buiten de gebaande paden.',
    category: 'innovation',
    promptTemplate: 'Als Innovatie Specialist genereer ik disruptieve ideeën, R&D-richtingen en oplossingen buiten de gebaande paden. Ik zoek naar baanbrekende mogelijkheden.'
  },
  {
    id: 'financial-analyst',
    name: 'De Financieel Analist',
    description: 'Identificeert kostenbesparingen, investeringsmogelijkheden en revenue streams.',
    category: 'analysis',
    promptTemplate: 'Als Financieel Analist identificeer ik kostenbesparingen, investeringsmogelijkheden en revenue streams. Ik analyseer financiële data voor strategische beslissingen.'
  },
  {
    id: 'operations-director',
    name: 'De Operationeel Directeur',
    description: 'Focust op procesoptimalisatie, workflowverbetering en operationele schaalbaarheid.',
    category: 'operations',
    promptTemplate: 'Als Operationeel Directeur focus ik op procesoptimalisatie, workflowverbetering en operationele schaalbaarheid. Ik zorg voor efficiënte bedrijfsvoering.'
  },
  {
    id: 'hr-manager',
    name: 'De HR Manager',
    description: 'Bekijkt kansen voor talentontwikkeling, medewerkerstevredenheid en retentie.',
    category: 'leadership',
    promptTemplate: 'Als HR Manager bekijk ik kansen voor talentontwikkeling, medewerkerstevredenheid en retentie. Ik focus op het optimaliseren van human capital.'
  },
  {
    id: 'customer-service-expert',
    name: 'De Klantenservice Expert',
    description: 'Zoekt naar manieren om klanttevredenheid en supportefficiëntie te verhogen.',
    category: 'operations',
    promptTemplate: 'Als Klantenservice Expert zoek ik naar manieren om klanttevredenheid en supportefficiëntie te verhogen. Ik verbeter de klantervaring en service kwaliteit.'
  },
  {
    id: 'business-development-manager',
    name: 'De Business Development Manager',
    description: 'Ontdekt nieuwe zakelijke kansen, potentiële partnerschappen en strategische allianties.',
    category: 'strategy',
    promptTemplate: 'Als Business Development Manager ontdek ik nieuwe zakelijke kansen, potentiële partnerschappen en strategische allianties. Ik bouw relaties voor groei.'
  },
  {
    id: 'data-analyst',
    name: 'De Data Analist',
    description: 'Analyseert dataverzameling, rapportagebehoeften en datagedreven besluitvorming.',
    category: 'analysis',
    promptTemplate: 'Als Data Analist analyseer ik dataverzameling, rapportagebehoeften en datagedreven besluitvorming. Ik transformeer data naar inzichten.'
  },
  {
    id: 'legal-advisor',
    name: 'De Juridisch Adviseur',
    description: 'Identificeert compliance-kansen, juridische risico\'s en ethische overwegingen.',
    category: 'operations',
    promptTemplate: 'Als Juridisch Adviseur identificeer ik compliance-kansen, juridische risico\'s en ethische overwegingen. Ik zorg voor rechtmatige bedrijfsvoering.'
  },
  {
    id: 'technology-strategist',
    name: 'De Technologie Strategist',
    description: 'Adviseert over adoptie van nieuwe technologie, IT-infrastructuur en digitale transformatie.',
    category: 'innovation',
    promptTemplate: 'Als Technologie Strategist adviseer ik over adoptie van nieuwe technologie, IT-infrastructuur en digitale transformatie. Ik moderniseer technische capabilities.'
  },
  {
    id: 'csr-esg-specialist',
    name: 'De MVO / ESG Specialist',
    description: 'Focust op maatschappelijk verantwoord ondernemen, duurzaamheid en sociale impact.',
    category: 'strategy',
    promptTemplate: 'Als MVO/ESG Specialist focus ik op maatschappelijk verantwoord ondernemen, duurzaamheid en sociale impact. Ik integreer duurzaamheid in bedrijfsstrategieën.'
  },
  {
    id: 'internal-communications-specialist',
    name: 'De Interne Communicatie Specialist',
    description: 'Analyseert kennisdeling, interne communicatiestromen en medewerkersbetrokkenheid.',
    category: 'leadership',
    promptTemplate: 'Als Interne Communicatie Specialist analyseer ik kennisdeling, interne communicatiestromen en medewerkersbetrokkenheid. Ik verbeter interne samenwerking.'
  },
  {
    id: 'external-communications-specialist',
    name: 'De Externe Communicatie Specialist',
    description: 'Genereert ideeën voor publieke relaties, stakeholdercommunicatie en reputatiemanagement.',
    category: 'strategy',
    promptTemplate: 'Als Externe Communicatie Specialist genereer ik ideeën voor publieke relaties, stakeholdercommunicatie en reputatiemanagement. Ik beheer de externe reputatie.'
  },
  {
    id: 'project-manager',
    name: 'De Project Manager',
    description: 'Biedt inzicht in projectplanning, resource-allocatie en risicobeheer binnen projecten.',
    category: 'operations',
    promptTemplate: 'Als Project Manager bied ik inzicht in projectplanning, resource-allocatie en risicobeheer binnen projecten. Ik zorg voor succesvolle projectuitvoering.'
  },
  {
    id: 'training-development-specialist',
    name: 'De Training & Ontwikkeling Specialist',
    description: 'Identificeert opleidingsbehoeften, vaardigheidslacunes en leermogelijkheden.',
    category: 'leadership',
    promptTemplate: 'Als Training & Ontwikkeling Specialist identificeer ik opleidingsbehoeften, vaardigheidslacunes en leermogelijkheden. Ik ontwikkel talent en competenties.'
  },
  {
    id: 'international-expansion-expert',
    name: 'De Internationale Uitbreiding Expert',
    description: 'Adviseert over globaliseringsstrategieën, lokale aanpassing en internationale markttoetreding.',
    category: 'strategy',
    promptTemplate: 'Als Internationale Uitbreiding Expert adviseer ik over globaliseringsstrategieën, lokale aanpassing en internationale markttoetreding. Ik faciliteer wereldwijde groei.'
  },
  {
    id: 'customer-journey-mapper',
    name: 'De Customer Journey Mapper',
    description: 'Analyseert de complete klantreis en identificeert pijnpunten en verbeterkansen.',
    category: 'analysis',
    promptTemplate: 'Als Customer Journey Mapper analyseer ik de complete klantreis en identificeer pijnpunten en verbeterkansen. Ik optimaliseer de klantervaring.'
  },
  {
    id: 'content-strategist',
    name: 'De Content Strategist',
    description: 'Focust op contentcreatie, distributiekanalen, storytelling en SEO/SEA implicaties.',
    category: 'strategy',
    promptTemplate: 'Als Content Strategist focus ik op contentcreatie, distributiekanalen, storytelling en SEO/SEA implicaties. Ik ontwikkel effectieve content strategieën.'
  },
  {
    id: 'talent-acquisition-specialist',
    name: 'De Talent Acquisition Specialist',
    description: 'Zoekt naar kansen voor wervingsstrategieën, employer branding en talentpools.',
    category: 'leadership',
    promptTemplate: 'Als Talent Acquisition Specialist zoek ik naar kansen voor wervingsstrategieën, employer branding en talentpools. Ik trek en behoud toptalent.'
  },
  {
    id: 'sustainability-analyst',
    name: 'De Duurzaamheidsanalist',
    description: 'Evalueert milieu-impact, circulaire economie en groene initiatieven.',
    category: 'analysis',
    promptTemplate: 'Als Duurzaamheidsanalist evalueer ik milieu-impact, circulaire economie en groene initiatieven. Ik promoot duurzame bedrijfspraktijken.'
  },
  {
    id: 'innovation-facilitator',
    name: 'De Innovatie Facilitator',
    description: 'Stimuleert brainstormsessies, ideeëngeneratie en validatie van nieuwe concepten.',
    category: 'innovation',
    promptTemplate: 'Als Innovatie Facilitator stimuleer ik brainstormsessies, ideeëngeneratie en validatie van nieuwe concepten. Ik katalyseer creatieve processen.'
  },
  {
    id: 'policymaker',
    name: 'De Beleidsmaker',
    description: 'Adviseert over interne bedrijfsbeleid, ethische richtlijnen en governance-structuren.',
    category: 'leadership',
    promptTemplate: 'Als Beleidsmaker adviseer ik over interne bedrijfsbeleid, ethische richtlijnen en governance-structuren. Ik ontwikkel effectieve beleidsframeworks.'
  }
];

// Static data: Opportunity Types Configuration (5 types as specified in PRD)
export const OPPORTUNITY_TYPES: OpportunityType[] = [
  {
    id: 'swot-analysis',
    name: 'SWOT-Analyse',
    nameEn: 'SWOT Analysis',
    description: 'Een overzicht van de Sterkten, Zwakten, Kansen en Bedreigingen',
    descriptionEn: 'An overview of the Strengths, Weaknesses, Opportunities, and Threats',
    promptInstructions: 'Identificeer interne positieve (sterkten) en negatieve (zwakten) aspecten, evenals externe kansen en bedreigingen. Structureer de analyse in vier duidelijke categorieën met concrete voorbeelden en actionable inzichten.'
  },
  {
    id: 'risk-analysis',
    name: 'Risicoanalyse',
    nameEn: 'Risk Analysis',
    description: 'Identificatie en evaluatie van potentiële risico\'s en hun impact',
    descriptionEn: 'Identification and evaluation of potential risks and their impact',
    promptInstructions: 'Identificeer besproken risico\'s, hun mogelijke gevolgen en waarschijnlijkheid. Categoriseer risico\'s naar type (operationeel, financieel, strategisch) en stel mitigatie strategieën voor.'
  },
  {
    id: 'decision-matrix',
    name: 'Besluitvormingsmatrix',
    nameEn: 'Decision Matrix',
    description: 'Gestructureerde evaluatie van opties en beslissingscriteria',
    descriptionEn: 'Structured evaluation of options and decision criteria',
    promptInstructions: 'Creëer een besluitvormingsmatrix met relevante criteria, weging van factoren en evaluatie van verschillende opties. Geef een duidelijke aanbeveling gebaseerd op de analyse.'
  },
  {
    id: 'action-plan',
    name: 'Actiepunten & Verantwoordelijkheden',
    nameEn: 'Action Points & Responsibilities',
    description: 'Concrete actiestappen met eigenaarschap en deadlines',
    descriptionEn: 'Concrete action steps with ownership and deadlines',
    promptInstructions: 'Definieer specifieke, meetbare actiepunten met duidelijke eigenaren, deadlines en success criteria. Prioriteer acties en identificeer afhankelijkheden.'
  },
  {
    id: 'progress-report',
    name: 'Voortgangsrapportage',
    nameEn: 'Progress Report',
    description: 'Status update met KPI\'s en volgende stappen',
    descriptionEn: 'Status update with KPIs and next steps',
    promptInstructions: 'Analyseer de huidige voortgang, identificeer KPI\'s en metrics, highlight successen en uitdagingen, en definieer concrete volgende stappen.'
  }
];

/**
 * Generate opportunity topics from transcript (reuses existing topic generation)
 */
export async function generateOpportunityTopics(
  transcript: string,
  summary?: string,
  language: string = 'nl',
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.FREE
): Promise<OpportunityTopic[]> {
  const content = summary || transcript;
  
  if (!content || content.trim().length === 0) {
    throw new Error('No content provided for topic generation');
  }

  const prompt = createOpportunityTopicGenerationPrompt(content, language);
  
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

    return parseTopicsFromResponse(response.content);
  } catch (error) {
    console.error('Error generating opportunity topics:', error);
    throw new Error('Failed to generate opportunity topics');
  }
}

/**
 * Generate opportunities based on selected topics, roles, and types
 */
export async function generateOpportunities(
  transcript: string,
  selectedTopics: OpportunityTopic[],
  selectedRoles: OpportunityRole[],
  selectedOpportunityTypes: OpportunityType[],
  language: string = 'nl',
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.FREE
): Promise<OpportunityResult[]> {
  const results: OpportunityResult[] = [];
  
  try {
    // Generate opportunities for each combination of topic, role, and type
    for (const topic of selectedTopics) {
      for (const role of selectedRoles) {
        for (const opportunityType of selectedOpportunityTypes) {
          const prompt = createOpportunityGenerationPrompt(
            transcript,
            topic,
            role,
            opportunityType,
            language
          );
          
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

          const result: OpportunityResult = {
            id: `${topic.id}-${role.id}-${opportunityType.id}-${Date.now()}`,
            type: opportunityType.name,
            role: role.name,
            topic: topic.title,
            content: response.content,
            generatedAt: new Date().toISOString()
          };

          results.push(result);
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error generating opportunities:', error);
    throw new Error('Failed to generate opportunities');
  }
}

/**
 * Create prompt for opportunity topic generation
 */
function createOpportunityTopicGenerationPrompt(content: string, language: string): string {
  const languageInstructions = getLanguageInstructions(language);
  
  return `${languageInstructions.systemPrompt}

Analyseer de volgende content en genereer 5-8 strategische zakelijke onderwerpen die geschikt zijn voor opportunity generatie.

Elk onderwerp moet:
- Een specifieke zakelijke uitdaging of kans identificeren
- Relevant zijn voor strategische besluitvorming
- Geschikt zijn voor verschillende AI-rollen en opportunity types
- Concreet genoeg zijn om actionable opportunities te genereren

Content om te analyseren:
${content}

${languageInstructions.outputFormat}

Genereer de onderwerpen in het volgende JSON-formaat:
[
  {
    "id": "unique-id-1",
    "title": "Korte, zakelijke titel",
    "description": "Uitgebreide beschrijving van het onderwerp en waarom het strategisch relevant is"
  },
  {
    "id": "unique-id-2", 
    "title": "Korte, zakelijke titel",
    "description": "Uitgebreide beschrijving van het onderwerp en waarom het strategisch relevant is"
  }
]

Zorg ervoor dat de output alleen geldige JSON is, zonder extra tekst.`;
}

/**
 * Create prompt for opportunity generation
 */
function createOpportunityGenerationPrompt(
  transcript: string,
  topic: OpportunityTopic,
  role: OpportunityRole,
  opportunityType: OpportunityType,
  language: string
): string {
  const languageInstructions = getLanguageInstructions(language);
  
  return `${languageInstructions.systemPrompt}

${role.promptTemplate}

Gebaseerd op de volgende transcript content, genereer een ${opportunityType.name} voor het onderwerp "${topic.title}".

Onderwerp context: ${topic.description}

${opportunityType.promptInstructions}

Transcript content:
${transcript}

${languageInstructions.analysisInstructions}

BELANGRIJKE INSTRUCTIES VOOR OUTPUT FORMATTING:
- Begin DIRECT met punt 1, geen inleiding, geen "Absoluut!", geen begroeting
- Geen datum, geen "Opsteller:", geen herhaling van rol of onderwerp
- Geen inleidende zinnen zoals "Als ervaren [rol], presenteer ik hierbij..."
- Start onmiddellijk met de eerste concrete punt van de analyse
- Gebruik duidelijke nummering (1., 2., 3., etc.)
- Gebruik kopjes met ## voor hoofdsecties
- Gebruik bullet points met * voor subsecties
- Tussen de 400-600 woorden lang
- Direct toepasbaar voor zakelijke besluitvorming

Begin direct met: "1. [Eerste concrete punt van de analyse]"`;
}

/**
 * Parse topics from AI response
 */
function parseTopicsFromResponse(response: string): OpportunityTopic[] {
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    
    const topics = JSON.parse(jsonMatch[0]);
    
    return topics.map((topic: any, index: number) => ({
      id: topic.id || `opportunity-topic-${index + 1}`,
      title: topic.title || `Zakelijke Kans ${index + 1}`,
      description: topic.description || 'Geen beschrijving beschikbaar'
    }));
  } catch (error) {
    console.error('Error parsing opportunity topics from response:', error);
    
    // Fallback: create generic business topics
    return [
      {
        id: 'fallback-1',
        title: 'Strategische groei kansen',
        description: 'Analyseer potentiële groei kansen en markt expansie mogelijkheden'
      },
      {
        id: 'fallback-2', 
        title: 'Operationele optimalisatie',
        description: 'Identificeer mogelijkheden voor proces verbetering en efficiëntie'
      },
      {
        id: 'fallback-3',
        title: 'Innovatie en technologie',
        description: 'Verken nieuwe technologieën en innovatieve oplossingen'
      },
      {
        id: 'fallback-4',
        title: 'Risicobeheer',
        description: 'Evalueer potentiële risico\'s en ontwikkel mitigatie strategieën'
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
        systemPrompt: 'You are an expert business strategist who helps identify strategic opportunities and actionable insights.',
        outputFormat: 'Generate the topics in English. Use clear, professional business language that is accessible to executives and decision makers.',
        analysisInstructions: 'Provide your analysis in English. Use clear, professional business language that is accessible to executives and decision makers.'
      };
    case 'de':
      return {
        systemPrompt: 'Du bist ein erfahrener Business-Strategist, der dabei hilft, strategische Chancen und umsetzbare Erkenntnisse zu identifizieren.',
        outputFormat: 'Generiere die Themen auf Deutsch. Verwende klare, professionelle Geschäftssprache, die für Führungskräfte und Entscheidungsträger zugänglich ist.',
        analysisInstructions: 'Gib deine Analyse auf Deutsch ab. Verwende klare, professionelle Geschäftssprache, die für Führungskräfte und Entscheidungsträger zugänglich ist.'
      };
    case 'fr':
      return {
        systemPrompt: 'Vous êtes un expert en stratégie d\'entreprise qui aide à identifier les opportunités stratégiques et les informations exploitables.',
        outputFormat: 'Générez les sujets en français. Utilisez un langage commercial clair et professionnel accessible aux dirigeants et aux décideurs.',
        analysisInstructions: 'Fournissez votre analyse en français. Utilisez un langage commercial clair et professionnel accessible aux dirigeants et aux décideurs.'
      };
    case 'es':
      return {
        systemPrompt: 'Eres un experto en estrategia empresarial que ayuda a identificar oportunidades estratégicas e insights accionables.',
        outputFormat: 'Genera los temas en español. Usa un lenguaje comercial claro y profesional accesible para ejecutivos y tomadores de decisiones.',
        analysisInstructions: 'Proporciona tu análisis en español. Usa un lenguaje comercial claro y profesional accesible para ejecutivos y tomadores de decisiones.'
      };
    case 'pt':
      return {
        systemPrompt: 'Você é um especialista em estratégia empresarial que ajuda a identificar oportunidades estratégicas e insights acionáveis.',
        outputFormat: 'Gere os tópicos em português. Use linguagem comercial clara e profissional acessível para executivos e tomadores de decisão.',
        analysisInstructions: 'Forneça sua análise em português. Use linguagem comercial clara e profissional acessível para executivos e tomadores de decisão.'
      };
    default: // Dutch
      return {
        systemPrompt: 'Je bent een ervaren business strategist die helpt bij het identificeren van strategische kansen en actionable inzichten.',
        outputFormat: 'Genereer de onderwerpen in het Nederlands. Gebruik heldere, professionele zakelijke taal die toegankelijk is voor executives en besluitvormers.',
        analysisInstructions: 'Geef je analyse in het Nederlands. Gebruik heldere, professionele zakelijke taal die toegankelijk is voor executives en besluitvormers.'
      };
  }
}

/**
 * Get role by ID
 */
export function getRoleById(id: string): OpportunityRole | undefined {
  return OPPORTUNITY_ROLES.find(role => role.id === id);
}

/**
 * Get opportunity type by ID
 */
export function getOpportunityTypeById(id: string): OpportunityType | undefined {
  return OPPORTUNITY_TYPES.find(type => type.id === id);
}

/**
 * Get roles by category
 */
export function getRolesByCategory(category: OpportunityRole['category']): OpportunityRole[] {
  return OPPORTUNITY_ROLES.filter(role => role.category === category);
}