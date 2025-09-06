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
  alert(`${type.toUpperCase()}: ${message}`);
}
