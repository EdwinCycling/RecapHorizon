import React, { useRef, useState, useEffect } from 'react';
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { TranslationFunction } from '../../types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void> | void;
  t: TranslationFunction;
  // Optional accept attribute for the input element
  accept?: string;
  helperText?: string;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onImport, t, accept, helperText }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent background scrolling when busy
  useEffect(() => {
    if (busy) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [busy]);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    try {
      setBusy(true);
      setError(null);
      await onImport(file);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Upload mislukt.');
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200" type="button" aria-label={t('close')}>
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center ${isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-slate-600'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={onChange}
            className="hidden"
            accept={accept}
          />
          <div className="flex flex-col items-center">
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 dark:text-slate-400" />
            <p className="mt-4 text-gray-600 dark:text-slate-300">
              {t('dragFileHere')}
            </p>
            <div className="text-xs text-gray-500 dark:text-slate-400 mb-4 mt-1">
              {helperText || 'TXT, PDF, RTF, HTML, MD, DOCX'}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-60"
              type="button"
            >
              {t('uploadFile')}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;