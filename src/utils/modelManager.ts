// Firebase imports removed - no longer needed for tier-based configs
import { SubscriptionTier } from '../../types';

// Model configuration interface
export interface ModelConfig {
  audioTranscription: string;
  expertChat: string;
  emailComposition: string;
  analysisGeneration: string;
  pptExport: string;
  businessCase: string;
  sessionImport: string;
  generalAnalysis: string;
}

// Available Gemini models with their characteristics
export const AVAILABLE_MODELS = {
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    description: 'Balanced performance and cost',
    inputCost: 0.30, // per 1M tokens
    outputCost: 2.50, // per 1M tokens
    speed: 'Fast',
    quality: 'High'
  },
  'gemini-2.5-flash-lite': {
    name: 'Gemini 2.5 Flash Lite',
    description: 'Most cost-effective option',
    inputCost: 0.10, // per 1M tokens
    outputCost: 0.40, // per 1M tokens
    speed: 'Very Fast',
    quality: 'Good'
  },
  'gemini-2.0-flash-exp': {
    name: 'Gemini 2.0 Flash Experimental',
    description: 'Latest experimental features',
    inputCost: 0.30, // per 1M tokens
    outputCost: 2.50, // per 1M tokens
    speed: 'Fast',
    quality: 'Very High'
  }
};

// Default configuration optimized for cost
export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  audioTranscription: 'gemini-2.5-flash', // High quality needed for audio
  expertChat: 'gemini-2.5-flash-lite', // Simple conversations
  emailComposition: 'gemini-2.5-flash-lite', // Simple text generation
  analysisGeneration: 'gemini-2.5-flash', // Complex analysis needs quality
  pptExport: 'gemini-2.5-flash', // Structured output needs quality
  businessCase: 'gemini-2.5-flash', // Complex reasoning needed
  sessionImport: 'gemini-2.5-flash-lite', // Simple processing
  generalAnalysis: 'gemini-2.5-flash' // Balanced for various tasks
};

// Tier-specific model configurations
export const TIER_MODEL_CONFIGS: Record<SubscriptionTier, ModelConfig> = {
  [SubscriptionTier.FREE]: {
    audioTranscription: 'gemini-2.5-flash-lite', // Cost-effective for free tier
    expertChat: 'gemini-2.5-flash-lite', // Simple conversations
    emailComposition: 'gemini-2.5-flash-lite', // Simple text generation
    analysisGeneration: 'gemini-2.5-flash-lite', // Lower quality but cost-effective
    pptExport: 'gemini-2.5-flash-lite', // Basic structured output
    businessCase: 'gemini-2.5-flash-lite', // Basic reasoning
    sessionImport: 'gemini-2.5-flash-lite', // Simple processing
    generalAnalysis: 'gemini-2.5-flash-lite' // Cost-effective for free users
  },
  [SubscriptionTier.SILVER]: {
    audioTranscription: 'gemini-2.5-flash', // Better quality for paid tier
    expertChat: 'gemini-2.5-flash-lite', // Simple conversations
    emailComposition: 'gemini-2.5-flash-lite', // Simple text generation
    analysisGeneration: 'gemini-2.5-flash', // Good quality analysis
    pptExport: 'gemini-2.5-flash', // Good structured output
    businessCase: 'gemini-2.5-flash', // Good reasoning
    sessionImport: 'gemini-2.5-flash-lite', // Simple processing
    generalAnalysis: 'gemini-2.5-flash' // Balanced for silver users
  },
  [SubscriptionTier.GOLD]: {
    audioTranscription: 'gemini-2.5-flash', // High quality
    expertChat: 'gemini-2.5-flash', // Better conversations
    emailComposition: 'gemini-2.5-flash', // Better text generation
    analysisGeneration: 'gemini-2.0-flash-exp', // Experimental features
    pptExport: 'gemini-2.5-flash', // High quality structured output
    businessCase: 'gemini-2.0-flash-exp', // Advanced reasoning
    sessionImport: 'gemini-2.5-flash', // Better processing
    generalAnalysis: 'gemini-2.0-flash-exp' // Latest features for gold
  },
  [SubscriptionTier.DIAMOND]: {
    audioTranscription: 'gemini-2.0-flash-exp', // Best quality
    expertChat: 'gemini-2.0-flash-exp', // Best conversations
    emailComposition: 'gemini-2.0-flash-exp', // Best text generation
    analysisGeneration: 'gemini-2.0-flash-exp', // Best analysis
    pptExport: 'gemini-2.0-flash-exp', // Best structured output
    businessCase: 'gemini-2.0-flash-exp', // Best reasoning
    sessionImport: 'gemini-2.0-flash-exp', // Best processing
    generalAnalysis: 'gemini-2.0-flash-exp' // Best quality for diamond
  },
  [SubscriptionTier.ENTERPRISE]: {
    audioTranscription: 'gemini-2.0-flash-exp', // Best quality
    expertChat: 'gemini-2.0-flash-exp', // Best conversations
    emailComposition: 'gemini-2.0-flash-exp', // Best text generation
    analysisGeneration: 'gemini-2.0-flash-exp', // Best analysis
    pptExport: 'gemini-2.0-flash-exp', // Best structured output
    businessCase: 'gemini-2.0-flash-exp', // Best reasoning
    sessionImport: 'gemini-2.0-flash-exp', // Best processing
    generalAnalysis: 'gemini-2.0-flash-exp' // Best quality for enterprise
  }
};

class ModelManager {
  private static instance: ModelManager;

  private constructor() {}

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }



  // Get model for function based on user's subscription tier
  getModelForFunctionByTier(functionName: keyof ModelConfig, tier: SubscriptionTier): string {
    const tierConfig = TIER_MODEL_CONFIGS[tier];
    return tierConfig[functionName] || DEFAULT_MODEL_CONFIG[functionName];
  }

  // Get model for user based on their tier and function (main method to use)
  async getModelForUser(userId: string, userTier: string, functionName: keyof ModelConfig): Promise<string> {
    // Convert string tier to SubscriptionTier enum
    const tier = userTier as SubscriptionTier;
    return this.getModelForFunctionByTier(functionName, tier);
  }

  // Get complete model configuration for a specific tier
  getModelConfigForTier(tier: SubscriptionTier): ModelConfig {
    return TIER_MODEL_CONFIGS[tier] || DEFAULT_MODEL_CONFIG;
  }

  // Calculate cost comparison between tiers
  calculateTierCostComparison(estimatedTokensPerMonth: number = 1000000): Record<SubscriptionTier, { [key: string]: number }> {
    const tierCosts: Record<SubscriptionTier, { [key: string]: number }> = {} as any;
    
    for (const tier of Object.values(SubscriptionTier)) {
      const config = this.getModelConfigForTier(tier);
      tierCosts[tier] = this.calculateEstimatedCost(config, estimatedTokensPerMonth);
    }
    
    return tierCosts;
  }

  // Clear cache (deprecated - no longer needed)
  clearCache(): void {
    console.warn('clearCache is deprecated. Tier-based configs are static.');
  }

  // Calculate estimated cost for a configuration
  calculateEstimatedCost(config: ModelConfig, estimatedTokensPerMonth: number = 1000000): { [key: string]: number } {
    const costs: { [key: string]: number } = {};
    
    for (const [functionName, modelName] of Object.entries(config)) {
      const model = AVAILABLE_MODELS[modelName as keyof typeof AVAILABLE_MODELS];
      if (model) {
        // Estimate 70% input, 30% output tokens
        const inputTokens = estimatedTokensPerMonth * 0.7;
        const outputTokens = estimatedTokensPerMonth * 0.3;
        
        costs[functionName] = (
          (inputTokens / 1000000) * model.inputCost +
          (outputTokens / 1000000) * model.outputCost
        );
      }
    }
    
    return costs;
  }
}

export default ModelManager.getInstance();