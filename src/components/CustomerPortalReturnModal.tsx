import React from 'react';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';

interface CustomerPortalReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomerPortalReturnModal: React.FC<CustomerPortalReturnModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Welkom terug!"
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Abonnement beheer voltooid
          </h3>
          <p className="text-sm text-gray-600">
            Je bent succesvol teruggekeerd van het Stripe Customer Portal.
          </p>
        </div>

        {/* Information about changes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                Wijzigingen worden verwerkt
              </h4>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Eventuele wijzigingen aan je abonnement, betaalmethoden of factuurgegevens 
                  kunnen enkele minuten duren voordat ze zichtbaar zijn in RecapHorizon.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What users might have changed */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Wat je mogelijk hebt gewijzigd:
          </h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-gray-400 mt-2 mr-3"></span>
              <span>Abonnement geüpgraded, gedowngraded of geannuleerd</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-gray-400 mt-2 mr-3"></span>
              <span>Betaalmethoden toegevoegd of bijgewerkt</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-gray-400 mt-2 mr-3"></span>
              <span>Factuurgegevens en adresinformatie</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-gray-400 mt-2 mr-3"></span>
              <span>Factuurgeschiedenis en downloads</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={onClose}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Doorgaan met RecapHorizon
          </button>
        </div>

        {/* Support note */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Vragen over je abonnement? Neem contact op via{' '}
            <a 
              href="mailto:support@recaphorizon.com" 
              className="text-blue-600 hover:text-blue-500"
            >
              support@recaphorizon.com
            </a>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default CustomerPortalReturnModal;