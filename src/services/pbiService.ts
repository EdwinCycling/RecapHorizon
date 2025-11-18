import { PbiItem, PbiTone, PbiApproach, PbiGenerationOptions, SubscriptionTier } from '../../types';
import { AIProviderManager, AIFunction } from '../utils/aiProviderManager';

function normalizeTranscript(input: string): string {
  const s = String(input || '').trim();
  return s.length > 0 ? s : '';
}

function getToneInstruction(tone: PbiTone): string {
  switch (tone) {
    case 'formeel_zakelijk': return 'Gebruik een formele, zakelijke en feitelijke tone of voice.';
    case 'praktisch_direct': return 'Gebruik een praktische en directe tone of voice, gericht op de benodigde functionaliteit.';
    case 'klantgericht_empathisch': return 'Formuleer klantgericht en empathisch, met de gebruikerservaring centraal.';
    case 'technisch_gedetailleerd': return 'Gebruik een technisch gedetailleerde tone of voice met relevante technische overwegingen.';
    case 'motiverend_visionair': return 'Gebruik een motiverende en visionaire tone of voice die de bredere impact benadrukt.';
    case 'synthetisch_kort_bondig': return 'Formuleer zeer kort en bondig met focus op trefwoorden en de essentie.';
    case 'informeel_vriendelijk': return 'Gebruik een informele en vriendelijke tone of voice, alsof je direct met het team praat.';
    default: return '';
  }
}

function buildBasePrompt(transcript: string, tone: PbiTone, options?: PbiGenerationOptions): string {
  const toneText = getToneInstruction(tone);
  const includeAcc = options?.includeAcceptanceCriteria ? 'Voeg waar mogelijk acceptance criteria (bulletpoints) toe.' : '';
  return [
    'Analyseer het transcript en genereer een professioneel PBI-rapport in platte tekst.',
    'Per item: titel, User Story (Als een ..., wil ik ..., zodat ...), waarde, acceptance criteria (indien beschikbaar), notities (business/technisch).',
    'Label elk item als: "PBI {nummer}: {titel}" en scheid items met een lege regel.',
    'Geen JSON, geen code, uitsluitend nette rapportopmaak.',
    toneText,
    includeAcc,
    '',
    transcript
  ].join('\n');
}

function buildApproachAddon(approach: PbiApproach): string {
  switch (approach) {
    case 'frameworks':
      return "Gebruik het User Story-formaat: 'Als een [type gebruiker], wil ik [doel], zodat [waarde]'. Lever 5–12 specifieke, actiegerichte PBI\'s.";
    case 'different_perspectives':
      return 'Voeg per PBI korte notities toe over bedrijfswaarde en technische overwegingen.';
    case 'step_by_step':
      return 'Identificeer eerst expliciete en impliciete behoeften en zet deze om naar PBI\'s in User Story-formaat.';
    case 'creative_words':
      return 'Genereer 5–7 kern-PBI\'s plus 3 extra gelabeld als Innovatief idee.';
    case 'chain_of_density':
      return 'Maak PBI\'s specifiek en meetbaar; verbeter ze iteratief tot heldere, compacte items.';
    case 'first_principles':
      return 'Formuleer PBI\'s die de fundamentele behoeften adresseren en geef per PBI een korte onderbouwing.';
    default:
      return '';
  }
}

export function buildPbiPrompt(
  transcript: string,
  tone: PbiTone,
  approach: PbiApproach,
  options?: PbiGenerationOptions
): string {
  const normalized = normalizeTranscript(transcript);
  const base = buildBasePrompt(normalized, tone, options);
  const addon = buildApproachAddon(approach);
  const limit = options?.maxItems && options.maxItems > 0 ? `Beperk tot maximaal ${options.maxItems} items.` : '';
  return [base, addon, limit].filter(Boolean).join('\n');
}

function safeParseArray(content: string): PbiItem[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed as PbiItem[];
  } catch {}
  const raw = String(content || '').trim();
  if (!raw) return [];
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    const slice = raw.slice(start, end + 1);
    try {
      const parsed = JSON.parse(slice);
      if (Array.isArray(parsed)) return parsed as PbiItem[];
    } catch {}
  }
  return [];
}

export async function generatePBIs(
  transcript: string,
  tone: PbiTone,
  approach: PbiApproach,
  options: PbiGenerationOptions | undefined,
  userId: string,
  userTier: SubscriptionTier
): Promise<PbiItem[]> {
  const prompt = buildPbiPrompt(transcript, tone, approach, options);
  const response = await AIProviderManager.generateContentWithProviderSelection(
    { userId, functionType: AIFunction.ANALYSIS_GENERATION, userTier },
    prompt,
    false
  );
  const items = safeParseArray(response.content);
  if (!items || items.length === 0) {
    throw new Error('Geen gestructureerde JSON-output; gebruik generatePBIReport voor tekstueel rapport.');
  }
  return items;
}

export async function generatePBIReport(
  transcript: string,
  tone: PbiTone,
  approach: PbiApproach,
  options: PbiGenerationOptions | undefined,
  userId: string,
  userTier: SubscriptionTier
): Promise<string> {
  const prompt = buildPbiPrompt(transcript, tone, approach, options);
  const response = await AIProviderManager.generateContentWithProviderSelection(
    { userId, functionType: AIFunction.ANALYSIS_GENERATION, userTier },
    prompt,
    false
  );
  return String(response.content || '').trim();
}

export function refinePBIs(items: PbiItem[], method: 'chain_of_density' | 'step_by_step'): PbiItem[] {
  if (!Array.isArray(items) || items.length === 0) return items;
  return items.map(i => ({
    ...i,
    goal: i.goal.trim(),
    value: i.value.trim(),
    acceptanceCriteria: Array.isArray(i.acceptanceCriteria) ? i.acceptanceCriteria.map(a => String(a).trim()).filter(Boolean) : undefined
  }));
}