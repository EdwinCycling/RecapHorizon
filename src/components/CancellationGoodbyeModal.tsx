import React from 'react';
import Modal from './Modal';

interface CancellationGoodbyeModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string, params?: any) => string;
  effectiveDate?: string | Date | { seconds?: number } | null;
}

const CancellationGoodbyeModal: React.FC<CancellationGoodbyeModalProps> = ({ isOpen, onClose, t, effectiveDate }) => {
  // Normalize date for display
  const dateObj = (() => {
    if (!effectiveDate) return null;
    if (typeof effectiveDate === 'string') return new Date(effectiveDate);
    if (effectiveDate instanceof Date) return effectiveDate;
    if (typeof effectiveDate === 'object' && effectiveDate?.seconds) return new Date(effectiveDate.seconds * 1000);
    return null;
  })();

  const formattedDate = dateObj
    ? dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('subscriptionCancelGoodbyeTitle', 'Sorry to see you go')}>
      <div className="space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {t('subscriptionCancelGoodbyeMessage', 'Sorry to see you go. We hope RecapHorizon was a great help for you!')}
        </p>
        <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {t('subscriptionCancelActiveUntil', 'Your current price tier remains active until')}{' '}
            <strong>{formattedDate}</strong>.
          </p>
          <p className="text-xs mt-1 text-yellow-700 dark:text-yellow-300">
            {t('subscriptionCancelFallbackToFree', 'After that, you will automatically fall back to the Free tier.')}
          </p>
        </div>
        {/* Customer Portal Link */}
        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {t('manageSubscription', 'Manage subscription')}{': '}
            <a
              href="https://billing.stripe.com/p/login/test_6oU14nb0ggped403Q124000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {t('customerPortalTitle', 'Stripe Customer Portal')}
            </a>
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors"
          >
            {t('close', 'Close')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CancellationGoodbyeModal;