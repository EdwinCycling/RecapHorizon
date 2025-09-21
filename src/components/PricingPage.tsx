import React from 'react';
import { SubscriptionTier, TierLimits } from '../../types';
import { subscriptionService } from '../subscriptionService';

interface PricingPageProps {
  isOpen: boolean;
  currentTier: SubscriptionTier;
  onUpgrade: (tier: SubscriptionTier) => void;
  onClose: () => void;
  t: (key: string, params?: any) => string; // Add translation function
  showComingSoonModal: () => void; // Add function to show coming soon modal
}

const PricingPage: React.FC<PricingPageProps> = ({ isOpen, currentTier, onUpgrade, onClose, t, showComingSoonModal }) => {
  if (!isOpen) return null;
  
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
        return 'border-gray-300 bg-gray-50';
      case SubscriptionTier.SILVER:
        return 'border-blue-300 bg-blue-50';
      case SubscriptionTier.GOLD:
        return 'border-yellow-300 bg-yellow-50';
      case SubscriptionTier.ENTERPRISE:
        return 'border-purple-300 bg-purple-50';
      case SubscriptionTier.DIAMOND:
        return 'border-cyan-300 bg-cyan-50';
      default:
        return 'border-gray-300 bg-gray-50';
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
    
    let result = '';
    if (extensions.length > 0) {
      result += extensions.join(', ');
    }
    if (mimeTypes.length > 0) {
      if (result) result += ', ';
      result += mimeTypes.join(', ');
    }
    return result || t('pricingOnlyTxt');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-full w-full max-h-[90vh] overflow-y-auto">
        {/* Header with SEO-optimized title */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h1 className="text-3xl font-medium text-gray-800 tracking-tight">{t('pricingTitle')}</h1>
            <p className="text-gray-600 mt-2">{t('choosePerfectPlan')}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-medium"
          >
            ×
          </button>
        </div>

        {/* Current Tier Info */}
        {currentTier && (
          <div className="p-6 bg-green-50 border-b">
            <div className="flex items-center">
              <span className="text-green-600 text-lg mr-2">✓</span>
              <span className="text-green-800">
                {currentTier === SubscriptionTier.DIAMOND
                  ? t('pricingCurrentTierAdmin', { tier: currentTier.charAt(0).toUpperCase() + currentTier.slice(1) })
                  : t('pricingCurrentTier', { tier: currentTier.charAt(0).toUpperCase() + currentTier.slice(1) })
                }
              </span>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tierComparison.map((tier) => (
            <div
              key={tier.tier}
              className={`border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${
                tier.tier === currentTier ? 'ring-2 ring-blue-500 scale-105' : ''
              } ${getTierColor(tier.tier)}`}
            >
              {/* Tier Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{getTierIcon(tier.tier)}</div>
                <h3 className="text-2xl font-medium text-gray-800 mb-2">
                  {tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)}
                </h3>
                {(tier.tier as SubscriptionTier) === SubscriptionTier.DIAMOND ? (
                  <div className="text-xl font-medium text-cyan-600">{t('pricingComingSoon')}</div>
                ) : tier.tier !== SubscriptionTier.ENTERPRISE ? (
                  <>
                    <div className="text-4xl font-medium text-gray-800">
                      €{tier.price}
                      <span className="text-lg text-gray-600">{t('pricingPerMonth')}</span>
                    </div>
                    {tier.minTerm > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        {t('pricingMinTerm', { months: tier.minTerm })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xl font-medium text-gray-800">{t('pricingPriceOnRequest')}</div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">
                    {t('pricingMinutesPerSession', { minutes: tier.maxSessionDuration })}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">
                    {tier.maxSessionsPerDay === -1 ? (
                      t('pricingUnlimited')
                    ) : (
                      t('pricingSessionsPerDay', { sessions: tier.maxSessionsPerDay })
                    )}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">
                    {tier.maxTranscriptLength === -1 ? (
                      t('pricingUnlimited')
                    ) : (
                      t('pricingTranscriptLength', { length: (tier.maxTranscriptLength / 1000).toFixed(1) })
                    )}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">
                    {t('pricingFileTypes', { types: formatFileTypes(tier.allowedFileTypes) })}
                  </span>
                </div>

                {/* New: Premium Features */}
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{t('pricingPremiumFeatures')}</h4>
                  <div className="space-y-2">
                    {tier.features?.chat && (
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm text-gray-700">
                          {t('pricingChatWithTranscript')}
                        </span>
                      </div>
                    )}

                    {tier.features?.exportPpt && (
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm text-gray-700">
                          {t('pricingPowerPointExport')}
                        </span>
                      </div>
                    )}
                    {tier.features?.businessCase && (
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm text-gray-700">
                          {t('pricingBusinessCaseGenerator')}
                        </span>
                      </div>
                    )}
                    {tier.features?.webPage && !tier.features?.webExpert && (
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm text-gray-700">
                          {t('pricingBasicWebPageImport', 'Basic Web Page Import (single URL)')}
                        </span>
                      </div>
                    )}
                    {tier.features?.webExpert && (
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm text-gray-700">
                          {t('pricingWebExpertImport', 'WebExpert URL Import (multiple pages)')}
                        </span>
                      </div>
                    )}
                    {(tier.tier === SubscriptionTier.GOLD || tier.tier === SubscriptionTier.ENTERPRISE) && (
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm text-gray-700">
                          {t('pricingImageUpload')}
                        </span>
                      </div>
                    )}
                    {(tier.tier === SubscriptionTier.GOLD || tier.tier === SubscriptionTier.ENTERPRISE) && (
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm text-gray-700">
                          {t('pricingEmailUpload')}
                        </span>
                      </div>
                    )}
                    {!tier.features?.chat && !tier.features?.exportPpt && !tier.features?.businessCase && !tier.features?.webPage && tier.tier !== SubscriptionTier.GOLD && tier.tier !== SubscriptionTier.ENTERPRISE && (
                      <div className="text-sm text-gray-400 italic">
                        {t('pricingNoPremiumFeatures')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                {tier.tier === currentTier ? (
                  <button
                    disabled
                    className="w-full py-3 px-6 bg-gray-300 text-gray-600 rounded font-medium cursor-not-allowed"
                  >
                    {t('pricingCurrentTierButton')}
                  </button>
                ) : (tier.tier as SubscriptionTier) === SubscriptionTier.DIAMOND ? (
                  <button
                    disabled
                    className="w-full py-3 px-6 bg-cyan-300 text-cyan-600 rounded font-medium cursor-not-allowed"
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

        {/* Additional Info */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              {t('pricingAdditionalInfo')}
            </p>
            <p className="mb-2">
              {t('pricingGoldEnterprise')}
            </p>
            <p>
              {t('pricingQuestions')}{' '}
              <a href="mailto:support@recaphorizon.nl" className="text-blue-600 hover:underline">
                {t('pricingSupportEmail')}
              </a>
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-3 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors"
          >
            {t('close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

