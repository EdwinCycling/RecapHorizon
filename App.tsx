import Footer from './src/components/Footer.tsx';
import * as React from 'react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useModalState } from './src/hooks/useModalState';
import Modal from './src/components/Modal.tsx';
import CookieModal from './src/components/CookieModal.tsx';
import DisclaimerModal from './src/components/DisclaimerModal.tsx';
import WaitlistModal from './src/components/WaitlistModal.tsx';
// COMMENTED OUT: 2FA Email confirmation modal no longer needed
// import { EmailConfirmationModal } from './src/components/EmailConfirmationModal';
import LoginModal from './src/components/LoginModal';
import { copyToClipboard, displayToast } from './src/utils/clipboard'; 
import { RecordingStatus, type SpeechRecognition, SubscriptionTier, StorytellingData, ExecutiveSummaryData, QuizQuestion, KeywordTopic, SentimentAnalysisResult, ChatMessage, ChatRole, BusinessCaseData, StorytellingOptions, ExplainData, ExplainOptions, EmailOptions, ExpertConfiguration, ExpertChatMessage, SessionType } from './types';
import { GoogleGenAI, Chat, Type } from "@google/genai";
import modelManager from './src/utils/modelManager';
// Using Google's latest Gemini 2.5 Flash AI model for superior reasoning and text generation
// Mermaid is ESM-only; import dynamically to avoid type issues
let mermaid: typeof import('mermaid') | undefined;
import PptxGenJS from 'pptxgenjs';
import RecapHorizonPanel from './src/components/RecapHorizonPanel.tsx';
import LanguageSelector from './src/components/LanguageSelector.tsx';
import SessionOptionsModal from './src/components/SessionOptionsModal.tsx';
import ExpertConfigurationModal from './src/components/ExpertConfigurationModal.tsx';
import ExpertChatModal from './src/components/ExpertChatModal.tsx';
import ExpertHelpModal from './src/components/ExpertHelpModal.tsx';
// Removed StorytellingQuestionsModal; inline panels are rendered under tabs
import { getGeminiCode, getBcp47Code, getTotalLanguageCount } from './src/languages';
import { useTabCache } from './src/hooks/useTabCache';
import { fetchHTML, fetchMultipleHTML, extractTextFromHTML, FetchError } from './src/utils/fetchPage';
import { useTranslation } from './src/hooks/useTranslation';
import { AudioRecorder } from './src/utils/AudioRecorder';
import MobileAudioHelpModal from './src/components/MobileAudioHelpModal.tsx';
import ImageUploadHelpModal from './src/components/ImageUploadHelpModal.tsx';
import EmailImportHelpModal from './src/components/EmailImportHelpModal.tsx';
import EmailUploadModal from './src/components/EmailUploadModal.tsx';
import NotionImportModal from './src/components/NotionImportModal.tsx';
import FileUploadModal from './src/components/FileUploadModal.tsx';
import ImageUploadModal from './src/components/ImageUploadModal.tsx';
import { SafeUserText } from './src/utils/SafeHtml';
import { sanitizeTextInput, extractEmailAddresses } from './src/utils/security';
import { isMobileDevice } from './src/utils/deviceDetection';
import { readEml } from 'eml-parse-js';
import MsgReader from '@kenjiuno/msgreader';
import EmailCompositionTab, { EmailData } from './src/components/EmailCompositionTab.tsx';
import TokenUsageMeter from './src/components/TokenUsageMeter.tsx';
import SubscriptionSuccessModal from './src/components/SubscriptionSuccessModal.tsx';
import CustomerPortalModal from './src/components/CustomerPortalModal.tsx';
import CustomerPortalReturnScreen from './src/components/CustomerPortalReturnScreen.tsx';
import { stripeService } from './src/services/stripeService';

// SEO Meta Tag Manager
const updateMetaTags = (title: string, description: string, keywords?: string) => {
  document.title = title;
  
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', description);
  
  if (keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);
  }
};
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  getDocs, 
  where, 
  updateDoc,
  serverTimestamp,
  orderBy,
  addDoc,
  deleteDoc,
  deleteField,
  increment
} from 'firebase/firestore';
import { auth, db, getUserDailyUsage, incrementUserDailyUsage, incrementUserMonthlySessions, addUserMonthlyTokens, getUserMonthlyTokens, getUserMonthlySessions, getUserPreferences, saveUserPreferences, type MonthlyTokensUsage } from './src/firebase';
import { sessionManager, UserSession } from './src/utils/security';
import LoginForm from './src/components/LoginForm';
import SessionTimeoutWarning from './src/components/SessionTimeoutWarning.tsx';
import { useSessionActivity } from './src/hooks/useSessionActivity';
import { errorHandler, ErrorType } from './src/utils/errorHandler';



// --- ICONS ---

const MicIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);
const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
);
const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
);
const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M8 5v14l11-7z"/></svg>
);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);
const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
);
const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
);
const ResetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
);
const SummaryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 11-6 6v3h9l6-6-3-3Z"/><path d="m22 6-3-3-1.41 1.41 3 3L22 6Z"/><path d="m14 10 3 3"/></svg>
);
const ExecutiveSummaryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="m14 2 6 6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/><circle cx="18" cy="18" r="3"/><path d="m20.2 20.2L22 22"/></svg>
);
const FaqIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
);
const LearningIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"/><path d="M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>
);
const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 6v12c0 .55-.45 1-1 1H4.5l-2.5 2.5V4c0-.55.45-1 1-1h11c.55 0 1 .45 1 1Z"/><path d="M20 2H7c-.55 0-1 .45-1 1v2h12c.55 0 1 .45 1 1v10h2c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1Z"/></svg>
);
const TranscriptIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
);
const FollowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9.1 11.1a3 3 0 1 1 4.3 2.5c0 .3.1.5.2.7l.2.7c.3.8.4 1.6.4 2.4"/><path d="M12 17.8a.2.2 0 0 0 .2-.2c0-.2 0-.4-.2-.5a.2.2 0 0 0-.2.2c0 .1 0 .3.2.5Z"/></svg>
);
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);
const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);
const PresentationIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="M7 21h10"/><path d="M12 16v5"/></svg>
);
const BusinessCaseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2H2a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-9"/><path d="M12 2v7h7"/><path d="M8 13h8"/><path d="M8 17h6"/><path d="M8 9h4"/></svg>
);

const QuestionMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
);
const AnonymizeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="10" r="3"/><path d="M12 13a7.3 7.3 0 0 0-4 2.5"/></svg>
);
const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
);
const SpeakerOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 5 6 9 2 9 2 15 6 15 11 19 11 5Z"/><path d="m23 9-6 6"/><path d="m17 9 6 6"/><line x1="15.54" x2="15.54" y1="8.46" y2="8.46"/></svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const TagIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 1 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.432 0l6.586-6.586a2.426 2.426 0 0 0 0-3.432L12.586 2.586z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>
);
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3-1.9 1.9-1.9-1.9-1.9 1.9-1.9-1.9L3 3m18 0-1.9 1.9-1.9-1.9-1.9 1.9-1.9-1.9L12 3m0 18 1.9-1.9 1.9 1.9 1.9-1.9 1.9 1.9L21 21M3 21l1.9-1.9 1.9 1.9 1.9-1.9 1.9 1.9L12 21m9-9-1.9-1.9-1.9 1.9-1.9-1.9-1.9 1.9L12 12m-9 0 1.9-1.9 1.9 1.9 1.9-1.9 1.9 1.9L12 12"/></svg>
);
const RewindIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="11 19 2 12 11 5 11 19"></polygon>
        <polygon points="22 19 13 12 22 5 22 19"></polygon>
    </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);
const CreditCardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="14" x="2" y="5" rx="2"/>
        <line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
);

// New icons for sentiment, mindmap, and storytelling
const SentimentIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
);

const MindmapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 3H5a2 2 0 0 0-2 2v4"/>
        <path d="M19 3h4v4"/>
        <path d="M21 19h-4v4"/>
        <path d="M3 19h4v4"/>
        <path d="M9 3v18"/>
        <path d="M15 3v18"/>
        <path d="M3 9h18"/>
        <path d="M3 15h18"/>
    </svg>
);

const StorytellingIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <path d="M9 15h6"/>
        <path d="M9 11h6"/>
        <path d="M9 7h6"/>
    </svg>
);

const BlogIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
);

const ExplainIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <path d="M12 17h.01"/>
    </svg>
);

const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22 6 12 13 2 6"/>
    </svg>
);

const LoadingSpinner: React.FC<{ className?: string; text?: string }> = ({ className = "h-8 w-8", text }) => (
    <div className="flex items-center gap-3">
        <svg className={`animate-spin text-cyan-500 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {text && <span className="text-slate-600 dark:text-slate-300">{text}</span>}
    </div>
);






const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);
const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);
const NlFlagIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6">
        <rect fill="#21468B" width="9" height="6"/>
        <rect fill="#FFFFFF" width="9" height="4"/>
        <rect fill="#AE1C28" width="9" height="2"/>
    </svg>
);
const UkFlagIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30">
        <clipPath id="s-t">
            <path d="M0,0 v30 h60 v-30 z"/>
        </clipPath>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#s-t)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
);


// --- COMPONENTS ---

const LoadingOverlay: React.FC<{ text: string; progress?: number; cancelText?: string; onCancel?: () => void }> = ({ text, progress, cancelText, onCancel }) => {
  const progressPercentage = typeof progress === 'number' ? Math.max(0, Math.min(100, Math.round(progress * 100))) : 0;
  
  return (
    <div className="fixed inset-0 bg-gray-200/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-[100] transition-opacity duration-300">
      <div className="flex items-start gap-4 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 min-w-[320px] max-w-[90%]">
        <LoadingSpinner />
        <div className="flex-1">
          <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">{text}</p>
          {typeof progress === 'number' && (
            <div className="mt-3">
              <div className="h-3 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-3 bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {progressPercentage < 100 ? 'Verwerken...' : 'Bijna klaar...'}
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {progressPercentage}%
                </span>
              </div>
            </div>
                    )}
          {onCancel && (
            <div className="mt-4 flex justify-end">
              <button onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                {cancelText || 'Cancel'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const KeywordExplanationModal: React.FC<{ keyword: string; explanation: string | null; isLoading: boolean; onClose: () => void; t: (key: string, params?: Record<string, unknown>) => string; }> = ({ keyword, explanation, isLoading, onClose, t }) => {
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]" onClick={onClose}>
            <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-lg w-full m-4 p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">{t('keywordExplanation', { keyword })}</h3>
                <div className="mt-4 min-h-[100px] text-slate-600 dark:text-slate-300">
                    {isLoading ? (
                        <div className="flex items-center gap-3">
                           <LoadingSpinner className="w-6 h-6" />
                           <span>{t('fetchingExplanation')}</span>
                        </div>
                    ) : (
                        <p>{explanation}</p>
                    )}
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">{t('close')}</button>
                </div>
            </div>
        </div>
    );
};

const PowerPointOptionsModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onGenerate: (options: { 
        maxSlides: number; 
        language: 'nl' | 'en'; 
        useTemplate: boolean; 
        templateFile?: File | null;
        targetAudience: string;
        mainGoal: string;
        toneStyle: string;
    }) => void; 
    t: (key: string, params?: Record<string, unknown>) => string;
    currentTemplate: File | null;
    onTemplateChange: (file: File | null) => void;
    uiLang: string;
}> = ({ isOpen, onClose, onGenerate, t, currentTemplate, onTemplateChange, uiLang }) => {
    const [maxSlides, setMaxSlides] = useState(10);
    const [language, setLanguage] = useState<'nl' | 'en'>('nl');
    const [useTemplate, setUseTemplate] = useState(false);
    const [targetAudience, setTargetAudience] = useState('Interne teamleden');
    const [mainGoal, setMainGoal] = useState('Informeren en updates geven');
    const [toneStyle, setToneStyle] = useState('Informerend en neutraal');
    const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setMaxSlides(10);
            setLanguage('nl');
            setUseTemplate(false);
            setTargetAudience('Interne teamleden');
            setMainGoal('Informeren en updates geven');
            setToneStyle('Informerend en neutraal');
        }
    }, [isOpen]);

    const handleGenerate = () => {
        onGenerate({ 
            maxSlides, 
            language, 
            useTemplate, 
            templateFile: useTemplate ? currentTemplate : null,
            targetAudience,
            mainGoal,
            toneStyle
        });
        onClose();
    };

    const handleTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            onTemplateChange(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
            <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full m-4 p-6">
                <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400 mb-6">{t('powerpointOptions')}</h3>
                
                <div className="space-y-6">
                    {/* Template Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('templateUpload')}
                        </label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                id="useTemplate" 
                                checked={useTemplate} 
                                onChange={(e) => setUseTemplate(e.target.checked)}
                                className="rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                            />
                            <label htmlFor="useTemplate" className="text-sm text-slate-600 dark:text-slate-400">
                                {t('useCustomTemplate')}
                            </label>
                        </div>
                        {useTemplate && (
                            <div className="mt-3">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleTemplateUpload} 
                                    accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                                    className="hidden"
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()} 
                                    className="px-3 py-2 text-sm bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    {currentTemplate ? currentTemplate.name : t('selectTemplate')}
                                </button>
                                {currentTemplate && (
                                    <button 
                                        onClick={() => onTemplateChange(null)} 
                                        className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
                                    >
                                        {t('clearTemplate')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Max Slides */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('maxSlides')} ({maxSlides})
                        </label>
                        <input 
                            type="range" 
                            min="3" 
                            max="15" 
                            value={maxSlides} 
                            onChange={(e) => setMaxSlides(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>3</span>
                            <span>15</span>
                        </div>
                    </div>

                    {/* Language */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('presentationLanguage')}
                        </label>
                        <div className="flex justify-center">
                            <LanguageSelector
                                value={language || ''}
                                onChange={setLanguage}
                                placeholder={t('presentationLanguage')}
                                appLanguage={uiLang}
                                className="w-full max-w-xs"
                            />
                        </div>
                    </div>

                    {/* Target Audience */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('targetAudience')}
                        </label>
                        <select 
                            value={targetAudience} 
                            onChange={(e) => setTargetAudience(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                            <option value={t('internalTeamMembers')}>{t('internalTeamMembers')}</option>
                            <option value="Senior management / EXCO">{t('seniorManagement')}</option>
                            <option value="Potentiële klanten">{t('potentialCustomers')}</option>
                            <option value="Investeerders">{t('investors')}</option>
                            <option value="Technische experts">{t('technicalExperts')}</option>
                            <option value="Algemeen publiek">{t('generalPublic')}</option>
                        </select>
                    </div>

                    {/* Main Goal */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('mainGoal')}
                        </label>
                        <select 
                            value={mainGoal} 
                            onChange={(e) => setMainGoal(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                            <option value={t('informAndProvideUpdates')}>{t('informAndUpdate')}</option>
                            <option value="Overtuigen tot een besluit">{t('convinceToDecide')}</option>
                            <option value="Trainen en kennis delen">{t('trainAndShare')}</option>
                            <option value="Probleem presenteren en oplossing voorstellen">{t('presentProblemAndSolution')}</option>
                            <option value="Voortgang rapporteren">{t('reportProgress')}</option>
                            <option value="Brainstormen en ideeën genereren">{t('brainstormAndGenerate')}</option>
                        </select>
                    </div>

                    {/* Tone/Style */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('toneStyle')}
                        </label>
                        <select 
                            value={toneStyle} 
                            onChange={(e) => setToneStyle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                            <option value={t('informativeAndNeutral')}>{t('informativeAndNeutral')}</option>
                            <option value="Formeel en feitelijk">{t('formalAndFactual')}</option>
                            <option value="Enthousiast en motiverend">{t('enthusiasticAndMotivating')}</option>
                            <option value="Kritisch en analytisch">{t('criticalAndAnalytical')}</option>
                            <option value="Bondig en to-the-point">{t('conciseAndToThePoint')}</option>
                            <option value="Storytelling-gericht">{t('storytellingOriented')}</option>
                        </select>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button 
                        onClick={handleGenerate} 
                        className="px-4 py-2 bg-cyan-500 text-white rounded-md font-semibold hover:bg-cyan-600 transition-colors"
                    >
                        {t('generatePresentation')}
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- TYPES ---
type ViewType = 'transcript' | 'summary' | 'faq' | 'learning' | 'followUp' | 'chat' | 'keyword' | 'sentiment' | 'mindmap' | 'storytelling' | 'blog' | 'businessCase' | 'exec' | 'quiz' | 'explain' | 'email';
type AnalysisType = ViewType | 'presentation';

interface SlideContent {
    title: string;
    points: string[];
    imagePrompt?: string;
    base64Image?: string | null;
}
interface TodoItem {
    task: string;
    owner: string;
    dueDate: string;
}
interface PresentationData {
    titleSlide: { title: string; subtitle: string; };
    introduction: SlideContent;
    agenda: string[];
    mainContentSlides: SlideContent[];
    projectStatus: SlideContent;
    learnings: SlideContent;
    improvements: SlideContent;
    todoList: { title: string; items: TodoItem[]; imagePrompt?: string; };
    imageStylePrompt: string;
}

interface AnonymizationRule {
  id: number;
  originalText: string;
  replacementText: string;
  isExact: boolean;
}

interface User {
  uid: string;
  email: string;
  isActive: boolean;
    lastLogin: Date | null;
  sessionCount: number;
  createdAt: Date;
  updatedAt: Date;
  hashedApiKey?: string;
  apiKeyLastUpdated?: Date;
  subscriptionTier?: SubscriptionTier | string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  }

// Utility function for copying text to clipboard

// Email helper functions moved inside App component to access translation function

// --- i18n ---
import { translations } from './src/locales';
import { subscriptionService } from './src/subscriptionService';
import { tokenCounter } from './src/tokenCounter';
import { tokenManager } from './src/utils/tokenManager';
import UpgradeModal from './src/components/UpgradeModal.tsx';
import PricingPage from './src/components/PricingPage.tsx';
import FAQPage from './src/components/FAQPage.tsx';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
};
export default function App() {
  const [uiLang, setUiLang] = useState<'nl' | 'en' | 'pt' | 'de' | 'fr' | 'es'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedLang = window.localStorage.getItem('uiLang') as 'nl' | 'en' | 'pt' | 'de' | 'fr' | 'es' | null;
      if (savedLang) return savedLang;
    }
    return 'en';
  });
  
  // Translation hook
  const { t, currentLanguage } = useTranslation(uiLang);
  
  // Auth and token management
  const user = auth.currentUser;
  
  // Email helper functions
  const openEmailClient = (to: string, subject: string, body: string) => {
    // Check if the content is too long for mailto URLs (typical limit is around 2000-8000 characters)
    const maxBodyLength = 2000; // Conservative limit for mailto URLs
    
    let truncatedBody = body;
    if (body.length > maxBodyLength) {
      // Truncate and add indication that content was truncated
      truncatedBody = body.substring(0, maxBodyLength) + '\n\n[Content was truncated due to length limitations. Please copy the full content from the application.]';
    }
    
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(truncatedBody);
    
    // Create the mailto URL
    const mailtoUrl = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
    
    // Check if the URL is too long (browsers typically have limits around 2000-8000 characters)
    if (mailtoUrl.length > 4000) {
      // URL is too long, use clipboard fallback
      displayToast(t('emailContentTooLong'), 'error');
      copyToClipboard(body);
      return;
    }
    
    try {
      // Try to open the mailto link
      window.location.href = mailtoUrl;
      
      // If the content was truncated, show a toast notification
      if (body.length > maxBodyLength) {
        // Use setTimeout to ensure this runs after the mailto attempt
        setTimeout(() => {
          displayToast(t('emailContentTruncated'), 'success');
          copyToClipboard(body);
        }, 100);
      }
    } catch (error) {
      console.error('Failed to open email client:', error);
      // Fallback: copy content to clipboard and show message
      displayToast(t('couldNotOpenEmail'), 'error');
      copyToClipboard(body);
    }
  };

  const openEmailClientWithoutTo = (subject: string, body: string) => {
    // Check if the content is too long for mailto URLs (typical limit is around 2000-8000 characters)
    const maxBodyLength = 2000; // Conservative limit for mailto URLs
    
    let truncatedBody = body;
    if (body.length > maxBodyLength) {
      // Truncate and add indication that content was truncated
      truncatedBody = body.substring(0, maxBodyLength) + '\n\n[Content was truncated due to length limitations. Please copy the full content from the application.]';
    }
    
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(truncatedBody);
    
    // Create the mailto URL
    const mailtoUrl = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
    
    // Check if the URL is too long (browsers typically have limits around 2000-8000 characters)
    if (mailtoUrl.length > 4000) {
      // URL is too long, use clipboard fallback
      displayToast(t('emailContentTooLong'), 'success');
      copyToClipboard(body);
      return;
    }
    
    try {
      // Try to open the mailto link
      window.location.href = mailtoUrl;
      
      // If the content was truncated, show a toast notification
      if (body.length > maxBodyLength) {
        // Use setTimeout to ensure this runs after the mailto attempt
        setTimeout(() => {
          displayToast(t('emailContentTruncated'), 'success');
          // Also copy the full content to clipboard as a fallback
          copyToClipboard(body);
        }, 100);
      }
    } catch (error) {
      console.error('Failed to open email client:', error);
      // Fallback: copy content to clipboard and show message
      displayToast(t('couldNotOpenEmail'), 'error');
      copyToClipboard(body);
    }
  };
  
  const [status, setStatus] = useState<RecordingStatus>(RecordingStatus.IDLE);
  // `language` is for the content (what's spoken), `uiLang` is for the app chrome
  const [language, setLanguage] = useState<string | null>(null);
  const [outputLang, setOutputLang] = useState<string>('en');
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const savedTheme = window.localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) return savedTheme;
        const userPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        return userPrefersDark ? 'dark' : 'light';
    }
    return 'dark'; // Fallback for non-browser environments
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Theme toggling from', theme, 'to', newTheme);
    setTheme(newTheme);
    
    // Direct toepassen van theme
    if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.setAttribute('data-theme', 'light');
    }
    
    // Force re-render van Tailwind classes
    document.documentElement.style.colorScheme = newTheme;
  };


  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [faq, setFaq] = useState<string>('');
  const [learningDoc, setLearningDoc] = useState<string>('');
  const [followUpQuestions, setFollowUpQuestions] = useState<string>('');
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [learnings, setLearnings] = useState<string>('');
  const [followup, setFollowup] = useState<string>('');
  const [mindmapText, setMindmapText] = useState<string>('');

  const [activeView, setActiveView] = useState<ViewType>('transcript');
  const [activeTab, setActiveTab] = useState('Transcribe');
  const [loadingText, setLoadingText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [showActionButtons, setShowActionButtons] = useState<boolean>(false);
  const actionButtonsRef = useRef<HTMLDivElement>(null);
  
  // Close action buttons when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionButtonsRef.current && !actionButtonsRef.current.contains(event.target as Node)) {
        setShowActionButtons(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatInstanceRef = useRef<Chat | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceInputPreview, setVoiceInputPreview] = useState<string>('');
  
  // Real-time transcription during recording
  // Removed real-time transcription state variables
  const realTimeRecognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(isListening);
  useEffect(() => { isListeningRef.current = isListening }, [isListening]);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const [showInfoPage, setShowInfoPage] = useState(false);
  const { getCachedTabContent, resetTabCache, isTabCached } = useTabCache();

  // Ensure audio context is resumed on user gesture on iOS
  useEffect(() => {
    const resumeAudioContext = () => {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      try {
        const ctx = new AudioContextClass();
        if (ctx.state === 'suspended') {
          ctx.resume?.();
        }
        ctx.close?.();
      } catch {}
      window.removeEventListener('touchend', resumeAudioContext);
      window.removeEventListener('click', resumeAudioContext);
    };
    window.addEventListener('touchend', resumeAudioContext, { passive: true });
    window.addEventListener('click', resumeAudioContext);
    return () => {
      window.removeEventListener('touchend', resumeAudioContext);
      window.removeEventListener('click', resumeAudioContext);
    };
  }, []);
  
  // Load usage metrics when user changes
  // New analysis states
  const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordTopic[] | null>(null);
  const [sentimentAnalysisResult, setSentimentAnalysisResult] = useState<SentimentAnalysisResult | null>(null);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState<boolean>(false);
  const [presentationReport, setPresentationReport] = useState<string | null>(null);
  const [mindmapMermaid, setMindmapMermaid] = useState<string>('');
  const [mindmapSvg, setMindmapSvg] = useState<string>('');
  const [blogData, setBlogData] = useState<string>('');

  useEffect(() => {
    // Defer mermaid import until used to avoid type resolution issues
  }, [theme]);
  
  // PPT Template state
  const [pptTemplate, setPptTemplate] = useState<File | null>(null);
  const [showPptOptions, setShowPptOptions] = useState(false);

  
  // API Key state

  const [apiKey, setApiKey] = useState<string>('');
  const [isValidatingApiKey, setIsValidatingApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  // Usage/tier info for settings
  const [monthlyTokens, setMonthlyTokens] = useState<MonthlyTokensUsage | null>(null);
  const [monthlySessions, setMonthlySessions] = useState<number | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState<boolean>(false);

  // Cookie consent state
  const [showCookieConsent, setShowCookieConsent] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !window.localStorage.getItem('cookie_consent');
    }
    return true;
  });

  // Modal states using useModalState
  const cookieModal = useModalState();
  const disclaimerModal = useModalState();
  const settingsModal = useModalState();
  // const loginModal = useModalState();
    const systemAudioHelp = useModalState();
  const step1Help = useModalState();
  const step2Help = useModalState();
  const formatsInfo = useModalState();
  const pasteModal = useModalState();
  const pasteHelp = useModalState();
  const waitlistModal = useModalState();
  const storyModal = useModalState();
  const teamModal = useModalState();
  const upgradeModal = useModalState();
  const sessionOptionsModal = useModalState();
  const webPageModal = useModalState();
  const [pastedText, setPastedText] = useState('');
  const comingSoonModal = useModalState();
  const mobileAudioHelpModal = useModalState();
  const imageUploadHelpModal = useModalState();
  const emailImportHelpModal = useModalState();
  const emailUploadModal = useModalState();
  const fileUploadModal = useModalState();
  const imageUploadModal = useModalState();
  const notionImportModal = useModalState();
  const expertConfigModal = useModalState();
  const expertChatModal = useModalState();
  const expertHelpModal = useModalState();
  const subscriptionSuccessModal = useModalState();
  const customerPortalModal = useModalState();
  
  // Auth state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });
  
  // Session management state
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  
  // Session logout handler
  const handleSessionExpired = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentSession(null);
      setSessionId('');
      setAuthState({ user: null, isLoading: false });
      // Show a message to user about session expiration
      displayToast(t('sessionExpired'), 'warning');
    } catch (error) {
      const userError = errorHandler.handleError(error, ErrorType.SESSION, {
        userId: currentSession?.userId,
        sessionId: sessionId
      });
      displayToast(userError.message, 'error');
    }
  }, [t, currentSession, sessionId]);
  
  // Session extend handler
  const handleExtendSession = useCallback(() => {
    if (sessionId) {
      const result = sessionManager.refreshSession(sessionId);
      if (result.success && result.session) {
        setCurrentSession(result.session);
        displayToast(t('sessionExtended'), 'success');
      } else {
        handleSessionExpired();
      }
    }
  }, [sessionId, handleSessionExpired, t]);
  
  // Initialize session activity tracking
  useSessionActivity({
    sessionId,
    onSessionExpired: handleSessionExpired
  });
  
  // Expert chat state
  const [expertConfiguration, setExpertConfiguration] = useState<ExpertConfiguration | null>(null);
  
  // Subscription success state
  const [subscriptionSuccessTier, setSubscriptionSuccessTier] = useState<SubscriptionTier | null>(null);
  const [subscriptionSuccessEmail, setSubscriptionSuccessEmail] = useState<string>('');
  
  // Customer portal return state
  const [showCustomerPortalReturn, setShowCustomerPortalReturn] = useState<boolean>(false);
  
  // Load saved language preferences from localStorage on initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedSessionLang = window.localStorage.getItem('sessionLang');
      const savedOutputLang = window.localStorage.getItem('outputLang');
      if (savedSessionLang) setLanguage(savedSessionLang);
      if (savedOutputLang) setOutputLang(savedOutputLang);
    }
  }, []);

  // Check for subscription success URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      
      if (sessionId && window.location.pathname.includes('subscription-success')) {
        // Extract tier and email from localStorage or URL
        const tier = localStorage.getItem('checkout_tier') as SubscriptionTier;
        const email = localStorage.getItem('checkout_email') || authState.user?.email || '';
        
        if (tier && email) {
          setSubscriptionSuccessTier(tier);
          setSubscriptionSuccessEmail(email);
          subscriptionSuccessModal.open();
          
          // Clean up localStorage
          localStorage.removeItem('checkout_tier');
          localStorage.removeItem('checkout_email');
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [authState.user, subscriptionSuccessModal]);
  
  // Check for customer portal return URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const portalReturn = urlParams.get('portal_return');
      
      if (portalReturn === 'true') {
        setShowCustomerPortalReturn(true);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);
  
  // Save language preferences when they change (localStorage + Firebase)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('uiLang', uiLang);
    }
  }, [uiLang]);
  
  // Save session and output language when they change (localStorage + Firebase)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (language) window.localStorage.setItem('sessionLang', language);
      if (outputLang) window.localStorage.setItem('outputLang', outputLang);
      
      // Also save to Firebase if user is logged in
      if (authState.user && (language || outputLang)) {
        saveUserPreferences(authState.user.uid, {
          sessionLanguage: language || 'nl',
          outputLanguage: outputLang || 'nl'
        }).catch(error => {
          errorHandler.handleError(error, ErrorType.API, {
            userId: authState.user?.uid,
            sessionId: sessionId,
            additionalContext: { action: 'saveLanguagePreferences' }
          });
        });
      }
    }
  }, [language, outputLang, authState.user]);

  // Recording time tracking
  const [recordingStartMs, setRecordingStartMs] = useState<number | null>(null);
  const [pauseAccumulatedMs, setPauseAccumulatedMs] = useState<number>(0);
  const [pauseStartMs, setPauseStartMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Helper function to generate email content for transcript analysis
  const generateEmailContent = (type: string, content: string, timestamp?: string) => {
    const stamp = timestamp || (() => {
      const d = recordingStartMs ? new Date(recordingStartMs) : new Date();
      return d.toLocaleString('nl-NL');
    })();
    const subject = `RecapHorizon ${stamp} - ${type}`;
    
    // Limit content length for email to prevent mailto URL issues
    const maxContentLength = 1500; // Leave room for headers and truncation message
    let emailContent = content;
    
    if (content.length > maxContentLength) {
      emailContent = content.substring(0, maxContentLength) + '\n\n[Content was truncated due to length limitations. Please copy the full content from the application.]';
    }
    
    const body = `## ${type}\n\n${emailContent}`;
    return { subject, body };
  };
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const computeRecordingElapsedMs = () => {
    if (!recordingStartMs) return 0;
    const effectiveNow = nowMs;
    const activePauseMs = pauseStartMs ? (effectiveNow - pauseStartMs) : 0;
    return Math.max(0, (effectiveNow - recordingStartMs) - (pauseAccumulatedMs + activePauseMs));
  };

  const computePauseElapsedMs = () => {
    const activePauseMs = pauseStartMs ? (nowMs - pauseStartMs) : 0;
    return pauseAccumulatedMs + activePauseMs;
  };
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showFAQPage, setShowFAQPage] = useState(false);

  // Effect to ensure language preferences are loaded after authentication
  // Language preferences are now loaded from Firebase when user logs in

  // Effect to load monthly tokens and sessions when user changes
  const fetchUsage = async () => {
    if (!authState?.user) {
      setMonthlyTokens(null);
      setMonthlySessions(null);
      return;
    }
    setIsLoadingUsage(true);
    try {
      const [tokens, sessions] = await Promise.all([
        getUserMonthlyTokens(authState.user.uid),
        getUserMonthlySessions(authState.user.uid)
      ]);
      setMonthlyTokens(tokens);
      setMonthlySessions(sessions.sessions);
    } catch (e) {
      const userError = errorHandler.handleError(e, ErrorType.API, {
        userId: authState?.user?.uid,
        sessionId: sessionId,
        additionalContext: { action: 'fetchUsage' }
      });
      // Don't show error to user for usage loading failures
    } finally {
      setIsLoadingUsage(false);
    }
  };

  // Helper function to update tokens and refresh UI
  const updateTokensAndRefresh = async (promptTokens: number, responseTokens: number) => {
    if (authState.user) {
      try {
        await addUserMonthlyTokens(authState.user.uid, promptTokens, responseTokens);
        // Update the UI immediately after token update
        await fetchUsage();
      } catch (error) {
        const userError = errorHandler.handleError(error, ErrorType.API, {
          userId: authState.user.uid,
          sessionId: sessionId,
          additionalContext: { promptTokens, responseTokens }
        });
        // Don't show error to user for token tracking failures
      }
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [authState?.user]);

              const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  // API key storage preference removed - all keys now stored in database only
  const [executiveSummaryData, setExecutiveSummaryData] = useState<ExecutiveSummaryData | null>(null);
  const [storytellingData, setStorytellingData] = useState<StorytellingData | null>(null);
  const [businessCaseData, setBusinessCaseData] = useState<BusinessCaseData | null>(null);
  // Explain state
  const [explainData, setExplainData] = useState<ExplainData | null>(null);
  const [explainOptions, setExplainOptions] = useState<ExplainOptions>({ 
    complexityLevel: t('explainComplexityGeneral'), 
    focusArea: t('explainFocusGeneral'), 
    format: t('explainFormatShort') 
  });
  // Quiz state
  
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [quizIncludeAnswers, setQuizIncludeAnswers] = useState<boolean>(false);
  const [quizNumQuestions, setQuizNumQuestions] = useState<number>(2);
  const [quizNumOptions, setQuizNumOptions] = useState<2 | 3 | 4>(3);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const getStartStamp = () => {
    const d = recordingStartMs ? new Date(recordingStartMs) : new Date();
    return d.toLocaleString('nl-NL');
  };

  // Memoize startStamp to prevent unnecessary re-renders and resets in RecapHorizonPanel
  const startStamp = useMemo(() => {
    const d = recordingStartMs ? new Date(recordingStartMs) : new Date();
    return d.toLocaleString('nl-NL');
  }, [recordingStartMs]);

  const handleGenerateQuiz = async () => {
    // Check transcript length based on user tier
    const effectiveTier = userSubscription;
    const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
    if (!transcriptValidation.allowed) {
      setQuizError(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.');
      setTimeout(() => setShowPricingPage(true), 2000);
      return;
    }
    
    try {
      // Don't reset other analysis data when generating quiz
      setIsGeneratingQuiz(true);
      setQuizError(null);
      setLoadingText(t('generatingQuiz'));
      
      // Validate token usage for quiz generation
      const quizPrompt = `You generate MCQs based on a transcript. Return ONLY a JSON array of objects with keys: question (string), options (array of {label, text}), correct_answer_label, correct_answer_text. Ensure exactly one correct answer per question. Labels are A, B, C, D but limited to requested count.\n\nConstraints: number_of_questions=${quizNumQuestions}, number_of_options=${quizNumOptions}.\nTranscript:\n${getTranscriptSlice(transcript, 18000)}`;
      const tokenEstimate = tokenManager.estimateTokens(quizPrompt, 1.5);
      const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, tokenEstimate.totalTokens);
      
      if (!tokenValidation.allowed) {
        setQuizError(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
        setTimeout(() => setShowPricingPage(true), 2000);
        setIsGeneratingQuiz(false);
        return;
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKey });
      // Using configured model for general analysis
      const modelName = await modelManager.getModelForFunction('generalAnalysis');
      const sys = `You generate MCQs based on a transcript. Return ONLY a JSON array of objects with keys: question (string), options (array of {label, text}), correct_answer_label, correct_answer_text. Ensure exactly one correct answer per question. Labels are A, B, C, D but limited to requested count.`;
      const prompt = `${sys}\n\nConstraints: number_of_questions=${quizNumQuestions}, number_of_options=${quizNumOptions}.\nTranscript:\n${getTranscriptSlice(transcript, 18000)}`;
      const res = await ai.models.generateContent({ model: modelName, contents: prompt });
      
      // Track token usage with TokenManager
      const promptTokens = tokenCounter.countPromptTokens(prompt);
      const responseTokens = tokenCounter.countResponseTokens(res.text);
      
      try {
        await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
      } catch (error) {
        console.error('Error recording token usage:', error);
      }

      let text = res.text || '';
      text = text.replace(/```[a-z]*|```/gi, '').trim();
      const arr = JSON.parse(text);
      setQuizQuestions(arr);
      
      // Update RecapHorizonPanel with new quiz questions
      if (arr && arr.length > 0) {
        displayToast(`Quiz gegenereerd met ${arr.length} vragen!`, 'success');
      }
    } catch (e: any) {
      setQuizError(e?.message || t('generationFailed'));
    } finally {
      setIsGeneratingQuiz(false);
      setLoadingText('');
    }
  };

  const handleGenerateBusinessCase = async (businessCaseType?: string, useInternetVerification?: boolean) => {
    // Check if user has access to business case generation
    const effectiveTier = userSubscription;
    if (!subscriptionService.isFeatureAvailable(effectiveTier, 'businessCase')) {
        displayToast(t('notEnoughCredits'), 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }
    
    // Check transcript length based on user tier
    const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
    if (!transcriptValidation.allowed) {
        displayToast(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }
    
    try {
      // Use parameters if provided, otherwise use state values
      const type = businessCaseType || businessCaseData?.businessCaseType || t('costSavings');
      const useInternet = useInternetVerification !== undefined ? useInternetVerification : (businessCaseData?.useInternetVerification || false);
      
      // Don't reset other analysis data when generating business case
      setLoadingText(t('generating', { type: 'Business Case' }));
      
      // Validate token usage for business case generation
      const businessCasePrompt = `Je bent een ervaren business consultant. Schrijf een overtuigende business case op basis van het transcript. De business case moet de volgende structuur hebben:\n\n- Titel\n- Probleem\n- Oplossing\n- Verwachte Impact (kwantitatief en kwalitatief)\n- Kosten/Baten analyse\n- Conclusie (waarom deze business case waardevol is)\n\nSchrijf helder, zakelijk en overtuigend. Maximaal 600 woorden.\n\nBusiness Case Type: ${type}\nInternet verificatie (grounding): ${useInternet ? 'Ja - vul aan met actuele marktdata en relevante trends van internet' : 'Nee - gebruik alleen de transcript informatie'}\nTranscript:\n${getTranscriptSlice(transcript, 20000)}`;
      const tokenEstimate = tokenManager.estimateTokens(businessCasePrompt, 1.5);
      const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, tokenEstimate.totalTokens);
      
      if (!tokenValidation.allowed) {
        displayToast(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        setLoadingText('');
        return;
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const modelName = await modelManager.getModelForFunction('businessCase');
      
      const businessCaseTypeDescriptions = {
        [t('costSavings')]: t('costSavingsDescription'),
        [t('revenueGrowth')]: t('revenueGrowthDescription'),
        [t('innovation')]: t('innovationDescription'),
        [t('riskReduction')]: t('riskReductionDescription'),
        [t('customerSatisfaction')]: t('customerSatisfactionDescription'),
        [t('scalability')]: t('scalabilityDescription')
      };

      const sys = `Je bent een ervaren business consultant. Schrijf een overtuigende business case op basis van het transcript. De business case moet de volgende structuur hebben:
      
      - Titel
      - Probleem
      - Oplossing  
      - Verwachte Impact (kwantitatief en kwalitatief)
      - Kosten/Baten analyse
      - Conclusie (waarom deze business case waardevol is)
      
      Schrijf helder, zakelijk en overtuigend. Maximaal 600 woorden.`;
      
      const prompt = `${sys}
Business Case Type: ${businessCaseTypeDescriptions[type as keyof typeof businessCaseTypeDescriptions] || type}
Internet verificatie (grounding): ${useInternet ? 'Ja - vul aan met actuele marktdata en relevante trends van internet' : 'Nee - gebruik alleen de transcript informatie'}
Transcript:
${getTranscriptSlice(transcript, 20000)}`;

      const res = await ai.models.generateContent({ model: modelName, contents: prompt });
      
      // Track token usage with TokenManager
      const promptTokens = tokenCounter.countPromptTokens(prompt);
      const responseTokens = tokenCounter.countResponseTokens(res.text);
      
      try {
        await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
      } catch (error) {
        console.error('Error recording token usage:', error);
      }

      let text = res.text || '';
      text = text.replace(/```[a-z]*|```/gi, '').trim();
      
      setBusinessCaseData({
        businessCaseType: type,
        useInternetVerification: useInternet,
        businessCase: text
      });
      
      setActiveView('businessCase');
      
      displayToast('Business case gegenereerd!', 'success');
    } catch (e: any) {
      setError(`${t('generationFailed', { type: 'Business Case' })}: ${e.message || t('unknownError')}`);
    } finally {
      setLoadingText('');
    }
  };

  // Toast functie
  const displayToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);
      
      // Auto-hide na 5 seconden
      setTimeout(() => {
          setShowToast(false);
      }, 5000);
  }, []);

  const handleSessionOptionUpload = () => {
    fileUploadModal.open();
  };

  const handleSessionOptionImageUpload = () => {
    // Check tier access for image upload
    const effectiveTier = userSubscription;
    if (effectiveTier !== SubscriptionTier.GOLD && 
        effectiveTier !== SubscriptionTier.DIAMOND && 
        effectiveTier !== SubscriptionTier.ENTERPRISE) {
      setShowUpgradeModal(true);
      setError('Image upload is alleen beschikbaar voor Gold, Diamond en Enterprise abonnementen.');
      return;
    }
    imageUploadModal.open();
  };

  // Inline panels; no-op kept if referenced
  const handleOpenStorytellingQuestions = () => {
    setActiveView('storytelling');
  };

  // Clipboard utility from utils
  // Use imported copyToClipboard and displayToast

  // Wrappers to allow modal to pass File directly
  const importTranscriptFile = async (file: File) => {
    const target = { files: [file] } as unknown as React.ChangeEvent<HTMLInputElement>['target'];
    await handleFileUpload({ target } as React.ChangeEvent<HTMLInputElement>);
  };
  const importImageFile = async (file: File) => {
    const target = { files: [file] } as unknown as React.ChangeEvent<HTMLInputElement>['target'];
    await handleImageUpload({ target } as React.ChangeEvent<HTMLInputElement>);
  };

  // Utility function for copying content for email
  const copyToClipboardForEmail = (subject: string, body: string) => {
    try {
      copyToClipboard(body);
      displayToast(
        t('copiedToClipboard'),
        'success'
      );
    } catch (error) {
      const userError = errorHandler.handleError(error, ErrorType.UNKNOWN, {
        userId: authState?.user?.uid,
        sessionId: sessionId,
        additionalContext: { action: 'copyToClipboard' }
      });
      displayToast(userError.message, 'error');
    }
  };

  // Utility function to get transcript slice based on user tier
  const getTranscriptSlice = (transcript: string, maxLength: number): string => {
    const effectiveTier = userSubscription;
    const tierLimits = subscriptionService.getTierLimits(effectiveTier);
    
    if (tierLimits.maxTranscriptLength === -1) {
      // Unlimited - return full transcript
      return transcript;
    }
    
    // Otherwise, truncate to the smaller of the tier limit and maxLength
    const limit = Math.min(tierLimits.maxTranscriptLength, maxLength);
    return transcript.slice(0, limit);
  };

  // Waitlist states
  // Waitlist modal now uses useModalState() hook: waitlistModal
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlist, setWaitlist] = useState<Array<{ email: string; timestamp: number }>>([]);
  const [selectedWaitlistUsers, setSelectedWaitlistUsers] = useState<string[]>([]);
  // COMMENTED OUT: 2FA Email confirmation state no longer needed
  // const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');

  // Anonymization settings state
  const [anonymizationRules, setAnonymizationRules] = useState<AnonymizationRule[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('anonymization_rules');
      // Nieuw: geen default regels meer. Leeg betekent: geen anonimisatie mogelijk tot user regels toevoegt.
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [nextRuleId, setNextRuleId] = useState(() => {
    if (anonymizationRules.length > 0) {
      return Math.max(...anonymizationRules.map(rule => rule.id)) + 1;
    }
    return 1;
  });
  // Anonymization state
  const [isAnonymized, setIsAnonymized] = useState(false);
  const [anonymizationReport, setAnonymizationReport] = useState<string | null>(null);
  
  // Settings tab state
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'transcription' | 'anonymization' | 'subscription'>('general');

  // Transcription settings state
  const [transcriptionQuality, setTranscriptionQuality] = useState<'high' | 'balanced' | 'fast'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('transcription_quality');
      return (saved as 'high' | 'balanced' | 'fast') || 'fast';
    }
    return 'fast';
  });
  
  const [audioCompressionEnabled, setAudioCompressionEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('audio_compression_enabled');
      return saved === 'true';
    }
    return true;
  });
  
  const [autoStopRecordingEnabled, setAutoStopRecordingEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('auto_stop_recording_enabled');
      return saved === 'true';
    }
    return true;
  });
  
  // Keyword explanation state
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [keywordExplanation, setKeywordExplanation] = useState<string | null>(null);
  const [isFetchingExplanation, setIsFetchingExplanation] = useState<boolean>(false);

  // Subscription state
  const [userSubscription, setUserSubscription] = useState<SubscriptionTier>(SubscriptionTier.GOLD);
  const [dailyAudioCount, setDailyAudioCount] = useState<number>(0);
  const [dailyUploadCount, setDailyUploadCount] = useState<number>(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPricingPage, setShowPricingPage] = useState(false);
  const [sessionOptionsHelpMode, setSessionOptionsHelpMode] = useState(false);

  const [showWebPageModal, setShowWebPageModal] = useState(false);
  const [showWebPageHelp, setShowWebPageHelp] = useState(false);
  const [webPageUrl, setWebPageUrl] = useState('');
  const [webPageUrls, setWebPageUrls] = useState<string[]>(['', '', '']);
  const [useDeepseek, setUseDeepseek] = useState(false);
  const [isLoadingWebPage, setIsLoadingWebPage] = useState(false);
  const [webPageError, setWebPageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Storytelling and Blog inline option panels
  const [storyOptions, setStoryOptions] = useState<StorytellingOptions>({ targetAudience: '', mainGoal: '', toneStyle: '', length: '' });
  type BlogOptions = { targetAudience: string; mainGoal: string; tone: string; length: string };
  const [blogOptions, setBlogOptions] = useState<BlogOptions>({ targetAudience: '', mainGoal: '', tone: '', length: '' });
  const [emailOptions, setEmailOptions] = useState<EmailOptions>({ tone: '', length: '' });
  const [emailAddresses, setEmailAddresses] = useState<string[]>([]);
  const [emailContent, setEmailContent] = useState<string>('');
  const [sessionType, setSessionType] = useState<SessionType>(SessionType.AUDIO_RECORDING);

  // Deep translation helper for nested keys like 'storytellingTargetAudienceOptions.internalTeam'
  const td = (path: string): string => {
    const get = (lang: 'nl' | 'en' | 'pt' | 'de' | 'fr' | 'es'): string | null => {
      const segs = path.split('.');
      let cur: Record<string, unknown> = translations[lang];
      for (const s of segs) cur = (cur as any)?.[s];
      return typeof cur === 'string' ? cur : null;
    };
    return get(uiLang) || get('en') || path;
  };

  // Blog suggestion labels per UI language
  const blogLabels = {
    nl: {
      targetAudience: ['', 'Breder Publiek', 'Brancheprofessionals', 'Potentiële Klanten', 'Ontwikkelaars', 'Onderwijspersoneel', 'Beleidsmakers', 'Studenten', 'Mediacreatieven', 'Investeerders', 'Senioren', 'Jongeren', 'Culturele gemeenschappen'],
      mainGoal: ['', 'Informeren', 'Overtuigen', 'Betrokkenheid Creëren', 'Lead Genereren', 'Thought Leadership', 'Educatie', 'Inspiration', 'Waarschuwing', 'Netwerken', 'Branding', 'Reflectie', 'Voorspelling'],
      tone: ['', 'Informerend', 'Conversational', 'Formeel', 'Enthousiast', 'Expert', 'Verhalend', 'Empathisch', 'Humoristisch', 'Visionair', 'Kritisch', 'Cultuurgevoelig', 'Optimistisch'],
      length: ['', 'Kort (±300 woorden)', 'Gemiddeld (±500 woorden)', 'Lang (±750 woorden)']
    },
    en: {
      targetAudience: ['', 'Broader Public', 'Industry Professionals', 'Prospective Customers', 'Developers', 'Educational Staff', 'Policy Makers', 'Students', 'Media Creatives', 'Investors', 'Seniors', 'Youth', 'Cultural Communities'],
      mainGoal: ['', 'Inform', 'Persuade', 'Create Engagement', 'Generate Leads', 'Thought Leadership', 'Education', 'Inspiration', 'Warning', 'Networking', 'Branding', 'Reflection', 'Prediction'],
      tone: ['', 'Informative', 'Conversational', 'Formal', 'Enthusiastic', 'Expert', 'Narrative', 'Empathetic', 'Humorous', 'Visionary', 'Critical', 'Culture-Sensitive', 'Optimistic'],
      length: ['', 'Short (~300 words)', 'Medium (~500 words)', 'Long (~750 words)']
    },
    de: {
      targetAudience: ['', 'Breiteres Publikum', 'Branchenprofis', 'Potenzielle Kunden', 'Entwickler', 'Bildungspersonal', 'Entscheidungsträger', 'Studenten', 'Medienschaffende', 'Investoren', 'Senioren', 'Jugendliche', 'Kulturelle Gemeinschaften'],
      mainGoal: ['', 'Informieren', 'Überzeugen', 'Engagement schaffen', 'Leads generieren', 'Thought Leadership', 'Bildung', 'Inspiration', 'Warnung', 'Netzwerken', 'Markenbildung', 'Reflexion', 'Vorhersage'],
      tone: ['', 'Informativ', 'Konversationell', 'Formell', 'Enthusiastisch', 'Experte', 'Erzählend', 'Einfühlsam', 'Humorvoll', 'Visionär', 'Kritisch', 'Kultursensibel', 'Optimistisch'],
      length: ['', 'Kurz (~300 Wörter)', 'Mittel (~500 Wörter)', 'Lang (~750 Wörter)']
    },
    fr: {
      targetAudience: ['', 'Public élargi', 'Professionnels du secteur', 'Clients potentiels', 'Développeurs', 'Personnel éducatif', 'Décideurs politiques', 'Étudiants', 'Créateurs de médias', 'Investisseurs', 'Seniors', 'Jeunes', 'Communautés culturelles'],
      mainGoal: ['', 'Informer', 'Convaincre', 'Créer de l\'engagement', 'Générer des leads', 'Leadership d\'opinion', 'Éducation', 'Inspiration', 'Avertissement', 'Réseautage', 'Image de marque', 'Réflexion', 'Prédiction'],
      tone: ['', 'Informatif', 'Conversationnel', 'Formel', 'Enthousiaste', 'Expert', 'Narratif', 'Empathique', 'Humoristique', 'Visionnaire', 'Critique', 'Sensible à la culture', 'Optimiste'],
      length: ['', 'Court (~300 mots)', 'Moyen (~500 mots)', 'Long (~750 mots)']
    },
    es: {
      targetAudience: ['', 'Público amplio', 'Profesionales del sector', 'Clientes potenciales', 'Desarrolladores', 'Personal educativo', 'Formuladores de políticas', 'Estudiantes', 'Creadores de medios', 'Inversores', 'Personas mayores', 'Jóvenes', 'Comunidades culturales'],
      mainGoal: ['', 'Informar', 'Persuadir', 'Crear engagement', 'Generar leads', 'Liderazgo de pensamiento', 'Educación', 'Inspiración', 'Advertencia', 'Networking', 'Branding', 'Reflexión', 'Predicción'],
      tone: ['', 'Informativo', 'Conversacional', 'Formal', 'Entusiasmado', 'Experto', 'Narrativo', 'Empático', 'Humorístico', 'Visionario', 'Crítico', 'Sensible a la cultura', 'Optimista'],
      length: ['', 'Corto (~300 palabras)', 'Medio (~500 palabras)', 'Largo (~750 palabras)']
    },
    pt: {
      targetAudience: ['', 'Público amplo', 'Profissionais do setor', 'Clientes potenciais', 'Desenvolvedores', 'Pessoal educacional', 'Formuladores de políticas', 'Estudantes', 'Criadores de mídia', 'Investidores', 'Idosos', 'Jovens', 'Comunidades culturais'],
      mainGoal: ['', 'Informar', 'Convencer', 'Criar engajamento', 'Gerar leads', 'Liderança de pensamento', 'Educação', 'Inspiração', 'Aviso', 'Networking', 'Branding', 'Reflexão', 'Predição'],
      tone: ['', 'Informativo', 'Conversacional', 'Formal', 'Entusiasmado', 'Especialista', 'Narrativo', 'Empático', 'Humorístico', 'Visionário', 'Crítico', 'Sensível à cultura', 'Otimista'],
      length: ['', 'Curto (~300 palavras)', 'Médio (~500 palavras)', 'Longo (~750 palavras)']
    }
  } as const;

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamsRef = useRef<MediaStream[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  // Input-level and no-audio indicators
  const [avgInputLevel, setAvgInputLevel] = useState<number>(0);
  const [showNoInputHint, setShowNoInputHint] = useState<boolean>(false);
  const lastNoInputStartRef = useRef<number | null>(null);
  const lastLevelUpdateRef = useRef<number>(0);

  const isProcessing = !!loadingText;

  // Progress + cancel state for segmented transcription
  const [transcriptionProgress, setTranscriptionProgress] = useState<number | null>(null);
  const [isSegmentedTranscribing, setIsSegmentedTranscribing] = useState<boolean>(false);
  const cancelTranscriptionRef = useRef<boolean>(false);
  const [audioTokenUsage, setAudioTokenUsage] = useState<{inputTokens: number, outputTokens: number, totalTokens: number} | null>(null);

  const handleCancelTranscription = () => {
    cancelTranscriptionRef.current = true;
    setLoadingText('');
    setTranscriptionProgress(null);
    setIsSegmentedTranscribing(false);
    try { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); } catch {}
    setStatus(RecordingStatus.STOPPED);
  };

  // --- PWA INSTALL BANNER STATE ---
  type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>; };
  const [pwaPromptEvent, setPwaPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [pwaInstalled, setPwaInstalled] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('pwa_installed') === 'true' ||
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        ((navigator as any).standalone === true)
      );
    } catch {
      return false;
    }
  });
  const [showPwaBanner, setShowPwaBanner] = useState<boolean>(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      (e as any).preventDefault?.();
      setPwaPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      try { localStorage.setItem('pwa_installed', 'true'); } catch {}
      setPwaInstalled(true);
      setShowPwaBanner(false);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', onAppInstalled as any);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', onAppInstalled as any);
    };
  }, []);

  useEffect(() => {
    // Test-forcing: always show banner for testing when ?pwaTest=1 or localStorage('pwa_force_banner') === 'true'
    let forceBanner = false;
    try {
      const sp = new URLSearchParams(window.location.search);
      forceBanner = sp.get('pwaTest') === '1' || localStorage.getItem('pwa_force_banner') === 'true';
    } catch {}
    if (forceBanner) {
      setShowPwaBanner(true);
      return;
    }

    const uid = authState.user?.uid;
    if (!uid || pwaInstalled) {
      setShowPwaBanner(false);
      return;
    }

    // Check if iOS Safari (supports PWA but no beforeinstallprompt event)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode = (navigator as any).standalone === true;
    const isIOSSafari = isIOS && !isInStandaloneMode;

    // Show banner if we have a prompt event (Android/Chrome) or if it's iOS Safari
    if (!pwaPromptEvent && !isIOSSafari) {
      setShowPwaBanner(false);
      return;
    }

    const lc = parseInt(localStorage.getItem(`pwa_login_count:${uid}`) || '0', 10);
    const lastIgnore = parseInt(localStorage.getItem(`pwa_last_ignore_login:${uid}`) || '0', 10);
    if (!lastIgnore || isNaN(lastIgnore)) {
      setShowPwaBanner(true);
    } else {
      setShowPwaBanner(lc - lastIgnore >= 3);
    }
  }, [authState.user, pwaInstalled, pwaPromptEvent]);

  const handlePwaIgnore = () => {
    const uid = authState.user?.uid;
    if (uid) {
      const lc = parseInt(localStorage.getItem(`pwa_login_count:${uid}`) || '0', 10);
      localStorage.setItem(`pwa_last_ignore_login:${uid}`, String(lc));
    }
    setShowPwaBanner(false);
  };

  const handlePwaInstall = async () => {
    // Check if iOS Safari (no beforeinstallprompt event available)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode = (navigator as any).standalone === true;
    const isIOSSafari = isIOS && !isInStandaloneMode;

    if (isIOSSafari) {
      // Show iOS installation instructions
      alert(`${t('pwaInstallIosTitle')}\n\n${t('pwaInstallIosStep1')} ${t('pwaInstallIosShareIcon')}\n${t('pwaInstallIosStep2')}\n${t('pwaInstallIosStep3')}`);
      handlePwaIgnore();
      return;
    }

    // Standard PWA installation for other browsers
    if (!pwaPromptEvent) return;
    try {
      await pwaPromptEvent.prompt();
      const choice = await (pwaPromptEvent as any).userChoice;
      if (choice?.outcome !== 'accepted') {
        handlePwaIgnore();
      }
    } catch {
      handlePwaIgnore();
    } finally {
      setPwaPromptEvent(null);
    }
  };

  
  // Translation function now provided by useTranslation hook

  // --- PERSISTENCE & THEME ---
    useEffect(() => {
        // Load environment API key if provided via .env.local or Netlify environment variables
        const envApiKey = process.env.GEMINI_API_KEY as string | undefined;
        if (envApiKey && envApiKey.trim().length > 0) {
            setApiKey(envApiKey.trim());
        }

        const savedLang = localStorage.getItem('uiLang') as string | null;
        if (savedLang) setUiLang(savedLang as 'nl' | 'en' | 'pt' | 'de' | 'fr' | 'es');
        // Session and output language preferences are now loaded from Firebase when user logs in
        
        // Laad theme uit localStorage en pas direct toe
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            // Pas theme direct toe
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
                document.body.setAttribute('data-theme', 'dark');
                document.documentElement.style.colorScheme = 'dark';
                console.log('Added dark class to document and body, set data-theme');
            } else {
                document.documentElement.classList.remove('dark');
                document.body.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
                document.body.setAttribute('data-theme', 'light');
                document.documentElement.style.colorScheme = 'light';
            }
        }
    }, []);

    // Language preferences are already handled in the main useEffect hooks above

    // Firebase Auth State Listener with Session Management
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // User is signed in
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        
                        // Check for existing valid session first
                        let session = sessionManager.getExistingValidSession(firebaseUser.uid);
                        
                        if (!session) {
                            // Create new secure session only if no valid session exists
                            const userAgent = navigator.userAgent;
                            const ipAddress = undefined; // Would need server-side implementation for real IP
                            session = sessionManager.createSession(firebaseUser.uid, ipAddress, userAgent);
                        } else {
                            // Refresh existing session to update activity
                            const refreshResult = sessionManager.refreshSession(session.sessionId);
                            if (!refreshResult.success) {
                                // If refresh fails, create new session
                                const userAgent = navigator.userAgent;
                                const ipAddress = undefined;
                                session = sessionManager.createSession(firebaseUser.uid, ipAddress, userAgent);
                            } else {
                                session = refreshResult.session!;
                            }
                        }
                        
                        setCurrentSession(session);
                        setSessionId(session.sessionId);
                        
                        setAuthState({
                            user: { ...userData, uid: firebaseUser.uid },
                            isLoading: false,
                        });
                        
                        // Load user subscription tier
                        const tier = userData.subscriptionTier as SubscriptionTier || SubscriptionTier.FREE;
                        setUserSubscription(tier);
                        
                        // Ensure user is redirected to start session screen after auth
                        setShowInfoPage(false);

                        // Increment PWA login counter for banner logic
                        try {
                          const key = `pwa_login_count:${firebaseUser.uid}`;
                          const cnt = parseInt(localStorage.getItem(key) || '0', 10) + 1;
                          localStorage.setItem(key, String(cnt));
                        } catch {}
                        
                        // Load user language preferences from Firebase
                        try {
                          const userPrefs = await getUserPreferences(firebaseUser.uid);
                          if (userPrefs) {
                            if (userPrefs.sessionLanguage) {
                              setLanguage(userPrefs.sessionLanguage);
                              window.localStorage.setItem('sessionLang', userPrefs.sessionLanguage);
                            }
                            if (userPrefs.outputLanguage) {
                              setOutputLang(userPrefs.outputLanguage);
                              window.localStorage.setItem('outputLang', userPrefs.outputLanguage);
                            }
                          }
                        } catch (error) {
                          console.error('Error loading user preferences:', error);
                        }
                        
                        // Ensure user document exists before startup validation
                        try {
                          const { ensureUserDocument } = await import('./src/firebase');
                          await ensureUserDocument(firebaseUser.uid, firebaseUser.email || undefined);
                        } catch (error) {
                          console.error('Error ensuring user document:', error);
                        }
                        
                        // Perform startup validation after user authentication
                        try {
                          const { StartupValidator } = await import('./src/utils/startupValidator');
                          const validation = await StartupValidator.validateStartup(firebaseUser.uid, t);
                          
                          if (!validation.isReady) {
                            console.warn('🚨 Startup validation found critical issues:', validation.criticalIssues);
                            // Show user-friendly error message for critical issues
                            if (validation.criticalIssues.length > 0) {
                              displayToast(
                                `Configuratie probleem: ${validation.criticalIssues[0]}. Neem contact op met support.`,
                                'error'
                              );
                            }
                          } else {
                            console.log('✅ Startup validation completed successfully');
                          }
                          
                          // Show warnings as info toasts (non-blocking)
                          if (validation.warnings.length > 0) {
                            console.warn('⚠️ Startup warnings:', validation.warnings);
                            // Only show the first warning to avoid spam
                            displayToast(
                              `Let op: ${validation.warnings[0]}`,
                              'warning'
                            );
                          }
                        } catch (error) {
                          console.error('Startup validation failed:', error);
                          // Don't block the app for validation failures
                        }
                        
                        // Load daily usage counters
                        try {
                          const usage = await getUserDailyUsage(firebaseUser.uid);
                          setDailyAudioCount(usage.audioCount || 0);
                          setDailyUploadCount(usage.uploadCount || 0);
                        } catch (e) { 
                          errorHandler.handleError(e, ErrorType.API, {
                            userId: firebaseUser.uid,
                            sessionId: session.sessionId,
                            additionalContext: { action: 'loadDailyUsage' }
                          });
                        }
                    }
                } catch (error) {
                    const userError = errorHandler.handleError(error, ErrorType.AUTHENTICATION, {
                        userId: firebaseUser?.uid,
                        additionalContext: { action: 'loadUserData' }
                    });
                    setAuthState({
                        user: null,
                        isLoading: false,
                    });
                    displayToast(userError.message, 'error');
                }
            } else {
                // User is signed out - invalidate all sessions
                if (currentSession) {
                    sessionManager.invalidateAllUserSessions(currentSession.userId);
                }
                setCurrentSession(null);
                setSessionId('');
                setAuthState({
                    user: null,
                    isLoading: false,
                });
                setUserSubscription(SubscriptionTier.FREE);
                setDailyAudioCount(0);
                setDailyUploadCount(0);
            }
        });

        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            if (authState.isLoading) {
                // Auth timeout, setting loading to false
                setAuthState(prev => ({ ...prev, isLoading: false }));
            }
        }, 5000); // 5 second timeout
        
        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.setAttribute('data-theme', 'dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
            document.body.setAttribute('data-theme', 'light');
            document.documentElement.style.colorScheme = 'light';
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // UI language is already handled in the main useEffect hook above

  const cleanupStreams = useCallback(() => {
    if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
    }
    // Cleanup AudioRecorder - gebruik destroy() voor volledige cleanup inclusief wakeLock
    if (audioRecorderRef.current) {
      audioRecorderRef.current.destroy();
      audioRecorderRef.current = null;
    }
    streamsRef.current.forEach(stream => stream.getTracks().forEach(track => track.stop()));
    streamsRef.current = [];
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    analyserRef.current = null;
  }, []);

  const reset = () => {
    cleanupStreams();
    if(timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    if(animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    animationFrameIdRef.current = null;
    window.speechSynthesis.cancel();


    setStatus(RecordingStatus.IDLE);
    setAudioURL(null);
    setTranscript('');
    setSummary('');
    setFaq('');
    setLearningDoc('');
    setFollowUpQuestions('');
    setBlogData('');
    setError(null);
    setDuration(0);
    setLanguage(null);
    setActiveView('transcript');
    setLoadingText('');
    setChatHistory([]);
    setChatInput('');
    setIsChatting(false);
    chatInstanceRef.current = null;
    setIsTTSEnabled(false);
    setIsListening(false);
    if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
    }
    setIsAnonymized(false);
    setAnonymizationReport(null);
    setPresentationReport(null);
    setKeywordAnalysis(null);
    setSentimentAnalysisResult(null);
    setIsAnalyzingSentiment(false);
    setSelectedKeyword(null);
    setKeywordExplanation(null);
    setIsFetchingExplanation(false);
    setVoiceInputPreview('');
    setPptTemplate(null);
    setShowPptOptions(false);
    setApiKeyError(null);


    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  };

  useEffect(() => {
    return () => {
      cleanupStreams();
      if(timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (speechRecognitionRef.current) speechRecognitionRef.current.stop();
      window.speechSynthesis.cancel();
    };
  }, [cleanupStreams]);


  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window) || !text) {
        return;
    }
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = getBcp47Code(language || 'en');
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
        console.error('Chat TTS SpeechSynthesis Error:', e.error);
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const submitMessage = useCallback(async (message: string) => {
    if (!message.trim() || isChatting) return;

    if (!apiKey) {
        displayToast('API key niet beschikbaar. Neem contact op met de administrator.', 'error');
        return;
    }
    
    // Import security utilities
    const { validateAndSanitizeForAI, rateLimiter } = await import('./src/utils/security');
    
    // Rate limiting check (max 15 chat messages per minute)
    const sessionId = 'chat_' + (auth.currentUser?.uid || 'anonymous');
    if (!rateLimiter.isAllowed(sessionId, 15, 60000)) {
        displayToast('Te veel chatberichten. Probeer het over een minuut opnieuw.', 'error');
        return;
    }
    
    // Validate and sanitize the message
    const validation = validateAndSanitizeForAI(message, 5000); // 5KB limit for chat messages
    if (!validation.isValid) {
        displayToast(`Ongeldig bericht: ${validation.error}`, 'error');
        return;
    }
    
    const sanitizedMessage = validation.sanitized;
    
    // Check transcript length based on user tier for chat
    const effectiveTier = userSubscription;
    const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
    if (!transcriptValidation.allowed) {
        displayToast(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }

    // Validate token usage for chat message
    const chatPrompt = `You are a helpful assistant. The user has provided a transcript of a meeting. Answer their questions based on this transcript:\n\n---\n${transcript}\n---\n\nUser message: ${sanitizedMessage}`;
    const tokenEstimate = tokenManager.estimateTokens(chatPrompt, 1.5);
    const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, tokenEstimate.totalTokens);
    
    if (!tokenValidation.allowed) {
        displayToast(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }
    
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: sanitizedMessage }, { role: 'model', text: '' }];
    setChatHistory(newHistory);
    setIsChatting(true);
    
    try {
        if (!chatInstanceRef.current) {
            const ai = new GoogleGenAI({ apiKey: apiKey });
            const modelName = await modelManager.getModelForFunction('expertChat');
            chatInstanceRef.current = ai.chats.create({
              model: modelName,
              history: chatHistory.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
              config: { systemInstruction: `You are a helpful assistant. The user has provided a transcript of a meeting. Answer their questions based on this transcript:\n\n---\n${transcript}\n---` },
            });
        }
        
        const responseStream = await chatInstanceRef.current.sendMessageStream({ message: sanitizedMessage });
        
        let fullResponse = '';
        for await (const chunk of responseStream) {
            fullResponse += chunk.text;
            setChatHistory(prev => prev.map((msg, i) => i === prev.length - 1 ? { ...msg, text: fullResponse } : msg));
        }
        
        // Track token usage with TokenManager
        const promptTokens = tokenCounter.countPromptTokens(sanitizedMessage);
        const responseTokens = tokenCounter.countResponseTokens(fullResponse);
        
        try {
            await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
        } catch (error) {
            console.error('Error recording token usage:', error);
        }
        
        if (isTTSEnabled) speak(fullResponse);

    } catch (err: any) {
        console.error("Fout bij chatten:", err);
        const errorMsg = `Chat error: ${err.message || 'Unknown error'}`;
        setChatHistory(prev => prev.map((msg, i) => i === prev.length - 1 ? { ...msg, text: errorMsg } : msg));
    } finally { setIsChatting(false); }
  }, [isChatting, chatHistory, transcript, isTTSEnabled, speak, apiKey, authState.user]);
  
  const handleSendMessage = useCallback(async () => {
    // Check if user has access to chat
    const effectiveTier = userSubscription;
    if (!subscriptionService.isFeatureAvailable(effectiveTier, 'chat')) {
        displayToast('Helaas heeft u niet genoeg credits om deze functie uit te voeren. Klik hier om te upgraden naar een hoger abonnement.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }
    
    const message = chatInput.trim();
    if (message) {
      if (!apiKey) {
        displayToast('API key niet beschikbaar. Neem contact op met de administrator.', 'error');
        return;
      }
      setChatInput('');
      await submitMessage(message);
    }
  }, [chatInput, submitMessage, apiKey, userSubscription, displayToast]);
  
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as Window & { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition();
        // By setting continuous to false, the recognition service stops after each utterance or timeout.
        // We then use the `onend` event to manually restart it, creating a more robust "continuous" experience
        // that is less prone to browser-specific timeout errors like 'no-speech'.
        recognition.continuous = false;
        recognition.interimResults = true; // Enable interim results for preview
        recognition.lang = getBcp47Code(language || 'en');

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            // Update preview met interim results
            setVoiceInputPreview(interimTranscript);
            
            // Als er final results zijn, verstuur het bericht
            if (finalTranscript.trim()) {
                setVoiceInputPreview(''); // Clear preview
                if (apiKey) {
                    submitMessage(finalTranscript.trim());
                } else {
                    displayToast('API key niet beschikbaar. Neem contact op met de administrator.', 'error');
                }
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            // The 'no-speech' error is common when the user pauses. We'll let the onend event handle
            // restarting the recognition, so we don't need to do anything here for that specific error.
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setIsListening(false);
                setError(t("speechRecognitionUnsupported"));
            }
        };

        recognition.onend = () => {
            // If the user still intends to be listening, restart the recognition service.
            // This creates a continuous loop that's resilient to timeouts.
            if (isListeningRef.current) {
                try {
                  recognition.start();
                } catch (e) {
                  console.error("Could not restart speech recognition", e);
                  setIsListening(false);
                }
            }
        };

        speechRecognitionRef.current = recognition;
    }
  }, [language, t, submitMessage, apiKey]);

  const toggleListening = () => {
    if (!speechRecognitionRef.current) {
        setError(t("speechRecognitionUnsupported"));
        return;
    }
    setIsListening(prev => !prev);
  };
  
  useEffect(() => {
      if(!speechRecognitionRef.current) return;
      if(isListening) {
          speechRecognitionRef.current.start();
      } else {
          speechRecognitionRef.current.stop();
      }
  }, [isListening]);

  // Check Web Speech API availability
  // Web Speech API functionaliteit verwijderd

    // Real-time transcription functionality removed


  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || (status !== RecordingStatus.RECORDING && status !== RecordingStatus.PAUSED)) {
      console.log('Visualizer conditions not met:', {
        hasCanvas: !!canvasRef.current,
        hasAnalyser: !!analyserRef.current,
        status,
        expectedStatuses: [RecordingStatus.RECORDING, RecordingStatus.PAUSED]
      });
      return;
    }
    
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) {
      console.warn('Canvas context not available');
      return;
    }

    // Zorg ervoor dat canvas de juiste afmetingen heeft
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width) {
      canvas.width = rect.width;
      console.log('Canvas width updated:', rect.width);
    }
    if (canvas.height !== rect.height) {
      canvas.height = rect.height;
      console.log('Canvas height updated:', rect.height);
    }

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    // Bereken gemiddelde amplitude en update UI-indicatoren
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += Math.abs(dataArray[i] - 128);
    }
    const averageAmplitude = sum / bufferLength;
    const normalized = Math.min(1, averageAmplitude / 64);
    const now = performance.now();
    if (now - lastLevelUpdateRef.current > 100) {
      setAvgInputLevel(normalized);
      lastLevelUpdateRef.current = now;
      const threshold = 0.02;
      if (normalized < threshold) {
        if (lastNoInputStartRef.current == null) lastNoInputStartRef.current = now;
        if (now - lastNoInputStartRef.current > 2000) setShowNoInputHint(true);
      } else {
        lastNoInputStartRef.current = null;
        setShowNoInputHint(false);
      }
    }

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(6 182 212)'; // cyan-500
    canvasCtx.beginPath();
    
    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for(let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height/2;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();
    
    // Debug info (alleen elke 30 frames om console niet te spammen)
    if (!animationFrameIdRef.current || animationFrameIdRef.current % 30 === 0) {
      console.log('Drawing visualizer:', {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        bufferLength,
        status,
        hasAnalyser: !!analyserRef.current,
        averageAmplitude: averageAmplitude.toFixed(2)
      });
    }
    
    // Als er geen audio is, toon een test patroon
    if (averageAmplitude < 1) {
      // Teken een test patroon om te laten zien dat canvas werkt
      canvasCtx.strokeStyle = 'rgba(6 182 212 0.3)';
      canvasCtx.lineWidth = 1;
      canvasCtx.beginPath();
      for (let i = 0; i < canvas.width; i += 20) {
        canvasCtx.moveTo(i, canvas.height / 2);
        canvasCtx.lineTo(i, canvas.height / 2 + Math.sin(i * 0.1) * 20);
      }
      canvasCtx.stroke();
    }
    
    animationFrameIdRef.current = requestAnimationFrame(drawVisualizer);
  }, [status]);

  // Start/stop audio visualisatie wanneer status verandert
  useEffect(() => {
    if (status === RecordingStatus.RECORDING || status === RecordingStatus.PAUSED) {
      // Start visualisatie na een korte delay om canvas te laten renderen
      const timer = setTimeout(() => {
        if (canvasRef.current && analyserRef.current) {
          if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
          }
          drawVisualizer();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Stop visualisatie
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    }
  }, [status, drawVisualizer]);


  const startRecording = async () => {
    if (!language || !outputLang) {
        setError(t("selectLangFirst"));
        return;
    }

    // Admins are always DIAMOND
    const effectiveTier = userSubscription;
    // Check subscription limits using total daily sessions across types
    const totalSessionsToday = (dailyAudioCount || 0) + (dailyUploadCount || 0);
    const canStart = subscriptionService.validateSessionStart(effectiveTier, totalSessionsToday);
    
    if (!canStart.allowed) {
        setError(canStart.reason || 'Subscription limit reached');
        setShowUpgradeModal(true);
        return;
    }
    // Reset all analysis data when starting new recording
    setTranscript('');
    setSummary('');
    setFaq('');
    setLearningDoc('');
    setFollowUpQuestions('');
    setBlogData('');
    setChatHistory([]);
    setKeywordAnalysis(null);
    setSentimentAnalysisResult(null);
    setMindmapMermaid('');
    setMindmapSvg('');
    setExecutiveSummaryData(null);
    setStorytellingData(null);
    setBusinessCaseData(null);
    setQuizQuestions(null);
    setAudioTokenUsage(null);
    setStatus(RecordingStatus.GETTING_PERMISSION);
    setError(null);
    setDuration(0);
    // Reset chunks en vorige audio URL
    audioChunksRef.current = [];
    if (audioURL) {
      try { URL.revokeObjectURL(audioURL); } catch {}
      setAudioURL(null);
    }

    try {
      // Initialize AudioRecorder if not already done
      if (!audioRecorderRef.current) {
        audioRecorderRef.current = new AudioRecorder();
        
        // Setup callbacks using the AudioRecorder API
        audioRecorderRef.current.setCallbacks({
          onDataAvailable: (chunks) => {
            // Sla binnenkomende chunks op voor transcribe
            audioChunksRef.current = chunks ? [...chunks] : [];
          },
          onStop: async (audioBlob: Blob) => {
            // Zorg dat we chunks hebben, ook als alleen eindblob binnenkomt
            if ((!audioChunksRef.current || audioChunksRef.current.length === 0) && audioBlob && audioBlob.size > 0) {
              audioChunksRef.current = [audioBlob];
            }
            const url = URL.createObjectURL(audioBlob);
            setAudioURL(url);
            setStatus(RecordingStatus.STOPPED);
            // Reset session recording status when recording stops
            sessionManager.setRecordingStatus(sessionId, false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
            
            // Automatisch cleanup als instelling is ingeschakeld (voor mobiele compatibiliteit)
            if (autoStopRecordingEnabled && audioRecorderRef.current) {
              try {
                await audioRecorderRef.current.cleanup();
                console.log('✅ Audio recorder automatisch gestopt en opgeruimd');
              } catch (error) {
                console.warn('⚠️ Fout bij automatisch opruimen audio recorder:', error);
              }
            }
          },
          onError: (error: Error) => {
            const userError = errorHandler.handleError(error, ErrorType.UNKNOWN, {
              userId: authState.user?.uid,
              sessionId: sessionId,
              additionalContext: { action: 'audioRecording' }
            });
            setError(`${t("errorRecording")}: ${userError.message}`);
            setStatus(RecordingStatus.ERROR);
            // Reset session recording status on error
            sessionManager.setRecordingStatus(sessionId, false);
          },
          onStateChange: (state) => {
            if (state === 'recording') {
              setStatus(RecordingStatus.RECORDING);
            } else if (state === 'paused') {
              setStatus(RecordingStatus.PAUSED);
            } else if (state === 'stopped') {
              setStatus(RecordingStatus.STOPPED);
            } else if (state === 'error') {
              setStatus(RecordingStatus.ERROR);
            }
          }
        });
      }
      
      // Start recording with the new AudioRecorder
      await audioRecorderRef.current.startRecording();
      
      // Update session recording status
      sessionManager.setRecordingStatus(sessionId, true);

      // Wire analyser to visualizer so the meter works
      analyserRef.current = audioRecorderRef.current.getAnalyser();

      // Kick off visualizer immediately if recording/paused
      if (status === RecordingStatus.RECORDING || status === RecordingStatus.PAUSED) {
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        setTimeout(() => {
          if (canvasRef.current && analyserRef.current) {
            drawVisualizer();
          }
        }, 50);
      }
      
      // Initialize timing
      const start = Date.now();
      setRecordingStartMs(start);
      setPauseAccumulatedMs(0);
      setPauseStartMs(null);

      // Start timer for duration tracking and subscription limits using actual time
      timerIntervalRef.current = window.setInterval(() => {
        const currentTime = Date.now();
        const elapsedMs = currentTime - start - pauseAccumulatedMs - (pauseStartMs ? (currentTime - pauseStartMs) : 0);
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        
        setDuration(elapsedSeconds);
        
        const tierLimits = subscriptionService.getTierLimits(effectiveTier);
        if (tierLimits && elapsedSeconds >= tierLimits.maxSessionDuration * 60) {
          // Stop recording immediately at limit
          audioRecorderRef.current?.stopRecording();
          setStatus(RecordingStatus.STOPPED);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          displayToast(`Opname gestopt: je hebt de maximale opnametijd van ${tierLimits.maxSessionDuration} minuten bereikt.`, 'info');
        }
      }, 1000);

    } catch (err: any) {
      console.error("Fout bij opstarten opname:", err);
      let errorMessage = t("unknownError");

      if (err.name === 'NotAllowedError' || (err.message && err.message.toLowerCase().includes('permission denied'))) {
        errorMessage = t("permissionDenied");
      } else if (err.name === 'NotFoundError') {
        errorMessage = t("noDevices");
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(`${t("errorRecording")}: ${errorMessage}`);
      setStatus(RecordingStatus.ERROR);
      // Reset session recording status on error
      sessionManager.setRecordingStatus(sessionId, false);
    }
  };
  const pauseRecording = () => {
    if (audioRecorderRef.current?.isRecording) {
        audioRecorderRef.current.pauseRecording();
        // status will be updated by onStateChange callback
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        setPauseStartMs(Date.now());
    }
  };

  const resumeRecording = () => {
    if (audioRecorderRef.current?.isPaused) {
        audioRecorderRef.current.resumeRecording();
        // status will be updated by onStateChange callback
        // accumulate pause time
        setPauseAccumulatedMs(prev => prev + (pauseStartMs ? (Date.now() - pauseStartMs) : 0));
        setPauseStartMs(null);
        
        // Restart timer using actual time calculation
        timerIntervalRef.current = window.setInterval(() => {
          const currentTime = Date.now();
          const elapsedMs = currentTime - (recordingStartMs || Date.now()) - pauseAccumulatedMs - (pauseStartMs ? (currentTime - pauseStartMs) : 0);
          const elapsedSeconds = Math.floor(elapsedMs / 1000);
          setDuration(elapsedSeconds);
        }, 1000);
    }
  };

  const stopRecording = async () => {
    if (audioRecorderRef.current && (status === RecordingStatus.RECORDING || status === RecordingStatus.PAUSED)) {
      try {
        // Stop recording and ensure complete cleanup
        await audioRecorderRef.current.stopRecording();
        
        // Force cleanup to release all resources including wakeLock
        await audioRecorderRef.current.cleanup();
        
        // Update session recording status
        sessionManager.setRecordingStatus(sessionId, false);
        
        // Clear pause state
        setPauseStartMs(null);
        
        console.log('✅ Audio opname volledig gestopt en alle resources vrijgegeven');
      } catch (error) {
        console.error('❌ Fout bij stoppen van audio opname:', error);
      }
    }
  };
    // Text extraction functions
    const extractTextFromPDF = async (file: File): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            try {
                // Dynamically import PDF.js (ESM)
                const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
                // Use local worker bundled by Vite to avoid CORS
                GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const arrayBuffer = e.target?.result as ArrayBuffer;
                        if (!arrayBuffer) {
                            reject(new Error('Kon PDF niet lezen'));
                            return;
                        }

                        const pdf = await getDocument({ data: arrayBuffer }).promise;

                        let fullText = '';
                        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                            const page = await pdf.getPage(pageNum);
                            const textContent = await page.getTextContent();
                            const pageText = (textContent.items as any[])
                                .map((item: any) => (item && item.str ? item.str : ''))
                                .join(' ');
                            fullText += pageText + '\n\n';
                        }

                        const cleanedText = fullText
                            .replace(/\s+\n/g, '\n')
                            .replace(/\n\s+/g, '\n')
                            .replace(/\n{3,}/g, '\n\n')
                            .trim();

                        if (!cleanedText) {
                            reject(new Error('Geen tekst gevonden in PDF. Mogelijk is het een afbeelding-PDF.'));
                            return;
                        }
                        resolve(cleanedText);
                    } catch (error: unknown) {
                        console.error('PDF parsing error:', error);
                        reject(new Error(`PDF verwerking mislukt: ${error instanceof Error ? error.message : 'onbekende fout'}`));
                    }
                };
                reader.onerror = () => reject(new Error('PDF lezen mislukt'));
                reader.readAsArrayBuffer(file);
            } catch (error: unknown) {
                reject(new Error(`PDF library laden mislukt: ${error instanceof Error ? error.message : 'onbekende fout'}`));
            }
        });
    };

    const extractTextFromRTF = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const rtfText = e.target?.result as string;
                    if (!rtfText) {
                        reject(new Error('Kon RTF niet lezen'));
                        return;
                    }
                    
                    // Eenvoudige RTF naar tekst conversie
                    // Verwijder RTF formatting codes
                    let cleanText = rtfText
                        .replace(/\\[a-z]+\d*\s?/g, '') // RTF control words
                        .replace(/\{[^}]*\}/g, '') // RTF groups
                        .replace(/\\'/g, "'") // Escaped quotes
                        .replace(/\\"/g, '"') // Escaped quotes
                        .replace(/\\\s/g, ' ') // Escaped spaces
                        .replace(/\s+/g, ' ') // Multiple spaces
                        .trim();
                    
                    if (!cleanText) {
                        reject(new Error('Geen leesbare tekst gevonden in RTF bestand.'));
                        return;
                    }
                    
                    resolve(cleanText);
                } catch (error) {
                    reject(new Error('RTF verwerking mislukt'));
                }
            };
            reader.onerror = () => reject(new Error('RTF lezen mislukt'));
            reader.readAsText(file);
        });
    };

    const extractTextFromHTMLFile = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const html = e.target?.result as string;
                    if (!html) {
                        reject(new Error('Kon HTML niet lezen'));
                        return;
                    }
                    
                    // Maak een DOM parser om HTML tekst te extraheren
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    // Verwijder script en style tags
                    const scripts = doc.querySelectorAll('script, style');
                    scripts.forEach(script => script.remove());
                    
                    // Haal tekst op uit body
                    const text = doc.body?.textContent || doc.documentElement.textContent || '';
                    resolve(text.trim());
                } catch (error) {
                    reject(new Error('HTML verwerking mislukt'));
                }
            };
            reader.onerror = () => reject(new Error('HTML lezen mislukt'));
            reader.readAsText(file);
        });
    };
    const extractTextFromMarkdown = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const markdown = e.target?.result as string;
                    if (!markdown) {
                        reject(new Error('Kon Markdown niet lezen'));
                        return;
                    }
                    
                    // Eenvoudige Markdown naar tekst conversie
                    // Verwijder markdown syntax
                    let text = markdown
                        .replace(/^#+\s+/gm, '') // Headers
                        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
                        .replace(/\*(.*?)\*/g, '$1') // Italic
                        .replace(/`(.*?)`/g, '$1') // Code
                        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
                        .replace(/^\s*[-*+]\s+/gm, '') // Lists
                        .replace(/^\s*\d+\.\s+/gm, '') // Numbered lists
                        .replace(/^\s*>\s+/gm, '') // Blockquotes
                        .replace(/^\s*\|.*\|$/gm, '') // Tables
                        .replace(/\n\s*\n/g, '\n\n'); // Multiple newlines
                    
                    resolve(text.trim());
                } catch (error) {
                    reject(new Error('Markdown verwerking mislukt'));
                }
            };
            reader.onerror = () => reject(new Error('Markdown lezen mislukt'));
            reader.readAsText(file);
        });
    };

    const extractTextFromDOCX = async (file: File): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            try {
                // Dynamically import mammoth for DOCX processing
                const mammoth = await import('mammoth');
                
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const arrayBuffer = e.target?.result as ArrayBuffer;
                        if (!arrayBuffer) {
                            reject(new Error('Kon DOCX niet lezen'));
                            return;
                        }

                        const result = await mammoth.extractRawText({ arrayBuffer });
                        const text = result.value;
                        
                        if (!text.trim()) {
                            reject(new Error('Geen tekst gevonden in DOCX bestand.'));
                            return;
                        }
                        
                        resolve(text.trim());
                    } catch (error: unknown) {
                        console.error('DOCX parsing error:', error);
                        reject(new Error(`DOCX verwerking mislukt: ${(error as Error).message || 'onbekende fout'}`));
                    }
                };
                reader.onerror = () => reject(new Error('DOCX lezen mislukt'));
                reader.readAsArrayBuffer(file);
            } catch (error: any) {
                reject(new Error(`DOCX library laden mislukt: ${error.message || 'onbekende fout'}`));
            }
        });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!language) {
            setError(t("selectLangToUpload"));
            return;
        }

        // Preflight subscription checks for upload
        const effectiveTier = userSubscription;
        const fileType = (file.type || '').toLowerCase();
        const fileName = (file.name || '').toLowerCase();
        const isTxt = fileType === 'text/plain' || fileName.endsWith('.txt');
        // Enforce Free only TXT
        if (effectiveTier === SubscriptionTier.FREE && !isTxt) {
            setShowUpgradeModal(true);
            setError('Upload mislukt: Je huidige abonnement ondersteunt alleen TXT-bestanden voor transcriptie. Upgrade naar Silver of Gold om andere type bestanden te uploaden.');
            return;
        }

        // Generic allowed types per tier
        const allowed = subscriptionService.isFileTypeAllowed(effectiveTier, isTxt ? 'text/plain' : fileType || (fileName.endsWith('.md') ? 'text/markdown' : ''));
        if (!allowed) {
            setShowUpgradeModal(true);
            setError('Upload mislukt: Dit bestandstype wordt niet ondersteund voor jouw tier.');
            return;
        }

        // Enforce daily session limits before processing
        const totalSessionsToday = (dailyAudioCount || 0) + (dailyUploadCount || 0);
        const canStart = subscriptionService.validateSessionStart(effectiveTier, totalSessionsToday);
        if (!canStart.allowed) {
            setShowUpgradeModal(true);
            setError(canStart.reason || t('errorDailySessionLimit'));
            return;
        }

        setError(null);
        setAnonymizationReport(null);
        setLoadingText('Bestand verwerken...');

        try {
            let text = '';
            
            // Validate token usage for file processing
            if (authState.user) {
                // Estimate tokens based on file size (rough estimation)
                const fileSizeKB = file.size / 1024;
                const estimatedTokens = Math.ceil(fileSizeKB * 0.75); // Rough estimation: 0.75 tokens per KB
                
                const tokenValidation = await tokenManager.validateTokenUsage(
                    authState.user.uid,
                    effectiveTier,
                    estimatedTokens
                );
                
                if (!tokenValidation.allowed) {
                    setError(tokenValidation.reason || 'Token limiet bereikt voor bestandsverwerking.');
                    setLoadingText('');
                    return;
                }
            }
            // fileType, fileName defined above

            // PDF bestanden
            if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
                text = await extractTextFromPDF(file);
            }
            // RTF bestanden
            else if (fileType === 'application/rtf' || fileName.endsWith('.rtf')) {
                text = await extractTextFromRTF(file);
            }
            // HTML bestanden
            else if (fileType === 'text/html' || fileName.endsWith('.html') || fileName.endsWith('.htm')) {
                text = await extractTextFromHTMLFile(file);
            }
            // Markdown bestanden
            else if (fileType === 'text/markdown' || fileName.endsWith('.md')) {
                text = await extractTextFromMarkdown(file);
            }
            // DOCX bestanden
            else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
                text = await extractTextFromDOCX(file);
            }
            // Plain text bestanden
            else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
                text = await file.text();
            }
            // Onbekende bestanden - probeer als tekst te lezen
            else {
                try {
                    text = await file.text();
                } catch {
                    throw new Error(t('unsupportedFileFormat', 'Bestandsformaat wordt niet ondersteund. Probeer PDF, RTF, HTML, MD, DOCX of TXT.'));
                }
            }

            if (!text.trim()) {
                throw new Error(t('noTextFound', 'Geen tekst gevonden in het bestand.'));
            }

            setTranscript(text);
            
            // Record actual token usage for file processing
            try {
                if (authState.user) {
                    const actualTokens = tokenCounter.countTokens(text);
                    await tokenManager.recordTokenUsage(authState.user.uid, 0, actualTokens); // No prompt tokens for file upload
                }
            } catch (error) {
                console.warn('Could not record token usage:', error);
            }
            
            // Extract email addresses from transcript
            const extractedEmails = extractEmailAddresses(text);
            setEmailAddresses(extractedEmails);
            // Reset all analysis data when new transcript is loaded
            setSummary('');
            setFaq('');
            setLearningDoc('');
            setFollowUpQuestions('');
            setChatHistory([]);
            setKeywordAnalysis(null);
            setSentimentAnalysisResult(null);
            setMindmapMermaid('');
            setMindmapSvg('');
            setExecutiveSummaryData(null);
            setStorytellingData(null);
            setBusinessCaseData(null);
            setQuizQuestions(null);
            setStatus(RecordingStatus.FINISHED);
            // Increment usage counters on successful finish
            try {
              if (authState.user) {
                await incrementUserDailyUsage(authState.user.uid, 'upload');
                await incrementUserMonthlySessions(authState.user.uid);
                setDailyUploadCount(prev => prev + 1);
              }
            } catch (e) {
              console.warn(t('errorUpdateSessionCount'), e);
            }
            setActiveView('transcript');
            setLoadingText('');
            
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err: any) {
            console.error("Fout bij lezen van bestand:", err);
            setError(`${t("fileReadFailed")}: ${err.message || t("unknownError")}`);
            setStatus(RecordingStatus.ERROR);
            setLoadingText('');
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!language) {
            setError(t("selectLangToUpload"));
            return;
        }

        // Check tier access for image upload
        const effectiveTier = userSubscription;
        if (effectiveTier !== SubscriptionTier.GOLD && 
            effectiveTier !== SubscriptionTier.DIAMOND && 
            effectiveTier !== SubscriptionTier.ENTERPRISE) {
            setShowUpgradeModal(true);
            setError('Image upload is alleen beschikbaar voor Gold, Diamond en Enterprise abonnementen.');
            return;
        }

        // Check if file is an image
        const fileType = (file.type || '').toLowerCase();
        const fileName = (file.name || '').toLowerCase();
        const isValidImage = fileType.startsWith('image/') || 
                           fileName.endsWith('.jpg') || 
                           fileName.endsWith('.jpeg') || 
                           fileName.endsWith('.png') || 
                           fileName.endsWith('.webp') || 
                           fileName.endsWith('.gif');
        
        if (!isValidImage) {
            setError(t('errorOnlyImageFiles'));
            return;
        }

        // Enforce daily session limits before processing
        const totalSessionsToday = (dailyAudioCount || 0) + (dailyUploadCount || 0);
        const canStart = subscriptionService.validateSessionStart(effectiveTier, totalSessionsToday);
        if (!canStart.allowed) {
            setShowUpgradeModal(true);
            setError(canStart.reason || t('errorDailySessionLimit'));
            return;
        }

        setError(null);
        setAnonymizationReport(null);
        setLoadingText(t('loadingAnalyzingImage'));

        try {
            // Convert image to base64 for Gemini API
            const reader = new FileReader();
            reader.onload = async (e) => {
              try {
                const base64Data = e.target?.result as string;
                const base64Image = base64Data.split(',')[1]; // Remove data:image/...;base64, prefix
                
                if (!apiKey) {
                  setError(t('errorApiKeyNotAvailable'));
                  setLoadingText('');
                  return;
                }
                
                setLoadingText(t('loadingAnalyzingImageWithAI'));
                
                // Validate token usage for image analysis
                if (authState.user) {
                    const inputLanguage = getGeminiCode(language || 'en');
                    const analysisPrompt = `Analyze this image in detail and provide a comprehensive description in ${inputLanguage}. Include:

1. What you see in the image (objects, people, text, scenes)
2. Key details and important information
3. Any text visible in the image (transcribe it accurately)
4. Context and setting
5. Notable features or elements

Provide a detailed analysis that could be used for further AI processing and analysis.`;
                    
                    // Estimate tokens for image analysis (images typically use more tokens)
                    const tokenEstimate = tokenManager.estimateTokens(analysisPrompt, 3);
                    
                    const tokenValidation = await tokenManager.validateTokenUsage(
                        authState.user.uid,
                        effectiveTier,
                        tokenEstimate.totalTokens
                    );
                    
                    if (!tokenValidation.allowed) {
                        setError(tokenValidation.reason || t('errorTokenLimitImageAnalysis'));
                        setLoadingText('');
                        return;
                    }
                }
                
                const ai = new GoogleGenAI({ apiKey: apiKey });
                const modelName = await modelManager.getModelForFunction('analysisGeneration');
                const inputLanguage = getGeminiCode(language || 'en');
                const analysisPrompt = `Analyze this image in detail and provide a comprehensive description in ${inputLanguage}. Include:

1. What you see in the image (objects, people, text, scenes)
2. Key details and important information
3. Any text visible in the image (transcribe it accurately)
4. Context and setting
5. Notable features or elements

Provide a detailed analysis that could be used for further AI processing and analysis.`;
                
                const imagePart = { inlineData: { mimeType: file.type, data: base64Image } };
                const textPart = { text: analysisPrompt };
                
                const analysisResponse = await ai.models.generateContent({ 
                  model: modelName, 
                  contents: { parts: [textPart, imagePart] } 
                });
                
                // Track token usage with TokenManager
                const promptTokens = tokenCounter.countPromptTokens([textPart]);
                const responseTokens = tokenCounter.countResponseTokens(analysisResponse.text);
                
                // Record actual token usage
                try {
                  if (authState.user) {
                    await tokenManager.recordTokenUsage(authState.user.uid, promptTokens, responseTokens);
                  }
                } catch (error) {
                  console.warn('Could not record token usage:', error);
                }
                
                const imageAnalysisText = `${t('imageAnalyzedLabel')}\n\n${t('fileInfoFilename')} ${file.name}\n${t('fileInfoType')} ${file.type}\n${t('fileInfoSize')} ${(file.size / 1024 / 1024).toFixed(2)} MB\n\n${t('aiAnalysisHeader')}\n\n${analysisResponse.text}`;
                
                setTranscript(imageAnalysisText);
                
                // Reset all analysis data when new transcript is loaded
                setSummary('');
                setFaq('');
                setLearningDoc('');
                setFollowUpQuestions('');
                setChatHistory([]);
                setKeywordAnalysis(null);
                setSentimentAnalysisResult(null);
                setMindmapMermaid('');
                setMindmapSvg('');
                setExecutiveSummaryData(null);
                setStorytellingData(null);
                setBusinessCaseData(null);
                setQuizQuestions(null);
                setStatus(RecordingStatus.FINISHED);
                
                // Increment usage counters on successful finish
                try {
                  if (authState.user) {
                    await incrementUserDailyUsage(authState.user.uid, 'upload');
                    await incrementUserMonthlySessions(authState.user.uid);
                    setDailyUploadCount(prev => prev + 1);
                  }
                } catch (e) {
                  console.warn(t('errorUpdateSessionCount'), e);
                }
                
                setActiveView('transcript');
                setLoadingText('');
                
                if (imageInputRef.current) {
                    imageInputRef.current.value = "";
                }
                
              } catch (error: any) {
                console.error(t('errorImageAnalysis'), error);
                setError(`Fout bij afbeeldingsanalyse: ${error.message || 'Onbekende fout'}`);
                setLoadingText('');
              }
            };
            
            reader.readAsDataURL(file);
        } catch (err: any) {
            console.error("Fout bij verwerken van afbeelding:", err);
            setError(`Fout bij verwerken van afbeelding: ${err.message || t("unknownError")}`);
            setStatus(RecordingStatus.ERROR);
            setLoadingText('');
        }
    };

    // Helper function to extract text from EML files
    const extractTextFromEML = (emlContent: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            readEml(emlContent, (error: any, data: any) => {
                if (error) {
                    console.error(t('errorParsingEml'), error);
                    return reject(error);
                }
                resolve(data.text || '');
            });
        });
    };

    const extractTextFromMSG = (msgBuffer: ArrayBuffer): Promise<string> => {
        return new Promise((resolve, reject) => {
            try {
                const msgReader = new MsgReader(msgBuffer);
                const fileData = msgReader.getFileData();
                
                if (!fileData) {
                    return reject(new Error(t('errorReadMsgFile')));
                }
                
                // Extract text content from MSG file
                let textContent = '';
                
                // Try to get body text
                if (fileData.body) {
                    textContent = fileData.body;
                } else if (fileData.bodyHtml) {
                    // If only HTML body is available, strip HTML tags
                    textContent = fileData.bodyHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                }
                
                // Add subject if available
                if (fileData.subject) {
                    textContent = `${t('emailSubjectLabel')} ${fileData.subject}\n\n${textContent}`;
                }
                
                resolve(textContent || '');
            } catch (error) {
                console.error(t('errorParsingMsg'), error);
                reject(error);
            }
        });
    };

    const handleEmailImport = async (file: File): Promise<string | null> => {
        return new Promise((resolve, reject) => {
            // Validate file type
            const fileExtension = file.name.toLowerCase().split('.').pop();
            if (!fileExtension || !['eml', 'msg'].includes(fileExtension)) {
                setError(t('invalidEmailFileType'));
                resolve(null);
                return;
            }

            // Check subscription tier for email import
            if (userSubscription === SubscriptionTier.FREE) {
                setError(t('emailImportRequiresSilver'));
                resolve(null);
                return;
            }

            // Check daily session limit
            const totalSessionsToday = (dailyAudioCount || 0) + (dailyUploadCount || 0);
            const canStart = subscriptionService.validateSessionStart(userSubscription, totalSessionsToday);
            if (!canStart.allowed) {
                setError(canStart.reason || t('dailyLimitReached'));
                resolve(null);
                return;
            }

            // Read email file based on type
            const reader = new FileReader();
            
            if (fileExtension === 'msg') {
                // Read MSG file as ArrayBuffer
                reader.onload = async (e) => {
                    try {
                        const msgBuffer = e.target?.result as ArrayBuffer;
                        const extractedText = await extractTextFromMSG(msgBuffer);

                        if (!extractedText.trim()) {
                            setError(t('noTextFoundInEmail'));
                            resolve(null);
                            return;
                        }
                        resolve(extractedText);
                    } catch (error) {
                        console.error(t('errorProcessingMsg'), error);
                        setError(t('emailProcessingError'));
                        resolve(null);
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                // Read EML file as text
                reader.onload = async (e) => {
                    try {
                        const emlContent = e.target?.result as string;
                        const extractedText = await extractTextFromEML(emlContent);

                        if (!extractedText.trim()) {
                            setError(t('noTextFoundInEmail'));
                            resolve(null);
                            return;
                        }
                        resolve(extractedText);
                    } catch (error) {
                        console.error(t('errorProcessingEml'), error);
                        setError(t('emailProcessingError'));
                        resolve(null);
                    }
                };
                reader.readAsText(file);
             }

            reader.onerror = () => {
                setError(t('emailReadError'));
                resolve(null);
            };

            reader.onerror = () => {
                setError(t('emailReadError'));
                resolve(null);
            };
        });
    };

    const handleAnalyzeEmail = async (text: string) => {
        await handlePasteTranscript(text);
        emailUploadModal.close();
        setActiveTab('Analyse');
    };

    const handlePasteTranscript = async (pastedText: string) => {
        if (!language) {
            setError(t("selectLangToUpload"));
            return;
        }

        // Import security utilities
        const { validateAndSanitizeForAI, rateLimiter } = await import('./src/utils/security');
        
        // Rate limiting check (max 5 paste operations per minute)
        const sessionId = 'paste_' + (auth.currentUser?.uid || 'anonymous');
        if (!rateLimiter.isAllowed(sessionId, 5, 60000)) {
            setError(t('errorTooManyPasteActions'));
            return;
        }
        
        // Validate and sanitize the pasted text
        const validation = validateAndSanitizeForAI(pastedText, 100000); // 100KB limit
        if (!validation.isValid) {
            setError(t('errorInvalidText', { error: validation.error }));
            return;
        }
        
        const sanitizedText = validation.sanitized;
        
        if (!sanitizedText.trim()) {
            setError(t('errorNoValidTextPasted'));
            return;
        }

        // Preflight subscription checks for paste
        const effectiveTier = userSubscription;
        
        // Enforce daily session limits before processing
        const totalSessionsToday = (dailyAudioCount || 0) + (dailyUploadCount || 0);
        const canStart = subscriptionService.validateSessionStart(effectiveTier, totalSessionsToday);
        if (!canStart.allowed) {
            setShowUpgradeModal(true);
            setError(canStart.reason || 'Dagelijkse sessielimiet bereikt.');
            return;
        }

        // Token validation for pasted text
        const textLength = sanitizedText.length;
        const estimatedTokens = Math.ceil(textLength / 4); // Rough estimate: 4 characters per token
        
        const tokenValidation = await tokenManager.validateTokenUsage(
            authState.user?.uid || '',
            effectiveTier,
            estimatedTokens
        );
        
        if (!tokenValidation.allowed) {
            setError(tokenValidation.reason || t('errorTokenLimit'));
            setShowUpgradeModal(true);
            return;
        }

        setError(null);
        setAnonymizationReport(null);
        setLoadingText(t('loadingProcessingPastedText'));

        try {
            setTranscript(sanitizedText);
        
        // Extract email addresses from the transcript
        const extractedEmails = extractEmailAddresses(sanitizedText);
        setEmailAddresses(extractedEmails);
        
        // Record actual token usage for pasted text
        try {
            const actualTokens = tokenCounter.countTokens(sanitizedText);
            await tokenManager.recordTokenUsage(
                authState.user?.uid || '',
                actualTokens,
                0 // No response tokens for paste operation
            );
        } catch (tokenError) {
            console.warn('Could not record token usage for paste:', tokenError);
        }
        
        // Reset all analysis data when new transcript is loaded
        setSummary('');
        setFaq('');
            setLearningDoc('');
            setFollowUpQuestions('');
            setChatHistory([]);
            setKeywordAnalysis(null);
            setSentimentAnalysisResult(null);
            setMindmapMermaid('');
            setMindmapSvg('');
            setExecutiveSummaryData(null);
            setStorytellingData(null);
            setBusinessCaseData(null);
            setQuizQuestions(null);
            setStatus(RecordingStatus.FINISHED);
            // Increment usage counters on successful finish
            try {
              if (authState.user) {
                await incrementUserDailyUsage(authState.user.uid, 'upload');
                await incrementUserMonthlySessions(authState.user.uid);
                setDailyUploadCount(prev => prev + 1);
              }
            } catch (e) {
              console.warn(t('errorUpdateSessionCount'), e);
            }
            setActiveView('transcript');
            setLoadingText('');
            pasteModal.close();
        } catch (err: any) {
            console.error("Fout bij verwerken van geplakte tekst:", err);
            setError(`${t("fileReadFailed")}: ${err.message || t("unknownError")}`);
            setStatus(RecordingStatus.ERROR);
            setLoadingText('');
        }
    };

    const handleWebPage = async (url: string, useDeepseekOption = false, multipleUrls: string[] = []) => {
        // Check if user is on Gold or Diamond tier if trying to use WebExpert
  if (useDeepseekOption && 
      userSubscription !== SubscriptionTier.GOLD && 
      userSubscription !== SubscriptionTier.DIAMOND) {
    setWebPageError(t("goldTierRequired", "WebExpert option is only available for Gold and Diamond tier subscribers."));
            return;
        }

        if (!language) {
            setWebPageError(t("selectLangToUpload"));
            return;
        }

        if (!url.trim()) {
            setWebPageError(t("noUrlError", 'No URL entered. Please enter a valid URL first.'));
            return;
        }

        // Get effective tier for token validation
        const effectiveTier = userSubscription;
        
        // Estimate tokens for web page processing (rough estimate)
        const estimatedTokens = useDeepseekOption ? 15000 : 8000; // WebExpert uses more tokens
        
        const tokenValidation = await tokenManager.validateTokenUsage(
            authState.user?.uid || '',
            effectiveTier,
            estimatedTokens
        );
        
        if (!tokenValidation.allowed) {
            setWebPageError(tokenValidation.reason || 'Token limiet bereikt.');
            setShowUpgradeModal(true);
            return;
        }

        setWebPageError(null);
        setError(null);
        setAnonymizationReport(null);
        setLoadingText(useDeepseekOption ?
    t('loadingWebExpertAnalysis') :
            t('loadingWebPageExtraction'));
        setIsLoadingWebPage(true);

        try {
            let cleanText = '';
            
            if (useDeepseekOption) {
                // Use Firecrawl API for deepseek option
                const firecrawlApiKey = import.meta.env.VITE_FIRECRAWL_API_KEY;
                if (!firecrawlApiKey) {
                    throw new Error(t('firecrawlNotConfigured', 'Firecrawl API key is not configured.'));
                }
                
                // Filter out empty URLs
                const validUrls = multipleUrls.filter(u => u.trim() !== '');
                
                console.log('Firecrawl API: Processing URLs:', validUrls);
                
                // Process multiple URLs using Firecrawl v2 API
                const allResults = [];
                
                for (const singleUrl of validUrls) {
                    console.log('Processing URL with Firecrawl v2:', singleUrl);
                    
                    const response = await fetch('https://api.firecrawl.dev/v2/scrape', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${firecrawlApiKey}`
                        },
                        body: JSON.stringify({
                            url: singleUrl,
                            formats: ['markdown', 'html'],
                            onlyMainContent: true,
                            includeTags: ['title', 'meta', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'article', 'section'],
                            removeBase64Images: true,
                            blockAds: true
                        })
                    });
                    
                    console.log(`Firecrawl v2 Response Status for ${singleUrl}:`, response.status);
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`Firecrawl v2 Error for ${singleUrl}:`, errorText);
                        continue; // Skip this URL and continue with others
                    }
                    
                    const data = await response.json();
                    console.log(`Firecrawl v2 Response Data for ${singleUrl}:`, data);
                    
                    if (data.success && data.data) {
                        // Prefer HTML content, fallback to markdown, then general content
                        const content = data.data.html || data.data.markdown || data.data.content || '';
                        allResults.push({
                            url: singleUrl,
                            content: content,
                            metadata: data.data.metadata || {}
                        });
                    }
                }
                
                console.log('Firecrawl v2 API: Processed', allResults.length, 'URLs successfully');
                
                if (allResults.length === 0) {
                    throw new Error(t('noContentRetrieved', 'No content could be retrieved from any of the provided URLs.'));
                }
                
                // Combine text from all successfully processed URLs
                cleanText = allResults.map((result: any) => {
                    const content = result.content || '';
                    const title = result.metadata?.title || 'Untitled';
                    return `Source: ${result.url}\nTitle: ${title}\n\n${content}`;
                }).join('\n\n---\n\n');
                
                if (cleanText.length < 100) {
                    throw new Error(t('littleTextRetrieved', 'Very little text could be retrieved from these web pages.'));
                }
            } else {
                // Use improved fetchHTML implementation for regular option
                try {
                    const result = await fetchHTML(url, {
                        timeoutMs: 15000,
                        retries: 2,
                        retryDelay: 1000,
                        userAgent: "RecapHorizon/1.0 (Web Content Analyzer)"
                    });
                    
                    console.log('Successfully fetched:', result.metadata?.title || 'Untitled');
                    console.log('Content length:', result.content.length);
                    
                    // Extract clean text from HTML
                    cleanText = extractTextFromHTML(result.content);
                    
                    if (cleanText.length < 100) {
                        throw new Error(t('littleTextRetrievedSingle', 'Very little text could be retrieved from this web page. This may be due to security settings or because the page contains little text.'));
                    }
                    
                } catch (fetchError) {
                    console.warn(t('directFetchFailed', 'Direct fetch failed, falling back to CORS proxy:'), fetchError);
                    
                    // Fallback to CORS proxy method
                    const corsProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
                    const response = await fetch(corsProxyUrl);
                    if (!response.ok) {
                        throw new Error(t('httpErrorStatus', 'HTTP error! status: {status}', { status: response.status }));
                    }
                    
                    const proxyData = await response.json();
                    if (!proxyData.contents) {
                        throw new Error(t('couldNotRetrieveProxy', 'Could not retrieve content from the web page via proxy.'));
                    }
                    
                    // Extract clean text from HTML using our utility
                    cleanText = extractTextFromHTML(proxyData.contents);
                    
                    if (cleanText.length < 100) {
                        throw new Error(t('littleTextRetrievedSingle', 'Very little text could be retrieved from this web page. This may be due to security settings or because the page contains little text.'));
                    }
                }
            }



            setTranscript(cleanText);
            
            // Record actual token usage for web page processing
            try {
                const actualTokens = tokenCounter.countTokens(cleanText);
                await tokenManager.recordTokenUsage(
                    authState.user?.uid || '',
                    actualTokens,
                    0 // No response tokens for web page import
                );
            } catch (tokenError) {
                console.warn('Could not record token usage for web page:', tokenError);
            }
            
            // Reset all analysis data when new transcript is loaded
            setSummary('');
            setFaq('');
            setLearningDoc('');
            setFollowUpQuestions('');
            setChatHistory([]);
            setKeywordAnalysis(null);
            setSentimentAnalysisResult(null);
            setMindmapMermaid('');
            setMindmapSvg('');
            setExecutiveSummaryData(null);
            setStorytellingData(null);
            setBusinessCaseData(null);
            setQuizQuestions(null);
            setStatus(RecordingStatus.FINISHED);
            
            setActiveView('transcript');
            setLoadingText('');
            setShowWebPageModal(false);
            setWebPageUrl('');
            setWebPageUrls(['', '', '']);
            setUseDeepseek(false);
            setWebPageError(null);
            
            const successMessage = useDeepseekOption
        ? (t("webPageWebExpertSuccess", 'Web pages successfully analyzed with WebExpert!')) 
                : (t("webPageSuccess", 'Web page successfully loaded and processed!'));
            displayToast(successMessage, 'success');
        } catch (err: any) {
            console.error("Error loading web page:", err);
            console.error("Error details:", {
                message: err.message,
                stack: err.stack,
                useDeepseekOption,
                validUrls: useDeepseekOption ? multipleUrls.filter(u => u.trim() !== '') : [url],
                firecrawlApiKey: import.meta.env.VITE_FIRECRAWL_API_KEY ? 'Present' : 'Missing'
            });
            
            let errorMessage = err.message || t("webPageGenericError", 'An error occurred while loading the web page.');
            
            if (err.message.includes('Firecrawl API key')) {
                errorMessage = t("firecrawlApiKeyError", 'Firecrawl API key is missing. Please check your configuration.');
            } else if (err.message.includes('Firecrawl API error')) {
                errorMessage = t("firecrawlApiError", 'Error with Firecrawl API. Please try again later.');
                console.error('Firecrawl API specific error:', err.message);
            } else if (err.message.includes('HTTP error') || err.message.includes('status')) {
                errorMessage = t("webPageLoadError", 'The web page could not be loaded. Check if the URL is correct and try again.');
            } else if (err.message.includes('security settings')) {
                errorMessage = t("webPageSecurityError", 'The web page could not be loaded due to security settings. Try another URL or contact the website owner.');
            } else if (err.message.includes('little text')) {
                errorMessage = t("webPageTextError", 'Very little text could be retrieved from this web page. This may be due to security settings or because the page contains little text.');
            } else if (err.message.includes('Firecrawl API')) {
                errorMessage = t("firecrawlApiError", 'Error connecting to Firecrawl API. Please try again later.');
            } else if (err.message.includes('API key')) {
                errorMessage = t("apiKeyError", 'API key configuration error. Please contact support.');
            }
            
            setWebPageError(errorMessage);
            setStatus(RecordingStatus.ERROR);
            setLoadingText('');
        } finally {
            setIsLoadingWebPage(false);
        }
    };
    const handleAnonymizeTranscript = async () => {
        // Controleer of er anonimisatie regels zijn ingesteld
        if (anonymizationRules.length === 0 || anonymizationRules.every(rule => !rule.originalText.trim())) {
            setError('Geen anonimisatie regels ingesteld. Stel eerst de regels in via het instellingen scherm.');
            settingsModal.open();
            return;
        }

        setLoadingText(t('anonymizing'));
        setError(null);
        setAnonymizationReport(null);
    
        setTimeout(() => {
            try {
                let tempTranscript = transcript;
                let totalReplacements = 0;
                const replacementCounts: Record<string, number> = {};

                // Pas alle anonimisatie regels toe
                anonymizationRules.forEach(rule => {
                    if (rule.originalText.trim() && rule.replacementText.trim()) {
                        let replacementText = rule.replacementText;
                        
                        // Als het een medewerker vervanging is, voeg nummer toe
                        if (replacementText.toLowerCase().includes('medewerker') || replacementText.toLowerCase().includes('employee')) {
                            const currentCount = Object.keys(replacementCounts).filter(key => 
                                key.toLowerCase().includes('medewerker') || key.toLowerCase().includes('employee')
                            ).length;
                            replacementText = `${replacementText}${currentCount + 1}`;
                        }

                        if (rule.isExact) {
                            // Exacte tekst vervanging - alleen volledige woorden
                            const regex = new RegExp(`\\b${rule.originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
                            const matches = tempTranscript.match(regex) || [];
                            if (matches.length > 0) {
                                tempTranscript = tempTranscript.replace(regex, replacementText);
                                totalReplacements += matches.length;
                                replacementCounts[rule.originalText] = matches.length;
                            }
                        } else {
                            // Intelligente fuzzy tekst vervanging - herken namen en woorden
                            // Zoek naar patronen die op namen lijken (hoofdletter + kleine letters)
                            const namePattern = new RegExp(`\\b[A-Z][a-z]+\\b`, 'g');
                            const potentialNames = tempTranscript.match(namePattern) || [];
                            
                            // Filter op namen die overeenkomen met de regel (case-insensitive)
                            const matchingNames = potentialNames.filter(name => 
                                name.toLowerCase().includes(rule.originalText.toLowerCase()) ||
                                rule.originalText.toLowerCase().includes(name.toLowerCase())
                            );
                            
                            if (matchingNames.length > 0) {
                                // Vervang alleen de gevonden namen, niet delen van andere woorden
                                matchingNames.forEach(name => {
                                    const nameRegex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                                    tempTranscript = tempTranscript.replace(nameRegex, replacementText);
                                    totalReplacements += 1;
                                    
                                    // Tel vervangingen per regel
                                    if (replacementCounts[rule.originalText]) {
                                        replacementCounts[rule.originalText] += 1;
                                    } else {
                                        replacementCounts[rule.originalText] = 1;
                                    }
                                });
                            }
                        }
                    }
                });
    
                setTranscript(tempTranscript);
                setIsAnonymized(true);
    
                // Genereer rapport
                const reportParts = Object.entries(replacementCounts).map(([text, count]) => 
                    `${count}x "${text}" → "${anonymizationRules.find(r => r.originalText === text)?.replacementText}"`
                );
    
                if (reportParts.length > 0) {
                    setAnonymizationReport(`Anonimisatie voltooid: ${totalReplacements} vervangingen. ${reportParts.join(', ')}`);
                } else {
                    setAnonymizationReport(t('anonymizeNothing'));
                }
    
                setSummary(''); setFaq(''); setLearningDoc(''); setFollowUpQuestions('');
                setBlogData(''); setChatHistory([]);
                setKeywordAnalysis(null);
                setSentimentAnalysisResult(null);
                setMindmapMermaid('');
                setMindmapSvg('');
                setExecutiveSummaryData(null);
                setStorytellingData(null);
                setBusinessCaseData(null);
                setQuizQuestions(null);
                setPresentationReport(null);
                chatInstanceRef.current = null;
    
            } catch (err: any) {
                console.error("Fout bij anonimiseren:", err);
                setError(`${t('anonymizing')}: ${err.message || t('unknownError')}`);
            } finally {
                setLoadingText('');
            }
        }, 10);
    };

  const getAnalysisPrompt = (type: ViewType, inputLang: string, outputLang: string): string => {
    const inputLanguage = getGeminiCode(inputLang);
    const outputLanguage = getGeminiCode(outputLang);
    
    switch (type) {
        case 'summary':
            return `You are a professional summarizer. Summarize the following **${inputLanguage}** transcript in **${outputLanguage}**.

Provide a comprehensive summary of the given text. Start with a catchy and relevant title in ${outputLanguage}, followed by a new line. Cover all key points and main ideas in a concise format. End with quotes, action points, and decisions if any are present.`;
        case 'faq':
            return `From the **${inputLanguage}** transcript below, create 10 FAQ items (question + answer) in **${outputLanguage}**. Rank importance 1–5 stars, allow half-stars (★½). Put the stars before each question. Keep questions short, answers concise and factual. Order from most to least important.`;
        case 'learning':
            return `From the **${inputLanguage}** text below, create a structured learning document in **${outputLanguage}** with: Key takeaways, ranked 1–5 stars (allow half-stars, ★½). Short explanations. Use clear headings and bullet points. Order from most to least important.`;
        case 'followUp':
            return `Based on the **${inputLanguage}** transcript below, generate 10 relevant follow-up questions in **${outputLanguage}** as a numbered list.`;
        default: return '';
    }
};

const handleGenerateAnalysis = async (type: ViewType) => {
    setActiveView(type);
    if ((type === 'summary' && summary) || (type === 'faq' && faq) || (type === 'learning' && learningDoc) || (type === 'followUp' && followUpQuestions)) return; 

    // Import security utilities
    const { validateAndSanitizeForAI, rateLimiter } = await import('./src/utils/security');
    
    // Rate limiting check (max 10 analysis requests per minute)
    const sessionId = 'analysis_' + (auth.currentUser?.uid || 'anonymous');
    if (!rateLimiter.isAllowed(sessionId, 10, 60000)) {
        const errorMsg = 'Te veel analyseverzoeken. Probeer het over een minuut opnieuw.';
        setSummary(errorMsg); setFaq(errorMsg); setLearningDoc(errorMsg); setFollowUpQuestions(errorMsg);
        return;
    }
    
    // Validate and sanitize transcript for AI processing
    const validation = validateAndSanitizeForAI(transcript, 500000); // 500KB limit for analysis
    if (!validation.isValid) {
        const errorMsg = `Ongeldige transcript voor analyse: ${validation.error}`;
        setSummary(errorMsg); setFaq(errorMsg); setLearningDoc(errorMsg); setFollowUpQuestions(errorMsg);
        return;
    }
    
    const sanitizedTranscript = validation.sanitized;
    
    if (!sanitizedTranscript.trim()) {
        const errorMsg = t('transcriptEmpty');
        setSummary(errorMsg); setFaq(errorMsg); setLearningDoc(errorMsg); setFollowUpQuestions(errorMsg);
        return;
    }
    
    if (!apiKey) {
        displayToast('API key niet beschikbaar. Neem contact op met de administrator.', 'error');
        return;
    }
    
    // Check transcript length based on user tier
    const effectiveTier = userSubscription;
    const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, sanitizedTranscript.length, t);
    if (!transcriptValidation.allowed) {
        const errorMsg = transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.';
        setSummary(errorMsg); setFaq(errorMsg); setLearningDoc(errorMsg); setFollowUpQuestions(errorMsg);
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }
    
    // Validate token usage before making API call
    if (authState.user) {
        const prompt = getAnalysisPrompt(type, language!, outputLang || language!);
        const fullPrompt = `${prompt}\n\nHere is the text:\n\n${sanitizedTranscript}`;
        const tokenEstimate = tokenManager.estimateTokens(fullPrompt, 2);
        
        const tokenValidation = await tokenManager.validateTokenUsage(
            authState.user.uid,
            effectiveTier,
            tokenEstimate.totalTokens
        );
        
        if (!tokenValidation.allowed) {
            const errorMsg = tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer tokens.';
            setSummary(errorMsg); setFaq(errorMsg); setLearningDoc(errorMsg); setFollowUpQuestions(errorMsg);
            setTimeout(() => setShowPricingPage(true), 2000);
            return;
        }
    }
    
    setLoadingText(t('generating', { type }));
    
    try {
        const prompt = getAnalysisPrompt(type, language!, outputLang || language!);
        if (!prompt) throw new Error(t('invalidAnalysisType', 'Invalid analysis type'));

        const fullPrompt = `${prompt}\n\nHere is the text:\n\n${sanitizedTranscript}`;

        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = await modelManager.getModelForFunction('analysisGeneration');
        const response = await ai.models.generateContent({ model: modelName, contents: fullPrompt });

        // Track token usage with TokenManager
        const promptTokens = tokenCounter.countPromptTokens(fullPrompt);
        const responseTokens = tokenCounter.countResponseTokens(response.text);
        
        // Record actual token usage
        try {
          if (authState.user) {
            await tokenManager.recordTokenUsage(authState.user.uid, promptTokens, responseTokens);
          }
        } catch (error) {
          console.warn('Could not record token usage:', error);
        }

        const resultText = response.text;
        if (type === 'summary') setSummary(resultText);
        else if (type === 'faq') setFaq(resultText);
        else if (type === 'learning') setLearningDoc(resultText);
        else if (type === 'followUp') setFollowUpQuestions(resultText);

    } catch (err: any) {
        console.error(`Fout bij genereren ${type}:`, err);
        const errorText = t('generationFailed', { type }) + `: ${err.message || t('unknownError')}`;
        if (type === 'summary') setSummary(errorText);
        else if (type === 'faq') setFaq(errorText);
        else if (type === 'learning') setLearningDoc(errorText);
        else if (type === 'followUp') setFollowUpQuestions(errorText);
    } finally {
        setLoadingText('');
    }
};

const handleKeywordClick = async (keyword: string) => {
    setSelectedKeyword(keyword);
    setIsFetchingExplanation(true);
    setKeywordExplanation(null);
    
    // Don't reset other analysis data when generating keyword explanation

    if (!apiKey) {
        displayToast('API key niet beschikbaar. Neem contact op met de administrator.', 'error');
        setIsFetchingExplanation(false);
        return;
    }
    
    // Check transcript length based on user tier
    const effectiveTier = userSubscription;
    const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
    if (!transcriptValidation.allowed) {
        displayToast(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        setIsFetchingExplanation(false);
        return;
    }
    
    // Validate token usage for keyword explanation
    if (authState.user) {
        const inputLanguage = getGeminiCode(language || 'en');
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
        const prompt = `Provide a short and clear explanation of the term '${keyword}' in the context of the following **${inputLanguage}** transcript. Return the explanation in **${outputLanguage}**, no extra titles or formatting. Keep it concise. Transcript: --- ${transcript} ---`;
        
        const tokenEstimate = tokenManager.estimateTokens(prompt, 1.5);
        
        const tokenValidation = await tokenManager.validateTokenUsage(
            authState.user.uid,
            effectiveTier,
            tokenEstimate.totalTokens
        );
        
        if (!tokenValidation.allowed) {
            displayToast(tokenValidation.reason || 'Token limiet bereikt voor keyword uitleg.', 'error');
            setIsFetchingExplanation(false);
            return;
        }
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = await modelManager.getModelForFunction('generalAnalysis');
        const inputLanguage = getGeminiCode(language || 'en');
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
        const prompt = `Provide a short and clear explanation of the term '${keyword}' in the context of the following **${inputLanguage}** transcript. Return the explanation in **${outputLanguage}**, no extra titles or formatting. Keep it concise. Transcript: --- ${transcript} ---`;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        
        // Track token usage with TokenManager
        const promptTokens = tokenCounter.countPromptTokens(prompt);
        const responseTokens = tokenCounter.countResponseTokens(response.text);
        
        // Record actual token usage
        try {
          if (authState.user) {
            await tokenManager.recordTokenUsage(authState.user.uid, promptTokens, responseTokens);
          }
        } catch (error) {
          console.warn('Could not record token usage:', error);
        }

        setKeywordExplanation(response.text);
    } catch (err: any) {
        console.error("Fout bij ophalen keyword uitleg:", err);
        setKeywordExplanation(`Kon geen uitleg ophalen voor '${keyword}'. Probeer het opnieuw.`);
    } finally {
        setIsFetchingExplanation(false);
    }
};
const handleGenerateKeywordAnalysis = async () => {
    setActiveView('keyword');
    if (keywordAnalysis && keywordAnalysis.length > 0) return;
    // Reset current keyword data to show loader properly
    setKeywordAnalysis(null);

    if (!transcript.trim()) {
        setKeywordAnalysis([]);
        setError(t('transcriptEmpty'));
        return;
    }

    if (!apiKey) {
        displayToast('API key niet beschikbaar. Neem contact op met de administrator.', 'error');
        return;
    }
    
    // Check transcript length based on user tier
    const effectiveTier = userSubscription;
    const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
    if (!transcriptValidation.allowed) {
        setError(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement');
        return;
    }
    
    // Don't reset other analysis data when generating keyword analysis
    setLoadingText(t('generating', { type: t('keywordAnalysis') }));
    setError(null);
    
    // Validate token usage for keyword analysis
    const inputLanguage = getGeminiCode(language || 'en');
    const outputLanguage = getGeminiCode(outputLang || language || 'en');
    const keywordPrompt = `Analyze the following **${inputLanguage}** transcript in **${outputLanguage}**. Identify the most frequent and important keywords. Group these into 5-7 relevant topics. For each topic, provide a short descriptive name and a list of associated keywords. Return JSON only. Transcript: --- ${transcript} ---`;
    const tokenEstimate = tokenManager.estimateTokens(keywordPrompt, 1.5);
    const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, tokenEstimate.totalTokens);
    
    if (!tokenValidation.allowed) {
        setError(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
        setTimeout(() => setShowPricingPage(true), 2000);
        setLoadingText('');
        return;
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = await modelManager.getModelForFunction('generalAnalysis');
        const inputLanguage = getGeminiCode(language || 'en');
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
        const prompt = `Analyze the following **${inputLanguage}** transcript in **${outputLanguage}**. Identify the most frequent and important keywords. Group these into 5-7 relevant topics. For each topic, provide a short descriptive name and a list of associated keywords. Return JSON only. Transcript: --- ${transcript} ---`;

        const schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING },
                    keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["topic", "keywords"]
            }
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema }
        });

        // Track token usage with TokenManager
        const promptTokens = tokenCounter.countPromptTokens(prompt);
        const responseTokens = tokenCounter.countResponseTokens(response.text);
        
        try {
            await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
        } catch (error) {
            console.error('Error recording token usage:', error);
        }

        const result: KeywordTopic[] = JSON.parse(response.text);
        setKeywordAnalysis(result);
    } catch (err: any) {
        console.error(t('keywordAnalysisGenerationError', 'Error generating keyword analysis:'), err);
        setError(t('generationFailed', { type: t('keywordAnalysis') }) + `: ${err.message || t('unknownError')}`);
    } finally {
        setLoadingText('');
    }
};

const handleAnalyzeSentiment = async () => {
    setActiveView('sentiment');
    if (sentimentAnalysisResult) return;

        if (!transcript.trim()) {
        setError(t('transcriptEmpty'));
        return;
    }
    
    if (!apiKey) {
        displayToast('API key niet beschikbaar. Neem contact op met de administrator.', 'error');
        return;
    }
    
    // Check transcript length based on user tier
    const effectiveTier = userSubscription;
    const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
    if (!transcriptValidation.allowed) {
        setError(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement');
        return;
    }
    
    // Don't reset other analysis data when generating sentiment analysis
    setIsAnalyzingSentiment(true);
    setLoadingText(t('analyzingSentiment'));
    setError(null);
    
    // Validate token usage for sentiment analysis
    const inputLanguage = getGeminiCode(language || 'en');
    const outputLanguage = getGeminiCode(outputLang || language || 'en');
    const sentimentPrompt = `Analyze the sentiment of the following **${inputLanguage}** transcript in **${outputLanguage}**. Return a JSON object with: 1. 'summary': a short factual summary of the sentiments found (e.g., "The conversation was predominantly positive with some negative points about X."). 2. 'conclusion': an overall conclusion about the general tone and atmosphere of the conversation. Do NOT include the full transcript with tags. Transcript: --- ${transcript} ---`;
    const tokenEstimate = tokenManager.estimateTokens(sentimentPrompt, 1.5);
    const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, tokenEstimate.totalTokens);
    
    if (!tokenValidation.allowed) {
        setError(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
        setTimeout(() => setShowPricingPage(true), 2000);
        setLoadingText('');
        setIsAnalyzingSentiment(false);
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = await modelManager.getModelForFunction('generalAnalysis');
        const inputLanguage = getGeminiCode(language || 'en');
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
        const prompt = `Analyze the sentiment of the following **${inputLanguage}** transcript in **${outputLanguage}**. Return a JSON object with: 1. 'summary': a short factual summary of the sentiments found (e.g., "The conversation was predominantly positive with some negative points about X."). 2. 'conclusion': an overall conclusion about the general tone and atmosphere of the conversation. Do NOT include the full transcript with tags. Transcript: --- ${transcript} ---`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                conclusion: { type: Type.STRING }
            },
            required: ["summary", "conclusion"]
        };

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema }
        });

        // Track token usage with TokenManager
        const promptTokens = tokenCounter.countPromptTokens(prompt);
        const responseTokens = tokenCounter.countResponseTokens(response.text);
        
        try {
            await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
        } catch (error) {
            console.error('Error recording token usage:', error);
        }

        const result: SentimentAnalysisResult = JSON.parse(response.text);
        setSentimentAnalysisResult(result);

    } catch (err: any) {
        console.error("Fout bij genereren Sentiment Analyse:", err);
        setError(t('generationFailed', { type: "Sentiment" }) + `: ${err.message || t('unknownError')}`);
    } finally {
        setIsAnalyzingSentiment(false);
        setLoadingText('');
    }
};



// ... existing code ...

  // No user-provided API key handling; rely exclusively on environment configuration

  const handleAcceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowCookieConsent(false);
  };

  const handleDeclineCookies = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShowCookieConsent(false);
  };

  const addAnonymizationRule = () => {
    const newRule: AnonymizationRule = {
      id: nextRuleId,
      originalText: '',
      replacementText: '',
      isExact: true
    };
    setAnonymizationRules(prev => [...prev, newRule]);
    setNextRuleId(prev => prev + 1);
  };

  const updateAnonymizationRule = (id: number, field: keyof AnonymizationRule, value: string | boolean) => {
    setAnonymizationRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const deleteAnonymizationRule = (id: number) => {
    setAnonymizationRules(prev => prev.filter(rule => rule.id !== id));
  };

  const saveAnonymizationRules = () => {
    localStorage.setItem('anonymization_rules', JSON.stringify(anonymizationRules));
    settingsModal.close();
  };
  
  const saveTranscriptionSettings = () => {
    localStorage.setItem('transcription_quality', transcriptionQuality);
    localStorage.setItem('audio_compression_enabled', audioCompressionEnabled.toString());
    localStorage.setItem('auto_stop_recording_enabled', autoStopRecordingEnabled.toString());
    settingsModal.close();
  };
  
  const saveAllSettings = () => {
    localStorage.setItem('anonymization_rules', JSON.stringify(anonymizationRules));
    localStorage.setItem('transcription_quality', transcriptionQuality);
    localStorage.setItem('audio_compression_enabled', audioCompressionEnabled.toString());
    localStorage.setItem('auto_stop_recording_enabled', autoStopRecordingEnabled.toString());
    settingsModal.close();
  };

  const getNextEmployeeNumber = (rules: AnonymizationRule[]): number => {
    const employeeRules = rules.filter(rule => 
      rule.replacementText.toLowerCase().includes('medewerker') || 
      rule.replacementText.toLowerCase().includes('employee')
    );
    return employeeRules.length + 1;
  };
  // Firebase Auth Functions
  const handleLogin = async (email: string, password: string) => {
    try {
      // Login attempt for user
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Firebase Auth successful
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // User data loaded from Firestore
        
        if (!userData.isActive) {
          throw new Error(t('accountDisabled', 'Account is disabled. Contact administrator.'));
        }
        
        // Update last login
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: serverTimestamp()
        });
        
        // Setting auth state for user
        setAuthState({
          user: { ...userData, uid: user.uid },
          isLoading: false,
                  });
        
        // Load user subscription tier
        const tier = userData.subscriptionTier as SubscriptionTier || SubscriptionTier.FREE;
        setUserSubscription(tier);
        // login modal removed
        
        // Navigate to start session screen after login
        setShowInfoPage(false);
        
        // Check if user needs to set up API key (only if no environment key is available)
        // No user-provided API keys; rely on environment configuration only
      } else {
        // Creating automatic user document
        
        // Automatically create user document in Firestore
        const newUserData = {
          email: email,
          isActive: true,
                    lastLogin: serverTimestamp(),
          sessionCount: 0,
          createdAt: new Date(),
          updatedAt: serverTimestamp()
        };
        
        try {
          await setDoc(doc(db, 'users', user.uid), newUserData);
          // User document created automatically
          
          // Set auth state with new user data
          setAuthState({
            user: { ...newUserData, uid: user.uid },
            isLoading: false,
                      });
          
          // Set default subscription tier for new user
          setUserSubscription(SubscriptionTier.FREE);
          // login modal removed
          
          // Navigate to start session screen after account creation
          setShowInfoPage(false);
          
          // Show success message
          displayToast(`Welkom ${email}! Je account is automatisch aangemaakt.`, 'success');
        } catch (createError) {
          console.error('Error creating automatic user document:', createError);
          throw new Error(t('couldNotCreateAccount', 'Kon gebruikersaccount niet aanmaken. Probeer het opnieuw of contact administrator.'));
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Use enhanced error handler
      const { errorHandler } = await import('./src/utils/errorHandler');
      const userFriendlyError = errorHandler.handleAuthError(error, {
        userId: undefined, // No user ID yet since login failed
        sessionId: undefined,
        attemptedAction: 'login'
      });
      
      // Better error messages with fallback to original logic
      if (error.code === 'auth/user-not-found') {
        throw new Error(t('emailNotFound', 'Email adres niet gevonden. Maak eerst een account aan.'));
      } else if (error.code === 'auth/wrong-password') {
        throw new Error(t('incorrectPassword', 'Onjuist wachtwoord. Probeer opnieuw.'));
      } else if (error.code === 'auth/invalid-email') {
        throw new Error(t('invalidEmail', 'Ongeldig email adres.'));
      } else if (error.code === 'auth/user-disabled') {
        throw new Error(t('accountDisabledContact', 'Account is uitgeschakeld. Contact administrator.'));
      } else {
        // Use enhanced error handler message for better UX
        throw new Error(userFriendlyError.message);
      }
    }
  };

  const handleCreateAccount = async (email: string, password: string) => {
    try {
      // Creating new account
      
      // Check if user exists in database
      const Ref = collection(db, 'users');
      const q = query(Ref, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(t('emailNotFoundSystem', 'Email not found in system. Contact administrator to be added.'));
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (!userData.isActive) {
        throw new Error(t('accountDisabled', 'Account is disabled. Contact administrator.'));
      }
      
      // User found in database
      
      // Check if user already has a UID (means Firebase Auth account exists)
      if (userData.uid) {
        // User already has UID, checking if Firebase Auth account exists
        try {
          // Try to sign in to see if account exists
          await signInWithEmailAndPassword(auth, email, 'dummy-password');
          console.log('Firebase Auth account exists, cannot create new one');
          throw new Error(t('emailInUseFirebase', 'Dit email adres is al in gebruik in Firebase. Probeer in te loggen in plaats van een account aan te maken.'));
        } catch (authError: any) {
          if (authError.code === 'auth/wrong-password') {
            // Account exists but wrong password - this is what we want
            // Firebase Auth account exists, cannot create new one
            throw new Error(t('firebaseEmailInUse', 'This email address is already in use in Firebase. Try logging in instead of creating an account.'));
          } else if (authError.code === 'auth/user-not-found') {
            // Account doesn't exist - this is also fine
            // No Firebase Auth account found, will create new one
          } else if (authError.code === 'auth/invalid-credential') {
            // Account might exist but is corrupted - try to create new one
            // Invalid credential error, will attempt to create new Firebase Auth account
          } else {
            console.log('Unexpected auth error:', authError);
            throw authError;
          }
        }
      } else {
        // No UID found, safe to create new Firebase Auth account
      }
      
      // Creating Firebase Auth account
      // Create Firebase auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Firebase Auth account created
      
      // Update user document with UID
      await updateDoc(doc(db, 'users', userDoc.id), {
        uid: user.uid,
        updatedAt: serverTimestamp()
      });
      
      // User document updated with new UID
      
      // User document updated with UID
      
      setAuthState({
        user: { ...userData, uid: user.uid },
        isLoading: false,
              });
      
      // Load user subscription tier
      const tier = userData.subscriptionTier as SubscriptionTier || SubscriptionTier.FREE;
      setUserSubscription(tier);
      // login modal removed
      
      // Account creation successful
    } catch (error: any) {
      console.error('Create account error:', error);
      
      // Better error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error(t('emailInUse', 'Dit email adres is al in gebruik. Probeer in te loggen in plaats van een account aan te maken.'));
      } else if (error.code === 'auth/weak-password') {
        throw new Error(t('weakPasswordMinimum', 'Password must be at least 6 characters.'));
      } else if (error.code === 'auth/invalid-email') {
        throw new Error(t('invalidEmail', 'Ongeldig email adres.'));
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error(t('invalidCredentials', 'Ongeldige inloggegevens. Mogelijk bestaat het account al in Firebase. Probeer in te loggen of neem contact op met de administrator.'));
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error(t('accountCreationNotAllowed', 'Account aanmaken is niet toegestaan. Neem contact op met de administrator.'));
      } else {
        console.error('Unknown Firebase error:', error);
        throw new Error(t('accountCreationFailed', 'Account creation failed: {message}', { message: error.message }));
      }
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAuthState({
        user: null,
        isLoading: false,
              });
      setUserSubscription(SubscriptionTier.FREE);
      reset();
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const loadUsers = async (options?: { bypassAdminCheck?: boolean }) => {
    const bypass = options?.bypassAdminCheck === true;
    // Controleer of gebruiker admin is
    if (!bypass && (!authState.user || authState.user.subscriptionTier !== SubscriptionTier.DIAMOND)) {
      console.error('Unauthorized access to loadUsers');
      displayToast('Geen toegang tot gebruikersbeheer. Admin rechten vereist.', 'error');
      return;
    }

    try {
      const Ref = collection(db, 'users');
      const q = query(Ref, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const Data: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        Data.push({
          uid: doc.id,
          email: data.email,
          isActive: data.isActive,
                    lastLogin: data.lastLogin?.toDate() || null,
          sessionCount: data.sessionCount || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          hashedApiKey: data.hashedApiKey,
          apiKeyLastUpdated: data.apiKeyLastUpdated?.toDate(),
          subscriptionTier: data.subscriptionTier || 'free'
        });
      });
      
      (Data);
    } catch (error: any) {
      console.error('Load  error:', error);
              displayToast('Fout bij laden van gebruikers.', 'error');
    }
  };

  const addUser = async (email: string) => {
    // Controleer of gebruiker admin is
    if (!authState.user || authState.user.subscriptionTier !== SubscriptionTier.DIAMOND) {
      console.error('Unauthorized access to addUser');
      displayToast('Geen toegang tot gebruikersbeheer. Admin rechten vereist.', 'error');
      return;
    }

    try {
      const userRef = doc(collection(db, 'users'));
      await setDoc(userRef, {
        email,
        isActive: true,
        lastLogin: null,
        sessionCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setNewUserEmail('');
      setShowAddUserModal(false);
      await loadUsers();
              displayToast(`Gebruiker ${email} succesvol toegevoegd!`, 'success');
    } catch (error: any) {
      console.error('Add user error:', error);
              displayToast('Fout bij toevoegen van gebruiker.', 'error');
      throw error;
    }
  };

  const toggleUserStatus = async (uid: string, isActive: boolean) => {
    // Controleer of gebruiker admin is
    if (!authState.user || authState.user.subscriptionTier !== SubscriptionTier.DIAMOND) {
      console.error('Unauthorized access to toggleUserStatus');
      displayToast('Geen toegang tot gebruikersbeheer. Admin rechten vereist.', 'error');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', uid), {
        isActive,
        updatedAt: serverTimestamp()
      });
      await loadUsers();
              displayToast(`Gebruiker status succesvol bijgewerkt!`, 'success');
    } catch (error: any) {
      console.error('Toggle user status error:', error);
            console.error('User synchronization error:', error);
            throw error;
        }
    };



  // Simplified waitlist functions without 2FA email confirmation
  // Note: 2FA email confirmation system has been temporarily disabled
  const addToWaitlist = async (email: string) => {
    // Prevent waitlist action when user is logged in
    if (authState.user) {
      displayToast(t('waitlistAlreadyLoggedIn'), 'info');
      return;
    }
    // Per-sessie beveiliging: slechts één aanmelding per browsersessie
    const sessionGuardKey = 'waitlist_session_submitted';
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem(sessionGuardKey) === '1') {
        displayToast(t('waitlistAlreadySubmitted'), 'info');
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        displayToast(t('waitlistInvalidEmail'), 'error');
        return;
      }

      // Write directly to waitlist; Firestore rules do not allow reading this collection from the client
      let wrote = false;

      // Prepare deterministic document ID based on hashed email, to enforce one entry per email
      const normalizedEmail = email.toLowerCase().trim();
      async function computeEmailHashHex(str: string): Promise<string> {
        try {
          const data = new TextEncoder().encode(str);
          const hash = await crypto.subtle.digest('SHA-256', data);
          return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
        } catch {
          // Fallback: sanitized base64-like id (avoid problematic chars)
          const base = typeof btoa === 'function' ? btoa(str) : encodeURIComponent(str);
          return base.replace(/[^a-zA-Z0-9_-]/g, '_');
        }
      }
      const waitlistDocId = await computeEmailHashHex(normalizedEmail);

      try {
        // Primary attempt: createdAt as Date + status 'pending'
        await setDoc(doc(db, 'waitlist', waitlistDocId), {
          email: normalizedEmail,
          createdAt: new Date(),
          status: 'pending'
        }, { merge: false });
        wrote = true;
      } catch (e1: any) {
        // Fallback: createdAt as serverTimestamp + status 'pending'
        if (e1 && typeof e1.message === 'string' && e1.message.includes('permission-denied')) {
          try {
            await setDoc(doc(db, 'waitlist', waitlistDocId), {
              email: normalizedEmail,
              createdAt: serverTimestamp(),
              status: 'pending'
            }, { merge: false });
            wrote = true;
          } catch (e2: any) {
            throw e2;
          }
        } else {
          throw e1;
        }
      }

      if (wrote) {
        setWaitlistEmail('');
        displayToast(
          t('waitlistThankYou'), 
          'success'
        );
        // Markeer deze sessie als voltooid, zodat er niet opnieuw kan worden ingezonden in dezelfde sessie
        try {
          if (typeof window !== 'undefined') sessionStorage.setItem(sessionGuardKey, '1');
        } catch {}
        // Log successful addition for monitoring (privacy-safe)
        console.log('Waitlist addition successful:', {
          email: email.substring(0, 3) + '***',
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      
      // Enhanced error handling
      let errorMessage = t('waitlistErrorAdding');
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = t('errorAccessDenied');
        } else if (error.message.includes('network')) {
          errorMessage = t('errorNetwork');
        }
      }
      
      displayToast(errorMessage, 'error');
    }
  };

  // COMMENTED OUT: 2FA Email confirmation system
  /*
  // Enhanced waitlist functions with 2FA email confirmation
  const addToWaitlistWith2FA = async (email: string) => {
    try {
      // Import enhanced security utilities
      const { validateWaitlistEmail, rateLimiter, initiateWaitlistSignup } = await import('./src/utils/security');
      
      // Enhanced rate limiting check with email tracking
      const sessionId = 'waitlist_' + (auth.currentUser?.uid || 'anonymous');
      const rateLimitResult = rateLimiter.isAllowedEnhanced(sessionId, 3, 60000, email);
      
      if (!rateLimitResult.allowed) {
        const message = rateLimitResult.reason === 'Suspicious activity detected' 
          ? t('waitlistSuspiciousActivity')
          : rateLimitResult.reason === 'Email temporarily blocked due to repeated submissions'
          ? t('waitlistEmailBlocked')
          : rateLimitResult.reason === 'Too many attempts with this email address'
          ? t('waitlistTooManyAttempts')
          : t('waitlistTooManyRequests');
        
        displayToast(message, 'error');
        return;
      }
      
      // Initiate waitlist signup with email confirmation
      const result = await initiateWaitlistSignup(email);
      
      if (result.success && result.requiresConfirmation) {
        setShowEmailConfirmation(true);
        displayToast('Een bevestigingsmail is verzonden. Controleer je inbox.', 'success');
      } else {
        displayToast(result.error || 'Er is een fout opgetreden.', 'error');
      }
      
    } catch (error) {
      console.error('Error initiating waitlist signup:', error);
      displayToast('Er is een fout opgetreden bij het aanmelden voor de wachtlijst.', 'error');
    }
  };
  */
  
  // Helper function to generate a simple session-based hash for monitoring
  const generateSessionHash = async (): Promise<string> => {
    try {
      const sessionData = {
        timestamp: Math.floor(Date.now() / 3600000), // Hour-based
        userAgent: navigator.userAgent.substring(0, 50),
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(sessionData));
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
    } catch (error) {
      console.warn('Could not generate session hash:', error);
      return 'unknown';
    }
  };

  const loadWaitlist = async (options?: { bypassAdminCheck?: boolean }) => {
    const bypass = options?.bypassAdminCheck === true;
    // Controleer of gebruiker admin is voor wachtlijst beheer
    if (!bypass && (!authState.user || authState.user.subscriptionTier !== SubscriptionTier.DIAMOND)) {
      console.error('Unauthorized access to loadWaitlist');
      return;
    }

    try {
      const waitlistQuery = query(collection(db, 'waitlist'), orderBy('createdAt', 'desc'));
      const waitlistSnapshot = await getDocs(waitlistQuery);
      const waitlistData = waitlistSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWaitlist(waitlistData);
    } catch (error: any) {
      console.error('Error loading waitlist:', error);
      let msg = 'Fout bij laden van wachtlijst.';
      if (error.code === 'permission-denied' || error.message?.includes('insufficient permissions')) {
        msg = 'Fout: onvoldoende rechten om de wachtlijst te laden.';
      } else if (error.message) {
        msg += ` (${error.message})`;
      }
      displayToast(msg, 'error');
    }
  };

  const activateWaitlistUsers = async () => {
    // Controleer of gebruiker admin is
    if (!authState.user || authState.user.subscriptionTier !== SubscriptionTier.DIAMOND) {
      console.error('Unauthorized access to activateWaitlistUsers');
      displayToast(t('adminNoAccess'), 'error');
      return;
    }

    if (selectedWaitlistUsers.length === 0) {
              displayToast(t('adminSelectUsers'), 'info');
      return;
    }

    try {
      for (const userId of selectedWaitlistUsers) {
        const userData = waitlist.find(w => w.id === userId);
        if (userData) {
          // Add to  collection
          await addDoc(collection(db, 'users'), {
            email: userData.email,
            isActive: true,
            lastLogin: null,
            sessionCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Remove from waitlist
          await deleteDoc(doc(db, 'waitlist', userId));
        }
      }
      
      // Refresh both lists
      await loadUsers();
      await loadWaitlist();
      setSelectedWaitlistUsers([]);
              displayToast(`${selectedWaitlistUsers.length} ${t('adminUsersActivated')}`, 'success');
    } catch (error) {
      console.error('Error activating :', error);
              displayToast(t('adminErrorActivating'), 'error');
    }
  };
  const removeFromWaitlist = async (userId: string) => {
    // Controleer of gebruiker admin is
    if (!authState.user || authState.user.subscriptionTier !== SubscriptionTier.DIAMOND) {
      console.error('Unauthorized access to removeFromWaitlist');
      displayToast(t('adminNoAccess'), 'error');
      return;
    }

    try {
      await deleteDoc(doc(db, 'waitlist', userId));
      await loadWaitlist();
              displayToast(t('adminUserRemoved'), 'success');
    } catch (error) {
      console.error('Error removing from waitlist:', error);
              displayToast(t('adminErrorRemoving'), 'error');
    }
  };
  // Email invitation functions
  const sendInvitationEmail = async (email: string) => {
    // Controleer of gebruiker admin is
    if (!authState.user || authState.user.subscriptionTier !== SubscriptionTier.DIAMOND) {
      console.error('Unauthorized access to sendInvitationEmail');
      displayToast(t('adminNoEmailAccess'), 'error');
      return;
    }

    try {
      const subject = t('emailInvitationSubject');
      const body = t('emailInvitationBody').replace('[Registratielink]', window.location.origin);

      // Open lokale mail client
      openEmailClient(email, subject, body);
      
      displayToast(t('emailClientOpened').replace('{email}', email), 'success');
    } catch (error) {
      console.error('Error sending invitation email:', error);
              displayToast(t('emailErrorPreparing'), 'error');
    }
  };

  const sendInvitationEmails = async (userIds: string[]) => {
    // Controleer of gebruiker admin is
    if (!authState.user || authState.user.subscriptionTier !== SubscriptionTier.DIAMOND) {
      console.error('Unauthorized access to sendInvitationEmails');
      displayToast('Geen toegang tot email functies. Admin rechten vereist.', 'error');
      return;
    }

    try {
      const emails = waitlist.filter(w => userIds.includes(w.id)).map(w => w.email);
      if (emails.length === 0) {
        displayToast(t('emailNoValidEmails'), 'info');
        return;
      }

      // Voor meerdere emails, open de eerste in mail client en toon de rest in een popup
      if (emails.length === 1) {
        // Als er maar 1 email is, open direct de mail client
        const subject = t('emailInvitationSubject');
        const body = t('emailInvitationBody').replace('[Registratielink]', window.location.origin);

        openEmailClient(emails[0], subject, body);
        displayToast(t('emailClientOpened').replace('{email}', emails[0]), 'success');
      } else {
        // Voor meerdere emails, toon een overzicht en open de eerste
        const subject = t('emailInvitationSubject');
        const body = t('emailInvitationBody').replace('[Registratielink]', window.location.origin);

        // Open eerste email in mail client
        openEmailClient(emails[0], subject, body);
        
        // Toon overzicht van alle emails
        const emailList = emails.slice(1).map(email => `• ${email}`).join('\n');
        displayToast(`Email client geopend voor ${emails[0]}. Overige emails: ${emails.length - 1}`, 'success');
        
        // Toon popup met alle emails voor referentie
        const emailWindow = window.open('', '_blank', 'width=600,height=400');
        if (emailWindow) {
          emailWindow.document.write(`
            <html>
              <head><title>Uitnodigingsmails Overzicht</title></head>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                .header { background: #06b6d4; color: white; padding: 20px; margin: -20px -20px 20px -20px; }
                .content { background: #f8fafc; padding: 20px; border-radius: 8px; }
                .emails { background: white; padding: 15px; border-radius: 5px; border: 1px solid #e2e8f0; margin: 15px 0; }
              </style>
              <body>
                <div class="header">
                  <h1>📧 Uitnodigingsmails Overzicht</h1>
                </div>
                <div class="content">
                  <h3>Alle emails voor uitnodigingen:</h3>
                  <div class="emails">
                    ${emails.map(email => `<div>• ${email}</div>`).join('')}
                  </div>
                  <p><strong>Tip:</strong> De eerste email is geopend in je mail client. Kopieer de content voor de overige emails.</p>
                </div>
              </body>
            </html>
          `);
        }
      }
    } catch (error) {
      console.error('Error sending invitation emails:', error);
              displayToast('Fout bij voorbereiden van uitnodigingsmails.', 'error');
    }
  };

  const checkApiKey = () => {
    if (!apiKey) {
      displayToast('API key niet beschikbaar. Neem contact op met de administrator.', 'error');
      return false;
    }
    return true;
  };

  const handleGeneratePresentationWithOptions = async (options: { 
    maxSlides: number; 
    language: 'nl' | 'en'; 
    useTemplate: boolean; 
    templateFile?: File | null;
    targetAudience: string;
    mainGoal: string;
    toneStyle: string;
  }) => {
    // Check if user has access to PowerPoint export
    const effectiveTier = userSubscription;
    if (!subscriptionService.isFeatureAvailable(effectiveTier, 'exportPpt')) {
        displayToast('Helaas heeft u niet genoeg credits om deze functie uit te voeren. Klik hier om te upgraden naar een hoger abonnement.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }
    
    if (!transcript.trim()) {
        setError(t("transcriptEmpty"));
        return;
    }
    
    if (!apiKey) {
        displayToast('API key niet beschikbaar. Neem contact op met de administrator.', 'error');
        return;
    }
    
    setLoadingText(t('generatingPresentation'));
    setError(null);
    setPresentationReport(null);
    const useTemplate = options.useTemplate && options.templateFile !== null;

    try {
        // Validate token usage for presentation generation
        const presentationPrompt = `Je bent een AI-expert in het creëren van professionele, gestructureerde en visueel aantrekkelijke zakelijke presentaties op basis van een meeting-transcript. Je taak is om de volgende content te genereren en te structureren in een JSON-object dat voldoet aan het verstrekte schema.\n\n**Taal:** ${getGeminiCode(options.language)} - Alle titels en content moeten in deze taal zijn.\n\n**Maximum aantal slides:** ${options.maxSlides} - Houd de presentatie binnen deze limiet.\n\n**Doelgroep:** ${options.targetAudience} - Pas de presentatie aan voor deze specifieke doelgroep.\n\n**Hoofddoel:** ${options.mainGoal} - Structureer de presentatie om dit doel te bereiken.\n\n**Toon/Stijl:** ${options.toneStyle} - Gebruik deze toon en stijl door de hele presentatie.\n\nTranscript:\n---\n${transcript}\n---`;
        const tokenEstimate = tokenManager.estimateTokens(presentationPrompt, 2.0);
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, tokenEstimate.totalTokens);
        
        if (!tokenValidation.allowed) {
            displayToast(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.', 'error');
            setTimeout(() => setShowPricingPage(true), 2000);
            setLoadingText('');
            return;
        }
        
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = await modelManager.getModelForFunction('pptExport');
        const prompt = `Je bent een AI-expert in het creëren van professionele, gestructureerde en visueel aantrekkelijke zakelijke presentaties op basis van een meeting-transcript. Je taak is om de volgende content te genereren en te structureren in een JSON-object dat voldoet aan het verstrekte schema.

**Taal:** ${getGeminiCode(options.language)} - Alle titels en content moeten in deze taal zijn.

**Maximum aantal slides:** ${options.maxSlides} - Houd de presentatie binnen deze limiet.

**Doelgroep:** ${options.targetAudience} - Pas de presentatie aan voor deze specifieke doelgroep.

**Hoofddoel:** ${options.mainGoal} - Structureer de presentatie om dit doel te bereiken.

**Toon/Stijl:** ${options.toneStyle} - Gebruik deze toon en stijl door de hele presentatie.

**Structuur van de Presentatie (verwijderde slides: Status & Datum, Aanwezigen):**

1.  **Titelslide:** Een pakkende hoofdtitel en een informatieve ondertitel.
2.  **Inhoudsopgave (Agenda):** Een slide die de structuur van de presentatie schetst.
3.  **Inleiding:** Een slide die de uitgangspunten, doelen en context van het project samenvat.
4.  **Kernslides:** ${Math.max(2, Math.min(4, options.maxSlides - 6))} slides die de belangrijkste discussiepunten, bevindingen en beslissingen uit het transcript behandelen. Gebruik duidelijke, beknopte titels en presenteer de inhoud als duidelijke bullet points (maximaal 5 per slide).
5.  **Projectstatus:** Een slide die een overzicht geeft van de algehele status. Waar staan we nu?
6.  **Learnings:** Een slide met de belangrijkste leerpunten uit de sessie.
7.  **Verbeterpunten:** Een slide met suggesties voor wat er een volgende keer beter kan.
8.  **To-Do Lijst:** Een slide met concrete, beknopte actiepunten. Specificeer 'taak', 'eigenaar' (wie) en 'deadline' (wanneer). Zorg dat de data compleet is.
9.  **Beeldstijl & Prompts:**
    *   Genereer een algemene \`imageStylePrompt\`: een consistente, professionele en speelse visuele stijl.
    *   Genereer voor *elke* inhoudelijke slide een unieke, creatieve \`imagePrompt\` in het Engels die abstract, conceptueel of metaforisch past bij de inhoud.

**BELANGRIJK:** Houd alle titels en bullet points relatief kort en bondig. Zorg voor volledige, correcte data voor de to-do lijst. Respecteer de taal en het maximum aantal slides. Pas de inhoud aan op basis van de doelgroep, het hoofddoel en de gewenste toon/stijl.

Analyseer de volgende transcriptie en produceer het JSON-object.

Transcript:
---
${transcript}
---`;
        
        const slideContentSchema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                points: { type: Type.ARRAY, items: { type: Type.STRING } },
                imagePrompt: { type: Type.STRING },
            },
            required: ["title", "points"]
        };

        const presentationSchema = {
            type: Type.OBJECT,
            properties: {
                titleSlide: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, subtitle: { type: Type.STRING } }, required: ["title", "subtitle"] },
                introduction: slideContentSchema,
                agenda: { type: Type.ARRAY, items: { type: Type.STRING } },
                mainContentSlides: { type: Type.ARRAY, items: slideContentSchema },
                projectStatus: slideContentSchema,
                learnings: slideContentSchema,
                improvements: slideContentSchema,
                todoList: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        items: { type: Type.ARRAY, items: {
                            type: Type.OBJECT,
                            properties: { task: { type: Type.STRING }, owner: { type: Type.STRING }, dueDate: { type: Type.STRING } },
                            required: ["task", "owner", "dueDate"]
                        }},
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ["title", "items"]
                },
                imageStylePrompt: { type: Type.STRING }
            },
            required: ["titleSlide", "introduction", "agenda", "mainContentSlides", "projectStatus", "learnings", "improvements", "todoList", "imageStylePrompt"]
        };

        const contentResponse = await ai.models.generateContent({ model: modelName, contents: prompt, config: { responseMimeType: "application/json", responseSchema: presentationSchema } });
        
        // Track token usage with TokenManager
        const promptTokens = tokenCounter.countPromptTokens(prompt);
        const responseTokens = tokenCounter.countResponseTokens(contentResponse.text);
        
        try {
            await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
        } catch (error) {
            console.error('Error recording token usage:', error);
        }

        const presentationData: PresentationData = JSON.parse(contentResponse.text);

        if (!useTemplate) {
            const allSlideContents: (SlideContent | {title:string, items:TodoItem[], imagePrompt?: string})[] = [
                presentationData.introduction,
                ...presentationData.mainContentSlides,
                presentationData.projectStatus,
                presentationData.learnings,
                presentationData.improvements,
                presentationData.todoList,
            ];

            // Image generation removed to save API credits
        }
        
        setLoadingText(t('finalizingPresentation'));
        const { fileName, slideCount } = await createAndDownloadPptx(presentationData, options.templateFile || null);
        setPresentationReport(t('presentationSuccess', { fileName, slideCount }));


    } catch (err: any) {
        console.error("Fout bij genereren presentatie:", err);
        setError(`${t("presentationFailed")}: ${err.message || t("unknownError")}`);
    } finally { setLoadingText(''); }
};

  const createAndDownloadPptx = async (data: PresentationData, templateFile: File | null) => {
    const pptx = new PptxGenJS();
    const isCustomTemplate = templateFile !== null;

    if (isCustomTemplate && templateFile) {
        await (pptx as any).load(templateFile);
    } else {
        pptx.layout = 'LAYOUT_16x9';
        pptx.defineSlideMaster({
            title: "MASTER_SLIDE",
            background: { color: "0F172A" },
            objects: [
                { "placeholder": { options: { name: "title", type: "title", x: 0.5, y: 0.2, w: 9, h: 0.75, fontFace: "Helvetica", fontSize: 28, bold: true, color: "06B6D4" }, text: "Placeholder Title" } },
                { "rect": { x: 0.5, y: 5.3, w: '90%', h: 0.01, fill: { color: '0891B2' } } },
                { "text": { text: "RecapHorizon", options: { x: 0.5, y: 5.35, w: '50%', h: 0.2, fontFace: "Helvetica", fontSize: 10, color: "94A3B8" } } },
            ],
            slideNumber: { x: 9.0, y: 5.35, fontFace: "Arial", fontSize: 10, color: "94A3B8", align: 'right' }
        });
        pptx.defineSlideMaster({
            title: "TITLE_SLIDE_MASTER",
            background: { color: "0F172A" },
        });
    }

    const addContentSlide = (slideData: SlideContent, isTocSlide: boolean = false) => {
        const slide = pptx.addSlide(isCustomTemplate ? {} : { masterName: "MASTER_SLIDE" });
        
        if (isCustomTemplate) {
            slide.addText(slideData.title, { placeholder: 'title' });
            const bodyText = isTocSlide ? slideData.points.map(p => `• ${p}`).join('\n\n') : slideData.points.join('\n');
            slide.addText(bodyText, { placeholder: 'body', bullet: !isTocSlide });
        } else {
            slide.addText(slideData.title, { placeholder: "title" });
            if (isTocSlide) {
                slide.addText(slideData.points.map(p => `• ${p}`).join('\n\n'), { x: 0.75, y: 1.5, w: '85%', h: 3.5, fontFace: 'Arial', fontSize: 20, color: 'E2E8F0', lineSpacing: 36 });
                return;
            }
            const textOptions: PptxGenJS.TextPropsOptions = { fontFace: 'Arial', fontSize: 14, color: 'E2E8F0', bullet: { type: 'bullet', indent: 30, style: 'hyphen' }, lineSpacing: 28 };
            let textX: PptxGenJS.Coord = 0.5, textY: PptxGenJS.Coord = 1.1, textW: PptxGenJS.Coord = '90%', textH: PptxGenJS.Coord = '75%';
            // Image display removed - images are no longer generated
            slide.addText(slideData.points.join('\n'), { ...textOptions, x: textX, y: textY, w: textW, h: textH });
        }
    };

    if (isCustomTemplate) {
        const titleSlide = pptx.addSlide();
        titleSlide.addText(data.titleSlide.title, { placeholder: 'title' });
        if (data.titleSlide.subtitle) titleSlide.addText(data.titleSlide.subtitle, { placeholder: 'body' });
    } else {
        let titleSlide = pptx.addSlide({ masterName: "TITLE_SLIDE_MASTER" });
        titleSlide.addText(data.titleSlide.title, { w: '100%', h: 1.5, y: 2.0, fontFace: 'Helvetica', fontSize: 44, color: 'FFFFFF', bold: true, align: 'center' });
        if (data.titleSlide.subtitle) titleSlide.addText(data.titleSlide.subtitle, { w: '100%', h: 0.75, y: 3.5, fontFace: 'Arial', fontSize: 22, color: 'E2E8F0', align: 'center' });
    }
    
    if (data.agenda?.length > 0) addContentSlide({ title: t('inhoudsopgave', 'Agenda'), points: data.agenda }, true);
    addContentSlide(data.introduction);
    data.mainContentSlides?.forEach(s => addContentSlide(s));
    addContentSlide(data.projectStatus);
    addContentSlide(data.learnings);
    addContentSlide(data.improvements);

    const todoItems = data.todoList.items.filter(item => item.task);
    if(todoItems.length > 0) {
        let todoSlide = pptx.addSlide(isCustomTemplate ? {} : { masterName: "MASTER_SLIDE" });
        todoSlide.addText(data.todoList.title, { placeholder: 'title' });
        const tableHeader = [
            { text: t('taak', 'Task'), options: { fontFace: 'Helvetica', bold: true, color: 'FFFFFF', fill: { color: '0891B2' } } },
            { text: t('eigenaar', 'Owner'), options: { fontFace: 'Helvetica', bold: true, color: 'FFFFFF', fill: { color: '0891B2' } } },
            { text: t('deadline', 'Deadline'), options: { fontFace: 'Helvetica', bold: true, color: 'FFFFFF', fill: { color: '0891B2' } } },
        ];
        // Op verzoek: kolommen 'Owner' en 'Deadline' leeg laten
        const tableRows = todoItems.map(item => [{ text: item.task }, { text: '' }, { text: '' }]);
        todoSlide.addTable([tableHeader, ...tableRows], { x: '5%', y: 1.1, w: '90%', colW: [5.4, 1.8, 1.8], autoPage: true, rowH: 0.4, fill: { color: '1E293B' }, color: 'E2E8F0', fontSize: 12, valign: 'middle', border: { type: 'solid', pt: 1, color: '0F172A' } });
    }

    const fileName = `RecapHorizon_Presentation_${new Date().toISOString().split('T')[0]}.pptx`;
    pptx.writeFile({ fileName });
    return { fileName, slideCount: (pptx as any).slides.length };
};
  // Web Speech API transcription (free alternative)
  const handleWebSpeechTranscribe = async () => {
    setError('Web Speech API kan alleen live opnames transcriberen, niet opgeslagen audio. Gebruik de AI transcriptie optie voor opgeslagen opnames.');
    setStatus(RecordingStatus.ERROR);
    displayToast('Web Speech API ondersteunt geen opgeslagen audio transcriptie', 'error');
  };

  // Audio compressie functie
  const compressAudioChunks = async (chunks: Blob[]): Promise<Blob[]> => {
    try {
      // Combineer alle chunks tot één blob
      const combinedBlob = new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' });
      
      // Maak een audio element om de audio te laden
      const audioElement = new Audio();
      const audioUrl = URL.createObjectURL(combinedBlob);
      audioElement.src = audioUrl;
      
      return new Promise((resolve, reject) => {
        audioElement.onloadedmetadata = async () => {
          try {
            // Maak een audio context voor compressie
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const response = await fetch(audioUrl);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Reduceer sample rate voor compressie (van 44.1kHz naar 16kHz)
            const targetSampleRate = 16000;
            const ratio = audioBuffer.sampleRate / targetSampleRate;
            const newLength = Math.round(audioBuffer.length / ratio);
            
            // Maak een nieuwe buffer met lagere sample rate
            const compressedBuffer = audioContext.createBuffer(
              1, // Mono voor kleinere bestandsgrootte
              newLength,
              targetSampleRate
            );
            
            const originalData = audioBuffer.getChannelData(0);
            const compressedData = compressedBuffer.getChannelData(0);
            
            // Downsample de audio data
            for (let i = 0; i < newLength; i++) {
              const originalIndex = Math.round(i * ratio);
              compressedData[i] = originalData[originalIndex] || 0;
            }
            
            // Converteer terug naar blob
            const offlineContext = new OfflineAudioContext(
              1,
              compressedBuffer.length,
              targetSampleRate
            );
            
            const source = offlineContext.createBufferSource();
            source.buffer = compressedBuffer;
            source.connect(offlineContext.destination);
            source.start();
            
            const renderedBuffer = await offlineContext.startRendering();
            
            // Converteer naar WAV format voor betere compressie
            const wavBlob = audioBufferToWav(renderedBuffer);
            
            // Cleanup
            URL.revokeObjectURL(audioUrl);
            audioContext.close();
            
            console.log(`🗜️ Audio gecomprimeerd: ${(combinedBlob.size / 1024 / 1024).toFixed(2)}MB → ${(wavBlob.size / 1024 / 1024).toFixed(2)}MB`);
            resolve([wavBlob]);
          } catch (error) {
            URL.revokeObjectURL(audioUrl);
            reject(error);
          }
        };
        
        audioElement.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Kon audio niet laden voor compressie'));
        };
      });
    } catch (error) {
      console.error('Audio compressie fout:', error);
      return chunks; // Geef originele chunks terug bij fout
    }
  };
  
  // Helper functie om AudioBuffer naar WAV te converteren
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Audio data
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const handleTranscribe = async () => {
    if (!audioChunksRef.current.length) {
      // Probeer terug te vallen op audioURL als die bestaat
      if (audioURL) {
        try {
          const fetched = await fetch(audioURL);
          const fetchedBlob = await fetched.blob();
          if (fetchedBlob && fetchedBlob.size > 0) {
            audioChunksRef.current = [fetchedBlob];
          }
        } catch {}
      }
    }

    if (!audioChunksRef.current.length) {
      setError(t("noAudioToTranscribe"));
      setStatus(RecordingStatus.ERROR);
      return;
    }
  
    setStatus(RecordingStatus.TRANSCRIBING);
    setLoadingText(t('transcribing'));
    setError(null);
    setAnonymizationReport(null);
    setTranscript(''); setSummary(''); setFaq(''); setLearningDoc(''); setFollowUpQuestions('');
    
    // Audio compressie als ingeschakeld
    if (audioCompressionEnabled) {
      try {
        setLoadingText(t('compressingAudio', 'Audio wordt gecomprimeerd...'));
        audioChunksRef.current = await compressAudioChunks(audioChunksRef.current);
        console.log('✅ Audio succesvol gecomprimeerd');
      } catch (error) {
        console.warn('⚠️ Audio compressie gefaald, doorgaan met originele audio:', error);
      }
    }
    
    // Initialize progress tracking immediately
    setIsSegmentedTranscribing(true);
    setTranscriptionProgress(0);
  
    try {
        if (!apiKey) {
            displayToast(t('apiKeyNotAvailable'), 'error');
            return;
        }

        // Enhanced API validation
        const { ApiValidator } = await import('./src/utils/apiValidator');
        const apiValidation = await ApiValidator.validateGoogleSpeechApi(apiKey);
        
        if (!apiValidation.isValid) {
            const errorMessage = `${apiValidation.error}${apiValidation.suggestion ? ` - ${apiValidation.suggestion}` : ''}`;
            displayToast(errorMessage, 'error');
            setStatus(RecordingStatus.ERROR);
            setLoadingText('');
            return;
        }
        
        console.log('✅ Google Cloud Speech API validatie succesvol');

        // Validate token usage for transcription
        // Estimate tokens based on audio duration (rough estimate: 1 minute = ~150 tokens)
        const estimatedDurationMinutes = audioChunksRef.current.length / 60; // rough estimate
        const estimatedTokens = Math.max(500, estimatedDurationMinutes * 150);
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, estimatedTokens);
        
        if (!tokenValidation.allowed) {
            displayToast(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.', 'error');
            setTimeout(() => setShowPricingPage(true), 2000);
            setStatus(RecordingStatus.ERROR);
            setLoadingText('');
            return;
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });
        const chunks = audioChunksRef.current;
        const mimeType = (chunks?.[0] as any)?.type || 'audio/webm';

        // Dynamische segment grootte op basis van transcriptie kwaliteit
        const getSegmentSeconds = () => {
          switch (transcriptionQuality) {
            case 'fast': return 20; // Kleinere segmenten voor snelheid
            case 'high': return 45; // Grotere segmenten voor kwaliteit
            case 'balanced':
            default: return 30; // Gebalanceerd
          }
        };
        const segmentSeconds = getSegmentSeconds();
        const hasSecondResolution = chunks.length > 1; // wanneer MediaRecorder 1s chunks leverde
        const totalSegments = hasSecondResolution ? Math.ceil(chunks.length / segmentSeconds) : 1;

        const getSegmentBlob = (index: number) => {
          if (hasSecondResolution) {
            const start = index * segmentSeconds;
            const end = Math.min(start + segmentSeconds, chunks.length);
            const slice = chunks.slice(start, end);
            return new Blob(slice, { type: mimeType });
          }
          // fallback: geen seconde-resolutie -> hele blob in 1 segment
          return new Blob(chunks, { type: mimeType });
        };

        cancelTranscriptionRef.current = false;
        setIsSegmentedTranscribing(true);
        setTranscriptionProgress(0);
        
        // Enhanced connection monitoring
        const connectionMonitor = {
          isOnline: navigator.onLine,
          checkConnection: () => navigator.onLine,
          waitForConnection: async (maxWaitMs = 30000) => {
            const startTime = Date.now();
            while (!navigator.onLine && (Date.now() - startTime) < maxWaitMs) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            return navigator.onLine;
          }
        };
        
        // Check initial connection
        if (!connectionMonitor.checkConnection()) {
          console.warn('⚠️ Geen internetverbinding gedetecteerd, wachten op verbinding...');
          setLoadingText('Wachten op internetverbinding...');
          const connected = await connectionMonitor.waitForConnection();
          if (!connected) {
            setError('Geen internetverbinding beschikbaar voor transcriptie');
            setStatus(RecordingStatus.ERROR);
            setLoadingText('');
            return;
          }
        }
        
        console.log(`🎙️ ${t('startingTranscription', { count: totalSegments })}`);

        const inputLanguage = getGeminiCode(language || 'en');
        const transcribePrompt = `Transcribe this audio recording with ABSOLUTE ACCURACY. Follow these strict rules:
1. ONLY transcribe what is actually spoken in the audio - do NOT add, invent, or assume any content
2. If audio is unclear or inaudible, mark it as [UNCLEAR] or [INAUDIBLE] - do NOT guess
3. Preserve the exact words, pauses, and speech patterns as heard
4. Do NOT correct grammar, add punctuation that wasn't clearly indicated, or "improve" the speech
5. The spoken language is ${inputLanguage}
6. If no speech is detected in a segment, respond with [NO SPEECH DETECTED]
7. Stay strictly faithful to the audio content - accuracy over readability`;

        let combinedText = '';
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = 3;
        let totalInputTokens = 0;
        let totalOutputTokens = 0; // Stop if 3 segments fail in a row

        for (let i = 0; i < totalSegments; i++) {
          if (cancelTranscriptionRef.current) {
            setError(t('transcriptionCancelled'));
            break;
          }

          const segmentBlob = getSegmentBlob(i);
          const base64Audio = await blobToBase64(segmentBlob);
          const audioPart = { inlineData: { mimeType, data: base64Audio } };
          const textPart = { text: transcribePrompt };

          // Update progress UI before processing
          setTranscriptionProgress(i / totalSegments);
          setLoadingText(`${t('transcribing')} (${i + 1}/${totalSegments})`);
          
          console.log(`🎵 Verwerking segment ${i + 1}/${totalSegments} gestart...`);

          try {
            // Enhanced retry logic for 500 errors with better fallback
            let retryCount = 0;
            const maxRetries = 5; // Increased from 3 to 5
            let transcribeResponse;
            
            const modelName = await modelManager.getModelForFunction('audioTranscription');
            while (retryCount <= maxRetries) {
              try {
                transcribeResponse = await ai.models.generateContent({ 
                  model: modelName, 
                  contents: { parts: [textPart, audioPart] } 
                });
                break; // Success, exit retry loop
              } catch (retryError: any) {
                retryCount++;
                console.warn(`⚠️ Poging ${retryCount} voor segment ${i + 1} mislukt:`, retryError.message || retryError);
                
                // Check if it's a retryable error
                const isRetryableError = 
                  retryError.message?.includes('500') ||
                  retryError.message?.includes('INTERNAL') ||
                  retryError.message?.includes('503') ||
                  retryError.message?.includes('RESOURCE_EXHAUSTED') ||
                  retryError.status === 500 ||
                  retryError.status === 503 ||
                  retryError.status === 429 ||
                  retryError.code === 500;
                
                if (retryCount <= maxRetries && isRetryableError) {
                  // Faster retry for smaller segments
                  const baseWaitTime = 2000 * Math.pow(1.5, retryCount - 1); // Start at 2s, slower growth
                  const jitter = Math.random() * 1000; // Add 0-1s random jitter
                  const waitTime = Math.min(baseWaitTime + jitter, 30000); // Max 30s
                  console.log(`⏱️ Wachten ${Math.round(waitTime)}ms voor retry ${retryCount}...`);
                  await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                  throw retryError; // Re-throw if not retryable or max retries reached
                }
              }
            }
            
            const segText = transcribeResponse?.text || '';
            
            console.log(`✅ Segment ${i + 1} succesvol verwerkt, tekst lengte: ${segText.length} karakters`);
            
            // Reset consecutive failures on success
            consecutiveFailures = 0;

            if (segText) {
              combinedText += (combinedText ? '\n\n' : '') + segText;
              setTranscript(prev => (prev ? prev + '\n\n' : '') + segText);
            }
            
            // Track token usage with TokenManager per segment
            try {
              // Use accurate API-based token counting when possible
              let promptTokens, responseTokens;
              try {
                promptTokens = await tokenCounter.countTokensWithAPI(ai.models, [textPart]);
                responseTokens = await tokenCounter.countTokensWithAPI(ai.models, segText || '');
              } catch (apiError) {
                // Fallback to estimation if API counting fails
                promptTokens = tokenCounter.countPromptTokens([textPart]);
                responseTokens = tokenCounter.countResponseTokens(segText || '');
              }
              
              totalInputTokens += promptTokens;
              totalOutputTokens += responseTokens;
              await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
            } catch (error) {
              console.error('Error recording token usage for transcription segment:', error);
            }
          } catch (segmentError: any) {
            console.error(`❌ Fout bij segment ${i + 1}:`, segmentError);
            console.error(`❌ Error details:`, {
              message: segmentError.message,
              status: segmentError.status,
              code: segmentError.code
            });
            
            // Use enhanced error handler for better error management
            const { errorHandler } = await import('./src/utils/errorHandler');
            const userFriendlyError = errorHandler.handleApiError(segmentError, 
              segmentError.status || (segmentError.message?.includes('500') ? 500 : undefined), 
              {
                userId: user?.uid,
                sessionId: undefined,
                endpoint: 'google-speech-api'
              }
            );
            
            // Enhanced error handling with better user feedback
            let errorText;
            const isServerError = segmentError.message?.includes('500') || 
                                 segmentError.message?.includes('INTERNAL') || 
                                 segmentError.status === 500 || 
                                 segmentError.code === 500;
            
            if (isServerError) {
              errorText = `[Segment ${i + 1}: ⚠️ ${userFriendlyError.message}]`;
              console.log(`🔄 ${t('segmentSkipped', { number: i + 1 })}`);
            } else if (segmentError.message?.includes('quota') || segmentError.message?.includes('limit')) {
              errorText = `[Segment ${i + 1}: ⏸️ API-limiet bereikt - wacht en probeer later opnieuw]`;
            } else {
              errorText = `[Segment ${i + 1}: ❌ ${userFriendlyError.message}]`;
            }
            
            combinedText += (combinedText ? '\n\n' : '') + errorText;
            setTranscript(prev => (prev ? prev + '\n\n' : '') + errorText);
            
            // Track consecutive failures for circuit breaker
            consecutiveFailures++;
            
            // Circuit breaker: stop if too many consecutive failures
            if (consecutiveFailures >= maxConsecutiveFailures) {
              console.error(`🚨 ${t('tooManyConsecutiveErrors')} (${consecutiveFailures}). ${t('transcriptionStopped')}`);
            const stopMessage = `\n\n[⚠️ ${t('transcriptionStopped').replace('te veel fouten', `${consecutiveFailures} opeenvolgende fouten`)}. ${t('googleAiServiceOverloaded')}]`;
              combinedText += stopMessage;
              setTranscript(prev => prev + stopMessage);
              break; // Exit the transcription loop
            }
            
            // For server errors, continue with next segment instead of failing completely
            if (isServerError) {
              console.log(`⏭️ Doorgaan naar segment ${i + 2}/${totalSegments}... (${consecutiveFailures}/${maxConsecutiveFailures} opeenvolgende fouten)`);
            }
          }

          // Update progress UI after processing
          setTranscriptionProgress((i + 1) / totalSegments);
          
          // Dynamische delays op basis van transcriptie kwaliteit
          if (i < totalSegments - 1) {
            const getDelaySettings = () => {
              switch (transcriptionQuality) {
                case 'fast': return { base: 800, max: 2000, jitter: 200 }; // Zeer snel
                case 'high': return { base: 2000, max: 6000, jitter: 800 }; // Langzamer voor kwaliteit
                case 'balanced':
                default: return { base: 1500, max: 4000, jitter: 500 }; // Gebalanceerd
              }
            };
            const delaySettings = getDelaySettings();
            const progressiveDelay = Math.min(delaySettings.base + (i * 200), delaySettings.max);
            const jitterDelay = Math.random() * delaySettings.jitter;
            const totalDelay = progressiveDelay + jitterDelay;
            
            console.log(`⏱️ ${t('waitingForNextSegment', { ms: Math.round(totalDelay) })}`);
            await new Promise(resolve => setTimeout(resolve, totalDelay));
          }
        }

        if (cancelTranscriptionRef.current) {
          setStatus(RecordingStatus.STOPPED);
          return;
        }

        // Provide summary of transcription results
        const successfulSegments = totalSegments - consecutiveFailures;
        if (consecutiveFailures > 0) {
          console.log(`🏁 ${t('transcriptionCompletedWithWarnings')}. ${t('transcriptionSummary', { successful: successfulSegments, total: totalSegments })}`);
          const summaryMessage = `\n\n[📊 ${t('transcriptionSummary', { successful: successfulSegments, total: totalSegments })} ${consecutiveFailures > 0 ? t('segmentsSkippedDueToServerProblems', { count: consecutiveFailures }) : ''}]`;
          combinedText += summaryMessage;
          setTranscript(prev => prev + summaryMessage);
        } else {
          console.log(`🏁 ${t('transcriptionFullyCompleted', { count: totalSegments })}`);
        }
        
        // Final progress update
        setTranscriptionProgress(1);
        setLoadingText(t('transcribing') + ' - ' + t('processing'));

        // Set audio token usage for display
        setAudioTokenUsage({
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          totalTokens: totalInputTokens + totalOutputTokens
        });

        // Na volledige loop is transcript reeds opgebouwd via setTranscript per segment
      setSummary('');
      setFaq('');
      setLearningDoc('');
      setFollowUpQuestions('');
      setBlogData('');
      setChatHistory([]);
      setKeywordAnalysis(null);
      setSentimentAnalysisResult(null);
      setMindmapMermaid('');
      setMindmapSvg('');
      setExecutiveSummaryData(null);
      setStorytellingData(null);
      setBusinessCaseData(null);
      setQuizQuestions(null);
      setStatus(RecordingStatus.FINISHED);
        // Increment usage counters on successful finish
        try {
          if (authState.user) {
            await incrementUserDailyUsage(authState.user.uid, 'audio');
            await incrementUserMonthlySessions(authState.user.uid);
            setDailyAudioCount(prev => prev + 1);
          }
        } catch (e) {
          console.warn(t('errorUpdateSessionCount'), e);
        }
      setActiveView('transcript');

    } catch (err: any) {
      console.error("Fout bij AI-verwerking:", err);
      let errorMessage = `${t("aiError")}: `;
      
      if (err.message && err.message.includes('500')) {
        errorMessage += 'Interne serverfout. Probeer het over een paar minuten opnieuw.';
      } else if (err.message && err.message.includes('INTERNAL')) {
        errorMessage += 'Tijdelijke AI-servicefout. Probeer het later opnieuw.';
      } else {
        errorMessage += err.message || t("unknownError");
      }
      
      setError(errorMessage);
      setStatus(RecordingStatus.ERROR);
    } finally {
      // Add a small delay to ensure final progress is visible
      setTimeout(() => {
        setLoadingText('');
        setIsSegmentedTranscribing(false);
        setTranscriptionProgress(null);
        cancelTranscriptionRef.current = false;
      }, 500);
    }
  };
  
  const downloadTextFile = (text: string, filename: string) => {
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      displayToast(`File "${filename}" downloaded successfully!`, 'success');
    } catch (e) {
      console.error('Download failed', e);
      displayToast('Failed to download file. Please try again.', 'error');
    }
  };
  
  // --- RENDER FUNCTIONS ---
  
  // Simple markdown renderer for basic formatting
  const renderMarkdown = (text: string) => {
    if (!text) return text;
    
    // Sanitize the input first to prevent XSS
    const sanitizedText = sanitizeTextInput(text, 10000);
    
    // Convert **text** to bold (only after sanitization)
    const boldText = sanitizedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *text* to italic
    const italicText = boldText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert line breaks to <br> tags
    const withLineBreaks = italicText.replace(/\n/g, '<br>');
    
    // Only allow safe HTML tags
    const allowedTags = ['strong', 'em', 'br'];
    const safeHtml = withLineBreaks.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (match, tagName) => {
      return allowedTags.includes(tagName.toLowerCase()) ? match : '';
    });
    
    return <span dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  };

  const renderRecordingView = () => {
    // Calculate recording percentage based on user tier
    const getCurrentTierMaxDuration = () => {
      const tierLimits = {
        'free': 15,
        'silver': 60,
        'gold': 90,
        'enterprise': 90,
        'diamond': 120
      };
      return tierLimits[userSubscription] || 15;
    };

    const maxDurationMinutes = getCurrentTierMaxDuration();
    const currentDurationMinutes = computeRecordingElapsedMs() / (1000 * 60);
    const recordingPercentage = Math.min((currentDurationMinutes / maxDurationMinutes) * 100, 100);
    
    // Determine percentage color
    const getPercentageColor = (percentage) => {
      if (percentage < 75) return 'text-green-600';
      if (percentage < 90) return 'text-orange-500';
      return 'text-red-600';
    };

    const getPercentageBarColor = (percentage) => {
      if (percentage < 75) return 'bg-green-500';
      if (percentage < 90) return 'bg-orange-500';
      return 'bg-red-500';
    };

    return (
              <div className="w-full max-w-6xl bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Audio opname
          </h2>
          
          {/* Recording Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Opnametijd</span>
              <span className={`text-sm font-semibold ${getPercentageColor(recordingPercentage)}`}>
                {Math.round(recordingPercentage)}% ({Math.round(currentDurationMinutes)}/{maxDurationMinutes} min)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${getPercentageBarColor(recordingPercentage)}`}
                style={{ width: `${recordingPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recording Tijden */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="px-4 py-2 rounded-md bg-gray-100 dark:bg-slate-700">
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">start</div>
              <div className="font-mono text-base font-semibold text-green-600">
                {recordingStartMs ? new Date(recordingStartMs).toLocaleTimeString('nl-NL') : '--:--:--'}
              </div>
            </div>
            <div className="px-4 py-2 rounded-md bg-gray-100 dark:bg-slate-700">
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">opname</div>
              <div className="font-mono text-base font-semibold text-red-600">
                {new Date(computeRecordingElapsedMs()).toISOString().substr(11, 8)}
              </div>
            </div>
            <div className="px-4 py-2 rounded-md bg-gray-100 dark:bg-slate-700">
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">pauze</div>
              <div className="font-mono text-base font-semibold text-orange-500">
                {new Date(computePauseElapsedMs()).toISOString().substr(11, 8)}
              </div>
            </div>
          </div>
        </div>

        {/* Audio Visualisatie */}
        <div className="w-full flex flex-col items-center">
          <canvas 
            ref={canvasRef} 
            width="600" 
            height="100" 
            className="w-full max-w-2xl border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
            style={{ width: '100%', height: '100px' }}
          />
          {/* Niveaubalk voor input-level */}
          <div className="mt-2 w-full max-w-2xl h-2 bg-slate-700 rounded">
            <div
              className="h-2 bg-cyan-500 rounded transition-[width] duration-150"
              style={{ width: `${Math.round(avgInputLevel * 100)}%` }}
              aria-label="Invoerniveau"
            />
          </div>

        </div>

        {/* Real-time transcriptie UI verwijderd */}

        {/* Opname Controls */}
        <div className="flex justify-center gap-4">
          {status === RecordingStatus.RECORDING ? (
            <>
              <button 
                onClick={pauseRecording} 
                disabled={isProcessing} 
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PauseIcon className="w-6 h-6" /> 
                <span className="text-lg font-semibold">{t('pause')}</span>
              </button>
              <button 
                onClick={stopRecording} 
                disabled={isProcessing} 
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <StopIcon className="w-6 h-6" /> 
                <span className="text-lg font-semibold">{t('stop')}</span>
              </button>
            </>
          ) : status === RecordingStatus.PAUSED ? (
            <>
              <button 
                onClick={resumeRecording} 
                disabled={isProcessing} 
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-green-500 text-white hover:bg-green-600 disabled:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlayIcon className="w-6 h-6" /> 
                <span className="text-lg font-semibold">{t('resume')}</span>
              </button>
              <button 
                onClick={stopRecording} 
                disabled={isProcessing} 
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <StopIcon className="w-6 h-6" /> 
                <span className="text-lg font-semibold">{t('stop')}</span>
              </button>
            </>
          ) : null}
        </div>

        {/* Enhanced Status Info */}
        <div className="text-center text-sm">
          {status === RecordingStatus.RECORDING && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 dark:text-red-400 font-medium">Opname actief</span>
              </div>
              {avgInputLevel > 0.01 ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs">Audio gedetecteerd</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-500 dark:text-orange-400">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-xs">Geen audio gedetecteerd</span>
                </div>
              )}
            </div>
          )}
          {status === RecordingStatus.PAUSED && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">Opname gepauzeerd</span>
            </div>
          )}
          {recordingPercentage >= 100 && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-red-600 dark:text-red-400 font-medium text-xs">Maximale opnametijd bereikt!</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderControls = () => {
    switch (status) {
      case RecordingStatus.IDLE:
      case RecordingStatus.ERROR:
        return null; // Deze worden nu getoond in de startup workflow
      case RecordingStatus.GETTING_PERMISSION: return <p className="text-lg text-yellow-500 dark:text-yellow-400">{t('waitingPermission')}</p>;
      case RecordingStatus.STOPPED:
        return (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="text-lg text-green-600 dark:text-green-400 mb-2">{t('recordingStopped')}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Je audio opname is klaar. Luister terug en start de transcriptie wanneer je klaar bent.
              </p>
            </div>
            
            {/* Audio informatie panel */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 w-full max-w-md">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">📊 Opname Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Bestandsgrootte:</span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {audioChunksRef.current && audioChunksRef.current.length > 0 
                      ? `${(audioChunksRef.current.reduce((total, chunk) => total + chunk.size, 0) / 1024 / 1024).toFixed(1)} MB`
                      : 'Onbekend'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Audio formaat:</span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {audioChunksRef.current && audioChunksRef.current.length > 0 
                      ? audioChunksRef.current[0].type || 'audio/webm'
                      : 'audio/webm'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Kwaliteit:</span>
                  <span className="text-slate-800 dark:text-slate-200">64 kbps, 16kHz mono</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Geoptimaliseerd voor:</span>
                  <span className="text-slate-800 dark:text-slate-200">Spraakherkenning</span>
                </div>
              </div>
            </div>

            {/* Audio player */}
            <div className="w-full max-w-md">
              <audio 
                controls 
                src={audioURL || null} 
                className="w-full"
                onLoadedMetadata={(e) => {
                  // Reset de slider positie naar het begin
                  const audio = e.target as HTMLAudioElement;
                  audio.currentTime = 0;
                }}
                onError={(e) => {
                  console.error('Audio loading error:', e);
                }}
              />
              {audioURL && (
                <div className="mt-2 text-center space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    🎧 Luister je opname terug voordat je transcribeert
                  </p>
                  <button 
                    onClick={() => {
                      if (audioURL) {
                        const a = document.createElement('a');
                        a.href = audioURL;
                        a.download = `opname-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        displayToast(t('downloadAudio') + ' gestart', 'success');
                      }
                    }}
                    className="text-xs text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300 underline"
                  >
                    📥 {t('downloadAudio')}
                  </button>
                </div>
              )}
            </div>

            {/* Waarschuwing over audio verwijdering */}
            <div className="w-full max-w-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
                ⚠️ {t('audioDeleteWarning')}
              </p>
            </div>

            {/* Actie knoppen */}
            <div className="flex flex-col gap-3 w-full max-w-md">
              {/* Transcriptie knop */}
              <button 
                onClick={handleTranscribe} 
                disabled={isProcessing} 
                className="w-full px-6 py-3 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-600 disabled:bg-slate-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>🚀</span>
                Transcriberen
              </button>
              <button 
                onClick={() => {
                  // Reset audio data en ga terug naar idle status
                  if (audioURL) {
                    URL.revokeObjectURL(audioURL);
                    setAudioURL(null);
                  }
                  audioChunksRef.current = [];
                  setStatus(RecordingStatus.IDLE);
                  setError('');
                  // Reset alle session data
                  setTranscript('');
                  setSummary('');
                  setKeywordAnalysis(null);
                  setSentiment(null);
                  setFaq('');
                  setLearnings('');
                  setFollowup('');
                  setChatHistory([]);
                  setMindmapText('');
                  setExecutiveSummaryData(null);
                  setStorytellingData(null);
                  setBusinessCaseData(null);
                  setBlogData('');
                  setExplainData(null);
                  setQuizQuestions(null);
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>❌</span>
                Annuleren
              </button>
            </div>
            
            {/* Informatie over transcriptie */}
            <div className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-md space-y-2">
              <p>🚀 <strong>AI transcriptie:</strong> Hoogwaardige transcriptie met AI technologie</p>
              <p>⚠️ Tip: Controleer je opname voordat je transcribeert. De annuleren knop wist alle sessiedata.</p>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const renderAnalysisView = () => {
    const handleGenerateExecutiveSummary = async () => {
      // Check transcript length based on user tier
      const effectiveTier = userSubscription;
      const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
      if (!transcriptValidation.allowed) {
        setError(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
      }
      
      try {
        // Don't reset other analysis data when generating executive summary
        setLoadingText(t('generating', { type: 'Executive summary' }));
        
        // Validate token usage for executive summary
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const sys = `Act as a seasoned McKinsey-style business analyst creating an extremely concise one-slide Executive Summary in OSC-R-B-C format (Objective, Situation, Complication, Resolution, Benefits, Call to Action). Use at most 1-3 short sentences per section. If a section is not explicitly present, output "[Niet expliciet besproken]". Return ONLY valid JSON with keys: objective, situation, complication, resolution, benefits, call_to_action.`;
        const prompt = `${sys}\n\nTranscript (NL or other):\n${getTranscriptSlice(transcript, 20000)}`;
        const estimatedTokens = tokenCounter.countPromptTokens(prompt) + 500; // Add buffer for response
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, estimatedTokens);
        
        if (!tokenValidation.allowed) {
          setError(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
          setTimeout(() => setShowPricingPage(true), 2000);
          setLoadingText('');
          return;
        }
        const modelName = await modelManager.getModelForFunction('generalAnalysis');
        const res = await ai.models.generateContent({ model: modelName, contents: prompt });
        
        // Track token usage with TokenManager
        try {
          const promptTokens = tokenCounter.countPromptTokens(prompt);
          const responseTokens = tokenCounter.countResponseTokens(res.text);
          await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
        } catch (error) {
          console.error('Error recording token usage for executive summary:', error);
        }

        let text = res.text || '';
        text = text.replace(/```[a-z]*|```/gi, '').trim();
        const data = JSON.parse(text);
        setExecutiveSummaryData({
          objective: data.objective || '[Niet expliciet besproken]',
          situation: data.situation || '[Niet expliciet besproken]',
          complication: data.complication || '[Niet expliciet besproken]',
          resolution: data.resolution || '[Niet expliciet besproken]',
          benefits: data.benefits || '[Niet expliciet besproken]',
          call_to_action: data.call_to_action || '[Niet expliciet besproken]'
        });
        setActiveView('exec');
      } catch (e: any) {
        setError(`${t('generationFailed', { type: 'Executive summary' })}: ${e.message || t('unknownError')}`);
      } finally {
        setLoadingText('');
      }
    };
    async function handleGenerateStorytelling(options?: StorytellingOptions) {
      // Check transcript length based on user tier
      const effectiveTier = userSubscription;
      const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
      if (!transcriptValidation.allowed) {
        setError(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
      }
      
      try {
        // Don't reset other analysis data when generating storytelling
        setLoadingText(t('generating', { type: 'Storytelling' }));
        
        // Validate token usage for storytelling
        const inputLanguage = getGeminiCode(language || 'en');
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
        
        // Build custom prompt based on user options
        let customInstructions = '';
        if (options) {
          if (options.targetAudience) {
            customInstructions += `\n- Doelgroep: ${options.targetAudience}`;
          }
          if (options.mainGoal) {
            customInstructions += `\n- Hoofddoel: ${options.mainGoal}`;
          }
          if (options.toneStyle) {
            customInstructions += `\n- Toon/Stijl: ${options.toneStyle}`;
          }
          if (options.length) {
            // Add specific word count guidelines based on length
            let wordCountGuideline = '';
            switch (options.length) {
              case 'short':
                wordCountGuideline = 'short (aim for 300-500 words)';
                break;
              case 'medium':
                wordCountGuideline = 'medium (aim for 500-800 words)';
                break;
              case 'long':
                wordCountGuideline = 'long (aim for 800-1200 words)';
                break;
              default:
                wordCountGuideline = options.length;
            }
            customInstructions += `\n- Gewenste lengte: ${wordCountGuideline}. IMPORTANT: Strictly adhere to this word count range.`;
          }
        }
        
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        const sys = `You receive a **${inputLanguage}** transcript from a meeting/webinar/podcast. Transform this into a narrative text in **${outputLanguage}** that reads like a story. Use storytelling elements: don't use character names, describe the setting, build tension around dilemmas or questions, and end with a clear outcome or cliffhanger. Write in an accessible and vivid style, as if it were a journalistic article or short story. Use quotes from the transcript as dialogue fragments. Focus on emotion, conflict, and the key insights that emerged. Make it readable for a broad audience, without being boring or too technical.${customInstructions}`;
        const prompt = `${sys}\n\nTranscript:\n${getTranscriptSlice(transcript, 20000)}`;
        const estimatedTokens = tokenCounter.countPromptTokens(prompt) + 1000; // Add buffer for response
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, estimatedTokens);
        
        if (!tokenValidation.allowed) {
          setError(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
          setTimeout(() => setShowPricingPage(true), 2000);
          setLoadingText('');
          return;
        }
        const modelName = await modelManager.getModelForFunction('generalAnalysis');
        const res = await ai.models.generateContent({ model: modelName, contents: prompt });
        
        // Track token usage with TokenManager
        try {
          const promptTokens = tokenCounter.countPromptTokens(prompt);
          const responseTokens = tokenCounter.countResponseTokens(res.text);
          await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
        } catch (error) {
          console.error('Error recording token usage for storytelling:', error);
        }

        let text = res.text || '';
        text = text.replace(/```[a-z]*|```/gi, '').trim();
        setStorytellingData({
          story: text
        });
        setActiveView('storytelling');
      } catch (e: any) {
        setError(`${t('generationFailed', { type: 'Storytelling' })}: ${e.message || t('unknownError')}`);
      } finally {
        setLoadingText('');
      }
    }

    // Expose for modal callback without relying on local identifier binding during initial render
    if (typeof window !== 'undefined') {
      (window as any).handleGenerateStorytelling = handleGenerateStorytelling;
    }



    const handleGenerateBlog = async () => {
      // Check transcript length based on user tier
      const effectiveTier = userSubscription;
      const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
      if (!transcriptValidation.allowed) {
        setError(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
      }
      
      try {
        // Don't reset other analysis data when generating blog
        // This allows  to keep other analyses while generating blog content
        setLoadingText(t('generating', { type: 'Blog' }));
        
        // Validate token usage for blog generation
        const inputLanguage = getGeminiCode(language || 'en');
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
        
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const sys = `Act as an experienced content marketer/blog writer. Analyze the **${inputLanguage}** transcript thoroughly to identify key topics, discussion points, conclusions and insights. Generate a complete blog post in **${outputLanguage}** that effectively communicates the core message of the transcript to a broad audience.
IMPORTANT: Start DIRECTLY with the title (H1), without introduction or explanation about how the blog was written.
Blog Post Structure:
# [Catchy Title] - Start directly with the title
[Directly the first paragraph of the blog, without introduction about what will be covered]
Main sections (H2): Split the main topics from the transcript into 2-4 logical sections, each with a clear heading.
Paragraphs: Each section should consist of multiple paragraphs explaining the content.
Bullets/Bullet Points (if relevant): Use bulleted lists where appropriate to present information more clearly (e.g. key insights, action items, benefits).
Conclusion/Summary: A short conclusion that repeats the main takeaways and encourages the reader to think or take action.
Call to Action (Blog-specific): E.g. "Leave your comment", "Want to know more?", "Subscribe to our newsletter". (Optional, and generic if no specific CTA can be derived from the meeting.)
Tone: The standard tone should be informative, objective and somewhat enthusiastic/engaged. It should captivate the reader.
Length: Standard length: approx. 500 words (or 4000 characters). If the transcript is very short, a shorter but complete blog post. If the transcript is extremely long, focus on the most important highlights within the specified length.`;
        const prompt = `${sys}\n\nTranscript:\n${getTranscriptSlice(transcript, 20000)}`;
        const estimatedTokens = tokenCounter.countPromptTokens(prompt) + 1000; // Add buffer for response
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, estimatedTokens);
        
        if (!tokenValidation.allowed) {
          setError(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
          setTimeout(() => setShowPricingPage(true), 2000);
          setLoadingText('');
          return;
        }
        const modelName = await modelManager.getModelForFunction('generalAnalysis');
        const res = await ai.models.generateContent({ model: modelName, contents: prompt });
        
        // Track token usage with TokenManager
        try {
          const promptTokens = tokenCounter.countPromptTokens(prompt);
          const responseTokens = tokenCounter.countResponseTokens(res.text);
          await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
        } catch (error) {
          console.error('Error recording token usage for blog generation:', error);
        }

        let text = res.text || '';
        text = text.replace(/```[a-z]*|```/gi, '').trim();
        setBlogData(text);
        setActiveView('blog');
      } catch (e: any) {
        setError(`${t('generationFailed', { type: 'Blog' })}: ${e.message || t('unknownError')}`);
      } finally {
        setLoadingText('');
      }
    };

    const handleGenerateEmail = async (options: EmailOptions) => {
      // Check transcript length based on user tier
      const effectiveTier = userSubscription;
      const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
      if (!transcriptValidation.allowed) {
        setError(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
      }
      
      try {
        setLoadingText(t('generating', { type: 'Email' }));
        
        // Validate token usage for email generation
        const inputLanguage = getGeminiCode(language || 'en');
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
        
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        const lengthInstructions = {
          'Zeer Kort': 'Write a very brief email (2-3 sentences maximum).',
          'Kort': 'Write a short email (1 paragraph).',
          'Gemiddeld': 'Write a medium-length email (2-3 paragraphs).',
          'Uitgebreid': 'Write a comprehensive email with detailed information.'
        };
        
        const toneInstructions = {
          'Professioneel': 'Use professional business language.',
          'Vriendelijk': 'Use friendly and approachable language.',
          'Formeel': 'Use formal and respectful language.',
          'Informeel': 'Use casual and relaxed language.'
        };
        
        const sys = `Act as a professional email writer. Analyze the **${inputLanguage}** transcript and create a well-structured email in **${outputLanguage}** based on the specified requirements.

Requirements:
- Length: ${lengthInstructions[options.length as keyof typeof lengthInstructions] || 'Write a medium-length email'}
- Tone: ${toneInstructions[options.tone as keyof typeof toneInstructions] || 'Use professional language'}

Structure the email with:
1. Clear subject line
2. Appropriate greeting
3. Main content based on transcript key points
4. Professional closing

IMPORTANT: Start DIRECTLY with the email content, without introduction or explanation about how it was written.`;
        
        const prompt = `${sys}\n\nTranscript:\n${getTranscriptSlice(transcript, 20000)}`;
        const estimatedTokens = tokenCounter.countPromptTokens(prompt) + 800; // Add buffer for response
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, estimatedTokens);
        
        if (!tokenValidation.allowed) {
          setError(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
          setTimeout(() => setShowPricingPage(true), 2000);
          setLoadingText('');
          return;
        }
        const modelName = await modelManager.getModelForFunction('generalAnalysis');
        const res = await ai.models.generateContent({ model: modelName, contents: prompt });
        
        // Track token usage with TokenManager
        try {
          const promptTokens = tokenCounter.countPromptTokens(prompt);
          const responseTokens = tokenCounter.countResponseTokens(res.text);
          await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
        } catch (error) {
          console.error('Error recording token usage for email generation:', error);
        }

        let text = res.text || '';
        text = text.replace(/```[a-z]*|```/gi, '').trim();
        
        setEmailContent(text);
        setActiveView('email');
      } catch (e: any) {
        setError(`${t('generationFailed', { type: 'Email' })}: ${e.message || t('unknownError')}`);
      } finally {
        setLoadingText('');
      }
    };

    const handleGenerateExplain = async (options: ExplainOptions) => {
      // Check transcript length based on user tier
      const effectiveTier = userSubscription;
      const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
      if (!transcriptValidation.allowed) {
        setError(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
      }
      
      try {
        setLoadingText(t('generating', { type: 'Explain' }));
        
        // Validate token usage for explain generation
        const inputLanguage = getGeminiCode(language || 'en');
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
        
        const complexityInstructions = {
          'Beginner (basisconcepten)': 'Use basic concepts and simple language. Avoid jargon.',
          'Algemeen publiek (duidelijke taal)': 'Use clear, accessible language. Explain technical terms.',
          'Teamleden (specifieke context)': 'Use team-specific context and terminology.',
          'Expert (technisch/diepgaand)': 'Use technical language and deep analysis.',
          'Kind van 5 (extreem eenvoudig)': 'Use extremely simple language. Explain everything as if to a 5-year-old.',
          '5-Year-Old (extremely simple)': 'Use extremely simple language. Explain everything as if to a 5-year-old.'
        };
        
        const formatInstructions = {
          'Korte paragraaf': 'Write in short, clear paragraphs.',
          'Opsomming (bullet points)': 'Use bullet points and lists for clarity.',
          'Vraag & Antwoord stijl': 'Structure as questions and answers.',
          'Stap-voor-stap handleiding': 'Provide step-by-step instructions.'
        };
        
        const sys = `Act as an expert educator. Analyze the **${inputLanguage}** transcript and create a clear explanation in **${outputLanguage}** based on the specified requirements.

Requirements:
- Complexity Level: ${complexityInstructions[options.complexityLevel as keyof typeof complexityInstructions] || 'Use clear, accessible language'}
- Focus Area: ${options.focusArea}
- Format: ${formatInstructions[options.format as keyof typeof formatInstructions] || 'Write in clear paragraphs'}

IMPORTANT: Start DIRECTLY with the explanation, without introduction or explanation about how it was written.`;
        
        const prompt = `${sys}\n\nTranscript:\n${getTranscriptSlice(transcript, 20000)}`;
        const estimatedTokens = tokenCounter.countPromptTokens(prompt) + 1000; // Add buffer for response
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, estimatedTokens);
        
        if (!tokenValidation.allowed) {
          setError(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
          setTimeout(() => setShowPricingPage(true), 2000);
          setLoadingText('');
          return;
        }
        
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = await modelManager.getModelForFunction('generalAnalysis');
        const res = await ai.models.generateContent({ model: modelName, contents: prompt });
        
        // Track token usage with TokenManager
        try {
          const promptTokens = tokenCounter.countPromptTokens(prompt);
          const responseTokens = tokenCounter.countResponseTokens(res.text);
          await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
        } catch (error) {
          console.error('Error recording token usage for explain generation:', error);
        }

        let text = res.text || '';
        text = text.replace(/```[a-z]*|```/gi, '').trim();
        
        setExplainData({
          complexityLevel: options.complexityLevel,
          focusArea: options.focusArea,
          format: options.format,
          explanation: text
        });
        
        setActiveView('explain');
      } catch (e: any) {
        setError(`${t('generationFailed', { type: 'Explain' })}: ${e.message || t('unknownError')}`);
      } finally {
        setLoadingText('');
      }
    };

    const handleGenerateMindmap = async () => {
      // Check transcript length based on user tier
      const effectiveTier = userSubscription;
      const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
      if (!transcriptValidation.allowed) {
        setError(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
      }
      
      try {
        setLoadingText(t('generating', { type: 'Mindmap' }));
        
        // Validate token usage for mindmap generation
        const sys = `You are a mindmap generator. Output ONLY Mermaid mindmap syntax (mindmap\n  root(...)) without code fences. Use at most 3 levels, 6-12 nodes total, concise labels.`;
        const prompt = `${sys}\n\nTranscript:\n${transcript.slice(0, 12000)}`;
        const tokenEstimate = tokenManager.estimateTokens(prompt, 1.5);
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, tokenEstimate.totalTokens);
        
        if (!tokenValidation.allowed) {
          setError(tokenValidation.reason || 'Token limiet bereikt voor je huidige abonnement.');
          setTimeout(() => setShowPricingPage(true), 2000);
          return;
        }
        
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = await modelManager.getModelForFunction('generalAnalysis');
        const res = await ai.models.generateContent({ model: modelName, contents: prompt });
        
        // Track token usage with TokenManager
        try {
          const promptTokens = tokenCounter.countPromptTokens(prompt);
          const responseTokens = tokenCounter.countResponseTokens(res.text);
          await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
        } catch (error) {
          console.error('Error recording token usage for mindmap generation:', error);
        }
        
        const raw = res.text || '';
        const cleaned = raw.replace(/```[a-z]*|```/gi, '').trim();
        if (!/^mindmap\b/.test(cleaned)) throw new Error(t('invalidMindmapOutput', 'Invalid mindmap output'));
        setMindmapMermaid(cleaned);
        
        try {
          const mod = await import('mermaid');
          const m: any = (mod as any).default || mod;
          const { svg } = await m.render('mindmap-svg', cleaned);
          setMindmapSvg(svg);
        } catch (rErr) { 
          console.warn('Mermaid render failed', rErr); 
        }
        
        setActiveView('mindmap');
      } catch (e: any) {
        setError(`${t('generationFailed', { type: 'Mindmap' })}: ${e.message || t('unknownError')}`);
      } finally {
        setLoadingText('');
      }
    };

    const renderMindmapView = () => {
      if (!transcript.trim()) return <div className="flex items-center justify-center p-8 min-h-[300px] text-slate-500 dark:text-slate-400">{t('noContent')}</div>;
      if (!mindmapMermaid) {
        return (
          <div className="flex items-center justify-center p-8">
            <button
              onClick={async () => {
                // Check transcript length based on user tier
                const effectiveTier = userSubscription;
                const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
                if (!transcriptValidation.allowed) {
                  setError(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.');
                  setTimeout(() => setShowPricingPage(true), 2000);
                  return;
                }
                
                try {
                  // Only reset other analysis data if we don't already have mindmap data
                                      if (!mindmapMermaid) {
                      setStorytellingData(null);
                      setExecutiveSummaryData(null);
                      setBusinessCaseData(null);
                      setSummary('');
                      setFaq('');
                      setLearningDoc('');
                      setFollowUpQuestions('');
                      setKeywordAnalysis([]);
                      setSentimentAnalysisResult(null);
                      setQuizQuestions([]);
                      setBlogData('');
                    }
                  setLoadingText(t('generating', { type: 'Mindmap' }));
                  
                  // Validate token usage for mindmap generation
                  const sys = `You are a mindmap generator. Output ONLY Mermaid mindmap syntax (mindmap\n  root(...)) without code fences. Use at most 3 levels, 6-12 nodes total, concise labels.`;
                  const prompt = `${sys}\n\nTranscript:\n${getTranscriptSlice(transcript, 12000)}`;
                  const estimatedTokens = tokenCounter.countPromptTokens(prompt) + 500; // Add buffer for response
                  const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, estimatedTokens);
                  
                  if (!tokenValidation.allowed) {
                    setError(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
                    setTimeout(() => setShowPricingPage(true), 2000);
                    setLoadingText('');
                    return;
                  }
                  
                  const ai = new GoogleGenAI({ apiKey: apiKey });
                  const modelName = await modelManager.getModelForFunction('generalAnalysis');
                  const res = await ai.models.generateContent({ model: modelName, contents: prompt });
                  
                  // Track token usage with TokenManager
                  try {
                    const promptTokens = tokenCounter.countPromptTokens(prompt);
                    const responseTokens = tokenCounter.countResponseTokens(res.text);
                    await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
                  } catch (error) {
                    console.error('Error recording token usage for mindmap generation:', error);
                  }

                  const raw = res.text || '';
                  const cleaned = raw.replace(/```[a-z]*|```/gi, '').trim();
                  if (!/^mindmap\b/.test(cleaned)) throw new Error(t('invalidMindmapOutput', 'Invalid mindmap output'));
                  setMindmapMermaid(cleaned);
                  try {
                    const mod = await import('mermaid');
                    const m: any = (mod as any).default || mod;
                    const { svg } = await m.render('mindmap-svg', cleaned);
                    setMindmapSvg(svg);
                  } catch (rErr) { console.warn('Mermaid render failed', rErr); }
                } catch (e: unknown) {
                  setError(`${t('generationFailed', { type: 'Mindmap' })}: ${(e as Error).message || t('unknownError')}`);
                } finally {
                  setLoadingText('');
                }
              }}
              className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
              {t('mindmap')}
            </button>
          </div>
        );
      }
      return (
        <div className="relative p-4">

          {mindmapSvg ? (
            <div className="overflow-auto max-h-[70vh]" dangerouslySetInnerHTML={{ __html: mindmapSvg }} />
          ) : (
                                <pre className="text-sm whitespace-pre-wrap bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 overflow-auto max-h-[70vh]">{renderMarkdown(mindmapMermaid)}</pre>
          )}
        </div>
      );
    };
    const primaryActions: any[] = [
        { id: 'transcript', type: 'view', icon: TranscriptIcon, label: () => isAnonymized ? t('transcriptAnonymized') : t('transcript') },
        { id: 'anonymize', type: 'action', icon: AnonymizeIcon, label: () => t('anonymize'), onClick: handleAnonymizeTranscript, disabled: () => isProcessing || isAnonymized || !transcript.trim() },
        { id: 'chat', type: 'view', icon: ChatIcon, label: () => t('chat') },

        { id: 'presentation', type: 'action', icon: PresentationIcon, label: () => t('exportPPT'), onClick: () => {
            // Check if user has access to PowerPoint export
            const effectiveTier = userSubscription;
                if (!subscriptionService.isFeatureAvailable(effectiveTier, 'exportPpt')) {
        displayToast('Helaas heeft u niet genoeg credits om deze functie uit te voeren. Klik hier om te upgraden naar een hoger abonnement.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }
            setShowPptOptions(true);
        }, disabled: () => isProcessing || !transcript.trim() },
        { id: 'businessCase', type: 'action', icon: BusinessCaseIcon, label: () => t('businessCase'), onClick: () => {
            // Check if user has access to business case generation
            const effectiveTier = userSubscription;
                if (!subscriptionService.isFeatureAvailable(effectiveTier, 'businessCase')) {
        displayToast('Helaas heeft u niet genoeg credits om deze functie uit te voeren. Klik hier om te upgraden naar een hoger abonnement.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }
            setActiveView('businessCase');
        }, disabled: () => isProcessing || !transcript.trim() },
    ];
    const analysisActions: any[] = [
        { id: 'summary', type: 'view', icon: SummaryIcon, label: () => t('summary') },
        { id: 'exec', type: 'view', icon: ExecutiveSummaryIcon, label: () => t('executiveSummary') },
        { id: 'keyword', type: 'view', icon: TagIcon, label: () => t('keywordAnalysis')},
        { id: 'sentiment', type: 'view', icon: SentimentIcon, label: () => t('sentiment')},
        { id: 'faq', type: 'view', icon: FaqIcon, label: () => t('faq') },
        { id: 'quiz', type: 'view', icon: FaqIcon, label: () => t('quizQuestions') },
        { id: 'learning', type: 'view', icon: LearningIcon, label: () => t('keyLearnings') }, 
        { id: 'followUp', type: 'view', icon: FollowUpIcon, label: () => t('followUp') },
        { id: 'mindmap', type: 'view', icon: MindmapIcon, label: () => t('mindmap') },
        { id: 'storytelling', type: 'view', icon: StorytellingIcon, label: () => t('storytelling') },
        { id: 'blog', type: 'view', icon: BlogIcon, label: () => t('blog') },
        { id: 'explain', type: 'view', icon: ExplainIcon, label: () => t('explain') },
        // Email tab - alleen zichtbaar voor Gold, Enterprise, Diamond en bij email import
        ...((userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.ENTERPRISE || userSubscription === SubscriptionTier.DIAMOND || sessionType === SessionType.EMAIL_IMPORT) ? 
            [{ id: 'email', type: 'view', icon: MailIcon, label: () => t('email') }] : [])
    ];

    const analysisContent: Record<ViewType, string> = { transcript, summary, faq, learning: learningDoc, followUp: followUpQuestions, chat: '', keyword: '', sentiment: '', mindmap: '', storytelling: storytellingData?.story || '', blog: blogData, businessCase: businessCaseData?.businessCase || '', exec: executiveSummaryData ? JSON.stringify(executiveSummaryData) : '', quiz: quizQuestions ? quizQuestions.map(q => `${q.question}\n${q.options.map(opt => `${opt.label}. ${opt.text}`).join('\n')}\nCorrect: ${q.correct_answer_label}`).join('\n\n') : '', explain: explainData?.explanation || '', email: emailContent || '' };

    const handleTabClick = (view: ViewType) => {
        // Check if content already exists for each tab type to avoid regeneration
        if (view === 'summary' && summary) { setActiveView('summary'); return; }
        if (view === 'faq' && faq) { setActiveView('faq'); return; }
        if (view === 'learning' && learningDoc) { setActiveView('learning'); return; }
        if (view === 'followUp' && followUpQuestions) { setActiveView('followUp'); return; }
        if (view === 'exec' && executiveSummaryData) { setActiveView('exec'); return; }
        if (view === 'keyword' && keywordAnalysis && keywordAnalysis.length > 0) { setActiveView('keyword'); return; }

        if (view === 'sentiment' && sentimentAnalysisResult) { setActiveView('sentiment'); return; }
        if (view === 'storytelling' && storytellingData?.story) { setActiveView('storytelling'); return; }
        if (view === 'blog' && blogData) { setActiveView('blog'); return; }
        if (view === 'mindmap' && mindmapMermaid) { setActiveView('mindmap'); return; }
        if (view === 'quiz' && quizQuestions) { setActiveView('quiz'); return; }
        if (view === 'businessCase' && businessCaseData?.businessCase) { setActiveView('businessCase'); return; }
        if (view === 'explain' && explainData?.explanation) { setActiveView('explain'); return; }
        if (view === 'email' && emailContent) { setActiveView('email'); return; }

        // If content doesn't exist, generate it
        if (['summary', 'faq', 'learning', 'followUp'].includes(view)) {
            handleGenerateAnalysis(view);
        } else if (view === 'exec') {
            handleGenerateExecutiveSummary();
        } else if (view === 'quiz') {
            setActiveView('quiz');
        } else if (view === 'keyword') {
            handleGenerateKeywordAnalysis();
        } else if (view === 'sentiment') {
            handleAnalyzeSentiment();
        } else if (view === 'storytelling') {
            handleOpenStorytellingQuestions();
        } else if (view === 'blog') {
            handleGenerateBlog();
        } else if (view === 'businessCase') {
            // Initialize business case data if not exists
            if (!businessCaseData) {
                setBusinessCaseData({
                    businessCaseType: 'Kostenbesparing',
                    useInternetVerification: false,
                    businessCase: ''
                });
            }
            setActiveView('businessCase');
        } else if (view === 'explain') {
            // Initialize explain data if not exists
            if (!explainData) {
                setExplainData({
                    complexityLevel: explainOptions.complexityLevel,
                    focusArea: explainOptions.focusArea,
                    format: explainOptions.format,
                    explanation: ''
                });
            }
            setActiveView('explain');
        } else if (view === 'email') {
            setActiveView('email');
        } else if (view === 'mindmap') {
            // Generate mindmap if it doesn't exist
            (async () => {
              try {
                setLoadingText(t('generating', { type: 'Mindmap' }));
                const ai = new GoogleGenAI({ apiKey: apiKey });
                // Using ModelManager for mindmap generation
                const modelName = await modelManager.getModelForFunction('generalAnalysis');
                const sys = `You are a mindmap generator. Output ONLY Mermaid mindmap syntax (mindmap\n  root(...)) without code fences. Use at most 3 levels, 6-12 nodes total, concise labels.`;
                const prompt = `${sys}\n\nTranscript:\n${transcript.slice(0, 12000)}`;
                const res = await ai.models.generateContent({ model: modelName, contents: prompt });
                const raw = res.text || '';
                const cleaned = raw.replace(/```[a-z]*|```/gi, '').trim();
                if (!/^mindmap\b/.test(cleaned)) throw new Error(t('invalidMindmapOutput', 'Invalid mindmap output'));
                setMindmapMermaid(cleaned);
                try {
                  const mod = await import('mermaid');
                  const m: any = (mod as any).default || mod;
                  const { svg } = await m.render('mindmap-svg', cleaned);
                  setMindmapSvg(svg);
                } catch (rErr) { console.warn('Mermaid render failed', rErr); }
              } catch (e: any) {
                setError(`${t('generationFailed', { type: 'Mindmap' })}: ${e.message || t('unknownError')}`);
              } finally { setLoadingText(''); }
            })();
        } else {
            setActiveView(view);
        }
    };
    const renderContent = () => {
        if (activeView !== 'transcript' && activeView !== 'chat' && activeView !== 'podcast' && activeView !== 'sentiment' && loadingText && !analysisContent[activeView] && !keywordAnalysis) {
            return <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>;
        }
        if (activeView === 'chat') {
            // Check if user has access to chat
            const effectiveTier = userSubscription;
            if (!subscriptionService.isFeatureAvailable(effectiveTier, 'chat')) {
                return (
                    <div className="flex items-center justify-center p-8 min-h-[300px]">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🔒</div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Chat niet beschikbaar</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                Chat functionaliteit is beschikbaar vanaf Gold tier. Upgrade je abonnement om te kunnen chatten met je transcript.
                            </p>
                            <button 
                                onClick={() => setShowPricingPage(true)}
                                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                            >
                                Bekijk Abonnementen
                            </button>
                        </div>
                    </div>
                );
            }
            return renderChatView();
        }
        if (activeView === 'exec') {
            if (!executiveSummaryData && loadingText) {
                return <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300 min-h-[300px]"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>;
            }
            if (!executiveSummaryData) {
                return <div className="flex items-center justify-center p-8 min-h-[300px] text-slate-500 dark:text-slate-400">{t('noContent')}</div>;
            }
            const block = (title: string, text: string) => (
                <div className="mb-4">
                    <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400 mb-1">{title}</h4>
                                            <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{renderMarkdown(text)}</p>
                </div>
            );
            return (
                <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[70vh] overflow-y-auto">
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => handleGenerateExecutiveSummary()} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('regenerate', 'Regenerate')}>
                            🔄
                        </button>
                        <button onClick={async () => {
                            const txt = (() => {
                                const parts: string[] = [
                                  `## ${t('executiveSummary')}`,
                                  '',
                                  `${t('objective')}: ${executiveSummaryData.objective}`,
                                  `${t('situation')}: ${executiveSummaryData.situation}`,
                                  `${t('complication')}: ${executiveSummaryData.complication}`,
                                  `${t('resolution')}: ${executiveSummaryData.resolution}`,
                                  `${t('benefits')}: ${executiveSummaryData.benefits}`,
                                  `${t('callToAction')}: ${executiveSummaryData.call_to_action}`
                                ];
                                return parts.join('\n');
                            })();
                            try {
                                await copyToClipboard(txt);
                                displayToast(t('copiedToClipboard'), 'success');
                            } catch {
                                displayToast(t('copyFailed'), 'error');
                            }
                        }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
                            <CopyIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => {
                            const txt = (() => {
                                const parts: string[] = [
                                  `## ${t('executiveSummary')}`,
                                  '',
                                  `${t('objective')}: ${executiveSummaryData.objective}`,
                                  `${t('situation')}: ${executiveSummaryData.situation}`,
                                  `${t('complication')}: ${executiveSummaryData.complication}`,
                                  `${t('resolution')}: ${executiveSummaryData.resolution}`,
                                  `${t('benefits')}: ${executiveSummaryData.benefits}`,
                                  `${t('callToAction')}: ${executiveSummaryData.call_to_action}`
                                ];
                                return parts.join('\n');
                            })();
                            downloadTextFile(txt, 'executive-summary.txt');
                        }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('download')}>
                            ⬇️
                        </button>
                        <button onClick={() => {
                            const content = (() => {
                                const parts: string[] = [
                                  `## ${t('executiveSummary')}`,
                                  '',
                                  `${t('objective')}: ${executiveSummaryData.objective}`,
                                  `${t('situation')}: ${executiveSummaryData.situation}`,
                                  `${t('complication')}: ${executiveSummaryData.complication}`,
                                  `${t('resolution')}: ${executiveSummaryData.resolution}`,
                                  `${t('benefits')}: ${executiveSummaryData.benefits}`,
                                  `${t('callToAction')}: ${executiveSummaryData.call_to_action}`
                                ];
                                return parts.join('\n');
                            })();
                            const { subject, body } = generateEmailContent(t('executiveSummary'), content);
                            copyToClipboardForEmail(subject, body);
                        }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyForEmail')}>
                            ✉️
                        </button>
                    </div>
                    {block(t('objective', 'Objective'), executiveSummaryData.objective)}
                    {block(t('situation', 'Situation'), executiveSummaryData.situation)}
                    {block(t('complication', 'Complication'), executiveSummaryData.complication)}
                    {block(t('resolution', 'Resolution'), executiveSummaryData.resolution)}
                    {block(t('benefits', 'Benefits'), executiveSummaryData.benefits)}
                    {block(t('callToAction', 'Call to Action'), executiveSummaryData.call_to_action)}
                </div>
            );
        }
        if (activeView === 'storytelling') {
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[70vh] overflow-y-auto">
                    {/* Inline options */}
                    <div className="mb-4 p-3 rounded border border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40">
                        <div className="text-xs text-cyan-700 dark:text-cyan-300 mb-3">{t('storytellingOptional')}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('storytellingTargetAudience')}</label>
                                <select value={storyOptions.targetAudience} onChange={(e) => setStoryOptions(s => ({ ...s, targetAudience: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    <option value="">-</option>
                                    <option value={td('storytellingTargetAudienceOptions.internalTeam')}>{td('storytellingTargetAudienceOptions.internalTeam')}</option>
                                    <option value={td('storytellingTargetAudienceOptions.management')}>{td('storytellingTargetAudienceOptions.management')}</option>
                                    <option value={td('storytellingTargetAudienceOptions.customers')}>{td('storytellingTargetAudienceOptions.customers')}</option>
                                    <option value={td('storytellingTargetAudienceOptions.investors')}>{td('storytellingTargetAudienceOptions.investors')}</option>
                                    <option value={td('storytellingTargetAudienceOptions.newEmployees')}>{td('storytellingTargetAudienceOptions.newEmployees')}</option>
                                    <option value={td('storytellingTargetAudienceOptions.generalPublic')}>{td('storytellingTargetAudienceOptions.generalPublic')}</option>
                                    <option value={td('storytellingTargetAudienceOptions.academics')}>{td('storytellingTargetAudienceOptions.academics')}</option>
                                    <option value={td('storytellingTargetAudienceOptions.competitors')}>{td('storytellingTargetAudienceOptions.competitors')}</option>
                                    <option value={td('storytellingTargetAudienceOptions.localCommunity')}>{td('storytellingTargetAudienceOptions.localCommunity')}</option>
                                    <option value={td('storytellingTargetAudienceOptions.alumni')}>{td('storytellingTargetAudienceOptions.alumni')}</option>
                                    <option value={td('storytellingTargetAudienceOptions.internationalStakeholders')}>{td('storytellingTargetAudienceOptions.internationalStakeholders')}</option>
                                    <option value={td('storytellingTargetAudienceOptions.specificInterestGroups')}>{td('storytellingTargetAudienceOptions.specificInterestGroups')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('storytellingMainGoal')}</label>
                                <select value={storyOptions.mainGoal} onChange={(e) => setStoryOptions(s => ({ ...s, mainGoal: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    <option value="">-</option>
                                    <option value={td('storytellingMainGoalOptions.inform')}>{td('storytellingMainGoalOptions.inform')}</option>
                                    <option value={td('storytellingMainGoalOptions.motivate')}>{td('storytellingMainGoalOptions.motivate')}</option>
                                    <option value={td('storytellingMainGoalOptions.convince')}>{td('storytellingMainGoalOptions.convince')}</option>
                                    <option value={td('storytellingMainGoalOptions.celebrate')}>{td('storytellingMainGoalOptions.celebrate')}</option>
                                    <option value={td('storytellingMainGoalOptions.explain')}>{td('storytellingMainGoalOptions.explain')}</option>
                                    <option value={td('storytellingMainGoalOptions.educate')}>{td('storytellingMainGoalOptions.educate')}</option>
                                    <option value={td('storytellingMainGoalOptions.warn')}>{td('storytellingMainGoalOptions.warn')}</option>
                                    <option value={td('storytellingMainGoalOptions.engage')}>{td('storytellingMainGoalOptions.engage')}</option>
                                    <option value={td('storytellingMainGoalOptions.promote')}>{td('storytellingMainGoalOptions.promote')}</option>
                                    <option value={td('storytellingMainGoalOptions.reflect')}>{td('storytellingMainGoalOptions.reflect')}</option>
                                    <option value={td('storytellingMainGoalOptions.predict')}>{td('storytellingMainGoalOptions.predict')}</option>
                                    <option value={td('storytellingMainGoalOptions.commemorate')}>{td('storytellingMainGoalOptions.commemorate')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('storytellingToneStyle')}</label>
                                <select value={storyOptions.toneStyle} onChange={(e) => setStoryOptions(s => ({ ...s, toneStyle: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    <option value="">-</option>
                                    <option value={td('storytellingToneStyleOptions.formal')}>{td('storytellingToneStyleOptions.formal')}</option>
                                    <option value={td('storytellingToneStyleOptions.informal')}>{td('storytellingToneStyleOptions.informal')}</option>
                                    <option value={td('storytellingToneStyleOptions.inspiring')}>{td('storytellingToneStyleOptions.inspiring')}</option>
                                    <option value={td('storytellingToneStyleOptions.critical')}>{td('storytellingToneStyleOptions.critical')}</option>
                                    <option value={td('storytellingToneStyleOptions.humorous')}>{td('storytellingToneStyleOptions.humorous')}</option>
                                    <option value={td('storytellingToneStyleOptions.empathetic')}>{td('storytellingToneStyleOptions.empathetic')}</option>
                                    <option value={td('storytellingToneStyleOptions.neutral')}>{td('storytellingToneStyleOptions.neutral')}</option>
                                    <option value={td('storytellingToneStyleOptions.dynamic')}>{td('storytellingToneStyleOptions.dynamic')}</option>
                                    <option value={td('storytellingToneStyleOptions.warm')}>{td('storytellingToneStyleOptions.warm')}</option>
                                    <option value={td('storytellingToneStyleOptions.technical')}>{td('storytellingToneStyleOptions.technical')}</option>
                                    <option value={td('storytellingToneStyleOptions.narrative')}>{td('storytellingToneStyleOptions.narrative')}</option>
                                    <option value={td('storytellingToneStyleOptions.cultureSensitive')}>{td('storytellingToneStyleOptions.cultureSensitive')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('storytellingLength')}</label>
                                <select value={storyOptions.length} onChange={(e) => setStoryOptions(s => ({ ...s, length: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    <option value="">-</option>
                                    <option value={td('storytellingLengthOptions.short')}>{td('storytellingLengthOptions.short')}</option>
                                    <option value={td('storytellingLengthOptions.medium')}>{td('storytellingLengthOptions.medium')}</option>
                                    <option value={td('storytellingLengthOptions.long')}>{td('storytellingLengthOptions.long')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-2">
                            <button onClick={() => handleGenerateStorytelling(storyOptions)} disabled={!transcript.trim()} className="px-3 py-2 rounded bg-cyan-600 text-white text-sm hover:bg-cyan-700 disabled:opacity-50">{t('storytellingGenerate')}</button>
                        </div>
                    </div>

                    {/* Output */}
                    {storytellingData ? (
                        <div className="relative">
                            <div className="absolute top-0 right-0 flex gap-2">
                                <button onClick={() => handleGenerateStorytelling(storyOptions)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('regenerate', 'Opnieuw')}>
                                    🔄
                                </button>
                                <button onClick={async () => {
                                    try {
                                        await copyToClipboard(storytellingData.story);
                                        displayToast(t('copiedToClipboard'), 'success');
                                    } catch {
                                        displayToast(t('copyFailed'), 'error');
                                    }
                                }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
                                    <CopyIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => downloadTextFile(storytellingData.story, 'storytelling.txt')} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('download')}>⬇️</button>
                            </div>
                            <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400 mb-2">{t('storytelling')}</h4>
                            <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">{storytellingData.story}</p>
                        </div>
                    ) : (
                        <div className="text-slate-500 dark:text-slate-400">{t('noContent')}</div>
                    )}
                </div>
            );
        }
        if (activeView === 'quiz') {
            return (
                <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[70vh] transition-colors">
                    <div className="flex flex-wrap gap-3 items-end mb-4">
                        <div>
                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('numberOfQuestions')}</label>
                            <input type="number" min={1} max={5} value={quizNumQuestions} onChange={(e) => setQuizNumQuestions(Math.max(1, Math.min(5, Number(e.target.value) || 2)))} className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('optionsPerQuestion')}</label>
                            <select value={quizNumOptions} onChange={(e) => setQuizNumOptions(Number(e.target.value) as 2|3|4)} className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900">
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                            </select>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={quizIncludeAnswers} onChange={(e) => setQuizIncludeAnswers(e.target.checked)} className="w-4 h-4" />
                            <span>{t('includeAnswers')}</span>
                        </label>
                        <button onClick={handleGenerateQuiz} disabled={isGeneratingQuiz || !transcript.trim()} className="px-3 py-2 rounded bg-cyan-600 text-white text-sm hover:bg-cyan-700 disabled:opacity-50">{isGeneratingQuiz ? t('generatingQuiz') : t('generate')}</button>
                        {quizQuestions && quizQuestions.length > 0 && (
                            <div className="ml-auto flex items-center gap-2">
                                <button onClick={async () => {
                                    const txt = (() => {
                                        const parts: string[] = ['## Quizvragen', ''];
                                        quizQuestions.forEach((q, idx) => {
                                            parts.push(`${idx + 1}. ${q.question}`);
                                            q.options.forEach(opt => parts.push(`  ${opt.label}) ${opt.text}`));
                                            if (quizIncludeAnswers) parts.push(`  Correct antwoord: ${q.correct_answer_label} - ${q.correct_answer_text}`);
                                            parts.push('');
                                        });
                                        return parts.join('\n');
                                    })();
                                    try { await navigator.clipboard.writeText(txt); displayToast(t('copy'), 'success'); } catch {}
                                }} className="px-3 py-1.5 rounded bg-slate-800 text-white text-sm hover:bg-slate-900">{t('copy')}</button>
                                <button onClick={() => {
                                    const txt = (() => {
                                        const parts: string[] = ['## Quizvragen', ''];
                                        quizQuestions.forEach((q, idx) => {
                                            parts.push(`${idx + 1}. ${q.question}`);
                                            q.options.forEach(opt => parts.push(`  ${opt.label}) ${opt.text}`));
                                            if (quizIncludeAnswers) parts.push(`  Correct antwoord: ${q.correct_answer_label} - ${q.correct_answer_text}`);
                                            parts.push('');
                                        });
                                        return parts.join('\n');
                                    })();
                                    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a'); a.href = url; a.download = 'quizvragen.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                                    displayToast(t('downloadTxt'), 'success');
                                }} className="px-3 py-1.5 rounded bg-slate-700 text-white text-sm hover:bg-slate-800">{t('downloadTxt')}</button>
                                <button onClick={() => {
                                    const content = (() => {
                                        const parts: string[] = ['## Quizvragen', ''];
                                        if (!quizQuestions) return '';
                                        quizQuestions.forEach((q, idx) => {
                                            parts.push(`${idx + 1}. ${q.question}`);
                                            q.options.forEach(opt => parts.push(`  ${opt.label}) ${opt.text}`));
                                            if (quizIncludeAnswers) parts.push(`  Correct antwoord: ${q.correct_answer_label} - ${q.correct_answer_text}`);
                                            parts.push('');
                                        });
                                        return parts.join('\n');
                                    })();
                                    const { subject, body } = generateEmailContent(t('quizQuestions', 'Quizvragen'), content);
                                    copyToClipboardForEmail(subject, body);
                                }} className="px-3 py-1.5 rounded bg-slate-600 text-white text-sm hover:bg-slate-700">{t('mail')}</button>
                            </div>
                        )}
                    </div>
                    {quizError && <div className="text-sm text-red-600 mb-2">{quizError}</div>}
                    {quizQuestions && quizQuestions.length > 0 ? (
                        <ol className="space-y-3 list-decimal list-inside">
                            {quizQuestions.map((q, idx) => (
                                <li key={`quiz-${idx}-${q.question.substring(0, 20)}`} className="text-sm">
                                    <div className="font-medium text-slate-800 dark:text-slate-100 mb-1">
                                        <SafeUserText text={q.question} />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        {q.options.map(opt => (
                                            <div key={opt.label} className="text-slate-700 dark:text-slate-200">
                                                {opt.label}) <SafeUserText text={opt.text} />
                                            </div>
                                        ))}
                                    </div>
                                    {quizIncludeAnswers && (
                                        <div className="mt-1 text-slate-700 dark:text-slate-200">Correct antwoord: {q.correct_answer_label} - {q.correct_answer_text}</div>
                                    )}
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <div className="text-center text-slate-500 dark:text-slate-400 min-h-[200px] flex items-center justify-center">{t('noContent')}</div>
                    )}
                </div>
            );
        }
        if (activeView === 'mindmap') return renderMindmapView();
        

        if (activeView === 'blog') {
            const L = blogLabels[uiLang] || blogLabels.en;
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[70vh] overflow-y-auto">
                    {/* Inline Blog Options (optional) */}
                    <div className="mb-4 p-3 rounded border border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40">
                        <div className="text-xs text-cyan-700 dark:text-cyan-300 mb-3">{td('storytellingOptional')}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('blogTargetAudience')}:</label>
                                <select value={blogOptions.targetAudience} onChange={(e) => setBlogOptions(b => ({ ...b, targetAudience: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    {L.targetAudience.map((v, i) => (<option key={i} value={v}>{v || '—'}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('blogMainGoal')}:</label>
                                <select value={blogOptions.mainGoal} onChange={(e) => setBlogOptions(b => ({ ...b, mainGoal: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    {L.mainGoal.map((v, i) => (<option key={i} value={v}>{v || '—'}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('blogTone')}:</label>
                                <select value={blogOptions.tone} onChange={(e) => setBlogOptions(b => ({ ...b, tone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    {L.tone.map((v, i) => (<option key={i} value={v}>{v || '—'}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('blogLength')}:</label>
                                <select value={blogOptions.length} onChange={(e) => setBlogOptions(b => ({ ...b, length: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    {L.length.map((v, i) => (<option key={i} value={v}>{v || '—'}</option>))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-2">
                            <button onClick={handleGenerateBlog} disabled={!transcript.trim()} className="px-3 py-2 rounded bg-cyan-600 text-white text-sm hover:bg-cyan-700 disabled:opacity-50">{t('generate')}</button>
                        </div>
                    </div>

                    {/* Output */}
                    {loadingText && !blogData ? (
                        <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300 min-h-[200px]"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>
                    ) : blogData ? (
                        <div className="relative">
                            <div className="absolute top-0 right-0 flex gap-2">
                                <button onClick={handleGenerateBlog} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('regenerate', 'Opnieuw')}>
                                    🔄
                                </button>
                                <button onClick={async () => {
                                    try {
                                        await copyToClipboard(blogData);
                                        displayToast(t('copiedToClipboard'), 'success');
                                    } catch {
                                        displayToast(t('copyFailed'), 'error');
                                    }
                                }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
                                    <CopyIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => downloadTextFile(blogData, 'blog.txt')} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download">⬇️</button>
                            </div>
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                {renderMarkdown(blogData)}
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 dark:text-slate-400">{t('noContent')}</div>
                    )}
                </div>
            );
        }

        if (activeView === 'sentiment') {
            if ((isAnalyzingSentiment || loadingText) && !sentimentAnalysisResult) {
                return <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300 min-h-[300px]"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText || t('analyzingSentiment')}...</div>;
            }
            if (sentimentAnalysisResult) {
                const fullContent = `${t('sentimentSummary')}\n${sentimentAnalysisResult.summary}\n\n${t('sentimentConclusion')}\n${sentimentAnalysisResult.conclusion}`;
                return (
                    <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[70vh] transition-colors">
                         <div className="absolute top-4 right-4 flex gap-2">
                             <button onClick={() => handleAnalyzeSentiment()} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('regenerate', 'Regenerate')}>
                                 🔄
                             </button>
                             <button onClick={() => copyToClipboard(fullContent)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
                                 <CopyIcon className="w-5 h-5" />
                             </button>
                             <button onClick={() => downloadTextFile(fullContent, `sentiment.txt`)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download">
                                 ⬇️
                             </button>
                             <button onClick={() => {
                                 const { subject, body } = generateEmailContent(t('sentiment'), fullContent);
                                 copyToClipboardForEmail(subject, body);
                             }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email">
                                 ✉️
                             </button>
                         </div>
                        <div className="overflow-y-auto max-h-[calc(70vh-120px)] space-y-6">
                            <div>
                                <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400 mb-2">{t('sentimentSummary')}</h4>
                                <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">{renderMarkdown(sentimentAnalysisResult.summary)}</p>
                            </div>
                             <div>
                                <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400 mb-2">{t('sentimentConclusion')}</h4>
                                <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">{renderMarkdown(sentimentAnalysisResult.conclusion)}</p>
                            </div>
                        </div>
                    </div>
                );
            }
            return <div className="flex items-center justify-center p-8 min-h-[300px] text-slate-500 dark:text-slate-400">{t('noContent')}</div>;
        }

        if (activeView === 'keyword') {
            return (
                <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[70vh] transition-colors">
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => handleGenerateKeywordAnalysis()} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('regenerate', 'Regenerate')}>
                            🔄
                        </button>
                        <button onClick={() => {
                            const txt = (() => {
                                const parts: string[] = [`## ${t('keywordAnalysis')}`, ''];
                                if (keywordAnalysis) {
                                    keywordAnalysis.forEach(topic => {
                                        if (topic.topic) parts.push(`- ${topic.topic}: ${topic.keywords.join(', ')}`);
                                        else parts.push(`- ${topic.keywords.join(', ')}`);
                                    });
                                }
                                return parts.join('\n');
                            })();
                            copyToClipboard(txt);
                        }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
                            <CopyIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => {
                            const txt = (() => {
                                const parts: string[] = [`## ${t('keywordAnalysis')}`, ''];
                                if (keywordAnalysis) {
                                    keywordAnalysis.forEach(topic => {
                                        if (topic.topic) parts.push(`- ${topic.topic}: ${topic.keywords.join(', ')}`);
                                        else parts.push(`- ${topic.keywords.join(', ')}`);
                                    });
                                }
                                return parts.join('\n');
                            })();
                            downloadTextFile(txt, 'keyword-analysis.txt');
                        }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download">
                            ⬇️
                        </button>
                        <button onClick={() => {
                            const content = (() => {
                                const parts: string[] = [`## ${t('keywordAnalysis')}`, ''];
                                if (keywordAnalysis) {
                                    keywordAnalysis.forEach(topic => {
                                        if (topic.topic) parts.push(`- ${topic.topic}: ${topic.keywords.join(', ')}`);
                                        else parts.push(`- ${topic.keywords.join(', ')}`);
                                    });
                                }
                                return parts.join('\n');
                            })();
                            const { subject, body } = generateEmailContent(t('keywordAnalysis'), content);
                            copyToClipboardForEmail(subject, body);
                        }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email">
                            ✉️
                        </button>
                    </div>
                    {loadingText && !keywordAnalysis && <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>}
                    {keywordAnalysis && keywordAnalysis.length === 0 && !loadingText && <p>{t('noContent')}</p>}
                    {keywordAnalysis && keywordAnalysis.length > 0 && (
                        <div className="overflow-y-auto max-h-[calc(70vh-120px)] space-y-6">
                            {keywordAnalysis.map((topic, index) => (
                                <div key={`keyword-topic-${index}-${topic.topic || 'untitled'}`} className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-xl">
                                    <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400 mb-2">{topic.topic}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {topic.keywords.map(keyword => (
                                            <button 
                                                key={keyword} 
                                                onClick={() => handleKeywordClick(keyword)}
                                                className="bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                                            >
                                                {keyword}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        if (activeView === 'storytelling') {
            return (
                <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[70vh] transition-colors">
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => {
                            const txt = (() => {
                                const parts: string[] = [`## ${t('storytelling')}`, ''];
                                if (storytellingData) {
                                    parts.push(storytellingData.story);
                                }
                                return parts.join('\n');
                            })();
                            copyToClipboard(txt);
                        }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
                            <CopyIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => {
                            const txt = (() => {
                                const parts: string[] = [`## ${t('storytelling')}`, ''];
                                if (storytellingData) {
                                    parts.push(storytellingData.story);
                                }
                                return parts.join('\n');
                            })();
                            downloadTextFile(txt, 'storytelling.txt');
                        }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download">
                            ⬇️
                        </button>
                        <button onClick={() => {
                            const content = (() => {
                                const parts: string[] = [`## ${t('storytelling')}`, ''];
                                if (storytellingData) {
                                    parts.push(storytellingData.story);
                                }
                                return parts.join('\n');
                            })();
                            const { subject, body } = generateEmailContent(t('storytelling'), content);
                            copyToClipboardForEmail(subject, body);
                        }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email">
                            ✉️
                        </button>
                    </div>
                    {loadingText && !storytellingData && <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>}
                    {storytellingData && (
                        <div className="overflow-y-auto max-h-[calc(70vh-120px)] space-y-6">
                            <div>
                                <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400 mb-2">{t('storytelling')}</h4>
                                <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">{renderMarkdown(storytellingData.story)}</p>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (activeView === 'businessCase') {
            if (loadingText) {
                return <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300 min-h-[300px]"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>;
            }
            
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[70vh] overflow-y-auto">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400 mb-4">Business Case Generator</h3>
                        
                        <div className="space-y-6">
                            {/* Business Case Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Business Case Type
                                </label>
                                <select 
                                    value={businessCaseData?.businessCaseType || 'Kostenbesparing'} 
                                    onChange={(e) => setBusinessCaseData(prev => ({ ...prev, businessCaseType: e.target.value } as BusinessCaseData))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                    <option value="Kostenbesparing">Kostenbesparing – hoe de oplossing processen efficiënter maakt en kosten verlaagt.</option>
                                    <option value="Omzetgroei">Omzetgroei – hoe de oplossing nieuwe markten opent of verkoop vergroot.</option>
                                    <option value="Innovatie">Innovatie / Concurrentievoordeel – hoe de oplossing helpt om voorop te blijven in de markt.</option>
                                    <option value="Risicovermindering">Risicovermindering – hoe de oplossing compliance, veiligheid of betrouwbaarheid verhoogt.</option>
                                    <option value="Klanttevredenheid">Klanttevredenheid & Retentie – hoe de oplossing de ervaring van klanten of medewerkers verbetert.</option>
                                    <option value="Schaalbaarheid">Schaalbaarheid & Toekomstbestendigheid – hoe de oplossing mee kan groeien met de organisatie.</option>
                                </select>
                            </div>

                            {/* Internet Verification */}
                            <div>
                                <label className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={businessCaseData?.useInternetVerification || false} 
                                        onChange={(e) => setBusinessCaseData(prev => ({ ...prev, useInternetVerification: e.target.checked } as BusinessCaseData))}
                                        className="rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        Internet verificatie (grounding) - Ja
                                    </span>
                                </label>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Vul aan met actuele marktdata en relevante trends van internet
                                </p>
                            </div>

                            {/* Generate Button */}
                            <div className="pt-4">
                                <button 
                                    onClick={() => handleGenerateBusinessCase()}
                                    className="w-full px-4 py-2 text-sm bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                                >
                                    Genereren
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Show existing business case if available */}
                    {businessCaseData && (
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-600">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400">Gegenereerde Business Case</h4>
                                <div className="flex gap-2">
                                    <button onClick={() => {
                                        const txt = `## Business Case\n\n${businessCaseData.businessCase}`;
                                        copyToClipboard(txt);
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
                                        <CopyIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => {
                                        const txt = `## Business Case\n\n${businessCaseData.businessCase}`;
                                        downloadTextFile(txt, 'business-case.txt');
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download">
                                        ⬇️
                                    </button>
                                    <button onClick={() => {
                                        const { subject, body } = generateEmailContent('Business Case', `## Business Case\n\n${businessCaseData.businessCase}`);
                                        copyToClipboardForEmail(subject, body);
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email">
                                        ✉️
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                                <p><strong>Type:</strong> {businessCaseData.businessCaseType}</p>
                                <p><strong>Internet verificatie:</strong> {businessCaseData.useInternetVerification ? 'Ja' : 'Nee'}</p>
                            </div>
                            <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">{renderMarkdown(businessCaseData.businessCase)}</p>
                        </div>
                    )}
                    
                    {!businessCaseData && (
                        <div className="text-center text-slate-500 dark:text-slate-400">
                            {t('noContent')}
                        </div>
                    )}
                </div>
            );
        }

        if (activeView === 'email') {
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[70vh] overflow-y-auto">
                    <EmailCompositionTab
                        transcript={transcript}
                        summary={summary}
                        emailAddresses={emailAddresses}
                        userId={user.uid}
                        userTier={userSubscription}
                        onPreviewEmail={(emailData: EmailData) => {
                            console.log('Preview email:', emailData);
                            // You can implement email preview functionality here
                        }}
                        onOpenMailto={(emailData: EmailData) => {
                            const { subject, body } = generateEmailContent(t('email'), emailData.body);
                            const mailtoUrl = `mailto:${emailData.to.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                            window.open(mailtoUrl, '_blank');
                        }}
                    />
                </div>
            );
        }
        if (activeView === 'explain') {
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[70vh] overflow-y-auto">
                    {/* Inline Explain Options */}
                    <div className="mb-4 p-3 rounded border border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40">
                        <div className="text-xs text-cyan-700 dark:text-cyan-300 mb-3">{t('explainOptional')}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('explainComplexityLevel')}</label>
                                <select value={explainOptions.complexityLevel} onChange={(e) => setExplainOptions(s => ({ ...s, complexityLevel: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    <option value="Beginner (basisconcepten)">{t('explainComplexityBeginner')}</option>
                                    <option value="Algemeen publiek (duidelijke taal)">{t('explainComplexityGeneral')}</option>
                                    <option value="Teamleden (specifieke context)">{t('explainComplexityTeam')}</option>
                                    <option value="Expert (technisch/diepgaand)">{t('explainComplexityExpert')}</option>
                                    <option value="Kind van 5 (extreem eenvoudig)">{t('explainComplexityChild')}</option>
                                    <option value="5-Year-Old (extremely simple)">{t('explainComplexityChildEn')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('explainFocusArea')}</label>
                                <select value={explainOptions.focusArea} onChange={(e) => setExplainOptions(s => ({ ...s, focusArea: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    <option value="Hoofdbesluiten">{t('explainFocusDecisions')}</option>
                                    <option value="Complexe concepten">{t('explainFocusConcepts')}</option>
                                    <option value="Actiepunten">{t('explainFocusActions')}</option>
                                    <option value="Besproken problemen">{t('explainFocusProblems')}</option>
                                    <option value="Voorgestelde oplossingen">{t('explainFocusSolutions')}</option>
                                    <option value="Algemeen overzicht">{t('explainFocusOverview')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('explainFormat')}</label>
                                <select value={explainOptions.format} onChange={(e) => setExplainOptions(s => ({ ...s, format: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    <option value="Korte paragraaf">{t('explainFormatParagraph')}</option>
                                    <option value="Opsomming (bullet points)">{t('explainFormatBullets')}</option>
                                    <option value="Vraag & Antwoord stijl">{t('explainFormatQa')}</option>
                                    <option value="Stap-voor-stap handleiding">{t('explainFormatStepByStep')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-2">
                            <button onClick={() => handleGenerateExplain(explainOptions)} disabled={!transcript.trim()} className="px-3 py-2 rounded bg-cyan-600 text-white text-sm hover:bg-cyan-700 disabled:opacity-50">{t('explainGenerate')}</button>
                        </div>
                    </div>

                    {/* Output */}
                    {loadingText && !explainData?.explanation ? (
                        <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300 min-h-[200px]"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>
                    ) : explainData?.explanation ? (
                        <div className="relative">
                            <div className="absolute top-0 right-0 flex gap-2">
                                <button onClick={() => copyToClipboard(explainData.explanation)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
                                    <CopyIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => downloadTextFile(explainData.explanation, 'explain.txt')} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download">⬇️</button>
                                <button onClick={() => {
                                    const { subject, body } = generateEmailContent(t('explain'), explainData.explanation);
                                    copyToClipboardForEmail(subject, body);
                                }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email">✉️</button>
                            </div>
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                {renderMarkdown(explainData.explanation)}
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 dark:text-slate-400">{t('noContent')}</div>
                    )}
                </div>
            );
        }

        const content = analysisContent[activeView];
        return (
            <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[70vh] transition-colors">
                <div className="absolute top-4 right-4">
                    <div 
                        ref={actionButtonsRef}
                        className="relative"
                        onMouseEnter={() => setShowActionButtons(true)}
                        onMouseLeave={() => setShowActionButtons(false)}
                    >
                        <button 
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors cursor-pointer"
                            aria-label={t('actions')}
                            onClick={() => setShowActionButtons(!showActionButtons)}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="5" r="2"/>
                                <circle cx="12" cy="12" r="2"/>
                                <circle cx="12" cy="19" r="2"/>
                            </svg>
                        </button>
                        {showActionButtons && (
                            <div 
                                className="absolute top-0 right-10 flex gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 -mr-2"
                                onMouseEnter={() => setShowActionButtons(true)}
                                onMouseLeave={() => setShowActionButtons(false)}
                            >
                                {activeView !== 'transcript' && (
                                    <button onClick={() => {
                                        // Regenerate content based on activeView
                                        if (['summary', 'faq', 'learning', 'followUp'].includes(activeView)) {
                                            handleGenerateAnalysis(activeView);
                                        } else if (activeView === 'exec') {
                                            handleGenerateExecutiveSummary();
                                        } else if (activeView === 'keyword') {
                                            handleGenerateKeywordAnalysis();
                                        } else if (activeView === 'sentiment') {
                                            handleAnalyzeSentiment();
                                        } else if (activeView === 'blog') {
                                            handleGenerateBlog();
                                        } else if (activeView === 'businessCase') {
                                            handleGenerateBusinessCase();
                                        } else if (activeView === 'quiz') {
                                            handleGenerateQuiz();
                                        } else if (activeView === 'mindmap') {
                                            handleGenerateMindmap();
                                        } else if (activeView === 'storytelling') {
                                            handleGenerateStorytelling();
                                        }
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('regenerate', 'Regenerate')}>
                                        🔄
                                    </button>
                                )}
                                <button onClick={async () => {
                                    await copyToClipboard(content);
                                    displayToast(t('contentCopied', 'Content copied to clipboard!'));
                                }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
                                    <CopyIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => downloadTextFile(content, `${activeView}.txt`)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download">
                                    ⬇️
                                </button>
                                <button onClick={() => {
                                    const allActions = [...primaryActions, ...analysisActions];
                                    const found = allActions.find(a => a.id === activeView);
                                    const fnName = found ? found.label() : activeView;
                                    const { subject, body } = generateEmailContent(fnName, content || '');
                                    copyToClipboardForEmail(subject, body);
                                }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email">
                                    ✉️
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="overflow-y-auto max-h-[calc(70vh-120px)]">
                    {activeView === 'transcript' && emailAddresses && emailAddresses.length > 0 && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">📧 Gevonden e-mailadressen:</h3>
                            <div className="flex flex-wrap gap-2">
                                {emailAddresses.map((email, index) => (
                                    <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                                        {email}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeView === 'transcript' && audioTokenUsage && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <h3 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-3">🔢 Token Usage for Audio Transcription:</h3>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="text-center">
                                    <div className="font-medium text-green-700 dark:text-green-300">Input Tokens</div>
                                    <div className="text-lg font-bold text-green-800 dark:text-green-200">{audioTokenUsage.inputTokens.toLocaleString()}</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-medium text-green-700 dark:text-green-300">Output Tokens</div>
                                    <div className="text-lg font-bold text-green-800 dark:text-green-200">{audioTokenUsage.outputTokens.toLocaleString()}</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-medium text-green-700 dark:text-green-300">Total Tokens</div>
                                    <div className="text-lg font-bold text-green-800 dark:text-green-200">{audioTokenUsage.totalTokens.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    )}
                    <pre className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">
                        {renderMarkdown(content || t('noContent'))}
                    </pre>
                </div>
            </div>
        );
    };
    return (
        <div className={`w-full max-w-6xl mx-auto bg-transparent rounded-lg transition-all duration-300 ${isAnonymized ? 'ring-2 ring-green-400/80 shadow-lg shadow-green-500/10' : ''}`}>
             <RecapHorizonPanel
                 t={t}
                 transcript={transcript}
                 summary={summary}
                 keywordAnalysis={keywordAnalysis}
                 sentiment={sentimentAnalysisResult}
                 faq={faq}
                 learnings={learningDoc}
                 followup={followUpQuestions}
                 chatHistory={chatHistory}
                 mindmapText={mindmapMermaid}
                 executiveSummaryData={executiveSummaryData}
                 storytellingData={storytellingData}
                 businessCaseData={businessCaseData}
                 blogData={blogData}
                 explainData={explainData}
                 quizQuestions={quizQuestions}
                 quizIncludeAnswers={quizIncludeAnswers}
                 startStamp={startStamp}
                 outputLanguage={outputLang}
                 onNotify={(msg, type) => displayToast(msg, type)}
                 onGenerateQuiz={async ({ numQuestions, numOptions }) => {
                    // Check transcript length based on user tier
                    const effectiveTier = userSubscription;
                    const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
                    if (!transcriptValidation.allowed) {
                      throw new Error(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.');
                    }
                    
                    // Validate token usage for quiz generation
                    const sys = `You generate MCQs based on a transcript. Return ONLY a JSON array of objects with keys: question (string), options (array of {label, text}), correct_answer_label, correct_answer_text. Generate between 1 and 5 questions as requested. Ensure exactly one correct answer per question. Labels should be A, B, C, D but only up to the requested number of options.`;
                    const quizPrompt = `${sys}\n\nConstraints: number_of_questions=${numQuestions}, number_of_options=${numOptions}.\nTranscript:\n${getTranscriptSlice(transcript, 18000)}`;
                    const tokenEstimate = tokenManager.estimateTokens(quizPrompt, 1.5);
                    const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, tokenEstimate.totalTokens);
                    
                    if (!tokenValidation.allowed) {
                        throw new Error(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
                    }
                    
                    const ai = new GoogleGenAI({ apiKey: apiKey });
                    const modelName = await modelManager.getModelForFunction('generalAnalysis');
                    const prompt = `${sys}\n\nConstraints: number_of_questions=${numQuestions}, number_of_options=${numOptions}.\nTranscript:\n${getTranscriptSlice(transcript, 18000)}`;
                    const res = await ai.models.generateContent({ model: modelName, contents: prompt });
                    
                    // Track token usage with TokenManager
                    const promptTokens = tokenCounter.countPromptTokens(prompt);
                    const responseTokens = tokenCounter.countResponseTokens(res.text);
                    
                    try {
                        await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
                    } catch (error) {
                        console.error('Error recording token usage:', error);
                    }
                    
                    let text = res.text || '';
                    text = text.replace(/```[a-z]*|```/gi, '').trim();
                    const arr = JSON.parse(text);
                    return arr;
                 }}
             />
             <div className="flex flex-wrap items-center p-2 bg-gray-100/50 dark:bg-slate-800/50 rounded-t-lg border-b border-gray-300 dark:border-slate-700 gap-1">
                {primaryActions.map(action => (
                    <button
                        key={action.id}
                        onClick={() => action.type === 'view' ? handleTabClick(action.id as ViewType) : action.onClick()}
                        disabled={action.disabled ? action.disabled() : isProcessing}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all ${
                            activeView === action.id && action.type === 'view'
                                ? 'bg-cyan-500/20 text-cyan-500 dark:text-cyan-400'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-gray-200/50 dark:hover:bg-slate-700/50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <action.icon className="w-5 h-5" />
                        {action.label()}
                    </button>
                ))}
            </div>
             <div className="flex flex-wrap items-center p-2 bg-gray-100/50 dark:bg-slate-800/50 rounded-t-lg border-b border-gray-300 dark:border-slate-700 gap-1">
                {analysisActions.map(action => (
                        <button
                            key={action.id}
                            onClick={() => action.type === 'view' ? handleTabClick(action.id as ViewType) : action.onClick()}
                            disabled={action.disabled ? action.disabled() : isProcessing}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all ${
                                activeView === action.id && action.type === 'view'
                                    ? 'bg-cyan-500/20 text-cyan-500 dark:text-cyan-400'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-gray-200/50 dark:hover:bg-slate-700/50'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <action.icon className="w-5 h-5" />
                            {action.label()}
                        </button>

                ))}
            </div>
            {renderContent()}
        </div>
    );
  };
  const renderChatView = () => (
    <div className="flex flex-col h-[50vh] bg-white dark:bg-slate-800 rounded-b-lg transition-colors">
        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 pl-2">{t('chatWithTranscript')}</h3>
            {userSubscription === SubscriptionTier.DIAMOND && (
                <button 
                    onClick={() => setIsTTSEnabled(!isTTSEnabled)} 
                    disabled={!apiKey}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md ${isTTSEnabled ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/20' : (!apiKey) ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                >
                    {isTTSEnabled ? <SpeakerIcon className="w-5 h-5" /> : <SpeakerOffIcon className="w-5 h-5" />}
                    <span>{t('readAnswers')}</span>
                </button>
            )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, index) => (
                <div key={`chat-${index}-${msg.role}-${msg.text.substring(0, 20)}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xl px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                        <div className="text-base font-sans">{renderMarkdown(msg.text || '...')}</div>
                    </div>
                </div>
            ))}
             {isChatting && chatHistory[chatHistory.length - 1]?.role === 'model' && ( <div className="flex justify-start"><div className="max-w-xl px-4 py-2 rounded-2xl bg-gray-200 dark:bg-slate-700"><LoadingSpinner className="w-5 h-5"/></div></div> )}
            <div ref={chatMessagesEndRef} />
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-lg">
            {/* Voice Input Preview */}
            {isListening && voiceInputPreview && (
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <MicIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('listening')}</span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200 text-sm italic">"{voiceInputPreview}"</p>
                </div>
            )}
            
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 rounded-xl p-2">
                <textarea 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} 
                    placeholder={isListening ? t('speaking') : t('askAQuestion')} 
                    rows={1} 
                    className="flex-1 bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 resize-none focus:outline-none px-2" 
                    disabled={isChatting}
                />
                {userSubscription === SubscriptionTier.DIAMOND && (
                    <button 
                        onClick={toggleListening} 
                        disabled={!apiKey}
                        className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : (!apiKey) ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                        title={(!apiKey) ? t('setupApiKey') : (isListening ? t('stopListening') : t('startListening'))}
                    > 
                        <MicIcon className="w-5 h-5"/> 
                    </button>
                )}
                <button 
                    onClick={handleSendMessage} 
                    disabled={isChatting || (!chatInput.trim() && !voiceInputPreview.trim()) || (!apiKey)} 
                    className="p-3 bg-cyan-500 rounded-lg text-white disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors"
                > 
                    <SendIcon className="w-5 h-5"/> 
                </button>
            </div>
        </div>
    </div>
  );
  
  return (
    <>
    <div className="min-h-screen text-slate-800 dark:text-white font-sans flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {isProcessing && (
        <LoadingOverlay
          text={loadingText || t('processing')}
          progress={isSegmentedTranscribing ? (transcriptionProgress ?? 0) : undefined}
          cancelText={t('cancel', 'Annuleren')}
          onCancel={isSegmentedTranscribing ? handleCancelTranscription : undefined}
        />
      )}
      {selectedKeyword && (
        <KeywordExplanationModal
            keyword={selectedKeyword}
            explanation={keywordExplanation}
            isLoading={isFetchingExplanation}
            onClose={() => setSelectedKeyword(null)}
            t={t}
        />
      )}
      

      
      <PowerPointOptionsModal
          isOpen={showPptOptions}
          onClose={() => setShowPptOptions(false)}
          onGenerate={handleGeneratePresentationWithOptions}
          t={t}
          currentTemplate={pptTemplate}
          onTemplateChange={setPptTemplate}
          uiLang={uiLang}
      />

      

      {/* Cookie Consent */}
      {showCookieConsent && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">{t('cookiePolicyTitle')}</h3>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 mb-6">
              <p>{t('cookiePolicyDescription')}</p>
              <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded">
                <p className="font-medium">{t('cookiePolicyWhatWeStore')}</p>
                <ul className="text-xs text-slate-600 dark:text-cyan-400 mt-1 space-y-1">
                  <li>{t('cookiePolicyLanguagePreference')}</li>
                  <li>{t('cookiePolicyThemePreference')}</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowCookieConsent(false)}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                {t('cookiePolicyDecline')}
              </button>
              <button 
                onClick={handleAcceptCookies}
                className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                {t('cookiePolicyAccept')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <header className="fixed top-2 sm:top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-16px)] sm:w-auto">
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-md shadow-md mx-auto max-w-[94vw] sm:max-w-none">
          {/* Logo & brand */}
          {!showInfoPage && (
            <button onClick={() => setShowInfoPage(true)} className="flex items-center gap-2 min-w-0 hover:opacity-90">
              <img src="/logo.png" alt="RecapHorizon Logo" className="w-8 h-8 rounded-lg" />
            </button>
          )}
          
          <LanguageSelector
            value={uiLang}
            onChange={(val) => setUiLang(val as any)}
            placeholder={t('language')}
            appLanguage={uiLang}
            className=""
            allowedUiCodes={["nl","en","de","fr","es","pt"]}
            hideSearch
            flagsOnly
            variant="header"
          />
          <button onClick={toggleTheme} title={theme === 'light' ? t('switchToDark') : t('switchToLight')} className="flex items-center justify-center h-9 w-9 bg-gray-200 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-opacity-80">
            {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
          </button>
          
          {/* Token Usage Meter for logged in users */}
          {authState.user && (
            <TokenUsageMeter userTier={userSubscription} t={t} onShowPricing={() => setShowPricingPage(true)} />
          )}
          
          {/* Conditional Buttons based on state */}
          {authState.user ? (
            <>
              {/* Info Page - Logged in */}
              {showInfoPage && (
                <>
                  {/* If user has transcript, show "New session" and "Analyse" */}
                  {status !== RecordingStatus.IDLE && status !== RecordingStatus.ERROR ? (
                    <>
                      <button 
                        onClick={() => {
                          setTranscript('');
                          setSummary('');
                          setFaq('');
                          setLearningDoc('');
                          setFollowUpQuestions('');
                          setBlogData('');
                          setChatHistory([]);
                          setKeywordAnalysis(null);
                          setSentimentAnalysisResult(null);
                          setMindmapMermaid('');
                          setMindmapSvg('');
                          setExecutiveSummaryData(null);
                          setStorytellingData(null);
                          setBusinessCaseData(null);
                          setQuizQuestions(null);
                          setActiveView('transcript');
                          setStatus(RecordingStatus.IDLE);
                          setError(null);
                          setAnonymizationReport(null);
                          setPresentationReport(null);
                          setPptTemplate(null);
                          setLoadingText('');
                          setIsAnonymized(false);
                          chatInstanceRef.current = null;
                        }} 
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[120px]"
                      >
                        <ResetIcon className="w-5 h-5"/> 
                        <span>{t('startNewSession')}</span>
                      </button>
                      <button 
                        onClick={() => setShowInfoPage(false)} 
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[100px]"
                      >
                        <span>📊</span>
                        <span>{t('analyse')}</span>
                      </button>
                    </>
                  ) : (
                    /* If user has no transcript, show "Start session" */
                    <button 
                      onClick={() => setShowInfoPage(false)} 
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[120px]"
                    >
                      <span>🎯</span>
                      <span>{t('startOrUpload')}</span>
                    </button>
                  )}
                  

                  
                  {/* Settings button - always visible when logged in */}
                  <button onClick={() => {
                    if (userSubscription && userSubscription !== 'free') {
                      setActiveSettingsTab('subscription');
                    } else {
                      setActiveSettingsTab('general');
                    }
                    settingsModal.open();
                  }} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[100px]">
                    <SettingsIcon className="w-5 h-5"/> 
                    <span>{t('settings')}</span>
                  </button>
                </>
              )}
              
              {/* Start Page - Logged in */}
              {!showInfoPage && status === RecordingStatus.IDLE && (
                <>
                  {/* If user has transcript, show "Analyse" button */}
                  {transcript && (
                    <button 
                      onClick={() => setStatus(RecordingStatus.FINISHED)} 
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[100px]"
                    >
                      <span>📊</span>
                      <span>{t('analyse')}</span>
                    </button>
                  )}
                  

                  
                  {/* Settings button */}
                  <button onClick={() => {
                    if (userSubscription && userSubscription !== 'free') {
                      setActiveSettingsTab('subscription');
                    } else {
                      setActiveSettingsTab('general');
                    }
                    settingsModal.open();
                  }} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[100px]">
                    <SettingsIcon className="w-5 h-5"/> 
                    <span>{t('settings')}</span>
                  </button>
                </>
              )}
              {/* Analyse Page - Logged in */}
              {!showInfoPage && status === RecordingStatus.FINISHED && (
                <>
                  {/* Start new session button */}
                  <button 
                    onClick={() => {
                      setTranscript('');
                      setSummary('');
                      setFaq('');
                      setLearningDoc('');
                      setFollowUpQuestions('');
                      setBlogData('');
                      setChatHistory([]);
                      setKeywordAnalysis(null);
                      setSentimentAnalysisResult(null);
                      setMindmapMermaid('');
                      setMindmapSvg('');
                      setExecutiveSummaryData(null);
                      setStorytellingData(null);
                      setBusinessCaseData(null);
                      setQuizQuestions(null);
                      setActiveView('transcript');
                      setStatus(RecordingStatus.IDLE);
                      setError(null);
                      setAnonymizationReport(null);
                      setPresentationReport(null);
                      setPptTemplate(null);
                      setLoadingText('');
                      setIsAnonymized(false);
                      chatInstanceRef.current = null;
                    }} 
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[120px]"
                  >
                    <ResetIcon className="w-5 h-5"/> 
                    <span>{t('startNewSession')}</span>
                  </button>
                  
                  {/* Settings button */}
                  <button onClick={() => {
                    if (userSubscription && userSubscription !== 'free') {
                      setActiveSettingsTab('subscription');
                    } else {
                      setActiveSettingsTab('general');
                    }
                    settingsModal.open();
                  }} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[100px]">
                    <SettingsIcon className="w-5 h-5"/> 
                    <span>{t('settings')}</span>
                  </button>
                </>
              )}
            </>
          ) : (
            /* Not logged in - only show login button */
            <button 
              onClick={() => {
                const el = document.getElementById('login-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }} 
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[100px]"
            >
              <span>🔐</span>
              <span>{t('login')}</span>
            </button>
          )}
          
          {/* Logout button for logged in  */}
          {authState.user && (
            <button 
              onClick={handleLogout} 
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[100px]"
            >
              <span>🚪</span>
              <span>{t('logout')}</span>
            </button>
          )}
        </div>
      </header>
      
      <CookieModal isOpen={cookieModal.isOpen} onClose={cookieModal.close} t={t} />

      <DisclaimerModal isOpen={disclaimerModal.isOpen} onClose={disclaimerModal.close} t={t} />

      <WaitlistModal isOpen={waitlistModal.isOpen} onClose={waitlistModal.close} t={t} waitlistEmail={waitlistEmail} setWaitlistEmail={setWaitlistEmail} addToWaitlist={addToWaitlist} />


      {/* Settings Modal */}
      {systemAudioHelp.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-3xl w-full m-4 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('enableSystemAudio')}</h3>
              <button onClick={systemAudioHelp.close} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                {t('systemAudioInstructions')}
              </p>
              <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src="/uitleg.png" alt="Uitleg systeem audio aanzetten" className="w-full h-auto" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                {/* Link verwijderd */}
                <button onClick={systemAudioHelp.close} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold">
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supported formats modal */}
      {formatsInfo.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-xl w-full m-4 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('supportedFormatsTitle')}</h3>
              <button onClick={formatsInfo.close} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <p>{t('supportedFormatsIntro')}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>TXT — {t('formatTxt')}</li>
                <li>PDF — {t('formatPdf')}</li>
                <li>RTF — {t('formatRtf')}</li>
                <li>HTML — {t('formatHtml')}</li>
                <li>Markdown (MD) — {t('formatMd')}</li>
                <li>DOCX — {t('formatDocx')}</li>
              </ul>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('supportedFormatsNote')}</p>
              <div className="pt-2 flex justify-end">
                <button onClick={formatsInfo.close} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold">{t('close')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paste transcript modal */}
      {pasteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('pasteTranscriptTitle')}</h3>
              <button onClick={pasteModal.close} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-700 dark:text-slate-300">{t('pasteTranscriptDescription')}</p>
              <textarea
                placeholder={t('pasteTranscriptPlaceholder')}
                className="w-full h-64 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                onChange={(e) => setPastedText(e.target.value)}
                value={pastedText}
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={pasteModal.close} 
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={() => handlePasteTranscript(pastedText)} 
                  disabled={!pastedText.trim()}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg font-semibold disabled:cursor-not-allowed"
                >
                  {t('processTranscript')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Web page modal */}
      {showWebPageModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('webPageTitle')}</h3>
                <div className="relative ml-2 group">
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <QuestionMarkIcon className="w-5 h-5" />
                  </button>
                  <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 z-10 hidden group-hover:block">
                    <p className="text-sm text-slate-700 dark:text-slate-200">{t('webPageHelpText', 'Enter a URL or drag and drop a link to analyze content from a web page.')}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => { setShowWebPageModal(false); setWebPageError(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-4">
                {/* WebExpert Option (Gold, Diamond and Enterprise tiers) */}
                {(userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.DIAMOND || userSubscription === SubscriptionTier.ENTERPRISE) && (
                  <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <input
                      type="checkbox"
                      id="useDeepseek"
                      checked={useDeepseek}
                      onChange={(e) => setUseDeepseek(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="useDeepseek" className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center">
                      <span className="mr-2">{t('useWebExpertOption', 'Use WebExpert Option')}</span>
                      <span className="px-2 py-0.5 text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full">
                        {t('goldDiamondEnterpriseOnly', 'Gold, Diamond & Enterprise')}
                      </span>
                    </label>
                  </div>
                )}

                {!useDeepseek ? (
                  <>
                    {/* Single URL Input */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('webPageUrlLabel', 'Web Page URL')}</label>
                      <input
                        type="url"
                        placeholder={t('webPageUrlPlaceholder')}
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        onChange={(e) => setWebPageUrl(e.target.value)}
                        value={webPageUrl}
                      />
                    </div>
                    
                    {/* Drag and Drop Area */}
                    <div 
                      className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center transition-colors duration-200 ease-in-out bg-slate-50 dark:bg-slate-900/50 hover:border-cyan-400 dark:hover:border-cyan-500"
                      style={{
                        backgroundColor: isDragging ? 'rgba(14, 165, 233, 0.1)' : '',
                        borderColor: isDragging ? 'rgb(14, 165, 233)' : ''
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        
                        // Try to get URL from text
                        const text = e.dataTransfer.getData('text');
                        if (text) {
                          // Check if it's a URL
                          try {
                            const url = new URL(text);
                            setWebPageUrl(url.toString());
                            return;
                          } catch (e) {
                            // Not a URL, continue checking other formats
                          }
                        }
                        
                        // Try to get URL from HTML
                        const html = e.dataTransfer.getData('text/html');
                        if (html) {
                          const parser = new DOMParser();
                          const doc = parser.parseFromString(html, 'text/html');
                          const links = doc.querySelectorAll('a');
                          if (links.length > 0) {
                            setWebPageUrl(links[0].href);
                            return;
                          }
                        }
                      }}>
                      <div className="text-slate-500 dark:text-slate-400">
                        <div className="font-medium mb-1">{t('webPageDragDropText', 'Drag and drop a URL here')}</div>
                        <p className="text-sm text-slate-400 dark:text-slate-500">{t('webPageDragDropHint', 'You can drag links from other tabs or applications')}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Multiple URL Inputs for Deepseek */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t('webExpertUrlsLabel', 'Web Page URLs for WebExpert Analysis')}
                      </label>
                      
                      {webPageUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative group"
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('border-cyan-400', 'bg-cyan-50', 'dark:bg-cyan-900/20', 'shadow-lg');
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-cyan-400', 'bg-cyan-50', 'dark:bg-cyan-900/20', 'shadow-lg');
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-cyan-400', 'bg-cyan-50', 'dark:bg-cyan-900/20', 'shadow-lg');
                            
                            const droppedText = e.dataTransfer.getData('text/plain');
                            if (droppedText && (droppedText.startsWith('http://') || droppedText.startsWith('https://'))) {
                              const newUrls = [...webPageUrls];
                              newUrls[index] = droppedText;
                              setWebPageUrls(newUrls);
                            }
                          }}
                        >
                          <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-1 transition-all duration-200 hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <input
                              type="url"
                              placeholder={`${t('webPageUrlPlaceholder')} ${index + 1}`}
                              className="w-full p-3 border-0 rounded-md bg-transparent text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
                              onChange={(e) => {
                                const newUrls = [...webPageUrls];
                                newUrls[index] = e.target.value;
                                setWebPageUrls(newUrls);
                              }}
                              value={url}
                            />
                            {!url && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                  </svg>
                                  <span className="text-xs">
                                    {t('webPageDragDropText', 'Drag URL here or type')}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        {t('webExpertUrlsNote', 'WebExpert allows analyzing multiple URLs simultaneously for comprehensive insights.')}
                      </p>
                    </div>
                  </>
                )}

                {webPageError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{webPageError}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => { 
                    setShowWebPageModal(false); 
                    setWebPageError(null); 
                    setUseDeepseek(false);
                    setWebPageUrls(['', '', '']);
                  }} 
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={() => {
                    if (useDeepseek) {
                      // Filter out empty URLs
                      const validUrls = webPageUrls.filter(url => url.trim() !== '');
                      if (validUrls.length > 0) {
                        handleWebPage(validUrls[0], true, validUrls);
                      } else {
                        setWebPageError(t('noValidUrlsError', 'Please enter at least one valid URL'));
                      }
                    } else {
                      handleWebPage(webPageUrl);
                    }
                  }} 
                  disabled={(useDeepseek ? webPageUrls.every(url => !url.trim()) : !webPageUrl.trim()) || isLoadingWebPage}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg font-semibold disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoadingWebPage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('loading')}
                    </>
                  ) : (
                    useDeepseek ? (t('analyzeWithWebExpert', 'Analyze with WebExpert')) : t('processWebPage')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1 Help Modal */}
      {step1Help.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">💡 {t('step1')} - {t('sessionLang')}</h3>
              <button 
                onClick={step1Help.close}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <p className="text-lg leading-relaxed">
                {t('helpLanguageSelection')}
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={step1Help.close} 
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
              >
{t('buttonClose')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Help Modal */}
      {step2Help.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">💡 {t('step2')} - {t('outputLanguage')}</h3>
              <button 
                onClick={step2Help.close}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <p className="text-lg leading-relaxed">
                {t('helpLanguageSelection')}
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={step2Help.close} 
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
              >
{t('buttonClose')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Web page help modal */}
      {showWebPageHelp && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-xl w-full m-4 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('webPageHelpTitle')}</h3>
              <button onClick={() => setShowWebPageHelp(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <p>{t('webPageHelpDescription')}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('webPageHelpStep1')}</li>
                <li>{t('webPageHelpStep2')}</li>
                <li>{t('webPageHelpStep3')}</li>
                <li>{t('webPageHelpStep4')}</li>
              </ul>
              <div className="pt-2 flex justify-end">
                <button onClick={() => setShowWebPageHelp(false)} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold">{t('close')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Paste help modal */}
      {pasteHelp.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-xl w-full m-4 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('pasteHelpTitle')}</h3>
              <button onClick={pasteHelp.close} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <p>{t('pasteHelpDescription')}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('pasteHelpStep1')}</li>
                <li>{t('pasteHelpStep2')}</li>
                <li>{t('pasteHelpStep3')}</li>
              </ul>
              <div className="pt-2 flex justify-end">
                <button onClick={pasteHelp.close} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold">{t('close')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Modal */}
      {comingSoonModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full m-4 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('comingSoonTitle')}</h3>
              <button onClick={comingSoonModal.close} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <p>{t('comingSoonDescription')}</p>
              <div className="pt-2 flex justify-end">
                <button onClick={comingSoonModal.close} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold">{t('close')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {(() => {
        const locale = outputLang ? getBcp47Code(outputLang) : 'nl-NL';
        return settingsModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101] p-2 sm:p-4">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-4xl w-full max-w-[95vw] sm:max-w-4xl p-4 sm:p-6 max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-cyan-500 dark:text-cyan-400">{t('settingsTitle')}</h3>
              <button 
                onClick={() => settingsModal.close()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex flex-wrap border-b border-gray-200 dark:border-slate-600 mb-4 sm:mb-6 -mx-1">
              <button
                onClick={() => setActiveSettingsTab('general')}
                className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors mx-1 ${
                  activeSettingsTab === 'general'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {t('settingsTabGeneral')}
              </button>
              <button
                onClick={() => setActiveSettingsTab('subscription')}
                className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors mx-1 ${
                  activeSettingsTab === 'subscription'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {t('settingsTabSubscription')}
              </button>
              <button
                onClick={() => setActiveSettingsTab('transcription')}
                className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors mx-1 ${
                  activeSettingsTab === 'transcription'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {t('settingsTabTranscription')}
              </button>
              <button
                onClick={() => setActiveSettingsTab('anonymization')}
                className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors mx-1 ${
                  activeSettingsTab === 'anonymization'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {t('settingsTabAnonymization')}
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Algemeen Tab */}
              {activeSettingsTab === 'general' && (
                <>
                  {/* PWA Installatie Sectie */}
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('settingsPwaInstallation')}</h4>
                <div className="p-3 sm:p-4 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                      <p className="text-sm text-cyan-900 dark:text-cyan-200 mb-1">
                        {pwaInstalled ? t('pwaAlreadyInstalled') : t('pwaInstallBannerText')}
                      </p>
                      <p className="text-xs text-cyan-700 dark:text-cyan-300">
                        {t('settingsPwaInstallationDesc')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!pwaInstalled && pwaPromptEvent ? (
                        <>
                          <button onClick={handlePwaIgnore} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">
                            {t('pwaIgnore')}
                          </button>
                          <button onClick={handlePwaInstall} className="px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white transition-colors text-sm">
                            {t('pwaInstall')}
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {pwaInstalled ? t('pwaInstalledStatus') : t('pwaNotAvailable')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
                </>  
              )}

              {/* Subscription Tab */}
              {activeSettingsTab === 'subscription' && (
                <>
                  {/* Current Subscription Info */}
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('subscriptionCurrentPlan')}</h4>
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border border-cyan-200 dark:border-cyan-800 rounded-lg">
                      <div className="space-y-4">
                        {/* Plan Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div>
                            <p className="text-lg font-semibold text-cyan-900 dark:text-cyan-200 mb-1">
                              {t(`tier${userSubscription.charAt(0).toUpperCase() + userSubscription.slice(1)}`)}
                            </p>
                            <p className="text-sm text-cyan-700 dark:text-cyan-300">
                              {userSubscription === 'free' ? t('subscriptionFreeTier') : t('subscriptionPaidTier')}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              authState.user?.currentSubscriptionStatus === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : authState.user?.currentSubscriptionStatus === 'past_due'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {authState.user?.currentSubscriptionStatus || 'active'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Subscription Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-cyan-200 dark:border-cyan-700">
                          {/* Account Email */}
                          <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                              {t('subscriptionEmail')}
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {authState.user?.email}
                            </p>
                          </div>
                          
                          {/* Start Date */}
                          {authState.user?.currentSubscriptionStartDate && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                {t('subscriptionStartDate')}
                              </p>
                              <p className="text-sm text-slate-700 dark:text-slate-300">
                                {new Date(authState.user.currentSubscriptionStartDate.seconds * 1000).toLocaleDateString(locale, { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          )}
                          
                          {/* Next Billing Date */}
                          {userSubscription !== 'free' && authState.user?.nextBillingDate && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                {t('subscriptionNextBilling')}
                              </p>
                              <p className="text-sm text-slate-700 dark:text-slate-300">
                                {new Date(authState.user.nextBillingDate.seconds * 1000).toLocaleDateString(locale, { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          )}
                          
                          {/* Trial End Date for Free Users */}
                          {userSubscription === 'free' && authState.user?.createdAt && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                {t('subscriptionTrialEnds')}
                              </p>
                              <p className="text-sm text-slate-700 dark:text-slate-300">
                                {new Date(authState.user.createdAt.seconds * 1000 + (28 * 24 * 60 * 60 * 1000)).toLocaleDateString(locale, { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          )}
                          
                          {/* Stripe Customer ID (for debugging/support) */}
                          {authState.user?.stripeCustomerId && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                Customer ID
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                                {authState.user.stripeCustomerId}
                              </p>
                            </div>
                          )}
                          
                          {/* Account Created */}
                          {authState.user?.createdAt && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                                {t('subscriptionAccountCreated')}
                              </p>
                              <p className="text-sm text-slate-700 dark:text-slate-300">
                                {new Date(authState.user.createdAt.seconds * 1000).toLocaleDateString(locale, { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Scheduled Changes */}
                        {authState.user?.scheduledTierChange && (
                          <div className="pt-4 border-t border-cyan-200 dark:border-cyan-700">
                            <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                                {t('subscriptionScheduledChange')}
                              </p>
                              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                {t(`subscriptionScheduled${authState.user.scheduledTierChange.action.charAt(0).toUpperCase() + authState.user.scheduledTierChange.action.slice(1)}`)}: {authState.user.scheduledTierChange.tier} op {new Date(authState.user.scheduledTierChange.effectiveDate).toLocaleDateString(locale)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subscription Actions */}
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('subscriptionManagement')}</h4>
                    <div className="space-y-3">
                      {/* View Pricing */}
                      <button
                        onClick={() => {
                          settingsModal.close();
                          setShowPricingPage(true);
                        }}
                        className="w-full p-3 sm:p-4 text-left bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{t('subscriptionViewPricing')}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{t('subscriptionViewPricingDesc')}</p>
                          </div>
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>

                      {/* Upgrade/Downgrade */}
                      {userSubscription !== 'diamond' && (
                        <button
                          onClick={() => {
                            settingsModal.close();
                            upgradeModal.open();
                          }}
                          className="w-full p-3 sm:p-4 text-left bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-slate-800 dark:text-slate-200">
                                {userSubscription === 'free' ? t('subscriptionUpgrade') : t('subscriptionChangeplan')}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {userSubscription === 'free' ? t('subscriptionUpgradeDesc') : t('subscriptionChangeplanDesc')}
                              </p>
                            </div>
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      )}

                      {/* Manage Billing (Customer Portal) */}
                      {userSubscription !== 'free' && authState.user?.stripeCustomerId && (
                        <button
                          onClick={() => {
                            settingsModal.close();
                            customerPortalModal.open();
                          }}
                          className="w-full p-3 sm:p-4 text-left bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-slate-800 dark:text-slate-200">{t('subscriptionManageBilling')}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{t('subscriptionManageBillingDesc')}</p>
                            </div>
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </button>
                      )}

                      {/* Cancel Subscription */}
                      {userSubscription !== 'free' && (
                        <button
                          onClick={() => {
                            if (userSubscription === 'diamond') {
                              // Voor Diamond gebruikers: direct naar Customer Portal
                              settingsModal.close();
                              customerPortalModal.open();
                            } else {
                              // Voor andere gebruikers: bevestiging en dan Customer Portal
                              if (confirm(t('subscriptionCancelConfirm'))) {
                                settingsModal.close();
                                customerPortalModal.open();
                              }
                            }
                          }}
                          className="w-full p-3 sm:p-4 text-left bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-red-800 dark:text-red-300">
                                {userSubscription === 'diamond' ? t('subscriptionStopRecapHorizon') : t('subscriptionCancel')}
                              </p>
                              <p className="text-sm text-red-600 dark:text-red-400">
                                {userSubscription === 'diamond' ? t('subscriptionStopRecapHorizonDesc') : t('subscriptionCancelDesc')}
                              </p>
                            </div>
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scheduled Changes */}
                  {authState.user?.scheduledTierChange && (
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('subscriptionScheduledChanges')}</h4>
                      <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div>
                            <p className="font-medium text-yellow-800 dark:text-yellow-300">
                              {authState.user.scheduledTierChange.action === 'cancel' 
                                ? t('subscriptionScheduledCancel') 
                                : t('subscriptionScheduledDowngrade', { tier: authState.user.scheduledTierChange.tier })}
                            </p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                              {t('subscriptionEffectiveDate')}: {new Date(authState.user.scheduledTierChange.effectiveDate.seconds * 1000).toLocaleDateString(locale, { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>  
              )}

              {/* Anonimisatie Tab */}
              {activeSettingsTab === 'anonymization' && (
                <>
              {/* Anonimisatie Regels Sectie */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('settingsAnonymizationRules')}</h4>
                  <button 
                    onClick={addAnonymizationRule}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm"
                  >
                    {t('settingsAddRule')}
                  </button>
                </div>
                
                <div className="space-y-3">
                  {anonymizationRules.map((rule, index) => (
                    <div key={rule.id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            {t('settingsOriginalText')}
                          </label>
                          <input
                            type="text"
                            value={rule.originalText}
                            onChange={(e) => updateAnonymizationRule(rule.id, 'originalText', e.target.value)}
                            placeholder={t('settingsOriginalTextPlaceholder')}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            {t('settingsReplacementText')}
                          </label>
                          <input
                            type="text"
                            value={rule.replacementText}
                            onChange={(e) => updateAnonymizationRule(rule.id, 'replacementText', e.target.value)}
                            placeholder={t('settingsReplacementTextPlaceholder')}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`exact-${rule.id}`}
                              checked={rule.isExact}
                              onChange={(e) => updateAnonymizationRule(rule.id, 'isExact', e.target.checked)}
                              className="w-4 h-4 text-cyan-500 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
                            />
                            <label htmlFor={`exact-${rule.id}`} className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              {t('settingsExactMatch')}
                            </label>
                          </div>
                          
                          <button
                            onClick={() => deleteAnonymizationRule(rule.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                            title={t('settingsDeleteRule')}
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {anonymizationRules.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <p>{t('settingsNoRules')}</p>
                      <p className="text-sm mt-1">{t('settingsAddRule')} {t('settingsAnonymizationAutoText')}.</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                  <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">{t('settingsAnonymizationTips')}</h5>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>{t('settingsTipExact')}</li>
                    <li>{t('settingsTipFuzzy')}</li>
                    <li>{t('settingsTipEmployeeNumbering')}</li>
                    <li>{t('settingsTipRuleOrder')}</li>
                    <li>{t('settingsTipSafe')}</li>
                  </ul>
                </div>
              </div>
                </>  
              )}
              
              {/* Transcriptie Tab */}
              {activeSettingsTab === 'transcription' && (
                <>
              {/* Transcriptie Instellingen Sectie */}
              <div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('settingsTranscriptionTitle')}</h4>
                
                <div className="space-y-6">
                  {/* Transcriptie Kwaliteit */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('settingsTranscriptionQuality')}
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('settingsTranscriptionQualityDesc')}</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer">
                        <input
                          type="radio"
                          name="transcriptionQuality"
                          value="high"
                          checked={transcriptionQuality === 'high'}
                          onChange={(e) => setTranscriptionQuality(e.target.value as 'high' | 'balanced' | 'fast')}
                          className="w-4 h-4 text-cyan-500 bg-gray-100 border-gray-300 focus:ring-cyan-500 focus:ring-2"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{t('settingsQualityHigh')}</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer">
                        <input
                          type="radio"
                          name="transcriptionQuality"
                          value="balanced"
                          checked={transcriptionQuality === 'balanced'}
                          onChange={(e) => setTranscriptionQuality(e.target.value as 'high' | 'balanced' | 'fast')}
                          className="w-4 h-4 text-cyan-500 bg-gray-100 border-gray-300 focus:ring-cyan-500 focus:ring-2"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{t('settingsQualityBalanced')}</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer">
                        <input
                          type="radio"
                          name="transcriptionQuality"
                          value="fast"
                          checked={transcriptionQuality === 'fast'}
                          onChange={(e) => setTranscriptionQuality(e.target.value as 'high' | 'balanced' | 'fast')}
                          className="w-4 h-4 text-cyan-500 bg-gray-100 border-gray-300 focus:ring-cyan-500 focus:ring-2"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{t('settingsQualityFast')}</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Audio Compressie */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('settingsAudioCompression')}
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('settingsAudioCompressionDesc')}</p>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={audioCompressionEnabled}
                        onChange={(e) => setAudioCompressionEnabled(e.target.checked)}
                        className="w-4 h-4 text-cyan-500 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('settingsCompressionEnabled')}</span>
                    </label>
                  </div>
                  
                  {/* Auto Stop Opname */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('settingsStopRecordingAfterCapture')}
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('settingsStopRecordingDesc')}</p>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoStopRecordingEnabled}
                        onChange={(e) => setAutoStopRecordingEnabled(e.target.checked)}
                        className="w-4 h-4 text-cyan-500 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500 focus:ring-2"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('settingsAutoStopEnabled')}</span>
                    </label>
                  </div>
                </div>
              </div>
                </>  
              )}
              
              {/* Actie Knoppen */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => settingsModal.close()}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                >
                  {t('settingsCancel')}
                </button>
                <button
                  onClick={saveAllSettings}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                >
                  {t('settingsSave')}
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {showCookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4 z-50 shadow-lg">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                <strong>🍪 {t('cookieTitle')}</strong> - {t('privacyLead')}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>• {t('cookiePoint1')}</span>
                <span>• {t('cookiePoint2')}</span>
                <span>• {t('cookiePoint3')}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleDeclineCookies}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                {t('decline')}
              </button>
              <button 
                onClick={handleAcceptCookies}
                className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                {t('accept')}
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="w-full max-w-7xl xl:max-w-[90vw] 2xl:max-w-[85vw] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 flex flex-col items-center gap-6 sm:gap-8 mt-20 sm:mt-12">
        {authState.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner className="w-8 h-8" text={t('loading')} />
          </div>
        ) : showInfoPage || !authState.user ? (
          <div className="text-center py-16 w-full max-w-7xl xl:max-w-[85vw] 2xl:max-w-[80vw] mx-auto">
            {/* Start new session knop bovenaan info pagina verwijderd */}
            {/* Hero Section */}
            <div className="mb-20">
              {/* Logo - kleiner en subtieler */}
              <div className="flex justify-center mb-6">
                <img src="/logo.png" alt="RecapHorizon Logo" className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shadow-lg" />
              </div>
              
              {/* Hoofdtitel - meer compact en elegant */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600">
                  RecapHorizon
                </span>
              </h1>
              
              {/* Subtitel - compactere spacing */}
              <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed px-1">
                {t('landingHeroSubtitle')}
              </p>
              
              {/* Login + Uitnodiging Section */}
              {!authState.user && (
              <div className="max-w-6xl xl:max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-12">
                                      {/* {t('loginLeftProminent')} */}
                  <div id="login-section" className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 xl:p-10 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">{t('login')}</h2>
                    <LoginForm 
                      handleLogin={handleLogin}
                      handleCreateAccount={handleCreateAccount}
                      handleForgotPassword={handlePasswordReset}
                      uiLang={uiLang}
                    />
                  </div>
                  {/* Toegang op uitnodiging (rechts, minder prominent) */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20 p-8 xl:p-10">
                    <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('waitlistTitle')}</h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{t('waitlistLead')}</p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        required
                      />
                      <button
                        onClick={() => addToWaitlist(waitlistEmail)}
                        disabled={!waitlistEmail.trim()}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-md font-medium hover:bg-cyan-700 disabled:bg-slate-400 transition-colors"
                      >
                        {t('waitlistSignUp')}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (!authState.user) {
                          waitlistModal.open();
                        }
                      }}
                      className="mt-3 text-cyan-700 dark:text-cyan-400 hover:underline text-sm"
                    >
                      {t('waitlistMoreInfo')}
                    </button>
                  </div>
                </div>
              </div>
              )}
              
            {/* CTA beknopt onder login */}
            <div className="text-center px-2 mt-6">
              <div className="mt-4 text-sm">
                {/* Team link verwijderd */}
              </div>
            </div>
            </div>

            {/* Hero visuals: clean, no big icons; modern image slides */}
            <div className="mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 xl:gap-8">
                <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                  <img src="/images/hero-1.jpg" alt="Opnemen van meeting op laptop" className="w-full h-44 object-cover" />
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('featureRecordingTitle')}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{t('featureRecordingDesc')}</p>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                  <img src="/images/hero-2.jpg" alt="AI analyse resultaten" className="w-full h-44 object-cover" />
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('featureAIAnalysisTitle')}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{t('featureAIAnalysisDesc')}</p>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                  <img src="/images/hero-3.jpg" alt="Export maken" className="w-full h-44 object-cover" />
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('useCaseExportTitle')}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{t('featurePresentationsDesc')}</p>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                  <img src="/images/usecase-kit.jpg" alt="AI-Assistent Toolkit" className="w-full h-44 object-cover" />
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('featureToolkitTitle')}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{t('featureToolkitDesc')}</p>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                  <img src="/images/usecase-pwa.jpg" alt="PWA Ondersteuning" className="w-full h-44 object-cover" />
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('featurePWATitle')}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{t('featurePWADesc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Section - clean list, no icons */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 sm:p-8 rounded-2xl mb-16 border border-green-200 dark:border-green-700 mx-1">
                              <h2 className="text-3xl font-semibold text-green-800 dark:text-green-200 mb-6 text-center">{t('privacyTitle')}</h2>
              <div className="max-w-4xl mx-auto">
                <p className="text-green-700 dark:text-green-300 text-base text-center mb-6">{t('privacyLead')}</p>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <ul className="list-disc list-inside space-y-2 text-green-900 dark:text-green-200">
                    <li>{t('privacyBullet1')}</li>
                    <li>{t('privacyBullet2')}</li>
                    <li>{t('privacyBullet3')}</li>
                  </ul>
                  <ul className="list-disc list-inside space-y-2 text-green-900 dark:text-green-200">
                    <li>{t('privacyBullet4')}</li>
                    <li>{t('privacyBullet5')}</li>
                    <li>{t('privacyBullet6')}</li>
                  </ul>
                </div>
                <p className="text-green-600 dark:text-green-400 text-center mt-6 text-xs">{t('privacyFootnote')}</p>
              </div>
            </div>
            {/* Use cases - clean bullets without icons; add supporting images */}
            <div className="bg-gradient-to-r from-slate-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 p-6 sm:p-8 rounded-2xl mb-16 mx-1">
              <h2 className="text-3xl font-semibold text-slate-800 dark:text-slate-200 mb-6 text-center">{t('useCasesTitle')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 xl:gap-10">
                <div>
                  <img src="/images/usecase-meeting.jpg" alt="Online vergadering met recap overzicht" className="w-full h-40 object-cover rounded-xl mb-4 border border-slate-200 dark:border-slate-700" />
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('useCaseMeetingTitle')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{t('useCaseMeetingDesc1')}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{t('useCaseMeetingDesc2')}</p>
                </div>
                <div>
                  <img src="/images/usecase-webinar.jpg" alt="Webinar samenvatting" className="w-full h-40 object-cover rounded-xl mb-4 border border-slate-200 dark:border-slate-700" />
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('useCaseWebinarTitle')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{t('useCaseWebinarDesc1')}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{t('useCaseWebinarDesc2')}</p>
                </div>
                <div>
                  <img src="/images/usecase-conversation.jpg" alt="Belangrijk gesprek in kantoor" className="w-full h-40 object-cover rounded-xl mb-4 border border-slate-200 dark:border-slate-700" />
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('useCaseConversationTitle')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{t('useCaseConversationDesc1')}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{t('useCaseConversationDesc2')}</p>
                </div>
                <div>
                  <img src="/images/usecase-sales.jpg" alt="Klantgesprek analyse" className="w-full h-40 object-cover rounded-xl mb-4 border border-slate-200 dark:border-slate-700" />
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('useCaseSalesTitle')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{t('useCaseSalesDesc1')}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{t('useCaseSalesDesc2')}</p>
                </div>
                <div>
                  <img src="/images/usecase-quiz.jpg" alt="Quizvragen leren" className="w-full h-40 object-cover rounded-xl mb-4 border border-slate-200 dark:border-slate-700" />
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('useCaseQuizTitle')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{t('useCaseQuizDesc1')}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{t('useCaseQuizDesc2')}</p>
                </div>
                <div>
                  <img src="/images/usecase-faq.jpg" alt="FAQ genereren" className="w-full h-40 object-cover rounded-xl mb-4 border border-slate-200 dark:border-slate-700" />
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('useCaseFaqTitle')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{t('useCaseFaqDesc1')}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{t('useCaseFaqDesc2')}</p>
                </div>
                <div>
                  <img src="/images/usecase-exec.jpg" alt="Executive summary" className="w-full h-40 object-cover rounded-xl mb-4 border border-slate-200 dark:border-slate-700" />
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('useCaseExecTitle')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{t('useCaseExecDesc1')}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{t('useCaseExecDesc2')}</p>
                </div>
                <div>
                  <img src="/images/usecase-voice.jpg" alt="Voice input plannen" className="w-full h-40 object-cover rounded-xl mb-4 border border-slate-200 dark:border-slate-700" />
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('useCaseVoiceTitle')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{t('useCaseVoiceDesc1')}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{t('useCaseVoiceDesc2')}</p>
                </div>
                <div>
                  <img src="/images/usecase-chat.jpg" alt="Chat over content" className="w-full h-40 object-cover rounded-xl mb-4 border border-slate-200 dark:border-slate-700" />
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('useCaseChatTitle')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{t('useCaseChatDesc1')}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{t('useCaseChatDesc2')}</p>
                </div>
                <div>
                  <img src="/images/usecase-export.jpg" alt="Alles bundelen in één document" className="w-full h-40 object-cover rounded-xl mb-4 border border-slate-200 dark:border-slate-700" />
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">{t('useCaseExportTitle')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{t('useCaseExportDesc1')}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{t('useCaseExportDesc2')}</p>
                </div>
              </div>
            </div>

            {/* Listen Along / How it works verwijderd */}

            {/* CTA Section verwijderd */}
          </div>
        ) : (
          <>

        
            <div className="w-full max-w-6xl space-y-4 px-2">
            {error && (
              <div className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 rounded-lg p-4 w-full flex items-center gap-3">
                <AlertTriangleIcon className="w-6 h-6"/><span>{error}</span>
              </div>
            )}
            {anonymizationReport && (
                <div className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30 rounded-lg p-4 w-full flex items-center justify-between gap-3">
                    <span className="font-semibold">{anonymizationReport}</span>
                    <button onClick={() => setAnonymizationReport(null)} className="p-1 rounded-full hover:bg-green-200/80 dark:hover:bg-green-500/30 transition-colors"><XIcon className="w-5 h-5" /></button>
                </div>
            )}
            {presentationReport && (
                <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4 w-full flex items-center justify-between gap-3">
                    <span className="font-semibold">{presentationReport}</span>
                    <button onClick={() => setPresentationReport(null)} className="p-1 rounded-full hover:bg-blue-200/80 dark:hover:bg-blue-500/30 transition-colors"><XIcon className="w-5 h-5" /></button>
                </div>
            )}
            {pptTemplate && (
                 <div className="bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 rounded-lg p-4 w-full flex items-center justify-between gap-3">
                    <span className="font-semibold">{t('pptTemplateNote')}</span>
                </div>
            )}
        </div>
        
        {(status === RecordingStatus.IDLE || status === RecordingStatus.ERROR) ? (
             <div className="w-full max-w-[1600px] mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 space-y-6">
                {/* PWA Install Banner - only on start screen, when logged in, and not installed */}
                {showPwaBanner && (
                  <div className="mb-2 rounded-lg border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/30 p-3 flex items-center justify-between gap-3">
                    <div className="text-sm text-cyan-900 dark:text-cyan-200">
                      {t('pwaInstallBannerText')}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handlePwaIgnore} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        {t('pwaIgnore')}
                      </button>
                      <button onClick={handlePwaInstall} className="px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white transition-colors">
                        {t('pwaInstall')}
                      </button>
                    </div>
                  </div>
                )}
                {/* API Key Waarschuwing */}
                {!apiKey && (
                    <div className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 rounded-lg p-4 flex items-center gap-3">
                        <AlertTriangleIcon className="w-6 h-6 text-amber-500" />
                        <div className="flex-1">
                            <p className="font-semibold mb-1">{t('setupApiKey')}</p>
                            <p className="text-sm mb-2">{t('haveAccessLead')}</p>
                            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded p-2 text-sm">
                                <p className="text-green-700 dark:text-green-300 font-medium">{t('privacyTitle')}</p>
                                <p className="text-green-600 dark:text-green-400">{t('privacyItemApiKeyLocal')}</p>
                                <p className="text-green-600 dark:text-green-400">{t('privacyItemNoServers')}</p>
                                <p className="text-green-600 dark:text-green-400">{t('privacyItemWeStoreNothing')}</p>
                            </div>
                        </div>
                        
                    </div>
                )}
                
                {apiKey && (
                    <div className="transition-opacity duration-500">
                        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-6">
                            {t('startOrUpload')}
                        </h2>
                        
                        {/* Language settings - compact and less prominent */}
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center gap-1 mb-3">
                                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('sessionLang')}</label>
                                    <LanguageSelector
                                        value={language ?? ''}
                                        onChange={setLanguage}
                                        placeholder={t('sessionLang')}
                                        appLanguage={uiLang}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('outputLanguage')}</label>
                                    <LanguageSelector
                                        value={outputLang}
                                        onChange={setOutputLang}
                                        placeholder={t('outputLanguage')}
                                        appLanguage={uiLang}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Session Options - Main Actions */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <span className="text-lg font-medium text-slate-700 dark:text-slate-300">{t('chooseHowToStart')}</span>
                                <button 
                                  onClick={() => { setSessionOptionsHelpMode(true); sessionOptionsModal.open(); }}
                                  className="text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
                                  title="Meer informatie over sessie opties"
                                >
                                  <QuestionMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 auto-rows-fr">
                                {/* Audio Recording Option */}
                                <div className="bg-white dark:bg-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600 p-6 hover:border-green-300 dark:hover:border-green-500 transition-all duration-200 hover:shadow-lg h-full min-h-[300px] flex flex-col">
                                    <div className="text-center mb-4">
                                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <MicIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{t('startRecording')}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('sessionOptionAudioDesc')}</p>
                                    </div>
                                    <button onClick={startRecording} disabled={isProcessing || !language || !outputLang} className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white hover:from-green-600 hover:to-emerald-700 dark:hover:from-green-700 dark:hover:to-emerald-800 disabled:from-slate-300 dark:disabled:from-slate-800 disabled:to-slate-400 dark:disabled:to-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-medium">
                                        <MicIcon className="w-5 h-5" />
                                        <span>{t('startRecording')}</span>
                                    </button>
                                    {/* Help links - positioned under start recording button */}
                                    <div className="mt-3 text-center space-y-1">
                                        <button onClick={() => systemAudioHelp.open()} className="block text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline hover:no-underline transition-all duration-200">
                                            🔊 {t('listenAlongHelp')}
                                        </button>
                                        {isMobileDevice() && (
                                            <button onClick={() => mobileAudioHelpModal.open()} className="block text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline hover:no-underline transition-all duration-200">
                                                📱 {t('mobileAudioHelpTitle')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* File Upload Option */}
                                <div className="bg-white dark:bg-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600 p-6 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 hover:shadow-lg h-full min-h-[300px] flex flex-col">
                                    <div className="text-center mb-4">
                                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <UploadIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{t('uploadTranscript')}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('sessionOptionFileDesc')}</p>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept={(userSubscription === SubscriptionTier.DIAMOND ? '.txt,.pdf,.rtf,.html,.htm,.md,.docx,text/plain,application/pdf,application/rtf,text/html,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document' : userSubscription === SubscriptionTier.FREE ? '.txt,text/plain' : '.txt,.pdf,.rtf,.html,.htm,.md,.docx,text/plain,application/pdf,application/rtf,text/html,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document')}/>
                                    <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*,.jpg,.jpeg,.png,.webp,.gif"/>
                                    <button onClick={handleSessionOptionUpload} disabled={isProcessing || !language || !outputLang} className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white hover:from-blue-600 hover:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800 disabled:from-slate-300 dark:disabled:from-slate-800 disabled:to-slate-400 dark:disabled:to-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-medium">
                                        <UploadIcon className="w-5 h-5" />
                                        <span>{t('uploadFile')}</span>
                                    </button>
                                    {/* Supported formats info link */}
                                    <div className="mt-3 text-center">
                                        <button onClick={formatsInfo.open} className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline hover:no-underline transition-all duration-200">
                                            📄 {t('supportedFormatsLink')}
                                        </button>
                                    </div>
                                </div>

                                {/* Paste Text Option */}
                                <div className="bg-white dark:bg-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600 p-6 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-200 hover:shadow-lg h-full min-h-[300px] flex flex-col">
                                    <div className="text-center mb-4">
                                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <ClipboardIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{t('pasteTranscript')}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('pasteTextDirectly')}</p>
                                    </div>
                                    <button onClick={() => pasteModal.open()} disabled={isProcessing || !language || !outputLang} className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 text-white hover:from-purple-600 hover:to-pink-700 dark:hover:from-purple-700 dark:hover:to-pink-800 disabled:from-slate-300 dark:disabled:from-slate-800 disabled:to-slate-400 dark:disabled:to-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-medium">
                                        <ClipboardIcon className="w-5 h-5" />
                                        <span>{t('pasteText')}</span>
                                    </button>
                                    {/* Paste help link */}
                                    <div className="mt-3 text-center">
                                        <button onClick={() => pasteHelp.open()} className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline hover:no-underline transition-all duration-200">
                                            📋 {t('pasteHelp')}
                                        </button>
                                    </div>
                                </div>

                                {/* Web Page Option */}
                                <div className="bg-white dark:bg-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600 p-6 hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-200 hover:shadow-lg h-full min-h-[300px] flex flex-col">
                                    <div className="text-center mb-4">
                                        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c-5 0-9-4-9-9m9 9c5 0 9-4 9-9m-9 9V3m0 9c0-5 4-9 9-9m-9 9c0 5-4 9-9 9" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{t('sessionOptionWebPage')}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('analyzeWebPageContent')}</p>
                                    </div>
                                    <button onClick={() => setShowWebPageModal(true)} disabled={isProcessing || !language || !outputLang} className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 text-white hover:from-orange-600 hover:to-red-700 dark:hover:from-orange-700 dark:hover:to-red-800 disabled:from-slate-300 dark:disabled:from-slate-800 disabled:to-slate-400 dark:disabled:to-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-medium">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c-5 0-9-4-9-9m9 9c5 0 9-4 9-9m-9 9V3m0 9c0-5 4-9 9-9m-9 9c0 5-4 9-9 9" />
                                        </svg>
                                        <span>{t('webpage')}</span>
                                    </button>
                                    {/* Web page help link */}
                                    <div className="mt-3 text-center">
                                        <button onClick={() => setShowWebPageHelp(true)} className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline hover:no-underline transition-all duration-200">
                                            🌐 {t('webPageHelpTitle')}
                                        </button>
                                    </div>
                                </div>

                                {/* Notion Page Option */}
                                {userSubscription === SubscriptionTier.DIAMOND && (
                                  <div className="bg-white dark:bg-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600 p-6 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 hover:shadow-lg h-full min-h-[300px] flex flex-col">
                                      <div className="text-center mb-4">
                                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                              <svg width="32" height="32" viewBox="0 0 100 100" aria-hidden="true" className="text-black dark:text-white">
                                                  <rect x="10" y="10" width="80" height="80" rx="10" fill="currentColor" />
                                                  <path d="M35 70V30h6l18 26V30h6v40h-6L41 44v26h-6z" fill="#ffffff"/>
                                              </svg>
                                          </div>
                                          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{t('notionOption')}</h3>
                                          <p className="text-sm text-slate-600 dark:text-slate-400">{t('notionOptionDesc')}</p>
                                      </div>
                                      <button onClick={() => notionImportModal.open()} disabled={isProcessing || !language || !outputLang} className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-slate-700 to-black dark:from-slate-600 dark:to-black text-white hover:from-black hover:to-slate-800 disabled:from-slate-300 dark:disabled:from-slate-800 disabled:to-slate-400 dark:disabled:to-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-medium">
                                          <svg className="w-5 h-5" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
                                              <rect x="10" y="10" width="80" height="80" rx="10"></rect>
                                          </svg>
                                          <span>{t('notionOption') || 'Notion'}</span>
                                      </button>
                                      {/* Notion help link */}
                                      {userSubscription === SubscriptionTier.DIAMOND && (
                                        <div className="mt-3 text-center">
                                            <button onClick={() => { setSessionOptionsHelpMode(true); sessionOptionsModal.open(); }} className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline hover:no-underline transition-all duration-200">
                                                🧭 {t('notionSearchHelp')}
                                            </button>
                                        </div>
                                      )}
                                  </div>
                                )}

                                {/* Image Upload Option */}
                                <div className="bg-white dark:bg-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600 p-6 hover:border-pink-300 dark:hover:border-pink-500 transition-all duration-200 hover:shadow-lg h-full min-h-[300px] flex flex-col">
                                    <div className="text-center mb-4">
                                        <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-8 h-8 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{t('sessionOptionImage')}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('sessionOptionImageDesc')}</p>
                                    </div>
                                    <button onClick={handleSessionOptionImageUpload} disabled={isProcessing || !language || !outputLang} className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 dark:from-pink-600 dark:to-rose-700 text-white hover:from-pink-600 hover:to-rose-700 dark:hover:from-pink-700 dark:hover:to-rose-800 disabled:from-slate-300 dark:disabled:from-slate-800 disabled:to-slate-400 dark:disabled:to-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-medium">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{t('sessionOptionImage')}</span>
                                    </button>
                                    {/* Image help link */}
                                    <div className="mt-3 text-center">
                                        <button onClick={() => imageUploadHelpModal.open()} className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline hover:no-underline transition-all duration-200">
                                            📸 {t('imageUploadHelpTitle')}
                                        </button>
                                    </div>
                                </div>

                                {/* Email Import Option */}
                                <div className="bg-white dark:bg-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600 p-6 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-200 hover:shadow-lg h-full min-h-[300px] flex flex-col">
                                    <div className="text-center mb-4">
                                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{t('emailImportOption')}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('emailImportOptionDesc')}</p>
                                    </div>
                                    <button onClick={() => emailUploadModal.open()} disabled={isProcessing || !language || !outputLang} className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 dark:from-purple-600 dark:to-violet-700 text-white hover:from-purple-600 hover:to-violet-700 dark:hover:from-purple-700 dark:hover:to-violet-800 disabled:from-slate-300 dark:disabled:from-slate-800 disabled:to-slate-400 dark:disabled:to-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-medium">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>{t('emailImportOption')}</span>
                                    </button>
                                    {/* Email help link */}
                                    <div className="mt-3 text-center">
                                        <button onClick={() => emailImportHelpModal.open()} className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline hover:no-underline transition-all duration-200">
                                            📧 {t('emailImportHelpTitle')}
                                        </button>
                                    </div>
                                </div>

                                {/* Ask the Expert Option */}
                                <div className="bg-white dark:bg-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600 p-6 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-200 hover:shadow-lg h-full min-h-[300px] flex flex-col">
                                    <div className="text-center mb-4">
                                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{t('sessionOptionExpert')}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('sessionOptionExpertDesc')}</p>
                                    </div>
                                    <button onClick={() => expertConfigModal.open()} disabled={isProcessing || !language || !outputLang} className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 text-white hover:from-indigo-600 hover:to-purple-700 dark:hover:from-indigo-700 dark:hover:to-purple-800 disabled:from-slate-300 dark:disabled:from-slate-800 disabled:to-slate-400 dark:disabled:to-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-medium">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        <span>{t('sessionOptionExpert')}</span>
                                    </button>
                                    {/* Ask the Expert help link */}
                                    <div className="mt-3 text-center">
                                        <button onClick={() => expertHelpModal.open()} className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline hover:no-underline transition-all duration-200">
                                            🎓 {t('expertHelpTitle')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            status === RecordingStatus.FINISHED && (
              <div className="w-full max-w-6xl lg:max-w-7xl xl:max-w-[90vw] 2xl:max-w-[85vw]">
                {renderAnalysisView()}
              </div>
            )
        )}

        </>
      )}

        {(status === RecordingStatus.RECORDING || status === RecordingStatus.PAUSED) && (
          <div className="w-full max-w-6xl">
            {renderRecordingView()}
          </div>
        )}
        
        {status === RecordingStatus.STOPPED && (
            <div className="w-full max-w-xl">
                {renderControls()}
            </div>
        )}

        {/* Toast Component */}
        {showToast && (
            <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300 transform ${
                toastType === 'success' ? 'bg-green-500 text-white' :
                toastType === 'error' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'
            }`}>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{toastMessage}</p>
                    <button 
                        onClick={() => setShowToast(false)}
                        className="ml-4 text-white hover:text-gray-200 transition-colors"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}

        {/* Modals: Ons verhaal & Het team */}
        {storyModal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('storyTitle')}</h3>
                <button onClick={storyModal.close} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4 text-slate-800 dark:text-slate-200 text-sm whitespace-pre-line">
                {t('storyContent')}
              </div>
              <div className="p-5 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button onClick={storyModal.close} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white transition-colors">{t('storyClose')}</button>
              </div>
            </div>
          </div>
        )}

        {teamModal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('teamTitle')}</h3>
                <button onClick={teamModal.close} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 text-slate-800 dark:text-slate-200 text-sm">
                <p>{t('teamContent')}</p>
              </div>
              <div className="p-5 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button onClick={teamModal.close} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white transition-colors">{t('teamClose')}</button>
              </div>
            </div>
          </div>
        )}

        <Footer
          t={t}
          authState={authState}
          setShowCookieModal={cookieModal.open}
          setShowStoryModal={storyModal.open}
          setShowTeamModal={teamModal.open}
          setShowFAQPage={setShowFAQPage}
          setShowDisclaimerModal={disclaimerModal.open}
          setShowPricingPage={setShowPricingPage}
        />

    {/* Upgrade Modal */}
    {upgradeModal.isOpen && (
      <Modal
        isOpen={upgradeModal.isOpen}
        onClose={upgradeModal.close}
        title={t('upgradeModalTitle')}
      >
        <UpgradeModal
          onUpgrade={(tier: SubscriptionTier) => {
            setUserSubscription(tier);
            upgradeModal.close();
          }}
          message={error || ''}
        />
      </Modal>
    )}
    {/* Session Options Modal */}
    <SessionOptionsModal
      isOpen={sessionOptionsModal.isOpen}
      onClose={() => { setSessionOptionsHelpMode(false); sessionOptionsModal.close(); }}
      onStartRecording={startRecording}
      onUploadFile={() => handleSessionOptionUpload()}
      onPasteText={() => pasteModal.open()}
      onWebPage={() => webPageModal.open()}
      onUploadImage={() => handleSessionOptionImageUpload()}
      onEmailImport={() => emailUploadModal.open()}
      onNotionImport={() => notionImportModal.open()}
      onAskExpert={() => expertConfigModal.open()}
      userSubscription={SubscriptionTier[userSubscription] as unknown as string}
      helpMode={sessionOptionsHelpMode}
      t={t}
    />
    {/* Storytelling Questions Modal removed in favor of inline panel */}
    {/* Pricing Page */}
    {showPricingPage && (
      <PricingPage
        onClose={() => setShowPricingPage(false)}
        currentTier={userSubscription}
        userId={user?.uid || ''}
        userEmail={user?.email || ''}
        onUpgrade={(tier: SubscriptionTier) => {
          setUserSubscription(tier);
          setShowPricingPage(false);
          // TODO: Implement actual upgrade flow
        }}
        showComingSoonModal={() => comingSoonModal.open()}
        t={t}
      />
    )}

    {/* FAQ Page */}
    {showFAQPage && (
      <FAQPage onClose={() => setShowFAQPage(false)} t={t} />
    )}

    {/* Mobile Audio Help Modal */}
    {mobileAudioHelpModal.isOpen && (
      <MobileAudioHelpModal
        isOpen={mobileAudioHelpModal.isOpen}
        onClose={mobileAudioHelpModal.close}
        t={t}
      />
    )}

    {/* Image Upload Help Modal */}
    {imageUploadHelpModal.isOpen && (
      <ImageUploadHelpModal
        isOpen={imageUploadHelpModal.isOpen}
        onClose={imageUploadHelpModal.close}
        t={t}
      />
    )}

    {/* Email Import Help Modal */}
    {emailImportHelpModal.isOpen && (
      <EmailImportHelpModal
        isOpen={emailImportHelpModal.isOpen}
        onClose={emailImportHelpModal.close}
        t={t}
      />
    )}

    {/* Email Upload Modal */}
    {emailUploadModal.isOpen && (
      <EmailUploadModal
        isOpen={emailUploadModal.isOpen}
        onClose={emailUploadModal.close}
        onEmailImport={handleEmailImport}
        onAnalyze={handleAnalyzeEmail}
        userSubscription={String(userSubscription)}
        t={t}
      />
    )}

    {/* File Upload Modal */}
    {fileUploadModal.isOpen && (
      <FileUploadModal
        isOpen={fileUploadModal.isOpen}
        onClose={fileUploadModal.close}
        onImport={async (file) => {
          await importTranscriptFile(file);
          fileUploadModal.close();
        }}
        t={t}
        accept={
          userSubscription === SubscriptionTier.DIAMOND
            ? '.txt,.pdf,.rtf,.html,.htm,.md,.docx,text/plain,application/pdf,application/rtf,text/html,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : userSubscription === SubscriptionTier.FREE
              ? '.txt,text/plain'
              : '.txt,.pdf,.rtf,.html,.htm,.md,.docx,text/plain,application/pdf,application/rtf,text/html,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
        helperText={t('sessionOptionFileFormats')}
      />
    )}

    {/* Image Upload Modal */}
    {imageUploadModal.isOpen && (
      <ImageUploadModal
        isOpen={imageUploadModal.isOpen}
        onClose={imageUploadModal.close}
        onImport={async (file) => {
          await importImageFile(file);
          imageUploadModal.close();
        }}
        t={t}
      />
    )}

    {/* Notion Import Modal */}
    {notionImportModal.isOpen && userSubscription === SubscriptionTier.DIAMOND && (
      <NotionImportModal
        isOpen={notionImportModal.isOpen}
        onClose={notionImportModal.close}
        t={t}
        onAuthorizedAndLoaded={(text) => {
          const sanitizedText = sanitizeTextInput(text);
          setTranscript(sanitizedText);
          setStatus(RecordingStatus.FINISHED);
          setActiveView('transcript');
          displayToast(t('webPageStandardSuccess') || 'Successfully processed web page', 'success');
          notionImportModal.close();
        }}
      />
    )}

    {/* Expert Configuration Modal */}
    {expertConfigModal.isOpen && (
      <ExpertConfigurationModal
        isOpen={expertConfigModal.isOpen}
        onClose={expertConfigModal.close}
        onStartChat={(config) => {
           setExpertConfiguration(config);
           expertChatModal.open();
         }}
        t={t}
      />
     )}

     {/* Expert Chat Modal */}
     {expertChatModal.isOpen && expertConfiguration && (
       <ExpertChatModal
         isOpen={expertChatModal.isOpen}
         onClose={expertChatModal.close}
         configuration={expertConfiguration}
         onAnalyze={(chatHistory, chatTranscript) => {
           // If chatTranscript is not provided, convert expert chat history to transcript format for analysis
           const transcript = chatTranscript || chatHistory
             .map(message => `${message.role === 'user' ? 'User' : 'Expert'}: ${message.content}`)
             .join('\n\n');
           
           // Set the transcript and switch to analysis view
           setTranscript(transcript);
           setStatus(RecordingStatus.FINISHED); // Set to FINISHED to show analysis view
           setActiveView('transcript'); // Show the transcript view so users can see raw text and choose analysis
           expertChatModal.close();
         }}
         onCancel={() => {
           setExpertConfiguration(null);
           expertChatModal.close();
         }}
         t={t}
         apiKey={apiKey}
         transcript={transcript}
         updateTokensAndRefresh={updateTokensAndRefresh}
         userId={user.uid}
         userTier={userSubscription}
       />
     )}

     {/* Expert Help Modal */}
     {expertHelpModal.isOpen && (
       <ExpertHelpModal
         isOpen={expertHelpModal.isOpen}
         onClose={expertHelpModal.close}
         t={t}
       />
     )}

     {/* Subscription Success Modal */}
     {subscriptionSuccessModal.isOpen && subscriptionSuccessTier && (
       <SubscriptionSuccessModal
         isOpen={subscriptionSuccessModal.isOpen}
         onClose={subscriptionSuccessModal.close}
         tier={subscriptionSuccessTier}
         userEmail={subscriptionSuccessEmail}
         renewalDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
         t={t}
       />
     )}

     {/* Customer Portal Modal */}
     {customerPortalModal.isOpen && (
       <CustomerPortalModal
         isOpen={customerPortalModal.isOpen}
         onClose={customerPortalModal.close}
         customerId={authState.user?.stripeCustomerId}
         userTier={userSubscription}
       />
     )}

     {/* Customer Portal Return Screen */}
     {showCustomerPortalReturn && (
       <CustomerPortalReturnScreen
         onClose={() => setShowCustomerPortalReturn(false)}
         t={t}
       />
     )}
     
     {/* Session Timeout Warning */}
     {sessionId && (
       <SessionTimeoutWarning
         sessionId={sessionId}
         onExtendSession={handleExtendSession}
         onLogout={handleSessionExpired}
       />
     )}
   </main>
   </div>
  </>
); 
}
