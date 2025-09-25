import React, { useState, useEffect } from 'react';
import { SubscriptionTier } from '../../types';
import { subscriptionService } from '../subscriptionService';
import { getTotalTokenUsage, getUserMonthlyTokens, getUserMonthlySessions, auth } from '../firebase';

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
  const [isExpanded, setIsExpanded] = useState(false);

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
        onClick={() => setIsExpanded(!isExpanded)}
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
          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Slide Panel */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg z-50 p-4">
          {/* Monthly Usage */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('tokensThisMonth')}
              </span>
              <span className={`text-sm font-semibold ${isUnlimited ? 'text-green-600 dark:text-green-400' : getTextColor(monthlyPercentage)}`}>
                {formatTokenCount(monthlyUsage)} / {isUnlimited ? '∞' : formatTokenCount(tierLimits.maxTokensPerMonth)}
              </span>
            </div>
            {!isUnlimited && (
              <>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-1">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(monthlyPercentage)}`}
                    style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {monthlyPercentage.toFixed(1)}% {t('used')}
                  </span>
                  <span>
                    ({formatTokenCount(remainingTokens)} {t('remaining')})
                  </span>
                </div>
              </>
            )}
            {isUnlimited && (
              <div className="text-center text-xs text-green-600 dark:text-green-400 py-2">
                ✨ {t('unlimitedTokens')}
              </div>
            )}
          </div>

          {/* Sessions This Month */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('sessionsThisMonth')}
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {monthlySessions}
              </span>
            </div>
          </div>

          {/* Current Tier */}
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            {t('currentTier')}: <span className="font-medium capitalize">{userTier}</span>
            {onShowPricing ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onShowPricing();
                }}
                className="ml-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer bg-transparent border-none p-0"
              >
                {t('viewPricing')}
              </button>
            ) : (
              <a 
                href="/pricing" 
                className="ml-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
                onClick={(e) => e.stopPropagation()}
              >
                {t('viewPricing')}
              </a>
            )}
          </div>

          {/* Warning */}
          {monthlyPercentage >= 80 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                ⚠️ {t('approachingTokenLimit')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenUsageMeter;