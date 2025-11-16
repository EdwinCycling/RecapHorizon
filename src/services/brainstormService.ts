import { SubscriptionTier } from '../../types';
import { AIProviderManager, AIFunction, ProviderSelectionRequest } from '../utils/aiProviderManager';
import { tokenManager } from '../utils/tokenManager';
import { tokenCounter } from '../tokenCounter';
import { translations } from '../locales';

export type BrainstormMethod = 'frameworks' | 'differentPerspectives' | 'oppositeDay' | 'stepByStep' | 'creativeWords' | 'chainOfDensity' | 'firstPrinciples';

export interface BrainstormParams {
  selected_framework?: string;
  number_of_dissatisfaction_ideas?: number;
  initial_step_focus?: string;
  number_of_ideas?: number;
  number_of_iterations?: number;
  selected_perspectives?: string;
}

export async function generateBrainstormIdeas(
  transcript: string,
  outputLanguage: string,
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.GOLD
): Promise<string[]> {
  const content = (transcript || '').trim();
  if (!content) throw new Error('Transcript is empty');

  const prompt = [
    'You are a creative AI-analyst. Your task is to extract the most prominent and innovative ideas, concepts, problems or opportunities from the transcript below. These should have potential for further elaboration or strategic discussion.',
    '**Transcript:**',
    '"""',
    content,
    '"""',
    '**Instruction:**',
    'Identify and present between 1 and 25 unique and relevant ideas/concepts/problems/opportunities that directly derive from this transcript. Formulate each idea succinctly. Provide your own ranking from 1 to 5 stars (allow half-stars), and sort by stars in the presentation.',
    `Generate the list in ${outputLanguage} sorted by relevance. The first item must always be: "No specific idea, brainstorm based on transcript".`
  ].join('\n');

  const request: ProviderSelectionRequest = {
    userId,
    functionType: AIFunction.ANALYSIS_GENERATION,
    userTier
  };
  // Validate token usage prior to AI call
  try {
    const estimate = tokenManager.estimateTokens(prompt, 2);
    const validation = await tokenManager.validateTokenUsage(userId, userTier, estimate.totalTokens);
    if (!validation.allowed) {
      throw new Error(validation.reason || 'Token usage limit exceeded');
    }
  } catch (e) {
    throw e;
  }

  const response = await AIProviderManager.generateContentWithProviderSelection(request, prompt, false);
  const text = String(response.content || '').trim();
  // Record token usage
  try {
    const promptTokens = tokenCounter.countPromptTokens(prompt);
    const responseTokens = tokenCounter.countResponseTokens(text);
    await tokenManager.recordTokenUsage(userId, promptTokens, responseTokens);
  } catch {}
  return parseIdeas(text);
}

export async function generateBrainstormReport(
  idea: string,
  method: BrainstormMethod,
  transcript: string,
  outputLanguage: string,
  expertRoleName: string,
  expertRoleDescription: string,
  params: BrainstormParams,
  userId: string = 'anonymous',
  userTier: SubscriptionTier = SubscriptionTier.GOLD
): Promise<string> {
  const content = (transcript || '').trim();
  if (!content) throw new Error('Transcript is empty');

  const methodInstructions = buildMethodInstructions(method, idea, params, outputLanguage);

  const prompt = [
    'You are a specialized AI consultant who facilitates expert sessions and produces reports. Your task is to generate a structured brainstorming report based on a specific idea, a chosen brainstorming method, and an expert role.',
    '**Idea to brainstorm (focus):**',
    '"""',
    idea,
    '"""',
    '**Chosen Brainstorm Method:**',
    method,
    '**Current Transcript (for context and factual grounding):**',
    '"""',
    content,
    '"""',
    '**Specific Instructions for the Chosen Method:**',
    methodInstructions,
    '**Expert Role:**',
    `Adopt the perspective and thinking style of the following expert role: '${expertRoleName}'. Focus your output on aspects most relevant to this role. The description of this role is: '${expertRoleDescription}'.`,
    '**Output Format & Report Structure:**',
    `Generate the output as a comprehensive, structured report in ${outputLanguage}. Start with a clear title, the chosen idea, the method used, and the expert role. Then follow the method instructions closely and present ideas clearly. Maintain a professional and concrete tone. Use sections and lists where appropriate. Do not include formatting codes.`,
    '**Constraints:**',
    '- All generated ideas and analyses must be directly derivable from or strongly inspired by the transcript and the chosen idea.',
    '- Be creative but practical.',
    '- Avoid inventing external facts that are not in the transcript.',
    '- Respect the chosen expert role and adjust depth/focus accordingly.'
  ].join('\n');

  const request: ProviderSelectionRequest = {
    userId,
    functionType: AIFunction.ANALYSIS_GENERATION,
    userTier
  };
  // Validate token usage prior to AI call
  try {
    const estimate = tokenManager.estimateTokens(prompt, 2);
    const validation = await tokenManager.validateTokenUsage(userId, userTier, estimate.totalTokens);
    if (!validation.allowed) {
      throw new Error(validation.reason || 'Token usage limit exceeded');
    }
  } catch (e) {
    throw e;
  }

  const response = await AIProviderManager.generateContentWithProviderSelection(request, prompt, false);
  const out = String(response.content || '').trim();
  try {
    const promptTokens = tokenCounter.countPromptTokens(prompt);
    const responseTokens = tokenCounter.countResponseTokens(out);
    await tokenManager.recordTokenUsage(userId, promptTokens, responseTokens);
  } catch {}
  return out;
}

function buildMethodInstructions(method: BrainstormMethod, idea: string, params: BrainstormParams, outputLanguage: string): string {
  const lang = (outputLanguage || 'en').toLowerCase().startsWith('nl') ? 'nl' : 'en';
  const dict = (translations as any)[lang] as Record<string, string>;
  const keyMap: Record<BrainstormMethod, string> = {
    frameworks: 'brainstorm.method.frameworksPromptTemplate',
    differentPerspectives: 'brainstorm.method.differentPerspectivesPromptTemplate',
    oppositeDay: 'brainstorm.method.oppositeDayPromptTemplate',
    stepByStep: 'brainstorm.method.stepByStepPromptTemplate',
    creativeWords: 'brainstorm.method.creativeWordsPromptTemplate',
    chainOfDensity: 'brainstorm.method.chainOfDensityPromptTemplate',
    firstPrinciples: 'brainstorm.method.firstPrinciplesPromptTemplate'
  };
  const tplKey = keyMap[method];
  let template = dict?.[tplKey];
  if (!template || typeof template !== 'string') {
    // Fallback to English hardcoded text if template missing
    switch (method) {
      case 'frameworks':
        template = `Using the {selected_framework} brainstorming framework, brainstorm the following topic: {user_selected_idea}. Provide actionable insights and ideas.`;
        break;
      case 'differentPerspectives':
        template = `We are in a brainstorming session about {user_selected_idea}. From the perspective of {selected_perspectives}, generate 10 ideas from each perspective. Each idea should be distinct and practical.`;
        break;
      case 'oppositeDay':
        template = `Give me {number_of_dissatisfaction_ideas} ways I would make my customers more DISSATISFIED with my {user_selected_idea}. Then, for every point, provide the exact opposite approach as a viable solution or improvement. Structure as: 'Problematic Idea' -> 'Inverted Solution'.`;
        break;
      case 'stepByStep':
        template = `You are building a business idea for {user_selected_idea}. Let's go step-by-step: 1. List 5-10 key aspects of {initial_step_focus}. 2. For each aspect, identify 2-3 associated challenges. 3. For each challenge, brainstorm 1-2 potential solutions or innovations. 4. From these, formulate 5-7 concrete business ideas.`;
        break;
      case 'creativeWords':
        template = `Using words like 'Extremely unique', 'Daringly different', 'Never-before-seen', 'Utterly unexpected', 'Wildly unconventional', 'Absolutely unheard-of', 'Completely out-of-the-box', generate {number_of_ideas} creative ideas about {user_selected_idea}. Each idea should clearly reflect one or more of these creative qualities.`;
        break;
      case 'chainOfDensity':
        template = `You are an expert in creative recursion. For the topic: {user_selected_idea}, generate an initial creative idea. Then, repeat the following 2 steps {number_of_iterations} times:\nStep 1. Identify 1-3 missing or implicit points from the initial output that would make it more dense and creative.\nStep 2. Rewrite a new, improved output of identical length which includes these missing points, making it more detailed and impactful. Focus on generating increasingly creative outputs.`;
        break;
      case 'firstPrinciples':
        template = `Using First Principles thinking, thoroughly analyze the following topic: {user_selected_idea}. Break it down into its fundamental truths or core components, questioning all assumptions. Then, based on these first principles, brainstorm 3-5 innovative solutions or approaches.`;
        break;
      default:
        template = `Provide a structured brainstorming output for {user_selected_idea} in ${outputLanguage}.`;
    }
  }
  const replacements: Record<string, string | number> = {
    user_selected_idea: idea,
    selected_framework: params.selected_framework || 'SCAMPER',
    number_of_dissatisfaction_ideas: params.number_of_dissatisfaction_ideas || 10,
    initial_step_focus: params.initial_step_focus || (lang === 'nl' ? 'de markt' : 'the market'),
    number_of_ideas: params.number_of_ideas || 10,
    number_of_iterations: params.number_of_iterations || 3,
    selected_perspectives: params.selected_perspectives || (lang === 'nl' ? 'een marketingexpert, een salesexpert, een productexpert' : 'A marketing expert, A sales expert, A product expert')
  };
  return template.replace(/\{(\w+)\}/g, (_, k) => String(replacements[k] ?? ''));
}

function parseIdeas(text: string): string[] {
  const normalize = (s: string) => s
    .replace(/^\s*[-*]+\s*/g, '')
    .replace(/^\s*\*\*\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .trim();
  const lines = text.split(/\r?\n/).map(l => normalize(l)).filter(Boolean);
  const ideas: string[] = [];
  for (const l of lines) {
    const m = l.match(/^\**\s*\d+[\.)]?\s*(.+)$/);
    if (m) ideas.push(m[1]);
  }
  if (ideas.length === 0) {
    // Fallback: split on bullets
    const bullets = lines.filter(l => /^[-•]/.test(l)).map(l => l.replace(/^[-•]\s*/, ''));
    ideas.push(...bullets);
  }
  // Ensure transcript option present at index 0
  if (!ideas.find(x => /No specific idea/i.test(x))) {
    ideas.unshift('No specific idea, brainstorm based on transcript');
  }
  // Limit 25
  return ideas.slice(0, 25);
}