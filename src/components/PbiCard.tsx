import React from 'react';
import { PbiItem, TranslationFunction } from '../../types';
import { copyToClipboard } from '../utils/clipboard';

interface PbiCardProps {
  t: TranslationFunction;
  item: PbiItem;
  onMoveToTranscript?: (content: string) => void;
}

function toUserStory(item: PbiItem): string {
  return `Als een ${item.userType}, wil ik ${item.goal}, zodat ${item.value}.`;
}

const PbiCard: React.FC<PbiCardProps> = ({ t, item, onMoveToTranscript }) => {
  const userStory = toUserStory(item);
  const acc = Array.isArray(item.acceptanceCriteria) ? item.acceptanceCriteria : [];
  const notes: string[] = [];
  if (item.notes?.businessValue) notes.push(`${t('agilePbi.card.businessValue')}: ${item.notes.businessValue}`);
  if (item.notes?.technicalConsiderations) notes.push(`${t('agilePbi.card.technicalConsiderations')}: ${item.notes.technicalConsiderations}`);
  if (item.notes?.fundamentalReason) notes.push(`${t('agilePbi.card.fundamentalReason')}: ${item.notes.fundamentalReason}`);
  if (item.notes?.innovativeIdea) notes.push(t('agilePbi.card.innovativeIdea'));

  const fullText = [userStory, ...(acc.length ? [t('agilePbi.card.acceptanceCriteria') + ':', ...acc.map(a => `- ${a}`)] : []), ...(notes.length ? [t('agilePbi.card.notes') + ':', ...notes] : [])].join('\n');

  return (
    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
      <div className="font-semibold text-slate-900 dark:text-slate-100">{userStory}</div>
      {acc.length > 0 && (
        <div className="mt-3">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('agilePbi.card.acceptanceCriteria')}</div>
          <ul className="mt-1 list-disc list-inside text-sm text-slate-700 dark:text-slate-300">
            {acc.map((a, i) => (<li key={i}>{a}</li>))}
          </ul>
        </div>
      )}
      {notes.length > 0 && (
        <div className="mt-3">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('agilePbi.card.notes')}</div>
          <ul className="mt-1 list-disc list-inside text-sm text-slate-700 dark:text-slate-300">
            {notes.map((n, i) => (<li key={i}>{n}</li>))}
          </ul>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => copyToClipboard(fullText)}
          className="px-3 py-2 text-sm font-medium rounded-md text-white bg-cyan-500 hover:bg-cyan-600"
        >
          {t('copy')}
        </button>
        {onMoveToTranscript && (
          <button
            onClick={() => onMoveToTranscript(fullText)}
            className="px-3 py-2 text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800"
          >
            {t('agilePbi.moveToTranscript')}
          </button>
        )}
      </div>
    </div>
  );
};

export default PbiCard;