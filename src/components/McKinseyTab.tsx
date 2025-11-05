import React, { useState, useEffect, useCallback, useRef, JSX } from 'react';
import { McKinseyTopic, McKinseyFramework, McKinseyAnalysisData, SubscriptionTier, TranslationFunction } from '../../types';
import { FiZap, FiArrowLeft, FiRefreshCw, FiCopy, FiCheck, FiMoreVertical, FiDownload, FiMail, FiTarget, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { generateMckinseyTopics, generateMckinseyAnalysis } from '../services/mckinseyService';
import { displayToast } from '../utils/clipboard';

interface McKinseyTabProps {
  t: TranslationFunction;
  transcript: string;
  summary?: string;
  onAnalysisComplete: (data: McKinseyAnalysisData) => void;
  isGenerating?: boolean;
  language: string;
  userId: string;
  userTier: SubscriptionTier;
  sessionId?: string;
}

interface McKinseyState {
  step: 'generating' | 'selectTopic' | 'selectRole' | 'selectFramework' | 'analyzing' | 'complete';
  topics: McKinseyTopic[];
  selectedTopic?: McKinseyTopic;
  selectedRole?: string;
  selectedFramework?: McKinseyFramework;
  analysis?: string;
  error?: string;
  cacheKey?: string;
}

// McKinsey consultant roles
const getMckinseyRoles = (t: TranslationFunction) => [
  {
    id: 'strategy-consultant',
    name: t('mckinseyRoleStrategyConsultant'),
    description: t('mckinseyRoleStrategyConsultantDesc'),
    icon: FiTrendingUp,
    category: 'strategy'
  },
  {
    id: 'business-analyst',
    name: t('mckinseyRoleBusinessAnalyst'),
    description: t('mckinseyRoleBusinessAnalystDesc'),
    icon: FiTarget,
    category: 'analysis'
  },
  {
    id: 'management-consultant',
    name: t('mckinseyRoleManagementConsultant'),
    description: t('mckinseyRoleManagementConsultantDesc'),
    icon: FiUsers,
    category: 'management'
  },
  {
    id: 'ceo-advisor',
    name: t('mckinseyRoleCeoAdvisor'),
    description: t('mckinseyRoleCeoAdvisorDesc'),
    icon: FiZap,
    category: 'leadership'
  }
];

const McKinseyTab: React.FC<McKinseyTabProps> = ({
  t,
  transcript,
  summary,
  onAnalysisComplete,
  isGenerating = false,
  language,
  userId,
  userTier,
  sessionId
}) => {
  const [state, setState] = useState<McKinseyState>({
    step: 'generating',
    topics: [],
    error: undefined
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Guard to prevent multiple concurrent generations for same content
  const generationStartedRef = useRef(false);
  
  // Calculate content hash that only changes when content actually changes
  const contentHash = React.useMemo(() => {
    const content = (summary || transcript || '').trim();
    if (!content) return '';
    let h = 0; 
    for (let i = 0; i < content.length; i++) { 
      h = ((h << 5) - h) + content.charCodeAt(i); 
      h |= 0; 
    }
    return `${content.length}:${h}`;
  }, [summary, transcript]);



  const generateTopics = useCallback(async () => {
    // Get current values from props/state at time of call
    const currentTranscript = transcript;
    const currentSummary = summary;
    
    setState(prev => {
      return { ...prev, step: 'generating', error: undefined };
    });
    
    try {
      const topics = await generateMckinseyTopics(currentTranscript, currentSummary, language, userId, userTier);
      
      // Calculate cache key directly
      const content = (currentSummary || currentTranscript || '').trim();
      const base = `${userId || 'anon'}:${language}:${sessionId || 'noSession'}`;
      let h = 0; for (let i = 0; i < content.length; i++) { h = ((h << 5) - h) + content.charCodeAt(i); h |= 0; }
      const cacheKey = `rh_mckinsey_topics:${base}:${h}`;
      
      try {
        window.localStorage.setItem(cacheKey, JSON.stringify(topics));
      } catch (cacheError) {
      }

      setState(prev => {
        const newState = {
          ...prev,
          step: 'selectTopic' as const,
          topics,
          cacheKey,
          error: undefined
        };
        return newState;
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        step: 'selectTopic',
        topics: [],
        error: t('topicGenerationError') || 'Fout bij het genereren van onderwerpen'
      }));
    }
  }, [language, userId, userTier, sessionId]); // Keep callback stable; exclude `t` to avoid unnecessary re-creations

  // Load topics from cache first; generate only if needed
  useEffect(() => {
    let cancelled = false;

    const content = (summary || transcript || '').trim();
    if (!content) {
      setState(prev => ({ ...prev, step: 'selectTopic', topics: [], error: t('topicGenerationError') || 'Er is onvoldoende inhoud om onderwerpen te genereren' }));
      return;
    }

    // Calculate cache key directly here to avoid dependency issues
    const base = `${userId || 'anon'}:${language}:${sessionId || 'noSession'}`;
    let h = 0; for (let i = 0; i < content.length; i++) { h = ((h << 5) - h) + content.charCodeAt(i); h |= 0; }
    const currentCacheKey = `rh_mckinsey_topics:${base}:${h}`;
    
    // First try to load from cache
    const tryLoadFromCache = (): Pick<McKinseyState, 'step' | 'topics' | 'cacheKey' | 'error'> | null => {
      try {
        const cached = typeof window !== 'undefined' ? window.localStorage.getItem(currentCacheKey) : null;
        if (cached) {
          const topics = JSON.parse(cached) as McKinseyTopic[];
          if (!cancelled && topics.length > 0) {
            // Return the new state instead of calling setState directly
            return { step: 'selectTopic' as const, topics, cacheKey: currentCacheKey, error: undefined };
          }
        }
      } catch (error) {
        // Ignore cache loading errors silently
      }
      return null;
    };

    // Check current state and decide what to do in ONE setState call
    setState(prev => {
      if (prev.cacheKey === currentCacheKey && prev.topics.length > 0) {
        // We already have the right topics, just ensure we're in the right step
        if (prev.step === 'generating') {
          return { ...prev, step: 'selectTopic' };
        }
        return prev;
      }
      
      // Try to load from cache first
      const cachedState = tryLoadFromCache();
      if (cachedState) {
        return { ...prev, ...cachedState };
      }
      
      // No cache found for this content. Ensure generation starts exactly once.
      if (prev.cacheKey !== currentCacheKey || prev.topics.length === 0) {
        if (!generationStartedRef.current) {
          generationStartedRef.current = true;
          // Start generation directly without setTimeout to avoid re-triggers
          generateTopics();
        }

        // Make sure UI reflects generating state
        if (prev.step !== 'generating') {
          return { ...prev, step: 'generating', error: undefined };
        }
        return prev;
      }

      return prev;
    });

    return () => { cancelled = true; };
  }, [language, userId, sessionId, contentHash]); // Exclude `t` to prevent re-triggers from changing function reference

  // Reset generation guard when content/user context changes
  useEffect(() => {
    generationStartedRef.current = false;
  }, [contentHash, language, userId, sessionId]);



  const handleTopicSelect = (topic: McKinseyTopic) => {
    setState(prev => ({
      ...prev,
      selectedTopic: topic,
      step: 'selectRole',
      error: undefined
    }));
  };

  const handleRoleSelect = (roleId: string) => {
    setState(prev => ({
      ...prev,
      selectedRole: roleId,
      step: 'selectFramework',
      error: undefined
    }));
  };

  const handleFrameworkSelect = async (framework: McKinseyFramework) => {
    if (!state.selectedTopic || !state.selectedRole) return;

    setState(prev => ({
      ...prev,
      selectedFramework: framework,
      step: 'analyzing',
      error: undefined
    }));

    try {
      const analysis = await generateMckinseyAnalysis(
        state.selectedTopic!,
        framework,
        state.selectedRole!,
        language,
        userId,
        userTier,
        transcript,
        summary
      );

      const analysisData: McKinseyAnalysisData = {
        topic: state.selectedTopic!,
        framework,
        roleId: state.selectedRole!,
        analysis,
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
      // Show a clear, localized error toast and surface the message in UI
      const msg = t('emptyResponseReceived', 'Lege response ontvangen');
      displayToast(msg, 'error');
      setState(prev => ({
        ...prev,
        step: 'selectFramework',
        error: t('analysisError') || msg
      }));
    }
  };

  const handleRegenerate = () => {
    if (state.selectedTopic && state.selectedRole && state.selectedFramework) {
      handleFrameworkSelect(state.selectedFramework);
    }
  };

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      step: prev.topics.length > 0 ? 'selectTopic' : 'generating',
      selectedTopic: undefined,
      selectedRole: undefined,
      selectedFramework: undefined,
      analysis: undefined,
      error: undefined
    }));
    
    if (state.topics.length === 0) {
      generateTopics();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      displayToast(t('copiedToClipboard', 'Gekopieerd naar klembord!'), 'success');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      displayToast(t('copyFailed', 'Kopiëren mislukt'), 'error');
    }
  };

  const downloadAsText = () => {
    if (!state.analysis) return;
    
    // Professionele tekstopmaak met header en metadata
    let formattedText = `STRATEGISCHE ANALYSE RAPPORT\n`;
    formattedText += `===============================\n\n`;
    
    if (state.selectedFramework && state.selectedTopic) {
      formattedText += `Framework: ${state.selectedFramework}\n`;
      formattedText += `Onderwerp: ${state.selectedTopic.title}\n`;
      if (state.selectedRole) {
        formattedText += `Rol: ${state.selectedRole}\n`;
      }
      formattedText += `Datum: ${new Date().toLocaleDateString('nl-NL')}\n`;
      formattedText += `\n===============================\n\n`;
    }
    
    formattedText += state.analysis;
    formattedText += `\n\n===============================\n`;
    formattedText += `Gegenereerd door RecapHorizon\n`;
    formattedText += `${new Date().toLocaleString('nl-NL')}\n`;
    
    const element = document.createElement('a');
    const file = new Blob([formattedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `mckinsey-strategische-analyse-${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    displayToast(t('analysisDownloaded', 'Professionele tekstanalyse gedownload'), 'success');
  };

  const downloadAsPDF = async () => {
    if (!state.analysis) return;
    
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Professionele koptekst met logo en bedrijfsstijl
      doc.setFillColor(0, 92, 153); // McKinsey blauw
      doc.rect(0, 0, 210, 30, 'F');
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text('STRATEGISCHE ANALYSE', 105, 18, { align: 'center' });
      
      // Subtitel
      doc.setFontSize(12);
      doc.setTextColor(200, 200, 200);
      doc.text('McKinsey Framework Rapport', 105, 25, { align: 'center' });
      
      // Hoofdinhoud
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Analyse Samenvatting', 20, 45);
      
      // Metadata sectie
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      if (state.selectedFramework && state.selectedTopic) {
        doc.text(`Framework: ${state.selectedFramework}`, 20, 55);
        doc.text(`Onderwerp: ${state.selectedTopic.title}`, 20, 60);
        doc.text(`Datum: ${new Date().toLocaleDateString('nl-NL')}`, 20, 65);
        if (state.selectedRole) {
          doc.text(`Rol: ${state.selectedRole}`, 20, 70);
        }
      }
      
      // Scheidingslijn
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 75, 190, 75);
      
      // Analyse inhoud met betere opmaak
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize(state.analysis, 170);
      
      let yPosition = 85;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      
      for (let i = 0; i < lines.length; i++) {
        // Controleer of we een nieuwe pagina nodig hebben
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          
          // Pagina header voor volgende pagina's
        doc.setFillColor(240, 240, 240);
        doc.rect(0, 0, 210, 15, 'F');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`McKinsey Analyse - Pagina ${doc.getCurrentPageInfo().pageNumber}`, 105, 10, { align: 'center' });
        }
        
        doc.text(lines[i], margin, yPosition);
        yPosition += 6;
      }
      
      // Voettekst
      const totalPages = doc.internal.pages.length;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Gegenereerd door RecapHorizon - Pagina ${i} van ${totalPages}`, 105, 287, { align: 'center' });
        doc.text(new Date().toLocaleString('nl-NL'), 190, 287, { align: 'right' });
      }
      
      doc.save(`mckinsey-strategische-analyse-${new Date().getTime()}.pdf`);
      displayToast(t('analysisDownloadedPDF', 'Professionele PDF analyse gedownload'), 'success');
    } catch (error) {
      displayToast(t('pdfGenerationError', 'PDF genereren mislukt'), 'error');
    }
  };

  const formatAnalysisResult = (analysis: string): JSX.Element | JSX.Element[] | null => {
    if (!analysis) return null;

    // Split the analysis into sections
    const lines = analysis.split('\n');
    const elements: JSX.Element[] = [];
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      // Check for section headers
      if (line.startsWith('## ') || line.startsWith('### ')) {
        // Process previous section
        if (currentSection && currentContent.length > 0) {
          elements.push(renderSection(currentSection, currentContent.join('\n')));
        }
        
        // Start new section
        currentSection = line.replace(/^#+\s*/, '');
        currentContent = [];
      } else if (line.startsWith('* ')) {
        // Bullet points
        currentContent.push(line);
      } else if (line.trim() === '**Missing Information:**') {
        // Missing information section
        currentContent.push(line);
      } else if (line.trim()) {
        // Regular content
        currentContent.push(line);
      }
    }

    // Process the last section
    if (currentSection && currentContent.length > 0) {
      elements.push(renderSection(currentSection, currentContent.join('\n')));
    }

    return elements.length > 0 ? elements : <div className="whitespace-pre-wrap">{analysis}</div>;
  };

  const renderSection = (title: string, content: string) => {
    const isSubSection = title.includes(':');
    
    return (
      <div key={title} className="border-l-4 border-cyan-500 pl-4 py-2">
        {isSubSection ? (
          <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {title}
          </h5>
        ) : (
          <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-3">
            {title}
          </h4>
        )}
        <div className="text-slate-700 dark:text-slate-300">
          {formatSectionContent(content)}
        </div>
      </div>
    );
  };

  const formatSectionContent = (content: string): JSX.Element[] => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let inBulletList = false;
    let bulletItems: string[] = [];

    for (const line of lines) {
      if (line.startsWith('* ')) {
        if (!inBulletList) {
          inBulletList = true;
        }
        bulletItems.push(line.substring(2));
      } else if (line.trim() === '**Missing Information:**') {
        // Finish current bullet list if any
        if (inBulletList) {
          elements.push(
            <ul key={`bullet-${elements.length}`} className="list-disc list-inside space-y-1 mb-3">
              {bulletItems.map((item, index) => (
                <li key={index} className="text-slate-600 dark:text-slate-400">
                  {item}
                </li>
              ))}
            </ul>
          );
          bulletItems = [];
          inBulletList = false;
        }
        
        // Add missing information warning
        elements.push(
          <div key="missing-info" className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              Ontbrekende informatie
            </p>
          </div>
        );
      } else if (line.trim()) {
        // Finish current bullet list if any
        if (inBulletList) {
          elements.push(
            <ul key={`bullet-${elements.length}`} className="list-disc list-inside space-y-1 mb-3">
              {bulletItems.map((item, index) => (
                <li key={index} className="text-slate-600 dark:text-slate-400">
                  {item}
                </li>
              ))}
            </ul>
          );
          bulletItems = [];
          inBulletList = false;
        }
        
        // Add regular paragraph
        elements.push(
          <p key={`para-${elements.length}`} className="mb-3 text-slate-600 dark:text-slate-400">
            {line}
          </p>
        );
      }
    }

    // Finish any remaining bullet list
    if (inBulletList && bulletItems.length > 0) {
      elements.push(
        <ul key={`bullet-${elements.length}`} className="list-disc list-inside space-y-1 mb-3">
          {bulletItems.map((item, index) => (
            <li key={index} className="text-slate-600 dark:text-slate-400">
              {item}
            </li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  const emailAnalysis = () => {
    if (!state.analysis) return;
    
    // Professionele email opmaak
    let emailBody = `Beste collega,\n\n`;
    emailBody += `Hierbij ontvangt u de strategische analyse gegenereerd met McKinsey frameworks.\n\n`;
    
    if (state.selectedFramework && state.selectedTopic) {
      emailBody += `Framework: ${state.selectedFramework}\n`;
      emailBody += `Onderwerp: ${state.selectedTopic.title}\n`;
      if (state.selectedRole) {
        emailBody += `Rol: ${state.selectedRole}\n`;
      }
      emailBody += `Datum: ${new Date().toLocaleDateString('nl-NL')}\n\n`;
    }
    
    emailBody += `ANALYSE RESULTAAT:\n`;
    emailBody += `=================\n\n`;
    emailBody += state.analysis;
    emailBody += `\n\n=================\n`;
    emailBody += `Deze analyse is gegenereerd door RecapHorizon\n`;
    emailBody += `${new Date().toLocaleString('nl-NL')}\n`;
    
    const subject = encodeURIComponent('Strategische McKinsey Analyse');
    const body = encodeURIComponent(emailBody);
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

  const getRoleColor = (category: string) => {
    switch (category) {
      case 'strategy': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      case 'analysis': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
      case 'management': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200';
      case 'leadership': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getBusinessImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200';
    }
  };

  const renderTopicSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {t('selectMckinseyTopic', 'Selecteer een strategisch onderwerp')}
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          {t('selectMckinseyTopicDesc', 'Kies het onderwerp dat je wilt analyseren met McKinsey-frameworks')}
        </p>
      </div>

      {/* Topic Dependency Warning */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
              {t('mckinseyTopicDependencyTitle', 'Belangrijk: Onderwerp-afhankelijke analyse')}
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {t('mckinseyTopicDependencyDesc', 'McKinsey rapporten zijn sterk afhankelijk van het gekozen onderwerp. De kwaliteit en relevantie van de analyse hangt af van hoe specifiek en duidelijk het geselecteerde onderwerp is gedefinieerd.')}
            </p>
          </div>
        </div>
      </div>

      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{state.error}</p>
          <button
            onClick={() => generateTopics()}
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
            onClick={() => generateTopics()}
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
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                {topic.title}
              </h4>
              <span className={`px-2 py-1 text-xs rounded-full ${getBusinessImpactColor(topic.businessImpact)}`}>
                {t(`businessImpact.${topic.businessImpact}`, topic.businessImpact)}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              {topic.description}
            </p>
            {topic.context && (
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {topic.context.length > 100 ? `${topic.context.substring(0, 100)}...` : topic.context}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderRoleSelection = () => (
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
          {t('selectMckinseyRole', 'Kies je consultant rol')}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {t('selectMckinseyRoleDesc', 'Selecteer de expertise die het beste past bij je analyse')}
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
        {getMckinseyRoles(t).map((role) => {
          const IconComponent = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`text-left p-4 border rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 ${getRoleColor(role.category)}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <IconComponent size={20} />
                <h4 className="font-semibold">
                  {role.name}
                </h4>
              </div>
              <p className="text-sm opacity-90">
                {role.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderFrameworkSelection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setState(prev => ({ ...prev, step: 'selectRole' }))}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <FiArrowLeft size={16} />
          {t('backToRoles', 'Terug naar rollen')}
        </button>
      </div>

      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {t('selectMckinseyFramework', 'Kies je McKinsey framework')}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {t('selectMckinseyFrameworkDesc', 'Selecteer het analyseframework dat het beste past bij je vraag')}
        </p>
        {state.selectedTopic && state.selectedRole && (
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-3 mb-6">
            <p className="text-sm text-cyan-800 dark:text-cyan-200">
              <span className="font-medium">{t('selectedTopic', 'Onderwerp')}:</span> {state.selectedTopic.title}<br/>
              <span className="font-medium">{t('selectedRole', 'Rol')}:</span> {t(`role.${state.selectedRole}`, state.selectedRole)}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => handleFrameworkSelect(McKinseyFramework.ThreeC)}
          className="text-left p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {t('mckinseyFramework3C', '3C Framework')}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('mckinseyFramework3CDesc', 'Company, Customers, Competitors')}
          </p>
        </button>

        <button
          onClick={() => handleFrameworkSelect(McKinseyFramework.SevenS)}
          className="text-left p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {t('mckinseyFramework7S', '7S Framework')}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('mckinseyFramework7SDesc', 'Strategy, Structure, Systems, Skills, Staff, Style, Shared Values')}
          </p>
        </button>

        <button
          onClick={() => handleFrameworkSelect(McKinseyFramework.CustomerLifecycle)}
          className="text-left p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {t('mckinseyFrameworkCustomerLifecycle', 'Customer Lifecycle')}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('mckinseyFrameworkCustomerLifecycleDesc', 'Klantlevenscyclus analyse')}
          </p>
        </button>

        <button
          onClick={() => handleFrameworkSelect(McKinseyFramework.ValueChain)}
          className="text-left p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {t('mckinseyFrameworkValueChain', 'Value Chain')}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('mckinseyFrameworkValueChainDesc', 'Waardeketen analyse')}
          </p>
        </button>

        <button
          onClick={() => handleFrameworkSelect(McKinseyFramework.ForceField)}
          className="text-left p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {t('mckinseyFrameworkForceField', 'Force Field')}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('mckinseyFrameworkForceFieldDesc', 'Krachtenveldanalyse')}
          </p>
        </button>

        <button
          onClick={() => handleFrameworkSelect(McKinseyFramework.CoreCompetencies)}
          className="text-left p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {t('mckinseyFrameworkCoreCompetencies', 'Core Competencies')}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('mckinseyFrameworkCoreCompetenciesDesc', 'Kerncompetenties analyse')}
          </p>
        </button>

        <button
          onClick={() => handleFrameworkSelect(McKinseyFramework.ScenarioPlanning)}
          className="text-left p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {t('mckinseyFrameworkScenarioPlanning', 'Scenario Planning')}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('mckinseyFrameworkScenarioPlanningDesc', 'Scenario planning analyse')}
          </p>
        </button>

        <button
          onClick={() => handleFrameworkSelect(McKinseyFramework.PESTEL)}
          className="text-left p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {t('mckinseyFrameworkPESTEL', 'PESTEL')}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('mckinseyFrameworkPESTELDesc', 'Political, Economic, Social, Technological, Environmental, Legal')}
          </p>
        </button>

        <button
          onClick={() => handleFrameworkSelect(McKinseyFramework.PortersFiveForces)}
          className="text-left p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {t('mckinseyFrameworkPortersFiveForces', "Porter's Five Forces")}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('mckinseyFrameworkPortersFiveForcesDesc', 'Concurrentiekrachten analyse')}
          </p>
        </button>

        <button
          onClick={() => handleFrameworkSelect(McKinseyFramework.AnsoffMatrix)}
          className="text-left p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {t('mckinseyFrameworkAnsoffMatrix', 'Ansoff Matrix')}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('mckinseyFrameworkAnsoffMatrixDesc', 'Groei strategieën analyse')}
          </p>
        </button>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {t('generatingMckinseyTopics', 'McKinsey onderwerpen genereren...')}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('generatingTopicsInfo', 'We analyseren je inhoud om strategische onderwerpen te identificeren')}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
          📊 {transcript.length} karakters verwerkt • 🌐 {language.toUpperCase()}
        </p>
      </div>
    </div>
  );

  const renderAnalyzingStep = () => (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
      <div className="animate-pulse flex space-x-2">
        <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
        <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
        <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {t('analyzingWithMckinsey', 'Analyseren met {framework} framework...', {
            framework: state.selectedFramework || ''
          })}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('analyzingInfo', 'We voeren een diepgaande analyse uit volgens het gekozen framework')}
        </p>
        {state.selectedTopic && (
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            📋 Onderwerp: {state.selectedTopic.title}
          </p>
        )}
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setState(prev => ({ ...prev, step: 'selectFramework' }))}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <FiArrowLeft size={16} />
          {t('backToFrameworks', 'Terug naar frameworks')}
        </button>
        <div className="flex gap-2">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <FiMoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    copyToClipboard(state.analysis || '');
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <FiCopy size={16} />
                  {t('copyAnalysis', 'Kopieer analyse')}
                </button>
                <button
                  onClick={() => {
                    downloadAsText();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <FiDownload size={16} />
                  {t('downloadText', 'Download als tekst')}
                </button>
                <button
                  onClick={() => {
                    downloadAsPDF();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <FiDownload size={16} />
                  {t('downloadPDF', 'Download als PDF')}
                </button>
                <button
                  onClick={() => {
                    emailAnalysis();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <FiMail size={16} />
                  {t('emailAnalysis', 'Verstuur per email')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {state.selectedTopic && state.selectedFramework && (
        <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-cyan-800 dark:text-cyan-200 mb-2">
            {t('analysisDetails', 'Analyse Details')}
          </h4>
          <div className="text-sm text-cyan-700 dark:text-cyan-300 space-y-1">
            <p><span className="font-medium">{t('topic', 'Onderwerp')}:</span> {state.selectedTopic.title}</p>
            <p><span className="font-medium">{t('framework', 'Framework')}:</span> {state.selectedFramework}</p>
            <p><span className="font-medium">{t('role', 'Rol')}:</span> {t(`role.${state.selectedRole}`, state.selectedRole)}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">
          {t('mckinseyAnalysisResult', 'McKinsey Analyse Resultaat')}
        </h4>
        {(!state.analysis || state.analysis.trim().length === 0) ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-amber-800 dark:text-amber-200 mb-2">
              {t('noContent', 'Nog geen inhoud gegenereerd.')}
            </p>
            <button
              onClick={handleRegenerate}
              className="px-3 py-2 text-sm bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
            >
              {t('regenerateAnalysis', 'Analyse opnieuw genereren')}
            </button>
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            <div className="text-slate-700 dark:text-slate-300 space-y-4">
              {formatAnalysisResult(state.analysis)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Main render logic
  switch (state.step) {
    case 'generating':
      return renderGeneratingStep();
    case 'selectTopic':
      return renderTopicSelection();
    case 'selectRole':
      return renderRoleSelection();
    case 'selectFramework':
      return renderFrameworkSelection();
    case 'analyzing':
      return renderAnalyzingStep();
    case 'complete':
      return renderCompleteStep();
    default:
      return renderTopicSelection();
  }
};

export { McKinseyTab };
export type { McKinseyAnalysisData };
export default McKinseyTab;