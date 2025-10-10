import React from 'react';
import { XMarkIcon, MusicalNoteIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface AudioUploadHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

const AudioUploadHelpModal: React.FC<AudioUploadHelpModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <MusicalNoteIcon className="w-6 h-6 text-amber-500 dark:text-amber-400" />
            <h3 className="text-xl font-medium text-amber-600 dark:text-amber-400 tracking-tight">{t('audioUploadHelpTitle')}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300">
          {/* Intro */}
          <div>
            <p className="leading-relaxed">{t('audioUploadHelpDescription')}</p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-200">1️⃣ {t('audioUploadHelpStep1')}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-200">2️⃣ {t('audioUploadHelpStep2')}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-200">3️⃣ {t('audioUploadHelpStep3')}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-200">4️⃣ {t('audioUploadHelpStep4')}</p>
            </div>
          </div>

          {/* Formats note */}
          <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-slate-600 dark:text-slate-300 mt-0.5" />
            <p className="text-slate-700 dark:text-slate-300">
              {t('sessionOptionAudioUploadFormats')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2 rounded bg-amber-600 hover:bg-amber-700 text-white transition-colors font-medium"
          >
            {t('mobileAudioHelpClose')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioUploadHelpModal;