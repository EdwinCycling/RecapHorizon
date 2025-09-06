import React, { useState } from 'react';
import { StorytellingOptions } from '../../types';

interface StorytellingQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: StorytellingOptions) => void;
  t: (key: string) => string;
}



const StorytellingQuestionsModal: React.FC<StorytellingQuestionsModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  t
}) => {
  const [options, setOptions] = useState<StorytellingOptions>({
    targetAudience: '',
    mainGoal: '',
    toneStyle: '',
    length: ''
  });

  const handleGenerate = () => {
    onGenerate(options);
    onClose();
  };

  const handleReset = () => {
    setOptions({
      targetAudience: '',
      mainGoal: '',
      toneStyle: '',
      length: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('storytellingQuestionsTitle')}</h2>
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
            {t('storytellingQuestionsSubtitle')}
          </p>
          
          <div className="text-sm text-cyan-600 dark:text-cyan-400 mb-6 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
            💡 {t('storytellingOptional')}
          </div>

          {/* Target Audience */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('storytellingTargetAudience')}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('storytellingTargetAudienceQuestion')}
            </p>
            <select
              value={options.targetAudience}
              onChange={(e) => setOptions({ ...options, targetAudience: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">-</option>
              <option value={t('storytellingTargetAudienceOptions.internalTeam')}>
                {t('storytellingTargetAudienceOptions.internalTeam')}
              </option>
              <option value={t('storytellingTargetAudienceOptions.management')}>
                {t('storytellingTargetAudienceOptions.management')}
              </option>
              <option value={t('storytellingTargetAudienceOptions.customers')}>
                {t('storytellingTargetAudienceOptions.customers')}
              </option>
              <option value={t('storytellingTargetAudienceOptions.investors')}>
                {t('storytellingTargetAudienceOptions.investors')}
              </option>
              <option value={t('storytellingTargetAudienceOptions.newEmployees')}>
                {t('storytellingTargetAudienceOptions.newEmployees')}
              </option>
              <option value={t('storytellingTargetAudienceOptions.generalPublic')}>
                {t('storytellingTargetAudienceOptions.generalPublic')}
              </option>
              <option value={t('storytellingTargetAudienceOptions.academics')}>
                {t('storytellingTargetAudienceOptions.academics')}
              </option>
              <option value={t('storytellingTargetAudienceOptions.competitors')}>
                {t('storytellingTargetAudienceOptions.competitors')}
              </option>
              <option value={t('storytellingTargetAudienceOptions.localCommunity')}>
                {t('storytellingTargetAudienceOptions.localCommunity')}
              </option>
              <option value={t('storytellingTargetAudienceOptions.alumni')}>
                {t('storytellingTargetAudienceOptions.alumni')}
              </option>
              <option value={t('storytellingTargetAudienceOptions.internationalStakeholders')}>
                {t('storytellingTargetAudienceOptions.internationalStakeholders')}
              </option>
              <option value={t('storytellingTargetAudienceOptions.specificInterestGroups')}>
                {t('storytellingTargetAudienceOptions.specificInterestGroups')}
              </option>
            </select>
          </div>

          {/* Main Goal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('storytellingMainGoal')}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('storytellingMainGoalQuestion')}
            </p>
            <select
              value={options.mainGoal}
              onChange={(e) => setOptions({ ...options, mainGoal: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">-</option>
              <option value={t('storytellingMainGoalOptions.inform')}>
                {t('storytellingMainGoalOptions.inform')}
              </option>
              <option value={t('storytellingMainGoalOptions.motivate')}>
                {t('storytellingMainGoalOptions.motivate')}
              </option>
              <option value={t('storytellingMainGoalOptions.convince')}>
                {t('storytellingMainGoalOptions.convince')}
              </option>
              <option value={t('storytellingMainGoalOptions.celebrate')}>
                {t('storytellingMainGoalOptions.celebrate')}
              </option>
              <option value={t('storytellingMainGoalOptions.explain')}>
                {t('storytellingMainGoalOptions.explain')}
              </option>
              <option value={t('storytellingMainGoalOptions.educate')}>
                {t('storytellingMainGoalOptions.educate')}
              </option>
              <option value={t('storytellingMainGoalOptions.warn')}>
                {t('storytellingMainGoalOptions.warn')}
              </option>
              <option value={t('storytellingMainGoalOptions.engage')}>
                {t('storytellingMainGoalOptions.engage')}
              </option>
              <option value={t('storytellingMainGoalOptions.promote')}>
                {t('storytellingMainGoalOptions.promote')}
              </option>
              <option value={t('storytellingMainGoalOptions.reflect')}>
                {t('storytellingMainGoalOptions.reflect')}
              </option>
              <option value={t('storytellingMainGoalOptions.predict')}>
                {t('storytellingMainGoalOptions.predict')}
              </option>
              <option value={t('storytellingMainGoalOptions.commemorate')}>
                {t('storytellingMainGoalOptions.commemorate')}
              </option>
            </select>
          </div>

          {/* Tone and Style */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('storytellingToneStyle')}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('storytellingToneStyleQuestion')}
            </p>
            <select
              value={options.toneStyle}
              onChange={(e) => setOptions({ ...options, toneStyle: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">-</option>
              <option value={t('storytellingToneStyleOptions.formal')}>
                {t('storytellingToneStyleOptions.formal')}
              </option>
              <option value={t('storytellingToneStyleOptions.informal')}>
                {t('storytellingToneStyleOptions.informal')}
              </option>
              <option value={t('storytellingToneStyleOptions.inspiring')}>
                {t('storytellingToneStyleOptions.inspiring')}
              </option>
              <option value={t('storytellingToneStyleOptions.critical')}>
                {t('storytellingToneStyleOptions.critical')}
              </option>
              <option value={t('storytellingToneStyleOptions.humorous')}>
                {t('storytellingToneStyleOptions.humorous')}
              </option>
              <option value={t('storytellingToneStyleOptions.empathetic')}>
                {t('storytellingToneStyleOptions.empathetic')}
              </option>
              <option value={t('storytellingToneStyleOptions.neutral')}>
                {t('storytellingToneStyleOptions.neutral')}
              </option>
              <option value={t('storytellingToneStyleOptions.dynamic')}>
                {t('storytellingToneStyleOptions.dynamic')}
              </option>
              <option value={t('storytellingToneStyleOptions.warm')}>
                {t('storytellingToneStyleOptions.warm')}
              </option>
              <option value={t('storytellingToneStyleOptions.technical')}>
                {t('storytellingToneStyleOptions.technical')}
              </option>
              <option value={t('storytellingToneStyleOptions.narrative')}>
                {t('storytellingToneStyleOptions.narrative')}
              </option>
              <option value={t('storytellingToneStyleOptions.cultureSensitive')}>
                {t('storytellingToneStyleOptions.cultureSensitive')}
              </option>
            </select>
          </div>

          {/* Length */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('storytellingLength')}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t('storytellingLengthQuestion')}
            </p>
            <select
              value={options.length}
              onChange={(e) => setOptions({ ...options, length: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">-</option>
              <option value={t('storytellingLengthOptions.short')}>
                {t('storytellingLengthOptions.short')}
              </option>
              <option value={t('storytellingLengthOptions.medium')}>
                {t('storytellingLengthOptions.medium')}
              </option>
              <option value={t('storytellingLengthOptions.long')}>
                {t('storytellingLengthOptions.long')}
              </option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
          >
            Reset
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
            >
              {t('storytellingCancel')}
            </button>
            <button
              onClick={handleGenerate}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
            >
              {t('storytellingGenerate')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorytellingQuestionsModal;
