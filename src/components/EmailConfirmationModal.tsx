import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTranslation } from '../hooks/useTranslation';
import type { Language } from '../locales';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onConfirmed: (email: string, context: 'waitlist' | 'referral') => Promise<void>;
  context: 'waitlist' | 'referral';
  uiLang?: Language;
  disableResend?: boolean;
}

export const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({
  isOpen,
  onClose,
  email,
  onConfirmed,
  context,
  uiLang,
  disableResend
}) => {
  const { t } = useTranslation(uiLang as any);
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
    return input.replace(/[^0-9]/g, '').substring(0, 6);
  };

  const handleVerifyCode = async () => {
    const sanitizedCode = sanitizeInput(confirmationCode);
    
    if (!sanitizedCode || sanitizedCode.length < 4) {
      setError(t('enterValidConfirmationCode'));
      return;
    }

    // Enhanced security: Rate limiting for verification attempts
    if (attemptCount >= 5) {
      setError(t('tooManyAttempts'));
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
          setError(t('emailConfirmCodeExpired'));
        } else if (result.error?.includes('Invalid') || result.error?.includes('invalid')) {
          setError(t('emailConfirmCodeInvalid'));
        } else if (result.error?.includes('rate limit') || result.error?.includes('too many')) {
          setError(t('tooManyAttempts'));
        } else {
          setError(t('emailConfirmTechnicalError'));
        }
      }
    } catch (error: any) {
      console.error('Email confirmation error:', error);
      setError(t('emailConfirmTechnicalError'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (disableResend) {
      return;
    }
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
          setError(t('emailConfirmCodeAlreadySent'));
        } else if (result.error?.includes('rate limit') || result.error?.includes('too many')) {
          setError(t('emailConfirmTooManyRequests'));
          setResendCooldown(300); // 5 minute cooldown for rate limiting
        } else {
          setError(t('emailConfirmCouldNotResend'));
        }
      }
    } catch (error: any) {
      console.error('Resend code error:', error);
      setError(t('emailConfirmErrorSending'));
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
        title: t('emailConfirmTitle'),
        description: t('emailConfirmDescription'),
        instruction: t('emailConfirmInstruction')
      };
    } else {
      return {
        title: t('emailConfirmTitle'),
        description: t('emailConfirmDescription'),
        instruction: t('emailConfirmInstruction')
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
            {t('emailConfirmTitle')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('emailConfirmDescription')}
          </p>
          <p className="font-medium text-gray-900 mb-6">{email}</p>
          <p className="text-sm text-gray-500">
              {t('emailConfirmInstruction')}
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
            placeholder={t('emailConfirmPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
            disabled={isVerifying}
            autoFocus
            maxLength={6}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 text-center">
            {error === 'INVALID_CODE' && t('emailConfirmCodeInvalid')}
            {error === 'CODE_EXPIRED' && t('emailConfirmCodeExpired')}
            {error === 'TOO_MANY_ATTEMPTS' && t('emailConfirmTooManyAttempts')}
            {error === 'TOO_MANY_REQUESTS' && t('emailConfirmTooManyRequests')}
            {error === 'TECHNICAL_ERROR' && t('emailConfirmTechnicalError')}
            {error === 'CODE_ALREADY_SENT' && t('emailConfirmCodeAlreadySent')}
            {error === 'COULD_NOT_RESEND' && t('emailConfirmCouldNotResend')}
            {error === 'ERROR_SENDING' && t('emailConfirmErrorSending')}
          </div>
        )}

        {attemptCount > 0 && attemptCount < 5 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              {t('emailConfirmAttemptCount').replace('{count}', attemptCount.toString()).replace('{total}', '5').replace('{remaining}', (5 - attemptCount).toString())}
            </p>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleVerifyCode}
            disabled={isVerifying || !confirmationCode.trim() || attemptCount >= 5}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isVerifying ? t('emailConfirmVerifying') : t('emailConfirmVerify')}
          </button>

          {!disableResend && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">{t('emailConfirmNoCode')}</p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending || resendCooldown > 0}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? t('emailConfirmResending') : resendCooldown > 0 ? t('emailConfirmResendCooldown').replace('{seconds}', resendCooldown.toString()) : t('emailConfirmResend')}
              </button>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-blue-800">
                {context === 'referral' ? t('emailConfirmAccountCreating') : t('emailConfirmWaitlistAdding')}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {t('emailConfirmCheckSpam')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};