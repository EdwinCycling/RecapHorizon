import * as React from 'react';

const InfoPage: React.FC<{ t: (key: string, params?: Record<string, string | number>) => string, addToWaitlist: (email: string) => void, setShowWaitlistModal: (show: boolean) => void, waitlistEmail: string, setWaitlistEmail: (email: string) => void }> = ({ t, addToWaitlist, setShowWaitlistModal, waitlistEmail, setWaitlistEmail }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-8 w-full max-w-4xl mx-auto mt-12">
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('infoPageTitle')}</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300">{t('infoPageLead')}</p>
    </div>
    <div className="flex flex-col md:flex-row gap-8">
      {/* Login / Waitlist section */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <input
          type="email"
          value={waitlistEmail}
          onChange={e => setWaitlistEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          required
        />
        <button
          onClick={() => addToWaitlist(waitlistEmail)}
          disabled={!waitlistEmail.trim()}
          className="px-4 py-2 bg-cyan-600 text-white rounded-md font-medium hover:bg-cyan-700 disabled:bg-slate-400 transition-colors mt-2"
        >
          {t('waitlistSignUp')}
        </button>
        <button
          onClick={() => setShowWaitlistModal(true)}
          className="mt-3 text-cyan-700 dark:text-cyan-400 hover:underline text-sm"
        >
          {t('waitlistMoreInfo')}
        </button>
      </div>
      {/* Features section */}
      <div className="flex-1">
        {/* You can add more info/feature visuals here as needed */}
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">{t('featureSectionTitle')}</h2>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li>{t('featureRecordingTitle')}</li>
          <li>{t('featureAIAnalysisDesc')}</li>
          <li>{t('featurePresentationsDesc')}</li>
        </ul>
      </div>
    </div>
  </div>
);

export default InfoPage;
