import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../locales';
import NotificationModal from './NotificationModal';

interface LoginFormProps {
  handleLogin: (email: string, password: string) => void;
  handleCreateAccount: (email: string, password: string) => void;
  handleForgotPassword: (email: string) => void;
  uiLang: Language;
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

const LoginForm: React.FC<LoginFormProps> = ({ handleLogin, handleCreateAccount, handleForgotPassword, uiLang }) => {
  const { t } = useTranslation(uiLang);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ isOpen: false, title: '', message: '', type: 'info' });

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Save/remove email based on remember me checkbox
  useEffect(() => {
    if (rememberMe && email) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  }, [rememberMe, email]);

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const canCreateAccount = () => {
    return email.trim() !== '' && passwordValidation.allValid && confirmPasswordValid;
  };

  const canLogin = () => {
    return isEmailValid && password.trim() !== '';
  };

  const handleSubmitLogin = async () => {
    if (!canLogin()) return;
    try {
      await Promise.resolve(handleLogin(email, password));
    } catch (error: any) {
      const message = error?.message || t('invalidCredentials', 'Ongeldige inloggegevens. Probeer opnieuw.');
      setNotification({
        isOpen: true,
        title: t('login'),
        message,
        type: 'error'
      });
    }
  };

  const handleSubmitCreateAccount = async () => {
    if (!canCreateAccount()) return;
    try {
      await Promise.resolve(handleCreateAccount(email, password));
    } catch (error: any) {
      const message = error?.message || t('accountCreationFailed', 'Account aanmaken mislukt. Probeer het opnieuw.');
      setNotification({
        isOpen: true,
        title: t('accountCreate'),
        message,
        type: 'error'
      });
    }
  };

  const handleForgotPasswordClick = async () => {
    if (isEmailValid) {
      try {
        await handleForgotPassword(email);
        setNotification({
          isOpen: true,
          title: t('forgotPassword'),
          message: t('passwordResetEmailSent'),
          type: 'success'
        });
      } catch (error: any) {
        console.error('Password reset error:', error);
        let errorMessage = t('passwordResetError');
        if (error.message?.includes('auth/user-not-found')) {
          errorMessage = t('passwordResetUserNotFound');
        } else if (error.message?.includes('auth/too-many-requests')) {
          errorMessage = t('passwordResetTooManyRequests');
        }
        setNotification({
          isOpen: true,
          title: t('forgotPassword'),
          message: errorMessage,
          type: 'error'
        });
      }
    } else {
      setNotification({
        isOpen: true,
        title: t('forgotPassword'),
        message: t('passwordResetInvalidEmail'),
        type: 'error'
      });
    }
  };

  const strengthInfo = getPasswordStrength();

  return (
    <div className="login-form" style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border border-slate-300 dark:border-slate-600 overflow-hidden">
          <button
            onClick={() => setIsCreateMode(false)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${!isCreateMode ? 'bg-cyan-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
            aria-pressed={!isCreateMode}
          >
            {t('login')}
          </button>
          <button
            onClick={() => setIsCreateMode(true)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${isCreateMode ? 'bg-cyan-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
            aria-pressed={isCreateMode}
          >
            {t('accountCreate')}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input 
          type="email" 
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input 
            type={showPassword ? 'text' : 'password'}
            placeholder={t('password')}
            value={password}
            onChange={handlePasswordChange}
            className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              fontSize: '16px'
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        
        {isCreateMode && password && (
          <div style={{ marginTop: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span>{t('passwordRequirements')}</span>
              <span style={{ color: strengthInfo.color, fontWeight: 'bold' }}>
                {strengthInfo.text}
              </span>
            </div>
            
            {passwordRequirements.map((req) => {
              const isValid = req.test(password);
              return (
                <div key={req.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '4px',
                  color: isValid ? '#10b981' : '#6b7280'
                }}>
                  <span style={{ 
                    marginRight: '8px', 
                    fontSize: '16px',
                    color: isValid ? '#10b981' : '#ef4444'
                  }}>
                    {isValid ? '✓' : '✗'}
                  </span>
                  <span style={{ fontSize: '12px' }}>{req.label}</span>
                </div>
              );
            })}
            
            {passwordValidation.allValid && (
              <div style={{ 
                marginTop: '8px', 
                padding: '8px', 
                backgroundColor: '#d1fae5', 
                borderRadius: '4px',
                color: '#065f46',
                fontSize: '12px',
                textAlign: 'center'
              }}>
                ✓ {t('allRequirementsMet')}
              </div>
            )}
          </div>
        )}
      </div>

      {!isCreateMode && (
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{
              marginRight: '8px',
              cursor: 'pointer'
            }}
          />
          <label
            htmlFor="rememberMe"
            style={{
              fontSize: '14px',
              cursor: 'pointer',
              color: '#374151'
            }}
            className="text-gray-700 dark:text-gray-300"
          >
            {t('rememberMe') || 'Onthoud mij'}
          </label>
        </div>
      )}

      {isCreateMode && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('confirmPassword')}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`w-full p-3 pr-10 rounded text-sm ${
                confirmPassword && !confirmPasswordValid 
                  ? 'border border-red-500 dark:border-red-400' 
                  : 'border border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                fontSize: '16px'
              }}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {confirmPassword && !confirmPasswordValid && (
            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
              {t('passwordsDoNotMatch')}
            </div>
          )}
          {confirmPassword && confirmPasswordValid && (
            <div style={{ color: '#10b981', fontSize: '12px', marginTop: '4px' }}>
              ✓ {t('passwordsDoNotMatch').replace('niet', '').replace('do not', '').replace('ne correspondent pas', 'correspondent').replace('não coincidem', 'coincidem').replace('no coinciden', 'coinciden').replace('nicht überein', 'überein')}
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        {isCreateMode ? (
          <button 
            onClick={handleSubmitCreateAccount}
            disabled={!canCreateAccount()}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: canCreateAccount() ? '#10b981' : '#d1d5db',
              color: canCreateAccount() ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: canCreateAccount() ? 'pointer' : 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            {t('accountCreate')}
          </button>
        ) : (
          <button 
            onClick={handleSubmitLogin}
            disabled={!canLogin()}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: canLogin() ? '#3b82f6' : '#d1d5db',
              color: canLogin() ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: canLogin() ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            {t('login')}
          </button>
        )}
      </div>

      {!isCreateMode && (
        <div style={{ textAlign: 'center' }}>
          <button 
             onClick={handleForgotPasswordClick}
             style={{
               background: 'none',
               border: 'none',
               color: '#3b82f6',
               textDecoration: 'underline',
               cursor: 'pointer',
               fontSize: '14px'
             }}
           >
            {t('forgotPassword')}
          </button>
        </div>
      )}
      
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
};

export default LoginForm;
