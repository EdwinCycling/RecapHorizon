import React, { useState, useEffect } from 'react';
import { Language } from '../locales';
import LanguageSelector from './LanguageSelector';

interface ReferralRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAccount: (email: string, password: string) => void;
  t: (key: string, fallback?: string) => string;
  uiLang: Language;
  referralCode: string;
  referrerData?: any;
  onShowInfoPage?: () => void;
  onLanguageChange?: (lang: string) => void;
}

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

interface PasswordValidation {
  minLength: boolean;
  hasSpecialChar: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  allValid: boolean;
}

const ReferralRegistrationModal: React.FC<ReferralRegistrationModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreateAccount, 
  t, 
  uiLang, 
  referralCode,
  referrerData,
  onShowInfoPage,
  onLanguageChange
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasSpecialChar: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    allValid: false
  });
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Function to anonymize email address for privacy
  const anonymizeEmail = (email: string) => {
    if (!email || !email.includes('@')) return email;
    const [localPart, domain] = email.split('@');
    // Mask local part
    const lpStart = localPart.substring(0, 1);
    const lpEnd = localPart.substring(Math.max(localPart.length - 1, 1));
    const lpStars = '*'.repeat(Math.max(2, Math.min(4, localPart.length - 2)));
    // Mask domain label before first dot
    const dotIndex = domain.indexOf('.');
    if (dotIndex === -1) {
      // No dot in domain, just add stars
      const dStart = domain.substring(0, 1);
      const dEnd = domain.substring(Math.max(domain.length - 1, 1));
      const dStars = '*'.repeat(Math.max(2, Math.min(4, domain.length - 2)));
      return `${lpStart}${lpStars}${lpEnd}@${dStart}${dStars}${dEnd}`;
    } else {
      const firstLabel = domain.substring(0, dotIndex);
      const restDomain = domain.substring(dotIndex); // includes the dot
      const flStart = firstLabel.substring(0, 1);
      const flEnd = firstLabel.substring(Math.max(firstLabel.length - 1, 1));
      const flStars = '*'.repeat(Math.max(2, Math.min(4, firstLabel.length - 2)));
      return `${lpStart}${lpStars}${lpEnd}@${flStart}${flStars}${flEnd}${restDomain}`;
    }
  };

  const passwordRequirements: PasswordRequirement[] = [
    {
      id: 'minLength',
      label: t('passwordMinLength'),
      test: (pwd: string) => pwd.length >= 8
    },
    {
      id: 'hasSpecialChar',
      label: t('passwordSpecialChar'),
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    },
    {
      id: 'hasUppercase',
      label: t('passwordUppercase'),
      test: (pwd: string) => /[A-Z]/.test(pwd)
    },
    {
      id: 'hasLowercase',
      label: t('passwordLowercase'),
      test: (pwd: string) => /[a-z]/.test(pwd)
    },
    {
      id: 'hasNumber',
      label: t('passwordNumber'),
      test: (pwd: string) => /[0-9]/.test(pwd)
    }
  ];

  const validatePassword = (pwd: string) => {
    const validation: PasswordValidation = {
      minLength: pwd.length >= 8,
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      allValid: false
    };
    
    validation.allValid = validation.minLength && validation.hasSpecialChar && 
                         validation.hasUppercase && validation.hasLowercase && validation.hasNumber;
    
    setPasswordValidation(validation);
  };

  const getPasswordStrength = () => {
    const score = Object.values(passwordValidation).filter(Boolean).length - 1; // -1 for allValid
    if (score <= 1) return { text: t('passwordStrengthWeak'), color: '#ef4444' };
    if (score <= 2) return { text: t('passwordStrengthMedium'), color: '#f59e0b' };
    if (score <= 4) return { text: t('passwordStrengthStrong'), color: '#10b981' };
    return { text: t('passwordStrengthVeryStrong'), color: '#059669' };
  };

  useEffect(() => {
    if (password) {
      validatePassword(password);
    }
  }, [password]);

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.includes('@') && email.includes('.');
  };

  useEffect(() => {
    setConfirmPasswordValid(confirmPassword !== '' && confirmPassword === password);
  }, [confirmPassword, password]);

  useEffect(() => {
    setIsEmailValid(validateEmail(email));
  }, [email]);

  const canCreateAccount = () => {
    return email.trim() !== '' && passwordValidation.allValid && confirmPasswordValid;
  };

  const handleSubmitCreateAccount = () => {
    if (canCreateAccount()) {
      onCreateAccount(email, password);
    }
  };

  const handleCancel = () => {
    if (onShowInfoPage) {
      onShowInfoPage();
    } else {
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canCreateAccount()) {
      handleSubmitCreateAccount();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="RecapHorizon" className="w-8 h-8 rounded" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">RecapHorizon</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl"
            >
              ×
            </button>
          </div>

          {/* Language Selector (compact, inside modal to avoid overflow) */}
          {onLanguageChange && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                {t('chooseLanguage', 'Kies taal')}
              </label>
              <LanguageSelector
                value={uiLang}
                onChange={onLanguageChange}
                placeholder={t('chooseLanguagePlaceholder', 'Selecteer UI taal')}
                appLanguage={uiLang}
                allowedUiCodes={["nl","en","de","fr","es","pt"]}
                flagsOnly={false}
                variant="default"
                className=""
              />
            </div>
          )}

          {/* Welcome Message */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-blue-800 dark:text-blue-200">
              {referrerData?.userEmail ? (
                <p className="mb-2">
                  {(() => {
                    const masked = anonymizeEmail(referrerData.userEmail);
                    const template = t(
                      'referralWelcomeMessagePersonalized',
                      'Je bent uitgenodigd door {referrer} om RecapHorizon te proberen. Je maakt nu een gratis account aan en krijgt toegang tot de Free tier. We zijn super blij dat je er bent!'
                    );
                    return template.replace('{referrer}', masked);
                  })()}
                </p>
              ) : (
                <p className="mb-2">
                  {t('referralWelcomeMessage', 'We zijn super blij dat je via een referral bij ons terecht bent gekomen. Je maakt nu een gratis account aan en krijgt toegang tot de Free tier.')}
                </p>
              )}
              <p>
                {t('referralWelcomeGetStarted', 'Maak je gratis account aan om meteen aan de slag te gaan.')}
              </p>
            </div>
          </div>

          {/* Referral Code Display */}
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
              {t('referralCodeUsed', 'Gebruikte referral code')}
            </div>
            <div className="text-sm font-mono text-slate-900 dark:text-white">
              {referralCode}
            </div>
          </div>

          {/* Registration Form */}
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('email', 'E-mailadres')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder={t('enterEmail', 'Voer je e-mailadres in')}
              />
              {email && !isEmailValid && (
                <div className="text-red-600 text-sm mt-1">
                  {t('invalidEmail', 'Ongeldig e-mailadres')}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('password', 'Wachtwoord')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder={t('enterPassword', 'Voer je wachtwoord in')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">
                      {t('passwordStrength', 'Wachtwoordsterkte')}:
                    </span>
                    <span style={{ color: getPasswordStrength().color }}>
                      {getPasswordStrength().text}
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(Object.values(passwordValidation).filter(Boolean).length - 1) * 20}%`,
                        backgroundColor: getPasswordStrength().color
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req) => (
                    <div key={req.id} className="flex items-center text-xs">
                      <span className={`mr-2 ${passwordValidation[req.id as keyof PasswordValidation] ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation[req.id as keyof PasswordValidation] ? '✓' : '✗'}
                      </span>
                      <span className={`${passwordValidation[req.id as keyof PasswordValidation] ? 'text-green-600' : 'text-slate-600 dark:text-slate-400'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('confirmPassword', 'Bevestig wachtwoord')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder={t('confirmPasswordPlaceholder', 'Bevestig je wachtwoord')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {confirmPassword && !confirmPasswordValid && (
                <div className="text-red-600 text-sm mt-1">
                  {t('passwordsDoNotMatch', 'Wachtwoorden komen niet overeen')}
                </div>
              )}
              {confirmPassword && confirmPasswordValid && (
                <div className="text-green-600 text-sm mt-1">
                  {t('passwordsMatch', 'Wachtwoorden komen overeen')}
                </div>
              )}
            </div>
          </div>

          {/* Create Account Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmitCreateAccount}
              disabled={!canCreateAccount()}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                canCreateAccount()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
              }`}
            >
              {t('createAccount', 'Account aanmaken')}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <button
              onClick={handleCancel}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {t('cancel', 'Annuleren')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralRegistrationModal;