import Footer from './src/components/Footer';
import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useModalState } from './src/hooks/useModalState';
import Modal from './src/components/Modal';
import CookieModal from './src/components/CookieModal';
import DisclaimerModal from './src/components/DisclaimerModal';
import WaitlistModal from './src/components/WaitlistModal';
import LoginModal from './src/components/LoginModal';
import { copyToClipboard, displayToast } from './src/utils/clipboard'; 
import { RecordingStatus, type SpeechRecognition, SubscriptionTier, StorytellingData, ExecutiveSummaryData, QuizQuestion, KeywordTopic, SentimentAnalysisResult, ChatMessage, ChatRole, BusinessCaseData, StorytellingOptions, ExplainData, ExplainOptions, ExpertConfiguration, ExpertChatMessage } from './types';
import { GoogleGenAI, Chat, Type } from "@google/genai";
// Using Google's latest Gemini 2.5 Flash AI model for superior reasoning and text generation
// Mermaid is ESM-only; import dynamically to avoid type issues
let mermaid: typeof import('mermaid') | undefined;
import PptxGenJS from 'pptxgenjs';
import RecapSmartPanel from './src/components/RecapSmartPanel';
import LanguageSelector from './src/components/LanguageSelector';
import SessionOptionsModal from './src/components/SessionOptionsModal';
import ExpertConfigurationModal from './src/components/ExpertConfigurationModal';
import ExpertChatModal from './src/components/ExpertChatModal';
import ExpertHelpModal from './src/components/ExpertHelpModal';
// Removed StorytellingQuestionsModal; inline panels are rendered under tabs
import { getGeminiCode, getBcp47Code, getTotalLanguageCount } from './src/languages';
import { useTabCache } from './src/hooks/useTabCache';
import { fetchHTML, fetchMultipleHTML, extractTextFromHTML, FetchError } from './src/utils/fetchPage';
import { useTranslation } from './src/hooks/useTranslation';
import { AudioRecorder } from './src/utils/AudioRecorder';
import MobileAudioHelpModal from './src/components/MobileAudioHelpModal';
import ImageUploadHelpModal from './src/components/ImageUploadHelpModal';
import { isMobileDevice } from './src/utils/deviceDetection';

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
const PodcastIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <path d="M6.5 17.5c-3 0-5.5-2.5-5.5-5.5" />
    <path d="M17.5 17.5c3 0 5.5-2.5 5.5-5.5" />
  </svg>
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

const LoadingSpinner: React.FC<{ className?: string; text?: string }> = ({ className = "h-8 w-8", text }) => (
    <div className="flex items-center gap-3">
        <svg className={`animate-spin text-cyan-500 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {text && <span className="text-slate-600 dark:text-slate-300">{text}</span>}
    </div>
);

// Login Form Component
const LoginForm: React.FC<{
  onLogin: (email: string, password: string) => Promise<void>;
  onCreateAccount: (email: string, password: string) => Promise<void>;
  onPasswordReset: (email: string) => Promise<boolean>;
  onClose: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}> = ({ onLogin, onCreateAccount, onPasswordReset, onClose, t }) => {
  const [mode, setMode] = useState<'login' | 'create' | 'reset'>('login');
  const [email, setEmail] = useState(() => {
    // Load last used email from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('last_email') || '';
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        // Save email to localStorage
        localStorage.setItem('last_email', email);
        await onLogin(email, password);
      } else if (mode === 'create') {
        if (password !== confirmPassword) {
          throw new Error(t('passwordsDoNotMatch'));
        }
        if (password.length < 6) {
          throw new Error(t('passwordTooShort'));
        }
        // Save email to localStorage
        localStorage.setItem('last_email', email);
        await onCreateAccount(email, password);
      } else if (mode === 'reset') {
        await onPasswordReset(email);
        setSuccess(t('passwordResetEmailSent'));
        setTimeout(() => setMode('login'), 2000);
      }
    } catch (error: any) {
      setError(error.message || t('generalError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {t('email')}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder={t('emailPlaceholder')}
        />
      </div>

      {mode !== 'reset' && (
        <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {t('password')}
        </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus={!!email} // Auto-focus if email is pre-filled
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder={t('passwordPlaceholder')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {mode === 'create' && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('passwordAppSpecific')}
            </p>
          )}
        </div>
      )}
      {mode === 'create' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {t('confirmPassword')}
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder={t('passwordPlaceholder')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-slate-400 transition-colors font-medium"
        >
          {isLoading ? (
            <LoadingSpinner className="w-5 h-5" text="" />
          ) : mode === 'login' ? t('loginNow') : mode === 'create' ? t('accountCreate') : t('resetSend')}
        </button>
      </div>

      <div className="flex justify-between text-sm">
        {mode === 'login' && (
          <>
            <button
              type="button"
              onClick={() => setMode('create')}
              className="text-cyan-500 hover:text-cyan-600 transition-colors"
            >
              {t('accountCreate')}
            </button>
            <button
              type="button"
              onClick={() => setMode('reset')}
              className="text-cyan-500 hover:text-cyan-600 transition-colors"
            >
              {t('forgotPassword')}
            </button>
          </>
        )}
        
        {mode === 'create' && (
          <button
            type="button"
            onClick={() => setMode('login')}
            className="text-cyan-500 hover:text-cyan-600 transition-colors"
          >                            {t('backToLogin')}
          </button>
        )}
        
        {mode === 'reset' && (
          <button
            type="button"
            onClick={() => setMode('login')}
            className="text-cyan-500 hover:text-cyan-600 transition-colors"
          >
            {t('backToLogin')}
          </button>
        )}
      </div>
    </form>
  );
};

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

const LoadingOverlay: React.FC<{ text: string }> = ({ text }) => (
    <div className="fixed inset-0 bg-gray-200/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-[100] transition-opacity duration-300">
      <div className="flex items-center gap-4 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700">
        <LoadingSpinner />
        <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">{text}</p>
      </div>
    </div>
);
const PodcastPlayer: React.FC<{ script: string; language: 'nl' | 'en'; t: (key: string, params?: Record<string, unknown>) => string; }> = ({ script, language, t }) => {
    const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused'>('idle');
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        return () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handlePlay = () => {
        if (playbackState === 'paused' && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        } else {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            const utterance = new SpeechSynthesisUtterance(script);
            utterance.lang = getBcp47Code(language || 'en');
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.onend = () => setPlaybackState('idle');
            utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
                console.error('SpeechSynthesis Error:', e.error);
                setPlaybackState('idle');
            }
            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        }
        setPlaybackState('playing');
    };

    const handlePause = () => {
        window.speechSynthesis.pause();
        setPlaybackState('paused');
    };
    
    const handleRewind = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        // Timeout to ensure cancel has processed before speaking again
        setTimeout(handlePlay, 100); 
    };

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] flex flex-col items-center justify-center gap-6">
            <PodcastIcon className="w-24 h-24 text-purple-400" />
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('podcastReady')}</h3>
            <div className="flex items-center gap-4">
                <button onClick={handleRewind} title={t('rewindPodcast')} className="p-3 rounded-full bg-gray-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                    <RewindIcon className="w-6 h-6" />
                </button>
                <button onClick={() => playbackState === 'playing' ? handlePause() : handlePlay()} title={playbackState === 'playing' ? t('pause') : t('play')} className="p-4 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors shadow-lg">
                    {playbackState === 'playing' ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                </button>
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
type ViewType = 'transcript' | 'summary' | 'faq' | 'learning' | 'followUp' | 'chat' | 'podcast' | 'keyword' | 'sentiment' | 'mindmap' | 'storytelling' | 'blog' | 'businessCase' | 'exec' | 'quiz' | 'explain';
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
import UpgradeModal from './src/components/UpgradeModal';
import PricingPage from './src/components/PricingPage';
import FAQPage from './src/components/FAQPage';

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
  const [podcastScript, setPodcastScript] = useState<string>('');
  const [activeView, setActiveView] = useState<ViewType>('transcript');
  const [loadingText, setLoadingText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatInstanceRef = useRef<Chat | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceInputPreview, setVoiceInputPreview] = useState<string>('');
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
  const loginModal = useModalState();
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
  const expertConfigModal = useModalState();
  const expertChatModal = useModalState();
  const expertHelpModal = useModalState();
  
  // Auth state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });
  
  // Expert chat state
  const [expertConfiguration, setExpertConfiguration] = useState<ExpertConfiguration | null>(null);
  
  // Load saved language preferences from localStorage on initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedSessionLang = window.localStorage.getItem('sessionLang');
      const savedOutputLang = window.localStorage.getItem('outputLang');
      if (savedSessionLang) setLanguage(savedSessionLang);
      if (savedOutputLang) setOutputLang(savedOutputLang);
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
          console.warn('Could not save language preferences to Firebase:', error);
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
    const subject = `RecapSmart ${stamp} - ${type}`;
    
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
      console.error('Usage load error', e);
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
        console.error('Error updating tokens:', error);
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
      const ai = new GoogleGenAI({ apiKey: apiKey });
      // Using Gemini 2.5 Flash - Google's latest and most advanced AI model
      // This model provides excellent reasoning, coding, and text generation capabilities
      const sys = `You generate MCQs based on a transcript. Return ONLY a JSON array of objects with keys: question (string), options (array of {label, text}), correct_answer_label, correct_answer_text. Ensure exactly one correct answer per question. Labels are A, B, C, D but limited to requested count.`;
      const prompt = `${sys}\n\nConstraints: number_of_questions=${quizNumQuestions}, number_of_options=${quizNumOptions}.\nTranscript:\n${getTranscriptSlice(transcript, 18000)}`;
      const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      
      // Track token usage
      const promptTokens = tokenCounter.countPromptTokens(prompt);
      const responseTokens = tokenCounter.countResponseTokens(res.text);
      const totalTokens = tokenCounter.getTotalTokens(prompt, res.text);
      
              // Token usage logging removed
      await updateTokensAndRefresh(promptTokens, responseTokens);

      let text = res.text || '';
      text = text.replace(/```[a-z]*|```/gi, '').trim();
      const arr = JSON.parse(text);
      setQuizQuestions(arr);
      
      // Update RecapSmartPanel with new quiz questions
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
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
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

      const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      
      // Track token usage
      const promptTokens = tokenCounter.countPromptTokens(prompt);
      const responseTokens = tokenCounter.countResponseTokens(res.text);
      const totalTokens = tokenCounter.getTotalTokens(prompt, res.text);
      
              // Token usage logging removed
      await updateTokensAndRefresh(promptTokens, responseTokens);

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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
    
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  // Inline panels; no-op kept if referenced
  const handleOpenStorytellingQuestions = () => {
    setActiveView('storytelling');
  };

  // Clipboard utility from utils
  // Use imported copyToClipboard and displayToast

  // Utility function for copying content for email
  const copyToClipboardForEmail = (subject: string, body: string) => {
    try {
      copyToClipboard(body);
      displayToast(
        t('contentCopiedToClipboard'),
        'success'
      );
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      displayToast(t('failedToCopyClipboard'), 'error');
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
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlist, setWaitlist] = useState<Array<{ email: string; timestamp: number }>>([]);
  const [selectedWaitlistUsers, setSelectedWaitlistUsers] = useState<string[]>([]);

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

  const isProcessing = !!loadingText;


  
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

    // Firebase Auth State Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // User is signed in
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        setAuthState({
                            user: { ...userData, uid: firebaseUser.uid },
                            isLoading: false,
                                                    });
                        
                        // Load user subscription tier
                        const tier = userData.subscriptionTier as SubscriptionTier || SubscriptionTier.FREE;
                        setUserSubscription(tier);
                        
                        // Ensure user is redirected to start session screen after auth
                        setShowInfoPage(false);
                        
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
                        } catch (e) { 
                          console.warn('Could not load language preferences from Firebase:', e); 
                        }
                        
                        // Load daily usage counters
                        try {
                          const usage = await getUserDailyUsage(firebaseUser.uid);
                          setDailyAudioCount(usage.audioCount || 0);
                          setDailyUploadCount(usage.uploadCount || 0);
                        } catch (e) { console.warn('Kon dagelijkse usage niet laden:', e); }
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                    setAuthState({
                        user: null,
                        isLoading: false,
                                            });
                }
            } else {
                // User is signed out
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
    // Cleanup AudioRecorder
    if (audioRecorderRef.current) {
      audioRecorderRef.current.cleanup();
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
    setPodcastScript('');
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
    
    // Check transcript length based on user tier for chat
    const effectiveTier = userSubscription;
    const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
    if (!transcriptValidation.allowed) {
        displayToast(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: message }, { role: 'model', text: '' }];
    setChatHistory(newHistory);
    setIsChatting(true);
    
    try {
        if (!chatInstanceRef.current) {
            const ai = new GoogleGenAI({ apiKey: apiKey });
            chatInstanceRef.current = ai.chats.create({
              model: 'gemini-2.5-flash',
              history: chatHistory.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
              config: { systemInstruction: `You are a helpful assistant. The user has provided a transcript of a meeting. Answer their questions based on this transcript:\n\n---\n${transcript}\n---` },
            });
        }
        
        const responseStream = await chatInstanceRef.current.sendMessageStream({ message });
        
        let fullResponse = '';
        for await (const chunk of responseStream) {
            fullResponse += chunk.text;
            setChatHistory(prev => prev.map((msg, i) => i === prev.length - 1 ? { ...msg, text: fullResponse } : msg));
        }
        
        // Track token usage for chat
        const promptTokens = tokenCounter.countPromptTokens(message);
        const responseTokens = tokenCounter.countResponseTokens(fullResponse);
        const totalTokens = tokenCounter.getTotalTokens(message, fullResponse);
        
        // Token usage logging removed
        await updateTokensAndRefresh(promptTokens, responseTokens);
        
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
  }, [chatInput, submitMessage, apiKey, authState.isAdmin, userSubscription, displayToast]);
  
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

    // Bereken gemiddelde amplitude voor debug
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += Math.abs(dataArray[i] - 128);
    }
    const averageAmplitude = sum / bufferLength;

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
    setPodcastScript('');
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
    setStatus(RecordingStatus.GETTING_PERMISSION);
    setError(null);
    setDuration(0);

    try {
      // Initialize AudioRecorder if not already done
      if (!audioRecorderRef.current) {
        audioRecorderRef.current = new AudioRecorder();
        
        // Setup callbacks
        audioRecorderRef.current.onDataAvailable = (blob: Blob) => {
          // Handle audio chunks for real-time processing if needed
        };
        
        audioRecorderRef.current.onStop = (audioBlob: Blob) => {
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
          setStatus(RecordingStatus.STOPPED);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        };
        
        audioRecorderRef.current.onError = (error: Error) => {
          console.error("AudioRecorder error:", error);
          setError(`${t("errorRecording")}: ${error.message}`);
          setStatus(RecordingStatus.ERROR);
        };
        
        audioRecorderRef.current.onStateChange = (state: string) => {
          if (state === 'recording') {
            setStatus(RecordingStatus.RECORDING);
          } else if (state === 'paused') {
            setStatus(RecordingStatus.PAUSED);
          }
        };
      }
      
      // Start recording with the new AudioRecorder
      await audioRecorderRef.current.startRecording();
      
      // Initialize timing
      const start = Date.now();
      setRecordingStartMs(start);
      setPauseAccumulatedMs(0);
      setPauseStartMs(null);

      // Start timer for duration tracking and subscription limits
      timerIntervalRef.current = window.setInterval(() => {
        setDuration(prev => {
          const next = prev + 1;
          const tierLimits = subscriptionService.getTierLimits(effectiveTier);
          if (tierLimits && next >= tierLimits.maxSessionDuration * 60) {
            // Stop recording immediately at limit
            audioRecorderRef.current?.stopRecording();
            setStatus(RecordingStatus.STOPPED);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            displayToast(`Opname gestopt: je hebt de maximale opnametijd van ${tierLimits.maxSessionDuration} minuten bereikt.`, 'info');
          }
          return next;
        });
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
    }
  };
  const pauseRecording = () => {
    if (audioRecorderRef.current?.isRecording) {
        audioRecorderRef.current.pauseRecording();
        setStatus(RecordingStatus.PAUSED);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        setPauseStartMs(Date.now());
    }
  };

  const resumeRecording = () => {
    if (audioRecorderRef.current?.isPaused) {
        audioRecorderRef.current.resumeRecording();
        setStatus(RecordingStatus.RECORDING);
        // accumulate pause time
        setPauseAccumulatedMs(prev => prev + (pauseStartMs ? (Date.now() - pauseStartMs) : 0));
        setPauseStartMs(null);
        
        // Restart timer
        timerIntervalRef.current = window.setInterval(() => setDuration(prev => prev + 1), 1000);
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current && (status === RecordingStatus.RECORDING || status === RecordingStatus.PAUSED)) {
      audioRecorderRef.current.stopRecording();
      setPauseStartMs(null);
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
            setError(canStart.reason || 'Dagelijkse sessielimiet bereikt.');
            return;
        }

        setError(null);
        setAnonymizationReport(null);
        setLoadingText('Bestand verwerken...');

        try {
            let text = '';
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
                    throw new Error('Bestandsformaat wordt niet ondersteund. Probeer PDF, RTF, HTML, MD, DOCX of TXT.');
                }
            }

            if (!text.trim()) {
                throw new Error('Geen tekst gevonden in het bestand.');
            }

            setTranscript(text);
            // Reset all analysis data when new transcript is loaded
            setSummary('');
            setFaq('');
            setLearningDoc('');
            setFollowUpQuestions('');
            setPodcastScript('');
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
              console.warn('Kon sessionCount niet updaten:', e);
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
            setError('Alleen afbeeldingsbestanden zijn toegestaan (JPG, PNG, JPEG, WEBP, GIF).');
            return;
        }

        // Enforce daily session limits before processing
        const totalSessionsToday = (dailyAudioCount || 0) + (dailyUploadCount || 0);
        const canStart = subscriptionService.validateSessionStart(effectiveTier, totalSessionsToday);
        if (!canStart.allowed) {
            setShowUpgradeModal(true);
            setError(canStart.reason || 'Dagelijkse sessielimiet bereikt.');
            return;
        }

        setError(null);
        setAnonymizationReport(null);
        setLoadingText('Afbeelding analyseren...');

        try {
            // Convert image to base64 for Gemini API
            const reader = new FileReader();
            reader.onload = async (e) => {
              try {
                const base64Data = e.target?.result as string;
                const base64Image = base64Data.split(',')[1]; // Remove data:image/...;base64, prefix
                
                if (!apiKey) {
                  setError('API key niet beschikbaar. Neem contact op met de administrator.');
                  setLoadingText('');
                  return;
                }
                
                setLoadingText('Afbeelding analyseren met AI...');
                
                const ai = new GoogleGenAI({ apiKey: apiKey });
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
                  model: 'gemini-2.5-flash', 
                  contents: { parts: [textPart, imagePart] } 
                });
                
                // Track token usage
                const promptTokens = tokenCounter.countPromptTokens([textPart]);
                const responseTokens = tokenCounter.countResponseTokens(analysisResponse.text);
                const totalTokens = tokenCounter.getTotalTokens([textPart], analysisResponse.text);
                
                try {
                  if (authState.user) {
                    await addUserMonthlyTokens(authState.user.uid, promptTokens, responseTokens);
                  }
                } catch {}
                
                const imageAnalysisText = `[AFBEELDING GEANALYSEERD]\n\nBestandsnaam: ${file.name}\nBestandstype: ${file.type}\nBestandsgrootte: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\n=== AI ANALYSE ===\n\n${analysisResponse.text}`;
                
                setTranscript(imageAnalysisText);
                
                // Reset all analysis data when new transcript is loaded
                setSummary('');
                setFaq('');
                setLearningDoc('');
                setFollowUpQuestions('');
                setPodcastScript('');
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
                  console.warn('Kon sessionCount niet updaten:', e);
                }
                
                setActiveView('transcript');
                setLoadingText('');
                
                if (imageInputRef.current) {
                    imageInputRef.current.value = "";
                }
                
              } catch (error: any) {
                console.error('Fout bij afbeeldingsanalyse:', error);
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

    const handlePasteTranscript = async (pastedText: string) => {
        if (!language) {
            setError(t("selectLangToUpload"));
            return;
        }

        if (!pastedText.trim()) {
            setError('Geen tekst geplakt. Plak eerst tekst uit je klembord.');
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

        setError(null);
        setAnonymizationReport(null);
        setLoadingText('Geplakte tekst verwerken...');

        try {
            setTranscript(pastedText);
            // Reset all analysis data when new transcript is loaded
            setSummary('');
            setFaq('');
            setLearningDoc('');
            setFollowUpQuestions('');
            setPodcastScript('');
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
              console.warn('Kon sessionCount niet updaten:', e);
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
      userSubscription !== SubscriptionTier.DIAMOND && 
      !authState.isAdmin) {
    setWebPageError(t("goldTierRequired") || "WebExpert option is only available for Gold and Diamond tier subscribers.");
            return;
        }

        if (!language) {
            setWebPageError(t("selectLangToUpload"));
            return;
        }

        if (!url.trim()) {
            setWebPageError(t("noUrlError") || 'No URL entered. Please enter a valid URL first.');
            return;
        }

        setWebPageError(null);
        setError(null);
        setAnonymizationReport(null);
        setLoadingText(useDeepseekOption ?
    (t("loadingWebExpertAnalysis") || 'Loading and analyzing web pages with WebExpert...') : 
            (t("loadingWebPage") || 'Loading web page and extracting text...'));
        setIsLoadingWebPage(true);

        try {
            let cleanText = '';
            
            if (useDeepseekOption) {
                // Use Firecrawl API for deepseek option
                const firecrawlApiKey = import.meta.env.VITE_FIRECRAWL_API_KEY;
                if (!firecrawlApiKey) {
                    throw new Error('Firecrawl API key is not configured.');
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
                    throw new Error('No content could be retrieved from any of the provided URLs.');
                }
                
                // Combine text from all successfully processed URLs
                cleanText = allResults.map((result: any) => {
                    const content = result.content || '';
                    const title = result.metadata?.title || 'Untitled';
                    return `Source: ${result.url}\nTitle: ${title}\n\n${content}`;
                }).join('\n\n---\n\n');
                
                if (cleanText.length < 100) {
                    throw new Error('Very little text could be retrieved from these web pages.');
                }
            } else {
                // Use improved fetchHTML implementation for regular option
                try {
                    const result = await fetchHTML(url, {
                        timeoutMs: 15000,
                        retries: 2,
                        retryDelay: 1000,
                        userAgent: "RecapSmart/1.0 (Web Content Analyzer)"
                    });
                    
                    console.log('Successfully fetched:', result.metadata?.title || 'Untitled');
                    console.log('Content length:', result.content.length);
                    
                    // Extract clean text from HTML
                    cleanText = extractTextFromHTML(result.content);
                    
                    if (cleanText.length < 100) {
                        throw new Error('Very little text could be retrieved from this web page. This may be due to security settings or because the page contains little text.');
                    }
                    
                } catch (fetchError) {
                    console.warn('Direct fetch failed, falling back to CORS proxy:', fetchError);
                    
                    // Fallback to CORS proxy method
                    const corsProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
                    const response = await fetch(corsProxyUrl);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const proxyData = await response.json();
                    if (!proxyData.contents) {
                        throw new Error('Could not retrieve content from the web page via proxy.');
                    }
                    
                    // Extract clean text from HTML using our utility
                    cleanText = extractTextFromHTML(proxyData.contents);
                    
                    if (cleanText.length < 100) {
                        throw new Error('Very little text could be retrieved from this web page. This may be due to security settings or because the page contains little text.');
                    }
                }
            }



            setTranscript(cleanText);
            // Reset all analysis data when new transcript is loaded
            setSummary('');
            setFaq('');
            setLearningDoc('');
            setFollowUpQuestions('');
            setPodcastScript('');
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
        ? (t("webPageWebExpertSuccess") || 'Web pages successfully analyzed with WebExpert!') 
                : (t("webPageSuccess") || 'Web page successfully loaded and processed!');
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
            
            let errorMessage = err.message || t("webPageGenericError") || 'An error occurred while loading the web page.';
            
            if (err.message.includes('Firecrawl API key')) {
                errorMessage = t("firecrawlApiKeyError") || 'Firecrawl API key is missing. Please check your configuration.';
            } else if (err.message.includes('Firecrawl API error')) {
                errorMessage = t("firecrawlApiError") || 'Error with Firecrawl API. Please try again later.';
                console.error('Firecrawl API specific error:', err.message);
            } else if (err.message.includes('HTTP error') || err.message.includes('status')) {
                errorMessage = t("webPageLoadError") || 'The web page could not be loaded. Check if the URL is correct and try again.';
            } else if (err.message.includes('security settings')) {
                errorMessage = t("webPageSecurityError") || 'The web page could not be loaded due to security settings. Try another URL or contact the website owner.';
            } else if (err.message.includes('little text')) {
                errorMessage = t("webPageTextError") || 'Very little text could be retrieved from this web page. This may be due to security settings or because the page contains little text.';
            } else if (err.message.includes('Firecrawl API')) {
                errorMessage = t("firecrawlApiError") || 'Error connecting to Firecrawl API. Please try again later.';
            } else if (err.message.includes('API key')) {
                errorMessage = t("apiKeyError") || 'API key configuration error. Please contact support.';
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
                setPodcastScript(''); setBlogData(''); setChatHistory([]);
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

    if (!transcript.trim()) {
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
    const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
    if (!transcriptValidation.allowed) {
        const errorMsg = transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.';
        setSummary(errorMsg); setFaq(errorMsg); setLearningDoc(errorMsg); setFollowUpQuestions(errorMsg);
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }
    
    setLoadingText(t('generating', { type }));
    
    try {
        const prompt = getAnalysisPrompt(type, language!, outputLang || language!);
        if (!prompt) throw new Error('Invalid analysis type');

        const fullPrompt = `${prompt}\n\nHere is the text:\n\n${transcript}`;

        const ai = new GoogleGenAI({ apiKey: apiKey });
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });

        // Track token usage
        const promptTokens = tokenCounter.countPromptTokens(fullPrompt);
        const responseTokens = tokenCounter.countResponseTokens(response.text);
        const totalTokens = tokenCounter.getTotalTokens(fullPrompt, response.text);
        
        // Token usage logging removed
        try {
          if (authState.user) {
            await addUserMonthlyTokens(authState.user.uid, promptTokens, responseTokens);
          }
        } catch {}

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

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const inputLanguage = getGeminiCode(language || 'en');
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
        const prompt = `Provide a short and clear explanation of the term '${keyword}' in the context of the following **${inputLanguage}** transcript. Return the explanation in **${outputLanguage}**, no extra titles or formatting. Keep it concise. Transcript: --- ${transcript} ---`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        
        // Track token usage
        const promptTokens = tokenCounter.countPromptTokens(prompt);
        const responseTokens = tokenCounter.countResponseTokens(response.text);
        const totalTokens = tokenCounter.getTotalTokens(prompt, response.text);
        
        // Token usage logging removed
        try {
          if (authState.user) {
            await addUserMonthlyTokens(authState.user.uid, promptTokens, responseTokens);
          }
        } catch {}

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
    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
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
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema }
        });

        // Track token usage
        const promptTokens = tokenCounter.countPromptTokens(prompt);
        const responseTokens = tokenCounter.countResponseTokens(response.text);
        const totalTokens = tokenCounter.getTotalTokens(prompt, response.text);
        
        // Token usage logging removed
        try {
          if (authState.user) {
            await addUserMonthlyTokens(authState.user.uid, promptTokens, responseTokens);
          }
        } catch {}

        const result: KeywordTopic[] = JSON.parse(response.text);
        setKeywordAnalysis(result);
    } catch (err: any) {
        console.error("Fout bij genereren Keyword Analyse:", err);
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

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
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
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema }
        });

        // Track token usage
        const promptTokens = tokenCounter.countPromptTokens(prompt);
        const responseTokens = tokenCounter.countResponseTokens(response.text);
        const totalTokens = tokenCounter.getTotalTokens(prompt, response.text);
        
        // Token usage logging removed
        try {
          if (authState.user) {
            await addUserMonthlyTokens(authState.user.uid, promptTokens, responseTokens);
          }
        } catch {}

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

const handleGeneratePodcast = async () => {
    // Check if user has access to podcast generation
    const effectiveTier = userSubscription;
    if (!subscriptionService.isFeatureAvailable(effectiveTier, 'podcast')) {
        displayToast('Helaas heeft u niet genoeg credits om deze functie uit te voeren. Klik hier om te upgraden naar een hoger abonnement.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }
    
    setActiveView('podcast');
    if (podcastScript) return;
    if (!transcript.trim()) {
        setError(t("transcriptEmpty"));
        return;
    }
    if (!apiKey) {
        displayToast('API key niet beschikbaar. Neem contact op met de administrator.', 'error');
        return;
    }
    
    // Check transcript length based on user tier
    const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
    if (!transcriptValidation.allowed) {
        displayToast(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }
    
    // Don't reset other analysis data when generating podcast script
    
    setLoadingText(t('podcastGenerating'));
    setError(null);

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const inputLanguage = getGeminiCode(language || 'en');
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
        const prompt = `You are a podcast scriptwriter for the 'RecapSmart Podcast', hosted by 'Albert'. Use the **${inputLanguage}** transcript below to create an engaging, natural-sounding script in **${outputLanguage}** that can be spoken aloud directly.
Structure:
1.  [INTRO]: Welcome listeners and introduce the main topic of today concisely.
2.  [CORE]: Go deeper using the key discussions, findings and insights from the transcript to form a compelling story or clear analysis.
3.  [CLOSING]: Summarize the key points. Give concrete, actionable tips or action items. End with a friendly sign-off.
Important:
- Write as a continuous, natural spoken narrative in ${outputLanguage}.
- Do not include headings like "[INTRO]" in the output.
- Output only the text Albert will speak, with no extra formatting.
Here is the transcript:
---
${transcript}
---`;
        
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        
        // Track token usage
        const promptTokens = tokenCounter.countPromptTokens(prompt);
        const responseTokens = tokenCounter.countResponseTokens(response.text);
        const totalTokens = tokenCounter.getTotalTokens(prompt, response.text);
        
        // Token usage logging removed
        try {
          if (authState.user) {
            await addUserMonthlyTokens(authState.user.uid, promptTokens, responseTokens);
          }
        } catch {}

        setPodcastScript(response.text);

    } catch (err: any) {
        console.error("Fout bij genereren podcast:", err);
        setError(`${t("podcastFailed")}: ${err.message || t("unknownError")}`);
        setPodcastScript('');
    } finally {
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
          throw new Error('Account is disabled. Contact administrator.');
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
        loginModal.close();
        
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
          createdAt: serverTimestamp(),
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
          loginModal.close();
          
          // Navigate to start session screen after account creation
          setShowInfoPage(false);
          
          // Show success message
          displayToast(`Welkom ${email}! Je account is automatisch aangemaakt.`, 'success');
        } catch (createError) {
          console.error('Error creating automatic user document:', createError);
          throw new Error('Kon gebruikersaccount niet aanmaken. Probeer het opnieuw of contact administrator.');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Better error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('Email adres niet gevonden. Maak eerst een account aan.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Onjuist wachtwoord. Probeer opnieuw.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Ongeldig email adres.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Te veel pogingen. Probeer het later opnieuw.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('Account is uitgeschakeld. Contact administrator.');
      } else {
        throw new Error(t('loginFailed', { error: error.message }));
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
        throw new Error('Email not found in system. Contact administrator to be added.');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (!userData.isActive) {
        throw new Error('Account is disabled. Contact administrator.');
      }
      
      // User found in database
      
      // Check if user already has a UID (means Firebase Auth account exists)
      if (userData.uid) {
        // User already has UID, checking if Firebase Auth account exists
        try {
          // Try to sign in to see if account exists
          await signInWithEmailAndPassword(auth, email, 'dummy-password');
          console.log('Firebase Auth account exists, cannot create new one');
          throw new Error('Dit email adres is al in gebruik in Firebase. Probeer in te loggen in plaats van een account aan te maken.');
        } catch (authError: any) {
          if (authError.code === 'auth/wrong-password') {
            // Account exists but wrong password - this is what we want
            // Firebase Auth account exists, cannot create new one
            throw new Error('Dit email adres is al in gebruik in Firebase. Probeer in te loggen in plaats van een account aan te maken.');
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
      loginModal.close();
      
      // Account creation successful
    } catch (error: any) {
      console.error('Create account error:', error);
      
      // Better error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Dit email adres is al in gebruik. Probeer in te loggen in plaats van een account aan te maken.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Wachtwoord moet minimaal 6 karakters zijn.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Ongeldig email adres.');
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Ongeldige inloggegevens. Mogelijk bestaat het account al in Firebase. Probeer in te loggen of neem contact op met de administrator.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Account aanmaken is niet toegestaan. Neem contact op met de administrator.');
      } else {
        console.error('Unknown Firebase error:', error);
        throw new Error(`Account aanmaken mislukt: ${error.message}`);
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



  // Waitlist functions
  const addToWaitlist = async (email: string) => {
    try {
      await addDoc(collection(db, 'waitlist'), {
        email: email.toLowerCase().trim(),
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      setWaitlistEmail('');
              displayToast('Je bent succesvol toegevoegd aan de wachtlijst! We nemen contact met je op zodra je toegang krijgt.', 'success');
    } catch (error) {
      console.error('Error adding to waitlist:', error);
              displayToast('Er is een fout opgetreden bij het toevoegen aan de wachtlijst. Probeer het opnieuw.', 'error');
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
      displayToast('Geen toegang tot wachtlijst beheer. Admin rechten vereist.', 'error');
      return;
    }

    if (selectedWaitlistUsers.length === 0) {
              displayToast('Selecteer eerst gebruikers om te activeren.', 'info');
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
              displayToast(`${selectedWaitlistUsers.length} gebruiker(s) succesvol geactiveerd!`, 'success');
    } catch (error) {
      console.error('Error activating :', error);
              displayToast('Fout bij activeren van gebruikers.', 'error');
    }
  };
  const removeFromWaitlist = async (userId: string) => {
    // Controleer of gebruiker admin is
    if (!authState.user || authState.user.subscriptionTier !== SubscriptionTier.DIAMOND) {
      console.error('Unauthorized access to removeFromWaitlist');
      displayToast('Geen toegang tot wachtlijst beheer. Admin rechten vereist.', 'error');
      return;
    }

    try {
      await deleteDoc(doc(db, 'waitlist', userId));
      await loadWaitlist();
              displayToast('Gebruiker succesvol verwijderd van wachtlijst.', 'success');
    } catch (error) {
      console.error('Error removing from waitlist:', error);
              displayToast('Fout bij verwijderen van gebruiker van wachtlijst.', 'error');
    }
  };
  // Email invitation functions
  const sendInvitationEmail = async (email: string) => {
    // Controleer of gebruiker admin is
    if (!authState.user || authState.user.subscriptionTier !== SubscriptionTier.DIAMOND) {
      console.error('Unauthorized access to sendInvitationEmail');
      displayToast('Geen toegang tot email functies. Admin rechten vereist.', 'error');
      return;
    }

    try {
      const subject = 'Uitnodiging voor RecapSmart - Je kunt nu een account aanmaken!';
      const body = `Beste gebruiker,

Je bent uitgenodigd om je aan te melden bij RecapSmart!

Je kunt nu een account aanmaken op: ${window.location.origin}

Met vriendelijke groet,
Het RecapSmart Team`;

      // Open lokale mail client
      openEmailClient(email, subject, body);
      
      displayToast(`Email client geopend voor ${email}!`, 'success');
    } catch (error) {
      console.error('Error sending invitation email:', error);
              displayToast('Fout bij voorbereiden van uitnodigingsmail.', 'error');
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
        displayToast('Geen geldige emails gevonden.', 'info');
        return;
      }

      // Voor meerdere emails, open de eerste in mail client en toon de rest in een popup
      if (emails.length === 1) {
        // Als er maar 1 email is, open direct de mail client
        const subject = 'Uitnodiging voor RecapSmart - Je kunt nu een account aanmaken!';
        const body = `Beste gebruiker,

Je bent uitgenodigd om je aan te melden bij RecapSmart!

Je kunt nu een account aanmaken op: ${window.location.origin}

Met vriendelijke groet,
Het RecapSmart Team`;

        openEmailClient(emails[0], subject, body);
        displayToast(`Email client geopend voor ${emails[0]}!`, 'success');
      } else {
        // Voor meerdere emails, toon een overzicht en open de eerste
        const subject = 'Uitnodiging voor RecapSmart - Je kunt nu een account aanmaken!';
        const body = `Beste gebruiker,

Je bent uitgenodigd om je aan te melden bij RecapSmart!

Je kunt nu een account aanmaken op: ${window.location.origin}

Met vriendelijke groet,
Het RecapSmart Team`;

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
        const ai = new GoogleGenAI({ apiKey: apiKey });
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

        const contentResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: presentationSchema } });
        
        // Track token usage
        const promptTokens = tokenCounter.countPromptTokens(prompt);
        const responseTokens = tokenCounter.countResponseTokens(contentResponse.text);
        const totalTokens = tokenCounter.getTotalTokens(prompt, contentResponse.text);
        
        // Token usage logging removed
        try {
          if (authState.user) {
            await addUserMonthlyTokens(authState.user.uid, promptTokens, responseTokens);
          }
        } catch {}

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
                { "text": { text: "RecapSmart", options: { x: 0.5, y: 5.35, w: '50%', h: 0.2, fontFace: "Helvetica", fontSize: 10, color: "94A3B8" } } },
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
    
    if (data.agenda?.length > 0) addContentSlide({ title: t('inhoudsopgave') || 'Agenda', points: data.agenda }, true);
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
            { text: t('taak') || "Task", options: { fontFace: 'Helvetica', bold: true, color: 'FFFFFF', fill: { color: '0891B2' } } },
            { text: t('eigenaar') || "Owner", options: { fontFace: 'Helvetica', bold: true, color: 'FFFFFF', fill: { color: '0891B2' } } },
            { text: t('deadline') || "Deadline", options: { fontFace: 'Helvetica', bold: true, color: 'FFFFFF', fill: { color: '0891B2' } } },
        ];
        // Op verzoek: kolommen 'Owner' en 'Deadline' leeg laten
        const tableRows = todoItems.map(item => [{ text: item.task }, { text: '' }, { text: '' }]);
        todoSlide.addTable([tableHeader, ...tableRows], { x: '5%', y: 1.1, w: '90%', colW: [5.4, 1.8, 1.8], autoPage: true, rowH: 0.4, fill: { color: '1E293B' }, color: 'E2E8F0', fontSize: 12, valign: 'middle', border: { type: 'solid', pt: 1, color: '0F172A' } });
    }

    const fileName = `RecapSmart_Presentation_${new Date().toISOString().split('T')[0]}.pptx`;
    pptx.writeFile({ fileName });
    return { fileName, slideCount: (pptx as any).slides.length };
};
  const handleTranscribe = async () => {
    if (!audioChunksRef.current.length) {
      setError(t("noAudioToTranscribe"));
      setStatus(RecordingStatus.ERROR);
      return;
    }
  
    setStatus(RecordingStatus.TRANSCRIBING);
    setLoadingText(t('transcribing'));
    setError(null);
    setAnonymizationReport(null);
    setTranscript(''); setSummary(''); setFaq(''); setLearningDoc(''); setFollowUpQuestions(''); setPodcastScript('');
  
    try {
        if (!apiKey) {
            displayToast('API key niet beschikbaar. Neem contact op met de administrator.', 'error');
            return;
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const base64Audio = await blobToBase64(audioBlob);
  
              const inputLanguage = getGeminiCode(language || 'en');
        const transcribePrompt = `Transcribe this audio recording accurately. The spoken language is ${inputLanguage}.`;
      const audioPart = { inlineData: { mimeType: 'audio/webm', data: base64Audio } };
      const textPart = { text: transcribePrompt };
      
      const transcribeResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [textPart, audioPart] } });
      
      // Track token usage
      const promptTokens = tokenCounter.countPromptTokens([textPart]);
      const responseTokens = tokenCounter.countResponseTokens(transcribeResponse.text);
      const totalTokens = tokenCounter.getTotalTokens([textPart], transcribeResponse.text);
      
              // Token usage logging removed
      try {
        if (authState.user) {
          await addUserMonthlyTokens(authState.user.uid, promptTokens, responseTokens);
        }
      } catch {}
      
      setTranscript(transcribeResponse.text);
      // Reset all analysis data when transcript is generated
      setSummary('');
      setFaq('');
      setLearningDoc('');
      setFollowUpQuestions('');
      setPodcastScript('');
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
          console.warn('Kon sessionCount niet updaten:', e);
        }
      setActiveView('transcript');

    } catch (err: any) {
      console.error("Fout bij AI-verwerking:", err);
      setError(`${t("aiError")}: ${err.message || t("unknownError")}`);
        setStatus(RecordingStatus.ERROR);
    } finally { setLoadingText(''); }
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
    
    // Convert **text** to bold
    const boldText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *text* to italic
    const italicText = boldText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert line breaks to <br> tags
    const withLineBreaks = italicText.replace(/\n/g, '<br>');
    
    return <span dangerouslySetInnerHTML={{ __html: withLineBreaks }} />;
  };

  const renderRecordingView = () => {
    return (
              <div className="w-full max-w-6xl bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {status === RecordingStatus.RECORDING ? 'Opname' : 'Gepauzeerd'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {status === RecordingStatus.RECORDING ? 'Opname bezig...' : 'Opname gepauzeerd'}
          </p>
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
        <div className="w-full flex justify-center">
          <canvas 
            ref={canvasRef} 
            width="600" 
            height="100" 
            className="w-full max-w-2xl border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
            style={{ width: '100%', height: '100px' }}
          />
        </div>

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

        {/* Status Info */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          {status === RecordingStatus.RECORDING && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Opname actief</span>
            </div>
          )}
          {status === RecordingStatus.PAUSED && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Opname gepauzeerd</span>
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
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg text-green-600 dark:text-green-400">{t('recordingStopped')}</p>
            <button onClick={handleTranscribe} disabled={isProcessing} className="px-8 py-4 rounded-xl bg-cyan-500 text-white text-lg font-bold hover:bg-cyan-600 disabled:bg-slate-600 transition-all duration-200">
              {t('transcribeSession')}
            </button>
            <div className="w-full max-w-md mt-4">
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
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
                  Audio opname geladen - gebruik de controls om af te spelen
                </p>
              )}
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
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const sys = `Act as a seasoned McKinsey-style business analyst creating an extremely concise one-slide Executive Summary in OSC-R-B-C format (Objective, Situation, Complication, Resolution, Benefits, Call to Action). Use at most 1-3 short sentences per section. If a section is not explicitly present, output "[Niet expliciet besproken]". Return ONLY valid JSON with keys: objective, situation, complication, resolution, benefits, call_to_action.`;
        const prompt = `${sys}\n\nTranscript (NL or other):\n${getTranscriptSlice(transcript, 20000)}`;
        const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        
        // Track token usage
        const promptTokens = tokenCounter.countPromptTokens(prompt);
        const responseTokens = tokenCounter.countResponseTokens(res.text);
        const totalTokens = tokenCounter.getTotalTokens(prompt, res.text);
        
        // Token usage logging removed
        try {
          if (authState.user) {
            await addUserMonthlyTokens(authState.user.uid, promptTokens, responseTokens);
          }
        } catch {}

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
        const ai = new GoogleGenAI({ apiKey: apiKey });
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
            customInstructions += `\n- Gewenste lengte: ${options.length}`;
          }
        }
        
        const sys = `You receive a **${inputLanguage}** transcript from a meeting/webinar/podcast. Transform this into a narrative text in **${outputLanguage}** that reads like a story. Use storytelling elements: don't use character names, describe the setting, build tension around dilemmas or questions, and end with a clear outcome or cliffhanger. Write in an accessible and vivid style, as if it were a journalistic article or short story. Use quotes from the transcript as dialogue fragments. Focus on emotion, conflict, and the key insights that emerged. Make it readable for a broad audience, without being boring or too technical.${customInstructions}`;
        const prompt = `${sys}\n\nTranscript:\n${getTranscriptSlice(transcript, 20000)}`;
        const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        
        // Track token usage
        const promptTokens = tokenCounter.countPromptTokens(prompt);
        const responseTokens = tokenCounter.countResponseTokens(res.text);
        const totalTokens = tokenCounter.getTotalTokens(prompt, res.text);
        
        // Token usage logging removed
        try {
          if (authState.user) {
            await addUserMonthlyTokens(authState.user.uid, promptTokens, responseTokens);
          }
        } catch {}

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
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const inputLanguage = getGeminiCode(language || 'en');
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
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
        const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        
        // Track token usage
        const promptTokens = tokenCounter.countPromptTokens(prompt);
        const responseTokens = tokenCounter.countResponseTokens(res.text);
        const totalTokens = tokenCounter.getTotalTokens(prompt, res.text);
        
        // Token usage logging removed
        try {
          if (authState.user) {
            await addUserMonthlyTokens(authState.user.uid, promptTokens, responseTokens);
          }
        } catch {}

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
        const ai = new GoogleGenAI({ apiKey: apiKey });
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
        const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        
        // Track token usage
        const promptTokens = tokenCounter.countPromptTokens(prompt);
        const responseTokens = tokenCounter.countResponseTokens(res.text);
        const totalTokens = tokenCounter.getTotalTokens(prompt, res.text);
        
        try {
          if (authState.user) {
            await addUserMonthlyTokens(authState.user.uid, promptTokens, responseTokens);
          }
        } catch {}

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
                      setPodcastScript('');
                      setBlogData('');
                    }
                  setLoadingText(t('generating', { type: 'Mindmap' }));
                  const ai = new GoogleGenAI({ apiKey: apiKey });
                  const sys = `You are a mindmap generator. Output ONLY Mermaid mindmap syntax (mindmap\n  root(...)) without code fences. Use at most 3 levels, 6-12 nodes total, concise labels.`;
                  const prompt = `${sys}\n\nTranscript:\n${getTranscriptSlice(transcript, 12000)}`;
                  const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                  
                  // Track token usage
                  const promptTokens = tokenCounter.countPromptTokens(prompt);
                  const responseTokens = tokenCounter.countResponseTokens(res.text);
                  const totalTokens = tokenCounter.getTotalTokens(prompt, res.text);
                  
                  // Token usage logging removed
                  try {
                    if (authState.user) {
                      await addUserMonthlyTokens(authState.user.uid, promptTokens, responseTokens);
                    }
                  } catch {}

                  const raw = res.text || '';
                  const cleaned = raw.replace(/```[a-z]*|```/gi, '').trim();
                  if (!/^mindmap\b/.test(cleaned)) throw new Error('Invalid mindmap output');
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
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => {
                const txt = `## ${t('mindmap')}\n\n${mindmapMermaid}`;
                copyToClipboard(txt);
            }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
                <CopyIcon className="w-5 h-5" />
            </button>
            <button onClick={() => {
                const txt = `## ${t('mindmap')}\n\n${mindmapMermaid}`;
                downloadTextFile(txt, 'mindmap.txt');
            }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download">
                ⬇️
            </button>
            <button onClick={() => {
                const { subject, body } = generateEmailContent(t('mindmap'), `## ${t('mindmap')}\n\n${mindmapMermaid}`);
                copyToClipboardForEmail(subject, body);
            }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email">
                ✉️
            </button>
          </div>
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
        { id: 'podcast', type: 'view', icon: PodcastIcon, label: () => t('podcast') },
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
        { id: 'explain', type: 'view', icon: ExplainIcon, label: () => t('explain') }
    ];

    const analysisContent: Record<ViewType, string> = { transcript, summary, faq, learning: learningDoc, followUp: followUpQuestions, podcast: podcastScript, chat: '', keyword: '', sentiment: '', mindmap: '', storytelling: storytellingData?.story || '', blog: blogData, businessCase: businessCaseData?.businessCase || '', exec: executiveSummaryData ? JSON.stringify(executiveSummaryData) : '', quiz: quizQuestions ? quizQuestions.map(q => `${q.question}\n${q.options.map(opt => `${opt.label}. ${opt.text}`).join('\n')}\nCorrect: ${q.correct_answer_label}`).join('\n\n') : '', explain: explainData?.explanation || '' };

    const handleTabClick = (view: ViewType) => {
        // Check if content already exists for each tab type to avoid regeneration
        if (view === 'summary' && summary) { setActiveView('summary'); return; }
        if (view === 'faq' && faq) { setActiveView('faq'); return; }
        if (view === 'learning' && learningDoc) { setActiveView('learning'); return; }
        if (view === 'followUp' && followUpQuestions) { setActiveView('followUp'); return; }
        if (view === 'exec' && executiveSummaryData) { setActiveView('exec'); return; }
        if (view === 'keyword' && keywordAnalysis && keywordAnalysis.length > 0) { setActiveView('keyword'); return; }
        if (view === 'podcast' && podcastScript && podcastScript.trim()) { setActiveView('podcast'); return; }
        if (view === 'sentiment' && sentimentAnalysisResult) { setActiveView('sentiment'); return; }
        if (view === 'storytelling' && storytellingData?.story) { setActiveView('storytelling'); return; }
        if (view === 'blog' && blogData) { setActiveView('blog'); return; }
        if (view === 'mindmap' && mindmapMermaid) { setActiveView('mindmap'); return; }
        if (view === 'quiz' && quizQuestions) { setActiveView('quiz'); return; }
        if (view === 'businessCase' && businessCaseData?.businessCase) { setActiveView('businessCase'); return; }
        if (view === 'explain' && explainData?.explanation) { setActiveView('explain'); return; }

        // If content doesn't exist, generate it
        if (['summary', 'faq', 'learning', 'followUp'].includes(view)) {
            handleGenerateAnalysis(view);
        } else if (view === 'exec') {
            handleGenerateExecutiveSummary();
        } else if (view === 'quiz') {
            setActiveView('quiz');
        } else if (view === 'keyword') {
            handleGenerateKeywordAnalysis();
        } else if (view === 'podcast') {
            handleGeneratePodcast();
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
        } else if (view === 'mindmap') {
            // Generate mindmap if it doesn't exist
            (async () => {
              try {
                setLoadingText(t('generating', { type: 'Mindmap' }));
                const ai = new GoogleGenAI({ apiKey: apiKey });
                // Using Gemini 2.5 Flash for mindmap generation
                const sys = `You are a mindmap generator. Output ONLY Mermaid mindmap syntax (mindmap\n  root(...)) without code fences. Use at most 3 levels, 6-12 nodes total, concise labels.`;
                const prompt = `${sys}\n\nTranscript:\n${transcript.slice(0, 12000)}`;
                const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                const raw = res.text || '';
                const cleaned = raw.replace(/```[a-z]*|```/gi, '').trim();
                if (!/^mindmap\b/.test(cleaned)) throw new Error('Invalid mindmap output');
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
                            copyToClipboard(txt);
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
                        }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download">
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
                        }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email">
                            ✉️
                        </button>
                    </div>
                    {block(t('objective') || 'Objective', executiveSummaryData.objective)}
                    {block(t('situation') || 'Situation', executiveSummaryData.situation)}
                    {block(t('complication') || 'Complication', executiveSummaryData.complication)}
                    {block(t('resolution') || 'Resolution', executiveSummaryData.resolution)}
                    {block(t('benefits') || 'Benefits', executiveSummaryData.benefits)}
                    {block(t('callToAction') || 'Call to Action', executiveSummaryData.call_to_action)}
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
                                <button onClick={() => copyToClipboard(storytellingData.story)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
                                    <CopyIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => downloadTextFile(storytellingData.story, 'storytelling.txt')} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download">⬇️</button>
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
                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Aantal vragen (1-5)</label>
                            <input type="number" min={1} max={5} value={quizNumQuestions} onChange={(e) => setQuizNumQuestions(Math.max(1, Math.min(5, Number(e.target.value) || 2)))} className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Opties per vraag</label>
                            <select value={quizNumOptions} onChange={(e) => setQuizNumOptions(Number(e.target.value) as 2|3|4)} className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900">
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                            </select>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={quizIncludeAnswers} onChange={(e) => setQuizIncludeAnswers(e.target.checked)} className="w-4 h-4" />
                            <span>Inclusief antwoorden</span>
                        </label>
                        <button onClick={handleGenerateQuiz} disabled={isGeneratingQuiz || !transcript.trim()} className="px-3 py-2 rounded bg-cyan-600 text-white text-sm hover:bg-cyan-700 disabled:opacity-50">{isGeneratingQuiz ? 'Genereren...' : 'Genereren'}</button>
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
                                    try { await navigator.clipboard.writeText(txt); displayToast('Gekopieerd!', 'success'); } catch {}
                                }} className="px-3 py-1.5 rounded bg-slate-800 text-white text-sm hover:bg-slate-900">Kopieer</button>
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
                                    displayToast('Tekstbestand gedownload', 'success');
                                }} className="px-3 py-1.5 rounded bg-slate-700 text-white text-sm hover:bg-slate-800">Download .txt</button>
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
                                    const { subject, body } = generateEmailContent(t('quizQuestions') || 'Quizvragen', content);
                                    copyToClipboardForEmail(subject, body);
                                }} className="px-3 py-1.5 rounded bg-slate-600 text-white text-sm hover:bg-slate-700">Mail</button>
                            </div>
                        )}
                    </div>
                    {quizError && <div className="text-sm text-red-600 mb-2">{quizError}</div>}
                    {quizQuestions && quizQuestions.length > 0 ? (
                        <ol className="space-y-3 list-decimal list-inside">
                            {quizQuestions.map((q, idx) => (
                                <li key={`quiz-${idx}-${q.question.substring(0, 20)}`} className="text-sm">
                                    <div className="font-medium text-slate-800 dark:text-slate-100 mb-1">{q.question}</div>
                                    <div className="ml-4 space-y-1">
                                        {q.options.map(opt => (<div key={opt.label} className="text-slate-700 dark:text-slate-200">{opt.label}) {opt.text}</div>))}
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
        
        if (activeView === 'podcast') {
            // Check if user has access to podcast generation
            const effectiveTier = userSubscription;
            if (!subscriptionService.isFeatureAvailable(effectiveTier, 'podcast')) {
                return (
                    <div className="flex items-center justify-center p-8 min-h-[300px]">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🔒</div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Podcast generatie niet beschikbaar</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                Podcast generatie is beschikbaar vanaf Gold tier. Upgrade je abonnement om podcast scripts te genereren.
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
            
            if (loadingText && !podcastScript) {
                 return <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300 min-h-[300px]"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>;
            }
            if (podcastScript) {
                return <PodcastPlayer script={podcastScript} language={language || 'nl'} t={t} />;
            }
            return <div className="flex items-center justify-center p-8 min-h-[300px] text-slate-500 dark:text-slate-400">{t('noContent')}</div>;
        }
        if (activeView === 'blog') {
            const L = blogLabels[uiLang] || blogLabels.en;
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[70vh] overflow-y-auto">
                    {/* Inline Blog Options (optional) */}
                    <div className="mb-4 p-3 rounded border border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40">
                        <div className="text-xs text-cyan-700 dark:text-cyan-300 mb-3">{td('storytellingOptional')}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Doelgroep Blogpost:</label>
                                <select value={blogOptions.targetAudience} onChange={(e) => setBlogOptions(b => ({ ...b, targetAudience: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    {L.targetAudience.map((v, i) => (<option key={i} value={v}>{v || '—'}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Hoofddoel van de Blogpost:</label>
                                <select value={blogOptions.mainGoal} onChange={(e) => setBlogOptions(b => ({ ...b, mainGoal: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    {L.mainGoal.map((v, i) => (<option key={i} value={v}>{v || '—'}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Gewenste Toon:</label>
                                <select value={blogOptions.tone} onChange={(e) => setBlogOptions(b => ({ ...b, tone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    {L.tone.map((v, i) => (<option key={i} value={v}>{v || '—'}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Gewenste Lengte (ongeveer):</label>
                                <select value={blogOptions.length} onChange={(e) => setBlogOptions(b => ({ ...b, length: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                    {L.length.map((v, i) => (<option key={i} value={v}>{v || '—'}</option>))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-2">
                            <button onClick={handleGenerateBlog} disabled={!transcript.trim()} className="px-3 py-2 rounded bg-cyan-600 text-white text-sm hover:bg-cyan-700 disabled:opacity-50">Genereren</button>
                        </div>
                    </div>

                    {/* Output */}
                    {loadingText && !blogData ? (
                        <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300 min-h-[200px]"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>
                    ) : blogData ? (
                        <div className="relative">
                            <div className="absolute top-0 right-0 flex gap-2">
                                <button onClick={() => copyToClipboard(blogData)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
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
                <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => copyToClipboard(content)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
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
                <div className="overflow-y-auto max-h-[calc(70vh-120px)]">
                    <pre className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">
                        {renderMarkdown(content || t('noContent'))}
                    </pre>
                </div>
            </div>
        );
    };
    return (
        <div className={`w-full max-w-6xl mx-auto bg-transparent rounded-lg transition-all duration-300 ${isAnonymized ? 'ring-2 ring-green-400/80 shadow-lg shadow-green-500/10' : ''}`}>
             <RecapSmartPanel
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
                 startStamp={getStartStamp()}
                 outputLanguage={outputLang}
                 onNotify={(msg, type) => displayToast(msg, type)}
                 onGenerateQuiz={async ({ numQuestions, numOptions }) => {
                    // Check transcript length based on user tier
                    const effectiveTier = userSubscription;
                    const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
                    if (!transcriptValidation.allowed) {
                      throw new Error(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.');
                    }
                    
                    const ai = new GoogleGenAI({ apiKey: apiKey });
                    const sys = `You generate MCQs based on a transcript. Return ONLY a JSON array of objects with keys: question (string), options (array of {label, text}), correct_answer_label, correct_answer_text. Generate between 1 and 5 questions as requested. Ensure exactly one correct answer per question. Labels should be A, B, C, D but only up to the requested number of options.`;
                    const prompt = `${sys}\n\nConstraints: number_of_questions=${numQuestions}, number_of_options=${numOptions}.\nTranscript:\n${getTranscriptSlice(transcript, 18000)}`;
                    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
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
    <div className="flex flex-col h-[70vh] bg-white dark:bg-slate-800 rounded-b-lg transition-colors">
        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 pl-2">{t('chatWithTranscript')}</h3>
            <button 
                onClick={() => setIsTTSEnabled(!isTTSEnabled)} 
                disabled={!apiKey}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md ${isTTSEnabled ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/20' : (!apiKey) ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
            >
                {isTTSEnabled ? <SpeakerIcon className="w-5 h-5" /> : <SpeakerOffIcon className="w-5 h-5" />}
                <span>{isTTSEnabled ? t('readAnswers') : (!apiKey ? t('readAnswers') : t('readAnswers'))}</span>
            </button>
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
                <button 
                    onClick={toggleListening} 
                    disabled={!apiKey}
                    className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : (!apiKey) ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                    title={(!apiKey) ? t('setupApiKey') : (isListening ? t('stopListening') : t('startListening'))}
                > 
                    <MicIcon className="w-5 h-5"/> 
                </button>
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
      {isProcessing && <LoadingOverlay text={loadingText || t('processing')} />}
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
              <img src="/logo.png" alt="RecapSmart Logo" className="w-8 h-8 rounded-lg" />
            </button>
          )}
          
          <div className="flex items-center gap-2 bg-gray-200 dark:bg-slate-800 px-2 py-1 rounded-md shrink-0">
            <select value={uiLang} onChange={(e) => setUiLang(e.target.value as any)} className="bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none">
              <option value="en">EN</option>
              <option value="nl">NL</option>
              <option value="de">DE</option>
              <option value="fr">FR</option>
              <option value="pt">PT</option>
              <option value="es">ES</option>
            </select>
          </div>
                          <button onClick={toggleTheme} className="flex items-center justify-center h-9 w-9 bg-gray-200 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-opacity-80">
                  {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
                </button>
          
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
                          setPodcastScript('');
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
                  <button onClick={() => settingsModal.open()} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[100px]">
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
                  <button onClick={() => settingsModal.open()} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[100px]">
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
                      setPodcastScript('');
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
                  <button onClick={() => settingsModal.open()} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[100px]">
                    <SettingsIcon className="w-5 h-5"/> 
                    <span>{t('settings')}</span>
                  </button>
                </>
              )}
            </>
          ) : (
            /* Not logged in - only show login button */
            <button 
              onClick={() => loginModal.open()} 
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

      <LoginModal
  isOpen={loginModal.isOpen}
  onClose={loginModal.close}
  t={t}
  handleLogin={async (email: string, password: string) => {
    setLoadingText(t('loggingIn'));
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!user || !user.uid) {
        throw new Error('Geen geldige gebruiker gevonden na inloggen.');
      }
      // Hier pas Firestore functies aanroepen met user.uid
      // Voorbeeld: await getUserSubscriptionTier(user.uid);
      // ...andere Firestore calls
      // Zet eventueel app state naar "ingelogd"
      // Sluit modal na succes
      loginModal.close();
    } catch (error: any) {
      setError(error.message || t('generalError'));
    } finally {
      setLoadingText('');
    }
  }}
  handleCreateAccount={handleCreateAccount}
  handlePasswordReset={handlePasswordReset}
/>

      {/* Settings Modal */}
      {systemAudioHelp.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-3xl w-full m-4 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Systeem-audio inschakelen</h3>
              <button onClick={systemAudioHelp.close} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                Volg deze stappen om mee te luisteren met podcasts en video's. Zet bij het delen van je scherm de optie <strong>"Systeem audio"</strong> aan.
              </p>
              <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src="/uitleg.png" alt="Uitleg systeem audio aanzetten" className="w-full h-auto" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                {/* Link verwijderd */}
                <button onClick={systemAudioHelp.close} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold">
                  Sluiten
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
                    <p className="text-sm text-slate-700 dark:text-slate-200">{t('webPageHelpText') || 'Enter a URL or drag and drop a link to analyze content from a web page.'}</p>
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
                {(userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.DIAMOND || userSubscription === SubscriptionTier.ENTERPRISE || authState.isAdmin) && (
                  <div className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <input
                      type="checkbox"
                      id="useDeepseek"
                      checked={useDeepseek}
                      onChange={(e) => setUseDeepseek(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="useDeepseek" className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center">
                      <span className="mr-2">{t('useWebExpertOption') || 'Use WebExpert Option'}</span>
                      <span className="px-2 py-0.5 text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full">
                        {t('goldDiamondEnterpriseOnly') || 'Gold, Diamond & Enterprise'}
                      </span>
                    </label>
                  </div>
                )}

                {!useDeepseek ? (
                  <>
                    {/* Single URL Input */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('webPageUrlLabel') || 'Web Page URL'}</label>
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
                        <div className="font-medium mb-1">{t('webPageDragDropText') || 'Drag and drop a URL here'}</div>
                        <p className="text-sm text-slate-400 dark:text-slate-500">{t('webPageDragDropHint') || 'You can drag links from other tabs or applications'}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Multiple URL Inputs for Deepseek */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t('webExpertUrlsLabel') || 'Web Page URLs for WebExpert Analysis'}
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
                                    {t('webPageDragDropText') || 'Drag URL here or type'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        {t('webExpertUrlsNote') || 'WebExpert allows analyzing multiple URLs simultaneously for comprehensive insights.'}
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
                        setWebPageError(t('noValidUrlsError') || 'Please enter at least one valid URL');
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
                    useDeepseek ? (t('analyzeWithWebExpert') || 'Analyze with WebExpert') : t('processWebPage')
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
                De taal selecteren voor het bron document/opname helpt AI om het beter te begrijpen.
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={step1Help.close} 
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
              >
                Sluiten
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
                De taal selecteren voor het bron document/opname helpt AI om het beter te begrijpen.
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={step2Help.close} 
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
              >
                Sluiten
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
              <button onClick={() => systemAudioHelp.close()} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
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
                <button onClick={() => systemAudioHelp.close()} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold">{t('close')}</button>
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
      {settingsModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-4xl w-full m-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">{t('settingsTitle')}</h3>
              <button 
                onClick={() => settingsModal.close()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Huidige tier + gebruik */}
              <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 mr-2">{t('settingsCurrentTier')}</span>
                    <span className="font-semibold capitalize">{authState.isAdmin ? 'diamond' : String(userSubscription)}</span>
                    <button onClick={() => { settingsModal.close(); setShowPricingPage(true); }} className="ml-2 text-cyan-600 dark:text-cyan-400 underline">{t('settingsViewPricing')}</button>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 mr-2">{t('settingsTokensThisMonth')}</span>
                    <span className="font-semibold">{monthlyTokens?.totalTokens ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 mr-2">{t('settingsSessionsThisMonth')}</span>
                    <span className="font-semibold">{monthlySessions ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* API Key beheer verwijderd – sleutel komt uit .env.local */}

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
                      <p className="text-sm mt-1">{t('settingsAddRule')} om tekst automatisch te anonimiseren.</p>
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
              
              {/* Actie Knoppen */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => settingsModal.close()}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                >
                  {t('settingsCancel')}
                </button>
                <button
                  onClick={saveAnonymizationRules}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                >
                  {t('settingsSave')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Consent Banner */}
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
                <img src="/logo.png" alt="RecapSmart Logo" className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shadow-lg" />
              </div>
              
              {/* Hoofdtitel - meer compact en elegant */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600">
                  RecapSmart
                </span>
              </h1>
              
              {/* Subtitel - compactere spacing */}
              <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed px-1">
                {t('landingHeroSubtitle')}
              </p>
              
              {/* Login + Uitnodiging Section */}
              <div className="max-w-6xl xl:max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-12">
                                      {/* {t('loginLeftProminent')} */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 xl:p-10 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">{t('login')}</h2>
                    <LoginForm 
                      onLogin={handleLogin}
                      onCreateAccount={handleCreateAccount}
                      onPasswordReset={handlePasswordReset}
                      onClose={() => {}}
                      t={t}
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
                      onClick={() => setShowWaitlistModal(true)}
                      className="mt-3 text-cyan-700 dark:text-cyan-400 hover:underline text-sm"
                    >
                      {t('waitlistMoreInfo')}
                    </button>
                  </div>
                </div>
              </div>
              
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
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">AI analyse</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{t('featureAIAnalysisDesc')}</p>
                  </div>
                </div>
                                  <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                    <img src="/images/hero-3.jpg" alt="Export maken" className="w-full h-44 object-cover" />
                    <div className="p-5">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2"> Export</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{t('featurePresentationsDesc')}</p>
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
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Taal instellingen</span>
                                <button 
                                  onClick={step1Help.open}
                                  className="ml-1 text-slate-500 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400 transition-colors"
                                  title="Help bij taal selectie"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
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
                                  onClick={() => sessionOptionsModal.open()}
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
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept={(authState.isAdmin ? '.txt,.pdf,.rtf,.html,.htm,.md,.docx,text/plain,application/pdf,application/rtf,text/html,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document' : userSubscription === SubscriptionTier.FREE ? '.txt,text/plain' : '.txt,.pdf,.rtf,.html,.htm,.md,.docx,text/plain,application/pdf,application/rtf,text/html,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document')}/>
                                    <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*,.jpg,.jpeg,.png,.webp,.gif"/>
                                    <button onClick={() => fileInputRef.current?.click()} disabled={isProcessing || !language || !outputLang} className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white hover:from-blue-600 hover:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800 disabled:from-slate-300 dark:disabled:from-slate-800 disabled:to-slate-400 dark:disabled:to-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-medium">
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
                                        <span>Webpagina</span>
                                    </button>
                                    {/* Web page help link */}
                                    <div className="mt-3 text-center">
                                        <button onClick={() => setShowWebPageHelp(true)} className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline hover:no-underline transition-all duration-200">
                                            🌐 {t('help')}
                                        </button>
                                    </div>
                                </div>

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
                                            📸 {t('help')}
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
                                            🎓 {t('help')}
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
      onClose={sessionOptionsModal.close}
      onStartRecording={startRecording}
      onUploadFile={handleSessionOptionUpload}
      onPasteText={() => pasteModal.open()}
      onWebPage={() => webPageModal.open()}
      onUploadImage={handleSessionOptionImageUpload}
      onAskExpert={() => expertConfigModal.open()}
      userSubscription={String(userSubscription)}
      t={t}
    />
    {/* Storytelling Questions Modal removed in favor of inline panel */}
    {/* Pricing Page */}
    {showPricingPage && (
      <PricingPage
        isOpen={showPricingPage}
        onClose={() => setShowPricingPage(false)}
        currentTier={userSubscription}
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
   </main>
   </div>
  </>
); 
}
