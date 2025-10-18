import React, { useState, useEffect, useCallback } from 'react';
import { ThinkingTopic, ThinkingPartner, ThinkingAnalysisData } from '../../types';
import { FiZap, FiArrowLeft, FiRefreshCw, FiCopy, FiCheck } from 'react-icons/fi';
import { displayToast } from '../utils/clipboard';

interface ThinkingPartnerTabProps {
  t: (key: string, params?: Record<string, unknown>) => string;
  transcript: string;
  summary?: string;
  onAnalysisComplete: (data: ThinkingAnalysisData) => void;
  isGenerating?: boolean;
  language: string;
  userId: string;
  userTier: import('../../types').SubscriptionTier;
}

interface ThinkingPartnerState {
  step: 'generating' | 'selectTopic' | 'selectPartner' | 'analyzing' | 'complete';
  topics: ThinkingTopic[];
  selectedTopic?: ThinkingTopic;
  selectedPartner?: ThinkingPartner;
  analysis?: string;
  error?: string;
}

// Static thinking partner data as defined in the technical architecture
const THINKING_PARTNERS: ThinkingPartner[] = [
  {
    id: 'challenge-thinking',
    name: 'Challenge my thinking',
    description: 'Question assumptions, logic, and blind spots',
    promptTemplate: 'Here\'s what I\'m planning: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. Act as a critical thinker - Question my assumptions, logic, or blind spots - but don\'t rewrite anything. I want to stress test my own thinking, not get new ideas.',
    category: 'analysis'
  },
  {
    id: 'reframe-lens',
    name: 'Reframe through a different lens',
    description: 'View from new audience POV or positioning angle',
    promptTemplate: 'Here\'s the core idea I\'m working with: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. Help me reframe it through a different lens - like a new audience POV, emotional trigger, or brand positioning angle.',
    category: 'insight'
  },
  {
    id: 'translate-gut-feeling',
    name: 'Translate my gut feeling',
    description: 'Put words to tensions and misalignments',
    promptTemplate: 'Something about this feels off, but I can\'t explain why: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. Help me put words to the tension I\'m sensing. What might be misaligned or unclear?',
    category: 'insight'
  },
  {
    id: 'structure-thinking',
    name: 'Structure my messy thinking',
    description: 'Organize ideas into clear structure',
    promptTemplate: 'Here\'s a braindump of what I\'m thinking: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. Organize this into a clear structure or outline - but don\'t change the voice or inject new ideas.',
    category: 'structure'
  },
  {
    id: 'face-decision',
    name: 'Help me face the decision',
    description: 'Identify avoided or overcomplicated decisions',
    promptTemplate: 'Here\'s the context I\'m working with: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. What decision am I avoiding or overcomplicating? Reflect back where I\'m hesitating or dragging things out.',
    category: 'decision'
  },
  {
    id: 'surface-question',
    name: 'Surface the deeper question',
    description: 'Find the real strategic question underneath',
    promptTemplate: 'Here\'s the situation I\'m thinking through: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. Help me surface the "real" strategic question underneath this. What should I actually be asking myself?',
    category: 'insight'
  },
  {
    id: 'spot-risks',
    name: 'Spot execution risks',
    description: 'Identify real-world implementation challenges',
    promptTemplate: 'This is the strategy I\'m planning to roll out: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. Walk me through how this could go wrong in real-world execution. Think about resourcing, timing, team alignment, dependencies, etc.',
    category: 'analysis'
  },
  {
    id: 'reverse-engineer',
    name: 'Reverse-engineer my gut instinct',
    description: 'Unpack why an idea feels right',
    promptTemplate: 'Here\'s what I\'m thinking, and it feels right to me: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. Can you help me unpack "why" this might be a smart move - even if I can\'t fully explain it yet?',
    category: 'insight'
  }
];

const ThinkingPartnerTab: React.FC<ThinkingPartnerTabProps> = ({
  t,
  transcript,
  summary,
  onAnalysisComplete,
  isGenerating = false,
  language,
  userId,
  userTier
}) => {
  const [state, setState] = useState<ThinkingPartnerState>({
    step: 'generating',
    topics: [],
    error: undefined
  });

  // Generate topics when component mounts
  useEffect(() => {
    if (transcript && transcript.trim().length > 0) {
      generateTopics();
    }
  }, [transcript, summary]);

  const generateTopics = async () => {
    setState(prev => ({ ...prev, step: 'generating', error: undefined }));
    
    try {
      // Import AI service functions
      const { generateThinkingTopics } = await import('../services/thinkingPartnerService');
      
      const topics = await generateThinkingTopics(transcript, summary, language);
      
      setState(prev => ({
        ...prev,
        step: 'selectTopic',
        topics,
        error: undefined
      }));
    } catch (error) {
      console.error('Error generating thinking topics:', error);
      setState(prev => ({
        ...prev,
        step: 'selectTopic',
        topics: [],
        error: t('topicGenerationError', 'Fout bij het genereren van onderwerpen')
      }));
    }
  };

  const handleTopicSelect = (topic: ThinkingTopic) => {
    setState(prev => ({
      ...prev,
      selectedTopic: topic,
      step: 'selectPartner',
      error: undefined
    }));
  };

  const handlePartnerSelect = async (partner: ThinkingPartner) => {
    if (!state.selectedTopic) return;

    setState(prev => ({
      ...prev,
      selectedPartner: partner,
      step: 'analyzing',
      error: undefined
    }));

    try {
      // Import AI service functions
      const { generateThinkingPartnerAnalysis } = await import('../services/thinkingPartnerService');
      
      const analysis = await generateThinkingPartnerAnalysis(
        state.selectedTopic,
        partner,
        language
      );

      const analysisData: ThinkingAnalysisData = {
        topic: state.selectedTopic,
        partner,
        constructedPrompt: partner.promptTemplate
          .replace('{TOPIC_TITLE}', state.selectedTopic.title)
          .replace('{TOPIC_DESCRIPTION}', state.selectedTopic.description),
        aiResponse: analysis,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        analysis,
        step: 'complete',
        error: undefined
      }));

      onAnalysisComplete(analysisData);
    } catch (error) {
      console.error('Error generating thinking partner analysis:', error);
      setState(prev => ({
        ...prev,
        step: 'selectPartner',
        error: t('analysisError', 'Fout bij het uitvoeren van analyse')
      }));
    }
  };

  const handleRegenerate = () => {
    if (state.selectedTopic && state.selectedPartner) {
      handlePartnerSelect(state.selectedPartner);
    }
  };

  const handleReset = () => {
    setState({
      step: 'generating',
      topics: [],
      selectedTopic: undefined,
      selectedPartner: undefined,
      analysis: undefined,
      error: undefined
    });
    generateTopics();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      displayToast(t('analysisCopied', 'Analyse gekopieerd naar klembord'), 'success');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      displayToast(t('copyError', 'Kopiëren mislukt'), 'error');
    }
  };

  const getCategoryColor = (category: ThinkingPartner['category']) => {
    switch (category) {
      case 'analysis': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      case 'decision': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
      case 'structure': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
      case 'insight': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const renderGeneratingStep = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
        {t('generatingTopics', 'Onderwerpen genereren...')}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">
        {t('generatingTopicsDesc', 'AI analyseert je transcript om relevante denkonderwerpen te identificeren')}
      </p>
    </div>
  );

  const renderTopicSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {t('selectTopic', 'Selecteer een onderwerp')}
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          {t('selectTopicDesc', 'Kies het onderwerp dat je wilt verkennen met een denkpartner')}
        </p>
      </div>

      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{state.error}</p>
          <button
            onClick={generateTopics}
            className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm font-medium"
          >
            {t('tryAgain', 'Probeer opnieuw')}
          </button>
        </div>
      )}

      {state.topics.length === 0 && !state.error && (
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">
            {t('noTopicsGenerated', 'Geen onderwerpen gegenereerd')}
          </p>
          <button
            onClick={generateTopics}
            className="mt-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-200 text-sm font-medium"
          >
            {t('tryAgain', 'Probeer opnieuw')}
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {state.topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => handleTopicSelect(topic)}
            className="text-left p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          >
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
              {topic.title}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {topic.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderPartnerSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setState(prev => ({ ...prev, step: 'selectTopic' }))}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <FiArrowLeft size={16} />
          {t('backToTopics', 'Terug naar onderwerpen')}
        </button>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {t('selectThinkingPartner', 'Kies je denkpartner')}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {t('selectPartnerDesc', 'Selecteer de denkmethodologie die het beste past bij je vraag')}
        </p>
        {state.selectedTopic && (
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-3 mb-6">
            <p className="text-sm text-cyan-800 dark:text-cyan-200">
              <span className="font-medium">{t('selectedTopic', 'Geselecteerd onderwerp')}:</span> {state.selectedTopic.title}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {THINKING_PARTNERS.map((partner) => (
          <button
            key={partner.id}
            onClick={() => handlePartnerSelect(partner)}
            className={`text-left p-4 border rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${getCategoryColor(partner.category)}`}
          >
            <h4 className="font-semibold mb-2">
              {t(`thinkingPartner.${partner.id}`, partner.name)}
            </h4>
            <p className="text-sm opacity-90">
              {t(`thinkingPartner.${partner.id}Desc`, partner.description)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderAnalyzingStep = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
        {t('analyzingWithPartner', 'Analyseren met {partnerName}...', { 
          partnerName: state.selectedPartner ? t(`thinkingPartner.${state.selectedPartner.id}`, state.selectedPartner.name) : ''
        })}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md">
        {t('analyzingDesc', 'Je denkpartner analyseert het onderwerp en formuleert inzichten')}
      </p>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setState(prev => ({ ...prev, step: 'selectPartner' }))}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <FiArrowLeft size={16} />
          {t('backToPartners', 'Terug naar denkpartners')}
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <FiRefreshCw size={16} />
            {t('regenerateAnalysis', 'Analyse opnieuw genereren')}
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 text-sm bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
          >
            {t('startNewAnalysis', 'Nieuwe analyse starten')}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FiZap size={24} color="#0891b2" />
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                {state.selectedPartner ? t(`thinkingPartner.${state.selectedPartner.id}`, state.selectedPartner.name) : ''}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {state.selectedTopic?.title}
              </p>
            </div>
          </div>
          <button
            onClick={() => state.analysis && copyToClipboard(state.analysis)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <FiCopy size={16} />
            {t('copyAnalysis', 'Analyse kopiëren')}
          </button>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
            {state.analysis}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {state.step === 'generating' && renderGeneratingStep()}
      {state.step === 'selectTopic' && renderTopicSelection()}
      {state.step === 'selectPartner' && renderPartnerSelection()}
      {state.step === 'analyzing' && renderAnalyzingStep()}
      {state.step === 'complete' && renderCompleteStep()}
    </div>
  );
};

export { ThinkingPartnerTab };
export default ThinkingPartnerTab;