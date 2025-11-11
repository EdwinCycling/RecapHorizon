import React, { useState } from 'react';
import { validatePayPalMeLink, PAYPAL_ME_INFO_URL } from '../utils/paypal';
import { buildReferralJoinUrl } from '../utils/referral';

interface ReferralSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (payload: { paypalMeLink: string }) => Promise<{ code: string }>;
  t: (key: string, options?: any) => string;
}

const ReferralSignupModal: React.FC<ReferralSignupModalProps> = ({ isOpen, onClose, onEnroll, t }) => {
  const [paypalLink, setPaypalLink] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<{ code: string; joinUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleValidate = (value: string) => {
    setPaypalLink(value);
    setIsValid(validatePayPalMeLink(value));
  };

  const handleGenerate = async () => {
    setError(null);
    if (!validatePayPalMeLink(paypalLink)) {
      setIsValid(false);
      setError(t('referralPaypalInvalid'));
      return;
    }
    setGenerating(true);
    try {
      const result = await onEnroll({ paypalMeLink: paypalLink.trim() });
      const joinUrl = buildReferralJoinUrl(result.code);
      setGenerated({ code: result.code, joinUrl });
    } catch (e: any) {
      // Handle rate limiting errors specifically
      if (e?.message?.includes('rate-limit-exceeded') || e?.status === 429) {
        const retryMinutes = e?.retryAfterMinutes || 60;
        setError(t('referralRateLimitError', { retryMinutes }));
      } else {
        setError(e?.message || t('referralEnrollError'));
      }
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-7">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('referralSignupTitle')}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200">✕</button>
        </div>

        <p className="text-sm mb-3">
          {t('referralPaypalMeDesc')} 
          <a className="underline text-blue-600 dark:text-blue-400" href={PAYPAL_ME_INFO_URL} target="_blank" rel="noreferrer">
            {t('referralPaypalLearnMore')}
          </a>
        </p>

        <label className="block text-sm font-medium mb-1" htmlFor="paypalLink">{t('referralPaypalMeLabel')}</label>
        <input
          id="paypalLink"
          type="text"
          value={paypalLink}
          onChange={(e) => handleValidate(e.target.value)}
          placeholder="paypal.me/jouwnaam"
          className={`w-full p-2 rounded-md border ${isValid ? 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'border-red-500 bg-white dark:bg-slate-800'}`}
        />
        {!isValid && (
          <div className="text-red-600 text-sm mt-1">{t('referralPaypalInvalid')}</div>
        )}

        {/* Only show generate button if no code has been generated yet */}
        {!generated && (
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              {t('close')}
            </button>
            <button onClick={handleGenerate} disabled={generating || !isValid || !paypalLink} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
              {generating ? t('generating') : t('referralGenerateCode')}
            </button>
          </div>
        )}

        {generated && (
          <div className="mt-6 p-6 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-300 dark:border-green-600">
            {/* Waarschuwing banner */}
            <div className="mb-4 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-600">
              <div className="flex items-center gap-2">
                <div className="text-yellow-600 dark:text-yellow-400 font-bold">⚠️</div>
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {t('referralOneTimeWarning')}
                </div>
              </div>
            </div>

            {/* Referral Code - Prominent Display */}
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                {t('referralYourCode')}
              </div>
              <div className="relative">
                <div className="text-3xl font-mono font-bold text-green-600 dark:text-green-400 bg-white dark:bg-slate-800 p-4 rounded-lg border-2 border-green-300 dark:border-green-600 shadow-lg">
                  {generated.code}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generated.code);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white"
                  title={t('copyCode')}
                >
                  {copied ? t('copied') : t('copy')}
                </button>
              </div>
            </div>

            {/* Join URL */}
            <div className="mt-4">
              <div className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('referralJoinUrl')}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm break-all flex-1 bg-white dark:bg-slate-800 p-2 rounded border">
                  {generated.joinUrl}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generated.joinUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                >
                  {t('copy')}
                </button>
              </div>
            </div>

            {/* Extra instructies */}
            <div className="mt-4 p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium mb-1">
                  {t('referralInstructions')}
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>{t('referralInstruction1')}</li>
                  <li>{t('referralInstruction2')}</li>
                  <li>{t('referralInstruction3')}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Show close button at bottom when code is generated */}
        {generated && (
          <div className="mt-6 flex justify-center">
            <button onClick={onClose} className="px-6 py-3 rounded-md bg-gray-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium">
              {t('close')}
            </button>
          </div>
        )}

        {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
      </div>
    </div>
  );
};

export default ReferralSignupModal;