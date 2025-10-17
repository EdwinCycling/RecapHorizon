import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { initiateWaitlistSignup } from '../utils/security';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
  waitlistEmail: string;
  setWaitlistEmail: (email: string) => void;
  addToWaitlist: (email: string) => void;
  language?: string;
}

const WaitlistModal: React.FC<WaitlistModalProps> = ({ 
  isOpen, 
  onClose, 
  t, 
  waitlistEmail, 
  setWaitlistEmail, 
  addToWaitlist, 
  language = 'en' 
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  
  // Reset submission state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setError(null);
      setEmailSent(false);
    }
  }, [isOpen]);
  
  const handleSubmit = async () => {
    if (!waitlistEmail.trim()) {
      setError(t('emailRequired'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await initiateWaitlistSignup(waitlistEmail, language);
      
      if (result.success) {
        setIsSubmitted(true);
        setEmailSent(result.emailSent || false);
        
        // Also call the original addToWaitlist for backward compatibility
        // This will be handled by the completeWaitlistSignup function instead
      } else {
        setError(result.error || t('waitlistSignupFailed'));
      }
    } catch (error) {
      console.error('Error initiating waitlist signup:', error);
      setError(t('waitlistSignupFailed'));
    } finally {
      setIsLoading(false);
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-medium text-cyan-500 dark:text-cyan-400 tracking-tight">{t('waitlist')}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">{t('waitlistTitle')}</h4>
            <p>{t('waitlistDescription')}</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">{t('howWaitlistWorks')}</h4>
            <ol className="list-decimal list-inside space-y-2">
              <li>{t('waitlistStep1')}</li>
              <li>{t('waitlistStep2')}</li>
              <li>{t('waitlistStep3')}</li>
              <li>{t('waitlistStep4')}</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">{t('whatHappensWithData')}</h4>
            <p>{t('dataUsageDescription')}</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2"> {t('privacyTitle')}</h4>
            <p><strong>{t('important')}</strong> {t('sessionsNotSaved')}</p>
            <ul className="list-disc list-inside space-y-1 text-xs mt-2">
              <li><strong>{t('recordingsLocal')}</strong></li>
              <li><strong>{t('transcriptionsPrivate')}</strong></li>
              <li><strong>{t('aiOutputPrivate')}</strong></li>
            </ul>
            <p className="mt-2 text-sm">{t('privacyFirst')}</p>
          </div>
          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
          
          {!isSubmitted ? (
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">{t('directSignup')}</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                {t('waitlist2FADescription')}
              </p>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={e => setWaitlistEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="flex-1 px-3 py-2 border border-blue-300 dark:border-blue-500 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!waitlistEmail.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
                >
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isLoading ? t('sending') : t('signUp')}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-4">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                {emailSent ? t('waitlist2FAEmailSent') : t('waitlistConfirmationTitle')}
              </h4>
              {emailSent ? (
                <div className="space-y-2">
                  <p className="text-green-700 dark:text-green-300">
                    {t('waitlist2FAEmailSentMessage')}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {t('waitlist2FAEmailInstructions')}
                  </p>
                </div>
              ) : (
                <p className="text-green-700 dark:text-green-300">{t('waitlistConfirmationMessage')}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitlistModal;
