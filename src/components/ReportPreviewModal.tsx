import React, { useCallback, useMemo, useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, DocumentTextIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { TranslationFunction } from '../../types';
import { markdownToPlainText } from '../utils/textUtils';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportText: string; // May contain markdown; we will render without markdown markers
  t: TranslationFunction;
  onSendToTranscript: () => void;
}

const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  reportText,
  t,
  onSendToTranscript,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const plainText = useMemo(() => markdownToPlainText(reportText || ''), [reportText]);

  const handleDownloadTxt = useCallback(() => {
    if (!plainText) return;
    const crlf = plainText.replace(/\r?\n/g, '\r\n');
    const blob = new Blob([crlf], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'idea_report.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [plainText]);

  const handleExportPdf = useCallback(async () => {
    if (!plainText) return;
    try {
      setIsExportingPdf(true);
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      // Try Unicode font if available
      try {
        const { tryUseUnicodeFont } = await import('../utils/pdfFont');
        tryUseUnicodeFont(doc);
      } catch {}
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;
      doc.setFont(doc.getFont().fontName || 'helvetica', 'normal');
      doc.setFontSize(11);

      const lines = plainText.split(/\r?\n/);
      const addPageIfNeeded = (h: number) => {
        if (y + h > pageHeight - margin) { doc.addPage(); y = margin; }
      };
      lines.forEach((ln) => {
        const line = ln.trimEnd();
        if (!line) { y += 8; return; }
        const ul = line.match(/^\s*•\s+(.*)$/);
        const ol = line.match(/^\s*(\d{1,3})\.\s+(.*)$/);
        if (ul) {
          const text = ul[1];
          const indent = 20;
          const wrapped = doc.splitTextToSize(text, contentWidth - indent) as string[];
          addPageIfNeeded(16 * wrapped.length);
          doc.text('•', margin + 6, y);
          wrapped.forEach(w => { doc.text(w, margin + indent, y); y += 16; });
          y += 2;
          return;
        }
        if (ol) {
          const num = ol[1];
          const text = ol[2];
          const indent = 20;
          const wrapped = doc.splitTextToSize(`${num}. ${text}`, contentWidth - indent) as string[];
          addPageIfNeeded(16 * wrapped.length);
          wrapped.forEach(w => { doc.text(w, margin + indent, y); y += 16; });
          y += 2;
          return;
        }
        const wrapped = doc.splitTextToSize(line, contentWidth) as string[];
        addPageIfNeeded(16 * wrapped.length);
        wrapped.forEach(w => { doc.text(w, margin, y); y += 16; });
        y += 2;
      });

      doc.save('idea_report.pdf');
    } finally {
      setIsExportingPdf(false);
    }
  }, [plainText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-5xl w-full m-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-slate-700 dark:to-slate-600">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <h3 className="text-xl font-medium text-amber-700 dark:text-amber-300 tracking-tight">{t('ideaBuilderReportPreview', 'Rapport Voorbeeld')}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-6 shadow-sm">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {/* We render plain text without markdown markers, preserving structure */}
              <pre className="text-slate-800 dark:text-slate-100 whitespace-pre-wrap font-sans text-base leading-relaxed">
                {plainText || t('noContent', 'Geen inhoud')}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
          <div className="flex gap-3">
            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              {t('downloadTxt', 'Download TXT')}
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-md transition-colors ${isExportingPdf ? 'bg-amber-300 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'}`}
            >
              <DocumentTextIcon className="w-4 h-4" />
              {isExportingPdf ? t('exportingPdf', 'PDF genereren...') : t('makePdf', 'Maak PDF')}
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md"
            >
              {t('cancel', 'Annuleren')}
            </button>
            <button
              onClick={onSendToTranscript}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              {t('sendToTranscript', 'Naar transcript')}
            </button>
          </div>
        </div>
      </div>

      {/* Optional small overlay when exporting */}
      {isExportingPdf && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
        </div>
      )}
    </div>
  );
};

export default ReportPreviewModal;