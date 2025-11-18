import React from 'react';
import { PbiTone, TranslationFunction } from '../../types';

interface PbiToneSelectorProps {
  t: TranslationFunction;
  value: PbiTone;
  onChange: (tone: PbiTone) => void;
}

const PbiToneSelector: React.FC<PbiToneSelectorProps> = ({ t, value, onChange }) => {
  const options: { id: PbiTone; name: string; desc: string }[] = [
    { id: 'formeel_zakelijk', name: t('agilePbi.tone.formeelZakelijk'), desc: t('agilePbi.tone.formeelZakelijkDesc') },
    { id: 'praktisch_direct', name: t('agilePbi.tone.praktischDirect'), desc: t('agilePbi.tone.praktischDirectDesc') },
    { id: 'klantgericht_empathisch', name: t('agilePbi.tone.klantgerichtEmpathisch'), desc: t('agilePbi.tone.klantgerichtEmpathischDesc') },
    { id: 'technisch_gedetailleerd', name: t('agilePbi.tone.technischGedetailleerd'), desc: t('agilePbi.tone.technischGedetailleerdDesc') },
    { id: 'motiverend_visionair', name: t('agilePbi.tone.motiverendVisionair'), desc: t('agilePbi.tone.motiverendVisionairDesc') },
    { id: 'synthetisch_kort_bondig', name: t('agilePbi.tone.synthetischKortBondig'), desc: t('agilePbi.tone.synthetischKortBondigDesc') },
    { id: 'informeel_vriendelijk', name: t('agilePbi.tone.informeelVriendelijk'), desc: t('agilePbi.tone.informeelVriendelijkDesc') }
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

export default PbiToneSelector;