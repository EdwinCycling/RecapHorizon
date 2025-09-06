import React from 'react';
import { SubscriptionTier } from '../../types';
import { subscriptionService } from '../subscriptionService';

interface UpgradeModalProps {
  isOpen: boolean;
  message: string;
  onUpgrade: (tier: SubscriptionTier) => void;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, message, onUpgrade, onClose }) => {
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
          <h2 className="text-2xl font-bold text-gray-800">Upgrade Je Abonnement</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
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
                Upgrade je abonnement om meer functionaliteiten te ontgrendelen en je limieten te verhogen.
              </p>
            </div>
          </div>

          {/* Premium Features Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Premium Functionaliteiten vanaf Gold Tier</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-blue-700">Chat met transcript</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-blue-700">Podcast generatie</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-blue-700">PowerPoint export</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-blue-700">Business case generator</span>
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Silver Tier */}
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="text-center mb-3">
                <div className="text-3xl mb-1">🥈</div>
                <h3 className="text-xl font-bold text-gray-800">Silver</h3>
                <div className="text-2xl font-bold text-blue-600">€5/maand</div>
              </div>
              <ul className="text-sm text-gray-700 space-y-1 mb-4">
                <li>• 60 minuten per sessie</li>
                <li>• 3 sessies per dag</li>
                <li>• 15.000 karakters transcript</li>
                <li>• Alle bestandstypes</li>
                <li className="text-gray-500">• Basis functionaliteiten</li>
              </ul>
              <button
                onClick={() => handleUpgrade(SubscriptionTier.SILVER)}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Upgrade naar Silver
              </button>
            </div>

            {/* Gold Tier */}
            <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="text-center mb-3">
                <div className="text-3xl mb-1">🥇</div>
                <h3 className="text-xl font-bold text-gray-800">Gold</h3>
                <div className="text-2xl font-bold text-yellow-600">€8/maand</div>
              </div>
              <ul className="text-sm text-gray-700 space-y-1 mb-4">
                <li>• 90 minuten per sessie</li>
                <li>• Onbeperkte sessies</li>
                <li>• 30.000 karakters transcript</li>
                <li>• Alle bestandstypes</li>
                <li className="text-green-600 font-semibold">• Alle premium functionaliteiten</li>
              </ul>
              <button
                onClick={() => handleUpgrade(SubscriptionTier.GOLD)}
                className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                Upgrade naar Gold
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center text-gray-600 text-sm">
              <p className="mb-1">
                <strong>Alle abonnementen zijn maandelijks opzegbaar</strong> na 6 maanden.
              </p>
              <p>
                Heb je vragen? Neem contact op via{' '}
                <a href="mailto:support@recapsmart.nl" className="text-blue-600 hover:underline">
                  support@recapsmart.nl
                </a>
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
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;

