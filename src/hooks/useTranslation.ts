import { translations, type Language } from '../locales';

export const useTranslation = (uiLang: Language = 'en') => {
  // Translation function that matches the existing App.tsx logic
  const t = (key: string, params?: Record<string, string | number | boolean>): any => {
    let str = translations[uiLang]?.[key] || translations['en']?.[key] || key;
    
    // Handle returnObjects parameter
    if (params && params.returnObjects === true) {
      return str;
    }
    
    // Handle string replacements
     if (params && typeof str === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        str = str.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    return str;
  };

  return {
    t,
    currentLanguage: uiLang,
    availableLanguages: Object.keys(translations) as Language[]
  };
};