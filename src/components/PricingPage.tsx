import React from 'react';
import { SubscriptionTier, TierLimits, UserSubscription } from '../../types';
import { subscriptionService } from '../subscriptionService';

interface PricingPageProps {
  currentTier: SubscriptionTier;
  userSubscription?: UserSubscription; // Add user subscription data
  onUpgrade: (tier: SubscriptionTier) => void;
  onClose?: () => void;
  t: (key: string, params?: any) => string; // Add translation function
  showComingSoonModal: () => void; // Add function to show coming soon modal
}

const PricingPage: React.FC<PricingPageProps> = ({ currentTier, userSubscription, onUpgrade, onClose, t, showComingSoonModal }) => {
  // Get tier comparison - DIAMOND tier alleen tonen indien gewenst
  const tierComparison = subscriptionService.getTierComparison();

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.FREE:
        return '🆓';
      case SubscriptionTier.SILVER:
        return '🥈';
      case SubscriptionTier.GOLD:
        return '🥇';
      case SubscriptionTier.ENTERPRISE:
        return '🏢';
      case SubscriptionTier.DIAMOND:
        return '💎';
      default:
        return '📋';
    }
  };

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.FREE:
        return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800';
      case SubscriptionTier.SILVER:
        return 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case SubscriptionTier.GOLD:
        return 'border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case SubscriptionTier.ENTERPRISE:
        return 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case SubscriptionTier.DIAMOND:
        return 'border-cyan-300 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20';
      default:
        return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getTierButtonColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.FREE:
        return 'bg-gray-500 hover:bg-gray-600';
      case SubscriptionTier.SILVER:
        return 'bg-blue-500 hover:bg-blue-600';
      case SubscriptionTier.GOLD:
        return 'bg-yellow-500 hover:bg-yellow-600';
      case SubscriptionTier.ENTERPRISE:
        return 'bg-purple-600 hover:bg-purple-700';
      case SubscriptionTier.DIAMOND:
        return 'bg-cyan-600 hover:bg-cyan-700';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const formatFileTypes = (fileTypes: string[]) => {
    const extensions = fileTypes.filter(type => type.startsWith('.'));
    const mimeTypes = fileTypes.filter(type => !type.startsWith('.'));
    
    // For mobile, show only extensions to keep it concise
    if (extensions.length > 0) {
      return extensions.join(', ');
    }
    
    // Fallback to mime types if no extensions
    return mimeTypes.length > 0 ? mimeTypes.slice(0, 3).join(', ') + (mimeTypes.length > 3 ? '...' : '') : t('pricingOnlyTxt');
  };

  const getAIModelDescription = (tier: SubscriptionTier): string => {
    switch (tier) {
      case SubscriptionTier.FREE:
        return t('pricingAIModelFree');
      case SubscriptionTier.SILVER:
        return t('pricingAIModelSilver');
      case SubscriptionTier.GOLD:
        return t('pricingAIModelGold');
      case SubscriptionTier.DIAMOND:
        return t('pricingAIModelDiamond');
      case SubscriptionTier.ENTERPRISE:
        return t('pricingAIModelEnterprise');
      default:
        return t('pricingAIModelFree');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="min-h-full py-4 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with SEO-optimized title */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b bg-white dark:bg-gray-800 rounded-t-lg">
          <div className="flex-1 text-center">
            <h1 className="text-2xl sm:text-3xl font-medium text-gray-800 dark:text-white tracking-tight">{t('pricingTitle')}</h1>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-medium ml-4"
            >
              ×
            </button>
          )}
        </div>

        {/* Current Tier Info */}
        {currentTier && (
          <div className="p-4 sm:p-6 bg-green-50 dark:bg-green-900/20 border-b bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-green-600 dark:text-green-400 text-lg mr-2">✓</span>
                <span className="text-green-800 dark:text-green-200">
                  {currentTier === SubscriptionTier.DIAMOND
                    ? t('pricingCurrentTierAdmin', { tier: currentTier.charAt(0).toUpperCase() + currentTier.slice(1) })
                    : t('pricingCurrentTier', { tier: currentTier.charAt(0).toUpperCase() + currentTier.slice(1) })
                  }
                </span>
              </div>
              {/* Trial End Date for Free Users */}
              {currentTier === SubscriptionTier.FREE && userSubscription && (
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  {(() => {
                    const remainingDays = subscriptionService.getRemainingTrialDays(userSubscription);
                    const trialEndDate = userSubscription.trialEndDate || subscriptionService.calculateTrialEndDate(userSubscription.startDate);
                    const isExpired = subscriptionService.isTrialExpired(userSubscription);
                    
                    if (isExpired) {
                      return t('pricingTrialExpired', 'Proefperiode verlopen');
                    } else {
                      return t('pricingTrialEndsOn', { 
                        date: trialEndDate.toLocaleDateString('nl-NL'),
                        days: remainingDays 
                      }) || `Proefperiode eindigt op ${trialEndDate.toLocaleDateString('nl-NL')} (${remainingDays} dagen)`;
                    }
                  })()
                  }
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 bg-gray-50 dark:bg-gray-900">
          {tierComparison.map((tier) => (
            <div
              key={tier.tier}
              className={`border-2 rounded-lg p-4 sm:p-6 transition-all duration-200 hover:shadow-lg bg-white dark:bg-gray-800 flex flex-col ${
                tier.tier === currentTier ? 'ring-2 ring-blue-500 scale-105' : ''
              } ${getTierColor(tier.tier).replace(/bg-\S+/g, '').trim()}`}
            >
              {/* Tier Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{getTierIcon(tier.tier)}</div>
                <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-white mb-2 break-words">
                  {tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)}
                </h3>
                {(tier.tier as SubscriptionTier) === SubscriptionTier.DIAMOND ? (
                  <div className="text-xl font-medium text-cyan-600 dark:text-cyan-400">{t('pricingComingSoon')}</div>
                ) : tier.tier !== SubscriptionTier.ENTERPRISE ? (
                  <>
                    <div className="text-2xl sm:text-4xl font-medium text-gray-800 dark:text-white break-words">
                      €{tier.price}
                      {(tier.tier as SubscriptionTier) !== SubscriptionTier.FREE && (
                        <span className="text-lg text-gray-600 dark:text-gray-300">{t('pricingPerMonth')}</span>
                      )}
                    </div>
                    {/* Free for 4 weeks text for FREE tier */}
                    {(tier.tier as SubscriptionTier) === SubscriptionTier.FREE && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('pricingFreeFor4Weeks', 'Gratis voor 4 weken')}
                      </div>
                    )}
                    {tier.minTerm > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {t('pricingMinTerm', { months: tier.minTerm })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xl font-medium text-gray-800 dark:text-white">{t('pricingPriceOnRequest')}</div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-6 flex-grow">
                <div className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0">✓</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {t('pricingMinutesPerSession', { minutes: tier.maxSessionDuration })}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0">✓</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {tier.maxSessionsPerDay === -1 ? (
                      t('pricingUnlimited')
                    ) : (
                      t('pricingSessionsPerDay', { sessions: tier.maxSessionsPerDay })
                    )}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0">✓</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {tier.maxTranscriptLength === -1 ? (
                      t('pricingUnlimited')
                    ) : (
                      t('pricingTranscriptLength', { length: (tier.maxTranscriptLength / 1000).toFixed(1) })
                    )}
                  </span>
                </div>
                
                <div className="flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm break-words overflow-hidden">
                    <span className="block">{t('pricingFileTypes').split(':')[0]}:</span>
                    <span className="block text-xs mt-1 leading-relaxed">{formatFileTypes(tier.allowedFileTypes)}</span>
                  </span>
                </div>

                {/* New: Premium Features */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pricingPremiumFeatures')}</h4>
                  <div className="space-y-2">
                    {tier.features?.chat && (
                      <div className="flex items-center">
                        <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('pricingChatWithTranscript')}
                        </span>
                      </div>
                    )}

                    {tier.features?.exportPpt && (
                      <div className="flex items-center">
                        <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('pricingPowerPointExport')}
                        </span>
                      </div>
                    )}
                    {tier.features?.businessCase && (
                      <div className="flex items-center">
                        <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('pricingBusinessCaseGenerator')}
                        </span>
                      </div>
                    )}
                    {tier.features?.webPage && !tier.features?.webExpert && (
                      <div className="flex items-center">
                        <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('pricingBasicWebPageImport', 'Basic Web Page Import (single URL)')}
                        </span>
                      </div>
                    )}
                    {tier.features?.webExpert && (
                      <div className="flex items-center">
                        <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('pricingWebExpertImport', 'WebExpert URL Import (multiple pages)')}
                        </span>
                      </div>
                    )}
                    {(tier.tier === SubscriptionTier.GOLD || tier.tier === SubscriptionTier.ENTERPRISE) && (
                      <div className="flex items-center">
                        <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('pricingImageUpload')}
                        </span>
                      </div>
                    )}
                    {(tier.tier === SubscriptionTier.GOLD || tier.tier === SubscriptionTier.ENTERPRISE) && (
                      <div className="flex items-center">
                        <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('pricingEmailUpload')}
                        </span>
                      </div>
                    )}
                    {!tier.features?.chat && !tier.features?.exportPpt && !tier.features?.businessCase && !tier.features?.webPage && tier.tier !== SubscriptionTier.GOLD && tier.tier !== SubscriptionTier.ENTERPRISE && (
                      <div className="text-sm text-gray-400 dark:text-gray-500 italic">
                        {t('pricingNoPremiumFeatures')}
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Model Information */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="mr-1">🤖</span>
                    {t('pricingAIModels')}
                  </h4>
                  <div className="flex items-start">
                    <span className="text-blue-500 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0">ⓘ</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {getAIModelDescription(tier.tier as SubscriptionTier)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center mt-auto">
                {tier.tier === currentTier ? (
                  <button
                    disabled
                    className="w-full py-3 px-6 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded font-medium cursor-not-allowed"
                  >
                    {t('pricingCurrentTierButton')}
                  </button>
                ) : (tier.tier as SubscriptionTier) === SubscriptionTier.DIAMOND ? (
                  <button
                    disabled
                    className="w-full py-3 px-6 bg-cyan-300 dark:bg-cyan-600 text-cyan-600 dark:text-cyan-400 rounded font-medium cursor-not-allowed"
                  >
                    {t('pricingAdminOnly')}
                  </button>
                ) : (
                  <button
                    onClick={() => showComingSoonModal()}
                    className={`w-full py-3 px-6 text-white rounded font-medium transition-colors ${getTierButtonColor(tier.tier)}`}
                  >
                    {tier.tier === SubscriptionTier.FREE ? t('pricingStartFree') : (tier.tier === SubscriptionTier.ENTERPRISE ? t('pricingContactEnterprise') : t('pricingUpgradeTo', { tier: tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1) }))}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>



        {/* Close Button */}
        {onClose && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-600 flex justify-end bg-white dark:bg-gray-800 rounded-b-lg">
            <button 
              onClick={onClose} 
              className="px-6 py-3 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors"
            >
              {t('close', 'Close')}
            </button>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

