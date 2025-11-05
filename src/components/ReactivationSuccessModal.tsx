import React from 'react';
import Modal from './Modal';
import { TranslationFunction } from '../../types';

interface ReactivationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationFunction;
  effectiveDate?: string | Date | { seconds?: number } | null;
  stripeCustomerId?: string;
}

const ReactivationSuccessModal: React.FC<ReactivationSuccessModalProps> = ({ 
  isOpen, 
  onClose, 
  t, 
  effectiveDate,
  stripeCustomerId 
}) => {
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

  const handleCustomerPortal = () => {
    if (stripeCustomerId) {
      // Use the existing stripeService function
      import('../services/stripeService').then(({ stripeService }) => {
        stripeService.redirectToCustomerPortal(stripeCustomerId);
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('subscriptionReactivationSuccessTitle', 'Welcome back!')}>
      <div className="space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {t('subscriptionReactivationSuccessMessage', 'Great to have you back! Your subscription has been successfully reactivated.')}
        </p>
        
        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            {t('subscriptionReactivationActiveFrom', 'Your subscription will become active again on')}{' '}
            <strong>{formattedDate}</strong>.
          </p>
          <p className="text-xs mt-1 text-green-700 dark:text-green-300">
            {t('subscriptionReactivationEnjoy', 'Thank you for choosing RecapHorizon again. Enjoy all the features!')}
          </p>
        </div>

        {/* Customer Portal Link */}
        {stripeCustomerId && (
          <div className="p-3 sm:p-4 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              {t('subscriptionReactivationPortalInfo', 'Want to manage your subscription or view billing details?')}
            </p>
            <button
              onClick={handleCustomerPortal}
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {t('customerPortalTitle', 'Stripe Customer Portal')}
            </button>
          </div>
        )}

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

export default ReactivationSuccessModal;