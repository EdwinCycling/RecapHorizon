import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
  waitlistEmail: string;
  setWaitlistEmail: (email: string) => void;
  addToWaitlist: (email: string) => void;
}

const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose, t, waitlistEmail, setWaitlistEmail, addToWaitlist }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400"> Wachtlijst</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('waitlistTitle')}</h4>
            <p>RecapSmart is nu alleen toegankelijk voor genodigden. Dit zorgt ervoor dat we de beste service kunnen bieden en de app kunnen optimaliseren op basis van feedback van onze gebruikers.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Hoe werkt de wachtlijst?</h4>
            <ol className="list-decimal list-inside space-y-2">
              <li>Meld je aan met je email adres</li>
              <li>We plaatsen je op de wachtlijst</li>
              <li>Zodra er plek is, ontvang je een uitnodiging</li>
              <li>Je kunt dan een account aanmaken en de app gebruiken</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Wat gebeurt er met je data?</h4>
            <p>Je email adres wordt alleen gebruikt om contact met je op te nemen wanneer je toegang krijgt. We delen je gegevens niet met derden.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2"> {t('privacyTitle')}</h4>
            <p><strong>Belangrijk:</strong> Wanneer je de app gebruikt, worden je sessies NIET opgeslagen in onze database.</p>
            <ul className="list-disc list-inside space-y-1 text-xs mt-2">
              <li><strong>Opnames:</strong> Blijven volledig lokaal op jouw apparaat</li>
              <li><strong>Transcripties:</strong> Wij kunnen ze niet zien of opslaan</li>
              <li><strong>AI Output:</strong> Alleen jij hebt toegang tot je content</li>
            </ul>
            <p className="mt-2 text-sm">We bewaren helemaal niets van jouw sessies. Jouw privacy staat voorop.</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Direct Aanmelden</h4>
            <div className="flex gap-3">
              <input
                type="email"
                value={waitlistEmail}
                onChange={e => setWaitlistEmail(e.target.value)}
                placeholder="jouw@email.nl"
                className="flex-1 px-3 py-2 border border-blue-300 dark:border-blue-500 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                onClick={() => {
                  addToWaitlist(waitlistEmail);
                  onClose();
                }}
                disabled={!waitlistEmail.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                Aanmelden
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistModal;
