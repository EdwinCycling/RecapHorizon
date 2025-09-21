import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NotionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Called when the Notion page has been successfully loaded and converted to text
  onAuthorizedAndLoaded: (text: string) => void;
  t: (key: string) => string;
}

interface NotionPageItem { id: string; title: string; icon?: string | null; last_edited_time?: string }

const NotionImportModal: React.FC<NotionImportModalProps> = ({ isOpen, onClose, onAuthorizedAndLoaded, t }) => {
  const [query, setQuery] = useState('');
  const [pages, setPages] = useState<NotionPageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedPageTitle, setSelectedPageTitle] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setPages([]);
      setQuery('');
      setSelectedPageId(null);
      setSelectedPageTitle(null);
      setError(null);
      setConnected(false);
      return;
    }
    // Check connection status when modal opens
    (async () => {
      try {
        const res = await fetch('/.netlify/functions/notion-auth-status', { cache: 'no-store' });
        const data = await res.json();
        setConnected(!!data?.connected);
      } catch {
        setConnected(false);
      }
    })();
  }, [isOpen]);

  if (!isOpen) return null;

  const connect = async () => {
    setError(null);
    setLoading(true);
    // Open OAuth in a popup so the modal stays open
    const authUrl = '/.netlify/functions/notion-auth-start';
    const popup = window.open(authUrl, 'notion_oauth', 'width=600,height=750');
    if (!popup) {
      setError(t('popupBlocked') || 'Popup geblokkeerd. Sta popups toe en probeer opnieuw.');
      setLoading(false);
      return;
    }
    const start = Date.now();
    const maxMs = 2 * 60 * 1000; // 2 minutes
    const interval = setInterval(async () => {
      try {
        // If user finished and popup closed, stop polling regardless
        if (popup.closed) {
          clearInterval(interval);
          setLoading(false);
          return;
        }
        const res = await fetch('/.netlify/functions/notion-auth-status', { cache: 'no-store' });
        const data = await res.json();
        if (data?.connected) {
          clearInterval(interval);
          try { popup.close(); } catch {}
          setConnected(true);
          setLoading(false);
        }
      } catch {
        // ignore transient errors
      }
      if (Date.now() - start > maxMs) {
        clearInterval(interval);
        try { popup.close(); } catch {}
        setLoading(false);
        setError(t('oauthTimeout') || 'De verbinding met Notion duurde te lang. Probeer het opnieuw.');
      }
    }, 1000);
  };

  const disconnect = async () => {
    try {
      await fetch('/.netlify/functions/notion-auth-disconnect');
      setConnected(false);
      setPages([]);
      setSelectedPageId(null);
      setSelectedPageTitle(null);
    } catch {}
  };

  const searchPages = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/.netlify/functions/notion-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Search failed');
      setPages(data.pages || []);
    } catch (e: any) {
      setError(e?.message || 'Unable to search Notion');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedPage = async () => {
    if (!selectedPageId) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch('/.netlify/functions/notion-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_id: selectedPageId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Load failed');
      onAuthorizedAndLoaded(data.text || '');
    } catch (e: any) {
      setError(e?.message || 'Unable to load Notion page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-lg relative shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200" type="button" aria-label={t('close')}>
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <svg width="28" height="28" viewBox="0 0 100 100" aria-hidden="true" className="drop-shadow-sm">
            <rect x="10" y="10" width="80" height="80" rx="10" fill="#111111" />
            <path d="M35 70V30h6l18 26V30h6v40h-6L41 44v26h-6z" fill="#ffffff"/>
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{t('notionWorkspace') || 'Notion Workspace'}</h3>
          {connected ? (
            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{t('connected') || 'Connected'}</span>
          ) : (
            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700 dark:bg-slate-700/60 dark:text-gray-300">{t('notConnected') || 'Not connected'}</span>
          )}
        </div>

        {!connected ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {t('connectNotionHelp') || 'Connect your Notion account securely. We never expose your token to the browser; it is stored encrypted in an HttpOnly cookie.'}
            </p>
            <button onClick={connect} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white">
              {t('connectNotion') || 'Connect Notion'}
            </button>
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">{error}</div>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {t('notionSearchHelp') || 'Search your Notion workspace securely via our server-side integration. Your Notion secret is never exposed to the browser.'}
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('search') || 'Search pages by title...'} className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none" />
                <button onClick={searchPages} disabled={loading} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50">{loading ? t('processing') || 'Searching...' : t('search') || 'Search'}</button>
              </div>

              <div className="max-h-64 overflow-y-auto rounded-md border border-gray-200 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
                {pages.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 dark:text-slate-400">{t('noResults') || 'No results yet. Try a search.'}</div>
                ) : (
                  pages.map(p => (
                    <button key={p.id} onClick={() => { setSelectedPageId(p.id); setSelectedPageTitle(p.title); }} className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-3 ${selectedPageId === p.id ? 'bg-cyan-50 dark:bg-slate-800/50' : ''}`}>
                      <div className="text-xl">{p.icon || '📄'}</div>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-100">{p.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{p.last_edited_time ? new Date(p.last_edited_time).toLocaleString() : ''}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={loadSelectedPage} disabled={loading || !selectedPageId} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50">
                  {loading ? (t('processing') || 'Loading Page...') : (t('processWebPage') || 'Load Page')}
                </button>
                <button onClick={disconnect} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-100">
                  {t('disconnect') || 'Disconnect'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">{error}</div>
            )}

            {selectedPageTitle && (
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-emerald-600 dark:text-emerald-300 text-xl">✓</div>
                  <div>
                    <div className="font-medium text-emerald-700 dark:text-emerald-300">{t('pageLoaded') || 'Page Loaded Successfully!'}</div>
                    <div className="text-sm text-emerald-700/90 dark:text-emerald-300/90">{t('selectedPage') || 'Selected Page:'} <span className="font-semibold">{selectedPageTitle}</span></div>
                    <div className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">{t('pageReadyNextPhase') || 'The page content is now ready for the next phase of processing.'}</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotionImportModal;