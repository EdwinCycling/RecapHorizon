import React from 'react';
import { XMarkIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { TranslationFunction } from '../../types';

interface IdeaBuilderHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationFunction;
}

const IdeaBuilderHelpModal: React.FC<IdeaBuilderHelpModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <LightBulbIcon className="w-6 h-6 text-amber-500 dark:text-amber-400" />
            <h3 className="text-xl font-medium text-amber-600 dark:text-amber-300 tracking-tight">{t('ideaBuilderHelpTitle', 'Idea Builder')}</h3>
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
            <h4 className="font-medium text-lg text-slate-800 dark:text-slate-200 mb-3">{t('ideaBuilderHelpSubtitle', 'What is Idea Builder?')}</h4>
            <p className="leading-relaxed">{t('ideaBuilderHelpIntro', 'Idea Builder helps you quickly generate high-quality ideas, outlines and angles based on your topic, audience and goals. Use it to kickstart a content plan, product concept, campaign or research direction.')}</p>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-5">
            <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
              <LightBulbIcon className="w-5 h-5" />
              {t('ideaBuilderHelpTipsTitle', 'Tips to get great results')}
            </h5>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t('ideaBuilderHelpTipSpecific', 'Be specific: define the topic, audience and goal as clearly as possible.')}</li>
              <li>{t('ideaBuilderHelpTipConstraints', 'Add constraints: mention what to avoid or include (e.g. no jargon, include step-by-step outline).')}</li>
              <li>{t('ideaBuilderHelpTipCount', 'Choose an appropriate number of ideas to balance breadth and depth.')}</li>
              <li>{t('ideaBuilderHelpTipTone', 'Pick a tone that matches your audience (e.g. professional, friendly, concise).')}</li>
            </ul>
          </div>

          {/* How it works */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-5">
            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-3">{t('ideaBuilderHelpHowTitle', 'How it works')}</h5>
            <ol className="list-decimal pl-5 space-y-2">
              <li>{t('ideaBuilderHelpHow1', 'Fill in the topic, audience and goal. Optional: tone, constraints, and number of ideas.')}</li>
              <li>{t('ideaBuilderHelpHow2', 'Click Generate. The AI will produce ideas and optional outlines.')}</li>
              <li>{t('ideaBuilderHelpHow3', 'Use the result directly in your analysis as the session transcript.')}</li>
            </ol>
          </div>

          {/* Privacy & Safety */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-5">
            <h5 className="font-medium text-green-800 dark:text-green-200 mb-3">{t('ideaBuilderHelpSafetyTitle', 'Input safety')}</h5>
            <p>{t('ideaBuilderHelpSafetyDesc', 'We validate and sanitize your input before sending it to AI to avoid unsafe content. Do not include secrets or personal data.')}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white transition-colors font-medium"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdeaBuilderHelpModal;