import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import LoginForm from './LoginForm';
import { Language } from '../locales';
import { TranslationFunction } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationFunction;
  handleLogin: (...args: any[]) => void;
  handleCreateAccount: (...args: any[]) => void;
  handlePasswordReset: (email: string) => void;
  uiLang: Language;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, t, handleLogin, handleCreateAccount, handlePasswordReset, uiLang }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full m-4 p-6">
        <div className="flex justify-end items-start mb-2">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <LoginForm 
          handleLogin={handleLogin}
          handleCreateAccount={handleCreateAccount}
          handleForgotPassword={handlePasswordReset}
          uiLang={uiLang}
        />
      </div>
    </div>
  );
};

export default LoginModal;
