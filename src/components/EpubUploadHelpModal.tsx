import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { TranslationFunction } from '../../types'

interface EpubUploadHelpModalProps {
  isOpen: boolean
  onClose: () => void
  t: TranslationFunction
}

const EpubUploadHelpModal: React.FC<EpubUploadHelpModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[300]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-rose-600 dark:text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-6-6h12" />
            </svg>
            <h3 className="text-xl font-medium text-rose-600 dark:text-rose-400 tracking-tight">{t('epubHelpTitle')}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300">
          <p>{t('sessionOptionAnalyzeEpubDesc')}</p>
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 rounded-lg p-4">
            <p className="text-rose-800 dark:text-rose-200">1️⃣ {t('epubUploadDragText')}</p>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 rounded-lg p-4">
            <p className="text-rose-800 dark:text-rose-200">2️⃣ {t('sessionOptionAnalyzeEpub')}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <p>{t('epubSupportedFormats')}</p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors font-medium">
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EpubUploadHelpModal