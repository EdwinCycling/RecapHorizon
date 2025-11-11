import React from 'react';
import Modal from './Modal';
import { TranslationFunction } from '../../types';

interface QuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
  retryAfter?: number;
  onUpgrade?: () => void;
  t: TranslationFunction;
}

const QuotaExceededModal: React.FC<QuotaExceededModalProps> = ({
  isOpen,
  onClose,
  errorMessage,
  retryAfter,
  onUpgrade,
  t
}) => {

  const formatRetryTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} ${t('seconds', { count: seconds })}`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} ${t('minutes', { count: minutes })}`;
  };

  const isFreeTierQuota = errorMessage.includes('dagelijkse quotum') || 
                         errorMessage.includes('free_tier_requests');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('quotaExceededTitle')}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              {isFreeTierQuota ? t('dailyQuotaReached') : t('rateLimitReached')}
            </h3>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-gray-700">
            {errorMessage}
          </p>
          
          {retryAfter && (
            <p className="text-sm text-gray-600 mt-2">
              <strong>{t('retryAfter')}:</strong> {formatRetryTime(retryAfter)}
            </p>
          )}
        </div>

        {isFreeTierQuota && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              💡 {t('solutions')}:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('waitUntilTomorrow')}</li>
              <li>• {t('upgradeForMoreRequests')}</li>
              <li>• {t('useShorterTexts')}</li>
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {t('close')}
          </button>
          
          {isFreeTierQuota && onUpgrade && (
            <button
              onClick={() => {
                onUpgrade();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
            {t('upgradeSubscription')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default QuotaExceededModal;