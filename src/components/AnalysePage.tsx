import React from 'react';

interface AnalysePageProps {
  t: (key: string) => string;
  onStartNewSession: () => void;
  onOpenSettings: () => void;
}

const AnalysePage: React.FC<AnalysePageProps> = ({ t, onStartNewSession, onOpenSettings, children }) => (
  <>
    {/* Start new session button */}
    <button 
      onClick={onStartNewSession} 
      className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[120px]"
    >
      <span role="img" aria-label="reset">🔄</span>
      <span>{t('startNewSession')}</span>
    </button>
    {/* Settings button */}
    <button 
      onClick={onOpenSettings} 
      className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-all text-white bg-cyan-500 hover:bg-cyan-600 h-10 min-w-0 sm:min-w-[100px]"
    >
      <span role="img" aria-label="settings">⚙️</span>
      <span>{t('settings')}</span>
    </button>
    {children}
  </>
);

export default AnalysePage;
