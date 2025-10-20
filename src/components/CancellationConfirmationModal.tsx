import React, { useState } from 'react';
import { ExclamationTriangleIcon, HeartIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';
import EnableButtonSlider from './EnableButtonSlider';
import { SubscriptionTier } from '../../types';

interface CancellationConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  currentTier: SubscriptionTier;
  renewalDate: string;
  t: (key: string) => string;
  theme?: 'light' | 'dark';
}

const CancellationConfirmationModal: React.FC<CancellationConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentTier,
  renewalDate,
  t,
  theme = 'light'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCancellationEnabled, setIsCancellationEnabled] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Error during cancellation:', err);
      setError(t('cancellationError'));
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

  const getCancellationFeatures = (tier: SubscriptionTier): string[] => {
    const features: string[] = [];
    
    if (tier === SubscriptionTier.SILVER || tier === SubscriptionTier.GOLD || tier === SubscriptionTier.DIAMOND || tier === SubscriptionTier.ENTERPRISE) {
      features.push(t('cancellationFeatureTokens'));
      features.push(t('cancellationFeatureSessions'));
      features.push(t('cancellationFeatureAudioTime'));
    }
    
    if (tier === SubscriptionTier.GOLD || tier === SubscriptionTier.DIAMOND || tier === SubscriptionTier.ENTERPRISE) {
      features.push(t('cancellationFeaturePowerPoint'));
      features.push(t('cancellationFeatureBusinessCase'));
      features.push(t('cancellationFeatureChat'));
    }
    
    if (tier === SubscriptionTier.DIAMOND || tier === SubscriptionTier.ENTERPRISE) {
      features.push(t('cancellationFeatureUnlimited'));
      features.push(t('cancellationFeaturePriority'));
    }
    
    return features;
  };

  const lostFeatures = getCancellationFeatures(currentTier);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('cancellationConfirmationTitle')}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Sad Header */}
        <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <HeartIcon className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              {t('cancellationSadTitle')}
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              {t('cancellationSadSubtitle')}
            </p>
          </div>
        </div>

        {/* Current Plan Info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t('cancellationCurrentPlan')}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {getTierDisplayName(currentTier)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {t('cancellationActiveUntil', { date: (() => { try { const d = new Date(renewalDate); return isNaN(d.getTime()) ? renewalDate : d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return renewalDate; } })() })}
            </p>
          </div>
        </div>

        {/* What You'll Lose */}
        {lostFeatures.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
            <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {t('cancellationWillLose')}
            </h4>
            <ul className="space-y-2">
              {lostFeatures.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2 text-amber-700 dark:text-amber-300">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Free Tier Benefits */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
          <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
            {t('cancellationFreeTierTitle')}
          </h4>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{t('cancellationFreeBenefit1')}</span>
            </li>
            <li className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{t('cancellationFreeBenefit2')}</span>
            </li>
            <li className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{t('cancellationFreeBenefit3')}</span>
            </li>
          </ul>
        </div>

        {/* Timing Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t('cancellationEffectiveDate')}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t('cancellationWillTakeEffect', { date: (() => { try { const d = new Date(renewalDate); return isNaN(d.getTime()) ? renewalDate : d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return renewalDate; } })() })}
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

        {/* Enable Button Slider */}
        <div className="pt-4">
          <EnableButtonSlider
            onSliderComplete={setIsCancellationEnabled}
            isLoading={isLoading}
            enabledText={t('cancellationEnabled', 'Opzegging knop geactiveerd')}
            sliderText={t('cancellationSliderText')}
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
            {t('keepSubscription')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isCancellationEnabled || isLoading}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              isCancellationEnabled && !isLoading
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {t('processing', 'Verwerken...')}
              </div>
            ) : (
              t('confirmCancellation', 'Bevestig Opzegging')
            )}
          </button>
        </div>

        {/* Additional Information */}
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2 border-t border-slate-200 dark:border-slate-700">
          <p>{t('cancellationAdditionalInfo')}</p>
          <p className="mt-1">{t('cancellationReactivateInfo')}</p>
        </div>
      </div>
    </Modal>
  );
};

export default CancellationConfirmationModal;