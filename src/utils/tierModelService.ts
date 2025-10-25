import { SubscriptionTier } from '../../types';
import ModelManager, { TIER_MODEL_CONFIGS, ModelConfig } from './modelManager';
import { getUserSubscriptionTier, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

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
      
      // Try to get model from database first
      try {
        const modelFromDb = await this.getModelFromDatabase(tier, functionName);
        if (modelFromDb) {
          return modelFromDb;
        }
      } catch (dbError) {
        console.warn('Failed to get model from database, falling back to local config:', dbError);
      }
      
      // Fallback to local config if database is not available
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
      
      // Try to get config from database first
      try {
        const configFromDb = await this.getModelConfigFromDatabase(tier);
        if (configFromDb) {
          return configFromDb;
        }
      } catch (dbError) {
        console.warn('Failed to get model config from database, falling back to local config:', dbError);
      }
      
      // Fallback to local config if database is not available
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
   * @returns Promise<string> - The model name to use
   */
  async getModelByTier(tier: SubscriptionTier, functionName: keyof ModelConfig): Promise<string> {
    // Try to get model from database first
    try {
      const modelFromDb = await this.getModelFromDatabase(tier, functionName);
      if (modelFromDb) {
        return modelFromDb;
      }
    } catch (dbError) {
      console.warn('Failed to get model from database, falling back to local config:', dbError);
    }
    
    // Fallback to local config if database is not available
    return this.modelManager.getModelForFunctionByTier(functionName, tier);
  }

  /**
   * Get all available tier configurations (useful for admin interfaces)
   * @returns Promise<Record<SubscriptionTier, ModelConfig>> - All tier configurations
   */
  async getAllTierConfigs(): Promise<Record<SubscriptionTier, ModelConfig>> {
    // Try to get all configs from database first
    try {
      const configsFromDb = await this.getAllModelConfigsFromDatabase();
      if (configsFromDb) {
        return configsFromDb;
      }
    } catch (dbError) {
      console.warn('Failed to get model configs from database, falling back to local config:', dbError);
    }
    
    // Fallback to local config if database is not available
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

  /**
   * Get model configuration from Firestore database
   * @param tier - The subscription tier
   * @param functionName - The function name
   * @returns Promise<string | null> - The model name or null if not found
   */
  private async getModelFromDatabase(tier: SubscriptionTier, functionName: keyof ModelConfig): Promise<string | null> {
    try {
      const docRef = doc(db, 'settings', `modelConfig_${tier}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const config = docSnap.data() as ModelConfig;
        return config[functionName] || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting model from database:', error);
      throw error;
    }
  }

  /**
   * Get complete model configuration for a tier from Firestore
   * @param tier - The subscription tier
   * @returns Promise<ModelConfig | null> - The complete model configuration or null if not found
   */
  private async getModelConfigFromDatabase(tier: SubscriptionTier): Promise<ModelConfig | null> {
    try {
      const docRef = doc(db, 'settings', `modelConfig_${tier}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as ModelConfig;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting model config from database:', error);
      throw error;
    }
  }

  /**
   * Get all tier configurations from Firestore database
   * @returns Promise<Record<SubscriptionTier, ModelConfig> | null> - All tier configurations or null if not found
   */
  private async getAllModelConfigsFromDatabase(): Promise<Record<SubscriptionTier, ModelConfig> | null> {
    try {
      const configs: Record<SubscriptionTier, ModelConfig> = {} as Record<SubscriptionTier, ModelConfig>;
      const tiers = Object.values(SubscriptionTier);
      
      for (const tier of tiers) {
        const docRef = doc(db, 'settings', `modelConfig_${tier}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          configs[tier as SubscriptionTier] = docSnap.data() as ModelConfig;
        } else {
          // If any tier config is missing, return null to fallback to local config
          return null;
        }
      }
      
      return configs;
    } catch (error) {
      console.error('Error getting all model configs from database:', error);
      throw error;
    }
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