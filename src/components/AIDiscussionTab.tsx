import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AIDiscussionTopic, AIDiscussionGoal, AIDiscussionRole, AIDiscussionSession, AIDiscussionReport, AIDiscussionMessage, SubscriptionTier, DiscussionStyleConfiguration, TranslationFunction } from '../../types';
import { FiUsers, FiArrowLeft, FiRefreshCw, FiFileText, FiPlay, FiPause, FiTarget, FiTool, FiCheckCircle, FiZap, FiShield, FiSettings } from 'react-icons/fi';
import { generateDiscussionTopics, startDiscussion, continueDiscussion, handleUserIntervention as handleUserInterventionService, generateDiscussionReport, generateDiscussionAnalytics } from '../services/aiDiscussionService';
import { displayToast } from '../utils/clipboard';
import { useTranslation } from '../hooks/useTranslation';
import { RateLimiter } from '../utils/debounce';
import { auth } from '../firebase';
import { getUserSubscriptionTier } from '../firebase';
import BlurredLoadingOverlay from './BlurredLoadingOverlay';
import AIDiscussionConfiguration from './AIDiscussionConfiguration';
import MultiAgentDiscussionInterface from './MultiAgentDiscussionInterface';
import DiscussionReportPage from './DiscussionReportPage';
import AIDiscussionAnalytics from './AIDiscussionAnalytics';
import DiscussionStyleModal from './DiscussionStyleModal';
import Modal from './Modal';

interface AIDiscussionTabProps {
  t: TranslationFunction;
  transcript: string;
  summary?: string;
  onDiscussionComplete: (report: AIDiscussionReport) => void;
  onMoveToTranscript?: (reportContent: string) => void;
  isGenerating?: boolean;
  language: string;
  userId: string;
  userTier: SubscriptionTier;
  // Scope cache to session to avoid stale topics when a new session starts
  sessionId?: string;
}

interface AIDiscussionState {
  step: 'generating' | 'selectTopic' | 'configure' | 'discussing' | 'analytics' | 'report';
  topics: AIDiscussionTopic[];
  selectedTopic?: AIDiscussionTopic;
  selectedGoal?: AIDiscussionGoal;
  selectedRoles: AIDiscussionRole[];
  discussionStyles: DiscussionStyleConfiguration;
  session?: AIDiscussionSession;
  report?: AIDiscussionReport;
  error?: string;
  isDiscussionActive: boolean;
  isGeneratingReport: boolean;
  newTurnIds: string[]; // Track IDs of turns added in the current round
  isStyleModalOpen: boolean;
  showReportConfirmationModal: boolean;
}

// Comprehensive discussion categories and goals as defined by user requirements
const getDiscussionCategories = (t: TranslationFunction) => ({
  vision: {
    id: 'vision',
    name: t('aiDiscussion.category.vision', 'Visie en Conceptvalidatie'),
    icon: FiTarget,
    goals: [
      {
        id: 'v1',
        name: t('aiDiscussion.goal.v1', 'Kernhypothese Valideren'),
        description: t('aiDiscussion.goal.v1Desc', 'Wat moet absoluut waar zijn om dit idee te laten slagen, en hoe testen we dat snel?'),
        icon: FiTarget
      },
      {
        id: 'v2', 
        name: t('aiDiscussion.goal.v2', 'Blue Sky Ideevorming'),
        description: t('aiDiscussion.goal.v2Desc', 'Verkennen van de meest ambitieuze en \'wildste\' versies van het idee.'),
        icon: FiZap
      },
      {
        id: 'v3',
        name: t('aiDiscussion.goal.v3', 'Minimale Levensvatbare Oplossing (MVP) Definitie'),
        description: t('aiDiscussion.goal.v3Desc', 'Wat is de kleinste, snelste versie die we kunnen bouwen om waarde te leveren?'),
        icon: FiCheckCircle
      },
      {
        id: 'v4',
        name: t('aiDiscussion.goal.v4', 'Scenario-ontwikkeling (Best & Worst Case)'),
        description: t('aiDiscussion.goal.v4Desc', 'Wat zijn de meest extreme succes- en faalscenario\'s en hoe reageren we?'),
        icon: FiShield
      },
      {
        id: 'v5',
        name: t('aiDiscussion.goal.v5', 'Kernwaarden en Merkpositionering'),
        description: t('aiDiscussion.goal.v5Desc', 'Welke emotie of probleem lossen we primair op en hoe vertalen we dit naar onze identiteit?'),
        icon: FiUsers
      }
    ]
  },
  lean: {
    id: 'lean',
    name: t('aiDiscussion.category.lean', 'Lean Financiën en Middelen'),
    icon: FiTool,
    goals: [
      {
        id: 'l1',
        name: t('aiDiscussion.goal.l1', 'Kosten-Slimme Realisatiepaden'),
        description: t('aiDiscussion.goal.l1Desc', 'Hoe kunnen we dit initiatief uitvoeren met minimale initiële investeringen (bootstrapping)?'),
        icon: FiTool
      },
      {
        id: 'l2',
        name: t('aiDiscussion.goal.l2', 'Mogelijke Inkomstenstromen'),
        description: t('aiDiscussion.goal.l2Desc', 'Brainstormen over alle mogelijke manieren om geld te verdienen (direct, indirect, data).'),
        icon: FiTarget
      },
      {
        id: 'l3',
        name: t('aiDiscussion.goal.l3', 'Efficiënt Gebruik van Huidige Middelen'),
        description: t('aiDiscussion.goal.l3Desc', 'Hoe kunnen we bestaande talenten, systemen of partners inzetten om kosten te besparen?'),
        icon: FiCheckCircle
      },
      {
        id: 'l4',
        name: t('aiDiscussion.goal.l4', 'Focus op Vroege Cashflow'),
        description: t('aiDiscussion.goal.l4Desc', 'Welke onderdelen van het idee kunnen het snelst geld opleveren om de rest te financieren?'),
        icon: FiZap
      },
      {
        id: 'l5',
        name: t('aiDiscussion.goal.l5', 'Resource Ruilhandel / Partnerships'),
        description: t('aiDiscussion.goal.l5Desc', 'Welke waarde kunnen we bieden aan partners in ruil voor hun middelen of expertise?'),
        icon: FiUsers
      }
    ]
  },
  execution: {
    id: 'execution',
    name: t('aiDiscussion.category.execution', 'Snelheid en Flexibele Uitvoering'),
    icon: FiZap,
    goals: [
      {
        id: 'u1',
        name: t('aiDiscussion.goal.u1', 'Prioritering van Features (Moet/Zou/Kan)'),
        description: t('aiDiscussion.goal.u1Desc', 'Bepalen welke functies cruciaal zijn voor de MVP en welke luxe zijn.'),
        icon: FiCheckCircle
      },
      {
        id: 'u2',
        name: t('aiDiscussion.goal.u2', 'Versnelling van de Tijdlijn'),
        description: t('aiDiscussion.goal.u2Desc', 'Hoe kunnen we de levering van de eerste versie met 30% versnellen?'),
        icon: FiZap
      },
      {
        id: 'u3',
        name: t('aiDiscussion.goal.u3', 'Afhankelijkheden Elimineren'),
        description: t('aiDiscussion.goal.u3Desc', 'Hoe maken we onszelf minder afhankelijk van trage of dure externe factoren?'),
        icon: FiShield
      },
      {
        id: 'u4',
        name: t('aiDiscussion.goal.u4', 'Operationele Simpliciteit'),
        description: t('aiDiscussion.goal.u4Desc', 'Hoe ontwerpen we het proces zo dat het met de minste inspanning schaalbaar is?'),
        icon: FiTool
      },
      {
        id: 'u5',
        name: t('aiDiscussion.goal.u5', 'Feedback Loop Design'),
        description: t('aiDiscussion.goal.u5Desc', 'Hoe creëren we het snelste en meest effectieve mechanisme om feedback van vroege gebruikers te verzamelen en te verwerken?'),
        icon: FiUsers
      }
    ]
  },
  people: {
    id: 'people',
    name: t('aiDiscussion.category.people', 'Mensen, Talent en Cultuur'),
    icon: FiUsers,
    goals: [
      {
        id: 'm1',
        name: t('aiDiscussion.goal.m1', 'Identificeren van Belangrijke Hiaten in Talent'),
        description: t('aiDiscussion.goal.m1Desc', 'Welke kritieke expertise missen we momenteel om dit te bouwen?'),
        icon: FiUsers
      },
      {
        id: 'm2',
        name: t('aiDiscussion.goal.m2', 'Aantrekken van Vroege Adoptanten (Intern & Extern)'),
        description: t('aiDiscussion.goal.m2Desc', 'Hoe maken we de eerste klanten/medewerkers enthousiast en bereid risico te nemen?'),
        icon: FiTarget
      },
      {
        id: 'm3',
        name: t('aiDiscussion.goal.m3', 'Kleine Team Structuur'),
        description: t('aiDiscussion.goal.m3Desc', 'Hoe stellen we het meest effectieve, compacte team samen voor de eerste 6 maanden?'),
        icon: FiCheckCircle
      },
      {
        id: 'm4',
        name: t('aiDiscussion.goal.m4', 'Verandering in Mindset Stimuleren'),
        description: t('aiDiscussion.goal.m4Desc', 'Hoe communiceren we dit idee om weerstand in de organisatie te verminderen en nieuwsgierigheid te wekken?'),
        icon: FiZap
      },
      {
        id: 'm5',
        name: t('aiDiscussion.goal.m5', 'Snel Beslissingskader'),
        description: t('aiDiscussion.goal.m5Desc', 'Hoe versnellen we de besluitvorming rond dit project?'),
        icon: FiTool
      }
    ]
  },
  market: {
    id: 'market',
    name: t('aiDiscussion.category.market', 'Markt en Adoptie'),
    icon: FiCheckCircle,
    goals: [
      {
        id: 'a1',
        name: t('aiDiscussion.goal.a1', 'Creatieve Oplossingen voor Juridische Kaders'),
        description: t('aiDiscussion.goal.a1Desc', 'Hoe kunnen we innovatief zijn binnen de bestaande wet- en regelgeving?'),
        icon: FiShield
      },
      {
        id: 'a2',
        name: t('aiDiscussion.goal.a2', 'Marketing met Nul Budget'),
        description: t('aiDiscussion.goal.a2Desc', 'Welke guerrillamarketing of virale strategieën kunnen we gebruiken?'),
        icon: FiZap
      },
      {
        id: 'a3',
        name: t('aiDiscussion.goal.a3', 'Concurrentievoordeel door Proces'),
        description: t('aiDiscussion.goal.a3Desc', 'Wat kunnen we beter of anders doen dan de concurrent, dat nauwelijks te kopiëren is?'),
        icon: FiTarget
      },
      {
        id: 'a4',
        name: t('aiDiscussion.goal.a4', 'Vroege Marktsegmentatie'),
        description: t('aiDiscussion.goal.a4Desc', 'Wie zijn de eerste 100 klanten die we absoluut willen winnen en waarom?'),
        icon: FiUsers
      },
      {
        id: 'a5',
        name: t('aiDiscussion.goal.a5', 'Integrale Innovatie-Analyse'),
        description: t('aiDiscussion.goal.a5Desc', 'Hoe kan dit idee elke afdeling helpen om innovatiever te zijn?'),
        icon: FiCheckCircle
      }
    ]
  }
});

// Create discussion goals array from all categories
const getDiscussionGoals = (t: TranslationFunction): AIDiscussionGoal[] => {
  const categories = getDiscussionCategories(t);
  return Object.values(categories).flatMap(category => 
    category.goals.map(goal => ({
      ...goal,
      category: category.id
    }))
  );
};

// Static organizational roles as defined in the technical architecture
// This will be initialized inside the component where 't' is available
const getOrganizationalRoles = (t: TranslationFunction): AIDiscussionRole[] => [
  // Leiderschap & Strategie
  {
    id: 'ceo',
    name: t('aiDiscussion.role.ceo', 'CEO'),
    description: t('aiDiscussion.role.ceoDesc', 'Chief Executive Officer - Focus op visie, marktleiderschap en lange termijn strategie'),
    focusArea: t('aiDiscussion.role.ceoFocus', 'Visie, marktleiderschap en lange termijn strategie'),
    category: 'leiding_strategie',
    promptTemplate: 'Als CEO focus ik op visie, marktleiderschap en lange termijn strategie. Ik benader vraagstukken vanuit een holistisch perspectief met focus op waardecreatie en stakeholder management.',
    enthusiasmLevel: 4
  },
  {
    id: 'cfo',
    name: t('aiDiscussion.role.cfo', 'CFO'),
    description: t('aiDiscussion.role.cfoDesc', 'Chief Financial Officer - Focus op budget, ROI, financiële risico\'s en schaalbaarheid'),
    focusArea: t('aiDiscussion.role.cfoFocus', 'Budget, ROI, financiële risico\'s en schaalbaarheid'),
    category: 'leiding_strategie',
    promptTemplate: 'Als CFO focus ik op budget, ROI, financiële risico\'s en schaalbaarheid. Ik benader vraagstukken vanuit financieel perspectief met focus op kostenbeheersing en winstgevendheid.',
    enthusiasmLevel: 2
  },
  {
    id: 'hr_hoofd',
    name: t('aiDiscussion.role.hr_hoofd', 'Hoofd HR & Cultuur'),
    description: t('aiDiscussion.role.hr_hoofdDesc', 'Focus op personeelsimpact, talentwerving en organisatieverandering'),
    focusArea: t('aiDiscussion.role.hr_hoofdFocus', 'Personeelsimpact, talentwerving en organisatieverandering'),
    category: 'leiding_strategie',
    promptTemplate: 'Als Hoofd HR & Cultuur focus ik op personeelsimpact, talentwerving en organisatieverandering. Ik benader vraagstukken vanuit menselijk perspectief met focus op engagement en cultuurontwikkeling.',
    enthusiasmLevel: 4
  },
  {
    id: 'juridisch_directeur',
    name: t('aiDiscussion.role.juridisch_directeur', 'Directeur Juridische Zaken'),
    description: t('aiDiscussion.role.juridisch_directeurDesc', 'Focus op compliance, wetgeving en ethische risico\'s'),
    focusArea: t('aiDiscussion.role.juridisch_directeurFocus', 'Compliance, wetgeving en ethische risico\'s'),
    category: 'leiding_strategie',
    promptTemplate: 'Als Directeur Juridische Zaken focus ik op compliance, wetgeving en ethische risico\'s. Ik benader vraagstukken vanuit juridisch perspectief met focus op regelgeving en risicobeheer.',
    enthusiasmLevel: 2
  },
  
  // Product & Markt
  {
    id: 'cpo',
    name: t('aiDiscussion.role.cpo', 'CPO'),
    description: t('aiDiscussion.role.cpoDesc', 'Chief Product Officer - Focus op productontwikkeling, user experience en roadmap'),
    focusArea: t('aiDiscussion.role.cpoFocus', 'Productontwikkeling, user experience en roadmap'),
    category: 'product_markt',
    promptTemplate: 'Als CPO focus ik op productontwikkeling, user experience en roadmap. Ik benader vraagstukken vanuit productperspectief met focus op gebruikerswaarde en marktfit.',
    enthusiasmLevel: 4
  },
  {
    id: 'marketing_specialist',
    name: t('aiDiscussion.role.marketing_specialist', 'Marketing Specialist'),
    description: t('aiDiscussion.role.marketing_specialistDesc', 'Focus op marktpositionering, klantsegmentatie en communicatie'),
    focusArea: t('aiDiscussion.role.marketing_specialistFocus', 'Marktpositionering, klantsegmentatie en communicatie'),
    category: 'product_markt',
    promptTemplate: 'Als Marketing Specialist focus ik op marktpositionering, klantsegmentatie en communicatie. Ik benader vraagstukken vanuit marketingperspectief met focus op merkwaarde en klantbereik.',
    enthusiasmLevel: 5
  },
  {
    id: 'verkoopdirecteur',
    name: t('aiDiscussion.role.verkoopdirecteur', 'Verkoopdirecteur'),
    description: t('aiDiscussion.role.verkoopdirecteurDesc', 'Focus op saleskanalen, omzetprognoses en klantacquisitie'),
    focusArea: t('aiDiscussion.role.verkoopdirecteurFocus', 'Saleskanalen, omzetprognoses en klantacquisitie'),
    category: 'product_markt',
    promptTemplate: 'Als Verkoopdirecteur focus ik op saleskanalen, omzetprognoses en klantacquisitie. Ik benader vraagstukken vanuit verkoopperspectief met focus op omzetgroei en klantrelaties.'
  },
  {
    id: 'customer_success',
    name: t('aiDiscussion.role.customer_success', 'Customer Success Lead'),
    description: t('aiDiscussion.role.customer_successDesc', 'Focus op klanttevredenheid, retentie en servicekwaliteit'),
    focusArea: t('aiDiscussion.role.customer_successFocus', 'Klanttevredenheid, retentie en servicekwaliteit'),
    category: 'product_markt',
    promptTemplate: 'Als Customer Success Lead focus ik op klanttevredenheid, retentie en servicekwaliteit. Ik benader vraagstukken vanuit klantperspectief met focus op loyaliteit en waarderealisatie.'
  },
  {
    id: 'product_owner',
    name: t('aiDiscussion.role.product_owner', 'Product Owner'),
    description: t('aiDiscussion.role.product_ownerDesc', 'Let op details, is alles duidelijk, is het met klanten afgestemd, past het in ons huidige product'),
    focusArea: t('aiDiscussion.role.product_ownerFocus', 'Productdetails, klantafstemming en productintegratie'),
    category: 'product_markt',
    promptTemplate: 'Als Product Owner let ik op details, zorg ik dat alles duidelijk is, dat het met klanten is afgestemd en dat het past in ons huidige product. Ik benader vraagstukken vanuit gebruikersperspectief met focus op functionaliteit en bruikbaarheid.'
  },
  
  // Techniek & Data
  {
    id: 'lead_architect',
    name: t('aiDiscussion.role.lead_architect', 'Lead IT Architect'),
    description: t('aiDiscussion.role.lead_architectDesc', 'Focus op technische infrastructuur, beveiliging en integratie'),
    focusArea: t('aiDiscussion.role.lead_architectFocus', 'Technische infrastructuur, beveiliging en integratie'),
    category: 'technologie',
    promptTemplate: 'Als Lead IT Architect focus ik op technische infrastructuur, beveiliging en integratie. Ik benader vraagstukken vanuit architecturaal perspectief met focus op schaalbaarheid en technische excellentie.'
  },
  {
    id: 'data_analist',
    name: t('aiDiscussion.role.data_analist', 'Data Analist'),
    description: t('aiDiscussion.role.data_analistDesc', 'Focus op meetbaarheid, datakwaliteit en inzichten'),
    focusArea: t('aiDiscussion.role.data_analistFocus', 'Meetbaarheid, datakwaliteit en inzichten'),
    category: 'technologie',
    promptTemplate: 'Als Data Analist focus ik op meetbaarheid, datakwaliteit en inzichten. Ik benader vraagstukken vanuit analytisch perspectief met focus op data-gedreven besluitvorming.'
  },
  {
    id: 'security_expert',
    name: t('aiDiscussion.role.security_expert', 'Security Expert'),
    description: t('aiDiscussion.role.security_expertDesc', 'Focus op dataveiligheid, privacy (AVG) en cyberrisico\'s'),
    focusArea: t('aiDiscussion.role.security_expertFocus', 'Dataveiligheid, privacy (AVG) en cyberrisico\'s'),
    category: 'technologie',
    promptTemplate: 'Als Security Expert focus ik op dataveiligheid, privacy (AVG) en cyberrisico\'s. Ik benader vraagstukken vanuit beveiligingsperspectief met focus op bescherming en compliance.'
  },
  {
    id: 'devops_engineer',
    name: t('aiDiscussion.role.devops_engineer', 'DevOps Engineer'),
    description: t('aiDiscussion.role.devops_engineerDesc', 'Focus op implementatiesnelheid, automatisering en operationele stabiliteit'),
    focusArea: t('aiDiscussion.role.devops_engineerFocus', 'Implementatiesnelheid, automatisering en operationele stabiliteit'),
    category: 'technologie',
    promptTemplate: 'Als DevOps Engineer focus ik op implementatiesnelheid, automatisering en operationele stabiliteit. Ik benader vraagstukken vanuit operationeel perspectief met focus op efficiency en betrouwbaarheid.'
  },
  
  // Operationeel
  {
    id: 'operationeel_manager',
    name: t('aiDiscussion.role.operationeel_manager', 'Operationeel Manager'),
    description: t('aiDiscussion.role.operationeel_managerDesc', 'Focus op efficiëntie, procesoptimalisatie en middelenbeheer'),
    focusArea: t('aiDiscussion.role.operationeel_managerFocus', 'Efficiëntie, procesoptimalisatie en middelenbeheer'),
    category: 'operaties',
    promptTemplate: 'Als Operationeel Manager focus ik op efficiëntie, procesoptimalisatie en middelenbeheer. Ik benader vraagstukken vanuit operationeel perspectief met focus op productiviteit en kostenbeheersing.'
  },
  {
    id: 'project_manager',
    name: t('aiDiscussion.role.project_manager', 'Project/Programma Manager'),
    description: t('aiDiscussion.role.project_managerDesc', 'Focus op planning, mijlpalen, scope management en levering'),
    focusArea: t('aiDiscussion.role.project_managerFocus', 'Planning, mijlpalen, scope management en levering'),
    category: 'operaties',
    promptTemplate: 'Als Project/Programma Manager focus ik op planning, mijlpalen, scope management en levering. Ik benader vraagstukken vanuit projectperspectief met focus op tijdige en succesvolle oplevering.'
  },
  {
    id: 'kwaliteitsmanager',
    name: t('aiDiscussion.role.kwaliteitsmanager', 'Kwaliteitsmanager'),
    description: t('aiDiscussion.role.kwaliteitsmanagerDesc', 'Focus op standaarden, auditprocedures en foutenreductie'),
    focusArea: t('aiDiscussion.role.kwaliteitsmanagerFocus', 'Standaarden, auditprocedures en foutenreductie'),
    category: 'operaties',
    promptTemplate: 'Als Kwaliteitsmanager focus ik op standaarden, auditprocedures en foutenreductie. Ik benader vraagstukken vanuit kwaliteitsperspectief met focus op excellentie en continue verbetering.'
  },
  
  // Innovatie & Toekomst
  {
    id: 'innovatie_manager',
    name: t('aiDiscussion.role.innovatie_manager', 'Innovatie Manager'),
    description: t('aiDiscussion.role.innovatie_managerDesc', 'Focus op nieuwe technologieën, experimenten en disruptie'),
    focusArea: t('aiDiscussion.role.innovatie_managerFocus', 'Nieuwe technologieën, experimenten en disruptie'),
    category: 'technologie',
    promptTemplate: 'Als Innovatie Manager focus ik op nieuwe technologieën, experimenten en disruptie. Ik benader vraagstukken vanuit innovatieperspectief met focus op toekomstmogelijkheden en doorbraken.'
  },
  {
    id: 'duurzaamheidsadviseur',
    name: t('aiDiscussion.role.duurzaamheidsadviseur', 'Duurzaamheidsadviseur'),
    description: t('aiDiscussion.role.duurzaamheidsadviseurDesc', 'Focus op ecologische en sociale impact (ESG)'),
    focusArea: t('aiDiscussion.role.duurzaamheidsadviseurFocus', 'Ecologische en sociale impact (ESG)'),
    category: 'externe_stakeholders',
    promptTemplate: 'Als Duurzaamheidsadviseur focus ik op ecologische en sociale impact (ESG). Ik benader vraagstukken vanuit duurzaamheidsperspectief met focus op maatschappelijke verantwoordelijkheid.'
  },
  {
    id: 'externe_consultant',
    name: t('aiDiscussion.role.externe_consultant', 'Externe Consultant (Neutraal)'),
    description: t('aiDiscussion.role.externe_consultantDesc', 'Focus op best practices, externe benchmarks en onafhankelijk advies'),
    focusArea: t('aiDiscussion.role.externe_consultantFocus', 'Best practices, externe benchmarks en onafhankelijk advies'),
    category: 'externe_stakeholders',
    promptTemplate: 'Als Externe Consultant focus ik op best practices, externe benchmarks en onafhankelijk advies. Ik benader vraagstukken vanuit neutraal perspectief met focus op objectieve analyse en marktinzichten.'
  },
  
  // Gebruiker & Controle
  {
    id: 'eindgebruiker',
    name: t('aiDiscussion.role.eindgebruiker', 'Eindgebruiker/Klantvertegenwoordiger'),
    description: t('aiDiscussion.role.eindgebruikerDesc', 'Focus op de daadwerkelijke behoeften en problemen van de gebruiker'),
    focusArea: t('aiDiscussion.role.eindgebruikerFocus', 'Daadwerkelijke behoeften en problemen van de gebruiker'),
    category: 'externe_stakeholders',
    promptTemplate: 'Als Eindgebruiker/Klantvertegenwoordiger focus ik op de daadwerkelijke behoeften en problemen van de gebruiker. Ik benader vraagstukken vanuit gebruikersperspectief met focus op praktische bruikbaarheid en waarde.'
  },
  {
    id: 'interne_auditor',
    name: t('aiDiscussion.role.interne_auditor', 'Interne Auditor'),
    description: t('aiDiscussion.role.interne_auditorDesc', 'Focus op risicobeheersing en naleving van interne beleidsregels'),
    focusArea: t('aiDiscussion.role.interne_auditorFocus', 'Risicobeheersing en naleving van interne beleidsregels'),
    category: 'operaties',
    promptTemplate: 'Als Interne Auditor focus ik op risicobeheersing en naleving van interne beleidsregels. Ik benader vraagstukken vanuit controleperspectief met focus op compliance en risicomitigatie.'
  },
  
  // Markt
  {
    id: 'invester',
    name: t('aiDiscussion.role.invester', 'De Invester'),
    description: t('aiDiscussion.role.investerDesc', 'Focus op kansen, kosten, winstgevendheid en time2market'),
    focusArea: t('aiDiscussion.role.investerFocus', 'Kansen, kosten, winstgevendheid en time2market'),
    category: 'marketing',
    promptTemplate: 'Als Invester focus ik op kansen, kosten, winstgevendheid en time2market. Ik benader vraagstukken vanuit investeringsperspectief met focus op rendement en marktpotentieel.'
  },
  {
    id: 'generaal',
    name: t('aiDiscussion.role.generaal', 'De Generaal'),
    description: t('aiDiscussion.role.generaalDesc', 'Wil structuur, is iedereen mee, neemt beslissing bij meerdere keuzes, knoop doorhakken'),
    focusArea: t('aiDiscussion.role.generaalFocus', 'Structuur, consensus en besluitvorming'),
    category: 'leiding_strategie',
    promptTemplate: 'Als Generaal wil ik structuur, zorg ik dat iedereen mee is, neem ik beslissingen bij meerdere keuzes en hak ik knopen door. Ik benader vraagstukken vanuit leiderschapsperspectief met focus op duidelijkheid en actie.'
  },
  {
    id: 'dromer',
    name: t('aiDiscussion.role.dromer', 'De Dromer'),
    description: t('aiDiscussion.role.dromerDesc', 'Denkt in onbegrensde mogelijkheden en genereert vergezichten. Focust op baanbrekende ideeën, toekomstige trends en disruptieve concepten, zonder rekening te houden met huidige beperkingen.'),
    focusArea: t('aiDiscussion.role.dromerFocus', 'Onbegrensde mogelijkheden en toekomstvisies'),
    category: 'leiding_strategie',
    promptTemplate: 'Als Dromer denk ik in onbegrensde mogelijkheden en genereer ik vergezichten. Ik focus op baanbrekende ideeën, toekomstige trends en disruptieve concepten, zonder rekening te houden met huidige beperkingen. Focus: Extreem forward-looking. Beschrijf een ideale, toekomstige staat gebaseerd op de onderliggende behoeften die in de transcriptie besproken worden, en stel radicale manieren voor om die te vervullen. Negeer huidige operationele of budgettaire restricties.'
  },
  {
    id: 'skeptische_advocaat',
    name: t('aiDiscussion.role.skeptische_advocaat', 'De Skeptische Advocaat'),
    description: t('aiDiscussion.role.skeptische_advocaatDesc', 'Zoekt actief naar zwakke punten, onuitgesproken aannames en potentiële valkuilen in besproken plannen of ideeën, om ze robuuster te maken.'),
    focusArea: t('aiDiscussion.role.skeptische_advocaatFocus', 'Kritische analyse en risicobewustzijn'),
    category: 'operaties',
    promptTemplate: 'Als Skeptische Advocaat van de Duivel zoek ik actief naar zwakke punten, onuitgesproken aannames en potentiële valkuilen in besproken plannen of ideeën, om ze robuuster te maken. Focus: Kritisch en risicobewust. Identificeer gaten, tegenargumenten, onrealistische aannames, en potentiële negatieve gevolgen van de besproken onderwerpen. Presenteer deze als uitdagingen om te overwinnen of te mitigeren.'
  },
  {
    id: 'gamification_architect',
    name: t('aiDiscussion.role.gamification_architect', 'De Gamification Architect'),
    description: t('aiDiscussion.role.gamification_architectDesc', 'Ontwerpt methoden om betrokkenheid en motivatie te verhogen door spelelementen, beloningsstructuren en interactieve uitdagingen toe te passen.'),
    focusArea: t('aiDiscussion.role.gamification_architectFocus', 'Betrokkenheid en motivatie door gamification'),
    category: 'product_markt',
    promptTemplate: 'Als Gamification Architect ontwerp ik methoden om betrokkenheid en motivatie te verhogen door spelelementen, beloningsstructuren en interactieve uitdagingen toe te passen. Focus: Betrokkenheid en motivatie. Neem een besproken proces, project of doel en stel spelelementen, scoresystemen, badges, leaderboards of uitdagingen voor om de participatie en het succes te stimuleren.'
  },
  {
    id: 'ethicus_impact_analist',
    name: t('aiDiscussion.role.ethicus_impact_analist', 'De Ethicus & Impact Analist'),
    description: t('aiDiscussion.role.ethicus_impact_analistDesc', 'Evalueert besproken plannen of initiatieven op hun ethische implicaties, maatschappelijke impact, privacy en potentiële onbedoelde gevolgen.'),
    focusArea: t('aiDiscussion.role.ethicus_impact_analistFocus', 'Ethische implicaties en maatschappelijke impact'),
    category: 'externe_stakeholders',
    promptTemplate: 'Als Ethicus & Impact Analist evalueer ik besproken plannen of initiatieven op hun ethische implicaties, maatschappelijke impact, privacy en potentiële onbedoelde gevolgen. Focus: Maatschappelijke verantwoordelijkheid. Analyseer de transcriptie op potentiële ethische dilemma\'s, privacyrisico\'s, sociale of ecologische impact, en onbedoelde neveneffecten van de besproken acties of producten. Stel oplossingen of overwegingen voor.'
  },
  {
    id: 'storyteller',
    name: t('aiDiscussion.role.storyteller', 'De Storyteller'),
    description: t('aiDiscussion.role.storytellerDesc', 'Vertaalt complexe informatie, strategieën of ideeën naar een boeiend verhaal dat resoneert met verschillende doelgroepen, om begrip en buy-in te creëren.'),
    focusArea: t('aiDiscussion.role.storytellerFocus', 'Verhaalvertelling en communicatie'),
    category: 'product_markt',
    promptTemplate: 'Als Storyteller vertaal ik complexe informatie, strategieën of ideeën naar een boeiend verhaal dat resoneert met verschillende doelgroepen, om begrip en buy-in te creëren. Focus: Begrijpelijkheid en emotionele connectie. Neem het user_selected_topic en de hoofdconclusies uit de transcriptie, en construeer een kort, overtuigend verhaal (bijv. een \'Elevator Pitch\', een \'Case Study Narrative\' of een \'Vision Story\') dat de essentie communiceert en de beoogde impact van een besproken idee/project beschrijft.'
  }
];

// Helper function to get display name for discussion phases
const getPhaseDisplayName = (phase: string, t: TranslationFunction): string => {
  const phaseNames: Record<string, string> = {
    introduction: t('aiDiscussion.phase.introduction'),
    problem_analysis: t('aiDiscussion.phase.problem_analysis'),
    root_cause: t('aiDiscussion.phase.root_cause'),
    solution_generation: t('aiDiscussion.phase.solution_generation'),
    solution_evaluation: t('aiDiscussion.phase.solution_evaluation'),
    critical_evaluation: t('aiDiscussion.phase.critical_evaluation'),
    implementation_plan: t('aiDiscussion.phase.implementation_plan'),
    risk_assessment: t('aiDiscussion.phase.risk_assessment'),
    stakeholder_analysis: t('aiDiscussion.phase.stakeholder_analysis'),
    implementation_planning: t('aiDiscussion.phase.implementation_planning'),
    success_metrics: t('aiDiscussion.phase.success_metrics'),
    conclusion: t('aiDiscussion.phase.conclusion'),
    recommendations: t('aiDiscussion.phase.recommendations'),
    synthesis: t('aiDiscussion.phase.synthesis')
  };
  
  return phaseNames[phase] || phase;
};

const AIDiscussionTab: React.FC<AIDiscussionTabProps> = ({
  t,
  transcript,
  summary,
  onDiscussionComplete,
  onMoveToTranscript,
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
    discussionStyles: {
      roleStyles: {},
      allowRuntimeAdjustment: true,
      defaultStyles: {}
    },
    error: undefined,
    isDiscussionActive: false,
    isGeneratingReport: false,
    newTurnIds: [],
    isStyleModalOpen: false,
    showReportConfirmationModal: false
  });

  // Rate limiter to prevent too frequent topic generation (minimum 3 seconds between calls)
  const rateLimiterRef = useRef(new RateLimiter(3000));
  const lastGenerationAttemptRef = useRef<number>(0);
  
  // Ref for auto-scrolling to top after step changes
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to top function
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    } else {
      // Fallback to window scroll
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }
  }, []);
  
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
      setState(prev => ({ ...prev, step: 'selectTopic', topics: [], error: t('aiDiscussion.topicGenerationError') }));
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
      
      let errorMessage = t('aiDiscussion.topicGenerationError');
      
      if (error instanceof Error) {
        const errorText = error.message.toLowerCase();
        
        if (errorText.includes('overloaded') || errorText.includes('503')) {
          errorMessage = t('aiDiscussion.serverOverloadError');
        } else if (errorText.includes('quota') || errorText.includes('rate limit')) {
          errorMessage = t('aiDiscussion.quotaExceededError');
        } else if (errorText.includes('network') || errorText.includes('fetch')) {
          errorMessage = t('aiDiscussion.networkError');
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
    // Auto-scroll to top after step change
    setTimeout(scrollToTop, 100);
  }, [scrollToTop]);

  const handleConfigurationComplete = useCallback(async (goal: AIDiscussionGoal, roles: AIDiscussionRole[], discussionStyles: DiscussionStyleConfiguration) => {
    if (!state.selectedTopic) return;

    // Handhaaf 2-4 AI-rollen en maak de eerste rol de gespreksleider
    const selectedRoles = roles.slice(0, 4);
    const rolesWithModerator: AIDiscussionRole[] = selectedRoles.map((r, idx) => (
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
        discussionStyles,
        step: 'discussing',
        isDiscussionActive: true,
        error: undefined
      }));
      
      // Auto-scroll to top after step change
      setTimeout(scrollToTop, 100);

      const session = await startDiscussion(state.selectedTopic, goal, rolesWithModerator, language, userId, userTier, discussionStyles);
      // Na de initiële AI-ronde: zet sessie in staat om gebruikersinterventie toe te laten
      const sessionAwaiting = {
        ...session,
        awaitingUserIntervention: true,
        status: 'awaiting_user_input' as const
      };
      setState(prev => ({
        ...prev,
        session: sessionAwaiting,
        error: undefined,
        isDiscussionActive: false,
        newTurnIds: [] // Reset new turn IDs wanneer een nieuwe sessie start
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

  // Style modal management functions
  const handleOpenStyleModal = useCallback(() => {
    setState(prev => ({ ...prev, isStyleModalOpen: true }));
  }, []);

  const handleCloseStyleModal = useCallback(() => {
    setState(prev => ({ ...prev, isStyleModalOpen: false }));
  }, []);

  const handleStylesUpdate = useCallback((newStyles: DiscussionStyleConfiguration) => {
    setState(prev => ({ 
      ...prev, 
      discussionStyles: newStyles,
      isStyleModalOpen: false
    }));
    
    // If there's an active session, update it with new styles
    if (state.session) {
      setState(prev => ({
        ...prev,
        session: prev.session ? {
          ...prev.session,
          discussionStyles: newStyles
        } : undefined
      }));
    }
  }, [state.session]);

  const handleContinueDiscussion = useCallback(async () => {
    if (!state.session) return;

    try {
      setState(prev => ({ ...prev, isDiscussionActive: true, error: undefined }));
      const newTurn = await continueDiscussion(state.session, userId, userTier);
      
      // Use functional update to ensure we're working with the latest state
      setState(prev => {
        if (!prev.session) return prev;
        
        // Check if this turn already exists to prevent duplicates - use timestamp and content for better detection
        const turnExists = prev.session.turns.some(turn => 
          turn.id === newTurn.id || 
          (turn.messages.length > 0 && newTurn.messages.length > 0 &&
           Math.abs(turn.messages[0].timestamp.getTime() - newTurn.messages[0].timestamp.getTime()) < 1000 &&
           turn.messages[0].content === newTurn.messages[0].content)
        );
        if (turnExists) {
          console.warn('Duplicate turn detected, skipping update');
          return { ...prev, isDiscussionActive: false, error: undefined };
        }
        
        // After each turn, check if we should pause for user intervention
        const updatedSession = { 
          ...prev.session, 
          turns: [...prev.session.turns, newTurn],
          awaitingUserIntervention: true,
          status: 'awaiting_user_input' as const
        };
        
        return { 
          ...prev, 
          session: updatedSession,
          isDiscussionActive: false,
          error: undefined,
          newTurnIds: [newTurn.id] // Track the new turn ID for highlighting
        };
      });
    } catch (error) {
      console.error('Error continuing discussion:', error);
      setState(prev => ({ 
        ...prev, 
        error: t('aiDiscussion.continueError'),
        isDiscussionActive: false
      }));
    }
  }, [state.session, t, userId, userTier]);

  // Handle user intervention
  const handleUserIntervention = useCallback(async (content: string, targetRoles: string[]) => {
    if (!state.session || !auth.currentUser?.email) return;

    // Guard: only allow user intervention when the session is awaiting user input
    if (state.session.status !== 'awaiting_user_input') {
      setState(prev => ({
        ...prev,
        error: t('aiDiscussion.notAwaitingUserInput'),
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isDiscussionActive: true, error: undefined }));
      
      // Get user name from email (part before @)
      const userName = auth.currentUser!.email!.split('@')[0];
      
      // Create user intervention message
      const userMessage: AIDiscussionMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content,
        timestamp: new Date(),
        isUserIntervention: true,
        targetRoles: targetRoles,
        userName: userName
      };

      // Handle user intervention with role responses using the correct service function
      // Note: The service function returns a new turn and mutates the original session
      const newTurn = await handleUserInterventionService(state.session, userMessage, userId, userTier);
      
      setState(prev => {
        if (!prev.session || !newTurn) return prev;

        // Force the session back into 'awaiting_user_input' so de gebruiker meerdere vragen na elkaar kan stellen
        const updatedSession: AIDiscussionSession = {
          ...prev.session,
          awaitingUserIntervention: true,
          status: 'awaiting_user_input'
        };

        return {
          ...prev,
          session: updatedSession,
          isDiscussionActive: false,
          error: undefined,
          newTurnIds: [newTurn.id]
        };
      });
      
    } catch (error) {
      console.error('Error handling user intervention:', error);
      setState(prev => ({ 
        ...prev, 
        error: t('aiDiscussion.interventionError'),
        isDiscussionActive: false
      }));
    }
  }, [state.session, userId, userTier, t]);

  // Handle role updates (e.g., enthusiasm level changes)
  const handleUpdateRole = useCallback((roleId: string, updates: Partial<AIDiscussionRole>) => {
    setState(prev => {
      if (!prev.session) return prev;

      const updatedRoles = prev.session.roles.map(role => 
        role.id === roleId ? { ...role, ...updates } : role
      );

      return {
        ...prev,
        session: {
          ...prev.session,
          roles: updatedRoles
        }
      };
    });
  }, []);

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

  // Show confirmation modal before generating report
  const handleGenerateReport = useCallback(() => {
    setState(prev => ({ ...prev, showReportConfirmationModal: true }));
  }, []);

  // Actually generate the report after confirmation
  const handleConfirmGenerateReport = useCallback(async () => {
    if (!state.session) return;

    try {
      setState(prev => ({ 
        ...prev, 
        showReportConfirmationModal: false,
        isGeneratingReport: true, 
        error: undefined,
        session: prev.session ? { ...prev.session, status: 'completed' } : prev.session
      }));
      
      const report = await generateDiscussionReport(state.session, language, userId, userTier);
      
      setState(prev => ({ 
        ...prev, 
        report,
        step: 'report',
        isGeneratingReport: false,
        error: undefined 
      }));
      
      // Auto-scroll to top after step change
      setTimeout(scrollToTop, 100);

      onDiscussionComplete(report);
    } catch (error) {
      console.error('Error generating report:', error);
      setState(prev => ({ 
        ...prev, 
        error: t('aiDiscussion.reportError', 'Er is een fout opgetreden bij het genereren van het rapport'),
        isGeneratingReport: false,
        showReportConfirmationModal: false
      }));
    }
  }, [state.session, language, onDiscussionComplete, t, userId, userTier, scrollToTop]);

  // Cancel report generation
  const handleCancelGenerateReport = useCallback(() => {
    setState(prev => ({ ...prev, showReportConfirmationModal: false }));
  }, []);

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
    
    // Auto-scroll to top after step change
    setTimeout(scrollToTop, 100);
  }, [scrollToTop]);

  const handleBackToConfiguration = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      step: 'configure',
      session: undefined,
      report: undefined,
      error: undefined,
      isDiscussionActive: false
    }));
    
    // Auto-scroll to top after step change
    setTimeout(scrollToTop, 100);
  }, [scrollToTop]);

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
      <div ref={containerRef} className="space-y-6">
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
            disabled={false}
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
      <div ref={containerRef} className="space-y-6">
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
          goals={getDiscussionGoals(t)}
          roles={getOrganizationalRoles(t)}
          language={language}
          onConfigurationComplete={handleConfigurationComplete}
        />
      </div>
    );
  }

  // Discussion interface
  if (state.step === 'discussing') {
    return (
      <div ref={containerRef} className="space-y-6">
        {/* Global loader overlay for discussion generation */}
        <BlurredLoadingOverlay 
          isVisible={state.isDiscussionActive}
          text={t('aiDiscussion.generating', 'AI experts discussiëren...')}
        />
        
        {/* Global loader overlay for report generation */}
        <BlurredLoadingOverlay 
          isVisible={state.isGeneratingReport}
          text={t('aiDiscussionReportGenerating', 'Rapport wordt gegenereerd...')}
        />
        
        <div className="flex justify-start mb-6">
          <button
            onClick={handleBackToConfiguration}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors w-fit"
          >
            <FiArrowLeft size={16} />
            {t('aiDiscussion.backToConfig', 'Terug naar configuratie')}
          </button>
        </div>

        {/* Enhanced Discussion progress indicator with all phases */}
        {state.session && state.session.turns.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                {t('aiDiscussion.turnProgress', 'Discussie voortgang')}:
              </span>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm text-green-600 dark:text-green-400">
                  {t('aiDiscussion.turnCount', 'Beurt {{count}}/10', { count: state.session.actualTurnNumber || 0 })}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {t('aiDiscussion.interventionCount', 'Vragen: {{count}}/5', { count: state.session.userInterventionCount || 0 })}
                </span>
              </div>
            </div>
            
            {/* Enhanced Phase indicator with all phases */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  {t('aiDiscussion.currentPhase', 'Huidige fase')}:
                </span>
                <span className="text-xs font-semibold text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                  {getPhaseDisplayName(state.session.turns[state.session.turns.length - 1].phase, t)}
                </span>
              </div>
              
              {/* Phase progress bar */}
              <div className="w-full bg-green-100 dark:bg-green-800 rounded-full h-2 mb-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, ((state.session.turns.length - 1) / 9) * 100)}%` }}
                />
              </div>
              
              {/* All phases overview - responsive design with descriptive titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-sm">
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
                          ? 'bg-green-600 text-white font-medium border-2 border-green-700' 
                          : isCompleted 
                            ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-600' 
                            : isUpcoming
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                              : 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-600'
                      }`}
                      title={getPhaseDisplayName(phase as any, t)}
                    >
                      <div className="font-bold text-sm">{index + 1}</div>
                      <div className="mt-1 text-xs leading-tight">
                        {getPhaseDisplayName(phase as any, t)}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="text-sm text-green-600 dark:text-green-400 mt-2 text-center">
                  {t(
                    'aiDiscussion.phaseProgress',
                    `Fase ${state.session.turns.length}/10`,
                    { current: state.session.turns.length, total: 10 }
                  )}
              </div>
            </div>
            
            {/* Overall progress bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {t('aiDiscussion.overallProgress', 'Totale voortgang')}:
                </span>
                <span className="text-sm text-green-600 dark:text-green-400">
                  {Math.min(100, (state.session.turns.length / 10) * 100)}%
                </span>
              </div>
              <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (state.session.turns.length / 10) * 100)}%` }}
                />
              </div>
            </div>
            
            <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-center">
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
              onUserIntervention={handleUserIntervention}
            />
        )}

        {/* Action buttons placed under the discussion window */}
        {state.session && state.session.turns.length > 0 && (
          <div className="flex flex-col gap-4 justify-center items-center p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg">
              <div className="text-base text-slate-600 dark:text-slate-400 text-center">
                {t('aiDiscussion.nextActions', 'Wat wil je nu doen?')}
              </div>

            {/* New order: Continue, Analytics, Styles, End Discussion/Generate Report */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleContinueDiscussion}
                disabled={state.isDiscussionActive || !state.session || (state.session.status !== 'active' && state.session.status !== 'awaiting_user_input') || (state.session.actualTurnNumber || 0) >= 10}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-base"
              >
                <FiPlay size={18} />
                <span className="truncate">{t('aiDiscussion.continueDiscussion', 'Discussie voortzetten')}</span>
              </button>

              <button
                onClick={() => setState(prev => ({ ...prev, step: 'analytics' }))}
                disabled={state.isDiscussionActive || !state.session || state.session.turns.length === 0}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-base"
              >
                <FiTarget size={18} />
                <span className="truncate">{t('aiDiscussion.viewAnalytics', 'Analytics bekijken')}</span>
              </button>

              <button
                onClick={handleOpenStyleModal}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-medium text-base"
                title={t('aiDiscussion.adjustStyles', 'Discussiestijlen aanpassen')}
              >
                <FiSettings size={18} />
                {t('aiDiscussion.adjustStyles', 'Stijlen Aanpassen')}
              </button>

              <button
                onClick={handleGenerateReport}
                disabled={state.isDiscussionActive || state.isGeneratingReport || !state.session || state.session.turns.length === 0}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-base"
              >
                <FiFileText size={18} />
                <span className="truncate">{t('aiDiscussion.generateReport', 'Einde discussie / Rapport genereren')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Style Modal */}
        <DiscussionStyleModal
          isOpen={state.isStyleModalOpen}
          onClose={handleCloseStyleModal}
          onStylesUpdate={handleStylesUpdate}
          currentStyles={state.discussionStyles}
          selectedRoles={state.selectedRoles}
          onRoleUpdate={handleUpdateRole}
          t={t}
          language={language}
        />

        {/* Report Confirmation Modal (also available in 'discussing' view) */}
        <Modal
          isOpen={state.showReportConfirmationModal}
          onClose={handleCancelGenerateReport}
          title={t('aiDiscussion.endDiscussionTitle', 'Einde discussie / Rapport genereren')}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiFileText size={14} />
              </div>
              <div>
                <h4 className="text-slate-800 dark:text-slate-200 font-medium">
                  {t('aiDiscussion.confirmGenerateReportTitle', 'Rapport genereren en discussie beëindigen?')}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  {t('aiDiscussion.confirmGenerateReportDescription', 'Wanneer je een rapport genereert, wordt de discussie afgesloten. Je ontvangt een overzicht van de belangrijkste punten, meningsverschillen, aanbevelingen en de volledige transcriptie.')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleCancelGenerateReport}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t('common.cancel', 'Annuleren')}
              </button>
              <button
                onClick={handleConfirmGenerateReport}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2"
              >
                <FiFileText size={16} />
                {t('common.ok', 'OK')}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // Analytics view
  if (state.step === 'analytics' && state.session) {
    const analytics = generateDiscussionAnalytics(state.session);
    
    return (
      <div ref={containerRef} className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setState(prev => ({ ...prev, step: 'discussing' }))}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <FiArrowLeft size={16} />
            {t('aiDiscussion.backToDiscussion', 'Terug naar discussie')}
          </button>
        </div>

        <AIDiscussionAnalytics
          t={t}
          session={state.session}
        />
      </div>
    );
  }

  // Report view
  if (state.step === 'report' && state.report) {
    return (
      <div ref={containerRef} className="space-y-6">
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
          onMoveToTranscript={onMoveToTranscript}
        />
        
        {/* Style Modal */}
        <DiscussionStyleModal
          isOpen={state.isStyleModalOpen}
          onClose={handleCloseStyleModal}
          onStylesUpdate={handleStylesUpdate}
          currentStyles={state.discussionStyles}
          selectedRoles={state.selectedRoles}
          t={t}
          language={language}
        />

        {/* Report Confirmation Modal */}
        <Modal
          isOpen={state.showReportConfirmationModal}
          onClose={handleCancelGenerateReport}
          title={t('aiDiscussion.endDiscussionTitle', 'Einde discussie / Rapport genereren')}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <span className="w-4 h-4 text-amber-600 dark:text-amber-400">
                  <FiFileText size={16} />
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Discussie beëindigen en rapport genereren?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Door het rapport te genereren wordt de huidige discussie beëindigd. Je kunt daarna geen nieuwe berichten meer toevoegen aan deze discussie.
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Let op:</strong> Deze actie kan niet ongedaan worden gemaakt. Zorg ervoor dat de discussie compleet is voordat je doorgaat.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleCancelGenerateReport}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t('common.cancel', 'Annuleren')}
              </button>
              <button
                onClick={handleConfirmGenerateReport}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2"
              >
                <FiFileText size={16} />
                {t('common.ok', 'OK')}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return null;
};

export default AIDiscussionTab;