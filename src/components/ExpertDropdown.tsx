import React, { useState, useRef, useEffect } from 'react';
import { ExpertTopic, ExpertRole, ExpertBranche } from '../../types';

type ExpertOption = ExpertTopic | ExpertRole | ExpertBranche;

interface ExpertDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: ExpertOption[];
  className?: string;
  label: string;
  colorScheme: 'blue' | 'green' | 'purple';
  t: any;
}

const ExpertDropdown: React.FC<ExpertDropdownProps> = ({
  value,
  onChange,
  placeholder,
  options,
  className = '',
  label,
  colorScheme,
  t
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
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

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const searchLower = searchTerm.toLowerCase();
    return (
      option.name.toLowerCase().includes(searchLower) ||
      (option.description && option.description.toLowerCase().includes(searchLower))
    );
  });

  const selectedOption = options.find(option => option.id === value);
  const displayValue = selectedOption ? selectedOption.name : '';

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggleDropdown = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 320; // max-h-80 = 320px
      
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
    setIsOpen(!isOpen);
  };

  // Color scheme configurations
  const colorConfig = {
    blue: {
      border: 'border-blue-200 dark:border-blue-700',
      bg: 'bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800',
      focus: 'focus:ring-blue-500 focus:border-blue-500',
      dropdownBorder: 'border-blue-200 dark:border-blue-600',
      searchBorder: 'border-blue-200 dark:border-blue-600 focus:border-blue-400 dark:focus:border-blue-400',
      hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      selectedBg: 'bg-blue-100 dark:bg-blue-800/30',
      selectedText: 'text-blue-800 dark:text-blue-200',
      descriptionBg: 'bg-blue-50 dark:bg-blue-900/20',
      descriptionBorder: 'border-blue-200 dark:border-blue-700',
      descriptionText: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      border: 'border-green-200 dark:border-green-700',
      bg: 'bg-gradient-to-b from-green-50 to-white dark:from-green-900/20 dark:to-slate-800',
      focus: 'focus:ring-green-500 focus:border-green-500',
      dropdownBorder: 'border-green-200 dark:border-green-600',
      searchBorder: 'border-green-200 dark:border-green-600 focus:border-green-400 dark:focus:border-green-400',
      hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/20',
      selectedBg: 'bg-green-100 dark:bg-green-800/30',
      selectedText: 'text-green-800 dark:text-green-200',
      descriptionBg: 'bg-green-50 dark:bg-green-900/20',
      descriptionBorder: 'border-green-200 dark:border-green-700',
      descriptionText: 'text-green-600 dark:text-green-400'
    },
    purple: {
      border: 'border-purple-200 dark:border-purple-700',
      bg: 'bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-800',
      focus: 'focus:ring-purple-500 focus:border-purple-500',
      dropdownBorder: 'border-purple-200 dark:border-purple-600',
      searchBorder: 'border-purple-200 dark:border-purple-600 focus:border-purple-400 dark:focus:border-purple-400',
      hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
      selectedBg: 'bg-purple-100 dark:bg-purple-800/30',
      selectedText: 'text-purple-800 dark:text-purple-200',
      descriptionBg: 'bg-purple-50 dark:bg-purple-900/20',
      descriptionBorder: 'border-purple-200 dark:border-purple-700',
      descriptionText: 'text-purple-600 dark:text-purple-400'
    }
  };

  const colors = colorConfig[colorScheme];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>
      
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleToggleDropdown}
          className={`w-full p-3 border-2 ${colors.border} rounded-lg ${colors.bg} text-slate-900 dark:text-slate-100 ${colors.focus} focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-left flex items-center justify-between`}
        >
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
        </button>

        {isOpen && (
          <div className={`absolute z-[10000] w-full bg-white dark:bg-slate-800 border-2 ${colors.dropdownBorder} rounded-xl shadow-2xl max-h-80 overflow-hidden ${
             dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
           }`} style={{zIndex: 10000}}>
            {/* Search input */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border ${colors.searchBorder} rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 text-slate-800 dark:text-slate-100`}
                autoFocus
              />
            </div>

            {/* Options list */}
            <div className="max-h-64 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                  {t('noOptionsFound')}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={`w-full px-4 py-3 text-left ${colors.hoverBg} transition-colors duration-150 ${
                      value === option.id
                        ? `${colors.selectedBg} ${colors.selectedText}`
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">
                          {option.name}
                        </div>
                        {option.description && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {option.description}
                          </div>
                        )}
                      </div>
                      {value === option.id && (
                        <svg className="w-5 h-5 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Selected option description */}
      {selectedOption && selectedOption.description && (
        <p className={`mt-2 text-sm ${colors.descriptionText} ${colors.descriptionBg} p-2 rounded-lg border ${colors.descriptionBorder}`}>
          {selectedOption.description}
        </p>
      )}
    </div>
  );
};

export default ExpertDropdown;