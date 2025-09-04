import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  id: string;
  name: string;
}

interface ExpertDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: DropdownOption[];
  className?: string;
}

const ExpertDropdown: React.FC<ExpertDropdownProps> = ({
  value,
  onChange,
  placeholder,
  options,
  className = ''
}) => {
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

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const searchLower = searchTerm.toLowerCase();
    return (
      option.name.toLowerCase().includes(searchLower) ||
      option.id.toLowerCase().includes(searchLower)
    );
  });

  const selectedOption = options.find(option => option.id === value);
  const displayValue = selectedOption ? selectedOption.name : '';

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 text-slate-800 dark:text-slate-100 border-2 border-cyan-200 dark:border-cyan-600 focus:border-cyan-400 dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-200 hover:shadow-lg hover:scale-105 font-medium text-left flex items-center justify-between"
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
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border-2 border-cyan-200 dark:border-cyan-600 rounded-xl shadow-xl max-h-80 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-cyan-100 dark:border-cyan-700">
            <input
              type="text"
              placeholder="Zoek..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 border border-cyan-200 dark:border-cyan-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400 dark:focus:border-cyan-400 text-slate-800 dark:text-slate-100"
              autoFocus
            />
          </div>

          {/* Options list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                Geen opties gevonden
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors duration-150 ${
                    value === option.id
                      ? 'bg-cyan-100 dark:bg-cyan-800/30 text-cyan-800 dark:text-cyan-200'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {option.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {option.id}
                      </div>
                    </div>
                    {value === option.id && (
                      <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
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
  );
};

export default ExpertDropdown;