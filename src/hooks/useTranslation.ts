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

    // Function to get nested value using dot notation
    const getNestedValue = (obj: any, path: string): any => {
      if (obj == null) return undefined;

      // 1) Try direct key lookup (supports flat keys with dots like "aiDiscussion.selectTopic")
      if (Object.prototype.hasOwnProperty.call(obj, path)) {
        return obj[path];
      }

      // 2) Fallback to nested lookup for objects structured as { aiDiscussion: { selectTopic: "..." } }
      return path.split('.').reduce((current, property) => current?.[property], obj);
    };

    let str = getNestedValue(translations[uiLang], key) ?? getNestedValue(translations['en'], key) ?? fallback;

    // Handle returnObjects parameter
    if (params && (params as any).returnObjects === true) {
      if (typeof str === 'object' && str !== null) {
        return str;
      }
      // If not an object, maybe it's a prefix for other keys
      const prefixedKeys = Object.keys(translations[uiLang]).filter(k => k.startsWith(key + '.'));
      if (prefixedKeys.length > 0) {
        const obj: Record<string, any> = {};
        prefixedKeys.forEach(k => {
          const subKey = k.substring(key.length + 1);
          // This is a simplified version, doesn't create nested objects
          obj[subKey] = (translations as any)[uiLang][k];
        });
        return obj;
      }
    }

    if (str === undefined) {
      str = fallback || key;
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