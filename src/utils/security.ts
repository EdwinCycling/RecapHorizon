/**
 * Security utilities for input validation and sanitization
 * Protects against XSS, injection attacks, and other security vulnerabilities
 */

// Import Firebase auth for session validation
import { auth } from '../firebase';

// Translation function type for internationalization
type TranslationFunction = (key: string, fallback?: string) => string;

// Extend Window interface for Firebase
declare global {
  interface Window {
    firebase?: {
      auth?: {
        currentUser: any;
      };
    };
  }
}

// Email validation regex - RFC 5322 compliant
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Disposable email domains to block
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
  'yopmail.com', 'temp-mail.org', 'throwaway.email', 'getnada.com',
  'maildrop.cc', 'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net',
  'spam4.me', 'bccto.me', 'chacuo.net', 'dispostable.com', 'fakeinbox.com'
];

// Suspicious email patterns
const SUSPICIOUS_EMAIL_PATTERNS = [
  /^[a-z]+\d+@/i, // Simple pattern like user123@
  /^test\d*@/i,   // Test emails
  /^admin\d*@/i,  // Admin emails
  /^noreply\d*@/i, // No-reply emails
  /\+.*@/,        // Plus addressing (can be legitimate but often used for spam)
];

// Common SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  // More specific SQL injection patterns that are less likely to match legitimate email content
  /(union\s+select|insert\s+into|delete\s+from|update\s+set|drop\s+table|create\s+table|alter\s+table)/i,
  /(exec\s*\(|execute\s*\(|sp_executesql)/i,
  /(\bor\s+1\s*=\s*1\b|\band\s+1\s*=\s*1\b)/i,
  /(--\s*$|#\s*$)/m, // SQL comments at end of line
  /(\';\s*drop|\';\s*delete|\';\s*insert)/i // Clear injection attempts
];

// XSS patterns
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>/gi,
  /<link[^>]*>/gi,
  /<meta[^>]*>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /on\w+\s*=/gi // Event handlers like onclick, onload, etc.
];

/**
 * Enhanced email validation with security checks
 * @param email - Email string to validate
 * @param options - Validation options
 * @returns validation result with details
 */
export const validateEmailEnhanced = (email: string, options: {
  allowDisposable?: boolean;
  allowSuspicious?: boolean;
  checkMXRecord?: boolean;
} = {}): {
  isValid: boolean;
  email?: string;
  error?: string;
  warnings?: string[];
} => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email must be a non-empty string' };
  }
  
  const trimmed = email.trim().toLowerCase();
  const warnings: string[] = [];
  
  // Basic length check
  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email address is too long (max 254 characters)' };
  }
  
  if (trimmed.length < 5) {
    return { isValid: false, error: 'Email address is too short' };
  }
  
  // Check for valid email format
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  // Extract domain
  const domain = trimmed.split('@')[1];
  if (!domain) {
    return { isValid: false, error: 'Invalid email format - missing domain' };
  }
  
  // Check for disposable email domains
  if (!options.allowDisposable && DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return { isValid: false, error: 'Disposable email addresses are not allowed' };
  }
  
  // Check for suspicious patterns
  if (!options.allowSuspicious) {
    const suspiciousPattern = SUSPICIOUS_EMAIL_PATTERNS.find(pattern => pattern.test(trimmed));
    if (suspiciousPattern) {
      warnings.push('Email pattern appears suspicious');
    }
  }
  
  // Check for consecutive dots
  if (trimmed.includes('..')) {
    return { isValid: false, error: 'Email contains consecutive dots' };
  }
  
  // Check for valid TLD (basic check)
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) {
    return { isValid: false, error: 'Invalid top-level domain' };
  }
  
  return {
    isValid: true,
    email: trimmed,
    warnings: warnings.length > 0 ? warnings : undefined
  };
};

/**
 * Legacy email validation function (kept for backward compatibility)
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const result = validateEmailEnhanced(email, { allowDisposable: true, allowSuspicious: true });
  return result.isValid;
};

/**
 * Enhanced email sanitization with security validation
 * @param email - Email string to sanitize
 * @param options - Sanitization options
 * @returns sanitization result
 */
export const sanitizeEmailEnhanced = (email: string, options: {
  allowDisposable?: boolean;
  allowSuspicious?: boolean;
} = {}): {
  isValid: boolean;
  email?: string;
  error?: string;
  warnings?: string[];
} => {
  const validation = validateEmailEnhanced(email, options);
  return validation;
};

/**
 * Legacy email sanitization function (kept for backward compatibility)
 * @param email - Email string to sanitize
 * @returns sanitized email or null if invalid
 */
export const sanitizeEmail = (email: string): string | null => {
  const result = sanitizeEmailEnhanced(email, { allowDisposable: true, allowSuspicious: true });
  return result.isValid ? result.email! : null;
};

/**
 * Checks for potential SQL injection patterns
 * @param input - String to check
 * @returns boolean indicating if suspicious patterns are found
 */
export const containsSQLInjection = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;
  
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
};

/**
 * Checks for potential XSS patterns
 * @param input - String to check
 * @returns boolean indicating if XSS patterns are found
 */
export const containsXSS = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;
  
  return XSS_PATTERNS.some(pattern => pattern.test(input));
};

/**
 * Sanitizes text input by removing potentially dangerous content
 * @param input - Text to sanitize
 * @param maxLength - Maximum allowed length (default: 50000)
 * @returns sanitized text
 */
export const sanitizeTextInput = (input: string, maxLength: number = 50000): string => {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input.trim();
  
  // Length check
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remove XSS patterns
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // HTML encode dangerous characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
};

/**
 * Validates and sanitizes text input for AI prompts
 * This is specifically for content that will be sent to AI models
 * @param input - Text to validate and sanitize
 * @param maxLength - Maximum allowed length
 * @returns object with isValid flag and sanitized text
 */
export const validateAndSanitizeForAI = (input: string, maxLength: number = 50000): { isValid: boolean; sanitized: string; error?: string } => {
  if (!input || typeof input !== 'string') {
    return { isValid: false, sanitized: '', error: 'Input must be a non-empty string' };
  }
  
  const trimmed = input.trim();
  
  // Length validation
  if (trimmed.length === 0) {
    return { isValid: false, sanitized: '', error: 'Input cannot be empty' };
  }
  
  if (trimmed.length > maxLength) {
    return { isValid: false, sanitized: '', error: `Input exceeds maximum length of ${maxLength} characters` };
  }
  
  // Check for injection patterns
  if (containsSQLInjection(trimmed)) {
    return { isValid: false, sanitized: '', error: 'Input contains potentially dangerous SQL patterns' };
  }
  
  if (containsXSS(trimmed)) {
    return { isValid: false, sanitized: '', error: 'Input contains potentially dangerous script content' };
  }
  
  // For AI prompts, we don't want to HTML encode as it might affect the AI's understanding
  // Instead, we just remove the most dangerous patterns
  let sanitized = trimmed;
  
  // Remove script tags and other dangerous HTML
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REMOVED_CONTENT]');
  });
  
  return { isValid: true, sanitized };
};

/**
 * Enhanced rate limiting utility with multiple strategies
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstAttempt: number;
  suspicious: boolean;
}

interface EmailAttemptEntry {
  email: string;
  attempts: number;
  lastAttempt: number;
  blocked: boolean;
}

/**
 * API Rate Limiting Configuration
 */
interface APIRateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * API Rate Limit Entry
 */
interface APIRateLimitEntry {
  requests: number;
  resetTime: number;
  firstRequest: number;
  blocked: boolean;
  blockUntil?: number;
  successfulRequests: number;
  failedRequests: number;
  lastActivity: number;
}

/**
 * API Endpoint Rate Limits
 */
const API_RATE_LIMITS: Record<string, APIRateLimitConfig> = {
  // AI/Generation endpoints - stricter limits
  'ai_summary': { maxRequests: 10, windowMs: 60000, blockDurationMs: 300000 }, // 10 per minute
  'ai_chat': { maxRequests: 20, windowMs: 60000, blockDurationMs: 180000 }, // 20 per minute
  'ai_analysis': { maxRequests: 15, windowMs: 60000, blockDurationMs: 300000 }, // 15 per minute
  'ai_quiz': { maxRequests: 5, windowMs: 60000, blockDurationMs: 600000 }, // 5 per minute
  'ai_storytelling': { maxRequests: 8, windowMs: 60000, blockDurationMs: 300000 }, // 8 per minute
  
  // File operations
  'file_upload': { maxRequests: 20, windowMs: 60000, blockDurationMs: 300000 }, // 20 per minute
  'file_download': { maxRequests: 50, windowMs: 60000 }, // 50 per minute
  
  // Authentication
  'auth_login': { maxRequests: 5, windowMs: 300000, blockDurationMs: 900000 }, // 5 per 5 minutes
  'auth_register': { maxRequests: 3, windowMs: 3600000, blockDurationMs: 3600000 }, // 3 per hour
  'auth_reset_password': { maxRequests: 3, windowMs: 3600000, blockDurationMs: 1800000 }, // 3 per hour
  
  // Waitlist
  'waitlist_signup': { maxRequests: 3, windowMs: 60000, blockDurationMs: 300000 }, // 3 per minute
  
  // General API
  'api_general': { maxRequests: 100, windowMs: 60000, blockDurationMs: 60000 }, // 100 per minute
  
  // Web scraping
  'web_scrape': { maxRequests: 10, windowMs: 60000, blockDurationMs: 300000 }, // 10 per minute
};

/**
 * Comprehensive API Rate Limiter
 */
class APIRateLimiter {
  private limits: Map<string, APIRateLimitEntry> = new Map();
  private globalLimits: Map<string, APIRateLimitEntry> = new Map();
  
  /**
   * Check if API request is allowed
   * @param endpoint - API endpoint identifier
   * @param identifier - User/IP identifier
   * @param isSuccess - Whether the request was successful (optional)
   * @returns rate limit result
   */
  checkAPILimit(endpoint: string, identifier: string, isSuccess?: boolean): {
    allowed: boolean;
    reason?: string;
    retryAfter?: number;
    remainingRequests?: number;
    resetTime?: number;
  } {
    const config = API_RATE_LIMITS[endpoint] || API_RATE_LIMITS['api_general'];
    const key = `${endpoint}:${identifier}`;
    const globalKey = `global:${identifier}`;
    const now = Date.now();
    
    // Check global rate limit (across all endpoints)
    const globalResult = this.checkGlobalLimit(globalKey, now);
    if (!globalResult.allowed) {
      return globalResult;
    }
    
    // Check endpoint-specific rate limit
    const entry = this.limits.get(key);
    
    if (!entry || now > entry.resetTime) {
      // First request or window expired
      const newEntry: APIRateLimitEntry = {
        requests: 1,
        resetTime: now + config.windowMs,
        firstRequest: now,
        blocked: false,
        successfulRequests: isSuccess === true ? 1 : 0,
        failedRequests: isSuccess === false ? 1 : 0,
        lastActivity: now
      };
      this.limits.set(key, newEntry);
      this.updateGlobalLimit(globalKey, now);
      
      return {
        allowed: true,
        remainingRequests: config.maxRequests - 1,
        resetTime: newEntry.resetTime
      };
    }
    
    // Check if currently blocked
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        allowed: false,
        reason: 'Temporarily blocked due to rate limit violation',
        retryAfter: entry.blockUntil - now
      };
    }
    
    // Reset block if expired
    if (entry.blocked && entry.blockUntil && now >= entry.blockUntil) {
      entry.blocked = false;
      entry.blockUntil = undefined;
    }
    
    if (entry.requests >= config.maxRequests) {
      // Block the identifier
      entry.blocked = true;
      entry.blockUntil = now + (config.blockDurationMs || 300000); // Default 5 minutes
      
      return {
        allowed: false,
        reason: 'Rate limit exceeded',
        retryAfter: entry.blockUntil - now
      };
    }
    
    // Update counters
    entry.requests++;
    entry.lastActivity = now;
    if (isSuccess === true) entry.successfulRequests++;
    if (isSuccess === false) entry.failedRequests++;
    
    this.updateGlobalLimit(globalKey, now);
    
    return {
      allowed: true,
      remainingRequests: config.maxRequests - entry.requests,
      resetTime: entry.resetTime
    };
  }
  
  /**
   * Check global rate limit across all endpoints
   */
  private checkGlobalLimit(globalKey: string, now: number): {
    allowed: boolean;
    reason?: string;
    retryAfter?: number;
  } {
    const globalConfig = { maxRequests: 200, windowMs: 60000, blockDurationMs: 300000 }; // 200 requests per minute globally
    const entry = this.globalLimits.get(globalKey);
    
    if (!entry || now > entry.resetTime) {
      return { allowed: true };
    }
    
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        allowed: false,
        reason: 'Global rate limit - temporarily blocked',
        retryAfter: entry.blockUntil - now
      };
    }
    
    if (entry.requests >= globalConfig.maxRequests) {
      entry.blocked = true;
      entry.blockUntil = now + globalConfig.blockDurationMs;
      
      return {
        allowed: false,
        reason: 'Global rate limit exceeded',
        retryAfter: entry.blockUntil - now
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Update global rate limit counter
   */
  private updateGlobalLimit(globalKey: string, now: number): void {
    const globalConfig = { maxRequests: 200, windowMs: 60000 };
    const entry = this.globalLimits.get(globalKey);
    
    if (!entry || now > entry.resetTime) {
      this.globalLimits.set(globalKey, {
        requests: 1,
        resetTime: now + globalConfig.windowMs,
        firstRequest: now,
        blocked: false,
        successfulRequests: 0,
        failedRequests: 0,
        lastActivity: now
      });
    } else {
      entry.requests++;
      entry.lastActivity = now;
    }
  }
  
  /**
   * Get rate limit status for an endpoint and identifier
   */
  getStatus(endpoint: string, identifier: string): {
    requests: number;
    maxRequests: number;
    resetTime: number;
    blocked: boolean;
    retryAfter?: number;
  } {
    const config = API_RATE_LIMITS[endpoint] || API_RATE_LIMITS['api_general'];
    const key = `${endpoint}:${identifier}`;
    const entry = this.limits.get(key);
    const now = Date.now();
    
    if (!entry || now > entry.resetTime) {
      return {
        requests: 0,
        maxRequests: config.maxRequests,
        resetTime: now + config.windowMs,
        blocked: false
      };
    }
    
    return {
      requests: entry.requests,
      maxRequests: config.maxRequests,
      resetTime: entry.resetTime,
      blocked: entry.blocked,
      retryAfter: entry.blockUntil && entry.blockUntil > now ? entry.blockUntil - now : undefined
    };
  }
  
  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    
    // Clean up endpoint-specific limits
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime && (!entry.blockUntil || now > entry.blockUntil)) {
        this.limits.delete(key);
      }
    }
    
    // Clean up global limits
    for (const [key, entry] of this.globalLimits.entries()) {
      if (now > entry.resetTime && (!entry.blockUntil || now > entry.blockUntil)) {
        this.globalLimits.delete(key);
      }
    }
  }
}

class EnhancedRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private emailAttempts: Map<string, EmailAttemptEntry> = new Map();
  
  /**
   * Check if an action is allowed based on enhanced rate limiting
   * @param key - Unique identifier (e.g., user ID, IP address)
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @param email - Email being submitted (for duplicate tracking)
   * @returns result with allowed status and reason
   */
  isAllowed(key: string, maxRequests: number, windowMs: number, email?: string): {
    allowed: boolean;
    reason?: string;
    remainingAttempts?: number;
    resetTime?: number;
  } {
    const now = Date.now();
    
    // Check email-specific limits if email provided
    if (email) {
      const emailResult = this.checkEmailLimits(email, now);
      if (!emailResult.allowed) {
        return emailResult;
      }
    }
    
    const entry = this.limits.get(key);
    
    if (!entry || now > entry.resetTime) {
      // First request or window expired
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
        firstAttempt: now,
        suspicious: false
      };
      this.limits.set(key, newEntry);
      
      if (email) {
        this.trackEmailAttempt(email, now);
      }
      
      return {
        allowed: true,
        remainingAttempts: maxRequests - 1,
        resetTime: newEntry.resetTime
      };
    }
    
    if (entry.count >= maxRequests) {
      // Check if this looks like abuse (many requests in short time)
      const timeSpan = now - entry.firstAttempt;
      if (timeSpan < windowMs / 4) { // If all requests happened in 1/4 of the window
        entry.suspicious = true;
      }
      
      return {
        allowed: false,
        reason: entry.suspicious ? 'Suspicious activity detected' : 'Rate limit exceeded',
        resetTime: entry.resetTime
      };
    }
    
    entry.count++;
    
    if (email) {
      this.trackEmailAttempt(email, now);
    }
    
    return {
      allowed: true,
      remainingAttempts: maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }
  
  /**
   * Check email-specific rate limits and duplicate prevention
   */
  private checkEmailLimits(email: string, now: number): {
    allowed: boolean;
    reason?: string;
  } {
    const emailEntry = this.emailAttempts.get(email);
    
    if (!emailEntry) {
      return { allowed: true };
    }
    
    // Block if email was recently blocked
    if (emailEntry.blocked && (now - emailEntry.lastAttempt) < 300000) { // 5 minutes
      return {
        allowed: false,
        reason: 'Email temporarily blocked due to repeated submissions'
      };
    }
    
    // Check for rapid repeated submissions of same email
    if (emailEntry.attempts >= 3 && (now - emailEntry.lastAttempt) < 60000) { // 1 minute
      emailEntry.blocked = true;
      return {
        allowed: false,
        reason: 'Too many attempts with this email address'
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Track email submission attempts
   */
  private trackEmailAttempt(email: string, now: number): void {
    const existing = this.emailAttempts.get(email);
    
    if (!existing) {
      this.emailAttempts.set(email, {
        email,
        attempts: 1,
        lastAttempt: now,
        blocked: false
      });
    } else {
      existing.attempts++;
      existing.lastAttempt = now;
    }
  }
  
  /**
   * Legacy method for backward compatibility
   */
  isAllowedLegacy(key: string, maxRequests: number, windowMs: number): boolean {
    const result = this.isAllowed(key, maxRequests, windowMs);
    return result.allowed;
  }
  
  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    
    // Clean up rate limit entries
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
    
    // Clean up email attempt entries (keep for 24 hours)
    for (const [email, entry] of this.emailAttempts.entries()) {
      if (now - entry.lastAttempt > 86400000) { // 24 hours
        this.emailAttempts.delete(email);
      }
    }
  }
  
  /**
   * Get statistics for monitoring
   */
  getStats(): {
    activeLimits: number;
    trackedEmails: number;
    blockedEmails: number;
    suspiciousActivities: number;
  } {
    let blockedEmails = 0;
    let suspiciousActivities = 0;
    
    for (const entry of this.emailAttempts.values()) {
      if (entry.blocked) blockedEmails++;
    }
    
    for (const entry of this.limits.values()) {
      if (entry.suspicious) suspiciousActivities++;
    }
    
    return {
      activeLimits: this.limits.size,
      trackedEmails: this.emailAttempts.size,
      blockedEmails,
      suspiciousActivities
    };
  }
}

// Global enhanced rate limiter instance
const enhancedRateLimiter = new EnhancedRateLimiter();

// Backward-compatible rate limiter interface
export const rateLimiter = {
  isAllowed: (key: string, maxRequests: number, windowMs: number): boolean => {
    return enhancedRateLimiter.isAllowedLegacy(key, maxRequests, windowMs);
  },
  cleanup: (): void => {
    enhancedRateLimiter.cleanup();
  },
  // Enhanced methods
  isAllowedEnhanced: (key: string, maxRequests: number, windowMs: number, email?: string) => {
    return enhancedRateLimiter.isAllowed(key, maxRequests, windowMs, email);
  },
  getStats: () => {
    return enhancedRateLimiter.getStats();
  }
};

// Export API rate limiter instance
export const apiRateLimiter = new APIRateLimiter();

// Session Management Security
export interface SessionSecurityConfig {
  maxSessionDuration: number; // in milliseconds
  sessionTimeoutWarning: number; // in milliseconds before timeout
  maxIdleTime: number; // in milliseconds
  sessionRefreshInterval: number; // in milliseconds
  maxConcurrentSessions: number;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
  isActive: boolean;
  ipAddress?: string;
  userAgent?: string;
  refreshToken?: string;
  isRecording?: boolean; // Track if user is currently recording
}

class SessionManager {
  private sessions = new Map<string, UserSession>();
  private userSessions = new Map<string, Set<string>>(); // userId -> sessionIds
  private config: SessionSecurityConfig = {
    maxSessionDuration: 8 * 60 * 60 * 1000, // 8 hours
    sessionTimeoutWarning: 5 * 60 * 1000, // 5 minutes before timeout
    maxIdleTime: 121 * 60 * 1000, // 121 minutes - allows 120 minute recordings
    sessionRefreshInterval: 15 * 60 * 1000, // 15 minutes
    maxConcurrentSessions: 3
  };

  constructor(t?: TranslationFunction) {
    // Load existing sessions from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.loadStoredSessions(t);
    }
  }

  createSession(userId: string, ipAddress?: string, userAgent?: string, t?: TranslationFunction): UserSession {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    const session: UserSession = {
      sessionId,
      userId,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + this.config.maxSessionDuration,
      isActive: true,
      ipAddress,
      userAgent,
      refreshToken: this.generateRefreshToken()
    };

    // Enforce concurrent session limits
    this.enforceSessionLimits(userId);

    this.sessions.set(sessionId, session);
    
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId)!.add(sessionId);

    // Store session securely in localStorage with encryption
    this.storeSessionSecurely(session, t);

    console.log('[SessionManager] New session created:', sessionId);

    return session;
  }

  validateSession(sessionId: string): { valid: boolean; session?: UserSession; reason?: string } {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    const now = Date.now();
    
    // Check if session has expired
    if (now > session.expiresAt) {
      this.invalidateSession(sessionId);
      return { valid: false, reason: 'Session expired' };
    }

    // Check if session has been idle too long (skip if user is recording)
    if (!session.isRecording && now - session.lastActivity > this.config.maxIdleTime) {
      this.invalidateSession(sessionId);
      return { valid: false, reason: 'Session idle timeout' };
    }

    // Check if session is still active
    if (!session.isActive) {
      return { valid: false, reason: 'Session inactive' };
    }

    // Check Firebase auth state
    const currentUser = auth.currentUser;
    
    if (!currentUser || currentUser.uid !== session.userId) {
      console.log('🔥 Firebase auth mismatch - invalidating session');
      this.invalidateSession(sessionId);
      return { valid: false, reason: 'Firebase auth expired or user mismatch' };
    }

    return { valid: true, session };
  }

  refreshSession(sessionId: string): { success: boolean; session?: UserSession; reason?: string } {
    const validation = this.validateSession(sessionId);
    
    if (!validation.valid || !validation.session) {
      return { success: false, reason: validation.reason };
    }

    const session = validation.session;
    const now = Date.now();
    
    // Update session activity and extend expiration
    session.lastActivity = now;
    session.expiresAt = now + this.config.maxSessionDuration;
    session.refreshToken = this.generateRefreshToken();

    this.sessions.set(sessionId, session);
    this.storeSessionSecurely(session);

    return { success: true, session };
  }

  invalidateSession(sessionId: string, t?: TranslationFunction): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Remove from user sessions tracking
      const userSessionIds = this.userSessions.get(session.userId);
      if (userSessionIds) {
        userSessionIds.delete(sessionId);
        if (userSessionIds.size === 0) {
          this.userSessions.delete(session.userId);
        }
      }
    }

    this.sessions.delete(sessionId);
    this.removeStoredSession(sessionId, t);
  }

  invalidateAllUserSessions(userId: string, t?: TranslationFunction): void {
    const sessionIds = this.userSessions.get(userId);
    if (sessionIds) {
      sessionIds.forEach(sessionId => {
        this.sessions.delete(sessionId);
        this.removeStoredSession(sessionId, t);
      });
      this.userSessions.delete(userId);
    }
  }

  getSessionTimeoutWarning(sessionId: string): { showWarning: boolean; timeRemaining?: number } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { showWarning: false };
    }

    const now = Date.now();
    const timeUntilExpiry = session.expiresAt - now;
    
    // Don't show timeout warning if user is recording
    if (session.isRecording) {
      return { showWarning: false };
    }
    
    if (timeUntilExpiry <= this.config.sessionTimeoutWarning && timeUntilExpiry > 0) {
      return { showWarning: true, timeRemaining: timeUntilExpiry };
    }

    return { showWarning: false };
  }

  setRecordingStatus(sessionId: string, isRecording: boolean): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.isRecording = isRecording;
    this.sessions.set(sessionId, session);
    this.storeSessionSecurely(session);
    return true;
  }

  getRecordingStatus(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    return session?.isRecording || false;
  }

  private enforceSessionLimits(userId: string): void {
    const userSessionIds = this.userSessions.get(userId);
    if (userSessionIds && userSessionIds.size >= this.config.maxConcurrentSessions) {
      // Remove oldest session
      let oldestSessionId = '';
      let oldestTime = Date.now();
      
      userSessionIds.forEach(sessionId => {
        const session = this.sessions.get(sessionId);
        if (session && session.createdAt < oldestTime) {
          oldestTime = session.createdAt;
          oldestSessionId = sessionId;
        }
      });

      if (oldestSessionId) {
        this.invalidateSession(oldestSessionId);
      }
    }
  }

  private generateSessionId(): string {
    return 'sess_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private generateRefreshToken(): string {
    return 'ref_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private storeSessionSecurely(session: UserSession, t?: TranslationFunction): void {
    try {
      // Store only essential session data, encrypted
      const sessionData = {
        sessionId: session.sessionId,
        userId: session.userId,
        expiresAt: session.expiresAt,
        refreshToken: session.refreshToken,
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
        isActive: session.isActive
      };
      
      // Simple encryption for localStorage (in production, use proper encryption)
      const encrypted = btoa(JSON.stringify(sessionData));
      localStorage.setItem(`session_${session.sessionId}`, encrypted);
    } catch (error) {
      console.warn(t?.('failedToStoreSession', 'Failed to store session securely:') || 'Failed to store session securely:', error);
    }
  }

  loadStoredSessions(t?: TranslationFunction): void {
    try {
      // Load all stored sessions from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('session_')) {
          try {
            const encrypted = localStorage.getItem(key);
            if (encrypted) {
              const sessionData = JSON.parse(atob(encrypted));
              const now = Date.now();
              
              // Check if session is still valid
              if (sessionData.expiresAt > now && sessionData.isActive) {
                // Reconstruct full session object
                const session: UserSession = {
                  sessionId: sessionData.sessionId,
                  userId: sessionData.userId,
                  createdAt: sessionData.createdAt,
                  lastActivity: sessionData.lastActivity,
                  expiresAt: sessionData.expiresAt,
                  isActive: sessionData.isActive,
                  refreshToken: sessionData.refreshToken
                };
                
                // Add to in-memory storage
                this.sessions.set(session.sessionId, session);
                
                // Track user sessions
                if (!this.userSessions.has(session.userId)) {
                  this.userSessions.set(session.userId, new Set());
                }
                this.userSessions.get(session.userId)!.add(session.sessionId);
              } else {
                // Remove expired session from localStorage
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            console.warn(t?.('failedToLoadStoredSession', 'Failed to load stored session:') || 'Failed to load stored session:', key, error);
            // Remove corrupted session data
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn(t?.('failedToLoadStoredSessions', 'Failed to load stored sessions:') || 'Failed to load stored sessions:', error);
    }
  }

  getExistingValidSession(userId: string): UserSession | null {
    const userSessionIds = this.userSessions.get(userId);
    if (!userSessionIds || userSessionIds.size === 0) {
      return null;
    }
    
    // Find the most recent valid session
    let mostRecentSession: UserSession | null = null;
    let mostRecentTime = 0;
    
    userSessionIds.forEach(sessionId => {
      const session = this.sessions.get(sessionId);
      if (session) {
        const validation = this.validateSession(sessionId);
        if (validation.valid && session.lastActivity > mostRecentTime) {
          mostRecentSession = session;
          mostRecentTime = session.lastActivity;
        }
      }
    });
    
    return mostRecentSession;
  }

  private removeStoredSession(sessionId: string, t?: TranslationFunction): void {
    try {
      localStorage.removeItem(`session_${sessionId}`);
    } catch (error) {
      console.warn(t?.('failedToRemoveStoredSession', 'Failed to remove stored session:') || 'Failed to remove stored session:', error);
    }
  }

  cleanup(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    this.sessions.forEach((session, sessionId) => {
      if (now > session.expiresAt || now - session.lastActivity > this.config.maxIdleTime) {
        expiredSessions.push(sessionId);
      }
    });

    expiredSessions.forEach(sessionId => {
      this.invalidateSession(sessionId);
    });
  }

  getActiveSessionsCount(userId: string): number {
    const userSessionIds = this.userSessions.get(userId);
    return userSessionIds ? userSessionIds.size : 0;
  }

  getAllActiveSessions(): UserSession[] {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }
}

// Export session manager instance
export const sessionManager = new SessionManager();

// Clean up rate limiters every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
    apiRateLimiter.cleanup();
    sessionManager.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Email confirmation system for waitlist
 */
export interface EmailConfirmationToken {
  email: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  confirmed: boolean;
  attempts: number;
}

/**
 * Generate a secure confirmation token
 */
export const generateConfirmationToken = async (): Promise<string> => {
  try {
    // Generate a cryptographically secure random token
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.warn('Could not generate secure token, falling back to timestamp-based:', error);
    // Fallback for environments without crypto.getRandomValues
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
};

/**
 * Create email confirmation entry
 */
export const createEmailConfirmation = async (email: string): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> => {
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    const token = await generateConfirmationToken();
    const now = Date.now();
    const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours
    
    await addDoc(collection(db, 'email_confirmations'), {
      email,
      token,
      createdAt: serverTimestamp(),
      expiresAt,
      confirmed: false,
      attempts: 0,
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        timestamp: now
      }
    });
    
    return { success: true, token };
  } catch (error) {
    console.error('Error creating email confirmation:', error);
    return { success: false, error: 'Failed to create confirmation token' };
  }
};

/**
 * Verify email confirmation token
 */
export const verifyEmailConfirmation = async (token: string): Promise<{
  isValid: boolean;
  email?: string;
  error?: string;
  expired?: boolean;
}> => {
  try {
    const { collection, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    const confirmationQuery = query(
      collection(db, 'email_confirmations'),
      where('token', '==', token),
      where('confirmed', '==', false)
    );
    
    const snapshot = await getDocs(confirmationQuery);
    
    if (snapshot.empty) {
      return { isValid: false, error: 'Invalid or already used confirmation token' };
    }
    
    const confirmationDoc = snapshot.docs[0];
    const data = confirmationDoc.data();
    
    // Check if token has expired
    if (Date.now() > data.expiresAt) {
      return { isValid: false, error: 'Confirmation token has expired', expired: true };
    }
    
    // Mark as confirmed
    await updateDoc(doc(db, 'email_confirmations', confirmationDoc.id), {
      confirmed: true,
      confirmedAt: Date.now(),
      attempts: (data.attempts || 0) + 1
    });
    
    return { isValid: true, email: data.email };
  } catch (error) {
    console.error('Error verifying email confirmation:', error);
    return { isValid: false, error: 'Failed to verify confirmation token' };
  }
};

/**
 * Check if email has pending confirmation
 */
export const hasPendingConfirmation = async (email: string): Promise<{
  hasPending: boolean;
  token?: string;
  expiresAt?: number;
}> => {
  try {
    const { collection, query, where, getDocs, orderBy, limit } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    const confirmationQuery = query(
      collection(db, 'email_confirmations'),
      where('email', '==', email),
      where('confirmed', '==', false),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(confirmationQuery);
    
    if (snapshot.empty) {
      return { hasPending: false };
    }
    
    const data = snapshot.docs[0].data();
    
    // Check if still valid (not expired)
    if (Date.now() > data.expiresAt) {
      return { hasPending: false };
    }
    
    return {
      hasPending: true,
      token: data.token,
      expiresAt: data.expiresAt
    };
  } catch (error) {
    console.warn('Error checking pending confirmation:', error);
    return { hasPending: false };
  }
};

/**
 * Waitlist-specific validation function
 * Combines email validation with duplicate prevention
 */
export const validateWaitlistEmail = async (email: string, checkDuplicates: boolean = true): Promise<{
  isValid: boolean;
  email?: string;
  error?: string;
  warnings?: string[];
  isDuplicate?: boolean;
}> => {
  // Enhanced email validation (strict for waitlist)
  const validation = validateEmailEnhanced(email, {
    allowDisposable: false,  // Block disposable emails
    allowSuspicious: false   // Block suspicious patterns
  });
  
  if (!validation.isValid) {
    return validation;
  }
  
  // Check for duplicates if requested (requires Firebase import)
  if (checkDuplicates) {
    try {
      // Dynamic import to avoid circular dependencies
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      const waitlistQuery = query(
        collection(db, 'waitlist'),
        where('email', '==', validation.email)
      );
      
      const snapshot = await getDocs(waitlistQuery);
      
      if (!snapshot.empty) {
        return {
          isValid: false,
          error: 'This email address is already on the waitlist',
          isDuplicate: true
        };
      }
    } catch (error) {
      console.warn('Could not check for duplicate emails:', error);
      // Continue without duplicate check if Firebase is unavailable
    }
  }
  
  return validation;
};

/**
 * Enhanced waitlist signup with email confirmation
 */
export const initiateWaitlistSignup = async (email: string): Promise<{
  success: boolean;
  requiresConfirmation?: boolean;
  confirmationToken?: string;
  error?: string;
  pendingConfirmation?: boolean;
}> => {
  // Validate email first
  const validation = await validateWaitlistEmail(email, true);
  
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error
    };
  }
  
  // Check if there's already a pending confirmation
  const pendingCheck = await hasPendingConfirmation(validation.email!);
  
  if (pendingCheck.hasPending) {
    return {
      success: false,
      error: 'A confirmation email has already been sent. Please check your inbox or wait before requesting another.',
      pendingConfirmation: true
    };
  }
  
  // Create confirmation token
  const confirmation = await createEmailConfirmation(validation.email!);
  
  if (!confirmation.success) {
    return {
      success: false,
      error: confirmation.error
    };
  }
  
  return {
    success: true,
    requiresConfirmation: true,
    confirmationToken: confirmation.token
  };
};

/**
 * Complete waitlist signup after email confirmation
 */
export const completeWaitlistSignup = async (token: string, additionalData?: any): Promise<{
  success: boolean;
  email?: string;
  error?: string;
}> => {
  // Verify the confirmation token
  const verification = await verifyEmailConfirmation(token);
  
  if (!verification.isValid) {
    return {
      success: false,
      error: verification.error
    };
  }
  
  try {
    // Add to waitlist
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    await addDoc(collection(db, 'waitlist'), {
      email: verification.email,
      createdAt: serverTimestamp(),
      status: 'confirmed',
      confirmedAt: serverTimestamp(),
      confirmationToken: token,
      metadata: {
        ...additionalData,
        confirmationMethod: 'email',
        timestamp: Date.now()
      }
    });
    
    return {
      success: true,
      email: verification.email
    };
  } catch (error) {
    console.error('Error completing waitlist signup:', error);
    return {
      success: false,
      error: 'Failed to complete waitlist signup'
    };
  }
};

/**
 * Email extraction utility
 * @param text - Text to extract email addresses from
 * @returns array of unique email addresses found in the text
 */
export const extractEmailAddresses = (text: string): string[] => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex) || [];
  // Remove duplicates and return sorted
  return [...new Set(emails)].sort();
};

/**
 * Validates file upload security
 * @param file - File object to validate
 * @param allowedTypes - Array of allowed MIME types
 * @param maxSize - Maximum file size in bytes
 * @returns validation result
 */
export const validateFileUpload = (file: File, allowedTypes: string[], maxSize: number): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type ${file.type} is not allowed` };
  }
  
  // Check file size
  if (file.size > maxSize) {
    return { isValid: false, error: `File size exceeds maximum of ${maxSize} bytes` };
  }
  
  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.(exe|bat|cmd|scr|pif|com)$/i,
    /\.(php|asp|jsp|js)$/i,
    /\.\./,  // Path traversal
    /[<>:"|?*]/  // Invalid filename characters
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    return { isValid: false, error: 'File name contains suspicious patterns' };
  }
  
  return { isValid: true };
};