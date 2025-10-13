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
  if (navigator && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

// Utility: displayToast
export function displayToast(message: string, type: 'success' | 'error' = 'success'): void {
  // Placeholder: Replace with your toast implementation
  alert(t ? t('clipboardToastMessage', { type: type.toUpperCase(), message }) : `${type.toUpperCase()}: ${message}`);
}
