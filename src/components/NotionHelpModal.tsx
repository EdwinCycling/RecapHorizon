import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NotionHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

const NotionHelpModal: React.FC<NotionHelpModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {t('notionHelpTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label={t('close')}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
              <span className="text-xl">📋</span>
              {t('notionHelpIntroTitle')}
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              {t('notionHelpIntro')}
            </p>
          </div>

          {/* How it works */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              {t('notionHelpHowItWorks')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{t('notionHelpStep1')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{t('notionHelpStep2')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{t('notionHelpStep3')}</p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
              <span className="text-xl">🔒</span>
              {t('notionHelpSecurityTitle')}
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              {t('notionHelpSecurity')}
            </p>
          </div>

          {/* Tips */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span>
              {t('notionHelpTipsTitle')}
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{t('notionHelpTip1')}</p>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{t('notionHelpTip2')}</p>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{t('notionHelpTip3')}</p>
              </li>
            </ul>
          </div>

          {/* Availability */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
              <span className="text-xl">💎</span>
              {t('notionHelpAvailabilityTitle')}
            </h3>
            <p className="text-purple-700 dark:text-purple-300 text-sm">
              {t('notionHelpAvailability')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
          >
            {t('notionHelpClose')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotionHelpModal;