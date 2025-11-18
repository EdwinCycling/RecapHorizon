import React, { useCallback, useMemo, useState } from 'react';
import { PbiTone, PbiApproach, PbiGenerationOptions, SubscriptionTier, TranslationFunction } from '../../types';
import { generatePBIReport } from '../services/pbiService';
import PbiToneSelector from './PbiToneSelector';
import PbiApproachSelector from './PbiApproachSelector';
import BlurredLoadingOverlay from './BlurredLoadingOverlay';

interface AgilePBITabProps {
  t: TranslationFunction;
  transcript: string;
  summary?: string;
  isGenerating?: boolean;
  language: string;
  userId: string;
  userTier: SubscriptionTier;
  sessionId?: string;
  onMoveToTranscript?: (content: string) => void;
}

const AgilePBITab: React.FC<AgilePBITabProps> = ({ t, transcript, summary, isGenerating = false, language, userId, userTier, sessionId, onMoveToTranscript }) => {
  const [tone, setTone] = useState<PbiTone>('praktisch_direct');
  const [approach, setApproach] = useState<PbiApproach>('frameworks');
  const [options, setOptions] = useState<PbiGenerationOptions>({ includeAcceptanceCriteria: true, includeValueNote: true, includeTechnicalNote: true, maxItems: 10 });
  const [reportText, setReportText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();

  const content = useMemo(() => (summary || transcript || '').trim(), [summary, transcript]);

  const handleGenerate = useCallback(async () => {
    if (!content) { setError(t('agilePbi.noContent', 'Er is onvoldoende inhoud')); return; }
    setLoading(true);
    setError(undefined);
    try {
      const report = await generatePBIReport(content, tone, approach, options, userId, userTier);
      setReportText(report);
      if (onMoveToTranscript) onMoveToTranscript(report);
    } catch (e: any) {
      setError(e?.message || t('agilePbi.generateError', 'Kon geen PBI\'s genereren'));
    } finally {
      setLoading(false);
    }
  }, [content, tone, approach, options, userId, userTier, t]);

  

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg transition-colors relative">
      {loading && <BlurredLoadingOverlay text={t('generating', 'Genereren...', { type: t('agilePbi.title', "Agile PBI's") })} />}
      <div className="space-y-6">
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{t('agilePbi.tone.title')}</div>
          <PbiToneSelector t={t} value={tone} onChange={setTone} />
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{t('agilePbi.approach.title')}</div>
          <PbiApproachSelector t={t} value={approach} onChange={setApproach} />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" checked={!!options.includeAcceptanceCriteria} onChange={(e) => setOptions(prev => ({ ...prev, includeAcceptanceCriteria: e.target.checked }))} />
          {t('agilePbi.options.includeAcceptanceCriteria')}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" checked={!!options.includeValueNote} onChange={(e) => setOptions(prev => ({ ...prev, includeValueNote: e.target.checked }))} />
          {t('agilePbi.options.includeValueNote')}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" checked={!!options.includeTechnicalNote} onChange={(e) => setOptions(prev => ({ ...prev, includeTechnicalNote: e.target.checked }))} />
          {t('agilePbi.options.includeTechnicalNote')}
        </label>
      </div>
      <div className="mt-6 flex gap-3">
        <button onClick={handleGenerate} className="px-3 py-2 text-sm font-medium rounded-md text-white bg-cyan-500 hover:bg-cyan-600">{t('agilePbi.generate')}</button>
      </div>
      {error && <div className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</div>}
      {!reportText && (
        <div className="mt-6 p-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {t('agilePbi.empty', 'Nog geen PBI\'s. Kies een toon en aanpak en klik op Genereer.')}
        </div>
      )}
      {reportText && (
        <div className="mt-6 p-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
          <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">{reportText}</div>
        </div>
      )}
    </div>
  );
};

export default AgilePBITab;