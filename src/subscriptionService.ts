import { SubscriptionTier, TierLimits, SessionType } from '../types';

// Tier limits configuration
export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  [SubscriptionTier.FREE]: {
    maxSessionDuration: 15,
    maxSessionsPerDay: 1,
    maxTranscriptLength: 5000,
    allowedFileTypes: ['.txt', 'text/plain'],
    maxTokensPerMonth: 10000, // 10k tokens per month
    maxTokensPerDay: 500, // 500 tokens per day
    maxMonthlyAudioMinutes: 60, // 60 minutes per month
    trialDurationDays: 28 // 4 weeks trial period
  },
  [SubscriptionTier.SILVER]: {
    maxSessionDuration: 60,
    maxSessionsPerDay: 3,
    maxTranscriptLength: 15000,
    allowedFileTypes: ['.txt', '.pdf', '.rtf', '.html', '.htm', '.md', '.eml', 'text/plain', 'application/pdf', 'application/rtf', 'text/html', 'text/markdown', 'email'],
    maxTokensPerMonth: 50000, // 50k tokens per month
    maxTokensPerDay: 2000, // 2k tokens per day
    maxMonthlyAudioMinutes: 500 // 500 minutes per month
  },
  [SubscriptionTier.GOLD]: {
    maxSessionDuration: 90,
    maxSessionsPerDay: -1, // unlimited
    maxTranscriptLength: 30000,
    allowedFileTypes: ['.txt', '.pdf', '.rtf', '.html', '.htm', '.md', '.docx', '.eml', '.msg', 'text/plain', 'application/pdf', 'application/rtf', 'text/html', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'email'],
    maxTokensPerMonth: 150000, // 150k tokens per month
    maxTokensPerDay: 6000, // 6k tokens per day
    maxMonthlyAudioMinutes: 1000 // 1000 minutes per month
  },
  [SubscriptionTier.ENTERPRISE]: {
    maxSessionDuration: 90,
    maxSessionsPerDay: -1,
    maxTranscriptLength: 50000,
    allowedFileTypes: ['.txt', '.pdf', '.rtf', '.html', '.htm', '.md', '.docx', '.eml', '.msg', 'text/plain', 'application/pdf', 'application/rtf', 'text/html', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'email'],
    maxTokensPerMonth: 500000, // 500k tokens per month
    maxTokensPerDay: 20000, // 20k tokens per day
    maxMonthlyAudioMinutes: 2500 // 2500 minutes per month
  },
  [SubscriptionTier.DIAMOND]: {
    maxSessionDuration: 120,
    maxSessionsPerDay: -1,
    maxTranscriptLength: -1, // unlimited
    allowedFileTypes: ['.txt', '.pdf', '.rtf', '.html', '.htm', '.md', '.docx', '.eml', '.msg', 'text/plain', 'application/pdf', 'application/rtf', 'text/html', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'email'],
    maxTokensPerMonth: -1, // unlimited
    maxTokensPerDay: -1, // unlimited
    maxMonthlyAudioMinutes: 2500 // 2500 minutes per month
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
    price: 6,
    currency: 'EUR',
    billingPeriod: 'month',
    minTerm: 0,
    cancelable: true
  },
  [SubscriptionTier.GOLD]: {
    price: 10,
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
    multipleUrls: false,
    showMe: false,
    thinkingPartner: false
  },
  [SubscriptionTier.SILVER]: {
    chat: false,
    exportPpt: false,
    businessCase: false,
    webPage: true,
    webExpert: false,
    multipleUrls: false,
    showMe: false,
    thinkingPartner: false
  },
  [SubscriptionTier.GOLD]: {
    chat: true,
    exportPpt: true,
    businessCase: true,
    webPage: true,
    webExpert: true,
    multipleUrls: true,
    showMe: true,
    thinkingPartner: true
  },
  [SubscriptionTier.ENTERPRISE]: {
    chat: true,
    exportPpt: true,
    businessCase: true,
    webPage: true,
    webExpert: true,
    multipleUrls: true,
    showMe: true,
    thinkingPartner: true
  },
  [SubscriptionTier.DIAMOND]: {
    chat: true,
    exportPpt: true,
    businessCase: true,
    webPage: true,
    webExpert: true,
    multipleUrls: true,
    showMe: true,
    thinkingPartner: true
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

  // Audio recording limit methods
  public isMonthlyAudioLimitReached(tier: SubscriptionTier, currentMonthlyMinutes: number): boolean {
    const limits = this.getTierLimits(tier);
    if (!limits.maxMonthlyAudioMinutes || limits.maxMonthlyAudioMinutes === -1) return false; // unlimited
    return currentMonthlyMinutes >= limits.maxMonthlyAudioMinutes;
  }

  public getRemainingAudioMinutes(tier: SubscriptionTier, currentMonthlyMinutes: number): number {
    const limits = this.getTierLimits(tier);
    if (!limits.maxMonthlyAudioMinutes || limits.maxMonthlyAudioMinutes === -1) return -1; // unlimited
    return Math.max(0, limits.maxMonthlyAudioMinutes - currentMonthlyMinutes);
  }

  public getAudioUsagePercentage(tier: SubscriptionTier, currentMonthlyMinutes: number): number {
    const limits = this.getTierLimits(tier);
    if (!limits.maxMonthlyAudioMinutes || limits.maxMonthlyAudioMinutes === -1) return 0; // unlimited
    return Math.min(100, (currentMonthlyMinutes / limits.maxMonthlyAudioMinutes) * 100);
  }

  public validateAudioRecordingStart(tier: SubscriptionTier, currentMonthlyMinutes: number): { allowed: boolean; reason?: string } {
    if (this.isMonthlyAudioLimitReached(tier, currentMonthlyMinutes)) {
      const limits = this.getTierLimits(tier);
      return {
        allowed: false,
        reason: `Je hebt je maandelijkse audio limiet van ${limits.maxMonthlyAudioMinutes} minuten bereikt. Upgrade naar een hogere tier voor meer opnametijd.`
      };
    }
    return { allowed: true };
  }

  public getAudioUpgradeMessage(tier: SubscriptionTier): { message: string; upgradeUrl: string } {
    switch (tier) {
      case SubscriptionTier.FREE:
        return {
          message: 'Je hebt je maandelijkse audio limiet van 60 minuten bereikt. Upgrade naar Silver voor 500 minuten per maand.',
          upgradeUrl: '/pricing?highlight=silver'
        };
      case SubscriptionTier.SILVER:
        return {
          message: 'Je hebt je maandelijkse audio limiet van 500 minuten bereikt. Upgrade naar Gold voor 1000 minuten per maand.',
          upgradeUrl: '/pricing?highlight=gold'
        };
      case SubscriptionTier.GOLD:
        return {
          message: 'Je hebt je maandelijkse audio limiet van 1000 minuten bereikt. Upgrade naar Enterprise voor 2500 minuten per maand.',
          upgradeUrl: '/pricing?highlight=enterprise'
        };
      default:
        return {
          message: 'Je hebt je maandelijkse audio limiet bereikt. Bekijk onze pricing opties.',
          upgradeUrl: '/pricing'
        };
    }
  }

  // Check if Free Tier 4-week period has expired (dynamic check)
  public isFreeTierExpired(userCreatedAt: Date): boolean {
    const now = new Date();
    const fourWeeksInMs = 4 * 7 * 24 * 60 * 60 * 1000; // 4 weeks in milliseconds
    const trialEndDate = new Date(userCreatedAt.getTime() + fourWeeksInMs);
    return now > trialEndDate;
  }

  // Get remaining days in Free Tier period
  public getRemainingFreeTierDays(userCreatedAt: Date): number {
    const now = new Date();
    const fourWeeksInMs = 4 * 7 * 24 * 60 * 60 * 1000;
    const trialEndDate = new Date(userCreatedAt.getTime() + fourWeeksInMs);
    const remainingMs = trialEndDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    return Math.max(0, remainingDays);
  }

  // Validate if user can perform crucial action (AI processing)
  public validateCrucialAction(userTier: SubscriptionTier, userCreatedAt: Date, userSubscriptionStatus: string, hasHadPaidSubscription: boolean = false): { allowed: boolean; reason?: string } {
    // For paid tiers, check subscription status
    if (userTier !== SubscriptionTier.FREE) {
      // Allow access for active and past_due subscriptions
      // past_due means payment failed but subscription is still valid
      const validStatuses = ['active', 'past_due'];
      if (!validStatuses.includes(userSubscriptionStatus)) {
        return {
          allowed: false,
          reason: 'Je betaalde abonnement is niet actief. Controleer je betalingsgegevens of neem contact op met support.'
        };
      }
      return { allowed: true };
    }

    // For Free Tier users who previously had a paid subscription, no trial period
    if (hasHadPaidSubscription) {
      return {
        allowed: false,
        reason: 'Je gratis proefperiode is niet meer beschikbaar na het annuleren van je betaalde abonnement. Upgrade naar een betaald abonnement om door te gaan met RecapHorizon.'
      };
    }

    // For new Free Tier users, check 4-week limit dynamically
    if (this.isFreeTierExpired(userCreatedAt)) {
      const remainingDays = this.getRemainingFreeTierDays(userCreatedAt);
      return {
        allowed: false,
        reason: `Je gratis proefperiode van 4 weken is verlopen. Upgrade naar een betaald abonnement om door te gaan met RecapHorizon. Resterende dagen: ${remainingDays}`
      };
    }

    return { allowed: true };
  }

  // Check if trial period has expired for free users (legacy method - kept for compatibility)
  public isTrialExpired(userSubscription: { tier: SubscriptionTier; startDate: Date; trialEndDate?: Date }): boolean {
    if (userSubscription.tier !== SubscriptionTier.FREE) {
      return false; // Non-free users don't have trial periods
    }

    // Use new dynamic check
    return this.isFreeTierExpired(userSubscription.startDate);
  }

  // Calculate trial end date (legacy method - kept for compatibility)
  public calculateTrialEndDate(startDate: Date): Date {
    const fourWeeksInMs = 4 * 7 * 24 * 60 * 60 * 1000;
    return new Date(startDate.getTime() + fourWeeksInMs);
  }

  // Get remaining trial days (legacy method - kept for compatibility)
  public getRemainingTrialDays(userSubscription: { tier: SubscriptionTier; startDate: Date; trialEndDate?: Date }): number {
    if (userSubscription.tier !== SubscriptionTier.FREE) {
      return 0;
    }
    return this.getRemainingFreeTierDays(userSubscription.startDate);
  }

  // Enhanced session validation with Free Tier check
  public validateSessionStart(tier: SubscriptionTier, sessionsToday: number, userCreatedAt: Date, userSubscriptionStatus: string = 'active', hasHadPaidSubscription: boolean = false): { allowed: boolean; reason?: string } {
    // First check crucial action validation (Free Tier expiry + subscription status)
    const crucialActionCheck = this.validateCrucialAction(tier, userCreatedAt, userSubscriptionStatus, hasHadPaidSubscription);
    if (!crucialActionCheck.allowed) {
      return crucialActionCheck;
    }

    // Then check session limits
    if (!this.canStartNewSession(tier, sessionsToday)) {
      const limits = this.getTierLimits(tier);
      return {
        allowed: false,
        reason: `Je hebt je dagelijkse sessielimiet van ${limits.maxSessionsPerDay} sessies bereikt. Probeer morgen opnieuw of upgrade naar een hogere tier.`
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
      case 'showMe':
        return t('showMeFeatureUpgrade');
      case 'thinkingPartner':
        return t('thinkingPartnerFeatureUpgrade');
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

