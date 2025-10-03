import React, { useState, useEffect } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { SubscriptionTier } from '../utils/aiProviderManager';
import { subscriptionService } from '../subscriptionService';
import { getTotalTokenUsage, getUserMonthlySessions, getUserMonthlyAudioMinutes } from '../firebase';
import { auth } from '../firebase';
import Modal from './Modal';
import AudioUsageMeter from './AudioUsageMeter';

interface UsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTier: SubscriptionTier;
  t: (key: string) => string;
  theme: 'light' | 'dark';
  onShowPricing: () => void;
}

const UsageModal: React.FC<UsageModalProps> = ({ 
  isOpen, 
  onClose, 
  userTier, 
  t, 
  theme, 
  onShowPricing 
}) => {
  const [monthlyUsage, setMonthlyUsage] = useState<number>(0);
  const [monthlySessions, setMonthlySessions] = useState<number>(0);
  const [monthlyAudioUsage, setMonthlyAudioUsage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      loadUsageData();
    }
  }, [isOpen, auth.currentUser]);

  const loadUsageData = async () => {
    if (!auth.currentUser) {
      return;
    }

    setIsLoading(true);
    
    try {
      const [usage, sessions, audioUsage] = await Promise.all([
        getTotalTokenUsage(auth.currentUser.uid, 'monthly'),
        getUserMonthlySessions(auth.currentUser.uid),
        getUserMonthlyAudioMinutes(auth.currentUser.uid)
      ]);
      
      setMonthlyUsage(usage);
      setMonthlySessions(sessions.sessions);
      setMonthlyAudioUsage(audioUsage.minutes);
    } catch (error) {
      console.error('Error loading usage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  const getProgressBarColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!isOpen) return null;

  const tierLimits = subscriptionService.getTierLimits(userTier);
  const monthlyTokenLimit = tierLimits?.maxTokensPerMonth || 0;
  const tokenUsagePercentage = monthlyTokenLimit === -1 ? 0 : monthlyTokenLimit > 0 ? (monthlyUsage / monthlyTokenLimit) * 100 : 0;
  const remainingTokens = monthlyTokenLimit === -1 ? -1 : Math.max(0, monthlyTokenLimit - monthlyUsage);
  
  const monthlySessionLimit = tierLimits?.maxSessionsPerDay || 0;
  const sessionUsagePercentage = monthlySessionLimit === -1 ? 0 : monthlySessionLimit > 0 ? (monthlySessions / monthlySessionLimit) * 100 : 0;
  const remainingSessions = monthlySessionLimit === -1 ? -1 : Math.max(0, monthlySessionLimit - monthlySessions);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t('usageOverview')} 
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t('loadingUsage')}
              </div>
            </div>
          ) : (
            <>
              {/* Header with Icon */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    {t('usageOverview')}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('currentPlan')}: <span className="font-medium">{t(userTier)}</span>
                    </p>
                    <button
                      onClick={() => {
                        onShowPricing();
                        onClose();
                      }}
                      className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-200 border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                    >
                      {t('changePlan')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Token Usage Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    {t('tokenUsage')}
                  </h4>
                  <span className="text-base font-mono text-slate-600 dark:text-slate-400">
                    {formatTokens(monthlyUsage)} / {monthlyTokenLimit === -1 ? '∞' : formatTokens(monthlyTokenLimit)}
                  </span>
                </div>
                {monthlyTokenLimit !== -1 ? (
                  <>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          getProgressBarColor(tokenUsagePercentage)
                        }`}
                        style={{ width: `${Math.min(100, tokenUsagePercentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {Math.round(tokenUsagePercentage)}% {t('used')}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {formatTokens(remainingTokens)} {t('remaining')}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      ✨ {t('unlimitedTokens')}
                    </span>
                  </div>
                )}
              </div>

              {/* Audio Usage Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <AudioUsageMeter
                  userTier={userTier}
                  monthlyAudioUsage={monthlyAudioUsage}
                  t={t}
                  theme={theme}
                  onShowPricing={onShowPricing}
                />
              </div>

              {/* Session Usage Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                    {t('sessionUsage')}
                  </h4>
                  <span className="text-base font-mono text-slate-600 dark:text-slate-400">
                    {monthlySessions} / {monthlySessionLimit === -1 ? '∞' : monthlySessionLimit}
                  </span>
                </div>
                {monthlySessionLimit !== -1 ? (
                  <>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          getProgressBarColor(sessionUsagePercentage)
                        }`}
                        style={{ width: `${Math.min(100, sessionUsagePercentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {Math.round(sessionUsagePercentage)}% {t('used')}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {remainingSessions} {t('remaining')}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      ✨ {t('unlimitedSessions')}
                    </span>
                  </div>
                )}
              </div>

              {/* Upgrade Section */}
              {userTier === 'free' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      {t('upgradeForMore')}
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                      {t('upgradeDescription')}
                    </p>
                    <button
                      onClick={() => {
                        onShowPricing();
                        onClose();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      {t('viewPricing')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
      </div>
    </Modal>
  );
};

export default UsageModal;