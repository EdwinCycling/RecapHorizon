/**
 * API Validation utilities for RecapHorizon
 * Validates API keys and service availability
 */

import { useTranslation } from '../hooks/useTranslation';

type TranslationFunction = (key: string, params?: Record<string, any>) => string;

export interface ApiValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

export class ApiValidator {
  public static t?: TranslationFunction;
  private static apiValidationCache = new Map<string, { result: ApiValidationResult; timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Set the translation function for the ApiValidator
   */
  static setTranslation(translationFunction: TranslationFunction) {
    this.t = translationFunction;
  }

  /**
   * Check if cached validation result is still valid
   */
  private static isCacheValid(cacheKey: string): boolean {
    const cached = this.apiValidationCache.get(cacheKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  /**
   * Get cached validation result
   */
  private static getCachedResult(cacheKey: string): ApiValidationResult | null {
    const cached = this.apiValidationCache.get(cacheKey);
    return cached ? cached.result : null;
  }

  /**
   * Cache validation result
   */
  private static setCachedResult(cacheKey: string, result: ApiValidationResult): void {
    this.apiValidationCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Validates Google Gemini AI API configuration
   */
  static async validateGoogleSpeechApi(apiKey: string): Promise<ApiValidationResult> {
    if (!apiKey || apiKey.trim() === '') {
      return {
        isValid: false,
        error: 'Google Gemini AI API key is niet geconfigureerd',
        suggestion: 'Voeg een geldige API key toe in de omgevingsvariabelen'
      };
    }

    // Basic format validation for Google API keys
    if (!apiKey.startsWith('AIza') || apiKey.length < 35) {
      return {
        isValid: false,
        error: 'Google Gemini AI API key heeft een ongeldig formaat',
        suggestion: 'Controleer of de API key correct is gekopieerd uit Google AI Studio'
      };
    }

    // Check cache first
    const cacheKey = `google_speech_${apiKey.substring(0, 10)}`; // Use first 10 chars as cache key
    if (this.isCacheValid(cacheKey)) {
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }

    try {
      // Test API availability with a minimal request to Gemini AI
      const testResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Test'
              }]
            }]
          }),
        }
      );

      if (testResponse.status === 200) {
        // API key is valid and working
        const result = { isValid: true };
        this.setCachedResult(cacheKey, result);
        return result;
      }

      if (testResponse.status === 403) {
        const result = {
          isValid: false,
          error: 'Google Gemini AI API toegang geweigerd',
          suggestion: 'Controleer of de API key geldig is en Gemini AI API is ingeschakeld'
        };
        this.setCachedResult(cacheKey, result);
        return result;
      }

      if (testResponse.status === 429) {
        const result = {
          isValid: false,
          error: 'Google Gemini AI API quota overschreden',
          suggestion: 'Wacht even en probeer opnieuw, of controleer je quota in Google AI Studio'
        };
        this.setCachedResult(cacheKey, result);
        return result;
      }

      const result = { isValid: true };
       this.setCachedResult(cacheKey, result);
       return result;
    } catch (error) {
      const result = {
        isValid: false,
        error: 'Kan geen verbinding maken met Google Gemini AI API',
        suggestion: 'Controleer je internetverbinding en firewall instellingen'
      };
      // Cache error results for a shorter duration to allow for quick retry
      this.setCachedResult(cacheKey, result);
      return result;
    }
  }

  /**
   * Validates Firebase configuration
   */
  static validateFirebaseConfig(): ApiValidationResult {
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => {
      const value = import.meta.env[varName];
      return !value || value.trim() === '';
    });

    if (missingVars.length > 0) {
      return {
        isValid: false,
        error: `Firebase configuratie onvolledig: ${missingVars.join(', ')} ontbreken`,
        suggestion: 'Controleer je .env bestand en zorg dat alle Firebase variabelen zijn ingesteld'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates all critical APIs at startup
   */
  static async validateAllApis(): Promise<{
    firebase: ApiValidationResult;
    googleSpeech: ApiValidationResult;
    overall: boolean;
  }> {
    const firebase = this.validateFirebaseConfig();
    const googleSpeech = await this.validateGoogleSpeechApi(
      import.meta.env.VITE_GOOGLE_CLOUD_API_KEY || ''
    );

    return {
      firebase,
      googleSpeech,
      overall: firebase.isValid && googleSpeech.isValid
    };
  }
}

/**
 * Fallback mechanism for API failures
 */
export class ApiFallbackManager {
  private static retryAttempts = new Map<string, number>();
  private static maxRetries = 3;
  private static backoffMultiplier = 2;

  /**
   * Executes API call with automatic retry and fallback
   */
  static async executeWithFallback<T>(
    apiCall: () => Promise<T>,
    fallbackCall?: () => Promise<T>,
    apiName: string = 'unknown'
  ): Promise<T> {
    const attempts = this.retryAttempts.get(apiName) || 0;

    try {
      const result = await apiCall();
      // Reset retry count on success
      this.retryAttempts.set(apiName, 0);
      return result;
    } catch (error: any) {
      console.error(ApiValidator.t ? ApiValidator.t('apiCallFailed', { apiName }) : `API call failed for ${apiName}`);

      if (attempts < this.maxRetries) {
        // Increment retry count
        this.retryAttempts.set(apiName, attempts + 1);
        
        // Calculate backoff delay
        const delay = Math.min(
          1000 * Math.pow(this.backoffMultiplier, attempts),
          10000 // Max 10 seconds
        );
        

        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.executeWithFallback(apiCall, fallbackCall, apiName);
      }

      // All retries exhausted, try fallback if available
      if (fallbackCall) {

        try {
          return await fallbackCall();
        } catch (fallbackError) {
          console.error(ApiValidator.t ? ApiValidator.t('fallbackAlsoFailed', { apiName }) : `Fallback also failed for ${apiName}`);
          throw error; // Throw original error
        }
      }

      throw error;
    }
  }

  /**
   * Resets retry counts (useful for testing or manual reset)
   */
  static resetRetryCounters(): void {
    this.retryAttempts.clear();
  }
}