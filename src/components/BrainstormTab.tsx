import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildRecapHorizonFilename } from '../utils/downloadUtils';
import { SubscriptionTier, TranslationFunction } from '../../types';
import { generateBrainstormIdeas, generateBrainstormReport, BrainstormMethod } from '../services/brainstormService';
import { markdownToPlainText } from '../utils/textUtils';
import Modal from './Modal';
import { copyToClipboard, displayToast } from '../utils/clipboard';
import jsPDF from 'jspdf';
import BlurredLoadingOverlay from './BlurredLoadingOverlay';

interface BrainstormTabProps {
  t: TranslationFunction;
  transcript: string;
  summary: string;
  isGenerating?: boolean;
  language: string;
  userId: string;
  userTier: SubscriptionTier;
  sessionId?: string;
  onMoveToTranscript?: (reportContent: string) => Promise<void> | void;
}

// Method type imported from service

const BrainstormTab: React.FC<BrainstormTabProps> = ({
  t,
  transcript,
  summary,
  isGenerating,
  language,
  userId,
  userTier,
  sessionId,
  onMoveToTranscript,
}) => {
  const content = useMemo(() => (summary || transcript || '').trim(), [summary, transcript]);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<string>('');
  const [method, setMethod] = useState<BrainstormMethod>('differentPerspectives');
  const [report, setReport] = useState<string>('');
  const [params, setParams] = useState<{ [key: string]: string | number }>({
    number_of_dissatisfaction_ideas: 10,
    number_of_ideas: 10,
    number_of_iterations: 3,
    initial_step_focus: '',
    selected_framework: 'SCAMPER',
  });
  const [isLoadingIdeas, setIsLoadingIdeas] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const hasLoadedIdeasRef = React.useRef<boolean>(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('generic');
  const methodRef = useRef<HTMLDivElement | null>(null);
  const hasAccess = userTier === SubscriptionTier.GOLD || userTier === SubscriptionTier.ENTERPRISE || userTier === SubscriptionTier.DIAMOND;

  const brainstormRoles = useMemo(() => {
    const base = [
      { id: 'generic', name: t('brainstorm.genericRole'), description: t('brainstorm.genericRole') },
    ];
    const extra = [
      { id: 'ceo', name: t('aiDiscussion.role.ceo'), description: t('aiDiscussion.role.ceoDesc') },
      { id: 'cfo', name: t('aiDiscussion.role.cfo'), description: t('aiDiscussion.role.cfoDesc') },
      { id: 'hr_hoofd', name: t('aiDiscussion.role.hr_hoofd'), description: t('aiDiscussion.role.hr_hoofdDesc') },
      { id: 'juridisch_directeur', name: t('aiDiscussion.role.juridisch_directeur'), description: t('aiDiscussion.role.juridisch_directeurDesc') },
      { id: 'cpo', name: t('aiDiscussion.role.cpo'), description: t('aiDiscussion.role.cpoDesc') },
      { id: 'marketing_specialist', name: t('aiDiscussion.role.marketing_specialist'), description: t('aiDiscussion.role.marketing_specialistDesc') },
      { id: 'verkoopdirecteur', name: t('aiDiscussion.role.verkoopdirecteur'), description: t('aiDiscussion.role.verkoopdirecteurDesc') },
      { id: 'customer_success', name: t('aiDiscussion.role.customer_success'), description: t('aiDiscussion.role.customer_successDesc') },
      { id: 'product_owner', name: t('aiDiscussion.role.product_owner'), description: t('aiDiscussion.role.product_ownerDesc') },
      { id: 'lead_architect', name: t('aiDiscussion.role.lead_architect'), description: t('aiDiscussion.role.lead_architectDesc') },
      { id: 'data_analist', name: t('aiDiscussion.role.data_analist'), description: t('aiDiscussion.role.data_analistDesc') },
      { id: 'security_expert', name: t('aiDiscussion.role.security_expert'), description: t('aiDiscussion.role.security_expertDesc') },
      { id: 'devops_engineer', name: t('aiDiscussion.role.devops_engineer'), description: t('aiDiscussion.role.devops_engineerDesc') },
      { id: 'operationeel_manager', name: t('aiDiscussion.role.operationeel_manager'), description: t('aiDiscussion.role.operationeel_managerDesc') },
      { id: 'project_manager', name: t('aiDiscussion.role.project_manager'), description: t('aiDiscussion.role.project_managerDesc') },
      { id: 'kwaliteitsmanager', name: t('aiDiscussion.role.kwaliteitsmanager'), description: t('aiDiscussion.role.kwaliteitsmanagerDesc') },
      { id: 'innovatie_manager', name: t('aiDiscussion.role.innovatie_manager'), description: t('aiDiscussion.role.innovatie_managerDesc') },
      { id: 'duurzaamheidsadviseur', name: t('aiDiscussion.role.duurzaamheidsadviseur'), description: t('aiDiscussion.role.duurzaamheidsadviseurDesc') },
      { id: 'externe_consultant', name: t('aiDiscussion.role.externe_consultant'), description: t('aiDiscussion.role.externe_consultantDesc') },
      { id: 'eindgebruiker', name: t('aiDiscussion.role.eindgebruiker'), description: t('aiDiscussion.role.eindgebruikerDesc') },
      { id: 'interne_auditor', name: t('aiDiscussion.role.interne_auditor'), description: t('aiDiscussion.role.interne_auditorDesc') },
      { id: 'invester', name: t('aiDiscussion.role.invester'), description: t('aiDiscussion.role.investerDesc') },
      { id: 'generaal', name: t('aiDiscussion.role.generaal'), description: t('aiDiscussion.role.generaalDesc') },
      { id: 'dromer', name: t('aiDiscussion.role.dromer'), description: t('aiDiscussion.role.dromerDesc') },
      { id: 'skeptische_advocaat', name: t('aiDiscussion.role.skeptische_advocaat'), description: t('aiDiscussion.role.skeptische_advocaatDesc') },
      { id: 'gamification_architect', name: t('aiDiscussion.role.gamification_architect'), description: t('aiDiscussion.role.gamification_architectDesc') },
      { id: 'ethicus_impact_analist', name: t('aiDiscussion.role.ethicus_impact_analist'), description: t('aiDiscussion.role.ethicus_impact_analistDesc') },
      { id: 'storyteller', name: t('aiDiscussion.role.storyteller'), description: t('aiDiscussion.role.storytellerDesc') },
    ];
    return [...base, ...extra];
  }, [t]);

  useEffect(() => { hasLoadedIdeasRef.current = false; }, [content]);

  useEffect(() => {
    const loadIdeas = async () => {
      if (!content) {
        setIdeas([t('brainstorm.transcriptOption')]);
        return;
      }
      if (hasLoadedIdeasRef.current) return;
      setIsLoadingIdeas(true);
      let cancelled = false;
      try {
        if (!hasAccess) {
          const sentences = content.split(/\n+|[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
          const uniq = Array.from(new Set(sentences)).slice(0, 8);
          const fallback = [t('brainstorm.transcriptOption'), ...uniq];
          setIdeas(fallback);
          hasLoadedIdeasRef.current = true;
          return;
        }
        const list = await generateBrainstormIdeas(content, language || 'nl', userId || 'anonymous', userTier);
        // Map to UI language ordering while preserving first item
        let initial = list.length > 0 ? list : [t('brainstorm.transcriptOption')];
        // If only transcript option returned, augment with heuristics
        if (initial.length <= 1) {
          const sentences = content.split(/\n+|[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
          const uniq = Array.from(new Set(sentences)).slice(0, 8);
          initial = [t('brainstorm.transcriptOption'), ...uniq];
        }
        // Ensure localized first item explicitly
        initial[0] = t('brainstorm.transcriptOption');
        if (!cancelled) {
          setIdeas(initial);
        }
        hasLoadedIdeasRef.current = true;
      } catch (_err) {
        // Heuristische fallback: haal 6-8 korte zinnen uit content
        const sentences = content.split(/\n+|[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
        const uniq = Array.from(new Set(sentences)).slice(0, 8);
        const fallback = [t('brainstorm.transcriptOption'), ...uniq];
          setIdeas(fallback);
      } finally {
        if (!cancelled) setIsLoadingIdeas(false);
      }
      return () => { cancelled = true; };
    };
    loadIdeas();
  }, [content, language, userId, userTier, t]);

  useEffect(() => {
    if (selectedIdea && methodRef.current) {
      methodRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedIdea]);

  const getRatingValue = (ratingText: string): number => {
    const stars = (ratingText.match(/★/g) || []).length;
    if (stars > 0) {
      if (/½|0\.5|half/i.test(ratingText)) return Math.min(5, stars + 0.5);
      return Math.min(5, stars);
    }
    const numMatch = ratingText.match(/(\d+(?:\.5)?)/);
    return numMatch ? Math.min(5, parseFloat(numMatch[1])) : 0;
  };

  const Star: React.FC<{ type: 'full' | 'half' | 'empty' }> = ({ type }) => {
    const fill = type === 'empty' ? 'none' : 'currentColor';
    const stroke = type === 'empty' ? 'currentColor' : 'none';
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" className="text-cyan-700 dark:text-cyan-300">
        {type === 'half' ? (
          <>
            <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.896 4.664 23.166l1.402-8.168L.132 9.211l8.2-1.193z" fill="none" stroke="currentColor"/>
            <clipPath id="halfClip"><rect x="0" y="0" width="12" height="24"/></clipPath>
            <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.896 4.664 23.166l1.402-8.168L.132 9.211l8.2-1.193z" fill="currentColor" clipPath="url(#halfClip)"/>
          </>
        ) : (
          <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.168L12 18.896 4.664 23.166l1.402-8.168L.132 9.211l8.2-1.193z" fill={fill} stroke={stroke}/>
        )}
      </svg>
    );
  };

  const generateReport = useCallback(async () => {
    if (!selectedIdea) return;
    if (!hasAccess) { displayToast(t('premiumOnly')); return; }
    setIsGeneratingReport(true);
    try {
      const roleName = t('brainstorm.genericRole');
      const roleDesc = t('brainstorm.genericRole');
      const text = await generateBrainstormReport(
        selectedIdea,
        method,
        content,
        language || 'nl',
        roleName,
        roleDesc,
        {
          selected_framework: String(params.selected_framework || ''),
          number_of_dissatisfaction_ideas: Number(params.number_of_dissatisfaction_ideas || 10),
          initial_step_focus: String(params.initial_step_focus || ''),
          number_of_ideas: Number(params.number_of_ideas || 10),
          number_of_iterations: Number(params.number_of_iterations || 3)
        },
        userId || 'anonymous',
        userTier
      );
      const methodName = t(`brainstorm.method.${method}`);
      const methodDesc = t(`brainstorm.method.${method}Desc`);
      const frameworkSuffix = method === 'frameworks' && params.selected_framework ? `\nFramework: ${String(params.selected_framework)}` : '';
      const footer = `\r\n\r\n${t('brainstorm.method.frameworks', 'Method')}: ${methodName} — ${methodDesc}${frameworkSuffix}`;
      const clean = markdownToPlainText(text);
      setReport(`${clean}${footer}`);
    } catch (_err) {
      setReport(t('aiDiscussion.reportError', 'Er is een fout opgetreden bij het genereren van het rapport'));
    } finally {
      setIsGeneratingReport(false);
    }
  }, [selectedIdea, method, content, language, params, userId, userTier, t, hasAccess]);

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('brainstorm.title')}</h3>
      </div>

      {/* Step 1: Initial ideas */}
      <div className="mb-6">
        {!isLoadingIdeas && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
            {t('brainstorm.selectIdea')}
          </p>
        )}
        {ideas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ideas.map((raw, idx) => {
              const cleaned = String(raw || '').replace(/\*\*/g, '').trim();
              const ratingMatch = cleaned.match(/(★+|☆+|\d+(?:\.5)?\s*stars?|\(.*?★.*?\))$/i);
              const ratingText = ratingMatch ? ratingMatch[0].replace(/[()]/g, '') : '';
              const base = ratingText ? cleaned.replace(ratingMatch[0], '').trim() : cleaned;
              let title = base;
              let desc = '';
              const splitters = [/\s+-\s+/, /:\s+/, /\s+—\s+/];
              for (const s of splitters) {
                const parts = base.split(s);
                if (parts.length >= 2) { title = parts[0].trim(); desc = parts.slice(1).join(' - ').trim(); break; }
              }
              const ratingValue = ratingText ? getRatingValue(ratingText) : 0;
              const fullCount = Math.floor(ratingValue);
              const hasHalf = ratingValue - fullCount >= 0.5;
              const emptyCount = 5 - fullCount - (hasHalf ? 1 : 0);
              return (
                <button
                  key={`idea-${idx}`}
                  onClick={() => setSelectedIdea(cleaned)}
                  className={`p-3 rounded border ${selectedIdea === cleaned ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20' : 'border-slate-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'} transition-colors text-left`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-slate-800 dark:text-slate-200 break-words">{title}</span>
                  </div>
                  {ratingValue > 0 && (
                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: fullCount }).map((_, i) => <Star key={`f-${i}`} type="full" />)}
                      {hasHalf && <Star type="half" />}
                      {Array.from({ length: emptyCount }).map((_, i) => <Star key={`e-${i}`} type="empty" />)}
                    </div>
                  )}
                  {desc && (
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-400 break-words">{desc}</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 2: Method selection (cards, only after idea selection) */}
      {selectedIdea && (
      <div className="mb-6" ref={methodRef}>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {t('brainstorm.selectMethodShort')}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {([
            { id: 'differentPerspectives', title: t('brainstorm.method.differentPerspectives'), desc: t('brainstorm.method.differentPerspectivesDesc') },
            { id: 'oppositeDay', title: t('brainstorm.method.oppositeDay'), desc: t('brainstorm.method.oppositeDayDesc') },
            { id: 'stepByStep', title: t('brainstorm.method.stepByStep'), desc: t('brainstorm.method.stepByStepDesc') },
            { id: 'creativeWords', title: t('brainstorm.method.creativeWords'), desc: t('brainstorm.method.creativeWordsDesc') },
            { id: 'chainOfDensity', title: t('brainstorm.method.chainOfDensity'), desc: t('brainstorm.method.chainOfDensityDesc') },
            { id: 'firstPrinciples', title: t('brainstorm.method.firstPrinciples'), desc: t('brainstorm.method.firstPrinciplesDesc') },
          ] as { id: BrainstormMethod; title: string; desc: string }[]).map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`text-left p-4 rounded-lg border transition-colors ${method === m.id ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20' : 'border-slate-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{m.title}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Method-specific inputs (wiring) */}
        {method === 'oppositeDay' && (
          <div className="mt-3">
            <label className="text-sm block mb-1">{t('brainstorm.method.oppositeDayCountLabel')}</label>
            <input
              type="number"
              min={1}
              max={25}
              value={Number(params.number_of_dissatisfaction_ideas) || 10}
              onChange={(e) => setParams(prev => ({ ...prev, number_of_dissatisfaction_ideas: parseInt(e.target.value) }))}
              className="w-32 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
            />
          </div>
        )}
        {method === 'creativeWords' && (
          <div className="mt-3">
            <label className="text-sm block mb-1">{t('brainstorm.method.creativeWordsCountLabel')}</label>
            <input
              type="number"
              min={1}
              max={25}
              value={Number(params.number_of_ideas) || 10}
              onChange={(e) => setParams(prev => ({ ...prev, number_of_ideas: parseInt(e.target.value) }))}
              className="w-32 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
            />
          </div>
        )}
        {method === 'chainOfDensity' && (
          <div className="mt-3">
            <label className="text-sm block mb-1">{t('brainstorm.method.chainOfDensityIterationsLabel')}</label>
            <input
              type="number"
              min={1}
              max={10}
              value={Number(params.number_of_iterations) || 3}
              onChange={(e) => setParams(prev => ({ ...prev, number_of_iterations: parseInt(e.target.value) }))}
              className="w-32 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
            />
          </div>
        )}
        {method === 'stepByStep' && (
          <div className="mt-3">
            <label className="text-sm block mb-1">{t('brainstorm.method.stepByStepInitialFocusLabel')}</label>
            <input
              type="text"
              value={String(params.initial_step_focus) || ''}
              onChange={(e) => setParams(prev => ({ ...prev, initial_step_focus: e.target.value }))}
              placeholder="key aspects of the market"
              className="w-full max-w-lg px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
            />
          </div>
        )}
        {/* No framework dropdown */}
      </div>
      )}

      {/* Step 3: Expert role selection (after idea selection) */}
      {selectedIdea && (
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {t('brainstorm.selectExpertRole')}
        </label>
        <select
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
        >
          {brainstormRoles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      )}

      {/* Step 4: Generate report */}
      <div className="flex items-center gap-2 mb-4">
        {selectedIdea && !report && (
        <button
          onClick={generateReport}
          className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          {t('brainstorm.reportTitle')}
        </button>
        )}
        {isGeneratingReport && (
          <span className="text-sm text-slate-600 dark:text-slate-300">{t('brainstorm.generatingReport')}</span>
        )}
      </div>

      {/* Actions above report */}
      {report && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => { copyToClipboard(report); displayToast(t('aiDiscussion.discussionReport', 'Report copied'), 'success'); }}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            {t('aiDiscussion.copyReport', 'Rapport kopiëren')}
          </button>
          <button
            onClick={() => {
              const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = buildRecapHorizonFilename('txt');
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            {t('brainstorm.downloadTxt', 'Download TXT')}
          </button>
          <button
            onClick={() => {
              const doc = new jsPDF();
              const lines = doc.splitTextToSize(report, 180);
              doc.text(lines, 10, 10);
              doc.save(buildRecapHorizonFilename('pdf'));
            }}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            {t('aiDiscussion.downloadPDF', 'PDF downloaden')}
          </button>
          <button
            onClick={() => generateReport()}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            {t('brainstorm.regenerate')}
          </button>
          <button
            onClick={() => setSelectedIdea('')}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            {t('aiDiscussion.backToTopics', 'Terug naar onderwerpen')}
          </button>
          {onMoveToTranscript && (
            <button
              onClick={() => onMoveToTranscript(report)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              {t('brainstorm.moveToTranscript')}
            </button>
          )}
        </div>
      )}

      {report && (
        <div className="p-3 border border-slate-300 dark:border-slate-600 rounded bg-gray-50 dark:bg-slate-700/30 whitespace-pre-wrap text-sm">
          {report}
        </div>
      )}

      {/* Generating modal */}
      <Modal
        isOpen={isGeneratingReport}
        onClose={() => {}}
        title={t('brainstorm.reportTitle')}
      >
        <div className="text-sm text-slate-700 dark:text-slate-300">{t('brainstorm.generatingReport')}</div>
      </Modal>

      {/* Ideas loading overlay with animation */}
      <BlurredLoadingOverlay
        isVisible={isLoadingIdeas}
        loadingText={t('brainstorm.initialIdeasLoadingMessage')}
      />
    </div>
  );
};

export default BrainstormTab;