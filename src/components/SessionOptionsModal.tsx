import React, { useState } from 'react';
import ImageUploadHelpModal from './ImageUploadHelpModal';
import NotionIntegrationHelpModal from './NotionIntegrationHelpModal';
import AudioUploadHelpModal from './AudioUploadHelpModal';
import IdeaBuilderSimpleHelp from './IdeaBuilderSimpleHelp';
import { TranslationFunction } from '../../types';

interface SessionOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRecording: () => void;
  onUploadFile: () => void;
  onPasteText: () => void;
  onWebPage: () => void;
  onUploadImage: () => void;
  onAudioUpload: () => void;
  onEmailImport: () => void;
  onAskExpert: () => void;
  onNotionImport: () => void;
  onIdeaBuilder: () => void;
  userSubscription?: string;
  t: TranslationFunction;
}

const SessionOptionsModal: React.FC<SessionOptionsModalProps> = ({
  isOpen,
  onClose,
  onStartRecording,
  onUploadFile,
  onPasteText,
  onWebPage,
  onUploadImage,
  onAudioUpload,
  onEmailImport,
  onAskExpert,
  onNotionImport,
  onIdeaBuilder,
  userSubscription,
  t
}) => {
  const [isImageHelpOpen, setIsImageHelpOpen] = useState(false);
  const [isNotionHelpOpen, setIsNotionHelpOpen] = useState(false);
  const [isAudioUploadHelpOpen, setIsAudioUploadHelpOpen] = useState(false);
  const [isIdeaHelpOpen, setIsIdeaHelpOpen] = useState(false);
  const isDiamond = (userSubscription || '').toLowerCase() === 'diamond';
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-[95vw] max-w-[1600px] max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-medium text-gray-800 dark:text-white tracking-tight">{t('sessionOptionsTitle')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-medium"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 mb-6">
            {/* Audio Recording Option */}
            <div 
              onClick={() => { onStartRecording(); onClose(); }}
              className="border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <div className="text-center mb-2">
                <div className="text-4xl mb-2">🎤</div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white">{t('sessionOptionAudio')}</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
                {t('sessionOptionAudioDesc')}
              </p>
            </div>

            {/* File Upload Option */}
            <div 
              onClick={() => { onUploadFile(); onClose(); }}
              className="border-2 border-green-200 dark:border-green-700 rounded-xl p-4 bg-green-50 dark:bg-green-900/20 cursor-pointer hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <div className="text-center mb-2">
                <div className="text-4xl mb-2">📄</div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white">{t('sessionOptionFile')}</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-1">
                {t('sessionOptionFileDesc')}
              </p>
              <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {t('sessionOptionFileFormats')}
              </div>
            </div>

            {/* Paste Text Option */}
            <div 
              onClick={() => { onPasteText(); onClose(); }}
              className="border-2 border-purple-200 dark:border-purple-700 rounded-xl p-4 bg-purple-50 dark:bg-purple-900/20 cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <div className="text-center mb-2">
                <div className="text-4xl mb-2">📋</div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white">{t('sessionOptionPaste')}</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
                {t('sessionOptionPasteDesc')}
              </p>
            </div>

            {/* Web Page Option */}
            <div 
              onClick={() => { onWebPage(); onClose(); }}
              className="border-2 border-orange-200 dark:border-orange-700 rounded-xl p-4 bg-orange-50 dark:bg-orange-900/20 cursor-pointer hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <div className="text-center mb-2">
                <div className="text-4xl mb-2">🌐</div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white">{t('sessionOptionWebPage')}</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
                {t('sessionOptionWebPageDesc')}
              </p>
            </div>

            {/* Idea Builder Option */}
            <div 
              onClick={() => {
                if (userSubscription && ['gold', 'diamond', 'enterprise'].includes(userSubscription.toLowerCase())) {
                  onIdeaBuilder();
                  onClose();
                }
              }}
              className={`border-2 border-amber-200 dark:border-amber-700 rounded-xl p-4 bg-amber-50 dark:bg-amber-900/20 cursor-pointer hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${
                userSubscription && ['gold', 'diamond', 'enterprise'].includes(userSubscription.toLowerCase()) 
                  ? '' 
                  : 'opacity-70'
              }`}
            >
              <div className="text-center mb-2">
                <div className="mb-2 flex items-center justify-center">
                  <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3a7 7 0 00-7 7c0 2.29 1.06 4.33 2.7 5.62A3 3 0 009 18v1a3 3 0 003 3h0a3 3 0 003-3v-1a3 3 0 002.3-2.38A7 7 0 0011 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white">{t('ideaBuilderTitle', 'Idea Builder')}</h3>
                {!(userSubscription && ['gold', 'diamond', 'enterprise'].includes(userSubscription.toLowerCase())) && (
                  <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    {t('premiumOnly')}
                  </div>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
                {t('ideaBuilderDesc', 'Generate high-quality ideas and outlines based on topic, audience and goals.')}
              </p>
              <div className="mt-2 text-center">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsIdeaHelpOpen(true); }}
                  className="text-amber-700 dark:text-amber-300 text-xs underline hover:no-underline"
                >
                  {t('ideaBuilderHelpTitle', 'Idea Builder Help')}
                </button>
              </div>
            </div>

            {/* Image Upload Option */}
            <div 
              onClick={() => { onUploadImage(); onClose(); }}
              className="border-2 border-pink-200 dark:border-pink-700 rounded-xl p-4 bg-pink-50 dark:bg-pink-900/20 cursor-pointer hover:border-pink-300 dark:hover:border-pink-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <div className="text-center mb-2">
                <div className="text-4xl mb-2">📸</div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white">{t('sessionOptionImage')}</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-1">
                {t('sessionOptionImageDesc')}
              </p>
              <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {t('sessionOptionImageFormats')}
              </div>
            </div>



            {/* Email Import Option */}
            <div 
              onClick={() => { onEmailImport(); onClose(); }}
              className="border-2 border-purple-200 dark:border-purple-700 rounded-xl p-4 bg-purple-50 dark:bg-purple-900/20 cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <div className="text-center mb-2">
                <div className="text-4xl mb-2">📧</div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white">{t('emailImportOption')}</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
                {t('emailImportOptionDesc')}
              </p>
            </div>

            {/* Ask the Expert Option */}
            <div 
              onClick={() => {
                if (userSubscription && ['gold', 'diamond', 'enterprise'].includes(userSubscription.toLowerCase())) {
                  onAskExpert();
                  onClose();
                }
              }}
              className={`border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-4 bg-yellow-50 dark:bg-yellow-900/20 cursor-pointer hover:border-yellow-300 dark:hover:border-yellow-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${
                userSubscription && ['gold', 'diamond', 'enterprise'].includes(userSubscription.toLowerCase()) 
                  ? '' 
                  : 'opacity-70'
              }`}
            >
              <div className="text-center mb-2">
                <div className="text-4xl mb-2">🧠</div>
                <h3 className="text-xl font-medium text-gray-800 dark:text-white">{t('sessionOptionExpert')}</h3>
                {!(userSubscription && ['gold', 'diamond', 'enterprise'].includes(userSubscription.toLowerCase())) && (
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    {t('premiumOnly')}
                  </div>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
                {t('sessionOptionExpertDesc')}
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
      
      {/* Image Upload Help Modal */}
      <ImageUploadHelpModal
        isOpen={isImageHelpOpen}
        onClose={() => setIsImageHelpOpen(false)}
        t={t}
      />

      {/* Audio Upload Help Modal */}
      <AudioUploadHelpModal
        isOpen={isAudioUploadHelpOpen}
        onClose={() => setIsAudioUploadHelpOpen(false)}
        t={t}
      />
      
      {/* Notion Integration Help Modal */}
      <NotionIntegrationHelpModal
        isOpen={isNotionHelpOpen}
        onClose={() => setIsNotionHelpOpen(false)}
      />

      {/* Idea Builder Simple Help */}
      <IdeaBuilderSimpleHelp
        isOpen={isIdeaHelpOpen}
        onClose={() => setIsIdeaHelpOpen(false)}
      />
    </div>
  );
};

export default SessionOptionsModal;
