import React from 'react';
import { SubscriptionTier } from '../../types';
import { subscriptionService } from '../subscriptionService';

interface UpgradeModalProps {
  isOpen: boolean;
  message: string;
  onUpgrade: (tier: SubscriptionTier) => void;
  onClose: () => void;
  t: (key: string, params?: any) => string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, message, onUpgrade, onClose, t }) => {
  if (!isOpen) return null;

  const handleUpgrade = (tier: SubscriptionTier) => {
    onUpgrade(tier);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-medium text-gray-800 tracking-tight">{t('upgradeSubscription')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-medium"
          >
            ×
          </button>
        </div>

        {/* Message */}
        <div className="p-6">
          <div className="flex items-start mb-6">
            <div className="text-yellow-500 text-2xl mr-3">⚠️</div>
            <div>
              <p className="text-gray-700 text-lg mb-2">{message}</p>
              <p className="text-gray-600">
                {t('upgradeSubscriptionDesc')}
              </p>
            </div>
          </div>

          {/* Premium Features Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-800 mb-3">{t('premiumFeaturesFromGold')}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-blue-700">{t('chatWithTranscriptFeature')}</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-blue-700">{t('powerpointExportFeature')}</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-blue-700">{t('businessCaseGeneratorFeature')}</span>
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Silver Tier */}
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="text-center mb-3">
                <div className="text-3xl mb-1">🥈</div>
                <h3 className="text-xl font-medium text-gray-800">{t('silverTier')}</h3>
            <div className="text-2xl font-medium text-blue-600">{t('silverPrice')}</div>
              </div>
              <ul className="text-sm text-gray-700 space-y-1 mb-4">
                <li>{t('silverFeature1')}</li>
                <li>{t('silverFeature2')}</li>
                <li>{t('silverFeature3')}</li>
                <li>{t('silverFeature4')}</li>
                <li className="text-gray-500">{t('silverFeature5')}</li>
              </ul>
              <button
                onClick={() => handleUpgrade(SubscriptionTier.SILVER)}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition-colors"
              >
                {t('upgradeToSilver')}
              </button>
            </div>

            {/* Gold Tier */}
            <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="text-center mb-3">
                <div className="text-3xl mb-1">🥇</div>
                <h3 className="text-xl font-medium text-gray-800">{t('goldTier')}</h3>
            <div className="text-2xl font-medium text-yellow-600">{t('goldPrice')}</div>
              </div>
              <ul className="text-sm text-gray-700 space-y-1 mb-4">
                <li>{t('goldFeature1')}</li>
                <li>{t('goldFeature2')}</li>
                <li>{t('goldFeature3')}</li>
                <li>{t('goldFeature4')}</li>
                <li className="text-green-600 font-medium">{t('goldFeature5')}</li>
              </ul>
              <button
                onClick={() => handleUpgrade(SubscriptionTier.GOLD)}
                className="w-full py-2 px-4 bg-yellow-500 text-white rounded font-medium hover:bg-yellow-600 transition-colors"
              >
                {t('upgradeToGold')}
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center text-gray-600 text-sm">
              <p className="mb-1">
                <strong>{t('subscriptionCancellable')}</strong>
              </p>
              <p>
                {t('supportContact')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            {t('later')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;

