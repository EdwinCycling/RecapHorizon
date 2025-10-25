import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AIDiscussionTopic, 
  AIDiscussionGoal, 
  AIDiscussionRole, 
  AIDiscussionSession,
  AIDiscussionReport,
  SubscriptionTier 
} from '../../types';
import { FiUsers, FiArrowLeft, FiRefreshCw, FiFileText, FiPlay, FiPause, FiTarget, FiTool, FiCheckCircle, FiZap, FiShield } from 'react-icons/fi';
import { generateDiscussionTopics, startDiscussion, continueDiscussion, generateDiscussionReport } from '../services/aiDiscussionService';
import { displayToast } from '../utils/clipboard';
import { useTranslation } from '../hooks/useTranslation';
import { RateLimiter } from '../utils/debounce';
import { auth } from '../firebase';
import { getUserSubscriptionTier } from '../firebase';
import BlurredLoadingOverlay from './BlurredLoadingOverlay';
import AIDiscussionConfiguration from './AIDiscussionConfiguration';
import MultiAgentDiscussionInterface from './MultiAgentDiscussionInterface';
import DiscussionReportPage from './DiscussionReportPage';

interface AIDiscussionTabProps {
  t: (key: string, params?: Record<string, unknown>) => string;
  transcript: string;
  summary?: string;
  onDiscussionComplete: (report: AIDiscussionReport) => void;
  isGenerating?: boolean;
  language: string;
  userId: string;
  userTier: SubscriptionTier;
  // Scope cache to session to avoid stale topics when a new session starts
  sessionId?: string;
}

interface AIDiscussionState {
  step: 'generating' | 'selectTopic' | 'configure' | 'discussing' | 'report';
  topics: AIDiscussionTopic[];
  selectedTopic?: AIDiscussionTopic;
  selectedGoal?: AIDiscussionGoal;
  selectedRoles: AIDiscussionRole[];
  session?: AIDiscussionSession;
  report?: AIDiscussionReport;
  error?: string;
  isDiscussionActive: boolean;
  newTurnIds: string[]; // Track IDs of turns added in the current round
}

// Comprehensive discussion categories and goals as defined by user requirements
const DISCUSSION_CATEGORIES = {
  vision: {
    id: 'vision',
    name: 'Visie en Conceptvalidatie',
    icon: FiTarget,
    goals: [
      {
        id: 'v1',
        name: 'Kernhypothese Valideren',
        description: 'Wat moet absoluut waar zijn om dit idee te laten slagen, en hoe testen we dat snel?',
        icon: FiTarget
      },
      {
        id: 'v2', 
        name: 'Blue Sky Ideevorming',
        description: 'Verkennen van de meest ambitieuze en \'wildste\' versies van het idee.',
        icon: FiZap
      },
      {
        id: 'v3',
        name: 'Minimale Levensvatbare Oplossing (MVP) Definitie',
        description: 'Wat is de kleinste, snelste versie die we kunnen bouwen om waarde te leveren?',
        icon: FiCheckCircle
      },
      {
        id: 'v4',
        name: 'Scenario-ontwikkeling (Best & Worst Case)',
        description: 'Wat zijn de meest extreme succes- en faalscenario\'s en hoe reageren we?',
        icon: FiShield
      },
      {
        id: 'v5',
        name: 'Kernwaarden en Merkpositionering',
        description: 'Welke emotie of probleem lossen we primair op en hoe vertalen we dit naar onze identiteit?',
        icon: FiUsers
      }
    ]
  },
  lean: {
    id: 'lean',
    name: 'Lean Financiën en Middelen',
    icon: FiTool,
    goals: [
      {
        id: 'l1',
        name: 'Kosten-Slimme Realisatiepaden',
        description: 'Hoe kunnen we dit initiatief uitvoeren met minimale initiële investeringen (bootstrapping)?',
        icon: FiTool
      },
      {
        id: 'l2',
        name: 'Mogelijke Inkomstenstromen',
        description: 'Brainstormen over alle mogelijke manieren om geld te verdienen (direct, indirect, data).',
        icon: FiTarget
      },
      {
        id: 'l3',
        name: 'Efficiënt Gebruik van Huidige Middelen',
        description: 'Hoe kunnen we bestaande talenten, systemen of partners inzetten om kosten te besparen?',
        icon: FiCheckCircle
      },
      {
        id: 'l4',
        name: 'Focus op Vroege Cashflow',
        description: 'Welke onderdelen van het idee kunnen het snelst geld opleveren om de rest te financieren?',
        icon: FiZap
      },
      {
        id: 'l5',
        name: 'Resource Ruilhandel / Partnerships',
        description: 'Welke waarde kunnen we bieden aan partners in ruil voor hun middelen of expertise?',
        icon: FiUsers
      }
    ]
  },
  execution: {
    id: 'execution',
    name: 'Snelheid en Flexibele Uitvoering',
    icon: FiZap,
    goals: [
      {
        id: 'u1',
        name: 'Prioritering van Features (Moet/Zou/Kan)',
        description: 'Bepalen welke functies cruciaal zijn voor de MVP en welke luxe zijn.',
        icon: FiCheckCircle
      },
      {
        id: 'u2',
        name: 'Versnelling van de Tijdlijn',
        description: 'Hoe kunnen we de levering van de eerste versie met 30% versnellen?',
        icon: FiZap
      },
      {
        id: 'u3',
        name: 'Afhankelijkheden Elimineren',
        description: 'Hoe maken we onszelf minder afhankelijk van trage of dure externe factoren?',
        icon: FiShield
      },
      {
        id: 'u4',
        name: 'Operationele Simpliciteit',
        description: 'Hoe ontwerpen we het proces zo dat het met de minste inspanning schaalbaar is?',
        icon: FiTool
      },
      {
        id: 'u5',
        name: 'Feedback Loop Design',
        description: 'Hoe creëren we het snelste en meest effectieve mechanisme om feedback van vroege gebruikers te verzamelen en te verwerken?',
        icon: FiUsers
      }
    ]
  },
  people: {
    id: 'people',
    name: 'Mensen, Talent en Cultuur',
    icon: FiUsers,
    goals: [
      {
        id: 'm1',
        name: 'Identificeren van Belangrijke Hiaten in Talent',
        description: 'Welke kritieke expertise missen we momenteel om dit te bouwen?',
        icon: FiUsers
      },
      {
        id: 'm2',
        name: 'Aantrekken van Vroege Adoptanten (Intern & Extern)',
        description: 'Hoe maken we de eerste klanten/medewerkers enthousiast en bereid risico te nemen?',
        icon: FiTarget
      },
      {
        id: 'm3',
        name: 'Kleine Team Structuur',
        description: 'Hoe stellen we het meest effectieve, compacte team samen voor de eerste 6 maanden?',
        icon: FiCheckCircle
      },
      {
        id: 'm4',
        name: 'Verandering in Mindset Stimuleren',
        description: 'Hoe communiceren we dit idee om weerstand in de organisatie te verminderen en nieuwsgierigheid te wekken?',
        icon: FiZap
      },
      {
        id: 'm5',
        name: 'Snel Beslissingskader',
        description: 'Hoe versnellen we de besluitvorming rond dit project?',
        icon: FiTool
      }
    ]
  },
  market: {
    id: 'market',
    name: 'Markt en Adoptie',
    icon: FiCheckCircle,
    goals: [
      {
        id: 'a1',
        name: 'Creatieve Oplossingen voor Juridische Kaders',
        description: 'Hoe kunnen we innovatief zijn binnen de bestaande wet- en regelgeving?',
        icon: FiShield
      },
      {
        id: 'a2',
        name: 'Marketing met Nul Budget',
        description: 'Welke guerrillamarketing of virale strategieën kunnen we gebruiken?',
        icon: FiZap
      },
      {
        id: 'a3',
        name: 'Concurrentievoordeel door Proces',
        description: 'Wat kunnen we beter of anders doen dan de concurrent, dat nauwelijks te kopiëren is?',
        icon: FiTarget
      },
      {
        id: 'a4',
        name: 'Vroege Marktsegmentatie',
        description: 'Wie zijn de eerste 100 klanten die we absoluut willen winnen en waarom?',
        icon: FiUsers
      },
      {
        id: 'a5',
        name: 'Integrale Innovatie-Analyse',
        description: 'Hoe kan dit idee elke afdeling helpen om innovatiever te zijn?',
        icon: FiCheckCircle
      }
    ]
  }
};

// Flatten all goals for backward compatibility
const DISCUSSION_GOALS: AIDiscussionGoal[] = Object.values(DISCUSSION_CATEGORIES).flatMap(category => 
  category.goals.map(goal => ({
    ...goal,
    category: category.id
  }))
);

// Static organizational roles as defined in the technical architecture
const ORGANIZATIONAL_ROLES: AIDiscussionRole[] = [
  // Leiderschap & Strategie
  {
    id: 'ceo',
    name: 'CEO',
    description: 'Chief Executive Officer - Focus op visie, marktleiderschap en lange termijn strategie',
    focusArea: 'Visie, marktleiderschap en lange termijn strategie',
    category: 'leiding_strategie',
    promptTemplate: 'Als CEO focus ik op visie, marktleiderschap en lange termijn strategie. Ik benader vraagstukken vanuit een holistisch perspectief met focus op waardecreatie en stakeholder management.'
  },
  {
    id: 'cfo',
    name: 'CFO',
    description: 'Chief Financial Officer - Focus op budget, ROI, financiële risico\'s en schaalbaarheid',
    focusArea: 'Budget, ROI, financiële risico\'s en schaalbaarheid',
    category: 'leiding_strategie',
    promptTemplate: 'Als CFO focus ik op budget, ROI, financiële risico\'s en schaalbaarheid. Ik benader vraagstukken vanuit financieel perspectief met focus op kostenbeheersing en winstgevendheid.'
  },
  {
    id: 'hr_hoofd',
    name: 'Hoofd HR & Cultuur',
    description: 'Focus op personeelsimpact, talentwerving en organisatieverandering',
    focusArea: 'Personeelsimpact, talentwerving en organisatieverandering',
    category: 'leiding_strategie',
    promptTemplate: 'Als Hoofd HR & Cultuur focus ik op personeelsimpact, talentwerving en organisatieverandering. Ik benader vraagstukken vanuit menselijk perspectief met focus op engagement en cultuurontwikkeling.'
  },
  {
    id: 'juridisch_directeur',
    name: 'Directeur Juridische Zaken',
    description: 'Focus op compliance, wetgeving en ethische risico\'s',
    focusArea: 'Compliance, wetgeving en ethische risico\'s',
    category: 'leiding_strategie',
    promptTemplate: 'Als Directeur Juridische Zaken focus ik op compliance, wetgeving en ethische risico\'s. Ik benader vraagstukken vanuit juridisch perspectief met focus op regelgeving en risicobeheer.'
  },
  
  // Product & Markt
  {
    id: 'cpo',
    name: 'CPO',
    description: 'Chief Product Officer - Focus op productontwikkeling, user experience en roadmap',
    focusArea: 'Productontwikkeling, user experience en roadmap',
    category: 'product_markt',
    promptTemplate: 'Als CPO focus ik op productontwikkeling, user experience en roadmap. Ik benader vraagstukken vanuit productperspectief met focus op gebruikerswaarde en marktfit.'
  },
  {
    id: 'marketing_specialist',
    name: 'Marketing Specialist',
    description: 'Focus op marktpositionering, klantsegmentatie en communicatie',
    focusArea: 'Marktpositionering, klantsegmentatie en communicatie',
    category: 'product_markt',
    promptTemplate: 'Als Marketing Specialist focus ik op marktpositionering, klantsegmentatie en communicatie. Ik benader vraagstukken vanuit marketingperspectief met focus op merkwaarde en klantbereik.'
  },
  {
    id: 'verkoopdirecteur',
    name: 'Verkoopdirecteur',
    description: 'Focus op saleskanalen, omzetprognoses en klantacquisitie',
    focusArea: 'Saleskanalen, omzetprognoses en klantacquisitie',
    category: 'product_markt',
    promptTemplate: 'Als Verkoopdirecteur focus ik op saleskanalen, omzetprognoses en klantacquisitie. Ik benader vraagstukken vanuit verkoopperspectief met focus op omzetgroei en klantrelaties.'
  },
  {
    id: 'customer_success',
    name: 'Customer Success Lead',
    description: 'Focus op klanttevredenheid, retentie en servicekwaliteit',
    focusArea: 'Klanttevredenheid, retentie en servicekwaliteit',
    category: 'product_markt',
    promptTemplate: 'Als Customer Success Lead focus ik op klanttevredenheid, retentie en servicekwaliteit. Ik benader vraagstukken vanuit klantperspectief met focus op loyaliteit en waarderealisatie.'
  },
  {
    id: 'product_owner',
    name: 'Product Owner',
    description: 'Let op details, is alles duidelijk, is het met klanten afgestemd, past het in ons huidige product',
    focusArea: 'Productdetails, klantafstemming en productintegratie',
    category: 'product_markt',
    promptTemplate: 'Als Product Owner let ik op details, zorg ik dat alles duidelijk is, dat het met klanten is afgestemd en dat het past in ons huidige product. Ik benader vraagstukken vanuit gebruikersperspectief met focus op functionaliteit en bruikbaarheid.'
  },
  
  // Techniek & Data
  {
    id: 'lead_architect',
    name: 'Lead IT Architect',
    description: 'Focus op technische infrastructuur, beveiliging en integratie',
    focusArea: 'Technische infrastructuur, beveiliging en integratie',
    category: 'technologie',
    promptTemplate: 'Als Lead IT Architect focus ik op technische infrastructuur, beveiliging en integratie. Ik benader vraagstukken vanuit architecturaal perspectief met focus op schaalbaarheid en technische excellentie.'
  },
  {
    id: 'data_analist',
    name: 'Data Analist',
    description: 'Focus op meetbaarheid, datakwaliteit en inzichten',
    focusArea: 'Meetbaarheid, datakwaliteit en inzichten',
    category: 'technologie',
    promptTemplate: 'Als Data Analist focus ik op meetbaarheid, datakwaliteit en inzichten. Ik benader vraagstukken vanuit analytisch perspectief met focus op data-gedreven besluitvorming.'
  },
  {
    id: 'security_expert',
    name: 'Security Expert',
    description: 'Focus op dataveiligheid, privacy (AVG) en cyberrisico\'s',
    focusArea: 'Dataveiligheid, privacy (AVG) en cyberrisico\'s',
    category: 'technologie',
    promptTemplate: 'Als Security Expert focus ik op dataveiligheid, privacy (AVG) en cyberrisico\'s. Ik benader vraagstukken vanuit beveiligingsperspectief met focus op bescherming en compliance.'
  },
  {
    id: 'devops_engineer',
    name: 'DevOps Engineer',
    description: 'Focus op implementatiesnelheid, automatisering en operationele stabiliteit',
    focusArea: 'Implementatiesnelheid, automatisering en operationele stabiliteit',
    category: 'technologie',
    promptTemplate: 'Als DevOps Engineer focus ik op implementatiesnelheid, automatisering en operationele stabiliteit. Ik benader vraagstukken vanuit operationeel perspectief met focus op efficiency en betrouwbaarheid.'
  },
  
  // Operationeel
  {
    id: 'operationeel_manager',
    name: 'Operationeel Manager',
    description: 'Focus op efficiëntie, procesoptimalisatie en middelenbeheer',
    focusArea: 'Efficiëntie, procesoptimalisatie en middelenbeheer',
    category: 'operaties',
    promptTemplate: 'Als Operationeel Manager focus ik op efficiëntie, procesoptimalisatie en middelenbeheer. Ik benader vraagstukken vanuit operationeel perspectief met focus op productiviteit en kostenbeheersing.'
  },
  {
    id: 'project_manager',
    name: 'Project/Programma Manager',
    description: 'Focus op planning, mijlpalen, scope management en levering',
    focusArea: 'Planning, mijlpalen, scope management en levering',
    category: 'operaties',
    promptTemplate: 'Als Project/Programma Manager focus ik op planning, mijlpalen, scope management en levering. Ik benader vraagstukken vanuit projectperspectief met focus op tijdige en succesvolle oplevering.'
  },
  {
    id: 'kwaliteitsmanager',
    name: 'Kwaliteitsmanager',
    description: 'Focus op standaarden, auditprocedures en foutenreductie',
    focusArea: 'Standaarden, auditprocedures en foutenreductie',
    category: 'operaties',
    promptTemplate: 'Als Kwaliteitsmanager focus ik op standaarden, auditprocedures en foutenreductie. Ik benader vraagstukken vanuit kwaliteitsperspectief met focus op excellentie en continue verbetering.'
  },
  
  // Innovatie & Toekomst
  {
    id: 'innovatie_manager',
    name: 'Innovatie Manager',
    description: 'Focus op nieuwe technologieën, experimenten en disruptie',
    focusArea: 'Nieuwe technologieën, experimenten en disruptie',
    category: 'technologie',
    promptTemplate: 'Als Innovatie Manager focus ik op nieuwe technologieën, experimenten en disruptie. Ik benader vraagstukken vanuit innovatieperspectief met focus op toekomstmogelijkheden en doorbraken.'
  },
  {
    id: 'duurzaamheidsadviseur',
    name: 'Duurzaamheidsadviseur',
    description: 'Focus op ecologische en sociale impact (ESG)',
    focusArea: 'Ecologische en sociale impact (ESG)',
    category: 'externe_stakeholders',
    promptTemplate: 'Als Duurzaamheidsadviseur focus ik op ecologische en sociale impact (ESG). Ik benader vraagstukken vanuit duurzaamheidsperspectief met focus op maatschappelijke verantwoordelijkheid.'
  },
  {
    id: 'externe_consultant',
    name: 'Externe Consultant (Neutraal)',
    description: 'Focus op best practices, externe benchmarks en onafhankelijk advies',
    focusArea: 'Best practices, externe benchmarks en onafhankelijk advies',
    category: 'externe_stakeholders',
    promptTemplate: 'Als Externe Consultant focus ik op best practices, externe benchmarks en onafhankelijk advies. Ik benader vraagstukken vanuit neutraal perspectief met focus op objectieve analyse en marktinzichten.'
  },
  
  // Gebruiker & Controle
  {
    id: 'eindgebruiker',
    name: 'Eindgebruiker/Klantvertegenwoordiger',
    description: 'Focus op de daadwerkelijke behoeften en problemen van de gebruiker',
    focusArea: 'Daadwerkelijke behoeften en problemen van de gebruiker',
    category: 'externe_stakeholders',
    promptTemplate: 'Als Eindgebruiker/Klantvertegenwoordiger focus ik op de daadwerkelijke behoeften en problemen van de gebruiker. Ik benader vraagstukken vanuit gebruikersperspectief met focus op praktische bruikbaarheid en waarde.'
  },
  {
    id: 'interne_auditor',
    name: 'Interne Auditor',
    description: 'Focus op risicobeheersing en naleving van interne beleidsregels',
    focusArea: 'Risicobeheersing en naleving van interne beleidsregels',
    category: 'operaties',
    promptTemplate: 'Als Interne Auditor focus ik op risicobeheersing en naleving van interne beleidsregels. Ik benader vraagstukken vanuit controleperspectief met focus op compliance en risicomitigatie.'
  },
  
  // Markt
  {
    id: 'invester',
    name: 'De Invester',
    description: 'Focus op kansen, kosten, winstgevendheid en time2market',
    focusArea: 'Kansen, kosten, winstgevendheid en time2market',
    category: 'marketing',
    promptTemplate: 'Als Invester focus ik op kansen, kosten, winstgevendheid en time2market. Ik benader vraagstukken vanuit investeringsperspectief met focus op rendement en marktpotentieel.'
  },
  {
    id: 'generaal',
    name: 'De Generaal',
    description: 'Wil structuur, is iedereen mee, neemt beslissing bij meerdere keuzes, knoop doorhakken',
    focusArea: 'Structuur, consensus en besluitvorming',
    category: 'leiding_strategie',
    promptTemplate: 'Als Generaal wil ik structuur, zorg ik dat iedereen mee is, neem ik beslissingen bij meerdere keuzes en hak ik knopen door. Ik benader vraagstukken vanuit leiderschapsperspectief met focus op duidelijkheid en actie.'
  }
];

// Helper function to get display name for discussion phases
const getPhaseDisplayName = (phase: string, t: (key: string, params?: Record<string, unknown>) => string): string => {
  const phaseNames: Record<string, string> = {
    introduction: t('aiDiscussion.phaseIntroduction') || 'Introductie',
    problem_analysis: t('aiDiscussion.phaseProblemAnalysis') || 'Probleemanalyse',
    root_cause: t('aiDiscussion.phaseRootCause') || 'Oorzaakanalyse',
    stakeholder_perspective: t('aiDiscussion.phaseStakeholder') || 'Stakeholderperspectief',
    solution_generation: t('aiDiscussion.phaseSolutionGeneration') || 'Oplossingsgeneratie',
    critical_evaluation: t('aiDiscussion.phaseCriticalEvaluation') || 'Kritische evaluatie',
    risk_assessment: t('aiDiscussion.phaseRiskAssessment') || 'Risicoanalyse',
    implementation_planning: t('aiDiscussion.phaseImplementation') || 'Implementatieplanning',
    success_metrics: t('aiDiscussion.phaseSuccessMetrics') || 'Succesindicatoren',
    synthesis: t('aiDiscussion.phaseSynthesis') || 'Synthese'
  };
  
  return phaseNames[phase] || phase;
};

const AIDiscussionTab: React.FC<AIDiscussionTabProps> = ({
  t,
  transcript,
  summary,
  onDiscussionComplete,
  isGenerating = false,
  language,
  userId,
  userTier,
  sessionId
}) => {
  const [state, setState] = useState<AIDiscussionState>({
    step: 'generating',
    topics: [],
    selectedRoles: [],
    error: undefined,
    isDiscussionActive: false,
    newTurnIds: []
  });

  // Rate limiter to prevent too frequent topic generation (minimum 3 seconds between calls)
  const rateLimiterRef = useRef(new RateLimiter(3000));
  const lastGenerationAttemptRef = useRef<number>(0);
  
  // Shared topics cache key across tabs (same as ThinkingPartnerTab and OpportunitiesTab)
  const getTopicsCacheKey = useCallback(() => {
    const content = (summary || transcript || '').trim();
    const base = `${userId || 'anon'}:${language}:${sessionId || 'noSession'}`;
    let h = 0; for (let i = 0; i < content.length; i++) { h = ((h << 5) - h) + content.charCodeAt(i); h |= 0; }
    return `rh_topics:${base}:${h}`;
  }, [userId, language, sessionId, transcript, summary]);
  
  // Check if user has access to AI Discussion feature (Enterprise, Gold, Diamond only - not Free or Silver)
  const hasAccess = userTier === SubscriptionTier.ENTERPRISE || userTier === SubscriptionTier.GOLD || userTier === SubscriptionTier.DIAMOND;
  
  // Simplified topic generation like TeachMe approach
  const generateTopics = useCallback(async () => {
    const content = (summary || transcript || '').trim();
    if (!content) {
      setState(prev => ({ ...prev, step: 'selectTopic', topics: [], error: t('aiDiscussion.topicGenerationError', 'Er is onvoldoende inhoud om onderwerpen te genereren') }));
      return;
    }
  
    setState(prev => ({ ...prev, step: 'generating', error: undefined, topics: [] }));
    
    try {
      const topics = await generateDiscussionTopics(transcript, summary, language, userId, userTier);
      
      // Save topics to cache for cross-tab sharing
      try {
        const key = getTopicsCacheKey();
        window.localStorage.setItem(key, JSON.stringify(topics));
      } catch {}
      
      setState(prev => ({
        ...prev,
        step: 'selectTopic',
        topics,
        error: undefined
      }));
    } catch (error) {
      console.error('Error generating discussion topics:', error);
      
      let errorMessage = t('aiDiscussion.topicGenerationError', 'Er is een fout opgetreden bij het genereren van discussieonderwerpen');
      
      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        
        if (errorText.includes('overloaded') || errorText.includes('503')) {
          errorMessage = t('aiDiscussion.serverOverloadError', 'De AI-service is momenteel overbelast. Probeer het over een paar minuten opnieuw.');
        } else if (errorText.includes('quota') || errorText.includes('rate limit')) {
          errorMessage = t('aiDiscussion.quotaExceededError', 'Het dagelijkse gebruik van de AI-service is bereikt. Probeer het later opnieuw of upgrade je abonnement.');
        } else if (errorText.includes('network') || errorText.includes('fetch')) {
          errorMessage = t('aiDiscussion.networkError', 'Netwerkfout bij het verbinden met de AI-service. Controleer je internetverbinding en probeer opnieuw.');
        }
      }
      
      setState(prev => ({
        ...prev,
        step: 'selectTopic',
        topics: [],
        error: errorMessage
      }));
    }
  }, [transcript, summary, language, userId, userTier, t]);
  
  // Manual refresh for topics generation
  const refreshTopics = useCallback(() => {
    if (!hasAccess) return;
    setState(prev => ({ ...prev, topics: [], step: 'generating' }));
    generateTopics();
  }, [hasAccess, generateTopics]);
  
  // Load topics on mount - simplified like TeachMe
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const hasGeneratedRef = useRef(false);
  
  useEffect(() => {
    if (!hasAccess) return;
    if (isGeneratingTopics) return;
    if (hasGeneratedRef.current) return;

    const content = (summary || transcript || '').trim();
    if (!content) {
      setState(prev => ({ ...prev, step: 'selectTopic', topics: [], error: t('aiDiscussion.topicGenerationError', 'Er is onvoldoende inhoud om onderwerpen te genereren') }));
      return;
    }

    // Check for cached topics first (cross-tab sharing)
    const tryLoadFromCache = () => {
      try {
        const key = getTopicsCacheKey();
        const cached = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
        if (cached) {
          const topics = JSON.parse(cached) as AIDiscussionTopic[];
          setState(prev => ({ ...prev, step: 'selectTopic', topics }));
          hasGeneratedRef.current = true;
          return true;
        }
      } catch {}
      return false;
    };

    // Only generate if we don't have topics yet, we're in generating state, and no cached topics found
    if (state.topics.length === 0 && state.step === 'generating' && !tryLoadFromCache()) {
      setIsGeneratingTopics(true);
      hasGeneratedRef.current = true;
      generateTopics().finally(() => {
        setIsGeneratingTopics(false);
      });
    }
  }, [hasAccess, transcript, summary, state.topics.length, state.step, generateTopics, t, isGeneratingTopics, getTopicsCacheKey]);
  
  const handleTopicSelect = useCallback((topic: AIDiscussionTopic) => {
    setState(prev => ({ 
      ...prev, 
      selectedTopic: topic, 
      step: 'configure',
      error: undefined 
    }));
  }, []);

  const handleConfigurationComplete = useCallback(async (goal: AIDiscussionGoal, roles: AIDiscussionRole[]) => {
    if (!state.selectedTopic) return;

    // Handhaaf precies 4 AI-rollen en maak de eerste rol de gespreksleider
    const exactlyFour = roles.slice(0, 4);
    const rolesWithModerator: AIDiscussionRole[] = exactlyFour.map((r, idx) => (
      idx === 0
        ? {
            ...r,
            name: `${r.name} (Gespreksleider)`,
            description: `${r.description} — Gespreksleider: faciliteer de bespreking, stel verhelderende vragen, vat samen en bewaak het doel.`
          }
        : r
    ));

    try {
      setState(prev => ({
        ...prev,
        selectedGoal: goal,
        selectedRoles: rolesWithModerator,
        step: 'discussing',
        isDiscussionActive: true,
        error: undefined
      }));

      const session = await startDiscussion(state.selectedTopic, goal, rolesWithModerator, language, userId, userTier);
      setState(prev => ({
        ...prev,
        session,
        error: undefined,
        isDiscussionActive: false,
        newTurnIds: [] // Reset new turn IDs when starting a new session
      }));
    } catch (error) {
      console.error('Error starting discussion:', error);
      setState(prev => ({
        ...prev,
        error: t('aiDiscussion.startError', 'Er is een fout opgetreden bij het starten van de discussie'),
        step: 'configure',
        isDiscussionActive: false
      }));
    }
  }, [state.selectedTopic, language, t]);

  const handleContinueDiscussion = useCallback(async () => {
    if (!state.session) return;

    try {
      setState(prev => ({ ...prev, isDiscussionActive: true, error: undefined }));
      const newTurn = await continueDiscussion(state.session, userId, userTier);
      
      // Use functional update to ensure we're working with the latest state
      setState(prev => {
        if (!prev.session) return prev;
        
        // Check if this turn already exists to prevent duplicates
        const turnExists = prev.session.turns.some(turn => turn.id === newTurn.id);
        if (turnExists) {
          console.warn('Duplicate turn detected, skipping update');
          return { ...prev, isDiscussionActive: false, error: undefined };
        }
        
        return { 
          ...prev, 
          session: { 
            ...prev.session, 
            turns: [...prev.session.turns, newTurn] 
          },
          isDiscussionActive: false,
          error: undefined,
          newTurnIds: [newTurn.id] // Track the new turn ID for highlighting
        };
      });
    } catch (error) {
      console.error('Error continuing discussion:', error);
      setState(prev => ({ 
        ...prev, 
        error: t('aiDiscussion.continueError', 'Er is een fout opgetreden bij het voortzetten van de discussie'),
        isDiscussionActive: false
      }));
    }
  }, [state.session, t, userId, userTier]);

  // Auto-advance to vraagronde (ronde 2) na voorstelronde - DISABLED voor gebruikerscontrole
  // const autoContinueRef = useRef(false);
  // useEffect(() => {
  //   // Only auto-continue if we're in discussing step, have a session with exactly 1 turn,
  //   // haven't auto-continued yet, and the discussion is not currently active
  //   if (state.step === 'discussing' && 
  //       state.session && 
  //       state.session.turns.length === 1 && 
  //       !autoContinueRef.current && 
  //       !state.isDiscussionActive) {
  //     autoContinueRef.current = true;
  //     handleContinueDiscussion();
  //   }
  //   
  //   // Reset auto-continue flag when we leave the discussing step or start a new session
  //   if (state.step !== 'discussing' || !state.session) {
  //     autoContinueRef.current = false;
  //   }
  // }, [state.step, state.session, state.isDiscussionActive, handleContinueDiscussion]);

  const handleGenerateReport = useCallback(async () => {
    if (!state.session) return;

    try {
      setState(prev => ({ ...prev, isDiscussionActive: true, error: undefined }));
      const report = await generateDiscussionReport(state.session, language, userId, userTier);
      
      setState(prev => ({ 
        ...prev, 
        report,
        step: 'report',
        isDiscussionActive: false,
        error: undefined 
      }));

      onDiscussionComplete(report);
    } catch (error) {
      console.error('Error generating report:', error);
      setState(prev => ({ 
        ...prev, 
        error: t('aiDiscussion.reportError', 'Er is een fout opgetreden bij het genereren van het rapport'),
        isDiscussionActive: false
      }));
    }
  }, [state.session, language, onDiscussionComplete, t]);

  const handleBackToTopics = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      step: 'selectTopic',
      selectedTopic: undefined,
      selectedGoal: undefined,
      selectedRoles: [],
      session: undefined,
      report: undefined,
      error: undefined,
      isDiscussionActive: false
    }));
  }, []);

  const handleBackToConfiguration = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      step: 'configure',
      session: undefined,
      report: undefined,
      error: undefined,
      isDiscussionActive: false
    }));
  }, []);

  // Access control check
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-8 max-w-lg">
          <span className="text-cyan-500 dark:text-cyan-400 mb-4 mx-auto"><FiUsers size={48} /></span>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
            {t('aiDiscussionUpgradeRequired', 'Upgrade vereist voor AI Discussie')}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            {t('aiDiscussionUpgradeMessage', 'AI Discussie is beschikbaar voor Gold, Diamond en Enterprise gebruikers. Deze functionaliteit biedt multi-agent discussies met verschillende organisatierollen.')}
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-slate-700">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
              {t('aiDiscussionAvailableForTiers', 'Beschikbaar voor:')}
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700">
                🥇 Gold
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-700">
                💎 Diamond
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                🏢 Enterprise
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('aiDiscussionUpgradeNote', 'Upgrade je abonnement om toegang te krijgen tot deze geavanceerde AI functionaliteit.')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            {t('error', 'Er is een fout opgetreden')}
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4">
            {state.error}
          </p>
          <button
            onClick={handleBackToTopics}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('tryAgain', 'Opnieuw proberen')}
          </button>
        </div>
      </div>
    );
  }

  // Loading state: show only when this tab is generating (do NOT block on global isGenerating)
  if (state.step === 'generating') {
    return (
      <BlurredLoadingOverlay 
        isVisible={true}
        text={t('generatingTopics', 'Onderwerpen genereren...')}
      />
    );
  }

  // Topic selection
  if (state.step === 'selectTopic') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              {t('aiDiscussion.selectTopic', 'Selecteer een discussieonderwerp')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t('aiDiscussion.selectTopicDesc', 'Kies het onderwerp voor de AI discussie met verschillende organisatierollen')}
            </p>
          </div>
          <button
            onClick={refreshTopics}
            disabled={state.step === 'generating'}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw size={16} />
            {t('aiDiscussion.refreshTopics', 'Onderwerpen vernieuwen')}
          </button>
        </div>

        <div className="grid gap-4">
          {state.topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleTopicSelect(topic)}
              className="text-left p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                {topic.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {topic.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Configuration step
  if (state.step === 'configure') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackToTopics}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <FiArrowLeft size={16} />
            {t('aiDiscussion.backToTopics', 'Terug naar onderwerpen')}
          </button>
        </div>

        <div className="p-4 bg-yellow-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {t('aiDiscussion.rolesModeratorTitle', 'Rollen & gespreksleider')}
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {t('aiDiscussion.rolesModeratorHelp', 'Selecteer precies 4 rollen voor deze discussie. De eerste geselecteerde rol fungeert als gespreksleider (moderator): faciliteert de bespreking, stelt verhelderende vragen en vat samen. In de discussie UI wordt dit aangegeven met “(Gespreksleider)” achter de rolnaam.')}
          </p>
        </div>

        <AIDiscussionConfiguration
          t={t}
          selectedTopic={state.selectedTopic!}
          goals={DISCUSSION_GOALS}
          roles={ORGANIZATIONAL_ROLES}
          onConfigurationComplete={handleConfigurationComplete}
        />
      </div>
    );
  }

  // Discussion interface
  if (state.step === 'discussing') {
    return (
      <div className="space-y-6">
        {/* Global loader overlay for discussion generation */}
        <BlurredLoadingOverlay 
          isVisible={state.isDiscussionActive}
          text={t('aiDiscussion.generating', 'AI experts discussiëren...')}
        />
        
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToConfiguration}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <FiArrowLeft size={16} />
            {t('aiDiscussion.backToConfig', 'Terug naar configuratie')}
          </button>

          <div className="flex gap-4">
            <button
              onClick={handleContinueDiscussion}
              disabled={state.isDiscussionActive || !state.session || state.session.status !== 'active'}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <FiPlay size={18} />
              {t('aiDiscussion.continueDiscussion', 'Discussie voortzetten')}
            </button>

            <button
              onClick={handleGenerateReport}
              disabled={state.isDiscussionActive || !state.session || state.session.turns.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <FiFileText size={18} />
              {t('aiDiscussion.generateReport', 'Rapport genereren')}
            </button>
          </div>
        </div>

        {/* Enhanced Discussion progress indicator with all phases */}
        {state.session && state.session.turns.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t('aiDiscussion.turnProgress', 'Discussie voortgang')}:
              </span>
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {t('aiDiscussion.turnCount', 'Beurt {{count}}/10', { count: state.session.turns.length })}
              </span>
            </div>
            
            {/* Enhanced Phase indicator with all phases */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  {t('aiDiscussion.currentPhase', 'Huidige fase')}:
                </span>
                <span className="text-xs font-semibold text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                  {getPhaseDisplayName(state.session.turns[state.session.turns.length - 1].phase, t)}
                </span>
              </div>
              
              {/* Phase progress bar */}
              <div className="w-full bg-blue-100 dark:bg-blue-800 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, ((state.session.turns.length - 1) / 9) * 100)}%` }}
                />
              </div>
              
              {/* All phases overview - responsive design with descriptive titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                {[
                  'introduction', 'problem_analysis', 'root_cause', 'solution_generation',
                  'solution_evaluation', 'implementation_plan', 'risk_assessment', 
                  'stakeholder_analysis', 'conclusion', 'recommendations'
                ].map((phase, index) => {
                  const isCurrent = state.session!.turns[state.session!.turns.length - 1].phase === phase;
                  const isCompleted = index < state.session!.turns.length - 1;
                  const isUpcoming = index >= state.session!.turns.length;
                  
                  return (
                    <div 
                      key={phase}
                      className={`p-2 rounded text-center ${
                        isCurrent 
                          ? 'bg-blue-600 text-white font-medium border-2 border-blue-700' 
                          : isCompleted 
                            ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-600' 
                            : isUpcoming
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                              : 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600'
                      }`}
                      title={getPhaseDisplayName(phase as any, t)}
                    >
                      <div className="font-bold text-xs">{index + 1}</div>
                      <div className="mt-1 text-[10px] leading-tight">
                        {getPhaseDisplayName(phase as any, t)}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">
                {t('aiDiscussion.phaseProgress', 'Fase {{current}}/{{total}}', { 
                  current: state.session.turns.length, 
                  total: 10 
                })}
              </div>
            </div>
            
            {/* Overall progress bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  {t('aiDiscussion.overallProgress', 'Totale voortgang')}:
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {Math.min(100, (state.session.turns.length / 10) * 100)}%
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (state.session.turns.length / 10) * 100)}%` }}
                />
              </div>
            </div>
            
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">
              {state.session.turns.length >= 10 
                ? t('aiDiscussion.maxReached', 'Maximum aantal beurten bereikt - genereer een rapport')
                : t('aiDiscussion.canContinue', 'Je kunt de discussie voortzetten of een rapport genereren')
              }
            </p>
          </div>
        )}

        {state.session && (
          <MultiAgentDiscussionInterface
            t={t}
            session={state.session}
            isActive={state.isDiscussionActive}
            newTurnIds={state.newTurnIds}
          />
        )}

        {/* Action buttons placed under the discussion window */}
        {state.session && state.session.turns.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg">
            <div className="text-sm text-slate-600 dark:text-slate-400 text-center">
              {t('aiDiscussion.nextActions', 'Wat wil je nu doen?')}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleContinueDiscussion}
                disabled={state.isDiscussionActive || !state.session || state.session.status !== 'active' || state.session.turns.length >= 10}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <FiPlay size={18} />
                {t('aiDiscussion.continueDiscussion', 'Discussie voortzetten')}
              </button>

              <button
                onClick={handleGenerateReport}
                disabled={state.isDiscussionActive || !state.session || state.session.turns.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <FiFileText size={18} />
                {t('aiDiscussion.generateReport', 'Rapport genereren')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Report view
  if (state.step === 'report' && state.report) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBackToTopics}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <FiArrowLeft size={16} />
            {t('aiDiscussion.backToTopics', 'Nieuwe discussie')}
          </button>
        </div>

        <DiscussionReportPage
          t={t}
          report={state.report}
          session={state.session!}
        />
      </div>
    );
  }

  return null;
};

export default AIDiscussionTab;