import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RecordingStatus, type SpeechRecognition } from './types';
import { GoogleGenAI, Chat, Type } from "@google/genai";
// Mermaid is ESM-only; import dynamically to avoid type issues
let mermaid: any;
import PptxGenJS from 'pptxgenjs';
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
import { auth, db } from './src/firebase';

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
const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
);
const ResetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
);
const SummaryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 11-6 6v3h9l6-6-3-3Z"/><path d="m22 6-3-3-1.41 1.41 3 3L22 6Z"/><path d="m14 10 3 3"/></svg>
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
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.432 0l6.586-6.586a2.426 2.426 0 0 0 0-3.432L12.586 2.586z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>
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
}> = ({ onLogin, onCreateAccount, onPasswordReset, onClose }) => {
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
          throw new Error('Wachtwoorden komen niet overeen');
        }
        if (password.length < 6) {
          throw new Error('Wachtwoord moet minimaal 6 karakters zijn');
        }
        // Save email to localStorage
        localStorage.setItem('last_email', email);
        await onCreateAccount(email, password);
      } else if (mode === 'reset') {
        await onPasswordReset(email);
        setSuccess('Wachtwoord reset email verzonden!');
        setTimeout(() => setMode('login'), 2000);
      }
    } catch (error: any) {
      setError(error.message || 'Er is een fout opgetreden');
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
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="jouw@email.com"
        />
      </div>

      {mode !== 'reset' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Wachtwoord
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus={!!email} // Auto-focus if email is pre-filled
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="••••••••"
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
              Dit wachtwoord is specifiek voor deze app
            </p>
          )}
        </div>
      )}

      {mode === 'create' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Bevestig Wachtwoord
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="••••••••"
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
          ) : mode === 'login' ? 'Inloggen' : mode === 'create' ? 'Account Aanmaken' : 'Reset Versturen'}
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
              Account aanmaken
            </button>
            <button
              type="button"
              onClick={() => setMode('reset')}
              className="text-cyan-500 hover:text-cyan-600 transition-colors"
            >
              Wachtwoord vergeten?
            </button>
          </>
        )}
        
        {mode === 'create' && (
          <button
            type="button"
            onClick={() => setMode('login')}
            className="text-cyan-500 hover:text-cyan-600 transition-colors"
          >
            Terug naar inloggen
          </button>
        )}
        
        {mode === 'reset' && (
          <button
            type="button"
            onClick={() => setMode('login')}
            className="text-cyan-500 hover:text-cyan-600 transition-colors"
          >
            Terug naar inloggen
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

const PodcastPlayer: React.FC<{ script: string; language: 'nl' | 'en'; t: (key: any, params?: any) => string; }> = ({ script, language, t }) => {
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
            utterance.lang = language === 'nl' ? 'nl-NL' : 'en-US';
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

const KeywordExplanationModal: React.FC<{ keyword: string; explanation: string | null; isLoading: boolean; onClose: () => void; t: (key: any, params?: any) => string; }> = ({ keyword, explanation, isLoading, onClose, t }) => {
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

const ApiKeySetupModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (apiKey: string) => void; 
    t: (key: any, params?: any) => string; 
    storagePreference: 'local' | 'database';
    onStoragePreferenceChange: (preference: 'local' | 'database') => void;
    isLoggedIn: boolean;
}> = ({ isOpen, onClose, onSave, t, storagePreference, onStoragePreferenceChange, isLoggedIn }) => {
    const [inputApiKey, setInputApiKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSave = async () => {
        if (!inputApiKey.trim()) {
            setError(t('apiKeyRequired'));
            return;
        }

        setIsValidating(true);
        setError(null);

        try {
            // Test de API key met een eenvoudige call
            const ai = new GoogleGenAI({ apiKey: inputApiKey.trim() });
            await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: 'Test' 
            });
            
            onSave(inputApiKey.trim());
        } catch (err: any) {
            setError(t('apiKeyInvalid'));
        } finally {
            setIsValidating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
            <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-6 max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400 mb-4">🔑 Google Gemini API Key Instellen</h3>
                
                <div className="space-y-6">
                    {/* Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📋 Stap-voor-stap instructies voor het ophalen van je API key:</h4>
                        
                        {/* Gratis & Veilig Info */}
                        <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded p-3 mb-3">
                            <p className="text-green-700 dark:text-green-300 font-medium text-sm">✅ Volledig Gratis & Veilig</p>
                            <p className="text-green-600 dark:text-green-400 text-sm">• Geen kosten bij Google</p>
                            <p className="text-green-600 dark:text-green-400 text-sm">• Geen betalingsmiddel nodig</p>
                            <p className="text-green-600 dark:text-green-400 text-sm">• Ruime gratis limiet per maand</p>
                        </div>
                        
                        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700 dark:text-blue-300">
                            <li>Klik op de blauwe knop hieronder</li>
                            <li>Log in met je Google account</li>
                            <li>Klik op "Create API Key"</li>
                            <li>Kopieer de gegenereerde key</li>
                            <li>Plak de key in het veld hieronder</li>
                        </ol>
                        <div className="mt-3">
                            <a 
                                href="https://aistudio.google.com/apikey" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                🔑 Haal je gratis API key op bij Google AI Studio
                            </a>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                                <strong>Directe link:</strong> https://aistudio.google.com/apikey
                            </p>
                        </div>
                    </div>

                    {/* API Key Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            🔑 Voer je Google Gemini API key in:
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={inputApiKey}
                                onChange={(e) => setInputApiKey(e.target.value)}
                                placeholder="AIzaSyC... (begint altijd met AIzaSy)"
                                className="w-full px-3 py-2 pr-10 border-2 border-cyan-300 dark:border-cyan-500 rounded-md bg-cyan-50 dark:bg-cyan-900/20 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:border-cyan-400 placeholder-cyan-400 dark:placeholder-cyan-500"
                                disabled={isValidating}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                title={showPassword ? "Verberg API key" : "Toon API key"}
                            >
                                {showPassword ? "👁️‍🗨️" : "👁️"}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            💡 Je API key begint altijd met "AIzaSy" en is ongeveer 40 karakters lang
                        </p>
                        {error && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                        )}
                    </div>

                    {/* Storage Preference */}
                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">💾 Kies waar je API key wordt opgeslagen:</h4>
                        
                        <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="storage"
                                    value="local"
                                    checked={storagePreference === 'local'}
                                    onChange={(e) => onStoragePreferenceChange(e.target.value as 'local' | 'database')}
                                    className="mt-1"
                                />
                                <div>
                                    <span className="font-medium text-blue-700 dark:text-blue-300">🌐 Browser (Lokaal)</span>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        • API key wordt opgeslagen in je browser<br/>
                                        • Alleen toegankelijk op dit apparaat<br/>
                                        • Verloren bij het wissen van browser data<br/>
                                        • <strong>Voordeel:</strong> Volledig lokaal, geen database opslag
                                    </p>
                                </div>
                            </label>
                            
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="storage"
                                    value="database"
                                    checked={storagePreference === 'database'}
                                    onChange={(e) => onStoragePreferenceChange(e.target.value as 'local' | 'database')}
                                    className="mt-1"
                                />
                                <div>
                                    <span className="font-medium text-blue-700 dark:text-blue-300">🗄️ Database (Veilig & Versleuteld)</span>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        • API key wordt gehashed en versleuteld opgeslagen<br/>
                                        • Toegankelijk op alle apparaten waar je inlogt<br/>
                                        • Veilig tegen data verlies<br/>
                                        • <strong>Voordeel:</strong> Backup en synchronisatie tussen apparaten
                                    </p>
                                    {!isLoggedIn && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                            ⚠️ Je moet ingelogd zijn om deze optie te gebruiken. Je kunt je eerst aanmelden en dan terugkomen.
                                        </p>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Privacy Note */}
                    <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg p-3">
                        <p className="text-sm text-green-700 dark:text-green-300">
                            <strong>🔒 Privacy & Veiligheid:</strong> Je API key wordt nooit in plain text opgeslagen en wordt alleen gebruikt voor AI verwerking.
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            <strong>💡 Database opslag:</strong> API key wordt gehashed met SHA-256 + salt en versleuteld opgeslagen. Zelfs wij kunnen de originele key niet lezen.
                        </p>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    {/* Main Action Buttons */}
                    <div className="space-y-3">
                        {/* Info melding als geen key is ingevoerd */}
                        {!inputApiKey.trim() && (
                            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-3 text-center">
                                <p className="text-amber-700 dark:text-amber-300 text-sm">
                                    ⚠️ Voer eerst je API key in om deze op te kunnen slaan
                                </p>
                            </div>
                        )}
                        
                        {/* Database Opslag Knop */}
                        <button 
                            onClick={() => {
                                // Sla op in database als dat is gekozen, anders lokaal
                                onSave(inputApiKey.trim());
                            }}
                            disabled={isValidating || !inputApiKey.trim()}
                            className="w-full px-4 py-2 bg-cyan-500 text-white rounded-md font-semibold hover:bg-cyan-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors disabled:cursor-not-allowed"
                        >
                            {isValidating ? 'Valideren...' : storagePreference === 'database' ? '🗄️ API Key in Database Opslaan' : '🌐 API Key Lokaal Opslaan'}
                        </button>
                        
                        {/* Alternative Options - Alleen tonen als er een key is */}
                        {inputApiKey.trim() && storagePreference === 'database' && (
                            <button 
                                onClick={() => {
                                    // Force lokaal opslaan
                                    onStoragePreferenceChange('local');
                                    onSave(inputApiKey.trim());
                                }}
                                disabled={isValidating}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors disabled:cursor-not-allowed"
                            >
                                🌐 Toch Lokaal Opslaan (Geen Database)
                            </button>
                        )}
                        
                        {/* Cancel Button */}
                        <button 
                            onClick={onClose} 
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            ❌ Scherm Afsluiten
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PowerPointOptionsModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onGenerate: (options: { maxSlides: number; language: 'nl' | 'en'; useTemplate: boolean; templateFile?: File | null }) => void; 
    t: (key: any, params?: any) => string; 
    currentTemplate: File | null;
    onTemplateChange: (file: File | null) => void;
}> = ({ isOpen, onClose, onGenerate, t, currentTemplate, onTemplateChange }) => {
    const [maxSlides, setMaxSlides] = useState(10);
    const [language, setLanguage] = useState<'nl' | 'en'>('nl');
    const [useTemplate, setUseTemplate] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // ... existing code ...

    useEffect(() => {
        if (isOpen) {
            setMaxSlides(10);
            setLanguage('nl');
            setUseTemplate(false);
        }
    }, [isOpen]);

    const handleGenerate = () => {
        onGenerate({ maxSlides, language, useTemplate, templateFile: useTemplate ? currentTemplate : null });
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
                        <div className="flex gap-3">
                            <label className="flex items-center">
                                <input 
                                    type="radio" 
                                    name="language" 
                                    value="nl" 
                                    checked={language === 'nl'} 
                                    onChange={(e) => setLanguage(e.target.value as 'nl' | 'en')}
                                    className="mr-2 text-cyan-500 focus:ring-cyan-500"
                                />
                                {t('dutch')}
                            </label>
                            <label className="flex items-center">
                                <input 
                                    type="radio" 
                                    name="language" 
                                    value="en" 
                                    checked={language === 'en'} 
                                    onChange={(e) => setLanguage(e.target.value as 'nl' | 'en')}
                                    className="mr-2 text-cyan-500 focus:ring-cyan-500"
                                />
                                {t('english')}
                            </label>
                        </div>
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
type ViewType = 'transcript' | 'summary' | 'faq' | 'learning' | 'followUp' | 'chat' | 'podcast' | 'keyword' | 'sentiment' | 'mindmap';
type AnalysisType = ViewType | 'presentation';
type ChatRole = 'user' | 'model';
interface ChatMessage {
  role: ChatRole;
  text: string;
}
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
interface KeywordTopic {
    topic: string;
    keywords: string[];
}
interface SentimentAnalysisResult {
  taggedText: string;
  summary: string;
  conclusion: string;
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
  isAdmin: boolean;
  lastLogin: Date | null;
  sessionCount: number;
  createdAt: Date;
  updatedAt: Date;
  hashedApiKey?: string;
  apiKeyLastUpdated?: Date;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
}


// --- i18n ---
const translations = {
    nl: {
        cookieTitle: "Cookies for Analytics",
        cookiePoint1: "Essential cookies only",
        cookiePoint2: "No tracking of personal data",
        cookiePoint3: "Helps us improve the app",
        accept: "Accept",
        decline: "Decline",
        sessionLang: "Selecteer Sessie Taal",
        dutch: "Nederlands",
        english: "English",
        startRecording: "Start Opname",
        uploadTranscript: "Upload Transcript",
        waitingPermission: "Wachten op schermopname toestemming...",
        pause: "Pauze",
        stop: "Stop",
        resume: "Hervat",
        recordingStopped: "Opname gestopt. Klaar om te transcriberen.",
        transcribeSession: "Transcribeer Sessie",
        transcribing: "Transcriptie bezig...",
        summarizing: "Samenvatting wordt gemaakt...",
        processing: "Verwerken...",
        appTitle: "RecapSmart",
        appDescription: "Neem op, upload, transcribeer en analyseer uw sessies met AI.",
        reset: "Reset",
        startNewSession: "Nieuwe Sessie",
        errorRecording: "Fout bij opstarten opname",
        permissionDenied: "Toestemming voor scherm- en/of microfoonopname is geweigerd. Om op te nemen, moet u de pagina herladen en toestemming verlenen wanneer de browser daarom vraagt. Als u geen prompt ziet, controleer dan de site-instellingen van uw browser om de toestemming te deblokkeren.",
        noDevices: "Geen geschikte opnameapparaten (scherm, microfoon) gevonden. Zorg ervoor dat ze zijn aangesloten en ingeschakeld.",
        unknownError: "Er is een onbekende fout opgetreden.",
        anonymizing: "Transcript wordt geanonimiseerd...",
        anonymizationComplete: "Anonimisering voltooid.",
        termsReplaced: "{count} termen vervangen.",
        nothingToReplace: "Geen te vervangen termen gevonden.",
        anonymizeSuccess: "Anonimisering voltooid. {report} vervangen.",
        anonymizeNothing: "Anonimisering voltooid. Geen te vervangen termen gevonden.",
        selectLangFirst: "Selecteer een taal voordat u de opname start.",
        noAudioToTranscribe: "Geen audio opgenomen om te transcriberen.",
        apiKeyMissing: "API_KEY ontbreekt.",
        aiError: "AI-verwerking mislukt",
        transcriptEmpty: "De transcriptie is leeg, dus er kan geen analyse worden gemaakt.",
        generating: "Genereren van {type}...",
        generationFailed: "AI {type} generatie mislukt",
        transcript: "Transcript",
        transcriptAnonymized: "Transcript (A)",
        summary: "Samenvatting",
        faq: "FAQ",
        keyLearnings: "Key Learnings",
        followUp: "Follow-up",
        chat: "Chat",
        podcast: "Podcast",
        anonymize: "Anoniem",
        makePodcast: "Maak Podcast",
        exportPPT: "Export PPT",
        copyContent: "Kopieer inhoud",
        noContent: "Nog geen inhoud gegenereerd.",
        chatWithTranscript: "Chat met Transcript",
        readAnswers: "Lees antwoorden voor",
        mindmap: "Mindmap",
        askAQuestion: "Stel een vraag over de transcriptie...",
        generatingPresentation: "Presentatie wordt gemaakt...",
        generatingImageForSlide: "Afbeelding genereren voor slide: \"{title}\"...",
        finalizingPresentation: "Presentatie afronden...",
        presentationFailed: "Genereren van presentatie mislukt",
        speechRecognitionUnsupported: "Spraakherkenning wordt niet ondersteund in deze browser.",
        podcastGenerating: "Podcastscript wordt gemaakt...",
        podcastFailed: "Genereren van podcast mislukt",
        fileReadFailed: "Bestand lezen mislukt",
        selectLangToUpload: "Selecteer een taal voordat u een transcript uploadt.",
        keywordAnalysis: "Keyword Analyse",
        sentimentAnalysis: "Sentiment Analyse",
        showSentiment: "Toon Sentiment",
        hideSentiment: "Verberg Sentiment",
        analyzingSentiment: "Sentiment analyseren...",
        startOrUpload: "Start Sessie",
        step1: "Stap 1",
        step2: "Stap 2",
        presentationSuccess: "Presentatie '{fileName}' met {slideCount} slides succesvol aangemaakt en opgeslagen in uw Downloads map.",
        podcastReady: "Podcast is klaar om af te spelen",
        rewindPodcast: "Herstart podcast",
        downloadScript: "Download script",
        play: "Afspelen",
        podcastDownloadNote: "Let op: browsers ondersteunen het direct downloaden van de audio niet. Dit downloadt het door AI gegenereerde script.",
        inhoudsopgave: "Inhoudsopgave",
        taak: "Taak",
        eigenaar: "Eigenaar",
        deadline: "Deadline",
        sentimentSummary: "Sentiment Samenvatting",
        sentimentConclusion: "Algemene Conclusie",
        sentimentOverall: "Algehele Sentimentanalyse",
        keywordExplanation: "Uitleg voor '{keyword}'",
        fetchingExplanation: "Uitleg ophalen...",
        close: "Sluiten",
        uploadTemplate: "Upload Sjabloon",
        templateUploaded: "Sjabloon: {name}",
        clearTemplate: "Wis sjabloon",
        pptTemplateNote: "Opmerking: AI-afbeeldingen zijn uitgeschakeld bij gebruik van een aangepast sjabloon.",
        listenAlongTitle: "Luister mee met podcasts en YouTube",
        listenAlongBody: "Gebruik RecapSmart om mee te luisteren met podcasts en YouTube-video's. Handig voor extra uitleg en om meer uit een uitzending te halen: zet systeemgeluid aan, speel de video of podcast af en laat RecapSmart automatisch transcriberen en samenvatten.",
        landingHeroSubtitle: "Transformeer je meetings, webinars en gesprekken in professionele documenten, presentaties en inzichten met AI",
        waitlistTitle: "📋 Toegang op Uitnodiging",
        waitlistLead: "RecapSmart is momenteel alleen beschikbaar voor uitgenodigde gebruikers. Meld je aan voor de wachtlijst!",
        emailPlaceholder: "jouw@email.nl",
        waitlistSignUp: "Aanmelden",
        waitlistMoreInfo: "Meer informatie over de wachtlijst",
        haveAccessLead: "Heb je al toegang? Log dan in om te beginnen",
        loginNow: "Inloggen",
        featuresTitle: "Perfect Voor:",
        featureRecordingTitle: "🎙️ Slimme Opname",
        featureRecordingDesc: "Neem meetings, webinars en gesprekken op met je microfoon en systeem audio. Automatische transcriptie in Nederlands of Engels.",
        featureAIAnalysisTitle: "📝 AI Analyse",
        featureAIAnalysisDesc: "Genereer samenvattingen, FAQ's, leerpunten en vervolgvragen automatisch met Google Gemini AI.",
        featurePresentationsTitle: "📊 Presentaties",
        featurePresentationsDesc: "Maak professionele PowerPoint presentaties met AI gegenereerde content en afbeeldingen.",
        featureChatTitle: "💬 Chat & Vragen",
        featureChatDesc: "Stel vragen over je transcriptie en krijg gedetailleerde antwoorden. Ondersteuning voor voice input.",
        featurePodcastTitle: "🎧 Podcast Scripts",
        featurePodcastDesc: "Genereer podcast scripts en content op basis van je meetings. Perfect voor content creators.",
        featurePrivacyTitle: "🔒 Privacy & Anonimisatie",
        featurePrivacyDesc: "Automatische anonimisatie van namen en gevoelige informatie. Instelbare regels voor jouw organisatie.",
        privacyTitle: "🔒 Volledige Privacy Garantie",
        privacyLead: "Belangrijk: Je sessies worden NIET opgeslagen in onze database. Alle data blijft volledig lokaal op jouw apparaat.",
        privacyItemRecordings: "🎙️ Opnames blijven lokaal",
        privacyItemTranscripts: "📝 Transcripties zijn privé",
        privacyItemAIOutput: "🤖 AI output alleen voor jou",
        privacyItemApiKeyLocal: "🔑 API key lokaal opgeslagen",
        privacyItemNoServers: "🌐 Geen data naar onze servers",
        privacyItemWeStoreNothing: "✅ Wij bewaren helemaal niets",
        privacyFootnote: "Jouw privacy staat voorop. We kunnen jouw sessies niet zien, opslaan of gebruiken.",
        useCasesTitle: "💼 Perfect Voor:",
        useCasesMgmtTitle: "Management & Leiderschap",
        useCasesMgmt1: "Projectmanagers en teamleiders",
        useCasesMgmt2: "Product owners en productmanagers",
        useCasesMgmt3: "Executives en CEO's (voor strategische meetings en rapportages)",
        useCasesMgmt4: "Salesmanagers en accountmanagers (voor klantgesprekken en pitches)",
        useCasesAdviceTitle: "Advies & Consultatie",
        useCasesAdvice1: "Consultants en adviseurs",
        useCasesAdvice2: "Support consultants",
        useCasesAdvice3: "HR-professionals en recruiters (voor interviews en onboarding)",
        useCasesAdvice4: "Financiële adviseurs en auditors (voor compliance en rapporten)",
        useCasesCreationTitle: "Creatie & Communicatie",
        useCasesCreation1: "Content creators en journalisten",
        useCasesCreation2: "Marketeers en PR-specialisten (voor brainstorms en campagnes)",
        useCasesCreation3: "Webinar hosts en trainers",
        useCasesCreation4: "Podcasters en vloggers (voor opnames en editten)",
        useCasesResearchTitle: "Onderzoek & Analyse",
        useCasesResearch1: "Onderzoekers en academici",
        useCasesResearch2: "Legal professionals",
        useCasesResearch3: "Accountants en boekhouders",
        useCasesResearch4: "Data-analisten en onderzoekers in business intelligence (voor data-sessies en inzichten)",
        howItWorksTitle: "🔄 Hoe Het Werkt:",
        hiwStep1Title: "Opnemen",
        hiwStep1Desc: "Start een opname van je meeting of upload een transcript",
        hiwStep2Title: "AI Verwerking",
        hiwStep2Desc: "AI analyseert en genereert content op basis van je input",
        hiwStep3Title: "Resultaat",
        hiwStep3Desc: "Download je documenten, presentaties en inzichten",
        ctaTitle: "🚀 Klaar om te Starten?",
        ctaLead: "Log in en ontdek hoe RecapSmart je workflow kan transformeren. Bespaar uren aan handmatige notities en documentatie.",
        listening: "Luisteren...",
        speaking: "Spreek je vraag in...",
        startListening: "Start spraakherkenning",
        stopListening: "Stop spraakherkenning",
        powerpointOptions: "PowerPoint Opties",
        useCustomTemplate: "Gebruik aangepast sjabloon",
        selectTemplate: "Selecteer sjabloon",
        maxSlides: "Maximum slides",
        presentationLanguage: "Presentatie taal",
        generatePresentation: "Genereer presentatie",
        cancel: "Annuleren",
        setupApiKey: "API Key Instellen",
        howToGetApiKey: "Hoe krijg je een Google Gemini API Key?",
        apiKeyStep1: "Ga naar Google MakerSuite",
        apiKeyStep2: "Log in met je Google account",
        apiKeyStep3: "Klik op 'Create API Key'",
        apiKeyStep4: "Kopieer de gegenereerde key",
        openGoogleMakerSuite: "Open Google MakerSuite",
        enterApiKey: "Voer je API Key in",
        apiKeyRequired: "API Key is verplicht",
        apiKeyInvalid: "API Key is ongeldig",
        validating: "Valideren...",
        saveApiKey: "API Key Opslaan",
        privacyNote: "Privacy Opmerking",
        apiKeyPrivacy: "Je API key wordt alleen lokaal opgeslagen op je apparaat en wordt nooit naar onze servers gestuurd.",
    },
    en: {
        cookieTitle: "Cookies for Analytics",
        cookiePoint1: "Essential cookies only",
        cookiePoint2: "No tracking of personal data",
        cookiePoint3: "Helps us improve the app",
        accept: "Accept",
        decline: "Decline",
        sessionLang: "Select Session Language",
        dutch: "Nederlands",
        english: "English",
        startRecording: "Start Recording",
        uploadTranscript: "Upload Transcript",
        waitingPermission: "Waiting for screen recording permission...",
        pause: "Pause",
        stop: "Stop",
        resume: "Resume",
        recordingStopped: "Recording stopped. Ready to transcribe.",
        transcribeSession: "Transcribe Session",
        transcribing: "Transcribing...",
        summarizing: "Summarizing...",
        processing: "Processing...",
        appTitle: "RecapSmart",
        appDescription: "Record, upload, transcribe, and analyze your sessions with AI.",
        reset: "Reset",
        startNewSession: "Start New Session",
        errorRecording: "Error starting recording",
        permissionDenied: "Permission for screen and/or microphone recording was denied. To record, you must reload the page and grant permission when prompted. If you don't see a prompt, check your browser's site settings to unblock permission.",
        noDevices: "No suitable recording devices (screen, microphone) found. Ensure they are connected and enabled.",
        unknownError: "An unknown error has occurred.",
        anonymizing: "Anonymizing transcript...",
        anonymizationComplete: "Anonymization complete.",
        termsReplaced: "{count} terms replaced.",
        nothingToReplace: "No terms found to replace.",
        anonymizeSuccess: "Anonymization complete. Replaced {report}.",
        anonymizeNothing: "Anonymization complete. No terms found to replace.",
        selectLangFirst: "Please select a language before starting to record.",
        noAudioToTranscribe: "No audio recorded to transcribe.",
        apiKeyMissing: "API_KEY is missing.",
        aiError: "AI processing failed",
        transcriptEmpty: "The transcript is empty, so no analysis can be generated.",
        generating: "Generating {type}...",
        generationFailed: "AI {type} generation failed",
        transcript: "Transcript",
        transcriptAnonymized: "Transcript (A)",
        summary: "Summary",
        faq: "FAQ",
        keyLearnings: "Key Learnings",
        followUp: "Follow-up",
        chat: "Chat",
        podcast: "Podcast",
        anonymize: "Anonymize",
        makePodcast: "Make Podcast",
        exportPPT: "Export PPT",
        copyContent: "Copy content",
        noContent: "No content generated yet.",
        chatWithTranscript: "Chat with Transcript",
        readAnswers: "Read answers aloud",
        mindmap: "Mindmap",
        askAQuestion: "Ask a question about the transcript...",
        generatingPresentation: "Generating presentation...",
        generatingImageForSlide: "Generating image for slide: \"{title}\"...",
        finalizingPresentation: "Finalizing presentation...",
        presentationFailed: "Failed to generate presentation",
        speechRecognitionUnsupported: "Speech recognition is not supported in this browser.",
        podcastGenerating: "Generating podcast script...",
        podcastFailed: "Failed to generate podcast",
        fileReadFailed: "Failed to read file",
        selectLangToUpload: "Please select a language before uploading a transcript.",
        keywordAnalysis: "Keyword Analysis",
        sentimentAnalysis: "Sentiment Analysis",
        showSentiment: "Show Sentiment",
        hideSentiment: "Hide Sentiment",
        analyzingSentiment: "Analyzing sentiment...",
        startOrUpload: "Start Session",
        step1: "Step 1",
        step2: "Step 2",
        presentationSuccess: "Successfully created presentation '{fileName}' with {slideCount} slides. Saved to your Downloads folder.",
        podcastReady: "Podcast is ready to play",
        rewindPodcast: "Rewind podcast",
        downloadScript: "Download script",
        play: "Play",
        podcastDownloadNote: "Note: Browsers do not support direct audio download. This will download the AI-generated script.",
        inhoudsopgave: "Table of Contents",
        taak: "Task",
        eigenaar: "Owner",
        deadline: "Deadline",
        sentimentSummary: "Sentiment Summary",
        sentimentConclusion: "Overall Conclusion",
        sentimentOverall: "Overall Sentiment Analysis",
        keywordExplanation: "Explanation for '{keyword}'",
        fetchingExplanation: "Fetching explanation...",
        close: "Close",
        uploadTemplate: "Upload Template",
        templateUploaded: "Template: {name}",
        clearTemplate: "Clear template",
        pptTemplateNote: "Note: AI images are disabled when using a custom template.",
        listenAlongTitle: "Listen along with podcasts and YouTube",
        listenAlongBody: "Use RecapSmart to listen along to podcasts and YouTube videos. Great for extra explanations and getting more out of any show: enable system audio, play the video or podcast, and let RecapSmart transcribe and summarize automatically.",
        landingHeroSubtitle: "Transform your meetings, webinars and conversations into professional documents, presentations and insights with AI",
        waitlistTitle: "📋 Access by Invitation",
        waitlistLead: "RecapSmart is currently available by invitation only. Join the waitlist!",
        emailPlaceholder: "your@email.com",
        waitlistSignUp: "Join",
        waitlistMoreInfo: "More about the waitlist",
        haveAccessLead: "Already have access? Log in to get started",
        loginNow: "Log in",
        featuresTitle: "Perfect For:",
        featureRecordingTitle: "🎙️ Smart Recording",
        featureRecordingDesc: "Record meetings, webinars and conversations with your microphone and system audio. Automatic transcription in Dutch or English.",
        featureAIAnalysisTitle: "📝 AI Analysis",
        featureAIAnalysisDesc: "Generate summaries, FAQs, key learnings and follow-up questions automatically with Google Gemini AI.",
        featurePresentationsTitle: "📊 Presentations",
        featurePresentationsDesc: "Create professional PowerPoint presentations with AI-generated content and images.",
        featureChatTitle: "💬 Chat & Questions",
        featureChatDesc: "Ask questions about your transcript and get detailed answers. Voice input supported.",
        featurePodcastTitle: "🎧 Podcast Scripts",
        featurePodcastDesc: "Generate podcast scripts and content from your meetings. Perfect for content creators.",
        featurePrivacyTitle: "🔒 Privacy & Anonymization",
        featurePrivacyDesc: "Automatic anonymization of names and sensitive information. Configurable rules for your organization.",
        privacyTitle: "🔒 Full Privacy Guarantee",
        privacyLead: "Important: Your sessions are NOT stored in our database. All data stays fully local on your device.",
        privacyItemRecordings: "🎙️ Recordings stay local",
        privacyItemTranscripts: "📝 Transcripts are private",
        privacyItemAIOutput: "🤖 AI output only for you",
        privacyItemApiKeyLocal: "🔑 API key stored locally",
        privacyItemNoServers: "🌐 No data to our servers",
        privacyItemWeStoreNothing: "✅ We store nothing at all",
        privacyFootnote: "Your privacy comes first. We cannot see, store or use your sessions.",
        useCasesTitle: "💼 Perfect For:",
        useCasesMgmtTitle: "Management & Leadership",
        useCasesMgmt1: "Project managers and team leads",
        useCasesMgmt2: "Product owners and product managers",
        useCasesMgmt3: "Executives and CEOs (for strategic meetings and reporting)",
        useCasesMgmt4: "Sales managers and account managers (for customer talks and pitches)",
        useCasesAdviceTitle: "Advisory & Consulting",
        useCasesAdvice1: "Consultants and advisors",
        useCasesAdvice2: "Support consultants",
        useCasesAdvice3: "HR professionals and recruiters (for interviews and onboarding)",
        useCasesAdvice4: "Financial advisors and auditors (for compliance and reports)",
        useCasesCreationTitle: "Creation & Communication",
        useCasesCreation1: "Content creators and journalists",
        useCasesCreation2: "Marketers and PR specialists (for brainstorms and campaigns)",
        useCasesCreation3: "Webinar hosts and trainers",
        useCasesCreation4: "Podcasters and vloggers (for recording and editing)",
        useCasesResearchTitle: "Research & Analysis",
        useCasesResearch1: "Researchers and academics",
        useCasesResearch2: "Legal professionals",
        useCasesResearch3: "Accountants and bookkeepers",
        useCasesResearch4: "Data analysts and BI researchers (for data sessions and insights)",
        howItWorksTitle: "🔄 How It Works:",
        hiwStep1Title: "Record",
        hiwStep1Desc: "Start a recording of your meeting or upload a transcript",
        hiwStep2Title: "AI Processing",
        hiwStep2Desc: "AI analyzes and generates content based on your input",
        hiwStep3Title: "Result",
        hiwStep3Desc: "Download your documents, presentations and insights",
        ctaTitle: "🚀 Ready to Start?",
        ctaLead: "Log in and discover how RecapSmart can transform your workflow. Save hours on manual notes and documentation.",
        listening: "Listening...",
        speaking: "Speak your question...",
        startListening: "Start speech recognition",
        stopListening: "Stop speech recognition",
        powerpointOptions: "PowerPoint Options",
        useCustomTemplate: "Use custom template",
        selectTemplate: "Select template",
        maxSlides: "Maximum slides",
        presentationLanguage: "Presentation language",
        generatePresentation: "Generate presentation",
        cancel: "Cancel",
        setupApiKey: "Setup API Key",
        howToGetApiKey: "How to get a Google Gemini API Key?",
        apiKeyStep1: "Go to Google MakerSuite",
        apiKeyStep2: "Sign in with your Google account",
        apiKeyStep3: "Click 'Create API Key'",
        apiKeyStep4: "Copy the generated key",
        openGoogleMakerSuite: "Open Google MakerSuite",
        enterApiKey: "Enter your API Key",
        apiKeyRequired: "API Key is required",
        apiKeyInvalid: "API Key is invalid",
        validating: "Validating...",
        saveApiKey: "Save API Key",
        privacyNote: "Privacy Note",
        apiKeyPrivacy: "Your API key is only stored locally on your device and is never sent to our servers.",
        recording: "Recording",
        paused: "Paused",
        recordingInProgress: "Recording in progress...",
        recordingPaused: "Recording paused",
        recordingActive: "Recording active",
    }
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
  const [status, setStatus] = useState<RecordingStatus>(RecordingStatus.IDLE);
  // `language` is for the content (what's spoken), `uiLang` is for the app chrome
  const [language, setLanguage] = useState<'nl' | 'en' | null>(null);
  const [uiLang, setUiLang] = useState<'nl' | 'en'>('en');
  
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

  // Ensure audio context is resumed on user gesture on iOS
  useEffect(() => {
    const resumeAudioContext = () => {
      const AudioContextClass: any = (window as any).AudioContext || (window as any).webkitAudioContext;
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
    window.addEventListener('touchend', resumeAudioContext, { passive: true } as any);
    window.addEventListener('click', resumeAudioContext);
    return () => {
      window.removeEventListener('touchend', resumeAudioContext);
      window.removeEventListener('click', resumeAudioContext);
    };
  }, []);

  // New analysis states
  const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordTopic[] | null>(null);
  const [sentimentAnalysisResult, setSentimentAnalysisResult] = useState<SentimentAnalysisResult | null>(null);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState<boolean>(false);
  const [presentationReport, setPresentationReport] = useState<string | null>(null);
  const [mindmapMermaid, setMindmapMermaid] = useState<string>('');
  const [mindmapSvg, setMindmapSvg] = useState<string>('');

  useEffect(() => {
    // Defer mermaid import until used to avoid type resolution issues
  }, [theme]);
  
  // PPT Template state
  const [pptTemplate, setPptTemplate] = useState<File | null>(null);
  const [showPptOptions, setShowPptOptions] = useState(false);
  
  // API Key state
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [hasDatabaseApiKey, setHasDatabaseApiKey] = useState(false);
  const [isValidatingApiKey, setIsValidatingApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // Cookie consent state
  const [showCookieConsent, setShowCookieConsent] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !window.localStorage.getItem('cookie_consent');
    }
    return true;
  });

  // Modal states
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSystemAudioHelp, setShowSystemAudioHelp] = useState(false);

  // Auth state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAdmin: false
  });

  // Admin state
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [apiKeyStoragePreference, setApiKeyStoragePreference] = useState<'local' | 'database'>('local');

  // Toast functie
  const displayToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);
      
      // Auto-hide na 5 seconden
      setTimeout(() => {
          setShowToast(false);
      }, 5000);
  };

  // API Key hashing functie voor veilige database opslag
  const hashApiKey = async (apiKey: string): Promise<string> => {
      // Gebruik Web Crypto API voor veilige hashing
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey + 'recapsmart_salt_2024'); // Salt voor extra beveiliging
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
  };

  // Encrypt/decrypt helpers voor DB-opslag van de plaintext key (client-side decryptable)
  const base64FromArrayBuffer = (buf: ArrayBuffer): string => {
    const bytes = new Uint8Array(buf);
    let str = '';
    for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
    return btoa(str);
  };
  const arrayBufferFromBase64 = (b64: string): ArrayBuffer => {
    const str = atob(b64);
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
    return buf.buffer;
  };
  const deriveAesKeyForUser = async (uid: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const passMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(uid + '|recapsmart_kek'),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('recapsmart_pbkdf2_salt_v1'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      passMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };
  const encryptApiKeyForUser = async (uid: string, key: string): Promise<string> => {
    const aesKey = await deriveAesKeyForUser(uid);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder().encode(key);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, enc);
    // Store as base64(iv + ciphertext)
    const combined = new Uint8Array(iv.byteLength + ct.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ct), iv.byteLength);
    return base64FromArrayBuffer(combined.buffer);
  };
  const decryptApiKeyForUser = async (uid: string, b64: string): Promise<string> => {
    const aesKey = await deriveAesKeyForUser(uid);
    const combined = new Uint8Array(arrayBufferFromBase64(b64));
    const iv = combined.slice(0, 12);
    const ct = combined.slice(12);
    const ptBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ct);
    return new TextDecoder().decode(ptBuf);
  };
  const [activeAdminTab, setActiveAdminTab] = useState<'waitlist' | 'users'>('waitlist');
  
  // Waitlist states
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlist, setWaitlist] = useState<any[]>([]);
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamsRef = useRef<MediaStream[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isProcessing = !!loadingText;


  
  const t = (key: keyof typeof translations['nl'], params?: Record<string, string | number>) => {
    let str = translations[uiLang][key] || translations['en'][key];
    if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
            str = str.replace(`{${paramKey}}`, String(paramValue));
        });
    }
    return str;
  };

  // --- PERSISTENCE & THEME ---
    useEffect(() => {
        const savedLang = localStorage.getItem('uiLang') as 'nl' | 'en' | null;
        if (savedLang) setUiLang(savedLang);
        
        // Laad API key uit localStorage of database
        const savedApiKey = localStorage.getItem('recapsmart_api_key');
        if (savedApiKey) {
            setApiKey(savedApiKey);
            setApiKeyStoragePreference('local');
            setHasDatabaseApiKey(false); // Reset database flag when loading from local storage
        }

        // Laad theme uit localStorage en pas direct toe
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            // Pas theme direct toe
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.body.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
            }
        }
    }, []);

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
                            isAdmin: userData.isAdmin
                        });
                        
                        // Load users if admin
                        if (userData.isAdmin) {
                            // Bypass admin guard immediately after auth state change to avoid stale state race
                            await loadUsers({ bypassAdminCheck: true });
                            await loadWaitlist({ bypassAdminCheck: true });
                        }
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                    setAuthState({
                        user: null,
                        isLoading: false,
                        isAdmin: false
                    });
                }
            } else {
                // User is signed out
                setAuthState({
                    user: null,
                    isLoading: false,
                    isAdmin: false
                });
            }
        });

        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            if (authState.isLoading) {
                console.log('Auth timeout, setting loading to false');
                setAuthState(prev => ({ ...prev, isLoading: false }));
            }
        }, 5000); // 5 second timeout
        
        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        console.log('Theme effect running, theme:', theme);
        if (theme === 'dark') {
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
            console.log('Removed dark class from document and body, set data-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('uiLang', uiLang);
    }, [uiLang]);

    // Effect voor admin panel beveiliging
    useEffect(() => {
        if (showAdminPanel && (!authState.user || !authState.isAdmin)) {
            setShowAdminPanel(false);
            displayToast('Admin toegang ingetrokken. Panel gesloten.', 'info');
        }
    }, [authState.user, authState.isAdmin, showAdminPanel]);

  const cleanupStreams = useCallback(() => {
    if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
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
    setShowApiKeyModal(false);
    setApiKeyError(null);
    setHasDatabaseApiKey(false);


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
    utterance.lang = language === 'nl' ? 'nl-NL' : 'en-US';
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
        console.error('Chat TTS SpeechSynthesis Error:', e.error);
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [language]);


  const submitMessage = useCallback(async (message: string) => {
    if (!message.trim() || isChatting) return;

    if (!apiKey && !hasDatabaseApiKey) {
        setShowApiKeyModal(true);
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
        if (isTTSEnabled) speak(fullResponse);

    } catch (err: any) {
        console.error("Fout bij chatten:", err);
        const errorMsg = `Chat error: ${err.message || 'Unknown error'}`;
        setChatHistory(prev => prev.map((msg, i) => i === prev.length - 1 ? { ...msg, text: errorMsg } : msg));
    } finally { setIsChatting(false); }
  }, [isChatting, chatHistory, transcript, isTTSEnabled, speak, apiKey, hasDatabaseApiKey]);
  
  const handleSendMessage = useCallback(async () => {
    const message = chatInput.trim();
    if (message) {
      if (!apiKey && !hasDatabaseApiKey) {
        setShowApiKeyModal(true);
        return;
      }
      setChatInput('');
      await submitMessage(message);
    }
  }, [chatInput, submitMessage, apiKey, hasDatabaseApiKey]);
  
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition();
        // By setting continuous to false, the recognition service stops after each utterance or timeout.
        // We then use the `onend` event to manually restart it, creating a more robust "continuous" experience
        // that is less prone to browser-specific timeout errors like 'no-speech'.
        recognition.continuous = false;
        recognition.interimResults = true; // Enable interim results for preview
        recognition.lang = language === 'nl' ? 'nl-NL' : 'en-US';

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
                if (apiKey || hasDatabaseApiKey) {
                    submitMessage(finalTranscript.trim());
                } else {
                    setShowApiKeyModal(true);
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
  }, [language, t, submitMessage]);

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
    if (!language) {
        setError(t("selectLangFirst"));
        return;
    }
    setStatus(RecordingStatus.GETTING_PERMISSION);
    setError(null);
    setDuration(0);

    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
      const supportsDisplay = typeof (navigator.mediaDevices as any).getDisplayMedia === 'function';

      let displayStream: MediaStream | null = null;
      if (supportsDisplay && !isIOS) {
        try {
          displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: { sampleRate: 44100, channelCount: 2 } as MediaTrackConstraints
          } as DisplayMediaStreamConstraints);
        } catch (dsErr) {
          console.warn('Display capture not available or denied. Falling back to microphone only.');
        }
      }

      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: { sampleRate: 44100, channelCount: 2 } as MediaTrackConstraints,
          video: false
        });
      } catch (micErr) {
        console.warn('Microphone access denied.');
      }

      streamsRef.current = [displayStream, micStream].filter(Boolean) as MediaStream[];

      // Create AudioContext in a mobile/iOS friendly way
      const AudioContextClass: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      const newAudioContext = new AudioContextClass();
      // iOS requires explicit resume after a user gesture
      if (newAudioContext.state === 'suspended') {
        try { await newAudioContext.resume(); } catch {}
      }
      audioContextRef.current = newAudioContext;

      const destination = newAudioContext.createMediaStreamDestination();
      const analyser = newAudioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      let hasAudio = false;

      if (displayStream) {
        const displayAudioTracks = displayStream.getAudioTracks();
        if (displayAudioTracks.length > 0) {
          const displaySource = newAudioContext.createMediaStreamSource(new MediaStream(displayAudioTracks));
          displaySource.connect(destination);
          displaySource.connect(analyser);
          hasAudio = true;
          console.log('Display audio connected to analyser');
        }
      }

      if (micStream) {
        const micAudioTracks = micStream.getAudioTracks();
        if (micAudioTracks.length > 0) {
          const micSource = newAudioContext.createMediaStreamSource(new MediaStream(micAudioTracks));
          micSource.connect(destination);
          micSource.connect(analyser);
          hasAudio = true;
          console.log('Microphone audio connected to analyser');
        }
      }

      if (!hasAudio) {
        throw new Error(t("noDevices"));
      }

      const combinedStream = destination.stream;

      // Pick a mimeType supported by the current browser (iOS Safari does not support audio/webm)
      let selectedType = '';
      try {
        const candidates = [
          'audio/webm; codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/aac',
          'audio/mpeg'
        ];
        for (const type of candidates) {
          if ((window as any).MediaRecorder && (MediaRecorder as any).isTypeSupported && (MediaRecorder as any).isTypeSupported(type)) {
            selectedType = type;
            break;
          }
        }
      } catch {}

      const recorder = selectedType
        ? new MediaRecorder(combinedStream, { mimeType: selectedType })
        : new MediaRecorder(combinedStream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const derivedType = recorder.mimeType || (audioChunksRef.current[0]?.type || 'audio/webm');
        const audioBlob = new Blob(audioChunksRef.current, { type: derivedType });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setStatus(RecordingStatus.STOPPED);
        cleanupStreams();
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      };

      recorder.start();
      setStatus(RecordingStatus.RECORDING);

      // Start de audio visualisatie
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      drawVisualizer();

      timerIntervalRef.current = window.setInterval(() => setDuration(prev => prev + 1), 1000);

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
      cleanupStreams();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.pause();
        setStatus(RecordingStatus.PAUSED);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
        mediaRecorderRef.current.resume();
        setStatus(RecordingStatus.RECORDING);
        
        // Start de audio visualisatie opnieuw
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
        drawVisualizer();
        
        timerIntervalRef.current = window.setInterval(() => setDuration(prev => prev + 1), 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (status === RecordingStatus.RECORDING || status === RecordingStatus.PAUSED)) {
      mediaRecorderRef.current.stop();
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
                    } catch (error: any) {
                        console.error('PDF parsing error:', error);
                        reject(new Error(`PDF verwerking mislukt: ${error.message || 'onbekende fout'}`));
                    }
                };
                reader.onerror = () => reject(new Error('PDF lezen mislukt'));
                reader.readAsArrayBuffer(file);
            } catch (error: any) {
                reject(new Error(`PDF library laden mislukt: ${error.message || 'onbekende fout'}`));
            }
        });
    };

    // DOCX ondersteuning verwijderd - te complex om te implementeren

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

    const extractTextFromHTML = async (file: File): Promise<string> => {
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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!language) {
            setError(t("selectLangToUpload"));
            return;
        }

        setError(null);
        setAnonymizationReport(null);
        setLoadingText('Bestand verwerken...');

        try {
            let text = '';
            const fileType = file.type.toLowerCase();
            const fileName = file.name.toLowerCase();

            // PDF bestanden
            if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
                text = await extractTextFromPDF(file);
            }
            // Word documenten (.docx) - niet meer ondersteund
            // else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
            //     text = await extractTextFromDocx(file);
            // }
            // RTF bestanden
            else if (fileType === 'application/rtf' || fileName.endsWith('.rtf')) {
                text = await extractTextFromRTF(file);
            }
            // HTML bestanden
            else if (fileType === 'text/html' || fileName.endsWith('.html') || fileName.endsWith('.htm')) {
                text = await extractTextFromHTML(file);
            }
            // Markdown bestanden
            else if (fileType === 'text/markdown' || fileName.endsWith('.md')) {
                text = await extractTextFromMarkdown(file);
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
                    throw new Error('Bestandsformaat wordt niet ondersteund. Probeer PDF, RTF, HTML, MD of TXT.');
                }
            }

            if (!text.trim()) {
                throw new Error('Geen tekst gevonden in het bestand.');
            }

            setTranscript(text);
            setStatus(RecordingStatus.FINISHED);
            // Increment user session count on successful finish
            try {
              if (authState.user) {
                await updateDoc(doc(db, 'users', authState.user.uid), {
                  sessionCount: increment(1),
                  updatedAt: serverTimestamp()
                });
                setAuthState(prev => prev.user ? ({ ...prev, user: { ...prev.user, sessionCount: (prev.user.sessionCount || 0) + 1 } }) : prev);
                if (authState.isAdmin) {
                  loadUsers({ bypassAdminCheck: true });
                }
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
    


    const handleAnonymizeTranscript = async () => {
        // Controleer of er anonimisatie regels zijn ingesteld
        if (anonymizationRules.length === 0 || anonymizationRules.every(rule => !rule.originalText.trim())) {
            setError('Geen anonimisatie regels ingesteld. Stel eerst de regels in via het instellingen scherm.');
            setShowSettingsModal(true);
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
                setPodcastScript(''); setChatHistory([]);
                setKeywordAnalysis(null);
                setSentimentAnalysisResult(null);
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

  const getAnalysisPrompt = (type: ViewType, lang: 'nl' | 'en'): string => {
    switch (type) {
        case 'summary':
            return lang === 'nl'
                ? `Vat de volgende tekst uitgebreid samen. Begin de samenvatting met een pakkende en relevante titel in het Nederlands, gevolgd door een nieuwe regel. De samenvatting moet alle belangrijke punten en hoofdideeën behandelen, de informatie condenseren tot een beknopt en gemakkelijk te begrijpen formaat en relevante details bevatten. Sluit af met citaten, actiepunten en beslissingen indien aanwezig.`
                : `Provide a comprehensive summary of the given text. Start the summary with a catchy and relevant title in English, followed by a new line. The summary should cover all the key points and main ideas, condensing the information into a concise and easy-to-understand format. End with quotes, action points, and decisions if any are present.`;
        case 'faq':
            return lang === 'nl'
                ? `Maak van het onderstaande transcript 10 FAQ-items (vraag + antwoord). Geef een belangrijkheidsbeoordeling van 1-5 sterren (halve sterren toegestaan, ★½). Plaats de sterren voor elke vraag. Houd vragen kort, antwoorden beknopt en feitelijk. Sorteer van meest naar minst belangrijk. Formaat:\n★★★★★ Vraag?\nAntwoord: …`
                : `From the transcript below, create 10 FAQ items (question + answer). Rank importance 1–5 stars, allow half-stars (★½). Put the stars before each question. Keep questions short, answers concise and factual. Order from most to least important. Format:\n★★★★★ Question?\nAnswer: …`;
        case 'learning':
            return lang === 'nl'
                ? `Maak van de onderstaande tekst een gestructureerd leerdocument met: Belangrijkste leerpunten, beoordeeld met 1-5 sterren (halve sterren toegestaan, ★½) voor belangrijkheid. Korte uitleg voor elk leerpunt. Gebruik duidelijke koppen en opsommingstekens. Sorteer van meest naar minst belangrijk.`
                : `From the text below, create a structured learning document with: Key takeaways, ranked 1–5 stars, allow half-stars (★½) for importance. Short explanations for each takeaway. Use clear headings and bullet points. Order from most to least important.`;
        case 'followUp':
            return lang === 'nl'
                ? `Genereer op basis van het onderstaande transcript 10 relevante vervolgvragen die in een volgende meeting gesteld kunnen worden om dieper op de onderwerpen in te gaan of openstaande punten te verhelderen. Formatteer de output als een genummerde lijst.`
                : `Based on the transcript below, generate 10 relevant follow-up questions that could be asked in a subsequent meeting to delve deeper into the topics or clarify outstanding points. Format the output as a numbered list.`;
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
        setShowApiKeyModal(true);
        return;
    }
    
    setLoadingText(t('generating', { type }));
    
    try {
        const prompt = getAnalysisPrompt(type, language!);
        if (!prompt) throw new Error('Invalid analysis type');

        const fullPrompt = `${prompt}\n\nHere is the text:\n\n${transcript}`;

        const ai = new GoogleGenAI({ apiKey: apiKey });
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });

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

    if (!apiKey && !hasDatabaseApiKey) {
        setShowApiKeyModal(true);
        setIsFetchingExplanation(false);
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const prompt = language === 'en'
          ? `Provide a short and clear explanation of the term '${keyword}' in the context of the following transcript. Return only the explanation, no extra titles or formatting. Keep it concise. Transcript: --- ${transcript} ---`
          : `Geef een korte en duidelijke uitleg van de term '${keyword}' in de context van de volgende transcriptie. Geef alleen de uitleg terug, zonder extra titels of opmaak. Houd het beknopt. Transcript: --- ${transcript} ---`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
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
    if (keywordAnalysis) return;

    if (!transcript.trim()) {
        setKeywordAnalysis([]);
        setError(t('transcriptEmpty'));
        return;
    }

    if (!apiKey && !hasDatabaseApiKey) {
        setShowApiKeyModal(true);
        return;
    }
    
    setLoadingText(t('generating', { type: t('keywordAnalysis') }));
    setError(null);
    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const prompt = language === 'en'
          ? `Analyze the following transcript. Identify the most frequent and important keywords. Group these into 5-7 relevant topics. For each topic, provide a short descriptive name and a list of associated keywords. Return JSON only. Transcript: --- ${transcript} ---`
          : `Analyseer de volgende transcriptie. Identificeer de meest voorkomende en belangrijke trefwoorden. Groepeer deze trefwoorden in 5-7 relevante onderwerpen. Geef voor elk onderwerp een korte, beschrijvende naam en een lijst met de bijbehorende trefwoorden. Geef alleen het JSON-object terug. Transcript: --- ${transcript} ---`;

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
    
    if (!apiKey && !hasDatabaseApiKey) {
        setShowApiKeyModal(true);
        return;
    }
    
    setIsAnalyzingSentiment(true);
    setLoadingText(t('analyzingSentiment'));
    setError(null);

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const prompt = language === 'en'
          ? `Analyze the sentiment of the following transcript. Return a JSON object with: 1. 'taggedText': the full transcript with positive parts wrapped in [POS]...[/POS], negative in [NEG]...[/NEG], neutral in [NEU]...[/NEU]. 2. 'summary': a short factual summary of the sentiments. 3. 'conclusion': an overall conclusion about the tone and atmosphere. Transcript: --- ${transcript} ---`
          : `Analyseer het sentiment van de volgende transcriptie. Geef een JSON-object terug. Het object moet bevatten: 1. 'taggedText': de volledige transcriptie met positieve sentimentdelen verpakt in [POS]...[/POS], negatieve in [NEG]...[/NEG], en neutrale in [NEU]...[/NEU]. 2. 'summary': een korte, feitelijke samenvatting van de gevonden sentimenten (bijv. "Het gesprek was overwegend positief met enkele negatieve punten over X."). 3. 'conclusion': een algemene conclusie over de algehele toon en sfeer van het gesprek. Transcript: --- ${transcript} ---`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                taggedText: { type: Type.STRING },
                summary: { type: Type.STRING },
                conclusion: { type: Type.STRING }
            },
            required: ["taggedText", "summary", "conclusion"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema }
        });

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
    setActiveView('podcast');
    if (podcastScript) return;
    if (!transcript.trim()) {
        setError(t("transcriptEmpty"));
        return;
    }
    if (!apiKey) {
        setShowApiKeyModal(true);
        return;
    }
    
    setLoadingText(t('podcastGenerating'));
    setError(null);

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const prompt = language === 'en'
            ? `You are a podcast scriptwriter for the 'RecapSmart Podcast', hosted by 'Albert'. Use the transcript below to create an engaging, natural-sounding script that can be spoken aloud directly.

Structure:
1.  [INTRO]: Welcome listeners and introduce the main topic of today concisely.
2.  [CORE]: Go deeper using the key discussions, findings and insights from the transcript to form a compelling story or clear analysis.
3.  [CLOSING]: Summarize the key points. Give concrete, actionable tips or action items. End with a friendly sign-off.

Important:
- Write as a continuous, natural spoken narrative.
- Do not include headings like "[INTRO]" in the output.
- Output only the text Albert will speak, with no extra formatting.

Here is the transcript:
---
${transcript}
---`
            : `Je bent een podcast scriptschrijver voor de 'RecapSmart Podcast', gepresenteerd door 'Albert'. Gebruik de volgende transcriptie om een levendig en boeiend podcastscript te maken dat direct kan worden uitgesproken.

**Script Structuur:**
1.  **[INTRO]:** Albert heet de luisteraars welkom en introduceert het hoofdonderwerp van vandaag op een pakkende manier.
2.  **[DE KERN]:** Duik dieper in de materie. Gebruik de belangrijkste discussies, bevindingen en inzichten uit de transcriptie om een boeiend verhaal of een duidelijke analyse te vormen.
3.  **[DE AFSLUITING]:** Vat de belangrijkste punten samen. Geef concrete, bruikbare tips of actiepunten mee aan de luisteraar. Sluit af met een krachtige quote uit de discussie en een vriendelijke afscheidsgroet.

**Belangrijk:**
- Schrijf de tekst als een doorlopend, natuurlijk sprekend verhaal.
- Gebruik geen headings zoals "[INTRO]". De structuur moet impliciet zijn in de flow van de tekst.
- De output moet alleen de tekst zijn die Albert zal uitspreken, zonder extra opmaak of instructies.

Hier is de transcriptie:
---
${transcript}
---`;
        
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setPodcastScript(response.text);

    } catch (err: any) {
        console.error("Fout bij genereren podcast:", err);
        setError(`${t("podcastFailed")}: ${err.message || t("unknownError")}`);
        setPodcastScript('');
    } finally {
        setLoadingText('');
    }
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
            if (slideData.base64Image) {
                const imgW: PptxGenJS.Coord = '40%', imgH: PptxGenJS.Coord = '60%';
                textW = '48%';
                textX = '52%';
                slide.addImage({ data: `data:image/png;base64,${slideData.base64Image}`, x: '5%', y: '20%', w: imgW, h: imgH, sizing: { type: 'contain', w: imgW, h: imgH } });
            }
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

  const handleSaveApiKey = async (newApiKey: string) => {
    try {
      // Valideer de API key
      const ai = new GoogleGenAI({ apiKey: newApiKey });
      await ai.models.generateContent({ 
        model: 'gemini-2.5-flash', 
        contents: 'Test' 
      });
      
      if (apiKeyStoragePreference === 'database' && authState.user) {
        // Veilige database opslag
        try {
          // Hash + encrypt voor opslag
          const hashedApiKey = await hashApiKey(newApiKey);
          const encryptedApiKey = await encryptApiKeyForUser(authState.user.uid, newApiKey);
          
          // Update gebruiker document met gehashte + versleutelde API key
          await updateDoc(doc(db, 'users', authState.user.uid), {
            hashedApiKey,
            encryptedApiKey,
            apiKeyLastUpdated: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Houd key in-memory voor huidige sessie (geen localStorage)
          setApiKey(newApiKey);
          setHasDatabaseApiKey(true);
          localStorage.removeItem('recapsmart_api_key');
          displayToast('API key veilig opgeslagen in database!', 'success');
        } catch (dbError) {
          console.error('Database opslag mislukt:', dbError);
                      displayToast('Database opslag mislukt, maar API key werkt wel. Opgeslagen in browser.', 'info');
          // Fallback naar lokale opslag
          setApiKey(newApiKey);
          localStorage.setItem('recapsmart_api_key', newApiKey);
        }
      } else {
        // Lokale opslag (browser)
        setApiKey(newApiKey);
        setHasDatabaseApiKey(false); // Reset database flag when using local storage
        localStorage.setItem('recapsmart_api_key', newApiKey);
                    displayToast('API key opgeslagen in browser!', 'success');
      }
      
      setShowApiKeyModal(false);
      setApiKeyError(null);
    } catch (err: any) {
      console.error('API key validatie mislukt:', err);
      setApiKeyError('API key validatie mislukt. Controleer of de key correct is.');
    }
  };

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
    setShowSettingsModal(false);
  };

  // --- API KEY MANAGEMENT ---
  const deleteApiKeyFromDatabase = async () => {
    if (!authState.user) return;
    await updateDoc(doc(db, 'users', authState.user.uid), {
      hashedApiKey: deleteField(),
      encryptedApiKey: deleteField(),
      apiKeyLastUpdated: deleteField(),
      updatedAt: serverTimestamp()
    });
    setHasDatabaseApiKey(false);
    displayToast('API key verwijderd uit database.', 'success');
  };

  const deleteApiKeyFromLocal = () => {
    localStorage.removeItem('recapsmart_api_key');
    setApiKey('');
    displayToast('Lokale API key verwijderd.', 'success');
  };

  const switchApiKeyStorage = (target: 'local' | 'database') => {
    setApiKeyStoragePreference(target);
    if (target === 'local') {
      displayToast('Opslag ingesteld op Lokaal (browser).', 'info');
    } else {
      if (!authState.user) {
        displayToast('Log in om sleutel in database op te slaan.', 'error');
      } else {
        displayToast('Opslag ingesteld op Database. Sla een nieuwe key op om te synchroniseren.', 'info');
      }
    }
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
      console.log('Attempting login for:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Firebase Auth successful, user UID:', user.uid);
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        console.log('User data found:', userData);
        
        if (!userData.isActive) {
          throw new Error('Account is disabled. Contact administrator.');
        }
        
        // Update last login
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: serverTimestamp()
        });
        
        console.log('Setting auth state for user:', userData.email);
        setAuthState({
          user: { ...userData, uid: user.uid },
          isLoading: false,
          isAdmin: userData.isAdmin
        });
        setShowLoginModal(false);
        
        // Controleer of gebruiker een API key heeft (lokaal of in database)
        if (!apiKey) {
          const localKey = localStorage.getItem('recapsmart_api_key');
          if (localKey) {
            setApiKey(localKey);
            setHasDatabaseApiKey(false);
            setApiKeyStoragePreference('local');
            displayToast('Lokale API key geladen.', 'success');
          } else if (userData.hashedApiKey || (userData as any).encryptedApiKey) {
            // DB bevat sleutel. Probeer te decrypten naar lokale runtime-geheugen
            try {
              if ((userData as any).encryptedApiKey) {
                const plaintext = await decryptApiKeyForUser(user.uid, (userData as any).encryptedApiKey);
                setApiKey(plaintext);
              } else {
                // fallback: geen encrypted versie; markeer slechts presence
                setApiKey('');
              }
              setHasDatabaseApiKey(true);
              setApiKeyStoragePreference('database');
              displayToast('API key geladen uit database. Klaar voor gebruik.', 'success');
            } catch (e) {
              console.error('Decrypt DB key failed', e);
              setHasDatabaseApiKey(true);
              setApiKey('');
              setApiKeyStoragePreference('database');
              displayToast('API key gevonden in database. Als iets faalt, vernieuw de key in Instellingen.', 'info');
            }
          } else {
            // Toon API key setup modal
            setTimeout(() => setShowApiKeyModal(true), 1000);
          }
        }
      } else {
        console.log('User document not found in Firestore, creating automatic document...');
        
        // Automatically create user document in Firestore
        const newUserData = {
          email: email,
          isActive: true,
          isAdmin: false, // Default to non-admin for security
          lastLogin: serverTimestamp(),
          sessionCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        try {
          await setDoc(doc(db, 'users', user.uid), newUserData);
          console.log('Automatically created user document for:', email);
          
          // Set auth state with new user data
          setAuthState({
            user: { ...newUserData, uid: user.uid },
            isLoading: false,
            isAdmin: false
          });
          setShowLoginModal(false);
          
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
        throw new Error(`Inloggen mislukt: ${error.message}`);
      }
    }
  };

  const handleCreateAccount = async (email: string, password: string) => {
    try {
      console.log('Creating account for:', email);
      
      // Check if user exists in database
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Email not found in system. Contact administrator to be added.');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (!userData.isActive) {
        throw new Error('Account is disabled. Contact administrator.');
      }
      
      console.log('User found in database:', userData);
      
      // Check if user already has a UID (means Firebase Auth account exists)
      if (userData.uid) {
        console.log('User already has UID, checking if Firebase Auth account exists...');
        try {
          // Try to sign in to see if account exists
          await signInWithEmailAndPassword(auth, email, 'dummy-password');
          console.log('Firebase Auth account exists, cannot create new one');
          throw new Error('Dit email adres is al in gebruik in Firebase. Probeer in te loggen in plaats van een account aan te maken.');
        } catch (authError: any) {
          if (authError.code === 'auth/wrong-password') {
            // Account exists but wrong password - this is what we want
            console.log('Firebase Auth account exists, cannot create new one');
            throw new Error('Dit email adres is al in gebruik in Firebase. Probeer in te loggen in plaats van een account aan te maken.');
          } else if (authError.code === 'auth/user-not-found') {
            // Account doesn't exist - this is also fine
            console.log('No Firebase Auth account found, will create new one...');
          } else if (authError.code === 'auth/invalid-credential') {
            // Account might exist but is corrupted - try to create new one
            console.log('Invalid credential error, will attempt to create new Firebase Auth account...');
          } else {
            console.log('Unexpected auth error:', authError);
            throw authError;
          }
        }
      } else {
        console.log('No UID found, safe to create new Firebase Auth account...');
      }
      
      console.log('Creating Firebase Auth account...');
      // Create Firebase auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Firebase Auth account created, UID:', user.uid);
      
      // Update user document with UID
      await updateDoc(doc(db, 'users', userDoc.id), {
        uid: user.uid,
        updatedAt: serverTimestamp()
      });
      
      console.log('User document updated with new UID:', user.uid);
      
      console.log('User document updated with UID');
      
      setAuthState({
        user: { ...userData, uid: user.uid },
        isLoading: false,
        isAdmin: userData.isAdmin
      });
      setShowLoginModal(false);
      
      console.log('Account creation successful!');
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
        isAdmin: false
      });
      reset();
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const loadUsers = async (options?: { bypassAdminCheck?: boolean }) => {
    const bypass = options?.bypassAdminCheck === true;
    // Controleer of gebruiker admin is
    if (!bypass && (!authState.user || !authState.isAdmin)) {
      console.error('Unauthorized access to loadUsers');
      displayToast('Geen toegang tot gebruikersbeheer. Admin rechten vereist.', 'error');
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          uid: doc.id,
          email: data.email,
          isActive: data.isActive,
          isAdmin: data.isAdmin,
          lastLogin: data.lastLogin?.toDate() || null,
          sessionCount: data.sessionCount || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          hashedApiKey: data.hashedApiKey,
          apiKeyLastUpdated: data.apiKeyLastUpdated?.toDate()
        });
      });
      
      setUsers(usersData);
    } catch (error: any) {
      console.error('Load users error:', error);
              displayToast('Fout bij laden van gebruikers.', 'error');
    }
  };

  const addUser = async (email: string) => {
    // Controleer of gebruiker admin is
    if (!authState.user || !authState.isAdmin) {
      console.error('Unauthorized access to addUser');
      displayToast('Geen toegang tot gebruikersbeheer. Admin rechten vereist.', 'error');
      return;
    }

    try {
      const userRef = doc(collection(db, 'users'));
      await setDoc(userRef, {
        email,
        isActive: true,
        isAdmin: false,
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
    if (!authState.user || !authState.isAdmin) {
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
              displayToast('Fout bij bijwerken van gebruiker status.', 'error');
    }
  };

  const resetUserPassword = async (email: string) => {
    // Controleer of gebruiker admin is
    if (!authState.user || !authState.isAdmin) {
      console.error('Unauthorized access to resetUserPassword');
      displayToast('Geen toegang tot gebruikersbeheer. Admin rechten vereist.', 'error');
      return false;
    }

    try {
      await sendPasswordResetEmail(auth, email);
              displayToast(`Wachtwoord reset email verzonden naar ${email}`, 'success');
      return true;
    } catch (error: any) {
      console.error('Reset password error:', error);
              displayToast('Fout bij verzenden van wachtwoord reset email.', 'error');
      throw error;
    }
  };

  // Sync users between Firebase Auth and Firestore
      const syncUsersWithFirebase = async () => {
        // Controleer of gebruiker admin is
        if (!authState.user || !authState.isAdmin) {
          console.error('Unauthorized access to syncUsersWithFirebase');
          displayToast('Geen toegang tot gebruikersbeheer. Admin rechten vereist.', 'error');
          return;
        }

        try {
            console.log('Starting user synchronization...');
            
            // Get all users from Firestore
            const usersRef = collection(db, 'users');
            const querySnapshot = await getDocs(usersRef);
            
            let syncCount = 0;
            
            for (const docSnapshot of querySnapshot.docs) {
                const userData = docSnapshot.data();
                const uid = docSnapshot.id;
                
                // Check if user has a UID field
                if (!userData.uid) {
                    console.log(`User ${userData.email} missing UID, updating...`);
                    
                    try {
                        await updateDoc(doc(db, 'users', uid), {
                            uid: uid,
                            updatedAt: serverTimestamp()
                        });
                        syncCount++;
                    } catch (updateError) {
                        console.error(`Error updating UID for ${userData.email}:`, updateError);
                    }
                }
            }
            
            if (syncCount > 0) {
                console.log(`Synchronized ${syncCount} users`);
                await loadUsers(); // Refresh user list
            } else {
                console.log('All users are already synchronized');
            }
            
            return syncCount;
        } catch (error: any) {
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
    if (!bypass && (!authState.user || !authState.isAdmin)) {
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
    } catch (error) {
      console.error('Error loading waitlist:', error);
              displayToast('Fout bij laden van wachtlijst.', 'error');
    }
  };

  const activateWaitlistUsers = async () => {
    // Controleer of gebruiker admin is
    if (!authState.user || !authState.isAdmin) {
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
          // Add to users collection
          await addDoc(collection(db, 'users'), {
            email: userData.email,
            isActive: true,
            isAdmin: false,
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
      console.error('Error activating users:', error);
              displayToast('Fout bij activeren van gebruikers.', 'error');
    }
  };

  const removeFromWaitlist = async (userId: string) => {
    // Controleer of gebruiker admin is
    if (!authState.user || !authState.isAdmin) {
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
    if (!authState.user || !authState.isAdmin) {
      console.error('Unauthorized access to sendInvitationEmail');
      displayToast('Geen toegang tot email functies. Admin rechten vereist.', 'error');
      return;
    }

    try {
      // In een echte app zou je hier een email service gebruiken
      // Voor nu tonen we een popup met de email content
      const emailContent = `Beste gebruiker,

Je bent uitgenodigd om je aan te melden bij RecapSmart!

Je kunt nu een account aanmaken op: ${window.location.origin}

Met vriendelijke groet,
Het RecapSmart Team`;

      // Toon email content in een popup
      const emailWindow = window.open('', '_blank', 'width=600,height=400');
      if (emailWindow) {
        emailWindow.document.write(`
          <html>
            <head><title>Uitnodigingsmail</title></title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              .header { background: #06b6d4; color: white; padding: 20px; margin: -20px -20px 20px -20px; }
              .content { background: #f8fafc; padding: 20px; border-radius: 8px; }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📧 Uitnodigingsmail</h1>
            </div>
            <div class="content">
              <h3>Email naar: ${email}</h3>
              <pre style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 5px; border: 1px solid #e2e8f0;">${emailContent}</pre>
            </div>
            <div class="footer">
              <p><strong>Opmerking:</strong> In een productieomgeving wordt deze email automatisch verstuurd via een email service.</p>
              <p>Je kunt deze popup sluiten en de gebruiker handmatig uitnodigen.</p>
            </div>
          </body>
          </html>
        `);
      }
      
              displayToast(`Uitnodigingsmail succesvol voorbereid voor ${email}!`, 'success');
    } catch (error) {
      console.error('Error sending invitation email:', error);
              displayToast('Fout bij voorbereiden van uitnodigingsmail.', 'error');
    }
  };

  const sendInvitationEmails = async (userIds: string[]) => {
    // Controleer of gebruiker admin is
    if (!authState.user || !authState.isAdmin) {
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

      // Toon alle emails in één popup
      const emailContent = `Beste gebruikers,

Jullie zijn uitgenodigd om je aan te melden bij RecapSmart!

Jullie kunnen nu een account aanmaken op: ${window.location.origin}

Met vriendelijke groet,
Het RecapSmart Team`;

      const emailWindow = window.open('', '_blank', 'width=600,height=400');
      if (emailWindow) {
        emailWindow.document.write(`
          <html>
            <head><title>Uitnodigingsmails</title></title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              .header { background: #06b6d4; color: white; padding: 20px; margin: -20px -20px 20px -20px; }
              .content { background: #f8fafc; padding: 20px; border-radius: 8px; }
              .emails { background: white; padding: 15px; border-radius: 5px; border: 1px solid #e2e8f0; margin: 15px 0; }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📧 Uitnodigingsmails</h1>
            </div>
            <div class="content">
              <h3>Emails naar:</h3>
              <div class="emails">
                ${emails.map(email => `<div>• ${email}</div>`).join('')}
              </div>
              <h3>Email content:</h3>
              <pre style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 5px; border: 1px solid #e2e8f0;">${emailContent}</pre>
            </div>
            <div class="footer">
              <p><strong>Opmerking:</strong> In een productieomgeving worden deze emails automatisch verstuurd via een email service.</p>
              <p>Je kunt deze popup sluiten en de gebruikers handmatig uitnodigen.</p>
            </div>
          </body>
          </html>
        `);
      }
      
              displayToast(`${emails.length} uitnodigingsmails succesvol voorbereid!`, 'success');
    } catch (error) {
      console.error('Error sending invitation emails:', error);
              displayToast('Fout bij voorbereiden van uitnodigingsmails.', 'error');
    }
  };

  const checkApiKey = () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return false;
    }
    return true;
  };

  const handleGeneratePresentationWithOptions = async (options: { maxSlides: number; language: 'nl' | 'en'; useTemplate: boolean; templateFile?: File | null }) => {
    if (!transcript.trim()) {
        setError(t("transcriptEmpty"));
        return;
    }
    
    if (!apiKey) {
        setShowApiKeyModal(true);
        return;
    }
    
    setLoadingText(t('generatingPresentation'));
    setError(null);
    setPresentationReport(null);
    const useTemplate = options.useTemplate && options.templateFile !== null;

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const prompt = `Je bent een AI-expert in het creëren van professionele, gestructureerde en visueel aantrekkelijke zakelijke presentaties op basis van een meeting-transcript. Je taak is om de volgende content te genereren en te structureren in een JSON-object dat voldoet aan het verstrekte schema.

**Taal:** ${options.language === 'nl' ? 'Nederlands' : 'Engels'} - Alle titels en content moeten in deze taal zijn.

**Maximum aantal slides:** ${options.maxSlides} - Houd de presentatie binnen deze limiet.

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

**BELANGRIJK:** Houd alle titels en bullet points relatief kort en bondig. Zorg voor volledige, correcte data voor de to-do lijst. Respecteer de taal en het maximum aantal slides.

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

            for (const slide of allSlideContents) {
                if (slide.imagePrompt) {
                    try {
                        setLoadingText(t('generatingImageForSlide', { title: slide.title }));
                        const imageResponse: any = await ai.models.generateImages({ model: 'imagen-3.0-generate-002', prompt: `${slide.imagePrompt}, ${presentationData.imageStylePrompt}`, config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '16:9' } });
                        const candidate = imageResponse?.generatedImages?.[0] || imageResponse?.images?.[0] || null;
                        const base64 = candidate?.image?.imageBytes || candidate?.inlineData?.data || candidate?.bytes || null;
                        if (base64) (slide as any).base64Image = base64;
                    } catch (imgErr) { console.warn(`Could not generate image for slide "${slide.title}":`, imgErr); }
                }
            }
        }
        
        setLoadingText(t('finalizingPresentation'));
        const { fileName, slideCount } = await createAndDownloadPptx(presentationData, options.templateFile || null);
        setPresentationReport(t('presentationSuccess', { fileName, slideCount }));


    } catch (err: any) {
        console.error("Fout bij genereren presentatie:", err);
        setError(`${t("presentationFailed")}: ${err.message || t("unknownError")}`);
    } finally { setLoadingText(''); }
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
            setShowApiKeyModal(true);
            return;
        }
        
        const ai = new GoogleGenAI({ apiKey: apiKey });
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const base64Audio = await blobToBase64(audioBlob);
  
      const transcribePrompt = language === 'nl' ? 'Transcribeer deze audio-opname nauwkeurig. De gesproken taal is Nederlands.' : 'Transcribe this audio recording accurately. The spoken language is English.';
      const audioPart = { inlineData: { mimeType: 'audio/webm', data: base64Audio } };
      const textPart = { text: transcribePrompt };
      
      const transcribeResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [textPart, audioPart] } });
        setTranscript(transcribeResponse.text);
        setStatus(RecordingStatus.FINISHED);
        // Increment user session count on successful finish
        try {
          if (authState.user) {
            await updateDoc(doc(db, 'users', authState.user.uid), {
              sessionCount: increment(1),
              updatedAt: serverTimestamp()
            });
            // Optimistic local update
            setAuthState(prev => prev.user ? ({ ...prev, user: { ...prev.user, sessionCount: (prev.user.sessionCount || 0) + 1 } }) : prev);
            // Refresh users list if admin panel is open
            if (authState.isAdmin) {
              loadUsers({ bypassAdminCheck: true });
            }
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
  
  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); };
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
    } catch (e) {
      console.error('Download failed', e);
    }
  };
  
  // --- RENDER FUNCTIONS ---
  
  const renderSentimentText = (text: string) => {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /\[(POS|NEG|NEU)\](.*?)\[\/\1\]/gs;

    for (const match of text.matchAll(regex)) {
        if (match.index === undefined) continue;
        
        if (match.index > lastIndex) {
            elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
        }
        
        const [, type, content] = match;
        const sentimentClasses: Record<string, string> = {
            POS: 'bg-green-100/80 dark:bg-green-500/20 text-green-700 dark:text-green-300 p-0.5 rounded',
            NEG: 'bg-red-100/80 dark:bg-red-500/20 text-red-700 dark:text-red-300 p-0.5 rounded',
            NEU: 'text-slate-700 dark:text-slate-200',
        };
        
        elements.push(<span key={`match-${match.index}`} className={sentimentClasses[type]}>{content}</span>);
        
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }
    
    return elements.length > 0 ? <>{elements}</> : <>{text}</>;
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

        {/* Timer en Status */}
        <div className="flex justify-center">
          <div className="text-4xl font-mono bg-gray-200 dark:bg-slate-700 px-6 py-3 rounded-lg text-slate-800 dark:text-slate-100">
            {new Date(duration * 1000).toISOString().substr(11, 8)}
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
                src={audioURL || ''} 
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
    const renderMindmapView = () => {
      if (!transcript.trim()) return <div className="flex items-center justify-center p-8 min-h-[300px] text-slate-500 dark:text-slate-400">{t('noContent')}</div>;
      if (!mindmapMermaid) {
        return (
          <div className="flex items-center justify-center p-8">
            <button
              onClick={async () => {
                try {
                  setLoadingText(t('generating', { type: 'Mindmap' }));
                  const ai = new GoogleGenAI({ apiKey: apiKey });
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
        <div className="p-4">
          {mindmapSvg ? (
            <div className="overflow-auto max-h-[70vh]" dangerouslySetInnerHTML={{ __html: mindmapSvg }} />
          ) : (
            <pre className="text-sm whitespace-pre-wrap bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 overflow-auto max-h-[70vh]">{mindmapMermaid}</pre>
          )}
        </div>
      );
    };
    const analysisActions: any[] = [
        { id: 'transcript', type: 'view', icon: TranscriptIcon, label: () => isAnonymized ? t('transcriptAnonymized') : t('transcript') },
        { id: 'anonymize', type: 'action', icon: AnonymizeIcon, label: () => t('anonymize'), onClick: handleAnonymizeTranscript, disabled: () => isProcessing || isAnonymized || !transcript.trim() },
        { id: 'summary', type: 'view', icon: SummaryIcon, label: () => t('summary') },
        { id: 'keyword', type: 'view', icon: TagIcon, label: () => t('keywordAnalysis')},
        { id: 'sentiment', type: 'view', icon: SparklesIcon, label: () => t('sentimentAnalysis')},
        { id: 'faq', type: 'view', icon: FaqIcon, label: () => t('faq') },
        { id: 'learning', type: 'view', icon: LearningIcon, label: () => t('keyLearnings') }, 
        { id: 'followUp', type: 'view', icon: FollowUpIcon, label: () => t('followUp') },
        { id: 'chat', type: 'view', icon: ChatIcon, label: () => t('chat') },
        { id: 'podcast', type: 'view', icon: PodcastIcon, label: () => t('podcast') },
        { id: 'presentation', type: 'action', icon: PresentationIcon, label: () => t('exportPPT'), onClick: () => setShowPptOptions(true), disabled: () => isProcessing || !transcript.trim() },
        { id: 'mindmap', type: 'view', icon: SparklesIcon, label: () => t('mindmap') }
    ];

    const analysisContent: Record<ViewType, string> = { transcript, summary, faq, learning: learningDoc, followUp: followUpQuestions, podcast: podcastScript, chat: '', keyword: '', sentiment: '', mindmap: '' };

    const handleTabClick = (view: ViewType) => {
        if (['summary', 'faq', 'learning', 'followUp'].includes(view)) handleGenerateAnalysis(view);
        else if (view === 'keyword') handleGenerateKeywordAnalysis();
        else if (view === 'podcast') handleGeneratePodcast();
        else if (view === 'sentiment') handleAnalyzeSentiment();
        else setActiveView(view);
        if (view === 'mindmap' && !mindmapMermaid) {
            // auto-generate on opening tab
            (async () => {
              try {
                setLoadingText(t('generating', { type: 'Mindmap' }));
                const ai = new GoogleGenAI({ apiKey: apiKey });
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
        }
    };
    
    const renderContent = () => {
        if (activeView !== 'transcript' && activeView !== 'chat' && activeView !== 'podcast' && activeView !== 'sentiment' && loadingText && !analysisContent[activeView] && !keywordAnalysis) {
            return <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>;
        }
        if (activeView === 'chat') return renderChatView();
        if (activeView === 'mindmap') return renderMindmapView();
        
        if (activeView === 'podcast') {
            if (loadingText && !podcastScript) {
                 return <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300 min-h-[300px]"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>;
            }
            if (podcastScript) {
                return <PodcastPlayer script={podcastScript} language={language || 'nl'} t={t} />;
            }
            return <div className="flex items-center justify-center p-8 min-h-[300px] text-slate-500 dark:text-slate-400">{t('noContent')}</div>;
        }

        if (activeView === 'sentiment') {
            if ((isAnalyzingSentiment || loadingText) && !sentimentAnalysisResult) {
                return <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300 min-h-[300px]"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText || t('analyzingSentiment')}...</div>;
            }
            if (sentimentAnalysisResult) {
                const fullContent = `${t('sentimentSummary')}\n${sentimentAnalysisResult.summary}\n\n${t('sentimentConclusion')}\n${sentimentAnalysisResult.conclusion}\n\n${t('transcript')}\n${transcript}`;
                return (
                    <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[70vh] transition-colors">
                         <div className="absolute top-4 right-4 flex gap-2">
                             <button onClick={() => copyToClipboard(fullContent)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
                                 <CopyIcon className="w-5 h-5" />
                             </button>
                             <button onClick={() => downloadTextFile(fullContent, `sentiment.txt`)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download">
                                 ⬇️
                             </button>
                         </div>
                        <div className="overflow-y-auto max-h-[calc(70vh-120px)] space-y-6">
                            <div>
                                <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400 mb-2">{t('sentimentSummary')}</h4>
                                <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">{sentimentAnalysisResult.summary}</p>
                            </div>
                             <div>
                                <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400 mb-2">{t('sentimentConclusion')}</h4>
                                <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">{sentimentAnalysisResult.conclusion}</p>
                            </div>
                             <div>
                                <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400 mb-2">{t('transcript')}</h4>
                                <pre className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">
                                  {renderSentimentText(sentimentAnalysisResult.taggedText)}
                                </pre>
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
                    {loadingText && !keywordAnalysis && <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>}
                    {keywordAnalysis && keywordAnalysis.length === 0 && !loadingText && <p>{t('noContent')}</p>}
                    {keywordAnalysis && keywordAnalysis.length > 0 && (
                        <div className="overflow-y-auto max-h-[calc(70vh-120px)] space-y-6">
                            {keywordAnalysis.map((topic, index) => (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-xl">
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
                </div>
                <div className="overflow-y-auto max-h-[calc(70vh-120px)]">
                    <pre className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">
                        {content || t('noContent')}
                    </pre>
                </div>
            </div>
        );
    };

    return (
        <div className={`w-full max-w-6xl mx-auto bg-transparent rounded-lg transition-all duration-300 ${isAnonymized ? 'ring-2 ring-green-400/80 shadow-lg shadow-green-500/10' : ''}`}>
             <div className="flex flex-wrap items-center p-2 bg-gray-100/50 dark:bg-slate-800/50 rounded-t-lg border-b border-gray-300 dark:border-slate-700 gap-1">
                {analysisActions.map(action => (
                        <button
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
                disabled={!apiKey && !hasDatabaseApiKey}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md ${isTTSEnabled ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/20' : (!apiKey && !hasDatabaseApiKey) ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
            >
                {isTTSEnabled ? <SpeakerIcon className="w-5 h-5" /> : <SpeakerOffIcon className="w-5 h-5" />}
                <span>{isTTSEnabled ? t('readAnswers') : (!apiKey && !hasDatabaseApiKey ? t('setupApiKey') : t('readAnswers'))}</span>
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xl px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                        <pre className="text-base whitespace-pre-wrap font-sans">{msg.text || '...'}</pre>
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
                    disabled={!apiKey && !hasDatabaseApiKey}
                    className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : (!apiKey && !hasDatabaseApiKey) ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                    title={(!apiKey && !hasDatabaseApiKey) ? t('setupApiKey') : (isListening ? t('stopListening') : t('startListening'))}
                > 
                    <MicIcon className="w-5 h-5"/> 
                </button>
                <button 
                    onClick={handleSendMessage} 
                    disabled={isChatting || (!chatInput.trim() && !voiceInputPreview.trim()) || (!apiKey && !hasDatabaseApiKey)} 
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
      
      <ApiKeySetupModal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
          onSave={handleSaveApiKey}
          t={t}
          storagePreference={apiKeyStoragePreference}
          onStoragePreferenceChange={setApiKeyStoragePreference}
          isLoggedIn={!!authState.user}
      />
      
      <PowerPointOptionsModal
          isOpen={showPptOptions}
          onClose={() => setShowPptOptions(false)}
          onGenerate={handleGeneratePresentationWithOptions}
          t={t}
          currentTemplate={pptTemplate}
          onTemplateChange={setPptTemplate}
      />

      {/* Cookie Consent */}
      {showCookieConsent && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">🍪 Cookie Beleid</h3>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 mb-6">
              <p>Deze app gebruikt cookies om je ervaring te verbeteren. Door de app te gebruiken ga je akkoord met ons cookie beleid.</p>
              <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded">
                <p className="font-medium">Wat we opslaan:</p>
                <ul className="text-xs text-slate-600 dark:text-cyan-400 mt-1 space-y-1">
                  <li>• Je taal voorkeur</li>
                  <li>• Je theme voorkeur (donker/licht)</li>
                  <li>• API key (alleen lokaal op je apparaat)</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowCookieConsent(false)}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Weigeren
              </button>
              <button 
                onClick={handleAcceptCookies}
                className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Accepteren
              </button>
            </div>
          </div>
        </div>
      )}
      
      <header className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-16px)] sm:w-auto">
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 sm:px-3 py-1.5 sm:py-2 rounded-full shadow-lg mx-auto max-w-[94vw] sm:max-w-none">
          {/* Logo & brand */}
          <button onClick={() => setShowInfoPage(true)} className="flex items-center gap-2 min-w-0 hover:opacity-90">
            <img src="/logo.png" alt="RecapSmart Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400 hidden sm:block">RecapSmart</span>
          </button>
          
          <div className="flex items-center gap-1 bg-gray-200 dark:bg-slate-800 p-1 rounded-full shrink-0">
              <button title={t('dutch')} onClick={() => setUiLang('nl')} className={`flex items-center justify-center h-7 w-7 rounded-full transition-colors ${uiLang === 'nl' ? 'bg-white dark:bg-slate-600' : 'hover:bg-gray-300 dark:hover:bg-slate-700'}`}>
                  <NlFlagIcon className="w-5 rounded-sm"/>
              </button>
              <button title={t('english')} onClick={() => setUiLang('en')} className={`flex items-center justify-center h-7 w-7 rounded-full transition-colors ${uiLang === 'en' ? 'bg-white dark:bg-slate-600' : 'hover:bg-gray-300 dark:hover:bg-slate-700'}`}>
                  <UkFlagIcon className="w-5 rounded-sm"/>
              </button>
          </div>
                          <button onClick={toggleTheme} className="flex items-center justify-center h-9 w-9 bg-gray-200 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-opacity-80">
                  {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
                </button>
          
          {/* App Controls - Alleen zichtbaar na inloggen */}
          {authState.user && (
            <>
                              <button onClick={reset} disabled={isProcessing} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-slate-600 dark:text-slate-400 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed h-10 min-w-0 sm:min-w-[120px]">
                  <ResetIcon className="w-5 h-5"/> 
                  <span>{status === RecordingStatus.FINISHED ? t('startNewSession') : t('reset')}</span>
              </button>
              <button onClick={() => setShowSettingsModal(true)} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-slate-600 dark:text-slate-400 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white h-10 min-w-0 sm:min-w-[120px]">
                  <SettingsIcon className="w-5 h-5"/> 
                  <span>Instellingen</span>
              </button>
            </>
          )}
          
          {/* Auth Buttons */}
          {!authState.user ? (
            <button 
              onClick={() => setShowLoginModal(true)} 
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[100px]"
            >
              <span>🔐</span>
              <span>Inloggen</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-wrap">
              {authState.isAdmin && (
                <button 
                  onClick={async () => {
                    setShowAdminPanel(true);
                    // Ensure data is fresh when opening panel
                    await loadUsers({ bypassAdminCheck: true });
                    await loadWaitlist({ bypassAdminCheck: true });
                  }} 
                  className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all text-white bg-purple-500 hover:bg-purple-600 h-9 sm:h-10 min-w-0"
                >
                  <span>👑</span>
                  <span>Admin</span>
                </button>
              )}
              <button 
                onClick={handleLogout} 
                className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all text-slate-600 dark:text-slate-400 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white h-9 sm:h-10 min-w-0"
              >
                <span>🚪</span>
                <span>Uitloggen</span>
              </button>
            </div>
          )}
        </div>
      </header>
      
      {/* Cookie Modal */}
      {showCookieModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">🍪 Cookie Beleid</h3>
              <button 
                onClick={() => setShowCookieModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Wat zijn cookies?</h4>
                <p>Cookies zijn kleine tekstbestanden die op je apparaat worden opgeslagen wanneer je websites bezoekt. Ze helpen de website te onthouden wat je hebt gedaan en je voorkeuren te bewaren.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Cookies die we gebruiken</h4>
                <div className="space-y-2">
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded">
                    <p className="font-medium">Essentiële cookies</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Deze cookies zijn noodzakelijk voor de werking van de app en kunnen niet worden uitgeschakeld.</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded">
                    <p className="font-medium">Analytics cookies</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Deze cookies helpen ons begrijpen hoe gebruikers de app gebruiken, zodat we deze kunnen verbeteren.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Geen tracking van persoonlijke data</h4>
                <p>We verzamelen geen persoonlijke informatie via cookies. Alle data wordt anoniem verzameld en gebruikt uitsluitend om de app te verbeteren.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Cookie instellingen wijzigen</h4>
                <p>Je kunt je cookie voorkeuren op elk moment wijzigen door je browser instellingen aan te passen. Let op dat het uitschakelen van cookies de functionaliteit van de app kan beïnvloeden.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer Modal */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-3xl w-full m-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">⚠️ Disclaimer</h3>
              <button 
                onClick={() => setShowDisclaimerModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">AI-Gegenereerde Content</h4>
                <p>RecapSmart maakt gebruik van Google Gemini AI-technologie om transcripties, samenvattingen, analyses en andere content te genereren. Alle gegenereerde content is AI-gebaseerd en dient alleen ter ondersteuning van je werk.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Geen Garantie op Nauwkeurigheid</h4>
                <p>Hoewel we ons best doen om accurate resultaten te leveren, kunnen we geen garantie geven dat alle AI-gegenereerde content 100% nauwkeurig is. We raden aan om alle output te controleren en te verifiëren voordat je deze gebruikt voor belangrijke beslissingen.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Gebruik op Eigen Risico</h4>
                <p>Het gebruik van deze app en alle gegenereerde content gebeurt op eigen risico. We zijn niet aansprakelijk voor eventuele fouten, onjuistheden of gevolgen van het gebruik van de gegenereerde content.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Google Gemini API</h4>
                <p>De app integreert met Google Gemini AI-services. De kwaliteit en beschikbaarheid van deze services zijn afhankelijk van Google's voorwaarden en kunnen variëren. We hebben geen controle over de onderliggende AI-modellen of hun output.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Privacy en Data - Volledige Lokale Opslag</h4>
                <p><strong>Belangrijk:</strong> Je sessies worden NIET opgeslagen in onze database. Alle data blijft volledig lokaal op jouw apparaat.</p>
                <ul className="list-disc list-inside space-y-1 text-xs mt-2">
                  <li>🎙️ <strong>Opnames:</strong> Alleen lokaal opgeslagen, wij kunnen ze niet zien</li>
                  <li>📝 <strong>Transcripties:</strong> Blijven op jouw apparaat, niet in onze database</li>
                  <li>🤖 <strong>AI Output:</strong> Alleen jij kunt je gegenereerde content zien</li>
                  <li>🔑 <strong>API Key:</strong> Lokaal opgeslagen, wij hebben er geen toegang toe</li>
                </ul>
                <p className="mt-2 text-sm">We bewaren helemaal niets van jouw sessies. Jouw privacy staat voorop.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Aanbevelingen</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Controleer altijd de gegenereerde content op nauwkeurigheid</li>
                  <li>Gebruik AI-output als ondersteuning, niet als vervanging voor professioneel oordeel</li>
                  <li>Houd rekening met de beperkingen van AI-technologie</li>
                  <li>Raadpleeg experts bij belangrijke beslissingen</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">📋 Wachtlijst</h3>
              <button 
                onClick={() => setShowWaitlistModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Toegang op Uitnodiging</h4>
                <p>RecapSmart is momenteel alleen beschikbaar voor uitgenodigde gebruikers. Dit zorgt ervoor dat we de beste service kunnen bieden en de app kunnen optimaliseren op basis van feedback van onze gebruikers.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Hoe werkt de wachtlijst?</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Meld je aan met je email adres</li>
                  <li>We plaatsen je op de wachtlijst</li>
                  <li>Zodra er plek is, ontvang je een uitnodiging</li>
                  <li>Je kunt dan een account aanmaken en de app gebruiken</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Wat gebeurt er met je data?</h4>
                <p>Je email adres wordt alleen gebruikt om contact met je op te nemen wanneer je toegang krijgt. We delen je gegevens niet met derden.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">🔒 Volledige Privacy Garantie</h4>
                <p><strong>Belangrijk:</strong> Wanneer je de app gebruikt, worden je sessies NIET opgeslagen in onze database.</p>
                <ul className="list-disc list-inside space-y-1 text-xs mt-2">
                  <li>🎙️ <strong>Opnames:</strong> Blijven volledig lokaal op jouw apparaat</li>
                  <li>📝 <strong>Transcripties:</strong> Wij kunnen ze niet zien of opslaan</li>
                  <li>🤖 <strong>AI Output:</strong> Alleen jij hebt toegang tot je content</li>
                  <li>🔑 <strong>API Key:</strong> Lokaal opgeslagen, wij hebben er geen toegang toe</li>
                </ul>
                <p className="mt-2 text-sm">We bewaren helemaal niets van jouw sessies. Jouw privacy staat voorop.</p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Direct Aanmelden</h4>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="jouw@email.nl"
                    className="flex-1 px-3 py-2 border border-blue-300 dark:border-blue-500 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    onClick={() => {
                      addToWaitlist(waitlistEmail);
                      setShowWaitlistModal(false);
                    }}
                    disabled={!waitlistEmail.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    Aanmelden
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full m-4 p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">🔐 Inloggen</h3>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <LoginForm 
              onLogin={handleLogin}
              onCreateAccount={handleCreateAccount}
              onPasswordReset={handlePasswordReset}
              onClose={() => setShowLoginModal(false)}
            />
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && authState.user && authState.isAdmin && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-6xl w-full m-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">👑 Admin Panel</h3>
              <button 
                onClick={() => setShowAdminPanel(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Add User Section - Always visible */}
            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg mb-6">
              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Gebruiker Toevoegen</h4>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <button
                  onClick={() => addUser(newUserEmail)}
                  disabled={!newUserEmail.trim()}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-slate-400 transition-colors"
                >
                  Toevoegen
                </button>
              </div>
              
              {/* Sync Users Button */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                <button
                  onClick={syncUsersWithFirebase}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  title="Synchroniseer gebruikers tussen Firebase Auth en Firestore"
                >
                  🔄 Synchroniseer Gebruikers
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Repareert ontbrekende UID velden en synchroniseert gebruikers
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveAdminTab('waitlist')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeAdminTab === 'waitlist'
                      ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                  }`}
                >
                  📋 Wachtlijst ({waitlist.length})
                </button>
                <button
                  onClick={() => setActiveAdminTab('users')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeAdminTab === 'users'
                      ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                  }`}
                >
                  👥 Bestaande Gebruikers ({users.length})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeAdminTab === 'waitlist' && (
              <div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Wachtlijst Beheer</h4>
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4 mb-4">
                  <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                    Gebruikers op de wachtlijst kunnen worden geactiveerd om toegang te krijgen tot de app.
                  </p>
                  {selectedWaitlistUsers.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={activateWaitlistUsers}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {selectedWaitlistUsers.length} Geselecteerde Gebruiker(s) Activeren
                      </button>
                      <button
                        onClick={() => sendInvitationEmails(selectedWaitlistUsers)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        📧 Uitnodigingen Versturen
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">
                          <input
                            type="checkbox"
                            checked={waitlist.length > 0 && selectedWaitlistUsers.length === waitlist.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWaitlistUsers(waitlist.map(w => w.id));
                              } else {
                                setSelectedWaitlistUsers([]);
                              }
                            }}
                            className="rounded border-gray-300 dark:border-slate-600"
                          />
                        </th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Email</th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Aangemeld Op</th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waitlist.map((waitlistUser) => (
                        <tr key={waitlistUser.id} className="border-b border-gray-100 dark:border-slate-800">
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={selectedWaitlistUsers.includes(waitlistUser.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedWaitlistUsers([...selectedWaitlistUsers, waitlistUser.id]);
                                } else {
                                  setSelectedWaitlistUsers(selectedWaitlistUsers.filter(id => id !== waitlistUser.id));
                                }
                              }}
                              className="rounded border-gray-300 dark:border-slate-600"
                            />
                          </td>
                          <td className="p-2">{waitlistUser.email}</td>
                          <td className="p-2 text-xs text-slate-500 dark:text-slate-400">
                            {waitlistUser.createdAt?.toDate?.() ? 
                              waitlistUser.createdAt.toDate().toLocaleDateString('nl-NL') : 
                              'Onbekend'
                            }
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => sendInvitationEmail(waitlistUser.email)}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors"
                                title="Stuur uitnodigingsmail"
                              >
                                📧
                              </button>
                              <button
                                onClick={() => removeFromWaitlist(waitlistUser.id)}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
                                title="Verwijderen"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {waitlist.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500 dark:text-slate-400">
                            Geen gebruikers op de wachtlijst
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeAdminTab === 'users' && (
              <div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Gebruikers Beheer</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Email</th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Status</th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Admin</th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Laatste Login</th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Sessies</th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.uid} className="border-b border-gray-100 dark:text-slate-800">
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
                            }`}>
                              {user.isActive ? 'Actief' : 'Uitgeschakeld'}
                            </span>
                          </td>
                          <td className="p-2">
                            {user.isAdmin && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 rounded-full text-xs">
                                Admin
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-xs text-slate-500 dark:text-slate-400">
                            {user.lastLogin
                              ? (typeof (user.lastLogin as any)?.toDate === 'function'
                                  ? (user.lastLogin as any).toDate().toLocaleDateString('nl-NL')
                                  : new Date(user.lastLogin as any).toLocaleDateString('nl-NL'))
                              : 'Nooit'}
                          </td>
                          <td className="p-2 text-center">{user.sessionCount}</td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleUserStatus(user.uid, !user.isActive)}
                                className={`px-2 py-1 text-xs rounded ${
                                  user.isActive 
                                    ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30' 
                                    : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-500/30'
                                } transition-colors`}
                              >
                                {user.isActive ? 'Uitschakelen' : 'Activeren'}
                              </button>
                              <button
                                onClick={() => resetUserPassword(user.email)}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors"
                              >
                                Reset PW
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSystemAudioHelp && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-3xl w-full m-4 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Systeem-audio inschakelen</h3>
              <button onClick={() => setShowSystemAudioHelp(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
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
                <a href="#listen-along-info" className="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline">
                  Meer informatie over meeluisteren
                </a>
                <button onClick={() => setShowSystemAudioHelp(false)} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold">
                  Begrepen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-4xl w-full m-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">⚙️ Instellingen</h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* API Key Beheer */}
              <div className="bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-gray-200 dark:border-slate-600 p-4">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">🔑 API key beheer</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">Huidige opslag:</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => switchApiKeyStorage('local')} className={`px-3 py-2 rounded-md text-sm ${apiKeyStoragePreference==='local' ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>Lokaal</button>
                      <button onClick={() => switchApiKeyStorage('database')} className={`px-3 py-2 rounded-md text-sm ${apiKeyStoragePreference==='database' ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>Database</button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Status: {apiKey ? 'Lokale key aanwezig' : hasDatabaseApiKey ? 'Key in database aanwezig' : 'Geen key'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">Acties:</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setShowApiKeyModal(true)} className="px-3 py-2 rounded-md text-sm bg-blue-600 text-white">Key toevoegen/verniewen</button>
                      <button onClick={deleteApiKeyFromLocal} className="px-3 py-2 rounded-md text-sm bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">Verwijder lokaal</button>
                      <button onClick={deleteApiKeyFromDatabase} disabled={!authState.user || !hasDatabaseApiKey} className="px-3 py-2 rounded-md text-sm disabled:opacity-50 bg-red-600 text-white">Verwijder uit database</button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Als je de opslag wijzigt naar Database, voer dan een nieuwe key in zodat deze veilig gehashed opgeslagen kan worden.</p>
              </div>

              {/* Anonimisatie Regels Sectie */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Anonimisatie Regels</h4>
                  <button 
                    onClick={addAnonymizationRule}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm"
                  >
                    + Regel Toevoegen
                  </button>
                </div>
                
                <div className="space-y-3">
                  {anonymizationRules.map((rule, index) => (
                    <div key={rule.id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Originele Tekst
                          </label>
                          <input
                            type="text"
                            value={rule.originalText}
                            onChange={(e) => updateAnonymizationRule(rule.id, 'originalText', e.target.value)}
                            placeholder="Bijv. Jan, Company, etc."
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Vervangende Tekst
                          </label>
                          <input
                            type="text"
                            value={rule.replacementText}
                            onChange={(e) => updateAnonymizationRule(rule.id, 'replacementText', e.target.value)}
                            placeholder="Bijv. medewerker, Company, etc."
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
                              Exact
                            </label>
                          </div>
                          
                          <button
                            onClick={() => deleteAnonymizationRule(rule.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                            title="Verwijder regel"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {anonymizationRules.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <p>Nog geen anonimisatie regels ingesteld.</p>
                      <p className="text-sm mt-1">Voeg regels toe om tekst automatisch te anonimiseren.</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                  <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">💡 Tips voor Anonimisatie</h5>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• <strong>Exact:</strong> Vervangt alleen volledige woorden (bijv. "Jan" → "medewerker")</li>
                    <li>• <strong>Fuzzy:</strong> Intelligente naamherkenning - vindt namen die overeenkomen (bijv. "Jan" vindt "Jan", "Janneke", "Jan-Peter")</li>
                    <li>• <strong>Medewerker nummering:</strong> Gebruik "medewerker" als vervangende tekst, nummers worden automatisch toegevoegd</li>
                    <li>• <strong>Regel volgorde:</strong> Regels worden van boven naar beneden toegepast</li>
                    <li>• <strong>Veilig:</strong> Fuzzy matching vervangt NOOIT delen van andere woorden (bijv. "jan" in "januari" blijft intact)</li>
                  </ul>
                </div>
              </div>
              
              {/* Actie Knoppen */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={saveAnonymizationRules}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                >
                  Opslaan
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
      
      <main className="w-full max-w-6xl mx-auto px-3 sm:px-4 flex flex-col items-center gap-6 sm:gap-8 mt-20 sm:mt-12">
        {authState.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner className="w-8 h-8" text="Laden..." />
          </div>
        ) : showInfoPage || !authState.user ? (
          <div className="text-center py-16 w-full max-w-6xl mx-auto">
            {authState.user && (
              <div className="mb-6">
                <button onClick={() => setShowInfoPage(false)} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                  ← {t('startNewSession')}
                </button>
              </div>
            )}
            {/* Hero Section */}
            <div className="mb-16">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <img src="/logo.png" alt="RecapSmart Logo" className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shadow-2xl" />
              </div>
              
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                  RecapSmart
                </span>
              </h1>
              <p className="text-lg sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed px-1">
                {t('landingHeroSubtitle')}
              </p>
              
              {/* Waitlist Section - Prominent bovenaan */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-8 mb-8 max-w-4xl mx-auto">
                 <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-4 text-center">
                   {t('waitlistTitle')}
                 </h2>
                 <p className="text-blue-700 dark:text-blue-300 mb-6 text-center text-lg">
                   {t('waitlistLead')}
                 </p>
                
                {/* Waitlist Form */}
                <div className="flex gap-2 sm:gap-3 max-w-md mx-auto mb-4 px-2">
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="flex-1 px-3 sm:px-4 py-2 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    required
                  />
                  <button
                    onClick={() => addToWaitlist(waitlistEmail)}
                    disabled={!waitlistEmail.trim()}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200"
                  >
                    {t('waitlistSignUp')}
                  </button>
                </div>
                <button
                  onClick={() => setShowWaitlistModal(true)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline transition-colors mx-auto block"
                >
                  {t('waitlistMoreInfo')}
                </button>
              </div>
              
            <div className="text-center px-2">
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm sm:text-base">
                  {t('haveAccessLead')}
                </p>
                <button 
                  onClick={() => setShowLoginModal(true)} 
                  className="px-6 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-semibold rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  🔐 {t('loginNow')}
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 px-2">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <MicIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('featureRecordingTitle')}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('featureRecordingDesc')}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <SummaryIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('featureAIAnalysisTitle')}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('featureAIAnalysisDesc')}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <PresentationIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('featurePresentationsTitle')}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('featurePresentationsDesc')}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <ChatIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('featureChatTitle')}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('featureChatDesc')}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <PodcastIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('featurePodcastTitle')}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('featurePodcastDesc')}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <AnonymizeIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('featurePrivacyTitle')}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('featurePrivacyDesc')}</p>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 sm:p-8 rounded-2xl mb-16 border-2 border-green-200 dark:border-green-700 mx-1">
              <h2 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-6 text-center">{t('privacyTitle')}</h2>
              <div className="max-w-5xl mx-auto">
                <p className="text-green-700 dark:text-green-300 text-lg text-center mb-6">{t('privacyLead')}</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-green-800 dark:text-green-200 font-medium">{t('privacyItemRecordings')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-green-800 dark:text-green-200 font-medium">{t('privacyItemTranscripts')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-green-800 dark:text-green-200 font-medium">{t('privacyItemAIOutput')}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-green-800 dark:text-green-200 font-medium">{t('privacyItemApiKeyLocal')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-green-800 dark:text-green-200 font-medium">{t('privacyItemNoServers')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-green-800 dark:text-green-200 font-medium">{t('privacyItemWeStoreNothing')}</span>
                    </div>
                  </div>
                </div>
                <p className="text-green-600 dark:text-green-400 text-center mt-6 text-sm">{t('privacyFootnote')}</p>
              </div>
            </div>

            {/* Use Cases Section */}
            <div className="bg-gradient-to-r from-slate-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 p-6 sm:p-8 rounded-2xl mb-16 mx-1">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-center">{t('useCasesTitle')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Management & Leiderschap */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-cyan-600">{t('useCasesMgmtTitle')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesMgmt1')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesMgmt2')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesMgmt3')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesMgmt4')}</span>
                    </div>
                  </div>
                </div>

                {/* Advies & Consultatie */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-cyan-600">{t('useCasesAdviceTitle')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesAdvice1')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesAdvice2')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesAdvice3')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesAdvice4')}</span>
                    </div>
                  </div>
                </div>

                {/* Creatie & Communicatie */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-cyan-600">{t('useCasesCreationTitle')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesCreation1')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesCreation2')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesCreation3')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesCreation4')}</span>
                    </div>
                  </div>
                </div>

                {/* Onderzoek & Analyse */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-cyan-600">{t('useCasesResearchTitle')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesResearch1')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesResearch2')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesResearch3')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesResearch4')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Listen Along Info */}
            <div id="listen-along-info" className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 sm:p-8 rounded-2xl mb-16 mx-1 border-2 border-purple-200 dark:border-purple-700">
              <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-3 text-center">
                🎧 {t('listenAlongTitle')}
              </h2>
              <p className="text-purple-800/90 dark:text-purple-200/90 text-center max-w-4xl mx-auto">
                {t('listenAlongBody')}
              </p>
            </div>

            {/* How It Works */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 text-center">
                {t('howItWorksTitle')}
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-cyan-100 dark:bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('hiwStep1Title')}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{t('hiwStep1Desc')}</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-cyan-100 dark:bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('hiwStep2Title')}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{t('hiwStep2Desc')}</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-cyan-100 dark:bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('hiwStep3Title')}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{t('hiwStep3Desc')}</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8 rounded-2xl text-white">
              <h2 className="text-3xl font-bold mb-4 text-center">{t('ctaTitle')}</h2>
              <p className="text-xl text-cyan-100 mb-8 text-center max-w-2xl mx-auto">{t('ctaLead')}</p>
              
              <div className="flex justify-center px-2">
                <button 
                  onClick={() => setShowLoginModal(true)} 
                  className="px-8 py-4 text-lg font-semibold rounded-xl bg-white text-cyan-600 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                >
                  🔐 {t('loginNow')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100">{t('appTitle')}</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">{t('appDescription')}</p>
                {/* Welkom tekst weggehaald */}
            </div>
        
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
             <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 space-y-6">
                {/* API Key Waarschuwing */}
                {!apiKey && !hasDatabaseApiKey && (
                    <div className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 rounded-lg p-4 flex items-center gap-3">
                        <AlertTriangleIcon className="w-6 h-6 text-amber-500" />
                        <div className="flex-1">
                            <p className="font-semibold mb-1">{t('setupApiKey')}</p>
                            <p className="text-sm mb-2">{t('haveAccessLead')}</p>
                            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded p-2 text-sm">
                                <p className="text-green-700 dark:text-green-300 font-medium">✅ {t('privacyTitle')}</p>
                                <p className="text-green-600 dark:text-green-400">• {t('privacyItemApiKeyLocal')}</p>
                                <p className="text-green-600 dark:text-green-400">• {t('privacyItemNoServers')}</p>
                                <p className="text-green-600 dark:text-green-400">• {t('privacyItemWeStoreNothing')}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowApiKeyModal(true)} 
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                        >
                            {t('setupApiKey')}
                        </button>
                    </div>
                )}
                
                {(apiKey || hasDatabaseApiKey) && (
                    <div className="transition-opacity duration-500">
                        <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">
                            <span className="text-cyan-500 font-black tracking-wider text-sm block uppercase mb-2">{t('step1')}</span> {t('sessionLang')}
                        </h2>
                        <div className="flex justify-center gap-4 mt-4">
                           <button onClick={() => setLanguage('nl')} className={`px-6 py-2 rounded-lg text-lg font-semibold transition-all duration-200 w-40 ${language === 'nl' ? 'bg-cyan-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'}`}>
                               {t('dutch')}
                           </button>
                           <button onClick={() => setLanguage('en')} className={`px-6 py-2 rounded-lg text-lg font-semibold transition-all duration-200 w-40 ${language === 'en' ? 'bg-cyan-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'}`}>
                               {t('english')}
                           </button>
                        </div>
                    </div>
                )}
                
                {(apiKey || hasDatabaseApiKey) && language && (
                    <div className="transition-opacity duration-500">
                        <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">
                            <span className="text-cyan-500 font-black tracking-wider text-sm block uppercase mb-2">{t('step2')}</span> {t('startOrUpload')}
                        </h2>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-4">
                    <button onClick={startRecording} disabled={isProcessing} className="w-full sm:flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200">
                                <MicIcon className="w-6 h-6" />
                                <span className="text-lg font-semibold">{t('startRecording')}</span>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.pdf,.rtf,.html,.htm,.md,text/plain,application/pdf,application/rtf,text/html,text/markdown"/>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="w-full sm:flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200">
                                <UploadIcon className="w-6 h-6" />
                                <span className="text-lg font-semibold">📄 {t('uploadTranscript')}</span>
                            </button>
                        </div>
                <div className="mt-2 text-center">
                    <button onClick={() => setShowSystemAudioHelp(true)} className="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline">
                        🔊 Audio meeluisteren? Uitleg
                    </button>
                </div>
                        
                        {/* Supported formats info */}
                        <div className="mt-3 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                📋 Ondersteunde formaten: TXT ✅, PDF ✅, RTF ✅, HTML ✅, MD ✅
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                💡 PDF en RTF worden automatisch omgezet naar platte tekst
                            </p>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            status === RecordingStatus.FINISHED && renderAnalysisView()
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

        {/* Footer Links */}
        <footer className="w-full max-w-6xl mt-16 pt-8 border-t border-gray-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <a 
              href="/cookies" 
              className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setShowCookieModal(true);
              }}
            >
              Cookies
            </a>
            <span className="hidden sm:inline">•</span>
            <a 
              href="/disclaimer" 
              className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setShowDisclaimerModal(true);
              }}
            >
              Disclaimer
            </a>
          </div>
        </footer>
      </main>
    </div>
    </>
  );
}
=======
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RecordingStatus, type SpeechRecognition } from './types';
import { GoogleGenAI, Chat, Type } from "@google/genai";
// Mermaid is ESM-only; import dynamically to avoid type issues
let mermaid: any;
import PptxGenJS from 'pptxgenjs';
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
import { auth, db } from './src/firebase';

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
const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
);
const ResetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
);
const SummaryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 11-6 6v3h9l6-6-3-3Z"/><path d="m22 6-3-3-1.41 1.41 3 3L22 6Z"/><path d="m14 10 3 3"/></svg>
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
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.432 0l6.586-6.586a2.426 2.426 0 0 0 0-3.432L12.586 2.586z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>
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
}> = ({ onLogin, onCreateAccount, onPasswordReset, onClose }) => {
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
          throw new Error('Wachtwoorden komen niet overeen');
        }
        if (password.length < 6) {
          throw new Error('Wachtwoord moet minimaal 6 karakters zijn');
        }
        // Save email to localStorage
        localStorage.setItem('last_email', email);
        await onCreateAccount(email, password);
      } else if (mode === 'reset') {
        await onPasswordReset(email);
        setSuccess('Wachtwoord reset email verzonden!');
        setTimeout(() => setMode('login'), 2000);
      }
    } catch (error: any) {
      setError(error.message || 'Er is een fout opgetreden');
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
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="jouw@email.com"
        />
      </div>

      {mode !== 'reset' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Wachtwoord
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus={!!email} // Auto-focus if email is pre-filled
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="••••••••"
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
              Dit wachtwoord is specifiek voor deze app
            </p>
          )}
        </div>
      )}

      {mode === 'create' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Bevestig Wachtwoord
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="••••••••"
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
          ) : mode === 'login' ? 'Inloggen' : mode === 'create' ? 'Account Aanmaken' : 'Reset Versturen'}
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
              Account aanmaken
            </button>
            <button
              type="button"
              onClick={() => setMode('reset')}
              className="text-cyan-500 hover:text-cyan-600 transition-colors"
            >
              Wachtwoord vergeten?
            </button>
          </>
        )}
        
        {mode === 'create' && (
          <button
            type="button"
            onClick={() => setMode('login')}
            className="text-cyan-500 hover:text-cyan-600 transition-colors"
          >
            Terug naar inloggen
          </button>
        )}
        
        {mode === 'reset' && (
          <button
            type="button"
            onClick={() => setMode('login')}
            className="text-cyan-500 hover:text-cyan-600 transition-colors"
          >
            Terug naar inloggen
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

const PodcastPlayer: React.FC<{ script: string; language: 'nl' | 'en'; t: (key: any, params?: any) => string; }> = ({ script, language, t }) => {
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
            utterance.lang = language === 'nl' ? 'nl-NL' : 'en-US';
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

const KeywordExplanationModal: React.FC<{ keyword: string; explanation: string | null; isLoading: boolean; onClose: () => void; t: (key: any, params?: any) => string; }> = ({ keyword, explanation, isLoading, onClose, t }) => {
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

const ApiKeySetupModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (apiKey: string) => void; 
    t: (key: any, params?: any) => string; 
    storagePreference: 'local' | 'database';
    onStoragePreferenceChange: (preference: 'local' | 'database') => void;
    isLoggedIn: boolean;
}> = ({ isOpen, onClose, onSave, t, storagePreference, onStoragePreferenceChange, isLoggedIn }) => {
    const [inputApiKey, setInputApiKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSave = async () => {
        if (!inputApiKey.trim()) {
            setError(t('apiKeyRequired'));
            return;
        }

        setIsValidating(true);
        setError(null);

        try {
            // Test de API key met een eenvoudige call
            const ai = new GoogleGenAI({ apiKey: inputApiKey.trim() });
            await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: 'Test' 
            });
            
            onSave(inputApiKey.trim());
        } catch (err: any) {
            setError(t('apiKeyInvalid'));
        } finally {
            setIsValidating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
            <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-6 max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400 mb-4">🔑 Google Gemini API Key Instellen</h3>
                
                <div className="space-y-6">
                    {/* Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📋 Stap-voor-stap instructies voor het ophalen van je API key:</h4>
                        
                        {/* Gratis & Veilig Info */}
                        <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded p-3 mb-3">
                            <p className="text-green-700 dark:text-green-300 font-medium text-sm">✅ Volledig Gratis & Veilig</p>
                            <p className="text-green-600 dark:text-green-400 text-sm">• Geen kosten bij Google</p>
                            <p className="text-green-600 dark:text-green-400 text-sm">• Geen betalingsmiddel nodig</p>
                            <p className="text-green-600 dark:text-green-400 text-sm">• Ruime gratis limiet per maand</p>
                        </div>
                        
                        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700 dark:text-blue-300">
                            <li>Klik op de blauwe knop hieronder</li>
                            <li>Log in met je Google account</li>
                            <li>Klik op "Create API Key"</li>
                            <li>Kopieer de gegenereerde key</li>
                            <li>Plak de key in het veld hieronder</li>
                        </ol>
                        <div className="mt-3">
                            <a 
                                href="https://aistudio.google.com/apikey" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                🔑 Haal je gratis API key op bij Google AI Studio
                            </a>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                                <strong>Directe link:</strong> https://aistudio.google.com/apikey
                            </p>
                        </div>
                    </div>

                    {/* API Key Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            🔑 Voer je Google Gemini API key in:
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={inputApiKey}
                                onChange={(e) => setInputApiKey(e.target.value)}
                                placeholder="AIzaSyC... (begint altijd met AIzaSy)"
                                className="w-full px-3 py-2 pr-10 border-2 border-cyan-300 dark:border-cyan-500 rounded-md bg-cyan-50 dark:bg-cyan-900/20 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:border-cyan-400 placeholder-cyan-400 dark:placeholder-cyan-500"
                                disabled={isValidating}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                title={showPassword ? "Verberg API key" : "Toon API key"}
                            >
                                {showPassword ? "👁️‍🗨️" : "👁️"}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            💡 Je API key begint altijd met "AIzaSy" en is ongeveer 40 karakters lang
                        </p>
                        {error && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                        )}
                    </div>

                    {/* Storage Preference */}
                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">💾 Kies waar je API key wordt opgeslagen:</h4>
                        
                        <div className="space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="storage"
                                    value="local"
                                    checked={storagePreference === 'local'}
                                    onChange={(e) => onStoragePreferenceChange(e.target.value as 'local' | 'database')}
                                    className="mt-1"
                                />
                                <div>
                                    <span className="font-medium text-blue-700 dark:text-blue-300">🌐 Browser (Lokaal)</span>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        • API key wordt opgeslagen in je browser<br/>
                                        • Alleen toegankelijk op dit apparaat<br/>
                                        • Verloren bij het wissen van browser data<br/>
                                        • <strong>Voordeel:</strong> Volledig lokaal, geen database opslag
                                    </p>
                                </div>
                            </label>
                            
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="storage"
                                    value="database"
                                    checked={storagePreference === 'database'}
                                    onChange={(e) => onStoragePreferenceChange(e.target.value as 'local' | 'database')}
                                    className="mt-1"
                                />
                                <div>
                                    <span className="font-medium text-blue-700 dark:text-blue-300">🗄️ Database (Veilig & Versleuteld)</span>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        • API key wordt gehashed en versleuteld opgeslagen<br/>
                                        • Toegankelijk op alle apparaten waar je inlogt<br/>
                                        • Veilig tegen data verlies<br/>
                                        • <strong>Voordeel:</strong> Backup en synchronisatie tussen apparaten
                                    </p>
                                    {!isLoggedIn && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                            ⚠️ Je moet ingelogd zijn om deze optie te gebruiken. Je kunt je eerst aanmelden en dan terugkomen.
                                        </p>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Privacy Note */}
                    <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg p-3">
                        <p className="text-sm text-green-700 dark:text-green-300">
                            <strong>🔒 Privacy & Veiligheid:</strong> Je API key wordt nooit in plain text opgeslagen en wordt alleen gebruikt voor AI verwerking.
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            <strong>💡 Database opslag:</strong> API key wordt gehashed met SHA-256 + salt en versleuteld opgeslagen. Zelfs wij kunnen de originele key niet lezen.
                        </p>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    {/* Main Action Buttons */}
                    <div className="space-y-3">
                        {/* Info melding als geen key is ingevoerd */}
                        {!inputApiKey.trim() && (
                            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-3 text-center">
                                <p className="text-amber-700 dark:text-amber-300 text-sm">
                                    ⚠️ Voer eerst je API key in om deze op te kunnen slaan
                                </p>
                            </div>
                        )}
                        
                        {/* Database Opslag Knop */}
                        <button 
                            onClick={() => {
                                // Sla op in database als dat is gekozen, anders lokaal
                                onSave(inputApiKey.trim());
                            }}
                            disabled={isValidating || !inputApiKey.trim()}
                            className="w-full px-4 py-2 bg-cyan-500 text-white rounded-md font-semibold hover:bg-cyan-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors disabled:cursor-not-allowed"
                        >
                            {isValidating ? 'Valideren...' : storagePreference === 'database' ? '🗄️ API Key in Database Opslaan' : '🌐 API Key Lokaal Opslaan'}
                        </button>
                        
                        {/* Alternative Options - Alleen tonen als er een key is */}
                        {inputApiKey.trim() && storagePreference === 'database' && (
                            <button 
                                onClick={() => {
                                    // Force lokaal opslaan
                                    onStoragePreferenceChange('local');
                                    onSave(inputApiKey.trim());
                                }}
                                disabled={isValidating}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors disabled:cursor-not-allowed"
                            >
                                🌐 Toch Lokaal Opslaan (Geen Database)
                            </button>
                        )}
                        
                        {/* Cancel Button */}
                        <button 
                            onClick={onClose} 
                            className="w-full px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            ❌ Scherm Afsluiten
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PowerPointOptionsModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onGenerate: (options: { maxSlides: number; language: 'nl' | 'en'; useTemplate: boolean; templateFile?: File | null }) => void; 
    t: (key: any, params?: any) => string; 
    currentTemplate: File | null;
    onTemplateChange: (file: File | null) => void;
}> = ({ isOpen, onClose, onGenerate, t, currentTemplate, onTemplateChange }) => {
    const [maxSlides, setMaxSlides] = useState(10);
    const [language, setLanguage] = useState<'nl' | 'en'>('nl');
    const [useTemplate, setUseTemplate] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // ... existing code ...

    useEffect(() => {
        if (isOpen) {
            setMaxSlides(10);
            setLanguage('nl');
            setUseTemplate(false);
        }
    }, [isOpen]);

    const handleGenerate = () => {
        onGenerate({ maxSlides, language, useTemplate, templateFile: useTemplate ? currentTemplate : null });
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
                        <div className="flex gap-3">
                            <label className="flex items-center">
                                <input 
                                    type="radio" 
                                    name="language" 
                                    value="nl" 
                                    checked={language === 'nl'} 
                                    onChange={(e) => setLanguage(e.target.value as 'nl' | 'en')}
                                    className="mr-2 text-cyan-500 focus:ring-cyan-500"
                                />
                                {t('dutch')}
                            </label>
                            <label className="flex items-center">
                                <input 
                                    type="radio" 
                                    name="language" 
                                    value="en" 
                                    checked={language === 'en'} 
                                    onChange={(e) => setLanguage(e.target.value as 'nl' | 'en')}
                                    className="mr-2 text-cyan-500 focus:ring-cyan-500"
                                />
                                {t('english')}
                            </label>
                        </div>
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
type ViewType = 'transcript' | 'summary' | 'faq' | 'learning' | 'followUp' | 'chat' | 'podcast' | 'keyword' | 'sentiment' | 'mindmap';
type AnalysisType = ViewType | 'presentation';
type ChatRole = 'user' | 'model';
interface ChatMessage {
  role: ChatRole;
  text: string;
}
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
interface KeywordTopic {
    topic: string;
    keywords: string[];
}
interface SentimentAnalysisResult {
  taggedText: string;
  summary: string;
  conclusion: string;
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
  isAdmin: boolean;
  lastLogin: Date | null;
  sessionCount: number;
  createdAt: Date;
  updatedAt: Date;
  hashedApiKey?: string;
  apiKeyLastUpdated?: Date;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
}


// --- i18n ---
const translations = {
    nl: {
        cookieTitle: "Cookies for Analytics",
        cookiePoint1: "Essential cookies only",
        cookiePoint2: "No tracking of personal data",
        cookiePoint3: "Helps us improve the app",
        accept: "Accept",
        decline: "Decline",
        sessionLang: "Selecteer Sessie Taal",
        dutch: "Nederlands",
        english: "English",
        startRecording: "Start Opname",
        uploadTranscript: "Upload Transcript",
        waitingPermission: "Wachten op schermopname toestemming...",
        pause: "Pauze",
        stop: "Stop",
        resume: "Hervat",
        recordingStopped: "Opname gestopt. Klaar om te transcriberen.",
        transcribeSession: "Transcribeer Sessie",
        transcribing: "Transcriptie bezig...",
        summarizing: "Samenvatting wordt gemaakt...",
        processing: "Verwerken...",
        appTitle: "RecapSmart",
        appDescription: "Neem op, upload, transcribeer en analyseer uw sessies met AI.",
        reset: "Reset",
        startNewSession: "Nieuwe Sessie",
        errorRecording: "Fout bij opstarten opname",
        permissionDenied: "Toestemming voor scherm- en/of microfoonopname is geweigerd. Om op te nemen, moet u de pagina herladen en toestemming verlenen wanneer de browser daarom vraagt. Als u geen prompt ziet, controleer dan de site-instellingen van uw browser om de toestemming te deblokkeren.",
        noDevices: "Geen geschikte opnameapparaten (scherm, microfoon) gevonden. Zorg ervoor dat ze zijn aangesloten en ingeschakeld.",
        unknownError: "Er is een onbekende fout opgetreden.",
        anonymizing: "Transcript wordt geanonimiseerd...",
        anonymizationComplete: "Anonimisering voltooid.",
        termsReplaced: "{count} termen vervangen.",
        nothingToReplace: "Geen te vervangen termen gevonden.",
        anonymizeSuccess: "Anonimisering voltooid. {report} vervangen.",
        anonymizeNothing: "Anonimisering voltooid. Geen te vervangen termen gevonden.",
        selectLangFirst: "Selecteer een taal voordat u de opname start.",
        noAudioToTranscribe: "Geen audio opgenomen om te transcriberen.",
        apiKeyMissing: "API_KEY ontbreekt.",
        aiError: "AI-verwerking mislukt",
        transcriptEmpty: "De transcriptie is leeg, dus er kan geen analyse worden gemaakt.",
        generating: "Genereren van {type}...",
        generationFailed: "AI {type} generatie mislukt",
        transcript: "Transcript",
        transcriptAnonymized: "Transcript (A)",
        summary: "Samenvatting",
        faq: "FAQ",
        keyLearnings: "Key Learnings",
        followUp: "Follow-up",
        chat: "Chat",
        podcast: "Podcast",
        anonymize: "Anoniem",
        makePodcast: "Maak Podcast",
        exportPPT: "Export PPT",
        copyContent: "Kopieer inhoud",
        noContent: "Nog geen inhoud gegenereerd.",
        chatWithTranscript: "Chat met Transcript",
        readAnswers: "Lees antwoorden voor",
        mindmap: "Mindmap",
        askAQuestion: "Stel een vraag over de transcriptie...",
        generatingPresentation: "Presentatie wordt gemaakt...",
        generatingImageForSlide: "Afbeelding genereren voor slide: \"{title}\"...",
        finalizingPresentation: "Presentatie afronden...",
        presentationFailed: "Genereren van presentatie mislukt",
        speechRecognitionUnsupported: "Spraakherkenning wordt niet ondersteund in deze browser.",
        podcastGenerating: "Podcastscript wordt gemaakt...",
        podcastFailed: "Genereren van podcast mislukt",
        fileReadFailed: "Bestand lezen mislukt",
        selectLangToUpload: "Selecteer een taal voordat u een transcript uploadt.",
        keywordAnalysis: "Keyword Analyse",
        sentimentAnalysis: "Sentiment Analyse",
        showSentiment: "Toon Sentiment",
        hideSentiment: "Verberg Sentiment",
        analyzingSentiment: "Sentiment analyseren...",
        startOrUpload: "Start Sessie",
        step1: "Stap 1",
        step2: "Stap 2",
        presentationSuccess: "Presentatie '{fileName}' met {slideCount} slides succesvol aangemaakt en opgeslagen in uw Downloads map.",
        podcastReady: "Podcast is klaar om af te spelen",
        rewindPodcast: "Herstart podcast",
        downloadScript: "Download script",
        play: "Afspelen",
        podcastDownloadNote: "Let op: browsers ondersteunen het direct downloaden van de audio niet. Dit downloadt het door AI gegenereerde script.",
        inhoudsopgave: "Inhoudsopgave",
        taak: "Taak",
        eigenaar: "Eigenaar",
        deadline: "Deadline",
        sentimentSummary: "Sentiment Samenvatting",
        sentimentConclusion: "Algemene Conclusie",
        sentimentOverall: "Algehele Sentimentanalyse",
        keywordExplanation: "Uitleg voor '{keyword}'",
        fetchingExplanation: "Uitleg ophalen...",
        close: "Sluiten",
        uploadTemplate: "Upload Sjabloon",
        templateUploaded: "Sjabloon: {name}",
        clearTemplate: "Wis sjabloon",
        pptTemplateNote: "Opmerking: AI-afbeeldingen zijn uitgeschakeld bij gebruik van een aangepast sjabloon.",
        listenAlongTitle: "Luister mee met podcasts en YouTube",
        listenAlongBody: "Gebruik RecapSmart om mee te luisteren met podcasts en YouTube-video's. Handig voor extra uitleg en om meer uit een uitzending te halen: zet systeemgeluid aan, speel de video of podcast af en laat RecapSmart automatisch transcriberen en samenvatten.",
        landingHeroSubtitle: "Transformeer je meetings, webinars en gesprekken in professionele documenten, presentaties en inzichten met AI",
        waitlistTitle: "📋 Toegang op Uitnodiging",
        waitlistLead: "RecapSmart is momenteel alleen beschikbaar voor uitgenodigde gebruikers. Meld je aan voor de wachtlijst!",
        emailPlaceholder: "jouw@email.nl",
        waitlistSignUp: "Aanmelden",
        waitlistMoreInfo: "Meer informatie over de wachtlijst",
        aboutAiTitle: "🤖 Over AI & API Key",
        aboutAiBody: "RecapSmart gebruikt de Google Gemini API; daarvoor is een API key nodig. RecapSmart werkt met jouw key: hij is gratis, er zijn geen kosten. De key is van jou – daarom kan RecapSmart zo goedkoop zijn.",
        haveAccessLead: "Heb je al toegang? Log dan in om te beginnen",
        loginNow: "Inloggen",
        featuresTitle: "Perfect Voor:",
        featureRecordingTitle: "🎙️ Slimme Opname",
        featureRecordingDesc: "Neem meetings, webinars en gesprekken op met je microfoon en systeem audio. Automatische transcriptie in Nederlands of Engels.",
        featureAIAnalysisTitle: "📝 AI Analyse",
        featureAIAnalysisDesc: "Genereer samenvattingen, FAQ's, leerpunten en vervolgvragen automatisch met Google Gemini AI.",
        featurePresentationsTitle: "📊 Presentaties",
        featurePresentationsDesc: "Maak professionele PowerPoint presentaties met AI gegenereerde content en afbeeldingen.",
        featureChatTitle: "💬 Chat & Vragen",
        featureChatDesc: "Stel vragen over je transcriptie en krijg gedetailleerde antwoorden. Ondersteuning voor voice input.",
        featurePodcastTitle: "🎧 Podcast Scripts",
        featurePodcastDesc: "Genereer podcast scripts en content op basis van je meetings. Perfect voor content creators.",
        featurePrivacyTitle: "🔒 Privacy & Anonimisatie",
        featurePrivacyDesc: "Automatische anonimisatie van namen en gevoelige informatie. Instelbare regels voor jouw organisatie.",
        privacyTitle: "🔒 Volledige Privacy Garantie",
        privacyLead: "Belangrijk: Je sessies worden NIET opgeslagen in onze database. Alle data blijft volledig lokaal op jouw apparaat.",
        privacyItemRecordings: "🎙️ Opnames blijven lokaal",
        privacyItemTranscripts: "📝 Transcripties zijn privé",
        privacyItemAIOutput: "🤖 AI output alleen voor jou",
        privacyItemApiKeyLocal: "🔑 API key lokaal opgeslagen",
        privacyItemNoServers: "🌐 Geen data naar onze servers",
        privacyItemWeStoreNothing: "✅ Wij bewaren helemaal niets",
        privacyItemNoVideo: "🎥 Geen video wordt opgenomen",
        privacyItemAudioStored: "🔊 Audio bestanden worden lokaal opgeslagen",
        privacyFootnote: "Jouw privacy staat voorop. We kunnen jouw sessies niet zien, opslaan of gebruiken.",
        useCasesTitle: "💼 Perfect Voor:",
        useCasesMgmtTitle: "Management & Leiderschap",
        useCasesMgmt1: "Projectmanagers en teamleiders",
        useCasesMgmt2: "Product owners en productmanagers",
        useCasesMgmt3: "Executives en CEO's (voor strategische meetings en rapportages)",
        useCasesMgmt4: "Salesmanagers en accountmanagers (voor klantgesprekken en pitches)",
        useCasesAdviceTitle: "Advies & Consultatie",
        useCasesAdvice1: "Consultants en adviseurs",
        useCasesAdvice2: "Support consultants",
        useCasesAdvice3: "HR-professionals en recruiters (voor interviews en onboarding)",
        useCasesAdvice4: "Financiële adviseurs en auditors (voor compliance en rapporten)",
        useCasesCreationTitle: "Creatie & Communicatie",
        useCasesCreation1: "Content creators en journalisten",
        useCasesCreation2: "Marketeers en PR-specialisten (voor brainstorms en campagnes)",
        useCasesCreation3: "Webinar hosts en trainers",
        useCasesCreation4: "Podcasters en vloggers (voor opnames en editten)",
        useCasesResearchTitle: "Onderzoek & Analyse",
        useCasesResearch1: "Onderzoekers en academici",
        useCasesResearch2: "Legal professionals",
        useCasesResearch3: "Accountants en boekhouders",
        useCasesResearch4: "Data-analisten en onderzoekers in business intelligence (voor data-sessies en inzichten)",
        howItWorksTitle: "🔄 Hoe Het Werkt:",
        hiwStep1Title: "Opnemen",
        hiwStep1Desc: "Start een opname van je meeting of upload een transcript",
        hiwStep2Title: "AI Verwerking",
        hiwStep2Desc: "AI analyseert en genereert content op basis van je input",
        hiwStep3Title: "Resultaat",
        hiwStep3Desc: "Download je documenten, presentaties en inzichten",
        ctaTitle: "🚀 Klaar om te Starten?",
        ctaLead: "Log in en ontdek hoe RecapSmart je workflow kan transformeren. Bespaar uren aan handmatige notities en documentatie.",
        listening: "Luisteren...",
        speaking: "Spreek je vraag in...",
        startListening: "Start spraakherkenning",
        stopListening: "Stop spraakherkenning",
        powerpointOptions: "PowerPoint Opties",
        useCustomTemplate: "Gebruik aangepast sjabloon",
        selectTemplate: "Selecteer sjabloon",
        maxSlides: "Maximum slides",
        presentationLanguage: "Presentatie taal",
        generatePresentation: "Genereer presentatie",
        cancel: "Annuleren",
        setupApiKey: "API Key Instellen",
        howToGetApiKey: "Hoe krijg je een Google Gemini API Key?",
        apiKeyStep1: "Ga naar Google MakerSuite",
        apiKeyStep2: "Log in met je Google account",
        apiKeyStep3: "Klik op 'Create API Key'",
        apiKeyStep4: "Kopieer de gegenereerde key",
        openGoogleMakerSuite: "Open Google MakerSuite",
        enterApiKey: "Voer je API Key in",
        apiKeyRequired: "API Key is verplicht",
        apiKeyInvalid: "API Key is ongeldig",
        validating: "Valideren...",
        saveApiKey: "API Key Opslaan",
        privacyNote: "Privacy Opmerking",
        apiKeyPrivacy: "Je API key wordt alleen lokaal opgeslagen op je apparaat en wordt nooit naar onze servers gestuurd.",
    },
    en: {
        cookieTitle: "Cookies for Analytics",
        cookiePoint1: "Essential cookies only",
        cookiePoint2: "No tracking of personal data",
        cookiePoint3: "Helps us improve the app",
        accept: "Accept",
        decline: "Decline",
        sessionLang: "Select Session Language",
        dutch: "Nederlands",
        english: "English",
        startRecording: "Start Recording",
        uploadTranscript: "Upload Transcript",
        waitingPermission: "Waiting for screen recording permission...",
        pause: "Pause",
        stop: "Stop",
        resume: "Resume",
        recordingStopped: "Recording stopped. Ready to transcribe.",
        transcribeSession: "Transcribe Session",
        transcribing: "Transcribing...",
        summarizing: "Summarizing...",
        processing: "Processing...",
        appTitle: "RecapSmart",
        appDescription: "Record, upload, transcribe, and analyze your sessions with AI.",
        reset: "Reset",
        startNewSession: "Start New Session",
        errorRecording: "Error starting recording",
        permissionDenied: "Permission for screen and/or microphone recording was denied. To record, you must reload the page and grant permission when prompted. If you don't see a prompt, check your browser's site settings to unblock permission.",
        noDevices: "No suitable recording devices (screen, microphone) found. Ensure they are connected and enabled.",
        unknownError: "An unknown error has occurred.",
        anonymizing: "Anonymizing transcript...",
        anonymizationComplete: "Anonymization complete.",
        termsReplaced: "{count} terms replaced.",
        nothingToReplace: "No terms found to replace.",
        anonymizeSuccess: "Anonymization complete. Replaced {report}.",
        anonymizeNothing: "Anonymization complete. No terms found to replace.",
        selectLangFirst: "Please select a language before starting to record.",
        noAudioToTranscribe: "No audio recorded to transcribe.",
        apiKeyMissing: "API_KEY is missing.",
        aiError: "AI processing failed",
        transcriptEmpty: "The transcript is empty, so no analysis can be generated.",
        generating: "Generating {type}...",
        generationFailed: "AI {type} generation failed",
        transcript: "Transcript",
        transcriptAnonymized: "Transcript (A)",
        summary: "Summary",
        faq: "FAQ",
        keyLearnings: "Key Learnings",
        followUp: "Follow-up",
        chat: "Chat",
        podcast: "Podcast",
        anonymize: "Anonymize",
        makePodcast: "Make Podcast",
        exportPPT: "Export PPT",
        copyContent: "Copy content",
        noContent: "No content generated yet.",
        chatWithTranscript: "Chat with Transcript",
        readAnswers: "Read answers aloud",
        mindmap: "Mindmap",
        askAQuestion: "Ask a question about the transcript...",
        generatingPresentation: "Generating presentation...",
        generatingImageForSlide: "Generating image for slide: \"{title}\"...",
        finalizingPresentation: "Finalizing presentation...",
        presentationFailed: "Failed to generate presentation",
        speechRecognitionUnsupported: "Speech recognition is not supported in this browser.",
        podcastGenerating: "Generating podcast script...",
        podcastFailed: "Failed to generate podcast",
        fileReadFailed: "Failed to read file",
        selectLangToUpload: "Please select a language before uploading a transcript.",
        keywordAnalysis: "Keyword Analysis",
        sentimentAnalysis: "Sentiment Analysis",
        showSentiment: "Show Sentiment",
        hideSentiment: "Hide Sentiment",
        analyzingSentiment: "Analyzing sentiment...",
        startOrUpload: "Start Session",
        step1: "Step 1",
        step2: "Step 2",
        presentationSuccess: "Successfully created presentation '{fileName}' with {slideCount} slides. Saved to your Downloads folder.",
        podcastReady: "Podcast is ready to play",
        rewindPodcast: "Rewind podcast",
        downloadScript: "Download script",
        play: "Play",
        podcastDownloadNote: "Note: Browsers do not support direct audio download. This will download the AI-generated script.",
        inhoudsopgave: "Table of Contents",
        taak: "Task",
        eigenaar: "Owner",
        deadline: "Deadline",
        sentimentSummary: "Sentiment Summary",
        sentimentConclusion: "Overall Conclusion",
        sentimentOverall: "Overall Sentiment Analysis",
        keywordExplanation: "Explanation for '{keyword}'",
        fetchingExplanation: "Fetching explanation...",
        close: "Close",
        uploadTemplate: "Upload Template",
        templateUploaded: "Template: {name}",
        clearTemplate: "Clear template",
        pptTemplateNote: "Note: AI images are disabled when using a custom template.",
        listenAlongTitle: "Listen along with podcasts and YouTube",
        listenAlongBody: "Use RecapSmart to listen along to podcasts and YouTube videos. Great for extra explanations and getting more out of any show: enable system audio, play the video or podcast, and let RecapSmart transcribe and summarize automatically.",
        landingHeroSubtitle: "Transform your meetings, webinars and conversations into professional documents, presentations and insights with AI",
        waitlistTitle: "📋 Access by Invitation",
        waitlistLead: "RecapSmart is currently available by invitation only. Join the waitlist!",
        emailPlaceholder: "your@email.com",
        waitlistSignUp: "Join",
        waitlistMoreInfo: "More about the waitlist",
        aboutAiTitle: "🤖 About AI & API Key",
        aboutAiBody: "RecapSmart uses the Google Gemini API; for that we need an API key. RecapSmart works with your key: it’s free, no charge. The key is yours — and that’s why RecapSmart can be so affordable.",
        haveAccessLead: "Already have access? Log in to get started",
        loginNow: "Log in",
        featuresTitle: "Perfect For:",
        featureRecordingTitle: "🎙️ Smart Recording",
        featureRecordingDesc: "Record meetings, webinars and conversations with your microphone and system audio. Automatic transcription in Dutch or English.",
        featureAIAnalysisTitle: "📝 AI Analysis",
        featureAIAnalysisDesc: "Generate summaries, FAQs, key learnings and follow-up questions automatically with Google Gemini AI.",
        featurePresentationsTitle: "📊 Presentations",
        featurePresentationsDesc: "Create professional PowerPoint presentations with AI-generated content and images.",
        featureChatTitle: "💬 Chat & Questions",
        featureChatDesc: "Ask questions about your transcript and get detailed answers. Voice input supported.",
        featurePodcastTitle: "🎧 Podcast Scripts",
        featurePodcastDesc: "Generate podcast scripts and content from your meetings. Perfect for content creators.",
        featurePrivacyTitle: "🔒 Privacy & Anonymization",
        featurePrivacyDesc: "Automatic anonymization of names and sensitive information. Configurable rules for your organization.",
        privacyTitle: "🔒 Full Privacy Guarantee",
        privacyLead: "Important: Your sessions are NOT stored in our database. All data stays fully local on your device.",
        privacyItemRecordings: "🎙️ Recordings stay local",
        privacyItemTranscripts: "📝 Transcripts are private",
        privacyItemAIOutput: "🤖 AI output only for you",
        privacyItemApiKeyLocal: "🔑 API key stored locally",
        privacyItemNoServers: "🌐 No data to our servers",
        privacyItemWeStoreNothing: "✅ We store nothing at all",
        privacyItemNoVideo: "🎥 No video is recorded",
        privacyItemAudioStored: "🔊 Audio files are stored locally",
        privacyFootnote: "Your privacy comes first. We cannot see, store or use your sessions.",
        useCasesTitle: "💼 Perfect For:",
        useCasesMgmtTitle: "Management & Leadership",
        useCasesMgmt1: "Project managers and team leads",
        useCasesMgmt2: "Product owners and product managers",
        useCasesMgmt3: "Executives and CEOs (for strategic meetings and reporting)",
        useCasesMgmt4: "Sales managers and account managers (for customer talks and pitches)",
        useCasesAdviceTitle: "Advisory & Consulting",
        useCasesAdvice1: "Consultants and advisors",
        useCasesAdvice2: "Support consultants",
        useCasesAdvice3: "HR professionals and recruiters (for interviews and onboarding)",
        useCasesAdvice4: "Financial advisors and auditors (for compliance and reports)",
        useCasesCreationTitle: "Creation & Communication",
        useCasesCreation1: "Content creators and journalists",
        useCasesCreation2: "Marketers and PR specialists (for brainstorms and campaigns)",
        useCasesCreation3: "Webinar hosts and trainers",
        useCasesCreation4: "Podcasters and vloggers (for recording and editing)",
        useCasesResearchTitle: "Research & Analysis",
        useCasesResearch1: "Researchers and academics",
        useCasesResearch2: "Legal professionals",
        useCasesResearch3: "Accountants and bookkeepers",
        useCasesResearch4: "Data analysts and BI researchers (for data sessions and insights)",
        howItWorksTitle: "🔄 How It Works:",
        hiwStep1Title: "Record",
        hiwStep1Desc: "Start a recording of your meeting or upload a transcript",
        hiwStep2Title: "AI Processing",
        hiwStep2Desc: "AI analyzes and generates content based on your input",
        hiwStep3Title: "Result",
        hiwStep3Desc: "Download your documents, presentations and insights",
        ctaTitle: "🚀 Ready to Start?",
        ctaLead: "Log in and discover how RecapSmart can transform your workflow. Save hours on manual notes and documentation.",
        listening: "Listening...",
        speaking: "Speak your question...",
        startListening: "Start speech recognition",
        stopListening: "Stop speech recognition",
        powerpointOptions: "PowerPoint Options",
        useCustomTemplate: "Use custom template",
        selectTemplate: "Select template",
        maxSlides: "Maximum slides",
        presentationLanguage: "Presentation language",
        generatePresentation: "Generate presentation",
        cancel: "Cancel",
        setupApiKey: "Setup API Key",
        howToGetApiKey: "How to get a Google Gemini API Key?",
        apiKeyStep1: "Go to Google MakerSuite",
        apiKeyStep2: "Sign in with your Google account",
        apiKeyStep3: "Click 'Create API Key'",
        apiKeyStep4: "Copy the generated key",
        openGoogleMakerSuite: "Open Google MakerSuite",
        enterApiKey: "Enter your API Key",
        apiKeyRequired: "API Key is required",
        apiKeyInvalid: "API Key is invalid",
        validating: "Validating...",
        saveApiKey: "Save API Key",
        privacyNote: "Privacy Note",
        apiKeyPrivacy: "Your API key is only stored locally on your device and is never sent to our servers.",
        recording: "Recording",
        paused: "Paused",
        recordingInProgress: "Recording in progress...",
        recordingPaused: "Recording paused",
        recordingActive: "Recording active",
    }
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
  const [status, setStatus] = useState<RecordingStatus>(RecordingStatus.IDLE);
  // `language` is for the content (what's spoken), `uiLang` is for the app chrome
  const [language, setLanguage] = useState<'nl' | 'en' | null>(null);
  const [uiLang, setUiLang] = useState<'nl' | 'en'>('en');
  
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

  // Ensure audio context is resumed on user gesture on iOS
  useEffect(() => {
    const resumeAudioContext = () => {
      const AudioContextClass: any = (window as any).AudioContext || (window as any).webkitAudioContext;
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
    window.addEventListener('touchend', resumeAudioContext, { passive: true } as any);
    window.addEventListener('click', resumeAudioContext);
    return () => {
      window.removeEventListener('touchend', resumeAudioContext);
      window.removeEventListener('click', resumeAudioContext);
    };
  }, []);

  // New analysis states
  const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordTopic[] | null>(null);
  const [sentimentAnalysisResult, setSentimentAnalysisResult] = useState<SentimentAnalysisResult | null>(null);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState<boolean>(false);
  const [presentationReport, setPresentationReport] = useState<string | null>(null);
  const [mindmapMermaid, setMindmapMermaid] = useState<string>('');
  const [mindmapSvg, setMindmapSvg] = useState<string>('');

  useEffect(() => {
    // Defer mermaid import until used to avoid type resolution issues
  }, [theme]);
  
  // PPT Template state
  const [pptTemplate, setPptTemplate] = useState<File | null>(null);
  const [showPptOptions, setShowPptOptions] = useState(false);
  
  // API Key state
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [hasDatabaseApiKey, setHasDatabaseApiKey] = useState(false);
  const [isValidatingApiKey, setIsValidatingApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // Cookie consent state
  const [showCookieConsent, setShowCookieConsent] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !window.localStorage.getItem('cookie_consent');
    }
    return true;
  });

  // Modal states
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSystemAudioHelp, setShowSystemAudioHelp] = useState(false);

  // Auth state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAdmin: false
  });

  // Admin state
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [apiKeyStoragePreference, setApiKeyStoragePreference] = useState<'local' | 'database'>('local');

  // Toast functie
  const displayToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);
      
      // Auto-hide na 5 seconden
      setTimeout(() => {
          setShowToast(false);
      }, 5000);
  };

  // API Key hashing functie voor veilige database opslag
  const hashApiKey = async (apiKey: string): Promise<string> => {
      // Gebruik Web Crypto API voor veilige hashing
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey + 'recapsmart_salt_2024'); // Salt voor extra beveiliging
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
  };

  // Encrypt/decrypt helpers voor DB-opslag van de plaintext key (client-side decryptable)
  const base64FromArrayBuffer = (buf: ArrayBuffer): string => {
    const bytes = new Uint8Array(buf);
    let str = '';
    for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
    return btoa(str);
  };
  const arrayBufferFromBase64 = (b64: string): ArrayBuffer => {
    const str = atob(b64);
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
    return buf.buffer;
  };
  const deriveAesKeyForUser = async (uid: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const passMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(uid + '|recapsmart_kek'),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('recapsmart_pbkdf2_salt_v1'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      passMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };
  const encryptApiKeyForUser = async (uid: string, key: string): Promise<string> => {
    const aesKey = await deriveAesKeyForUser(uid);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder().encode(key);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, enc);
    // Store as base64(iv + ciphertext)
    const combined = new Uint8Array(iv.byteLength + ct.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ct), iv.byteLength);
    return base64FromArrayBuffer(combined.buffer);
  };
  const decryptApiKeyForUser = async (uid: string, b64: string): Promise<string> => {
    const aesKey = await deriveAesKeyForUser(uid);
    const combined = new Uint8Array(arrayBufferFromBase64(b64));
    const iv = combined.slice(0, 12);
    const ct = combined.slice(12);
    const ptBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ct);
    return new TextDecoder().decode(ptBuf);
  };
  const [activeAdminTab, setActiveAdminTab] = useState<'waitlist' | 'users'>('waitlist');
  
  // Waitlist states
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlist, setWaitlist] = useState<any[]>([]);
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamsRef = useRef<MediaStream[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isProcessing = !!loadingText;


  
  const t = (key: keyof typeof translations['nl'], params?: Record<string, string | number>) => {
    let str = translations[uiLang][key] || translations['en'][key];
    if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
            str = str.replace(`{${paramKey}}`, String(paramValue));
        });
    }
    return str;
  };

  // --- PERSISTENCE & THEME ---
    useEffect(() => {
        const savedLang = localStorage.getItem('uiLang') as 'nl' | 'en' | null;
        if (savedLang) setUiLang(savedLang);
        
        // Laad API key uit localStorage of database
        const savedApiKey = localStorage.getItem('recapsmart_api_key');
        if (savedApiKey) {
            setApiKey(savedApiKey);
            setApiKeyStoragePreference('local');
            setHasDatabaseApiKey(false); // Reset database flag when loading from local storage
        }

        // Laad theme uit localStorage en pas direct toe
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            // Pas theme direct toe
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.body.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
            }
        }
    }, []);

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
                            isAdmin: userData.isAdmin
                        });
                        
                        // Load users if admin
                        if (userData.isAdmin) {
                            // Bypass admin guard immediately after auth state change to avoid stale state race
                            await loadUsers({ bypassAdminCheck: true });
                            await loadWaitlist({ bypassAdminCheck: true });
                        }
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                    setAuthState({
                        user: null,
                        isLoading: false,
                        isAdmin: false
                    });
                }
            } else {
                // User is signed out
                setAuthState({
                    user: null,
                    isLoading: false,
                    isAdmin: false
                });
            }
        });

        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            if (authState.isLoading) {
                console.log('Auth timeout, setting loading to false');
                setAuthState(prev => ({ ...prev, isLoading: false }));
            }
        }, 5000); // 5 second timeout
        
        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        console.log('Theme effect running, theme:', theme);
        if (theme === 'dark') {
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
            console.log('Removed dark class from document and body, set data-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('uiLang', uiLang);
    }, [uiLang]);

    // Effect voor admin panel beveiliging
    useEffect(() => {
        if (showAdminPanel && (!authState.user || !authState.isAdmin)) {
            setShowAdminPanel(false);
            displayToast('Admin toegang ingetrokken. Panel gesloten.', 'info');
        }
    }, [authState.user, authState.isAdmin, showAdminPanel]);

  const cleanupStreams = useCallback(() => {
    if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
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
    setShowApiKeyModal(false);
    setApiKeyError(null);
    setHasDatabaseApiKey(false);


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
    utterance.lang = language === 'nl' ? 'nl-NL' : 'en-US';
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
        console.error('Chat TTS SpeechSynthesis Error:', e.error);
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [language]);


  const submitMessage = useCallback(async (message: string) => {
    if (!message.trim() || isChatting) return;

    if (!apiKey && !hasDatabaseApiKey) {
        setShowApiKeyModal(true);
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
        if (isTTSEnabled) speak(fullResponse);

    } catch (err: any) {
        console.error("Fout bij chatten:", err);
        const errorMsg = `Chat error: ${err.message || 'Unknown error'}`;
        setChatHistory(prev => prev.map((msg, i) => i === prev.length - 1 ? { ...msg, text: errorMsg } : msg));
    } finally { setIsChatting(false); }
  }, [isChatting, chatHistory, transcript, isTTSEnabled, speak, apiKey, hasDatabaseApiKey]);
  
  const handleSendMessage = useCallback(async () => {
    const message = chatInput.trim();
    if (message) {
      if (!apiKey && !hasDatabaseApiKey) {
        setShowApiKeyModal(true);
        return;
      }
      setChatInput('');
      await submitMessage(message);
    }
  }, [chatInput, submitMessage, apiKey, hasDatabaseApiKey]);
  
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition();
        // By setting continuous to false, the recognition service stops after each utterance or timeout.
        // We then use the `onend` event to manually restart it, creating a more robust "continuous" experience
        // that is less prone to browser-specific timeout errors like 'no-speech'.
        recognition.continuous = false;
        recognition.interimResults = true; // Enable interim results for preview
        recognition.lang = language === 'nl' ? 'nl-NL' : 'en-US';

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
                if (apiKey || hasDatabaseApiKey) {
                    submitMessage(finalTranscript.trim());
                } else {
                    setShowApiKeyModal(true);
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
  }, [language, t, submitMessage]);

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
    if (!language) {
        setError(t("selectLangFirst"));
        return;
    }
    setStatus(RecordingStatus.GETTING_PERMISSION);
    setError(null);
    setDuration(0);

    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
      const supportsDisplay = typeof (navigator.mediaDevices as any).getDisplayMedia === 'function';

      let displayStream: MediaStream | null = null;
      if (supportsDisplay && !isIOS) {
        try {
          displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: { sampleRate: 44100, channelCount: 2 } as MediaTrackConstraints
          } as DisplayMediaStreamConstraints);
        } catch (dsErr) {
          console.warn('Display capture not available or denied. Falling back to microphone only.');
        }
      }

      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: { sampleRate: 44100, channelCount: 2 } as MediaTrackConstraints,
          video: false
        });
      } catch (micErr) {
        console.warn('Microphone access denied.');
      }

      streamsRef.current = [displayStream, micStream].filter(Boolean) as MediaStream[];

      // Create AudioContext in a mobile/iOS friendly way
      const AudioContextClass: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      const newAudioContext = new AudioContextClass();
      // iOS requires explicit resume after a user gesture
      if (newAudioContext.state === 'suspended') {
        try { await newAudioContext.resume(); } catch {}
      }
      audioContextRef.current = newAudioContext;

      const destination = newAudioContext.createMediaStreamDestination();
      const analyser = newAudioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      let hasAudio = false;

      if (displayStream) {
        const displayAudioTracks = displayStream.getAudioTracks();
        if (displayAudioTracks.length > 0) {
          const displaySource = newAudioContext.createMediaStreamSource(new MediaStream(displayAudioTracks));
          displaySource.connect(destination);
          displaySource.connect(analyser);
          hasAudio = true;
          console.log('Display audio connected to analyser');
        }
      }

      if (micStream) {
        const micAudioTracks = micStream.getAudioTracks();
        if (micAudioTracks.length > 0) {
          const micSource = newAudioContext.createMediaStreamSource(new MediaStream(micAudioTracks));
          micSource.connect(destination);
          micSource.connect(analyser);
          hasAudio = true;
          console.log('Microphone audio connected to analyser');
        }
      }

      if (!hasAudio) {
        throw new Error(t("noDevices"));
      }

      const combinedStream = destination.stream;

      // Pick a mimeType supported by the current browser (iOS Safari does not support audio/webm)
      let selectedType = '';
      try {
        const candidates = [
          'audio/webm; codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/aac',
          'audio/mpeg'
        ];
        for (const type of candidates) {
          if ((window as any).MediaRecorder && (MediaRecorder as any).isTypeSupported && (MediaRecorder as any).isTypeSupported(type)) {
            selectedType = type;
            break;
          }
        }
      } catch {}

      const recorder = selectedType
        ? new MediaRecorder(combinedStream, { mimeType: selectedType })
        : new MediaRecorder(combinedStream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const derivedType = recorder.mimeType || (audioChunksRef.current[0]?.type || 'audio/webm');
        const audioBlob = new Blob(audioChunksRef.current, { type: derivedType });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setStatus(RecordingStatus.STOPPED);
        cleanupStreams();
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      };

      recorder.start();
      setStatus(RecordingStatus.RECORDING);

      // Start de audio visualisatie
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      drawVisualizer();

      timerIntervalRef.current = window.setInterval(() => setDuration(prev => prev + 1), 1000);

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
      cleanupStreams();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.pause();
        setStatus(RecordingStatus.PAUSED);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
        mediaRecorderRef.current.resume();
        setStatus(RecordingStatus.RECORDING);
        
        // Start de audio visualisatie opnieuw
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
        drawVisualizer();
        
        timerIntervalRef.current = window.setInterval(() => setDuration(prev => prev + 1), 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (status === RecordingStatus.RECORDING || status === RecordingStatus.PAUSED)) {
      mediaRecorderRef.current.stop();
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
                    } catch (error: any) {
                        console.error('PDF parsing error:', error);
                        reject(new Error(`PDF verwerking mislukt: ${error.message || 'onbekende fout'}`));
                    }
                };
                reader.onerror = () => reject(new Error('PDF lezen mislukt'));
                reader.readAsArrayBuffer(file);
            } catch (error: any) {
                reject(new Error(`PDF library laden mislukt: ${error.message || 'onbekende fout'}`));
            }
        });
    };

    // DOCX ondersteuning verwijderd - te complex om te implementeren

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

    const extractTextFromHTML = async (file: File): Promise<string> => {
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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!language) {
            setError(t("selectLangToUpload"));
            return;
        }

        setError(null);
        setAnonymizationReport(null);
        setLoadingText('Bestand verwerken...');

        try {
            let text = '';
            const fileType = file.type.toLowerCase();
            const fileName = file.name.toLowerCase();

            // PDF bestanden
            if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
                text = await extractTextFromPDF(file);
            }
            // Word documenten (.docx) - niet meer ondersteund
            // else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
            //     text = await extractTextFromDocx(file);
            // }
            // RTF bestanden
            else if (fileType === 'application/rtf' || fileName.endsWith('.rtf')) {
                text = await extractTextFromRTF(file);
            }
            // HTML bestanden
            else if (fileType === 'text/html' || fileName.endsWith('.html') || fileName.endsWith('.htm')) {
                text = await extractTextFromHTML(file);
            }
            // Markdown bestanden
            else if (fileType === 'text/markdown' || fileName.endsWith('.md')) {
                text = await extractTextFromMarkdown(file);
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
                    throw new Error('Bestandsformaat wordt niet ondersteund. Probeer PDF, RTF, HTML, MD of TXT.');
                }
            }

            if (!text.trim()) {
                throw new Error('Geen tekst gevonden in het bestand.');
            }

            setTranscript(text);
            setStatus(RecordingStatus.FINISHED);
            // Increment user session count on successful finish
            try {
              if (authState.user) {
                await updateDoc(doc(db, 'users', authState.user.uid), {
                  sessionCount: increment(1),
                  updatedAt: serverTimestamp()
                });
                setAuthState(prev => prev.user ? ({ ...prev, user: { ...prev.user, sessionCount: (prev.user.sessionCount || 0) + 1 } }) : prev);
                if (authState.isAdmin) {
                  loadUsers({ bypassAdminCheck: true });
                }
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
    


    const handleAnonymizeTranscript = async () => {
        // Controleer of er anonimisatie regels zijn ingesteld
        if (anonymizationRules.length === 0 || anonymizationRules.every(rule => !rule.originalText.trim())) {
            setError('Geen anonimisatie regels ingesteld. Stel eerst de regels in via het instellingen scherm.');
            setShowSettingsModal(true);
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
                setPodcastScript(''); setChatHistory([]);
                setKeywordAnalysis(null);
                setSentimentAnalysisResult(null);
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

  const getAnalysisPrompt = (type: ViewType, lang: 'nl' | 'en'): string => {
    switch (type) {
        case 'summary':
            return lang === 'nl'
                ? `Vat de volgende tekst uitgebreid samen. Begin de samenvatting met een pakkende en relevante titel in het Nederlands, gevolgd door een nieuwe regel. De samenvatting moet alle belangrijke punten en hoofdideeën behandelen, de informatie condenseren tot een beknopt en gemakkelijk te begrijpen formaat en relevante details bevatten. Sluit af met citaten, actiepunten en beslissingen indien aanwezig.`
                : `Provide a comprehensive summary of the given text. Start the summary with a catchy and relevant title in English, followed by a new line. The summary should cover all the key points and main ideas, condensing the information into a concise and easy-to-understand format. End with quotes, action points, and decisions if any are present.`;
        case 'faq':
            return lang === 'nl'
                ? `Maak van het onderstaande transcript 10 FAQ-items (vraag + antwoord). Geef een belangrijkheidsbeoordeling van 1-5 sterren (halve sterren toegestaan, ★½). Plaats de sterren voor elke vraag. Houd vragen kort, antwoorden beknopt en feitelijk. Sorteer van meest naar minst belangrijk. Formaat:\n★★★★★ Vraag?\nAntwoord: …`
                : `From the transcript below, create 10 FAQ items (question + answer). Rank importance 1–5 stars, allow half-stars (★½). Put the stars before each question. Keep questions short, answers concise and factual. Order from most to least important. Format:\n★★★★★ Question?\nAnswer: …`;
        case 'learning':
            return lang === 'nl'
                ? `Maak van de onderstaande tekst een gestructureerd leerdocument met: Belangrijkste leerpunten, beoordeeld met 1-5 sterren (halve sterren toegestaan, ★½) voor belangrijkheid. Korte uitleg voor elk leerpunt. Gebruik duidelijke koppen en opsommingstekens. Sorteer van meest naar minst belangrijk.`
                : `From the text below, create a structured learning document with: Key takeaways, ranked 1–5 stars, allow half-stars (★½) for importance. Short explanations for each takeaway. Use clear headings and bullet points. Order from most to least important.`;
        case 'followUp':
            return lang === 'nl'
                ? `Genereer op basis van het onderstaande transcript 10 relevante vervolgvragen die in een volgende meeting gesteld kunnen worden om dieper op de onderwerpen in te gaan of openstaande punten te verhelderen. Formatteer de output als een genummerde lijst.`
                : `Based on the transcript below, generate 10 relevant follow-up questions that could be asked in a subsequent meeting to delve deeper into the topics or clarify outstanding points. Format the output as a numbered list.`;
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
        setShowApiKeyModal(true);
        return;
    }
    
    setLoadingText(t('generating', { type }));
    
    try {
        const prompt = getAnalysisPrompt(type, language!);
        if (!prompt) throw new Error('Invalid analysis type');

        const fullPrompt = `${prompt}\n\nHere is the text:\n\n${transcript}`;

        const ai = new GoogleGenAI({ apiKey: apiKey });
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });

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

    if (!apiKey && !hasDatabaseApiKey) {
        setShowApiKeyModal(true);
        setIsFetchingExplanation(false);
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const prompt = language === 'en'
          ? `Provide a short and clear explanation of the term '${keyword}' in the context of the following transcript. Return only the explanation, no extra titles or formatting. Keep it concise. Transcript: --- ${transcript} ---`
          : `Geef een korte en duidelijke uitleg van de term '${keyword}' in de context van de volgende transcriptie. Geef alleen de uitleg terug, zonder extra titels of opmaak. Houd het beknopt. Transcript: --- ${transcript} ---`;
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
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
    if (keywordAnalysis) return;

    if (!transcript.trim()) {
        setKeywordAnalysis([]);
        setError(t('transcriptEmpty'));
        return;
    }

    if (!apiKey && !hasDatabaseApiKey) {
        setShowApiKeyModal(true);
        return;
    }
    
    setLoadingText(t('generating', { type: t('keywordAnalysis') }));
    setError(null);
    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const prompt = language === 'en'
          ? `Analyze the following transcript. Identify the most frequent and important keywords. Group these into 5-7 relevant topics. For each topic, provide a short descriptive name and a list of associated keywords. Return JSON only. Transcript: --- ${transcript} ---`
          : `Analyseer de volgende transcriptie. Identificeer de meest voorkomende en belangrijke trefwoorden. Groepeer deze trefwoorden in 5-7 relevante onderwerpen. Geef voor elk onderwerp een korte, beschrijvende naam en een lijst met de bijbehorende trefwoorden. Geef alleen het JSON-object terug. Transcript: --- ${transcript} ---`;

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
    
    if (!apiKey && !hasDatabaseApiKey) {
        setShowApiKeyModal(true);
        return;
    }
    
    setIsAnalyzingSentiment(true);
    setLoadingText(t('analyzingSentiment'));
    setError(null);

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const prompt = language === 'en'
          ? `Analyze the sentiment of the following transcript. Return a JSON object with: 1. 'taggedText': the full transcript with positive parts wrapped in [POS]...[/POS], negative in [NEG]...[/NEG], neutral in [NEU]...[/NEU]. 2. 'summary': a short factual summary of the sentiments. 3. 'conclusion': an overall conclusion about the tone and atmosphere. Transcript: --- ${transcript} ---`
          : `Analyseer het sentiment van de volgende transcriptie. Geef een JSON-object terug. Het object moet bevatten: 1. 'taggedText': de volledige transcriptie met positieve sentimentdelen verpakt in [POS]...[/POS], negatieve in [NEG]...[/NEG], en neutrale in [NEU]...[/NEU]. 2. 'summary': een korte, feitelijke samenvatting van de gevonden sentimenten (bijv. "Het gesprek was overwegend positief met enkele negatieve punten over X."). 3. 'conclusion': een algemene conclusie over de algehele toon en sfeer van het gesprek. Transcript: --- ${transcript} ---`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                taggedText: { type: Type.STRING },
                summary: { type: Type.STRING },
                conclusion: { type: Type.STRING }
            },
            required: ["taggedText", "summary", "conclusion"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema }
        });

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
    setActiveView('podcast');
    if (podcastScript) return;
    if (!transcript.trim()) {
        setError(t("transcriptEmpty"));
        return;
    }
    if (!apiKey) {
        setShowApiKeyModal(true);
        return;
    }
    
    setLoadingText(t('podcastGenerating'));
    setError(null);

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const prompt = language === 'en'
            ? `You are a podcast scriptwriter for the 'RecapSmart Podcast', hosted by 'Albert'. Use the transcript below to create an engaging, natural-sounding script that can be spoken aloud directly.

Structure:
1.  [INTRO]: Welcome listeners and introduce the main topic of today concisely.
2.  [CORE]: Go deeper using the key discussions, findings and insights from the transcript to form a compelling story or clear analysis.
3.  [CLOSING]: Summarize the key points. Give concrete, actionable tips or action items. End with a friendly sign-off.

Important:
- Write as a continuous, natural spoken narrative.
- Do not include headings like "[INTRO]" in the output.
- Output only the text Albert will speak, with no extra formatting.

Here is the transcript:
---
${transcript}
---`
            : `Je bent een podcast scriptschrijver voor de 'RecapSmart Podcast', gepresenteerd door 'Albert'. Gebruik de volgende transcriptie om een levendig en boeiend podcastscript te maken dat direct kan worden uitgesproken.

**Script Structuur:**
1.  **[INTRO]:** Albert heet de luisteraars welkom en introduceert het hoofdonderwerp van vandaag op een pakkende manier.
2.  **[DE KERN]:** Duik dieper in de materie. Gebruik de belangrijkste discussies, bevindingen en inzichten uit de transcriptie om een boeiend verhaal of een duidelijke analyse te vormen.
3.  **[DE AFSLUITING]:** Vat de belangrijkste punten samen. Geef concrete, bruikbare tips of actiepunten mee aan de luisteraar. Sluit af met een krachtige quote uit de discussie en een vriendelijke afscheidsgroet.

**Belangrijk:**
- Schrijf de tekst als een doorlopend, natuurlijk sprekend verhaal.
- Gebruik geen headings zoals "[INTRO]". De structuur moet impliciet zijn in de flow van de tekst.
- De output moet alleen de tekst zijn die Albert zal uitspreken, zonder extra opmaak of instructies.

Hier is de transcriptie:
---
${transcript}
---`;
        
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setPodcastScript(response.text);

    } catch (err: any) {
        console.error("Fout bij genereren podcast:", err);
        setError(`${t("podcastFailed")}: ${err.message || t("unknownError")}`);
        setPodcastScript('');
    } finally {
        setLoadingText('');
    }
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
            if (slideData.base64Image) {
                const imgW: PptxGenJS.Coord = '40%', imgH: PptxGenJS.Coord = '60%';
                textW = '48%';
                textX = '52%';
                slide.addImage({ data: `data:image/png;base64,${slideData.base64Image}`, x: '5%', y: '20%', w: imgW, h: imgH, sizing: { type: 'contain', w: imgW, h: imgH } });
            }
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

  const handleSaveApiKey = async (newApiKey: string) => {
    try {
      // Valideer de API key
      const ai = new GoogleGenAI({ apiKey: newApiKey });
      await ai.models.generateContent({ 
        model: 'gemini-2.5-flash', 
        contents: 'Test' 
      });
      
      if (apiKeyStoragePreference === 'database' && authState.user) {
        // Veilige database opslag
        try {
          // Hash + encrypt voor opslag
          const hashedApiKey = await hashApiKey(newApiKey);
          const encryptedApiKey = await encryptApiKeyForUser(authState.user.uid, newApiKey);
          
          // Update gebruiker document met gehashte + versleutelde API key
          await updateDoc(doc(db, 'users', authState.user.uid), {
            hashedApiKey,
            encryptedApiKey,
            apiKeyLastUpdated: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Houd key in-memory voor huidige sessie (geen localStorage)
          setApiKey(newApiKey);
          setHasDatabaseApiKey(true);
          localStorage.removeItem('recapsmart_api_key');
          displayToast('API key veilig opgeslagen in database!', 'success');
        } catch (dbError) {
          console.error('Database opslag mislukt:', dbError);
                      displayToast('Database opslag mislukt, maar API key werkt wel. Opgeslagen in browser.', 'info');
          // Fallback naar lokale opslag
          setApiKey(newApiKey);
          localStorage.setItem('recapsmart_api_key', newApiKey);
        }
      } else {
        // Lokale opslag (browser)
        setApiKey(newApiKey);
        setHasDatabaseApiKey(false); // Reset database flag when using local storage
        localStorage.setItem('recapsmart_api_key', newApiKey);
                    displayToast('API key opgeslagen in browser!', 'success');
      }
      
      setShowApiKeyModal(false);
      setApiKeyError(null);
    } catch (err: any) {
      console.error('API key validatie mislukt:', err);
      setApiKeyError('API key validatie mislukt. Controleer of de key correct is.');
    }
  };

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
    setShowSettingsModal(false);
  };

  // --- API KEY MANAGEMENT ---
  const deleteApiKeyFromDatabase = async () => {
    if (!authState.user) return;
    await updateDoc(doc(db, 'users', authState.user.uid), {
      hashedApiKey: deleteField(),
      encryptedApiKey: deleteField(),
      apiKeyLastUpdated: deleteField(),
      updatedAt: serverTimestamp()
    });
    setHasDatabaseApiKey(false);
    displayToast('API key verwijderd uit database.', 'success');
  };

  const deleteApiKeyFromLocal = () => {
    localStorage.removeItem('recapsmart_api_key');
    setApiKey('');
    displayToast('Lokale API key verwijderd.', 'success');
  };

  const switchApiKeyStorage = (target: 'local' | 'database') => {
    setApiKeyStoragePreference(target);
    if (target === 'local') {
      displayToast('Opslag ingesteld op Lokaal (browser).', 'info');
    } else {
      if (!authState.user) {
        displayToast('Log in om sleutel in database op te slaan.', 'error');
      } else {
        displayToast('Opslag ingesteld op Database. Sla een nieuwe key op om te synchroniseren.', 'info');
      }
    }
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
      console.log('Attempting login for:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Firebase Auth successful, user UID:', user.uid);
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        console.log('User data found:', userData);
        
        if (!userData.isActive) {
          throw new Error('Account is disabled. Contact administrator.');
        }
        
        // Update last login
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: serverTimestamp()
        });
        
        console.log('Setting auth state for user:', userData.email);
        setAuthState({
          user: { ...userData, uid: user.uid },
          isLoading: false,
          isAdmin: userData.isAdmin
        });
        setShowLoginModal(false);
        
        // Controleer of gebruiker een API key heeft (lokaal of in database)
        if (!apiKey) {
          const localKey = localStorage.getItem('recapsmart_api_key');
          if (localKey) {
            setApiKey(localKey);
            setHasDatabaseApiKey(false);
            setApiKeyStoragePreference('local');
            displayToast('Lokale API key geladen.', 'success');
          } else if (userData.hashedApiKey || (userData as any).encryptedApiKey) {
            // DB bevat sleutel. Probeer te decrypten naar lokale runtime-geheugen
            try {
              if ((userData as any).encryptedApiKey) {
                const plaintext = await decryptApiKeyForUser(user.uid, (userData as any).encryptedApiKey);
                setApiKey(plaintext);
              } else {
                // fallback: geen encrypted versie; markeer slechts presence
                setApiKey('');
              }
              setHasDatabaseApiKey(true);
              setApiKeyStoragePreference('database');
              displayToast('API key geladen uit database. Klaar voor gebruik.', 'success');
            } catch (e) {
              console.error('Decrypt DB key failed', e);
              setHasDatabaseApiKey(true);
              setApiKey('');
              setApiKeyStoragePreference('database');
              displayToast('API key gevonden in database. Als iets faalt, vernieuw de key in Instellingen.', 'info');
            }
          } else {
            // Toon API key setup modal
            setTimeout(() => setShowApiKeyModal(true), 1000);
          }
        }
      } else {
        console.log('User document not found in Firestore, creating automatic document...');
        
        // Automatically create user document in Firestore
        const newUserData = {
          email: email,
          isActive: true,
          isAdmin: false, // Default to non-admin for security
          lastLogin: serverTimestamp(),
          sessionCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        try {
          await setDoc(doc(db, 'users', user.uid), newUserData);
          console.log('Automatically created user document for:', email);
          
          // Set auth state with new user data
          setAuthState({
            user: { ...newUserData, uid: user.uid },
            isLoading: false,
            isAdmin: false
          });
          setShowLoginModal(false);
          
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
        throw new Error(`Inloggen mislukt: ${error.message}`);
      }
    }
  };

  const handleCreateAccount = async (email: string, password: string) => {
    try {
      console.log('Creating account for:', email);
      
      // Check if user exists in database
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Email not found in system. Contact administrator to be added.');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (!userData.isActive) {
        throw new Error('Account is disabled. Contact administrator.');
      }
      
      console.log('User found in database:', userData);
      
      // Check if user already has a UID (means Firebase Auth account exists)
      if (userData.uid) {
        console.log('User already has UID, checking if Firebase Auth account exists...');
        try {
          // Try to sign in to see if account exists
          await signInWithEmailAndPassword(auth, email, 'dummy-password');
          console.log('Firebase Auth account exists, cannot create new one');
          throw new Error('Dit email adres is al in gebruik in Firebase. Probeer in te loggen in plaats van een account aan te maken.');
        } catch (authError: any) {
          if (authError.code === 'auth/wrong-password') {
            // Account exists but wrong password - this is what we want
            console.log('Firebase Auth account exists, cannot create new one');
            throw new Error('Dit email adres is al in gebruik in Firebase. Probeer in te loggen in plaats van een account aan te maken.');
          } else if (authError.code === 'auth/user-not-found') {
            // Account doesn't exist - this is also fine
            console.log('No Firebase Auth account found, will create new one...');
          } else if (authError.code === 'auth/invalid-credential') {
            // Account might exist but is corrupted - try to create new one
            console.log('Invalid credential error, will attempt to create new Firebase Auth account...');
          } else {
            console.log('Unexpected auth error:', authError);
            throw authError;
          }
        }
      } else {
        console.log('No UID found, safe to create new Firebase Auth account...');
      }
      
      console.log('Creating Firebase Auth account...');
      // Create Firebase auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Firebase Auth account created, UID:', user.uid);
      
      // Update user document with UID
      await updateDoc(doc(db, 'users', userDoc.id), {
        uid: user.uid,
        updatedAt: serverTimestamp()
      });
      
      console.log('User document updated with new UID:', user.uid);
      
      console.log('User document updated with UID');
      
      setAuthState({
        user: { ...userData, uid: user.uid },
        isLoading: false,
        isAdmin: userData.isAdmin
      });
      setShowLoginModal(false);
      
      console.log('Account creation successful!');
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
        isAdmin: false
      });
      reset();
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const loadUsers = async (options?: { bypassAdminCheck?: boolean }) => {
    const bypass = options?.bypassAdminCheck === true;
    // Controleer of gebruiker admin is
    if (!bypass && (!authState.user || !authState.isAdmin)) {
      console.error('Unauthorized access to loadUsers');
      displayToast('Geen toegang tot gebruikersbeheer. Admin rechten vereist.', 'error');
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          uid: doc.id,
          email: data.email,
          isActive: data.isActive,
          isAdmin: data.isAdmin,
          lastLogin: data.lastLogin?.toDate() || null,
          sessionCount: data.sessionCount || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          hashedApiKey: data.hashedApiKey,
          apiKeyLastUpdated: data.apiKeyLastUpdated?.toDate()
        });
      });
      
      setUsers(usersData);
    } catch (error: any) {
      console.error('Load users error:', error);
              displayToast('Fout bij laden van gebruikers.', 'error');
    }
  };

  const addUser = async (email: string) => {
    // Controleer of gebruiker admin is
    if (!authState.user || !authState.isAdmin) {
      console.error('Unauthorized access to addUser');
      displayToast('Geen toegang tot gebruikersbeheer. Admin rechten vereist.', 'error');
      return;
    }

    try {
      const userRef = doc(collection(db, 'users'));
      await setDoc(userRef, {
        email,
        isActive: true,
        isAdmin: false,
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
    if (!authState.user || !authState.isAdmin) {
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
              displayToast('Fout bij bijwerken van gebruiker status.', 'error');
    }
  };

  const resetUserPassword = async (email: string) => {
    // Controleer of gebruiker admin is
    if (!authState.user || !authState.isAdmin) {
      console.error('Unauthorized access to resetUserPassword');
      displayToast('Geen toegang tot gebruikersbeheer. Admin rechten vereist.', 'error');
      return false;
    }

    try {
      await sendPasswordResetEmail(auth, email);
              displayToast(`Wachtwoord reset email verzonden naar ${email}`, 'success');
      return true;
    } catch (error: any) {
      console.error('Reset password error:', error);
              displayToast('Fout bij verzenden van wachtwoord reset email.', 'error');
      throw error;
    }
  };

  // Sync users between Firebase Auth and Firestore
      const syncUsersWithFirebase = async () => {
        // Controleer of gebruiker admin is
        if (!authState.user || !authState.isAdmin) {
          console.error('Unauthorized access to syncUsersWithFirebase');
          displayToast('Geen toegang tot gebruikersbeheer. Admin rechten vereist.', 'error');
          return;
        }

        try {
            console.log('Starting user synchronization...');
            
            // Get all users from Firestore
            const usersRef = collection(db, 'users');
            const querySnapshot = await getDocs(usersRef);
            
            let syncCount = 0;
            
            for (const docSnapshot of querySnapshot.docs) {
                const userData = docSnapshot.data();
                const uid = docSnapshot.id;
                
                // Check if user has a UID field
                if (!userData.uid) {
                    console.log(`User ${userData.email} missing UID, updating...`);
                    
                    try {
                        await updateDoc(doc(db, 'users', uid), {
                            uid: uid,
                            updatedAt: serverTimestamp()
                        });
                        syncCount++;
                    } catch (updateError) {
                        console.error(`Error updating UID for ${userData.email}:`, updateError);
                    }
                }
            }
            
            if (syncCount > 0) {
                console.log(`Synchronized ${syncCount} users`);
                await loadUsers(); // Refresh user list
            } else {
                console.log('All users are already synchronized');
            }
            
            return syncCount;
        } catch (error: any) {
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
    if (!bypass && (!authState.user || !authState.isAdmin)) {
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
    } catch (error) {
      console.error('Error loading waitlist:', error);
              displayToast('Fout bij laden van wachtlijst.', 'error');
    }
  };

  const activateWaitlistUsers = async () => {
    // Controleer of gebruiker admin is
    if (!authState.user || !authState.isAdmin) {
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
          // Add to users collection
          await addDoc(collection(db, 'users'), {
            email: userData.email,
            isActive: true,
            isAdmin: false,
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
      console.error('Error activating users:', error);
              displayToast('Fout bij activeren van gebruikers.', 'error');
    }
  };

  const removeFromWaitlist = async (userId: string) => {
    // Controleer of gebruiker admin is
    if (!authState.user || !authState.isAdmin) {
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
    if (!authState.user || !authState.isAdmin) {
      console.error('Unauthorized access to sendInvitationEmail');
      displayToast('Geen toegang tot email functies. Admin rechten vereist.', 'error');
      return;
    }

    try {
      // In een echte app zou je hier een email service gebruiken
      // Voor nu tonen we een popup met de email content
      const emailContent = `Beste gebruiker,

Je bent uitgenodigd om je aan te melden bij RecapSmart!

Je kunt nu een account aanmaken op: ${window.location.origin}

Met vriendelijke groet,
Het RecapSmart Team`;

      // Toon email content in een popup
      const emailWindow = window.open('', '_blank', 'width=600,height=400');
      if (emailWindow) {
        emailWindow.document.write(`
          <html>
            <head><title>Uitnodigingsmail</title></title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              .header { background: #06b6d4; color: white; padding: 20px; margin: -20px -20px 20px -20px; }
              .content { background: #f8fafc; padding: 20px; border-radius: 8px; }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📧 Uitnodigingsmail</h1>
            </div>
            <div class="content">
              <h3>Email naar: ${email}</h3>
              <pre style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 5px; border: 1px solid #e2e8f0;">${emailContent}</pre>
            </div>
            <div class="footer">
              <p><strong>Opmerking:</strong> In een productieomgeving wordt deze email automatisch verstuurd via een email service.</p>
              <p>Je kunt deze popup sluiten en de gebruiker handmatig uitnodigen.</p>
            </div>
          </body>
          </html>
        `);
      }
      
              displayToast(`Uitnodigingsmail succesvol voorbereid voor ${email}!`, 'success');
    } catch (error) {
      console.error('Error sending invitation email:', error);
              displayToast('Fout bij voorbereiden van uitnodigingsmail.', 'error');
    }
  };

  const sendInvitationEmails = async (userIds: string[]) => {
    // Controleer of gebruiker admin is
    if (!authState.user || !authState.isAdmin) {
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

      // Toon alle emails in één popup
      const emailContent = `Beste gebruikers,

Jullie zijn uitgenodigd om je aan te melden bij RecapSmart!

Jullie kunnen nu een account aanmaken op: ${window.location.origin}

Met vriendelijke groet,
Het RecapSmart Team`;

      const emailWindow = window.open('', '_blank', 'width=600,height=400');
      if (emailWindow) {
        emailWindow.document.write(`
          <html>
            <head><title>Uitnodigingsmails</title></title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              .header { background: #06b6d4; color: white; padding: 20px; margin: -20px -20px 20px -20px; }
              .content { background: #f8fafc; padding: 20px; border-radius: 8px; }
              .emails { background: white; padding: 15px; border-radius: 5px; border: 1px solid #e2e8f0; margin: 15px 0; }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📧 Uitnodigingsmails</h1>
            </div>
            <div class="content">
              <h3>Emails naar:</h3>
              <div class="emails">
                ${emails.map(email => `<div>• ${email}</div>`).join('')}
              </div>
              <h3>Email content:</h3>
              <pre style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 5px; border: 1px solid #e2e8f0;">${emailContent}</pre>
            </div>
            <div class="footer">
              <p><strong>Opmerking:</strong> In een productieomgeving worden deze emails automatisch verstuurd via een email service.</p>
              <p>Je kunt deze popup sluiten en de gebruikers handmatig uitnodigen.</p>
            </div>
          </body>
          </html>
        `);
      }
      
              displayToast(`${emails.length} uitnodigingsmails succesvol voorbereid!`, 'success');
    } catch (error) {
      console.error('Error sending invitation emails:', error);
              displayToast('Fout bij voorbereiden van uitnodigingsmails.', 'error');
    }
  };

  const checkApiKey = () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return false;
    }
    return true;
  };

  const handleGeneratePresentationWithOptions = async (options: { maxSlides: number; language: 'nl' | 'en'; useTemplate: boolean; templateFile?: File | null }) => {
    if (!transcript.trim()) {
        setError(t("transcriptEmpty"));
        return;
    }
    
    if (!apiKey) {
        setShowApiKeyModal(true);
        return;
    }
    
    setLoadingText(t('generatingPresentation'));
    setError(null);
    setPresentationReport(null);
    const useTemplate = options.useTemplate && options.templateFile !== null;

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const prompt = `Je bent een AI-expert in het creëren van professionele, gestructureerde en visueel aantrekkelijke zakelijke presentaties op basis van een meeting-transcript. Je taak is om de volgende content te genereren en te structureren in een JSON-object dat voldoet aan het verstrekte schema.

**Taal:** ${options.language === 'nl' ? 'Nederlands' : 'Engels'} - Alle titels en content moeten in deze taal zijn.

**Maximum aantal slides:** ${options.maxSlides} - Houd de presentatie binnen deze limiet.

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

**BELANGRIJK:** Houd alle titels en bullet points relatief kort en bondig. Zorg voor volledige, correcte data voor de to-do lijst. Respecteer de taal en het maximum aantal slides.

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

            for (const slide of allSlideContents) {
                if (slide.imagePrompt) {
                    try {
                        setLoadingText(t('generatingImageForSlide', { title: slide.title }));
                        const imageResponse: any = await ai.models.generateImages({ model: 'imagen-3.0-generate-002', prompt: `${slide.imagePrompt}, ${presentationData.imageStylePrompt}`, config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '16:9' } });
                        const candidate = imageResponse?.generatedImages?.[0] || imageResponse?.images?.[0] || null;
                        const base64 = candidate?.image?.imageBytes || candidate?.inlineData?.data || candidate?.bytes || null;
                        if (base64) (slide as any).base64Image = base64;
                    } catch (imgErr) { console.warn(`Could not generate image for slide "${slide.title}":`, imgErr); }
                }
            }
        }
        
        setLoadingText(t('finalizingPresentation'));
        const { fileName, slideCount } = await createAndDownloadPptx(presentationData, options.templateFile || null);
        setPresentationReport(t('presentationSuccess', { fileName, slideCount }));


    } catch (err: any) {
        console.error("Fout bij genereren presentatie:", err);
        setError(`${t("presentationFailed")}: ${err.message || t("unknownError")}`);
    } finally { setLoadingText(''); }
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
            setShowApiKeyModal(true);
            return;
        }
        
        const ai = new GoogleGenAI({ apiKey: apiKey });
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const base64Audio = await blobToBase64(audioBlob);
  
      const transcribePrompt = language === 'nl' ? 'Transcribeer deze audio-opname nauwkeurig. De gesproken taal is Nederlands.' : 'Transcribe this audio recording accurately. The spoken language is English.';
      const audioPart = { inlineData: { mimeType: 'audio/webm', data: base64Audio } };
      const textPart = { text: transcribePrompt };
      
      const transcribeResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [textPart, audioPart] } });
        setTranscript(transcribeResponse.text);
        setStatus(RecordingStatus.FINISHED);
        // Increment user session count on successful finish
        try {
          if (authState.user) {
            await updateDoc(doc(db, 'users', authState.user.uid), {
              sessionCount: increment(1),
              updatedAt: serverTimestamp()
            });
            // Optimistic local update
            setAuthState(prev => prev.user ? ({ ...prev, user: { ...prev.user, sessionCount: (prev.user.sessionCount || 0) + 1 } }) : prev);
            // Refresh users list if admin panel is open
            if (authState.isAdmin) {
              loadUsers({ bypassAdminCheck: true });
            }
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
  
  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); };
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
    } catch (e) {
      console.error('Download failed', e);
    }
  };
  
  // --- RENDER FUNCTIONS ---
  
  const renderSentimentText = (text: string) => {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /\[(POS|NEG|NEU)\](.*?)\[\/\1\]/gs;

    for (const match of text.matchAll(regex)) {
        if (match.index === undefined) continue;
        
        if (match.index > lastIndex) {
            elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
        }
        
        const [, type, content] = match;
        const sentimentClasses: Record<string, string> = {
            POS: 'bg-green-100/80 dark:bg-green-500/20 text-green-700 dark:text-green-300 p-0.5 rounded',
            NEG: 'bg-red-100/80 dark:bg-red-500/20 text-red-700 dark:text-red-300 p-0.5 rounded',
            NEU: 'text-slate-700 dark:text-slate-200',
        };
        
        elements.push(<span key={`match-${match.index}`} className={sentimentClasses[type]}>{content}</span>);
        
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }
    
    return elements.length > 0 ? <>{elements}</> : <>{text}</>;
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

        {/* Timer en Status */}
        <div className="flex justify-center">
          <div className="text-4xl font-mono bg-gray-200 dark:bg-slate-700 px-6 py-3 rounded-lg text-slate-800 dark:text-slate-100">
            {new Date(duration * 1000).toISOString().substr(11, 8)}
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
                src={audioURL || ''} 
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
    const renderMindmapView = () => {
      if (!transcript.trim()) return <div className="flex items-center justify-center p-8 min-h-[300px] text-slate-500 dark:text-slate-400">{t('noContent')}</div>;
      if (!mindmapMermaid) {
        return (
          <div className="flex items-center justify-center p-8">
            <button
              onClick={async () => {
                try {
                  setLoadingText(t('generating', { type: 'Mindmap' }));
                  const ai = new GoogleGenAI({ apiKey: apiKey });
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
        <div className="p-4">
          {mindmapSvg ? (
            <div className="overflow-auto max-h-[70vh]" dangerouslySetInnerHTML={{ __html: mindmapSvg }} />
          ) : (
            <pre className="text-sm whitespace-pre-wrap bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700 overflow-auto max-h-[70vh]">{mindmapMermaid}</pre>
          )}
        </div>
      );
    };
    const analysisActions: any[] = [
        { id: 'transcript', type: 'view', icon: TranscriptIcon, label: () => isAnonymized ? t('transcriptAnonymized') : t('transcript') },
        { id: 'anonymize', type: 'action', icon: AnonymizeIcon, label: () => t('anonymize'), onClick: handleAnonymizeTranscript, disabled: () => isProcessing || isAnonymized || !transcript.trim() },
        { id: 'summary', type: 'view', icon: SummaryIcon, label: () => t('summary') },
        { id: 'keyword', type: 'view', icon: TagIcon, label: () => t('keywordAnalysis')},
        { id: 'sentiment', type: 'view', icon: SparklesIcon, label: () => t('sentimentAnalysis')},
        { id: 'faq', type: 'view', icon: FaqIcon, label: () => t('faq') },
        { id: 'learning', type: 'view', icon: LearningIcon, label: () => t('keyLearnings') }, 
        { id: 'followUp', type: 'view', icon: FollowUpIcon, label: () => t('followUp') },
        { id: 'chat', type: 'view', icon: ChatIcon, label: () => t('chat') },
        { id: 'podcast', type: 'view', icon: PodcastIcon, label: () => t('podcast') },
        { id: 'presentation', type: 'action', icon: PresentationIcon, label: () => t('exportPPT'), onClick: () => setShowPptOptions(true), disabled: () => isProcessing || !transcript.trim() },
        { id: 'mindmap', type: 'view', icon: SparklesIcon, label: () => t('mindmap') }
    ];

    const analysisContent: Record<ViewType, string> = { transcript, summary, faq, learning: learningDoc, followUp: followUpQuestions, podcast: podcastScript, chat: '', keyword: '', sentiment: '', mindmap: '' };

    const handleTabClick = (view: ViewType) => {
        if (['summary', 'faq', 'learning', 'followUp'].includes(view)) handleGenerateAnalysis(view);
        else if (view === 'keyword') handleGenerateKeywordAnalysis();
        else if (view === 'podcast') handleGeneratePodcast();
        else if (view === 'sentiment') handleAnalyzeSentiment();
        else setActiveView(view);
        if (view === 'mindmap' && !mindmapMermaid) {
            // auto-generate on opening tab
            (async () => {
              try {
                setLoadingText(t('generating', { type: 'Mindmap' }));
                const ai = new GoogleGenAI({ apiKey: apiKey });
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
        }
    };
    
    const renderContent = () => {
        if (activeView !== 'transcript' && activeView !== 'chat' && activeView !== 'podcast' && activeView !== 'sentiment' && loadingText && !analysisContent[activeView] && !keywordAnalysis) {
            return <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>;
        }
        if (activeView === 'chat') return renderChatView();
        if (activeView === 'mindmap') return renderMindmapView();
        
        if (activeView === 'podcast') {
            if (loadingText && !podcastScript) {
                 return <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300 min-h-[300px]"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>;
            }
            if (podcastScript) {
                return <PodcastPlayer script={podcastScript} language={language || 'nl'} t={t} />;
            }
            return <div className="flex items-center justify-center p-8 min-h-[300px] text-slate-500 dark:text-slate-400">{t('noContent')}</div>;
        }

        if (activeView === 'sentiment') {
            if ((isAnalyzingSentiment || loadingText) && !sentimentAnalysisResult) {
                return <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300 min-h-[300px]"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText || t('analyzingSentiment')}...</div>;
            }
            if (sentimentAnalysisResult) {
                const fullContent = `${t('sentimentSummary')}\n${sentimentAnalysisResult.summary}\n\n${t('sentimentConclusion')}\n${sentimentAnalysisResult.conclusion}\n\n${t('transcript')}\n${transcript}`;
                return (
                    <div className="relative p-6 bg-white dark:bg-slate-800 rounded-b-lg min-h-[300px] max-h-[70vh] transition-colors">
                         <div className="absolute top-4 right-4 flex gap-2">
                             <button onClick={() => copyToClipboard(fullContent)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label={t('copyContent')}>
                                 <CopyIcon className="w-5 h-5" />
                             </button>
                             <button onClick={() => downloadTextFile(fullContent, `sentiment.txt`)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 bg-gray-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Download">
                                 ⬇️
                             </button>
                         </div>
                        <div className="overflow-y-auto max-h-[calc(70vh-120px)] space-y-6">
                            <div>
                                <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400 mb-2">{t('sentimentSummary')}</h4>
                                <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">{sentimentAnalysisResult.summary}</p>
                            </div>
                             <div>
                                <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400 mb-2">{t('sentimentConclusion')}</h4>
                                <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">{sentimentAnalysisResult.conclusion}</p>
                            </div>
                             <div>
                                <h4 className="font-bold text-lg text-cyan-600 dark:text-cyan-400 mb-2">{t('transcript')}</h4>
                                <pre className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">
                                  {renderSentimentText(sentimentAnalysisResult.taggedText)}
                                </pre>
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
                    {loadingText && !keywordAnalysis && <div className="flex items-center justify-center p-8 text-slate-600 dark:text-slate-300"><LoadingSpinner className="w-6 h-6 mr-3" /> {loadingText}...</div>}
                    {keywordAnalysis && keywordAnalysis.length === 0 && !loadingText && <p>{t('noContent')}</p>}
                    {keywordAnalysis && keywordAnalysis.length > 0 && (
                        <div className="overflow-y-auto max-h-[calc(70vh-120px)] space-y-6">
                            {keywordAnalysis.map((topic, index) => (
                                <div key={index} className="p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 rounded-xl">
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
                </div>
                <div className="overflow-y-auto max-h-[calc(70vh-120px)]">
                    <pre className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">
                        {content || t('noContent')}
                    </pre>
                </div>
            </div>
        );
    };

    return (
        <div className={`w-full max-w-6xl mx-auto bg-transparent rounded-lg transition-all duration-300 ${isAnonymized ? 'ring-2 ring-green-400/80 shadow-lg shadow-green-500/10' : ''}`}>
             <div className="flex flex-wrap items-center p-2 bg-gray-100/50 dark:bg-slate-800/50 rounded-t-lg border-b border-gray-300 dark:border-slate-700 gap-1">
                {analysisActions.map(action => (
                        <button
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
                disabled={!apiKey && !hasDatabaseApiKey}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md ${isTTSEnabled ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/20' : (!apiKey && !hasDatabaseApiKey) ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
            >
                {isTTSEnabled ? <SpeakerIcon className="w-5 h-5" /> : <SpeakerOffIcon className="w-5 h-5" />}
                <span>{isTTSEnabled ? t('readAnswers') : (!apiKey && !hasDatabaseApiKey ? t('setupApiKey') : t('readAnswers'))}</span>
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xl px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                        <pre className="text-base whitespace-pre-wrap font-sans">{msg.text || '...'}</pre>
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
                    disabled={!apiKey && !hasDatabaseApiKey}
                    className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : (!apiKey && !hasDatabaseApiKey) ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed' : 'text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                    title={(!apiKey && !hasDatabaseApiKey) ? t('setupApiKey') : (isListening ? t('stopListening') : t('startListening'))}
                > 
                    <MicIcon className="w-5 h-5"/> 
                </button>
                <button 
                    onClick={handleSendMessage} 
                    disabled={isChatting || (!chatInput.trim() && !voiceInputPreview.trim()) || (!apiKey && !hasDatabaseApiKey)} 
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
      
      <ApiKeySetupModal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
          onSave={handleSaveApiKey}
          t={t}
          storagePreference={apiKeyStoragePreference}
          onStoragePreferenceChange={setApiKeyStoragePreference}
          isLoggedIn={!!authState.user}
      />
      
      <PowerPointOptionsModal
          isOpen={showPptOptions}
          onClose={() => setShowPptOptions(false)}
          onGenerate={handleGeneratePresentationWithOptions}
          t={t}
          currentTemplate={pptTemplate}
          onTemplateChange={setPptTemplate}
      />

      {/* Cookie Consent */}
      {showCookieConsent && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">🍪 Cookie Beleid</h3>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 mb-6">
              <p>Deze app gebruikt cookies om je ervaring te verbeteren. Door de app te gebruiken ga je akkoord met ons cookie beleid.</p>
              <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded">
                <p className="font-medium">Wat we opslaan:</p>
                <ul className="text-xs text-slate-600 dark:text-cyan-400 mt-1 space-y-1">
                  <li>• Je taal voorkeur</li>
                  <li>• Je theme voorkeur (donker/licht)</li>
                  <li>• API key (alleen lokaal op je apparaat)</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowCookieConsent(false)}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Weigeren
              </button>
              <button 
                onClick={handleAcceptCookies}
                className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Accepteren
              </button>
            </div>
          </div>
        </div>
      )}
      
      <header className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-16px)] sm:w-auto">
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 sm:px-3 py-1.5 sm:py-2 rounded-full shadow-lg mx-auto max-w-[94vw] sm:max-w-none">
          {/* Logo & brand */}
          <button onClick={() => setShowInfoPage(true)} className="flex items-center gap-2 min-w-0 hover:opacity-90">
            <img src="/logo.png" alt="RecapSmart Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400 hidden sm:block">RecapSmart</span>
          </button>
          
          <div className="flex items-center gap-1 bg-gray-200 dark:bg-slate-800 p-1 rounded-full shrink-0">
              <button title={t('dutch')} onClick={() => setUiLang('nl')} className={`flex items-center justify-center h-7 w-7 rounded-full transition-colors ${uiLang === 'nl' ? 'bg-white dark:bg-slate-600' : 'hover:bg-gray-300 dark:hover:bg-slate-700'}`}>
                  <NlFlagIcon className="w-5 rounded-sm"/>
              </button>
              <button title={t('english')} onClick={() => setUiLang('en')} className={`flex items-center justify-center h-7 w-7 rounded-full transition-colors ${uiLang === 'en' ? 'bg-white dark:bg-slate-600' : 'hover:bg-gray-300 dark:hover:bg-slate-700'}`}>
                  <UkFlagIcon className="w-5 rounded-sm"/>
              </button>
          </div>
                          <button onClick={toggleTheme} className="flex items-center justify-center h-9 w-9 bg-gray-200 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-opacity-80">
                  {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
                </button>
          
          {/* App Controls - Alleen zichtbaar na inloggen */}
          {authState.user && (
            <>
                              <button onClick={reset} disabled={isProcessing} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-slate-600 dark:text-slate-400 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed h-10 min-w-0 sm:min-w-[120px]">
                  <ResetIcon className="w-5 h-5"/> 
                  <span>{status === RecordingStatus.FINISHED ? t('startNewSession') : t('reset')}</span>
              </button>
              <button onClick={() => setShowSettingsModal(true)} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-slate-600 dark:text-slate-400 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white h-10 min-w-0 sm:min-w-[120px]">
                  <SettingsIcon className="w-5 h-5"/> 
                  <span>Instellingen</span>
              </button>
            </>
          )}
          
          {/* Auth Buttons */}
          {!authState.user ? (
            <button 
              onClick={() => setShowLoginModal(true)} 
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[100px]"
            >
              <span>🔐</span>
              <span>Inloggen</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-wrap">
              {authState.isAdmin && (
                <button 
                  onClick={async () => {
                    setShowAdminPanel(true);
                    // Ensure data is fresh when opening panel
                    await loadUsers({ bypassAdminCheck: true });
                    await loadWaitlist({ bypassAdminCheck: true });
                  }} 
                  className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all text-white bg-purple-500 hover:bg-purple-600 h-9 sm:h-10 min-w-0"
                >
                  <span>👑</span>
                  <span>Admin</span>
                </button>
              )}
              <button 
                onClick={handleLogout} 
                className="flex items-center justify-center gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all text-slate-600 dark:text-slate-400 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white h-9 sm:h-10 min-w-0"
              >
                <span>🚪</span>
                <span>Uitloggen</span>
              </button>
            </div>
          )}
        </div>
      </header>
      
      {/* Cookie Modal */}
      {showCookieModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">🍪 Cookie Beleid</h3>
              <button 
                onClick={() => setShowCookieModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Wat zijn cookies?</h4>
                <p>Cookies zijn kleine tekstbestanden die op je apparaat worden opgeslagen wanneer je websites bezoekt. Ze helpen de website te onthouden wat je hebt gedaan en je voorkeuren te bewaren.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Cookies die we gebruiken</h4>
                <div className="space-y-2">
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded">
                    <p className="font-medium">Essentiële cookies</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Deze cookies zijn noodzakelijk voor de werking van de app en kunnen niet worden uitgeschakeld.</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded">
                    <p className="font-medium">Analytics cookies</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Deze cookies helpen ons begrijpen hoe gebruikers de app gebruiken, zodat we deze kunnen verbeteren.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Geen tracking van persoonlijke data</h4>
                <p>We verzamelen geen persoonlijke informatie via cookies. Alle data wordt anoniem verzameld en gebruikt uitsluitend om de app te verbeteren.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Cookie instellingen wijzigen</h4>
                <p>Je kunt je cookie voorkeuren op elk moment wijzigen door je browser instellingen aan te passen. Let op dat het uitschakelen van cookies de functionaliteit van de app kan beïnvloeden.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer Modal */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-3xl w-full m-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">⚠️ Disclaimer</h3>
              <button 
                onClick={() => setShowDisclaimerModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">AI-Gegenereerde Content</h4>
                <p>RecapSmart maakt gebruik van Google Gemini AI-technologie om transcripties, samenvattingen, analyses en andere content te genereren. Alle gegenereerde content is AI-gebaseerd en dient alleen ter ondersteuning van je werk.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Geen Garantie op Nauwkeurigheid</h4>
                <p>Hoewel we ons best doen om accurate resultaten te leveren, kunnen we geen garantie geven dat alle AI-gegenereerde content 100% nauwkeurig is. We raden aan om alle output te controleren en te verifiëren voordat je deze gebruikt voor belangrijke beslissingen.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Gebruik op Eigen Risico</h4>
                <p>Het gebruik van deze app en alle gegenereerde content gebeurt op eigen risico. We zijn niet aansprakelijk voor eventuele fouten, onjuistheden of gevolgen van het gebruik van de gegenereerde content.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Google Gemini API</h4>
                <p>De app integreert met Google Gemini AI-services. De kwaliteit en beschikbaarheid van deze services zijn afhankelijk van Google's voorwaarden en kunnen variëren. We hebben geen controle over de onderliggende AI-modellen of hun output.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Privacy en Data - Volledige Lokale Opslag</h4>
                <p><strong>Belangrijk:</strong> Je sessies worden NIET opgeslagen in onze database. Alle data blijft volledig lokaal op jouw apparaat.</p>
                <ul className="list-disc list-inside space-y-1 text-xs mt-2">
                  <li>🎙️ <strong>Opnames:</strong> Alleen lokaal opgeslagen, wij kunnen ze niet zien</li>
                  <li>📝 <strong>Transcripties:</strong> Blijven op jouw apparaat, niet in onze database</li>
                  <li>🤖 <strong>AI Output:</strong> Alleen jij kunt je gegenereerde content zien</li>
                  <li>🔑 <strong>API Key:</strong> Lokaal opgeslagen, wij hebben er geen toegang toe</li>
                </ul>
                <p className="mt-2 text-sm">We bewaren helemaal niets van jouw sessies. Jouw privacy staat voorop.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Aanbevelingen</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Controleer altijd de gegenereerde content op nauwkeurigheid</li>
                  <li>Gebruik AI-output als ondersteuning, niet als vervanging voor professioneel oordeel</li>
                  <li>Houd rekening met de beperkingen van AI-technologie</li>
                  <li>Raadpleeg experts bij belangrijke beslissingen</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">📋 Wachtlijst</h3>
              <button 
                onClick={() => setShowWaitlistModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Toegang op Uitnodiging</h4>
                <p>RecapSmart is momenteel alleen beschikbaar voor uitgenodigde gebruikers. Dit zorgt ervoor dat we de beste service kunnen bieden en de app kunnen optimaliseren op basis van feedback van onze gebruikers.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Hoe werkt de wachtlijst?</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Meld je aan met je email adres</li>
                  <li>We plaatsen je op de wachtlijst</li>
                  <li>Zodra er plek is, ontvang je een uitnodiging</li>
                  <li>Je kunt dan een account aanmaken en de app gebruiken</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Wat gebeurt er met je data?</h4>
                <p>Je email adres wordt alleen gebruikt om contact met je op te nemen wanneer je toegang krijgt. We delen je gegevens niet met derden.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">🔒 Volledige Privacy Garantie</h4>
                <p><strong>Belangrijk:</strong> Wanneer je de app gebruikt, worden je sessies NIET opgeslagen in onze database.</p>
                <ul className="list-disc list-inside space-y-1 text-xs mt-2">
                  <li>🎙️ <strong>Opnames:</strong> Blijven volledig lokaal op jouw apparaat</li>
                  <li>📝 <strong>Transcripties:</strong> Wij kunnen ze niet zien of opslaan</li>
                  <li>🤖 <strong>AI Output:</strong> Alleen jij hebt toegang tot je content</li>
                  <li>🔑 <strong>API Key:</strong> Lokaal opgeslagen, wij hebben er geen toegang toe</li>
                </ul>
                <p className="mt-2 text-sm">We bewaren helemaal niets van jouw sessies. Jouw privacy staat voorop.</p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Direct Aanmelden</h4>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="jouw@email.nl"
                    className="flex-1 px-3 py-2 border border-blue-300 dark:border-blue-500 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    onClick={() => {
                      addToWaitlist(waitlistEmail);
                      setShowWaitlistModal(false);
                    }}
                    disabled={!waitlistEmail.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    Aanmelden
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full m-4 p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">🔐 Inloggen</h3>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <LoginForm 
              onLogin={handleLogin}
              onCreateAccount={handleCreateAccount}
              onPasswordReset={handlePasswordReset}
              onClose={() => setShowLoginModal(false)}
            />
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && authState.user && authState.isAdmin && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-6xl w-full m-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">👑 Admin Panel</h3>
              <button 
                onClick={() => setShowAdminPanel(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Add User Section - Always visible */}
            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg mb-6">
              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Gebruiker Toevoegen</h4>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <button
                  onClick={() => addUser(newUserEmail)}
                  disabled={!newUserEmail.trim()}
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-slate-400 transition-colors"
                >
                  Toevoegen
                </button>
              </div>
              
              {/* Sync Users Button */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                <button
                  onClick={syncUsersWithFirebase}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  title="Synchroniseer gebruikers tussen Firebase Auth en Firestore"
                >
                  🔄 Synchroniseer Gebruikers
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Repareert ontbrekende UID velden en synchroniseert gebruikers
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveAdminTab('waitlist')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeAdminTab === 'waitlist'
                      ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                  }`}
                >
                  📋 Wachtlijst ({waitlist.length})
                </button>
                <button
                  onClick={() => setActiveAdminTab('users')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeAdminTab === 'users'
                      ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                  }`}
                >
                  👥 Bestaande Gebruikers ({users.length})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeAdminTab === 'waitlist' && (
              <div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Wachtlijst Beheer</h4>
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4 mb-4">
                  <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                    Gebruikers op de wachtlijst kunnen worden geactiveerd om toegang te krijgen tot de app.
                  </p>
                  {selectedWaitlistUsers.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={activateWaitlistUsers}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {selectedWaitlistUsers.length} Geselecteerde Gebruiker(s) Activeren
                      </button>
                      <button
                        onClick={() => sendInvitationEmails(selectedWaitlistUsers)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        📧 Uitnodigingen Versturen
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">
                          <input
                            type="checkbox"
                            checked={waitlist.length > 0 && selectedWaitlistUsers.length === waitlist.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWaitlistUsers(waitlist.map(w => w.id));
                              } else {
                                setSelectedWaitlistUsers([]);
                              }
                            }}
                            className="rounded border-gray-300 dark:border-slate-600"
                          />
                        </th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Email</th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Aangemeld Op</th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waitlist.map((waitlistUser) => (
                        <tr key={waitlistUser.id} className="border-b border-gray-100 dark:border-slate-800">
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={selectedWaitlistUsers.includes(waitlistUser.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedWaitlistUsers([...selectedWaitlistUsers, waitlistUser.id]);
                                } else {
                                  setSelectedWaitlistUsers(selectedWaitlistUsers.filter(id => id !== waitlistUser.id));
                                }
                              }}
                              className="rounded border-gray-300 dark:border-slate-600"
                            />
                          </td>
                          <td className="p-2">{waitlistUser.email}</td>
                          <td className="p-2 text-xs text-slate-500 dark:text-slate-400">
                            {waitlistUser.createdAt?.toDate?.() ? 
                              waitlistUser.createdAt.toDate().toLocaleDateString('nl-NL') : 
                              'Onbekend'
                            }
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => sendInvitationEmail(waitlistUser.email)}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors"
                                title="Stuur uitnodigingsmail"
                              >
                                📧
                              </button>
                              <button
                                onClick={() => removeFromWaitlist(waitlistUser.id)}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
                                title="Verwijderen"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {waitlist.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500 dark:text-slate-400">
                            Geen gebruikers op de wachtlijst
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeAdminTab === 'users' && (
              <div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Gebruikers Beheer</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Email</th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Status</th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Admin</th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Laatste Login</th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Sessies</th>
                        <th className="text-left p-2 font-medium text-slate-600 dark:text-slate-400">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.uid} className="border-b border-gray-100 dark:text-slate-800">
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
                            }`}>
                              {user.isActive ? 'Actief' : 'Uitgeschakeld'}
                            </span>
                          </td>
                          <td className="p-2">
                            {user.isAdmin && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 rounded-full text-xs">
                                Admin
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-xs text-slate-500 dark:text-slate-400">
                            {user.lastLogin
                              ? (typeof (user.lastLogin as any)?.toDate === 'function'
                                  ? (user.lastLogin as any).toDate().toLocaleDateString('nl-NL')
                                  : new Date(user.lastLogin as any).toLocaleDateString('nl-NL'))
                              : 'Nooit'}
                          </td>
                          <td className="p-2 text-center">{user.sessionCount}</td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleUserStatus(user.uid, !user.isActive)}
                                className={`px-2 py-1 text-xs rounded ${
                                  user.isActive 
                                    ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30' 
                                    : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-500/30'
                                } transition-colors`}
                              >
                                {user.isActive ? 'Uitschakelen' : 'Activeren'}
                              </button>
                              <button
                                onClick={() => resetUserPassword(user.email)}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors"
                              >
                                Reset PW
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSystemAudioHelp && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-3xl w-full m-4 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Systeem-audio inschakelen</h3>
              <button onClick={() => setShowSystemAudioHelp(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
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
                <a href="#listen-along-info" className="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline">
                  Meer informatie over meeluisteren
                </a>
                <button onClick={() => setShowSystemAudioHelp(false)} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold">
                  Begrepen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-4xl w-full m-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">⚙️ Instellingen</h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* API Key Beheer */}
              <div className="bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-gray-200 dark:border-slate-600 p-4">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">🔑 API key beheer</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">Huidige opslag:</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => switchApiKeyStorage('local')} className={`px-3 py-2 rounded-md text-sm ${apiKeyStoragePreference==='local' ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>Lokaal</button>
                      <button onClick={() => switchApiKeyStorage('database')} className={`px-3 py-2 rounded-md text-sm ${apiKeyStoragePreference==='database' ? 'bg-cyan-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>Database</button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Status: {apiKey ? 'Lokale key aanwezig' : hasDatabaseApiKey ? 'Key in database aanwezig' : 'Geen key'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">Acties:</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setShowApiKeyModal(true)} className="px-3 py-2 rounded-md text-sm bg-blue-600 text-white">Key toevoegen/verniewen</button>
                      <button onClick={deleteApiKeyFromLocal} className="px-3 py-2 rounded-md text-sm bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">Verwijder lokaal</button>
                      <button onClick={deleteApiKeyFromDatabase} disabled={!authState.user || !hasDatabaseApiKey} className="px-3 py-2 rounded-md text-sm disabled:opacity-50 bg-red-600 text-white">Verwijder uit database</button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Als je de opslag wijzigt naar Database, voer dan een nieuwe key in zodat deze veilig gehashed opgeslagen kan worden.</p>
              </div>

              {/* Anonimisatie Regels Sectie */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Anonimisatie Regels</h4>
                  <button 
                    onClick={addAnonymizationRule}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm"
                  >
                    + Regel Toevoegen
                  </button>
                </div>
                
                <div className="space-y-3">
                  {anonymizationRules.map((rule, index) => (
                    <div key={rule.id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Originele Tekst
                          </label>
                          <input
                            type="text"
                            value={rule.originalText}
                            onChange={(e) => updateAnonymizationRule(rule.id, 'originalText', e.target.value)}
                            placeholder="Bijv. Jan, Company, etc."
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Vervangende Tekst
                          </label>
                          <input
                            type="text"
                            value={rule.replacementText}
                            onChange={(e) => updateAnonymizationRule(rule.id, 'replacementText', e.target.value)}
                            placeholder="Bijv. medewerker, Company, etc."
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
                              Exact
                            </label>
                          </div>
                          
                          <button
                            onClick={() => deleteAnonymizationRule(rule.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                            title="Verwijder regel"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {anonymizationRules.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <p>Nog geen anonimisatie regels ingesteld.</p>
                      <p className="text-sm mt-1">Voeg regels toe om tekst automatisch te anonimiseren.</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                  <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">💡 Tips voor Anonimisatie</h5>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• <strong>Exact:</strong> Vervangt alleen volledige woorden (bijv. "Jan" → "medewerker")</li>
                    <li>• <strong>Fuzzy:</strong> Intelligente naamherkenning - vindt namen die overeenkomen (bijv. "Jan" vindt "Jan", "Janneke", "Jan-Peter")</li>
                    <li>• <strong>Medewerker nummering:</strong> Gebruik "medewerker" als vervangende tekst, nummers worden automatisch toegevoegd</li>
                    <li>• <strong>Regel volgorde:</strong> Regels worden van boven naar beneden toegepast</li>
                    <li>• <strong>Veilig:</strong> Fuzzy matching vervangt NOOIT delen van andere woorden (bijv. "jan" in "januari" blijft intact)</li>
                  </ul>
                </div>
              </div>
              
              {/* Actie Knoppen */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 bg-gray-200 dark:bg-slate-700 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={saveAnonymizationRules}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                >
                  Opslaan
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
      
      <main className="w-full max-w-6xl mx-auto px-3 sm:px-4 flex flex-col items-center gap-6 sm:gap-8 mt-20 sm:mt-12">
        {authState.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner className="w-8 h-8" text="Laden..." />
          </div>
        ) : showInfoPage || !authState.user ? (
          <div className="text-center py-16 w-full max-w-6xl mx-auto">
            {authState.user && (
              <div className="mb-6">
                <button onClick={() => setShowInfoPage(false)} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                  ← {t('startNewSession')}
                </button>
              </div>
            )}
            {/* Hero Section */}
            <div className="mb-16">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <img src="/logo.png" alt="RecapSmart Logo" className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shadow-2xl" />
              </div>
              
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                  RecapSmart
                </span>
              </h1>
              <p className="text-lg sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed px-1">
                {t('landingHeroSubtitle')}
              </p>
              
              {/* Waitlist Section - Prominent bovenaan */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-8 mb-8 max-w-4xl mx-auto">
                 <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-4 text-center">
                   {t('waitlistTitle')}
                 </h2>
                 <p className="text-blue-700 dark:text-blue-300 mb-6 text-center text-lg">
                   {t('waitlistLead')}
                 </p>
                
                {/* Waitlist Form */}
                <div className="flex gap-2 sm:gap-3 max-w-md mx-auto mb-4 px-2">
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="flex-1 px-3 sm:px-4 py-2 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    required
                  />
                  <button
                    onClick={() => addToWaitlist(waitlistEmail)}
                    disabled={!waitlistEmail.trim()}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200"
                  >
                    {t('waitlistSignUp')}
                  </button>
                </div>
                <button
                  onClick={() => setShowWaitlistModal(true)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline transition-colors mx-auto block"
                >
                  {t('waitlistMoreInfo')}
                </button>
              </div>
              
            <div className="text-center px-2">
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm sm:text-base">
                  {t('haveAccessLead')}
                </p>
                <button 
                  onClick={() => setShowLoginModal(true)} 
                  className="px-6 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-semibold rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  🔐 {t('loginNow')}
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 px-2">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <MicIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('featureRecordingTitle')}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('featureRecordingDesc')}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <SummaryIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('featureAIAnalysisTitle')}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('featureAIAnalysisDesc')}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <PresentationIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('featurePresentationsTitle')}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('featurePresentationsDesc')}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <ChatIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('featureChatTitle')}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('featureChatDesc')}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <PodcastIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('featurePodcastTitle')}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('featurePodcastDesc')}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <AnonymizeIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t('featurePrivacyTitle')}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t('featurePrivacyDesc')}</p>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 sm:p-8 rounded-2xl mb-16 border-2 border-green-200 dark:border-green-700 mx-1">
              <h2 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-6 text-center">{t('privacyTitle')}</h2>
              <div className="max-w-5xl mx-auto">
                <p className="text-green-700 dark:text-green-300 text-lg text-center mb-6">{t('privacyLead')}</p>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-green-800 dark:text-green-200 font-medium">{t('privacyItemRecordings')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-green-800 dark:text-green-200 font-medium">{t('privacyItemTranscripts')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-green-800 dark:text-green-200 font-medium">{t('privacyItemAIOutput')}</span>
                    </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-green-800 dark:text-green-200 font-medium">{t('privacyItemNoVideo')}</span>
                      </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-green-800 dark:text-green-200 font-medium">{t('privacyItemApiKeyLocal')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-green-800 dark:text-green-200 font-medium">{t('privacyItemNoServers')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-green-800 dark:text-green-200 font-medium">{t('privacyItemWeStoreNothing')}</span>
                    </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-green-800 dark:text-green-200 font-medium">{t('privacyItemAudioStored')}</span>
                      </div>
                  </div>
                </div>
                <p className="text-green-600 dark:text-green-400 text-center mt-6 text-sm">{t('privacyFootnote')}</p>
              </div>
            </div>

            {/* About AI & API Key */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 sm:p-8 rounded-2xl mb-16 border-2 border-cyan-200 dark:border-cyan-700 mx-1">
              <h2 className="text-2xl font-bold text-cyan-800 dark:text-cyan-200 mb-4 text-center">{t('aboutAiTitle')}</h2>
              <p className="text-cyan-800/90 dark:text-cyan-200/90 text-center max-w-4xl mx-auto">
                {t('aboutAiBody')}
              </p>
            </div>

            {/* Use Cases Section */}
            <div className="bg-gradient-to-r from-slate-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 p-6 sm:p-8 rounded-2xl mb-16 mx-1">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-center">{t('useCasesTitle')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Management & Leiderschap */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-cyan-600">{t('useCasesMgmtTitle')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesMgmt1')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesMgmt2')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesMgmt3')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesMgmt4')}</span>
                    </div>
                  </div>
                </div>

                {/* Advies & Consultatie */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-cyan-600">{t('useCasesAdviceTitle')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesAdvice1')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesAdvice2')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesAdvice3')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesAdvice4')}</span>
                    </div>
                  </div>
                </div>

                {/* Creatie & Communicatie */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-cyan-600">{t('useCasesCreationTitle')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesCreation1')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesCreation2')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesCreation3')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesCreation4')}</span>
                    </div>
                  </div>
                </div>

                {/* Onderzoek & Analyse */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-cyan-600">{t('useCasesResearchTitle')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesResearch1')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesResearch2')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesResearch3')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t('useCasesResearch4')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Listen Along Info */}
            <div id="listen-along-info" className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 sm:p-8 rounded-2xl mb-16 mx-1 border-2 border-purple-200 dark:border-purple-700">
              <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-3 text-center">
                🎧 {t('listenAlongTitle')}
              </h2>
              <p className="text-purple-800/90 dark:text-purple-200/90 text-center max-w-4xl mx-auto">
                {t('listenAlongBody')}
              </p>
            </div>

            {/* How It Works */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 text-center">
                {t('howItWorksTitle')}
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-cyan-100 dark:bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('hiwStep1Title')}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{t('hiwStep1Desc')}</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-cyan-100 dark:bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('hiwStep2Title')}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{t('hiwStep2Desc')}</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-cyan-100 dark:bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('hiwStep3Title')}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{t('hiwStep3Desc')}</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8 rounded-2xl text-white">
              <h2 className="text-3xl font-bold mb-4 text-center">{t('ctaTitle')}</h2>
              <p className="text-xl text-cyan-100 mb-8 text-center max-w-2xl mx-auto">{t('ctaLead')}</p>
              
              <div className="flex justify-center px-2">
                <button 
                  onClick={() => setShowLoginModal(true)} 
                  className="px-8 py-4 text-lg font-semibold rounded-xl bg-white text-cyan-600 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                >
                  🔐 {t('loginNow')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100">{t('appTitle')}</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">{t('appDescription')}</p>
                {/* Welkom tekst weggehaald */}
            </div>
        
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
             <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 space-y-6">
                {/* API Key Waarschuwing */}
                {!apiKey && !hasDatabaseApiKey && (
                    <div className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 rounded-lg p-4 flex items-center gap-3">
                        <AlertTriangleIcon className="w-6 h-6 text-amber-500" />
                        <div className="flex-1">
                            <p className="font-semibold mb-1">{t('setupApiKey')}</p>
                            <p className="text-sm mb-2">{t('haveAccessLead')}</p>
                            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded p-2 text-sm">
                                <p className="text-green-700 dark:text-green-300 font-medium">✅ {t('privacyTitle')}</p>
                                <p className="text-green-600 dark:text-green-400">• {t('privacyItemApiKeyLocal')}</p>
                                <p className="text-green-600 dark:text-green-400">• {t('privacyItemNoServers')}</p>
                                <p className="text-green-600 dark:text-green-400">• {t('privacyItemWeStoreNothing')}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowApiKeyModal(true)} 
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                        >
                            {t('setupApiKey')}
                        </button>
                    </div>
                )}
                
                {(apiKey || hasDatabaseApiKey) && (
                    <div className="transition-opacity duration-500">
                        <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">
                            <span className="text-cyan-500 font-black tracking-wider text-sm block uppercase mb-2">{t('step1')}</span> {t('sessionLang')}
                        </h2>
                        <div className="flex justify-center gap-4 mt-4">
                           <button onClick={() => setLanguage('nl')} className={`px-6 py-2 rounded-lg text-lg font-semibold transition-all duration-200 w-40 ${language === 'nl' ? 'bg-cyan-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'}`}>
                               {t('dutch')}
                           </button>
                           <button onClick={() => setLanguage('en')} className={`px-6 py-2 rounded-lg text-lg font-semibold transition-all duration-200 w-40 ${language === 'en' ? 'bg-cyan-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'}`}>
                               {t('english')}
                           </button>
                        </div>
                    </div>
                )}
                
                {(apiKey || hasDatabaseApiKey) && language && (
                    <div className="transition-opacity duration-500">
                        <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">
                            <span className="text-cyan-500 font-black tracking-wider text-sm block uppercase mb-2">{t('step2')}</span> {t('startOrUpload')}
                        </h2>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-4">
                    <button onClick={startRecording} disabled={isProcessing} className="w-full sm:flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200">
                                <MicIcon className="w-6 h-6" />
                                <span className="text-lg font-semibold">{t('startRecording')}</span>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.pdf,.rtf,.html,.htm,.md,text/plain,application/pdf,application/rtf,text/html,text/markdown"/>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="w-full sm:flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200">
                                <UploadIcon className="w-6 h-6" />
                                <span className="text-lg font-semibold">📄 {t('uploadTranscript')}</span>
                            </button>
                        </div>
                <div className="mt-2 text-center">
                    <button onClick={() => setShowSystemAudioHelp(true)} className="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline">
                        🔊 Audio meeluisteren? Uitleg
                    </button>
                </div>
                        
                        {/* Supported formats info */}
                        <div className="mt-3 text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                📋 Ondersteunde formaten: TXT ✅, PDF ✅, RTF ✅, HTML ✅, MD ✅
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                💡 PDF en RTF worden automatisch omgezet naar platte tekst
                            </p>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            status === RecordingStatus.FINISHED && renderAnalysisView()
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

        {/* Footer Links */}
        <footer className="w-full max-w-6xl mt-16 pt-8 border-t border-gray-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <a 
              href="/cookies" 
              className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setShowCookieModal(true);
              }}
            >
              Cookies
            </a>
            <span className="hidden sm:inline">•</span>
            <a 
              href="/disclaimer" 
              className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setShowDisclaimerModal(true);
              }}
            >
              Disclaimer
            </a>
            <span className="hidden sm:inline">•</span>
            <span>RecapSmart v0.85</span>
          </div>
        </footer>
      </main>
    </div>
    </>
  );
}
