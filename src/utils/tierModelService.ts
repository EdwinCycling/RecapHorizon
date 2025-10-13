import { SubscriptionTier } from '../../types';
import ModelManager, { TIER_MODEL_CONFIGS, ModelConfig } from './modelManager';
import { getUserSubscriptionTier } from '../firebase';

/**
 * Service for managing tier-based model selection
 * This service provides methods to get the appropriate model based on user's subscription tier
 */
export class TierModelService {
  private static instance: TierModelService;
  private modelManager: typeof ModelManager;

  private constructor() {
    this.modelManager = ModelManager;
  }

  public static getInstance(): TierModelService {
    if (!TierModelService.instance) {
      TierModelService.instance = new TierModelService();
    }
    return TierModelService.instance;
  }

  /**
   * Get the appropriate model for a function based on user's subscription tier
   * @param userId - The user's ID
   * @param functionName - The function name (e.g., 'audioTranscription', 'analysisGeneration')
   * @returns Promise<string> - The model name to use
   */
  async getModelForUser(userId: string, functionName: keyof ModelConfig): Promise<string> {
    try {
      // Get user's subscription tier
      const tierString = await getUserSubscriptionTier(userId);
      const tier = tierString as SubscriptionTier;
      
      // Get model for this tier and function
      return this.modelManager.getModelForFunctionByTier(functionName, tier);
    } catch (error) {
      console.warn('Failed to get user tier, falling back to default model:', error);
      // Fallback to free tier model if we can't determine user's tier
      return this.modelManager.getModelForFunctionByTier(functionName, SubscriptionTier.FREE);
    }
  }

  /**
   * Get the complete model configuration for a user's tier
   * @param userId - The user's ID
   * @returns Promise<ModelConfig> - The complete model configuration
   */
  async getModelConfigForUser(userId: string): Promise<ModelConfig> {
    try {
      const tierString = await getUserSubscriptionTier(userId);
      const tier = tierString as SubscriptionTier;
      return this.modelManager.getModelConfigForTier(tier);
    } catch (error) {
      console.warn('Failed to get user tier, falling back to free tier config:', error);
      return this.modelManager.getModelConfigForTier(SubscriptionTier.FREE);
    }
  }

  /**
   * Get model directly by tier (useful for admin interfaces)
   * @param tier - The subscription tier
   * @param functionName - The function name
   * @returns string - The model name to use
   */
  getModelByTier(tier: SubscriptionTier, functionName: keyof ModelConfig): string {
    return this.modelManager.getModelForFunctionByTier(functionName, tier);
  }

  /**
   * Get all available tier configurations (useful for admin interfaces)
   * @returns Record<SubscriptionTier, ModelConfig> - All tier configurations
   */
  getAllTierConfigs(): Record<SubscriptionTier, ModelConfig> {
    return TIER_MODEL_CONFIGS;
  }

  /**
   * Calculate cost comparison between tiers
   * @param estimatedTokensPerMonth - Estimated monthly token usage
   * @returns Record<SubscriptionTier, { [key: string]: number }> - Cost breakdown by tier
   */
  calculateTierCosts(estimatedTokensPerMonth: number = 1000000): Record<SubscriptionTier, { [key: string]: number }> {
    return this.modelManager.calculateTierCostComparison(estimatedTokensPerMonth);
  }

  /**
   * Get tier upgrade recommendations based on usage patterns
   * @param currentTier - User's current tier
   * @param monthlyTokenUsage - User's monthly token usage
   * @returns { shouldUpgrade: boolean; recommendedTier?: SubscriptionTier; reason: string }
   */
  getTierRecommendation(currentTier: SubscriptionTier, monthlyTokenUsage: number): {
    shouldUpgrade: boolean;
    recommendedTier?: SubscriptionTier;
    reason: string;
  } {
    const tierOrder = [SubscriptionTier.FREE, SubscriptionTier.SILVER, SubscriptionTier.GOLD, SubscriptionTier.DIAMOND, SubscriptionTier.ENTERPRISE];
    const currentIndex = tierOrder.indexOf(currentTier);
    
    // Simple logic for recommendations based on token usage
    if (monthlyTokenUsage > 100000 && currentTier === SubscriptionTier.FREE) {
      return {
        shouldUpgrade: true,
        recommendedTier: SubscriptionTier.SILVER,
        reason: 'High token usage detected. Silver tier offers better models and higher limits.'
      };
    }
    
    if (monthlyTokenUsage > 300000 && currentIndex < 2) {
      return {
        shouldUpgrade: true,
        recommendedTier: SubscriptionTier.GOLD,
        reason: 'Very high token usage detected. Gold tier offers experimental models and unlimited sessions.'
      };
    }
    
    return {
      shouldUpgrade: false,
      reason: 'Current tier is appropriate for your usage patterns.'
    };
  }
}

// Export singleton instance
export const tierModelService = TierModelService.getInstance();

// Export utility functions for direct use
export const getModelForUser = (userId: string, functionName: keyof ModelConfig) => 
  tierModelService.getModelForUser(userId, functionName);

export const getModelConfigForUser = (userId: string) => 
  tierModelService.getModelConfigForUser(userId);

export const getModelByTier = (tier: SubscriptionTier, functionName: keyof ModelConfig) => 
  tierModelService.getModelByTier(tier, functionName);