import React from 'react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { TranslationFunction } from '../../types';

interface PowerPointUploadHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationFunction;
}

const PowerPointUploadHelpModal: React.FC<PowerPointUploadHelpModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[102]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7zm4 2h10m-9 5h5" />
            </svg>
            <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400 tracking-tight">{t('pptxHelpTitle')}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300">
          <div>
            <p className="leading-relaxed">{t('pptxHelpDescription')}</p>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200">1️⃣ {t('pptxHelpStep1')}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200">2️⃣ {t('pptxHelpStep2')}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200">3️⃣ {t('pptxHelpStep3')}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200">4️⃣ {t('pptxHelpStep4')}</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-slate-600 dark:text-slate-300 mt-0.5" />
            <p className="text-slate-700 dark:text-slate-300">
              {t('pptxSupportedFormats')}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium"
          >
            {t('mobileAudioHelpClose')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PowerPointUploadHelpModal;