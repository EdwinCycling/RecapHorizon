// Centralized Error Handling with Security-First Approach

type TranslationFunction = (key: string, params?: Record<string, any>) => string;

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
      // In development, log to console (but still don't expose to user)
      console.error(SecureErrorHandler.t ? SecureErrorHandler.t('errorHandlerLog', { errorId: entry.errorId, errorType: entry.errorType }) : `[${entry.errorId}] ${entry.errorType}:`, entry.originalMessage);
      if (entry.stackTrace) {
        console.error(SecureErrorHandler.t ? SecureErrorHandler.t('errorStackTrace') : 'Stack trace:', entry.stackTrace);
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
}

// Export singleton instance
export const errorHandler = new SecureErrorHandler();

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