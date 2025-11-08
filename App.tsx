import Footer from './src/components/Footer.tsx';
import * as React from 'react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useModalState } from './src/hooks/useModalState';
import Modal from './src/components/Modal.tsx';
import CookieModal from './src/components/CookieModal.tsx';
import DisclaimerModal from './src/components/DisclaimerModal.tsx';
import WaitlistModal from './src/components/WaitlistModal.tsx';
// Email confirmation modal for secure signup flows
import { EmailConfirmationModal } from './src/components/EmailConfirmationModal';
import LoginModal from './src/components/LoginModal';
import { copyToClipboard, displayToast } from './src/utils/clipboard'; 
import { RecordingStatus, type SpeechRecognition, SubscriptionTier, StorytellingData, ExecutiveSummaryData, QuizQuestion, KeywordTopic, SentimentAnalysisResult, ChatMessage, ChatRole, BusinessCaseData, StorytellingOptions, ExplainData, ExplainOptions, TeachMeTopic, TeachMeMethod, TeachMeData, ShowMeData, TedTalk, NewsArticle, EmailOptions, SocialPostOptions, SocialPostData, ExpertConfiguration, ExpertChatMessage, SessionType, UserDocumentCreate, TranslationFunction, PromptDocument, SummaryOptions } from './types';
import { ChartBarIcon } from '@heroicons/react/24/outline';
 import { HiRefresh, HiClipboardCopy, HiDownload, HiMail, HiDotsHorizontal } from 'react-icons/hi';
import { GoogleGenAI, Chat, Type } from "@google/genai";
import modelManager from './src/utils/modelManager';
import { AIProviderManager, AIFunction } from './src/utils/aiProviderManager';
import { getModelForUser } from './src/utils/tierModelService';
// Using Google's latest Gemini 2.5 Flash AI model for superior reasoning and text generation
// Mermaid is ESM-only; import dynamically to avoid type issues
let mermaid: typeof import('mermaid') | undefined;
import PptxGenJS from 'pptxgenjs';
// Helper to import and initialize Mermaid once and cache the instance
const getMermaid = async (appTheme: 'light' | 'dark') => {
  if (mermaid) {
    try {
      (mermaid as any).initialize?.({ startOnLoad: false, securityLevel: 'strict', theme: appTheme === 'dark' ? 'dark' : 'default' });
    } catch {}
    return mermaid as any;
  }
  const mod: any = await import('mermaid');
  const m: any = mod.default || mod;
  try {
    m.initialize?.({ startOnLoad: false, securityLevel: 'strict', theme: appTheme === 'dark' ? 'dark' : 'default' });
  } catch {}
  mermaid = m;
  return m;
};

// Render Mermaid mindmap text to SVG using the cached instance
const renderMindmapSvg = async (mermaidText: string, appTheme: 'light' | 'dark'): Promise<string | null> => {
  try {
    const m: any = await getMermaid(appTheme);
    const { svg } = await m.render('mindmap-svg', mermaidText);
    return svg;
  } catch (err) {
    console.warn('Mermaid render failed', err);
    return null;
  }
};
import RecapHorizonPanel from './src/components/RecapHorizonPanel.tsx';
import SocialPostCard from './src/components/SocialPostCard.tsx';
import LanguageSelector from './src/components/LanguageSelector.tsx';
import SessionOptionsModal from './src/components/SessionOptionsModal.tsx';
import ExpertConfigurationModal from './src/components/ExpertConfigurationModal.tsx';
import ExpertChatModal from './src/components/ExpertChatModal.tsx';
import ExpertHelpModal from './src/components/ExpertHelpModal.tsx';
// Removed StorytellingQuestionsModal; inline panels are rendered under tabs
import { getGeminiCode, getBcp47Code, getTotalLanguageCount } from './src/languages';
import { useTabCache } from './src/hooks/useTabCache';
import { fetchHTML, fetchMultipleHTML, extractTextFromHTML, FetchError } from './src/utils/fetchPage';
import { markdownToPlainText } from './src/utils/textUtils';
import { useTranslation } from './src/hooks/useTranslation';
import { Language } from './src/locales';
import { AudioRecorder } from './src/utils/AudioRecorder';
import MobileAudioHelpModal from './src/components/MobileAudioHelpModal.tsx';
import AudioUploadHelpModal from './src/components/AudioUploadHelpModal.tsx';
import ImageUploadHelpModal from './src/components/ImageUploadHelpModal.tsx';
import EmailImportHelpModal from './src/components/EmailImportHelpModal.tsx';
import EmailUploadModal from './src/components/EmailUploadModal.tsx';
import NotionImportModal from './src/components/NotionImportModal.tsx';
import NotionIntegrationHelpModal from './src/components/NotionIntegrationHelpModal.tsx';
import IdeaBuilderSimpleHelp from './src/components/IdeaBuilderSimpleHelp.tsx';
import FileUploadModal from './src/components/FileUploadModal.tsx';
import ImageUploadModal from './src/components/ImageUploadModal.tsx';
import AudioUploadModal from './src/components/AudioUploadModal.tsx';
import ImageGenerationModal from './src/components/ImageGenerationModal.tsx';
import SpecialsTab from './src/components/SpecialsTab.tsx';
import { SafeUserText } from './src/utils/SafeHtml';
import { sanitizeTextInput, extractEmailAddresses } from './src/utils/security';

import { isMobileDevice } from './src/utils/deviceDetection';
import { readEml } from 'eml-parse-js';
import MsgReader from '@kenjiuno/msgreader';
import EmailCompositionTab, { EmailData } from './src/components/EmailCompositionTab.tsx';
import ThinkingPartnerTab from './src/components/ThinkingPartnerTab.tsx';
import AIDiscussionTab from './src/components/AIDiscussionTab.tsx';
import OpportunitiesTab from './src/components/OpportunitiesTab.tsx';
import McKinseyTab from './src/components/McKinseyTab.tsx';

import TokenUsageMeter from './src/components/TokenUsageMeter.tsx';
import SubscriptionSuccessModal from './src/components/SubscriptionSuccessModal.tsx';
import CustomerPortalModal from './src/components/CustomerPortalModal.tsx';
import CustomerPortalReturnScreen from './src/components/CustomerPortalReturnScreen.tsx';
import NotificationModal from './src/components/NotificationModal.tsx';
import { stripeService } from './src/services/stripeService';
import UsageModal from './src/components/UsageModal';
import AudioLimitModal from './src/components/AudioLimitModal';
import QuotaExceededModal from './src/components/QuotaExceededModal';
import QuotaWarningBanner from './src/components/QuotaWarningBanner';
import BlurredLoadingOverlay from './src/components/BlurredLoadingOverlay';
import jsPDF from 'jspdf';

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
import { auth, db, getUserDailyUsage, incrementUserDailyUsage, incrementUserMonthlySessions, addUserMonthlyTokens, getUserMonthlyTokens, getUserMonthlySessions, getUserPreferences, saveUserPreferences, getUserStripeData, getUserMonthlyAudioMinutes, validateReferralCode, validateReferralCodeServerSide, getUserSubscriptionTier, refreshUserSubscriptionData, forceRefreshSubscriptionTier, type MonthlyTokensUsage } from './src/firebase';
import { showDiamondTokenToast } from './src/utils/toastNotification';
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
const SpecialsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26"/></svg>
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

const TeachMeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
);

const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22 6 12 13 2 6"/>
    </svg>
);

const SocialPostIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
);

const ThinkingPartnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
);

const AIDiscussionIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <circle cx="9" cy="10" r="1"/>
        <circle cx="15" cy="10" r="1"/>
        <circle cx="12" cy="14" r="1"/>
    </svg>
);

const OpportunitiesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
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

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="4" x2="20" y1="6" y2="6"/>
        <line x1="4" x2="20" y1="12" y2="12"/>
        <line x1="4" x2="20" y1="18" y2="18"/>
    </svg>
);

const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
);



// --- COMPONENTS ---

const LoadingOverlay: React.FC<{ text: string; progress?: number; cancelText?: string; onCancel?: () => void }> = ({ text, progress, cancelText, onCancel }) => {
  const progressPercentage = typeof progress === 'number' ? Math.max(0, Math.min(100, Math.round(progress * 100))) : 0;
  
  return (
    <div className="fixed inset-0 bg-gray-200/60 dark:bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center z-[100] transition-opacity duration-300">
      <div className="flex items-start gap-4 p-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200/50 dark:border-slate-700/50 min-w-[320px] max-w-[90%]">
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


const KeywordExplanationModal: React.FC<{ keyword: string; explanation: string | null; isLoading: boolean; onClose: () => void; t: TranslationFunction; }> = ({ keyword, explanation, isLoading, onClose, t }) => {
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
    t: TranslationFunction;
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
                                onChange={(value: string) => setLanguage(value as 'nl' | 'en')}
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
type ViewType = 'transcript' | 'summary' | 'faq' | 'learning' | 'followUp' | 'chat' | 'keyword' | 'sentiment' | 'mindmap' | 'storytelling' | 'blog' | 'businessCase' | 'exec' | 'quiz' | 'explain' | 'teachMe' | 'showMe' | 'thinkingPartner' | 'aiDiscussion' | 'opportunities' | 'mckinsey' | 'email' | 'socialPost' | 'socialPostX' | 'main' | 'podcast' | 'specials';
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
  lastLogin: { seconds: number } | null;
  sessionCount: number;
  createdAt: { seconds: number };
  updatedAt: { seconds: number };
  hashedApiKey?: string;
  apiKeyLastUpdated?: { seconds: number };
  subscriptionTier?: SubscriptionTier | string;
  currentSubscriptionStatus?: 'active' | 'past_due' | 'cancelled' | 'expired';
  hasHadPaidSubscription?: boolean;
  monthlyAudioMinutes?: number;
  currentSubscriptionStartDate?: { seconds: number };
  nextBillingDate?: { seconds: number };
  stripeCustomerId?: string;
  scheduledTierChange?: {
    tier: SubscriptionTier;
    effectiveDate: { seconds: number };
    action: 'downgrade' | 'cancel';
  };
  referralProfile?: {
    code: string;
    isActive?: boolean;
  };
  audioCompressionEnabled?: boolean;
  autoStopRecordingEnabled?: boolean;
  anonymizationRules?: AnonymizationRule[];
  transcriptionQuality?: 'fast' | 'balanced' | 'accurate';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  }

// Helper function to convert Firestore timestamp to Date
const convertTimestampToDate = (timestamp: { seconds: number } | Date | undefined): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp.seconds * 1000);
};

// Utility function for copying text to clipboard

// Email helper functions moved inside App component to access translation function

// --- i18n ---
import { translations } from './src/locales';
import { subscriptionService } from './src/subscriptionService';
import { tokenCounter } from './src/tokenCounter';
import { tokenManager } from './src/utils/tokenManager';
import UpgradeModal from './src/components/UpgradeModal.tsx';
import SummaryQuestionsModal from './src/components/SummaryQuestionsModal.tsx';
import PricingPage from './src/components/PricingPage.tsx';
import FAQPage from './src/components/FAQPage.tsx';
import ReferralInfoPage from './src/components/ReferralInfoPage.tsx';
import ReferralDashboard from './src/components/ReferralDashboard.tsx';
import ReferralSignupModal from './src/components/ReferralSignupModal.tsx';
import ReferralRegistrationModal from './src/components/ReferralRegistrationModal.tsx';
import IdeaBuilderModal from './src/components/IdeaBuilderModal.tsx';
import { generateReferralCode, buildReferralJoinUrl, maskEmail } from './src/utils/referral';
import { validatePayPalMeLink } from './src/utils/paypal';

// Hamburger Menu Component
const HamburgerMenu: React.FC<{
  isOpen: boolean;
  onToggle: () => void;
  user: any;
  onLogout: () => void;
  onShowSettings: () => void;
  onShowPricing: () => void;
  onShowFAQ: () => void;
  onShowReferralInfo: () => void;
  onShowReferralDashboard: () => void;
  t: TranslationFunction;
  theme: 'light' | 'dark';
  userTier: SubscriptionTier;
  showUsageModal: boolean;
  setShowUsageModal: (show: boolean) => void;
}> = ({ isOpen, onToggle, user, onLogout, onShowSettings, onShowPricing, onShowFAQ, onShowReferralInfo, onShowReferralDashboard, t, theme, userTier, showUsageModal, setShowUsageModal }) => {
  return (
    <div className="relative">
      {/* Hamburger Menu Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'dark'
            ? 'text-gray-300 hover:text-white hover:bg-gray-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        aria-label="Menu"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={onToggle}
          />
          
          {/* Menu Content */}
          <div className={`hamburger-menu-content absolute right-0 sm:right-0 left-0 sm:left-auto top-full mt-2 w-64 rounded-lg shadow-lg z-50 ${
            theme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}>
            <div className="py-2">
              {/* Usage */}
              {user && (
                <button
                  onClick={() => {
                    setShowUsageModal(true);
                    onToggle();
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <ChartBarIcon className="w-5 h-5" />
                  <span>{t('usage')}</span>
                </button>
              )}

              {/* Settings (only when logged in) */}
              {user && (
                <button
                  onClick={() => {
                    onShowSettings();
                    onToggle();
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span>{t('settings')}</span>
                </button>
              )}

              {/* Pricing */}
              <button
                onClick={() => {
                  onShowPricing();
                  onToggle();
                }}
                className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <CreditCardIcon className="w-5 h-5" />
                <span>{t('pricing')}</span>
              </button>

              {/* FAQ */}
              <button
                onClick={() => {
                  onShowFAQ();
                  onToggle();
                }}
                className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <QuestionMarkIcon className="w-5 h-5" />
                <span>{t('faq')}</span>
              </button>

              {/* Referral Program (only when logged in) */}
              {user && (
                <div className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="px-4 py-2 text-xs uppercase opacity-70">{t('referralProgramTitle', 'Referral programma')}</div>
                  <button
                    onClick={() => {
                      onShowReferralInfo();
                      onToggle();
                    }}
                    className={`w-full px-4 py-2 text-left transition-colors ${
                      theme === 'dark' ? 'hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {t('referralWhatIsIt', 'Wat is het')}
                  </button>
                  <button
                    onClick={() => {
                      onShowReferralDashboard();
                      onToggle();
                    }}
                    className={`w-full px-4 py-2 text-left transition-colors ${
                      theme === 'dark' ? 'hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {t('referralDashboardTitle', 'Mijn dashboard')}
                  </button>
                </div>
              )}

              {/* Logout */}
              {user && (
                <>
                  <div className={`border-t my-2 ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`} />
                  <button
                    onClick={() => {
                      onLogout();
                      onToggle();
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${
                      theme === 'dark'
                        ? 'text-red-400 hover:bg-gray-700 hover:text-red-300'
                        : 'text-red-600 hover:bg-gray-50 hover:text-red-700'
                    }`}
                  >
                    <LogoutIcon className="w-5 h-5" />
                    <span>{t('logout')}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

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
    // Read persisted UI language from localStorage. Prefer 'uiLanguage' but support legacy key 'uiLang'.
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedLangNew = window.localStorage.getItem('uiLanguage') as 'nl' | 'en' | 'pt' | 'de' | 'fr' | 'es' | null;
      const savedLangLegacy = window.localStorage.getItem('uiLang') as 'nl' | 'en' | 'pt' | 'de' | 'fr' | 'es' | null;
      if (savedLangNew) return savedLangNew;
      if (savedLangLegacy) return savedLangLegacy;
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
  const [transcript, setTranscript] = useState<string>('Dit is een test transcript voor het testen van de knop functionaliteit. We gaan kijken of alle knoppen correct werken na de fix van de infinite re-render loop.');
  

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
  
  
  // New dropdown navigation state
  const [mainMode, setMainMode] = useState<'transcript' | 'analysis' | 'actions'>('transcript');
  // Default to no analysis selected so the secondary dropdown shows the placeholder
  const [selectedAnalysis, setSelectedAnalysis] = useState<ViewType | null>(null);
  const [loadingText, setLoadingText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [showActionButtons, setShowActionButtons] = useState<boolean>(false);
  const [showImageActionButtons, setShowImageActionButtons] = useState<boolean>(false);
  const actionButtonsRef = useRef<HTMLDivElement>(null);

  
  // Close action buttons when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if (actionButtonsRef.current && !actionButtonsRef.current.contains(targetNode)) {
        setShowActionButtons(false);
        setShowImageActionButtons(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showChatMoveToTranscriptModal, setShowChatMoveToTranscriptModal] = useState<boolean>(false);
  const [showBusinessCaseMoveToTranscriptModal, setShowBusinessCaseMoveToTranscriptModal] = useState<boolean>(false);
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCachedTabContent, resetTabCache, isTabCached } = useTabCache();

  // Clear topic cache function for session changes
  const clearTopicCache = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(window.localStorage);
        keys.forEach(key => {
          if (key.startsWith('rh_topics:')) {
            window.localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to clear topic cache:', error);
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Don't close if clicking on the menu button or menu content
      if (target.closest('[aria-label="Menu"]') || target.closest('.hamburger-menu-content')) {
        return;
      }
      setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

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
    // Initialize Mermaid for current theme so SVG rendering works reliably
    (async () => { try { await getMermaid(theme); } catch {} })();
  }, [theme]);

  // Re-render mindmap SVG when Mermaid text or theme changes
  useEffect(() => {
    if (!mindmapMermaid) { setMindmapSvg(''); return; }
    let cancelled = false;
    (async () => {
      const svg = await renderMindmapSvg(mindmapMermaid, theme);
      if (!cancelled && svg) setMindmapSvg(svg);
    })();
    return () => { cancelled = true; };
  }, [mindmapMermaid, theme]);
  
  // PPT Template state
  const [pptTemplate, setPptTemplate] = useState<File | null>(null);
  const [showPptOptions, setShowPptOptions] = useState(false);
  
  // Summary options state
  const [summaryOptions, setSummaryOptions] = useState<SummaryOptions>({
    format: 'paragraph',
    targetAudience: 'general',
    toneStyle: 'neutral',
    length: 'medium',
    mainGoal: ''
  });

  
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
  const audioUploadModal = useModalState();
  const audioUploadHelpModal = useModalState();
  const notionImportModal = useModalState();
  const expertConfigModal = useModalState();
  const expertChatModal = useModalState();
  const expertHelpModal = useModalState();
  const ideaBuilderModal = useModalState();
  const subscriptionSuccessModal = useModalState();
  const customerPortalModal = useModalState();
  const anonymizationSavedModal = useModalState();
  const notionIntegrationHelpModal = useModalState();
  const summaryQuestionsModal = useModalState();

  // Removed: prompts import feature and related UI/state
  
  // Usage Modal state
  const [showUsageModal, setShowUsageModal] = useState(false);
  
  // Auth state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });

  // Auth and token management - use authState.user instead of auth.currentUser for consistency
  const user = authState.user;
  const lastAuthLogRef = useRef<{ uid: string | null; isLoading: boolean } | null>(null);
  
  // Debug: Log auth state changes only when it changes
  useEffect(() => {
    const current = { uid: user?.uid || null, isLoading: authState.isLoading };
    const last = lastAuthLogRef.current;
    if (!last || last.uid !== current.uid || last.isLoading !== current.isLoading) {
      console.log('Auth state:', { user: current.uid || 'null', isLoading: current.isLoading });
      lastAuthLogRef.current = current;
    }
  }, [user?.uid, authState.isLoading]);
  
  // Session management state
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isManualLogout, setIsManualLogout] = useState<boolean>(false);
  
  // Session logout handler
  const handleSessionExpired = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentSession(null);
      setSessionId('');
      setAuthState({ user: null, isLoading: false });
      // Only show session expired message if it's not a manual logout
      if (!isManualLogout) {
        displayToast(t('sessionExpired'), 'info');
      }
      // Reset the manual logout flag
      setIsManualLogout(false);
    } catch (error) {
      const userError = errorHandler.handleError(error, ErrorType.SESSION, {
        userId: currentSession?.userId,
        sessionId: sessionId
      });
      displayToast(userError.message, 'error');
    }
  }, [t, currentSession, sessionId, isManualLogout]);
  
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
  
  // Idea Builder help modal state
  const [isIdeaBuilderHelpOpen, setIsIdeaBuilderHelpOpen] = useState<boolean>(false);
  
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

  const generateSocialPost = async (analysisType: 'socialPost' | 'socialPostX', content: string, postCount: number = 1) => {
    setIsGenerating(true);
    try {
      // Get platform-specific settings
      const platform = socialPostOptions.platform;
      const tone = socialPostOptions.tone;
      const length = socialPostOptions.length;
      const includeHashtags = socialPostOptions.includeHashtags;
      const includeEmoticons = socialPostOptions.includeEmoticons;
      
      // Define platform-specific constraints
      const platformConstraints = {
        'X / BlueSky': { maxChars: 280, minChars: 50 },
        'LinkedIn': { maxChars: 3000, minChars: 400 },
        'Facebook': { maxChars: 2000, minChars: 200 },
        'Instagram': { maxChars: 2200, minChars: 150 }
      };
      
      const constraints = platformConstraints[platform] || platformConstraints['LinkedIn'];
      
      // Adjust length based on user preference with strict character counts
      let targetLength = constraints.minChars;
      let maxLength = constraints.maxChars;
      
      if (length === 'short') {
        targetLength = 150;
        maxLength = 200;
      } else if (length === 'medium') {
        targetLength = 200;
        maxLength = 500;
      } else if (length === 'long') {
        targetLength = 500;
        maxLength = 1000;
      }
      // Enforce platform-specific limits strictly
      maxLength = Math.min(maxLength, constraints.maxChars);
      targetLength = Math.max(targetLength, constraints.minChars);
      
      // Define comprehensive tone instructions
      const toneInstructions = {
        'professional': 'Gebruik een professionele, zakelijke toon. Formeel maar toegankelijk. Vermijd jargon.',
        'friendly': 'Gebruik een vriendelijke, warme toon. Persoonlijk en uitnodigend. Spreek de lezer direct aan.',
        'enthusiastic': 'Gebruik een enthousiaste, energieke toon. Positief en motiverend. Gebruik actieve taal.',
        'informative': 'Gebruik een informatieve, educatieve toon. Helder en feitelijk. Focus op kennis overdracht.',
        'humor': 'Gebruik een humoristische toon. Luchtig en grappig, maar blijf professioneel. Vermijd controversiële humor.',
        'factual': 'Gebruik een feitelijke, objectieve toon. Neutraal en gebaseerd op feiten. Vermijd emotionele taal.'
      };
      
      // Define platform-specific guidelines
      const platformGuidelines = {
        'X / BlueSky': 'Kort en krachtig. Gebruik hashtags spaarzaam. Focus op één kernboodschap.',
        'LinkedIn': 'Professioneel en waardevol. Gebruik storytelling. Eindig met een vraag of call-to-action.',
        'Facebook': 'Persoonlijk en engaging. Gebruik emoties. Moedig interactie aan.',
        'Instagram': 'Visueel en inspirerend. Gebruik relevante hashtags. Focus op lifestyle en inspiratie.'
      };
      
      const stamp = (() => {
        const d = recordingStartMs ? new Date(recordingStartMs) : new Date();
        return d.toLocaleString('nl-NL');
      })();
      
      const posts: string[] = [];
      // Enforce single post for non X/BlueSky platforms
      const seriesCount = platform === 'X / BlueSky' ? postCount : 1;
      const providerTier = (userSubscription as unknown as SubscriptionTier);
      
      if (seriesCount === 1) {
        // SINGLE POST GENERATION - Strikte instructies voor één bericht
        const prompt = `Maak één ${platform} bericht in het Nederlands van de volgende tekst.

TOON: ${toneInstructions[tone]}
PLATFORM RICHTLIJNEN: ${platformGuidelines[platform]}
LENGTE: Het bericht moet tussen ${targetLength} en ${maxLength} karakters lang zijn. Streef naar een lengte binnen 5% van ${targetLength} karakters en GA NIET onder ${Math.floor(targetLength * 0.9)} karakters.

ABSOLUTE VEREISTEN:
- NOOIT beginnen met "Podcast transcriptie", datum informatie of metadata
- Focus ALLEEN op de kerninhoud en belangrijkste inzichten
- Maak het bericht actionable en waardevol voor de lezer
- Gebruik concrete details en voorbeelden uit de tekst
- ${includeHashtags ? 'Voeg 2-4 relevante hashtags toe aan het einde' : 'Gebruik GEEN hashtags'}
- ${includeEmoticons ? 'Gebruik passende emoticons om het bericht levendiger te maken (2-4 emoticons verspreid door de tekst)' : 'Gebruik GEEN emoticons'}
- NOOIT landcodes zoals "NL", "DE", "EN" toevoegen
- Geen technische codes, timestamps of metadata
- Vermijd clichés en algemene uitspraken
- Gebruik actieve zinnen en concrete taal
- Begin met een pakkende openingszin
- Eindig met een call-to-action of vraag

KARAKTERTELLING: Tel de karakters en zorg dat het bericht strikt tussen ${targetLength}-${maxLength} karakters valt, bij voorkeur binnen 5% van ${targetLength}. Als het korter dreigt te worden: voeg concrete details toe (geen fluff) zodat het aan de minimumlengte voldoet.

Tekst: ${content}`;

        // Validate token usage
        if (!user) {
          throw new Error('Je moet ingelogd zijn om social media posts te genereren.');
        }
        const tokenEstimate = tokenManager.estimateTokens(prompt, 1.2);
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, tokenEstimate.totalTokens);
        
        if (!tokenValidation.allowed) {
          throw new Error(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
        }

        // Use the same AI approach as other analyses - direct Google Gemini with tier-based model
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = await getModelForUser(authState.user?.uid || "", "analysisGeneration");
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
        
        const result = response.text.trim();
        posts.push(result);
        
      } else {
        // MULTIPLE POSTS GENERATION - JSON formaat voor meerdere berichten
        const prompt = `Maak ${seriesCount} ${platform} berichten in het Nederlands van de volgende tekst. Splits de inhoud logisch op over ${seriesCount} berichten als een samenhangende serie waarbij elk bericht voortbouwt op het vorige en samen één geheel vormt. Verwijs subtiel naar het vorige/de volgende post zodat lezers het als serie herkennen (zonder metadata). 

TOON: ${toneInstructions[tone]}
PLATFORM RICHTLIJNEN: ${platformGuidelines[platform]}
LENGTE: Elk bericht moet tussen ${targetLength} en ${maxLength} karakters lang zijn. Streef per bericht naar een lengte binnen 5% van ${targetLength} karakters en GA NIET onder ${Math.floor(targetLength * 0.9)} karakters.

ABSOLUTE VEREISTEN:
- NOOIT beginnen met "Podcast transcriptie", datum informatie of metadata
- Focus ALLEEN op de kerninhoud en belangrijkste inzichten
- Maak elk bericht actionable en waardevol voor de lezer
- Gebruik concrete details en voorbeelden uit de tekst
- ${includeHashtags ? 'Voeg 2-4 relevante hashtags toe aan elk bericht' : 'Gebruik GEEN hashtags'}
- ${includeEmoticons ? 'Gebruik passende emoticons om elk bericht levendiger te maken (2-4 emoticons verspreid door elk bericht)' : 'Gebruik GEEN emoticons'}
- NOOIT landcodes zoals "NL", "DE", "EN" toevoegen
- Geen technische codes, timestamps of metadata
- Vermijd clichés en algemene uitspraken
- Gebruik actieve zinnen en concrete taal
- Zorg voor logische flow tussen berichten
- Eerste bericht: pakkende introductie
- Laatste bericht: sterke conclusie of call-to-action

KARAKTERTELLING: Tel de karakters van elk bericht en zorg dat elk bericht strikt tussen ${targetLength}-${maxLength} karakters valt, bij voorkeur binnen 5% van ${targetLength}. Als een bericht korter dreigt te zijn: voeg concrete details toe (geen fluff) zodat het aan de minimumlengte voldoet.

VERPLICHT JSON FORMAAT:
Geef je antwoord terug in dit exacte JSON formaat:
{
  "posts": [
    "Bericht 1 tekst hier...",
    "Bericht 2 tekst hier...",
    "Bericht 3 tekst hier..."
  ]
}

Tekst: ${content}`;

        // Validate token usage
        if (!user) {
          throw new Error('Je moet ingelogd zijn om social media posts te genereren.');
        }
        const tokenEstimate = tokenManager.estimateTokens(prompt, 1.2);
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, tokenEstimate.totalTokens);
        
        if (!tokenValidation.allowed) {
          throw new Error(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
        }

        // Use the same AI approach as other analyses - direct Google Gemini with tier-based model
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = await getModelForUser(authState.user?.uid || "", "analysisGeneration");
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
        
        // Parse JSON response
        try {
          const result = response.text.trim();
          
          // Extract JSON from response
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No JSON found in AI response');
          }
          
          const jsonData = JSON.parse(jsonMatch[0]);
          if (!jsonData.posts || !Array.isArray(jsonData.posts)) {
            throw new Error('Invalid JSON structure in AI response');
          }
          
          // Add posts with numbering
          jsonData.posts.forEach((post: string, index: number) => {
            const numberedPost = `${index + 1}/${seriesCount} ${post.trim()}`;
            posts.push(numberedPost);
          });
          
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          // Fallback: split response by lines or paragraphs
          const result = response.text.trim();
          const fallbackPosts = result.split(/\n\s*\n/).filter(p => p.trim()).slice(0, seriesCount);
          fallbackPosts.forEach((post: string, index: number) => {
            const numberedPost = `${index + 1}/${seriesCount} ${post.trim()}`;
            posts.push(numberedPost);
          });
        }
      }

      // Save results
      const socialPostResult = {
        post: posts.length === 1 ? posts[0] : posts,
        timestamp: stamp,
        platform: platform,
        imageInstructions: undefined,
      };

      
      if (analysisType === 'socialPostX') {
        setSocialPostXData(socialPostResult);
      } else {
        setSocialPostData({
          post: Array.isArray(socialPostResult.post) ? socialPostResult.post.join('\n\n') : socialPostResult.post,
          timestamp: socialPostResult.timestamp,
          platform: socialPostResult.platform,
          imageInstructions: socialPostResult.imageInstructions,
        });
      }

    } catch (error: any) {
      // Parse status code and retry delay from API error
      const rawMessage = typeof error?.message === 'string' ? error.message : '';
      let statusCode: number | undefined = (error as any)?.statusCode || (error as any)?.code;
      let retryDelaySec: number | undefined;

      if (!statusCode && rawMessage) {
        try {
          const jsonStart = rawMessage.indexOf('{');
          if (jsonStart >= 0) {
            const parsed = JSON.parse(rawMessage.slice(jsonStart));
            statusCode = parsed?.error?.code;
            const details = Array.isArray(parsed?.error?.details) ? parsed.error.details : [];
            const retryInfo = details.find((d: any) => (d['@type'] || '').includes('RetryInfo'));
            const retryDelay = retryInfo?.retryDelay;
            if (typeof retryDelay === 'string') {
              const m = /([0-9]+)s/.exec(retryDelay);
              if (m) retryDelaySec = parseInt(m[1], 10);
            }
          }
        } catch {
          // Ignore JSON parse errors
        }
      }

      // Error handling
      const isRateLimit = statusCode === 429;
      
      // Check if this is a quota exceeded error that should show the modal
      const isQuotaExceeded = isRateLimit && (
        rawMessage.includes('quota') || 
        rawMessage.includes('free_tier_requests') ||
        rawMessage.includes('You exceeded your current quota')
      );
      
      if (isQuotaExceeded) {
        // Show quota exceeded modal instead of toast
        setQuotaExceededError(rawMessage);
        setShowQuotaExceededModal(true);
      } else {
        // Handle other errors normally
        const userError = isRateLimit
          ? errorHandler.handleApiError(error as any, 429, { endpoint: 'AI generateContent' })
          : errorHandler.handleError(error as any, ErrorType.UNKNOWN, { additionalContext: { context: 'generateSocialPost', message: t('errorGeneratingSocialPost') } });

        const delayText = retryDelaySec ? ` Wacht ${retryDelaySec}s en probeer opnieuw.` : '';
        const displayMessage = isRateLimit
          ? `Error: Rate limit bereikt.${delayText}`
          : `Error: ${userError.message}`;

        displayToast(displayMessage, 'error');
      }
      
      console.error('Error generating social post:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async (postContent: string, analysisType: 'socialPost' | 'socialPostX') => {
    // Check subscription level
    if (!['gold', 'diamond', 'enterprise'].includes(userSubscription.toLowerCase())) {
      setShowImageGenerationModal(true);
      return;
    }

    if (!postContent.trim()) {
      displayToast(t('noPostContentForImage', 'Geen post content beschikbaar voor afbeelding generatie'), 'error');
      return;
    }

    // Set generating state
    setIsGeneratingImage(true);

    try {
      if (!apiKey) {
        displayToast('API key niet beschikbaar. Neem contact op met de administrator.', 'error');
        setIsGeneratingImage(false);
        return;
      }

      // Validate token usage for image generation
      const styleText = imageGenerationStyle === 'infographic' ? t('imageStyleInfographic') : 
                       imageGenerationStyle === 'drawing' ? t('imageStyleDrawing') : 
                       t('imageStyleRealistic');
      const colorText = imageGenerationColor === 'blackwhite' ? t('imageColorBlackWhite') : 
                       imageGenerationColor === 'color' ? t('imageColorColor') : 
                       t('imageColorVibrant');

      const imagePrompt = `Create a ${styleText.toLowerCase()} style image in ${colorText.toLowerCase()} that visually represents this social media post: "${postContent}". The image should be suitable for ${analysisType === 'socialPost' ? 'LinkedIn' : 'X/BlueSky'} and complement the message effectively.`;
      
      if (!user) {
        throw new Error('Je moet ingelogd zijn om afbeeldingen te genereren.');
      }
      const tokenEstimate = tokenManager.estimateTokens(imagePrompt, 1.2);
      const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, tokenEstimate.totalTokens);
      
      if (!tokenValidation.allowed) {
        displayToast(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.', 'error');
        setIsGeneratingImage(false);
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
      }

      // Store the generated prompt for display
      setGeneratedImagePrompt(imagePrompt);

      // Update the social post data with image instruction
      const imageInstruction = `Generate an image with the following specifications:
Style: ${styleText}
Color: ${colorText}
Content: ${postContent}

Prompt for AI image generator: ${imagePrompt}`;

      if (analysisType === 'socialPostX') {
        setSocialPostXData(prev => prev ? { ...prev, imageInstructions: imageInstruction } : null);
      } else {
        setSocialPostData(prev => prev ? { ...prev, imageInstructions: imageInstruction } : null);
      }

      // Record token usage
      try {
        if (user) {
          await tokenManager.recordTokenUsage(user.uid, tokenEstimate.totalTokens, 0);
        }
      } catch (error) {
        console.error('Error recording token usage:', error);
      }

    } catch (error: any) {
      console.error('Error generating image instruction:', error);
      displayToast(t('errorGeneratingImage', 'Fout bij genereren afbeelding instructie'), 'error');
    } finally {
      setIsGeneratingImage(false);
    }
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  // API key storage preference removed - all keys now stored in database only
  const [executiveSummaryData, setExecutiveSummaryData] = useState<ExecutiveSummaryData | null>(null);
  const [storytellingData, setStorytellingData] = useState<StorytellingData | null>(null);
  const [businessCaseData, setBusinessCaseData] = useState<BusinessCaseData | null>(null);
  
  // Additional Specials state (all variables already declared above)
  // Explain state
  const [explainData, setExplainData] = useState<ExplainData | null>(null);
  const [explainOptions, setExplainOptions] = useState<ExplainOptions>({ 
    complexityLevel: t('explainComplexityGeneral'), 
    focusArea: t('explainFocusGeneral'), 
    format: t('explainFormatShort') 
  });
  
  // Shared topics state for both TeachMe and ShowMe
  const [sharedTopics, setSharedTopics] = useState<TeachMeTopic[]>([]);
  const [isGeneratingSharedTopics, setIsGeneratingSharedTopics] = useState(false);
  
  // TeachMe state
  const [teachMeSelectedTopic, setTeachMeSelectedTopic] = useState<TeachMeTopic | null>(null);
  const [teachMeSelectedMethod, setTeachMeSelectedMethod] = useState<TeachMeMethod | null>(null);
  const [teachMeData, setTeachMeData] = useState<TeachMeData | null>(null);
  const [teachMeStep, setTeachMeStep] = useState<'topics' | 'methods' | 'content' | 'methodSelection' | 'topicSelection' | 'contentDisplay'>('topics');
  const [isGeneratingTeachMe, setIsGeneratingTeachMe] = useState(false);
  
  // ShowMe state
  const [showMeSelectedTopic, setShowMeSelectedTopic] = useState<TeachMeTopic | null>(null);
  const [showMeData, setShowMeData] = useState<ShowMeData | null>(null);
  const [isGeneratingShowMe, setIsGeneratingShowMe] = useState(false);
  const [isSearchingShowMeContent, setIsSearchingShowMeContent] = useState(false);
  
  // Thinking Partner state
  const [thinkingPartnerAnalysis, setThinkingPartnerAnalysis] = useState<string>('');
  const [selectedThinkingPartnerTopic, setSelectedThinkingPartnerTopic] = useState<string>('');
  const [selectedThinkingPartner, setSelectedThinkingPartner] = useState<{ name: string } | null>(null);
  
  // Opportunities state
  const [opportunitiesData, setOpportunitiesData] = useState<import('./src/components/OpportunitiesTab').OpportunityAnalysisData | null>(null);

  // McKinsey state
  const [mckinseyAnalysis, setMckinseyAnalysis] = useState<import('./src/components/McKinseyTab').McKinseyAnalysisData | null>(null);
  const [selectedMckinseyTopic, setSelectedMckinseyTopic] = useState<string>('');
  const [selectedMckinseyRole, setSelectedMckinseyRole] = useState<string>('');
  const [selectedMckinseyFramework, setSelectedMckinseyFramework] = useState<string>('');

  // Social media post options state
  const [socialPostOptions, setSocialPostOptions] = useState<SocialPostOptions>({
    platform: 'X / BlueSky',
    tone: 'informative',
    length: 'short',
    includeHashtags: true,
    includeEmoticons: false,
    postCount: 1
  });
  // Quiz state
  
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [quizIncludeAnswers, setQuizIncludeAnswers] = useState<boolean>(false);
  const [quizNumQuestions, setQuizNumQuestions] = useState<number>(2);
  const [quizNumOptions, setQuizNumOptions] = useState<2 | 3 | 4>(3);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // TeachMe learning methods configuration
  const teachMeMethods: TeachMeMethod[] = [
    { id: 'useAnalogies', name: t('teachMeMethodUseAnalogies'), description: t('teachMeMethodUseAnalogiesDesc'), prompt: 'Compare [topic] to something familiar or seemingly unrelated to make it easier to understand. What analogy helps clarify its function or concept?' },
    { id: 'breakMyths', name: t('teachMeMethodBreakMyths'), description: t('teachMeMethodBreakMythsDesc'), prompt: 'Identify three common misconceptions about [topic]. For each misconception, explain the truth behind it.' },
    { id: 'relateToRealLife', name: t('teachMeMethodRelateToRealLife'), description: t('teachMeMethodRelateToRealLifeDesc'), prompt: 'Explain how [topic] connects to daily life or a practical situation you might encounter. Provide a specific, relatable example.' },
    { id: 'teachItBack', name: t('teachMeMethodTeachItBack'), description: t('teachMeMethodTeachItBackDesc'), prompt: 'Imagine you need to teach [topic] to someone who knows nothing about it. Outline how you would explain it, starting from the basics.' },
    { id: 'askCriticalWhy', name: t('teachMeMethodAskCriticalWhy'), description: t('teachMeMethodAskCriticalWhyDesc'), prompt: 'Why does [topic] matter? What are its key implications or significance within its field or in a broader context?' },
    { id: 'simulateOrPractice', name: t('teachMeMethodSimulateOrPractice'), description: t('teachMeMethodSimulateOrPracticeDesc'), prompt: 'Give a simple example, scenario, or exercise where you can apply [topic] right now. Describe the application.' },
    { id: 'turnIntoStory', name: t('teachMeMethodTurnIntoStory'), description: t('teachMeMethodTurnIntoStoryDesc'), prompt: 'Write a short story or scenario where [topic] is applied in a relatable context. Focus on how the topic plays a role in the narrative.' },
    { id: 'challengeIt', name: t('teachMeMethodChallengeIt'), description: t('teachMeMethodChallengeItDesc'), prompt: 'What are the common misunderstandings or mistakes people make about [topic]? How can you avoid them?' },
    { id: 'prioritizeLearning', name: t('teachMeMethodPrioritizeLearning'), description: t('teachMeMethodPrioritizeLearningDesc'), prompt: 'What are the 2-3 most important concepts in [topic] that you should focus on first to build a strong foundation?' },
    { id: 'findTheGaps', name: t('teachMeMethodFindTheGaps'), description: t('teachMeMethodFindTheGapsDesc'), prompt: 'What are the most overlooked aspects of [topic] that are crucial to understanding it? What details might people miss?' },
    { id: 'identifyCorePrinciples', name: t('teachMeMethodIdentifyCorePrinciples'), description: t('teachMeMethodIdentifyCorePrinciplesDesc'), prompt: 'What are the fundamental principles or laws that govern [topic]? List them and briefly explain each one.' },
    { id: 'explainEvolutionHistory', name: t('teachMeMethodExplainEvolutionHistory'), description: t('teachMeMethodExplainEvolutionHistoryDesc'), prompt: 'Describe the historical evolution or development of [topic]. How has it changed over time, and what were the key milestones or figures?' },
    { id: 'predictFutureImplications', name: t('teachMeMethodPredictFutureImplications'), description: t('teachMeMethodPredictFutureImplicationsDesc'), prompt: 'Based on your understanding of [topic], what are its potential future implications, advancements, or challenges?' },
    { id: 'identifyStakeholdersUsers', name: t('teachMeMethodIdentifyStakeholdersUsers'), description: t('teachMeMethodIdentifyStakeholdersUsersDesc'), prompt: 'Who are the main stakeholders, users, or beneficiaries of [topic]? How does it affect different groups of people or entities?' },
    { id: 'exploreEthicalConsiderations', name: t('teachMeMethodExploreEthicalConsiderations'), description: t('teachMeMethodExploreEthicalConsiderationsDesc'), prompt: 'What are the main ethical considerations or dilemmas associated with [topic]? How might these be addressed?' },
    { id: 'summarizeKeyDebatesControversies', name: t('teachMeMethodSummarizeKeyDebatesControversies'), description: t('teachMeMethodSummarizeKeyDebatesControversiesDesc'), prompt: 'What are the key debates, controversies, or differing viewpoints surrounding [topic]? Summarize the main arguments from different perspectives.' },
    { id: 'summarizeKeyTheoriesModels', name: t('teachMeMethodSummarizeKeyTheoriesModels'), description: t('teachMeMethodSummarizeKeyTheoriesModelsDesc'), prompt: 'What are the most important theories, models, or frameworks associated with [topic]? Summarize each one briefly.' },
    { id: 'discussLimitationsConstraints', name: t('teachMeMethodDiscussLimitationsConstraints'), description: t('teachMeMethodDiscussLimitationsConstraintsDesc'), prompt: 'What are the known limitations, constraints, or boundaries of [topic]? Where does its applicability end or become challenging?' },
    { id: 'defineKeyTerminology', name: t('teachMeMethodDefineKeyTerminology'), description: t('teachMeMethodDefineKeyTerminologyDesc'), prompt: 'Define 3-5 essential technical terms or jargon critical to understanding [topic]. Explain why each term is important.' },
    { id: 'createLearningExercises', name: t('teachMeMethodCreateLearningExercises'), description: t('teachMeMethodCreateLearningExercisesDesc'), prompt: 'Design 2-3 practical exercises or activities that would help someone better understand and remember [topic].' }
  ];

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
      const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
      const inputLanguage = getGeminiCode(language || 'en');
      const outputLanguageCode = getGeminiCode(outputLang || language || 'en');
      const sys = `You generate MCQs based on a transcript.

Return ONLY a JSON array of objects with keys:
- question (string)
- options (array of {label, text})
- correct_answer_label
- correct_answer_text

Constraints:
- Ensure exactly one correct answer per question.
- Labels are A, B, C, D but limited to requested count.
- Output language for question and option text: ${outputLanguageCode}.`;
      const prompt = `${sys}\n\nConstraints: number_of_questions=${quizNumQuestions}, number_of_options=${quizNumOptions}.\nTranscript (input language: ${inputLanguage}):\n${getTranscriptSlice(transcript, 18000)}`;
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

  const handleGenerateBusinessCase = async (
    businessCaseType?: string,
    targetAudienceArg?: string,
    businessCaseLengthArg?: 'concise' | 'extensive' | 'very_extensive'
  ) => {
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
      const targetAudience = (targetAudienceArg || businessCaseData?.targetAudience || '').trim();
      const lengthChoice: 'concise' | 'extensive' | 'very_extensive' = businessCaseLengthArg || (businessCaseData?.length as any) || 'concise';
      
      // Don't reset other analysis data when generating business case
      setLoadingText(t('generating', { type: 'Business Case' }));
      
      // Validate and sanitize transcript input before prompting the AI
      const { validateAndSanitizeForAI, sanitizeTextInput } = await import('./src/utils/security');
      const rawTranscriptSlice = getTranscriptSlice(transcript, 20000);
      const transcriptValidationForAI = validateAndSanitizeForAI(rawTranscriptSlice, 20000);
      if (!transcriptValidationForAI.isValid) {
        displayToast(`Error: ${transcriptValidationForAI.error || t('inputInvalid', 'Transcript input is invalid')}`, 'error');
        setLoadingText('');
        return;
      }
      const sanitizedTranscript = transcriptValidationForAI.sanitized;

      // Language configuration for output control
      const inputLanguage = getGeminiCode(language || 'en');
      const outputLanguage = getGeminiCode(outputLang || language || 'en');

      // Strict length guidance based on selected length, localized via translation files
      const strictLengthInstructionMap: Record<'concise' | 'extensive' | 'very_extensive', string> = {
        concise: t('businessCaseLengthGuidance.concise', 'BE STRICT: Write a concise business case of 300-450 words. Do not exceed.'),
        extensive: t('businessCaseLengthGuidance.extensive', 'BE STRICT: Write an extensive business case of 700-1000 words.'),
        very_extensive: t('businessCaseLengthGuidance.very_extensive', 'BE STRICT: Write a very extensive business case of 1200-1600 words.')
      };

      const safeAudience = sanitizeTextInput(targetAudience || '');

      // Validate token usage for business case generation (estimate using the actual prompt shape)
      const businessCasePrompt = `Je bent een ervaren business consultant. Schrijf een overtuigende business case op basis van het transcript.\n\nOutput taal: ${outputLanguage} (schrijf de volledige business case in deze taal).\n\nDe business case moet de volgende structuur hebben:\n\n- Titel\n- Probleem\n- Oplossing\n- Verwachte Impact (kwantitatief en kwalitatief)\n- Kosten/Baten analyse\n- Conclusie (waarom deze business case waardevol is)\n\nSchrijf helder, zakelijk en overtuigend.\n\nBusiness Case Type: ${type}\n${safeAudience ? `${t('businessCaseTargetAudienceLabel', 'Target Audience / Stakeholders')}: ${safeAudience}\n` : ''}${t('businessCaseLength', 'Length')}: ${t(`businessCaseLengthOptions.${lengthChoice}` as any, lengthChoice)}\n${strictLengthInstructionMap[lengthChoice]}\n\nTranscript (input taal: ${inputLanguage}):\n${sanitizedTranscript}`;
      const tokenEstimate = tokenManager.estimateTokens(businessCasePrompt, 1.5);
      const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, tokenEstimate.totalTokens);
      
      if (!tokenValidation.allowed) {
        displayToast(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        setLoadingText('');
        return;
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const modelName = await getModelForUser(authState.user?.uid || "", "businessCase");
      
      const businessCaseTypeDefinitions: { id: string; name: string; description: string }[] = [
        { id: 'costSavings', name: t('costSavings', 'Cost savings'), description: t('costSavingsDescription', 'How the solution makes processes more efficient and reduces costs.') },
        { id: 'revenueGrowth', name: t('revenueGrowth', 'Revenue growth'), description: t('revenueGrowthDescription', 'How the solution opens new markets or increases sales.') },
        { id: 'innovation', name: t('innovation', 'Innovation'), description: t('innovationDescription', 'How the solution helps to stay ahead in the market.') },
        { id: 'riskReduction', name: t('riskReduction', 'Risk reduction'), description: t('riskReductionDescription', 'How the solution increases compliance, security or reliability.') },
        { id: 'customerSatisfaction', name: t('customerSatisfaction', 'Customer satisfaction'), description: t('customerSatisfactionDescription', 'How the solution improves the experience of customers or employees.') },
        { id: 'scalability', name: t('scalability', 'Scalability'), description: t('scalabilityDescription', 'How the solution can grow with the organization.') },
        // New expanded options
        { id: 'employeeProductivityEngagement', name: t('businessCaseTypes.employeeProductivityEngagement.name', 'Employee Productivity & Engagement'), description: t('businessCaseTypes.employeeProductivityEngagement.description', 'How the solution improves employee productivity and satisfaction.') },
        { id: 'sustainabilityCsr', name: t('businessCaseTypes.sustainabilityCsr.name', 'Sustainability & CSR'), description: t('businessCaseTypes.sustainabilityCsr.description', 'How the solution contributes to environmental goals, social responsibility, or ESG compliance.') },
        { id: 'qualityImprovement', name: t('businessCaseTypes.qualityImprovement.name', 'Quality Improvement'), description: t('businessCaseTypes.qualityImprovement.description', 'How the solution enhances the quality of products, services, or processes.') },
        { id: 'dataInsights', name: t('businessCaseTypes.dataInsights.name', 'Data & Insights'), description: t('businessCaseTypes.dataInsights.description', 'How the solution enables better data collection, analysis, and decision-making.') },
        { id: 'marketShareIncrease', name: t('businessCaseTypes.marketShareIncrease.name', 'Market Share Increase'), description: t('businessCaseTypes.marketShareIncrease.description', 'How the solution helps to capture a larger portion of the market.') },
        { id: 'brandReputationImage', name: t('businessCaseTypes.brandReputationImage.name', "Brand Reputation & Image"), description: t('businessCaseTypes.brandReputationImage.description', "How the solution strengthens the brand's image and perception.") },
        { id: 'complianceRegulation', name: t('businessCaseTypes.complianceRegulation.name', 'Compliance & Regulation'), description: t('businessCaseTypes.complianceRegulation.description', 'How the solution helps to meet legal requirements and industry standards.') },
        { id: 'flexibilityAgility', name: t('businessCaseTypes.flexibilityAgility.name', 'Flexibility & Agility'), description: t('businessCaseTypes.flexibilityAgility.description', 'How the solution makes the organization more agile to respond quickly to changes.') },
        { id: 'channelExpansion', name: t('businessCaseTypes.channelExpansion.name', 'Channel Expansion'), description: t('businessCaseTypes.channelExpansion.description', 'How the solution opens new sales or communication channels.') },
        { id: 'timeSavings', name: t('businessCaseTypes.timeSavings.name', 'Time Savings'), description: t('businessCaseTypes.timeSavings.description', 'How the solution generates significant time savings for specific tasks or teams.') },
        { id: 'resourceOptimization', name: t('businessCaseTypes.resourceOptimization.name', 'Resource Optimization'), description: t('businessCaseTypes.resourceOptimization.description', 'How the solution makes the use of resources (staff, materials, technology) more efficient.') },
        { id: 'productDifferentiation', name: t('businessCaseTypes.productDifferentiation.name', 'Product Differentiation'), description: t('businessCaseTypes.productDifferentiation.description', 'How the solution makes a product or service unique compared to competitors.') },
        { id: 'operationalEfficiency', name: t('businessCaseTypes.operationalEfficiency.name', 'Operational Efficiency'), description: t('businessCaseTypes.operationalEfficiency.description', 'How the solution improves the effectiveness and speed of operational processes.') },
        { id: 'securityDataProtection', name: t('businessCaseTypes.securityDataProtection.name', 'Security & Data Protection'), description: t('businessCaseTypes.securityDataProtection.description', 'How the solution enhances the security of data and systems.') },
        { id: 'innovationCulture', name: t('businessCaseTypes.innovationCulture.name', 'Innovation Culture'), description: t('businessCaseTypes.innovationCulture.description', 'How the solution fosters a culture of innovation and experimentation within the organization.') },
        { id: 'supplierRelationships', name: t('businessCaseTypes.supplierRelationships.name', 'Supplier Relationships'), description: t('businessCaseTypes.supplierRelationships.description', 'How the solution improves collaboration with suppliers or creates procurement advantages.') },
        { id: 'fasterTimeToMarket', name: t('businessCaseTypes.fasterTimeToMarket.name', 'Faster Time-to-Market'), description: t('businessCaseTypes.fasterTimeToMarket.description', 'How the solution shortens the time required to launch new products or services.') },
        { id: 'customerSegmentationPrecision', name: t('businessCaseTypes.customerSegmentationPrecision.name', 'Customer Segmentation Precision'), description: t('businessCaseTypes.customerSegmentationPrecision.description', 'How the solution helps to more precisely identify and target customer segments.') },
        { id: 'strategicAlignment', name: t('businessCaseTypes.strategicAlignment.name', 'Strategic Alignment'), description: t('businessCaseTypes.strategicAlignment.description', 'How the solution contributes to better alignment of projects and initiatives with the business strategy.') },
      ];

      const businessCaseTypeDescriptions = Object.fromEntries(businessCaseTypeDefinitions.map(d => [d.name, d.description]));

      // Validate provided business case type; fallback to costSavings when unknown
      const allowedTypes = new Set(Object.keys(businessCaseTypeDescriptions));
      const safeType = allowedTypes.has(type) ? type : t('costSavings');

      const sys = `Je bent een ervaren business consultant. Schrijf een overtuigende business case op basis van het transcript.
      
      Output taal: ${outputLanguage} (schrijf de volledige business case in deze taal).
      
      De business case moet de volgende structuur hebben:
      
      - Titel
      - Probleem
      - Oplossing  
      - Verwachte Impact (kwantitatief en kwalitatief)
      - Kosten/Baten analyse
      - Conclusie (waarom deze business case waardevol is)
      
      Schrijf helder, zakelijk en overtuigend.`;
      
      const prompt = `${sys}
Business Case Type: ${businessCaseTypeDescriptions[safeType as keyof typeof businessCaseTypeDescriptions] || safeType}
${safeAudience ? `${t('businessCaseTargetAudienceLabel', 'Target Audience / Stakeholders')}: ${safeAudience}
` : ''}${t('businessCaseLength', 'Length')}: ${t(`businessCaseLengthOptions.${lengthChoice}` as any, lengthChoice)}
${strictLengthInstructionMap[lengthChoice]}

Transcript (input taal: ${inputLanguage}):
${sanitizedTranscript}`;

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
        businessCaseType: safeType,
        targetAudience: safeAudience || undefined,
        length: lengthChoice,
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

  const handleSessionOptionAudioUpload = () => {
    audioUploadModal.open();
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
  const importAudioFile = async (file: File) => {
    try {
      // Validate file type
      const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/mp4', 'video/mp4', 'audio/webm', 'video/webm', 'audio/wav'];
      const isValidType = validTypes.includes(file.type) || 
                         file.type.startsWith('audio/webm') || 
                         file.type.startsWith('video/webm');
      if (!isValidType) {
        throw new Error(t('audioUploadInvalidFormat', 'Alleen MP3, MP4, WebM en WAV bestanden zijn toegestaan.'));
      }

      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        throw new Error(t('audioUploadFileTooLarge', 'Bestand is te groot. Maximum grootte is 100MB.'));
      }

      // Initialize transcription states
      setTranscriptionStatus(t('audioUploadProcessing', 'Audio bestand wordt verwerkt...'));
      setTranscriptionProgress(5);
      setIsTranscribing(true);
      setStatus(RecordingStatus.TRANSCRIBING);
      setLoadingText(t('audioUploadProcessing', 'Audio bestand wordt verwerkt...'));
      setError(null);

      // Convert file to audio chunks for transcription
      setTranscriptionStatus(t('audioUploadConverting', 'Audio bestand wordt geconverteerd...'));
      setTranscriptionProgress(15);
      
      const arrayBuffer = await file.arrayBuffer();
      const audioBlob = new Blob([arrayBuffer], { type: file.type });
      
      // Set audio chunks for transcription
      audioChunksRef.current = [audioBlob];
      
      // Update progress - ready for transcription
      setTranscriptionProgress(25);
      setTranscriptionStatus(t('audioUploadReady', 'Klaar voor transcriptie...'));
      
      // Clear previous results
      setTranscript(''); 
      setSummary(''); 
      setFaq(''); 
      setLearningDoc(''); 
      setFollowUpQuestions('');
      setBlogData(null);
      setChatHistory([]);
      setKeywordAnalysis(null);
      setSentimentAnalysisResult(null);
      setMindmapMermaid('');
      setMindmapSvg('');

      // Update progress before starting transcription
      setTranscriptionProgress(30);
      setTranscriptionStatus(t('audioUploadTranscribing', 'Audio wordt getranscribeerd...'));

      // Start transcription using existing handleTranscribe function
      await handleTranscribe();

      // Success message will be shown by handleTranscribe if successful
      if (status !== RecordingStatus.ERROR) {
        displayToast(t('audioUploadSuccess', 'Audio bestand succesvol geüpload en getranscribeerd.'), 'success');
      }
    } catch (error) {
      console.error('Audio upload error:', error);
      const errorMessage = error instanceof Error ? error.message : t('audioUploadError', 'Er is een fout opgetreden bij het uploaden van het audio bestand.');
      setError(errorMessage);
      setStatus(RecordingStatus.ERROR);
      displayToast(errorMessage, 'error');
      
      // Reset transcription states
      setIsTranscribing(false);
      setTranscriptionStatus('');
      setTranscriptionProgress(0);
      setLoadingText('');
    }
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
  const [waitlist, setWaitlist] = useState<Array<{ id: string; email: string; timestamp: number }>>([]);
  const [selectedWaitlistUsers, setSelectedWaitlistUsers] = useState<string[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistFeedback, setWaitlistFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  // COMMENTED OUT: 2FA Email confirmation state no longer needed
  // const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

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
  const [transcriptionQuality, setTranscriptionQuality] = useState<'fast' | 'balanced' | 'accurate'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('transcription_quality');
      return (saved as 'fast' | 'balanced' | 'accurate') || 'balanced';
    }
    return 'balanced';
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
  const [showAudioLimitModal, setShowAudioLimitModal] = useState(false);
  const [showQuotaExceededModal, setShowQuotaExceededModal] = useState(false);
  const [quotaExceededError, setQuotaExceededError] = useState<string>('');
  const [showPricingPage, setShowPricingPage] = useState(false);

  // Referral UI state and URL code capture
  const [showReferralInfoPage, setShowReferralInfoPage] = useState(false);
  const [showReferralDashboardPage, setShowReferralDashboardPage] = useState(false);
  const [showReferralSignupModal, setShowReferralSignupModal] = useState(false);
  const [showReferralRegistrationModal, setShowReferralRegistrationModal] = useState(false);
  const [referralCodeFromURL, setReferralCodeFromURL] = useState<string | null>(null);
  const [isValidReferralCode, setIsValidReferralCode] = useState<boolean | null>(null);
  const [referrerData, setReferrerData] = useState<any>(null);

  // Email confirmation state for secure signup flows
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string>('');
  const [confirmationContext, setConfirmationContext] = useState<'waitlist' | 'referral'>('waitlist');
  const [pendingReferralPassword, setPendingReferralPassword] = useState<string>('');

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref');
  
      
      if (refCode) {

        setReferralCodeFromURL(refCode);
        
        // Validate the referral code using server-side validation for enhanced security

        validateReferralCodeServerSide(refCode).then(({ isValid, referrerData: validationReferrerData }) => {

          setIsValidReferralCode(isValid);
          
          if (isValid && validationReferrerData) {
            setReferrerData(validationReferrerData);
          }
          
          if (isValid && !authState.user) {

            // Show info page and referral registration modal for valid codes
            setShowInfoPage(true);
            setShowReferralRegistrationModal(true);
          } else if (!isValid) {
            console.warn('[Referral] Invalid referral code:', refCode);
            displayToast(t('invalidReferralCode', 'Ongeldige referral code'), 'error');
          } else if (isValid && authState.user) {

          }
        }).catch(error => {
          console.error('[Referral] Error validating referral code:', error);
          setIsValidReferralCode(false);
        });
      } else {

      }
    } catch (e) {
      console.error('[DEBUG App] Error in referral useEffect:', e);
    }
  }, [authState.user]);

  // Debug logs for referral UI
  useEffect(() => {
    if (showReferralInfoPage) {
      // Info page opened
    }
  }, [showReferralInfoPage]);
  useEffect(() => {
    if (showReferralDashboardPage) {
      // Dashboard page opened
    }
  }, [showReferralDashboardPage]);

  const enrollReferral = async ({ paypalMeLink }: { paypalMeLink: string }): Promise<{ code: string }> => {
    if (!authState.user?.uid) throw new Error(t('mustBeLoggedIn', 'Je moet ingelogd zijn'));
    if (!validatePayPalMeLink(paypalMeLink)) throw new Error(t('referralPaypalInvalid', 'Ongeldige PayPal.Me link.'));

    try {
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) throw new Error(t('mustBeLoggedIn', 'Je moet ingelogd zijn'));

      const envBase = (import.meta as any)?.env?.VITE_FUNCTIONS_BASE_URL || '';
      const originBase = typeof window !== 'undefined' ? window.location.origin : '';
      const effectiveFunctionsBase = envBase && envBase.startsWith('http') ? envBase : originBase;
      const resp = await fetch(`${effectiveFunctionsBase}/.netlify/functions/referral-enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paypalMeLink })
      });

      if (!resp.ok) {
        const msg = await resp.text().catch(() => '');
        if (resp.status === 409) {
          throw new Error(t('referralAlreadyEnrolled', 'Je bent ingeschreven in het referral programma.'));
        }
        throw new Error(msg || t('referralEnrollError', 'Er ging iets mis bij aanmelden. Probeer opnieuw.'));
      }

      const data = await resp.json() as { code: string; joinUrl?: string };

      // Update local state with server-provided code
      const refProfile = {
        code: data.code,
        paypalMeLink
      } as any;
      setAuthState(prev => ({
        ...prev,
        user: { ...prev.user, referralProfile: refProfile }
      }));
      displayToast(t('referralEnrollSuccess', 'Je bent aangemeld voor het referral programma.'), 'success');
      return { code: data.code };
    } catch (e: any) {
      throw new Error(e?.message || t('referralEnrollError', 'Er ging iets mis bij aanmelden. Probeer opnieuw.'));
    }
  };

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
  const [socialPostData, setSocialPostData] = useState<SocialPostData | null>(null);
const [socialPostXData, setSocialPostXData] = useState<SocialPostData | null>(null);
  const [socialPostCount, setSocialPostCount] = useState<number>(1);
  
  // Image generation state
  const [imageGenerationStyle, setImageGenerationStyle] = useState<string>('infographic');
  const [imageGenerationColor, setImageGenerationColor] = useState<string>('color');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [showImageGenerationModal, setShowImageGenerationModal] = useState<boolean>(false);
  const [generatedImagePrompt, setGeneratedImagePrompt] = useState<string>('');
  const [showImageGenerationResult, setShowImageGenerationResult] = useState<boolean>(false);
  const [imageInstructionsCopied, setImageInstructionsCopied] = useState<boolean>(false);
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
  const [transcriptionStatus, setTranscriptionStatus] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
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
        // Prefer Vite-style vars when available, then fall back to process.env mappings
        try {
          const env: any = (typeof import.meta !== 'undefined' ? (import.meta as any).env : {}) || {};
          const candidates = [
            env.VITE_GEMINI_API_KEY,
            env.VITE_GOOGLE_CLOUD_API_KEY,
            (process as any)?.env?.GEMINI_API_KEY,
            (process as any)?.env?.REACT_APP_GEMINI_API_KEY,
            env.GEMINI_API_KEY,
          ];
          const found = candidates.find((v) => typeof v === 'string' && v.trim().length > 0);
          if (found) {
            setApiKey((found as string).trim());
          }
        } catch {
          // no-op
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
                        
                        // Load Stripe data to get currentSubscriptionStatus
                        try {
                          const stripeData = await getUserStripeData(firebaseUser.uid);
                          const validStatuses = ['active', 'past_due', 'cancelled', 'expired'] as const;
                          userData.currentSubscriptionStatus = validStatuses.includes(stripeData.currentSubscriptionStatus as any) 
                            ? stripeData.currentSubscriptionStatus as 'active' | 'past_due' | 'cancelled' | 'expired'
                            : 'active';
                        } catch (error) {
                          console.error('Error loading Stripe data:', error);
                          // Default to 'active' if we can't load Stripe data
                          userData.currentSubscriptionStatus = 'active';
                        }
                        
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
                        
                        // Load user subscription tier - always get from database for security
                        const tier = await getUserSubscriptionTier(firebaseUser.uid);
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

                          }
                          
                          // Show warnings as info toasts (non-blocking)
                          if (validation.warnings.length > 0) {
                            console.warn('⚠️ Startup warnings:', validation.warnings);
                            // Only show the first warning to avoid spam
                            displayToast(
                              `Let op: ${validation.warnings[0]}`,
                              'info'
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
                // Clear topic cache on logout
                try { clearTopicCache(); } catch {}
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
    setBlogData(null);
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

    // Trigger RecapHorizonPanel full reset by bumping startStamp
    setRecordingStartMs(Date.now());


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
            const modelName = await getModelForUser(authState.user?.uid || "", "expertChat");
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

    }
    if (canvas.height !== rect.height) {
      canvas.height = rect.height;

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
        // Verhoogde timeout voor 'geen audio' indicatie van 2s naar 6s
        if (now - lastNoInputStartRef.current > 6000) setShowNoInputHint(true);
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
    
    const canStart = subscriptionService.validateSessionStart(
      effectiveTier, 
      totalSessionsToday,
      convertTimestampToDate(authState.user?.createdAt),
      authState.user?.currentSubscriptionStatus || 'active',
      authState.user?.hasHadPaidSubscription || false
    );
    
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
    setBlogData(null);
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
        audioRecorderRef.current = new AudioRecorder(t, authState.user?.uid);
        
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
                // Audio recorder automatisch gestopt en opgeruimd
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
          },
          onLimitReached: (limitType: 'session' | 'monthly', tier: SubscriptionTier) => {
            if (limitType === 'monthly') {
              setShowAudioLimitModal(true);
            } else {
              // Session limit - show toast message
              const tierLimits = subscriptionService.getTierLimits(tier);
              if (tierLimits) {
                displayToast(`Opname gestopt: je hebt de maximale opnametijd van ${tierLimits.maxSessionDuration} minuten bereikt.`, 'info');
              }
            }
          }
        });
      }
      
      // Start recording with the new AudioRecorder
      await audioRecorderRef.current.startRecording({ includeMicrophone: true, includeSystemAudio: true });
      
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
      timerIntervalRef.current = window.setInterval(async () => {
        const currentTime = Date.now();
        const elapsedMs = currentTime - start - pauseAccumulatedMs - (pauseStartMs ? (currentTime - pauseStartMs) : 0);
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        
        setDuration(elapsedSeconds);
        
        const tierLimits = subscriptionService.getTierLimits(effectiveTier);
        if (tierLimits && elapsedSeconds >= tierLimits.maxSessionDuration * 60) {
          // Stop recording immediately at session limit
          audioRecorderRef.current?.stopRecording();
          setStatus(RecordingStatus.STOPPED);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          displayToast(`Opname gestopt: je hebt de maximale opnametijd van ${tierLimits.maxSessionDuration} minuten bereikt.`, 'info');
          return;
        }
        
        // Check monthly audio limit
        if (authState.user && tierLimits?.maxMonthlyAudioMinutes) {
          try {
            const monthlyUsage = await getUserMonthlyAudioMinutes(authState.user.uid);
            const currentUsage = monthlyUsage.minutes;
            const currentSessionMinutes = Math.floor(elapsedSeconds / 60);
            const projectedUsage = currentUsage + currentSessionMinutes;
            
            if (projectedUsage >= tierLimits.maxMonthlyAudioMinutes) {
              // Stop recording immediately at monthly limit
              audioRecorderRef.current?.stopRecording();
              setStatus(RecordingStatus.STOPPED);
              if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
              setShowAudioLimitModal(true);
              return;
            }
          } catch (error) {
            console.error('Error checking monthly audio limit:', error);
          }
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
    if (audioRecorderRef.current) {
      try {
        // Stop recording and ensure complete cleanup
        await audioRecorderRef.current.stopRecording();
        
        // Force cleanup to release all resources including wakeLock
        await audioRecorderRef.current.cleanup();
        
        // Update session recording status
        sessionManager.setRecordingStatus(sessionId, false);
        
        // Clear pause state
        setPauseStartMs(null);
        
        // Audio opname volledig gestopt en alle resources vrijgegeven
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
                        reject(new Error(t('errorMarkdownReadFailed', 'Failed to read Markdown.')));
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
                    reject(new Error(t('errorMarkdownProcessingFailed', 'Markdown processing failed.')));
                }
            };
            reader.onerror = () => reject(new Error(t('errorMarkdownReadFailed', 'Failed to read Markdown.')));
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
                            reject(new Error(t('errorDocxReadFailed', 'Failed to read DOCX.')));
                            return;
                        }

                        const result = await mammoth.extractRawText({ arrayBuffer });
                        const text = result.value;
                        
                        if (!text.trim()) {
                            reject(new Error(t('errorDocxNoTextFound', 'No text found in the DOCX file.')));
                            return;
                        }
                        
                        resolve(text.trim());
                    } catch (error: unknown) {
                        reject(new Error(t('errorDocxProcessingFailed', 'DOCX processing failed: {message}', { message: (error as Error).message || t('unknownError') })));
                    }
                };
                reader.onerror = () => reject(new Error(t('errorDocxReadFailed', 'Failed to read DOCX.')));
                reader.readAsArrayBuffer(file);
            } catch (error: any) {
                reject(new Error(t('errorDocxLibraryLoadFailed', 'DOCX library failed to load: {message}', { message: error.message || t('unknownError') })));
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
            setError(t('uploadFailedTierFreeTxtOnly', 'Upload failed: Your current plan only supports TXT files for transcription. Upgrade to Silver or Gold to upload other file types.'));
            return;
        }

        // Normalize file type (handle browsers that don't set file.type reliably)
        const extToMime = (name: string) => {
            if (name.endsWith('.pdf')) return 'application/pdf';
            if (name.endsWith('.rtf')) return 'application/rtf';
            if (name.endsWith('.html') || name.endsWith('.htm')) return 'text/html';
            if (name.endsWith('.md')) return 'text/markdown';
            if (name.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            if (name.endsWith('.txt')) return 'text/plain';
            return '';
        };
        const normalizedType = isTxt ? 'text/plain' : (fileType || extToMime(fileName));

        // Validate types via subscription service (with user-friendly reasons)
        const uploadValidation = subscriptionService.validateFileUpload(effectiveTier, normalizedType || '', t);
        if (!uploadValidation.allowed) {
            setShowUpgradeModal(true);
            setError(uploadValidation.reason || t('uploadFailedUnsupportedTier', 'Upload failed: This file type is not supported for your tier.'));
            return;
        }

        // Enforce daily session limits before processing
        const totalSessionsToday = (dailyAudioCount || 0) + (dailyUploadCount || 0);
        const canStart = subscriptionService.validateSessionStart(
          effectiveTier, 
          totalSessionsToday,
          convertTimestampToDate(authState.user?.createdAt),
          authState.user?.currentSubscriptionStatus || 'active',
          authState.user?.hasHadPaidSubscription || false
        );
        if (!canStart.allowed) {
            setShowUpgradeModal(true);
            setError(canStart.reason || t('errorDailySessionLimit'));
            return;
        }

        setError(null);
        setAnonymizationReport(null);
        setLoadingText(t('processingFile', 'Processing file...'));

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
                    setError(tokenValidation.reason || t('errorTokenLimitFileProcessing', 'Token limit reached for file processing.'));
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
            // Trigger RecapHorizonPanel full reset by bumping startStamp
            setRecordingStartMs(Date.now());
            
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
        const canStart = subscriptionService.validateSessionStart(
          effectiveTier, 
          totalSessionsToday,
          convertTimestampToDate(authState.user?.createdAt),
          authState.user?.currentSubscriptionStatus || 'active',
          authState.user?.hasHadPaidSubscription || false
        );
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
                const modelName = await getModelForUser(authState.user?.uid || "", "analysisGeneration");
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
                // Trigger RecapHorizonPanel full reset by bumping startStamp
                setRecordingStartMs(Date.now());
                
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
            const canStart = subscriptionService.validateSessionStart(
              userSubscription, 
              totalSessionsToday,
              convertTimestampToDate(authState.user?.createdAt),
              authState.user?.currentSubscriptionStatus || 'active',
              authState.user?.hasHadPaidSubscription || false
            );
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
        const canStart = subscriptionService.validateSessionStart(
          effectiveTier, 
          totalSessionsToday,
          convertTimestampToDate(authState.user?.createdAt),
          authState.user?.currentSubscriptionStatus || 'active',
          authState.user?.hasHadPaidSubscription || false
        );
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
        
        // Trigger RecapHorizonPanel full reset by bumping startStamp
        setRecordingStartMs(Date.now());
        
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

        
        // Check if user has access to web page import (available from Gold tier)
        if (userSubscription !== SubscriptionTier.GOLD && 
            userSubscription !== SubscriptionTier.DIAMOND &&
            userSubscription !== SubscriptionTier.ENTERPRISE) {

            setWebPageError(t("webPageFeatureUpgrade", "Web page import is available from Gold tier. Upgrade your subscription to import text directly from web pages."));
            setShowUpgradeModal(true);
            return;
        }
        

        
        // Check if user is on Gold or Diamond tier if trying to use WebExpert
  if (useDeepseekOption && 
      userSubscription !== SubscriptionTier.GOLD && 
      userSubscription !== SubscriptionTier.DIAMOND) {

    setWebPageError(t("goldTierRequired", "WebExpert option is only available for Gold and Diamond tier subscribers."));
            return;
        }
        
        if (useDeepseekOption) {

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
                
                // Firecrawl API: Processing URLs
                
                // Process multiple URLs using Firecrawl v2 API
                const allResults = [];
                
                for (const singleUrl of validUrls) {
                    // Processing URL with Firecrawl v2
                    
                    const response = await fetch('https://api.firecrawl.dev/v2/scrape', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${firecrawlApiKey}`
                        },
                        body: JSON.stringify({
                            url: singleUrl,
                            formats: ['markdown'],
                            onlyMainContent: true,
                            includeTags: ['title', 'meta', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'article', 'section'],
                            removeBase64Images: true,
                            blockAds: true
                        })
                    });
                    
                    // Firecrawl v2 Response Status
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        // Firecrawl v2 Error - continue with next URL
                        continue; // Skip this URL and continue with others
                    }
                    
                    const data = await response.json();
                    // Firecrawl v2 Response Data processed
                    
                    if (data.success && data.data) {
                        // Use markdown content and convert to plain text
                        const markdownContent = data.data.markdown || data.data.content || '';
                        const plainTextContent = markdownToPlainText(markdownContent);
                        allResults.push({
                            url: singleUrl,
                            content: plainTextContent,
                            metadata: data.data.metadata || {}
                        });
                    }
                }
                
                // Firecrawl v2 API: URLs processed successfully
                
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
                    
                    // Successfully fetched content
                    
                    // Extract clean text from HTML
                    cleanText = extractTextFromHTML(result.content);
                    
                    if (cleanText.length < 100) {
                        throw new Error(t('littleTextRetrievedSingle', 'Very little text could be retrieved from this web page. This may be due to security settings or because the page contains little text.'));
                    }
                    
                } catch (fetchError) {
                    // Direct fetch failed, falling back to CORS proxy
                    
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
            // Trigger RecapHorizonPanel full reset by bumping startStamp
            setRecordingStartMs(Date.now());
            
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

    // Helper functie voor het berekenen van string gelijkenis (Levenshtein distance)
    const calculateSimilarity = (str1: string, str2: string): number => {
        const len1 = str1.length;
        const len2 = str2.length;
        
        if (len1 === 0) return len2 === 0 ? 1 : 0;
        if (len2 === 0) return 0;
        
        const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
        
        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;
        
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        
        const maxLen = Math.max(len1, len2);
        return 1 - (matrix[len1][len2] / maxLen);
    };

    const handleAnonymizeTranscript = async () => {
        // Controleer of er anonimisatie regels zijn ingesteld
        if (anonymizationRules.length === 0 || anonymizationRules.every(rule => !rule.originalText.trim())) {
            setError('Geen anonimisatie regels ingesteld. Stel eerst de regels in via het instellingen scherm.');
            setActiveSettingsTab('anonymization'); // Set the correct tab
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
                            // Verbeterde fuzzy tekst vervanging
                            const originalLower = rule.originalText.toLowerCase();
                            
                            // Zoek naar exacte matches eerst (case-insensitive)
                            const exactRegex = new RegExp(`\\b${rule.originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
                            const exactMatches = tempTranscript.match(exactRegex) || [];
                            
                            if (exactMatches.length > 0) {
                                tempTranscript = tempTranscript.replace(exactRegex, replacementText);
                                totalReplacements += exactMatches.length;
                                replacementCounts[rule.originalText] = exactMatches.length;
                            } else {
                                // Als geen exacte match, zoek naar gelijkaardige namen
                                const namePattern = new RegExp(`\\b[A-Z][a-z]{2,}\\b`, 'g');
                                const potentialNames = tempTranscript.match(namePattern) || [];
                                
                                // Filter op namen die sterk overeenkomen (minimaal 70% gelijkenis)
                                const matchingNames = potentialNames.filter((name: string) => {
                                    const nameLower = name.toLowerCase();
                                    const similarity = calculateSimilarity(nameLower, originalLower);
                                    return similarity >= 0.7 || 
                                           (nameLower.includes(originalLower) && originalLower.length >= 3) ||
                                           (originalLower.includes(nameLower) && nameLower.length >= 3);
                                });
                                
                                if (matchingNames.length > 0) {
                                    // Vervang alleen unieke namen om dubbele vervangingen te voorkomen
                                    const uniqueNames = [...new Set(matchingNames)];
                                    uniqueNames.forEach(name => {
                                        const nameRegex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
                                        const nameMatches = tempTranscript.match(nameRegex) || [];
                                        if (nameMatches.length > 0) {
                                            tempTranscript = tempTranscript.replace(nameRegex, replacementText);
                                            totalReplacements += nameMatches.length;
                                            
                                            // Tel vervangingen per regel
                                            if (replacementCounts[rule.originalText]) {
                                                replacementCounts[rule.originalText] += nameMatches.length;
                                            } else {
                                                replacementCounts[rule.originalText] = nameMatches.length;
                                            }
                                        }
                                    });
                                }
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
                setBlogData(null); setChatHistory([]);
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
        case 'summary': {
            const targetAudience = summaryOptions.targetAudience || 'general';
            const tone = summaryOptions.toneStyle || 'neutral';
            const lengthPref = summaryOptions.length || 'standard';
            const formatPref = summaryOptions.format || '';

            const lengthInstructions = (
              lengthPref === 'concise' ? 'Keep it concise: 120–200 words or 8–12 bullets.' :
              lengthPref === 'extensive' ? 'Provide an extensive summary: 600–900 words, cover all relevant sections.' :
              lengthPref === 'fullTimeline' ? 'Include a chronological timeline of key moments. Use timestamps if available; otherwise, use approximate timing.' :
              'Aim for a standard length: ~300–500 words or 10–15 bullets.'
            );

            const formatInstructions = (
              formatPref === 'executiveSummary' ?
                'Structure as an executive summary with clear sections: Situation, Key insights, Decisions & Actions, Risks, Next steps.' :
              formatPref === 'toThePointSummary' ?
                'Return only bullet points with no fluff. Use 6–12 bullets. Each bullet must be ≤ 20 words.' :
              formatPref === 'narrativeSummary' ?
                'Write a chronological narrative that tells the story with smooth transitions. Use short quotes when helpful. Prefer paragraphs, bullets only for final actions.' :
              formatPref === 'decisionMakingSummary' ?
                'Focus on choices and rationale. Use headings: Options, Criteria, Pros/Cons, Recommendation, Rationale, Risks, Next steps.' :
              formatPref === 'problemSolutionSummary' ?
                'Organize by Problems → Evidence → Root causes → Proposed solutions → Expected impact → Open questions.' :
              formatPref === 'detailedSummaryWithQuotes' ?
                'Include 3–7 short verbatim quotes. Attribute speakers by name if available; otherwise use “participant”. Keep each quote ≤ 25 words, with standard double quotes.' :
              formatPref === 'highLevelOverview' ?
                'Provide a high-level overview: identify 3–5 overarching themes. For each theme, include 2–3 key bullets. Conclude with 3 strategic recommendations.' :
              'Produce a well-structured summary using paragraphs and bullets where helpful.'
            );

            return `You are a professional summarizer. Your task is to read a **${inputLanguage}** transcript and produce the summary in **${outputLanguage}**.

Target audience: ${targetAudience}
Tone: ${tone}
Length guidance: ${lengthInstructions}
Format guidance: ${formatInstructions}

Requirements:
- Start with a short, informative title in ${outputLanguage} followed by a newline.
- Cover the main points and essential context accurately.
- Highlight decisions, action points, and any outcomes when present.
- Keep language clear and direct for the specified audience.
- Do not invent facts beyond the transcript.
`;
        }
        case 'faq':
            return `From the **${inputLanguage}** transcript below, create 10 FAQ items (question + answer) in **${outputLanguage}**. Rank importance 1–5 stars, allow half-stars (★½). Put the stars before each question. Keep questions short, answers concise and factual. Order from most to least important.`;
        case 'learning':
            return `From the **${inputLanguage}** text below, create a structured learning document in **${outputLanguage}** with: Key takeaways, ranked 1–5 stars (allow half-stars, ★½). Short explanations. Use clear headings and bullet points. Order from most to least important.`;
        case 'followUp':
            return `Based on the **${inputLanguage}** transcript below, generate 10 relevant follow-up questions in **${outputLanguage}** as a numbered list.`;
        case 'socialPost':
            return `Create a social media post in **${outputLanguage}** based on the **${inputLanguage}** transcript below. 

Format the response as JSON with two fields:
{
  "post": "The social media post content",
  "imageInstructions": "AI instruction for generating accompanying image"
}

For the "post" field:
- Start with an engaging header using relevant emoticons
- Create a semi-short message suitable for LinkedIn, Facebook, etc.
- Include emoticons throughout the message to make it engaging
- End with 3-10 relevant hashtags (use #hashtag format)
- Keep the tone professional but engaging
- Maximum length should be suitable for social media platforms

For the "imageInstructions" field:
- Create a detailed instruction for AI image generation
- Describe what kind of image would complement the social media post
- Include style, mood, colors, and visual elements
- Make it specific enough for an AI to generate an appropriate image`;
        case 'socialPostX':
            return `Create a social media post in **${outputLanguage}** based on the **${inputLanguage}** transcript below. 

Format the response as JSON with two fields:
{
  "post": "The social media post content",
  "imageInstructions": "AI instruction for generating accompanying image"
}

For the "post" field:
- Create a concise, clean message suitable for X (Twitter) and BlueSky
- NO emoticons or emojis
- NO hashtags
- Keep the tone professional and direct
- Maximum 280 characters
- Focus on the key message without decorative elements
- Use clear, impactful language

For the "imageInstructions" field:
- Create a detailed instruction for AI image generation
- Describe what kind of image would complement the social media post
- Include style, mood, colors, and visual elements
- Make it specific enough for an AI to generate an appropriate image`;
        default: return '';
    }
};

const handleResetAnalysis = (type: ViewType) => {
    // Clear existing content for regeneration
    if (type === 'summary') setSummary('');
    else if (type === 'faq') setFaq('');
    else if (type === 'learning') setLearningDoc('');
    else if (type === 'followUp') setFollowUpQuestions('');
    setActiveView(type);
};

const handleGenerateAnalysis = async (type: ViewType, postCount: number = 1) => {
  
    
    // Additional debug for social media types
    if (type === 'socialPost' || type === 'socialPostX') {
        // Social media analysis requested
        // Transcript validation
    }
    
    setActiveView(type);

    // Import security utilities
    const { validateAndSanitizeForAI, rateLimiter } = await import('./src/utils/security');

    const sessionId = 'analysis_' + (auth.currentUser?.uid || 'anonymous');
    if (!rateLimiter.isAllowed(sessionId, 10, 60000)) {
        const errorMsg = 'Te veel analyseverzoeken. Probeer het over een minuut opnieuw.';
        setSummary(errorMsg); setFaq(errorMsg); setLearningDoc(errorMsg); setFollowUpQuestions(errorMsg);
        return;
    }

    const validation = validateAndSanitizeForAI(transcript, 500000);
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

    if (type === 'socialPost' || type === 'socialPostX') {
        // Calling generateSocialPost with sanitized transcript
        generateSocialPost(type, sanitizedTranscript, postCount);
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
        const { getModelForUser } = await import('./src/utils/tierModelService');
        const modelName = await getModelForUser(authState.user?.uid || '', 'analysisGeneration');
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

const handleGenerateSummaryWithOptions = async () => {
    summaryQuestionsModal.close();
    await handleGenerateAnalysis('summary');
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
        const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
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
        const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
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
        const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
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
    // Toon een popup bevestiging zodat dit boven de blur zichtbaar is
    anonymizationSavedModal.open();
  };
  
  const saveTranscriptionSettings = () => {
    localStorage.setItem('transcription_quality', transcriptionQuality);
    localStorage.setItem('audio_compression_enabled', audioCompressionEnabled.toString());
    localStorage.setItem('auto_stop_recording_enabled', autoStopRecordingEnabled.toString());
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

      // Ensure fresh auth token to avoid early Firestore permission issues
      try {
        await user.getIdToken(true);
      } catch {}

      // Ensure user document exists (idempotent)
      try {
        const { ensureUserDocument } = await import('./src/firebase');
        await ensureUserDocument(user.uid, email);
      } catch (e) {
        console.info('ensureUserDocument skipped or failed (non-blocking):', e);
      }

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;

        if (!userData.isActive) {
          throw new Error(t('accountDisabled', 'Account is disabled. Contact administrator.'));
        }

        // Update last login (retry once on permission timing issues)
        try {
          await updateDoc(doc(db, 'users', user.uid), { lastLogin: serverTimestamp() });
        } catch (e: any) {
          if (e?.code === 'permission-denied') {
            try {
              await user.getIdToken(true);
              await updateDoc(doc(db, 'users', user.uid), { lastLogin: serverTimestamp() });
            } catch {
              // Non-blocking: ignore if it still fails, proceed with login
            }
          } else {
            // Non-blocking: other errors are logged but do not prevent login
            console.info('lastLogin update non-critical error:', e);
          }
        }

        // Setting auth state for user
        setAuthState({
          user: { ...userData, uid: user.uid },
          isLoading: false,
        });

        // Load user subscription tier
        const tier = (userData.subscriptionTier as SubscriptionTier) || SubscriptionTier.FREE;
        setUserSubscription(tier);
        setShowInfoPage(false);
        
        // Force refresh subscription tier to ensure latest data from Firestore
        try {
          await forceRefreshSubscriptionTier();
          // Subscription tier forcerefresh completed
        } catch (refreshError) {
          console.warn('Forcerefresh subscription tier failed:', refreshError);
          // Non-blocking: continue with login even if refresh fails
        }
      } else {
        // Automatically create user document in Firestore
        const newUserData: UserDocumentCreate = {
          email,
          isActive: true,
          lastLogin: serverTimestamp(),
          sessionCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        try {
          await setDoc(doc(db, 'users', user.uid), newUserData);
          
          // Convert to User interface format
          const now = new Date();
          const userForState: User = {
            uid: user.uid,
            email,
            isActive: true,
            lastLogin: { seconds: Math.floor(now.getTime() / 1000) },
            sessionCount: 0,
            createdAt: { seconds: Math.floor(now.getTime() / 1000) },
            updatedAt: { seconds: Math.floor(now.getTime() / 1000) }
          };
          
          setAuthState({
            user: userForState,
            isLoading: false,
          });
          setUserSubscription(SubscriptionTier.FREE);
          setShowInfoPage(false);
          displayToast(`Welkom ${email}! Je account is automatisch aangemaakt.`, 'success');
        } catch (createError) {
          console.error('Error creating automatic user document:', createError);
          throw new Error(t('couldNotCreateAccount', 'Kon gebruikersaccount niet aanmaken. Probeer het opnieuw of contact administrator.'));
        }
      }
    } catch (error: any) {
      // Use enhanced error handler
      const { errorHandler } = await import('./src/utils/errorHandler');
      const userFriendlyError = errorHandler.handleAuthError(error, {
        userId: undefined,
        sessionId: undefined,
        attemptedAction: 'login'
      });

      if (error.code === 'auth/user-not-found') {
        throw new Error(t('emailNotFound', 'Email adres niet gevonden. Maak eerst een account aan.'));
      } else if (error.code === 'auth/wrong-password') {
        throw new Error(t('incorrectPassword', 'Onjuist wachtwoord. Probeer opnieuw.'));
      } else if (error.code === 'auth/invalid-email') {
        throw new Error(t('invalidEmail', 'Ongeldig email adres.'));
      } else if (error.code === 'auth/user-disabled') {
        throw new Error(t('accountDisabledContact', 'Account is uitgeschakeld. Contact administrator.'));
      } else {
        throw new Error(userFriendlyError.message);
      }
    }
  };

  const handleCreateAccount = async (email: string, password: string) => {
    try {
      // Creating new account
      
      // If referral code present in URL, use email confirmation flow for security
      if (referralCodeFromURL) {
        // Store password temporarily for after email confirmation
        setPendingReferralPassword(password);
        setPendingConfirmationEmail(email);
        setConfirmationContext('referral');
        
        // Import security functions
        const { initiateWaitlistSignup } = await import('./src/utils/security');
        
        // Initiate email confirmation for referral signup
        const result = await initiateWaitlistSignup(email);
        
        if (result.success && result.requiresConfirmation) {
          setShowEmailConfirmationModal(true);
          displayToast(t('emailConfirmationSent', 'Een bevestigingscode is verzonden naar je e-mailadres.'), 'info');
          return;
        } else if (result.error) {
          throw new Error(result.error);
        }
        
        // Fallback to direct creation if email confirmation fails
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Find referrer by referralProfile.code
        let referrerUid: string | null = null;
        try {
          const usersRef = collection(db, 'users');
          const qRef = query(usersRef, where('referralProfile.code', '==', referralCodeFromURL));
          const refSnap = await getDocs(qRef);
          if (!refSnap.empty) {
            const refData = refSnap.docs[0].data();
            referrerUid = refSnap.docs[0].id || (refData as any)?.uid || null;
          }
        } catch {}

        const newUserData: UserDocumentCreate = {
          email,
          isActive: true,
          lastLogin: serverTimestamp(),
          sessionCount: 0,
          createdAt: new Date(),
          updatedAt: serverTimestamp(),
          subscriptionTier: SubscriptionTier.FREE,
          referrerCode: referralCodeFromURL,
        };
        await setDoc(doc(db, 'users', user.uid), newUserData);

        // Create referral link record for dashboard
        if (referrerUid) {
          await setDoc(doc(db, 'referrals', user.uid), {
            referrerUid,
            referredUid: user.uid,
            emailMasked: maskEmail(email),
            currentTier: 'free',
            monthStartTier: 'free',
            createdAt: serverTimestamp()
          });
        }

        // Convert to User interface format
        const now = new Date();
        const userForState: User = {
          uid: user.uid,
          email,
          isActive: true,
          lastLogin: { seconds: Math.floor(now.getTime() / 1000) },
          sessionCount: 0,
          createdAt: { seconds: Math.floor(now.getTime() / 1000) },
          updatedAt: { seconds: Math.floor(now.getTime() / 1000) },
          subscriptionTier: SubscriptionTier.FREE
        };
        
        setAuthState({
          user: userForState,
          isLoading: false,
        });
        setUserSubscription(SubscriptionTier.FREE);
        setShowInfoPage(false);
        
        // Create personalized welcome message
        const referrerEmail = referrerData?.userEmail || 'een collega';
        const welcomeMessage = t('welcomeNewReferral', `Welkom! Je bent uitgenodigd door ${referrerEmail} en hebt nu toegang tot RecapHorizon. Veel plezier met het platform!`);
        displayToast(welcomeMessage, 'success');
        return;
      }

      // Fallback: original path requiring pre-existing user record
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
      
      // Check if user already has a UID (means Firebase Auth account exists)
      if (userData.uid) {
        try {
          await signInWithEmailAndPassword(auth, email, 'dummy-password');
          throw new Error(t('emailInUseFirebase', 'Dit email adres is al in gebruik in Firebase. Probeer in te loggen in plaats van een account aan te maken.'));
        } catch (authError: any) {
          if (authError.code === 'auth/wrong-password') {
            throw new Error(t('firebaseEmailInUse', 'This email address is already in use in Firebase. Try logging in instead of creating an account.'));
          } else if (authError.code === 'auth/user-not-found') {
            // proceed
          } else if (authError.code === 'auth/invalid-credential') {
            // proceed
          } else {
            throw authError;
          }
        }
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateDoc(doc(db, 'users', userDoc.id), {
        uid: user.uid,
        updatedAt: serverTimestamp()
      });
      // Convert userData to User interface format
      const userForState: User = {
        uid: user.uid,
        email: userData.email || email,
        isActive: userData.isActive || true,
        lastLogin: userData.lastLogin ? { seconds: Math.floor(userData.lastLogin.getTime() / 1000) } : null,
        sessionCount: userData.sessionCount || 0,
        createdAt: userData.createdAt ? { seconds: Math.floor(userData.createdAt.getTime() / 1000) } : { seconds: Math.floor(Date.now() / 1000) },
        updatedAt: userData.updatedAt ? { seconds: Math.floor(userData.updatedAt.getTime() / 1000) } : { seconds: Math.floor(Date.now() / 1000) },
        subscriptionTier: userData.subscriptionTier,
        currentSubscriptionStatus: userData.currentSubscriptionStatus,
        hasHadPaidSubscription: userData.hasHadPaidSubscription,
        monthlyAudioMinutes: userData.monthlyAudioMinutes,
        currentSubscriptionStartDate: userData.currentSubscriptionStartDate ? { seconds: Math.floor(userData.currentSubscriptionStartDate.getTime() / 1000) } : undefined,
        nextBillingDate: userData.nextBillingDate ? { seconds: Math.floor(userData.nextBillingDate.getTime() / 1000) } : undefined,
        stripeCustomerId: userData.stripeCustomerId,
        scheduledTierChange: userData.scheduledTierChange ? {
          tier: userData.scheduledTierChange.tier,
          effectiveDate: { seconds: Math.floor(userData.scheduledTierChange.effectiveDate.getTime() / 1000) },
          action: userData.scheduledTierChange.action
        } : undefined,
        referralProfile: userData.referralProfile,
        audioCompressionEnabled: userData.audioCompressionEnabled,
        autoStopRecordingEnabled: userData.autoStopRecordingEnabled,
        anonymizationRules: userData.anonymizationRules,
        transcriptionQuality: userData.transcriptionQuality
      };
      
      setAuthState({
        user: userForState,
        isLoading: false,
      });
      const tier = userData.subscriptionTier as SubscriptionTier || SubscriptionTier.FREE;
      setUserSubscription(tier);
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
      // Set flag to indicate this is a manual logout
      setIsManualLogout(true);
      await signOut(auth);
      setAuthState({
        user: null,
        isLoading: false,
              });
      setUserSubscription(SubscriptionTier.FREE);
      // Clear referral-related UI and state to prevent redirect back to referral screen
      setShowReferralRegistrationModal(false);
      setShowReferralInfoPage(false);
      setShowReferralDashboardPage(false);
      setShowReferralSignupModal(false);
      setReferralCodeFromURL(null);
      setIsValidReferralCode(null);
      setReferrerData(null);
      setShowInfoPage(false);
      // Remove ?ref= from the URL
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('ref')) {
          url.searchParams.delete('ref');
          const newUrl = `${url.pathname}${url.search}${url.hash}`;
          window.history.replaceState({}, '', newUrl);
        }
      } catch (e) {
        console.warn('Failed to clean referral query on logout:', e);
      }
      reset();
    } catch (error: any) {
      console.error('Logout error:', error);
      // Reset flag if logout fails
      setIsManualLogout(false);
    }
  };

  // Handle email confirmation completion
  const handleEmailConfirmed = async (email: string, context: 'waitlist' | 'referral') => {
    try {
      if (context === 'waitlist') {
        // Complete waitlist signup
        const { completeWaitlistSignup } = await import('./src/utils/security');
        const result = await completeWaitlistSignup(pendingConfirmationEmail || email);
        
        if (result.success) {
          displayToast(t('waitlistConfirmationMessage', 'Uw inschrijving is opgenomen in de administratie. U hoort zo snel mogelijk van ons. Bedankt!'), 'success');
          setShowEmailConfirmationModal(false);
          setPendingConfirmationEmail('');
          setConfirmationContext('waitlist');
        } else {
          throw new Error(result.error || 'Failed to complete waitlist signup');
        }
      } else if (context === 'referral') {
        // Complete referral account creation
        const { createReferralAccount } = await import('./src/utils/security');
        const result = await createReferralAccount(
          pendingConfirmationEmail || email, 
          pendingReferralPassword || '', 
          referralCodeFromURL || ''
        );
        
        if (result.success && result.user) {
          // Set authentication state
          setAuthState({
            user: result.user,
            isLoading: false,
          });
          setUserSubscription(SubscriptionTier.FREE);
          setShowInfoPage(false);
          setShowEmailConfirmationModal(false);
          
          // Clear pending data
          setPendingConfirmationEmail('');
          setPendingReferralPassword('');
          setConfirmationContext('waitlist');
          
          // Create personalized welcome message
          const referrerEmail = referrerData?.userEmail || 'een collega';
          const welcomeMessage = t('welcomeNewReferral', `Welkom! Je bent uitgenodigd door ${referrerEmail} en hebt nu toegang tot RecapHorizon. Veel plezier met het platform!`);
          displayToast(welcomeMessage, 'success');
        } else {
          throw new Error(result.error || 'Failed to create referral account');
        }
      }
    } catch (error: any) {
      console.error('Email confirmation error:', error);
      displayToast(error.message || t('emailConfirmationFailed', 'E-mailbevestiging mislukt. Probeer het opnieuw.'), 'error');
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



  // Enhanced waitlist functions with email confirmation for security
  const addToWaitlist = async (email: string): Promise<{ success: boolean; message: string; type: 'success' | 'error' | 'info' }> => {
    // Prevent waitlist action when user is logged in
    if (authState.user) {
      return {
        success: false,
        message: t('waitlistAlreadyLoggedIn'),
        type: 'info'
      };
    }
    
    try {
      // Import enhanced security utilities
      const { initiateWaitlistSignup } = await import('./src/utils/security');
      
      // Initiate waitlist signup with email confirmation
      const result = await initiateWaitlistSignup(email);
      
      if (result.success && result.requiresConfirmation) {
        // Store email for confirmation
        setPendingConfirmationEmail(email);
        setConfirmationContext('waitlist');
        setShowEmailConfirmationModal(true);
        
        return {
          success: true,
          message: t('emailConfirmationSent', 'Een bevestigingscode is verzonden naar je e-mailadres.'),
          type: 'info'
        };
      } else if (result.error) {
        return {
          success: false,
          message: result.error,
          type: 'error'
        };
      }
      
      // Fallback to old method if email confirmation is not available
      return await addToWaitlistDirect(email);
      
    } catch (error) {
      console.error('Error in addToWaitlist:', error);
      // Fallback to direct method
      return await addToWaitlistDirect(email);
    }
  };

  // Fallback direct waitlist method (kept for compatibility)
  const addToWaitlistDirect = async (email: string): Promise<{ success: boolean; message: string; type: 'success' | 'error' | 'info' }> => {
    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        success: false,
        message: t('waitlistInvalidEmail'),
        type: 'error'
      };
    }

    // Anti-misbruik maatregelen
    const normalizedEmail = email.toLowerCase().trim();
    
    // 1. Email lengte controle (voorkomen van extreem lange emails)
    if (normalizedEmail.length > 254) {
      return {
        success: false,
        message: t('waitlistInvalidEmail'),
        type: 'error'
      };
    }
    
    // 2. Verdachte patronen detectie
    const suspiciousPatterns = [
      /test.*test/i,
      /fake.*fake/i,
      /spam.*spam/i,
      /\+.*\+.*\+/,  // Meerdere + tekens
      /\.{3,}/,      // Meerdere punten achter elkaar
      /@.*@/,        // Meerdere @ tekens
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(normalizedEmail))) {
      // Voor privacy: geef gewoon success terug maar log het
      console.warn('Suspicious email pattern detected:', normalizedEmail.substring(0, 3) + '***');
      return {
        success: true,
        message: t('waitlistThankYou'),
        type: 'success'
      };
    }
    
    // 3. Rate limiting per sessie (max 3 pogingen per 10 minuten)
    const rateLimitKey = 'waitlist_attempts';
    const rateLimitWindow = 10 * 60 * 1000; // 10 minuten
    const maxAttempts = 3;
    
    try {
      if (typeof window !== 'undefined') {
        const attemptsData = sessionStorage.getItem(rateLimitKey);
        if (attemptsData) {
          const { count, timestamp } = JSON.parse(attemptsData);
          const now = Date.now();
          
          if (now - timestamp < rateLimitWindow) {
            if (count >= maxAttempts) {
              return {
                success: false,
                message: t('waitlistRateLimit') || 'Te veel pogingen. Probeer later opnieuw.',
                type: 'error'
              };
            }
            // Update attempt count
            sessionStorage.setItem(rateLimitKey, JSON.stringify({
              count: count + 1,
              timestamp: timestamp
            }));
          } else {
            // Reset counter na window
            sessionStorage.setItem(rateLimitKey, JSON.stringify({
              count: 1,
              timestamp: now
            }));
          }
        } else {
          // Eerste poging
          sessionStorage.setItem(rateLimitKey, JSON.stringify({
            count: 1,
            timestamp: Date.now()
          }));
        }
      }
    } catch (e) {
      // Silently continue if sessionStorage fails
    }

    // Per-email beveiliging: controleer of dit specifieke email al is ingediend in deze sessie
    const sessionGuardKey = `waitlist_submitted_${btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '')}`;
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem(sessionGuardKey) === '1') {
        // Voor privacy: altijd dezelfde melding geven alsof het succesvol was
        return {
          success: true,
          message: t('waitlistThankYou'),
          type: 'success'
        };
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
        // Primary attempt: createdAt as Date + status 'pending' + language
        await setDoc(doc(db, 'waitlist', waitlistDocId), {
          email: normalizedEmail,
          createdAt: new Date(),
          status: 'pending',
          language: uiLang
        }, { merge: false });
        wrote = true;
      } catch (e1: any) {
        // Fallback: createdAt as serverTimestamp + status 'pending' + language
        if (e1 && typeof e1.message === 'string' && e1.message.includes('permission-denied')) {
          try {
            await setDoc(doc(db, 'waitlist', waitlistDocId), {
              email: normalizedEmail,
              createdAt: serverTimestamp(),
              status: 'pending',
              language: uiLang
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
        // Markeer deze sessie als voltooid, zodat er niet opnieuw kan worden ingezonden in dezelfde sessie
        try {
          if (typeof window !== 'undefined') sessionStorage.setItem(sessionGuardKey, '1');
        } catch {}

        
        return {
          success: true,
          message: t('waitlistThankYou'),
          type: 'success'
        };
      }
      
    } catch (error) {
      // Enhanced error handling
      let errorMessage = t('waitlistErrorAdding');
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = t('errorAccessDenied');
        } else if (error.message.includes('network')) {
          errorMessage = t('errorNetwork');
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        type: 'error'
      };
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
      console.warn('Failed to generate session hash:', error);
      return 'unknown';
    }
  };

  const loadWaitlist = async (options?: { bypassAdminCheck?: boolean }) => {
    const bypass = options?.bypassAdminCheck === true;
    // Controleer of gebruiker admin is voor wachtlijst beheer
    if (!bypass && (!authState.user || authState.user.subscriptionTier !== SubscriptionTier.DIAMOND)) {
      return;
    }

    try {
      const waitlistQuery = query(collection(db, 'waitlist'), orderBy('createdAt', 'desc'));
      const waitlistSnapshot = await getDocs(waitlistQuery);
      const waitlistData = waitlistSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email || '',
          timestamp: data.createdAt ? data.createdAt.seconds * 1000 : Date.now()
        };
      });
      setWaitlist(waitlistData);
    } catch (error: any) {
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
      displayToast(t('adminNoAccess'), 'error');
      return;
    }

    if (selectedWaitlistUsers.length === 0) {
              displayToast(t('adminSelectUsers'), 'info');
      return;
    }

    try {
      for (const userEmail of selectedWaitlistUsers) {
        const userData = waitlist.find(w => w.email === userEmail);
        if (userData) {
          // Add to users collection
          await addDoc(collection(db, 'users'), {
            email: userData.email,
            isActive: true,
            lastLogin: null,
            sessionCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Remove from waitlist - need to find the document by email
          const waitlistQuery = query(collection(db, 'waitlist'), where('email', '==', userEmail));
          const waitlistSnapshot = await getDocs(waitlistQuery);
          if (!waitlistSnapshot.empty) {
            await deleteDoc(waitlistSnapshot.docs[0].ref);
          }
        }
      }
      
      // Refresh both lists
      await loadUsers();
      await loadWaitlist();
      setSelectedWaitlistUsers([]);
              displayToast(`${selectedWaitlistUsers.length} ${t('adminUsersActivated')}`, 'success');
    } catch (error) {
              displayToast(t('adminErrorActivating'), 'error');
    }
  };
  const removeFromWaitlist = async (userId: string) => {
    // Controleer of gebruiker admin is
    if (!authState.user || authState.user.subscriptionTier !== SubscriptionTier.DIAMOND) {
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
      const emails = waitlist.filter(w => userIds.includes(w.email)).map(w => w.email);
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
    displayToast(t('generatingPresentation'), 'info');
    setError(null);
    setPresentationReport(null);
    const useTemplate = options.useTemplate && options.templateFile !== null;

    try {
        // Localize instruction labels according to selected language
        const lang = options.language;
        const L = lang === 'nl' ? {
            structureHeader: '**Structuur van de Presentatie (verwijderde slides: Status & Datum, Aanwezigen):**',
            titleSlide: '**Titelslide:** Een pakkende hoofdtitel en een informatieve ondertitel.',
            agenda: '**Inhoudsopgave (Agenda):** Een slide die de structuur van de presentatie schetst.',
            introduction: '**Inleiding:** Een slide die de uitgangspunten, doelen en context van het project samenvat.',
            coreSlides: (n: number) => `**Kernslides:** ${n} slides die de belangrijkste discussiepunten, bevindingen en beslissingen uit het transcript behandelen. Gebruik duidelijke, beknopte titels en presenteer de inhoud als duidelijke bullet points (maximaal 5 per slide).`,
            projectStatus: '**Projectstatus:** Een slide die een overzicht geeft van de algehele status. Waar staan we nu?',
            learnings: '**Learnings:** Een slide met de belangrijkste leerpunten uit de sessie.',
            improvements: '**Verbeterpunten:** Een slide met suggesties voor wat er een volgende keer beter kan.',
            todoList: `**To-Do Lijst:** Een slide met concrete, beknopte actiepunten. Specificeer 'taak', 'eigenaar' (wie) en 'deadline' (wanneer). Zorg dat de data compleet is.`,
            imageStyle: '**Beeldstijl & Prompts:**\n    *   Genereer een algemene `imageStylePrompt`: een consistente, professionele en speelse visuele stijl.\n    *   Genereer voor *elke* inhoudelijke slide een unieke, creatieve `imagePrompt` in het Engels die abstract, conceptueel of metaforisch past bij de inhoud.',
            important: '**BELANGRIJK:** Houd alle titels en bullet points relatief kort en bondig. Zorg voor volledige, correcte data voor de to-do lijst. Respecteer de taal en het maximum aantal slides. Pas de inhoud aan op basis van de doelgroep, het hoofddoel en de gewenste toon/stijl.',
            analyze: 'Analyseer de volgende transcriptie en produceer het JSON-object.'
        } : {
            structureHeader: '**Presentation Structure (removed slides: Status & Date, Attendees):**',
            titleSlide: '**Title slide:** A compelling main title and an informative subtitle.',
            agenda: '**Agenda:** A slide that outlines the structure of the presentation.',
            introduction: '**Introduction:** A slide summarizing the assumptions, goals, and context of the project.',
            coreSlides: (n: number) => `**Core slides:** ${n} slides covering the main discussion points, findings, and decisions from the transcript. Use clear, concise titles and present the content as bullet points (max 5 per slide).`,
            projectStatus: '**Project status:** A slide providing an overview of the overall status. Where do we stand now?',
            learnings: '**Key learnings:** A slide with the most important takeaways from the session.',
            improvements: '**Improvements:** A slide with suggestions for what could be improved next time.',
            todoList: `**To-Do List:** A slide with concrete, concise action items. Specify 'task', 'owner' (who), and 'deadline' (when). Ensure the data is complete.`,
            imageStyle: '**Visual Style & Prompts:**\n    *   Generate a general `imageStylePrompt`: a consistent, professional and playful visual style.\n    *   Generate for *each* content slide a unique, creative `imagePrompt` in English that is abstract, conceptual or metaphorical and fits the content.',
            important: '**IMPORTANT:** Keep all titles and bullet points short and concise. Ensure complete and correct data for the to-do list. Respect the language and the maximum number of slides. Adapt the content based on the audience, main goal, and desired tone/style.',
            analyze: 'Analyze the following transcript and produce the JSON object.'
        };

        const languageCode = getGeminiCode(options.language);
        // Budget voor kernslides: totale limiet minus vaste slides (title, agenda, intro, status, learnings, improvements, todo)
        // We houden minimaal 1 kernslide aan om altijd inhoud te tonen.
        const maxCoreSlides = Math.max(1, options.maxSlides - 7);
        const prompt = `Je bent een AI-expert in het creëren van professionele, gestructureerde en visueel aantrekkelijke zakelijke presentaties op basis van een meeting-transcript. Je taak is om de volgende content te genereren en te structureren in een JSON-object dat voldoet aan het verstrekte schema.

**Taal:** ${languageCode} - Alle titels en content moeten in deze taal zijn.

**Maximum aantal slides:** ${options.maxSlides} - Houd de presentatie binnen deze limiet.

**Doelgroep:** ${options.targetAudience} - Pas de presentatie aan voor deze specifieke doelgroep.

**Hoofddoel:** ${options.mainGoal} - Structureer de presentatie om dit doel te bereiken.

**Toon/Stijl:** ${options.toneStyle} - Gebruik deze toon en stijl door de hele presentatie.

${L.structureHeader}

1.  ${L.titleSlide}
2.  ${L.agenda}
3.  ${L.introduction}
4.  ${L.coreSlides(maxCoreSlides)}
5.  ${L.projectStatus}
6.  ${L.learnings}
7.  ${L.improvements}
8.  ${L.todoList}
9.  ${L.imageStyle}

${L.important}

STRICT LIMITS:
- De totale presentatie mag ${options.maxSlides} slides NIET overschrijden.
- Het aantal mainContentSlides mag NIET groter zijn dan ${maxCoreSlides}.
- Pas de inhoud (bullet points, titels) zo aan dat de presentatie binnen het limiet blijft.

${L.analyze}

Transcript:
---
${transcript}
---`;

        // Validate token usage for presentation generation using the final prompt
        const tokenEstimate = tokenManager.estimateTokens(prompt, 2.0);
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, tokenEstimate.totalTokens);
        
        if (!tokenValidation.allowed) {
            displayToast(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.', 'error');
            setTimeout(() => setShowPricingPage(true), 2000);
            setLoadingText('');
            return;
        }
        
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = await getModelForUser(authState.user?.uid || "", "pptExport");
        
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
        const { fileName, slideCount } = await createAndDownloadPptx(presentationData, options.templateFile || null, options.maxSlides);
        setPresentationReport(t('presentationSuccess', { fileName, slideCount }));
        displayToast(t('presentationSuccess', { fileName, slideCount }), 'success');


    } catch (err: any) {
        console.error("Fout bij genereren presentatie:", err);
        displayToast(t('presentationFailed'), 'error');
        setError(`${t("presentationFailed")}: ${err.message || t("unknownError")}`);
    } finally { setLoadingText(''); }
};

  const createAndDownloadPptx = async (data: PresentationData, templateFile: File | null, maxSlides: number) => {
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
            const bodyText = slideData.points.join('\n');
            // Gebruik standaard bullets voor een nette, consistente agenda- en inhoudsweergave
            slide.addText(bodyText, { placeholder: 'body', bullet: true });
        } else {
            slide.addText(slideData.title, { placeholder: "title" });
            if (isTocSlide) {
                const items = slideData.points || [];
                const commonOptions: PptxGenJS.TextPropsOptions = {
                    fontFace: 'Arial',
                    fontSize: 18,
                    color: 'E2E8F0',
                    bullet: { type: 'bullet', indent: 18 },
                    lineSpacing: 26
                };
                // Gebruik twee kolommen wanneer de agenda langer is dan 6 punten
                if (items.length > 6) {
                    const mid = Math.ceil(items.length / 2);
                    slide.addText(items.slice(0, mid).join('\n'), { ...commonOptions, x: 0.75, y: 1.2, w: '40%', h: 4.0 });
                    slide.addText(items.slice(mid).join('\n'), { ...commonOptions, x: '52%', y: 1.2, w: '40%', h: 4.0 });
                } else {
                    slide.addText(items.join('\n'), { ...commonOptions, x: 0.75, y: 1.2, w: '85%', h: 4.0 });
                }
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
    
    // Respecteer het ingestelde maximum aantal slides: 1 is al gebruikt voor de titel.
    let remainingSlots = Math.max(0, (maxSlides || 10) - 1);

    // Agenda
    if (data.agenda?.length > 0 && remainingSlots > 0) {
        addContentSlide({ title: t('inhoudsopgave', 'Agenda'), points: data.agenda }, true);
        remainingSlots--;
    }
    // Introductie
    if (remainingSlots > 0) { addContentSlide(data.introduction); remainingSlots--; }

    // Plan vaste secties zodat we niet over het limiet gaan
    const hasTodo = Array.isArray(data.todoList?.items) && data.todoList.items.filter(i => i?.task).length > 0;
    const reservedFixed = 3 + (hasTodo ? 1 : 0); // status, learnings, improvements, [todo]

    // Kernslides: maximaal wat past binnen het resterende budget
    const coreSlides = Array.isArray(data.mainContentSlides) ? data.mainContentSlides : [];
    const coreCapacity = Math.max(0, remainingSlots - reservedFixed);
    coreSlides.slice(0, coreCapacity).forEach(s => { if (remainingSlots > 0) { addContentSlide(s); remainingSlots--; } });

    // Vaste secties toevoegen zolang er ruimte is
    if (remainingSlots > 0) { addContentSlide(data.projectStatus); remainingSlots--; }
    if (remainingSlots > 0) { addContentSlide(data.learnings); remainingSlots--; }
    if (remainingSlots > 0) { addContentSlide(data.improvements); remainingSlots--; }

    // To-Do slide (indien ruimte)
    const todoItems = hasTodo ? data.todoList.items.filter(item => item.task) : [];
    if (todoItems.length > 0 && remainingSlots > 0) {
        let todoSlide = pptx.addSlide(isCustomTemplate ? {} : { masterName: "MASTER_SLIDE" });
        todoSlide.addText(data.todoList.title, { placeholder: 'title' });
        const tableHeader = [
            { text: t('taak', 'Task'), options: { fontFace: 'Helvetica', bold: true, color: 'FFFFFF', fill: { color: '0891B2' } } },
            { text: t('eigenaar', 'Owner'), options: { fontFace: 'Helvetica', bold: true, color: 'FFFFFF', fill: { color: '0891B2' } } },
            { text: t('deadline', 'Deadline'), options: { fontFace: 'Helvetica', bold: true, color: 'FFFFFF', fill: { color: '0891B2' } } },
        ];
        const tableRows = todoItems.map(item => [{ text: item.task }, { text: '' }, { text: '' }]);
        todoSlide.addTable([tableHeader, ...tableRows], { x: '5%', y: 1.1, w: '90%', colW: [5.4, 1.8, 1.8], autoPage: true, rowH: 0.4, fill: { color: '1E293B' }, color: 'E2E8F0', fontSize: 12, valign: 'middle', border: { type: 'solid', pt: 1, color: '0F172A' } });
        remainingSlots--;
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
            
            // Audio gecomprimeerd
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

  // Split een AudioBuffer in segmenten van een opgegeven maximum aantal samples
  const splitAudioBuffer = (buffer: AudioBuffer, maxSamplesPerSegment: number): AudioBuffer[] => {
    const segments: AudioBuffer[] = [];
    const totalSamples = buffer.length;
    let offset = 0;
    const sampleRate = buffer.sampleRate;

    while (offset < totalSamples) {
      const remaining = totalSamples - offset;
      const segmentLength = Math.min(remaining, maxSamplesPerSegment);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const segment = ctx.createBuffer(1, segmentLength, sampleRate);
      const src = buffer.getChannelData(0);
      const dest = segment.getChannelData(0);
      for (let i = 0; i < segmentLength; i++) {
        dest[i] = src[offset + i];
      }
      segments.push(segment);
      offset += segmentLength;
      ctx.close();
    }
    return segments;
  };

  // Helper om WAV blob in segmenten te splitsen op basis van maximale bytes
  const splitWavBlobByBytes = async (wavBlob: Blob, maxBytes: number): Promise<Blob[]> => {
    try {
      const arrayBuffer = await wavBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const bytesPerSample = 2; // 16-bit PCM mono
      const headerBytes = 44; // WAV header size
      const usableBytes = Math.max(0, maxBytes - headerBytes);
      const maxSamplesPerSegment = Math.floor(usableBytes / bytesPerSample);

      if (maxSamplesPerSegment <= 0) {
        console.warn('splitWavBlobByBytes: maxSamplesPerSegment berekend als 0, retourneer originele blob');
        audioContext.close();
        return [wavBlob];
      }

      const segments = splitAudioBuffer(audioBuffer, maxSamplesPerSegment);
      const segmentBlobs = segments.map(seg => audioBufferToWav(seg));
      // Audio gesegmenteerd in delen
      audioContext.close();
      return segmentBlobs;
    } catch (err) {
      console.error('splitWavBlobByBytes: fout bij splitsen van WAV blob', err);
      return [wavBlob];
    }
  };

  // Helper functie voor fetch requests met timeout en retry logica
  const fetchWithTimeoutAndRetry = async (
    url: string, 
    options: RequestInit = {}, 
    timeoutMs: number = 30000, 
    maxRetries: number = 3
  ): Promise<Response> => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        // Request details for debugging
        // Fetch attempt and request configuration
        
        // Ensure proper headers for FormData
        const requestOptions = { ...options, signal: controller.signal };
        
        // Don't set Content-Type for FormData - let browser set it with boundary
        if (options.body instanceof FormData) {
          // FormData detected - letting browser set Content-Type with boundary
          // Remove any manually set Content-Type header for FormData
          if (requestOptions.headers) {
            const headers = new Headers(requestOptions.headers);
            headers.delete('Content-Type');
            requestOptions.headers = headers;
          }
        }
        
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        // Response status and headers logged
        // Response headers logged

        if (!response.ok) {
          // Try to get response body for better error info
          let errorBody = '';
          try {
            errorBody = await response.clone().text();
            console.error(`❌ Response body:`, errorBody);
          } catch (e) {
            console.error(`❌ Could not read response body:`, e);
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`);
        }
        
        // Request successful
        return response;

      } catch (error: any) {
        clearTimeout(timeoutId);
        lastError = error;

        const message = error.message || 'Unknown error';
        const isConnectionError = message.includes('ERR_CONNECTION') || message.includes('Failed to fetch');
        const isAbort = message.includes('AbortError') || message.includes('The operation was aborted');
        const isHttpError = message.includes('HTTP ');

        if (isHttpError) {
          console.error(`⚠️ Attempt ${attempt} failed: HTTP Error: ${message}`);
        } else if (isAbort) {
          console.error(`⚠️ Attempt ${attempt} failed: Request timeout after ${timeoutMs}ms`);
        } else if (isConnectionError) {
          console.error(`⚠️ Attempt ${attempt} failed: Connection error: ${message}`);
        } else {
          console.error(`⚠️ Attempt ${attempt} failed: ${message}`);
        }

        if (attempt < maxRetries && (isConnectionError || isAbort)) {
          const delay = Math.min(1000 * 2 ** (attempt - 1), 10000);
          // Retry attempt after delay
          await new Promise(res => setTimeout(res, delay));
        }
      }
    }

    throw lastError ?? new Error('Fetch failed after retries');
  };

  const handleTranscribe = async () => {
    const timestamp = new Date().toISOString();
    // Function called - checking audio chunks and URL
    
    if (!audioChunksRef.current.length) {

      // Probeer terug te vallen op audioURL als die bestaat
      if (audioURL) {
        try {
          // Fetching audio from URL
          const fetched = await fetch(audioURL);
          const fetchedBlob = await fetched.blob();
          // Fetched blob processing
          if (fetchedBlob && fetchedBlob.size > 0) {
            audioChunksRef.current = [fetchedBlob];
            // Successfully set audio chunks from URL
          }
        } catch (error) {
          console.error(`❌ [${timestamp}] handleTranscribe: Error fetching audio from URL:`, error);
        }
      }
    }

    if (!audioChunksRef.current.length) {
      // ERROR - No audio to transcribe
      setError(t("noAudioToTranscribe"));
      setStatus(RecordingStatus.ERROR);
      return;
    }
  
    setStatus(RecordingStatus.TRANSCRIBING);
    setLoadingText(t('transcribing'));
    setError(null);
    setAnonymizationReport(null);
    setTranscript(''); setSummary(''); setFaq(''); setLearningDoc(''); setFollowUpQuestions('');
    // Trigger RecapHorizonPanel full reset by bumping startStamp at the start of a new transcription session
    setRecordingStartMs(Date.now());
    
    // Audio compressie als ingeschakeld
    if (audioCompressionEnabled) {
      try {
        setLoadingText(t('compressingAudio', 'Audio wordt gecomprimeerd...'));
        audioChunksRef.current = await compressAudioChunks(audioChunksRef.current);
        // Audio succesvol gecomprimeerd
      } catch (error) {
        console.warn('⚠️ Audio compressie gefaald, doorgaan met originele audio:', error);
      }
    }
    
    // Initialize progress tracking immediately
    setIsSegmentedTranscribing(true);
    setTranscriptionProgress(0);
    
    const transcribeTimestamp = new Date().toISOString();
  
    try {
        // Check internet connection
        if (!navigator.onLine) {
          setError('Geen internetverbinding beschikbaar voor transcriptie');
          setStatus(RecordingStatus.ERROR);
          setLoadingText('');
          return;
        }

        // Validate token usage for transcription
        const estimatedDurationMinutes = audioChunksRef.current.length / 60;
        const estimatedTokens = Math.max(500, estimatedDurationMinutes * 150);
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, estimatedTokens);
        
        if (!tokenValidation.allowed) {
            displayToast(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.', 'error');
            setTimeout(() => setShowPricingPage(true), 2000);
            setStatus(RecordingStatus.ERROR);
            setLoadingText('');
            return;
        }

        // Combine all audio chunks into one blob
        const chunks = audioChunksRef.current;
        const mimeType = (chunks?.[0] as any)?.type || 'audio/webm';
        const audioBlob = new Blob(chunks, { type: mimeType });
        // Starting AssemblyAI transcription - audio blob processing
        
        cancelTranscriptionRef.current = false;
        setLoadingText(t('uploadingToTranscriptionServer'));
        
        // Bepaal functions base URL uit environment variabele met robuuste detectie
        const envBase = (import.meta.env.VITE_FUNCTIONS_BASE_URL || '').trim();
        const effectiveFunctionsBase = 
          envBase && envBase.startsWith('http') 
            ? envBase 
            : window.location.hostname.includes('localhost') 
              ? 'http://localhost:8888' 
              : window.location.origin;
        // Functions base URL configuration
        
        // Bepaal maximale uploadgrootte per segment (configureerbaar)
        // Verlaag limiet voor Netlify productie om body size limieten + base64 overhead te vermijden
        const isNetlifyProd = !window.location.hostname.includes('localhost') && window.location.hostname.includes('netlify.app');
        const DEFAULT_MAX_MB = Number(import.meta.env.VITE_STT_MAX_UPLOAD_MB) || 5; // default 5MB
        const MAX_STT_UPLOAD_MB = isNetlifyProd ? Math.min(DEFAULT_MAX_MB, 4) : DEFAULT_MAX_MB; // 4MB op Netlify prod
        const MAX_UPLOAD_BYTES = MAX_STT_UPLOAD_MB * 1024 * 1024;
        const SAFETY_MARGIN_BYTES = isNetlifyProd ? 512 * 1024 : 128 * 1024; // grotere marge in productie
        const transcribeStartUrl = `${effectiveFunctionsBase}/.netlify/functions/transcribe-start`;

        // Als bestand groter is dan limiet → converteer naar WAV (16k mono) en splits in segmenten
        let blobsToTranscribe: Blob[] = [audioBlob];
        if (audioBlob.size > MAX_UPLOAD_BYTES) {
          // Audio groter dan limiet - voorbereiden op segmentatie
          setLoadingText(`Groot bestand gedetecteerd (${(audioBlob.size/1024/1024).toFixed(1)}MB). Voorbereiden voor upload...`);
          
          try {
            // Forceer compressie naar WAV 16k mono om consistente segmenten te garanderen
            const compressed = await compressAudioChunks([audioBlob]);
            const wavBlob = compressed[0] || audioBlob;
            // Gecomprimeerde WAV grootte verwerkt
            
            // Controleer of compressie voldoende was
            if (wavBlob.size > MAX_UPLOAD_BYTES) {
              setLoadingText(`Splitsen van audio in ${MAX_STT_UPLOAD_MB}MB segmenten (productie-optimalisatie)...`);
              blobsToTranscribe = await splitWavBlobByBytes(wavBlob, MAX_UPLOAD_BYTES - SAFETY_MARGIN_BYTES);
              // Audio gesplitst in segmenten
            } else {
              blobsToTranscribe = [wavBlob];
              // Compressie voldoende, geen segmentatie nodig
            }
          } catch (e) {
            console.error(`[${transcribeTimestamp}] handleTranscribe: Segmentatie mislukt:`, e);
            displayToast('Fout bij voorbereiden van groot audiobestand. Probeer een kleiner bestand.', 'error');
            setStatus(RecordingStatus.ERROR);
            setLoadingText('');
            return;
          }
        }

        let transcribedText = '';
        let globalPollCount = 0;
        // Configureerbare polling parameters via env, met veilige defaults
        const maxPollAttempts = Number(import.meta.env.VITE_STT_MAX_POLL_ATTEMPTS || 0) || 200; // per segment
        const pollIntervalMs = Number(import.meta.env.VITE_STT_POLL_INTERVAL_MS || 0) || 3000; // standaard 3s
        let segmentIndex = 0;
        const totalSegments = blobsToTranscribe.length;
        // Aantal segmenten voor transcriptie

        for (const segmentBlob of blobsToTranscribe) {
          segmentIndex++;
          if (cancelTranscriptionRef.current) break;

          const segmentSizeMB = (segmentBlob.size/1024/1024).toFixed(1);
          setLoadingText(`Segment ${segmentIndex}/${totalSegments} uploaden (${segmentSizeMB}MB)...`);
          setTranscriptionProgress(Math.min(0.95, (segmentIndex - 1) / totalSegments));

          // Segment grootte verwerkt
          const formData = new FormData();
          formData.append('audio', segmentBlob, `segment-${segmentIndex}.wav`);
          // Forward selected source language to backend for AssemblyAI
          formData.append('language_code', (language || 'nl'));
          // POST naar transcribe-start voor segment

          const startResponse = await fetchWithTimeoutAndRetry(
            transcribeStartUrl, 
            { method: 'POST', body: formData }, 
            120000, // 120 seconden timeout voor upload
            3 // 3 retry pogingen
          );
          // Start response status verwerkt
          if (!startResponse.ok) {
            const errorText = await startResponse.text();
            console.error(`[${transcribeTimestamp}] handleTranscribe: ERROR start segment ${segmentIndex}:`, startResponse.status, errorText);
            throw new Error(`Transcriptie start gefaald (segment ${segmentIndex}): ${errorText}`);
          }

          const startData = await startResponse.json();
          const transcriptId = startData.transcriptId;
          // Transcript ID voor segment verkregen

          // Poll per segment
          let transcriptionComplete = false;
          let pollCount = 0;
          while (!transcriptionComplete && pollCount < maxPollAttempts && !cancelTranscriptionRef.current) {
            await new Promise(resolve => setTimeout(resolve, pollIntervalMs)); // wacht pollIntervalMs ms
            pollCount++;
            globalPollCount++;
            
            const pollTimestamp = new Date().toISOString();
            // Polling attempt voor segment
            
            try {
              const transcribeStatusUrl = `${effectiveFunctionsBase}/.netlify/functions/transcribe-status?id=${transcriptId}`;
              // Status request voor segment
              const statusResponse = await fetchWithTimeoutAndRetry(
                transcribeStatusUrl,
                {}, // GET request, geen extra options
                30000, // 30 seconden timeout voor status check
                3 // 3 retry pogingen
              );
              // Status response verwerkt
            
              if (!statusResponse.ok) {
                const errorText = await statusResponse.text();
                console.error(`[${pollTimestamp}] handleTranscribe: ERROR - Status response (segment ${segmentIndex}) not ok:`, statusResponse.status, errorText);
                throw new Error(`Status check gefaald (segment ${segmentIndex}): ${errorText}`);
              }
              
              // Parsing status response JSON
              const statusData = await statusResponse.json();
              // Status data verwerkt
              // Transcriptie status voor segment
              
              switch (statusData.status) {
                case 'queued':
                  // Status QUEUED - in wachtrij
                  setLoadingText(`Segment ${segmentIndex}/${totalSegments} in wachtrij (poging ${pollCount})...`);
                  break;
                case 'processing':
                  // Status PROCESSING - bezig
                  setLoadingText(`Segment ${segmentIndex}/${totalSegments} wordt verwerkt (poging ${pollCount})...`);
                  setTranscriptionProgress(Math.min(0.95, (segmentIndex - 1 + 0.5) / totalSegments));
                  break;
                case 'completed':
                  // Status COMPLETED - voltooid
                  transcriptionComplete = true;
                  const segmentText = statusData.text || '';
                  transcribedText += (transcribedText ? '\n\n' : '') + segmentText;
                  setTranscriptionProgress(Math.min(1, segmentIndex / totalSegments));
                  // Segment transcript lengte verwerkt
                  break;
                case 'error':
                  console.error(`[${pollTimestamp}] handleTranscribe: Status ERROR (segment ${segmentIndex}) - fout:`, statusData.error);
                  throw new Error(`AssemblyAI transcriptie fout (segment ${segmentIndex}): ${statusData.error || 'Onbekende fout'}`);
                default:
                  console.warn(`[${pollTimestamp}] handleTranscribe: Onbekende status (segment ${segmentIndex}): ${statusData.status}`);
              }
            } catch (pollError: any) {
              console.error(`[${pollTimestamp}] handleTranscribe: ERROR - Status check fout (segment ${segmentIndex}, poging ${pollCount}):`, pollError);
              console.error(`[${pollTimestamp}] handleTranscribe: Poll error message:`, pollError.message);
              console.error(`[${pollTimestamp}] handleTranscribe: Poll error stack:`, pollError.stack);
              if (pollCount >= 3) { // After 3 failed attempts, give up
                console.error(`[${pollTimestamp}] handleTranscribe: ERROR - Opgegeven na 3 mislukte pogingen (segment ${segmentIndex})`);
                throw pollError;
              }
            }
          }
        }

        // Polling voltooid voor alle segmenten
        // Cancel status gecontroleerd
        // Set the transcribed text
        // Setting transcript met karakters
        setTranscript(transcribedText);
        // Trigger RecapHorizonPanel full reset by bumping startStamp
        setRecordingStartMs(Date.now());
        
        // Record token usage (estimate for AssemblyAI)
        const estimatedInputTokens = Math.ceil((blobsToTranscribe.reduce((acc, b) => acc + b.size, 0)) / 1000); // Rough estimate across segments
        const estimatedOutputTokens = Math.ceil(transcribedText.length / 4); // Rough estimate
        
        // Recording token usage
        
        try {
          await tokenManager.recordTokenUsage(user.uid, estimatedInputTokens, estimatedOutputTokens);
          const sessionTokens = {
            inputTokens: estimatedInputTokens,
            outputTokens: estimatedOutputTokens,
            totalTokens: estimatedInputTokens + estimatedOutputTokens
          };
          setAudioTokenUsage(sessionTokens);
          
          // Show Diamond toast with session token information
          if (userSubscription === SubscriptionTier.DIAMOND) {
            showDiamondTokenToast(estimatedInputTokens, estimatedOutputTokens, 'diamond', sessionTokens);
          }
          
          // Token usage recorded successfully
        } catch (error) {
          console.error(`[${transcribeTimestamp}] handleTranscribe: Error recording token usage:`, error);
        }
        
        // AssemblyAI transcriptie succesvol voltooid
         
         // Reset AI processing states
         setSummary('');
         setFaq('');
         setLearningDoc('');
         setFollowUpQuestions('');
         setBlogData(null);
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
         
         // Increment usage counters on successful completion
         try {
           if (authState.user) {
             await incrementUserDailyUsage(authState.user.uid, 'audio');
             await incrementUserMonthlySessions(authState.user.uid);
             setDailyAudioCount(prev => prev + 1);
           }
         } catch (error) {
           console.error('Error incrementing usage counters:', error);
         }
         
         setActiveView('transcript');
         
    } catch (error: any) {
        console.error(`[${transcribeTimestamp}] handleTranscribe: FINAL CATCH - AssemblyAI transcription error:`, error);
        console.error(`[${transcribeTimestamp}] handleTranscribe: Error message:`, error.message);
        console.error(`[${transcribeTimestamp}] handleTranscribe: Error stack:`, error.stack);
        console.error(`[${transcribeTimestamp}] handleTranscribe: Full error object:`, error);
        setError(error.message || t('transcriptionError'));
        setStatus(RecordingStatus.ERROR);
    } finally {
        // Cleaning up transcription states
        // Always reset these states
        setTimeout(() => {
            // Resetting final states
            setLoadingText('');
            setIsSegmentedTranscribing(false);
            setTranscriptionProgress(0);
            cancelTranscriptionRef.current = false;
        }, 100);
    }
  };
  
  const downloadTextFile = (text: string, filename: string) => {
    try {
      // Normalize to CRLF for maximum compatibility on Windows editors like Notepad
      const crlf = text.replace(/\r?\n/g, '\r\n');
      const blob = new Blob([crlf], { type: 'text/plain;charset=utf-8' });
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

  // Strip markdown and control characters for clean exports
  const stripMarkdown = (text: string): string => {
    if (!text) return '';
    let cleaned = text.replace(/\r\n|\r/g, '\n');
    // Remove headings markers
    cleaned = cleaned.replace(/^[ \t]*#{1,6}[ \t]*/gm, '');
    cleaned = cleaned.replace(/^\s*(=|\-){3,}\s*$/gm, '');
    // Bold/italic
    cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
    cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');
    // Code blocks/inline
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
    // Links and images
    cleaned = cleaned.replace(/!\[(.*?)\]\((.*?)\)/g, '$1');
    cleaned = cleaned.replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');
    // Blockquotes
    cleaned = cleaned.replace(/^[ \t]*>+[ \t]?/gm, '');
    // Normalize unordered bullets and common bullet symbols
    cleaned = cleaned.replace(/^[ \t]*([*+\-])\s+/gm, '- ');
    cleaned = cleaned.replace(/[•·▪◦]/g, '-');
    // Normalize ordered list markers "1)" or "1."
    cleaned = cleaned.replace(/^[ \t]*(\d{1,3})[\.)]\s+/gm, '$1. ');
    // Control/non-printable
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    // Remove lines of only formatting garbage
    cleaned = cleaned.replace(/^\s*[&*_~`\-]+\s*$/gm, '');
    cleaned = cleaned.replace(/^\s*&+\s*$/gm, '');
    // Collapse excessive blank lines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    // Trim trailing spaces per line
    cleaned = cleaned.split('\n').map(l => l.replace(/\s+$/, '')).join('\n');
    return cleaned.trim();
  };

  // Convert markdown to well-formatted plain text preserving structure
  const markdownToPlainText = (text: string): string => {
    if (!text) return '';
    let formatted = text.replace(/\r\n|\r/g, '\n');
    
    // Convert headers to uppercase with underlines
    formatted = formatted.replace(/^[ \t]*#{1,6}[ \t]*(.+)$/gm, (match, title) => {
      const cleanTitle = title.trim().toUpperCase();
      return `\n${cleanTitle}\n${'='.repeat(cleanTitle.length)}\n`;
    });
    
    // Convert bold to uppercase, keep content
    formatted = formatted.replace(/(\*\*|__)(.*?)\1/g, (match, marker, content) => content.toUpperCase());
    
    // Keep italic content but remove markers
    formatted = formatted.replace(/(\*|_)(.*?)\1/g, '$2');
    
    // Remove code blocks but keep content
    formatted = formatted.replace(/```[\s\S]*?```/g, '');
    formatted = formatted.replace(/`([^`]+)`/g, '$1');
    
    // Convert links to "text (url)" format
    formatted = formatted.replace(/!\[(.*?)\]\((.*?)\)/g, '$1');
    formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');
    
    // Convert blockquotes to indented text
    formatted = formatted.replace(/^[ \t]*>+[ \t]?(.*)$/gm, '    $1');
    
    // Convert unordered lists to bullets with proper spacing
    formatted = formatted.replace(/^[ \t]*([*+\-])[ \t]+(.*)$/gm, '• $2');
    
    // Convert ordered lists with proper numbering
    formatted = formatted.replace(/^[ \t]*(\d{1,3})[\.)]\s+(.*)$/gm, '$1. $2');
    
    // Clean up control characters but preserve structure
    formatted = formatted.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
    
    // Remove lines of only formatting garbage
    formatted = formatted.replace(/^\s*[&*_~`\-]+\s*$/gm, '');
    
    // Preserve paragraph breaks but limit excessive spacing
    formatted = formatted.replace(/\n{4,}/g, '\n\n\n');
    
    // Trim trailing spaces per line but preserve structure
    formatted = formatted.split('\n').map(l => l.replace(/\s+$/, '')).join('\n');
    
    // Convert to CRLF for Windows compatibility
    formatted = formatted.replace(/\n/g, '\r\n');
    
    return formatted.trim();
  };

  const handleExportTranscriptPdf = () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      // Try to register a Unicode font; fall back to helvetica (non-blocking)
      import('./src/utils/pdfFont')
        .then(({ tryUseUnicodeFont }) => tryUseUnicodeFont(doc))
        .catch(() => {});
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const usableWidth = pageWidth - margin * 2;
      let y = margin;

      // Title
      doc.setFont(doc.getFont().fontName || 'helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(t('transcript'), margin, y);
      y += 22;

      // Body
      doc.setFont(doc.getFont().fontName || 'helvetica', 'normal');
      doc.setFontSize(12);
      const bodyText = markdownToPlainText(transcript || t('noTranscriptAvailable'));
      const rawLines = bodyText.split('\n');
      const addPageIfNeeded = (h: number) => {
        if (y + h > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
      };
      for (const raw of rawLines) {
        const line = raw.trimEnd();
        if (line.trim() === '') {
          // blank line = paragraph spacer
          y += 8;
          continue;
        }
        // Bullets
        const ulMatch = line.match(/^\s*-\s+(.*)$/);
        const olMatch = line.match(/^\s*(\d{1,3})\.\s+(.*)$/);
        if (ulMatch) {
          const text = ulMatch[1];
          const indent = 20;
          const bullet = '•';
          const wrapped = doc.splitTextToSize(text, usableWidth - indent) as string[];
          addPageIfNeeded(16 * wrapped.length);
          // bullet symbol
          doc.text(bullet, margin + 6, y);
          // lines indented
          wrapped.forEach((w) => {
            doc.text(w, margin + indent, y);
            y += 16;
          });
          y += 2;
          continue;
        }
        if (olMatch) {
          const num = olMatch[1];
          const text = olMatch[2];
          const indent = 26;
          const wrapped = doc.splitTextToSize(text, usableWidth - indent) as string[];
          addPageIfNeeded(16 * wrapped.length);
          doc.text(num + '.', margin + 2, y);
          wrapped.forEach((w) => {
            doc.text(w, margin + indent, y);
            y += 16;
          });
          y += 2;
          continue;
        }
        // Normal paragraph
        const wrapped = doc.splitTextToSize(line, usableWidth) as string[];
        addPageIfNeeded(16 * wrapped.length);
        wrapped.forEach((w) => {
          doc.text(w, margin, y);
          y += 16;
        });
        y += 4; // paragraph spacing
      }

      doc.save('transcript.pdf');
      displayToast(t('downloadStarted', 'Download gestart'), 'success');
    } catch (e) {
      console.error('PDF export failed', e);
      displayToast(t('downloadFailed', 'Download mislukt'), 'error');
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

    // Get monthly audio limit for user tier
    const getMonthlyAudioLimit = (tier: string) => {
      const monthlyLimits = {
        'free': 60,
        'silver': 500,
        'gold': 1000,
        'enterprise': 1000,
        'diamond': 2000
      };
      return monthlyLimits[tier] || 60;
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
              <span className="text-sm text-slate-600 dark:text-slate-400">Sessie opnametijd</span>
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

          {/* Monthly Audio Usage */}
          <div className="mb-4">
            {(() => {
              // Base used minutes from profile (may be fractional)
              const baseUsed = authState.user?.monthlyAudioMinutes || 0;
              // While recording, update live with current session duration
              const liveUsed = baseUsed + (status === RecordingStatus.RECORDING ? currentDurationMinutes : 0);
              const limit = getMonthlyAudioLimit(userSubscription);
              const usedDisplay = Math.round(liveUsed);
              const remainingDisplay = Math.max(0, limit - usedDisplay);
              const percentUsed = Math.min((liveUsed / limit) * 100, 100);
              return (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Maandelijks gebruik</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {usedDisplay}/{limit} min
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300 bg-blue-500"
                      style={{ width: `${percentUsed}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Resterend: {remainingDisplay} minuten
                  </div>
                </>
              );
            })()}
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
        <div className="flex justify-center gap-4 flex-wrap">
          {status === RecordingStatus.RECORDING ? (
            <>
              <button 
                onClick={pauseRecording} 
                disabled={isProcessing} 
                className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
              >
                <PauseIcon className="w-5 h-5" /> 
                <span className="text-base font-semibold">{t('pause')}</span>
              </button>
              <button 
                onClick={stopRecording} 
                disabled={isProcessing} 
                className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
              >
                <StopIcon className="w-5 h-5" /> 
                <span className="text-base font-semibold">{t('stop')}</span>
              </button>
            </>
          ) : status === RecordingStatus.PAUSED ? (
            <>
              <button 
                onClick={resumeRecording} 
                disabled={isProcessing} 
                className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-green-500 text-white hover:bg-green-600 disabled:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
              >
                <PlayIcon className="w-5 h-5" /> 
                <span className="text-base font-semibold">{t('resume')}</span>
              </button>
              <button 
                onClick={stopRecording} 
                disabled={isProcessing} 
                className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
              >
                <StopIcon className="w-5 h-5" /> 
                <span className="text-base font-semibold">{t('stop')}</span>
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
              {/* Reserveer vaste ruimte voor de audiostatus om 'springen' te voorkomen */}
              <div className="h-5 flex items-center justify-center">
                {showNoInputHint ? (
                  <div className="flex items-center gap-2 text-orange-500 dark:text-orange-400">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs">Geen audio gedetecteerd</span>
                  </div>
                ) : avgInputLevel > 0.01 ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs">Audio gedetecteerd</span>
                  </div>
                ) : (
                  // Onzichtbare placeholder houdt de hoogte gelijk
                  <span className="text-xs opacity-0">placeholder</span>
                )}
              </div>
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
                  setBlogData(null);
                  setExplainData(null);
                  setQuizQuestions(null);
                  // Trigger RecapHorizonPanel full reset by bumping startStamp
                  setRecordingStartMs(Date.now());
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
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
        
        // Create language-specific prompt
        const notExplicitlyDiscussed = outputLanguage === 'nl' ? '[Niet expliciet besproken]' : 
                                     outputLanguage === 'de' ? '[Nicht explizit besprochen]' :
                                     outputLanguage === 'fr' ? '[Pas explicitement discuté]' :
                                     outputLanguage === 'es' ? '[No discutido explícitamente]' :
                                     outputLanguage === 'pt' ? '[Não discutido explicitamente]' :
                                     '[Not explicitly discussed]';
        
        const sys = `Act as a seasoned McKinsey-style business analyst creating an extremely concise one-slide Executive Summary in OSC-R-B-C format (Objective, Situation, Complication, Resolution, Benefits, Call to Action). Use at most 1-3 short sentences per section. If a section is not explicitly present, output "${notExplicitlyDiscussed}". Write the entire response in ${outputLanguage} language. Return ONLY valid JSON with keys: objective, situation, complication, resolution, benefits, call_to_action.`;
        const prompt = `${sys}\n\nTranscript:\n${getTranscriptSlice(transcript, 20000)}`;
        const estimatedTokens = tokenCounter.countPromptTokens(prompt) + 500; // Add buffer for response
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, estimatedTokens);
        
        if (!tokenValidation.allowed) {
          setError(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
          setTimeout(() => setShowPricingPage(true), 2000);
          setLoadingText('');
          return;
        }
        const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
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
          objective: data.objective || notExplicitlyDiscussed,
          situation: data.situation || notExplicitlyDiscussed,
          complication: data.complication || notExplicitlyDiscussed,
          resolution: data.resolution || notExplicitlyDiscussed,
          benefits: data.benefits || notExplicitlyDiscussed,
          call_to_action: data.call_to_action || notExplicitlyDiscussed
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
        const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
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
        const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
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
        const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
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
        const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
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

    // Shared function to generate topics for both TeachMe and ShowMe
    const generateSharedTopics = async () => {
      // Check if topics already exist
      if (sharedTopics.length > 0) {
        return sharedTopics;
      }

      // Check transcript length based on user tier
      const effectiveTier = userSubscription;
      const transcriptValidation = subscriptionService.validateTranscriptLength(effectiveTier, transcript.length, t);
      if (!transcriptValidation.allowed) {
        setError(transcriptValidation.reason || 'Transcript te lang voor je huidige abonnement. Upgrade je abonnement voor langere transcripten.');
        setTimeout(() => setShowPricingPage(true), 2000);
        return [];
      }
      
      try {
        setIsGeneratingSharedTopics(true);
        setLoadingText(t('teachMeGeneratingTopics'));
        
        // Validate token usage for topic generation
        const inputLanguage = getGeminiCode(language || 'en');
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
        
        const sys = `Act as an educational content analyzer. Analyze the **${inputLanguage}** transcript and extract 0-10 educational topics that could be taught based on the content.

Requirements:
- Extract topics that are educational and can be explained to learners
- Each topic should have a clear, descriptive title (max 100 characters)
- Topics should be specific enough to create focused learning content
- Return topics in **${outputLanguage}**
- If no educational topics can be extracted, return an empty array

Format your response as a JSON array of objects with this structure:
[
  {
    "id": "topic1",
    "title": "Topic Title",
    "description": "Brief description of what this topic covers"
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or formatting.`;

        const prompt = `${sys}\n\nTranscript:\n${getTranscriptSlice(transcript, 15000)}`;
        const estimatedTokens = tokenCounter.countPromptTokens(prompt) + 1000; // Add buffer for response
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, estimatedTokens);
        
        if (!tokenValidation.allowed) {
          setError(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
          setTimeout(() => setShowPricingPage(true), 2000);
          return [];
        }
        
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
        const res = await ai.models.generateContent({ model: modelName, contents: prompt });
        
        // Track token usage with TokenManager
        try {
          const promptTokens = tokenCounter.countPromptTokens(prompt);
          const responseTokens = tokenCounter.countResponseTokens(res.text);
          await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
        } catch (error) {
          console.error('Error recording token usage for shared topic generation:', error);
        }

        let text = res.text || '';
        text = text.replace(/```[a-z]*|```/gi, '').trim();
        
        const topics: TeachMeTopic[] = JSON.parse(text);
        setSharedTopics(topics);
        return topics;
        
      } catch (e: any) {
        setError(`${t('generationFailed', { type: 'Topics' })}: ${e.message || t('unknownError')}`);
        return [];
      } finally {
        setIsGeneratingSharedTopics(false);
        setLoadingText('');
      }
    };



    const handleGenerateTeachMe = async () => {
      try {
        setIsGeneratingTeachMe(true);
        
        const topics = await generateSharedTopics();
        if (topics.length === 0) {
          setIsGeneratingTeachMe(false);
          return;
        }
        
        setTeachMeStep('topics');
        setActiveView('teachMe');
        
      } catch (e: any) {
        setError(`${t('generationFailed', { type: 'Teach Me Topics' })}: ${e.message || t('unknownError')}`);
      } finally {
        setIsGeneratingTeachMe(false);
      }
    };

    const handleGenerateTeachMeContent = async (topic: TeachMeTopic, method: TeachMeMethod) => {
      try {
        setIsGeneratingTeachMe(true);
        setLoadingText(t('teachMeGeneratingContent'));
        
        // Validate token usage for content generation
        const inputLanguage = getGeminiCode(language || 'en');
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
        
        const sys = `${method.prompt}

Topic: ${topic.title}
Topic Description: ${topic.description}

Requirements:
- Create educational content in **${outputLanguage}**
- Use your general knowledge about this topic, not just the transcript content
- Make the content engaging and educational
- Structure the content clearly with appropriate formatting
- Aim for comprehensive coverage of the topic

IMPORTANT: Start DIRECTLY with the educational content, without introduction or explanation about how it was written.`;
        
        const prompt = `${sys}\n\nContext from transcript:\n${getTranscriptSlice(transcript, 10000)}`;
        const estimatedTokens = tokenCounter.countPromptTokens(prompt) + 2000; // Add buffer for response
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, estimatedTokens);
        
        if (!tokenValidation.allowed) {
          setError(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
          setTimeout(() => setShowPricingPage(true), 2000);
          setLoadingText('');
          setIsGeneratingTeachMe(false);
          return;
        }
        
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
        const res = await ai.models.generateContent({ model: modelName, contents: prompt });
        
        // Track token usage with TokenManager
        try {
          const promptTokens = tokenCounter.countPromptTokens(prompt);
          const responseTokens = tokenCounter.countResponseTokens(res.text);
          await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
        } catch (error) {
          console.error('Error recording token usage for teach me content generation:', error);
        }

        let content = res.text || '';
        content = content.replace(/```[a-z]*|```/gi, '').trim();
        
        setTeachMeData({
          topic,
          method,
          content
        });
        
        setTeachMeStep('contentDisplay');
        
      } catch (e: any) {
        setError(`${t('generationFailed', { type: 'Teach Me Content' })}: ${e.message || t('unknownError')}`);
      } finally {
        setLoadingText('');
        setIsGeneratingTeachMe(false);
      }
    };

    const handleGenerateShowMe = async () => {
      try {
        setIsGeneratingShowMe(true);
        
        const topics = await generateSharedTopics();
        if (topics.length === 0) {
          setIsGeneratingShowMe(false);
          return;
        }
        
        setActiveView('showMe');
        
      } catch (e: any) {
        setError(`${t('generationFailed', { type: 'Show Me Topics' })}: ${e.message || t('unknownError')}`);
      } finally {
        setIsGeneratingShowMe(false);
      }
    };

    const handleSearchShowMeContent = async (topic: TeachMeTopic) => {
      try {
        setIsSearchingShowMeContent(true);
        setLoadingText(t('showMeSearchingContent'));
        
        // Validate token usage for content search
        const inputLanguage = getGeminiCode(language || 'en');
        const outputLanguage = getGeminiCode(outputLang || language || 'en');
        
        // Get language-specific search context for news articles
        const getNewsSearchContext = (lang: string) => {
          switch (lang.toLowerCase()) {
            case 'nl':
              return {
                country: 'Nederland',
                sources: 'Nederlandse nieuwsbronnen zoals NOS, RTL Nieuws, Volkskrant, NRC',
                searchSuffix: '+Nederland'
              };
            case 'de':
              return {
                country: 'Deutschland',
                sources: 'Duitse nieuwsbronnen zoals Spiegel, Zeit, FAZ, Süddeutsche Zeitung',
                searchSuffix: '+Deutschland'
              };
            case 'fr':
              return {
                country: 'France',
                sources: 'Franse nieuwsbronnen zoals Le Monde, Le Figaro, Liberation, France24',
                searchSuffix: '+France'
              };
            case 'es':
              return {
                country: 'España',
                sources: 'Spaanse nieuwsbronnen zoals El País, El Mundo, ABC, La Vanguardia',
                searchSuffix: '+España'
              };
            case 'pt':
              return {
                country: 'Portugal',
                sources: 'Portugese nieuwsbronnen zoals Público, Correio da Manhã, Expresso, Observador',
                searchSuffix: '+Portugal'
              };
            default:
              return {
                country: 'international',
                sources: 'internationale nieuwsbronnen zoals BBC, CNN, Reuters, Associated Press',
                searchSuffix: ''
              };
          }
        };
        
        const newsContext = getNewsSearchContext(outputLang || language || 'en');
        
        const sys = `You are an AI assistant that helps find relevant TED Talks and news articles for educational topics.

Topic: ${topic.title}
Topic Description: ${topic.description}

Requirements:
- Find 3-5 relevant TED Talks and 3-5 relevant news articles
- Use your knowledge to suggest real, existing content
- Provide accurate titles, speakers/authors, and brief descriptions
- Return content in **${outputLanguage}**
- Focus on high-quality, educational content
- Rate each item's relevance from 1-5 stars (including half stars like 4.5) where 5 = VERY relevant, 1 = not so relevant
- Sort TED Talks by relevance rating (highest to lowest)
- Sort News Articles by relevance rating (highest to lowest)
- For TED Talk URLs: Use YouTube search format: https://www.youtube.com/results?search_query={TITLE}+TED (URL encode the title)
- For News Article URLs: Use Google search format: https://www.google.com/search?q={TITLE}${newsContext.searchSuffix} (URL encode)
- For news articles, prioritize content from ${newsContext.sources} when possible
- Focus on news from ${newsContext.country} context when relevant to the topic

Format your response as a JSON object with this structure:
{
  "tedTalks": [
    {
      "title": "TED Talk Title",
      "speaker": "Speaker Name",
      "description": "Brief description of the talk",
      "url": "https://www.youtube.com/results?search_query=TED+Talk+Title+TED",
      "relevanceRating": 4.5
    }
  ],
  "newsArticles": [
    {
      "title": "Article Title",
      "author": "Author Name",
      "publication": "Publication Name",
      "description": "Brief description of the article",
      "url": "https://www.google.com/search?q=Article+Title${newsContext.searchSuffix}",
      "relevanceRating": 4.0
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no additional text or formatting.`;
        
        const prompt = `${sys}\n\nContext from transcript:\n${getTranscriptSlice(transcript, 10000)}`;
        const estimatedTokens = tokenCounter.countPromptTokens(prompt) + 2000; // Add buffer for response
        const tokenValidation = await tokenManager.validateTokenUsage(user.uid, userSubscription, estimatedTokens);
        
        if (!tokenValidation.allowed) {
          setError(tokenValidation.reason || 'Token limiet bereikt. Upgrade je abonnement voor meer AI-generaties.');
          setTimeout(() => setShowPricingPage(true), 2000);
          setLoadingText('');
          setIsSearchingShowMeContent(false);
          return;
        }
        
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
        const res = await ai.models.generateContent({ model: modelName, contents: prompt });
        
        // Track token usage with TokenManager
        try {
          const promptTokens = tokenCounter.countPromptTokens(prompt);
          const responseTokens = tokenCounter.countResponseTokens(res.text);
          await tokenManager.recordTokenUsage(user.uid, promptTokens, responseTokens);
        } catch (error) {
          console.error('Error recording token usage for show me content search:', error);
        }

        let content = res.text || '';
        content = content.replace(/```[a-z]*|```/gi, '').trim();
        
        try {
          const searchResults = JSON.parse(content);
          const showMePayload: ShowMeData = {
            topic: topic,
            tedTalks: searchResults.tedTalks || [],
            newsArticles: searchResults.newsArticles || []
          };
          setShowMeData(showMePayload);
          setShowMeSelectedTopic(topic);
        } catch (parseError) {
          console.error('Failed to parse search results JSON:', parseError);
          setError('Failed to search content. Please try again.');
        }
        
      } catch (e: any) {
        setError(`${t('generationFailed', { type: 'Show Me Content' })}: ${e.message || t('unknownError')}`);
      } finally {
        setLoadingText('');
        setIsSearchingShowMeContent(false);
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
        const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
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
          const svg = await renderMindmapSvg(cleaned, theme);
          if (svg) setMindmapSvg(svg);
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
                      setBlogData(null);
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
                  const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
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
                    const svg = await renderMindmapSvg(cleaned, theme);
                    if (svg) setMindmapSvg(svg);
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
            <div className="overflow-auto max-h-[80vh]" dangerouslySetInnerHTML={{ __html: mindmapSvg }} />
          ) : (
                                <pre className="text-sm whitespace-pre-wrap bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 overflow-auto max-h-[80vh]">{renderMarkdown(mindmapMermaid)}</pre>
          )}
        </div>
      );
    };



    const primaryActions: any[] = [
        { id: 'transcript', type: 'view', icon: TranscriptIcon, label: () => isAnonymized ? t('transcriptAnonymized') : t('transcript') },
        { id: 'anonymize', type: 'action', icon: AnonymizeIcon, label: () => t('anonymize'), onClick: handleAnonymizeTranscript, disabled: () => isProcessing || isAnonymized || !transcript.trim() },
        

        { id: 'presentation', type: 'action', icon: PresentationIcon, label: () => t('exportPPT'), onClick: () => {
            // Check if user has access to PowerPoint export
            const effectiveTier = userSubscription;
                if (!subscriptionService.isFeatureAvailable(effectiveTier, 'exportPpt')) {
        displayToast('Helaas heeft u niet genoeg credits om deze functie uit te voeren. Klik hier om te upgraden naar een hoger abonnement.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }
            setShowPptOptions(true);
        }, disabled: () => isProcessing },
        { id: 'businessCase', type: 'action', icon: BusinessCaseIcon, label: () => t('businessCase'), onClick: () => {
            // Check if user has access to business case generation
            // Zakelijke Case knop geklikt
            // Check feature availability for businessCase
            const effectiveTier = userSubscription;
                if (!subscriptionService.isFeatureAvailable(effectiveTier, 'businessCase')) {
        displayToast('Helaas heeft u niet genoeg credits om deze functie uit te voeren. Klik hier om te upgraden naar een hoger abonnement.', 'error');
        setTimeout(() => setShowPricingPage(true), 2000);
        return;
    }
            // Switch to analysis mode and open Business Case view
            setMainMode('analysis');
            setSelectedAnalysis('businessCase');
            handleTabClick('businessCase');
        }, disabled: () => isProcessing },
        // AI Discussion - alleen zichtbaar voor Gold, Enterprise, Diamond
        ...((userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.ENTERPRISE || userSubscription === SubscriptionTier.DIAMOND) ? 
            [{ id: 'aiDiscussion', type: 'action', icon: AIDiscussionIcon, label: () => t('aiDiscussion'), onClick: () => {
                // Check if user has access to AI discussion feature
                // AI Discussie knop geklikt
                // Check feature availability for aiDiscussion
                const effectiveTier = userSubscription;
                if (!subscriptionService.isFeatureAvailable(effectiveTier, 'aiDiscussion')) {
                    displayToast(t('aiDiscussionAccessRestricted'), 'error');
                    setTimeout(() => setShowPricingPage(true), 2000);
                    return;
                }
                // Switch to analysis mode and open AI Discussion view
                setMainMode('analysis');
                setSelectedAnalysis('aiDiscussion');
                setActiveView('aiDiscussion');
            }, disabled: () => isProcessing }] : []),
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
        { id: 'teachMe', type: 'view', icon: TeachMeIcon, label: () => t('teachMe') },
        { id: 'specials', type: 'view', icon: SpecialsIcon, label: () => t('specials', 'Specials') },
        // Show me tab - alleen zichtbaar voor Gold, Enterprise, Diamond
        ...((userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.ENTERPRISE || userSubscription === SubscriptionTier.DIAMOND) ? 
            [{ id: 'showMe', type: 'view', icon: TeachMeIcon, label: () => t('showMe') }] : []),
        // Thinking Partner tab - alleen zichtbaar voor Gold, Enterprise, Diamond
        ...((userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.ENTERPRISE || userSubscription === SubscriptionTier.DIAMOND) ? 
            [{ id: 'thinkingPartner', type: 'view', icon: ThinkingPartnerIcon, label: () => t('thinkingPartner') }] : []),
        // Opportunities tab - alleen zichtbaar voor Silver, Gold, Enterprise, Diamond
        ...((userSubscription === SubscriptionTier.SILVER || userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.ENTERPRISE || userSubscription === SubscriptionTier.DIAMOND) ? 
            [{ id: 'opportunities', type: 'view', icon: OpportunitiesIcon, label: () => t('opportunities') }] : []),
        // McKinsey tab - alleen zichtbaar voor Gold, Enterprise, Diamond
        ...((userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.ENTERPRISE || userSubscription === SubscriptionTier.DIAMOND) ? 
            [{ id: 'mckinsey', type: 'view', icon: OpportunitiesIcon, label: () => t('mckinsey') }] : []),
        // Email tab - alleen zichtbaar voor Gold, Enterprise, Diamond en bij email import
        ...((userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.ENTERPRISE || userSubscription === SubscriptionTier.DIAMOND || sessionType === SessionType.EMAIL_IMPORT) ? 
            [{ id: 'email', type: 'view', icon: MailIcon, label: () => t('email') }] : []),
        // Social Post tab - alleen zichtbaar voor Gold, Enterprise, Diamond
        ...((userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.ENTERPRISE || userSubscription === SubscriptionTier.DIAMOND) ? 
            [{ id: 'socialPost', type: 'view', icon: SocialPostIcon, label: () => t('socialPost') }] : [])
    ];

    const analysisContent: Record<ViewType, string> = { transcript, summary, faq, learning: learningDoc, followUp: followUpQuestions, chat: '', keyword: '', sentiment: '', mindmap: '', storytelling: storytellingData?.story || '', blog: blogData, businessCase: businessCaseData?.businessCase || '', exec: executiveSummaryData ? JSON.stringify(executiveSummaryData) : '', quiz: quizQuestions ? quizQuestions.map(q => `${q.question}\n${q.options.map(opt => `${opt.label}. ${opt.text}`).join('\n')}\n${t('correctAnswer')}: ${q.correct_answer_label}`).join('\n\n') : '', explain: explainData?.explanation || '', teachMe: teachMeData?.content || '', showMe: showMeData ? `${showMeData.tedTalks.map(talk => `${talk.title} - ${talk.url}`).join('\n')}\n\n${showMeData.newsArticles.map(article => `${article.title} - ${article.url}`).join('\n')}` : '', thinkingPartner: thinkingPartnerAnalysis || '', aiDiscussion: '', opportunities: '', mckinsey: '', email: emailContent || '', socialPost: Array.isArray(socialPostData?.post) ? socialPostData.post.join('\n\n') : (socialPostData?.post || ''), socialPostX: Array.isArray(socialPostXData?.post) ? socialPostXData.post.join('\n\n') : (socialPostXData?.post || ''), specials: '', main: '', podcast: '' };

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
        if (view === 'businessCase') {
            if (!businessCaseData?.businessCase) {
                const defaultAudienceOptions = [
                  t('businessCaseTargetAudienceOptions.boardOfDirectors', 'Board of Directors'),
                  t('businessCaseTargetAudienceOptions.investors', 'Investors'),
                  t('businessCaseTargetAudienceOptions.teamLeaders', 'Team Leaders'),
                  t('businessCaseTargetAudienceOptions.colleagues', 'Colleagues')
                ];
                const firstAudience = defaultAudienceOptions[0];
                setBusinessCaseData({ businessCase: '', businessCaseType: 'Kostenbesparing', targetAudience: firstAudience, length: 'concise' });
            }
            setActiveView('businessCase');
            return;
        }
        if (view === 'aiDiscussion') {
            setActiveView('aiDiscussion');
            return;
        }
        if (view === 'explain' && explainData?.explanation) { setActiveView('explain'); return; }
        if (view === 'email' && emailContent) { setActiveView('email'); return; }
        if (view === 'socialPost' && socialPostData?.post) { setActiveView('socialPost'); return; }
        if (view === 'socialPostX' && socialPostXData?.post) { setActiveView('socialPostX'); return; }
        if (view === 'thinkingPartner' && thinkingPartnerAnalysis) { setActiveView('thinkingPartner'); return; }


        // If content doesn't exist, generate it (except for social posts which need manual generation)
        if (view === 'summary') {
            // Navigate to summary view with inline options (do not auto-open modal)
            setActiveView('summary');
        } else if (['faq', 'learning', 'followUp'].includes(view)) {
            handleGenerateAnalysis(view, 1);
        } else if (view === 'socialPost' || view === 'socialPostX') {
            // Just switch to the view without auto-generating content
            setActiveView(view);
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
            setActiveView('blog');
        } else if (view === 'businessCase' as ViewType) {
            // Initialize business case data if not exists
            if (!businessCaseData) {
                const defaultAudienceOptions = [
                  t('businessCaseTargetAudienceOptions.boardOfDirectors', 'Board of Directors'),
                  t('businessCaseTargetAudienceOptions.investors', 'Investors'),
                  t('businessCaseTargetAudienceOptions.teamLeaders', 'Team Leaders'),
                  t('businessCaseTargetAudienceOptions.colleagues', 'Colleagues')
                ];
                const firstAudience = defaultAudienceOptions[0];
                setBusinessCaseData({
                    businessCaseType: 'Kostenbesparing',
                    targetAudience: firstAudience,
                    length: 'concise',
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
        } else if (view === 'teachMe') {
            // Check if we have existing data, if not start the flow
            if (teachMeData?.content) {
                setActiveView('teachMe');
            } else if (sharedTopics.length > 0) {
                setActiveView('teachMe');
            } else {
                // Start the teach me flow by generating topics
                handleGenerateTeachMe();
            }
        } else if (view === 'showMe') {
            // Check if user has access to showMe feature
            const effectiveTier = userSubscription;
            if (!subscriptionService.isFeatureAvailable(effectiveTier, 'showMe')) {
                displayToast(t('showMeAccessRestricted'), 'error');
                setTimeout(() => setShowPricingPage(true), 2000);
                return;
            }
            
            // Check if we have existing data, if not start the flow
            if (showMeData) {
                setActiveView('showMe');
            } else if (sharedTopics.length > 0) {
                setActiveView('showMe');
            } else {
                // Start the show me flow by generating topics
                handleGenerateShowMe();
            }
        } else if (view === 'thinkingPartner') {
            // Check if user has access to thinking partner feature
            const effectiveTier = userSubscription;
            if (!subscriptionService.isFeatureAvailable(effectiveTier, 'thinkingPartner')) {
                displayToast(t('thinkingPartnerAccessRestricted'), 'error');
                setTimeout(() => setShowPricingPage(true), 2000);
                return;
            }
            setActiveView('thinkingPartner');
        } else if (view === 'aiDiscussion' as ViewType) {
            // Check if user has access to AI discussion feature
            const effectiveTier = userSubscription;
            if (!subscriptionService.isFeatureAvailable(effectiveTier, 'aiDiscussion')) {
                displayToast(t('aiDiscussionAccessRestricted'), 'error');
                setTimeout(() => setShowPricingPage(true), 2000);
                return;
            }
            setActiveView('aiDiscussion');
        } else if (view === 'opportunities') {
            // Check if user has access to opportunities feature
            const effectiveTier = userSubscription;
            if (!subscriptionService.isFeatureAvailable(effectiveTier, 'opportunities')) {
                displayToast(t('opportunitiesAccessRestricted'), 'error');
                setTimeout(() => setShowPricingPage(true), 2000);
                return;
            }
            setActiveView('opportunities');
        } else if (view === 'mckinsey') {
            // Check if user has access to McKinsey feature
            const effectiveTier = userSubscription;
            if (!subscriptionService.isFeatureAvailable(effectiveTier, 'mckinsey')) {
                displayToast(t('mckinseyAccessRestricted'), 'error');
                setTimeout(() => setShowPricingPage(true), 2000);
                return;
            }
            setActiveView('mckinsey');
        } else if (view === 'email') {
            setActiveView('email');
        } else if (view === 'mindmap') {
            // Generate mindmap if it doesn't exist
            (async () => {
              try {
                setLoadingText(t('generating', { type: 'Mindmap' }));
                const ai = new GoogleGenAI({ apiKey: apiKey });
                // Using ModelManager for mindmap generation
                const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
                const sys = `You are a mindmap generator. Output ONLY Mermaid mindmap syntax (mindmap\n  root(...)) without code fences. Use at most 3 levels, 6-12 nodes total, concise labels.`;
                const prompt = `${sys}\n\nTranscript:\n${transcript.slice(0, 12000)}`;
                const res = await ai.models.generateContent({ model: modelName, contents: prompt });
                const raw = res.text || '';
                const cleaned = raw.replace(/```[a-z]*|```/gi, '').trim();
                if (!/^mindmap\b/.test(cleaned)) throw new Error(t('invalidMindmapOutput', 'Invalid mindmap output'));
                setMindmapMermaid(cleaned);
                try {
                  const svg = await renderMindmapSvg(cleaned, theme);
                  if (svg) setMindmapSvg(svg);
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
        // Handle transcript mode
        if (mainMode === 'transcript' && activeView === 'transcript') {
            return (
                <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] overflow-y-auto">
                    <div className="absolute top-4 right-2 sm:right-8">
                        <div 
                            ref={actionButtonsRef}
                            className="relative"
                        >
                            <button 
                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors cursor-pointer"
                                aria-label={t('actions')}
                                onClick={() => setShowActionButtons(!showActionButtons)}
                                title={t('actions', 'Acties')}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="5" r="2"/>
                                    <circle cx="12" cy="12" r="2"/>
                                    <circle cx="12" cy="19" r="2"/>
                                </svg>
                            </button>
                            {showActionButtons && (
                                <div 
                                    className="absolute top-0 right-2 sm:right-10 flex flex-wrap gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 mr-0 sm:-mr-2 max-w-[calc(100vw-2rem)]"
                                >
                                    <button onClick={async () => {
                                        try {
                                            await copyToClipboard(markdownToPlainText(transcript || ''));
                                            displayToast(t('copiedToClipboard'), 'success');
                                        } catch {
                                            displayToast(t('copyFailed'), 'error');
                                        }
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')} title={t('copyContent', 'Kopiëren')}>
                                        <CopyIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => {
                                        const txt = markdownToPlainText(transcript || t('noTranscriptAvailable'));
                                        downloadTextFile(txt, 'transcript.txt');
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('download')} title="Downloaden">
                                        ⬇️
                                    </button>
                                    <button onClick={() => {
                                        const content = transcript || t('noTranscriptAvailable');
                                        const { subject, body } = generateEmailContent(t('transcript'), content);
                                        copyToClipboardForEmail(subject, body);
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyForEmail')} title="Kopiëren voor e-mail">
                                        ✉️
                                    </button>
                                    <button onClick={handleExportTranscriptPdf} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('downloadPdf', 'Download PDF')} title={t('downloadPdf', 'Download PDF')}>
                                        📄
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            {t('transcript')}
                        </h3>
                        <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                            {transcript || t('noTranscriptAvailable')}
                        </div>
                    </div>
                </div>
            );
        }
        
        // Handle actions mode - show empty content area or action results
        if (mainMode === 'actions') {
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px]">
                    <div className="text-center text-slate-500 dark:text-slate-400">
                        <p>{t('selectActionAbove')}</p>
                    </div>
                </div>
            );
        }
        
        // Handle analysis mode with no specific analysis selected
        if (mainMode === 'analysis' && !selectedAnalysis) {
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px]">
                    <div className="text-center text-slate-500 dark:text-slate-400">
                        <p>Selecteer een analyse type hierboven om de resultaten te bekijken</p>
                    </div>
                </div>
            );
        }
        
        // Handle analysis mode - existing logic for analysis content
        if (activeView !== 'transcript' && activeView !== 'chat' && activeView !== 'podcast' && activeView !== 'sentiment' && loadingText && !analysisContent[activeView] && !keywordAnalysis) {
            return <BlurredLoadingOverlay text={`${loadingText}...`} />;
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
                return <BlurredLoadingOverlay text={`${loadingText}...`} />;
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
                <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] transition-colors">
                    <div className="absolute top-4 right-2 sm:right-8">
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
                                title={t('actions', 'Acties')}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="5" r="2"/>
                                    <circle cx="12" cy="12" r="2"/>
                                    <circle cx="12" cy="19" r="2"/>
                                </svg>
                            </button>
                            {showActionButtons && (
                                <div 
                                    className="absolute top-0 right-2 sm:right-10 flex flex-wrap gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 mr-0 sm:-mr-2 max-w-[calc(100vw-2rem)]"
                                    onMouseEnter={() => setShowActionButtons(true)}
                                    onMouseLeave={() => setShowActionButtons(false)}
                                >
                                    <button onClick={() => handleGenerateExecutiveSummary()} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('regenerate', 'Regenerate')} title={t('regenerate', 'Opnieuw genereren')}>
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
                                            await copyToClipboard(markdownToPlainText(txt));
                                            displayToast(t('copiedToClipboard'), 'success');
                                        } catch {
                                            displayToast(t('copyFailed'), 'error');
                                        }
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')} title={t('copyContent', 'Kopiëren')}>
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
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('download')} title="Downloaden">
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
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyForEmail')} title="Kopiëren voor e-mail">
                                        ✉️
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
                        {block(t('objective', 'Objective'), executiveSummaryData.objective)}
                        {block(t('situation', 'Situation'), executiveSummaryData.situation)}
                        {block(t('complication', 'Complication'), executiveSummaryData.complication)}
                        {block(t('resolution', 'Resolution'), executiveSummaryData.resolution)}
                        {block(t('benefits', 'Benefits'), executiveSummaryData.benefits)}
                        {block(t('callToAction', 'Call to Action'), executiveSummaryData.call_to_action)}
                    </div>
                </div>
            );
        }
        if ((activeView as ViewType) === 'storytelling') {
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] overflow-y-auto">
                    {/* Inline options */}
                    <div className="mb-4 p-3 rounded border border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40">
                        <div className="text-xs text-cyan-700 dark:text-cyan-300 mb-3">{t('storytellingOptional')}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('storytellingTargetAudience')}</label>
                                <select value={storyOptions.targetAudience} onChange={(e) => setStoryOptions(s => ({ ...s, targetAudience: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
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
                                <select value={storyOptions.mainGoal} onChange={(e) => setStoryOptions(s => ({ ...s, mainGoal: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
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
                                <select value={storyOptions.toneStyle} onChange={(e) => setStoryOptions(s => ({ ...s, toneStyle: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
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
                                <select value={storyOptions.length} onChange={(e) => setStoryOptions(s => ({ ...s, length: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
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
                        <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] transition-colors">
                            <div className="absolute top-4 right-2 sm:right-8">
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
                                        title={t('actions', 'Acties')}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <circle cx="12" cy="5" r="2"/>
                                            <circle cx="12" cy="12" r="2"/>
                                            <circle cx="12" cy="19" r="2"/>
                                        </svg>
                                    </button>
                                    {showActionButtons && (
                                        <div 
                                            className="absolute top-0 right-2 sm:right-10 flex flex-wrap gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 mr-0 sm:-mr-2 max-w-[calc(100vw-2rem)]"
                                            onMouseEnter={() => setShowActionButtons(true)}
                                            onMouseLeave={() => setShowActionButtons(false)}
                                        >
                                            <button onClick={() => handleGenerateStorytelling(storyOptions)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('regenerate', 'Regenerate')} title={t('regenerate', 'Opnieuw genereren')}>
                                                🔄
                                            </button>
                                            <button onClick={async () => {
                                                try {
                                                await copyToClipboard(markdownToPlainText(storytellingData.story));
                                                    displayToast(t('copiedToClipboard'), 'success');
                                                } catch {
                                                    displayToast(t('copyFailed'), 'error');
                                                }
                                            }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')} title={t('copyContent', 'Kopiëren')}>
                                                <CopyIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => downloadTextFile(markdownToPlainText(storytellingData.story), 'storytelling.txt')} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download" title="Downloaden">
                                                ⬇️
                                            </button>
                                            <button onClick={() => {
                                                const { subject, body } = generateEmailContent(t('storytelling'), storytellingData.story);
                                                copyToClipboardForEmail(subject, body);
                                            }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email" title="Kopiëren voor e-mail">
                                                ✉️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
                                <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400 mb-2">{t('storytelling')}</h4>
                                <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">{storytellingData.story}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 dark:text-slate-400">{t('noContent')}</div>
                    )}
                </div>
            );
        }
        if (activeView === 'quiz') {
            return (
                <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] transition-colors">
                    <div className="flex flex-wrap gap-3 items-end mb-4">
                        <div>
                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('numberOfQuestions')}</label>
                            <input type="number" min={1} max={5} value={quizNumQuestions} onChange={(e) => setQuizNumQuestions(Math.max(1, Math.min(5, Number(e.target.value) || 2)))} className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('optionsPerQuestion')}</label>
                            <select value={quizNumOptions} onChange={(e) => setQuizNumOptions(Number(e.target.value) as 2|3|4)} className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
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
                            <div className="ml-auto relative">
                                <button 
                                    onClick={() => setActiveDropdown(activeDropdown === 'quiz' ? null : 'quiz')}
                                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
                                    title="Opties"
                                >
                                    <HiDotsHorizontal size={16} color="currentColor" />
                                </button>
                                {activeDropdown === 'quiz' && (
                                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                                        <button 
                                            onClick={() => {
                                                handleGenerateQuiz();
                                                setActiveDropdown(null);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                            title="Opnieuw genereren"
                                        >
                                            <HiRefresh size={16} />
                                            Opnieuw genereren
                                        </button>
                                        <button 
                                            onClick={async () => {
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
                                                setActiveDropdown(null);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                            title="Kopiëren"
                                        >
                                            <HiClipboardCopy size={16} />
                                            Kopiëren
                                        </button>
                                        <button 
                                            onClick={() => {
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
                                                setActiveDropdown(null);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                            title="Downloaden"
                                        >
                                            <HiDownload size={16} />
                                            Downloaden
                                        </button>
                                        <button 
                                            onClick={() => {
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
                                                setActiveDropdown(null);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                            title="E-mailen"
                                        >
                                            <HiMail size={16} />
                                            E-mailen
                                        </button>
                                    </div>
                                )}
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
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] overflow-y-auto">
                    {/* Inline Blog Options (optional) */}
                    <div className="mb-4 p-3 rounded border border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40">
                        <div className="text-xs text-cyan-700 dark:text-cyan-300 mb-3">{td('storytellingOptional')}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('blogTargetAudience')}:</label>
                                <select value={blogOptions.targetAudience} onChange={(e) => setBlogOptions(b => ({ ...b, targetAudience: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
                                    {L.targetAudience.map((v, i) => (<option key={i} value={v}>{v || '—'}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('blogMainGoal')}:</label>
                                <select value={blogOptions.mainGoal} onChange={(e) => setBlogOptions(b => ({ ...b, mainGoal: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
                                    {L.mainGoal.map((v, i) => (<option key={i} value={v}>{v || '—'}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('blogTone')}:</label>
                                <select value={blogOptions.tone} onChange={(e) => setBlogOptions(b => ({ ...b, tone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
                                    {L.tone.map((v, i) => (<option key={i} value={v}>{v || '—'}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('blogLength')}:</label>
                                <select value={blogOptions.length} onChange={(e) => setBlogOptions(b => ({ ...b, length: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
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
                        <BlurredLoadingOverlay loadingText={`${loadingText}...`} />
                    ) : blogData ? (
                        <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] transition-colors">
                            <div className="absolute top-4 right-8">
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
                                        title={t('actions', 'Acties')}
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
                                            <button onClick={handleGenerateBlog} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('regenerate', 'Regenerate')} title={t('regenerate', 'Opnieuw genereren')}>
                                                🔄
                                            </button>
                                            <button onClick={async () => {
                                                try {
                                                    await copyToClipboard(markdownToPlainText(blogData));
                                                    displayToast(t('copiedToClipboard'), 'success');
                                                } catch {
                                                    displayToast(t('copyFailed'), 'error');
                                                }
                                            }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')} title={t('copyContent', 'Kopiëren')}>
                                                <CopyIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => downloadTextFile(markdownToPlainText(blogData), 'blog.txt')} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download" title="Downloaden">
                                                ⬇️
                                            </button>
                                            <button onClick={() => {
                                                const { subject, body } = generateEmailContent(t('blog'), blogData);
                                                copyToClipboardForEmail(subject, body);
                                            }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email" title="Kopiëren voor e-mail">
                                                ✉️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    {renderMarkdown(blogData)}
                                </div>
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
                return <BlurredLoadingOverlay loadingText={`${loadingText || t('analyzingSentiment')}...`} />;
            }
            if (sentimentAnalysisResult) {
                const fullContent = `${t('sentimentSummary')}\n${sentimentAnalysisResult.summary}\n\n${t('sentimentConclusion')}\n${sentimentAnalysisResult.conclusion}`;
                return (
                    <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] transition-colors">
                        <div className="absolute top-4 right-8">
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
                                    title={t('actions', 'Acties')}
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
                                        <button onClick={() => handleAnalyzeSentiment()} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('regenerate', 'Regenerate')} title={t('regenerate', 'Opnieuw genereren')}>
                                            🔄
                                        </button>
                                        <button onClick={() => copyToClipboard(markdownToPlainText(fullContent))} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')} title={t('copyContent', 'Kopiëren')}>
                                            <CopyIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => downloadTextFile(markdownToPlainText(fullContent), `sentiment.txt`)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download" title="Downloaden">
                                            ⬇️
                                        </button>
                                        <button onClick={() => {
                                            const { subject, body } = generateEmailContent(t('sentiment'), fullContent);
                                            copyToClipboardForEmail(subject, body);
                                        }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email" title="Kopiëren voor e-mail">
                                            ✉️
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="overflow-y-auto max-h-[calc(80vh-120px)] space-y-6">
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
                <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] transition-colors">
                    <div className="absolute top-4 right-8">
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
                                title={t('actions', 'Acties')}
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
                                    <button onClick={() => handleGenerateKeywordAnalysis()} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('regenerate', 'Regenerate')} title={t('regenerate', 'Opnieuw genereren')}>
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
                                        copyToClipboard(markdownToPlainText(txt));
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')} title={t('copyContent', 'Kopiëren')}>
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
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download" title="Downloaden">
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
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email" title="Kopiëren voor e-mail">
                                        ✉️
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    {loadingText && !keywordAnalysis && <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>}
                    {keywordAnalysis && keywordAnalysis.length === 0 && !loadingText && <p>{t('noContent')}</p>}
                    {keywordAnalysis && keywordAnalysis.length > 0 && (
                        <div className="overflow-y-auto max-h-[calc(80vh-120px)] space-y-6">
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
                <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] transition-colors">
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => {
                            const txt = (() => {
                                const parts: string[] = [`## ${t('storytelling')}`, ''];
                                if (storytellingData) {
                                    parts.push(storytellingData.story);
                                }
                                return parts.join('\n');
                            })();
                                        copyToClipboard(markdownToPlainText(txt));
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
                        <div className="overflow-y-auto max-h-[calc(80vh-120px)] space-y-6">
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
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] overflow-y-auto">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400 mb-4">{t('businessCaseGeneratorFeature')}</h3>
                        
                        <div className="space-y-6">
                            {/* Business Case Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {t('businessCaseTypeLabel')}
                                </label>
                                {(() => {
                                  // Build translated list of business case types (names + descriptions)
                                  const types: { id: string; name: string; description: string }[] = [
                                    { id: 'costSavings', name: t('costSavings'), description: t('costSavingsDescription') },
                                    { id: 'revenueGrowth', name: t('revenueGrowth'), description: t('revenueGrowthDescription') },
                                    { id: 'innovation', name: t('innovation'), description: t('innovationDescription') },
                                    { id: 'riskReduction', name: t('riskReduction'), description: t('riskReductionDescription') },
                                    { id: 'customerSatisfaction', name: t('customerSatisfaction'), description: t('customerSatisfactionDescription') },
                                    { id: 'scalability', name: t('scalability'), description: t('scalabilityDescription') },
                                    // New expanded options
                                    { id: 'employeeProductivityEngagement', name: t('businessCaseTypes.employeeProductivityEngagement.name'), description: t('businessCaseTypes.employeeProductivityEngagement.description') },
                                    { id: 'sustainabilityCsr', name: t('businessCaseTypes.sustainabilityCsr.name'), description: t('businessCaseTypes.sustainabilityCsr.description') },
                                    { id: 'qualityImprovement', name: t('businessCaseTypes.qualityImprovement.name'), description: t('businessCaseTypes.qualityImprovement.description') },
                                    { id: 'dataInsights', name: t('businessCaseTypes.dataInsights.name'), description: t('businessCaseTypes.dataInsights.description') },
                                    { id: 'marketShareIncrease', name: t('businessCaseTypes.marketShareIncrease.name'), description: t('businessCaseTypes.marketShareIncrease.description') },
                                    { id: 'brandReputationImage', name: t('businessCaseTypes.brandReputationImage.name'), description: t('businessCaseTypes.brandReputationImage.description') },
                                    { id: 'complianceRegulation', name: t('businessCaseTypes.complianceRegulation.name'), description: t('businessCaseTypes.complianceRegulation.description') },
                                    { id: 'flexibilityAgility', name: t('businessCaseTypes.flexibilityAgility.name'), description: t('businessCaseTypes.flexibilityAgility.description') },
                                    { id: 'channelExpansion', name: t('businessCaseTypes.channelExpansion.name'), description: t('businessCaseTypes.channelExpansion.description') },
                                    { id: 'timeSavings', name: t('businessCaseTypes.timeSavings.name'), description: t('businessCaseTypes.timeSavings.description') },
                                    { id: 'resourceOptimization', name: t('businessCaseTypes.resourceOptimization.name'), description: t('businessCaseTypes.resourceOptimization.description') },
                                    { id: 'productDifferentiation', name: t('businessCaseTypes.productDifferentiation.name'), description: t('businessCaseTypes.productDifferentiation.description') },
                                    { id: 'operationalEfficiency', name: t('businessCaseTypes.operationalEfficiency.name'), description: t('businessCaseTypes.operationalEfficiency.description') },
                                    { id: 'securityDataProtection', name: t('businessCaseTypes.securityDataProtection.name'), description: t('businessCaseTypes.securityDataProtection.description') },
                                    { id: 'innovationCulture', name: t('businessCaseTypes.innovationCulture.name'), description: t('businessCaseTypes.innovationCulture.description') },
                                    { id: 'supplierRelationships', name: t('businessCaseTypes.supplierRelationships.name'), description: t('businessCaseTypes.supplierRelationships.description') },
                                    { id: 'fasterTimeToMarket', name: t('businessCaseTypes.fasterTimeToMarket.name'), description: t('businessCaseTypes.fasterTimeToMarket.description') },
                                    { id: 'customerSegmentationPrecision', name: t('businessCaseTypes.customerSegmentationPrecision.name'), description: t('businessCaseTypes.customerSegmentationPrecision.description') },
                                    { id: 'strategicAlignment', name: t('businessCaseTypes.strategicAlignment.name'), description: t('businessCaseTypes.strategicAlignment.description') },
                                  ];

                                  const selectedName = businessCaseData?.businessCaseType || types[0].name;

                                  return (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {types.map(type => (
                                        <button
                                          key={type.id}
                                          type="button"
                                          onClick={() => setBusinessCaseData(prev => ({ ...prev, businessCaseType: type.name } as BusinessCaseData))}
                                          className={`text-left p-3 border rounded-md transition-colors ${selectedName === type.name ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-gray-300 dark:border-slate-600 hover:border-cyan-500'}`}
                                          title={type.description}
                                        >
                                          <div className="font-medium text-slate-800 dark:text-slate-100">{type.name}</div>
                                          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{type.description}</div>
                                        </button>
                                      ))}
                                    </div>
                                  );
                                })()}
                            </div>

                            {/* Target Audience / Stakeholders */}
                            <div>
                                {(() => {
                                  const opts = [
                                    t('businessCaseTargetAudienceOptions.boardOfDirectors', 'Board of Directors'),
                                    t('businessCaseTargetAudienceOptions.investors', 'Investors'),
                                    t('businessCaseTargetAudienceOptions.teamLeaders', 'Team Leaders'),
                                    t('businessCaseTargetAudienceOptions.departmentHeads', 'Department Heads')
                                  ];
                                  return (
                                    <>
                                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t('businessCaseTargetAudienceQuestion')}
                                      </label>
                                      <select
                                        value={businessCaseData?.targetAudience ?? ''}
                                        onChange={(e) => setBusinessCaseData(prev => ({ ...prev, targetAudience: e.target.value } as BusinessCaseData))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                      >
                                        {/* Empty option (no general audience) */}
                                        <option value="">{t('businessCaseTargetAudienceOptions.none')}</option>
                                        {[
                                          t('businessCaseTargetAudienceOptions.boardOfDirectors'),
                                          t('businessCaseTargetAudienceOptions.investors'),
                                          t('businessCaseTargetAudienceOptions.teamLeaders'),
                                          t('businessCaseTargetAudienceOptions.colleagues')
                                        ].map(o => (<option key={o} value={o}>{o}</option>))}
                                      </select>
                                    </>
                                  );
                                })()}
                            </div>

                            {/* Business Case Length */}
                            <div>
                                {(() => {
                                  const L = {
                                    concise: t('businessCaseLengthOptions.concise'),
                                    extensive: t('businessCaseLengthOptions.extensive'),
                                    very_extensive: t('businessCaseLengthOptions.very_extensive')
                                  };
                                  return (
                                    <>
                                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        {t('businessCaseLength')}
                                      </label>
                                      <select
                                        value={businessCaseData?.length || 'concise'}
                                        onChange={(e) => setBusinessCaseData(prev => ({ ...prev, length: (e.target.value as any) }) as BusinessCaseData)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                      >
                                        <option value="concise">{L.concise}</option>
                                        <option value="extensive">{L.extensive}</option>
                                        <option value="very_extensive">{L.very_extensive}</option>
                                      </select>
                                      {/* Removed strict hint from UI; still enforced in AI prompt */}
                                    </>
                                  );
                                })()}
                            </div>

                            {/* Generate Button */}
                            <div className="pt-4">
                                <button 
                                    onClick={() => handleGenerateBusinessCase()}
                                    className="w-full px-4 py-2 text-sm bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                                >
                                    {t('generate')}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Show existing business case if available */}
                    {businessCaseData && (
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-600">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400">{t('businessCaseGeneratedTitle')}</h4>
                                <div className="flex gap-2">
                                    <button onClick={() => {
                                        const txt = `## ${t('businessCaseTitle')}\n\n${businessCaseData.businessCase}`;
                                        copyToClipboard(markdownToPlainText(txt));
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
                                        <CopyIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => {
                                        const txt = `## ${t('businessCaseTitle')}\n\n${businessCaseData.businessCase}`;
                                        downloadTextFile(txt, 'business-case.txt');
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download">
                                        ⬇️
                                    </button>
                                    <button onClick={() => {
                                        const { subject, body } = generateEmailContent(t('businessCaseTitle'), `## ${t('businessCaseTitle')}\n\n${businessCaseData.businessCase}`);
                                        copyToClipboardForEmail(subject, body);
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email">
                                        ✉️
                                    </button>
                                    {/* Move Business Case to transcript (plain text) */}
                                    <button
                                        onClick={() => setShowBusinessCaseMoveToTranscriptModal(true)}
                                        className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-full transition-colors text-sm px-3"
                                        aria-label={t('aiDiscussion.moveToTranscript', 'Verplaats naar transcript')}
                                        title={t('aiDiscussion.moveToTranscript', 'Verplaats naar transcript')}
                                    >
                                        {t('aiDiscussion.moveToTranscript', 'Verplaats naar transcript')}
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                                <p><strong>Type:</strong> {businessCaseData.businessCaseType}</p>
                                {businessCaseData.targetAudience && (
                                  <p><strong>{t('businessCaseTargetAudienceLabel')}:</strong> {businessCaseData.targetAudience}</p>
                                )}
                                <p><strong>{t('businessCaseLength')}:</strong> {businessCaseData.length === 'concise' ? t('businessCaseLengthOptions.concise') : businessCaseData.length === 'extensive' ? t('businessCaseLengthOptions.extensive') : t('businessCaseLengthOptions.very_extensive')}</p>
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

        if (activeView === 'specials') {
            if (import.meta && (import.meta as any).env && (import.meta as any).env.DEV) {
                console.debug('🎯 [App] render Specials tab', {
                    userId: user?.uid,
                    transcriptLen: transcript?.length || 0,
                    summaryLen: summary?.length || 0
                });
            }
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] overflow-y-auto">
                    <SpecialsTab
                        transcript={transcript}
                        summary={summary}
                        language={outputLang}
                        appLanguage={uiLang}
                        userId={user?.uid || null}
                        userTier={userSubscription}
                        t={t}
                        onEmailContent={(content: string) => {
                            setEmailContent(content);
                            setActiveView('email');
                        }}
                        onMoveToTranscript={async (content: string) => {
                            setTranscript(content);
                            // Trigger RecapHorizonPanel full reset by bumping startStamp
                            setRecordingStartMs(Date.now());
                            // Reset dropdowns to default values
                            setMainMode('transcript');
                            setSelectedAnalysis(null);
                            // Clear all RecapHorizon panel content for new session
                            setSummary('');
                            setFaq('');
                            setLearningDoc('');
                            setFollowUpQuestions('');
                            setKeywordAnalysis(null);
                            setSentimentAnalysisResult(null);
                            setChatHistory([]);
                            setMindmapMermaid('');
                            setExecutiveSummaryData(null);
                            setStorytellingData(null);
                            setBusinessCaseData(null);
                            setBlogData(null);
                            setExplainData(null);
                            setTeachMeData(null);
                            setThinkingPartnerAnalysis('');
                            setSelectedThinkingPartnerTopic('');
                            setSelectedThinkingPartner(null);
                            setOpportunitiesData(null);
                            setMckinseyAnalysis(null);
                            setSelectedMckinseyTopic('');
                            setSelectedMckinseyRole('');
                            setSelectedMckinseyFramework('');
                            setSocialPostData(null);
                            setSocialPostXData(null);
                            setQuizQuestions([]);
                            // Increment session counter for new session
                            if (authState.user?.uid) {
                                try {
                                    await incrementUserMonthlySessions(authState.user.uid);
                                } catch (error) {
                                    console.error('Failed to increment session counter:', error);
                                }
                            }
                            // Switch to transcript view to show the new transcript
                            setActiveView('transcript');
                        }}
                        isGenerating={loadingText !== ''}
                    />
                </div>
            );
        }

        if (activeView === 'email') {
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] overflow-y-auto">
                    <EmailCompositionTab
                        transcript={transcript}
                        summary={summary}
                        emailAddresses={emailAddresses}
                        userId={user.uid}
                        userTier={userSubscription}
                        onPreviewEmail={(emailData: EmailData) => {
                            // Preview email functionality
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
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] overflow-y-auto">
                    {/* Inline Explain Options */}
                    <div className="mb-4 p-3 rounded border border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40">
                        <div className="text-xs text-cyan-700 dark:text-cyan-300 mb-3">{t('explainOptional')}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('explainComplexityLevel')}</label>
                                <select value={explainOptions.complexityLevel} onChange={(e) => setExplainOptions(s => ({ ...s, complexityLevel: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
                                    <option value="Beginner (basisconcepten)">{t('explainComplexityBeginner')}</option>
                                    <option value="Algemeen publiek (duidelijke taal)">{t('explainComplexityGeneral')}</option>
                                    <option value="Middelbare school, 15-jarige">{t('explainComplexityHighSchool')}</option>
                                    <option value="Teamleden (specifieke context)">{t('explainComplexityTeam')}</option>
                                    <option value="Expert (technisch/diepgaand)">{t('explainComplexityExpert')}</option>
                                    <option value="Kind van 5 (extreem eenvoudig)">{t('explainComplexityChild')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('explainFocusArea')}</label>
                                <select value={explainOptions.focusArea} onChange={(e) => setExplainOptions(s => ({ ...s, focusArea: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
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
                                <select value={explainOptions.format} onChange={(e) => setExplainOptions(s => ({ ...s, format: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
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
                        <BlurredLoadingOverlay loadingText={`${loadingText}...`} />
                    ) : explainData?.explanation ? (
                        <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] transition-colors">
                            <div className="absolute top-4 right-8">
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
                                        title={t('actions', 'Acties')}
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
                                            <button onClick={() => handleGenerateExplain(explainOptions)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('regenerate', 'Regenerate')} title={t('regenerate', 'Opnieuw genereren')}>
                                                🔄
                                            </button>
                                            <button onClick={() => copyToClipboard(markdownToPlainText(explainData.explanation))} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')} title={t('copyContent', 'Kopiëren')}>
                                                <CopyIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => downloadTextFile(markdownToPlainText(explainData.explanation), 'explain.txt')} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download" title="Downloaden">
                                                ⬇️
                                            </button>
                                            <button onClick={() => {
                                                const { subject, body } = generateEmailContent(t('explain'), explainData.explanation);
                                                copyToClipboardForEmail(subject, body);
                                            }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email" title="Kopiëren voor e-mail">
                                                ✉️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    {renderMarkdown(explainData.explanation)}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 dark:text-slate-400">{t('noContent')}</div>
                    )}
                </div>
            );
        }

        if (activeView === 'summary') {
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] overflow-y-auto">
                    {/* Inline Summary Options */}
                    <div className="mb-4 p-3 rounded border border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40">
                        <div className="text-xs text-cyan-700 dark:text-cyan-300 mb-3">{t('summaryOptional')}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('summaryFormat')}</label>
                                <select value={summaryOptions.format} onChange={(e) => setSummaryOptions(s => ({ ...s, format: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
                                    <option value="">-</option>
                                    <option value="executiveSummary">{t('summaryFormatOptions.executiveSummary')}</option>
                                    <option value="toThePointSummary">{t('summaryFormatOptions.toThePointSummary')}</option>
                                    <option value="narrativeSummary">{t('summaryFormatOptions.narrativeSummary')}</option>
                                    <option value="decisionMakingSummary">{t('summaryFormatOptions.decisionMakingSummary')}</option>
                                    <option value="problemSolutionSummary">{t('summaryFormatOptions.problemSolutionSummary')}</option>
                                    <option value="detailedSummaryWithQuotes">{t('summaryFormatOptions.detailedSummaryWithQuotes')}</option>
                                    <option value="highLevelOverview">{t('summaryFormatOptions.highLevelOverview')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('summaryTargetAudience')}</label>
                                <select value={summaryOptions.targetAudience} onChange={(e) => setSummaryOptions(s => ({ ...s, targetAudience: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
                                    <option value="">-</option>
                                    <option value="internalTeam">{t('summaryTargetAudienceOptions.internalTeam')}</option>
                                    <option value="management">{t('summaryTargetAudienceOptions.management')}</option>
                                    <option value="customers">{t('summaryTargetAudienceOptions.customers')}</option>
                                    <option value="investors">{t('summaryTargetAudienceOptions.investors')}</option>
                                    <option value="newEmployees">{t('summaryTargetAudienceOptions.newEmployees')}</option>
                                    <option value="generalPublic">{t('summaryTargetAudienceOptions.generalPublic')}</option>
                                    <option value="academics">{t('summaryTargetAudienceOptions.academics')}</option>
                                    <option value="competitors">{t('summaryTargetAudienceOptions.competitors')}</option>
                                    <option value="localCommunity">{t('summaryTargetAudienceOptions.localCommunity')}</option>
                                    <option value="alumni">{t('summaryTargetAudienceOptions.alumni')}</option>
                                    <option value="internationalStakeholders">{t('summaryTargetAudienceOptions.internationalStakeholders')}</option>
                                    <option value="specificInterestGroups">{t('summaryTargetAudienceOptions.specificInterestGroups')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('summaryToneStyle')}</label>
                                <select value={summaryOptions.toneStyle} onChange={(e) => setSummaryOptions(s => ({ ...s, toneStyle: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
                                    <option value="">-</option>
                                    <option value="formal">{t('summaryToneStyleOptions.formal')}</option>
                                    <option value="informal">{t('summaryToneStyleOptions.informal')}</option>
                                    <option value="inspiring">{t('summaryToneStyleOptions.inspiring')}</option>
                                    <option value="critical">{t('summaryToneStyleOptions.critical')}</option>
                                    <option value="humorous">{t('summaryToneStyleOptions.humorous')}</option>
                                    <option value="neutral">{t('summaryToneStyleOptions.neutral')}</option>
                                    <option value="professional">{t('summaryToneStyleOptions.professional')}</option>
                                    <option value="conversational">{t('summaryToneStyleOptions.conversational')}</option>
                                    <option value="authoritative">{t('summaryToneStyleOptions.authoritative')}</option>
                                    <option value="friendly">{t('summaryToneStyleOptions.friendly')}</option>
                                    <option value="technical">{t('summaryToneStyleOptions.technical')}</option>
                                    <option value="simple">{t('summaryToneStyleOptions.simple')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('summaryLength')}</label>
                                <select value={summaryOptions.length} onChange={(e) => setSummaryOptions(s => ({ ...s, length: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400">
                                    <option value="">-</option>
                                    <option value="concise">{t('summaryLengthOptions.concise')}</option>
                                    <option value="standard">{t('summaryLengthOptions.standard')}</option>
                                    <option value="extensive">{t('summaryLengthOptions.extensive')}</option>
                                    <option value="fullTimeline">{t('summaryLengthOptions.fullTimeline')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-2">
                            <button onClick={() => handleGenerateAnalysis('summary')} disabled={!transcript.trim()} className="px-3 py-2 rounded bg-cyan-600 text-white text-sm hover:bg-cyan-700 disabled:opacity-50">{t('generate', 'Genereren')}</button>
                        </div>
                    </div>

                    {/* Output */}
                    {loadingText && !summary ? (
                        <BlurredLoadingOverlay loadingText={`${loadingText}...`} />
                    ) : summary ? (
                        <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] transition-colors">
                            <div className="absolute top-4 right-8">
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
                                        title={t('actions', 'Acties')}
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
                                            <button onClick={() => handleResetAnalysis('summary')} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('regenerate', 'Regenerate')} title={t('regenerate', 'Opnieuw genereren')}>
                                                🔄
                                            </button>
                                            <button onClick={() => copyToClipboard(markdownToPlainText(summary))} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')} title={t('copyContent', 'Kopiëren')}>
                                                <CopyIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => downloadTextFile(markdownToPlainText(summary), 'summary.txt')} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download" title="Downloaden">
                                                ⬇️
                                            </button>
                                            <button onClick={() => {
                                                const { subject, body } = generateEmailContent(t('summary'), summary);
                                                copyToClipboardForEmail(subject, body);
                                            }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email" title="Kopiëren voor e-mail">
                                                ✉️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    {renderMarkdown(summary)}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 dark:text-slate-400">{t('noContent')}</div>
                    )}
                </div>
            );
        }

        if (activeView === 'teachMe') {
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] overflow-y-auto">
                    {/* Loading State */}
                    {isGeneratingTeachMe && (
                        <BlurredLoadingOverlay text={loadingText || t('teachMeGenerating')} />
                    )}
                    
                    {/* Topic Selection Step */}
                    {teachMeStep === 'topics' && sharedTopics.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                {t('teachMeSelectTopic')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sharedTopics.map((topic) => (
                                    <div
                                        key={topic.id}
                                        className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        onClick={() => {
                                            setTeachMeSelectedTopic(topic);
                                            setTeachMeStep('methodSelection');
                                        }}
                                    >
                                        <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                                            {topic.title}
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {topic.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={() => handleGenerateTeachMe()}
                                    className="px-4 py-2 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    {t('teachMeRegenerateTopics')}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Method Selection Step */}
                    {teachMeStep === 'methodSelection' && teachMeSelectedTopic && (
                        <div>
                            <div className="mb-4">
                                <button
                                    onClick={() => setTeachMeStep('topicSelection')}
                                    className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-sm"
                                >
                                    ← {t('teachMeBackToTopics')}
                                </button>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                                {t('teachMeSelectMethod')}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                {t('teachMeSelectedTopic')}: <strong>{teachMeSelectedTopic.title}</strong>
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {teachMeMethods.map((method) => (
                                    <div
                                        key={method.id}
                                        className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        onClick={() => {
                                            setTeachMeSelectedMethod(method);
                                            handleGenerateTeachMeContent(teachMeSelectedTopic, method);
                                        }}
                                    >
                                        <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm mb-1">
                                            {method.name}
                                        </h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            {method.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Content Display Step */}
                    {teachMeStep === 'contentDisplay' && teachMeData?.content && (
                        <div className="relative">
                            <div className="absolute top-0 right-0">
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
                                        title={t('actions', 'Acties')}
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
                                            <button 
                                                onClick={() => setTeachMeStep('topicSelection')} 
                                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" 
                                                aria-label={t('teachMeNewTopic')} 
                                                title={t('teachMeNewTopic')}
                                            >
                                                🔄
                                            </button>
                                            <button 
                                                onClick={() => copyToClipboard(markdownToPlainText(teachMeData.content))} 
                                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" 
                                                aria-label={t('copyContent')} 
                                                title={t('copyContent', 'Kopiëren')}
                                            >
                                                <CopyIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => downloadTextFile(markdownToPlainText(teachMeData.content), `teach-me-${teachMeData.topic.title.toLowerCase().replace(/\s+/g, '-')}.txt`)} 
                                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" 
                                                aria-label="Download" 
                                                title="Downloaden"
                                            >
                                                ⬇️
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const { subject, body } = generateEmailContent(`${t('teachMe')}: ${teachMeData.topic.title}`, teachMeData.content);
                                                    copyToClipboardForEmail(subject, body);
                                                }} 
                                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" 
                                                aria-label="Copy for Email" 
                                                title="Kopiëren voor e-mail"
                                            >
                                                ✉️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <button
                                    onClick={() => setTeachMeStep('methodSelection')}
                                    className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-sm"
                                >
                                    ← {t('teachMeBackToMethods')}
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                    {teachMeData.topic.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {t('teachMeMethod')}: {teachMeData.method.name}
                                </p>
                            </div>
                            
                            <div className="overflow-y-auto max-h-[calc(70vh-200px)]">
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    {renderMarkdown(teachMeData.content)}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Empty State */}
                    {!isGeneratingTeachMe && sharedTopics.length === 0 && !teachMeData?.content && (
                        <div className="text-center py-8">
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                                {t('teachMeNoTopics')}
                            </p>
                            <button
                                onClick={() => handleGenerateTeachMe()}
                                disabled={!transcript.trim()}
                                className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('teachMeGenerateTopics')}
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        if (activeView === 'showMe') {
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] overflow-y-auto">
                    {/* Loading State */}
                    {(isGeneratingShowMe || isSearchingShowMeContent) && (
                        <BlurredLoadingOverlay text={loadingText || t('showMeGenerating')} />
                    )}
                    
                    {/* Topic Selection Step */}
                    {!showMeSelectedTopic && sharedTopics.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                                {t('showMeSelectTopic')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sharedTopics.map((topic) => (
                                    <div
                                        key={topic.id}
                                        className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        onClick={() => {
                                            handleSearchShowMeContent(topic);
                                        }}
                                    >
                                        <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                                            {topic.title}
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {topic.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={() => handleGenerateShowMe()}
                                    className="px-4 py-2 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    {t('showMeRegenerateTopics')}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Results Display */}
                    {showMeData && showMeSelectedTopic && (
                        <div className="relative">
                            <div className="absolute top-0 right-0">
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
                                        title={t('actions', 'Acties')}
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
                                            <button 
                                                onClick={() => {
                                                    setShowMeSelectedTopic(null);
                                                    setShowMeData(null);
                                                }} 
                                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" 
                                                aria-label={t('showMeNewTopic')} 
                                                title={t('showMeNewTopic')}
                                            >
                                                🔄
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const content = `${t('showMe')}: ${showMeSelectedTopic.title}\n\n${t('showMeTedTalks')}:\n${showMeData.tedTalks.map(talk => `${talk.title} - ${talk.url}`).join('\n')}\n\n${t('showMeNewsArticles')}:\n${showMeData.newsArticles.map(article => `${article.title} - ${article.url}`).join('\n')}`;
                                                    copyToClipboard(content);
                                                }} 
                                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" 
                                                aria-label={t('copyContent')} 
                                                title={t('copyContent', 'Kopiëren')}
                                            >
                                                <CopyIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <button
                                    onClick={() => {
                                        setShowMeSelectedTopic(null);
                                        setShowMeData(null);
                                    }}
                                    className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-sm"
                                >
                                    ← {t('showMeBackToTopics')}
                                </button>
                            </div>
                            
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                    {showMeSelectedTopic.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {showMeSelectedTopic.description}
                                </p>
                            </div>
                            
                            <div className="overflow-y-auto max-h-[calc(70vh-200px)] space-y-6">
                                {/* TED Talks Section */}
                                {showMeData.tedTalks.length > 0 && (
                                    <div>
                                        <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                            {t('showMeTedTalks')}
                                            <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
                                                Links naar YouTube
                                            </span>
                                        </h4>
                                        <div className="space-y-3">
                                            {showMeData.tedTalks.map((talk, index) => (
                                                <div key={index} className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h5 className="font-medium text-slate-800 dark:text-slate-200 flex-1">
                                                            <a href={talk.url} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                                                                {talk.title}
                                                            </a>
                                                        </h5>
                                                        <div className="flex items-center gap-1 ml-3">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <span key={star} className="text-yellow-400">
                                                                    {talk.relevanceRating >= star ? '★' : 
                                                                     talk.relevanceRating >= star - 0.5 ? '☆' : '☆'}
                                                                </span>
                                                            ))}
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                                                {talk.relevanceRating}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                        Speaker: {talk.speaker}
                                                    </p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                                        {talk.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* News Articles Section */}
                                {showMeData.newsArticles.length > 0 && (
                                    <div>
                                        <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                            {t('showMeNewsArticles')}
                                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                                                Links naar Google zoeken
                                            </span>
                                        </h4>
                                        <div className="space-y-3">
                                            {showMeData.newsArticles.map((article, index) => (
                                                <div key={index} className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h5 className="font-medium text-slate-800 dark:text-slate-200 flex-1">
                                                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                                                                {article.title}
                                                            </a>
                                                        </h5>
                                                        <div className="flex items-center gap-1 ml-3">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <span key={star} className="text-yellow-400">
                                                                    {article.relevanceRating >= star ? '★' : 
                                                                     article.relevanceRating >= star - 0.5 ? '☆' : '☆'}
                                                                </span>
                                                            ))}
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                                                {article.relevanceRating}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                        Auteur: {article.author} | Bron: {article.publication}
                                                    </p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                                        {article.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Empty State */}
                    {!isGeneratingShowMe && !isSearchingShowMeContent && sharedTopics.length === 0 && !showMeData && (
                        <div className="text-center py-8">
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                                {t('showMeNoTopics')}
                            </p>
                            <button
                                onClick={() => handleGenerateShowMe()}
                                disabled={!transcript.trim()}
                                className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t('showMeGenerateTopics')}
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        if (activeView === 'thinkingPartner') {
            return (
                <ThinkingPartnerTab
                    t={t}
                    transcript={transcript}
                    summary={summary}
                    onAnalysisComplete={(data) => {
                        // Update the analysis data for RecapHorizonPanel
                        setThinkingPartnerAnalysis(data.aiResponse);
                        setSelectedThinkingPartnerTopic(data.topic.title);
                        setSelectedThinkingPartner({ name: data.partner.name });
                    }}
                    isGenerating={isGenerating}
                    language={outputLang}
                    userId={authState.user?.uid || ''}
                    userTier={userSubscription}
                    sessionId={sessionId}
                />
            );
        }

        if (activeView === 'aiDiscussion') {
            return (
                <AIDiscussionTab
                    t={t}
                    transcript={transcript}
                    summary={summary}
                    isGenerating={isGenerating}
                    language={outputLang}
                    userId={authState.user?.uid || ''}
                    userTier={userSubscription}
                    sessionId={sessionId}
                    onDiscussionComplete={(report) => {
                        // Handle discussion completion
                        // Discussion completed
                    }}
                    onMoveToTranscript={async (reportContent) => {
                        setTranscript(reportContent);
                        // Trigger RecapHorizonPanel full reset by bumping startStamp
                        setRecordingStartMs(Date.now());
                        // Reset dropdowns to default values
                        setMainMode('transcript');
                        setSelectedAnalysis(null);
                        // Clear all RecapHorizon panel content for new session
                        setSummary('');
                        setFaq('');
                        setLearningDoc('');
                        setFollowUpQuestions('');
                        setKeywordAnalysis(null);
                        setSentimentAnalysisResult(null);
                        setChatHistory([]);
                        setMindmapMermaid('');
                        setExecutiveSummaryData(null);
                        setStorytellingData(null);
                        setBusinessCaseData(null);
                        setBlogData(null);
                        setExplainData(null);
                        setTeachMeData(null);
                        setThinkingPartnerAnalysis('');
                        setSelectedThinkingPartnerTopic('');
                        setSelectedThinkingPartner(null);
                        setOpportunitiesData(null);
                        setMckinseyAnalysis(null);
                        setSelectedMckinseyTopic('');
                        setSelectedMckinseyRole('');
                        setSelectedMckinseyFramework('');
                        setSocialPostData(null);
                        setSocialPostXData(null);
                        setQuizQuestions([]);
                        // Increment session counter for new session
                        if (authState.user?.uid) {
                            try {
                                await incrementUserMonthlySessions(authState.user.uid);
                                // Session counter incremented successfully
                            } catch (error) {
                                console.error('Failed to increment session counter:', error);
                            }
                        }
                        // Switch to transcript view to show the new transcript
                        setActiveView('transcript');
                    }}
                />
            );
        }

        if (activeView === 'opportunities') {
            return (
                <OpportunitiesTab
                    t={t}
                    transcript={transcript}
                    summary={summary}
                    isGenerating={isGenerating}
                    language={outputLang}
                    userId={authState.user?.uid || ''}
                    userTier={userSubscription}
                    sessionId={sessionId}
                    onOpportunitiesComplete={(data) => {
                        // Handle opportunity completion
                        // Opportunity completed
                        setOpportunitiesData(data);
                    }}
                />
            );
        }

        if (activeView === 'mckinsey') {
            return (
                <McKinseyTab
                    t={t}
                    transcript={transcript}
                    summary={summary}
                    onAnalysisComplete={(data) => {
                        // Update the analysis data for RecapHorizonPanel
                        setMckinseyAnalysis(data);
                        setSelectedMckinseyTopic(data.topic.title);
                        setSelectedMckinseyRole(data.roleId);
                        setSelectedMckinseyFramework(data.framework);
                        
                        // Show toast notification and trigger RecapHorizon update
                        displayToast(t('mckinseyAnalysisComplete', 'McKinsey analyse voltooid! Beschikbaar in RecapHorizon.'), 'success');
                    }}
                    isGenerating={isGenerating}
                    language={outputLang}
                    userId={authState.user?.uid || ''}
                    userTier={userSubscription}
                    sessionId={sessionId}
                />
            );
        }

        if (activeView === 'socialPost') {
            return (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg transition-colors">
                    {/* Social Media Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Platform Selection */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                {t('socialPostPlatform') || 'Platform'}
                            </label>
                            <select
                                value={socialPostOptions.platform}
                                onChange={(e) => {
                                    const newPlatform = e.target.value as any;
                                    setSocialPostOptions(prev => ({
                                        ...prev,
                                        platform: newPlatform,
                                        // Force single post for non X/BlueSky platforms
                                        postCount: newPlatform === 'X / BlueSky' ? prev.postCount : 1
                                    }));
                                }}
                                className="w-full p-3 border border-slate-300 dark:border-slate-500 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                            >
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Facebook">Facebook</option>
                                <option value="Instagram">Instagram</option>
                                <option value="X / BlueSky">X / BlueSky</option>
                            </select>
                            {socialPostOptions.platform !== 'X / BlueSky' && (
                                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                                    Meerdere berichten zijn alleen beschikbaar voor X / BlueSky.
                                </p>
                            )}
                        </div>

                        {/* Tone Selection */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                {t('socialPostTone') || 'Tone'}
                            </label>
                            <select
                                value={socialPostOptions.tone}
                                onChange={(e) => setSocialPostOptions(prev => ({ ...prev, tone: e.target.value as any }))}
                                className="w-full p-3 border border-slate-300 dark:border-slate-500 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                            >
                                <option value="professional">{t('socialPostToneProfessional') || 'Professional'}</option>
                                <option value="friendly">{t('socialPostToneFriendly') || 'Friendly'}</option>
                                <option value="enthusiastic">{t('socialPostToneEnthusiastic') || 'Enthusiastic'}</option>
                                <option value="informative">{t('socialPostToneInformative') || 'Informative'}</option>
                                <option value="humor">{t('socialPostToneHumor') || 'Humor'}</option>
                                <option value="factual">{t('socialPostToneFactual') || 'Factual'}</option>
                            </select>
                        </div>

                        {/* Length Selection */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                {t('socialPostLength') || 'Length'}
                            </label>
                            <select
                                value={socialPostOptions.length}
                                onChange={(e) => {
                                    const newLength = e.target.value as any;
                                    setSocialPostOptions(prev => ({ 
                                        ...prev, 
                                        length: newLength,
                                        // Reset to 1 post when medium or long is selected
                                        postCount: (newLength === 'medium' || newLength === 'long') ? 1 : prev.postCount
                                    }));
                                }}
                                className="w-full p-3 border border-slate-300 dark:border-slate-500 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                            >
                                <option value="short">{t('socialPostLengthShort') || 'Short'}</option>
                                <option value="medium">{t('socialPostLengthMedium') || 'Medium'}</option>
                                <option value="long">{t('socialPostLengthLong') || 'Long'}</option>
                            </select>
                        </div>

                        {/* Post Count Selection */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                {t('socialPostCount') || 'Number of Posts'}
                            </label>
                            <select
                                value={socialPostOptions.postCount}
                                onChange={(e) => setSocialPostOptions(prev => ({ ...prev, postCount: parseInt(e.target.value) }))}
                                disabled={socialPostOptions.length === 'medium' || socialPostOptions.length === 'long' || socialPostOptions.platform !== 'X / BlueSky'}
                                className={`w-full p-3 border rounded-lg text-slate-900 dark:text-slate-100 transition-colors ${
                                    (socialPostOptions.length === 'medium' || socialPostOptions.length === 'long' || socialPostOptions.platform !== 'X / BlueSky') 
                                        ? 'border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-600 opacity-50 cursor-not-allowed' 
                                        : 'border-slate-300 dark:border-slate-500 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500'
                                }`}
                            >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                            </select>
                        </div>
                    </div>

                    {/* Include Options Checkboxes */}
                    <div className="mb-6 space-y-3">
                        <label className="flex items-center p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={socialPostOptions.includeHashtags}
                                onChange={(e) => setSocialPostOptions(prev => ({ ...prev, includeHashtags: e.target.checked }))}
                                className="mr-3 w-4 h-4 text-cyan-600 bg-white border-slate-300 rounded focus:ring-cyan-500 focus:ring-2 dark:bg-slate-700 dark:border-slate-500"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('socialPostIncludeHashtags') || 'Include hashtags'}
                            </span>
                        </label>
                        
                        <label className="flex items-center p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={socialPostOptions.includeEmoticons}
                                onChange={(e) => setSocialPostOptions(prev => ({ ...prev, includeEmoticons: e.target.checked }))}
                                className="mr-3 w-4 h-4 text-cyan-600 bg-white border-slate-300 rounded focus:ring-cyan-500 focus:ring-2 dark:bg-slate-700 dark:border-slate-500"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('socialPostIncludeEmoticons') || 'Emoticons gebruiken'}
                            </span>
                        </label>
                    </div>

                    {/* Generate Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => generateSocialPost('socialPost', transcript, socialPostOptions.postCount)}
                            disabled={isGenerating || !transcript}
                            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
                        >
                            {isGenerating ? (t('socialPostGenerating') || 'Generating...') : (t('generate') || 'Generate Social Media Post')}
                        </button>
                    </div>

                    {/* Generated Content */}
                    {socialPostData && (
                        <SocialPostCard
                            socialPostData={socialPostData}
                            onCopy={copyToClipboard}
                            t={t}
                            onGenerateImage={async (style: string, color: string) => {
                                // Set the style and color for image generation
                                setImageGenerationStyle(style);
                                setImageGenerationColor(color);
                                // Generate image with the social post content
                                const postContent = Array.isArray(socialPostData.post) 
                                    ? socialPostData.post.join('\n') 
                                    : socialPostData.post;
                                await generateImage(postContent, 'socialPost');
                            }}
                            imageGenerationStyle={imageGenerationStyle}
                            imageGenerationColor={imageGenerationColor}
                            isGeneratingImage={isGeneratingImage}
                        />
                    )}
                </div>
            );
        }

        const content = analysisContent[activeView];
        return (
            <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[80vh] transition-colors">
                <div className="absolute top-4 right-2 sm:right-8">
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
                            title={t('actions', 'Acties')}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="5" r="2"/>
                                <circle cx="12" cy="12" r="2"/>
                                <circle cx="12" cy="19" r="2"/>
                            </svg>
                        </button>
                        {showActionButtons && (
                            <div 
                                className="absolute top-0 right-2 sm:right-10 flex flex-wrap gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 mr-0 sm:-mr-2 max-w-[calc(100vw-2rem)]"
                                onMouseEnter={() => setShowActionButtons(true)}
                                onMouseLeave={() => setShowActionButtons(false)}
                            >
                                {activeView !== 'transcript' && (
                                    <button onClick={() => {
                                        // Regenerate content based on activeView
                                        const currentView = activeView as ViewType;
                                        switch (currentView) {
                                            case 'summary':
                                                handleResetAnalysis('summary');
                                                break;
                                            case 'faq':
                                                handleResetAnalysis('faq');
                                                break;
                                            case 'learning':
                                                handleResetAnalysis('learning');
                                                break;
                                            case 'followUp':
                                                handleResetAnalysis('followUp');
                                                break;
                                            case 'exec':
                                                handleGenerateExecutiveSummary();
                                                break;
                                            case 'keyword':
                                                handleGenerateKeywordAnalysis();
                                                break;
                                            case 'sentiment':
                                                handleAnalyzeSentiment();
                                                break;
                                            case 'blog':
                                                handleGenerateBlog();
                                                break;
                                            case 'businessCase':
                                                handleGenerateBusinessCase();
                                                break;
                                            case 'quiz':
                                                handleGenerateQuiz();
                                                break;
                                            case 'mindmap':
                                                handleGenerateMindmap();
                                                break;
                                            case 'storytelling':
                                                handleGenerateStorytelling();
                                                break;
                                        }
                                    }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('regenerate', 'Regenerate')} title={t('regenerate', 'Opnieuw genereren')}>
                                        🔄
                                    </button>
                                )}
                                <button onClick={async () => {
                                    await copyToClipboard(content);
                                    displayToast(t('contentCopied', 'Content copied to clipboard!'));
                                }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')} title={t('copyContent', 'Kopiëren')}>
                                    <CopyIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => downloadTextFile(markdownToPlainText(content), `${activeView}.txt`)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download" title="Downloaden">
                                    ⬇️
                                </button>
                                <button onClick={() => {
                                    const allActions = [...primaryActions, ...analysisActions];
                                    const found = allActions.find(a => a.id === activeView);
                                    const fnName = found ? found.label() : activeView;
                                    const { subject, body } = generateEmailContent(fnName, content || '');
                                    copyToClipboardForEmail(subject, body);
                                }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Copy for Email" title="Kopiëren voor e-mail">
                                    ✉️
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
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
                 teachMeData={teachMeData}
                 thinkingPartnerAnalysis={thinkingPartnerAnalysis}
                 selectedThinkingPartnerTopic={selectedThinkingPartnerTopic}
                 selectedThinkingPartner={selectedThinkingPartner}
                 opportunitiesData={opportunitiesData}
                 mckinseyAnalysis={mckinseyAnalysis?.analysis}
                 selectedMckinseyTopic={selectedMckinseyTopic}
                 selectedMckinseyRole={selectedMckinseyRole}
                 selectedMckinseyFramework={selectedMckinseyFramework}
                 socialPostData={socialPostData}
                    socialPostXData={socialPostXData}
                 quizQuestions={quizQuestions}
                 quizIncludeAnswers={quizIncludeAnswers}
                 startStamp={startStamp}
                 outputLanguage={outputLang}
                 onNotify={(msg, type) => displayToast(msg, type)}
                 onGenerateSocialPost={async (analysisType, count) => {
                     // Use getTranscriptSlice to limit transcript length and prevent Gemini API extended feed limit
                     const transcriptSlice = getTranscriptSlice(transcript, 12000); // Same limit as other social functions
                     const { validateAndSanitizeForAI } = await import('./src/utils/security');
                     const validation = validateAndSanitizeForAI(transcriptSlice, 500000);
                     if (!validation.isValid || !validation.sanitized.trim()) {
                         displayToast(t('transcriptEmpty'), 'error');
                         return;
                     }
                     // Social post generation called
                     await generateSocialPost(analysisType, validation.sanitized, count);
                 }}
                 isGeneratingSocialPost={isGenerating}
                 onGenerateImage={generateImage}
                 imageGenerationStyle={imageGenerationStyle}
                 imageGenerationColor={imageGenerationColor}
                 isGeneratingImage={isGeneratingImage}
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
                    const modelName = await getModelForUser(authState.user?.uid || "", "generalAnalysis");
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
             {/* Main Navigation Dropdown */}
             <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-b border-gray-200 dark:border-slate-600 shadow-sm">
                <div className="flex items-center gap-4 flex-wrap min-w-0">
                    <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 min-w-fit">
                        {t('chooseModeLabel')}
                    </label>
                    <select
                        value={mainMode}
                        onChange={(e) => {
                            const newMode = e.target.value as 'transcript' | 'analysis' | 'actions';
                            setMainMode(newMode);
                            setError(null); // Clear error messages when switching modes
                            // Update activeView based on mode selection
                            if (newMode === 'transcript') {
                                setActiveView('transcript');
                            } else if (newMode === 'analysis') {
                                // Only set active view if an analysis has been selected
                                if (selectedAnalysis) {
                                    setActiveView(selectedAnalysis);
                                }
                                // Scroll to top when switching to analysis mode
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else if (newMode === 'actions') {
                                // Keep current view for actions mode
                            }
                        }}
                        className="w-full sm:flex-1 min-w-0 max-w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none cursor-pointer"
                    >
                        <option value="transcript">Transcript</option>
                        <option value="analysis">{t('analysisResults')}</option>
                        <option value="actions">{t('advancedFunctions')}</option>
                    </select>
                </div>
                
                {/* Secondary Analysis Dropdown */}
                {mainMode === 'analysis' && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2 sm:gap-4 mt-4 min-w-0">
                        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 sm:min-w-fit">
                            {t('chooseAnalysisLabel')}
                        </label>
                        <select
                            value={selectedAnalysis || ''}
                            onChange={(e) => {
                                const newAnalysis = e.target.value as ViewType;
                                setSelectedAnalysis(newAnalysis);
                                if (newAnalysis) {
                                    setActiveView(newAnalysis);
                                    handleTabClick(newAnalysis);
                                }
                                setError(null); // Clear error messages when switching analysis
                            }}
                            className="w-full sm:flex-1 min-w-0 max-w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none cursor-pointer text-sm sm:text-base min-h-[44px] touch-manipulation"
                        >
                            <option value="">{t('selectAnalysis')}</option>
                            <option value="summary">{t('summary')}</option>
                            <option value="keyword">{t('keywordAnalysis')}</option>
                            <option value="sentiment">{t('sentiment')}</option>
                            <option value="faq">{t('faq')}</option>
                            <option value="quiz">{t('quizQuestions')}</option>
                            <option value="learning">{t('keyLearnings')}</option>
                            <option value="followUp">{t('followUp')}</option>
                            <option value="mindmap">{t('mindmap')}</option>
                            <option value="storytelling">{t('storytelling')}</option>
                            <option value="blog">{t('blog')}</option>
                            <option value="explain">{t('explain')}</option>
                            <option value="teachMe">{t('teachMe')}</option>
                            {(userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.ENTERPRISE || userSubscription === SubscriptionTier.DIAMOND) && (
                                <option value="showMe">{t('showMe')}</option>
                            )}
                            {(userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.ENTERPRISE || userSubscription === SubscriptionTier.DIAMOND) && (
                                <option value="thinkingPartner">{t('thinkingPartner')}</option>
                            )}
                            {(userSubscription === SubscriptionTier.DIAMOND || userSubscription === SubscriptionTier.ENTERPRISE) && (
                                <option value="opportunities">{t('opportunitiesAnalysis')}</option>
                            )}
                            {(userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.ENTERPRISE || userSubscription === SubscriptionTier.DIAMOND) && (
                                <option value="mckinsey">{t('mckinsey')}</option>
                            )}

                            {(userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.ENTERPRISE || userSubscription === SubscriptionTier.DIAMOND || sessionType === SessionType.EMAIL_IMPORT) && (
                                <option value="email">{t('email')}</option>
                            )}
                            {(userSubscription === SubscriptionTier.GOLD || userSubscription === SubscriptionTier.ENTERPRISE || userSubscription === SubscriptionTier.DIAMOND) && (
                                <option value="socialPost">{t('socialPost')}</option>
                            )}
                        </select>
                    </div>
                )}
                
                {/* Actions Grid */}
                {mainMode === 'actions' && (
                    <div className="mt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {primaryActions.filter(action => action.type === 'action').map(action => (
                                <button
                                    key={action.id}
                                    onClick={action.onClick}
                                    disabled={action.disabled ? action.disabled() : isProcessing}
                                    className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <action.icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {action.label()}
                                    </span>
                                </button>
                            ))}
                            {/* Chat and Business Case buttons */}
                            <button
                                onClick={() => {
                    // Chat knop geklikt
                    // Switch to analysis mode and open Chat view
                    setMainMode('analysis');
                    setSelectedAnalysis('chat');
                    setActiveView('chat');
                }}
                                disabled={isProcessing}
                                className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChatIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t('chatWithTranscript')}
                                </span>
                            </button>
                            {/* Specials button */}
                            <button
                              onClick={() => {
                                setMainMode('analysis');
                                setSelectedAnalysis('specials');
                                setActiveView('specials');
                                handleTabClick('specials');
                              }}
                              disabled={isProcessing}
                              className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={t('specials')}
                            >
                              <SparklesIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('specials')}
                              </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="min-h-[60vh]">
                {renderContent()}
            </div>
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
            {/* Move chat conversation to transcript (plain text) */}
            {chatHistory.length > 0 && (
                <button
                    onClick={() => setShowChatMoveToTranscriptModal(true)}
                    className="ml-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    title={t('aiDiscussion.moveToTranscript', 'Verplaats naar transcript')}
                >
                    {t('aiDiscussion.moveToTranscript', 'Verplaats naar transcript')}
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
    {/* Quota Warning Banner */}
    {authState.user && (
      <QuotaWarningBanner 
        onUpgrade={() => setShowUpgradeModal(true)}
      />
    )}
    

    
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
          {/* Hamburger Menu - moved to first position */}
          <HamburgerMenu
            isOpen={isMenuOpen}
            onToggle={() => setIsMenuOpen(!isMenuOpen)}
            user={authState.user}
            onLogout={handleLogout}
            onShowSettings={() => {
              if (userSubscription && userSubscription !== 'free') {
                setActiveSettingsTab('subscription');
              } else {
                setActiveSettingsTab('general');
              }
              settingsModal.open();
            }}
            onShowPricing={() => setShowPricingPage(true)}
            onShowFAQ={() => setShowFAQPage(true)}
            onShowReferralInfo={() => { 
              // Referral info clicked
              setShowInfoPage(false); 
              setShowReferralDashboardPage(false); 
              setShowReferralInfoPage(true); 
              displayToast(t('referralInfoOpen', 'Referral info geopend'), 'success'); 
              setTimeout(() => {
                const el = document.getElementById('referral-info');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }, 0);
            }}
            onShowReferralDashboard={() => { 
              // Dashboard clicked
              setShowInfoPage(false); 
              setShowReferralInfoPage(false); 
              setShowReferralDashboardPage(true); 
              displayToast(t('referralDashboardOpen', 'Referral dashboard geopend'), 'success'); 
              setTimeout(() => {
                const el = document.getElementById('referral-dashboard');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }, 0);
            }}
            t={t}
            theme={theme}
            userTier={userSubscription || SubscriptionTier.FREE}
            showUsageModal={showUsageModal}
            setShowUsageModal={setShowUsageModal}
          />
          
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
                          setBlogData(null);
                          setChatHistory([]);
                          setKeywordAnalysis(null);
                          setSentimentAnalysisResult(null);
                          setMindmapMermaid('');
                          setMindmapSvg('');
                          setExecutiveSummaryData(null);
                          setStorytellingData(null);
                          setBusinessCaseData(null);
                          setQuizQuestions(null);
                          setTeachMeData(null);
                          setActiveView('transcript');
                          setMainMode('analysis');
                          setSelectedAnalysis(null);
                          setStatus(RecordingStatus.IDLE);
                          setError(null);
                          setAnonymizationReport(null);
                          setPresentationReport(null);
                          setPptTemplate(null);
                          setLoadingText('');
                          setIsAnonymized(false);
                          chatInstanceRef.current = null;
                          // Clear social/email related states
                          setSocialPostData(null);
                          setSocialPostXData(null);
                          setEmailAddresses([]);
                          // Reset tab caches and clear topic cache
                          try { resetTabCache(); } catch {}
                          try { clearTopicCache(); } catch {}
                          // Bump startStamp to trigger full panel reset
                          setRecordingStartMs(Date.now());
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
                        <span>{t('analyse')}</span>
                      </button>
                      {/* Removed: Prompts import button */}
                    </>
                  ) : (
                    <>
                      {/* If user has no transcript, show "Start session" */}
                      <button 
                        onClick={() => setShowInfoPage(false)} 
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[120px]"
                      >
                        <span>{t('startOrUpload')}</span>
                      </button>
                      {/* Removed: Prompts import button */}
                    </>
                  )}
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
                      <span>{t('analyse')}</span>
                    </button>
                  )}
                  {/* Removed: Prompts import button */}
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
                      setBlogData(null);
                      setChatHistory([]);
                      setKeywordAnalysis(null);
                      setSentimentAnalysisResult(null);
                      setMindmapMermaid('');
                      setMindmapSvg('');
                      setExecutiveSummaryData(null);
                      setStorytellingData(null);
                      setBusinessCaseData(null);
                      setQuizQuestions(null);
                      setTeachMeData(null);
                      setActiveView('transcript');
                      setMainMode('analysis');
                      setSelectedAnalysis(null);
                      setStatus(RecordingStatus.IDLE);
                      setError(null);
                      setAnonymizationReport(null);
                      setPresentationReport(null);
                      setPptTemplate(null);
                      setLoadingText('');
                      setIsAnonymized(false);
                      chatInstanceRef.current = null;
                      // Clear social/email related states
                      setSocialPostData(null);
                      setSocialPostXData(null);
                      setEmailAddresses([]);
                      // Reset tab caches and clear topic cache
                      try { resetTabCache(); } catch {}
                      try { clearTopicCache(); } catch {}
                      // Bump startStamp to trigger full panel reset
                      setRecordingStartMs(Date.now());
                      
                      // Test popup met sessie informatie
                      const sessionInfo = {
                        timestamp: new Date().toLocaleString('nl-NL'),
                        userTier: userSubscription,
                        userId: auth.currentUser?.uid || 'guest',
                        sessionId: Date.now().toString()
                      };
                      

                    }} 
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[120px]"
                  >
                    <ResetIcon className="w-5 h-5"/> 
                    <span>{t('startNewSession')}</span>
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

        </div>
      </header>
      
      <CookieModal isOpen={cookieModal.isOpen} onClose={cookieModal.close} t={t} />

      <DisclaimerModal isOpen={disclaimerModal.isOpen} onClose={disclaimerModal.close} t={t} />

      <UsageModal 
        isOpen={showUsageModal} 
        onClose={() => setShowUsageModal(false)} 
        userTier={userSubscription}
        t={t}
        theme={theme}
        onShowPricing={() => {
          setShowUsageModal(false);
          setShowPricingPage(true);
        }}
        user={user}
        // Laat de totale maand-minuten live meebewegen tijdens opname
        currentRecordingElapsedMinutes={duration / 60}
      />

      <WaitlistModal isOpen={waitlistModal.isOpen} onClose={waitlistModal.close} t={t} waitlistEmail={waitlistEmail} setWaitlistEmail={setWaitlistEmail} addToWaitlist={addToWaitlist} />

      <AudioUploadHelpModal isOpen={audioUploadHelpModal.isOpen} onClose={audioUploadHelpModal.close} t={t} />

      <AudioLimitModal 
        isOpen={showAudioLimitModal} 
        onClose={() => setShowAudioLimitModal(false)} 
        currentTier={userSubscription}
        minutesUsed={0} // TODO: Get actual minutes used
        monthlyLimit={100} // TODO: Get actual monthly limit based on tier
        onUpgrade={(tier: SubscriptionTier) => {
          setUserSubscription(tier);
          setShowAudioLimitModal(false);
        }}
        t={t}
      />


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
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('webPageUrlLabel', 'Web Page URL')}</label>
                      <input
                        type="url"
                        placeholder={t('webPageUrlPlaceholder')}
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base min-h-[44px] touch-manipulation"
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
                          <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2 sm:p-3 transition-all duration-200 hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <input
                              type="url"
                              placeholder={`${t('webPageUrlPlaceholder')} ${index + 1}`}
                              className="w-full p-3 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 text-base sm:text-base min-h-[48px] touch-manipulation"
                              onChange={(e) => {
                                const newUrls = [...webPageUrls];
                                newUrls[index] = e.target.value;
                                setWebPageUrls(newUrls);
                              }}
                              value={url}
                            />
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
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button 
                  onClick={() => { 
                    setShowWebPageModal(false); 
                    setWebPageError(null); 
                    setUseDeepseek(false);
                    setWebPageUrls(['', '', '']);
                  }} 
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium w-full sm:w-auto"
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
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg font-semibold disabled:cursor-not-allowed flex items-center gap-2 w-full sm:w-auto"
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
                              {userSubscription ? t(`tier${userSubscription.charAt(0).toUpperCase() + userSubscription.slice(1)}`) : t('tierFree')}
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
                                {t('subscriptionScheduledChanges')}
                              </p>
                              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                {authState.user.scheduledTierChange.action ? t(`subscriptionScheduled${authState.user.scheduledTierChange.action.charAt(0).toUpperCase() + authState.user.scheduledTierChange.action.slice(1)}`) : t('subscriptionScheduledChange')}: {authState.user.scheduledTierChange.tier} — {t('subscriptionEffectiveDate')}: {(() => {
                                  const effective: any = authState.user.scheduledTierChange.effectiveDate;
                                  const date = effective && typeof effective === 'object' && 'seconds' in effective ? new Date(effective.seconds * 1000) : new Date(effective);
                                  return isNaN(date.getTime()) ? t('dateUnknown', 'Unknown date') : date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
                                })()}
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
                      {false && (
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

                      {/* Manage Subscription */}
                      {userSubscription !== 'free' && (
                        <button
                          onClick={() => {
                            settingsModal.close();
                            customerPortalModal.open();
                          }}
                          className="w-full p-3 sm:p-4 text-left rounded-lg transition-colors bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-blue-800 dark:text-blue-300">
                                {t('manageSubscription')}
                              </p>
                              <p className="text-sm text-blue-600 dark:text-blue-400">
                                {t('manageSubscriptionDesc')}
                              </p>
                            </div>
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
                              {t('subscriptionEffectiveDate')}: {(() => {
                                const effective: any = authState.user.scheduledTierChange.effectiveDate;
                                const date = effective && typeof effective === 'object' && 'seconds' in effective ? new Date(effective.seconds * 1000) : new Date(effective);
                                return isNaN(date.getTime()) ? t('dateUnknown', 'Unknown date') : date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
                              })()}
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
                          value="accurate"
                          checked={transcriptionQuality === 'accurate'}
                          onChange={(e) => setTranscriptionQuality(e.target.value as 'fast' | 'balanced' | 'accurate')}
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
                          onChange={(e) => setTranscriptionQuality(e.target.value as 'fast' | 'balanced' | 'accurate')}
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
                          onChange={(e) => setTranscriptionQuality(e.target.value as 'fast' | 'balanced' | 'accurate')}
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
              
              {/* Tab-specifieke Actie Knoppen */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                {/* General Tab - alleen Close knop */}
                {activeSettingsTab === 'general' && (
                  <button
                    onClick={() => settingsModal.close()}
                    className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                  >
                    {t('settingsClose')}
                  </button>
                )}
                
                {/* Subscription Tab - alleen Close knop (geen save nodig) */}
                {activeSettingsTab === 'subscription' && (
                  <button
                    onClick={() => settingsModal.close()}
                    className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                  >
                    {t('settingsClose')}
                  </button>
                )}
                
                {/* Transcription Tab - Cancel en Save knoppen */}
                {activeSettingsTab === 'transcription' && (
                  <>
                    <button
                      onClick={() => {
                        // Reset transcription settings to original values
                        setTranscriptionQuality(authState.user?.transcriptionQuality || 'balanced');
                        setAudioCompressionEnabled(authState.user?.audioCompressionEnabled ?? true);
                        setAutoStopRecordingEnabled(authState.user?.autoStopRecordingEnabled ?? false);
                        settingsModal.close();
                      }}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      {t('settingsCancel')}
                    </button>
                    <button
                      onClick={() => {
                        saveTranscriptionSettings();
                      }}
                      className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                    >
                      {t('settingsSave')}
                    </button>
                  </>
                )}
                
                {/* Anonymization Tab - Cancel en Save knoppen */}
                {activeSettingsTab === 'anonymization' && (
                  <>
                    <button
                      onClick={() => {
                        // Reset anonymization rules to original values
                        if (authState.user?.anonymizationRules) {
                          setAnonymizationRules(authState.user.anonymizationRules);
                        } else {
                          setAnonymizationRules([]);
                        }
                        settingsModal.close();
                      }}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      {t('settingsCancel')}
                    </button>
                    <button
                      onClick={() => {
                        saveAnonymizationRules();
                      }}
                      className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                    >
                      {t('settingsSave')}
                    </button>
                  </>
                )}
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
          <BlurredLoadingOverlay loadingText={t('loading')} />
        ) : (showInfoPage || (!authState.user && !showReferralInfoPage && !showReferralDashboardPage && !showReferralSignupModal)) ? (
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
                        onClick={async () => {
                          if (!waitlistEmail.trim()) return;
                          
                          setWaitlistLoading(true);
                          setWaitlistFeedback({ type: null, message: '' });
                          
                          try {
                            const result = await addToWaitlist(waitlistEmail);
                            setWaitlistFeedback({
                              type: result.type as 'success' | 'error',
                              message: result.message
                            });
                            
                            // Auto-clear feedback after 5 seconds
                            setTimeout(() => {
                              setWaitlistFeedback({ type: null, message: '' });
                            }, 5000);
                            
                            if (result.success) {
                              setWaitlistEmail(''); // Clear email on success
                            }
                          } catch (error) {
                            setWaitlistFeedback({
                              type: 'error',
                              message: t('waitlistErrorAdding') || 'Er is een fout opgetreden'
                            });
                            
                            // Auto-clear error feedback after 5 seconds
                            setTimeout(() => {
                              setWaitlistFeedback({ type: null, message: '' });
                            }, 5000);
                          } finally {
                            setWaitlistLoading(false);
                          }
                        }}
                        disabled={!waitlistEmail.trim() || waitlistLoading}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-md font-medium hover:bg-cyan-700 disabled:bg-slate-400 transition-colors"
                      >
                        {waitlistLoading ? t('loading') || 'Laden...' : t('waitlistSignUp')}
                      </button>
                    </div>
                    
                    {/* Feedback message */}
                    {waitlistFeedback.type && (
                      <div className={`mt-3 p-3 rounded-md text-sm ${
                        waitlistFeedback.type === 'success' 
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                      }`}>
                        {waitlistFeedback.message}
                      </div>
                    )}
                    
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
                  <div className="mb-2 rounded-lg border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/30 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-sm text-cyan-900 dark:text-cyan-200">
                      {t('pwaInstallBannerText')}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end sm:justify-start">
                      <button onClick={handlePwaIgnore} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto">
                        {t('pwaIgnore')}
                      </button>
                      <button onClick={handlePwaInstall} className="px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white transition-colors w-full sm:w-auto">
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

                                {/* Audio Upload Option */}
                                <div className="bg-white dark:bg-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600 p-6 hover:border-amber-300 dark:hover:border-amber-500 transition-all duration-200 hover:shadow-lg h-full min-h-[300px] flex flex-col">
                                    <div className="text-center mb-4">
                                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{t('sessionOptionAudioUpload')}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('sessionOptionAudioUploadDesc')}</p>
                                    </div>
                                    <button onClick={handleSessionOptionAudioUpload} disabled={isProcessing || !language || !outputLang} className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white hover:from-amber-600 hover:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 disabled:from-slate-300 dark:disabled:from-slate-800 disabled:to-slate-400 dark:disabled:to-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-medium">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                        <span>{t('sessionOptionAudioUpload')}</span>
                                    </button>
                                    {/* Audio upload help link */}
                                    <div className="mt-3 text-center">
                                        <button onClick={() => audioUploadHelpModal.open()} className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline hover:no-underline transition-all duration-200">
                                            🎵 {t('audioUploadHelpTitle')}
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
                                            {t('webPageHelpTitle')}
                                        </button>
                                    </div>
                                </div>

                                {/* Idea Builder Option */}
                                <div className="bg-white dark:bg-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600 p-6 hover:border-amber-300 dark:hover:border-amber-500 transition-all duration-200 hover:shadow-lg h-full min-h-[300px] flex flex-col">
                                    <div className="text-center mb-4">
                                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3a7 7 0 00-7 7c0 2.29 1.06 4.33 2.7 5.62A3 3 0 009 18v1a3 3 0 003 3h0a3 3 0 003-3v-1a3 3 0 002.3-2.38A7 7 0 0011 3z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{t('ideaBuilderTitle', 'Idea Builder')}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('ideaBuilderDesc', 'Generate high-quality ideas and outlines based on topic, audience and goals.')}</p>
                                    </div>
                                    <button onClick={() => ideaBuilderModal.open()} disabled={isProcessing || !language || !outputLang} className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 text-white hover:from-amber-600 hover:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 disabled:from-slate-300 dark:disabled:from-slate-800 disabled:to-slate-400 dark:disabled:to-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 font-medium">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3a7 7 0 00-7 7c0 2.29 1.06 4.33 2.7 5.62A3 3 0 009 18v1a3 3 0 003 3h0a3 3 0 003-3v-1a3 3 0 002.3-2.38A7 7 0 0011 3z" />
                                        </svg>
                                        <span>{t('ideaBuilderTitle', 'Idea Builder')}</span>
                                    </button>
                                    {/* Idea Builder help link */}
                                    <div className="mt-3 text-center">
                                        <button onClick={() => setIsIdeaBuilderHelpOpen(true)} className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline hover:no-underline transition-all duration-200">
                                            {t('ideaBuilderHelpTitle', 'Idea Builder Help')}
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
                                            <button onClick={() => notionIntegrationHelpModal.open()} className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline hover:no-underline transition-all duration-200">
                                                🧭 {t('notionIntegrationInstall')}
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
          setShowDisclaimerModal={disclaimerModal.open}
        />

    {/* Upgrade Modal */}
    {upgradeModal.isOpen && (
      <Modal
        isOpen={upgradeModal.isOpen}
        onClose={upgradeModal.close}
        title={t('upgradeModalTitle')}
      >
        <UpgradeModal
          isOpen={upgradeModal.isOpen}
          onClose={upgradeModal.close}
          onUpgrade={(tier: SubscriptionTier) => {
            setUserSubscription(tier);
            upgradeModal.close();
          }}
          message={error || ''}
          t={t}
        />
      </Modal>
    )}
    {/* Session Options Modal */}
    <SessionOptionsModal
      isOpen={sessionOptionsModal.isOpen}
      onClose={() => sessionOptionsModal.close()}
      onStartRecording={startRecording}
      onUploadFile={() => handleSessionOptionUpload()}
      onPasteText={() => pasteModal.open()}
      onWebPage={() => webPageModal.open()}
      onUploadImage={() => handleSessionOptionImageUpload()}
      onAudioUpload={() => handleSessionOptionAudioUpload()}
      onEmailImport={() => emailUploadModal.open()}
      onNotionImport={() => notionImportModal.open()}
      onAskExpert={() => expertConfigModal.open()}
      onIdeaBuilder={() => ideaBuilderModal.open()}
      userSubscription={SubscriptionTier[userSubscription] as unknown as string}
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
        isLoggedIn={!!authState.user}
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

    {/* Referral Info Modal */}
    {showReferralInfoPage && (
      <Modal
        isOpen={showReferralInfoPage}
        onClose={() => setShowReferralInfoPage(false)}
        title={t('referralProgramTitle', 'Referral programma')}
        maxWidth="max-w-3xl"
      >
        <ReferralInfoPage
          t={t}
          onEnrollClick={() => {
            // Prevent opening signup modal if user already has a referral code
            if (authState.user?.referralProfile?.code) {
              return; // User already has a referral code, do nothing
            }
            // Close info modal first to avoid stacking issues, then open signup
            setShowReferralInfoPage(false);
            setTimeout(() => setShowReferralSignupModal(true), 50);
          }}
          hasReferral={!!authState.user?.referralProfile}
          referralInfo={authState.user?.referralProfile?.code ? { code: authState.user?.referralProfile?.code, joinUrl: buildReferralJoinUrl(authState.user?.referralProfile?.code) } : null}
        />
      </Modal>
    )}

    {/* Referral Dashboard Modal */}
    {showReferralDashboardPage && (
      <Modal
        isOpen={showReferralDashboardPage}
        onClose={() => setShowReferralDashboardPage(false)}
        title={t('referralDashboardTitle', 'Mijn dashboard')}
        maxWidth="max-w-4xl"
      >
        <ReferralDashboard
          t={t}
          userId={authState.user?.uid}
          hasReferral={!!authState.user?.referralProfile}
        />
      </Modal>
    )}

    {/* Referral Signup Modal */}
    {showReferralSignupModal && (
      <ReferralSignupModal
        isOpen={showReferralSignupModal}
        onClose={() => setShowReferralSignupModal(false)}
        onEnroll={enrollReferral}
        t={t}
      />
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

    {/* Image Generation Subscription Modal */}
    {showImageGenerationModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {t('imageGenerationGoldFeature')}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('imageGenerationUpgradeMessage')}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowImageGenerationModal(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              {t('cancel', 'Annuleren')}
            </button>
            <button
              onClick={() => {
                setShowImageGenerationModal(false);
                setShowPricingPage(true);
              }}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
            >
              {t('upgradeToGold')}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Image Generation Result Modal */}
    {showImageGenerationResult && (
      <ImageGenerationModal
        isOpen={showImageGenerationResult}
        onClose={() => {
          setShowImageGenerationResult(false);
          setGeneratedImagePrompt('');
          setImageInstructionsCopied(false);
        }}
        isGenerating={isGeneratingImage}
        imageInstructions={generatedImagePrompt}
        onCopyInstructions={() => {
          navigator.clipboard.writeText(generatedImagePrompt);
          setImageInstructionsCopied(true);
          displayToast(t('imageInstructionCopied') || 'AI afbeelding instructie gekopieerd naar klembord', 'success');
          setTimeout(() => setImageInstructionsCopied(false), 2000);
        }}
        instructionsCopied={imageInstructionsCopied}
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

    {/* Audio Upload Modal */}
    {audioUploadModal.isOpen && (
      <AudioUploadModal
        isOpen={audioUploadModal.isOpen}
        onClose={audioUploadModal.close}
        onAudioImport={async (file) => {
          await importAudioFile(file);
          audioUploadModal.close();
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
          // Trigger RecapHorizonPanel full reset by bumping startStamp
          setRecordingStartMs(Date.now());
          setStatus(RecordingStatus.FINISHED);
          setActiveView('transcript');
          displayToast(t('webPageStandardSuccess') || 'Successfully processed web page', 'success');
          notionImportModal.close();
        }}
      />
    )}

    {/* Idea Builder Modal */}
    {ideaBuilderModal.isOpen && (
      <IdeaBuilderModal
        isOpen={ideaBuilderModal.isOpen}
        onClose={ideaBuilderModal.close}
        t={t}
        userId={authState.user?.uid || ''}
        userTier={userSubscription}
        onGenerate={(text) => {
          const sanitizedText = sanitizeTextInput(text);
          setTranscript(sanitizedText);
          // Trigger RecapHorizonPanel full reset by bumping startStamp
          setRecordingStartMs(Date.now());
          setStatus(RecordingStatus.FINISHED);
          setActiveView('transcript');
          displayToast(t('ideaBuilderSuccess', 'Ideas generated successfully'), 'success');
          ideaBuilderModal.close();
        }}
      />
    )}

    {/* Notion Integration Help Modal */}
    {notionIntegrationHelpModal.isOpen && (
      <NotionIntegrationHelpModal
        isOpen={notionIntegrationHelpModal.isOpen}
        onClose={notionIntegrationHelpModal.close}
      />
    )}

    {/* Idea Builder Simple Help Modal */}
    {isIdeaBuilderHelpOpen && (
      <IdeaBuilderSimpleHelp
        isOpen={isIdeaBuilderHelpOpen}
        onClose={() => setIsIdeaBuilderHelpOpen(false)}
      />
    )}

    {/* Removed: Prompts Import Modal */}

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
           // Trigger RecapHorizonPanel full reset by bumping startStamp
           setRecordingStartMs(Date.now());
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

    {/* Move Chat Conversation to Transcript Modal */}
    {showChatMoveToTranscriptModal && (
      <Modal
        isOpen={showChatMoveToTranscriptModal}
        onClose={() => setShowChatMoveToTranscriptModal(false)}
        title={t('aiDiscussion.moveToTranscriptModal.title', 'Rapport naar transcript verplaatsen')}
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            {t('aiDiscussion.moveToTranscriptModal.message', 'Dit rapport wordt het nieuwe transcript en vervangt de huidige inhoud. Het kan daarna gebruikt worden voor verdere analyse met andere opties.')}
          </p>
          <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">
            {t('aiDiscussion.moveToTranscriptModal.warning', 'Let op: De huidige transcript-inhoud wordt permanent vervangen.')}
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setShowChatMoveToTranscriptModal(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t('aiDiscussion.moveToTranscriptModal.cancel', 'Annuleren')}
            </button>
              <button
              onClick={async () => {
                try {
                  const plain = chatHistory
                    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${markdownToPlainText(msg.text || '')}`)
                    .join('\n\n');
                  setTranscript(plain);
                  setMainMode('transcript');
                  setSelectedAnalysis(null);
                  // Clear RecapHorizon content for new session
                  setSummary('');
                  setFaq('');
                  setLearningDoc('');
                  setFollowUpQuestions('');
                  setKeywordAnalysis(null);
                  setSentimentAnalysisResult(null);
                  setChatHistory([]);
                  setMindmapMermaid('');
                  setExecutiveSummaryData(null);
                  setStorytellingData(null);
                  setBusinessCaseData(null);
                  setBlogData(null);
                  setExplainData(null);
                  setTeachMeData(null);
                  setThinkingPartnerAnalysis('');
                  setSelectedThinkingPartnerTopic('');
                  setSelectedThinkingPartner(null);
                  setOpportunitiesData(null);
                  setMckinseyAnalysis(null);
                  setSelectedMckinseyTopic('');
                  setSelectedMckinseyRole('');
                  setSelectedMckinseyFramework('');
                  setSocialPostData(null);
                  setSocialPostXData(null);
                  setQuizQuestions([]);
                  // Trigger RecapHorizonPanel full reset by bumping startStamp
                  setRecordingStartMs(Date.now());
                  if (authState.user?.uid) {
                    try {
                      await incrementUserMonthlySessions(authState.user.uid);
                    } catch (error) {
                      console.error('Failed to increment session counter:', error);
                    }
                  }
                  setActiveView('transcript');
                  setShowChatMoveToTranscriptModal(false);
                } catch (err) {
                  console.error(err);
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              {t('aiDiscussion.moveToTranscriptModal.confirm', 'Ja, vervang transcript')}
            </button>
          </div>
        </div>
      </Modal>
    )}

    {/* Move Business Case to Transcript Modal */}
    {showBusinessCaseMoveToTranscriptModal && (
      <Modal
        isOpen={showBusinessCaseMoveToTranscriptModal}
        onClose={() => setShowBusinessCaseMoveToTranscriptModal(false)}
        title={t('aiDiscussion.moveToTranscriptModal.title', 'Rapport naar transcript verplaatsen')}
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            {t('aiDiscussion.moveToTranscriptModal.message', 'Dit rapport wordt het nieuwe transcript en vervangt de huidige inhoud. Het kan daarna gebruikt worden voor verdere analyse met andere opties.')}
          </p>
          <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">
            {t('aiDiscussion.moveToTranscriptModal.warning', 'Let op: De huidige transcript-inhoud wordt permanent vervangen.')}
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setShowBusinessCaseMoveToTranscriptModal(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t('aiDiscussion.moveToTranscriptModal.cancel', 'Annuleren')}
            </button>
              <button
              onClick={async () => {
                try {
                  const txt = `Business Case\n\n${businessCaseData?.businessCase || ''}`;
                  const plain = markdownToPlainText(txt);
                  setTranscript(plain);
                  setMainMode('transcript');
                  setSelectedAnalysis(null);
                  // Clear RecapHorizon content for new session
                  setSummary('');
                  setFaq('');
                  setLearningDoc('');
                  setFollowUpQuestions('');
                  setKeywordAnalysis(null);
                  setSentimentAnalysisResult(null);
                  setChatHistory([]);
                  setMindmapMermaid('');
                  setExecutiveSummaryData(null);
                  setStorytellingData(null);
                  setBusinessCaseData(null);
                  setBlogData(null);
                  setExplainData(null);
                  setTeachMeData(null);
                  setThinkingPartnerAnalysis('');
                  setSelectedThinkingPartnerTopic('');
                  setSelectedThinkingPartner(null);
                  setOpportunitiesData(null);
                  setMckinseyAnalysis(null);
                  setSelectedMckinseyTopic('');
                  setSelectedMckinseyRole('');
                  setSelectedMckinseyFramework('');
                  setSocialPostData(null);
                  setSocialPostXData(null);
                  setQuizQuestions([]);
                  // Trigger RecapHorizonPanel full reset by bumping startStamp
                  setRecordingStartMs(Date.now());
                  if (authState.user?.uid) {
                    try {
                      await incrementUserMonthlySessions(authState.user.uid);
                    } catch (error) {
                      console.error('Failed to increment session counter:', error);
                    }
                  }
                  setActiveView('transcript');
                  setShowBusinessCaseMoveToTranscriptModal(false);
                } catch (err) {
                  console.error(err);
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              {t('aiDiscussion.moveToTranscriptModal.confirm', 'Ja, vervang transcript')}
            </button>
          </div>
        </div>
      </Modal>
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
         t={t}
       />
     )}

     {/* Customer Portal Return Screen */}
     {showCustomerPortalReturn && (
       <CustomerPortalReturnScreen
         onClose={() => setShowCustomerPortalReturn(false)}
         t={t}
       />
     )}

     {/* Anonymization Saved Notification */}
     {anonymizationSavedModal.isOpen && (
       <NotificationModal
         isOpen={anonymizationSavedModal.isOpen}
         onClose={anonymizationSavedModal.close}
         title={t('anonymizationRulesSavedTitle')}
         message={t('anonymizationRulesSavedDesc')}
         type="success"
       />
     )}

     {/* Quota Exceeded Modal */}
     {showQuotaExceededModal && (
       <QuotaExceededModal
         isOpen={showQuotaExceededModal}
         onClose={() => setShowQuotaExceededModal(false)}
         errorMessage={quotaExceededError}
         onUpgrade={() => {
           setShowQuotaExceededModal(false);
           setShowPricingPage(true);
         }}
       />
     )}
     
     {/* Session Timeout Warning */}
     {sessionId && (
       <SessionTimeoutWarning
         sessionId={sessionId}
         onExtendSession={handleExtendSession}
         onLogout={handleSessionExpired}
         t={t}
       />
     )}

     {/* Referral Registration Modal */}
     {showReferralRegistrationModal && referralCodeFromURL && (
       <ReferralRegistrationModal
         isOpen={showReferralRegistrationModal}
         onClose={() => setShowReferralRegistrationModal(false)}
         onCreateAccount={handleCreateAccount}
         t={t}
         uiLang={uiLang}
         referralCode={referralCodeFromURL}
         referrerData={referrerData}
         onShowInfoPage={() => {
           setShowReferralRegistrationModal(false);
           setShowInfoPage(true);
         }}
         onLanguageChange={(lang) => {
           setUiLang(lang as Language);
           // Persist using the canonical key and update legacy key for compatibility
           localStorage.setItem('uiLanguage', lang);
           localStorage.setItem('uiLang', lang);
         }}
      />
     )}

     {/* Email Confirmation Modal */}
     {showEmailConfirmationModal && (
       <EmailConfirmationModal
         isOpen={showEmailConfirmationModal}
         onClose={() => {
           setShowEmailConfirmationModal(false);
           setPendingConfirmationEmail('');
           setConfirmationContext('waitlist');
         }}
         onConfirmed={handleEmailConfirmed}
         email={pendingConfirmationEmail}
         context={confirmationContext}
       />
     )}

     {/* Summary Questions Modal */}
     {summaryQuestionsModal.isOpen && (
       <SummaryQuestionsModal
         isOpen={summaryQuestionsModal.isOpen}
         onClose={() => { summaryQuestionsModal.close(); setActiveView('summary'); }}
         onGenerate={(options) => {
           setSummaryOptions(options);
           summaryQuestionsModal.close();
           handleGenerateAnalysis('summary');
         }}
         t={t}
       />
     )}

   </main>
  </div>
  </>
); 
}
