import type { FieldValue } from 'firebase/firestore';

export type TranslationFunction = (
  key: string,
  fallbackOrParams?: string | Record<string, any>,
  maybeParams?: Record<string, any>
) => any;

export enum RecordingStatus {
  IDLE = 'IDLE',
  GETTING_PERMISSION = 'GETTING_PERMISSION',
  RECORDING = 'RECORDING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  TRANSCRIBING = 'TRANSCRIBING',
  SUMMARIZING = 'SUMMARIZING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}

// Subscription tiers
export enum SubscriptionTier {
  FREE = 'free',
  SILVER = 'silver',
  GOLD = 'gold',
  ENTERPRISE = 'enterprise',
  DIAMOND = 'diamond'
}

// Session types
export enum SessionType {
  AUDIO_RECORDING = 'audio_recording',
  FILE_UPLOAD = 'file_upload',
  EMAIL_IMPORT = 'email_import'
}

// Usage limits per tier
export interface TierLimits {
  maxSessionDuration: number; // in minutes
  maxSessionsPerDay: number; // -1 for unlimited
  maxTranscriptLength: number; // in characters, -1 for unlimited
  allowedFileTypes: string[];
  maxTokensPerMonth: number; // -1 for unlimited
  maxTokensPerDay: number; // -1 for unlimited
  maxMonthlyAudioMinutes?: number; // in minutes, -1 for unlimited
  trialDurationDays?: number; // only for free tier
}

// User subscription information
export interface UserSubscription {
  tier: SubscriptionTier;
  startDate: Date;
  endDate?: Date;
  trialEndDate?: Date; // for FREE tier trial period
  isActive: boolean;
  autoRenew: boolean;
  isTrialExpired?: boolean; // indicates if trial period has ended
  // Stripe integration fields
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  nextBillingDate?: Date;
  currentSubscriptionStartDate?: Date;
  currentSubscriptionStatus: 'active' | 'past_due' | 'cancelled' | 'expired';
  scheduledTierChange?: {
    tier: SubscriptionTier;
    effectiveDate: Date;
    action: 'downgrade' | 'cancel';
  };
}

// Session tracking
export interface UserSession {
  id: string;
  userId: string;
  type: SessionType;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  fileType?: string; // for uploads
  status: 'active' | 'completed' | 'failed';
}

// Minimal interface to satisfy SpeechRecognition API usage in App.tsx
export interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: Event) => void;
  onerror: (event: Event) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

export interface SurveyQuestions {
  yesNoQuestions: string[];
  agreeDisagreeQuestions: {
    text: string;
    scale: string;
  }[];
}

// Quiz question interface
export interface QuizQuestion {
  question: string;
  options: {
    label: string;
    text: string;
  }[];
  correct_answer_label: string;
  correct_answer_text: string;
}

export interface QuizSettings {
  numberOfQuestions: number;
  includeAnswers: boolean;
}

// Executive Summary interface
export interface ExecutiveSummaryData {
  objective: string;
  situation: string;
  complication: string;
  resolution: string;
  benefits: string;
  call_to_action: string;
}

// Storytelling interface
export interface StorytellingData {
  story: string;
}

// Storytelling options interface
export interface StorytellingOptions {
  targetAudience: string;
  mainGoal: string;
  toneStyle: string;
  length: string;
}

// Summary options interface
export interface SummaryOptions {
  format: string;
  targetAudience: string;
  toneStyle: string;
  length: string;
  mainGoal: string;
}

// Business Case interface
export interface BusinessCaseData {
  businessCaseType: string;
  targetAudience?: string;
  length?: 'concise' | 'extensive' | 'very_extensive';
  businessCase: string;
}

// Keyword topic interface
export interface KeywordTopic {
  topic: string;
  keywords: string[];
}

// Sentiment analysis result interface
export interface SentimentAnalysisResult {
  summary: string;
  conclusion: string;
}

// Chat message interface
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Chat role type
export type ChatRole = 'user' | 'model';

// Token usage tracking
export interface TokenUsage {
  userId: string;
  date: string; // YYYY-MM-DD format
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  lastUpdated: Date;
}

// User preferences
export interface UserPreferences {
  userId: string;
  sessionLanguage: string; // Now supports all language codes
  outputLanguage: string; // Now supports all language codes
  aiProvider?: string; // AI provider preference for Diamond/Enterprise users
  createdAt: Date;
  updatedAt: Date;
}

// Explain interface
export interface ExplainData {
  complexityLevel: string;
  focusArea: string;
  format: string;
  explanation: string;
}

// Explain options interface
export interface ExplainOptions {
  complexityLevel: string;
  focusArea: string;
  format: string;
}

// TeachMe interfaces
export interface TeachMeTopic {
  id: string;
  title: string;
  description: string;
}

export interface TeachMeMethod {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export interface TeachMeData {
  topic: TeachMeTopic;
  method: TeachMeMethod;
  content: string;
}

// ShowMe interfaces
export interface TedTalk {
  title: string;
  speaker: string;
  description: string;
  url: string;
  relevanceRating: number; // 1-5 stars (including half stars like 4.5)
}

export interface NewsArticle {
  title: string;
  author: string;
  publication: string;
  description: string;
  url: string;
  relevanceRating: number; // 1-5 stars (including half stars like 4.5)
}

export interface ShowMeData {
  topic: TeachMeTopic;
  tedTalks: TedTalk[];
  newsArticles: NewsArticle[];
}

// Email options interface
export interface EmailOptions {
  tone: string;
  length: string;
}

// Social media post options interface
export interface SocialPostOptions {
  platform: 'X / BlueSky' | 'LinkedIn' | 'Facebook' | 'Instagram';
  tone: 'professional' | 'friendly' | 'enthusiastic' | 'informative' | 'humor' | 'factual';
  length: 'short' | 'medium' | 'long';
  includeHashtags: boolean;
  includeEmoticons: boolean;
  postCount: number;
}

export interface SocialPostData {
  post: string | string[];
  timestamp?: string;
  imageInstructions?: string;
  platform?: 'X / BlueSky' | 'LinkedIn' | 'Facebook' | 'Instagram' | 'Generic';
}

// Ask the Expert interfaces
export interface ExpertTopic {
  id: string;
  name: string;
  description?: string;
}

export interface ExpertRole {
  id: string;
  name: string;
  description: string;
}

export interface ExpertBranche {
  id: string;
  name: string;
  description?: string;
}

export interface ExpertConfiguration {
  topic: ExpertTopic;
  role: ExpertRole;
  branche: ExpertBranche;
}

export interface ExpertChatMessage {
  id: string;
  role: 'user' | 'expert';
  content: string;
  timestamp: Date;
}

export interface ExpertChatSession {
  id: string;
  configuration: ExpertConfiguration;
  messages: ExpertChatMessage[];
  suggestedFollowUp?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Stripe-related interfaces
export interface StripePricingTier {
  id: string;
  tier: SubscriptionTier;
  billingCycle: 'monthly' | 'annual';
  priceEur: number;
  stripeProductId: string;
  stripePriceId: string;
  effectiveDate: Date;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StripeWebhookLog {
  id: string;
  eventId: string;
  eventType: string;
  processed: boolean;
  processingError?: string;
  rawData: Record<string, any>;
  createdAt: Date;
  processedAt?: Date;
}

// Thinking Partner interfaces
export interface ThinkingTopic {
  id: string;
  title: string;
  description: string; // max 90 characters
}

export interface ThinkingPartner {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  category: 'analysis' | 'decision' | 'structure' | 'insight';
}

export interface ThinkingAnalysisData {
  topic: ThinkingTopic;
  partner: ThinkingPartner;
  constructedPrompt: string;
  aiResponse: string;
  timestamp: Date;
}

// AI Discussion interfaces
export interface AIDiscussionTopic {
  id: string;
  title: string;
  description: string;
}

export interface AIDiscussionGoal {
  id: string;
  name: string;
  description: string;
  icon: any; // React icon component
  category: string; // Category for filtering goals
}

export interface AIDiscussionRole {
  id: string;
  name: string;
  description: string;
  focusArea: string;
  category: 'leiding_strategie' | 'product_markt' | 'technologie' | 'operaties' | 'marketing' | 'externe_stakeholders';
  promptTemplate: string;
  enthusiasmLevel?: number; // Schaal 1-5 (1 = pessimistisch, 5 = super enthousiast)
  color?: string; // CSS color class for UI styling
}

export interface AIDiscussionMessage {
  id: string;
  role: string; // role id of the participant who authored the message
  content: string;
  timestamp: Date;
  votes?: AIDiscussionVote[]; // votes received on this message
  votingPrompt?: AIDiscussionVotingPrompt; // if this message contains a voting prompt
  isUserIntervention?: boolean; // indicates if this is a user intervention message
  targetRoles?: string[]; // for user interventions: which roles should respond (empty = all roles)
  userName?: string; // for user interventions: display name (email prefix)
}

export interface AIDiscussionVote {
  id: string;
  voterId: string; // role id of the voter
  messageId: string; // message being voted on
  voteType: 'agree' | 'disagree' | 'neutral' | 'option_a' | 'option_b' | 'option_c';
  reasoning?: string; // optional explanation for the vote
  timestamp: Date;
}

export interface AIDiscussionVotingPrompt {
  id: string;
  question: string;
  options: AIDiscussionVotingOption[];
  voteType: 'agreement' | 'multiple_choice' | 'ranking';
  deadline?: Date; // optional voting deadline
  isActive: boolean;
}

export interface AIDiscussionVotingOption {
  id: string;
  label: string;
  description: string;
  votes: number; // vote count for this option
}

export type DiscussionPhase = 
  | 'introduction'
  | 'problem_analysis'
  | 'root_cause'
  | 'stakeholder_perspective'
  | 'solution_generation'
  | 'critical_evaluation'
  | 'risk_assessment'
  | 'implementation_planning'
  | 'success_metrics'
  | 'synthesis';

export interface AIDiscussionTurn {
  id: string;
  turnNumber: number;
  phase: DiscussionPhase;
  messages: AIDiscussionMessage[];
  timestamp: Date;
}

export interface AIDiscussionSession {
  id: string;
  topic: AIDiscussionTopic;
  goal: AIDiscussionGoal;
  roles: AIDiscussionRole[];
  turns: AIDiscussionTurn[];
  status: 'active' | 'completed' | 'cancelled' | 'configuring' | 'awaiting_user_input';
  createdAt: Date;
  language: string;
  discussionStyles?: DiscussionStyleConfiguration; // optional discussion style configuration
  awaitingUserIntervention?: boolean; // indicates if the discussion is paused for user input
  userEmail?: string; // user's email for displaying name in interventions
  userInterventionCount?: number; // tracks number of user interventions (max 5)
  actualTurnNumber?: number; // tracks actual discussion turns (excluding user interventions)
}

export interface AIDiscussionReport {
  id: string;
  sessionId: string;
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  fullTranscript: string;
  generatedAt: Date;
  analytics?: AIDiscussionAnalytics; // optional analytics data
}

export interface AIDiscussionAnalytics {
  id: string;
  sessionId: string;
  roleActivity: RoleActivityMetrics[];
  controversialTopics: ControversialTopic[];
  votingResults: VotingResults[];
  discussionFlow: DiscussionFlowMetrics;
  engagementMetrics: EngagementMetrics;
  generatedAt: Date;
  // Additional properties for component compatibility
  totalTurns: number;
  totalMessages: number;
  averageResponseLength: number;
  userInterventions: number;
  discussionDuration: number; // in milliseconds
  mostActiveRole: {
    name: string;
    messageCount: number;
  } | null;
}

export interface RoleActivityMetrics {
  roleId: string;
  roleName: string;
  messageCount: number;
  wordCount: number;
  averageMessageLength: number;
  participationPercentage: number;
  influenceScore: number; // based on votes received and responses generated
  topTopics: string[]; // most discussed topics by this role
}

export interface ControversialTopic {
  id: string;
  topic: string;
  disagreementLevel: number; // 0-100 scale
  controversyLevel: number; // alias for disagreementLevel for component compatibility
  description: string;
  differentPerspectives: Array<{
    roleName: string;
    viewpoint: string;
  }>;
  involvedRoles: string[];
  keyPoints: string[];
  votingResults?: VotingResults;
}

export interface VotingResults {
  promptId: string;
  question: string;
  totalVotes: number;
  votesFor: number; // votes in favor
  votesAgainst: number; // votes against
  results: VotingOptionResult[];
  consensus: boolean; // whether there was clear agreement
  controversyLevel: number; // 0-100 scale
}

export interface VotingOptionResult {
  optionId: string;
  label: string;
  voteCount: number;
  percentage: number;
  voterRoles: string[];
}

export interface DiscussionFlowMetrics {
  totalTurns: number;
  averageResponseTime: number; // simulated metric
  topicTransitions: TopicTransition[];
  phaseEffectiveness: PhaseEffectiveness[];
}

export interface TopicTransition {
  fromTopic: string;
  toTopic: string;
  frequency: number;
  triggeringRole: string;
}

export interface PhaseEffectiveness {
  phase: DiscussionPhase;
  messageCount: number;
  engagementLevel: number;
  keyOutcomes: string[];
}

export interface EngagementMetrics {
  overallEngagement: number; // 0-100 scale
  roleEngagement: { [roleId: string]: number };
  peakEngagementTurn: number;
  engagementTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface AIDiscussionState {
  step: 'selectTopic' | 'selectGoal' | 'selectRoles' | 'configure' | 'discussing' | 'analytics' | 'report' | 'completed';
  topics: AIDiscussionTopic[];
  selectedTopic?: AIDiscussionTopic;
  selectedGoal?: AIDiscussionGoal;
  selectedRoles: AIDiscussionRole[];
  discussionStyles?: DiscussionStyleConfiguration;
  currentSession?: AIDiscussionSession;
  session?: AIDiscussionSession; // alias for currentSession
  report?: AIDiscussionReport;
  isLoading: boolean;
  error?: string;
}

// Extended user document interface for database
export interface UserDocument {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isAdmin?: boolean;
  lastLogin?: Date;
  subscriptionTier: SubscriptionTier;
  currentSubscriptionStatus: 'active' | 'past_due' | 'cancelled' | 'expired';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  nextBillingDate?: Date;
  currentSubscriptionStartDate?: Date;
  scheduledTierChange?: {
    tier: SubscriptionTier;
    effectiveDate: Date;
    action: 'downgrade' | 'cancel';
  };
  // Usage tracking fields (existing)
  dailyAudioCount: number;
  dailyUploadCount: number;
  lastDailyUsageDate: string;
  monthlyInputTokens: number;
  monthlyOutputTokens: number;
  monthlySessionsCount: number;
  tokensMonth: string;
  sessionsMonth: string;
  // Monthly audio recording limits
  monthlyAudioMinutes: number;
  audioMinutesMonth: string; // YYYY-MM format for tracking month
  lastAudioResetDate: Date;
}

// Interface for creating users with FieldValue support for timestamps
export interface UserDocumentCreate {
  email: string;
  createdAt: Date | FieldValue;
  updatedAt: Date | FieldValue;
  isActive: boolean;
  isAdmin?: boolean;
  lastLogin?: Date | FieldValue;
  subscriptionTier?: SubscriptionTier;
  currentSubscriptionStatus?: 'active' | 'past_due' | 'cancelled' | 'expired';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  nextBillingDate?: Date | FieldValue;
  currentSubscriptionStartDate?: Date | FieldValue;
  scheduledTierChange?: {
    tier: SubscriptionTier;
    effectiveDate: Date | FieldValue;
    action: 'downgrade' | 'cancel';
  };
  // Usage tracking fields (existing)
  dailyAudioCount?: number;
  dailyUploadCount?: number;
  lastDailyUsageDate?: string;
  monthlyInputTokens?: number;
  monthlyOutputTokens?: number;
  monthlySessionsCount?: number;
  tokensMonth?: string;
  sessionsMonth?: string;
  // Monthly audio recording limits
  monthlyAudioMinutes?: number;
  audioMinutesMonth?: string; // YYYY-MM format for tracking month
  lastAudioResetDate?: Date | FieldValue;
  sessionCount?: number;
  referrerCode?: string;
}

// McKinsey analysis interfaces
export enum McKinseyFramework {
  ThreeC = '3C',
  SevenS = '7S',
  CustomerLifecycle = 'CustomerLifecycle',
  ValueChain = 'ValueChain',
  ForceField = 'ForceField',
  CoreCompetencies = 'CoreCompetencies',
  ScenarioPlanning = 'ScenarioPlanning',
  PESTEL = 'PESTEL',
  PortersFiveForces = 'PortersFiveForces',
  AnsoffMatrix = 'AnsoffMatrix'
}

export interface McKinseyTopic {
  id: string;
  title: string;
  description: string;
  context?: string;
  businessImpact?: string;
  complexity?: string;
}

export interface McKinseyOptions {
  framework: McKinseyFramework;
  roleId?: string; // optional role reference (reused from opportunities roles or custom)
  language?: string; // output language code
}

// Generic section shape for reports
export interface McKinseyReportSection {
  name: string; // e.g., 'Company', 'Customers', 'Competitors' or 'Strategy', 'Structure', etc.
  content: string;
}

// Unified analysis payload for McKinsey feature
export interface McKinseyAnalysisData {
  topic: McKinseyTopic;
  framework: McKinseyFramework;
  roleId: string; // consultant role identifier
  analysis: string; // full analysis text
  constructedPrompt?: string; // actual prompt sent to AI
  sections?: McKinseyReportSection[]; // optional structured sections when available
  roleName?: string; // optional human-readable role name
  timestamp: Date;
}

// Discussion Style Types
export interface DiscussionStyleOption {
  id: string;
  nameNL: string;
  nameEN: string;
  descriptionNL: string;
  descriptionEN: string;
  aiInstruction: string;
  category: 'communication_tone' | 'interaction_pattern' | 'depth_focus';
  type: 'concise_direct' | 'elaborate_indepth' | 'encouraging_positive' | 'critical_challenging' | 
        'highly_questioning' | 'solution_oriented' | 'collaborative' | 'drawing_comparisons' |
        'action_oriented' | 'big_picture_thinker' | 'narrative_example_rich';
}

export interface RoleDiscussionStyles {
  roleId: string;
  selectedStyles: string[]; // array of DiscussionStyleOption ids
  customInstructions?: string; // optional additional instructions
}

export interface DiscussionStyleConfiguration {
  roleStyles: { [roleId: string]: RoleDiscussionStyles };
  allowRuntimeAdjustment?: boolean;
  defaultStyles?: { [roleCategory: string]: string[] }; // default styles per role category
}

// Prompts for Specials functionality
export interface PromptDocument {
  id: string;
  title: string;
  prompt_text: string;
  requires_topic: boolean;
  is_active: boolean;
  created_at: any;
  updated_at: any;
  language?: string | null;
}
