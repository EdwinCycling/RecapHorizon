import React, { useState, useEffect } from 'react';
import { sessionManager } from '../utils/security';

interface SessionTimeoutWarningProps {
  sessionId: string;
  onExtendSession: () => void;
  onLogout: () => void;
  t: (key: string, params?: Record<string, unknown>) => string;
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  sessionId,
  onExtendSession,
  onLogout,
  t
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    const checkSessionTimeout = () => {
      const warning = sessionManager.getSessionTimeoutWarning(sessionId);
      setShowWarning(warning.showWarning);
      setTimeRemaining(warning.timeRemaining || 0);
    };

    // Check immediately
    checkSessionTimeout();

    // Check every 30 seconds
    const interval = setInterval(checkSessionTimeout, 30000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      const result = sessionManager.refreshSession(sessionId);
      if (result.success) {
        onExtendSession();
        setShowWarning(false);
      } else {
        // Session couldn't be extended, force logout
        onLogout();
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
      onLogout();
    } finally {
      setIsExtending(false);
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            {t('sessionExpiringSoon')}
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              {t('sessionWillExpireIn', { timeRemaining: formatTimeRemaining(timeRemaining) })}
            </p>
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              type="button"
              onClick={handleExtendSession}
              disabled={isExtending}
              className="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExtending ? t('extending') : t('extendSession')}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
                {t('logout')}
              </button>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowWarning(false)}
            className="bg-yellow-50 rounded-md inline-flex text-yellow-400 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <span className="sr-only">{t('close')}</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;