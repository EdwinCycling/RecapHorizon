import React from 'react';

interface LoginFormProps {
  onLogin: (email?: string, password?: string) => void;
  onCreateAccount: (email?: string, password?: string) => void;
  onPasswordReset: (email?: string) => void;
  onClose: () => void;
  t: (key: string) => string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCreateAccount, onPasswordReset, onClose, t }) => {
  // Dummy form for demonstration purposes
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          onLogin();
        }}
        className="space-y-4"
      >
        <input type="email" placeholder={t('email') || 'Email'} className="w-full p-2 border rounded" required />
        <input type="password" placeholder={t('password') || 'Password'} className="w-full p-2 border rounded" required />
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded">{t('login') || 'Login'}</button>
          <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onCreateAccount}>{t('createAccount') || 'Create Account'}</button>
          <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onPasswordReset}>{t('forgotPassword') || 'Forgot Password?'}</button>
        </div>
      </form>
      <button onClick={onClose} className="mt-4 text-cyan-600 underline">{t('close') || 'Close'}</button>
    </div>
  );
};

export default LoginForm;
