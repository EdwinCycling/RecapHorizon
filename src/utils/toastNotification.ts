import { SubscriptionTier } from '../../types';

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

class ToastManager {
  private toasts: ToastNotification[] = [];
  private container: HTMLElement | null = null;

  constructor() {
    this.createContainer();
  }

  private createContainer() {
    if (typeof window === 'undefined') return;
    
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  private createToastElement(toast: ToastNotification): HTMLElement {
    const toastEl = document.createElement('div');
    toastEl.style.cssText = `
      background: #10b981;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 300px;
      word-wrap: break-word;
      pointer-events: auto;
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    // Add icon based on type
    const icon = document.createElement('span');
    icon.style.fontSize = '16px';
    icon.textContent = toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️';
    
    const message = document.createElement('span');
    message.textContent = toast.message;

    toastEl.appendChild(icon);
    toastEl.appendChild(message);

    // Animate in
    setTimeout(() => {
      toastEl.style.transform = 'translateX(0)';
    }, 10);

    return toastEl;
  }

  show(message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 3000) {
    if (!this.container) return;

    const toast: ToastNotification = {
      id: Date.now().toString(),
      message,
      type,
      duration
    };

    const toastEl = this.createToastElement(toast);
    this.container.appendChild(toastEl);

    // Auto remove
    setTimeout(() => {
      toastEl.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (this.container && this.container.contains(toastEl)) {
          this.container.removeChild(toastEl);
        }
      }, 300);
    }, duration);
  }
}

// Global toast manager instance
const toastManager = new ToastManager();

/**
 * Show a toast notification for Diamond tier users when tokens are added
 */
export function showDiamondTokenToast(inputTokens: number, outputTokens: number, userTier: string) {
  // Only show for Diamond tier users
  if (userTier !== 'diamond') {
    return;
  }

  const totalTokens = inputTokens + outputTokens;
  const message = `Added ${totalTokens.toLocaleString()} tokens (${inputTokens.toLocaleString()} input + ${outputTokens.toLocaleString()} output)`;
  
  toastManager.show(message, 'success', 4000);
}

/**
 * General toast notification function
 */
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 3000) {
  toastManager.show(message, type, duration);
}

export default toastManager;