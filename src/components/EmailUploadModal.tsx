import React, { useRef, useState, useEffect } from 'react';
import { XMarkIcon, EnvelopeIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { TranslationFunction } from '../../types';

interface EmailUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailImport: (file: File) => Promise<string | null>;
  onAnalyze: (text: string) => void;
  t: TranslationFunction;
  userSubscription: string | undefined;
}

type AnalysisState = 'idle' | 'analyzing';

const EmailUploadModal: React.FC<EmailUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onEmailImport,
  onAnalyze,
  t,
  userSubscription, 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Prevent background scrolling when analyzing
  useEffect(() => {
    if (analysisState === 'analyzing') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [analysisState]);

  if (!isOpen) return null;

  const resetState = () => {
    setAnalysisState('idle');
    setError(null);
  };

  const handleFile = async (file: File) => {
    // Check subscription tier first
    const allowedTiers = ['gold', 'enterprise', 'diamond'];
    if (!userSubscription || !allowedTiers.includes(userSubscription.toLowerCase())) {
      setError(t('emailUploadSubscriptionRequired'));
      return;
    }
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isEmailFile = fileExtension === 'eml' || 
                       fileExtension === 'msg' || 
                       file.type === 'message/rfc822' ||
                       file.name.includes('outlook-email');
    
    if (!isEmailFile) {
      setError(t('invalidEmailFileType'));
      return;
    }
    
    // MSG files are now supported for processing

    setAnalysisState('analyzing');
    setError(null);

    const extractedText = await onEmailImport(file);

    if (extractedText) {
      // Directly start analysis without preview
      onAnalyze(extractedText);
      // Close modal after starting analysis
      onClose();
    } else {
      setError(t('emailExtractionFailed'));
      setAnalysisState('idle');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    const items = e.dataTransfer.items;
    
    // Handle file drops
    if (files.length > 0) {
      const file = files[0];
      // Check if it's an email file by content type or extension
      if (file.type === 'message/rfc822' || 
          file.name.toLowerCase().endsWith('.eml') ||
          file.name.toLowerCase().endsWith('.msg')) {
        handleFile(file);
        return;
      }
    }
    
    // Handle Outlook-specific drag data (when dragging email directly from Outlook)
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type === 'text/plain' || item.type === 'text/html') {
          item.getAsString((data) => {
            // Check if the data looks like email content
            if (data.includes('From:') || data.includes('Subject:') || data.includes('Date:') || 
                data.includes('To:') || data.includes('Sent:') || data.includes('Message-ID:')) {
              // Create a virtual file from the email content
              const blob = new Blob([data], { type: 'text/plain' });
              const virtualFile = new File([blob], 'outlook-email.eml', { type: 'message/rfc822' });
              handleFile(virtualFile);
              return;
            }
          });
          break;
        }
      }
    }
    
    // If no valid email data found, show error
    setError(t('invalidEmailFileType'));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };



  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200" type="button" aria-label={t('close')}>
          <XMarkIcon className="h-6 w-6" />
        </button>

        {analysisState === 'idle' && (
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center ${isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-slate-600'}`}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".eml,.msg"
              id="email-file-input"
              name="emailFile"
              aria-label={t('emailUploadAriaLabel')}
              aria-describedby="email-file-input-description"
            />
            <span id="email-file-input-description" className="sr-only">
              {t('emailUploadScreenReaderDescription')}
            </span>
            <div className="flex flex-col items-center">
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 dark:text-slate-400" />
              <label htmlFor="email-file-input" className="mt-4 text-gray-500 dark:text-slate-400 cursor-pointer">{t('emailImportDragDropText')}</label>
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                {t('emailImportSupportedFormats')}
              </div>
              <button onClick={handleFileSelect} className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600" type="button" aria-describedby="email-file-input-description">
                {t('emailImportSelectFile')}
              </button>
            </div>
          </div>
        )}

        {analysisState === 'analyzing' && (
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-lg font-medium">{t('analyzingEmail')}</p>
            <p className="text-gray-500 dark:text-slate-400">{t('processingMsgFile')}</p>
          </div>
        )}



        {error && (
           <div className="text-center">
             <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
               <p className="text-sm text-red-600 dark:text-red-400">{t(error)}</p>
             </div>
             <button onClick={resetState} className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600" type="button">
                {t('tryAgain')}
              </button>
           </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" type="button">
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailUploadModal;