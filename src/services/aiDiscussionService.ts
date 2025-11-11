import { 
  AIDiscussionTopic, 
  AIDiscussionGoal, 
  AIDiscussionRole, 
  AIDiscussionMessage, 
  AIDiscussionTurn, 
  AIDiscussionSession,
  AIDiscussionReport,
  DiscussionPhase,
  AIDiscussionVote,
  AIDiscussionVotingPrompt,
  AIDiscussionVotingOption,
  AIDiscussionAnalytics,
  RoleActivityMetrics,
  ControversialTopic,
  VotingResults,
  DiscussionStyleOption,
  RoleDiscussionStyles,
  DiscussionStyleConfiguration
} from '../../types';
import { 
  AIProviderManager, 
  AIFunction, 
  SubscriptionTier, 
  ProviderSelectionRequest 
} from '../utils/aiProviderManager';

// Predefined Discussion Style Options
export const DISCUSSION_STYLE_OPTIONS: DiscussionStyleOption[] = [
  // Type 1: Communication Tone & Concise/Elaborate
  {
    id: 'concise_direct',
    nameNL: 'Beknopt & Direct',
    nameEN: 'Concise & Direct',
    descriptionNL: 'Levert antwoorden kortaf en to-the-point, zonder veel omhaal.',
    descriptionEN: 'Delivers answers curtly and to-the-point, without much embellishment.',
    aiInstruction: 'BELANGRIJK: Beperk je reactie tot maximaal 75-100 woorden. Gebruik kernzinnen, opsommingen en directe antwoorden. Vermijd inleidingen, uitweidingen of overbodige details. Wees extreem beknopt en to-the-point.',
    category: 'communication_tone',
    type: 'concise_direct'
  },
  {
    id: 'elaborate_indepth',
    nameNL: 'Uitgebreid & Diepgaand',
    nameEN: 'Elaborate & In-depth',
    descriptionNL: 'Biedt gedetailleerde analyses, context en uitgebreide uitleg.',
    descriptionEN: 'Provides detailed analyses, context, and extensive explanations.',
    aiInstruction: 'Geef uitgebreide achtergrondinformatie, onderbouw argumenten met meerdere punten, en verken gerelateerde aspecten. Gebruik meer verbindingszinnen en voorbeelden.',
    category: 'communication_tone',
    type: 'elaborate_indepth'
  },
  {
    id: 'encouraging_positive',
    nameNL: 'Encouragerend & Positief',
    nameEN: 'Encouraging & Positive',
    descriptionNL: 'Richt zich op de mogelijkheden, sterke punten en het potentieel, met een optimistische en motiverende toon.',
    descriptionEN: 'Focuses on opportunities, strengths, and potential, with an optimistic and motivating tone.',
    aiInstruction: 'Benadruk positieve aspecten, groeikansen en succesfactoren. Formuleer feedback op een opbouwende en inspirerende manier, zelfs bij het benoemen van uitdagingen.',
    category: 'communication_tone',
    type: 'encouraging_positive'
  },
  {
    id: 'critical_challenging',
    nameNL: 'Kritisch & Uitdagend',
    nameEN: 'Critical & Challenging',
    descriptionNL: 'Stelt de status quo ter discussie, zoekt naar zwakke plekken en daagt aannames uit.',
    descriptionEN: 'Questions the status quo, seeks out weaknesses, and challenges assumptions.',
    aiInstruction: 'Identificeer potentiële problemen, risico\'s, inconsistenties of onbewezen aannames. Formuleer deze als vragen of directe kritiek om discussie uit te lokken.',
    category: 'communication_tone',
    type: 'critical_challenging'
  },
  // Type 2: Interaction Pattern & Questioning
  {
    id: 'highly_questioning',
    nameNL: 'Veel Vragen Stellend',
    nameEN: 'Highly Questioning',
    descriptionNL: 'Reageert vaak met open vragen om dieper te graven en meer informatie te verzamelen.',
    descriptionEN: 'Often responds with open-ended questions to dig deeper and gather more information.',
    aiInstruction: 'Eindig elke reactie of paragraaf (waar relevant) met een diepgaande open vraag die de gebruiker aanzet tot verdere reflectie of het geven van meer context.',
    category: 'interaction_pattern',
    type: 'highly_questioning'
  },
  {
    id: 'solution_oriented',
    nameNL: 'Gericht op Oplossingen',
    nameEN: 'Solution-Oriented',
    descriptionNL: 'Focust direct op het aandragen van concrete oplossingen en actieplannen voor besproken problemen.',
    descriptionEN: 'Focuses directly on proposing concrete solutions and action plans for discussed problems.',
    aiInstruction: 'Bij het identificeren van een probleem of uitdaging, volg dit direct op met één of meer concrete suggesties voor een oplossing of een volgende stap.',
    category: 'interaction_pattern',
    type: 'solution_oriented'
  },
  {
    id: 'collaborative',
    nameNL: 'Samenwerkend',
    nameEN: 'Collaborative',
    descriptionNL: 'Zoekt naar consensus, bouwt voort op bestaande ideeën en faciliteert gezamenlijke conclusies.',
    descriptionEN: 'Seeks consensus, builds upon existing ideas, and facilitates joint conclusions.',
    aiInstruction: 'Gebruik taal die samenwerking uitstraalt ("Laten we kijken naar...", "Samen kunnen we...", "Hoe kunnen we dit verbinden met..."). Vat input van de gebruiker samen en stel voor hoe hierop verder gebouwd kan worden.',
    category: 'interaction_pattern',
    type: 'collaborative'
  },
  {
    id: 'drawing_comparisons',
    nameNL: 'Vergelijkingen Makend',
    nameEN: 'Drawing Comparisons',
    descriptionNL: 'Trekt parallellen met andere situaties, best practices of industriestandaarden.',
    descriptionEN: 'Draws parallels with other situations, best practices, or industry standards.',
    aiInstruction: 'Relateer besproken onderwerpen aan vergelijkbare situaties, frameworks of externe voorbeelden (indien bekend uit de trainingsdata of impliciet afleidbaar uit de transcriptie).',
    category: 'interaction_pattern',
    type: 'drawing_comparisons'
  },
  // Type 4: Diepgang & Focus
  {
    id: 'action_oriented',
    nameNL: 'Gedragsgericht / Action-Oriented',
    nameEN: 'Action-Oriented',
    descriptionNL: 'Stuurt de discussie consistent naar concrete stappen, verantwoordelijkheden en de volgende logische acties.',
    descriptionEN: 'Consistently steers the discussion towards concrete steps, responsibilities, and the next logical actions.',
    aiInstruction: 'Elke bijdrage of elk antwoord moet, waar relevant, uitmonden in een of meer suggesties voor een concrete actie, een taakverdeling, of een benoeming van de volgende te ondernemen stap.',
    category: 'depth_focus',
    type: 'action_oriented'
  },
  {
    id: 'big_picture_thinker',
    nameNL: 'Big Picture Denker',
    nameEN: 'Big Picture Thinker',
    descriptionNL: 'Plaatst details in een bredere context, verbindt onderwerpen met hogere doelen en overkoepelende strategieën.',
    descriptionEN: 'Places details in a broader context, connects topics to higher goals and overarching strategies.',
    aiInstruction: 'Vermijd te veel focus op micro-details. Koppel besproken punten altijd terug aan de grotere strategische doelen, missie, visie of de algemene bedrijfscontext zoals besproken in de transcriptie. Benadruk de impact op lange termijn.',
    category: 'depth_focus',
    type: 'big_picture_thinker'
  },
  {
    id: 'narrative_example_rich',
    nameNL: 'Verhalend & Voorbeeld-Rijk',
    nameEN: 'Narrative & Example-Rich',
    descriptionNL: 'Legt concepten uit en onderbouwt argumenten met relevante (hypothetische) scenario\'s of voorbeelden, voor meer levendigheid en begrip.',
    descriptionEN: 'Explains concepts and supports arguments with relevant (hypothetical) scenarios or examples, for greater vividness and understanding.',
    aiInstruction: 'Waar complexiteit of abstractie optreedt, genereer een kort, verhelderend voorbeeld of een hypothetisch scenario gebaseerd op de context van de transcriptie. Gebruik een meer verhalende toon om punten te illustreren en de betrokkenheid te vergroten.',
    category: 'depth_focus',
    type: 'narrative_example_rich'
  }
];

// Default discussion styles per role category
export const DEFAULT_ROLE_STYLES: { [roleCategory: string]: string[] } = {
  'leiding_strategie': ['elaborate_indepth', 'solution_oriented', 'big_picture_thinker'], // CEO, COO - strategic and solution-focused with big picture thinking
  'product_markt': ['encouraging_positive', 'collaborative', 'action_oriented'], // CMO, Product Manager - positive and collaborative with action focus
  'technologie': ['critical_challenging', 'highly_questioning', 'narrative_example_rich'], // CTO, Tech Lead - critical and questioning with examples
  'operaties': ['concise_direct', 'solution_oriented', 'action_oriented'], // Operations - direct and solution-focused with action orientation
  'marketing': ['encouraging_positive', 'drawing_comparisons', 'narrative_example_rich'], // Marketing - positive with comparisons and examples
  'externe_stakeholders': ['collaborative', 'drawing_comparisons', 'big_picture_thinker'] // External stakeholders - collaborative with comparisons and big picture view
};

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
  userTier: SubscriptionTier = SubscriptionTier.GOLD,
  discussionStyles?: DiscussionStyleConfiguration
): Promise<AIDiscussionSession> {
  if (roles.length < 2 || roles.length > 4) {
    throw new Error('Between 2 and 4 roles are required for discussion');
  }

  const session: AIDiscussionSession = {
    id: generateSessionId(),
    topic,
    goal,
    roles,
    turns: [],
    status: 'active',
    createdAt: new Date(),
    language,
    discussionStyles,
    userInterventionCount: 0,
    actualTurnNumber: 0
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
  if (session.status !== 'active' && session.status !== 'awaiting_user_input') {
    throw new Error('Discussion session is not active');
  }

  // Use actualTurnNumber for checking discussion limits (max 10 actual turns)
  const currentActualTurnNumber = session.actualTurnNumber || 0;
  if (currentActualTurnNumber >= 10) {
    session.status = 'completed';
    throw new Error('Maximum number of turns reached');
  }

  // Increment actual turn number for real discussion turns
  const nextActualTurnNumber = currentActualTurnNumber + 1;
  session.actualTurnNumber = nextActualTurnNumber;

  const nextTurnNumber = session.turns.length + 1;
  const nextTurn = await generateNextTurn(session, nextActualTurnNumber, userId, userTier);
  session.turns.push(nextTurn);

  // Check if discussion should end based on actual turns
  if (nextActualTurnNumber >= 10 || shouldEndDiscussion(session)) {
    session.status = 'completed';
  }

  return nextTurn;
}

/**
 * Handle user intervention and generate role responses
 */
export async function handleUserIntervention(
  session: AIDiscussionSession,
  userMessage: AIDiscussionMessage,
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.GOLD
): Promise<AIDiscussionTurn> {
  if (session.status !== 'awaiting_user_input') {
    throw new Error('Session is not awaiting user input');
  }

  // Check if user has reached maximum interventions
  const currentInterventionCount = session.userInterventionCount || 0;
  if (currentInterventionCount >= 5) {
    throw new Error('Maximum aantal gebruikersinterventies (5) bereikt voor deze discussie');
  }

  // Create a new turn for the user intervention and role responses
  const turnId = generateTurnId();
  const turnNumber = session.turns.length + 1;
  
  // Increment user intervention count
  session.userInterventionCount = currentInterventionCount + 1;
  
  // Determine which roles should respond
  const targetRoles = userMessage.targetRoles && userMessage.targetRoles.length > 0 
    ? session.roles.filter(role => userMessage.targetRoles!.includes(role.id))
    : session.roles; // All roles if no specific targets

  // Generate responses from targeted roles
  const roleResponses: AIDiscussionMessage[] = [];
  
  for (const role of targetRoles) {
    try {
      const response = await generateRoleResponseToUser(
        role, 
        session, 
        userMessage, 
        userId, 
        userTier
      );
      roleResponses.push(response);
    } catch (error) {
      console.error(`Error generating response for role ${role.id}:`, error);
      // Continue with other roles even if one fails
    }
  }

  // Create the turn with user message and role responses
  const newTurn: AIDiscussionTurn = {
    id: turnId,
    turnNumber,
    phase: getPhaseForTurn(turnNumber),
    messages: [userMessage, ...roleResponses],
    timestamp: new Date()
  };

  // Add turn to session
  session.turns.push(newTurn);
  
  // DO NOT update actual turn number for user interventions
  // User interventions should not affect the discussion progress
  
  // Reset user intervention state
  session.awaitingUserIntervention = false;
  session.status = 'active';

  return newTurn;
}

/**
 * Generate a role's response to a user intervention
 */
async function generateRoleResponseToUser(
  role: AIDiscussionRole,
  session: AIDiscussionSession,
  userMessage: AIDiscussionMessage,
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.GOLD
): Promise<AIDiscussionMessage> {
  const allPreviousMessages = getAllPreviousMessages(session);
  
  // Create a prompt specifically for responding to user intervention
  const prompt = createUserInterventionResponsePrompt(
    role,
    session,
    userMessage,
    allPreviousMessages
  );

  const providerRequest: ProviderSelectionRequest = {
    userId,
    userTier,
    functionType: AIFunction.EXPERT_CHAT,
    userPreference: undefined
  };

  const response = await AIProviderManager.generateContentWithProviderSelection(
    providerRequest,
    prompt,
    false
  );

  return {
    id: generateMessageId(),
    role: role.id,
    content: response.content.trim(),
    timestamp: new Date(),
    isUserIntervention: false
  };
}

/**
 * Create prompt for role to respond to user intervention
 */
function createUserInterventionResponsePrompt(
  role: AIDiscussionRole,
  session: AIDiscussionSession,
  userMessage: AIDiscussionMessage,
  previousMessages: AIDiscussionMessage[]
): string {
  const languageInstructions = getLanguageInstructions(session.language || 'nl');
  const styleInstructions = generateDiscussionStyleInstructions(role, session);
  const formattedPreviousMessages = formatPreviousMessages(previousMessages, session.roles);
  
  const userName = userMessage.userName || 'Gebruiker';
  
  // Check if concise style is selected and adjust word limit accordingly
  const roleStyles = session.discussionStyles?.roleStyles?.[role.id];
  const styleIdsArray = roleStyles?.selectedStyles || [];
  const isConciseStyle = styleIdsArray.includes('concise_direct');
  const wordLimit = isConciseStyle ? '50-75 woorden' : '100-200 woorden';

  return `${languageInstructions}

JE BENT: ${role.name} - ${role.description}
JE FOCUS: ${role.focusArea}

DISCUSSIE CONTEXT:
Onderwerp: ${session.topic.title}
Doel: ${session.goal.description}
${session.topic.description ? `Beschrijving: ${session.topic.description}` : ''}

VORIGE BERICHTEN IN DE DISCUSSIE:
${formattedPreviousMessages}

🔥 BELANGRIJKE GEBRUIKERSINTERVENTIE 🔥
${userName} heeft zojuist een directe vraag/opmerking gesteld:
"${userMessage.content}"

${userMessage.targetRoles && userMessage.targetRoles.includes(role.id) 
  ? `⚠️ DEZE VRAAG IS SPECIFIEK AAN JOU GERICHT - JE MOET ANTWOORDEN!`
  : `⚠️ DEZE VRAAG IS GERICHT AAN ALLE DEELNEMERS - JE MOET ANTWOORDEN!`
}

🚨 TOPIC RELEVANTIE CONTROLE 🚨
BELANGRIJK: Controleer EERST of de vraag relevant is voor:
1. Het hoofdonderwerp van de discussie: "${session.topic.title}"
2. Jouw expertise gebied: "${role.focusArea}"
3. De doelstelling van deze discussie: "${session.goal.description}"

ALS DE VRAAG NIET RELEVANT IS:
- Merk op dat deze vraag buiten het huidige discussieonderwerp valt
- Leg kort uit waarom de vraag niet relevant is
- Verwijs terug naar het hoofdonderwerp
- Stel een gerelateerde vraag die WEL relevant is

ALS DE VRAAG WEL RELEVANT IS:
1. Begin je antwoord door de vraag kort te herhalen (bijv. "Je vraagt naar..." of "Betreffende je vraag over...")
2. Geef een DIRECT antwoord op de gestelde vraag vanuit jouw expertise
3. Als de vraag niet binnen jouw expertise valt, zeg dit expliciet en verwijs naar welke rol beter kan antwoorden
4. Verbind je antwoord met de lopende discussie waar relevant
5. Blijf in karakter en gebruik jouw unieke perspectief

STIJL INSTRUCTIES:
${styleInstructions}

${isConciseStyle ? `
🚨 EXTRA BEKNOPTHEID VEREIST 🚨
Je hebt de "Beknopt & Direct" stijl geselecteerd. Houd je STRIKT aan maximaal ${wordLimit}. Gebruik kernzinnen, opsommingen en directe antwoorden. Geen inleidingen of uitweidingen!` : ''}

BELANGRIJK: Dit is een directe gebruikersinterventie die een duidelijk antwoord vereist. Geef een concrete, relevante reactie (${wordLimit}) die de gebruiker helpt, maar alleen als de vraag relevant is voor het discussieonderwerp.`;
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
 * Generate next discussion turn with improved follow-up logic
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
  
  // Determine discussion dynamics for this turn
  const discussionDynamics = analyzePreviousDiscussion(session, turnNumber);
  
  // Check if we should create a voting prompt
  const shouldVote = shouldCreateVotingPrompt(session, turnNumber);
  let votingPrompt: AIDiscussionVotingPrompt | undefined;
  
  if (shouldVote && discussionDynamics.controversialTopics.length > 0) {
    const votingQuestions = generateVotingQuestions(discussionDynamics.controversialTopics);
    if (votingQuestions.length > 0) {
      const firstQuestion = votingQuestions[0];
      votingPrompt = createVotingPrompt(firstQuestion.question, firstQuestion.options);
    }
  }

  // Generate responses from each role based on the current phase and discussion dynamics
  for (const role of session.roles) {
    const roleSpecificContext = generateRoleSpecificContext(role, session, previousMessages, discussionDynamics);
    const prompt = createRolePrompt(role, session, previousMessages, false, phaseInstructions, roleSpecificContext);
    
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

      const message: AIDiscussionMessage = {
        id: generateMessageId(),
        role: role.id,
        content: response.content,
        timestamp: new Date()
      };

      // Add voting prompt to the first message if we created one
      if (votingPrompt && messages.length === 0) {
        message.votingPrompt = votingPrompt;
        
        // Generate votes from all roles for this prompt
        try {
          const votes = await generateRoleVotes(votingPrompt, session.roles, session, userId, userTier);
          message.votes = votes;
          
          // Update vote counts on the prompt options
          votes.forEach(vote => {
            const option = votingPrompt!.options.find(opt => opt.id === vote.voteType);
            if (option) {
              option.votes++;
            }
          });
        } catch (error) {
          console.error('Error generating votes:', error);
        }
      }

      messages.push(message);
    } catch (error) {
      console.error(`Error generating message for role ${role.id}:`, error);
      // Add fallback message
      messages.push({
        id: generateMessageId(),
        role: role.id,
        content: `[Technische fout - bericht kon niet worden gegenereerd voor ${role.name}]`,
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
  phaseInstructions?: string,
  roleSpecificContext?: any
): string {
  const languageInstructions = getLanguageInstructions(session.language);
  
  // Bepaal of dit een vervolgbeurt is (beurt 2 of hoger)
  const isSubsequentTurn = !isFirstTurn && previousMessages.length > 0;
  
  // Build context-aware instructions based on discussion dynamics
  let contextualInstructions = '';
  if (roleSpecificContext) {
    if (roleSpecificContext.messagesToRespondTo.length > 0) {
      contextualInstructions += `\n\nSpecifieke punten om op te reageren:\n`;
      roleSpecificContext.messagesToRespondTo.forEach((msg: any) => {
        contextualInstructions += `- ${msg.sender}: "${msg.content}"\n`;
      });
    }
    
    if (roleSpecificContext.relevantControversies.length > 0) {
      contextualInstructions += `\n\nControversiële punten relevant voor jouw expertise:\n`;
      roleSpecificContext.relevantControversies.forEach((controversy: any) => {
        contextualInstructions += `- ${controversy.topic}: ${controversy.disagreement}\n`;
      });
    }
    
    if (roleSpecificContext.isUnderActive) {
      contextualInstructions += `\n\nJe bent tot nu toe minder actief geweest - dit is je kans om je expertise te laten zien!\n`;
    }
    
    if (roleSpecificContext.shouldChallenge) {
      contextualInstructions += `\n\nDe discussie heeft meer uitdaging nodig - stel kritische vragen en challenge aannames!\n`;
    }
    
    if (roleSpecificContext.roleExpertiseNeeded) {
      contextualInstructions += `\n\nEr zijn onbeantwoorde vragen die jouw expertise vereisen - geef concrete antwoorden!\n`;
    }
    
    if (roleSpecificContext.recentOppositions.length > 0) {
      contextualInstructions += `\n\nRecente standpunten die mogelijk conflicteren met jouw visie:\n`;
      roleSpecificContext.recentOppositions.forEach((opposition: any) => {
        contextualInstructions += `- ${opposition.sender}: "${opposition.content}"\n`;
      });
    }
  }
  
  const contextSection = isFirstTurn
    ? `Je neemt deel aan een gestructureerde discussie over: "${session.topic.title}"
Discussiedoel: ${session.goal.description}

Jouw rol: ${role.name} - ${role.description}
Focusgebied: ${role.focusArea}

Introductie: Geef je eerste indruk over het onderwerp vanuit jouw expertise en rol.`
    : `Je neemt deel aan een voortdurende discussie over: "${session.topic.title}"
Discussiedoel: ${session.goal.description}

Jouw rol: ${role.name} - ${role.description}
Focusgebied: ${role.focusArea}

Fase instructies: ${phaseInstructions || 'Geef een substantiële bijdrage die voortbouwt op de vorige discussie.'}

Vorige discussie: ${formatPreviousMessages(previousMessages, session.roles)}

${contextualInstructions}

Geef een substantiële bijdrage die aansluit bij de huidige fase en reageert op specifieke punten van anderen.`;

  const previousMessagesSection = previousMessages.length > 0 
    ? `\n\nVorige berichten in de discussie:\n${formatPreviousMessages(previousMessages, session.roles)}`
    : '';

  // Enhanced behavioral instructions based on context
  const roleBehaviorInstructions = isSubsequentTurn 
    ? `\n\nBelangrijke gedragsregels voor deze beurt:
- GEEN voorstelling meer - je bent al bekend
- REAGEER inhoudelijk op wat anderen hebben voorgesteld
- GEEF concrete antwoorden en oplossingen vanuit jouw expertise
- NEEM positie in discussiepunten - ben niet neutraal
- DEEL je visie en laat anderen daarop reageren
${roleSpecificContext?.messagesToRespondTo.length > 0 ? '- REAGEER specifiek op de hierboven genoemde punten' : ''}
${roleSpecificContext?.shouldChallenge ? '- CHALLENGE aannames en stel kritische vragen' : ''}
${roleSpecificContext?.relevantControversies.length > 0 ? '- NEEM POSITIE in de controversiële punten die relevant zijn voor jouw expertise' : ''}`
    : '';

  // Generate discussion style instructions if available
  const discussionStyleInstructions = generateDiscussionStyleInstructions(role, session);

  // Enthousiasme instructies op basis van enthousiasme-level (1-5)
  const enthusiasmData = role.enthusiasmLevel ? getEnthusiasmInstructions(role.enthusiasmLevel) : null;
  const enthusiasmInstructions = enthusiasmData ? 
    `\nENTHOUSIASME NIVEAU (${role.enthusiasmLevel}/5): ${enthusiasmData.instructions}` : '';

  return `${languageInstructions.systemPrompt}

Je bent een ${role.name} (${role.description}) die deelneemt aan een strategische discussie.

Discussie onderwerp: ${session.topic.title}
Beschrijving: ${session.topic.description}

Discussie doel: ${session.goal.name}
Doel beschrijving: ${session.goal.description}

${contextSection}

Jouw rol en verantwoordelijkheden:
- ${role.description}
- DEEL JE MENING en expertise vanuit jouw functie - dit is geen interview maar een discussie
- Geef ANTWOORDEN en concrete standpunten, niet alleen vragen
- Reageer INHOUDELIJK op wat anderen hebben gezegd - bevestig, weerleg, of bouw erop voort
- Stel alleen vragen als ze leiden tot dieperere inzichten, niet als hoofdfocus
- Neem POSITIE in discussies en verdedig je standpunt met argumenten
- Wees direct en eerlijk - dit is een strategische discussie tussen experts

${enthusiasmInstructions}

${discussionStyleInstructions}

${previousMessagesSection}${roleBehaviorInstructions}

Geef een reactie van 150-300 woorden die:
- REAGEERT inhoudelijk op specifieke punten van andere deelnemers (bevestig, weerleg, of bouw erop voort)
- GEEFT concrete antwoorden en oplossingen, niet alleen vragen
- NEEMT een duidelijke positie in en onderbouwt deze met argumenten
- Bouwt voort op eerdere discussiepunten met jouw expertise
- Deelt jouw visie en laat anderen daarop reageren
- Eindigt eventueel met één gerichte vraag om de discussie te verdiepen (optioneel)
${roleSpecificContext?.messagesToRespondTo.length > 0 ? '- Reageert specifiek op de genoemde berichten van andere deelnemers' : ''}
${roleSpecificContext?.relevantControversies.length > 0 ? '- Neemt een duidelijke positie in bij controversiële punten' : ''}

${languageInstructions.responseInstructions}`;
}

/**
 * Generate discussion style instructions for a role
 */
function generateDiscussionStyleInstructions(role: AIDiscussionRole, session: AIDiscussionSession): string {
  if (!session.discussionStyles?.roleStyles?.[role.id]) {
    return '';
  }

  const roleStyles = session.discussionStyles.roleStyles[role.id];
  
  // Get the selectedStyles array from the RoleDiscussionStyles object
  const styleIdsArray = roleStyles.selectedStyles || [];
  
  if (styleIdsArray.length === 0) {
    return '';
  }

  const styleInstructions = styleIdsArray
    .map(styleId => {
      const style = DISCUSSION_STYLE_OPTIONS.find(option => option.id === styleId);
      return style ? style.aiInstruction : null;
    })
    .filter(instruction => instruction !== null);

  if (styleInstructions.length === 0) {
    return '';
  }

  return `
Discussiestijl instructies voor jouw rol:
${styleInstructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')}

Pas deze stijlen toe in je communicatie terwijl je je rol vervult.`;
}

/**
 * Create topic generation prompt
 */
function createTopicGenerationPrompt(content: string, language: string): string {
  const languageInstructions = getLanguageInstructions(language);
  
  // Taal-specifieke prompts voor topic generatie
  const topicPrompts: Record<string, string> = {
    en: `${languageInstructions.systemPrompt}

Analyze the following content and generate exactly 10 discussion topics that are DIRECTLY based on the transcript content. Focus on concrete topics that are actually discussed in the content.

Each topic must:
- Directly reference specific points, ideas, or discussions from the transcript
- Be suitable for discussion between different organizational roles (CEO, CTO, CFO, CMO, COO)
- Be concrete enough for a structured discussion with actionable insights
- Be relevant to the actual content and not general strategic questions

Content to analyze:
${content}

Generate the topics in the following JSON format:
[
  {
    "id": "unique-id-1",
    "title": "Short, catchy title",
    "description": "Detailed description of the topic and why it's relevant for discussion"
  },
  {
    "id": "unique-id-2",
    "title": "Short, catchy title",
    "description": "Detailed description of the topic and why it's relevant for discussion"
  }
]

Ensure the output contains only valid JSON, without any additional text.`,

    nl: `${languageInstructions.systemPrompt}

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

Zorg ervoor dat de output alleen geldige JSON is, zonder extra tekst.`,

    de: `${languageInstructions.systemPrompt}

Analysiere den folgenden Inhalt und generiere genau 10 Diskussionsthemen, die DIREKT auf dem Transkriptinhalt basieren. Konzentriere dich auf konkrete Themen, die tatsächlich im Inhalt besprochen werden.

Jedes Thema muss:
- Direkt auf spezifische Punkte, Ideen oder Diskussionen aus dem Transkript verweisen
- Für Diskussionen zwischen verschiedenen Organisationsrollen geeignet sein (CEO, CTO, CFO, CMO, COO)
- Konkret genug für eine strukturierte Diskussion mit umsetzbaren Erkenntnissen sein
- Relevant für den tatsächlichen Inhalt und nicht für allgemeine strategische Fragen sein

Zu analysierender Inhalt:
${content}

Generiere die Themen im folgenden JSON-Format:
[
  {
    "id": "unique-id-1",
    "title": "Kurzer, einprägsamer Titel",
    "description": "Detaillierte Beschreibung des Themas und warum es für die Diskussion relevant ist"
  },
  {
    "id": "unique-id-2",
    "title": "Kurzer, einprägsamer Titel",
    "description": "Detaillierte Beschreibung des Themas und warum es für die Diskussion relevant ist"
  }
]

Stelle sicher, dass die Ausgabe nur gültiges JSON enthält, ohne zusätzlichen Text.`,

    fr: `${languageInstructions.systemPrompt}

Analysez le contenu suivant et générez exactement 10 sujets de discussion qui sont DIRECTEMENT basés sur le contenu de la transcription. Concentrez-vous sur des sujets concrets qui sont réellement discutés dans le contenu.

Chaque sujet doit :
- Faire directement référence à des points, idées ou discussions spécifiques de la transcription
- Être adapté à une discussion entre différents rôles organisationnels (CEO, CTO, CFO, CMO, COO)
- Être assez concret pour une discussion structurée avec des insights actionnables
- Être pertinent pour le contenu réel et non pour des questions stratégiques générales

Contenu à analyser :
${content}

Générez les sujets au format JSON suivant :
[
  {
    "id": "unique-id-1",
    "title": "Titre court et accrocheur",
    "description": "Description détaillée du sujet et pourquoi il est pertinent pour la discussion"
  },
  {
    "id": "unique-id-2",
    "title": "Titre court et accrocheur",
    "description": "Description détaillée du sujet et pourquoi il est pertinent pour la discussion"
  }
]

Assurez-vous que la sortie contient uniquement du JSON valide, sans texte supplémentaire.`,

    es: `${languageInstructions.systemPrompt}

Analiza el siguiente contenido y genera exactamente 10 temas de discusión que estén DIRECTAMENTE basados en el contenido de la transcripción. Enfócate en temas concretos que realmente se discutan en el contenido.

Cada tema debe:
- Hacer referencia directa a puntos, ideas o discusiones específicas de la transcripción
- Ser adecuado para discusión entre diferentes roles organizacionales (CEO, CTO, CFO, CMO, COO)
- Ser lo suficientemente concreto para una discusión estructurada con insights accionables
- Ser relevante para el contenido real y no para preguntas estratégicas generales

Contenido a analizar:
${content}

Genera los temas en el siguiente formato JSON:
[
  {
    "id": "unique-id-1",
    "title": "Título corto y llamativo",
    "description": "Descripción detallada del tema y por qué es relevante para la discusión"
  },
  {
    "id": "unique-id-2",
    "title": "Título corto y llamativo",
    "description": "Descripción detallada del tema y por qué es relevante para la discusión"
  }
]

Asegúrate de que la salida contenga solo JSON válido, sin texto adicional.`,

    pt: `${languageInstructions.systemPrompt}

Analise o seguinte conteúdo e gere exatamente 10 tópicos de discussão que estejam DIRETAMENTE baseados no conteúdo da transcrição. Concentre-se em tópicos concretos que são realmente discutidos no conteúdo.

Cada tópico deve:
- Fazer referência direta a pontos, ideias ou discussões específicas da transcrição
- Ser adequado para discussão entre diferentes funções organizacionais (CEO, CTO, CFO, CMO, COO)
- Ser concreto o suficiente para uma discussão estruturada com insights acionáveis
- Ser relevante para o conteúdo real e não para questões estratégicas gerais

Conteúdo a analisar:
${content}

Gere os tópicos no seguinte formato JSON:
[
  {
    "id": "unique-id-1",
    "title": "Título curto e cativante",
    "description": "Descrição detalhada do tópico e por que é relevante para a discussão"
  },
  {
    "id": "unique-id-2",
    "title": "Título curto e cativante",
    "description": "Descrição detalhada do tópico e por que é relevante para a discussão"
  }
]

Certifique-se de que a saída contenha apenas JSON válido, sem texto adicional.`
  };
  
  return topicPrompts[language.toLowerCase()] || topicPrompts.nl;
}

/**
 * Create report generation prompt
 */
function createReportGenerationPrompt(session: AIDiscussionSession, language: string): string {
  const languageInstructions = getLanguageInstructions(language);
  const allMessages = getAllPreviousMessages(session);
  
  // Taal-specifieke prompts
  const prompts: Record<string, {analyze: string; details: string; format: any}> = {
    en: {
      analyze: "Analyze the following AI discussion and generate a comprehensive report.",
      details: "Discussion details:",
      format: {
        summary: "Brief summary of the discussion (2-3 sentences)",
        keyPoints: ["Key point 1", "Key point 2", "Key point 3"],
        recommendations: ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
      }
    },
    nl: {
      analyze: "Analyseer de volgende AI discussie en genereer een uitgebreid rapport.",
      details: "Discussie details:",
      format: {
        summary: "Korte samenvatting van de discussie (2-3 zinnen)",
        keyPoints: ["Belangrijk punt 1", "Belangrijk punt 2", "Belangrijk punt 3"],
        recommendations: ["Aanbeveling 1", "Aanbeveling 2", "Aanbeveling 3"]
      }
    },
    de: {
      analyze: "Analysiere die folgende KI-Diskussion und erstelle einen umfassenden Bericht.",
      details: "Diskussionsdetails:",
      format: {
        summary: "Kurze Zusammenfassung der Diskussion (2-3 Sätze)",
        keyPoints: ["Wichtiger Punkt 1", "Wichtiger Punkt 2", "Wichtiger Punkt 3"],
        recommendations: ["Empfehlung 1", "Empfehlung 2", "Empfehlung 3"]
      }
    },
    fr: {
      analyze: "Analysez la discussion IA suivante et générez un rapport complet.",
      details: "Détails de la discussion:",
      format: {
        summary: "Résumé court de la discussion (2-3 phrases)",
        keyPoints: ["Point clé 1", "Point clé 2", "Point clé 3"],
        recommendations: ["Recommandation 1", "Recommandation 2", "Recommandation 3"]
      }
    },
    es: {
      analyze: "Analiza la siguiente discusión de IA y genera un informe completo.",
      details: "Detalles de la discusión:",
      format: {
        summary: "Resumen breve de la discusión (2-3 frases)",
        keyPoints: ["Punto clave 1", "Punto clave 2", "Punto clave 3"],
        recommendations: ["Recomendación 1", "Recomendación 2", "Recomendación 3"]
      }
    },
    pt: {
      analyze: "Analise a seguinte discussão de IA e gere um relatório abrangente.",
      details: "Detalhes da discussão:",
      format: {
        summary: "Resumo breve da discussão (2-3 frases)",
        keyPoints: ["Ponto chave 1", "Ponto chave 2", "Ponto chave 3"],
        recommendations: ["Recomendação 1", "Recomendação 2", "Recomendação 3"]
      }
    }
  };
  
  const promptConfig = prompts[language.toLowerCase()] || prompts.nl;
  
  return `${languageInstructions.systemPrompt}

${promptConfig.analyze}

${promptConfig.details}
- ${language === 'en' ? 'Topic' : 'Onderwerp'}: ${session.topic.title}
- ${language === 'en' ? 'Description' : 'Beschrijving'}: ${session.topic.description}
- ${language === 'en' ? 'Goal' : 'Doel'}: ${session.goal.name} - ${session.goal.description}
- ${language === 'en' ? 'Participants' : 'Deelnemers'}: ${session.roles.map(r => r.name).join(', ')}
- ${language === 'en' ? 'Number of turns' : 'Aantal beurten'}: ${session.turns.length}

${language === 'en' ? 'Complete discussion:' : 'Volledige discussie:'}
${formatDiscussionForReport(session)}

${language === 'en' ? 'Generate a report in the following JSON format:' : 'Genereer een rapport in het volgende JSON-formaat:'}
{
  "summary": "${promptConfig.format.summary}",
  "keyPoints": [
    "${promptConfig.format.keyPoints[0]}",
    "${promptConfig.format.keyPoints[1]}",
    "${promptConfig.format.keyPoints[2]}"
  ],
  "recommendations": [
    "${promptConfig.format.recommendations[0]}",
    "${promptConfig.format.recommendations[1]}", 
    "${promptConfig.format.recommendations[2]}"
  ]
}

${language === 'en' ? 'Ensure the output contains only valid JSON, without any additional text.' : 'Zorg ervoor dat de output alleen geldige JSON is, zonder extra tekst.'}`;
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
  // End after completing all 10 phases based on actual discussion turns
  const actualTurnNumber = session.actualTurnNumber || 0;
  return actualTurnNumber >= 10;
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
    
    problem_analysis: `Analyseer het kernprobleem of de kernuitdaging van "${topic.title}". Wat zijn de belangrijkste pijnpunten of kansen? Stel kritische vragen en challenge aannames.`,
    
    root_cause: `Ga dieper in op de onderliggende oorzaken. Waarom bestaat dit probleem? Wat zijn de fundamentele factoren? Vraag "waarom" om dieper te graven.`,
    
    stakeholder_perspective: `Bekijk dit vanuit het perspectief van verschillende stakeholders. Hoe beïnvloedt dit hen en wat zijn hun belangen? Stel vragen over conflicterende belangen.`,
    
    solution_generation: `Genereer concrete oplossingen of aanpakken. Wat zijn mogelijke manieren om dit aan te pakken? Bouw voort op elkaars ideeën en stel verbeteringsvragen.`,
    
    critical_evaluation: `Stel kritische vragen bij de voorgestelde oplossingen. Waarom zou dit wel/niet werken? Wat zijn de valkuilen? Wees niet bang voor gezonde kritiek.`,
    
    risk_assessment: `Identificeer potentiële risico's en uitdagingen. Wat kan er misgaan en hoe kunnen we dat mitigeren? Stel "wat als" scenario's voor.`,
    
    implementation_planning: `Hoe zouden we dit concreet kunnen implementeren? Wat zijn de volgende stappen en wie doet wat? Vraag naar praktische details en haalbaarheid.`,
    
    success_metrics: `Hoe meten we succes? Wat zijn concrete KPI's en hoe monitoren we vooruitgang? Challenge voorgestelde metrics en stel alternatieven voor.`,
    
    synthesis: `Vat samen wat de belangrijkste inzichten zijn. Wat zijn de key takeaways en aanbevelingen? Stel nog laatste kritische vragen over de conclusies.`
  };
  
  return instructions[phase];
}

interface RoleActivity {
  role: AIDiscussionRole;
  speakCount: number;
}

function determineActiveRolesForPhase(phase: DiscussionPhase, roles: AIDiscussionRole[]): RoleActivity[] {
  // Determine which roles should be more active in each phase
  const phaseExpertise: Record<DiscussionPhase, string[]> = {
    introduction: [], // Everyone speaks once
    problem_analysis: ['ceo', 'product_owner', 'externe_consultant'], // Strategic and user-focused roles
    root_cause: ['data_analist', 'externe_consultant', 'operationeel_manager'], // Analytical roles
    stakeholder_perspective: ['hr_hoofd', 'customer_success', 'marketing_specialist'], // People-focused roles
    solution_generation: ['cpo', 'innovatie_manager', 'lead_architect'], // Creative and technical roles
    critical_evaluation: ['cfo', 'juridisch_directeur', 'interne_auditor'], // Risk and compliance roles
    risk_assessment: ['security_expert', 'cfo', 'juridisch_directeur'], // Risk-focused roles
    implementation_planning: ['project_manager', 'devops_engineer', 'operationeel_manager'], // Execution roles
    success_metrics: ['data_analist', 'cfo', 'kwaliteitsmanager'], // Measurement-focused roles
    synthesis: ['generaal', 'ceo', 'externe_consultant'] // Leadership and summary roles
  };

  const expertRoles = phaseExpertise[phase] || [];
  
  return roles.map(role => ({
    role,
    speakCount: expertRoles.includes(role.id) ? 2 : 1 // Expert roles speak twice, others once
  }));
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
        description: 'Verkenning van innovatiemogelijkheid en groeistrategieën'
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
    case 'es':
      return {
        systemPrompt: 'Participas en una discusión estratégica de IA con múltiples roles organizacionales.',
        responseInstructions: 'Responde en español con un tono profesional y constructivo.'
      };
    case 'pt':
      return {
        systemPrompt: 'Você está participando de uma discussão estratégica de IA com múltiplos papéis organizacionais.',
        responseInstructions: 'Responda em português com um tom profissional e construtivo.'
      };
    default: // Dutch
      return {
        systemPrompt: 'Je neemt deel aan een strategische AI discussie met meerdere organisatierollen.',
        responseInstructions: 'Reageer in het Nederlands met een professionele en constructieve toon.'
      };
  }
}

function getEnthusiasmInstructions(enthusiasmLevel: number) {
  switch (enthusiasmLevel) {
    case 1: // Pessimistic
      return {
        tone: 'pessimistic and cautious',
        instructions: 'Express skepticism and caution. Focus on risks, limitations, and potential downsides. Question assumptions and highlight why things might not work as expected.'
      };
    case 2: // Neutral/Cautious
      return {
        tone: 'neutral and balanced',
        instructions: 'Maintain a balanced perspective. Consider both positive and negative aspects. Be measured and thoughtful in your responses.'
      };
    case 3: // Moderate/Constructive
      return {
        tone: 'moderate and constructive',
        instructions: 'Be generally positive but realistic. Focus on practical solutions and constructive feedback. Acknowledge challenges while maintaining optimism.'
      };
    case 4: // Positive/Enthusiastic
      return {
        tone: 'positive and enthusiastic',
        instructions: 'Express optimism and enthusiasm. Highlight opportunities and potential benefits. Be encouraging and forward-looking in your responses.'
      };
    case 5: // Super Enthusiastic
      return {
        tone: 'extremely enthusiastic and optimistic',
        instructions: 'Be highly enthusiastic and optimistic. Emphasize the tremendous potential and exciting possibilities. Use energetic language and express strong confidence in success.'
      };
    default: // Default (level 3)
      return {
        tone: 'moderate and constructive',
        instructions: 'Be generally positive but realistic. Focus on practical solutions and constructive feedback. Acknowledge challenges while maintaining optimism.'
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

/**
 * Analyze previous discussion to determine dynamics and interaction patterns
 */
function analyzePreviousDiscussion(session: AIDiscussionSession, currentTurn: number) {
  const allMessages = getAllPreviousMessages(session);
  const recentMessages = allMessages.slice(-6); // Last 6 messages for recent context
  
  // Analyze who has been most active
  const roleActivity = session.roles.map(role => ({
    roleId: role.id,
    roleName: role.name,
    messageCount: allMessages.filter(msg => msg.role === role.id).length,
    recentActivity: recentMessages.filter(msg => msg.role === role.id).length
  }));
  
  // Find controversial points (messages that contradict each other)
  const controversialTopics = findControversialPoints(allMessages, session.roles);
  
  // Identify unanswered questions or points that need follow-up
  const unansweredPoints = findUnansweredPoints(allMessages, session.roles);
  
  // Determine discussion temperature (how heated/engaged the discussion is)
  const discussionTemperature = calculateDiscussionTemperature(allMessages);
  
  return {
    roleActivity,
    controversialTopics,
    unansweredPoints,
    discussionTemperature,
    totalMessages: allMessages.length,
    currentPhase: getPhaseForTurn(currentTurn)
  };
}

/**
 * Generate role-specific context based on discussion dynamics
 */
function generateRoleSpecificContext(
  role: AIDiscussionRole, 
  session: AIDiscussionSession, 
  previousMessages: AIDiscussionMessage[], 
  dynamics: any
) {
  const roleMessages = previousMessages.filter(msg => msg.role === role.id);
  const otherMessages = previousMessages.filter(msg => msg.role !== role.id);
  
  // Find messages this role should specifically respond to
  const messagesToRespondTo = findMessagesToRespondTo(role, otherMessages, session.roles);
  
  // Identify if this role has been quiet and needs to speak up
  const roleActivity = dynamics.roleActivity.find((activity: any) => activity.roleId === role.id);
  const isUnderActive = roleActivity && roleActivity.messageCount < (dynamics.totalMessages / session.roles.length) * 0.7;
  
  // Find controversial points relevant to this role's expertise
  const relevantControversies = dynamics.controversialTopics.filter((topic: any) => 
    isTopicRelevantToRole(topic, role)
  );
  
  // Determine if this role should challenge or support recent points
  const shouldChallenge = shouldRoleChallenge(role, otherMessages, dynamics.discussionTemperature);
  
  return {
    messagesToRespondTo,
    isUnderActive,
    relevantControversies,
    shouldChallenge,
    roleExpertiseNeeded: isRoleExpertiseNeeded(role, dynamics.unansweredPoints),
    recentOppositions: findRecentOppositions(role, otherMessages, session.roles)
  };
}

/**
 * Find controversial points in the discussion
 */
function findControversialPoints(messages: AIDiscussionMessage[], roles: AIDiscussionRole[]) {
  const controversies = [];
  
  // Look for disagreement keywords and opposing viewpoints
  const disagreementKeywords = [
    'niet eens', 'oneens', 'echter', 'maar', 'daarentegen', 'integendeel',
    'weerleg', 'betwist', 'anders', 'fout', 'incorrect', 'problematisch'
  ];
  
  for (let i = 1; i < messages.length; i++) {
    const currentMsg = messages[i];
    const previousMsg = messages[i - 1];
    
    if (currentMsg.role !== previousMsg.role) {
      const hasDisagreement = disagreementKeywords.some(keyword => 
        currentMsg.content.toLowerCase().includes(keyword)
      );
      
      if (hasDisagreement) {
        const currentRole = roles.find(r => r.id === currentMsg.role);
        const previousRole = roles.find(r => r.id === previousMsg.role);
        
        controversies.push({
          topic: extractMainTopic(currentMsg.content),
          disagreement: currentMsg.content.substring(0, 200) + '...',
          roles: [previousRole?.name, currentRole?.name],
          messageIds: [previousMsg.id, currentMsg.id]
        });
      }
    }
  }
  
  return controversies;
}

/**
 * Find unanswered questions or points that need follow-up
 */
function findUnansweredPoints(messages: AIDiscussionMessage[], roles: AIDiscussionRole[]) {
  const unanswered = [];
  
  // Look for questions that haven't been directly addressed
  const questionKeywords = ['waarom', 'hoe', 'wat als', 'welke', 'wanneer', '?'];
  
  messages.forEach((msg, index) => {
    const hasQuestion = questionKeywords.some(keyword => 
      msg.content.toLowerCase().includes(keyword)
    );
    
    if (hasQuestion) {
      // Check if subsequent messages address this question
      const subsequentMessages = messages.slice(index + 1, index + 4);
      const isAddressed = subsequentMessages.some(subMsg => 
        subMsg.role !== msg.role && 
        hasTopicOverlap(msg.content, subMsg.content)
      );
      
      if (!isAddressed) {
        const role = roles.find(r => r.id === msg.role);
        unanswered.push({
          question: extractQuestion(msg.content),
          askedBy: role?.name,
          messageId: msg.id,
          topic: extractMainTopic(msg.content)
        });
      }
    }
  });
  
  return unanswered;
}

/**
 * Calculate discussion temperature (engagement level)
 */
function calculateDiscussionTemperature(messages: AIDiscussionMessage[]) {
  let temperature = 0;
  
  // Factors that increase temperature
  const engagementKeywords = [
    'sterk', 'belangrijk', 'cruciaal', 'essentieel', 'kritiek', 'urgent',
    'oneens', 'problematisch', 'uitdaging', 'risico', 'kans', 'voordeel'
  ];
  
  messages.forEach(msg => {
    const wordCount = msg.content.split(' ').length;
    const engagementScore = engagementKeywords.reduce((score, keyword) => {
      return score + (msg.content.toLowerCase().includes(keyword) ? 1 : 0);
    }, 0);
    
    temperature += (wordCount / 50) + (engagementScore * 2);
  });
  
  return Math.min(temperature / messages.length, 10); // Normalize to 0-10 scale
}

/**
 * Find messages this role should specifically respond to
 */
function findMessagesToRespondTo(role: AIDiscussionRole, otherMessages: AIDiscussionMessage[], roles: AIDiscussionRole[]) {
  const relevantMessages = [];
  
  // Look for messages that mention this role's expertise area
  const expertiseKeywords = role.focusArea.toLowerCase().split(' ');
  
  otherMessages.slice(-4).forEach(msg => { // Last 4 messages from others
    const hasRelevantContent = expertiseKeywords.some(keyword => 
      msg.content.toLowerCase().includes(keyword)
    );
    
    if (hasRelevantContent) {
      const senderRole = roles.find(r => r.id === msg.role);
      relevantMessages.push({
        content: msg.content.substring(0, 150) + '...',
        sender: senderRole?.name,
        messageId: msg.id,
        relevanceScore: calculateRelevanceScore(msg.content, role.focusArea)
      });
    }
  });
  
  return relevantMessages.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Helper functions for analysis
 */
function extractMainTopic(content: string): string {
  const sentences = content.split('.').filter(s => s.trim().length > 10);
  return sentences[0]?.trim().substring(0, 100) + '...' || 'Algemene discussie';
}

function extractQuestion(content: string): string {
  const questionMatch = content.match(/[^.!]*\?[^.!]*/);
  return questionMatch ? questionMatch[0].trim() : content.substring(0, 100) + '...';
}

function hasTopicOverlap(content1: string, content2: string): boolean {
  const words1 = content1.toLowerCase().split(' ').filter(w => w.length > 3);
  const words2 = content2.toLowerCase().split(' ').filter(w => w.length > 3);
  
  const overlap = words1.filter(word => words2.includes(word));
  return overlap.length >= 2;
}

function isTopicRelevantToRole(topic: any, role: AIDiscussionRole): boolean {
  const topicText = topic.topic + ' ' + topic.disagreement;
  return calculateRelevanceScore(topicText, role.focusArea) > 0.3;
}

function calculateRelevanceScore(content: string, focusArea: string): number {
  const contentWords = content.toLowerCase().split(' ');
  const focusWords = focusArea.toLowerCase().split(' ');
  
  let score = 0;
  focusWords.forEach(focusWord => {
    if (contentWords.some(word => word.includes(focusWord) || focusWord.includes(word))) {
      score += 1;
    }
  });
  
  return score / focusWords.length;
}

function shouldRoleChallenge(role: AIDiscussionRole, otherMessages: AIDiscussionMessage[], temperature: number): boolean {
  // Roles should challenge more when discussion temperature is low (needs more engagement)
  // or when their expertise is being discussed incorrectly
  return temperature < 3 || Math.random() > 0.7;
}

function isRoleExpertiseNeeded(role: AIDiscussionRole, unansweredPoints: any[]): boolean {
  return unansweredPoints.some(point => 
    calculateRelevanceScore(point.question + ' ' + point.topic, role.focusArea) > 0.4
  );
}

function findRecentOppositions(role: AIDiscussionRole, otherMessages: AIDiscussionMessage[], roles: AIDiscussionRole[]) {
  const oppositions = [];
  const recentMessages = otherMessages.slice(-3);
  
  recentMessages.forEach(msg => {
    const sender = roles.find(r => r.id === msg.role);
    if (sender && hasOpposingViewpoint(msg.content, role.focusArea)) {
      oppositions.push({
        content: msg.content.substring(0, 120) + '...',
        sender: sender.name,
        messageId: msg.id
      });
    }
  });
  
  return oppositions;
}

function hasOpposingViewpoint(content: string, roleExpertise: string): boolean {
  // Simple heuristic to detect potential opposing viewpoints
  const opposingKeywords = ['niet', 'geen', 'onmogelijk', 'problematisch', 'risico'];
  const expertiseWords = roleExpertise.toLowerCase().split(' ');
  
  return opposingKeywords.some(keyword => content.toLowerCase().includes(keyword)) &&
         expertiseWords.some(word => content.toLowerCase().includes(word));
}

// ===== VOTING FUNCTIONALITY =====

let voteIdCounter = 0;
let votingPromptIdCounter = 0;

function generateVoteId(): string {
  return `vote_${Date.now()}_${++voteIdCounter}`;
}

function generateVotingPromptId(): string {
  return `voting_prompt_${Date.now()}_${++votingPromptIdCounter}`;
}

/**
 * Create a voting prompt when there's significant disagreement
 */
export function createVotingPrompt(
  question: string,
  options: string[],
  voteType: 'agreement' | 'multiple_choice' | 'ranking' = 'multiple_choice'
): AIDiscussionVotingPrompt {
  const votingOptions: AIDiscussionVotingOption[] = options.map((option, index) => ({
    id: `option_${index + 1}`,
    label: String.fromCharCode(65 + index), // A, B, C, etc.
    description: option,
    votes: 0
  }));

  return {
    id: generateVotingPromptId(),
    question,
    options: votingOptions,
    voteType,
    isActive: true
  };
}

/**
 * Generate votes from AI roles based on their expertise and previous statements
 */
export async function generateRoleVotes(
  votingPrompt: AIDiscussionVotingPrompt,
  roles: AIDiscussionRole[],
  session: AIDiscussionSession,
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.GOLD
): Promise<AIDiscussionVote[]> {
  const votes: AIDiscussionVote[] = [];
  const previousMessages = getAllPreviousMessages(session);

  for (const role of roles) {
    try {
      const votePrompt = createVotingPromptForRole(role, votingPrompt, previousMessages, session);
      
      const request: ProviderSelectionRequest = {
        userId,
        functionType: AIFunction.EXPERT_CHAT,
        userTier
      };

      const response = await AIProviderManager.generateContentWithProviderSelection(
        request,
        votePrompt,
        false
      );

      const vote = parseVoteFromResponse(response.content, role.id, votingPrompt);
      if (vote) {
        votes.push(vote);
        // Update vote count on the option
        const option = votingPrompt.options.find(opt => opt.id === vote.voteType.replace('option_', 'option_'));
        if (option) {
          option.votes++;
        }
      }
    } catch (error) {
      console.error(`Error generating vote for role ${role.id}:`, error);
      // Generate fallback vote
      const fallbackVote: AIDiscussionVote = {
        id: generateVoteId(),
        voterId: role.id,
        messageId: '', // Will be set when attached to message
        voteType: 'neutral',
        reasoning: `Als ${role.name} heb ik geen duidelijke voorkeur kunnen bepalen.`,
        timestamp: new Date()
      };
      votes.push(fallbackVote);
    }
  }

  return votes;
}

function createVotingPromptForRole(
  role: AIDiscussionRole,
  votingPrompt: AIDiscussionVotingPrompt,
  previousMessages: AIDiscussionMessage[],
  session: AIDiscussionSession
): string {
  const roleMessages = previousMessages.filter(msg => msg.role === role.id);
  const roleContext = roleMessages.length > 0 ? 
    `\n\nJe eerdere standpunten in deze discussie:\n${roleMessages.map(msg => `- ${msg.content.substring(0, 150)}...`).join('\n')}` : '';

  return `Je bent ${role.name} in een strategische discussie over "${session.topic.title}".
${role.promptTemplate}

${roleContext}

Er is een stemming georganiseerd over de volgende vraag:
"${votingPrompt.question}"

Opties:
${votingPrompt.options.map(opt => `${opt.label}. ${opt.description}`).join('\n')}

Geef je stem en leg uit waarom je deze keuze maakt vanuit jouw rol als ${role.name}.

Antwoord in het volgende formaat:
STEM: [A/B/C/etc.]
REDENERING: [Jouw uitleg in 50-100 woorden vanuit jouw expertise]`;
}

function parseVoteFromResponse(response: string, voterId: string, votingPrompt: AIDiscussionVotingPrompt): AIDiscussionVote | null {
  try {
    const stemMatch = response.match(/STEM:\s*([A-Z])/i);
    const redeneringMatch = response.match(/REDENERING:\s*(.+)/is);

    if (!stemMatch) return null;

    const selectedLetter = stemMatch[1].toUpperCase();
    const selectedOption = votingPrompt.options.find(opt => opt.label === selectedLetter);
    
    if (!selectedOption) return null;

    return {
      id: generateVoteId(),
      voterId,
      messageId: '', // Will be set when attached to message
      voteType: selectedOption.id as any,
      reasoning: redeneringMatch ? redeneringMatch[1].trim() : undefined,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error parsing vote response:', error);
    return null;
  }
}

/**
 * Determine if a voting prompt should be created based on discussion dynamics
 */
export function shouldCreateVotingPrompt(session: AIDiscussionSession, currentTurn: number): boolean {
  // Create voting prompts in specific phases
  const phase = getPhaseForTurn(currentTurn);
  const votingPhases: DiscussionPhase[] = ['solution_generation', 'critical_evaluation', 'implementation_planning'];
  
  if (!votingPhases.includes(phase)) return false;

  // Check if there's significant disagreement
  const dynamics = analyzePreviousDiscussion(session, currentTurn);
  return dynamics.controversialTopics.length > 0 && dynamics.discussionTemperature > 5;
}

/**
 * Generate voting questions based on controversial topics
 */
export function generateVotingQuestions(controversialTopics: any[]): { question: string; options: string[] }[] {
  return controversialTopics.slice(0, 2).map(topic => ({
    question: `Wat is de beste aanpak voor: ${topic.topic}?`,
    options: [
      'Voorzichtige, stapsgewijze implementatie',
      'Snelle, grootschalige uitrol',
      'Pilot project eerst uitvoeren',
      'Meer onderzoek voordat we beslissen'
    ]
  }));
}

// ===== ANALYTICS FUNCTIONALITY =====

/**
 * Generate comprehensive analytics for a discussion session
 */
export function generateDiscussionAnalytics(session: AIDiscussionSession): AIDiscussionAnalytics {
  const allMessages = getAllPreviousMessages(session);
  const roleActivity = calculateRoleActivityMetrics(session, allMessages);
  const controversialTopics = identifyControversialTopics(session, allMessages);
  const votingResults = extractVotingResults(session);
  const discussionFlow = analyzeDiscussionFlow(session);
  const engagementMetrics = calculateEngagementMetrics(session, allMessages);

  // Calculate additional properties needed by the component
  const totalMessages = allMessages.length;
  const totalTurns = session.turns.length;
  const averageResponseLength = totalMessages > 0 ? 
    allMessages.reduce((sum, msg) => sum + msg.content.length, 0) / totalMessages : 0;
  const userInterventions = allMessages.filter(msg => msg.role === 'user').length;
  const discussionDuration = session.createdAt ? Date.now() - session.createdAt.getTime() : 0;
  
  // Find most active role
  const mostActiveRole = roleActivity.length > 0 ? 
    roleActivity.reduce((prev, current) => 
      current.messageCount > prev.messageCount ? current : prev
    ) : null;

  return {
    id: `analytics_${session.id}`,
    sessionId: session.id,
    roleActivity,
    controversialTopics,
    votingResults,
    discussionFlow,
    engagementMetrics,
    generatedAt: new Date(),
    // Additional properties for component compatibility
    totalMessages,
    totalTurns,
    averageResponseLength,
    userInterventions,
    discussionDuration,
    mostActiveRole: mostActiveRole ? {
      name: mostActiveRole.roleName,
      messageCount: mostActiveRole.messageCount
    } : null
  };
}

function calculateRoleActivityMetrics(session: AIDiscussionSession, allMessages: AIDiscussionMessage[]): RoleActivityMetrics[] {
  return session.roles.map(role => {
    const roleMessages = allMessages.filter(msg => msg.role === role.id);
    const totalWords = roleMessages.reduce((sum, msg) => sum + msg.content.split(' ').length, 0);
    const totalMessageCount = allMessages.length;

    return {
      roleId: role.id,
      roleName: role.name,
      messageCount: roleMessages.length,
      wordCount: totalWords,
      averageMessageLength: roleMessages.length > 0 ? totalWords / roleMessages.length : 0,
      averageLength: roleMessages.length > 0 ? 
        roleMessages.reduce((sum, msg) => sum + msg.content.length, 0) / roleMessages.length : 0,
      participationPercentage: totalMessageCount > 0 ? (roleMessages.length / totalMessageCount) * 100 : 0,
      influenceScore: calculateInfluenceScore(role, roleMessages, allMessages),
      topTopics: extractTopTopicsForRole(roleMessages)
    };
  });
}

function calculateInfluenceScore(role: AIDiscussionRole, roleMessages: AIDiscussionMessage[], allMessages: AIDiscussionMessage[]): number {
  // Base score on message count and responses generated
  const messageScore = roleMessages.length * 10;
  const responseScore = countResponsesToRole(role.id, allMessages) * 15;
  const votesReceived = countVotesReceived(roleMessages) * 20;
  
  return Math.min(100, messageScore + responseScore + votesReceived);
}

function countResponsesToRole(roleId: string, allMessages: AIDiscussionMessage[]): number {
  // Count messages that mention or respond to this role
  return allMessages.filter(msg => 
    msg.role !== roleId && 
    (msg.content.toLowerCase().includes(roleId) || 
     msg.content.toLowerCase().includes('eens') ||
     msg.content.toLowerCase().includes('oneens'))
  ).length;
}

function countVotesReceived(roleMessages: AIDiscussionMessage[]): number {
  return roleMessages.reduce((sum, msg) => sum + (msg.votes?.length || 0), 0);
}

function extractTopTopicsForRole(roleMessages: AIDiscussionMessage[]): string[] {
  const topics = new Map<string, number>();
  
  roleMessages.forEach(msg => {
    const words = msg.content.toLowerCase().split(' ');
    words.forEach(word => {
      if (word.length > 4) { // Only consider longer words
        topics.set(word, (topics.get(word) || 0) + 1);
      }
    });
  });

  return Array.from(topics.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);
}

function identifyControversialTopics(session: AIDiscussionSession, allMessages: AIDiscussionMessage[]): ControversialTopic[] {
  const controversialPoints = findControversialPoints(allMessages, session.roles);
  
  return controversialPoints.map((point, index) => ({
    id: `controversial_${index}`,
    topic: point.topic,
    description: `Dit onderwerp heeft geleid tot verschillende meningen tussen de AI-rollen.`,
    controversyLevel: Math.floor((point.disagreementLevel || 50) / 20), // Convert to 1-5 scale
    disagreementLevel: point.disagreementLevel || 50,
    involvedRoles: point.involvedRoles || [],
    keyPoints: [point.point1, point.point2].filter(Boolean),
    differentPerspectives: (point.involvedRoles || []).map(roleId => {
      const role = session.roles.find(r => r.id === roleId);
      return {
        roleName: role?.name || roleId,
        viewpoint: `Perspectief van ${role?.name || roleId} op dit onderwerp.`
      };
    })
  }));
}

function extractVotingResults(session: AIDiscussionSession): VotingResults[] {
  const allMessages = getAllPreviousMessages(session);
  const votingResults: VotingResults[] = [];

  allMessages.forEach(msg => {
    if (msg.votingPrompt && msg.votes) {
      const totalVotes = msg.votes.length;
      const results = msg.votingPrompt.options.map(option => ({
        optionId: option.id,
        label: option.label,
        voteCount: option.votes,
        percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0,
        voterRoles: msg.votes?.filter(vote => vote.voteType === option.id).map(vote => vote.voterId) || []
      }));

      const maxVotes = Math.max(...results.map(r => r.voteCount));
      const consensus = results.filter(r => r.voteCount === maxVotes).length === 1;
      const controversyLevel = consensus ? 20 : 80;

      votingResults.push({
        promptId: msg.votingPrompt.id,
        question: msg.votingPrompt.question,
        totalVotes,
        votesFor: results.find(r => r.label.toLowerCase().includes('voor') || r.label.toLowerCase().includes('ja'))?.voteCount || 0,
        votesAgainst: results.find(r => r.label.toLowerCase().includes('tegen') || r.label.toLowerCase().includes('nee'))?.voteCount || 0,
        results,
        consensus,
        controversyLevel
      });
    }
  });

  return votingResults;
}

function analyzeDiscussionFlow(session: AIDiscussionSession): any {
  return {
    totalTurns: session.turns.length,
    averageResponseTime: 2.5, // Simulated metric
    topicTransitions: [],
    phaseEffectiveness: session.turns.map(turn => ({
      phase: turn.phase,
      messageCount: turn.messages.length,
      engagementLevel: calculateTurnEngagement(turn),
      keyOutcomes: extractKeyOutcomes(turn)
    }))
  };
}

function calculateTurnEngagement(turn: AIDiscussionTurn): number {
  const totalWords = turn.messages.reduce((sum, msg) => sum + msg.content.split(' ').length, 0);
  const avgWordsPerMessage = totalWords / turn.messages.length;
  return Math.min(100, avgWordsPerMessage / 2); // Normalize to 0-100 scale
}

function extractKeyOutcomes(turn: AIDiscussionTurn): string[] {
  // Extract key sentences from messages
  return turn.messages.map(msg => {
    const sentences = msg.content.split('.').filter(s => s.trim().length > 20);
    return sentences[0]?.trim() + '.';
  }).filter(Boolean).slice(0, 3);
}

function calculateEngagementMetrics(session: AIDiscussionSession, allMessages: AIDiscussionMessage[]): any {
  const turnEngagements = session.turns.map(turn => calculateTurnEngagement(turn));
  const overallEngagement = turnEngagements.reduce((sum, eng) => sum + eng, 0) / turnEngagements.length;
  
  const roleEngagement: { [roleId: string]: number } = {};
  session.roles.forEach(role => {
    const roleMessages = allMessages.filter(msg => msg.role === role.id);
    const roleWords = roleMessages.reduce((sum, msg) => sum + msg.content.split(' ').length, 0);
    roleEngagement[role.id] = Math.min(100, roleWords / 10);
  });

  const peakEngagementTurn = turnEngagements.indexOf(Math.max(...turnEngagements)) + 1;
  
  let engagementTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (turnEngagements.length > 2) {
    const firstHalf = turnEngagements.slice(0, Math.floor(turnEngagements.length / 2));
    const secondHalf = turnEngagements.slice(Math.floor(turnEngagements.length / 2));
    const firstAvg = firstHalf.reduce((sum, eng) => sum + eng, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, eng) => sum + eng, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 5) engagementTrend = 'increasing';
    else if (secondAvg < firstAvg - 5) engagementTrend = 'decreasing';
  }

  return {
    overallEngagement,
    roleEngagement,
    peakEngagementTurn,
    engagementTrend
  };
}