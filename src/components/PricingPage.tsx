import React, { useState, useEffect } from 'react';
import { SubscriptionTier, TierLimits, UserSubscription, TranslationFunction } from '../../types';
import { subscriptionService } from '../subscriptionService';
import { stripeService } from '../services/stripeService';
import { getUserStripeData, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { displayToast } from '../utils/clipboard';
import CancellationGoodbyeModal from './CancellationGoodbyeModal';
import EnterpriseContactModal from './EnterpriseContactModal';
import ReactivationSuccessModal from './ReactivationSuccessModal';
import DowngradeConfirmationModal from './DowngradeConfirmationModal';
import CancellationConfirmationModal from './CancellationConfirmationModal';

interface PricingPageProps {
  currentTier: SubscriptionTier;
  userSubscription?: UserSubscription;
  onUpgrade: (tier: SubscriptionTier) => void;
  onClose?: () => void;
  t: TranslationFunction;
  userId: string;
  userEmail: string;
  isLoggedIn: boolean;
  showComingSoonModal?: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ currentTier, userSubscription, onUpgrade, onClose, t, userId, userEmail, isLoggedIn, showComingSoonModal }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<Date | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [scheduledTierChange, setScheduledTierChange] = useState<any | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelEffectiveDate, setCancelEffectiveDate] = useState<string | Date | { seconds?: number } | null>(null);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState<boolean>(false);
  const [showReactivationModal, setShowReactivationModal] = useState(false);
  const [reactivationEffectiveDate, setReactivationEffectiveDate] = useState<string | null>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [targetTier, setTargetTier] = useState<SubscriptionTier | null>(null);
  const isHorizonEligible = currentTier === SubscriptionTier.SILVER || currentTier === SubscriptionTier.GOLD;
  // Get tier comparison - DIAMOND tier alleen tonen indien gewenst
  const tierComparison = subscriptionService.getTierComparison();

  // Bepaal of er een opzegging is ingepland en de ingangsdatum nog in de toekomst ligt
  const isCancelScheduledInFuture = (() => {
    if (scheduledTierChange?.action === 'cancel') {
      const eff = scheduledTierChange?.effectiveDate as any;
      const d = eff?.seconds ? new Date(eff.seconds * 1000) : new Date(eff);
      return d.getTime() > Date.now();
    }
    return false;
  })();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (isLoggedIn && userId) {
          const stripeData = await getUserStripeData(userId);
          if (isMounted) {
            setNextBillingDate(stripeData.nextBillingDate ?? null);
            setStripeCustomerId(stripeData?.stripeCustomerId || null);
            setScheduledTierChange(stripeData?.scheduledTierChange || null);
          }
        }
      } catch (e) {
        console.warn('Kon Stripe gegevens niet ophalen voor vervaldatum Horizon pakket:', e);
      }
    })();
    return () => { isMounted = false; };
  }, [isLoggedIn, userId]);

  // Function to refresh subscription data
  const refreshSubscriptionData = async () => {
    try {
      if (isLoggedIn && userId) {
        const stripeData = await getUserStripeData(userId);
        setNextBillingDate(stripeData.nextBillingDate ?? null);
        setStripeCustomerId(stripeData?.stripeCustomerId || null);
        setScheduledTierChange(stripeData?.scheduledTierChange || null);
      }
    } catch (e) {
      console.warn('Kon Stripe gegevens niet refreshen:', e);
    }
  };

  // Function to verify subscription update after reactivation
  const verifySubscriptionUpdate = async (subscriptionId: string) => {
    try {
      console.log('Verifying subscription update for:', subscriptionId);
      
      // Multiple verification attempts with increasing delays
      const maxAttempts = 3;
      let attempt = 1;
      
      while (attempt <= maxAttempts) {
        console.log(`Verification attempt ${attempt}/${maxAttempts}`);
        
        // Wait for webhook processing (longer delay for later attempts)
        const delay = attempt * 2000; // 2s, 4s, 6s
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Refresh subscription data
        await refreshSubscriptionData();
        
        // Check if scheduled cancellation is cleared
        if (isLoggedIn && userId) {
          const stripeData = await getUserStripeData(userId);
          
          if (!stripeData?.scheduledTierChange) {
            console.log(`Subscription verification successful on attempt ${attempt}`);
            return; // Success - exit early
          } else {
            console.warn(`Attempt ${attempt}: Scheduled tier change still exists:`, stripeData.scheduledTierChange);
          }
        }
        
        attempt++;
      }
      
      // If verification failed, try to directly remove scheduledTierChange
      console.log('Webhook processing may have failed, attempting direct Firebase update...');
      await removeScheduledTierChange();
      
      console.warn('Subscription verification completed but scheduled cancellation may still exist');
      console.log('Note: Changes may take a few minutes to appear due to webhook processing delays');
      
    } catch (error) {
      console.error('Error verifying subscription update:', error);
      // Don't throw error - this is just verification
    }
  };

  // Function to directly remove scheduledTierChange from Firebase
  const removeScheduledTierChange = async () => {
    if (!isLoggedIn || !userId) return;
    
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        scheduledTierChange: null
      });
      console.log('Successfully removed scheduledTierChange directly');
      
      // Refresh data after direct update
      await refreshSubscriptionData();
    } catch (error) {
      console.error('Failed to remove scheduledTierChange directly:', error);
    }
  };

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

  // Helper: format limit values for display (supports "Onbeperkt")
  const formatLimitValue = (value: number, unit?: string) => {
    if (value === -1) return t('pricingUnlimited');
    const formatted = value.toLocaleString('nl-NL');
    return unit ? `${formatted} ${unit}` : formatted;
  };

  const handleUpgrade = async (tier: SubscriptionTier) => {
    // Enterprise: contact
    if (tier === SubscriptionTier.ENTERPRISE) {
      setShowEnterpriseModal(true);
      return;
    }
    // Diamond: admin-only
    if (tier === SubscriptionTier.DIAMOND) {
      return;
    }

    // Free user upgrading to paid -> Stripe Checkout
    if (currentTier === SubscriptionTier.FREE) {
      if (tier === SubscriptionTier.FREE) {
        // No action on selecting Free when already Free
        return;
      }
      setIsLoading(tier);
      try {
        await stripeService.redirectToCheckout(tier, userId, userEmail);
      } catch (error) {
        console.error('Error redirecting to checkout:', error);
        displayToast(t('pricingCheckoutError'), 'error');
        setIsLoading(null);
      }
      return;
    }

    // Paid user -> cancel to Free OR change plan
    if (!stripeCustomerId) {
      displayToast(t('pricingPortalMissingCustomer'), 'error');
      return;
    }

    // If selecting Free while paid, show cancellation confirmation modal
    if (tier === SubscriptionTier.FREE) {
      setTargetTier(tier);
      setShowCancellationModal(true);
      return;
    }

    // Check if this is a downgrade (excluding Free tier)
    const tierOrder = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.SILVER]: 1,
      [SubscriptionTier.GOLD]: 2,
      [SubscriptionTier.ENTERPRISE]: 3,
      [SubscriptionTier.DIAMOND]: 4,
    };

    const isDowngrade = tierOrder[tier] < tierOrder[currentTier];
    
    if (isDowngrade) {
      setTargetTier(tier);
      setShowDowngradeModal(true);
      return;
    }

    // Otherwise, change plan via Stripe Customer Portal
    try {
      if (userEmail) {
        localStorage.setItem('checkout_email', userEmail);
      }
      localStorage.setItem('checkout_tier', currentTier);
      await stripeService.redirectToCustomerPortal(stripeCustomerId);
    } catch (error) {
      console.error('Error redirecting to customer portal:', error);
      displayToast(t('subscriptionPortalError'), 'error');
    } finally {
      setIsLoading(null);
    }
  };

  const getPriceDisplay = (tier: SubscriptionTier) => {
    // Deze prijzen moeten overeenkomen met je Stripe prijzen (alleen monthly)
    const prices = {
      [SubscriptionTier.SILVER]: 6,
      [SubscriptionTier.GOLD]: 10
    };

    if (tier === SubscriptionTier.FREE) {
      return t('pricingFreeFor4Weeks');
    }

    if (tier === SubscriptionTier.DIAMOND) {
      return t('pricingAdminOnly');
    }

    if (tier === SubscriptionTier.ENTERPRISE) {
      return t('pricingPriceOnRequest');
    }

    const price = prices[tier];
    if (!price) return '';

    return `€${price}${t('pricingPerMonth', '/maand')}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 overflow-hidden">
      {/* Enterprise Contact Modal */}
      <EnterpriseContactModal
        isOpen={showEnterpriseModal}
        onClose={() => setShowEnterpriseModal(false)}
        t={t}
        userEmail={isLoggedIn ? userEmail : undefined}
      />

      {/* Reactivation Success Modal */}
      <ReactivationSuccessModal
        isOpen={showReactivationModal}
        onClose={async () => {
          setShowReactivationModal(false);
          // Refresh subscription data after closing modal
          await refreshSubscriptionData();
        }}
        t={t}
        effectiveDate={reactivationEffectiveDate}
        stripeCustomerId={stripeCustomerId}
      />

      {/* Downgrade Confirmation Modal */}
      <DowngradeConfirmationModal
        isOpen={showDowngradeModal}
        onClose={() => {
          setShowDowngradeModal(false);
          setTargetTier(null);
        }}
        currentTier={currentTier}
        targetTier={targetTier}
        renewalDate={(nextBillingDate ? nextBillingDate.toISOString() : new Date().toISOString())}
        onConfirm={async () => {
          if (!targetTier || !userId) return;
          
          setIsLoading(targetTier);
          try {
            const { effectiveDate } = await subscriptionService.scheduleSubscriptionChange(
              userId,
              targetTier,
              'downgrade'
            );
            
            setScheduledTierChange({ 
              action: 'downgrade', 
              tier: targetTier, 
              effectiveDate 
            });
            
            await refreshSubscriptionData();
          } catch (error) {
            console.error('Error scheduling downgrade:', error);
            throw error;
          } finally {
            setIsLoading(null);
          }
        }}
        t={t}
      />

      {/* Cancellation Confirmation Modal */}
      <CancellationConfirmationModal
        isOpen={showCancellationModal}
        onClose={() => {
          setShowCancellationModal(false);
          setTargetTier(null);
        }}
        currentTier={currentTier}
        renewalDate={(nextBillingDate ? nextBillingDate.toISOString() : new Date().toISOString())}
        onConfirm={async () => {
          if (!stripeCustomerId) return;
          
          setIsLoading(SubscriptionTier.FREE);
          try {
            const { effectiveDate } = await stripeService.cancelSubscriptionAtPeriodEnd(stripeCustomerId);
            setCancelEffectiveDate(effectiveDate);
            setScheduledTierChange({ action: 'cancel', tier: 'free', effectiveDate });
            setShowCancelModal(true);
            
            await refreshSubscriptionData();
          } catch (error) {
            console.error('Error scheduling cancellation:', error);
            throw error;
          } finally {
            setIsLoading(null);
          }
        }}
        t={t}
      />
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
        {currentTier && isLoggedIn && (
          <div className="p-4 sm:p-6 bg-green-50 dark:bg-green-900/20 border-b bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-green-600 dark:text-green-400 text-lg mr-2">✓</span>
                <div className="text-green-800 dark:text-green-200">
                  {currentTier === SubscriptionTier.DIAMOND
                    ? t('pricingCurrentTierAdmin', { tier: currentTier.charAt(0).toUpperCase() + currentTier.slice(1) })
                    : t('pricingCurrentTier', { tier: currentTier.charAt(0).toUpperCase() + currentTier.slice(1) })
                  }
                </div>
              </div>
              {/* Trial End Date for Free Users */}
              {currentTier === SubscriptionTier.FREE && userSubscription && (
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  {(() => {
                    const remainingDays = subscriptionService.getRemainingTrialDays(userSubscription);
                    const trialEndDate = userSubscription.trialEndDate || subscriptionService.calculateTrialEndDate(userSubscription.startDate);
                    const isExpired = subscriptionService.isTrialExpired(userSubscription);
                    
                    if (isExpired) {
                      return t('pricingTrialExpired');
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
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 auto-rows-fr items-stretch gap-4 sm:gap-6 bg-gray-50 dark:bg-gray-900">
          {tierComparison.map((tier) => (
            <div
              key={tier.tier}
              className={`border-2 rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-lg bg-white dark:bg-gray-800 flex flex-col h-full ${
                tier.tier === currentTier ? 'ring-2 ring-blue-500' : ''
              } ${getTierColor(tier.tier).replace(/bg-\S+/g, '').trim()}`}
            >
              {/* Tier Header */}
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{getTierIcon(tier.tier)}</div>
                <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-white mb-2 break-words">
                  {tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)}
                </h3>
                <div className="text-2xl sm:text-4xl font-medium text-gray-800 dark:text-white break-words">
                  {getPriceDisplay(tier.tier as SubscriptionTier)}
                </div>
                {/* Cancellation scheduled notice on current tier */}
                {tier.tier === currentTier && scheduledTierChange?.action === 'cancel' && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 font-medium">{t('subscriptionScheduledCancel')}</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      {t('subscriptionCancelActiveUntil', 'Active until')}: {(() => {
                        const eff = scheduledTierChange?.effectiveDate;
                        const d = eff?.seconds ? new Date(eff.seconds * 1000) : new Date(eff);
                        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                      })()}
                    </p>
                  </div>
                )}
                {/* Free for 4 weeks text for FREE tier */}
                {(tier.tier as SubscriptionTier) === SubscriptionTier.FREE && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('pricingFreeFor4Weeks')}
                  </div>
                )}
                {(tier.tier as SubscriptionTier) === SubscriptionTier.ENTERPRISE && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {t('pricingContactUs')}
                  </div>
                )}

              </div>

              {/* Features */}
              <div className="space-y-3 mb-4 flex-grow">
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
                      t('pricingUnlimitedSessions')
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

                {/* Nieuw: Tokenlimieten per tier */}
                <div className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0">✓</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    Tokens per maand: {formatLimitValue(tier.maxTokensPerMonth)}
                  </span>
                </div>
                {/* Verwijderd: Tokens per dag, niet getoond als dit geen harde limiet is */}
                <div className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0">✓</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    Audio per maand: {formatLimitValue(tier.maxMonthlyAudioMinutes, 'minuten')}
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
                          {t('pricingBasicWebPageImport')}
                        </span>
                      </div>
                    )}
                    {tier.features?.webExpert && (
                      <div className="flex items-center">
                        <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('pricingWebExpertImport')}
                        </span>
                      </div>
                    )}
                    {tier.features?.thinkingPartner && (
                      <div className="flex items-center">
                        <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('pricingBrainstormFeature', { defaultValue: 'Brainstormen'})}
                        </span>
                      </div>
                    )}
                    {tier.features?.specials && (
                      <div className="flex items-center">
                        <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('pricingSpecialPromptsFeature', { defaultValue: 'Special prompts'})}
                        </span>
                      </div>
                    )}
                    {tier.features?.aiDiscussion && (
                      <div className="flex items-center">
                        <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('pricingAIDiscussionFeature', { defaultValue: 'AI discussie'})}
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
                    {(tier.tier === SubscriptionTier.GOLD || tier.tier === SubscriptionTier.ENTERPRISE) && (
                      <div className="flex items-center">
                        <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('pricingIdeaBuilderFeature')}
                        </span>
                      </div>
                    )}
                    {(tier.tier === SubscriptionTier.GOLD || tier.tier === SubscriptionTier.ENTERPRISE) && (
                      <div className="flex items-center">
                        <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t('pricingShowMeFeature')}
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
              {isLoggedIn && (
                <div className="text-center mt-auto">
                  {tier.tier === currentTier ? (
                    scheduledTierChange?.action === 'cancel' && stripeCustomerId ? (
                      <button
                        onClick={async () => {
                          try {
                            setIsLoading('reactivate');
                            
                            // Bepaal de priceId voor de huidige tier
                            const priceId = stripeService.getPriceId(currentTier);
                            if (!priceId) {
                              throw new Error(`Geen price ID gevonden voor tier ${currentTier}`);
                            }
                            
                            // Bepaal de start datum (einde van huidige periode)
                            const startDate = scheduledTierChange?.effectiveDate 
                              ? (scheduledTierChange.effectiveDate as any)?.seconds 
                                ? new Date(scheduledTierChange.effectiveDate.seconds * 1000).toISOString()
                                : new Date(scheduledTierChange.effectiveDate).toISOString()
                              : undefined;
                            
                            // Heractiveer het abonnement
                            const result = await stripeService.reactivateSubscription({
                              customerId: stripeCustomerId,
                              priceId: priceId,
                              startDate: startDate
                            });
                            
                            console.log('Subscription reactivated:', result);
                            
                            // Stel de effectieve datum in voor de modal
                            setReactivationEffectiveDate(startDate || new Date().toISOString());
                            
                            // Verifieer dat de subscription status is bijgewerkt
                            await verifySubscriptionUpdate(result.subscriptionId);
                            
                            // Toon de success modal
                            setShowReactivationModal(true);
                            
                          } catch (error) {
                            console.error('Error reactivating subscription:', error);
                            displayToast(t('pricingReactivateError'), 'error');
                          } finally {
                            setIsLoading(null);
                          }
                        }}
                        className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
                        disabled={isLoading === 'reactivate'}
                      >
                        {isLoading === 'reactivate' ? t('loading') : t('subscriptionReactivate')}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 px-6 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded font-medium cursor-not-allowed"
                      >
                        {t('pricingCurrentTierButton')}
                      </button>
                    )
                  ) : (tier.tier as SubscriptionTier) === SubscriptionTier.DIAMOND ? (
                    <button
                      disabled
                      className="w-full py-3 px-6 bg-cyan-300 dark:bg-cyan-600 text-cyan-600 dark:text-cyan-400 rounded font-medium cursor-not-allowed"
                    >
                      {t('pricingAdminOnly')}
                    </button>
                  ) : (
                    (() => {
                      // Bij GOLD of SILVER met een toekomstige opzegdatum: geen knop tonen voor specifieke tiers
                      const targetTier = tier.tier as SubscriptionTier;
                      const hideForCancel = isCancelScheduledInFuture && (
                        (currentTier === SubscriptionTier.GOLD && (targetTier === SubscriptionTier.FREE || targetTier === SubscriptionTier.SILVER)) ||
                        (currentTier === SubscriptionTier.SILVER && (targetTier === SubscriptionTier.FREE || targetTier === SubscriptionTier.GOLD))
                      );
                      if (hideForCancel) return null;
                      return (
                        <button
                          onClick={() => handleUpgrade(targetTier)}
                          disabled={isLoading === tier.tier}
                          className={`w-full py-3 px-6 text-white rounded font-medium transition-colors ${
                            isLoading === tier.tier 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : getTierButtonColor(tier.tier)
                          }`}
                        >
                          {isLoading === tier.tier ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t('pricingProcessing')}
                            </span>
                          ) : (
                            tier.tier === SubscriptionTier.FREE 
                              ? (currentTier !== SubscriptionTier.FREE ? t('subscriptionCancel') : t('pricingStartFree'))
                              : tier.tier === SubscriptionTier.ENTERPRISE 
                                ? t('pricingContactEnterprise') 
                                : (() => {
                                    const order = {
                                      [SubscriptionTier.FREE]: 0,
                                      [SubscriptionTier.SILVER]: 1,
                                      [SubscriptionTier.GOLD]: 2,
                                      [SubscriptionTier.ENTERPRISE]: 3,
                                      [SubscriptionTier.DIAMOND]: 4,
                                    } as const;
                                    const isDowngrade = order[tier.tier as SubscriptionTier] < order[currentTier];
                                    const target = (tier.tier as SubscriptionTier).charAt(0).toUpperCase() + (tier.tier as SubscriptionTier).slice(1);
                                    return isDowngrade 
                                      ? t('pricingDowngradeTo', { tier: target }) || `Downgraden naar ${target}`
                                      : t('pricingUpgradeTo', { tier: target });
                                  })()
                          )}
                        </button>
                      );
                    })()
                  )}
                </div>
              )}
              {!isLoggedIn && (
                <div className="text-center mt-auto">
                  <div className="w-full py-3 px-6 text-gray-500 dark:text-gray-400 text-sm">
                    {t('pricingLoginRequired')}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Horizon pakket: eenmalig extra capaciteit voor de lopende maand */}
        <div className="px-4 sm:px-6 mt-4">
          <div className="border-2 rounded-lg p-4 sm:p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center mb-2">
              <div className="text-3xl mr-2">🌅</div>
              <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-white">{t('horizonPackageTitle', { defaultValue: 'Horizon pakket' })}</h3>
            </div>
            {!isHorizonEligible && (
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {t('horizonPackageAvailableFor', { defaultValue: 'Alleen beschikbaar voor <strong>Silver</strong> en <strong>Gold</strong> members.' })}
            </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300 mt-2">
              <div className="flex items-center">
                <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                <span>
                  {(() => {
                    const minutes = Number(import.meta.env.VITE_HORIZON_EXTRA_AUDIO_MINUTES ?? 240);
                    const hours = Math.round((minutes / 60) * 10) / 10;
                    return t('horizonPackageAudio', { defaultValue: `${hours} uur extra audio‑opname (<span className="whitespace-nowrap">${minutes} minuten</span>) — overdraagbaar` });
                  })()}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                <span>
                  {(() => {
                    const tokens = Number(import.meta.env.VITE_HORIZON_EXTRA_TOKENS ?? 25000);
                    return t('horizonPackageTokens', { defaultValue: `${tokens.toLocaleString('nl-NL')} extra tokens` });
                  })()}
                </span>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
              <div>{t('horizonPackagePrice', { defaultValue: 'Prijs: <strong>eenmalig €4</strong>' })}</div>
              <div>{t('horizonPackageValidUntil', { defaultValue: 'Alleen geldig in jouw abonnementsmaand{{billingDate}}.', billingDate: isLoggedIn && nextBillingDate ? ` — geldig t/m ${nextBillingDate.toLocaleDateString('nl-NL')}` : '' })}</div>
              <div>{t('horizonPackageNotTransferable', { defaultValue: 'Niet mee te nemen naar een nieuwe abonnementsperiode.' })}</div>
            </div>

            <div className="mt-4">
              <button
                onClick={async () => {
                  if (!isHorizonEligible) {
                    displayToast(t('horizonPackageAvailableFor', { defaultValue: 'Alleen beschikbaar voor Silver en Gold members.' }));
                    return;
                  }
                  if (!isLoggedIn) {
                    displayToast(t('pleaseLoginFirst', { defaultValue: 'Log eerst in om te kopen' }));
                    return;
                  }
                  try {
                    const productId = import.meta.env.VITE_STRIPE_HORIZON_PRODUCT_ID as string;
                    if (!productId) {
                      displayToast(t('horizonProductMissing', { defaultValue: 'Product ID ontbreekt (config)' }));
                      return;
                    }
                    setIsLoading('horizon');
                    localStorage.setItem('checkout_tier', currentTier);
                    localStorage.setItem('checkout_email', userEmail);
                    await stripeService.redirectToHorizonPurchase(productId, userId, userEmail);
                  } catch (e) {
                    console.error('Horizon purchase failed', e);
                    displayToast(t('horizonPurchaseFailed', { defaultValue: 'Kon Horizon aankoop niet starten' }));
                  } finally {
                    setIsLoading(null);
                  }
                }}
                disabled={!isHorizonEligible || isLoading === 'horizon'}
                className={`w-full py-3 px-6 rounded font-medium ${(!isHorizonEligible || isLoading === 'horizon') ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                {(!isHorizonEligible) 
                  ? t('horizonPackageAvailableForButton', { defaultValue: 'Alleen voor Silver en Gold' })
                  : (isLoading === 'horizon' 
                      ? t('processing', { defaultValue: 'Bezig...' }) 
                      : t('horizonPackageBuyNow', { defaultValue: 'Nu kopen' })
                    )
                }
              </button>
            </div>
          </div>
        </div>

        {/* Uitleg over tokens (positief en kort) */}
        <div className="px-4 sm:px-6 mt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">{t('whatAreTokensTitle', { defaultValue: 'Wat zijn tokens?' })}</h3>
            <p className="text-sm text-blue-900 dark:text-blue-300 mb-2">
              {t('whatAreTokensDescription', { defaultValue: 'Tokens zijn kleine stukjes tekst die we gebruiken om AI-berekeningen te doen. Je hoeft er bijna niets voor te weten of te doen: jij werkt gewoon door, wij bewaken netjes je limieten per tier.' })}
            </p>
            <ul className="text-sm text-blue-900 dark:text-blue-300 list-disc pl-5 space-y-1">
              <li>{t('whatAreTokensPoint1', { defaultValue: 'We tellen tokens die je uploadt (naar de AI) en tokens die je downloadt (van de AI). Samen vormen ze je verbruik.' })}</li>
              <li>{t('whatAreTokensPoint2', { defaultValue: 'Downloadtokens (het AI‑resultaat) zijn iets duurder dan uploadtokens. Zo houden we de kwaliteit van de antwoorden hoog.' })}</li>
              <li>{t('whatAreTokensPoint3', { defaultValue: 'Kom je ooit in de buurt van je limiet? Dan laten we dat vriendelijk weten en kun je eenvoudig upgraden.' })}</li>
            </ul>
          </div>
        </div>


        {/* Stripe Payment Footnote */}
        <div className="px-4 sm:px-6 mt-4">
          <div className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 sm:p-6">
            <p 
              className="text-xs text-gray-500 dark:text-gray-400"
              dangerouslySetInnerHTML={{ __html: t('pricingStripeFootnote') }}
            />
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <div className="px-4 sm:px-6 mt-4">
            <div className="p-4 sm:p-6 border border-gray-200 dark:border-gray-600 flex justify-end bg-white dark:bg-gray-800 rounded-lg">
              <button 
                onClick={onClose} 
                className="px-6 py-3 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </div>
        )}

        {/* Cancellation Goodbye Modal */}
        <CancellationGoodbyeModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          t={t}
          effectiveDate={cancelEffectiveDate}
        />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

