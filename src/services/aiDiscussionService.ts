import { 
  AIDiscussionTopic, 
  AIDiscussionGoal, 
  AIDiscussionRole, 
  AIDiscussionMessage, 
  AIDiscussionTurn, 
  AIDiscussionSession,
  AIDiscussionReport,
  DiscussionPhase
} from '../../types';
import { 
  AIProviderManager, 
  AIFunction, 
  SubscriptionTier, 
  ProviderSelectionRequest 
} from '../utils/aiProviderManager';

/**
 * Generate discussion topics from transcript and summary
 */
export async function generateDiscussionTopics(
  transcript: string,
  summary?: string,
  language: string = 'nl',
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.GOLD
): Promise<AIDiscussionTopic[]> {
  const content = summary || transcript;
  
  if (!content || content.trim().length === 0) {
    throw new Error('No content provided for topic generation');
  }

  const prompt = createTopicGenerationPrompt(content, language);
  
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
    console.error('Error generating discussion topics:', error);
    throw new Error('Failed to generate discussion topics');
  }
}

/**
 * Start a new AI discussion session
 */
export async function startDiscussion(
  topic: AIDiscussionTopic,
  goal: AIDiscussionGoal,
  roles: AIDiscussionRole[],
  language: string = 'nl',
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.GOLD
): Promise<AIDiscussionSession> {
  if (roles.length !== 4) {
    throw new Error('Exactly 4 roles are required for discussion');
  }

  const session: AIDiscussionSession = {
    id: generateSessionId(),
    topic,
    goal,
    roles,
    turns: [],
    status: 'active',
    createdAt: new Date(),
    language
  };

  // Generate initial discussion prompt
  const initialTurn = await generateInitialTurn(session, userId, userTier);
  session.turns.push(initialTurn);

  return session;
}

/**
 * Continue discussion with next turn
 */
export async function continueDiscussion(
  session: AIDiscussionSession,
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.GOLD
): Promise<AIDiscussionTurn> {
  if (session.status !== 'active') {
    throw new Error('Discussion session is not active');
  }

  if (session.turns.length >= 10) {
    session.status = 'completed';
    throw new Error('Maximum number of turns reached');
  }

  const nextTurnNumber = session.turns.length + 1;
  const nextTurn = await generateNextTurn(session, nextTurnNumber, userId, userTier);
  session.turns.push(nextTurn);

  // Check if discussion should end
  if (session.turns.length >= 10 || shouldEndDiscussion(session)) {
    session.status = 'completed';
  }

  return nextTurn;
}

/**
 * Generate discussion report
 */
export async function generateDiscussionReport(
  session: AIDiscussionSession,
  language: string = 'nl',
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.GOLD
): Promise<AIDiscussionReport> {
  const prompt = createReportGenerationPrompt(session, language);
  
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

    return parseReportFromResponse(response.content, session);
  } catch (error) {
    console.error('Error generating discussion report:', error);
    throw new Error('Failed to generate discussion report');
  }
}

/**
 * Generate initial discussion turn
 */
async function generateInitialTurn(
  session: AIDiscussionSession,
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.GOLD
): Promise<AIDiscussionTurn> {
  const messages: AIDiscussionMessage[] = [];
  
  // Generate opening statements from each role
  for (const role of session.roles) {
    const prompt = createRolePrompt(role, session, [], true);
    
    try {
      const request: ProviderSelectionRequest = {
        userId,
        functionType: AIFunction.EXPERT_CHAT,
        userTier
      };

      const response = await AIProviderManager.generateContentWithProviderSelection(
        request,
        prompt,
        false
      );

      messages.push({
        id: generateMessageId(),
        role: role.id,
        content: response.content,
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error generating message for role ${role.id}:`, error);
      // Add fallback message
      messages.push({
        id: generateMessageId(),
        role: role.id,
        content: `Als ${role.name} wil ik graag bijdragen aan deze discussie over ${session.topic.title}.`,
        timestamp: new Date()
      });
    }
  }

  return {
    id: generateTurnId(),
    turnNumber: 1,
    phase: 'introduction',
    messages,
    timestamp: new Date()
  };
}

/**
 * Generate next discussion turn
 */
async function generateNextTurn(
  session: AIDiscussionSession,
  turnNumber: number,
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.GOLD
): Promise<AIDiscussionTurn> {
  const phase = getPhaseForTurn(turnNumber);
  const phaseInstructions = getPhaseInstructions(phase, session);
  const messages: AIDiscussionMessage[] = [];
  const previousMessages = getAllPreviousMessages(session);
  
  // Generate responses from each role based on the current phase
  for (const role of session.roles) {
    const prompt = createRolePrompt(role, session, previousMessages, false, phaseInstructions);
    
    try {
      const request: ProviderSelectionRequest = {
        userId,
        functionType: AIFunction.EXPERT_CHAT,
        userTier
      };

      const response = await AIProviderManager.generateContentWithProviderSelection(
        request,
        prompt,
        false
      );

      messages.push({
        id: generateMessageId(),
        role: role.id,
        content: response.content,
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Error generating message for role ${role.id}:`, error);
      // Add fallback message
      messages.push({
        id: generateMessageId(),
        role: role.id,
        content: `Als ${role.name} wil ik graag bijdragen aan fase ${turnNumber}: ${phase}.`,
        timestamp: new Date()
      });
    }
  }

  return {
    id: generateTurnId(),
    turnNumber: turnNumber,
    phase: phase,
    messages,
    timestamp: new Date()
  };
}

/**
 * Create role-specific prompt
 */
function createRolePrompt(
  role: AIDiscussionRole,
  session: AIDiscussionSession,
  previousMessages: AIDiscussionMessage[],
  isFirstTurn: boolean,
  phaseInstructions?: string
): string {
  const languageInstructions = getLanguageInstructions(session.language);
  
  // Bepaal of dit een vervolgbeurt is (beurt 2 of hoger)
  const isSubsequentTurn = !isFirstTurn && previousMessages.length > 0;
  
  const contextSection = isFirstTurn
    ? `Je neemt deel aan een gestructureerde discussie over: "${session.topic.title}"
Discussiedoel: ${session.goal.description}

Jouw rol: ${role.name} - ${role.description}
Focusgebied: ${role.focusArea}

Introductie: Geef je eerste indruk over het onderwerp vanuit je rol als ${role.name}. Vermijd formuleringen zoals "mijn [naam]" - spreek direct in je rol.`
    : `Je neemt deel aan een voortdurende discussie over: "${session.topic.title}"
Discussiedoel: ${session.goal.description}

Jouw rol: ${role.name} - ${role.description}
Focusgebied: ${role.focusArea}

Fase instructies: ${phaseInstructions || 'Geef een substantiële bijdrage die voortbouwt op de vorige discussie.'}

Vorige discussie: ${formatPreviousMessages(previousMessages, session.roles)}

Geef een substantiële bijdrage die aansluit bij de huidige fase. Stel kritische "waarom" vragen, bied nieuwe perspectieven, of verdiep de analyse vanuit jouw expertise.`;

  const previousMessagesSection = previousMessages.length > 0 
    ? `\n\nVorige berichten in de discussie:\n${formatPreviousMessages(previousMessages, session.roles)}`
    : '';

  // Voeg specifieke instructies toe voor vervolgbeurten om herhaalde voorstelling te voorkomen
  const roleBehaviorInstructions = isSubsequentTurn 
    ? `\n\nBelangrijke gedragsregels voor deze beurt:\n- Je hebt je al voorgesteld in de eerste beurt - herhaal je voorstelling niet\n- Focus op inhoudelijke reacties en kritische vragen\n- Bouw voort op eerdere punten in plaats van nieuwe introducties\n- Stel de "waarom" vraag om aannames te challengen\n- Blijf constructief maar wees niet bang voor gezonde kritiek`
    : '';

  return `${languageInstructions.systemPrompt}

Je bent een ${role.name} (${role.description}) die deelneemt aan een strategische discussie.

Discussie onderwerp: ${session.topic.title}
Beschrijving: ${session.topic.description}

Discussie doel: ${session.goal.name}
Doel beschrijving: ${session.goal.description}

${contextSection}

Jouw rol en verantwoordelijkheden:
- ${role.description}
- Breng expertise vanuit jouw functie naar voren
- Stel kritische vragen waar relevant (gebruik vaker de "waarom" vraag)
- Geef concrete suggesties en aanbevelingen
- Houd rekening met de perspectieven van andere rollen
- Wees constructief maar niet bang voor gezonde kritiek

${previousMessagesSection}${roleBehaviorInstructions}

Geef een reactie van 100-200 woorden die:
- Specifiek is voor jouw rol als ${role.name}
- Bijdraagt aan het discussiedoel: ${session.goal.name}
- Professioneel en constructief is maar ook kritisch waar nodig
- Concrete inzichten of suggesties bevat
- Voortbouwt op eerdere discussiepunten in plaats van nieuwe introducties

${languageInstructions.responseInstructions}`;
}

/**
 * Create topic generation prompt
 */
function createTopicGenerationPrompt(content: string, language: string): string {
  const languageInstructions = getLanguageInstructions(language);
  
  return `${languageInstructions.systemPrompt}

Analyseer de volgende content en genereer precies 10 discussieonderwerpen die DIRECT gebaseerd zijn op de inhoud van het transcript. Focus op concrete onderwerpen die daadwerkelijk in de content worden besproken.

Elk onderwerp moet:
- Direct verwijzen naar specifieke punten, ideeën of discussies uit het transcript
- Geschikt zijn voor discussie tussen verschillende organisatierollen (CEO, CTO, CFO, CMO, COO)
- Concreet genoeg zijn voor een gestructureerde discussie met actionable inzichten
- Relevant zijn voor de daadwerkelijke content en niet voor algemene strategische vragen

Content om te analyseren:
${content}

Genereer de onderwerpen in het volgende JSON-formaat:
[
  {
    "id": "unique-id-1",
    "title": "Korte, pakkende titel",
    "description": "Uitgebreide beschrijving van het onderwerp en waarom het relevant is voor discussie"
  },
  {
    "id": "unique-id-2",
    "title": "Korte, pakkende titel",
    "description": "Uitgebreide beschrijving van het onderwerp en waarom het relevant is voor discussie"
  }
]

Zorg ervoor dat de output alleen geldige JSON is, zonder extra tekst.`;
}

/**
 * Create report generation prompt
 */
function createReportGenerationPrompt(session: AIDiscussionSession, language: string): string {
  const languageInstructions = getLanguageInstructions(language);
  const allMessages = getAllPreviousMessages(session);
  
  return `${languageInstructions.systemPrompt}

Analyseer de volgende AI discussie en genereer een uitgebreid rapport.

Discussie details:
- Onderwerp: ${session.topic.title}
- Beschrijving: ${session.topic.description}
- Doel: ${session.goal.name} - ${session.goal.description}
- Deelnemers: ${session.roles.map(r => r.name).join(', ')}
- Aantal beurten: ${session.turns.length}

Volledige discussie:
${formatDiscussionForReport(session)}

Genereer een rapport in het volgende JSON-formaat:
{
  "summary": "Korte samenvatting van de discussie (2-3 zinnen)",
  "keyPoints": [
    "Belangrijk punt 1",
    "Belangrijk punt 2",
    "Belangrijk punt 3"
  ],
  "recommendations": [
    "Aanbeveling 1",
    "Aanbeveling 2", 
    "Aanbeveling 3"
  ]
}

Zorg ervoor dat de output alleen geldige JSON is, zonder extra tekst.`;
}

/**
 * Helper functions
 */
function getAllPreviousMessages(session: AIDiscussionSession): AIDiscussionMessage[] {
  return session.turns.flatMap(turn => turn.messages);
}

function formatPreviousMessages(messages: AIDiscussionMessage[], roles: AIDiscussionRole[]): string {
  return messages.map(msg => {
    const role = roles.find(r => r.id === msg.role);
    return `${role?.name || msg.role}: ${msg.content}`;
  }).join('\n\n');
}

function formatDiscussionForReport(session: AIDiscussionSession): string {
  return session.turns.map(turn => {
    const turnMessages = turn.messages.map(msg => {
      const role = session.roles.find(r => r.id === msg.role);
      return `${role?.name || msg.role}: ${msg.content}`;
    }).join('\n\n');
    
    return `Beurt ${turn.turnNumber}:\n${turnMessages}`;
  }).join('\n\n---\n\n');
}

function shouldEndDiscussion(session: AIDiscussionSession): boolean {
  // End after completing all 10 phases
  return session.turns.length >= 10;
}

function getPhaseForTurn(turnNumber: number): DiscussionPhase {
  const phases: DiscussionPhase[] = [
    'introduction',
    'problem_analysis', 
    'root_cause',
    'stakeholder_perspective',
    'solution_generation',
    'critical_evaluation',
    'risk_assessment',
    'implementation_planning',
    'success_metrics',
    'synthesis'
  ];
  
  return phases[turnNumber - 1] || 'synthesis';
}

function getPhaseInstructions(phase: DiscussionPhase, session: AIDiscussionSession): string {
  const { goal, topic } = session;
  
  const instructions: Record<DiscussionPhase, string> = {
    introduction: `Stel jezelf kort voor als je rol en geef je eerste indruk over het onderwerp "${topic.title}". Wat valt je direct op?`,
    
    problem_analysis: `Analyseer het kernprobleem of de kernuitdaging van "${topic.title}". Wat zijn de belangrijkste pijnpunten of kansen?`,
    
    root_cause: `Ga dieper in op de onderliggende oorzaken. Waarom bestaat dit probleem? Wat zijn de fundamentele factoren?`,
    
    stakeholder_perspective: `Bekijk dit vanuit het perspectief van verschillende stakeholders. Hoe beïnvloedt dit hen en wat zijn hun belangen?`,
    
    solution_generation: `Genereer concrete oplossingen of aanpakken. Wat zijn mogelijke manieren om dit aan te pakken?`,
    
    critical_evaluation: `Stel kritische vragen bij de voorgestelde oplossingen. Waarom zou dit wel/niet werken? Wat zijn de valkuilen?`,
    
    risk_assessment: `Identificeer potentiële risico's en uitdagingen. Wat kan er misgaan en hoe kunnen we dat mitigeren?`,
    
    implementation_planning: `Hoe zouden we dit concreet kunnen implementeren? Wat zijn de volgende stappen en wie doet wat?`,
    
    success_metrics: `Hoe meten we succes? Wat zijn concrete KPI's en hoe monitoren we vooruitgang?`,
    
    synthesis: `Vat samen wat de belangrijkste inzichten zijn. Wat zijn de key takeaways en aanbevelingen?`
  };
  
  return instructions[phase];
}

function parseTopicsFromResponse(response: string): AIDiscussionTopic[] {
  try {
    // First try to parse the response directly (it might already be valid JSON)
    try {
      const directParse = JSON.parse(response.trim());
      if (Array.isArray(directParse)) {
        return directParse.map((topic: any, index: number) => ({
          id: topic.id || `topic-${index + 1}`,
          title: topic.title || topic.name || `Discussie onderwerp ${index + 1}`,
          description: topic.description || topic.desc || 'Geen beschrijving beschikbaar'
        }));
      }
    } catch (directError) {
      // Direct parsing failed, try the extraction method
    }
    
    // Clean the response - remove any markdown code blocks and extra text
    let cleanedResponse = response.trim();
    
    // Remove markdown code blocks
    cleanedResponse = cleanedResponse.replace(/```(?:json)?\n?/g, '');
    
    // Try to find JSON array
    const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    
    // Parse with better error handling
    const jsonString = jsonMatch[0];
    
    // Try to parse the extracted JSON directly first
    try {
      const topics = JSON.parse(jsonString);
      if (Array.isArray(topics)) {
        return topics.map((topic: any, index: number) => ({
          id: topic.id || `topic-${index + 1}`,
          title: topic.title || topic.name || `Discussie onderwerp ${index + 1}`,
          description: topic.description || topic.desc || 'Geen beschrijving beschikbaar'
        }));
      }
    } catch (parseError) {
      // If direct parsing fails, try to fix common JSON issues
      let fixedJson = jsonString
        // Fix unquoted property names
        .replace(/([{,}\s])(\w+)(\s*:)/g, '$1"$2"$3')
        // Fix single quotes to double quotes
        .replace(/'/g, '"')
        // Remove trailing commas
        .replace(/,\s*([}\]])/g, '$1');
      
      const topics = JSON.parse(fixedJson);
      
      // Validate and normalize topics
      if (!Array.isArray(topics)) {
        throw new Error('Topics is not an array');
      }
      
      return topics.map((topic: any, index: number) => ({
        id: topic.id || `topic-${index + 1}`,
        title: topic.title || topic.name || `Discussie onderwerp ${index + 1}`,
        description: topic.description || topic.desc || 'Geen beschrijving beschikbaar'
      }));
    }
    
    throw new Error('Failed to parse topics from response');
  } catch (error) {
    console.error('Error parsing topics from response:', error);
    console.log('Original response:', response);
    
    // Fallback topics
    return [
      {
        id: 'fallback-1',
        title: 'Strategische prioriteiten',
        description: 'Discussie over de belangrijkste strategische prioriteiten voor de organisatie'
      },
      {
        id: 'fallback-2',
        title: 'Innovatie en groei',
        description: 'Verkenning van innovatiemogelijkheden en groeistrategieën'
      },
      {
        id: 'fallback-3',
        title: 'Operationele efficiëntie',
        description: 'Analyse van operationele processen en verbetermogelijkheden'
      }
    ];
  }
}

function parseReportFromResponse(response: string, session: AIDiscussionSession): AIDiscussionReport {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }
    
    const reportData = JSON.parse(jsonMatch[0]);
    
    return {
      id: generateReportId(),
      sessionId: session.id,
      summary: reportData.summary || 'Geen samenvatting beschikbaar',
      keyPoints: reportData.keyPoints || [],
      recommendations: reportData.recommendations || [],
      fullTranscript: formatDiscussionForReport(session),
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Error parsing report from response:', error);
    
    // Fallback report
    return {
      id: generateReportId(),
      sessionId: session.id,
      summary: 'Er is een discussie gevoerd over het geselecteerde onderwerp met verschillende organisatierollen.',
      keyPoints: [
        'Verschillende perspectieven zijn besproken',
        'Strategische overwegingen zijn geanalyseerd',
        'Concrete aanbevelingen zijn geformuleerd'
      ],
      recommendations: [
        'Vervolgacties bepalen op basis van de discussie',
        'Stakeholders informeren over de bevindingen',
        'Implementatieplan opstellen'
      ],
      fullTranscript: formatDiscussionForReport(session),
      generatedAt: new Date()
    };
  }
}

function getLanguageInstructions(language: string) {
  switch (language.toLowerCase()) {
    case 'en':
      return {
        systemPrompt: 'You are participating in a strategic AI discussion with multiple organizational roles.',
        responseInstructions: 'Respond in English with a professional and constructive tone.'
      };
    case 'de':
      return {
        systemPrompt: 'Du nimmst an einer strategischen KI-Diskussion mit mehreren Organisationsrollen teil.',
        responseInstructions: 'Antworte auf Deutsch mit einem professionellen und konstruktiven Ton.'
      };
    case 'fr':
      return {
        systemPrompt: 'Vous participez à une discussion stratégique IA avec plusieurs rôles organisationnels.',
        responseInstructions: 'Répondez en français avec un ton professionnel et constructif.'
      };
    default: // Dutch
      return {
        systemPrompt: 'Je neemt deel aan een strategische AI discussie met meerdere organisatierollen.',
        responseInstructions: 'Reageer in het Nederlands met een professionele en constructieve toon.'
      };
  }
}

// ID generation functions with better uniqueness
// Counters to ensure uniqueness even within the same millisecond
let sessionIdCounter = 0;
let turnIdCounter = 0;
let reportIdCounter = 0;
let messageIdCounter = 0;

function generateSessionId(): string {
  sessionIdCounter = (sessionIdCounter + 1) % 10000;
  const timestamp = Date.now();
  const counter = sessionIdCounter.toString().padStart(4, '0');
  const random = Math.random().toString(36).substr(2, 9);
  const performanceNow = typeof performance !== 'undefined' ? performance.now().toString(36) : '';
  return `session-${timestamp}-${counter}-${random}-${performanceNow}`;
}

function generateTurnId(): string {
  // Use crypto.randomUUID if available for guaranteed uniqueness
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `turn-${crypto.randomUUID()}`;
  }
  
  // Fallback with maximum entropy to prevent duplicates
  turnIdCounter = (turnIdCounter + 1) % 100000;
  const timestamp = Date.now();
  const counter = turnIdCounter.toString().padStart(5, '0');
  const random1 = Math.random().toString(36).substr(2, 16);
  const random2 = Math.random().toString(36).substr(2, 16);
  const performanceNow = typeof performance !== 'undefined' ? performance.now().toString(36) : '';
  
  // Add session-specific identifier to prevent cross-session duplicates
  const sessionId = Math.random().toString(36).substr(2, 8);
  
  return `turn-${timestamp}-${counter}-${random1}-${random2}-${performanceNow}-${sessionId}`;
}

function generateMessageId(): string {
  // Use crypto.randomUUID if available for guaranteed uniqueness
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `msg-${crypto.randomUUID()}`;
  }
  
  // Fallback with maximum entropy to prevent duplicates
  messageIdCounter = (messageIdCounter + 1) % 100000;
  const timestamp = Date.now();
  const random1 = Math.random().toString(36).substr(2, 16);
  const random2 = Math.random().toString(36).substr(2, 16);
  const performanceNow = typeof performance !== 'undefined' ? performance.now().toString(36) : '';
  const counter = messageIdCounter.toString().padStart(5, '0');
  
  // Add session-specific identifier to prevent cross-session duplicates
  const sessionId = Math.random().toString(36).substr(2, 8);
  
  // Add turn-specific identifier to prevent cross-turn duplicates
  const turnId = Math.random().toString(36).substr(2, 6);
  
  return `msg-${timestamp}-${counter}-${random1}-${random2}-${performanceNow}-${sessionId}-${turnId}`;
}

function generateReportId(): string {
  reportIdCounter = (reportIdCounter + 1) % 10000;
  const timestamp = Date.now();
  const counter = reportIdCounter.toString().padStart(4, '0');
  const random = Math.random().toString(36).substr(2, 9);
  const performanceNow = typeof performance !== 'undefined' ? performance.now().toString(36) : '';
  return `report-${timestamp}-${counter}-${random}-${performanceNow}`;
}