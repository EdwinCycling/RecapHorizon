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

// Static data: Opportunity Types Configuration (14 comprehensive types)
export const OPPORTUNITY_TYPES: OpportunityType[] = [
  {
    id: 'new-product-development',
    name: 'Nieuwe Product- of Dienstontwikkeling',
    nameEn: 'New Product or Service Development',
    description: 'Suggesties voor geheel nieuwe producten, diensten of functies om te ontwikkelen.',
    descriptionEn: 'Suggestions for entirely new products, services, or features to develop.',
    promptInstructions: 'Genereer ideeën voor innovatieve producten/diensten gebaseerd op onvervulde behoeften of nieuwe mogelijkheden uit de transcriptie.'
  },
  {
    id: 'market-expansion',
    name: 'Marktuitbreiding & Segmentatie',
    nameEn: 'Market Expansion & Segmentation',
    description: 'Kansen om nieuwe geografische markten of klantsegmenten te betreden.',
    descriptionEn: 'Opportunities to enter new geographical markets or customer segments.',
    promptInstructions: 'Identificeer potentiële nieuwe markten of klantgroepen uit de transcriptie en hoe deze te benaderen.'
  },
  {
    id: 'process-optimization',
    name: 'Procesoptimalisatie & Efficiëntie',
    nameEn: 'Process Optimization & Efficiency',
    description: 'Suggesties voor het stroomlijnen van workflows en het verhogen van de operationele efficiëntie.',
    descriptionEn: 'Suggestions for streamlining workflows and increasing operational efficiency.',
    promptInstructions: 'Wijzen op inefficiënties of knelpunten in processen en stel verbeteringen voor die leiden tot efficiëntie.'
  },
  {
    id: 'cost-reduction',
    name: 'Kostenbesparing',
    nameEn: 'Cost Reduction',
    description: 'Identificatie van gebieden waar kosten gereduceerd kunnen worden zonder kwaliteitsverlies.',
    descriptionEn: 'Identification of areas where costs can be reduced without compromising quality.',
    promptInstructions: 'Zoek naar mogelijkheden om uitgaven te verminderen, middelen efficiënter in te zetten of verspilling te elimineren.'
  },
  {
    id: 'customer-engagement',
    name: 'Klantbetrokkenheid & Loyaliteit',
    nameEn: 'Customer Engagement & Loyalty',
    description: 'Ideeën om de interactie met klanten te verbeteren en hun loyaliteit te verhogen.',
    descriptionEn: 'Ideas to improve customer interaction and increase their loyalty.',
    promptInstructions: 'Genereer manieren om de klantrelatie te versterken, tevredenheid te verhogen en klantverloop te verminderen.'
  },
  {
    id: 'partnerships',
    name: 'Partnerschap & Allianties',
    nameEn: 'Partnership & Alliances',
    description: 'Potentiële samenwerkingen met andere bedrijven of strategische partners.',
    descriptionEn: 'Potential collaborations with other companies or strategic partners.',
    promptInstructions: 'Identificeer potentiële partners en de voordelen van gezamenlijke initiatieven die uit de transcriptie naar voren komen.'
  },
  {
    id: 'competitive-advantage',
    name: 'Concurrentievoordeel',
    nameEn: 'Competitive Advantage',
    description: 'Manieren om zich te onderscheiden van de concurrentie en unieke waardeproposities te creëren.',
    descriptionEn: 'Ways to differentiate from competitors and create unique value propositions.',
    promptInstructions: 'Stel voor hoe het bedrijf zich uniek kan positioneren of onderscheidende kenmerken kan ontwikkelen ten opzichte van concurrenten.'
  },
  {
    id: 'risk-prevention',
    name: 'Risicopreventie & Beperking',
    nameEn: 'Risk Prevention & Mitigation',
    description: 'Kansen om potentiële risico\'s te identificeren en strategieën om deze te voorkomen.',
    descriptionEn: 'Opportunities to identify potential risks and strategies to prevent them.',
    promptInstructions: 'Analyseer de transcriptie op potentiële problemen, bedreigingen of valkuilen en stel proactieve oplossingen voor.'
  },
  {
    id: 'knowledge-sharing',
    name: 'Interne Kennisdeling & Training',
    nameEn: 'Internal Knowledge Sharing & Training',
    description: 'Kansen om de kennisoverdracht en de vaardigheden van medewerkers te verbeteren.',
    descriptionEn: 'Opportunities to improve internal knowledge transfer and employee skills.',
    promptInstructions: 'Genereer ideeën voor het verbeteren van interne communicatie, leerprogramma\'s of kennismanagement.'
  },
  {
    id: 'revenue-growth',
    name: 'Revenue Groei',
    nameEn: 'Revenue Growth',
    description: 'Strategieën om de omzet te verhogen door prijsoptimalisatie of nieuwe verdienmodellen.',
    descriptionEn: 'Strategies to increase revenue through pricing optimization or new business models.',
    promptInstructions: 'Stel manieren voor om de inkomsten te verhogen, zoals prijsstrategieën, nieuwe verkoopkanalen of productbundels.'
  },
  {
    id: 'sustainability',
    name: 'Duurzaamheid & Maatschappelijke Impact',
    nameEn: 'Sustainability & Social Impact',
    description: 'Kansen om duurzame praktijken te integreren en de maatschappelijke impact te vergroten.',
    descriptionEn: 'Opportunities to integrate sustainable practices and increase social impact.',
    promptInstructions: 'Identificeer mogelijkheden om de ecologische of sociale voetafdruk te verbeteren of maatschappelijke waarde te creëren.'
  },
  {
    id: 'employer-branding',
    name: 'Employer Branding & Talent Acquisition',
    nameEn: 'Employer Branding & Talent Acquisition',
    description: 'Kansen om het bedrijf aantrekkelijker te maken voor toptalent en de wervingsstrategie te verbeteren.',
    descriptionEn: 'Opportunities to make the company more attractive to top talent and improve recruitment strategy.',
    promptInstructions: 'Genereer ideeën om het imago als werkgever te verbeteren, talent aan te trekken en het wervingsproces te optimaliseren.'
  },
  {
    id: 'technology-adoption',
    name: 'Technologische Adoptie & Integratie',
    nameEn: 'Technology Adoption & Integration',
    description: 'Mogelijkheden om nieuwe technologieën te implementeren of bestaande systemen te integreren.',
    descriptionEn: 'Possibilities to implement new technologies or integrate existing systems.',
    promptInstructions: 'Stel voor hoe technologie kan worden ingezet om processen te verbeteren, nieuwe diensten te leveren of de operatie te stroomlijnen.'
  },
  {
    id: 'ux-improvement',
    name: 'Gebruikerservaring (UX) Verbetering',
    nameEn: 'User Experience (UX) Improvement',
    description: 'Kansen om de gebruiksvriendelijkheid en de algehele ervaring van de app/service te optimaliseren.',
    descriptionEn: 'Opportunities to optimize the usability and overall experience of the app/service.',
    promptInstructions: 'Identificeer pijnpunten in de gebruikersreis en stel verbeteringen voor om de tevredenheid en het gebruiksgemak te verhogen.'
  },
  {
    id: 'niche-targeting',
    name: 'Niche Targeting',
    nameEn: 'Niche Targeting',
    description: 'Kansen om specifieke, onderbediende nichemarkten te identificeren en te bedienen.',
    descriptionEn: 'Opportunities to identify and serve specific, underserved niche markets.',
    promptInstructions: 'Ontdek kleine, gespecialiseerde segmenten die nog niet optimaal worden bediend en stel een aanpak voor.'
  },
  {
    id: 'financial-injection',
    name: 'Financiële Injectie & Funding',
    nameEn: 'Financial Injection & Funding',
    description: 'Mogelijkheden voor het aantrekken van investeringen, subsidies of optimalisatie van kapitaalstromen.',
    descriptionEn: 'Opportunities for attracting investments, grants, or optimizing capital flows.',
    promptInstructions: 'Identificeer routes voor financiering of manieren om de financiële slagkracht te vergroten.'
  },
  {
    id: 'internal-communication',
    name: 'Interne Communicatie Verbetering',
    nameEn: 'Internal Communication Improvement',
    description: 'Kansen om de helderheid en effectiviteit van de communicatie binnen de organisatie te vergroten.',
    descriptionEn: 'Opportunities to enhance the clarity and effectiveness of communication within the organization.',
    promptInstructions: 'Genereer ideeën om de stroom van informatie binnen het bedrijf te verbeteren, de cohesie te versterken en misverstanden te voorkomen.'
  },
  {
    id: 'automation-ai',
    name: 'Automatisering & AI-Toepassing',
    nameEn: 'Automation & AI Application',
    description: 'Kansen om handmatige taken te automatiseren en AI in te zetten voor slimmere besluitvorming.',
    descriptionEn: 'Opportunities to automate manual tasks and leverage AI for smarter decision-making.',
    promptInstructions: 'Stel processen of taken voor die geautomatiseerd kunnen worden of waar AI toegevoegde waarde kan leveren.'
  },
  {
    id: 'reputation-management',
    name: 'Reputatiemanagement',
    nameEn: 'Reputation Management',
    description: 'Kansen om de publieke perceptie te verbeteren, positieve berichtgeving te stimuleren en kritiek te beheren.',
    descriptionEn: 'Opportunities to improve public perception, foster positive messaging, and manage criticism.',
    promptInstructions: 'Genereer strategieën om het imago van het bedrijf te versterken, de online aanwezigheid te optimaliseren en proactief te reageren op publieke sentimenten.'
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