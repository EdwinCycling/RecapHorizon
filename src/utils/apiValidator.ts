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

  /**
   * Set the translation function for the ApiValidator
   */
  static setTranslation(translationFunction: TranslationFunction) {
    this.t = translationFunction;
  }

  /**
   * Validates Google Cloud Speech API configuration
   */
  static async validateGoogleSpeechApi(apiKey: string): Promise<ApiValidationResult> {
    if (!apiKey || apiKey.trim() === '') {
      return {
        isValid: false,
        error: 'Google Cloud Speech API key is niet geconfigureerd',
        suggestion: 'Voeg een geldige API key toe in de omgevingsvariabelen'
      };
    }

    // Basic format validation for Google API keys
    if (!apiKey.startsWith('AIza') || apiKey.length < 35) {
      return {
        isValid: false,
        error: 'Google Cloud Speech API key heeft een ongeldig formaat',
        suggestion: 'Controleer of de API key correct is gekopieerd uit Google Cloud Console'
      };
    }

    try {
      // Test API availability with a minimal request
      const testResponse = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config: {
              encoding: 'WEBM_OPUS',
              sampleRateHertz: 48000,
              languageCode: 'nl-NL',
            },
            audio: {
              content: '', // Empty content for validation
            },
          }),
        }
      );

      if (testResponse.status === 400) {
        // Expected error for empty audio content, but API key is valid
        return { isValid: true };
      }

      if (testResponse.status === 403) {
        return {
          isValid: false,
          error: 'Google Cloud Speech API toegang geweigerd',
          suggestion: 'Controleer of de API key geldig is en Speech-to-Text API is ingeschakeld'
        };
      }

      if (testResponse.status === 429) {
        return {
          isValid: false,
          error: 'Google Cloud Speech API quota overschreden',
          suggestion: 'Wacht even en probeer opnieuw, of controleer je quota in Google Cloud Console'
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: 'Kan geen verbinding maken met Google Cloud Speech API',
        suggestion: 'Controleer je internetverbinding en firewall instellingen'
      };
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
      console.error(ApiValidator.t ? ApiValidator.t('apiCallFailed', { apiName }) : `API call failed for ${apiName}:`, error);

      if (attempts < this.maxRetries) {
        // Increment retry count
        this.retryAttempts.set(apiName, attempts + 1);
        
        // Calculate backoff delay
        const delay = Math.min(
          1000 * Math.pow(this.backoffMultiplier, attempts),
          10000 // Max 10 seconds
        );
        
        console.log(ApiValidator.t ? ApiValidator.t('retryingApiCall', { apiName, delay, attempt: attempts + 1, maxRetries: this.maxRetries }) : `Retrying ${apiName} in ${delay}ms (attempt ${attempts + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.executeWithFallback(apiCall, fallbackCall, apiName);
      }

      // All retries exhausted, try fallback if available
      if (fallbackCall) {
        console.log(ApiValidator.t ? ApiValidator.t('usingFallbackApi', { apiName }) : `Using fallback for ${apiName}`);
        try {
          return await fallbackCall();
        } catch (fallbackError) {
          console.error(ApiValidator.t ? ApiValidator.t('fallbackAlsoFailed', { apiName }) : `Fallback also failed for ${apiName}:`, fallbackError);
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