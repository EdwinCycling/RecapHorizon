import React, { useState } from 'react';
import Modal from './Modal';
import { useTranslation } from '../hooks/useTranslation';
import { sanitizeTextInput, validateEmailEnhanced, containsSQLInjection, containsXSS } from '../utils/security';
import { browserEmailService } from '../services/browserEmailService';

interface EnterpriseContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string, fallback?: string) => string;
  userEmail?: string;
}

const estimatedUserOptions = [
  { key: '2-5', labelKey: 'enterpriseUsers_2_5', fallback: '2 - 5' },
  { key: '6-10', labelKey: 'enterpriseUsers_6_10', fallback: '6 - 10' },
  { key: '11-25', labelKey: 'enterpriseUsers_11_25', fallback: '11 - 25' },
  { key: '26-100', labelKey: 'enterpriseUsers_26_100', fallback: '26 - 100' },
  { key: '100+', labelKey: 'enterpriseUsers_100_plus', fallback: '100+' }
];

const EnterpriseContactModal: React.FC<EnterpriseContactModalProps> = ({ isOpen, onClose, t, userEmail }) => {
  const { currentLanguage } = useTranslation();

  const [name, setName] = useState<string>('');
  const [workEmail, setWorkEmail] = useState<string>(userEmail || '');
  const [company, setCompany] = useState<string>('');
  const [estimatedUsers, setEstimatedUsers] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setWorkEmail(userEmail || '');
    setCompany('');
    setEstimatedUsers('');
    setMessage('');
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): { valid: boolean; error?: string } => {
    // Basic presence
    if (!name.trim() || !workEmail.trim() || !company.trim() || !estimatedUsers) {
      return { valid: false, error: t('enterpriseRequiredFields', 'Please fill in all required fields.') };
    }

    // Detect obvious injection/XSS
    const inputs = [name, workEmail, company, estimatedUsers, message];
    if (inputs.some(i => containsSQLInjection(i) || containsXSS(i))) {
      return { valid: false, error: t('enterpriseUnsafeInput', 'Unsafe input detected. Please remove special scripts or suspicious patterns.') };
    }

    // Email validation
    const emailCheck = validateEmailEnhanced(workEmail, { allowSuspicious: false });
    if (!emailCheck.isValid) {
      return { valid: false, error: t('invalidEmail', 'Invalid email address.') };
    }

    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.error || t('formError', 'Please correct the errors in the form.'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Sanitize text inputs
      const safeName = sanitizeTextInput(name, 200);
      const safeCompany = sanitizeTextInput(company, 200);
      const safeEstimated = sanitizeTextInput(estimatedUsers, 50);
      const safeMessage = sanitizeTextInput(message, 2000);

      const timestamp = new Date().toISOString();

      const result = await browserEmailService.sendEnterpriseContactEmail({
        email: workEmail.trim(), // used as replyTo at the server
        name: safeName,
        company: safeCompany,
        estimatedUsers: safeEstimated,
        message: safeMessage,
        language: currentLanguage || 'en',
        timestamp,
      });

      if (result.success) {
        setSuccess(t('enterpriseContactSuccess', 'Thanks! Your request has been sent. We will contact you shortly.'));
        // Optionally auto-close after a short delay
        setTimeout(() => {
          resetForm();
          onClose();
        }, 1500);
      } else {
        setError(result.error || t('enterpriseContactError', 'Failed to send your request. Please try again later.'));
      }
    } catch (err: any) {
      console.error('Enterprise contact submit error:', err);
      setError(err?.message || t('enterpriseContactError', 'Failed to send your request. Please try again later.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title={t('enterpriseContactTitle', 'Enterprise contact')}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {t('enterpriseContactIntro', 'Tell us a bit about your organization, and we will reach out to tailor RecapHorizon for your team.')}
        </p>

        {error && (
          <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}
        {success && (
          <div className="p-3 rounded bg-green-50 border border-green-200 text-green-700 text-sm">{success}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('enterpriseYourName', 'Your name')}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700"
              placeholder={t('enterpriseYourNamePlaceholder', 'e.g. Jane Doe')}
              maxLength={200}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('enterpriseWorkEmail', 'Work email')}</label>
            <input
              type="email"
              value={workEmail}
              onChange={e => setWorkEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700"
              placeholder={t('enterpriseWorkEmailPlaceholder', 'name@company.com')}
              maxLength={254}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('enterpriseCompany', 'Company')}</label>
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700"
              placeholder={t('enterpriseCompanyPlaceholder', 'Company name')}
              maxLength={200}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('enterpriseEstimatedUsers', 'Estimated users')}</label>
            <select
              value={estimatedUsers}
              onChange={e => setEstimatedUsers(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700"
              required
            >
              <option value="" disabled>{t('enterpriseSelectOption', 'Select...')}</option>
              {estimatedUserOptions.map(opt => (
                <option key={opt.key} value={opt.key}>
                  {t(opt.labelKey, opt.fallback)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('enterpriseMessage', 'Additional info')}</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700"
            placeholder={t('enterpriseMessagePlaceholder', 'What are your goals and needs?')}
            rows={4}
            maxLength={2000}
          />
          <p className="text-xs text-slate-500 mt-1">{t('enterprisePrivacyNote', 'We will only use this information to contact you about enterprise options.')}</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => { resetForm(); onClose(); }}
            className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {t('cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {isSubmitting ? t('sending', 'Sending...') : t('enterpriseSendRequest', 'Send request')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EnterpriseContactModal;