import { translations, type Language } from '../locales';
import { setErrorHandlerTranslation } from '../utils/errorHandler';
import { TranslationFunction } from '../../types';

export const useTranslation = (uiLang: Language = 'en') => {
  // Translation function that supports optional fallback string as second argument
  const t: TranslationFunction = (
    key: string,
    fallbackOrParams?: string | Record<string, any>,
    maybeParams?: Record<string, any>
  ): any => {
    const fallback = typeof fallbackOrParams === 'string' ? fallbackOrParams : undefined;
    const params =
      typeof fallbackOrParams === 'object' && fallbackOrParams !== null
        ? (fallbackOrParams as Record<string, any>)
        : typeof maybeParams === 'object' && maybeParams !== null
        ? (maybeParams as Record<string, any>)
        : undefined;

    let str = translations[uiLang]?.[key] ?? translations['en']?.[key] ?? fallback ?? key;

    // Handle returnObjects parameter
    if (params && (params as any).returnObjects === true) {
      return str;
    }

    // Handle string replacements like {name}
    if (params && typeof str === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        str = (str as string).replace(`{${paramKey}}`, String(paramValue));
      });
    }

    return str;
  };

  // Make translation function available to global error handler
  setErrorHandlerTranslation(t);

  return {
    t,
    currentLanguage: uiLang,
    availableLanguages: Object.keys(translations) as Language[]
  };
};