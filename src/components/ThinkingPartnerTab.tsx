import React, { useState, useEffect, useCallback, useRef } from 'react';
import { buildRecapHorizonFilename } from '../utils/downloadUtils';
import { ThinkingTopic, ThinkingPartner, ThinkingAnalysisData, TranslationFunction } from '../../types';
import { FiZap, FiArrowLeft, FiRefreshCw, FiCopy, FiCheck, FiMoreVertical, FiDownload, FiMail } from 'react-icons/fi';
import { generateThinkingTopics, generateThinkingPartnerAnalysis } from '../services/thinkingPartnerService';
import { displayToast } from '../utils/clipboard';
import BlurredLoadingOverlay from './BlurredLoadingOverlay';

interface ThinkingPartnerTabProps {
  t: TranslationFunction;
  transcript: string;
  summary?: string;
  onAnalysisComplete: (data: ThinkingAnalysisData) => void;
  isGenerating?: boolean;
  language: string;
  userId: string;
  userTier: import('../../types').SubscriptionTier;
  sessionId?: string; // Add sessionId prop for cache scoping
}

interface ThinkingPartnerState {
  step: 'generating' | 'selectTopic' | 'selectPartner' | 'analyzing' | 'complete';
  topics: ThinkingTopic[];
  selectedTopic?: ThinkingTopic;
  selectedPartner?: ThinkingPartner;
  analysis?: string;
  error?: string;
  cacheKey?: string; // Track which cache key the current topics belong to
}

// Function to get thinking partners with translations
const getThinkingPartners = (t: TranslationFunction): ThinkingPartner[] => [
  {
    id: 'challenge-thinking',
    name: t('challengeThinking'),
    description: t('challengeThinkingDesc'),
    promptTemplate: t('promptTemplate.challenge-thinking'),
    category: 'analysis'
  },
  {
    id: 'reframe-lens',
    name: t('reframeLens'),
    description: t('reframeLensDesc'),
    promptTemplate: t('promptTemplate.reframe-lens'),
    category: 'insight'
  },
  {
    id: 'translate-gut-feeling',
    name: t('translateGutFeeling'),
    description: t('translateGutFeelingDesc'),
    promptTemplate: t('promptTemplate.translate-gut-feeling'),
    category: 'insight'
  },
  {
    id: 'structure-thinking',
    name: t('structureThinking'),
    description: t('structureThinkingDesc'),
    promptTemplate: t('promptTemplate.structure-thinking'),
    category: 'structure'
  },
  {
    id: 'face-decision',
    name: t('faceDecision'),
    description: t('faceDecisionDesc'),
    promptTemplate: t('promptTemplate.face-decision'),
    category: 'decision'
  },
  {
    id: 'surface-question',
    name: t('surfaceQuestion'),
    description: t('surfaceQuestionDesc'),
    promptTemplate: t('promptTemplate.surface-question'),
    category: 'insight'
  },
  {
    id: 'spot-risks',
    name: t('spotRisks'),
    description: t('spotRisksDesc'),
    promptTemplate: t('promptTemplate.spot-risks'),
    category: 'analysis'
  },
  {
    id: 'reverse-engineer',
    name: t('reverseEngineer'),
    description: t('reverseEngineerDesc'),
    promptTemplate: t('promptTemplate.reverse-engineer'),
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
  userTier,
  sessionId // Add sessionId parameter
}) => {
  const [state, setState] = useState<ThinkingPartnerState>({
    step: 'generating',
    topics: [],
    error: undefined
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Shared topics cache key across tabs (AI Discussion and Thinking Partner)
  const getTopicsCacheKey = useCallback(() => {
    const content = (summary || transcript || '').trim();
    const base = `${userId || 'anon'}:${language}:${sessionId || 'noSession'}`;
    let h = 0; for (let i = 0; i < content.length; i++) { h = ((h << 5) - h) + content.charCodeAt(i); h |= 0; }
    return `rh_topics:${base}:${h}`;
  }, [userId, language, sessionId, transcript, summary]);

  // Load topics from cache first; generate only if needed
  useEffect(() => {
    let cancelled = false;

    const content = (summary || transcript || '').trim();
    if (!content) {
      setState(prev => ({ ...prev, step: 'selectTopic', topics: [], error: t('topicGenerationError') }));
      return;
    }

    // Check if we already have topics loaded for this content
    const currentCacheKey = getTopicsCacheKey();
    const hasTopicsForCurrentContent = state.topics.length > 0 && state.cacheKey === currentCacheKey;
    
    if (hasTopicsForCurrentContent) {
      // We already have the right topics, ensure we're in the right step
      if (state.step === 'generating') {
        setState(prev => ({ ...prev, step: 'selectTopic' }));
      }
      return;
    }

    const tryLoadFromCache = () => {
      try {
        const cached = typeof window !== 'undefined' ? window.localStorage.getItem(currentCacheKey) : null;
        if (cached) {
          const topics = JSON.parse(cached) as ThinkingTopic[];
          if (!cancelled && topics.length > 0) {
            setState(prev => ({ ...prev, step: 'selectTopic', topics, cacheKey: currentCacheKey, error: undefined }));
            return true;
          }
        }
      } catch {}
      return false;
    };

    if (tryLoadFromCache()) return () => { cancelled = true; };

    // Only generate if we're in the generating step and don't have the right topics
    if (state.step === 'generating' || !hasTopicsForCurrentContent) {
      setState(prev => ({ ...prev, step: 'generating', error: undefined }));
      generateTopics();
    }

    return () => { cancelled = true; };
  }, [transcript, summary, language, getTopicsCacheKey, t]);

  const generateTopics = async () => {
    setState(prev => ({ ...prev, step: 'generating', error: undefined }));
    
    try {
      // Import AI service functions
      const { generateThinkingTopics } = await import('../services/thinkingPartnerService');
      
      const topics = await generateThinkingTopics(transcript, summary, language, userId, userTier);
      const cacheKey = getTopicsCacheKey();
      
      try {
        window.localStorage.setItem(cacheKey, JSON.stringify(topics));
      } catch {}

      setState(prev => ({
        ...prev,
        step: 'selectTopic',
        topics,
        cacheKey,
        error: undefined
      }));
    } catch (error) {
      console.error('Error generating thinking topics:', error);
      setState(prev => ({
        ...prev,
        step: 'selectTopic',
        topics: [],
        error: t('topicGenerationError')
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
        language,
        userId,
        userTier
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
        error: t('analysisError')
      }));
    }
  };

  const handleRegenerate = () => {
    if (state.selectedTopic && state.selectedPartner) {
      handlePartnerSelect(state.selectedPartner);
    }
  };

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      step: prev.topics.length > 0 ? 'selectTopic' : 'generating',
      selectedTopic: undefined,
      selectedPartner: undefined,
      analysis: undefined,
      error: undefined
    }));
    
    // Only regenerate topics if we don't have any cached topics
    if (state.topics.length === 0) {
      generateTopics();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      displayToast(t('analysisCopied'), 'success');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      displayToast(t('copyError'), 'error');
    }
  };

  const downloadAsText = () => {
    if (!state.analysis) return;
    
    const element = document.createElement('a');
    const file = new Blob([state.analysis], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
  element.download = buildRecapHorizonFilename('txt');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    displayToast(t('analysisDownloaded'), 'success');
  };

  const downloadAsPDF = async () => {
    if (!state.analysis) return;
    
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Denkpartner Analyse', 20, 20);
      
      if (state.selectedPartner && state.selectedTopic) {
        doc.setFontSize(12);
        doc.text(`Denkpartner: ${state.selectedPartner.name}`, 20, 30);
        doc.text(`Onderwerp: ${state.selectedTopic.title}`, 20, 40);
        doc.text(`Datum: ${new Date().toLocaleDateString('nl-NL')}`, 20, 50);
      }
      
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(state.analysis, 170);
      doc.text(lines, 20, 60);
      
      doc.save(buildRecapHorizonFilename('pdf'));
      displayToast(t('analysisDownloadedPDF'), 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      displayToast(t('pdfGenerationError'), 'error');
    }
  };

  const emailAnalysis = () => {
    if (!state.analysis) return;
    
    const subject = encodeURIComponent('Denkpartner Analyse');
    const body = encodeURIComponent(`Denkpartner Analyse\n\n${state.analysis}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getCategoryColor = (category: ThinkingPartner['category']) => {
    switch (category) {
      case 'analysis': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      case 'decision': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
      case 'structure': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
      case 'insight': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };



  const renderTopicSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {t('selectTopic')}
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          {t('selectTopicDesc')}
        </p>
      </div>

      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{state.error}</p>
          <button
            onClick={generateTopics}
            className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm font-medium"
          >
            {t('tryAgain')}
          </button>
        </div>
      )}

      {state.topics.length === 0 && !state.error && (
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">
            {t('noTopicsGenerated')}
          </p>
          <button
            onClick={generateTopics}
            className="mt-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-200 text-sm font-medium"
          >
            {t('tryAgain')}
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
          {t('backToTopics')}
        </button>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {t('selectThinkingPartner')}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {t('selectPartnerDesc')}
        </p>
        {state.selectedTopic && (
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-3 mb-6">
            <p className="text-sm text-cyan-800 dark:text-cyan-200">
              <span className="font-medium">{t('selectedTopic')}:</span> {state.selectedTopic.title}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {getThinkingPartners(t).map((partner) => (
          <button
            key={partner.id}
            onClick={() => handlePartnerSelect(partner)}
            className={`text-left p-4 border rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${getCategoryColor(partner.category)}`}
          >
            <h4 className="font-semibold mb-2">
              {partner.name}
            </h4>
            <p className="text-sm opacity-90">
              {partner.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <BlurredLoadingOverlay text={t('generatingTopics')} />
  );

  const renderAnalyzingStep = () => (
    <BlurredLoadingOverlay 
      text={t('analyzingWithPartner', 'Analyseren met {partnerName}...', {
        partnerName: state.selectedPartner ? t(`thinkingPartner.${state.selectedPartner.id}`, state.selectedPartner.name) : ''
      })} 
    />
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-start">
        <button
          onClick={() => setState(prev => ({ ...prev, step: 'selectPartner' }))}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <FiArrowLeft size={16} />
          {t('backToPartners')}
        </button>
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => state.analysis && copyToClipboard(state.analysis)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              <FiCopy size={16} />
              {t('copyAnalysis')}
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                <FiMoreVertical size={16} />
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        downloadAsText();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <FiDownload size={16} />
                      {t('downloadAsText')}
                    </button>
                    <button
                      onClick={() => {
                        downloadAsPDF();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <FiDownload size={16} />
                      {t('downloadAsPDF')}
                    </button>
                    <button
                      onClick={() => {
                        emailAnalysis();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <FiMail size={16} />
                      {t('emailAnalysis')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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