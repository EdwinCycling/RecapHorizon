import React, { useState } from 'react';
import { XMarkIcon, EnvelopeIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { copyToClipboard, displayToast } from '../utils/clipboard';
import { TranslationFunction } from '../../types';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailSubject: string;
  emailAddresses: Array<{ address: string; type: 'to' | 'cc' | 'bcc' | 'na' }>;
  emailContent: string;
  t: TranslationFunction;
}

const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  emailSubject,
  emailAddresses,
  emailContent,
  t
}) => {
  if (!isOpen) return null;

  const toEmails = emailAddresses.filter(e => e.type === 'to').map(e => e.address);
  const ccEmails = emailAddresses.filter(e => e.type === 'cc').map(e => e.address);
  const bccEmails = emailAddresses.filter(e => e.type === 'bcc').map(e => e.address);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-4xl w-full m-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-600">
          <div className="flex items-center gap-3">
            <EnvelopeIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400 tracking-tight">{t('emailPreview')}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Email Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Email Header */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6 border border-gray-200 dark:border-slate-600">
            <div className="space-y-3">
              {/* Subject */}
              <div className="flex items-start gap-3">
                <span className="font-medium text-slate-700 dark:text-slate-300 min-w-[80px]">{t('subject')}:</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {emailSubject || t('noSubject')}
                </span>
              </div>
              
              {/* To */}
              {toEmails.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="font-medium text-slate-700 dark:text-slate-300 min-w-[80px]">{t('to')}:</span>
                  <div className="flex flex-wrap gap-1">
                    {toEmails.map((email, index) => (
                      <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* CC */}
              {ccEmails.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="font-medium text-slate-700 dark:text-slate-300 min-w-[80px]">{t('cc')}:</span>
                  <div className="flex flex-wrap gap-1">
                    {ccEmails.map((email, index) => (
                      <span key={index} className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded text-sm">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* BCC */}
              {bccEmails.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="font-medium text-slate-700 dark:text-slate-300 min-w-[80px]">{t('bcc')}:</span>
                  <div className="flex flex-wrap gap-1">
                    {bccEmails.map((email, index) => (
                      <span key={index} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-sm">
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Email Body */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-6 shadow-sm">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <pre className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">
                {emailContent || t('noContent')}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
          <div className="flex gap-3">
            <CopyButton
              text={emailContent}
              label={t('copyEmailBody')}
              t={t}
            />
            <MailtoButton
              toEmails={toEmails}
              ccEmails={ccEmails}
              bccEmails={bccEmails}
              subject={emailSubject}
              body={emailContent}
              label={t('openInEmailClient')}
              t={t}
            />
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Copy Button Component
interface CopyButtonProps {
  text: string;
  label: string;
  t: TranslationFunction;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text, label, t }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(text);
      setCopied(true);
      displayToast(t('copiedToClipboard'), 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      displayToast(t('copyFailed'), 'error');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
    >
      {copied ? (
        <CheckIcon className="w-4 h-4" />
      ) : (
        <ClipboardIcon className="w-4 h-4" />
      )}
      {copied ? t('copied') : label}
    </button>
  );
};

// Mailto Button Component
interface MailtoButtonProps {
  toEmails: string[];
  ccEmails: string[];
  bccEmails: string[];
  subject: string;
  body: string;
  label: string;
  t: TranslationFunction;
}

const MailtoButton: React.FC<MailtoButtonProps> = ({ 
  toEmails, 
  ccEmails, 
  bccEmails, 
  subject, 
  body, 
  label, 
  t 
}) => {
  const [showInstructions, setShowInstructions] = useState(false);

  const generateMailtoLink = () => {
    const params: string[] = [];
    
    if (ccEmails.length > 0) params.push('cc=' + encodeURIComponent(ccEmails.join(',')));
    if (bccEmails.length > 0) params.push('bcc=' + encodeURIComponent(bccEmails.join(',')));
    if (subject) params.push('subject=' + encodeURIComponent(subject.replace(/\*\*|__|[_*`~]/g, '').trim()));
    if (body) {
      const normalizedBody = body.replace(/\r?\n/g, '\r\n');
      params.push('body=' + encodeURIComponent(normalizedBody));
    }
    const queryString = params.join('&');
    return `mailto:${toEmails.join(',')}${queryString ? '?' + queryString : ''}`;
  };

  const handleMailtoClick = () => {
    const mailtoLink = generateMailtoLink();
    
    // Try to open mailto link
    try {
      window.location.href = mailtoLink;
      setShowInstructions(true);
      
      // Hide instructions after 10 seconds
      setTimeout(() => setShowInstructions(false), 10000);
    } catch (error) {
      displayToast(t('emailClientError', 'Kon email client niet openen'), 'error');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleMailtoClick}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
      >
        <EnvelopeIcon className="w-4 h-4" />
        {label}
      </button>
      
      {/* Instructions Popup */}
      {showInstructions && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 min-w-[300px]">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <p className="font-medium mb-2">{t('emailClientInstructions', 'Email client instructies:')}</p>
            <ul className="space-y-1 text-xs">
              <li>• {t('emailInstruction1', 'Als je email client niet opent, kopieer dan de email inhoud handmatig')}</li>
              <li>• {t('emailInstruction2', 'Plak de inhoud in je favoriete email applicatie')}</li>
              <li>• {t('emailInstruction3', 'Voeg de ontvangers toe en verstuur de email')}</li>
            </ul>
          </div>
          <button
            onClick={() => setShowInstructions(false)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t('dismiss', 'Sluiten')}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailPreviewModal;