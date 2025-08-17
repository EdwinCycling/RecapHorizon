import { nl } from './nl';
import { en } from './en';
import { pt } from './pt';
import { de } from './de';
import { fr } from './fr';

export const translations = {
  nl,
  en,
  pt,
  de,
  fr,
};

export type TranslationKey = keyof typeof nl;
export type Language = keyof typeof translations;
