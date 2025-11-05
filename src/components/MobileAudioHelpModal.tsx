import React from 'react';
import { XMarkIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { TranslationFunction } from '../../types';

interface MobileAudioHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationFunction;
}

const MobileAudioHelpModal: React.FC<MobileAudioHelpModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <DevicePhoneMobileIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
            <h3 className="text-xl font-medium text-cyan-500 dark:text-cyan-400 tracking-tight">{t('mobileAudioHelpTitle')}</h3>
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
            <h4 className="font-medium text-lg text-slate-800 dark:text-slate-200 mb-3">{t('mobileAudioHelpSubtitle')}</h4>
            <p className="leading-relaxed">{t('mobileAudioHelpIntro')}</p>
          </div>

          {/* Option 1: Airplane Mode */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-5">
            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
              <span className="text-xl">✈️</span>
              {t('mobileAudioHelpOption1Title')}
            </h5>
            <div className="space-y-3">
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-blue-100 dark:border-blue-800">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">📱 iOS:</p>
                <p>{t('mobileAudioHelpOption1iOS')}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-blue-100 dark:border-blue-800">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">{t('androidLabel')}</p>
                <p>{t('mobileAudioHelpOption1Android')}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-800/30 p-3 rounded">
                <p className="text-blue-800 dark:text-blue-200">
                  <span className="font-medium">💡 </span>
                  {t('mobileAudioHelpOption1Explanation')}
                </p>
              </div>
            </div>
          </div>

          {/* Option 2: Do Not Disturb */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-5">
            <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
              <span className="text-xl">🔕</span>
              {t('mobileAudioHelpOption2Title')}
            </h5>
            <div className="space-y-3">
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-purple-100 dark:border-purple-800">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">📱 iOS:</p>
                <p>{t('mobileAudioHelpOption2iOS')}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-purple-100 dark:border-purple-800">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">{t('androidLabel')}</p>
                <p>{t('mobileAudioHelpOption2Android')}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-800/30 p-3 rounded">
                <p className="text-purple-800 dark:text-purple-200">
                  <span className="font-medium">💡 </span>
                  {t('mobileAudioHelpOption2Explanation')}
                </p>
              </div>
            </div>
          </div>

          {/* Additional tip */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-xl">💡</span>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200 mb-1">{t('extraTip')}</p>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Test je gekozen instelling voordat je een belangrijke opname start. Zo weet je zeker dat alles werkt zoals verwacht.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white transition-colors font-medium"
          >
            {t('mobileAudioHelpClose')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAudioHelpModal;