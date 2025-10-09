import React, { useState, useRef } from 'react';

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioImport: (file: File) => Promise<void>;
  t: (key: string) => string;
}

const AudioUploadModal: React.FC<AudioUploadModalProps> = ({
  isOpen,
  onClose,
  onAudioImport,
  t
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ['audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/wav', '.mp3', '.mp4', '.webm', '.wav'];
  const maxFileSize = 100 * 1024 * 1024; // 100MB

  const validateFile = (file: File): string | null => {
    // Check file type
    const isValidType = acceptedTypes.some(type => 
      file.type === type || file.name.toLowerCase().endsWith(type)
    );
    
    if (!isValidType) {
      return t('audioUploadInvalidFormat');
    }

    // Check file size
    if (file.size > maxFileSize) {
      return t('audioUploadTooLarge');
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      await onAudioImport(file);
      onClose();
    } catch (err) {
      setError(t('audioUploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0] instanceof File) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-medium text-gray-800 dark:text-white">
            {t('audioUploadTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            disabled={isUploading}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
            {t('audioUploadDescription')}
          </p>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600'
            } ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-4xl mb-4">🎵</div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {isUploading ? t('audioUploadProcessing') : t('audioUploadDragText')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              MP3, MP4, WebM, WAV (max 100MB)
            </p>
            
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              disabled={isUploading}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition-colors font-medium"
              type="button"
            >
              {isUploading ? t('audioUploadProcessing') : t('audioUploadSelectFile')}
            </button>
            
            {isUploading && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600 mx-auto"></div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.mp4,.webm,.wav,audio/mpeg,audio/mp4,audio/webm,audio/wav"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-6 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-cyan-800 dark:text-cyan-200 mb-2">
              {t('audioUploadHelpTitle')}
            </h3>
            <div className="text-xs text-cyan-700 dark:text-cyan-300 space-y-1">
              <p>• {t('audioUploadHelpStep1')}</p>
              <p>• {t('audioUploadHelpStep2')}</p>
              <p>• {t('audioUploadHelpStep3')}</p>
              <p>• {t('audioUploadHelpStep4')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors disabled:opacity-50"
          >
            {t('cancel', 'Annuleren')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioUploadModal;