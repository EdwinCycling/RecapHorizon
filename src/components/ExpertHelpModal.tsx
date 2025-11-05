import React from 'react';
import Modal from './Modal';
import { TranslationFunction } from '../../types';

interface ExpertHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationFunction;
}

export default function ExpertHelpModal({ isOpen, onClose, t }: ExpertHelpModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('expertHelpTitle')}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
        <p>{t('expertHelpIntro')}</p>
        
        <h3 className="font-medium text-slate-900 dark:text-slate-100">
          {t('expertHelpHowItWorks')}
        </h3>
        <ol className="list-decimal list-inside space-y-2 pl-4">
          <li>{t('expertHelpStep1')}</li>
          <li>{t('expertHelpStep2')}</li>
          <li>{t('expertHelpStep3')}</li>
        </ol>

        <h3 className="font-medium text-slate-900 dark:text-slate-100">
          {t('expertHelpTips')}
        </h3>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>{t('expertHelpTip1')}</li>
          <li>{t('expertHelpTip2')}</li>
          <li>{t('expertHelpTip3')}</li>
          <li>{t('expertHelpTip4')}</li>
        </ul>

        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          {t('expertHelpAvailability')}
        </h3>
        <p>{t('expertHelpAvailabilityText')}</p>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors"
          >
            {t('expertHelpClose')}
          </button>
        </div>
      </div>
    </Modal>
  );
}