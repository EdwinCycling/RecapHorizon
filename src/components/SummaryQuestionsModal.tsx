import React, { useState } from 'react';
import { SummaryOptions, TranslationFunction } from '../../types';

interface SummaryQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: SummaryOptions) => void;
  t: TranslationFunction;
}

const SummaryQuestionsModal: React.FC<SummaryQuestionsModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  t
}) => {
  const [options, setOptions] = useState<SummaryOptions>({
    format: '',
    targetAudience: '',
    toneStyle: '',
    length: '',
    mainGoal: ''
  });

  const handleGenerate = () => {
    onGenerate(options);
    onClose();
  };

  const handleReset = () => {
    setOptions({
      format: '',
      targetAudience: '',
      toneStyle: '',
      length: '',
      mainGoal: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-medium text-gray-800 dark:text-white tracking-tight">{t('summaryQuestionsTitle')}</h2>
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
            {t('summaryQuestionsSubtitle')}
          </p>
          
          <div className="text-sm text-cyan-600 dark:text-cyan-400 mb-6 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
            {t('summaryOptional')}
          </div>

          {/* Format */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('summaryFormat')}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('summaryFormatQuestion')}
            </p>
            <select
              value={options.format}
              onChange={(e) => setOptions({ ...options, format: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">-</option>
              <option value="executiveSummary">
                {t('summaryFormatOptions.executiveSummary')}
              </option>
              <option value="toThePointSummary">
                {t('summaryFormatOptions.toThePointSummary')}
              </option>
              <option value="narrativeSummary">
                {t('summaryFormatOptions.narrativeSummary')}
              </option>
              <option value="decisionMakingSummary">
                {t('summaryFormatOptions.decisionMakingSummary')}
              </option>
              <option value="problemSolutionSummary">
                {t('summaryFormatOptions.problemSolutionSummary')}
              </option>
              <option value="detailedSummaryWithQuotes">
                {t('summaryFormatOptions.detailedSummaryWithQuotes')}
              </option>
              <option value="highLevelOverview">
                {t('summaryFormatOptions.highLevelOverview')}
              </option>
            </select>
          </div>

          {/* Target Audience */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('summaryTargetAudience')}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('summaryTargetAudienceQuestion')}
            </p>
            <select
              value={options.targetAudience}
              onChange={(e) => setOptions({ ...options, targetAudience: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">-</option>
              <option value="internalTeam">
                {t('summaryTargetAudienceOptions.internalTeam')}
              </option>
              <option value="management">
                {t('summaryTargetAudienceOptions.management')}
              </option>
              <option value="customers">
                {t('summaryTargetAudienceOptions.customers')}
              </option>
              <option value="investors">
                {t('summaryTargetAudienceOptions.investors')}
              </option>
              <option value="newEmployees">
                {t('summaryTargetAudienceOptions.newEmployees')}
              </option>
              <option value="generalPublic">
                {t('summaryTargetAudienceOptions.generalPublic')}
              </option>
              <option value="academics">
                {t('summaryTargetAudienceOptions.academics')}
              </option>
              <option value="competitors">
                {t('summaryTargetAudienceOptions.competitors')}
              </option>
              <option value="localCommunity">
                {t('summaryTargetAudienceOptions.localCommunity')}
              </option>
              <option value="alumni">
                {t('summaryTargetAudienceOptions.alumni')}
              </option>
              <option value="internationalStakeholders">
                {t('summaryTargetAudienceOptions.internationalStakeholders')}
              </option>
              <option value="specificInterestGroups">
                {t('summaryTargetAudienceOptions.specificInterestGroups')}
              </option>
            </select>
          </div>

          {/* Tone and Style */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('summaryToneStyle')}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('summaryToneStyleQuestion')}
            </p>
            <select
              value={options.toneStyle}
              onChange={(e) => setOptions({ ...options, toneStyle: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">-</option>
              <option value="formal">
                {t('summaryToneStyleOptions.formal')}
              </option>
              <option value="informal">
                {t('summaryToneStyleOptions.informal')}
              </option>
              <option value="inspiring">
                {t('summaryToneStyleOptions.inspiring')}
              </option>
              <option value="critical">
                {t('summaryToneStyleOptions.critical')}
              </option>
              <option value="humorous">
                {t('summaryToneStyleOptions.humorous')}
              </option>
              <option value="neutral">
                {t('summaryToneStyleOptions.neutral')}
              </option>
              <option value="professional">
                {t('summaryToneStyleOptions.professional')}
              </option>
              <option value="conversational">
                {t('summaryToneStyleOptions.conversational')}
              </option>
              <option value="authoritative">
                {t('summaryToneStyleOptions.authoritative')}
              </option>
              <option value="friendly">
                {t('summaryToneStyleOptions.friendly')}
              </option>
              <option value="technical">
                {t('summaryToneStyleOptions.technical')}
              </option>
              <option value="simple">
                {t('summaryToneStyleOptions.simple')}
              </option>
            </select>
          </div>

           {/* Length */}
           <div className="mb-6">
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               {t('summaryLength')}
             </label>
             <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
               {t('summaryLengthQuestion')}
             </p>
             <select
               value={options.length}
               onChange={(e) => setOptions({ ...options, length: e.target.value })}
               className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
             >
               <option value="">-</option>
               <option value="concise">
                 {t('summaryLengthOptions.concise')}
               </option>
               <option value="standard">
                 {t('summaryLengthOptions.standard')}
               </option>
               <option value="extensive">
                 {t('summaryLengthOptions.extensive')}
               </option>
               <option value="fullTimeline">
                 {t('summaryLengthOptions.fullTimeline')}
               </option>
             </select>
           </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-lg transition-colors"
            >
              {t('reset')}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              {t('generate')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryQuestionsModal;