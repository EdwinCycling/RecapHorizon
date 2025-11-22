import React, { useEffect, useMemo, useState } from 'react';
import { AIProviderManager, AIFunction, SubscriptionTier } from '../utils/aiProviderManager';
import { copyToClipboard, displayToast } from '../utils/clipboard';
import { buildRecapHorizonFilename } from '../utils/downloadUtils';
import { tryUseUnicodeFont } from '../utils/pdfFont';
import { markdownToPlainText, markdownToSanitizedHtml } from '../utils/textUtils';
import jsPDF from 'jspdf';
import BlurredLoadingOverlay from './BlurredLoadingOverlay';
import Modal from './Modal';

type TranslationFunction = (key: string, fallback?: string) => string;

interface ContentCalendarTabProps {
  t: TranslationFunction;
  transcript: string;
  language: string;
  userId: string;
  userTier: SubscriptionTier;
  sessionId?: string;
  onMoveToTranscript?: (content: string) => Promise<void> | void;
}

const ContentCalendarTab: React.FC<ContentCalendarTabProps> = ({
  t,
  transcript,
  language,
  userId,
  userTier,
  sessionId,
  onMoveToTranscript,
}) => {
  const hasAccess = userTier === SubscriptionTier.GOLD || userTier === SubscriptionTier.DIAMOND || userTier === SubscriptionTier.ENTERPRISE;
  const content = useMemo(() => (transcript || '').trim(), [transcript]);
  const [isLoadingTopics, setIsLoadingTopics] = useState<boolean>(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [frequencyPerWeek, setFrequencyPerWeek] = useState<number>(5);
  const [mainGoal, setMainGoal] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(todayIso);
  const [contentPillars, setContentPillars] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<Record<string, number>>({ LinkedIn: 3, Instagram: 2 });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [calendarMarkdown, setCalendarMarkdown] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<Array<{ day: string; date: string; pillar: string; platform: string; idea: string; cta: string }>>([]);
  const [showMoveModal, setShowMoveModal] = useState<boolean>(false);
  const [showDebugModal, setShowDebugModal] = useState<boolean>(false);
  const [debugResponseText, setDebugResponseText] = useState<string>('');

  const audienceKeys = useMemo(() => {
    return [
      'summaryTargetAudienceOptions.management',
      'summaryTargetAudienceOptions.customers',
      'summaryTargetAudienceOptions.investors',
      'summaryTargetAudienceOptions.newEmployees',
      'summaryTargetAudienceOptions.generalPublic',
      'summaryTargetAudienceOptions.academics',
      'summaryTargetAudienceOptions.competitors',
    ];
  }, []);

  const pillarOptions = useMemo(() => {
    return [
      { id: 'educatief', label: t('contentPillars.educational', 'Educatief') },
      { id: 'storytelling', label: t('contentPillars.storytelling', 'Storytelling') },
      { id: 'achter_de_schermen', label: t('contentPillars.behindScenes', 'Achter de schermen') },
      { id: 'faqs', label: t('contentPillars.faqs', 'FAQ') },
      { id: 'bezwaar', label: t('contentPillars.objections', 'Bezwaren') },
      { id: 'sociaal_bewijs', label: t('contentPillars.socialProof', 'Sociaal bewijs') },
      { id: 'engagement', label: t('contentPillars.engagement', 'Engagement prompts') },
      { id: 'case_study', label: t('contentPillars.caseStudy', 'Case study') },
      { id: 'ugc', label: t('contentPillars.ugc', 'User-generated content') },
    ];
  }, [t]);

  const platformOptions = useMemo(() => {
    return ['LinkedIn', 'Facebook', 'Instagram', 'X / BlueSky', 'Mailing', 'Blogpost/Artikel'];
  }, []);

  useEffect(() => {
    if (!content || topics.length || isLoadingTopics) return;
    handleGenerateTopics();
  }, [content, topics]);

  useEffect(() => {
    if (!calendarMarkdown) {
      setParsedRows([]);
      return;
    }
    const lines = calendarMarkdown.split(/\r?\n/).map(l => l.trim());
    const tableLines = lines.filter(l => l.startsWith('|'));
    if (tableLines.length === 0) {
      setParsedRows([]);
      return;
    }
    const dataLines = tableLines.filter(l => !/^\|\s*-/.test(l));
    const rows = dataLines.slice(1).map(l => {
      const parts = l.split('|').map(p => p.trim());
      return {
        day: parts[1] || '',
        date: parts[2] || '',
        pillar: parts[3] || '',
        platform: parts[4] || '',
        idea: parts[5] || '',
        cta: parts[6] || ''
      };
    }).filter(r => r.day && r.date);
    setParsedRows(rows);
  }, [calendarMarkdown]);

  useEffect(() => {
    if (calendarMarkdown && parsedRows.length === 0) {
      setDebugResponseText(calendarMarkdown);
      setShowDebugModal(true);
    }
  }, [calendarMarkdown, parsedRows.length]);

  const sanitizeGoal = (s: string) => {
    const trimmed = (s || '').trim();
    return trimmed.length > 100 ? trimmed.slice(0, 100) : trimmed;
  };

  const handleGenerateTopics = async () => {
    if (!content) {
      displayToast(t('noContent', 'No data available'), 'error');
      return;
    }
    setIsLoadingTopics(true);
    try {
      const prompt = [
        'Genereer 1 tot maximaal 10 Nederlandse onderwerpen/titels voor een social media contentkalender op basis van het transcript hieronder.',
        'Geef UITSLUITEND een JSON array van strings. Geen uitleg of extra tekst.',
        'Transcript:',
        content,
      ].join('\n\n');
      const res = await AIProviderManager.generateContentWithProviderSelection({ userId, functionType: AIFunction.GENERAL_ANALYSIS, userTier }, prompt, false);
      const text = String(res.content || '').trim();
      let arr: any;
      try {
        arr = JSON.parse(text);
      } catch {
        const jsonMatch = text.match(/\[([\s\S]*?)\]/);
        if (jsonMatch) {
          arr = JSON.parse(jsonMatch[0]);
        }
      }
      if (!Array.isArray(arr) || !arr.every(x => typeof x === 'string')) {
        throw new Error('Invalid topics JSON');
      }
      const uniq = Array.from(new Set(arr.map(s => s.trim()).filter(s => s))).slice(0, 10);
      setTopics(uniq);
      if (uniq.length === 1) setSelectedTopic(uniq[0]);
    } catch (err: any) {
      displayToast(String(err?.message || 'Error'), 'error');
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const handleTogglePillar = (id: string) => {
    setContentPillars(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleTogglePlatform = (p: string) => {
    setSchedule(prev => {
      const next = { ...prev };
      if (p in next) {
        delete next[p];
      } else {
        next[p] = 1;
      }
      return next;
    });
  };

  const handleSetPlatformCount = (p: string, v: number) => {
    setSchedule(prev => ({ ...prev, [p]: Math.max(0, Math.min(10, Math.floor(v || 0))) }));
  };

  const buildPostingScheduleText = (): string => {
    const entries = Object.entries(schedule).filter(([_, c]) => c > 0);
    if (!entries.length) return 'LinkedIn: 3 per week; Instagram: 2 per week';
    return entries.map(([p, c]) => `${p}: ${c} per week`).join('; ');
  };

  const handleGenerateCalendar = async () => {
    if (!selectedTopic) {
      displayToast(t('selectTopic', 'Selecteer een onderwerp'), 'error');
      return;
    }
    const ta = targetAudience || t('summaryTargetAudienceOptions.generalPublic');
    const pillars = contentPillars.length ? contentPillars : pillarOptions.map(p => p.id);
    const freq = Math.max(1, Math.min(10, frequencyPerWeek));
    const goal = sanitizeGoal(mainGoal);
    const start = startDate || todayIso;
    const scheduleText = buildPostingScheduleText();
    const allowedPlatforms = Object.entries(schedule)
      .filter(([_, c]) => c > 0)
      .map(([p]) => p);
    const allowedPillars = pillars;
    setIsGenerating(true);
    try {
      const campaignWeeks = 4;
      const promptParts = [
        'Act als een professionele Social Media Strateeg. Gebruik de onderstaande inputs om een 30-dagen contentkalender te genereren, gericht op het behalen van het Hoofddoel.',
        'Voer eerst een beknopt intern onderzoek en strategiestap uit op basis van jouw bestaande kennis en, indien beschikbaar, live webgegevens voor dit Onderwerp/Niche en de Doelgroep. Gebruik deze inzichten alleen om de kalender te begeleiden; lever ze NIET afzonderlijk.',
        'De output MOET een Markdown-tabel zijn met de exacte kolommen (en niets anders): Dag #, Datum, Thema/Pijler, Platform, Content Idee, Call To Action (CTA).',
        'Kalenderrichtlijnen:',
        `- Creëer precies ${campaignWeeks * 7} rijen, één voor elke opeenvolgende kalenderdag (duurt ${campaignWeeks} weken), beginnend vanaf de Startdatum, met echte datums in oplopende volgorde.`,
        '- De Thema/Pijler in elke rij moet één van de opgegeven Content Pijlers zijn, met een redelijk uitgebalanceerde mix over de 30 dagen.',
        '- De Platform-kolom moet het Publicatie Schema volgen. Indien meerdere platforms voor een bepaalde dag zijn gespecificeerd, creëer dan één rij per platform.',
        'Contentrichtlijnen:',
        '- Elk Content Idee moet het posttype vermelden (bijv. Reel, carrousel, statische post, story, live, poll, LinkedIn tekstpost) en een duidelijke, scroll-stoppende hook bevatten die is afgestemd op de Doelgroep.',
        '- Elke CTA moet specifiek, actiegericht zijn en direct het Hoofddoel ondersteunen.',
        '- Varieer formats en invalshoeken over de 30 dagen om herhaling te voorkomen.',
        '- Elk idee moet duidelijk verbonden zijn met de belangrijkste pijnpunten en verlangens van de Doelgroep en afgestemd zijn op het Hoofddoel.',
        'Inputs:',
        `Topic/Niche: ${selectedTopic}`,
        `Target Audience: ${ta}`,
        `Main Goal: ${goal || '(n.v.t.)'}`,
        `Posting Schedule: ${scheduleText}`,
        `Content Pillars: ${pillars.join(', ')}`,
        `Allowed Platforms: ${allowedPlatforms.join(', ')}`,
        `Allowed Content Pillars: ${allowedPillars.join(', ')}`,
        `Start Date: ${start}`,
        'Uitvoerregels:',
        '- Lever ALLEEN de uiteindelijke Markdown-tabel op. Geen uitleg, notities of enige tekst buiten de tabel.',
        '- Gebruik EXCLUSIEF de Platforms uit Allowed Platforms. Voeg GEEN andere platforms toe.',
        '- Gebruik EXCLUSIEF de Thema/Pijlers uit Allowed Content Pillars; voer geen andere pijlers op.',
      ];
      const prompt = promptParts.join('\n');
      const res = await AIProviderManager.generateContentWithProviderSelection({ userId, functionType: AIFunction.GENERAL_ANALYSIS, userTier }, prompt, false);
      let text = String(res.content || '').trim();
      const fenceMatch = text.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
      if (fenceMatch) {
        text = fenceMatch[1].trim();
      }
      setCalendarMarkdown(text);
      setDebugResponseText(text);
      const lines = text.split(/\r?\n/).map(l => l.trim());
      const hasTableLine = lines.some(l => l.startsWith('|'));
      if (!hasTableLine) {
        setShowDebugModal(true);
      }
      displayToast(t('generated', 'Gegenereerd'), 'success');
    } catch (err: any) {
      displayToast(String(err?.message || 'Error'), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(calendarMarkdown);
      displayToast(t('copiedToClipboard'), 'success');
    } catch {
      displayToast(t('copyFailed'), 'error');
    }
  };

  const handlePdf = async () => {
    if (!calendarMarkdown) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    tryUseUnicodeFont(doc);
    const margin = 36;
    const maxWidth = 540;
    const lines = doc.splitTextToSize(calendarMarkdown, maxWidth);
    let y = margin;
    lines.forEach(line => {
      if (y > 800) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 16;
    });
    doc.save(buildRecapHorizonFilename('pdf'));
  };

  const handleMoveToTranscript = async () => {
    if (!onMoveToTranscript || !calendarMarkdown) return;
    setShowMoveModal(true);
  };

  const handleReset = () => {
    setTopics([]);
    setSelectedTopic('');
    setTargetAudience('');
    setFrequencyPerWeek(5);
    setMainGoal('');
    setStartDate(todayIso);
    setContentPillars([]);
    setSchedule({ LinkedIn: 3, Instagram: 2 });
    setCalendarMarkdown('');
  };

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[300px]">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">{t('featureNotAvailable', 'Niet beschikbaar')}</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{t('upgradeToUse', 'Upgrade je abonnement om deze functie te gebruiken.')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-b-lg transition-colors">
      {(isLoadingTopics || isGenerating) && (
        <BlurredLoadingOverlay text={t('processing', 'Bezig...')} />
      )}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t('contentCalendar', 'Content kalender')}</h3>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          {!content && <span className="text-sm text-slate-500">{t('noContent', 'No data available')}</span>}
        </div>

        {topics.length > 0 && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('selectTopic', 'Kies een onderwerp')}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`text-left p-2 rounded border transition-colors ${selectedTopic === topic ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  <span className="text-sm">{topic}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedTopic && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('targetAudience')}</label>
              <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="w-full p-3 border border-slate-300 dark:border-slate-500 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                <option value="">{t('select', 'Selecteer')}</option>
                {audienceKeys.map((k) => (
                  <option key={k} value={t(k)}>{t(k)}</option>
                ))}
              </select>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('frequencyPerWeek', 'Frequentie per week')}</label>
              <select value={frequencyPerWeek} onChange={(e) => setFrequencyPerWeek(parseInt(e.target.value))} className="w-full p-3 border border-slate-300 dark:border-slate-500 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                {Array.from({ length: 10 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600 lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('mainGoal', 'Hoofddoel')} <span className="text-xs text-slate-500">{t('optional', 'optioneel')}</span></label>
              <input type="text" value={mainGoal} maxLength={100} onChange={(e) => setMainGoal(e.target.value)} placeholder={t('enterGoal', 'Max 100 karakters')} className="w-full p-3 border border-slate-300 dark:border-slate-500 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('startDate', 'Startdatum')}</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-3 border border-slate-300 dark:border-slate-500 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('contentPillars', 'Content Pijlers')}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {pillarOptions.map(p => (
                  <label key={p.id} className="flex items-center p-2 rounded border border-slate-300 dark:border-slate-600">
                    <input type="checkbox" checked={contentPillars.includes(p.id)} onChange={() => handleTogglePillar(p.id)} className="mr-2" />
                    <span className="text-sm">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600 md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('postingSchedule', 'Publicatie Schema')}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {platformOptions.map(p => (
                  <div key={p} className="p-3 rounded border border-slate-300 dark:border-slate-600">
                    <label className="flex items-center justify-between">
                      <span className="text-sm">{p}</span>
                      <input type="checkbox" checked={schedule[p] !== undefined} onChange={() => handleTogglePlatform(p)} />
                    </label>
                    {schedule[p] !== undefined && (
                      <div className="mt-2">
                        <label className="block text-xs mb-1">{t('postsPerWeek', 'Posts per week')}</label>
                        <input type="number" min={0} max={10} value={schedule[p]} onChange={(e) => handleSetPlatformCount(p, parseInt(e.target.value))} className="w-full p-2 border border-slate-300 dark:border-slate-500 rounded bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={handleGenerateCalendar} disabled={isGenerating} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors">{isGenerating ? t('generating', 'Bezig...') : t('generate', 'Genereer kalender')}</button>
                {calendarMarkdown && (
                  <>
                    <button onClick={handleCopy} className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 rounded-md text-slate-700 dark:text-slate-200">{t('copyContent', 'Kopiëren')}</button>
                    <button onClick={handlePdf} className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 rounded-md text-slate-700 dark:text-slate-200">PDF</button>
                    <button onClick={handleMoveToTranscript} className="px-3 py-2 text-sm bg-green-600 text-white rounded-md">{t('aiDiscussion.moveToTranscript', 'Verplaats naar transcript')}</button>
                    <button onClick={async () => {
                      setCalendarMarkdown('');
                      setParsedRows([]);
                      setSelectedTopic('');
                      setTargetAudience('');
                      setFrequencyPerWeek(5);
                      setMainGoal('');
                      setStartDate(todayIso);
                      setContentPillars([]);
                      setSchedule({ LinkedIn: 3, Instagram: 2 });
                      setIsLoadingTopics(false);
                      setTopics([]);
                    }} className="px-3 py-2 text-sm bg-amber-500 text-white rounded-md">{t('regenerate', 'Opnieuw')}</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {parsedRows.length > 0 && (
          <div className="mt-6">
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Dag #</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Datum</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Thema/Pijler</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Platform</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">Content Idee</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300">CTA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                  {parsedRows.map((r, idx) => (
                    <tr key={`row-${idx}-${r.day}-${r.date}`} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200">{r.day}</td>
                      <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200">{r.date}</td>
                      <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200">{r.pillar}</td>
                      <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200">{r.platform}</td>
                      <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200"><div dangerouslySetInnerHTML={{ __html: markdownToSanitizedHtml(r.idea) }} /></td>
                      <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200"><div dangerouslySetInnerHTML={{ __html: markdownToSanitizedHtml(r.cta) }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {calendarMarkdown && (
        <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 max-h-[60vh] overflow-y-auto">
          <div
            className="prose dark:prose-invert max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: markdownToSanitizedHtml(calendarMarkdown) }}
          />
        </div>
      )}
      
      {showMoveModal && (
        <Modal
          isOpen={showMoveModal}
          onClose={() => setShowMoveModal(false)}
          title={t('aiDiscussion.moveToTranscriptModal.title', 'Rapport naar transcript verplaatsen')}
        >
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              {t('aiDiscussion.moveToTranscriptModal.message', 'Dit rapport wordt het nieuwe transcript en vervangt de huidige inhoud. Het kan daarna gebruikt worden voor verdere analyse met andere opties.')}
            </p>
            <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">
              {t('aiDiscussion.moveToTranscriptModal.warning', 'Let op: De huidige transcript-inhoud wordt permanent vervangen.')}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t('aiDiscussion.moveToTranscriptModal.cancel', 'Annuleren')}
              </button>
              <button
                onClick={async () => {
                  if (!onMoveToTranscript) return;
                  const plain = markdownToPlainText(calendarMarkdown);
                  await onMoveToTranscript(plain);
                  setShowMoveModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                {t('aiDiscussion.moveToTranscriptModal.confirm', 'Ja, vervang transcript')}
              </button>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </div>
  );
};

export default ContentCalendarTab;