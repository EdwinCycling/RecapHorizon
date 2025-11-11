import React from 'react';
import { SubscriptionTier, TranslationFunction } from '../../types';

interface SubscriptionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: SubscriptionTier;
  userEmail: string;
  renewalDate?: Date;
  t: TranslationFunction;
}

const SubscriptionSuccessModal: React.FC<SubscriptionSuccessModalProps> = ({ 
  isOpen, 
  onClose, 
  tier, 
  userEmail, 
  renewalDate,
  t 
}) => {
  if (!isOpen) return null;

  const formatRenewalDate = (date: Date) => {
    const months = [
      t('january'), t('february'), t('march'), t('april'), t('may'), t('june'),
      t('july'), t('august'), t('september'), t('october'), t('november'), t('december')
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getDefaultRenewalDate = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth;
  };

  const displayRenewalDate = renewalDate || getDefaultRenewalDate();

  const getTierInfo = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.SILVER:
        return {
          name: 'Silver',
          color: 'text-gray-600',
          bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200',
          icon: '🥈',
          features: [
            t('unlimitedAiAnalyses'),
            t('advancedSummaries'),
            t('pdfExport') + '/' + t('wordExport'),
            t('emailSupport')
          ]
        };
      case SubscriptionTier.GOLD:
        return {
          name: 'Gold',
          color: 'text-yellow-600',
          bgColor: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
          icon: '🥇',
          features: [
            t('unlimitedAiAnalyses'),
            t('advancedSummaries'),
            t('pdfExport') + '/' + t('wordExport'),
            t('chatWithTranscript'),
            t('powerpointExport'),
            t('businessCaseGenerator'),
            t('emailSupport')
          ]
        };
      case SubscriptionTier.ENTERPRISE:
        return {
          name: 'Enterprise',
          color: 'text-blue-600',
          bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200',
          icon: '🏢',
          features: [
            t('unlimitedAiAnalyses'),
            t('advancedSummaries'),
            t('pdfExport') + '/' + t('wordExport'),
            t('chatWithTranscript'),
            t('powerpointExport'),
            t('businessCaseGenerator'),
            t('webPageImport'),
            t('emailSupport')
          ]
        };
      default:
        return {
          name: 'Premium',
          color: 'text-blue-600',
          bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200',
          icon: '⭐',
          features: []
        };
    }
  };

  const tierInfo = getTierInfo(tier);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101] p-4">
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header with celebration */}
        <div className={`${tierInfo.bgColor} px-6 py-8 text-center rounded-t-xl`}>
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {t('congratulations')}
          </h2>
          <p className="text-slate-600 text-lg">
            {t('yourSubscriptionIsActive', { tierName: tierInfo.name })}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tier Badge */}
          <div className="flex items-center justify-center">
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-full ${tierInfo.bgColor} border-2 border-slate-200`}>
              <span className="text-2xl">{tierInfo.icon}</span>
              <span className={`font-semibold text-lg ${tierInfo.color}`}>
                {tierInfo.name} {t('plan')}
              </span>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-3">
            <div className="text-green-600 dark:text-green-400 text-4xl">✅</div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              {t('paymentSuccessful')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t('subscriptionActiveImmediately')}
            </p>
          </div>

          {/* Account Info */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-slate-800 dark:text-slate-100">{t('accountDetails')}</h4>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <p><span className="font-medium">Email:</span> {userEmail}</p>
              <p><span className="font-medium">{t('plan')}:</span> {tierInfo.name}</p>
              <p><span className="font-medium">{t('status')}:</span> <span className="text-green-600">{t('active')}</span></p>
              <p><span className="font-medium">{t('renewal')}:</span> {formatRenewalDate(displayRenewalDate)}</p>
            </div>
          </div>

          {/* Features */}
          {tierInfo.features.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-slate-800 dark:text-slate-100">
                {t('featuresAvailable')}
              </h4>
              <ul className="space-y-2">
                {tierInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <span className="text-green-500 text-sm">✓</span>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">{t('nextSteps')}</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• {t('confirmationEmail')}</li>
              <li>• {t('allFeaturesAvailable', { tierName: tierInfo.name.toLowerCase() })}</li>
              <li>• {t('manageSubscriptionViaSettings')}</li>
              <li>• {t('supportContact')} {t('supportEmail')}</li>
            </ul>
          </div>

          {/* Thank You Message */}
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
              {t('thankYouTrust')} 🙏
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('thankYouMessage')}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {t('startWithRecapHorizon')} 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessModal;