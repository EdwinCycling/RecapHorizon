import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { SubscriptionTier } from '../../types';
import { subscriptionService } from '../subscriptionService';

interface AudioUsageMeterProps {
  userTier: SubscriptionTier;
  monthlyAudioUsage: number;
  t: (key: string, params?: Record<string, any>) => string;
  theme: 'light' | 'dark';
  onShowPricing?: () => void;
}

const AudioUsageMeter: React.FC<AudioUsageMeterProps> = ({
  userTier,
  monthlyAudioUsage,
  t,
  theme,
  onShowPricing
}) => {
  const tierLimits = subscriptionService.getTierLimits(userTier);
  const monthlyLimit = tierLimits?.maxMonthlyAudioMinutes || 60;
  const isUnlimited = monthlyLimit === -1;
  const usagePercentage = isUnlimited ? 0 : monthlyLimit > 0 ? (monthlyAudioUsage / monthlyLimit) * 100 : 0;
  const remainingMinutes = isUnlimited ? -1 : Math.max(0, monthlyLimit - monthlyAudioUsage);
  const isApproachingLimit = usagePercentage >= 80 && !isUnlimited;

  const getProgressBarColor = () => {
    if (isUnlimited) return 'bg-green-500';
    if (usagePercentage >= 90) return 'bg-red-500';
    if (usagePercentage >= 80) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getTextColor = () => {
    return theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  };

  const getBgColor = () => {
    return theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  };

  const getBorderColor = () => {
    return theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  };

  return (
    <div className={`p-4 rounded-lg border ${getBgColor()} ${getBorderColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <span className={`font-medium ${getTextColor()}`}>
            {t('monthlyUsage')}
          </span>
        </div>
        <div className={`text-sm ${getTextColor()}`}>
          <span className="font-medium">{t('settingsCurrentTier')}: </span>
          <span className="capitalize">{userTier}</span>
        </div>
      </div>

      {isUnlimited ? (
        <div className="text-center py-4">
          <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-green-600 font-medium">
            {t('unlimitedAudio')}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-base font-mono text-slate-600 dark:text-slate-400">
                {monthlyAudioUsage} / {monthlyLimit}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  getProgressBarColor()
                }`}
                style={{ width: `${Math.min(100, usagePercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className={getTextColor()}>
                {Math.round(usagePercentage)}% {t('tokenUsageUsed')}
              </span>
              <span className={getTextColor()}>
                {remainingMinutes} {t('minutesRemaining')}
              </span>
            </div>
          </div>

          {isApproachingLimit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <p className="text-yellow-800 text-sm">
                {t('approachingAudioLimit')}
              </p>
            </div>
          )}

          {onShowPricing && !isUnlimited && (
            <button
              onClick={onShowPricing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              {t('upgradeForMore')}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default AudioUsageMeter;