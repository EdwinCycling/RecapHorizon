import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTranslation } from '../hooks/useTranslation';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onConfirmed: (email: string, context: 'waitlist' | 'referral') => Promise<void>;
  context: 'waitlist' | 'referral';
}

export const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({
  isOpen,
  onClose,
  email,
  onConfirmed,
  context
}) => {
  const { t } = useTranslation();
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  // Enhanced security: Clear sensitive data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmationCode('');
      setError('');
      setAttemptCount(0);
    }
  }, [isOpen]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Enhanced security: Input validation and sanitization
  const sanitizeInput = (input: string): string => {
    return input.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
  };

  const handleVerifyCode = async () => {
    const sanitizedCode = sanitizeInput(confirmationCode);
    
    if (!sanitizedCode || sanitizedCode.length < 4) {
      setError(t('enterValidConfirmationCode'));
      return;
    }

    // Enhanced security: Rate limiting for verification attempts
    if (attemptCount >= 5) {
      setError('Te veel pogingen. Probeer het later opnieuw.');
      return;
    }

    setIsVerifying(true);
    setError('');
    setAttemptCount(prev => prev + 1);

    try {
      const { completeWaitlistSignup } = await import('../utils/security');
      
      const result = await completeWaitlistSignup(sanitizedCode);
      
      if (result.success) {
        // Clear sensitive data before callback
        setConfirmationCode('');
        await onConfirmed(result.email!, context);
        onClose();
      } else {
        // Enhanced error handling with security considerations
        if (result.error?.includes('expired')) {
          setError('De bevestigingscode is verlopen. Vraag een nieuwe aan.');
        } else if (result.error?.includes('Invalid') || result.error?.includes('invalid')) {
          setError('Ongeldige bevestigingscode. Controleer de code en probeer opnieuw.');
        } else if (result.error?.includes('rate limit') || result.error?.includes('too many')) {
          setError('Te veel pogingen. Probeer het later opnieuw.');
        } else {
          setError('Er is een fout opgetreden bij het bevestigen. Probeer het opnieuw.');
        }
      }
    } catch (error: any) {
      console.error('Email confirmation error:', error);
      setError('Er is een technische fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    // Enhanced security: Rate limiting for resend attempts
    if (resendCooldown > 0) {
      return;
    }

    setIsResending(true);
    setError('');

    try {
      const { initiateWaitlistSignup } = await import('../utils/security');
      
      const result = await initiateWaitlistSignup(email);
      
      if (result.success) {
        setResendCooldown(60); // 60 second cooldown for security
        setError('');
        setAttemptCount(0); // Reset attempt count on successful resend
      } else {
        if (result.pendingConfirmation) {
          setError('Er is al een bevestigingsmail verstuurd. Controleer je inbox.');
        } else if (result.error?.includes('rate limit') || result.error?.includes('too many')) {
          setError('Te veel verzoeken. Probeer het later opnieuw.');
          setResendCooldown(300); // 5 minute cooldown for rate limiting
        } else {
          setError('Kon geen nieuwe bevestigingscode verzenden. Probeer het later opnieuw.');
        }
      }
    } catch (error: any) {
      console.error('Resend code error:', error);
      setError('Er is een technische fout opgetreden bij het verzenden van een nieuwe code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isVerifying && confirmationCode.trim()) {
      handleVerifyCode();
    }
  };

  // Enhanced security: Prevent copy/paste of potentially malicious content
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const sanitizedText = sanitizeInput(pastedText);
    setConfirmationCode(sanitizedText);
  };

  // Context-aware content
  const getContextualContent = () => {
    if (context === 'referral') {
      return {
        title: 'Bevestig je e-mailadres voor registratie',
        description: 'We hebben een bevestigingscode naar je e-mailadres gestuurd om je account aan te maken.',
        instruction: 'Voer de 6-cijferige code in die je per e-mail hebt ontvangen.'
      };
    } else {
      return {
        title: t('confirmEmailAddress'),
        description: t('confirmationCodeSent'),
        instruction: t('enterConfirmationCodeInstruction')
      };
    }
  };

  const contextContent = getContextualContent();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={contextContent.title}>
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {contextContent.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {contextContent.description}
          </p>
          <p className="font-medium text-gray-900 mb-6">{email}</p>
          <p className="text-sm text-gray-500">
            {contextContent.instruction}
          </p>
        </div>

        <div>
          <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700 mb-2">
            {t('confirmationCode')}
          </label>
          <input
            type="text"
            id="confirmationCode"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(sanitizeInput(e.target.value))}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder="Voer 6-cijferige code in"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
            disabled={isVerifying}
            autoFocus
            maxLength={10}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {attemptCount > 0 && attemptCount < 5 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              Poging {attemptCount} van 5. {5 - attemptCount} pogingen over.
            </p>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleVerifyCode}
            disabled={isVerifying || !confirmationCode.trim() || attemptCount >= 5}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isVerifying ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Bevestigen...
              </div>
            ) : (
              'Bevestigen'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Geen code ontvangen?
            </p>
            <button
              onClick={handleResendCode}
              disabled={isResending || resendCooldown > 0}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                'Verzenden...'
              ) : resendCooldown > 0 ? (
                `Opnieuw verzenden (${resendCooldown}s)`
              ) : (
                'Code opnieuw verzenden'
              )}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-blue-800">
                {context === 'referral' 
                  ? 'Je account wordt aangemaakt zodra je e-mailadres is bevestigd.'
                  : 'Je wordt toegevoegd aan de wachtlijst zodra je e-mailadres is bevestigd.'
                }
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Controleer ook je spam/ongewenste e-mail map als je de code niet ziet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};