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

// Business Case interface
export interface BusinessCaseData {
  businessCaseType: string;
  useInternetVerification: boolean;
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
