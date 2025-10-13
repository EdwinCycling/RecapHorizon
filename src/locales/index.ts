import { nl } from './nl';
import { en } from './en';
import { pt } from './pt';
import { de } from './de';
import { fr } from './fr';
import { es } from './es';

export const translations = {
  nl,
  en,
  pt,
  de,
  fr,
  es,
};

export type TranslationKey = keyof typeof nl;
export type Language = keyof typeof translations;
