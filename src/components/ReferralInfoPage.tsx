import React from 'react';

interface ReferralInfoPageProps {
  t: (key: string, options?: any) => string;
  onEnrollClick: () => void;
  hasReferral: boolean;
  referralInfo?: { code?: string; joinUrl?: string } | null;
}

const ReferralInfoPage: React.FC<ReferralInfoPageProps> = ({ t, onEnrollClick, hasReferral, referralInfo }) => {
  return (
    <div className="px-4 sm:px-6 md:px-8 py-4 max-w-3xl mx-auto text-slate-900 dark:text-slate-100">
      <div className="space-y-6">
        {/* Intro is shown within the modal title; avoid duplicate page title */}
        <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm">
          {t('referralIntro', 'Verdien $1 per maand terugkerende commissie op elke betaald abonnement dat je aanbrengt.')}
        </p>

        {hasReferral && referralInfo?.joinUrl ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('referralYourCode', 'Jouw referralcode')}</div>
                <div className="text-lg font-semibold text-slate-900 dark:text-white">{referralInfo?.code || '-'}</div>
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-2">{t('referralYourJoinUrl', 'Jouw aanmeld URL')}</div>
                <div className="text-sm text-slate-900 dark:text-slate-100 break-all">{referralInfo.joinUrl}</div>
              </div>
              <button
                className="inline-flex items-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700"
                onClick={() => navigator.clipboard.writeText(referralInfo.joinUrl!)}
              >
                {t('copy', 'Kopiëren')}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <p className="text-slate-700 dark:text-slate-200 text-sm">
              {t('referralNotEnrolled', 'Je bent nog niet ingeschreven voor het referral programma.')}
            </p>
            <div className="mt-4">
              <button
                onClick={onEnrollClick}
                className="inline-flex items-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700"
              >
                {t('referralEnrollButton', 'Aanmelden')}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('referralWhatIsIt', 'Wat is dit?')}</h2>
          <ul className="list-disc pl-5 text-slate-700 dark:text-slate-200 text-sm space-y-2">
            <li>{t('referralRulePaidCustomer', 'Je moet een betalende klant zijn om je in te schrijven.')}</li>
            <li>{t('referralRulePayment', 'Uitbetalingen worden maandelijks gedaan via PayPal.')}</li>
            <li>
              {t('referralRulePaypal', 'Een geldige PayPal.Me link is vereist om uitbetalingen te ontvangen.')} {" "}
              <a href="https://www.paypal.com/paypalme" target="_blank" rel="noreferrer" className="underline text-blue-600 dark:text-blue-400">{t('referralPaypalLearnMore', 'Meer informatie')}</a>
            </li>
            <li>{t('referralRuleJoinUrl', 'Je unieke aanmeld-URL laat nieuwe gebruikers zich automatisch aanmelden als jouw referral.')}</li>
            <li>{t('referralRulePayoutSchedule', 'Commissies bouwen maandelijks op en worden binnen 7 dagen na maandafsluiting uitbetaald.')}</li>
            <li>{t('referralRuleFree', 'Nieuwe gebruikers worden eerst gratis lid, geen kosten; zodra ze zelf kiezen voor een betaald abonnement, gaat jouw referral lopen, elke maand.')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReferralInfoPage;