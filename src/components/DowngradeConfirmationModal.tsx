import React, { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';
import ConfirmationSlider from './ConfirmationSlider';
import { SubscriptionTier } from '../../types';

interface DowngradeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  currentTier: SubscriptionTier;
  targetTier: SubscriptionTier;
  renewalDate: string;
  t: (key: string) => string;
  theme?: 'light' | 'dark';
}

const DowngradeConfirmationModal: React.FC<DowngradeConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentTier,
  targetTier,
  renewalDate,
  t,
  theme = 'light'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Error during downgrade:', err);
      setError(t('downgradeError'));
    } finally {
      setIsLoading(false);
    }
  };

  const getTierDisplayName = (tier: SubscriptionTier): string => {
    const tierNames: Record<SubscriptionTier, string> = {
      [SubscriptionTier.FREE]: t('tierFree'),
      [SubscriptionTier.SILVER]: t('tierSilver'),
      [SubscriptionTier.GOLD]: t('tierGold'),
      [SubscriptionTier.DIAMOND]: t('tierDiamond'),
      [SubscriptionTier.ENTERPRISE]: t('tierEnterprise')
    };
    return tierNames[tier] || tier;
  };

  const getDowngradeFeatures = (fromTier: SubscriptionTier, toTier: SubscriptionTier): string[] => {
    const features = [];
    
    if (fromTier === SubscriptionTier.DIAMOND || fromTier === SubscriptionTier.ENTERPRISE) {
      if (toTier === SubscriptionTier.GOLD || toTier === SubscriptionTier.SILVER) {
        features.push(t('downgradeFeatureLimitedTokens'));
        features.push(t('downgradeFeatureLimitedSessions'));
      }
      if (toTier === SubscriptionTier.SILVER) {
        features.push(t('downgradeFeatureNoPowerPoint'));
        features.push(t('downgradeFeatureNoBusinessCase'));
      }
    }
    
    if (fromTier === SubscriptionTier.GOLD) {
      if (toTier === SubscriptionTier.SILVER) {
        features.push(t('downgradeFeatureNoPowerPoint'));
        features.push(t('downgradeFeatureNoBusinessCase'));
      }
    }
    
    return features;
  };

  const lostFeatures = getDowngradeFeatures(currentTier, targetTier);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('downgradeConfirmationTitle')}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Warning Header */}
        <div className="flex items-center space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
              {t('downgradeWarningTitle')}
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {t('downgradeWarningSubtitle')}
            </p>
          </div>
        </div>

        {/* Downgrade Details */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t('currentTier')}</p>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {getTierDisplayName(currentTier)}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t('newTier')}</p>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {getTierDisplayName(targetTier)}
              </p>
            </div>
          </div>
        </div>

        {/* Lost Features */}
        {lostFeatures.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
            <h4 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">
              {t('downgradeWillLose')}
            </h4>
            <ul className="space-y-2">
              {lostFeatures.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2 text-red-700 dark:text-red-300">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timing Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t('downgradeEffectiveDate')}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t('downgradeWillTakeEffect', { date: (() => { try { const d = new Date(renewalDate); return isNaN(d.getTime()) ? renewalDate : d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return renewalDate; } })() })}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Confirmation Slider */}
        <div className="pt-4">
          <ConfirmationSlider
            onConfirm={handleConfirm}
            isLoading={isLoading}
            confirmText={t('downgradeConfirmed')}
            sliderText={t('downgradeSliderText')}
            theme={theme}
            disabled={isLoading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('cancel')}
          </button>
        </div>

        {/* Additional Information */}
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2 border-t border-slate-200 dark:border-slate-700">
          <p>{t('downgradeAdditionalInfo')}</p>
        </div>
      </div>
    </Modal>
  );
};

export default DowngradeConfirmationModal;