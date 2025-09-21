import React, { useState, useRef, useEffect } from 'react';
import { supportedLanguages, getLanguageName, type LanguageOption, getFlagEmoji } from '../languages';
import { useTranslation } from '../hooks/useTranslation';

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  appLanguage: string;
  className?: string;
  // Optional: limit to a subset of languages (e.g., header UI languages)
  allowedUiCodes?: string[];
  // Optional: hide the search input (e.g., header compact variant)
  hideSearch?: boolean;
  // Optional: show only flags instead of text in button and list
  flagsOnly?: boolean;
  // Optional: compact header style
  variant?: 'default' | 'header';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  placeholder,
  appLanguage,
  className = '',
  allowedUiCodes,
  hideSearch = false,
  flagsOnly = false,
  variant = 'default'
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine the base list of languages
  const baseList = (allowedUiCodes && allowedUiCodes.length > 0)
    ? supportedLanguages.filter((lang) => allowedUiCodes.includes(lang.ui_code))
    : supportedLanguages;

  // Filter languages based on search term
  const filteredLanguages = baseList.filter(lang => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lang.name_nl.toLowerCase().includes(searchLower) ||
      lang.name_en.toLowerCase().includes(searchLower) ||
      lang.ui_code.toLowerCase().includes(searchLower)
    );
  });

  const selectedLanguage = baseList.find(lang => lang.ui_code === value);
  const displayValue = selectedLanguage ? getLanguageName(value, appLanguage) : '';

  const handleSelect = (langCode: string) => {
    onChange(langCode);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={value ? `Change language: ${displayValue}` : 'Choose language'}
        className={
          variant === 'header' || flagsOnly
            ? 'flex items-center justify-center h-9 w-9 bg-gray-200 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-opacity-80'
            : 'w-full px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 text-slate-800 dark:text-slate-100 border-2 border-cyan-200 dark:border-cyan-600 focus:border-cyan-400 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200 hover:shadow-lg hover:scale-105 font-medium text-left flex items-center justify-between'
        }
      >
        {flagsOnly || variant === 'header' ? (
          <span className="text-xl leading-none select-none">{value ? getFlagEmoji(value) : '🌐'}</span>
        ) : (
          <>
            <span className={value ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}>
              {value ? displayValue : placeholder}
            </span>
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <div className={`absolute z-50 ${variant === 'header' || flagsOnly ? 'w-36' : 'w-full'} mt-2 bg-white dark:bg-slate-800 border-2 border-cyan-200 dark:border-cyan-600 rounded-xl shadow-xl max-h-80 overflow-hidden`}>
          {/* Search input (optional) */}
          {!hideSearch && (
            <div className="p-3 border-b border-cyan-100 dark:border-cyan-700">
              <input
                type="text"
                placeholder={t('searchLanguage')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-cyan-200 dark:border-cyan-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400 dark:focus:border-cyan-400 text-slate-800 dark:text-slate-100"
                autoFocus
              />
            </div>
          )}

          {/* Language list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredLanguages.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
{t('noLanguagesFound')}
              </div>
            ) : (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.ui_code}
                  onClick={() => handleSelect(lang.ui_code)}
                  aria-label={`Select ${getLanguageName(lang.ui_code, appLanguage)}`}
                  className={
                    flagsOnly || variant === 'header'
                      ? `w-full px-3 py-2 text-left hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors duration-150 flex items-center justify-center ${
                          value === lang.ui_code
                            ? 'bg-cyan-100 dark:bg-cyan-800/30 text-cyan-800 dark:text-cyan-200'
                            : 'text-slate-700 dark:text-slate-300'
                        }`
                      : `w-full px-4 py-3 text-left hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors duration-150 ${
                          value === lang.ui_code
                            ? 'bg-cyan-100 dark:bg-cyan-800/30 text-cyan-800 dark:text-cyan-200'
                            : 'text-slate-700 dark:text-slate-300'
                        }`
                  }
                >
                  {flagsOnly || variant === 'header' ? (
                    <span title={getLanguageName(lang.ui_code, appLanguage)} className="text-2xl leading-none select-none">{getFlagEmoji(lang.ui_code)}</span>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {getLanguageName(lang.ui_code, appLanguage)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {lang.ui_code.toUpperCase()} • {lang.bcp47_code}
                        </div>
                      </div>
                      {value === lang.ui_code && (
                        <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
