import { SubscriptionTier, TierLimits, SessionType } from '../types';

// Tier limits configuration
export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  [SubscriptionTier.FREE]: {
    maxSessionDuration: 15,
    maxSessionsPerDay: 1,
    maxTranscriptLength: 5000,
    allowedFileTypes: ['.txt', 'text/plain']
  },
  [SubscriptionTier.SILVER]: {
    maxSessionDuration: 60,
    maxSessionsPerDay: 3,
    maxTranscriptLength: 15000,
    allowedFileTypes: ['.txt', '.pdf', '.rtf', '.html', '.htm', '.md', 'text/plain', 'application/pdf', 'application/rtf', 'text/html', 'text/markdown']
  },
  [SubscriptionTier.GOLD]: {
    maxSessionDuration: 90,
    maxSessionsPerDay: -1, // unlimited
    maxTranscriptLength: 30000,
    allowedFileTypes: ['.txt', '.pdf', '.rtf', '.html', '.htm', '.md', 'text/plain', 'application/pdf', 'application/rtf', 'text/html', 'text/markdown']
  },
  [SubscriptionTier.ENTERPRISE]: {
    maxSessionDuration: 90,
    maxSessionsPerDay: -1,
    maxTranscriptLength: 50000,
    allowedFileTypes: ['.txt', '.pdf', '.rtf', '.html', '.htm', '.md', 'text/plain', 'application/pdf', 'application/rtf', 'text/html', 'text/markdown']
  },
  [SubscriptionTier.DIAMOND]: {
    maxSessionDuration: 120,
    maxSessionsPerDay: -1,
    maxTranscriptLength: -1, // unlimited
    allowedFileTypes: ['.txt', '.pdf', '.rtf', '.html', '.htm', '.md', 'text/plain', 'application/pdf', 'application/rtf', 'text/html', 'text/markdown']
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
    minTerm: 6,
    cancelable: true
  },
  [SubscriptionTier.GOLD]: {
    price: 8,
    currency: 'EUR',
    billingPeriod: 'month',
    minTerm: 6,
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
    podcast: false,
    exportPpt: false,
    businessCase: false,
    webPage: false
  },
  [SubscriptionTier.SILVER]: {
    chat: false,
    podcast: false,
    exportPpt: false,
    businessCase: false,
    webPage: false
  },
  [SubscriptionTier.GOLD]: {
    chat: true,
    podcast: true,
    exportPpt: true,
    businessCase: true,
    webPage: true
  },
  [SubscriptionTier.ENTERPRISE]: {
    chat: true,
    podcast: true,
    exportPpt: true,
    businessCase: true,
    webPage: true
  },
  [SubscriptionTier.DIAMOND]: {
    chat: true,
    podcast: true,
    exportPpt: true,
    businessCase: true,
    webPage: true
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
  public validateFileUpload(tier: SubscriptionTier, fileType: string): { allowed: boolean; reason?: string } {
    if (!this.isFileTypeAllowed(tier, fileType)) {
      const allowedTypes = TIER_LIMITS[tier].allowedFileTypes.join(', ');
      return {
        allowed: false,
        reason: `Je huidige abonnement ondersteunt alleen ${allowedTypes} bestanden. Upgrade naar Silver of Gold om andere type bestanden te uploaden.`
      };
    }

    return { allowed: true };
  }

  // Validate transcript length
  public validateTranscriptLength(tier: SubscriptionTier, transcriptLength: number): { allowed: boolean; reason?: string } {
    if (!this.isTranscriptLengthAllowed(tier, transcriptLength)) {
      const limits = this.getTierLimits(tier);
      const maxLength = limits.maxTranscriptLength;
      const currentLength = transcriptLength;
      const remaining = this.getRemainingTranscriptLength(tier, currentLength);
      
      return {
        allowed: false,
        reason: `Je transcript is ${currentLength.toLocaleString()} karakters lang, maar je huidige abonnement ondersteunt maximaal ${maxLength.toLocaleString()} karakters. Upgrade naar een hogere tier voor langere transcripten.`
      };
    }

    return { allowed: true };
  }

  // Check if a specific feature is available for a tier
  public isFeatureAvailable(tier: SubscriptionTier, feature: keyof typeof TIER_FEATURES[SubscriptionTier]): boolean {
    return TIER_FEATURES[tier][feature];
  }

  // Get upgrade message for a specific limit
  public getUpgradeMessage(tier: SubscriptionTier, limitType: 'duration' | 'sessions' | 'fileType' | 'transcriptLength'): string {
    const currentLimits = this.getTierLimits(tier);
    
    switch (limitType) {
      case 'duration':
        return `Je hebt de maximale opnametijd van ${currentLimits.maxSessionDuration} minuten voor deze sessie bereikt. Upgrade naar Silver (60 min) of Gold (90 min) voor langere sessies.`;
      case 'sessions':
        return `Je hebt je dagelijkse limiet van ${currentLimits.maxSessionsPerDay} sessie(s) bereikt. Upgrade naar Silver (3 sessies) of Gold (onbeperkt) voor meer sessies.`;
      case 'fileType':
        return `Je huidige abonnement ondersteunt alleen TXT-bestanden. Upgrade naar Silver of Gold om alle bestandstypes te uploaden.`;
      case 'transcriptLength':
        return `Je transcript is te lang voor je huidige abonnement. Upgrade naar Silver (15.000 karakters), Gold (30.000 karakters) of Enterprise (50.000 karakters) voor langere transcripten.`;
      default:
        return 'Upgrade je abonnement voor meer functionaliteiten.';
    }
  }

  // Get upgrade message for a specific feature
  public getFeatureUpgradeMessage(feature: keyof typeof TIER_FEATURES[SubscriptionTier]): string {
    switch (feature) {
      case 'chat':
        return 'Chat functionaliteit is beschikbaar vanaf Gold tier. Upgrade je abonnement om te kunnen chatten met je transcript.';
      case 'podcast':
        return 'Podcast generatie is beschikbaar vanaf Gold tier. Upgrade je abonnement om podcast scripts te genereren.';
      case 'exportPpt':
        return 'PowerPoint export is beschikbaar vanaf Gold tier. Upgrade je abonnement om presentaties te exporteren.';
      case 'businessCase':
        return 'Business case generatie is beschikbaar vanaf Gold tier. Upgrade je abonnement om business cases te genereren.';
      case 'webPage':
        return 'Web pagina import is beschikbaar vanaf Gold tier. Upgrade je abonnement om direct tekst van webpagina\'s te importeren.';
      default:
        return 'Deze functionaliteit is beschikbaar vanaf Gold tier. Upgrade je abonnement voor meer mogelijkheden.';
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

