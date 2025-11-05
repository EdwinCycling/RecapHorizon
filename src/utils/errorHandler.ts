// Centralized Error Handling with Security-First Approach

import { TranslationFunction } from '../../types';

export interface ErrorLogEntry {
  timestamp: number;
  errorId: string;
  userId?: string;
  sessionId?: string;
  errorType: string;
  originalMessage: string;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
  additionalContext?: Record<string, any>;
}

export enum ErrorType {
  AUTHENTICATION = 'auth',
  AUTHORIZATION = 'authz',
  VALIDATION = 'validation',
  NETWORK = 'network',
  API = 'api',
  SESSION = 'session',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

export interface UserFriendlyError {
  message: string;
  errorId: string;
  canRetry: boolean;
  suggestedAction?: string;
}

class SecureErrorHandler {
  private errorLog: ErrorLogEntry[] = [];
  private maxLogSize = 1000;
  private static t?: TranslationFunction;

  /**
   * Set the translation function for the ErrorHandler
   */
  static setTranslation(translationFunction: TranslationFunction) {
    this.t = translationFunction;
  }
  
  // Generic user-friendly messages that don't reveal system details
  private readonly userMessages = {
    [ErrorType.AUTHENTICATION]: {
      message: 'Authentication failed. Please check your credentials and try again.',
      canRetry: true,
      suggestedAction: 'Verify your email and password, then try logging in again.'
    },
    [ErrorType.AUTHORIZATION]: {
      message: 'You do not have permission to perform this action.',
      canRetry: false,
      suggestedAction: 'Contact support if you believe this is an error.'
    },
    [ErrorType.VALIDATION]: {
      message: 'The information provided is invalid. Please check your input and try again.',
      canRetry: true,
      suggestedAction: 'Review the form fields and ensure all required information is provided correctly.'
    },
    [ErrorType.NETWORK]: {
      message: 'Network connection error. Please check your internet connection and try again.',
      canRetry: true,
      suggestedAction: 'Check your internet connection and refresh the page.'
    },
    [ErrorType.API]: {
      message: 'Service temporarily unavailable. Please try again in a few moments.',
      canRetry: true,
      suggestedAction: 'Wait a moment and try your request again.'
    },
    [ErrorType.SESSION]: {
      message: 'Your session has expired. Please log in again.',
      canRetry: true,
      suggestedAction: 'Log out and log back in to continue.'
    },
    [ErrorType.RATE_LIMIT]: {
      message: 'Too many requests. Please wait before trying again.',
      canRetry: true,
      suggestedAction: 'Wait a few minutes before making another request.'
    },
    [ErrorType.UNKNOWN]: {
      message: 'An unexpected error occurred. Please try again.',
      canRetry: true,
      suggestedAction: 'Refresh the page and try again. Contact support if the problem persists.'
    }
  };

  /**
   * Handle an error securely - log details internally, return generic message to user
   */
  handleError(
    error: Error | string,
    errorType: ErrorType = ErrorType.UNKNOWN,
    context?: {
      userId?: string;
      sessionId?: string;
      additionalContext?: Record<string, any>;
    }
  ): UserFriendlyError {
    const errorId = this.generateErrorId();
    const timestamp = Date.now();
    
    // Extract error details for logging
    const originalMessage = error instanceof Error ? error.message : String(error);
    const stackTrace = error instanceof Error ? error.stack : undefined;
    
    // Create detailed log entry (for internal use only)
    const logEntry: ErrorLogEntry = {
      timestamp,
      errorId,
      userId: context?.userId,
      sessionId: context?.sessionId,
      errorType,
      originalMessage,
      stackTrace,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      additionalContext: context?.additionalContext
    };
    
    // Log internally (in production, this would go to a secure logging service)
    this.logError(logEntry);
    
    // Return generic user-friendly error
    const userMessage = this.userMessages[errorType];
    return {
      message: userMessage.message,
      errorId,
      canRetry: userMessage.canRetry,
      suggestedAction: userMessage.suggestedAction
    };
  }

  /**
   * Handle authentication-specific errors
   */
  handleAuthError(
    error: Error | string,
    context?: { userId?: string; sessionId?: string; attemptedAction?: string }
  ): UserFriendlyError {
    // Enhanced Firebase auth error handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorId = this.generateErrorId();
    
    let userFriendlyMessage;
    
    if (errorMessage.includes('auth/invalid-credential')) {
      userFriendlyMessage = {
        message: 'Ongeldige inloggegevens. Controleer je email en wachtwoord.',
        errorId,
        canRetry: true,
        suggestedAction: 'Verifieer je email en wachtwoord en probeer opnieuw in te loggen.'
      };
    } else if (errorMessage.includes('auth/too-many-requests')) {
      userFriendlyMessage = {
        message: 'Te veel inlogpogingen. Probeer het over enkele minuten opnieuw.',
        errorId,
        canRetry: true,
        suggestedAction: 'Wacht 5-10 minuten voordat je opnieuw probeert in te loggen.'
      };
    } else {
      userFriendlyMessage = {
        ...this.userMessages[ErrorType.AUTHENTICATION],
        errorId
      };
    }
    
    // Log the detailed error
    this.logError({
      timestamp: Date.now(),
      errorId,
      userId: context?.userId,
      sessionId: context?.sessionId,
      errorType: ErrorType.AUTHENTICATION,
      originalMessage: errorMessage,
      stackTrace: error instanceof Error ? error.stack : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      additionalContext: { attemptedAction: context?.attemptedAction }
    });
    
    return userFriendlyMessage;
  }

  /**
   * Handle API errors with automatic type detection
   */
  handleApiError(
    error: Error | string,
    statusCode?: number,
    context?: { userId?: string; sessionId?: string; endpoint?: string }
  ): UserFriendlyError {
    let errorType = ErrorType.API;
    
    // Determine error type based on status code
    if (statusCode) {
      if (statusCode === 401) errorType = ErrorType.AUTHENTICATION;
      else if (statusCode === 403) errorType = ErrorType.AUTHORIZATION;
      else if (statusCode === 400) errorType = ErrorType.VALIDATION;
      else if (statusCode === 429) errorType = ErrorType.RATE_LIMIT;
      else if (statusCode >= 500) errorType = ErrorType.API;
    }
    
    // Enhanced handling for server errors
    if (statusCode === 500 || statusCode === 503) {
      const errorId = this.generateErrorId();
      const userFriendlyMessage = {
        message: 'De service is tijdelijk overbelast. Probeer het over enkele minuten opnieuw.',
        errorId,
        canRetry: true,
        suggestedAction: 'Wacht 2-3 minuten en probeer het opnieuw. Als het probleem aanhoudt, neem contact op met support.'
      };
      
      // Log the detailed error for debugging
      this.logError({
        timestamp: Date.now(),
        errorId,
        userId: context?.userId,
        sessionId: context?.sessionId,
        errorType: ErrorType.API,
        originalMessage: error instanceof Error ? error.message : String(error),
        stackTrace: error instanceof Error ? error.stack : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        additionalContext: { 
          statusCode, 
          endpoint: context?.endpoint 
        }
      });
      
      return userFriendlyMessage;
    }
    
    return this.handleError(error, errorType, {
      userId: context?.userId,
      sessionId: context?.sessionId,
      additionalContext: { 
        statusCode, 
        endpoint: context?.endpoint 
      }
    });
  }

  /**
   * Handle network errors
   */
  handleNetworkError(
    error: Error | string,
    context?: { userId?: string; sessionId?: string; requestUrl?: string }
  ): UserFriendlyError {
    return this.handleError(error, ErrorType.NETWORK, {
      userId: context?.userId,
      sessionId: context?.sessionId,
      additionalContext: { requestUrl: context?.requestUrl }
    });
  }

  /**
   * Handle validation errors
   */
  handleValidationError(
    error: Error | string,
    context?: { userId?: string; sessionId?: string; fieldName?: string; inputValue?: string }
  ): UserFriendlyError {
    return this.handleError(error, ErrorType.VALIDATION, {
      userId: context?.userId,
      sessionId: context?.sessionId,
      additionalContext: { 
        fieldName: context?.fieldName,
        // Don't log sensitive input values
        inputValueLength: context?.inputValue?.length
      }
    });
  }

  /**
   * Get error by ID (for support purposes)
   */
  getErrorById(errorId: string): ErrorLogEntry | undefined {
    return this.errorLog.find(entry => entry.errorId === errorId);
  }

  /**
   * Get recent errors for debugging (sanitized)
   */
  getRecentErrors(limit: number = 10): Partial<ErrorLogEntry>[] {
    return this.errorLog
      .slice(-limit)
      .map(entry => ({
        timestamp: entry.timestamp,
        errorId: entry.errorId,
        errorType: entry.errorType,
        userId: entry.userId ? '***' : undefined // Mask user ID for privacy
      }));
  }

  /**
   * Clear error log (for privacy/memory management)
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  private logError(entry: ErrorLogEntry): void {
    // Add to internal log
    this.errorLog.push(entry);
    
    // Maintain log size limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
    
    // In production, send to secure logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(entry);
    } else {
      // In development, log to console only when debug flag is enabled to reduce noise
      const debugEnabled = String((import.meta as any)?.env?.VITE_DEBUG_ERRORS || '').toLowerCase() === 'true';
      if (debugEnabled) {
        console.debug(
          SecureErrorHandler.t
            ? SecureErrorHandler.t('errorHandlerLog', { errorId: entry.errorId, errorType: entry.errorType })
            : `[${entry.errorId}] ${entry.errorType}:`,
          entry.originalMessage
        );
        if (entry.stackTrace) {
          console.debug(SecureErrorHandler.t ? SecureErrorHandler.t('errorStackTrace') : 'Stack trace:', entry.stackTrace);
        }
      }
    }
  }

  private sendToLoggingService(entry: ErrorLogEntry): void {
    // In a real implementation, this would send to a secure logging service
    // like AWS CloudWatch, Datadog, or similar
    try {
      // Example: Send to logging endpoint
      // fetch('/api/logs/error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (loggingError) {
      // Don't let logging errors break the application
      console.warn(SecureErrorHandler.t ? SecureErrorHandler.t('failedToSendErrorLog') : 'Failed to send error to logging service:', loggingError);
    }
  }

  private generateErrorId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `err_${timestamp}_${random}`;
  }

  // Generate localized AI provider error messages
  getAIProviderErrorMessage(
    errorType: string,
    provider: string,
    language: string = 'nl',
    options?: { retryDelaySeconds?: number; isFreeTier?: boolean }
  ): string {
    const retryDelay = options?.retryDelaySeconds ?? 60;
    const minutes = Math.ceil(retryDelay / 60);
    const isFreeTier = !!options?.isFreeTier;

    const providerName = provider === 'google_gemini' ? 'Google Gemini' : (provider === 'openrouter' ? 'OpenRouter' : provider);
    const lang = ['nl','en','de','fr','es','pt'].includes((language || '').toLowerCase()) ? (language || 'nl').toLowerCase() : 'en';

    const formatMinutes = (l: string) => {
      switch (l) {
        case 'en': return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
        case 'de': return `${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`;
        case 'fr': return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
        case 'es': return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
        case 'pt': return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
        default:   return `${minutes} ${minutes === 1 ? 'minuut' : 'minuten'}`; // nl
      }
    };

    const keyBase = provider === 'google_gemini' ? 'aiErrors.gemini' : 'aiErrors.generic';
    let key = '';
    if (errorType === 'SERVER_OVERLOADED') {
      key = `${keyBase}.serverOverloaded`;
    } else if (errorType === 'QUOTA_EXCEEDED' || errorType === 'RATE_LIMIT_EXCEEDED') {
      key = provider === 'google_gemini' && isFreeTier ? 'aiErrors.gemini.dailyQuotaLimit' : `${keyBase}.rateLimit`;
    } else if (errorType === 'API_KEY_INVALID') {
      key = 'aiErrors.generic.apiKeyInvalid';
    } else if (errorType === 'MODEL_UNAVAILABLE') {
      key = 'aiErrors.generic.modelUnavailable';
    } else if (errorType === 'NETWORK_ERROR') {
      key = 'aiErrors.generic.networkError';
    } else if (errorType === 'CONTENT_FILTERED') {
      key = `${keyBase}.contentFiltered`;
    } else {
      key = 'aiErrors.generic.unknown';
    }

    if (SecureErrorHandler.t) {
      return SecureErrorHandler.t(key, { minutes: formatMinutes(lang), provider: providerName });
    }

    // Fallback templates when translation function is not set
    const templates: Record<string, any> = {
      nl: {
        serverOverloadedGemini: `Google Gemini servers zijn momenteel overbelast. Het systeem probeert automatisch andere modellen. Probeer het over ${formatMinutes('nl')} opnieuw als het probleem aanhoudt.`,
        dailyQuotaGemini: `Je hebt het dagelijkse quotum van 50 verzoeken voor Google Gemini bereikt. Probeer het over ${formatMinutes('nl')} opnieuw, of upgrade naar een betaald abonnement voor meer verzoeken.`,
        rateLimitGemini: `Google Gemini rate limit bereikt. Probeer het over ${formatMinutes('nl')} opnieuw.`,
        serverOverloadedGeneric: `${providerName} servers zijn momenteel overbelast. Probeer het over ${formatMinutes('nl')} opnieuw.`,
        rateLimitGeneric: `Rate limit bereikt voor ${providerName}. Probeer het over ${formatMinutes('nl')} opnieuw.`,
        apiKeyInvalid: `API sleutel voor ${providerName} is ongeldig of ontbreekt. Controleer je configuratie en probeer opnieuw.`,
        modelUnavailable: `Het gekozen AI-model is tijdelijk niet beschikbaar. Probeer het later opnieuw of kies een ander model.`,
        networkError: `Netwerkfout bij communicatie met ${providerName}. Controleer je internetverbinding en probeer opnieuw.`,
        contentFiltered: `De inhoud is geblokkeerd door het AI-veiligheidsbeleid van ${providerName}. Pas je invoer aan en probeer opnieuw.`,
        unknown: `Er is een onverwachte fout opgetreden bij ${providerName}. Probeer het later opnieuw.`
      },
      en: {
        serverOverloadedGemini: `Google Gemini servers are currently overloaded. The system will automatically try alternative models. Please try again in ${formatMinutes('en')} if the issue persists.`,
        dailyQuotaGemini: `You've reached the daily quota of 50 requests for Google Gemini. Please try again in ${formatMinutes('en')}, or upgrade to a paid plan for more requests.`,
        rateLimitGemini: `Google Gemini rate limit reached. Please try again in ${formatMinutes('en')}.`,
        serverOverloadedGeneric: `${providerName} servers are currently overloaded. Please try again in ${formatMinutes('en')}.`,
        rateLimitGeneric: `Rate limit reached for ${providerName}. Please try again in ${formatMinutes('en')}.`,
        apiKeyInvalid: `API key for ${providerName} is invalid or missing. Check your configuration and try again.`,
        modelUnavailable: `The selected AI model is temporarily unavailable. Please try again later or choose a different model.`,
        networkError: `Network error while communicating with ${providerName}. Check your internet connection and try again.`,
        contentFiltered: `Your content was blocked by ${providerName}'s safety policies. Adjust your input and try again.`,
        unknown: `An unexpected error occurred with ${providerName}. Please try again later.`
      },
      de: {
        serverOverloadedGemini: `Google Gemini-Server sind derzeit überlastet. Das System versucht automatisch alternative Modelle. Bitte versuche es in ${formatMinutes('de')} erneut, wenn das Problem weiterhin besteht.`,
        dailyQuotaGemini: `Du hast das tägliche Kontingent von 50 Anfragen für Google Gemini erreicht. Bitte versuche es in ${formatMinutes('de')} erneut oder wechsle auf einen kostenpflichtigen Plan für mehr Anfragen.`,
        rateLimitGemini: `Google Gemini Rate Limit erreicht. Bitte versuche es in ${formatMinutes('de')} erneut.`,
        serverOverloadedGeneric: `${providerName}-Server sind derzeit überlastet. Bitte versuche es in ${formatMinutes('de')} erneut.`,
        rateLimitGeneric: `Rate Limit für ${providerName} erreicht. Bitte versuche es in ${formatMinutes('de')} erneut.`,
        apiKeyInvalid: `API-Schlüssel für ${providerName} ist ungültig oder fehlt. Überprüfe deine Konfiguration und versuche es erneut.`,
        modelUnavailable: `Das ausgewählte KI-Modell ist vorübergehend nicht verfügbar. Bitte versuche es später erneut oder wähle ein anderes Modell.`,
        networkError: `Netzwerkfehler bei der Kommunikation mit ${providerName}. Überprüfe deine Internetverbindung und versuche es erneut.`,
        contentFiltered: `Deine Inhalte wurden durch die Sicherheitsrichtlinien von ${providerName} blockiert. Passe deine Eingabe an und versuche es erneut.`,
        unknown: `Ein unerwarteter Fehler ist bei ${providerName} aufgetreten. Bitte versuche es später erneut.`
      },
      fr: {
        serverOverloadedGemini: `Les serveurs Google Gemini sont actuellement surchargés. Le système essaiera automatiquement des modèles alternatifs. Veuillez réessayer dans ${formatMinutes('fr')} si le problème persiste.`,
        dailyQuotaGemini: `Vous avez atteint le quota quotidien de 50 requêtes pour Google Gemini. Veuillez réessayer dans ${formatMinutes('fr')}, ou passer à un abonnement payant pour plus de requêtes.`,
        rateLimitGemini: `Limite de taux Google Gemini atteinte. Veuillez réessayer dans ${formatMinutes('fr')}.`,
        serverOverloadedGeneric: `Les serveurs ${providerName} sont actuellement surchargés. Veuillez réessayer dans ${formatMinutes('fr')}.`,
        rateLimitGeneric: `Limite de taux atteinte pour ${providerName}. Veuillez réessayer dans ${formatMinutes('fr')}.`,
        apiKeyInvalid: `La clé API pour ${providerName} est invalide ou manquante. Vérifiez votre configuration et réessayez.`,
        modelUnavailable: `Le modèle d'IA sélectionné est temporairement indisponible. Réessayez plus tard ou choisissez un autre modèle.`,
        networkError: `Erreur réseau lors de la communication avec ${providerName}. Vérifiez votre connexion Internet et réessayez.`,
        contentFiltered: `Votre contenu a été bloqué par les politiques de sécurité de ${providerName}. Modifiez votre saisie et réessayez.`,
        unknown: `Une erreur inattendue s'est produite avec ${providerName}. Veuillez réessayer plus tard.`
      },
      es: {
        serverOverloadedGemini: `Los servidores de Google Gemini están sobrecargados en este momento. El sistema intentará automáticamente modelos alternativos. Vuelve a intentarlo en ${formatMinutes('es')} si el problema persiste.`,
        dailyQuotaGemini: `Has alcanzado la cuota diaria de 50 solicitudes para Google Gemini. Vuelve a intentarlo en ${formatMinutes('es')} o actualiza a un plan de pago para más solicitudes.`,
        rateLimitGemini: `Se alcanzó el límite de tasa de Google Gemini. Vuelve a intentarlo en ${formatMinutes('es')}.`,
        serverOverloadedGeneric: `Los servidores de ${providerName} están actualmente sobrecargados. Vuelve a intentarlo en ${formatMinutes('es')}.`,
        rateLimitGeneric: `Se alcanzó el límite de tasa para ${providerName}. Vuelve a intentarlo en ${formatMinutes('es')}.`,
        apiKeyInvalid: `La clave API para ${providerName} es inválida o falta. Verifica tu configuración y vuelve a intentarlo.`,
        modelUnavailable: `El modelo de IA seleccionado no está disponible temporalmente. Vuelve a intentarlo más tarde o elige otro modelo.`,
        networkError: `Error de red al comunicarse con ${providerName}. Verifica tu conexión a Internet y vuelve a intentarlo.`,
        contentFiltered: `Tu contenido fue bloqueado por las políticas de seguridad de ${providerName}. Ajusta tu entrada y vuelve a intentarlo.`,
        unknown: `Se produjo un error inesperado con ${providerName}. Vuelve a intentarlo más tarde.`
      },
      pt: {
        serverOverloadedGemini: `Os servidores do Google Gemini estão sobrecarregados no momento. O sistema tentará automaticamente modelos alternativos. Tente novamente em ${formatMinutes('pt')} se o problema persistir.`,
        dailyQuotaGemini: `Você atingiu a cota diária de 50 solicitações para o Google Gemini. Tente novamente em ${formatMinutes('pt')} ou atualize para um plano pago para mais solicitações.`,
        rateLimitGemini: `Limite de taxa do Google Gemini atingido. Tente novamente em ${formatMinutes('pt')}.`,
        serverOverloadedGeneric: `Os servidores ${providerName} estão sobrecarregados no momento. Tente novamente em ${formatMinutes('pt')}.`,
        rateLimitGeneric: `Limite de taxa atingido para ${providerName}. Tente novamente em ${formatMinutes('pt')}.`,
        apiKeyInvalid: `A chave da API para ${providerName} é inválida ou está ausente. Verifique sua configuração e tente novamente.`,
        modelUnavailable: `O modelo de IA selecionado está temporariamente indisponível. Tente novamente mais tarde ou escolha outro modelo.`,
        networkError: `Erro de rede ao se comunicar com ${providerName}. Verifique sua conexão com a Internet e tente novamente.`,
        contentFiltered: `Seu conteúdo foi bloqueado pelas políticas de segurança de ${providerName}. Ajuste sua entrada e tente novamente.`,
        unknown: `Ocorreu um erro inesperado com ${providerName}. Tente novamente mais tarde.`
      }
    };

    const tmpl = templates[lang] || templates['en'];
    if (provider === 'google_gemini') {
      if (errorType === 'SERVER_OVERLOADED') return tmpl.serverOverloadedGemini;
      if (errorType === 'QUOTA_EXCEEDED') return isFreeTier ? tmpl.dailyQuotaGemini : tmpl.rateLimitGemini;
      if (errorType === 'RATE_LIMIT_EXCEEDED') return tmpl.rateLimitGemini;
    }

    switch (errorType) {
      case 'SERVER_OVERLOADED': return tmpl.serverOverloadedGeneric;
      case 'QUOTA_EXCEEDED':
      case 'RATE_LIMIT_EXCEEDED': return tmpl.rateLimitGeneric;
      case 'API_KEY_INVALID': return tmpl.apiKeyInvalid;
      case 'MODEL_UNAVAILABLE': return tmpl.modelUnavailable;
      case 'NETWORK_ERROR': return tmpl.networkError;
      case 'CONTENT_FILTERED': return tmpl.contentFiltered;
      default: return tmpl.unknown;
    }
  }
}

// Export singleton instance
export const errorHandler = new SecureErrorHandler();
export const setErrorHandlerTranslation = (translationFunction: TranslationFunction) => {
  SecureErrorHandler.setTranslation(translationFunction);
};
export const getAIProviderErrorMessage = (
  errorType: string,
  provider: string,
  language?: string,
  options?: { retryDelaySeconds?: number; isFreeTier?: boolean }
) => errorHandler.getAIProviderErrorMessage(errorType, provider, language || 'nl', options);

// Convenience functions for common error scenarios
export const handleAuthError = (error: Error | string, context?: any) => 
  errorHandler.handleAuthError(error, context);

export const handleApiError = (error: Error | string, statusCode?: number, context?: any) => 
  errorHandler.handleApiError(error, statusCode, context);

export const handleNetworkError = (error: Error | string, context?: any) => 
  errorHandler.handleNetworkError(error, context);

export const handleValidationError = (error: Error | string, context?: any) => 
  errorHandler.handleValidationError(error, context);

export const handleGenericError = (error: Error | string, context?: any) => 
  errorHandler.handleError(error, ErrorType.UNKNOWN, context);

// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorHandler.handleError(
      event.error || event.message,
      ErrorType.UNKNOWN,
      {
        additionalContext: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      }
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(
      event.reason,
      ErrorType.UNKNOWN,
      {
        additionalContext: {
          type: 'unhandledPromiseRejection'
        }
      }
    );
  });
}