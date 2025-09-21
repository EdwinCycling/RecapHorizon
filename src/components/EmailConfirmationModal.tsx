import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTranslation } from '../hooks/useTranslation';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onConfirmed: (email: string) => void;
}

export const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({
  isOpen,
  onClose,
  email,
  onConfirmed
}) => {
  const { t } = useTranslation();
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyCode = async () => {
    if (!confirmationCode.trim()) {
      setError(t('enterConfirmationCode'));
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const { completeWaitlistSignup } = await import('../utils/security');
      
      const result = await completeWaitlistSignup(confirmationCode.trim());
      
      if (result.success) {
        onConfirmed(result.email!);
        onClose();
      } else {
        if (result.error?.includes('expired')) {
          setError('De bevestigingscode is verlopen. Vraag een nieuwe aan.');
        } else if (result.error?.includes('Invalid')) {
          setError('Ongeldige bevestigingscode. Controleer de code en probeer opnieuw.');
        } else {
          setError(result.error || 'Er is een fout opgetreden bij het bevestigen.');
        }
      }
    } catch (error) {
      console.error('Error verifying confirmation code:', error);
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      const { initiateWaitlistSignup } = await import('../utils/security');
      
      const result = await initiateWaitlistSignup(email);
      
      if (result.success) {
        setResendCooldown(60); // 60 second cooldown
        setError('');
        // In a real app, you would send the confirmation email here
        console.log('New confirmation token generated:', result.confirmationToken);
      } else {
        if (result.pendingConfirmation) {
          setError('Er is al een bevestigingsmail verstuurd. Controleer je inbox.');
        } else {
          setError(result.error || 'Kon geen nieuwe bevestigingscode verzenden.');
        }
      }
    } catch (error) {
      console.error('Error resending confirmation:', error);
      setError('Er is een fout opgetreden bij het verzenden van een nieuwe code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isVerifying) {
      handleVerifyCode();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('emailConfirmation')}>
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('confirmEmailAddress')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('confirmationCodeSent')}
          </p>
          <p className="font-medium text-gray-900 mb-6">{email}</p>
          <p className="text-sm text-gray-500">
            {t('enterConfirmationCodeInstruction')}
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
            onChange={(e) => setConfirmationCode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('enterConfirmationCode')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isVerifying}
            autoFocus
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleVerifyCode}
            disabled={isVerifying || !confirmationCode.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isVerifying ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('confirming')}
              </div>
            ) : (
              t('confirm')
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              {t('noCodeReceived')}
            </p>
            <button
              onClick={handleResendCode}
              disabled={isResending || resendCooldown > 0}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                t('sending')
              ) : resendCooldown > 0 ? (
                t('resendCodeWithTimer').replace('{time}', resendCooldown.toString())
              ) : (
                t('resendCode')
              )}
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-yellow-800">
                {t('demoWarning')}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {t('testingNote')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};