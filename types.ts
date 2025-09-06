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
  FILE_UPLOAD = 'file_upload'
}

// Usage limits per tier
export interface TierLimits {
  maxSessionDuration: number; // in minutes
  maxSessionsPerDay: number;
  maxTranscriptLength: number; // in characters
  allowedFileTypes: string[];
}

// User subscription information
export interface UserSubscription {
  tier: SubscriptionTier;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  autoRenew: boolean;
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
