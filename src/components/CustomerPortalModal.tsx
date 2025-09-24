import React from 'react';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';
import { stripeService } from '../services/stripeService';

interface CustomerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
  userTier?: string;
}

const CustomerPortalModal: React.FC<CustomerPortalModalProps> = ({
  isOpen,
  onClose,
  customerId,
  userTier
}) => {
  const { t } = useTranslation();

  const handleOpenPortal = async () => {
    if (!customerId) {
      console.error('Customer ID is required to access the portal');
      return;
    }

    try {
      const returnUrl = `${window.location.origin}?portal_return=true`;
      await stripeService.redirectToCustomerPortal(customerId, returnUrl);
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Abonnement beheren"
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {userTier === 'diamond' ? 'RecapHorizon Stoppen' : 'Stripe Customer Portal'}
          </h3>
          <p className="text-sm text-gray-600">
            {userTier === 'diamond' 
              ? 'Beheer je Diamond abonnement of stop RecapHorizon via het beveiligde Stripe portal.'
              : 'Beheer je abonnement, betaalmethoden en factuurgegevens in een veilige omgeving.'
            }
          </p>
        </div>

        {/* Features */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {userTier === 'diamond' 
              ? 'Wat kun je doen als Diamond gebruiker:'
              : 'Wat kun je doen in het Customer Portal:'
            }
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {userTier === 'diamond' ? (
              <>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-4 w-4 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Diamond abonnement stoppen of pauzeren</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-4 w-4 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Betaalmethoden beheren</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-4 w-4 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Factuurgegevens en adres bijwerken</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-4 w-4 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Factuurgeschiedenis bekijken</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-4 w-4 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Abonnement upgraden, downgraden of annuleren</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-4 w-4 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Betaalmethoden toevoegen of wijzigen</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-4 w-4 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Factuurgegevens en adres bijwerken</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-4 w-4 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Factuurgeschiedenis bekijken en downloaden</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-4 w-4 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Volgende factureringsdatum bekijken</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Security note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                Veilig en betrouwbaar
              </h4>
              <p className="mt-1 text-sm text-blue-700">
                Het Customer Portal wordt beheerd door Stripe, een van de meest vertrouwde 
                betalingsverwerkers ter wereld. Je gegevens zijn volledig beveiligd.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Annuleren
          </button>
          <button
            onClick={handleOpenPortal}
            disabled={!customerId}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {userTier === 'diamond' ? 'Abonnement beheren' : 'Portal openen'}
          </button>
        </div>

        {/* Footer note */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Je wordt doorgestuurd naar een beveiligde Stripe-pagina en keert automatisch terug naar RecapHorizon.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default CustomerPortalModal;