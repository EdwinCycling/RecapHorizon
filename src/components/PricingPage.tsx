import React from 'react';
import { SubscriptionTier, TierLimits } from '../../types';
import { subscriptionService } from '../subscriptionService';

interface PricingPageProps {
  isOpen: boolean;
  currentTier: SubscriptionTier;
  onUpgrade: (tier: SubscriptionTier) => void;
  onClose: () => void;
  isAdmin?: boolean; // Add admin prop
}

const PricingPage: React.FC<PricingPageProps> = ({ isOpen, currentTier, onUpgrade, onClose, isAdmin = false }) => {
  if (!isOpen) return null;
  
  // Get tier comparison - admins see all tiers including DIAMOND
  const tierComparison = isAdmin 
    ? subscriptionService.getTierComparisonForAdmin()
    : subscriptionService.getTierComparison();

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
    return result || 'Alleen TXT';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-3xl font-bold text-gray-800">RecapSmart Abonnementen</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
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
                Je bent momenteel op de <strong>{currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Tier</strong>
                {isAdmin && currentTier === SubscriptionTier.DIAMOND && ' (Admin)'}
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
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)}
                </h3>
                {tier.tier === SubscriptionTier.DIAMOND ? (
                  <div className="text-xl font-semibold text-cyan-600">Coming Soon</div>
                ) : tier.tier !== SubscriptionTier.ENTERPRISE ? (
                  <>
                    <div className="text-4xl font-bold text-gray-800">
                      €{tier.price}
                      <span className="text-lg text-gray-600">/maand</span>
                    </div>
                    {tier.minTerm > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        Minimaal {tier.minTerm} maanden
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xl font-semibold text-gray-800">Prijs op aanvraag</div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">
                    <strong>{tier.maxSessionDuration}</strong> minuten per sessie
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">
                    {tier.maxSessionsPerDay === -1 ? (
                      <strong>Onbeperkt</strong>
                    ) : (
                      <strong>{tier.maxSessionsPerDay}</strong>
                    )} sessies per dag
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">
                    Bestandstypes: <strong>{formatFileTypes(tier.allowedFileTypes)}</strong>
                  </span>
                </div>

                {/* New: Premium Features */}
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Premium Functionaliteiten</h4>
                  <div className="space-y-2">
                    {tier.features?.chat && (
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm text-gray-700">
                          Chat met transcript
                        </span>
                      </div>
                    )}
                    {tier.features?.podcast && (
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm text-gray-700">
                          Podcast generatie
                        </span>
                      </div>
                    )}
                    {tier.features?.exportPpt && (
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm text-gray-700">
                          PowerPoint export
                        </span>
                      </div>
                    )}
                    {tier.features?.businessCase && (
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm text-gray-700">
                          Business case generator
                        </span>
                      </div>
                    )}
                    {!tier.features?.chat && !tier.features?.podcast && !tier.features?.exportPpt && !tier.features?.businessCase && (
                      <div className="text-sm text-gray-400 italic">
                        Geen premium functionaliteiten beschikbaar
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
                    className="w-full py-3 px-6 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Huidige Tier
                  </button>
                ) : tier.tier === SubscriptionTier.DIAMOND ? (
                  <button
                    disabled
                    className="w-full py-3 px-6 bg-cyan-300 text-cyan-600 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Alleen voor Admins
                  </button>
                ) : (
                  <button
                    onClick={() => onUpgrade(tier.tier)}
                    className={`w-full py-3 px-6 text-white rounded-lg font-semibold transition-colors ${getTierButtonColor(tier.tier)}`}
                  >
                    {tier.tier === SubscriptionTier.FREE ? 'Gratis Starten' : (tier.tier === SubscriptionTier.ENTERPRISE ? 'Contact over Enterprise' : 'Upgraden naar ' + tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1))}
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
              <strong>Silver en Gold</strong> zijn maandelijks opzegbaar na de minimale termijn van 6 maanden.
            </p>
            <p className="mb-2">
              <strong>Gold en Enterprise</strong> bieden toegang tot alle premium functionaliteiten.
            </p>
            {isAdmin && (
              <p className="mb-2 text-cyan-600">
                <strong>Diamond Tier</strong> is exclusief voor admins en biedt alle functionaliteiten.
              </p>
            )}
            <p>
              Heb je vragen over de abonnementen? Neem contact op via{' '}
              <a href="mailto:support@recapsmart.nl" className="text-blue-600 hover:underline">
                support@recapsmart.nl
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

