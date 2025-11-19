import React from 'react';
import { SubscriptionTier, TranslationFunction } from '../../types';
import { subscriptionService } from '../subscriptionService';

interface UpgradeModalProps {
  isOpen: boolean;
  message: string;
  onUpgrade: (tier: SubscriptionTier) => void;
  onClose: () => void;
  t: TranslationFunction;
  onShowPricing?: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, message, onUpgrade, onClose, t, onShowPricing }) => {
  if (!isOpen) return null;

  const handleUpgrade = (tier: SubscriptionTier) => {
    onUpgrade(tier);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-medium text-gray-800 dark:text-slate-100 tracking-tight">{t('upgradeSubscription')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 text-2xl font-medium"
          >
            ×
          </button>
        </div>

        {/* Message */}
        <div className="p-6">
          <div className="flex items-start mb-6">
            <div className="text-yellow-500 text-2xl mr-3">⚠️</div>
            <div>
              <p className="text-gray-700 dark:text-slate-300 text-lg mb-2">{message}</p>
              <p className="text-gray-600 dark:text-slate-400">
                {t('upgradeSubscriptionDesc')}
              </p>
            </div>
          </div>

          {/* CTA to pricing overview */}
          <div className="mb-6">
            <button
              onClick={() => { onClose(); onShowPricing && onShowPricing(); }}
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors"
            >
              {t('gotoPricing', 'Naar prijs overzicht')}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 font-medium"
          >
            {t('close', 'Sluiten')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;

