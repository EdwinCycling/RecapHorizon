import React, { useMemo, useState, useRef, useEffect } from 'react';
import { TranslationFunction, SubscriptionTier } from '../../types';
import { AIProviderManager, AIFunction } from '../utils/aiProviderManager';
import { tokenCounter } from '../tokenCounter';
import { subscriptionService } from '../subscriptionService';
import BlurredLoadingOverlay from './BlurredLoadingOverlay';
import { markdownToPlainText } from '../utils/textUtils';
import ReportPreviewModal from './ReportPreviewModal';
import { useTranslation } from '../hooks/useTranslation';
import { getGeminiCode } from '../languages';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

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
  // Derive current UI language to enforce output language in prompts
  const uiLang = (typeof window !== 'undefined' && window.localStorage.getItem('uiLang')) || 'en';
  const { currentLanguage } = useTranslation(uiLang as any);
  const targetLanguageName = getGeminiCode(String(currentLanguage || 'en'));
  const [phase, setPhase] = useState<'input' | 'round1' | 'round2' | 'round3' | 'generating_plan'>('input');
  const [initialIdea, setInitialIdea] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  type LikertKey =
    | 'strongly_agree'
    | 'agree'
    | 'neutral'
    | 'disagree'
    | 'strongly_disagree';
  type MoscowKey = 'na' | 'nice' | 'could' | 'should' | 'must';

  interface LikertOption {
    key: LikertKey;
    label: string;
    scale: number;
  }

  type AnswerRecord = { question: string; key: LikertKey | MoscowKey; label: string; scale: number };

  const makeDefaultAnswer = (question: string): AnswerRecord => ({
    question,
    key: 'neutral',
    label: String(t('likertNeutral')),
    scale: 3,
  });

  const LIKERT_OPTIONS: LikertOption[] = [
    { key: 'strongly_agree', label: t('likertStronglyAgree'), scale: 5 },
    { key: 'agree', label: t('likertAgree'), scale: 4 },
    { key: 'neutral', label: t('likertNeutral'), scale: 3 },
    { key: 'disagree', label: t('likertDisagree'), scale: 2 },
    { key: 'strongly_disagree', label: t('likertStronglyDisagree'), scale: 1 },
  ];

  const [round1Questions, setRound1Questions] = useState<string[]>([]);
  const [round2Questions, setRound2Questions] = useState<string[]>([]);
  const [round3Questions, setRound3Questions] = useState<string[]>([]);
  const [round1Answers, setRound1Answers] = useState<AnswerRecord[]>([]);
  const [round2Answers, setRound2Answers] = useState<AnswerRecord[]>([]);
  const [round3Answers, setRound3Answers] = useState<AnswerRecord[]>([]);
  const [round1ScaleLabels, setRound1ScaleLabels] = useState<string[][]>([]);
  const [round2ScaleLabels, setRound2ScaleLabels] = useState<string[][]>([]);
  const [focusType, setFocusType] = useState<'functional' | 'wild' | 'services' | 'combined'>('combined');

  // Scroll container ref to ensure first question is visible when starting rounds
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (phase === 'round1' || phase === 'round2' || phase === 'round3') {
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
    if (phase === 'round3') {
      return round3Questions.length === 5 && round3Answers.length === 5;
    }
    return false;
  }, [phase, initialIdea, round1Questions, round1Answers, round2Questions, round2Answers, round3Questions, round3Answers]);

  // File handling functions
  const handleFile = async (file: File) => {
    try {
      if (!file) return;
      
      // Check file type
      const validTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const validExtensions = ['.txt', '.pdf', '.docx'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        setError(t('unsupportedFileTypeError'));
        return;
      }
      
      // For now, we'll just read text files directly
      // In a real implementation, you'd want to handle PDF and DOCX conversion
      if (file.type === 'text/plain' || fileExtension === '.txt') {
        const text = await file.text();
        // Add file content to existing text instead of overwriting
        setInitialIdea(prev => prev ? `${prev}\n\n${text}` : text);
      } else {
        setError(t('pdfDocxNotSupportedError'));
      }
    } catch (e: any) {
      setError(t('fileReadError', { error: e.message || t('unknownError') }));
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

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
      `- IMPORTANT: All "text" and "scaleLabels" MUST be written in ${targetLanguageName}.`,
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
      `- IMPORTANT: All "text" and "scaleLabels" MUST be written in ${targetLanguageName}.`,
      '',
      `Idea: ${idea}`,
      'Round 1 Answers:',
      answerLines,
    ].join('\n');
  };

  const buildPlanPrompt = (
    idea: string,
    r1: Array<{ question: string; label: string; scale: number }>,
    r2: Array<{ question: string; label: string; scale: number }>,
    r3: Array<{ question: string; label: string; scale: number }>
  ) => {
    const r1Lines = r1.map((a, idx) => `R1-Q${idx + 1}: ${a.question} => ${a.label} (scale=${a.scale})`).join('\n');
    const r2Lines = r2.map((a, idx) => `R2-Q${idx + 1}: ${a.question} => ${a.label} (scale=${a.scale})`).join('\n');
    const r3Lines = r3.map((a, idx) => `R3-Item${idx + 1}: ${a.question} => ${a.label} (scale=${a.scale})`).join('\n');
    return [
      'START DIRECT MET HET PLAN - GEEN INTRODUCTIE OF INLEIDING',
      'Requirements:',
      `- Use clear ${targetLanguageName} and practical recommendations.`,
      '- Structure the plan with these explicit sections in order:',
      '  1. Overview (kort overzicht)',
      '  2. Analysis of Answered Questions (uitgebreid hoofdstuk)',
      '  3. Market Position & Feasibility (hoofdstuk over marktpositie en haalbaarheid)',
      '  4. Objectives',
      '  5. Implementation Steps',
      '  6. Risks & Mitigations',
      '  7. Required Resources',
      '  8. Competitive Landscape',
      '  9. Timeline',
      '',
      'Section 2 - Analysis of Answered Questions requirements:',
      '- Transform the 15 answered questions (5 from Round 1 + 5 from Round 2 + 5 from Round 3) into an informative, engaging, and convincing narrative',
      '- This must be an extensive chapter that weaves all answers together into a compelling story',
      '- Show how the answers reveal insights about the idea\'s potential, challenges, and opportunities',
      '- Make it enjoyable to read while being informative and persuasive',
      '- Connect the dots between different answers to show the bigger picture',
      '',
      'Section 3 - Market Position & Feasibility requirements:',
      '- Analyze the current market position this idea would occupy',
      '- Assess technical, financial, and operational feasibility',
      '- Identify target market segments and competitive advantages',
      '- Evaluate market demand and growth potential',
      '- Discuss barriers to entry and competitive threats',
      '',
      'General requirements:',
      '- The plan must be extremely detailed and comprehensive - include specific actions, timelines, resources, and concrete steps.',
      '- Provide extensive detail for each section with specific examples, metrics, and actionable items.',
      '- Do NOT include any placeholders or sensitive data.',
      `- IMPORTANT: The entire output MUST be in ${targetLanguageName}.`,
      '',
      `Initial idea: ${idea}`,
      'Round 1 Answers:',
      r1Lines,
      '',
      'Round 2 Answers:',
      r2Lines,
      '',
      'Round 3 Prioritized Items (MoSCoW):',
      r3Lines,
    ].join('\n');
  };

  const buildRound3Prompt = (
    idea: string,
    r1: Array<{ question: string; label: string; scale: number }>,
    r2: Array<{ question: string; label: string; scale: number }>,
    mode: 'functional' | 'wild' | 'services' | 'combined'
  ) => {
    const r1Lines = r1.map((a, idx) => `R1-Q${idx + 1}: ${a.question} => ${a.label} (scale=${a.scale})`).join('\n');
    const r2Lines = r2.map((a, idx) => `R2-Q${idx + 1}: ${a.question} => ${a.label} (scale=${a.scale})`).join('\n');
    const modeDesc = mode === 'functional'
      ? 'functional items we want to deliver'
      : mode === 'wild'
      ? 'wild ideas we could make'
      : mode === 'services'
      ? 'services we could offer'
      : 'combined things we could do, make, or create';
    return [
      'You are assisting with an Idea Builder workflow.',
      `Task: Generate 5 ${modeDesc}, tailored to the idea and previous answers. Each item should be concise and concrete.`,
      'Rules:',
      '- Output ONLY valid JSON with the shape: {"questions": [{"text":"I1"}, {"text":"I2"}, {"text":"I3"}, {"text":"I4"}, {"text":"I5"}]}',
      '- Do NOT use code blocks, backticks, or language tags; return plain JSON only.',
      '- Do NOT include any Markdown, explanations, or extra text.',
      `- IMPORTANT: All item "text" MUST be written in ${targetLanguageName}.`,
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
      if (!Array.isArray(qs) || qs.length < 1 || qs.length > 10) return null;
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

  const startRound3 = async () => {
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
      const prompt = buildRound3Prompt(
        sanitizedIdea,
        round1Answers.map(({ question, label, scale }) => ({ question, label, scale })),
        round2Answers.map(({ question, label, scale }) => ({ question, label, scale })),
        focusType
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

      const pkg = safeParseQuestionPackage(fullText);
      if (!pkg) {
        setError('Error: AI did not return valid prioritization items (expected 1-10 items)');
        setIsGenerating(false);
        return;
      }
      setRound3Questions(pkg.questions);
      setRound3Answers([]);
      setPhase('round3');
      setIsGenerating(false);
    } catch (e: any) {
      console.error('IdeaBuilderModal round3 error', e);
      const message = e?.message || 'Unexpected error during prioritization item generation';
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
      if (round3Answers.length === 0) {
        setError('Error: Please prioritize at least 1 item in Round 3');
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
        round2Answers.map(({ question, label, scale }) => ({ question, label, scale })),
        round3Answers.map(({ question, label, scale }) => ({ question, label, scale }))
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

      // Build input data summary to append to report with better formatting
      const inputDataSummary = [
        '',
        '',
        '---',
        '# INPUT DATA SUMMARY',
        '',
        '## ORIGINAL INPUT',
        '',
        `> ${sanitizedIdea}`,
        '',
        '## ROUND 1 - QUESTIONS AND ANSWERS',
        '',
        ...round1Answers.map((a, idx) => 
          `**Q${idx + 1}:** ${a.question}\n\n**Answer:** ${a.label} (scale ${a.scale}/5)\n`
        ),
        '',
        '## ROUND 2 - QUESTIONS AND ANSWERS',
        '',
        ...round2Answers.map((a, idx) => 
          `**Q${idx + 1}:** ${a.question}\n\n**Answer:** ${a.label} (scale ${a.scale}/5)\n`
        ),
        '',
        '## ROUND 3 - PRIORITIZED ITEMS',
        '',
        ...round3Answers.map((a, idx) => 
          `**Item ${idx + 1}:** ${a.question}\n\n**Priority:** ${a.label} (scale ${a.scale}/5)\n`
        ),
      ].join('\n');

      const fullReportWithInputData = fullText + inputDataSummary;

      // Open preview modal first; do not send to transcript yet
      setPreviewText(fullReportWithInputData);
      setShowPreview(true);
      setIsGenerating(false);
      setPhase('generating_plan');
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

  const scaleToMoscowKey = (s: number): MoscowKey => {
    if (s === 5) return 'must';
    if (s === 4) return 'should';
    if (s === 3) return 'could';
    if (s === 2) return 'nice';
    return 'na';
  };

  const labelForScale = (round: 1 | 2 | 3, qi: number, scale: number): string => {
    if (round === 3) {
      const labels = [
        t('moscowNA', 'N/A'),
        t('moscowNice', 'Nice to have'),
        t('moscowCould', 'Could have'),
        t('moscowShould', 'Should have'),
        t('moscowMust', 'Must have')
      ];
      return labels[scale - 1] || String(scale);
    }
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

  const selectAnswer = (round: 1 | 2 | 3, questionIndex: number, scale: number) => {
    const key = round === 3 ? scaleToMoscowKey(scale) : scaleToKey(scale);
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
    } else if (round === 2) {
      const question = round2Questions[questionIndex];
      const merged: AnswerRecord[] = round2Questions.map((q, idx) => {
        if (idx === questionIndex) {
          return { question, key, label, scale };
        }
        return round2Answers[idx] || makeDefaultAnswer(round2Questions[idx]);
      });
      setRound2Answers(merged);
    } else {
      const question = round3Questions[questionIndex];
      const merged: AnswerRecord[] = round3Questions.map((q, idx) => {
        if (idx === questionIndex) {
          return { question, key, label, scale };
        }
        return round3Answers[idx] || { question: round3Questions[idx], key: 'could', label: t('moscowCould', 'Could have'), scale: 3 };
      });
      setRound3Answers(merged);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-[95vw] max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col">
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
        <div ref={containerRef} className="p-6 space-y-6 flex-1 min-h-0 overflow-y-auto">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          {phase === 'input' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('ideaBuilderInitialIdea', 'Describe your idea or upload an idea from a file')}
              </label>
              
              {/* Drag and drop area */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 ${isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-slate-600'}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={onChange}
                  className="hidden"
                  accept=".txt,.pdf,.docx"
                />
                <div className="flex flex-col items-center">
                  <CloudArrowUpIcon className="h-8 w-8 text-gray-400 dark:text-slate-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">
                    Sleep je bestand hierheen of klik om te uploaden
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm"
                    type="button"
                  >
                    Bestand uploaden
                  </button>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                    {t('supportedFileTypes', 'TXT, PDF, DOCX')}
                  </p>
                </div>
              </div>
              
              <textarea
                value={initialIdea}
                onChange={(e) => setInitialIdea(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder={t('ideaBuilderInitialIdeaPh', 'Enter your idea, and explain more')}
                rows={8}
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
                      <div className="flex justify-between mt-2 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                        {labels.map((lbl, i) => (
                          <span key={`r1-l-${qi}-${i}`} className="text-center leading-tight break-words whitespace-normal w-1/5">{lbl}</span>
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
                      <div className="flex justify-between mt-2 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                        {labels.map((lbl, i) => (
                          <span key={`r2-l-${qi}-${i}`} className="text-center leading-tight break-words whitespace-normal w-1/5">{lbl}</span>
                        ))}
                      </div>
                      <p className="text-xs mt-2 text-gray-700 dark:text-gray-300">{t('selected', 'Selected')}: {currentLabel}</p>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('ideaBuilderFocusType', 'Focus for Round 3')}
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                  value={focusType}
                  onChange={(e) => setFocusType(e.target.value as any)}
                >
                  <option value="functional">{t('ideaBuilderFocusTypeFunctional', 'Functional items')}</option>
                  <option value="wild">{t('ideaBuilderFocusTypeWildIdeas', 'Wild ideas')}</option>
                  <option value="services">{t('ideaBuilderFocusTypeServices', 'Services')}</option>
                  <option value="combined">{t('ideaBuilderFocusTypeCombined', 'Combined options')}</option>
                </select>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('ideaBuilderFocusTypeHint', 'This selection guides the 5 items generated in Round 3.')}</p>
              </div>
            </div>
          )}

          {phase === 'round3' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                {t('ideaBuilderRound3Title', 'Round 3: Prioritization (MoSCoW)')}
              </h3>
              <div className="space-y-5">
                {round3Questions.map((q, qi) => {
                  const labels = [
                    t('moscowNA', 'N/A'),
                    t('moscowNice', 'Nice to have'),
                    t('moscowCould', 'Could have'),
                    t('moscowShould', 'Should have'),
                    t('moscowMust', 'Must have')
                  ];
                  const currentScale = round3Answers[qi]?.scale ?? 3;
                  const currentLabel = labels[currentScale - 1];
                  return (
                    <div key={`r3-q-${qi}`} className="rounded-md border border-gray-200 dark:border-slate-700 p-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{q}</p>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={currentScale}
                        onChange={(e) => selectAnswer(3, qi, Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between mt-2 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">
                        {labels.map((lbl, i) => (
                          <span key={`r3-l-${qi}-${i}`} className="text-center leading-tight break-words whitespace-normal w-1/5">{lbl}</span>
                        ))}
                      </div>
                      <p className="text-xs mt-2 text-gray-700 dark:text-gray-300">{t('selected', 'Selected')}: {currentLabel}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-slate-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {phase === 'input' && t('ideaBuilderStepLabel', 'Step 1 of 3')}
            {phase === 'round1' && t('ideaBuilderStepLabel2', 'Step 2 of 3')}
            {phase === 'round2' && t('ideaBuilderStepLabel3', 'Step 3 of 4')}
            {phase === 'round3' && t('ideaBuilderStepLabel4', 'Step 4 of 4')}
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
                {t('ideaBuilderStartRound1', 'Start Round 1')}
              </button>
            )}

            {phase === 'round1' && (
              <button
                onClick={startRound2}
                className={`px-4 py-2 rounded-md text-white ${canProceed ? 'bg-amber-500 hover:bg-amber-600' : 'bg-amber-300 cursor-not-allowed'}`}
                disabled={!canProceed || isGenerating}
              >
                {t('ideaBuilderContinueToRound2', 'Continue to Round 2')}
              </button>
            )}

            {phase === 'round2' && (
              <button
                onClick={startRound3}
                className={`px-4 py-2 rounded-md text-white ${canProceed ? 'bg-amber-500 hover:bg-amber-600' : 'bg-amber-300 cursor-not-allowed'}`}
                disabled={!canProceed || isGenerating}
              >
                {t('ideaBuilderContinueToRound3', 'Continue to Round 3')}
              </button>
            )}

            {phase === 'round3' && (
              <button
                onClick={generatePlan}
                className={`px-4 py-2 rounded-md text-white ${canProceed ? 'bg-amber-500 hover:bg-amber-600' : 'bg-amber-300 cursor-not-allowed'}`}
                disabled={!canProceed || isGenerating}
              >
                {t('ideaBuilderGeneratePlan', 'Generate Plan')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loader overlay: full-screen blurred popup */}
      <BlurredLoadingOverlay
        isVisible={isGenerating}
        loadingText={t('ideaBuilderGenerating', 'Generating...')}
      />

      {/* Report preview modal shown after plan generation */}
      <ReportPreviewModal
        isOpen={!!showPreview && !!previewText}
        onClose={() => { 
          setShowPreview(false);
          setPreviewText('');
          // Reset all data and close the entire modal
          setPhase('input');
          setInitialIdea('');
          setRound1Questions([]);
          setRound1Answers([]);
          setRound2Questions([]);
          setRound2Answers([]);
          setRound3Questions([]);
          setRound3Answers([]);
          setError(null);
          onClose();
        }}
        reportText={previewText || ''}
        t={t}
        onSendToTranscript={() => {
          const plain = markdownToPlainText(previewText || '');
          onGenerate(plain);
          setShowPreview(false);
          setPreviewText('');
          // Reset all data and close the entire modal
          setPhase('input');
          setInitialIdea('');
          setRound1Questions([]);
          setRound1Answers([]);
          setRound2Questions([]);
          setRound2Answers([]);
          setRound3Questions([]);
          setRound3Answers([]);
          setError(null);
          onClose();
        }}
      />
    </div>
  );
};

export default IdeaBuilderModal;