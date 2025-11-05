import React from 'react';
import { XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { TranslationFunction } from '../../types';

interface EmailImportHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationFunction;
}

const EmailImportHelpModal: React.FC<EmailImportHelpModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <EnvelopeIcon className="w-6 h-6 text-purple-500 dark:text-purple-400" />
            <h3 className="text-xl font-medium text-purple-500 dark:text-purple-400 tracking-tight">{t('emailImportHelpTitle')}</h3>
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
          {/* Subtitle */}
          <div>
            <h4 className="font-medium text-lg text-slate-800 dark:text-slate-200 mb-3">{t('emailImportHelpSubtitle')}</h4>
            <p className="leading-relaxed">{t('emailImportHelpIntro')}</p>
          </div>

          {/* Supported Formats */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-5">
            <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
              <span className="text-xl">📁</span>
              {t('emailImportHelpFormatsTitle')}
            </h5>
            <div className="space-y-2">
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-purple-100 dark:border-purple-800">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">✅ {t('emailImportHelpSupportedFormats')}</p>
                <p>{t('emailImportHelpFormatsList')}</p>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
            <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="text-xl">📋</span>
              {t('emailImportHowToUseTitle')}
            </h5>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
                <p>{t('emailImportHelpStep1')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
                <p>{t('emailImportHelpStep2')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
                <p>{t('emailImportHelpStep3')}</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-5">
            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span>
              {t('emailImportTipsTitle')}
            </h5>
            <ul className="space-y-2 list-disc list-inside">
              <li>{t('emailImportTip1')}</li>
              <li>{t('emailImportTip2')}</li>
              <li>{t('emailImportTip3')}</li>
              <li>{t('emailImportTip4')}</li>
            </ul>
          </div>

          {/* Close Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailImportHelpModal;