import React from 'react';

interface SessionOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRecording: () => void;
  onUploadFile: () => void;
  onPasteText: () => void;
  onWebPage: () => void;
  t: (key: string) => string;
}

const SessionOptionsModal: React.FC<SessionOptionsModalProps> = ({
  isOpen,
  onClose,
  onStartRecording,
  onUploadFile,
  onPasteText,
  onWebPage,
  t
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('sessionOptionsTitle')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
            {t('sessionOptionsSubtitle')}
          </p>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Audio Recording Option */}
            <div 
              onClick={() => {
                onStartRecording();
                onClose();
              }}
              className="border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🎤</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t('sessionOptionAudio')}</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {t('sessionOptionAudioDesc')}
              </p>
            </div>

            {/* File Upload Option */}
            <div 
              onClick={() => {
                onUploadFile();
                onClose();
              }}
              className="border-2 border-green-200 dark:border-green-700 rounded-lg p-6 bg-green-50 dark:bg-green-900/20 cursor-pointer hover:border-green-300 dark:hover:border-green-600 transition-colors"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">📄</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t('sessionOptionFile')}</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                {t('sessionOptionFileDesc')}
              </p>
              <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {t('sessionOptionFileFormats')}
              </div>
            </div>

            {/* Paste Text Option */}
            <div 
              onClick={() => {
                onPasteText();
                onClose();
              }}
              className="border-2 border-purple-200 dark:border-purple-700 rounded-lg p-6 bg-purple-50 dark:bg-purple-900/20 cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">📋</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t('sessionOptionPaste')}</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {t('sessionOptionPasteDesc')}
              </p>
            </div>

            {/* Web Page Option */}
            <div 
              onClick={() => {
                onWebPage();
                onClose();
              }}
              className="border-2 border-orange-200 dark:border-orange-700 rounded-lg p-6 bg-orange-50 dark:bg-orange-900/20 cursor-pointer hover:border-orange-300 dark:hover:border-orange-600 transition-colors"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🌐</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t('sessionOptionWebPage')}</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {t('sessionOptionWebPageDesc')}
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-cyan-500 text-xl mr-3">💡</div>
              <p className="text-cyan-800 dark:text-cyan-200 text-sm">
                {t('sessionOptionsNote')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionOptionsModal;
