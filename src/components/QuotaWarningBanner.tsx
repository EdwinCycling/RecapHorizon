import React, { useState, useEffect } from 'react';
import { auth, getUserSubscriptionTier } from '../firebase';
import { quotaMonitoringService } from '../services/quotaMonitoringService';
import { SubscriptionTier } from '../../types';

interface QuotaWarningBannerProps {
  onUpgrade?: () => void;
}

const QuotaWarningBanner: React.FC<QuotaWarningBannerProps> = ({ onUpgrade }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [usageData, setUsageData] = useState<{ current: number; limit: number; percentage: number } | null>(null);

  useEffect(() => {
    const checkQuotaUsage = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        // Use actual user subscription tier; only FREE users should see warnings
        let tier: SubscriptionTier = SubscriptionTier.FREE;
        try {
          tier = await getUserSubscriptionTier(user.uid);
        } catch {}
        const warning = quotaMonitoringService.checkQuotaWarning(user.uid, tier);
        if (warning.shouldWarn) {
          setShowWarning(true);
          setUsageData({
            current: 50 - warning.requestsRemaining,
            limit: 50,
            percentage: Math.round(warning.usagePercentage)
          });
        } else {
          setShowWarning(false);
          setUsageData(null);
        }
      } catch (error) {
        console.warn('Failed to check quota usage:', error);
      }
    };

    // Check immediately
    checkQuotaUsage();

    // Check every 5 minutes
    const interval = setInterval(checkQuotaUsage, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (!showWarning || !usageData) {
    return null;
  }

  const isNearLimit = usageData.percentage >= 90;

  return (
    <div className={`fixed top-20 sm:top-24 left-4 right-4 z-40 max-w-md mx-auto p-4 rounded-lg shadow-lg border ${
      isNearLimit 
        ? 'bg-red-50 border-red-200 text-red-800' 
        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isNearLimit ? (
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {isNearLimit ? 'API Limiet Bijna Bereikt' : 'API Gebruik Waarschuwing'}
          </h3>
          <div className="mt-1 text-sm">
            <p>
              Je hebt {usageData.current} van {usageData.limit} gratis Gemini verzoeken gebruikt vandaag ({usageData.percentage}%).
            </p>
            {isNearLimit && (
              <p className="mt-1 font-medium">
                Upgrade naar een betaald abonnement voor onbeperkte toegang.
              </p>
            )}
          </div>
          {onUpgrade && (
            <div className="mt-3">
              <button
                onClick={onUpgrade}
                className={`text-sm font-medium underline hover:no-underline ${
                  isNearLimit ? 'text-red-700' : 'text-yellow-700'
                }`}
              >
                Upgrade Nu
              </button>
            </div>
          )}
        </div>
        <div className="ml-3 flex-shrink-0">
          <button
            onClick={() => setShowWarning(false)}
            className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isNearLimit 
                ? 'text-red-500 hover:bg-red-100 focus:ring-red-600' 
                : 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600'
            }`}
          >
            <span className="sr-only">Sluiten</span>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span>Dagelijks gebruik</span>
          <span>{usageData.percentage}%</span>
        </div>
        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isNearLimit ? 'bg-red-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(usageData.percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuotaWarningBanner;