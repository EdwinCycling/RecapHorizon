import { SubscriptionTier } from '../../types';
import { subscriptionService } from '../subscriptionService';
import { getTotalTokenUsage, addUserMonthlyTokens, getUserMonthlyTokens } from '../firebase';

type TranslationFunction = (key: string, params?: Record<string, any>) => string;

interface TokenValidationResult {
  allowed: boolean;
  reason?: string;
  remainingTokens?: {
    monthly: number;
    daily: number;
  };
}

interface TokenEstimate {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

class TokenManager {
  private static t?: TranslationFunction;

  /**
   * Set the translation function for the TokenManager
   */
  static setTranslation(translationFunction: TranslationFunction) {
    this.t = translationFunction;
  }
  private static instance: TokenManager;

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Estimate token usage for a given text input
   * This is a rough estimation: ~4 characters per token for most languages
   */
  public estimateTokens(inputText: string, outputMultiplier: number = 2): TokenEstimate {
    const inputTokens = Math.ceil(inputText.length / 4);
    const outputTokens = Math.ceil(inputTokens * outputMultiplier);
    
    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens
    };
  }

  /**
   * Validate if a user can use tokens for an operation
   */
  public async validateTokenUsage(
    userId: string,
    userTier: SubscriptionTier,
    estimatedTokens: number
  ): Promise<TokenValidationResult> {
    try {
      // Get current usage
      const [monthlyTokens, dailyUsage] = await Promise.all([
        getUserMonthlyTokens(userId),
        getTotalTokenUsage(userId, 'daily')
      ]);
      const monthlyUsage = monthlyTokens.totalTokens;

      // Check if usage is allowed
      const validation = subscriptionService.isTokenUsageAllowed(
        userTier,
        estimatedTokens,
        monthlyUsage,
        dailyUsage
      );

      if (!validation.allowed) {
        return {
          allowed: false,
          reason: validation.reason
        };
      }

      // Get remaining tokens
      const remainingTokens = subscriptionService.getRemainingTokens(
        userTier,
        monthlyUsage,
        dailyUsage
      );

      return {
        allowed: true,
        remainingTokens
      };
    } catch (error) {
      console.error(TokenManager.t ? TokenManager.t('errorValidatingTokenUsage') : 'Error validating token usage:', error);
      return {
        allowed: false,
        reason: 'Er is een fout opgetreden bij het controleren van je token usage. Probeer het opnieuw.'
      };
    }
  }

  /**
   * Record token usage after an API call
   */
  public async recordTokenUsage(
    userId: string,
    inputTokens: number,
    outputTokens: number
  ): Promise<void> {
    try {
      await addUserMonthlyTokens(userId, inputTokens, outputTokens);
    } catch (error) {
      console.error(TokenManager.t ? TokenManager.t('errorRecordingTokenUsage') : 'Error recording token usage:', error);
      // Don't throw error here to avoid breaking the user flow
    }
  }

  /**
   * Get current token usage for a user
   */
  public async getCurrentUsage(userId: string): Promise<{
    monthly: number;
    daily: number;
  }> {
    try {
      const [monthlyTokens, dailyUsage] = await Promise.all([
        getUserMonthlyTokens(userId),
        getTotalTokenUsage(userId, 'daily')
      ]);

      return {
        monthly: monthlyTokens.totalTokens,
        daily: dailyUsage
      };
    } catch (error) {
      console.error(TokenManager.t ? TokenManager.t('errorGettingCurrentUsage') : 'Error getting current usage:', error);
      return {
        monthly: 0,
        daily: 0
      };
    }
  }

  /**
   * Check if user is approaching limits (>80% usage)
   */
  public async checkUsageWarnings(
    userId: string,
    userTier: SubscriptionTier
  ): Promise<{
    monthlyWarning: boolean;
    dailyWarning: boolean;
    monthlyPercentage: number;
    dailyPercentage: number;
  }> {
    try {
      const usage = await this.getCurrentUsage(userId);
      
      const monthlyPercentage = subscriptionService.getTokenUsagePercentage(
        userTier,
        usage.monthly,
        'monthly'
      );
      
      const dailyPercentage = subscriptionService.getTokenUsagePercentage(
        userTier,
        usage.daily,
        'daily'
      );

      return {
        monthlyWarning: monthlyPercentage > 80,
        dailyWarning: dailyPercentage > 80,
        monthlyPercentage,
        dailyPercentage
      };
    } catch (error) {
      console.error(TokenManager.t ? TokenManager.t('errorCheckingUsageWarnings') : 'Error checking usage warnings:', error);
      return {
        monthlyWarning: false,
        dailyWarning: false,
        monthlyPercentage: 0,
        dailyPercentage: 0
      };
    }
  }

  /**
   * Get tier-specific token information
   */
  public getTierTokenInfo(tier: SubscriptionTier): {
    monthlyLimit: number;
    dailyLimit: number;
    isUnlimited: boolean;
  } {
    const limits = subscriptionService.getTierLimits(tier);
    
    return {
      monthlyLimit: limits.maxTokensPerMonth,
      dailyLimit: limits.maxTokensPerDay,
      isUnlimited: limits.maxTokensPerMonth === -1 && limits.maxTokensPerDay === -1
    };
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();
export type { TokenValidationResult, TokenEstimate };