import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiZap, FiArrowLeft, FiRefreshCw, FiCopy, FiCheck, FiDownload, FiArrowRight, FiMoreVertical, FiMail } from 'react-icons/fi';
import { 
  OpportunityTopic, 
  OpportunityRole, 
  OpportunityType, 
  OpportunityResult,
  generateOpportunityTopics,
  generateOpportunities,
  OPPORTUNITY_ROLES,
  OPPORTUNITY_TYPES
} from '../services/opportunitiesService';
import { displayToast } from '../utils/clipboard';
import BlurredLoadingOverlay from './BlurredLoadingOverlay';
import { SubscriptionTier, TranslationFunction } from '../../types';

interface OpportunitiesTabProps {
  t: TranslationFunction;
  transcript: string;
  summary?: string;
  onOpportunitiesComplete: (data: OpportunityAnalysisData) => void;
  isGenerating?: boolean;
  language: string;
  userId: string;
  userTier: import('../../types').SubscriptionTier;
  sessionId?: string;
}

export interface OpportunityAnalysisData {
  selectedTopics: OpportunityTopic[];
  selectedRoles: OpportunityRole[];
  selectedOpportunityTypes: OpportunityType[];
  results: OpportunityResult[];
  timestamp: Date;
}

interface OpportunityState {
  step: 'generating' | 'selectTopic' | 'selectRole' | 'selectType' | 'generating-opportunities' | 'complete';
  topics: OpportunityTopic[];
  selectedTopics: OpportunityTopic[];
  selectedRoles: OpportunityRole[];
  selectedOpportunityTypes: OpportunityType[];
  results: OpportunityResult[];
  error?: string;
  isGenerating: boolean;
}

const OpportunitiesTab: React.FC<OpportunitiesTabProps> = ({
  t,
  transcript,
  summary,
  onOpportunitiesComplete,
  isGenerating = false,
  language,
  userId,
  userTier,
  sessionId
}) => {
  // Check if user has access to Opportunities feature (Silver, Gold, Diamond, Enterprise - not Free)
  const hasAccess = userTier === SubscriptionTier.SILVER || userTier === SubscriptionTier.GOLD || userTier === SubscriptionTier.DIAMOND || userTier === SubscriptionTier.ENTERPRISE;
  const [state, setState] = useState<OpportunityState>({
    step: 'generating',
    topics: [],
    selectedTopics: [],
    selectedRoles: [],
    selectedOpportunityTypes: [],
    results: [],
    error: undefined,
    isGenerating: false
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Shared topics cache key (same as ThinkingPartnerTab for cross-tab sharing)
  const getTopicsCacheKey = useCallback(() => {
    const content = (summary || transcript || '').trim();
    const base = `${userId || 'anon'}:${language}:${sessionId || 'noSession'}`;
    let h = 0; for (let i = 0; i < content.length; i++) { h = ((h << 5) - h) + content.charCodeAt(i); h |= 0; }
    return `rh_topics:${base}:${h}`;
  }, [userId, language, sessionId, transcript, summary]);

  // Load topics from cache first; generate only if needed
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const hasGeneratedRef = useRef(false);

  const generateTopics = useCallback(async () => {
    setState(prev => ({ ...prev, step: 'generating', error: undefined, isGenerating: true }));
    
    try {
      const topics = await generateOpportunityTopics(transcript, summary, language, userId, userTier);
      
      try {
        const key = getTopicsCacheKey();
        window.localStorage.setItem(key, JSON.stringify(topics));
      } catch {}

      setState(prev => ({
        ...prev,
        step: 'selectTopic',
        topics,
        error: undefined,
        isGenerating: false
      }));
    } catch (error) {
      console.error('Error generating opportunity topics:', error);
      setState(prev => ({
        ...prev,
        step: 'selectTopic',
        topics: [],
        error: t('opportunityTopicGenerationError'),
        isGenerating: false
      }));
    }
  }, [transcript, summary, language, userId, userTier, getTopicsCacheKey, t]);

  useEffect(() => {
    if (!hasAccess) return;
    if (isGeneratingTopics) return;
    if (hasGeneratedRef.current) return;

    const content = (summary || transcript || '').trim();
    if (!content) {
      setState(prev => ({ 
        ...prev, 
        step: 'selectTopic', 
        topics: [], 
        error: t('opportunityTopicGenerationError') 
      }));
      return;
    }

    const tryLoadFromCache = () => {
      try {
        const key = getTopicsCacheKey();
        const cached = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
        if (cached) {
          const topics = JSON.parse(cached) as OpportunityTopic[];
          setState(prev => ({ ...prev, step: 'selectTopic', topics }));
          hasGeneratedRef.current = true;
          return true;
        }
      } catch {}
      return false;
    };

    // Only generate if we don't have topics yet, we're in generating state, and no cached topics found
    if (state.topics.length === 0 && state.step === 'generating' && !tryLoadFromCache()) {
      setIsGeneratingTopics(true);
      hasGeneratedRef.current = true;
      generateTopics().finally(() => {
        setIsGeneratingTopics(false);
      });
    }
  }, [hasAccess, transcript, summary, state.topics.length, state.step, generateTopics, t, isGeneratingTopics, getTopicsCacheKey]);

  const handleTopicSelect = (topic: OpportunityTopic) => {
    setState(prev => {
      const isSelected = prev.selectedTopics.some(t => t.id === topic.id);
      
      if (isSelected) {
        return {
          ...prev,
          selectedTopics: []
        };
      } else {
        // Select only one topic and automatically continue to roles
        const newState: OpportunityState = {
          ...prev,
          selectedTopics: [topic],
          step: 'selectRole'
        };
        
        // Scroll to top of the page
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
        
        return newState;
      }
    });
  };

  const handleContinueToRoles = () => {
    if (state.selectedTopics.length === 0) {
      setState(prev => ({ 
        ...prev, 
        error: t('selectAtLeastOneTopic') 
      }));
      return;
    }
    setState(prev => ({ ...prev, step: 'selectRole', error: undefined }));
    // Auto-scroll to top to show AI role selection
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleSelect = (role: OpportunityRole) => {
    setState(prev => {
      const isSelected = prev.selectedRoles.some(r => r.id === role.id);
      
      if (isSelected) {
        // Deselect the role
        return {
          ...prev,
          selectedRoles: [],
          error: undefined
        };
      } else {
        // Select only this role (replace any existing selection) and automatically continue to types
        const newState: OpportunityState = {
          ...prev,
          selectedRoles: [role],
          step: 'selectType',
          error: undefined
        };
        
        // Scroll to top of the page
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
        
        return newState;
      }
    });
  };

  const handleContinueToTypes = () => {
    if (state.selectedRoles.length === 0) {
      setState(prev => ({ 
        ...prev, 
        error: t('selectAtLeastOneRole') 
      }));
      return;
    }
    setState(prev => ({ ...prev, step: 'selectType', error: undefined }));
  };

  const handleOpportunityTypeSelect = (type: OpportunityType) => {
    setState(prev => {
      const isSelected = prev.selectedOpportunityTypes.some(t => t.id === type.id);
      
      if (isSelected) {
        // Deselect the type
        const newSelectedTypes = prev.selectedOpportunityTypes.filter(t => t.id !== type.id);
        return {
          ...prev,
          selectedOpportunityTypes: newSelectedTypes,
          error: undefined
        };
      } else {
        // Select the type only if we haven't reached the limit of 3
        if (prev.selectedOpportunityTypes.length >= 3) {
          return prev; // Don't allow more than 3 selections
        }
        
        const newSelectedTypes = [...prev.selectedOpportunityTypes, type];
        return {
          ...prev,
          selectedOpportunityTypes: newSelectedTypes,
          error: undefined
        };
      }
    });
  };

  const handleGenerateOpportunities = async () => {
    if (state.selectedOpportunityTypes.length === 0) {
      setState(prev => ({ 
        ...prev, 
        error: t('selectAtLeastOneType') 
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      step: 'generating-opportunities', 
      error: undefined, 
      isGenerating: true 
    }));

    try {
      const results = await generateOpportunities(
        transcript,
        state.selectedTopics,
        state.selectedRoles,
        state.selectedOpportunityTypes,
        language,
        userId,
        userTier
      );

      const analysisData: OpportunityAnalysisData = {
        selectedTopics: state.selectedTopics,
        selectedRoles: state.selectedRoles,
        selectedOpportunityTypes: state.selectedOpportunityTypes,
        results,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        results,
        step: 'complete',
        error: undefined,
        isGenerating: false
      }));

      onOpportunitiesComplete(analysisData);
    } catch (error) {
      console.error('Error generating opportunities:', error);
      setState(prev => ({
        ...prev,
        error: t('opportunityGenerationError'),
        isGenerating: false
      }));
    }
  };

  const handleRegenerate = () => {
    handleGenerateOpportunities();
  };

  const handleReset = () => {
    setState({
      step: 'selectTopic',
      topics: state.topics, // Behoud bestaande topics
      selectedTopics: [],
      selectedRoles: [],
      selectedOpportunityTypes: [],
      results: [],
      error: undefined,
      isGenerating: false
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      displayToast(t('opportunityCopied'), 'success');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      displayToast(t('copyError'), 'error');
    }
  };

  const downloadAllAsText = () => {
    if (state.results.length === 0) return;
    
    const content = state.results.map(result => 
      `=== ${result.type} - ${result.role} ===\n${result.topic}\n\n${result.content}\n\n`
    ).join('\n'.repeat(3));
    
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `kansen-analyse-${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    displayToast(t('opportunitiesDownloaded'), 'success');
  };

  const downloadAllAsPDF = async () => {
    if (state.results.length === 0) return;
    
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Kansen Analyse', 20, 20);
      
      if (state.selectedTopics.length > 0 && state.selectedRoles.length > 0) {
        doc.setFontSize(12);
        doc.text(`Onderwerpen: ${state.selectedTopics.map(t => t.title).join(', ')}`, 20, 30);
        doc.text(`Rollen: ${state.selectedRoles.map(r => r.name).join(', ')}`, 20, 40);
        doc.text(`Datum: ${new Date().toLocaleDateString('nl-NL')}`, 20, 50);
      }
      
      let yPosition = 70;
      doc.setFontSize(10);
      
      state.results.forEach((result, index) => {
        if (index > 0 && yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.text(`${result.type} - ${result.role}`, 20, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.text(`Onderwerp: ${result.topic}`, 20, yPosition);
        yPosition += 8;
        
        const lines = doc.splitTextToSize(result.content, 170);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 6 + 12;
      });
      
      doc.save(`kansen-analyse-${new Date().getTime()}.pdf`);
      displayToast(t('opportunitiesDownloadedPDF'), 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      displayToast(t('pdfGenerationError'), 'error');
    }
  };

  const emailAllOpportunities = () => {
    if (state.results.length === 0) return;
    
    const content = state.results.map(result => 
      `=== ${result.type} - ${result.role} ===\n${result.topic}\n\n${result.content}\n\n`
    ).join('\n'.repeat(3));
    
    const subject = encodeURIComponent('Kansen Analyse');
    const body = encodeURIComponent(`Kansen Analyse\n\n${content}`);
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

  const getCategoryColor = (category: OpportunityRole['category']) => {
    switch (category) {
      case 'analysis': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      case 'strategy': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
      case 'innovation': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200';
      case 'operations': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
      case 'leadership': return 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const formatOpportunityContent = (content: string) => {
    let formatted = content;

    // Convert markdown headers to HTML
    formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-800 dark:text-slate-200 mt-6 mb-3">$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-6 mb-4">$1</h1>');

    // Convert bold text
    formatted = formatted.replace(/\*\*\*\*(.*?)\*\*\*\*/g, '<strong class="font-bold text-slate-800 dark:text-slate-200">$1</strong>');
    formatted = formatted.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold text-slate-800 dark:text-slate-200">$1</strong>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800 dark:text-slate-200">$1</strong>');

    // Convert bullet points
    formatted = formatted.replace(/^\s*\*\s+(.*)$/gim, '<li class="ml-4 mb-1">$1</li>');
    formatted = formatted.replace(/(<li.*<\/li>)/s, '<ul class="list-disc list-inside space-y-1 mb-4">$1</ul>');

    // Convert tables
    const tableRegex = /\|(.+)\|\s*\n\|[-\s|]+\|\s*\n((?:\|.+\|\s*\n?)*)/g;
    formatted = formatted.replace(tableRegex, (match, header, rows) => {
      const headerCells = header.split('|').map(cell => cell.trim()).filter(cell => cell);
      const rowsArray = rows.trim().split('\n').map(row => 
        row.split('|').map(cell => cell.trim()).filter(cell => cell)
      );

      let tableHTML = '<div class="overflow-x-auto mb-4"><table class="min-w-full border border-gray-200 dark:border-slate-700 rounded-lg">';
      
      // Header
      tableHTML += '<thead class="bg-gray-50 dark:bg-slate-800"><tr>';
      headerCells.forEach(cell => {
        tableHTML += `<th class="px-4 py-2 text-left text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-gray-200 dark:border-slate-700">${cell}</th>`;
      });
      tableHTML += '</tr></thead>';

      // Body
      tableHTML += '<tbody>';
      rowsArray.forEach((row, index) => {
        tableHTML += `<tr class="${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}">`;
        row.forEach(cell => {
          tableHTML += `<td class="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">${cell}</td>`;
        });
        tableHTML += '</tr>';
      });
      tableHTML += '</tbody></table></div>';

      return tableHTML;
    });

    // Convert line breaks to proper spacing
    formatted = formatted.replace(/\n\n/g, '<br><br>');
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  };

  const renderTopicSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {t('selectOpportunityTopics')}
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          {t('selectOpportunityTopicsDesc')}
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
            {t('noOpportunityTopicsGenerated')}
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
        {state.topics.map((topic) => {
          const isSelected = state.selectedTopics.some(t => t.id === topic.id);
          return (
            <button
              key={topic.id}
              onClick={() => handleTopicSelect(topic)}
              className={`text-left p-4 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                isSelected 
                  ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-600' 
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    {topic.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {topic.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="text-cyan-600 dark:text-cyan-400 ml-3 mt-1">
                    <FiCheck size={20} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {state.topics.length > 0 && (
        <div className="pt-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            {state.selectedTopics.length > 0 
              ? t('opportunitiesTopicSelected') 
              : t('opportunitiesSelectOneTopic')}
          </p>
        </div>
      )}
    </div>
  );

  const renderRoleSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setState(prev => ({ 
            ...prev, 
            step: 'selectTopic',
            topics: prev.selectedTopics.length > 0 ? prev.selectedTopics : prev.topics
          }))}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <FiArrowLeft size={16} />
          {t('backToTopics')}
        </button>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {t('selectOpportunityRoles')}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {t('selectOpportunityRolesDesc')}
        </p>
        <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-3 mb-6">
          <p className="text-sm text-cyan-800 dark:text-cyan-200">
            <span className="font-medium">{t('selectedTopics')}:</span> {state.selectedTopics.map(t => t.title).join(', ')}
          </p>
        </div>
      </div>

      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OPPORTUNITY_ROLES.map((role) => {
          const isSelected = state.selectedRoles.some(r => r.id === role.id);
          return (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role)}
              className={`text-left p-4 border rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                isSelected 
                  ? `${getCategoryColor(role.category)} ring-2 ring-cyan-500` 
                  : getCategoryColor(role.category)
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">
                    {t(`opportunities.role.${role.id}`, role.name)}
                  </h4>
                  <p className="text-sm opacity-90">
                    {t(`opportunities.role.${role.id}Desc`, role.description)}
                  </p>
                </div>
                {isSelected && (
                  <div className="text-cyan-600 dark:text-cyan-400 ml-3 mt-1">
                    <FiCheck size={20} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
          {state.selectedRoles.length > 0 
            ? t('opportunitiesRoleSelected', '1 rol geselecteerd - automatisch doorgaan naar opportunity types') 
            : t('opportunitiesSelectOneRole', 'Selecteer 1 rol om door te gaan')}
        </p>
      </div>
    </div>
  );

  const renderTypeSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setState(prev => ({ ...prev, step: 'selectRole' }))}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <FiArrowLeft size={16} />
          {t('backToRoles', 'Terug naar AI-rollen')}
        </button>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {t('selectOpportunityTypes', 'Kies opportunity types')}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {t('selectOpportunityTypesDesc', 'Selecteer 1-2 types voor verschillende analyses')}
        </p>
        <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-3 mb-6">
          <p className="text-sm text-cyan-800 dark:text-cyan-200">
            <span className="font-medium">{t('selectedRoles', 'Geselecteerde rollen')}:</span> {state.selectedRoles.map(r => r.name).join(', ')}
          </p>
        </div>
      </div>

      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{state.error}</p>
        </div>
      )}

      <div className="grid gap-4">
        {OPPORTUNITY_TYPES.map((type) => {
          const isSelected = state.selectedOpportunityTypes.some(t => t.id === type.id);
          return (
            <button
              key={type.id}
              onClick={() => handleOpportunityTypeSelect(type)}
              className={`text-left p-4 border rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                isSelected 
                  ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-600 ring-2 ring-cyan-500' 
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    {t(`opportunityType.${type.id}`, type.name)}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t(`opportunityType.${type.id}Desc`, type.description)}
                  </p>
                </div>
                {isSelected && (
                  <div className="text-cyan-600 dark:text-cyan-400 ml-3 mt-1">
                    <FiCheck size={20} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {state.selectedOpportunityTypes.length} {t('opportunitiesTypesSelected', { total: OPPORTUNITY_TYPES.length })}
        </p>
        <button
          onClick={handleGenerateOpportunities}
          disabled={state.selectedOpportunityTypes.length === 0}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {t('generateOpportunities')}
        </button>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <BlurredLoadingOverlay text={t('generatingOpportunityTopics')} />
  );

  const renderGeneratingOpportunitiesStep = () => (
    <BlurredLoadingOverlay text={t('generatingOpportunities')} />
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setState(prev => ({ ...prev, step: 'selectType' }))}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <FiArrowLeft size={16} />
          {t('backToTypes')}
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <FiRefreshCw size={16} />
            {t('regenerateOpportunities')}
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 text-sm bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
          >
            {t('startNewOpportunityAnalysis')}
          </button>
          <div className="relative" ref={menuRef}>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <FiMoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={() => {
                    downloadAllAsText();
                    setMenuOpen(false);
                  }}
                >
                  <FiDownload size={16} />
                  {t('downloadAsText')}
                </button>
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={() => {
                    downloadAllAsPDF();
                    setMenuOpen(false);
                  }}
                >
                  <FiDownload size={16} />
                  {t('downloadAsPDF')}
                </button>
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={() => {
                    emailAllOpportunities();
                    setMenuOpen(false);
                  }}
                >
                  <FiMail size={16} />
                  {t('email')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {state.results.map((result, index) => (
        <div key={result.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FiZap size={24} color="#0891b2" />
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  {result.type} - {result.role}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {result.topic}
                </p>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(result.content)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              <FiCopy size={16} />
              {t('copyOpportunity')}
            </button>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div 
              className="text-slate-700 dark:text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatOpportunityContent(result.content) }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Show upgrade modal if user doesn't have access
  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-8 text-center">
          <div className="mb-6">
            <div className="text-cyan-600 dark:text-cyan-400 mx-auto mb-4">
              <FiZap size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              {t('opportunitiesUpgradeRequired')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t('opportunitiesUpgradeMessage')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
              {t('opportunitiesAvailableForTiers')}
            </h4>
            <div className="flex justify-center gap-4 text-sm">
              <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">Silver</span>
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">Gold</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Diamond</span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">Enterprise</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            {t('opportunitiesUpgradeNote')}
          </p>

          <button
            onClick={() => window.open('/pricing', '_blank')}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
          >
            {t('viewPricing')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {state.step === 'generating' && renderGeneratingStep()}
      {state.step === 'selectTopic' && renderTopicSelection()}
      {state.step === 'selectRole' && renderRoleSelection()}
      {state.step === 'selectType' && renderTypeSelection()}
      {state.step === 'generating-opportunities' && renderGeneratingOpportunitiesStep()}
      {state.step === 'complete' && renderCompleteStep()}
    </div>
  );
};

export { OpportunitiesTab };
export default OpportunitiesTab;