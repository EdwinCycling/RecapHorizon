import React, { useEffect } from 'react';

interface BlurredLoadingOverlayProps {
  isVisible?: boolean;
  loadingText?: string;
  text?: string;
  children?: React.ReactNode;
}

const BlurredLoadingOverlay: React.FC<BlurredLoadingOverlayProps> = ({
  isVisible = true,
  loadingText,
  text,
  children
}) => {
  if (!isVisible) return null;
  
  const displayText = text || loadingText;

  useEffect(() => {
    const prevOverflow = typeof document !== 'undefined' ? document.body.style.overflow : '';
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = prevOverflow || '';
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9998] animate-in fade-in duration-300">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300">
        <div className="text-center">
          {/* Loading Spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          
          {/* Loading Text */}
          {displayText && (
            <div className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
              {displayText}
            </div>
          )}
          
          {/* Additional Content */}
          {children && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlurredLoadingOverlay;