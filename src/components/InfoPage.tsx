import * as React from 'react';

// Keep original three info cards (with i18n text) and extend with two new ones.
// Images are chosen from public/images and can be adjusted later.

type Props = {
  t: (key: string, params?: Record<string, string | number>) => string;
  addToWaitlist: (email: string) => Promise<{ success: boolean; message: string; type: 'success' | 'error' | 'info' }>;
  onWaitlistMoreInfo?: () => void;
  waitlistEmail: string;
  setWaitlistEmail: (email: string) => void;
  isLoggedIn?: boolean;
};

const InfoPage: React.FC<Props> = ({ t, addToWaitlist, onWaitlistMoreInfo, waitlistEmail, setWaitlistEmail, isLoggedIn }) => {
  const [waitlistFeedback, setWaitlistFeedback] = React.useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    show: boolean;
  }>({ message: '', type: 'info', show: false });

  const handleWaitlistSubmit = async () => {
    if (!waitlistEmail.trim()) return;
    
    const result = await addToWaitlist(waitlistEmail);
    setWaitlistFeedback({
      message: result.message,
      type: result.type,
      show: true
    });
    
    if (result.success) {
      setWaitlistEmail('');
    }
  };

  // The first three cards use the existing translations; the last two are new but also localized
  const infoCards = [
    {
      title: t('featureRecordingTitle'),
      description: t('featureRecordingDesc'),
      image: '/images/usecase-meeting.jpg',
    },
    {
      title: t('featureAIAnalysisTitle'),
      description: t('featureAIAnalysisDesc'),
      image: '/images/usecase-webinar.jpg',
    },
    {
      title: t('featurePresentationsTitle'),
      description: t('featurePresentationsDesc'),
      image: '/images/usecase-export.jpg',
    },
    // Nieuwe kaarten
    {
      title: t('featureToolkitTitle'),
      description: t('featureToolkitDesc'),
      image: '/images/usecase-kit.jpg',
    },
    {
      title: t('featurePWATitle'),
      description: t('featurePWADesc'),
      image: '/images/usecase-pwa.jpg',
    },
  ];



  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-8 w-full max-w-7xl mx-auto mt-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-medium text-slate-900 dark:text-slate-100 mb-2 tracking-tight">{t('infoPageTitle')}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">{t('infoPageLead')}</p>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Login / Waitlist section */}
        {!isLoggedIn && (
          <div className="flex-1 flex flex-col justify-center items-center">
            {waitlistFeedback.show ? (
              <div className="w-full max-w-md text-center">
                <div className={`p-4 rounded-lg border ${
                  waitlistFeedback.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                    : waitlistFeedback.type === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                }`}>
                  <p className="font-medium">{waitlistFeedback.message}</p>
                </div>
                {waitlistFeedback.type !== 'success' && (
                  <button
                    onClick={() => setWaitlistFeedback({ message: '', type: 'info', show: false })}
                    className="mt-3 text-cyan-700 dark:text-cyan-400 hover:underline text-sm"
                  >
                    {t('tryAgain')}
                  </button>
                )}
              </div>
            ) : (
              <>
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={e => setWaitlistEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
                <button
                  onClick={handleWaitlistSubmit}
                  disabled={!waitlistEmail.trim()}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md font-medium hover:bg-cyan-700 disabled:bg-slate-400 transition-colors mt-2"
                >
                  {t('waitlistSignUp')}
                </button>
                {onWaitlistMoreInfo && (
                  <button
                    onClick={() => onWaitlistMoreInfo()}
                    className="mt-3 text-cyan-700 dark:text-cyan-400 hover:underline text-sm"
                  >
                    {t('waitlistMoreInfo')}
                  </button>
                )}
              </>
            )}
          </div>
        )}
        {/* Features section */}
        <div className="flex-1">
          <h2 className="text-xl font-medium mb-4 text-slate-900 dark:text-slate-100">{t('featuresTitle')}</h2>
          {/* Render 5 responsive cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

            {infoCards.map((card, idx) => (
              <div
                key={idx}
                className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow"
              >
                <img src={card.image} alt={card.title} className="w-full h-40 object-cover" loading="lazy" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{card.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
