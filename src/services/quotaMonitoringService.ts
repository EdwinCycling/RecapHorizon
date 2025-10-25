import { SubscriptionTier } from '../../types';

interface QuotaUsage {
  userId: string;
  date: string; // YYYY-MM-DD format
  geminiRequests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  lastUpdated: Date;
}

interface QuotaWarning {
  shouldWarn: boolean;
  warningMessage: string;
  usagePercentage: number;
  requestsRemaining: number;
}

export class QuotaMonitoringService {
  private static instance: QuotaMonitoringService;
  private quotaCache: Map<string, QuotaUsage> = new Map();

  // Google Gemini free tier limits
  private static readonly FREE_TIER_DAILY_LIMIT = 50;
  private static readonly WARNING_THRESHOLD = 0.8; // 80%

  private constructor() {}

  public static getInstance(): QuotaMonitoringService {
    if (!QuotaMonitoringService.instance) {
      QuotaMonitoringService.instance = new QuotaMonitoringService();
    }
    return QuotaMonitoringService.instance;
  }

  /**
   * Record a Google Gemini API request
   */
  public async recordGeminiRequest(userId: string, inputTokens: number = 0, outputTokens: number = 0): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `${userId}_${today}`;
      
      let usage = this.quotaCache.get(cacheKey);
      if (!usage) {
        // Try to load from localStorage for persistence across sessions
        const stored = localStorage.getItem(`quota_${cacheKey}`);
        if (stored) {
          usage = JSON.parse(stored);
        } else {
          usage = {
            userId,
            date: today,
            geminiRequests: 0,
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            lastUpdated: new Date()
          };
        }
      }

      usage.geminiRequests += 1;
      usage.inputTokens += inputTokens;
      usage.outputTokens += outputTokens;
      usage.totalTokens = usage.inputTokens + usage.outputTokens;
      usage.lastUpdated = new Date();
      
      // Update cache and localStorage
      this.quotaCache.set(cacheKey, usage);
      localStorage.setItem(`quota_${cacheKey}`, JSON.stringify(usage));
      
    } catch (error) {
      console.error('Error recording Gemini request:', error);
    }
  }

  /**
   * Get current quota usage for a user
   */
  public getCurrentQuotaUsage(userId: string): QuotaUsage {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `${userId}_${today}`;
    
    let usage = this.quotaCache.get(cacheKey);
    if (!usage) {
      // Try to load from localStorage
      const stored = localStorage.getItem(`quota_${cacheKey}`);
      if (stored) {
        usage = JSON.parse(stored);
        this.quotaCache.set(cacheKey, usage);
      } else {
        usage = {
          userId,
          date: today,
          geminiRequests: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          lastUpdated: new Date()
        };
      }
    }

    return usage;
  }

  /**
   * Check if user should receive a quota warning
   */
  public checkQuotaWarning(userId: string, userTier: SubscriptionTier): QuotaWarning {
    // Only monitor free tier users for Google Gemini quota
    if (userTier !== SubscriptionTier.FREE) {
      return {
        shouldWarn: false,
        warningMessage: '',
        usagePercentage: 0,
        requestsRemaining: -1 // unlimited for paid tiers
      };
    }

    const usage = this.getCurrentQuotaUsage(userId);
    const usagePercentage = (usage.geminiRequests / QuotaMonitoringService.FREE_TIER_DAILY_LIMIT) * 100;
    const requestsRemaining = Math.max(0, QuotaMonitoringService.FREE_TIER_DAILY_LIMIT - usage.geminiRequests);
    
    const shouldWarn = usagePercentage >= (QuotaMonitoringService.WARNING_THRESHOLD * 100);
    
    let warningMessage = '';
    if (shouldWarn) {
      if (usagePercentage >= 95) {
        warningMessage = `Je hebt bijna je dagelijkse Google Gemini limiet bereikt! Nog ${requestsRemaining} verzoeken over.`;
      } else {
        warningMessage = `Je hebt ${usagePercentage.toFixed(0)}% van je dagelijkse Google Gemini limiet gebruikt. Nog ${requestsRemaining} verzoeken over.`;
      }
    }

    return {
      shouldWarn,
      warningMessage,
      usagePercentage,
      requestsRemaining
    };
  }

  /**
   * Clean up old quota data (older than 7 days)
   */
  public cleanupOldQuotaData(): void {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const cutoffDate = sevenDaysAgo.toISOString().split('T')[0];

      // Clean cache
      for (const [key, usage] of this.quotaCache.entries()) {
        if (usage.date < cutoffDate) {
          this.quotaCache.delete(key);
        }
      }

      // Clean localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('quota_') && key.includes('_')) {
          const date = key.split('_').pop();
          if (date && date < cutoffDate) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up quota data:', error);
    }
  }

  /**
   * Reset quota for a new day (called automatically)
   */
  public resetDailyQuota(userId: string): void {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `${userId}_${today}`;
    
    // Remove any existing cache for today to start fresh
    this.quotaCache.delete(cacheKey);
    localStorage.removeItem(`quota_${cacheKey}`);
  }
}

// Export singleton instance
export const quotaMonitoringService = QuotaMonitoringService.getInstance();