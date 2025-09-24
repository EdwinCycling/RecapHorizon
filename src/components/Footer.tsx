import * as React from 'react';
import packageJson from '../../package.json';

type FooterProps = {
  t: (key: string) => string,
  authState: { user: unknown | null; loading: boolean } | null,
  setShowCookieModal: (v: boolean) => void,
  setShowStoryModal: (v: boolean) => void,
  setShowTeamModal: (v: boolean) => void,
  setShowFAQPage: (v: boolean) => void,
  setShowDisclaimerModal: (v: boolean) => void,
  setShowPricingPage: (v: boolean) => void,
};

const Footer: React.FC<FooterProps> = ({ t, authState, setShowCookieModal, setShowStoryModal, setShowTeamModal, setShowFAQPage, setShowDisclaimerModal, setShowPricingPage, }) => (
  <footer className="w-full mt-16 pt-8 border-t border-gray-200 dark:border-slate-700">
    <div className="max-w-full mx-auto px-3 flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
      <div className="flex items-center gap-3">
        <a 
          href="/cookies" 
          className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors cursor-pointer"
          onClick={e => { e.preventDefault(); setShowCookieModal(true); }}
        >
          {t('cookies')}
        </a>
        <span className="hidden sm:inline">•</span>
        <a 
          href="/ons-verhaal" 
          className="hover:text-cyan-400 dark:hover:text-cyan-300 transition-colors cursor-pointer"
          onClick={e => { e.preventDefault(); setShowStoryModal(true); }}
        >
          {t('ourStory')}
        </a>
        <span className="hidden sm:inline">•</span>
        <a 
          href="/het-team" 
          className="hover:text-cyan-400 dark:hover:text-cyan-300 transition-colors cursor-pointer"
          onClick={e => { e.preventDefault(); setShowTeamModal(true); }}
        >
          {t('theTeam')}
        </a>
        <span className="hidden sm:inline">•</span>
        <a 
          href="/faq" 
          className="hover:text-cyan-400 dark:hover:text-cyan-300 transition-colors cursor-pointer"
          onClick={e => { e.preventDefault(); setShowFAQPage(true); }}
        >
          FAQ
        </a>
        <span className="hidden sm:inline">•</span>
        <a 
          href="/disclaimer" 
          className="hover:text-cyan-400 dark:hover:text-cyan-300 transition-colors cursor-pointer"
          onClick={e => { e.preventDefault(); setShowDisclaimerModal(true); }}
        >
          {t('disclaimer')}
        </a>
        <span className="hidden sm:inline">•</span>
        <a 
          href="/pricing" 
          className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors cursor-pointer"
          onClick={e => { e.preventDefault(); setShowPricingPage(true); }}
        >
          Pricing
        </a>
      </div>
      <div className="flex items-center gap-2">
                <span className="text-xs opacity-75">v.{packageJson.version}</span>
      </div>
    </div>
  </footer>
);

export default Footer;
