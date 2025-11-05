import React, { useMemo, useState, useRef, useEffect } from 'react';
import { TranslationFunction, SubscriptionTier } from '../../types';
import { AIProviderManager, AIFunction } from '../utils/aiProviderManager';
import { tokenCounter } from '../tokenCounter';
import { subscriptionService } from '../subscriptionService';

interface IdeaBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (text: string) => void;
  t: TranslationFunction;
  userId: string;
  userTier: SubscriptionTier;
}

const IdeaBuilderModal: React.FC<IdeaBuilderModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  t,
  userId,
  userTier,
}) => {
  const [phase, setPhase] = useState<'input' | 'round1' | 'round2' | 'generating_plan'>('input');
  const [initialIdea, setInitialIdea] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type LikertKey =
    | 'strongly_agree'
    | 'agree'
    | 'neutral'
    | 'disagree'
    | 'strongly_disagree';

  interface LikertOption {
    key: LikertKey;
    label: string;
    scale: number;
  }

  type AnswerRecord = { question: string; key: LikertKey; label: string; scale: number };

  const makeDefaultAnswer = (question: string): AnswerRecord => ({
    question,
    key: 'neutral',
    label: String(t('likertNeutral', 'Neutral / Somewhat relevant')),
    scale: 3,
  });

  const LIKERT_OPTIONS: LikertOption[] = [
    { key: 'strongly_agree', label: t('likertStronglyAgree', 'Strongly agree / Very relevant'), scale: 5 },
    { key: 'agree', label: t('likertAgree', 'Agree / Relevant'), scale: 4 },
    { key: 'neutral', label: t('likertNeutral', 'Neutral / Somewhat relevant'), scale: 3 },
    { key: 'disagree', label: t('likertDisagree', 'Disagree / Not very relevant'), scale: 2 },
    { key: 'strongly_disagree', label: t('likertStronglyDisagree', 'Strongly disagree / Irrelevant'), scale: 1 },
  ];

  const [round1Questions, setRound1Questions] = useState<string[]>([]);
  const [round2Questions, setRound2Questions] = useState<string[]>([]);
  const [round1Answers, setRound1Answers] = useState<AnswerRecord[]>([]);
  const [round2Answers, setRound2Answers] = useState<AnswerRecord[]>([]);
  const [round1ScaleLabels, setRound1ScaleLabels] = useState<string[][]>([]);
  const [round2ScaleLabels, setRound2ScaleLabels] = useState<string[][]>([]);

  // Scroll container ref to ensure first question is visible when starting rounds
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (phase === 'round1' || phase === 'round2') {
      const el = containerRef.current;
      if (el) {
        try {
          el.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
          el.scrollTop = 0;
        }
      }
    }
  }, [phase]);

  const canProceed = useMemo(() => {
    if (phase === 'input') {
      return initialIdea.trim().length >= 30;
    }
    if (phase === 'round1') {
      return round1Questions.length === 5 && round1Answers.length === 5;
    }
    if (phase === 'round2') {
      return round2Questions.length === 5 && round2Answers.length === 5;
    }
    return false;
  }, [phase, initialIdea, round1Questions, round1Answers, round2Questions, round2Answers]);

  if (!isOpen) return null;

  const buildRound1Prompt = (idea: string) => {
    return [
      'You are assisting with an Idea Builder workflow.',
      'Task: Generate 5 assertive statements about the idea from different perspectives: goals, target audience, challenges, benefits, and constraints.',
      'Each statement must be phrased so the user can agree/disagree on a Likert scale.',
      'Rules:',
      '- Output ONLY valid JSON with the shape: {"questions": [{"text":"S1","scaleLabels":["L1","L2","L3","L4","L5"]}, {"text":"S2","scaleLabels":["L1","L2","L3","L4","L5"]}, {"text":"S3","scaleLabels":["L1","L2","L3","L4","L5"]}, {"text":"S4","scaleLabels":["L1","L2","L3","L4","L5"]}, {"text":"S5","scaleLabels":["L1","L2","L3","L4","L5"]}]}',
      '- Do NOT use code blocks, backticks, or language tags; return plain JSON only.',
      '- Do NOT include any Markdown, explanations, or extra text.',
      '- Each statement must be concise and specific to the idea. The scaleLabels must describe a 1-5 agreement/relevance scale tailored to the specific statement (1 = strongly disagree / irrelevant, 5 = strongly agree / highly relevant).',
      '',
      `Idea: ${idea}`,
    ].join('\n');
  };

  const buildRound2Prompt = (idea: string, answers: Array<{ question: string; label: string; scale: number }>) => {
    const answerLines = answers.map((a, idx) => `S${idx + 1}: ${a.question} | Answer: ${a.label} (scale=${a.scale})`).join('\n');
    return [
      'You are assisting with an Idea Builder workflow.',
      'Task: Based on the initial idea and the round 1 answers, generate 5 assertive statements that further crystallize the idea: implementation, risks, resources, competition, timeline.',
      'Each statement must be phrased so the user can agree/disagree on a Likert scale.',
      'Rules:',
      '- Output ONLY valid JSON with the shape: {"questions": [{"text":"S1","scaleLabels":["L1","L2","L3","L4","L5"]}, {"text":"S2","scaleLabels":["L1","L2","L3","L4","L5"]}, {"text":"S3","scaleLabels":["L1","L2","L3","L4","L5"]}, {"text":"S4","scaleLabels":["L1","L2","L3","L4","L5"]}, {"text":"S5","scaleLabels":["L1","L2","L3","L4","L5"]}]}',
      '- Do NOT use code blocks, backticks, or language tags; return plain JSON only.',
      '- Do NOT include any Markdown, explanations, or extra text.',
      '- Each statement must be concise and build upon the provided answers. The scaleLabels must describe a 1-5 agreement/relevance scale tailored to the specific statement (1 = strongly disagree / irrelevant, 5 = strongly agree / highly relevant).',
      '',
      `Idea: ${idea}`,
      'Round 1 Answers:',
      answerLines,
    ].join('\n');
  };

  const buildPlanPrompt = (
    idea: string,
    r1: Array<{ question: string; label: string; scale: number }>,
    r2: Array<{ question: string; label: string; scale: number }>
  ) => {
    const r1Lines = r1.map((a, idx) => `R1-Q${idx + 1}: ${a.question} => ${a.label} (scale=${a.scale})`).join('\n');
    const r2Lines = r2.map((a, idx) => `R2-Q${idx + 1}: ${a.question} => ${a.label} (scale=${a.scale})`).join('\n');
    return [
      'Write a structured, detailed plan that integrates the initial idea and the answers from both rounds.',
      'Requirements:',
      '- Use clear English and practical recommendations.',
      '- Structure the plan with explicit sections: Overview, Objectives, Implementation Steps, Risks & Mitigations, Required Resources, Competitive Landscape, Timeline.',
      '- The plan must be detailed enough to serve as a transcript.',
      '- Do NOT include any placeholders or sensitive data.',
      '',
      `Initial idea: ${idea}`,
      'Round 1 Answers:',
      r1Lines,
      '',
      'Round 2 Answers:',
      r2Lines,
    ].join('\n');
  };

  // Robust JSON extraction accommodating two shapes:
  // 1) { questions: ["Q1", ..., "Q5"] }
  // 2) { questions: [{ text: "Q1", scaleLabels: ["L1", ..., "L5"] }, ...] }
  const safeParseQuestionPackage = (text: string): { questions: string[]; scaleLabels?: string[][] } | null => {
    if (!text) return null;
    let sanitized = text.trim();
    sanitized = sanitized.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = sanitized.indexOf('{');
    const end = sanitized.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    const jsonStr = sanitized.slice(start, end + 1).trim();
    try {
      const obj = JSON.parse(jsonStr);
      const qs = obj?.questions;
      if (!Array.isArray(qs) || qs.length !== 5) return null;
      // Case: array of strings
      if (qs.every((q: any) => typeof q === 'string' && q.trim().length > 0)) {
        return { questions: qs as string[] };
      }
      // Case: array of objects with text + optional scaleLabels
      if (
        qs.every(
          (q: any) =>
            q && typeof q.text === 'string' && q.text.trim().length > 0 &&
            (!q.scaleLabels || (Array.isArray(q.scaleLabels) && q.scaleLabels.length === 5 && q.scaleLabels.every((l: any) => typeof l === 'string' && l.trim().length > 0)))
        )
      ) {
        const questions: string[] = qs.map((q: any) => q.text);
        const labels: string[][] = qs.map((q: any) => (q.scaleLabels ? q.scaleLabels : []));
        return { questions, scaleLabels: labels };
      }
      return null;
    } catch {
      return null;
    }
  };

  const startRound1 = async () => {
    setError(null);
    try {
      // Gating: ensure current subscription tier allows Idea Builder
      const isAllowed = subscriptionService.isFeatureAvailable(userTier, 'ideaBuilder');
      if (!isAllowed) {
        setError('Error: ' + String(t('ideaBuilderFeatureUpgrade', 'Idea Builder is available from Gold tier. Upgrade your subscription to access guided ideation.')));
        return;
      }

      if (initialIdea.trim().length < 30) {
        setError('Error: The initial idea must be at least 30 characters long');
        return;
      }
      const { validateAndSanitizeForAI, rateLimiter } = await import('../utils/security');
      const { tokenManager } = await import('../utils/tokenManager');

      const sessionId = `idea_builder_${userId || 'guest'}`;
      if (!rateLimiter.isAllowed(sessionId, 10, 60_000)) {
        setError('Error: Rate limit exceeded. Please wait a moment and try again');
        return;
      }

      const ideaValidation = validateAndSanitizeForAI(initialIdea, 8000);
      if (!ideaValidation.isValid) {
        setError(`Error: ${ideaValidation.error || 'Invalid input'}`);
        return;
      }
      const sanitizedIdea = ideaValidation.sanitized;
      const prompt = buildRound1Prompt(sanitizedIdea);

      const tokenEstimate = tokenManager.estimateTokens(prompt, 2);
      const tokenValidation = await tokenManager.validateTokenUsage(userId, userTier, tokenEstimate.totalTokens);
      if (!tokenValidation.allowed) {
        setError(`Error: ${tokenValidation.reason || 'Token usage limit exceeded'}`);
        return;
      }

      setIsGenerating(true);

      const response = await AIProviderManager.generateContentWithProviderSelection(
        { userId: userId || 'guest', functionType: AIFunction.GENERAL_ANALYSIS, userTier, userPreference: undefined },
        prompt,
        false
      );

      const fullText = (response.content || '').trim();
      const promptTokens = tokenCounter.countPromptTokens(prompt.trim());
      const responseTokens = tokenCounter.countResponseTokens(fullText);
      await tokenManager.recordTokenUsage(userId, promptTokens, responseTokens);

      if (!fullText) {
        setError('Error: Empty response received');
        setIsGenerating(false);
        return;
      }

      const pkg = safeParseQuestionPackage(fullText);
      if (!pkg) {
        setError('Error: AI did not return the expected 5 questions');
        setIsGenerating(false);
        return;
      }
      setRound1Questions(pkg.questions);
      setRound1ScaleLabels(pkg.scaleLabels || []);
      setRound1Answers([]);
      setPhase('round1');
      setIsGenerating(false);
    } catch (e: any) {
      console.error('IdeaBuilderModal round1 error', e);
      const message = e?.message || 'Unexpected error during question generation';
      setError(`Error: ${message}`);
      setIsGenerating(false);
    }
  };

  const startRound2 = async () => {
    setError(null);
    try {
      if (round1Answers.length !== 5) {
        setError('Error: Please answer all 5 questions in Round 1');
        return;
      }

      const { validateAndSanitizeForAI, rateLimiter } = await import('../utils/security');
      const { tokenManager } = await import('../utils/tokenManager');

      const sessionId = `idea_builder_${userId || 'guest'}`;
      if (!rateLimiter.isAllowed(sessionId, 10, 60_000)) {
        setError('Error: Rate limit exceeded. Please wait a moment and try again');
        return;
      }

      const ideaValidation = validateAndSanitizeForAI(initialIdea, 8000);
      if (!ideaValidation.isValid) {
        setError(`Error: ${ideaValidation.error || 'Invalid input'}`);
        return;
      }
      const sanitizedIdea = ideaValidation.sanitized;
      const prompt = buildRound2Prompt(sanitizedIdea, round1Answers.map(({ question, label, scale }) => ({ question, label, scale })));

      const tokenEstimate = tokenManager.estimateTokens(prompt, 2);
      const tokenValidation = await tokenManager.validateTokenUsage(userId, userTier, tokenEstimate.totalTokens);
      if (!tokenValidation.allowed) {
        setError(`Error: ${tokenValidation.reason || 'Token usage limit exceeded'}`);
        return;
      }

      setIsGenerating(true);

      const response = await AIProviderManager.generateContentWithProviderSelection(
        { userId: userId || 'guest', functionType: AIFunction.GENERAL_ANALYSIS, userTier, userPreference: undefined },
        prompt,
        false
      );

      const fullText = (response.content || '').trim();
      const promptTokens = tokenCounter.countPromptTokens(prompt.trim());
      const responseTokens = tokenCounter.countResponseTokens(fullText);
      await tokenManager.recordTokenUsage(userId, promptTokens, responseTokens);

      if (!fullText) {
        setError('Error: Empty response received');
        setIsGenerating(false);
        return;
      }

      const pkg = safeParseQuestionPackage(fullText);
      if (!pkg) {
        setError('Error: AI did not return the expected 5 deepening questions');
        setIsGenerating(false);
        return;
      }
      setRound2Questions(pkg.questions);
      setRound2ScaleLabels(pkg.scaleLabels || []);
      setRound2Answers([]);
      setPhase('round2');
      setIsGenerating(false);
    } catch (e: any) {
      console.error('IdeaBuilderModal round2 error', e);
      const message = e?.message || 'Unexpected error during deepening question generation';
      setError(`Error: ${message}`);
      setIsGenerating(false);
    }
  };

  const generatePlan = async () => {
    setError(null);
    try {
      if (round2Answers.length !== 5) {
        setError('Error: Please answer all 5 questions in Round 2');
        return;
      }
      const { validateAndSanitizeForAI, rateLimiter } = await import('../utils/security');
      const { tokenManager } = await import('../utils/tokenManager');

      const sessionId = `idea_builder_${userId || 'guest'}`;
      if (!rateLimiter.isAllowed(sessionId, 10, 60_000)) {
        setError('Error: Rate limit exceeded. Please wait a moment and try again');
        return;
      }

      const ideaValidation = validateAndSanitizeForAI(initialIdea, 8000);
      if (!ideaValidation.isValid) {
        setError(`Error: ${ideaValidation.error || 'Invalid input'}`);
        return;
      }
      const sanitizedIdea = ideaValidation.sanitized;
      const prompt = buildPlanPrompt(
        sanitizedIdea,
        round1Answers.map(({ question, label, scale }) => ({ question, label, scale })),
        round2Answers.map(({ question, label, scale }) => ({ question, label, scale }))
      );

      const tokenEstimate = tokenManager.estimateTokens(prompt, 2);
      const tokenValidation = await tokenManager.validateTokenUsage(userId, userTier, tokenEstimate.totalTokens);
      if (!tokenValidation.allowed) {
        setError(`Error: ${tokenValidation.reason || 'Token usage limit exceeded'}`);
        return;
      }

      setIsGenerating(true);

      const response = await AIProviderManager.generateContentWithProviderSelection(
        { userId: userId || 'guest', functionType: AIFunction.GENERAL_ANALYSIS, userTier, userPreference: undefined },
        prompt,
        false
      );

      const fullText = (response.content || '').trim();
      const promptTokens = tokenCounter.countPromptTokens(prompt.trim());
      const responseTokens = tokenCounter.countResponseTokens(fullText);
      await tokenManager.recordTokenUsage(userId, promptTokens, responseTokens);

      if (!fullText) {
        setError('Error: Empty response received');
        setIsGenerating(false);
        return;
      }

      onGenerate(fullText);
      setIsGenerating(false);
      setPhase('generating_plan');
      onClose();
    } catch (e: any) {
      console.error('IdeaBuilderModal plan generation error', e);
      const message = e?.message || 'Unexpected error during plan generation';
      setError(`Error: ${message}`);
      setIsGenerating(false);
    }
  };

  const scaleToKey = (s: number): LikertKey => {
    if (s === 5) return 'strongly_agree';
    if (s === 4) return 'agree';
    if (s === 3) return 'neutral';
    if (s === 2) return 'disagree';
    return 'strongly_disagree';
  };

  const labelForScale = (round: 1 | 2, qi: number, scale: number): string => {
    const labels = round === 1 ? round1ScaleLabels[qi] : round2ScaleLabels[qi];
    if (labels && labels.length === 5) return labels[scale - 1];
    switch (scale) {
      case 1:
        return t('likertStronglyDisagree', 'Strongly Disagree');
      case 2:
        return t('likertDisagree', 'Disagree');
      case 3:
        return t('likertNeutral', 'Neutral');
      case 4:
        return t('likertAgree', 'Agree');
      case 5:
        return t('likertStronglyAgree', 'Strongly Agree');
      default:
        return String(scale);
    }
  };

  const selectAnswer = (round: 1 | 2, questionIndex: number, scale: number) => {
    const key = scaleToKey(scale);
    const label = labelForScale(round, questionIndex, scale);
    if (round === 1) {
      const question = round1Questions[questionIndex];
      const merged: AnswerRecord[] = round1Questions.map((q, idx) => {
        if (idx === questionIndex) {
          return { question, key, label, scale };
        }
        return round1Answers[idx] || makeDefaultAnswer(round1Questions[idx]);
      });
      setRound1Answers(merged);
    } else {
      const question = round2Questions[questionIndex];
      const merged: AnswerRecord[] = round2Questions.map((q, idx) => {
        if (idx === questionIndex) {
          return { question, key, label, scale };
        }
        return round2Answers[idx] || makeDefaultAnswer(round2Questions[idx]);
      });
      setRound2Answers(merged);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div ref={containerRef} className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-[95vw] max-w-[1000px] max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-medium text-gray-800 dark:text-white tracking-tight">{t('ideaBuilderTitle', 'Idea Builder')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-medium"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          {phase === 'input' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('ideaBuilderInitialIdea', 'Describe your idea')}
              </label>
              <textarea
                value={initialIdea}
                onChange={(e) => setInitialIdea(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder={t('ideaBuilderInitialIdeaPh', 'Write at least 30 characters describing your idea and context')}
                rows={6}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t('ideaBuilderMinChars', 'Minimum 30 characters required')}
              </p>
            </div>
          )}

          {phase === 'round1' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                {t('ideaBuilderRound1Title', 'Round 1: Clarifying Questions')}
              </h3>
              <div className="space-y-5">
                {round1Questions.map((q, qi) => {
                  const labels = round1ScaleLabels[qi] && round1ScaleLabels[qi].length === 5
                    ? round1ScaleLabels[qi]
                    : [
                        t('likertStronglyDisagree', 'Strongly Disagree'),
                        t('likertDisagree', 'Disagree'),
                        t('likertNeutral', 'Neutral'),
                        t('likertAgree', 'Agree'),
                        t('likertStronglyAgree', 'Strongly Agree')
                      ];
                  const currentScale = round1Answers[qi]?.scale ?? 3;
                  const currentLabel = labels[currentScale - 1];
                  return (
                    <div key={`r1-q-${qi}`} className="rounded-md border border-gray-200 dark:border-slate-700 p-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{q}</p>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={currentScale}
                        onChange={(e) => selectAnswer(1, qi, Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="grid grid-cols-5 gap-1 mt-2 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                        {labels.map((lbl, i) => (
                          <span key={`r1-l-${qi}-${i}`} className="text-center leading-tight break-words whitespace-normal">{lbl}</span>
                        ))}
                      </div>
                      <p className="text-xs mt-2 text-gray-700 dark:text-gray-300">{t('selected', 'Selected')}: {currentLabel}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {phase === 'round2' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                {t('ideaBuilderRound2Title', 'Round 2: Deepening Questions')}
              </h3>
              <div className="space-y-5">
                {round2Questions.map((q, qi) => {
                  const labels = round2ScaleLabels[qi] && round2ScaleLabels[qi].length === 5
                    ? round2ScaleLabels[qi]
                    : [
                        t('likertStronglyDisagree', 'Strongly Disagree'),
                        t('likertDisagree', 'Disagree'),
                        t('likertNeutral', 'Neutral'),
                        t('likertAgree', 'Agree'),
                        t('likertStronglyAgree', 'Strongly Agree')
                      ];
                  const currentScale = round2Answers[qi]?.scale ?? 3;
                  const currentLabel = labels[currentScale - 1];
                  return (
                    <div key={`r2-q-${qi}`} className="rounded-md border border-gray-200 dark:border-slate-700 p-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{q}</p>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={currentScale}
                        onChange={(e) => selectAnswer(2, qi, Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="grid grid-cols-5 gap-1 mt-2 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                        {labels.map((lbl, i) => (
                          <span key={`r2-l-${qi}-${i}`} className="text-center leading-tight break-words whitespace-normal">{lbl}</span>
                        ))}
                      </div>
                      <p className="text-xs mt-2 text-gray-700 dark:text-gray-300">{t('selected', 'Selected')}: {currentLabel}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-cyan-500 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3a7 7 0 00-7 7c0 2.29 1.06 4.33 2.7 5.62A3 3 0 009 18v1a3 3 0 003 3h0a3 3 0 003-3v-1a3 3 0 002.3-2.38A7 7 0 0011 3z" />
              </svg>
              <p className="text-cyan-800 dark:text-cyan-200 text-sm">
                {t('ideaBuilderInfo', 'We validate and sanitize inputs automatically. Avoid including secrets or personal data. Results will be added to your transcript for analysis.')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-slate-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {phase === 'input' && t('ideaBuilderStepLabel', 'Step 1 of 3')}
            {phase === 'round1' && t('ideaBuilderStepLabel2', 'Step 2 of 3')}
            {phase === 'round2' && t('ideaBuilderStepLabel3', 'Step 3 of 3')}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              disabled={isGenerating}
            >
              {t('cancel', 'Cancel')}
            </button>

            {phase === 'input' && (
              <button
                onClick={startRound1}
                className={`px-4 py-2 rounded-md text-white ${canProceed ? 'bg-amber-500 hover:bg-amber-600' : 'bg-amber-300 cursor-not-allowed'}`}
                disabled={!canProceed || isGenerating}
              >
                {isGenerating ? t('ideaBuilderGenerating', 'Generating...') : t('ideaBuilderStartRound1', 'Start Round 1')}
              </button>
            )}

            {phase === 'round1' && (
              <button
                onClick={startRound2}
                className={`px-4 py-2 rounded-md text-white ${canProceed ? 'bg-amber-500 hover:bg-amber-600' : 'bg-amber-300 cursor-not-allowed'}`}
                disabled={!canProceed || isGenerating}
              >
                {isGenerating ? t('ideaBuilderGenerating', 'Generating...') : t('ideaBuilderContinueToRound2', 'Continue to Round 2')}
              </button>
            )}

            {phase === 'round2' && (
              <button
                onClick={generatePlan}
                className={`px-4 py-2 rounded-md text-white ${canProceed ? 'bg-amber-500 hover:bg-amber-600' : 'bg-amber-300 cursor-not-allowed'}`}
                disabled={!canProceed || isGenerating}
              >
                {isGenerating ? t('ideaBuilderGenerating', 'Generating...') : t('ideaBuilderGeneratePlan', 'Generate Plan')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaBuilderModal;