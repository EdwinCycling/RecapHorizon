import React from 'react';
import { XMarkIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../hooks/useTranslation';

interface IdeaBuilderSimpleHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const IdeaBuilderSimpleHelp: React.FC<IdeaBuilderSimpleHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Resolve UI language from localStorage (consistent with other components)
  const uiLang = (typeof window !== 'undefined' && window.localStorage.getItem('uiLang')) || 'en';
  const { t } = useTranslation(uiLang as any);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full m-4">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <LightBulbIcon className="w-6 h-6 text-amber-500 dark:text-amber-400" />
            <h3 className="text-xl font-medium text-amber-600 dark:text-amber-300 tracking-tight">
              {t('ideaBuilderHelpTitle', 'Idea Builder Help')}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">
            <strong>{t('ideaBuilderHelpWhatIsTitle', 'What is Idea Builder?')}</strong><br />
            {t(
              'ideaBuilderHelpWhatIsDesc',
              'With Idea Builder you can quickly generate ideas, concepts and outlines based on a topic.'
            )}
          </p>

          <p className="leading-relaxed">
            <strong>{t('ideaBuilderHelpHow', 'How does it work?')}</strong><br />
            {t('ideaBuilderHelpStep1', '1. Enter an idea')}<br />
            {t('ideaBuilderHelpStep2', '2. RecapHorizon will guide you through 15 statements to develop your idea')}<br />
            {t('ideaBuilderHelpStep3', '3. Generate report')}<br />
            {t('ideaBuilderHelpStep4', '4. Use the report as transcript in our analysis section for further study')}
          </p>

          <p className="leading-relaxed text-xs text-slate-500 dark:text-slate-400">
            {t('ideaBuilderHelpNote', 'You can use the generated report directly in your analysis as a transcript.')}
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white transition-colors font-medium"
          >
            {t('ideaBuilderHelpClose', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdeaBuilderSimpleHelp;