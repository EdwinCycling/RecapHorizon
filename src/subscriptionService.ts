import { SubscriptionTier, TierLimits, SessionType } from '../types';

// Tier limits configuration
export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  [SubscriptionTier.FREE]: {
    maxSessionDuration: 15,
    maxSessionsPerDay: 1,
    maxTranscriptLength: 5000,
    allowedFileTypes: ['.txt', 'text/plain'],
    maxTokensPerMonth: 10000, // 10k tokens per month
    maxTokensPerDay: 500 // 500 tokens per day
  },
  [SubscriptionTier.SILVER]: {
    maxSessionDuration: 60,
    maxSessionsPerDay: 3,
    maxTranscriptLength: 15000,
    allowedFileTypes: ['.txt', '.pdf', '.rtf', '.html', '.htm', '.md', '.eml', 'text/plain', 'application/pdf', 'application/rtf', 'text/html', 'text/markdown', 'email'],
    maxTokensPerMonth: 50000, // 50k tokens per month
    maxTokensPerDay: 2000 // 2k tokens per day
  },
  [SubscriptionTier.GOLD]: {
    maxSessionDuration: 90,
    maxSessionsPerDay: -1, // unlimited
    maxTranscriptLength: 30000,
    allowedFileTypes: ['.txt', '.pdf', '.rtf', '.html', '.htm', '.md', '.docx', '.eml', '.msg', 'text/plain', 'application/pdf', 'application/rtf', 'text/html', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'email'],
    maxTokensPerMonth: 150000, // 150k tokens per month
    maxTokensPerDay: 6000 // 6k tokens per day
  },
  [SubscriptionTier.ENTERPRISE]: {
    maxSessionDuration: 90,
    maxSessionsPerDay: -1,
    maxTranscriptLength: 50000,
    allowedFileTypes: ['.txt', '.pdf', '.rtf', '.html', '.htm', '.md', '.docx', '.eml', '.msg', 'text/plain', 'application/pdf', 'application/rtf', 'text/html', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'email'],
    maxTokensPerMonth: 500000, // 500k tokens per month
    maxTokensPerDay: 20000 // 20k tokens per day
  },
  [SubscriptionTier.DIAMOND]: {
    maxSessionDuration: 120,
    maxSessionsPerDay: -1,
    maxTranscriptLength: -1, // unlimited
    allowedFileTypes: ['.txt', '.pdf', '.rtf', '.html', '.htm', '.md', '.docx', '.eml', '.msg', 'text/plain', 'application/pdf', 'application/rtf', 'text/html', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'email'],
    maxTokensPerMonth: -1, // unlimited
    maxTokensPerDay: -1 // unlimited
  }
};

// Pricing information
export const TIER_PRICING = {
  [SubscriptionTier.FREE]: {
    price: 0,
    currency: 'EUR',
    billingPeriod: 'month',
    minTerm: 0,
    cancelable: true
  },
  [SubscriptionTier.SILVER]: {
    price: 5,
    currency: 'EUR',
    billingPeriod: 'month',
    minTerm: 0,
    cancelable: true
  },
  [SubscriptionTier.GOLD]: {
    price: 8,
    currency: 'EUR',
    billingPeriod: 'month',
    minTerm: 0,
    cancelable: true
  },
  [SubscriptionTier.ENTERPRISE]: {
    price: 0,
    currency: 'EUR',
    billingPeriod: 'month',
    minTerm: 0,
    cancelable: true
  },
  [SubscriptionTier.DIAMOND]: {
    price: 0,
    currency: 'EUR',
    billingPeriod: 'month',
    minTerm: 0,
    cancelable: false
  }
};

// New: Feature availability per tier
export const TIER_FEATURES = {
  [SubscriptionTier.FREE]: {
    chat: false,
    exportPpt: false,
    businessCase: false,
    webPage: false,
    webExpert: false,
    multipleUrls: false
  },
  [SubscriptionTier.SILVER]: {
    chat: false,
    exportPpt: false,
    businessCase: false,
    webPage: true,
    webExpert: false,
    multipleUrls: false
  },
  [SubscriptionTier.GOLD]: {
    chat: true,
    exportPpt: true,
    businessCase: true,
    webPage: true,
    webExpert: true,
    multipleUrls: true
  },
  [SubscriptionTier.ENTERPRISE]: {
    chat: true,
    exportPpt: true,
    businessCase: true,
    webPage: true,
    webExpert: true,
    multipleUrls: true
  },
  [SubscriptionTier.DIAMOND]: {
    chat: true,
    exportPpt: true,
    businessCase: true,
    webPage: true,
    webExpert: true,
    multipleUrls: true
  }
};

// Subscription service class
export class SubscriptionService {
  private static instance: SubscriptionService;

  private constructor() {}

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  // Get tier limits for a specific subscription
  public getTierLimits(tier: SubscriptionTier): TierLimits {
    return TIER_LIMITS[tier];
  }

  // Get tier pricing for a specific subscription
  public getTierPricing(tier: SubscriptionTier) {
    return TIER_PRICING[tier];
  }

  // Check if file type is allowed for a tier
  public isFileTypeAllowed(tier: SubscriptionTier, fileType: string): boolean {
    const limits = this.getTierLimits(tier);
    return limits.allowedFileTypes.includes(fileType);
  }

  // Check if session duration is within limits
  public isSessionDurationAllowed(tier: SubscriptionTier, durationMinutes: number): boolean {
    const limits = this.getTierLimits(tier);
    return durationMinutes <= limits.maxSessionDuration;
  }

  // Check if transcript length is within limits
  public isTranscriptLengthAllowed(tier: SubscriptionTier, transcriptLength: number): boolean {
    const limits = this.getTierLimits(tier);
    if (limits.maxTranscriptLength === -1) return true; // unlimited
    return transcriptLength <= limits.maxTranscriptLength;
  }

  // Check if user can start a new session today
  public canStartNewSession(tier: SubscriptionTier, sessionsToday: number): boolean {
    const limits = this.getTierLimits(tier);
    if (limits.maxSessionsPerDay === -1) return true; // unlimited
    return sessionsToday < limits.maxSessionsPerDay;
  }

  // Get remaining sessions for today
  public getRemainingSessions(tier: SubscriptionTier, sessionsToday: number): number {
    const limits = this.getTierLimits(tier);
    if (limits.maxSessionsPerDay === -1) return -1; // unlimited
    return Math.max(0, limits.maxSessionsPerDay - sessionsToday);
  }

  // Get remaining session duration
  public getRemainingSessionDuration(tier: SubscriptionTier, currentDuration: number): number {
    const limits = this.getTierLimits(tier);
    return Math.max(0, limits.maxSessionDuration - currentDuration);
  }

  // Get remaining transcript length
  public getRemainingTranscriptLength(tier: SubscriptionTier, currentLength: number): number {
    const limits = this.getTierLimits(tier);
    if (limits.maxTranscriptLength === -1) return -1; // unlimited
    return Math.max(0, limits.maxTranscriptLength - currentLength);
  }

  // Token management methods
  public isTokenUsageAllowed(tier: SubscriptionTier, tokensToUse: number, currentMonthlyUsage: number, currentDailyUsage: number): { allowed: boolean; reason?: string } {
    const limits = this.getTierLimits(tier);
    
    // Check daily limit
    if (limits.maxTokensPerDay !== -1 && (currentDailyUsage + tokensToUse) > limits.maxTokensPerDay) {
      return {
        allowed: false,
        reason: `Je hebt je dagelijkse token limiet van ${limits.maxTokensPerDay.toLocaleString()} tokens bereikt. Probeer morgen opnieuw of upgrade naar een hogere tier.`
      };
    }
    
    // Check monthly limit
    if (limits.maxTokensPerMonth !== -1 && (currentMonthlyUsage + tokensToUse) > limits.maxTokensPerMonth) {
      return {
        allowed: false,
        reason: `Je hebt je maandelijkse token limiet van ${limits.maxTokensPerMonth.toLocaleString()} tokens bereikt. Upgrade naar een hogere tier voor meer tokens.`
      };
    }
    
    return { allowed: true };
  }

  public getRemainingTokens(tier: SubscriptionTier, currentMonthlyUsage: number, currentDailyUsage: number): { monthly: number; daily: number } {
    const limits = this.getTierLimits(tier);
    
    const remainingMonthly = limits.maxTokensPerMonth === -1 ? -1 : Math.max(0, limits.maxTokensPerMonth - currentMonthlyUsage);
    const remainingDaily = limits.maxTokensPerDay === -1 ? -1 : Math.max(0, limits.maxTokensPerDay - currentDailyUsage);
    
    return {
      monthly: remainingMonthly,
      daily: remainingDaily
    };
  }

  public getTokenUsagePercentage(tier: SubscriptionTier, currentUsage: number, period: 'monthly' | 'daily'): number {
    const limits = this.getTierLimits(tier);
    const maxTokens = period === 'monthly' ? limits.maxTokensPerMonth : limits.maxTokensPerDay;
    
    if (maxTokens === -1) return 0; // unlimited
    return Math.min(100, (currentUsage / maxTokens) * 100);
  }

  // Validate session start
  public validateSessionStart(tier: SubscriptionTier, sessionsToday: number): { allowed: boolean; reason?: string } {
    if (!this.canStartNewSession(tier, sessionsToday)) {
      return {
        allowed: false,
        reason: `Je hebt je dagelijkse limiet van ${TIER_LIMITS[tier].maxSessionsPerDay} sessie(s) bereikt. Probeer morgen opnieuw, of upgrade naar een hogere tier voor meer sessies.`
      };
    }

    return { allowed: true };
  }

  // Validate file upload
  public validateFileUpload(tier: SubscriptionTier, fileType: string, t: (key: string, options?: any) => string): { allowed: boolean; reason?: string } {
    if (!this.isFileTypeAllowed(tier, fileType)) {
      const allowedTypes = TIER_LIMITS[tier].allowedFileTypes.join(', ');
      return {
        allowed: false,
        reason: t('fileUploadNotAllowed', { allowedTypes: allowedTypes })
      };
    }

    return { allowed: true };
  }

  // Validate transcript length
  public validateTranscriptLength(tier: SubscriptionTier, transcriptLength: number, t: (key: string, options?: any) => string): { allowed: boolean; reason?: string } {
    if (!this.isTranscriptLengthAllowed(tier, transcriptLength)) {
      const limits = this.getTierLimits(tier);
      const maxLength = limits.maxTranscriptLength;
      const currentLength = transcriptLength;
      const remaining = this.getRemainingTranscriptLength(tier, currentLength);
      
      return {
        allowed: false,
        reason: t('transcriptTooLong', { currentLength: currentLength.toLocaleString(), maxLength: maxLength.toLocaleString() })
      };
    }

    return { allowed: true };
  }

  // Check if a specific feature is available for a tier
  public isFeatureAvailable(tier: SubscriptionTier, feature: keyof typeof TIER_FEATURES[SubscriptionTier]): boolean {
    return TIER_FEATURES[tier][feature];
  }

  // Get upgrade message for a specific limit
  public getUpgradeMessage(tier: SubscriptionTier, limitType: 'duration' | 'sessions' | 'fileType' | 'transcriptLength', t: (key: string, options?: any) => string): string {
    const currentLimits = this.getTierLimits(tier);
    
    switch (limitType) {
      case 'duration':
        return t('upgradeDurationMessage', { maxDuration: currentLimits.maxSessionDuration });
      case 'sessions':
        return t('upgradeSessionsMessage', { maxSessions: currentLimits.maxSessionsPerDay });
      case 'fileType':
        return t('upgradeFileTypeMessage');
      case 'transcriptLength':
        return t('upgradeTranscriptLengthMessage');
      default:
        return t('upgradeGeneralMessage');
    }
  }

  // Get upgrade message for a specific feature
  public getFeatureUpgradeMessage(feature: keyof typeof TIER_FEATURES[SubscriptionTier], t: (key: string, options?: any) => string): string {
    switch (feature) {
      case 'chat':
        return t('chatFeatureUpgrade');

      case 'exportPpt':
        return t('exportPptFeatureUpgrade');
      case 'businessCase':
        return t('businessCaseFeatureUpgrade');
      case 'webExpert':
        return t('webExpertFeatureUpgrade');
      case 'multipleUrls':
        return t('multipleUrlsFeatureUpgrade');
      case 'webPage':
        return t('webPageFeatureUpgrade');
      default:
        return t('defaultFeatureUpgrade');
    }
  }

  // Get tier comparison data
  public getTierComparison() {
    // Hide DIAMOND from pricing comparison (only for admins)
    return Object.values(SubscriptionTier)
      .filter(t => t !== SubscriptionTier.DIAMOND)
      .map(tier => ({
        tier,
        ...TIER_LIMITS[tier],
        ...TIER_PRICING[tier],
        features: TIER_FEATURES[tier]
      }));
  }

  // Get tier comparison including DIAMOND for admins
  public getTierComparisonForAdmin() {
    return Object.values(SubscriptionTier).map(tier => ({
      tier,
      ...TIER_LIMITS[tier],
      ...TIER_PRICING[tier],
      features: TIER_FEATURES[tier]
    }));
  }
}

// Export singleton instance
export const subscriptionService = SubscriptionService.getInstance();

