/**
 * Debounce utility function to prevent rapid successive calls
 * @param func Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Rate limiter to prevent too many calls within a time window
 */
export class RateLimiter {
  private lastCall: number = 0;
  private minInterval: number;

  constructor(minIntervalMs: number) {
    this.minInterval = minIntervalMs;
  }

  canExecute(): boolean {
    const now = Date.now();
    if (now - this.lastCall >= this.minInterval) {
      this.lastCall = now;
      return true;
    }
    return false;
  }

  getTimeUntilNext(): number {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    return Math.max(0, this.minInterval - timeSinceLastCall);
  }
}