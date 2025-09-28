import React, { useState, useEffect } from 'react';
import { SubscriptionTier } from '../../types';
import { subscriptionService } from '../subscriptionService';
import { getTotalTokenUsage, getUserMonthlyTokens, getUserMonthlySessions, auth } from '../firebase';
import Modal from './Modal';

interface TokenUsageMeterProps {
  userTier?: SubscriptionTier;
  t: (key: string) => string;
  onShowPricing?: () => void;
}

const TokenUsageMeter: React.FC<TokenUsageMeterProps> = ({
  userTier = SubscriptionTier.FREE,
  t,
  onShowPricing
}) => {
  const [monthlyUsage, setMonthlyUsage] = useState<number>(0);
  const [monthlySessions, setMonthlySessions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTokenUsage = async () => {
      // Wait for auth to be fully initialized
      if (!auth.currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const monthlyTokens = await getUserMonthlyTokens(auth.currentUser.uid);
        const sessionsData = await getUserMonthlySessions(auth.currentUser.uid);
        setMonthlyUsage(monthlyTokens.totalTokens);
        setMonthlySessions(sessionsData.sessions);
      } catch (err) {
        console.error('Error fetching token usage:', err);
        setError('Failed to load token usage data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenUsage();
  }, [userTier, auth.currentUser]);

  const tierLimits = subscriptionService.getTierLimits(userTier);
  if (!tierLimits) {
    return null;
  }

  // Check if user has unlimited tokens (Diamond tier)
  const isUnlimited = tierLimits.maxTokensPerMonth === -1;
  const monthlyPercentage = isUnlimited ? 0 : subscriptionService.getTokenUsagePercentage(userTier, monthlyUsage, 'monthly');
  const remainingTokens = isUnlimited ? Infinity : Math.max(0, tierLimits.maxTokensPerMonth - monthlyUsage);

  const getProgressBarColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 75) return 'text-orange-600 dark:text-orange-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const formatTokenCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (isLoading) {
    return (
      <div className="relative">
        <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          <div className="w-4 h-4 animate-pulse bg-slate-300 dark:bg-slate-600 rounded"></div>
          <span>{t('loading')}</span>
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          <span>⚠️</span>
          <span>{t('error')}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Compact Button */}
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all duration-200 ${
          monthlyPercentage >= 80 
            ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/30'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
        }`}
      >
        <div className="w-4 h-4 flex items-center justify-center">
          {monthlyPercentage >= 90 ? '🔴' : monthlyPercentage >= 75 ? '🟡' : '🟢'}
        </div>
        <span className="font-medium">
          {formatTokenCount(monthlyUsage)}/{isUnlimited ? '∞' : formatTokenCount(tierLimits.maxTokensPerMonth)}
        </span>
        <svg 
          className="w-4 h-4 ml-1"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Usage Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={t('tokenUsageOverview') || 'Token Usage Overview'}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {/* Monthly Usage */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                {t('tokensThisMonth')}
              </h4>
              <span className={`text-lg font-bold ${isUnlimited ? 'text-green-600 dark:text-green-400' : getTextColor(monthlyPercentage)}`}>
                {formatTokenCount(monthlyUsage)} / {isUnlimited ? '∞' : formatTokenCount(tierLimits.maxTokensPerMonth)}
              </span>
            </div>
            {!isUnlimited && (
              <>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(monthlyPercentage)}`}
                    style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>
                    {monthlyPercentage.toFixed(1)}% {t('used')}
                  </span>
                  <span>
                    {formatTokenCount(remainingTokens)} {t('remaining')}
                  </span>
                </div>
              </>
            )}
            {isUnlimited && (
              <div className="text-center text-sm text-green-600 dark:text-green-400 py-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                ✨ {t('unlimitedTokens')}
              </div>
            )}
          </div>

          {/* Sessions This Month */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                {t('sessionsThisMonth')}
              </h4>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {monthlySessions}
              </span>
            </div>
          </div>

          {/* Current Tier */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                {t('currentTier')}
              </h4>
              <span className="text-lg font-bold capitalize text-slate-700 dark:text-slate-300">
                {userTier}
              </span>
            </div>
            <div className="mt-3">
              {onShowPricing ? (
                <button 
                  onClick={() => {
                    setShowModal(false);
                    onShowPricing();
                  }}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
                >
                  {t('viewPricing')}
                </button>
              ) : (
                <a 
                  href="/pricing" 
                  className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium text-center"
                >
                  {t('viewPricing')}
                </a>
              )}
            </div>
          </div>

          {/* Warning */}
          {monthlyPercentage >= 80 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                    {t('warningTitle') || 'Usage Warning'}
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {t('approachingTokenLimit')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TokenUsageMeter;