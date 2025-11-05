import React from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { TranslationFunction } from '../../types';

interface ImageUploadHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationFunction;
}

const ImageUploadHelpModal: React.FC<ImageUploadHelpModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <PhotoIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
            <h3 className="text-xl font-medium text-cyan-500 dark:text-cyan-400 tracking-tight">{t('imageUploadHelpTitle')}</h3>
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
            <h4 className="font-medium text-lg text-slate-800 dark:text-slate-200 mb-3">{t('imageUploadHelpSubtitle')}</h4>
            <p className="leading-relaxed">{t('imageUploadHelpIntro')}</p>
          </div>

          {/* Supported Formats */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-5">
            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
              <span className="text-xl">📁</span>
              {t('imageUploadHelpFormatsTitle')}
            </h5>
            <div className="space-y-2">
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-blue-100 dark:border-blue-800">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">✅ {t('imageUploadHelpSupportedFormats')}</p>
                <p>{t('imageUploadHelpFormatsList')}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-800/30 p-3 rounded">
                <p className="text-blue-800 dark:text-blue-200">
                  <span className="font-medium">💡 </span>
                  {t('imageUploadHelpFormatsNote')}
                </p>
              </div>
            </div>
          </div>

          {/* AI Analysis Features */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-5">
            <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
              <span className="text-xl">🤖</span>
              {t('imageUploadHelpAITitle')}
            </h5>
            <div className="space-y-3">
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-purple-100 dark:border-purple-800">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">🔍 {t('imageUploadHelpObjectRecognition')}</p>
                <p>{t('imageUploadHelpObjectRecognitionDesc')}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-purple-100 dark:border-purple-800">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">📝 {t('imageUploadHelpOCR')}</p>
                <p>{t('imageUploadHelpOCRDesc')}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-purple-100 dark:border-purple-800">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">🎯 {t('imageUploadHelpContextAnalysis')}</p>
                <p>{t('imageUploadHelpContextAnalysisDesc')}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-800/30 p-3 rounded">
                <p className="text-purple-800 dark:text-purple-200">
                  <span className="font-medium">⭐ </span>
                  {t('imageUploadHelpAINote')}
                </p>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-5">
            <h5 className="font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
              <span className="text-xl">📋</span>
              {t('imageUploadHelpUsageTitle')}
            </h5>
            <div className="space-y-2">
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-green-100 dark:border-green-800">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">1. {t('imageUploadHelpStep1')}</p>
                <p>{t('imageUploadHelpStep1Desc')}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-green-100 dark:border-green-800">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">2. {t('imageUploadHelpStep2')}</p>
                <p>{t('imageUploadHelpStep2Desc')}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded border border-green-100 dark:border-green-800">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">3. {t('imageUploadHelpStep3')}</p>
                <p>{t('imageUploadHelpStep3Desc')}</p>
              </div>
            </div>
          </div>

          {/* Additional tip */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-yellow-500 text-xl">💡</span>
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">{t('imageUploadHelpTipTitle')}</p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  {t('imageUploadHelpTipDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white transition-colors font-medium"
          >
            {t('imageUploadHelpClose')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadHelpModal;