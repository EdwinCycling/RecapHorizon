import React, { useRef, useState } from 'react';
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void> | void;
  t: (key: string) => string;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onImport, t }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" type="button" aria-label={t('close')}>
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center ${isDragOver ? 'border-pink-500 bg-pink-50' : 'border-gray-300'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={onChange}
            className="hidden"
            accept="image/*,.jpg,.jpeg,.png,.webp,.gif"
          />
          <div className="flex flex-col items-center">
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600">
              {t('dragImageHere')}
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-500 mb-4 mt-1">
              JPG, JPEG, PNG, WEBP, GIF
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="mt-6 bg-rose-500 text-white px-6 py-2 rounded-md hover:bg-rose-600 disabled:opacity-60"
              type="button"
            >
              {t('sessionOptionImage')}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50">
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;