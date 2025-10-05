import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface ReferralDashboardProps {
  t: (key: string, options?: any) => string;
  userId: string | undefined;
  hasReferral: boolean;
}

type ReferralEntry = {
  emailMasked: string;
  currentTier: string;
  monthStartTier: string;
  createdAt?: any;
  signupDate?: Date;
};

// Custom hook for device detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind md breakpoint
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
};

const ReferralDashboard: React.FC<ReferralDashboardProps> = ({ t, userId, hasReferral }) => {
  const [entries, setEntries] = useState<ReferralEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  const itemsPerPage = isMobile ? 10 : 20;

  // Calculate pagination values
  const totalPages = Math.ceil(entries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntries = entries.slice(startIndex, endIndex);

  // Reset to page 1 when entries change or device type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [entries.length, isMobile]);

  useEffect(() => {
    const load = async () => {
      if (!userId || !hasReferral) return;
      setLoading(true);
      try {
        const ref = collection(db, 'referrals');
        const q = query(ref, where('referrerUid', '==', userId));
        const snap = await getDocs(q);
        const list: ReferralEntry[] = snap.docs.map(d => {
          const data = d.data();
          const createdAt = data.createdAt;
          let signupDate: Date | undefined;
          
          if (createdAt) {
            if (createdAt.toDate) {
              signupDate = createdAt.toDate();
            } else if (createdAt.seconds) {
              signupDate = new Date(createdAt.seconds * 1000);
            } else if (createdAt instanceof Date) {
              signupDate = createdAt;
            }
          }
          
          return {
            emailMasked: data.emailMasked || '***',
            currentTier: data.currentTier || 'free',
            monthStartTier: data.monthStartTier || 'free',
            createdAt: data.createdAt,
            signupDate
          };
        });
        
        // Sort by signup date (descending - newest first)
        list.sort((a, b) => {
          if (!a.signupDate && !b.signupDate) return 0;
          if (!a.signupDate) return 1;
          if (!b.signupDate) return -1;
          return b.signupDate.getTime() - a.signupDate.getTime();
        });
        
        setEntries(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, hasReferral]);

  if (!hasReferral) {
    return (
      <div className="px-4 sm:px-6 md:px-8 py-4 max-w-3xl mx-auto text-slate-900 dark:text-slate-100">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <p className="text-sm text-slate-700 dark:text-slate-200">{t('referralNeedEnroll', 'Je bent nog niet aangemeld voor het referral programma. Meld je eerst aan om het dashboard te zien.')}</p>
        </div>
      </div>
    );
  }

  const payingCount = entries.filter(e => ['silver', 'gold', 'enterprise', 'diamond'].includes(e.currentTier?.toLowerCase())).length;
  
  // Calculate earnings for current month and previous month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  // Count paying referrals that were active in current month
  const currentMonthEarnings = entries.filter(e => {
    if (!['silver', 'gold', 'enterprise', 'diamond'].includes(e.currentTier?.toLowerCase())) return false;
    if (!e.signupDate) return false;
    
    // Check if signup was before or during current month
    const signupMonth = e.signupDate.getMonth();
    const signupYear = e.signupDate.getFullYear();
    
    return (signupYear < currentYear) || 
           (signupYear === currentYear && signupMonth <= currentMonth);
  }).length;
  
  // Count paying referrals that were active in previous month
  const previousMonthEarnings = entries.filter(e => {
    if (!['silver', 'gold', 'enterprise', 'diamond'].includes(e.currentTier?.toLowerCase())) return false;
    if (!e.signupDate) return false;
    
    // Check if signup was before or during previous month
    const signupMonth = e.signupDate.getMonth();
    const signupYear = e.signupDate.getFullYear();
    
    return (signupYear < previousYear) || 
           (signupYear === previousYear && signupMonth <= previousMonth);
  }).length;
  
  const totalEarnings = payingCount * 1; // Total based on current paying referrals

  const handleExportPdf = async () => {
    setExportError(null);
    setExporting(true);
    try {
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) throw new Error(t('mustBeLoggedIn', 'Je moet ingelogd zijn'));
      const functionsBase = (import.meta as any)?.env?.VITE_FUNCTIONS_BASE_URL || '';
      const resp = await fetch(`${functionsBase}/.netlify/functions/referral-dashboard-pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf'
        }
      });
      if (!resp.ok) {
        // Handle rate limiting specifically
        if (resp.status === 429) {
          try {
            const errorData = await resp.json();
            const retryMinutes = errorData.retryAfterMinutes || 60;
            throw new Error(t('referralPdfRateLimitError', `Te veel PDF downloads. Je kunt over ${retryMinutes} minuten opnieuw proberen. Dit voorkomt overbelasting van de server.`));
          } catch {
            throw new Error(t('referralPdfRateLimitError', 'Te veel PDF downloads. Probeer later opnieuw.'));
          }
        } else {
          const msg = await resp.text().catch(() => '');
          throw new Error(msg || t('referralExportError', 'Exporteren mislukt. Probeer opnieuw.'));
        }
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'referral-dashboard.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setExportError(e?.message || t('referralExportError', 'Exporteren mislukt. Probeer opnieuw.'));
    } finally {
      setExporting(false);
    }
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - halfVisible);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 py-4 max-w-4xl mx-auto text-slate-900 dark:text-slate-100">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportPdf}
          disabled={exporting || !hasReferral}
          className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-3 py-2 shadow-sm"
          title={t('referralExportPdf', 'Export PDF')}
        >
          {exporting ? t('loading', 'Laden...') : t('referralExportPdf', 'Export PDF')}
        </button>
      </div>
      {exportError && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30 text-red-700 dark:text-red-200 px-3 py-2 text-sm">
          {exportError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <div className="text-sm text-slate-600 dark:text-slate-300">{t('referralEarningsTotal', 'Totale verdiensten')}</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">$ {totalEarnings.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <div className="text-sm text-slate-600 dark:text-slate-300">{t('referralEarningsMonth', 'Verdiensten deze maand')}</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">$ {currentMonthEarnings.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
           <div className="text-sm text-slate-600 dark:text-slate-300">{t('referralEarningsPreviousMonth', 'Verdiensten vorige maand')}</div>
           <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">$ {previousMonthEarnings.toFixed(2)}</div>
         </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        {/* Table header with pagination info */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {entries.length > 0 && (
              <>
                {startIndex + 1}-{Math.min(endIndex, entries.length)} van {entries.length} referrals
                <span className="ml-2 text-xs">({itemsPerPage} per pagina)</span>
              </>
            )}
          </div>
          {totalPages > 1 && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Pagina {currentPage} van {totalPages}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr className="text-left">
                <th className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-200">{t('referralColEmail', 'Email adres')}</th>
                <th className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-200">{t('referralColCurrentTier', 'Huidige abonnement')}</th>
                <th className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-200">Aanmelddatum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td className="py-3 px-3" colSpan={3}>{t('loading', 'Laden...')}</td></tr>
              ) : entries.length === 0 ? (
                <tr><td className="py-3 px-3" colSpan={3}>{t('referralNoEntries', 'Nog geen aanmeldingen via jouw code.')}</td></tr>
              ) : (
                currentEntries.map((e, i) => (
                  <tr key={startIndex + i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-3 text-slate-900 dark:text-slate-100">{e.emailMasked}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        ['silver', 'gold', 'enterprise', 'diamond'].includes(e.currentTier?.toLowerCase())
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {e.currentTier}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {e.signupDate ? e.signupDate.toLocaleDateString('nl-NL', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Onbekend'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && !loading && entries.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Vorige
            </button>

            <div className="flex items-center space-x-1">
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Volgende →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralDashboard;