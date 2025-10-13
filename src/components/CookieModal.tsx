import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CookieModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

const CookieModal: React.FC<CookieModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-medium text-cyan-500 dark:text-cyan-400 tracking-tight">{t('cookieInfoTitle')}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">{t('cookieInfoWhatAreCookies')}</h4>
            <p>{t('cookieInfoWhatAreCookiesAnswer')}</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">{t('cookieInfoWhatWeUse')}</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded">
                <p className="font-medium">{t('cookieInfoEssentialCookies')}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{t('cookieInfoEssentialCookiesAnswer')}</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded">
                <p className="font-medium">{t('cookieInfoAnalyticsCookies')}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{t('cookieInfoAnalyticsCookiesAnswer')}</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">{t('cookieInfoNoTracking')}</h4>
            <p>{t('cookieInfoNoTrackingAnswer')}</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">{t('cookieInfoSettings')}</h4>
            <p>{t('cookieInfoSettingsAnswer')}</p>
          </div>
        </div>
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
          >
            {t('close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieModal;
