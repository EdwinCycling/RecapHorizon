import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiArrowLeft, FiCopy, FiDownload, FiMail, FiSearch } from 'react-icons/fi';
import { PromptDocument, SubscriptionTier, TranslationFunction } from '../../types';
import { 
  loadAvailablePrompts, 
  generateSpecialsTopics, 
  generateSpecialsResult 
} from '../services/specialsService';
import { displayToast } from '../utils/clipboard';
import { renderMarkdown } from '../utils/SafeHtml';
import BlurredLoadingOverlay from './BlurredLoadingOverlay';

interface SpecialsTabProps {
  transcript: string;
  summary?: string;
  // Output language for AI-generated result
  language: string;
  // App/UI language for topics list generation
  appLanguage: string;
  userId: string | null;
  userTier: SubscriptionTier;
  t: TranslationFunction;
  onEmailContent?: (content: string) => void;
  onMoveToTranscript?: (content: string) => void;
  isGenerating?: boolean;
}

type SpecialsStep = 'selection' | 'topics' | 'result';

interface SpecialsState {
  step: SpecialsStep;
  availablePrompts: PromptDocument[];
  selectedPrompt: PromptDocument | null;
  topics: string[];
  selectedTopic: string | null;
  result: string;
  isLoadingPrompts: boolean;
  isGeneratingTopics: boolean;
  isGeneratingResult: boolean;
  error?: string;
  // UI state for searching and pagination
  searchQuery: string;
  currentPage: number;
}

const SpecialsTab: React.FC<SpecialsTabProps> = ({
  transcript,
  summary,
  language,
  appLanguage,
  userId,
  userTier,
  t,
  onEmailContent,
  onMoveToTranscript,
  isGenerating = false
}) => {
  
  const [state, setState] = useState<SpecialsState>({
    step: 'selection',
    availablePrompts: [],
    selectedPrompt: null,
    topics: [],
    selectedTopic: null,
    result: '',
    isLoadingPrompts: false,
    isGeneratingTopics: false,
    isGeneratingResult: false,
    searchQuery: '',
    currentPage: 1
  });

  const [showMoveToTranscriptModal, setShowMoveToTranscriptModal] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = !!userId;

  // Load available prompts on component mount (only if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      loadPrompts();
    } else {
      setState(prev => ({ 
        ...prev, 
        error: t('mustBeLoggedIn', 'You must be logged in to continue.'),
        isLoadingPrompts: false 
      }));
    }
  }, [isAuthenticated]);

  const loadPrompts = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingPrompts: true, error: undefined }));
    
    try {
      const prompts = await loadAvailablePrompts();
      setState(prev => ({ 
        ...prev, 
        availablePrompts: prompts,
        isLoadingPrompts: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: t('specials.loadingError', 'Error loading specials'),
        isLoadingPrompts: false 
      }));
    }
  }, []);

  const handlePromptSelection = useCallback(async (prompt: PromptDocument) => {
    setState(prev => ({ 
      ...prev, 
      selectedPrompt: prompt,
      topics: [],
      selectedTopic: null,
      result: '',
      error: undefined
    }));

    if (prompt.requires_topic) {
      // Generate topics for this prompt
      await generateTopics();
    } else {
      // Skip to result generation for prompts that don't require topics
      setState(prev => ({ ...prev, step: 'result' }));
    }
  }, []);

  const generateTopics = useCallback(async () => {
    setState(prev => ({ ...prev, isGeneratingTopics: true, error: undefined }));
    
    try {
      const topics = await generateSpecialsTopics(
        transcript,
        summary,
        appLanguage,
        userId,
        userTier
      );
      
      if (topics.length > 0) {
        setState(prev => ({ 
          ...prev, 
          topics,
          step: 'topics',
          isGeneratingTopics: false
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: t('specials.noTopicsFound', 'No topics found in the transcript'),
          isGeneratingTopics: false
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: t('specials.topicsGenerationError', 'Error generating topics'),
        isGeneratingTopics: false
      }));
    }
  }, [transcript, summary, appLanguage, userId, userTier]);

  const handleTopicSelection = useCallback((topic: string) => {
    setState(prev => ({ 
      ...prev, 
      selectedTopic: topic,
      step: 'result'
    }));
  }, []);

  const generateResult = useCallback(async () => {
    if (!state.selectedPrompt) return;

    setState(prev => ({ ...prev, isGeneratingResult: true, error: undefined }));
    
    try {
      const result = await generateSpecialsResult(
        state.selectedPrompt,
        state.selectedTopic,
        transcript,
        summary,
        language,
        userId,
        userTier
      );
      
      setState(prev => ({ 
        ...prev, 
        result,
        isGeneratingResult: false
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: t('specials.resultGenerationError', 'Error generating result'),
        isGeneratingResult: false
      }));
    }
  }, [state.selectedPrompt, state.selectedTopic, transcript, summary, language, userId, userTier]);

  // Trigger automatic result generation when reaching the result step with valid selection
  useEffect(() => {
    const canGenerate =
      state.step === 'result' &&
      !!state.selectedPrompt &&
      (!state.selectedPrompt.requires_topic || !!state.selectedTopic) &&
      !state.isGeneratingResult &&
      !state.result;

    if (canGenerate) {
      generateResult();
    }
  }, [state.step, state.selectedPrompt, state.selectedTopic, state.isGeneratingResult, state.result, transcript, summary, language, userId, userTier, generateResult]);

  const resetState = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: 'selection',
      selectedPrompt: null,
      topics: [],
      selectedTopic: null,
      result: '',
      error: undefined
    }));
  }, []);

  const copyToClipboard = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      displayToast('Gekopieerd naar klembord', 'success');
    }).catch(() => {
      displayToast('Kopiëren mislukt', 'error');
    });
  }, []);

  const downloadAsFile = useCallback((content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    displayToast('Bestand gedownload', 'success');
  }, []);

  // Ensure safe filenames for browser downloads (remove illegal characters and normalize spaces)
  const sanitizeFileName = useCallback((raw: string): string => {
    const base = raw || 'Special';
    // Remove characters not allowed in common filesystems and avoid confusion with path traversal
    const cleaned = base.replace(/[\\/:*?"<>|]+/g, '').trim();
    // Collapse whitespace to single spaces and replace spaces with underscores
    return cleaned.replace(/\s+/g, '_');
  }, []);

  // Pagination size for prompts list
  const PAGE_SIZE = 25;

  // Derived list of prompts based on search query (search starts from 2+ characters)
  const filteredPrompts = useMemo(() => {
    const q = state.searchQuery.trim().toLowerCase();
    if (q.length >= 2) {
      return state.availablePrompts.filter(p => {
        const title = (p.title || '').toLowerCase();
        const text = (p.prompt_text || '').toLowerCase();
        return title.includes(q) || text.includes(q);
      });
    }
    return state.availablePrompts;
  }, [state.availablePrompts, state.searchQuery]);

  // Keep current page within bounds when filtered results change
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredPrompts.length / PAGE_SIZE));
    if (state.currentPage > totalPages) {
      setState(prev => ({ ...prev, currentPage: 1 }));
    }
  }, [filteredPrompts, state.currentPage]);

  // Current page items
  const pagedPrompts = useMemo(() => {
    const start = (state.currentPage - 1) * PAGE_SIZE;
    return filteredPrompts.slice(start, start + PAGE_SIZE);
  }, [filteredPrompts, state.currentPage]);

  // Helper: strip Markdown and control characters for clean plain text export/copy
  const stripMarkdown = useCallback((text: string): string => {
    if (!text) return '';
    let cleaned = text.replace(/\r\n|\r/g, '\n');
    // Remove headings markers
    cleaned = cleaned.replace(/^[ \t]*#{1,6}[ \t]*/gm, '');
    cleaned = cleaned.replace(/^\s*(=|\-){3,}\s*$/gm, '');
    // Bold/italic
    cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
    cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');
    // Code blocks/inline
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
    // Links and images
    cleaned = cleaned.replace(/!\[(.*?)\]\((.*?)\)/g, '$1');
    cleaned = cleaned.replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');
    // Blockquotes
    cleaned = cleaned.replace(/^[ \t]*>+[ \t]?/gm, '');
    // Normalize unordered bullets and common bullet symbols
    cleaned = cleaned.replace(/^[ \t]*([*+\-])\s+/gm, '- ');
    cleaned = cleaned.replace(/[•·▪◦]/g, '-');
    // Normalize ordered list markers "1)" or "1."
    cleaned = cleaned.replace(/^[ \t]*(\d{1,3})[\.)]\s+/gm, '$1. ');
    // Control/non-printable
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    // Remove lines of only formatting garbage
    cleaned = cleaned.replace(/^\s*[&*_~`\-]+\s*$/gm, '');
    cleaned = cleaned.replace(/^\s*&+\s*$/gm, '');
    // Collapse excessive blank lines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    // Trim trailing spaces per line
    cleaned = cleaned.split('\n').map(l => l.replace(/\s+$/, '')).join('\n');
    return cleaned.trim();
  }, []);

  const handleMoveToTranscript = useCallback(() => {
    if (!state.result) return;
    if (!onMoveToTranscript) return;

    const parts: string[] = [];
    // Add context headers so transcript consumers know what this content represents
    if (state.selectedPrompt?.title) {
      parts.push(`${t('specials.promptLabel', 'Prompt')}: ${state.selectedPrompt.title}`);
    }
    if (state.selectedTopic) {
      parts.push(`${t('specials.topicLabel', 'Topic')}: ${state.selectedTopic}`);
    }
    parts.push('');
    parts.push(stripMarkdown(state.result));
    const combined = parts.join('\n');
    onMoveToTranscript(combined);
    setShowMoveToTranscriptModal(false);
  }, [state.result, state.selectedPrompt, state.selectedTopic, onMoveToTranscript, t, stripMarkdown]);

  // Render prompt selection step
  const renderPromptSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {t('specials')}
        </h3>
      </div>

      {/* Subtitle explaining input vs output language behavior */}
      <p className="text-sm text-slate-600 dark:text-slate-400">{t('specialsSubtitle')}</p>

      {/* Search input for prompts (activates when 2+ characters are typed) */}
      <div className="relative">
        <div className="flex items-center">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value, currentPage: 1 }))}
              placeholder={t('specials.searchPlaceholder', 'Search prompts...')}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {t('specials.searchHint', 'Type at least 2 characters to search')}
        </p>
      </div>

      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">{state.error}</p>
        </div>
      )}

      {state.isLoadingPrompts ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">{t('loading', 'Loading...')}</span>
        </div>
      ) : filteredPrompts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">
            {t('showMeNoResults', 'No results found')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pagedPrompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => handlePromptSelection(prompt)}
                className="text-left p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                  {prompt.title}
                  {prompt.requires_topic ? (
                    <span className="ml-2 text-slate-500">{t('specials.topicRequired', '{topic required}')}</span>
                  ) : null}
                </h4>
              </button>
            ))}
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('specials.resultsCount', 'Results')}: {filteredPrompts.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setState(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                disabled={state.currentPage === 1}
                className="px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('prev', 'Prev')}
              </button>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {t('page', 'Page')} {state.currentPage} {t('of', 'of')} {Math.max(1, Math.ceil(filteredPrompts.length / PAGE_SIZE))}
              </span>
              <button
                onClick={() => setState(prev => ({ ...prev, currentPage: Math.min(Math.max(1, Math.ceil(filteredPrompts.length / PAGE_SIZE)), prev.currentPage + 1) }))}
                disabled={state.currentPage >= Math.max(1, Math.ceil(filteredPrompts.length / PAGE_SIZE))}
                className="px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('next', 'Next')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Render topic selection step
  const renderTopicSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setState(prev => ({ ...prev, step: 'selection' }))}
          className="flex items-center text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-200"
        >
          <FiArrowLeft className="mr-2" />
          {t('back', 'Back')}
        </button>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {t('specials.selectTopicFor', 'Select your topic for: {title}', { title: state.selectedPrompt?.title || t('specials') })}
        </h3>
      </div>

      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">{state.error}</p>
        </div>
      )}

      {state.topics.length === 0 ? (
        <div className="text-center py-8">
          <button
            onClick={generateTopics}
            disabled={state.isGeneratingTopics}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.isGeneratingTopics ? t('generatingTopics', 'Generating topics...') : t('generateTopics', 'Generate topics')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {state.topics.map((topic, index) => (
            <button
              key={index}
              onClick={() => handleTopicSelection(topic)}
              className="text-left p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                {topic}
              </h4>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Render result step
  const renderResult = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setState(prev => ({ ...prev, step: 'selection' }))}
          className="flex items-center text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-200"
        >
          <FiArrowLeft className="mr-2" />
          {t('back', 'Back')}
        </button>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {t('specials.resultHeading', 'Result')}
        </h3>
      </div>

      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">{state.error}</p>
        </div>
      )}

      {!state.result && !state.isGeneratingResult ? (
        <div className="text-center py-8">
          <span className="text-slate-600 dark:text-slate-400">{t('specials.autoGeneratingResult', 'Result will be generated automatically...')}</span>
        </div>
      ) : state.isGeneratingResult ? (
         <div className="flex items-center justify-center py-8">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
           <span className="ml-3 text-slate-600 dark:text-slate-400">{t('specials.generatingResult', 'Generating result...')}</span>
         </div>
       ) : state.result ? (
         <div className="space-y-4">
           {/* Context: selected prompt and topic */}
           <div className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
               <div className="text-sm text-slate-700 dark:text-slate-300">
                 {state.selectedPrompt?.title && (
                   <span className="mr-4"><span className="font-medium">{t('specials.promptLabel', 'Prompt')}:</span> {state.selectedPrompt.title}</span>
                 )}
                 {state.selectedTopic && (
                   <span><span className="font-medium">{t('specials.topicLabel', 'Topic')}:</span> {state.selectedTopic}</span>
                 )}
               </div>
               {/* Actions above the result */}
               <div className="flex flex-wrap gap-2">
                 <button
                   onClick={() => copyToClipboard(state.result)}
                   className="flex items-center px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                 >
                   <FiCopy className="mr-2 h-4 w-4" />
                   {t('copy', 'Kopiëren')}
                 </button>
                 <button
                   onClick={() => downloadAsFile(state.result, `${sanitizeFileName(state.selectedPrompt?.title || 'Special')}.txt`)}
                   className="flex items-center px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                 >
                   <FiDownload className="mr-2 h-4 w-4" />
                   {t('download', 'Download')}
                 </button>
                 {onEmailContent && (
                   <button
                     onClick={() => onEmailContent(state.result)}
                     className="flex items-center px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                   >
                     <FiMail className="mr-2 h-4 w-4" />
                     {t('email', 'E-mail')}
                   </button>
                 )}
                 {onMoveToTranscript && (
                   <button
                     onClick={() => setShowMoveToTranscriptModal(true)}
                     className="flex items-center px-3 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                   >
                     {t('aiDiscussion.moveToTranscript', 'Verplaats naar transcript')}
                   </button>
                 )}
               </div>
             </div>
           </div>

           {/* Result content */}
           <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
             {renderMarkdown(state.result)}
           </div>
         </div>
       ) : (
         <div className="text-center py-8">
           <span className="text-slate-600 dark:text-slate-400">{t('specials.autoGeneratingResult', 'Result will be generated automatically...')}</span>
         </div>
       )}
    </div>
  );

  // Main render
  return (
    <div className="relative">
      {(state.isGeneratingTopics || state.isGeneratingResult || isGenerating) && (
        <BlurredLoadingOverlay 
          text={
            state.isGeneratingTopics ? t('generatingTopics', 'Generating topics...') :
            state.isGeneratingResult ? t('specials.generatingResult', 'Generating result...') :
            t('loading', 'Loading...')
          }
        />
      )}
      
      {state.step === 'selection' && renderPromptSelection()}
      {state.step === 'topics' && renderTopicSelection()}
      {state.step === 'result' && renderResult()}

      {/* Move to Transcript Modal */}
      {showMoveToTranscriptModal && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              {t('aiDiscussion.moveToTranscriptModal.title', 'Rapport naar transcript verplaatsen')}
            </h3>
            
            <div className="space-y-3 mb-6">
              <p className="text-slate-600 dark:text-slate-400">
                {t('aiDiscussion.moveToTranscriptModal.message', 'Dit rapport wordt het nieuwe transcript en vervangt de huidige inhoud. Het kan daarna gebruikt worden voor verdere analyse met andere opties.')}
              </p>
              
              <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">
                {t('aiDiscussion.moveToTranscriptModal.warning', 'Let op: De huidige transcript-inhoud wordt permanent vervangen.')}
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowMoveToTranscriptModal(false)}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                {t('aiDiscussion.moveToTranscriptModal.cancel', 'Annuleren')}
              </button>
              
              <button
                onClick={handleMoveToTranscript}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {t('aiDiscussion.moveToTranscriptModal.confirm', 'Ja, vervang transcript')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialsTab;