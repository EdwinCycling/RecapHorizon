import React from 'react';
import { PbiApproach, TranslationFunction } from '../../types';

interface PbiApproachSelectorProps {
  t: TranslationFunction;
  value: PbiApproach;
  onChange: (approach: PbiApproach) => void;
}

const PbiApproachSelector: React.FC<PbiApproachSelectorProps> = ({ t, value, onChange }) => {
  const options: { id: PbiApproach; name: string; desc: string }[] = [
    { id: 'frameworks', name: t('agilePbi.approach.frameworks'), desc: t('agilePbi.approach.frameworksDesc') },
    { id: 'different_perspectives', name: t('agilePbi.approach.differentPerspectives'), desc: t('agilePbi.approach.differentPerspectivesDesc') },
    { id: 'step_by_step', name: t('agilePbi.approach.stepByStep'), desc: t('agilePbi.approach.stepByStepDesc') },
    { id: 'creative_words', name: t('agilePbi.approach.creativeWords'), desc: t('agilePbi.approach.creativeWordsDesc') },
    { id: 'chain_of_density', name: t('agilePbi.approach.chainOfDensity'), desc: t('agilePbi.approach.chainOfDensityDesc') },
    { id: 'first_principles', name: t('agilePbi.approach.firstPrinciples'), desc: t('agilePbi.approach.firstPrinciplesDesc') }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`text-left p-4 rounded-lg border ${value === opt.id ? 'border-cyan-500 bg-cyan-50 dark:bg-slate-700/40' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'} transition-colors`}
        >
          <div className="font-medium text-slate-900 dark:text-slate-100">{opt.name}</div>
          <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{opt.desc}</div>
        </button>
      ))}
    </div>
  );
};

export default PbiApproachSelector;