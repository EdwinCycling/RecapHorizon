import React from 'react';
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { TranslationFunction } from '../../types';

interface CustomerPortalReturnScreenProps {
  onClose: () => void;
  t: TranslationFunction;
}

const CustomerPortalReturnScreen: React.FC<CustomerPortalReturnScreenProps> = ({
  onClose,
  t
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Welkom terug!
          </h3>
          
          <p className="text-sm text-gray-500 mb-6">
            Je bent succesvol teruggekeerd van de Stripe Customer Portal. 
            Eventuele wijzigingen aan je abonnement zijn direct van kracht.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  Wat je kunt hebben gedaan:
                </h4>
                <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li>Abonnement geannuleerd of gewijzigd</li>
                  <li>Betaalmethode bijgewerkt</li>
                  <li>Facturen bekeken of gedownload</li>
                  <li>Contactgegevens aangepast</li>
                </ul>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Terug naar RecapHorizon
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortalReturnScreen;