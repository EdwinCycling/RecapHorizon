/**
 * Startup Validation utilities for RecapHorizon
 * Validates all critical services at application startup
 */

import { ApiValidator } from './apiValidator';
import { FirestoreHealthChecker } from './firestoreHealthCheck';
import { errorHandler } from './errorHandler';

type TranslationFunction = (key: string, fallback?: string) => string;

export interface StartupValidationResult {
  isReady: boolean;
  criticalIssues: string[];
  warnings: string[];
  services: {
    firebase: boolean;
    firestore: boolean;
    googleSpeechApi: boolean;
  };
  recommendations: string[];
}

export class StartupValidator {
  private static validationCache = new Map<string, { result: StartupValidationResult; timestamp: number }>();
  private static readonly CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

  /**
   * Comprehensive startup validation
   */
  static async validateStartup(userId?: string, t?: TranslationFunction): Promise<StartupValidationResult> {
    // Check cache first
    const cacheKey = `startup_${userId || 'anonymous'}`;
    const cached = this.validationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }
    

    
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const services = {
      firebase: false,
      firestore: false,
      googleSpeechApi: false
    };

    // 1. Validate Firebase Configuration
    try {
      const firebaseValidation = ApiValidator.validateFirebaseConfig();
      if (firebaseValidation.isValid) {
        services.firebase = true;
      } else {
        criticalIssues.push(firebaseValidation.error || 'Firebase configuratie ongeldig');
        if (firebaseValidation.suggestion) {
          recommendations.push(firebaseValidation.suggestion);
        }

      }
    } catch (error: any) {
      criticalIssues.push(t?.('firebaseConfigValidationFailed', 'Firebase configuratie kan niet worden gevalideerd') || 'Firebase configuratie kan niet worden gevalideerd');
      console.error(t?.('firebaseValidationError', '❌ Firebase validation error:') || '❌ Firebase validation error:', error);
    }

    // 2. Validate Firestore Health
    try {
      const firestoreHealth = await FirestoreHealthChecker.performHealthCheck(userId, t);
      if (firestoreHealth.isHealthy) {
        services.firestore = true;
      } else {
        if (firestoreHealth.testResults.basicConnection) {
          warnings.push(...firestoreHealth.issues);
        } else {
          criticalIssues.push(...firestoreHealth.issues);
        }
        recommendations.push(...firestoreHealth.suggestions);
        console.warn(t?.('firestoreHealthIssues') || '⚠️ Firestore health issues:', firestoreHealth.issues);
      }
    } catch (error: any) {
      criticalIssues.push(t?.('firestoreHealthCheckFailed') || 'Firestore health check failed');
      console.error(t?.('firestoreHealthError') || '❌ Firestore health check error:', error);
      
      // Use error handler for better diagnostics
      const diagnostics = FirestoreHealthChecker.diagnoseFirestoreError(error, t);
      recommendations.push(...diagnostics.suggestedActions);
    }

    // 3. Validate Google Gemini AI API (if API key is available)
    const googleApiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
    if (googleApiKey) {
      try {
        const speechApiValidation = await ApiValidator.validateGoogleSpeechApi(googleApiKey);
        if (speechApiValidation.isValid) {
          services.googleSpeechApi = true;
        } else {
          warnings.push(speechApiValidation.error || 'Google Gemini AI API niet beschikbaar');
          if (speechApiValidation.suggestion) {
            recommendations.push(speechApiValidation.suggestion);
          }
          console.warn(t?.('googleSpeechApiIssues') || '⚠️ Google Gemini AI API issues:', speechApiValidation.error);
        }
      } catch (error: any) {
        warnings.push('Google Gemini AI API validatie gefaald');
        console.error(t?.('googleSpeechApiError') || '❌ Google Gemini AI API validation error:', error);
      }
    } else {
      // Only show Google Gemini AI API warnings in development mode
      if (import.meta.env.DEV) {
        warnings.push('Google Gemini AI API key niet geconfigureerd');
        recommendations.push('Configureer VITE_GOOGLE_CLOUD_API_KEY voor transcriptie functionaliteit');
        console.info(t?.('googleSpeechApiNotConfigured') || 'ℹ️ Google Gemini AI API key not configured (development mode)');
      }
    }

    // 4. Additional environment checks
    this.performEnvironmentChecks(warnings, recommendations, t);

    const isReady = services.firebase && criticalIssues.length === 0;

    // Log summary
    if (isReady) {
      if (warnings.length > 0) {
        console.warn(t?.('nonCriticalWarnings') || '⚠️ Non-critical warnings:', warnings);
      }
    } else {
      console.error(t?.('startupValidationFailed') || '🚨 Startup validation failed!');
      console.error(t?.('criticalIssues') || '❌ Critical issues:', criticalIssues);
      console.error(t?.('servicesStatus') || '📊 Services status:', services);
    }

    const result = {
      isReady,
      criticalIssues,
      warnings,
      services,
      recommendations
    };
    
    // Cache the result
    this.validationCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
    
    return result;
  }

  /**
   * Quick startup check for essential services only
   */
  static async quickStartupCheck(t?: TranslationFunction): Promise<boolean> {
    try {
      // Check Firebase config
      const firebaseValidation = ApiValidator.validateFirebaseConfig();
      if (!firebaseValidation.isValid) {
        return false;
      }

      // Quick Firestore connectivity test
      const firestoreConnected = await FirestoreHealthChecker.quickConnectivityTest();
      if (!firestoreConnected) {
        return false;
      }

      return true;
    } catch (error) {
      console.error(t?.('quickStartupCheckFailed', 'Quick startup check failed:') || 'Quick startup check failed:', error);
      return false;
    }
  }

  /**
   * Perform additional environment checks
   */
  private static performEnvironmentChecks(
    warnings: string[],
    recommendations: string[],
    t?: TranslationFunction
  ): void {
    // Check if running in development mode

    // Check browser compatibility
    if (typeof navigator !== 'undefined') {
      // Check for required APIs
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        warnings.push('MediaDevices API niet beschikbaar - audio opname werkt mogelijk niet');
        recommendations.push('Gebruik een moderne browser die MediaDevices API ondersteunt');
      }

      if (!window.MediaRecorder) {
        warnings.push('MediaRecorder API niet beschikbaar - audio opname werkt niet');
        recommendations.push('Gebruik een browser die MediaRecorder API ondersteunt');
      }

      // Check for HTTPS in production
      if (!import.meta.env.DEV && window.location.protocol !== 'https:') {
        warnings.push('Applicatie draait niet op HTTPS - sommige functies werken mogelijk niet');
        recommendations.push('Gebruik HTTPS voor volledige functionaliteit');
      }
    }

    // Check for optional environment variables (only log in development)
    if (import.meta.env.DEV) {
      const optionalEnvVars = [
        'VITE_GOOGLE_CLOUD_API_KEY',
        'VITE_RECAPTCHA_SITE_KEY'
      ];

      optionalEnvVars.forEach(varName => {
        if (!import.meta.env[varName]) {
          const message = t?.('optionalEnvVarNotSet')?.replace('{varName}', varName) || `ℹ️ Optionele omgevingsvariabele ${varName} niet ingesteld`;
          console.info(message);
        }
      });
    }
  }

  /**
   * Generate user-friendly startup report
   */
  static generateStartupReport(validation: StartupValidationResult): string {
    let report = '📋 **RecapHorizon Startup Report**\n\n';

    // Overall status
    if (validation.isReady) {
      report += '✅ **Status**: Applicatie is klaar voor gebruik\n\n';
    } else {
      report += '❌ **Status**: Kritieke problemen gevonden\n\n';
    }

    // Services status
    report += '🔧 **Services Status**:\n';
    report += `- Firebase: ${validation.services.firebase ? '✅' : '❌'}\n`;
    report += `- Firestore: ${validation.services.firestore ? '✅' : '❌'}\n`;
    report += `- Google Gemini AI API: ${validation.services.googleSpeechApi ? '✅' : '⚠️'}\n\n`;

    // Critical issues
    if (validation.criticalIssues.length > 0) {
      report += '🚨 **Kritieke Problemen**:\n';
      validation.criticalIssues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      report += '\n';
    }

    // Warnings
    if (validation.warnings.length > 0) {
      report += '⚠️ **Waarschuwingen**:\n';
      validation.warnings.forEach(warning => {
        report += `- ${warning}\n`;
      });
      report += '\n';
    }

    // Recommendations
    if (validation.recommendations.length > 0) {
      report += '💡 **Aanbevelingen**:\n';
      validation.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }

    return report;
  }
}