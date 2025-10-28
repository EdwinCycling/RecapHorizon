type TranslationFunction = (key: string, params?: Record<string, any>) => string;

let t: TranslationFunction | undefined;

/**
 * Set the translation function for clipboard utilities
 */
export function setClipboardTranslation(translationFunction: TranslationFunction) {
  t = translationFunction;
}

// Utility: copyToClipboard
export async function copyToClipboard(text: string): Promise<void> {
  // Normalize to CRLF to improve compatibility when pasting into Windows-only apps
  const crlf = text.replace(/\r?\n/g, '\r\n');
  if (navigator && navigator.clipboard) {
    await navigator.clipboard.writeText(crlf);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = crlf;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

// Utility: displayToast
export const displayToast = async (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  try {
    const { showToast } = await import('./toastNotification');
    showToast(message, type);
  } catch (error) {
    // Fallback to alert if toast system fails
    console.warn('Toast system failed, using console fallback:', message);
  }
};
