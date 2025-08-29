import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-3xl w-full m-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-cyan-500 dark:text-cyan-400">{t('disclaimerTitle')}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('disclaimerAIContent')}</h4>
            <p>{t('disclaimerAIContentAnswer')}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('disclaimerAccuracy')}</h4>
            <p>{t('disclaimerAccuracyAnswer')}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('disclaimerOwnRisk')}</h4>
            <p>{t('disclaimerOwnRiskAnswer')}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">AI Intelligence</h4>
            <p>The app integrates with AI services. The quality and availability of these services depend on the AI provider's terms and may vary. We have no control over the underlying AI models or their output.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('disclaimerPrivacy')}</h4>
            <p><strong>Belangrijk:</strong> {t('disclaimerPrivacyAnswer')}</p>
            <ul className="list-disc list-inside space-y-1 text-xs mt-2">
              <li>{t('disclaimerPrivacyBullet1')}</li>
              <li>{t('disclaimerPrivacyBullet2')}</li>
              <li>{t('disclaimerPrivacyBullet3')}</li>
            </ul>
            <p className="mt-2 text-sm">{t('disclaimerPrivacyNote')}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('disclaimerRecommendations')}</h4>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>{t('disclaimerRecommendation1')}</li>
              <li>{t('disclaimerRecommendation2')}</li>
              <li>{t('disclaimerRecommendation3')}</li>
              <li>{t('disclaimerRecommendation4')}</li>
            </ul>
          </div>
        </div>
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
          >
            {t('close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
