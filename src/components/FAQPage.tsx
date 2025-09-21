import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface FAQPageProps {
  onClose?: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const FAQPage: React.FC<FAQPageProps> = ({ onClose, t }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  
  // SEO-optimized page title and description
  React.useEffect(() => {
    document.title = 'FAQ - Veelgestelde Vragen | RecapHorizon';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Vind antwoorden op veelgestelde vragen over RecapHorizon AI transcriptie, meeting analyse, en meer. Bekijk onze uitgebreide FAQ sectie.');
    }
  }, []);

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const faqData: FAQItem[] = [
    // Core Functionality
    {
      category: 'core',
      question: t('faqWhatIsRecapHorizon'),
      answer: t('faqWhatIsRecapHorizonAnswer')
    },
    {
      category: 'core',
      question: t('faqFileFormats'),
      answer: t('faqFileFormatsAnswer')
    },
    {
      category: 'core',
      question: t('faqDocxImport'),
      answer: t('faqDocxImportAnswer')
    },
    {
      category: 'core',
      question: t('faqRecordingLength'),
      answer: t('faqRecordingLengthAnswer')
    },
    {
      category: 'core',
      question: t('faqPauseResume'),
      answer: t('faqPauseResumeAnswer')
    },
    {
      category: 'core',
      question: t('faqEmailUpload'),
      answer: t('faqEmailUploadAnswer')
    },

    // AI Features
    {
      category: 'ai',
      question: t('faqAIAnalyses'),
      answer: t('faqAIAnalysesAnswer')
    },
    {
      category: 'ai',
      question: t('faqAIAccuracy'),
      answer: t('faqAIAccuracyAnswer')
    },
    {
      category: 'ai',
      question: t('faqAIQuestions'),
      answer: t('faqAIQuestionsAnswer')
    },
    {
      category: 'ai',
      question: t('faqWebExpert'),
      answer: t('faqWebExpertAnswer')
    },

    // Privacy & Security
    {
      category: 'privacy',
      question: t('faqStorage'),
      answer: t('faqStorageAnswer')
    },
    {
      category: 'privacy',
      question: t('faqAnonymization'),
      answer: t('faqAnonymizationAnswer')
    },
    {
      category: 'privacy',
      question: t('faqDataExport'),
      answer: t('faqDataExportAnswer')
    },
    {
      category: 'privacy',
      question: t('faqPhoneRecording'),
      answer: t('faqPhoneRecordingAnswer')
    },

    // Use Cases & Applications
    {
      category: 'usecases',
      question: t('faqMeetings'),
      answer: t('faqMeetingsAnswer')
    },
    {
      category: 'usecases',
      question: t('faqWebinars'),
      answer: t('faqWebinarsAnswer')
    },
    {
      category: 'usecases',
      question: t('faqCustomerConversations'),
      answer: t('faqCustomerConversationsAnswer')
    },
    {
      category: 'usecases',
      question: t('faqTrainingQuizzes'),
      answer: t('faqTrainingQuizzesAnswer')
    },
    {
      category: 'usecases',
      question: t('faqContentCreators'),
      answer: t('faqContentCreatorsAnswer')
    },

    // Export & Integration
    {
      category: 'export',
      question: t('faqExportOptions'),
      answer: t('faqExportOptionsAnswer')
    },
    {
      category: 'export',
      question: t('faqPowerPoint'),
      answer: t('faqPowerPointAnswer')
    },
    {
      category: 'export',
      question: t('faqMindmap'),
      answer: t('faqMindmapAnswer')
    },
    {
      category: 'export',
      question: t('faqTemplates'),
      answer: t('faqTemplatesAnswer')
    },

    // Technical & Setup
    {
      category: 'technical',
      question: t('faqBrowsers'),
      answer: t('faqBrowsersAnswer')
    },
    {
      category: 'technical',
      question: t('faqRecordingProblems'),
      answer: t('faqRecordingProblemsAnswer')
    },
    {
      category: 'technical',
      question: t('faqMobile'),
      answer: t('faqMobileAnswer')
    },

    // Pricing & Subscription
    {
      category: 'pricing',
      question: t('faqPricing'),
      answer: t('faqPricingAnswer')
    },
    {
      category: 'pricing',
      question: t('faqPaidVersion'),
      answer: t('faqPaidVersionAnswer')
    },
    {
      category: 'pricing',
      question: t('faqTrialPeriod'),
      answer: t('faqTrialPeriodAnswer')
    },
    {
      category: 'pricing',
      question: t('faqCancellation'),
      answer: t('faqCancellationAnswer')
    },

    // Nieuwe FAQ items
    {
      category: 'core',
      question: t('faq64Languages'),
      answer: t('faq64LanguagesAnswer')
    },
    {
      category: 'core',
      question: t('faqMultilingual'),
      answer: t('faqMultilingualAnswer')
    },
    {
      category: 'technical',
      question: t('faqTeamsTranscript'),
      answer: t('faqTeamsTranscriptAnswer')
    },
    {
      category: 'core',
      question: t('faqWebPageImport'),
      answer: t('faqWebPageImportAnswer')
    },
    
    // Image Upload FAQ
    {
      category: 'core',
      question: t('faqImageUpload'),
      answer: t('faqImageUploadAnswer')
    },
    {
      category: 'core',
      question: t('faqImageFormats'),
      answer: t('faqImageFormatsAnswer')
    },
    {
      category: 'ai',
      question: t('faqImageAnalysis'),
      answer: t('faqImageAnalysisAnswer')
    }
  ];

  const categories = [
    { id: 'all', name: t('faqCategoryAll'), icon: '🔍' },
    { id: 'core', name: t('faqCategoryCore'), icon: '⚡' },
    { id: 'ai', name: t('faqCategoryAI'), icon: '🤖' },
    { id: 'privacy', name: t('faqCategoryPrivacy'), icon: '🔒' },
    { id: 'usecases', name: t('faqCategoryUseCases'), icon: '💼' },
    { id: 'export', name: t('faqCategoryExport'), icon: '📤' },
    { id: 'technical', name: t('faqCategoryTechnical'), icon: '⚙️' },
    { id: 'pricing', name: t('faqCategoryPricing'), icon: '💰' }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-0 right-0 p-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <h1 className="text-5xl font-medium text-slate-900 dark:text-slate-100 mb-6 tracking-tight">
            {t('faqTitle')}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            {t('faqSubtitle')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder={t('faqSearchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-cyan-500 focus:outline-none transition-all duration-200"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              🔍
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                activeCategory === category.id
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 rounded-2xl"
              >
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 pr-4">
                  {faq.question}
                </h3>
                <div className={`text-2xl text-cyan-500 transition-transform duration-200 ${
                  expandedItems.has(index) ? 'rotate-45' : ''
                }`}>
                  +
                </div>
              </button>
              
              {expandedItems.has(index) && (
                <div className="px-8 pb-6">
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('faqNoResultsTitle')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {t('faqNoResultsSubtitle')}
            </p>
          </div>
        )}

        {/* CTA Section removed per request */}

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-medium text-cyan-500 mb-2">50+</div>
            <div className="text-slate-600 dark:text-slate-400">{t('faqStatsFeatures')}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-medium text-cyan-500 mb-2">100%</div>
            <div className="text-slate-600 dark:text-slate-400">{t('faqStatsPrivacy')}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-medium text-cyan-500 mb-2">24/7</div>
            <div className="text-slate-600 dark:text-slate-400">{t('faqStatsAvailable')}</div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-12 flex justify-center">
          <button 
            onClick={onClose} 
            className="px-6 py-3 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors"
          >
            {t('close', 'Close')}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
