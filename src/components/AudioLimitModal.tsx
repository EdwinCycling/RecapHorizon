import React from 'react';
import { SubscriptionTier, TranslationFunction } from '../../types';
import { Clock, AlertTriangle } from 'lucide-react';

interface AudioLimitModalProps {
  isOpen: boolean;
  currentTier: SubscriptionTier;
  minutesUsed: number;
  monthlyLimit: number;
  onUpgrade: (tier: SubscriptionTier) => void;
  onClose: () => void;
  t: TranslationFunction;
}

const AudioLimitModal: React.FC<AudioLimitModalProps> = ({
  isOpen,
  currentTier,
  minutesUsed,
  monthlyLimit,
  onUpgrade,
  onClose,
  t
}) => {
  if (!isOpen) return null;

  const handleUpgrade = (tier: SubscriptionTier) => {
    onUpgrade(tier);
    onClose();
  };

  const getUpgradeOptions = () => {
    switch (currentTier) {
      case SubscriptionTier.FREE:
        return [
          {
            tier: SubscriptionTier.SILVER,
            name: t('silverTier'),
            price: t('silverPrice'),
            limit: '500',
            icon: '🥈',
            color: 'blue'
          }
        ];
      case SubscriptionTier.SILVER:
        return [
          {
            tier: SubscriptionTier.GOLD,
            name: t('goldTier'),
            price: t('goldPrice'),
            limit: '1000',
            icon: '🥇',
            color: 'yellow'
          }
        ];
      default:
        return [];
    }
  };

  const upgradeOptions = getUpgradeOptions();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-3 w-6 h-6" />
            <h2 className="text-2xl font-medium text-gray-800 dark:text-slate-100 tracking-tight">
              {t('audioLimitReached')}
            </h2>
          </div>
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
            <Clock className="text-red-500 mr-3 mt-1 w-5 h-5" />
            <div>
              <p className="text-gray-700 dark:text-slate-300 text-lg mb-2">
                {t('audioLimitReachedMessage', { 
                  minutesUsed: Math.round(minutesUsed), 
                  monthlyLimit 
                })}
              </p>
              <p className="text-gray-600 dark:text-slate-400">
                {t('audioLimitUpgradePrompt')}
              </p>
            </div>
          </div>

          {/* Current Usage */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-800 dark:text-red-200 font-medium">
                {t('currentUsage')}
              </span>
              <span className="text-red-600 dark:text-red-400 font-bold">
                {Math.round(minutesUsed)} / {monthlyLimit} {t('minutes')}
              </span>
            </div>
            <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${Math.min((minutesUsed / monthlyLimit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Upgrade Options */}
          {upgradeOptions.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-slate-100">
                {t('upgradeForMoreMinutes')}
              </h3>
              {upgradeOptions.map((option) => (
                <div 
                  key={option.tier}
                  className={`border-2 border-${option.color}-200 dark:border-${option.color}-700 rounded-lg p-4 bg-${option.color}-50 dark:bg-${option.color}-900/20`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{option.icon}</span>
                      <div>
                        <h4 className="text-xl font-medium text-gray-800 dark:text-slate-100">
                          {option.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          {t('audioMinutesPerMonth', { limit: option.limit })}
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-medium text-${option.color}-600 dark:text-${option.color}-400`}>
                      {option.price}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpgrade(option.tier)}
                    className={`w-full py-2 px-4 bg-${option.color}-500 text-white rounded font-medium hover:bg-${option.color}-600 transition-colors`}
                  >
                    {t('upgradeTo', { tier: option.name })}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Gold Tier Message */}
          {currentTier === SubscriptionTier.GOLD && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🥇</span>
                <div>
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                    {t('goldTierLimitReached')}
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    {t('goldTierContactSupport')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* View Pricing Link */}
          <div className="text-center">
            <a 
              href="/pricing" 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline"
              onClick={onClose}
            >
              {t('viewAllPricingOptions')}
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 font-medium"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioLimitModal;