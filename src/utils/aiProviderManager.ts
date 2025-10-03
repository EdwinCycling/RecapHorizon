import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserPreferences } from '../firebase';

// AI Provider enumeration
export enum AIProvider {
  GOOGLE_GEMINI = 'google_gemini',
  OPENROUTER = 'openrouter'
}

// AI Function types for different use cases
export enum AIFunction {
  AUDIO_TRANSCRIPTION = 'audioTranscription',
  EXPERT_CHAT = 'expertChat',
  EMAIL_COMPOSITION = 'emailComposition',
  ANALYSIS_GENERATION = 'analysisGeneration',
  PPT_EXPORT = 'pptExport',
  BUSINESS_CASE = 'businessCase',
  SESSION_IMPORT = 'sessionImport',
  GENERAL_ANALYSIS = 'generalAnalysis',
  MINDMAP_GENERATION = 'mindmapGeneration',
  QUIZ_GENERATION = 'quizGeneration',
  EXPLAIN_GENERATION = 'explainGeneration',
  PRESENTATION_GENERATION = 'presentationGeneration',
  KEYWORD_ANALYSIS = 'keywordAnalysis',
  SENTIMENT_ANALYSIS = 'sentimentAnalysis',
  IMAGE_ANALYSIS = 'imageAnalysis'
}

// Subscription tiers
export enum SubscriptionTier {
  FREE = 'FREE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  DIAMOND = 'DIAMOND',
  ENTERPRISE = 'ENTERPRISE'
}

// Rate limit status interface
export interface RateLimitStatus {
  isAllowed: boolean;
  requestsRemaining: number;
  resetTime?: number;
  retryAfter?: number;
}

// AI Provider configuration interface
export interface AIProviderConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

// AI Response interface
export interface AIResponse {
  content: string;
  success?: boolean;
  error?: string;
  stream?: AsyncIterable<string>;
  tokenUsage?: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cost?: number;
  };
  provider: AIProvider;
  model: string;
  responseTime: number;
}

// Provider selection request interface
export interface ProviderSelectionRequest {
  userId: string;
  functionType: AIFunction;
  userTier: SubscriptionTier;
  userPreference?: AIProvider;
}

// Provider selection response interface
export interface ProviderSelectionResponse {
  provider: AIProvider;
  model: string;
  rateLimitStatus: RateLimitStatus;
  fallbackAvailable: boolean;
}

// Error types for AI providers
export enum AIProviderError {
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  API_KEY_INVALID = 'API_KEY_INVALID',
  MODEL_UNAVAILABLE = 'MODEL_UNAVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  CONTENT_FILTERED = 'CONTENT_FILTERED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// AI Error response interface
export interface AIErrorResponse {
  error: AIProviderError;
  message: string;
  provider?: AIProvider;
  retryAfter?: number;
  fallbackAvailable: boolean;
  userAction?: string;
}

// OpenRouter free models configuration
export const OPENROUTER_FREE_MODELS = {
  'quasar-alpha:free': {
    name: 'Quasar Alpha (Free)',
    provider: AIProvider.OPENROUTER,
    costPerInputToken: 0,
    costPerOutputToken: 0,
    contextWindow: 8192,
    rateLimits: {
      requestsPerMinute: 20,
      requestsPerDay: 1000
    },
    capabilities: ['text-generation', 'conversation'],
    isFree: true
  },
  'deepseek-v3-base:free': {
    name: 'DeepSeek V3 Base (Free)',
    provider: AIProvider.OPENROUTER,
    costPerInputToken: 0,
    costPerOutputToken: 0,
    contextWindow: 16384,
    rateLimits: {
      requestsPerMinute: 20,
      requestsPerDay: 500
    },
    capabilities: ['code-generation', 'reasoning', 'analysis'],
    isFree: true
  },
  'llama-4-maverick:free': {
    name: 'Llama 4 Maverick (Free)',
    provider: AIProvider.OPENROUTER,
    costPerInputToken: 0,
    costPerOutputToken: 0,
    contextWindow: 8192,
    rateLimits: {
      requestsPerMinute: 20,
      requestsPerDay: 750
    },
    capabilities: ['conversation', 'analysis'],
    isFree: true
  },
  'scout:free': {
    name: 'Scout (Free)',
    provider: AIProvider.OPENROUTER,
    costPerInputToken: 0,
    costPerOutputToken: 0,
    contextWindow: 4096,
    rateLimits: {
      requestsPerMinute: 20,
      requestsPerDay: 1000
    },
    capabilities: ['fast-response', 'general'],
    isFree: true
  }
};

// Rate limiter for OpenRouter
class OpenRouterRateLimiter {
  private static requestCounts = new Map<string, number[]>();
  private static dailyCounts = new Map<string, { count: number; date: string }>();

  static async checkRateLimit(userId: string, model: string): Promise<RateLimitStatus> {
    const now = Date.now();
    const today = new Date().toDateString();
    const userKey = `${userId}_${model}`;
    
    // Get model configuration
    const modelConfig = OPENROUTER_FREE_MODELS[model as keyof typeof OPENROUTER_FREE_MODELS];
    if (!modelConfig) {
      return { isAllowed: false, requestsRemaining: 0 };
    }

    // Check minute-based rate limit
    const userRequests = this.requestCounts.get(userKey) || [];
    const recentRequests = userRequests.filter(timestamp => now - timestamp < 60000);
    
    if (recentRequests.length >= modelConfig.rateLimits.requestsPerMinute) {
      const oldestRequest = Math.min(...recentRequests);
      const retryAfter = 60000 - (now - oldestRequest);
      return {
        isAllowed: false,
        requestsRemaining: 0,
        retryAfter: Math.ceil(retryAfter / 1000)
      };
    }

    // Check daily rate limit
    const dailyData = this.dailyCounts.get(userKey);
    if (dailyData && dailyData.date === today && dailyData.count >= modelConfig.rateLimits.requestsPerDay) {
      return {
        isAllowed: false,
        requestsRemaining: 0,
        resetTime: new Date(today).getTime() + 24 * 60 * 60 * 1000
      };
    }

    return {
      isAllowed: true,
      requestsRemaining: Math.min(
        modelConfig.rateLimits.requestsPerMinute - recentRequests.length,
        modelConfig.rateLimits.requestsPerDay - (dailyData?.count || 0)
      )
    };
  }

  static recordRequest(userId: string, model: string): void {
    const now = Date.now();
    const today = new Date().toDateString();
    const userKey = `${userId}_${model}`;

    // Record minute-based request
    const userRequests = this.requestCounts.get(userKey) || [];
    userRequests.push(now);
    // Keep only requests from the last minute
    const recentRequests = userRequests.filter(timestamp => now - timestamp < 60000);
    this.requestCounts.set(userKey, recentRequests);

    // Record daily request
    const dailyData = this.dailyCounts.get(userKey);
    if (dailyData && dailyData.date === today) {
      dailyData.count++;
    } else {
      this.dailyCounts.set(userKey, { count: 1, date: today });
    }
  }
}

// Main AI Provider Manager class
export class AIProviderManager {
  private static geminiInstances = new Map<string, GoogleGenerativeAI>();

  /**
   * Generate content using the specified provider configuration
   */
  private static async generateContent(
    config: AIProviderConfig,
    prompt: string,
    userId?: string
  ): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      switch (config.provider) {
        case AIProvider.GOOGLE_GEMINI:
          return await this.callGemini(config, prompt, startTime);
        case AIProvider.OPENROUTER:
          return await this.callOpenRouter(config, prompt, startTime, userId);
        default:
          throw new Error(`Unsupported provider: ${config.provider}`);
      }
    } catch (error: any) {
      console.error(`AI Provider error for ${config.provider}:`, error);
      
      const errorType = this.categorizeError(error);
      throw new Error(`${config.provider} error: ${error.message}`);
    }
  }

  /**
   * Generate content with streaming support
   */
  static async generateContentWithStreaming(
    config: AIProviderConfig,
    prompt: string,
    userId?: string
  ): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      switch (config.provider) {
        case AIProvider.GOOGLE_GEMINI:
          return await this.callGeminiWithStreaming(config, prompt, startTime);
        case AIProvider.OPENROUTER:
          return await this.callOpenRouterWithStreaming(config, prompt, startTime, userId);
        default:
          throw new Error(`Unsupported provider: ${config.provider}`);
      }
    } catch (error: any) {
      console.error(`AI Provider streaming error for ${config.provider}:`, error);
      
      const errorType = this.categorizeError(error);
      throw new Error(`${config.provider} streaming error: ${error.message}`);
    }
  }

  /**
   * Generate content with provider selection and fallback
   */
  static async generateContentWithProviderSelection(
    request: ProviderSelectionRequest,
    prompt: string,
    enableStreaming: boolean = false
  ): Promise<AIResponse> {
    const { userId, functionType, userTier, userPreference } = request;
    
    // Select the appropriate provider
    const providerSelection = await this.selectProvider(request);
    
    // Check rate limits
    if (!providerSelection.rateLimitStatus.isAllowed) {
      throw new Error(`Rate limit exceeded for ${providerSelection.provider}. Try again in ${providerSelection.rateLimitStatus.retryAfter} seconds.`);
    }

    // Get API key for the selected provider
    const apiKey = this.getApiKey(providerSelection.provider);

    
    // Validate API key exists
    if (!apiKey || apiKey.trim() === '') {
      throw new Error(`API key not configured for ${providerSelection.provider}. Please set the appropriate environment variable.`);
    }
    
    const config: AIProviderConfig = {
      provider: providerSelection.provider,
      model: providerSelection.model,
      apiKey,
      temperature: 0.7,
      maxTokens: 4000
    };

    try {
      const response = enableStreaming 
        ? await this.generateContentWithStreaming(config, prompt, userId)
        : await this.generateContent(config, prompt, userId);
      
      // Record successful request for rate limiting
      if (providerSelection.provider === AIProvider.OPENROUTER) {
        OpenRouterRateLimiter.recordRequest(userId, providerSelection.model);
      }
      
      return response;
    } catch (error: any) {
      console.error(`Failed to generate content with ${providerSelection.provider}:`, error);
      
      // Try fallback if available
      if (providerSelection.fallbackAvailable && userTier !== SubscriptionTier.FREE) {

        const fallbackProvider = providerSelection.provider === AIProvider.GOOGLE_GEMINI 
          ? AIProvider.OPENROUTER 
          : AIProvider.GOOGLE_GEMINI;
        
        const fallbackApiKey = this.getApiKey(fallbackProvider);
        if (fallbackApiKey) {
          const fallbackConfig: AIProviderConfig = {
            provider: fallbackProvider,
            model: fallbackProvider === AIProvider.GOOGLE_GEMINI 
              ? this.getDefaultGeminiModel(functionType)
              : this.getDefaultOpenRouterModel(functionType),
            apiKey: fallbackApiKey,
            temperature: 0.7,
            maxTokens: 4000
          };
          
          return enableStreaming 
            ? await this.generateContentWithStreaming(fallbackConfig, prompt, userId)
            : await this.generateContent(fallbackConfig, prompt, userId);
        }
      }
      
      throw error;
    }
  }

  /**
   * Call Google Gemini API
   */
  private static async callGemini(
    config: AIProviderConfig,
    prompt: string,
    startTime: number
  ): Promise<AIResponse> {
    // Get or create Gemini instance
    let gemini = this.geminiInstances.get(config.apiKey);
    if (!gemini) {
      gemini = new GoogleGenerativeAI(config.apiKey);
      this.geminiInstances.set(config.apiKey, gemini);
    }

    const model = gemini.getGenerativeModel({ 
      model: config.model,
      generationConfig: {
        temperature: config.temperature || 0.7,
        maxOutputTokens: config.maxTokens || 4000,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      content: text,
      success: true,
      provider: AIProvider.GOOGLE_GEMINI,
      model: config.model,
      responseTime: Date.now() - startTime,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0
      }
    };
  }

  /**
   * Call Google Gemini API with streaming
   */
  private static async callGeminiWithStreaming(
    config: AIProviderConfig,
    prompt: string,
    startTime: number
  ): Promise<AIResponse> {
    // Get or create Gemini instance
    let gemini = this.geminiInstances.get(config.apiKey);
    if (!gemini) {
      gemini = new GoogleGenerativeAI(config.apiKey);
      this.geminiInstances.set(config.apiKey, gemini);
    }

    const model = gemini.getGenerativeModel({ 
      model: config.model,
      generationConfig: {
        temperature: config.temperature || 0.7,
        maxOutputTokens: config.maxTokens || 4000,
      }
    });

    const result = await model.generateContentStream(prompt);
    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    // Create async iterable for streaming
    const stream = async function* () {
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullContent += chunkText;
        
        // Update token usage if available
        if (chunk.usageMetadata) {
          inputTokens = chunk.usageMetadata.promptTokenCount || 0;
          outputTokens = chunk.usageMetadata.candidatesTokenCount || 0;
        }
        
        yield chunkText;
      }
    };

    return {
      content: fullContent,
      success: true,
      provider: AIProvider.GOOGLE_GEMINI,
      model: config.model,
      responseTime: Date.now() - startTime,
      stream: stream(),
      usage: {
        inputTokens,
        outputTokens
      }
    };
  }

  /**
   * Call OpenRouter API
   */
  private static async callOpenRouter(
    config: AIProviderConfig,
    prompt: string,
    startTime: number,
    userId?: string
  ): Promise<AIResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'RecapHorizon'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return {
      content,
      success: true,
      provider: AIProvider.OPENROUTER,
      model: config.model,
      responseTime: Date.now() - startTime,
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0
      }
    };
  }

  /**
   * Call OpenRouter API with streaming
   */
  private static async callOpenRouterWithStreaming(
    config: AIProviderConfig,
    prompt: string,
    startTime: number,
    userId?: string
  ): Promise<AIResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'RecapHorizon'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4000,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    // Create async iterable for streaming
    const stream = async function* () {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullContent += content;
                  yield content;
                }

                // Update token usage if available
                if (parsed.usage) {
                  inputTokens = parsed.usage.prompt_tokens || 0;
                  outputTokens = parsed.usage.completion_tokens || 0;
                }
              } catch (e) {
                // Skip invalid JSON lines
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    };

    return {
      content: fullContent,
      success: true,
      provider: AIProvider.OPENROUTER,
      model: config.model,
      responseTime: Date.now() - startTime,
      stream: stream(),
      usage: {
        inputTokens,
        outputTokens
      }
    };
  }

  /**
   * Select the appropriate provider based on user tier and preferences
   */
  static async selectProvider(
    request: ProviderSelectionRequest
  ): Promise<ProviderSelectionResponse> {
    const { userId, functionType, userTier, userPreference } = request;

    // Free users can only use OpenRouter
    if (userTier === SubscriptionTier.FREE) {
      const model = this.getDefaultOpenRouterModel(functionType);
      const rateLimitStatus = await OpenRouterRateLimiter.checkRateLimit(userId, model);
      
      return {
        provider: AIProvider.OPENROUTER,
        model,
        rateLimitStatus,
        fallbackAvailable: false
      };
    }

    // For paid users, respect their preference if set
    if (userPreference) {
      const model = userPreference === AIProvider.GOOGLE_GEMINI 
        ? this.getDefaultGeminiModel(functionType)
        : this.getDefaultOpenRouterModel(functionType);
      
      const rateLimitStatus = userPreference === AIProvider.OPENROUTER
        ? await OpenRouterRateLimiter.checkRateLimit(userId, model)
        : { isAllowed: true, requestsRemaining: 1000 };

      return {
        provider: userPreference,
        model,
        rateLimitStatus,
        fallbackAvailable: true
      };
    }

    // Default to Gemini for paid users
    const model = this.getDefaultGeminiModel(functionType);
    return {
      provider: AIProvider.GOOGLE_GEMINI,
      model,
      rateLimitStatus: { isAllowed: true, requestsRemaining: 1000 },
      fallbackAvailable: true
    };
  }

  /**
   * Get API key for the specified provider
   */
  private static getApiKey(provider: AIProvider): string | undefined {
    switch (provider) {
      case AIProvider.GOOGLE_GEMINI:
        return process.env.REACT_APP_GEMINI_API_KEY;
      case AIProvider.OPENROUTER:
        return process.env.REACT_APP_OPENROUTER_API_KEY;
      default:
        return undefined;
    }
  }

  /**
   * Get default Gemini model for a specific function
   */
  private static getDefaultGeminiModel(functionType: AIFunction): string {
    // Use high-quality models for complex tasks, flash for simpler ones
    const complexTasks = [
      AIFunction.ANALYSIS_GENERATION,
      AIFunction.BUSINESS_CASE,
      AIFunction.GENERAL_ANALYSIS
    ];
    
    return complexTasks.includes(functionType) ? 'gemini-2.0-flash-exp' : 'gemini-2.5-flash';
  }

  /**
   * Get default OpenRouter model for a specific function
   */
  private static getDefaultOpenRouterModel(functionType: AIFunction): string {
    // Use appropriate free models based on function type
    switch (functionType) {
      case AIFunction.EXPERT_CHAT:
      case AIFunction.EMAIL_COMPOSITION:
        return 'quasar-alpha:free';
      case AIFunction.ANALYSIS_GENERATION:
      case AIFunction.BUSINESS_CASE:
        return 'deepseek-v3-base:free';
      default:
        return 'scout:free';
    }
  }

  /**
   * Categorize errors for better handling
   */
  private static categorizeError(error: any): AIProviderError {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('rate limit') || message.includes('429')) {
        return AIProviderError.RATE_LIMIT_EXCEEDED;
      }
      if (message.includes('api key') || message.includes('401') || message.includes('403')) {
        return AIProviderError.API_KEY_INVALID;
      }
      if (message.includes('quota') || message.includes('billing')) {
        return AIProviderError.QUOTA_EXCEEDED;
      }
      if (message.includes('model') || message.includes('404')) {
        return AIProviderError.MODEL_UNAVAILABLE;
      }
      if (message.includes('network') || message.includes('timeout')) {
        return AIProviderError.NETWORK_ERROR;
      }
      if (message.includes('content') || message.includes('safety')) {
        return AIProviderError.CONTENT_FILTERED;
      }
    }
    
    return AIProviderError.UNKNOWN_ERROR;
  }

  /**
   * Check if a provider is available
   */
  static async checkProviderHealth(provider: AIProvider, apiKey: string): Promise<boolean> {
    try {
      if (provider === AIProvider.OPENROUTER) {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        return response.ok;
      } else if (provider === AIProvider.GOOGLE_GEMINI) {
        const gemini = new GoogleGenerativeAI(apiKey);
        const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
        await model.generateContent('test');
        return true;
      }
    } catch (error) {
      console.error(`Provider health check failed for ${provider}:`, error);
      return false;
    }
    
    return false;
  }
}