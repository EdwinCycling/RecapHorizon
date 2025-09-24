import { initializeApp } from 'firebase/app'; 
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  updateDoc,
  setDoc,
  increment
} from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { TokenUsage, UserPreferences, SubscriptionTier } from '../types';
import { useTranslation } from './hooks/useTranslation';

const { t } = useTranslation();

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate that all required Firebase environment variables are present
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0) {
  console.error(t('missingFirebaseEnvVars', 'Missing required Firebase environment variables:'), missingVars);
  throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check (optional but recommended)
// In development, use a debug token so you can test without a real CAPTCHA
if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const recaptchaV3SiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
const recaptchaEnterpriseSiteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY as string | undefined;

try {
  if (recaptchaEnterpriseSiteKey) {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaEnterpriseSiteKey),
      isTokenAutoRefreshEnabled: true
    });
  } else if (recaptchaV3SiteKey) {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaV3SiteKey),
      isTokenAutoRefreshEnabled: true
    });
  } else {
    console.warn(t('firebaseAppCheckNotInitialized', 'Firebase App Check not initialized: no site key provided (set VITE_RECAPTCHA_ENTERPRISE_SITE_KEY or VITE_RECAPTCHA_SITE_KEY).'));
  }
} catch (err) {
  console.error(t('failedToInitializeAppCheck', 'Failed to initialize Firebase App Check:'), err);
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to emulators in development (optional)
if (import.meta.env.DEV) {
  // Uncomment these lines if you want to use Firebase emulators for development
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

// Helper function to create user document if it doesn't exist
export const ensureUserDocument = async (userId: string, userEmail?: string): Promise<void> => {
  try {
    if (!userId) throw new Error(t('userIdEmptyInEnsureUser', 'userId is leeg in ensureUserDocument!'));
    
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user document with default values
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      
      await setDoc(userRef, {
        email: userEmail || '',
        subscriptionTier: 'free',
        currentSubscriptionStatus: 'active',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        nextBillingDate: null,
        currentSubscriptionStartDate: null,
        scheduledTierChange: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastDailyUsageDate: today,
        dailyAudioCount: 0,
        dailyUploadCount: 0,
        tokensMonth: currentMonth,
        monthlyInputTokens: 0,
        monthlyOutputTokens: 0,
        sessionsMonth: currentMonth,
        monthlySessionsCount: 0
      });
      
      console.log(t('userDocumentCreated', 'Gebruikersdocument aangemaakt voor'), userId);
    }
  } catch (error) {
    console.error(t('errorCreatingUserDocument', 'Fout bij aanmaken gebruikersdocument:'), error);
    throw error;
  }
};

// Helper function to get user subscription tier
export const getUserSubscriptionTier = async (userId: string): Promise<string> => {
  try {
    if (!userId) throw new Error(t('userIdEmptyInSubscriptionTier', 'userId is leeg in getUserSubscriptionTier!'));
    
    // Ensure user document exists first
    await ensureUserDocument(userId);
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data()?.subscriptionTier || 'free';
    }
    return 'free';
  } catch (error) {
    const { errorHandler } = await import('./utils/errorHandler');
    errorHandler.handleError(error, 'api' as any, {
      userId,
      additionalContext: { action: 'getUserSubscriptionTier' }
    });
    return 'free';
  }
};

// Daily usage (per type) stored on user document (no history)
export type UsageSessionType = 'audio' | 'upload';

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  audioCount: number;
  uploadCount: number;
}

export const getUserDailyUsage = async (userId: string): Promise<DailyUsage> => {
  const today = new Date().toISOString().split('T')[0];
  if (!userId) throw new Error(t('userIdEmptyInFirestoreUser', 'userId is leeg in Firestore user functie!'));
    const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const data = userSnap.exists() ? userSnap.data() as Record<string, unknown> : {};
  const lastDate: string | undefined = data.lastDailyUsageDate as string | undefined;
  const audioCount: number = (data.dailyAudioCount as number) || 0;
  const uploadCount: number = (data.dailyUploadCount as number) || 0;

  if (lastDate === today) {
    return { date: today, audioCount, uploadCount };
  }

  // Reset counters for a new day
  await updateDoc(userRef, {
    lastDailyUsageDate: today,
    dailyAudioCount: 0,
    dailyUploadCount: 0,
    updatedAt: serverTimestamp()
  }).catch(async () => {
    await setDoc(userRef, {
      lastDailyUsageDate: today,
      dailyAudioCount: 0,
      dailyUploadCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  });

  return { date: today, audioCount: 0, uploadCount: 0 };
};

export const incrementUserDailyUsage = async (userId: string, type: UsageSessionType): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  if (!userId) throw new Error(t('userIdEmptyInFirestoreUser', 'userId is leeg in Firestore user functie!'));
    const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { lastDailyUsageDate: today }, { merge: true });
  if (type === 'audio') {
    await updateDoc(userRef, { dailyAudioCount: increment(1), updatedAt: serverTimestamp() }).catch(async () => {
      await setDoc(userRef, { dailyAudioCount: 1, updatedAt: serverTimestamp() }, { merge: true });
    });
  } else {
    await updateDoc(userRef, { dailyUploadCount: increment(1), updatedAt: serverTimestamp() }).catch(async () => {
      await setDoc(userRef, { dailyUploadCount: 1, updatedAt: serverTimestamp() }, { merge: true });
    });
  }
};

// Monthly tokens (no history) on user document
export interface MonthlyTokensUsage {
  month: string; // YYYY-MM
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export const getUserMonthlyTokens = async (userId: string): Promise<MonthlyTokensUsage> => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (!userId) throw new Error(t('userIdEmptyInFirestoreUser', 'userId is leeg in Firestore user functie!'));
    const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const data = userSnap.exists() ? userSnap.data() as Record<string, unknown> : {};
  if (data.tokensMonth === currentMonth) {
    return {
      month: currentMonth,
      inputTokens: (data.monthlyInputTokens as number) || 0,
      outputTokens: (data.monthlyOutputTokens as number) || 0,
      totalTokens: ((data.monthlyInputTokens as number) || 0) + (((data.monthlyOutputTokens as number) || 0) * 5)
    };
  }
  // Reset for a new month
  await setDoc(userRef, {
    tokensMonth: currentMonth,
    monthlyInputTokens: 0,
    monthlyOutputTokens: 0,
    updatedAt: serverTimestamp()
  }, { merge: true });
  return { month: currentMonth, inputTokens: 0, outputTokens: 0, totalTokens: 0 };
};

export const addUserMonthlyTokens = async (userId: string, inputTokens: number, outputTokens: number): Promise<void> => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (!userId) throw new Error(t('userIdEmptyInFirestoreUser', 'userId is leeg in Firestore user functie!'));
    const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { tokensMonth: currentMonth }, { merge: true });
  await updateDoc(userRef, {
    monthlyInputTokens: increment(inputTokens),
    monthlyOutputTokens: increment(outputTokens),
    updatedAt: serverTimestamp()
  }).catch(async () => {
    await setDoc(userRef, {
      monthlyInputTokens: inputTokens,
      monthlyOutputTokens: outputTokens,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
};

// Monthly sessions count (no history) on user document
export interface MonthlySessionsUsage {
  month: string; // YYYY-MM
  sessions: number;
}

export const getUserMonthlySessions = async (userId: string): Promise<MonthlySessionsUsage> => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (!userId) throw new Error(t('userIdEmptyInFirestoreUser', 'userId is leeg in Firestore user functie!'));
    const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const data = userSnap.exists() ? userSnap.data() as Record<string, unknown> : {};
  if (data.sessionsMonth === currentMonth) {
    return { month: currentMonth, sessions: (data.monthlySessionsCount as number) || 0 };
  }
  await setDoc(userRef, { sessionsMonth: currentMonth, monthlySessionsCount: 0, updatedAt: serverTimestamp() }, { merge: true });
  return { month: currentMonth, sessions: 0 };
};

export const incrementUserMonthlySessions = async (userId: string): Promise<void> => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (!userId) throw new Error(t('userIdEmptyInFirestoreUser', 'userId is leeg in Firestore user functie!'));
    const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { sessionsMonth: currentMonth }, { merge: true });
  await updateDoc(userRef, { monthlySessionsCount: increment(1), updatedAt: serverTimestamp() }).catch(async () => {
    await setDoc(userRef, { monthlySessionsCount: 1, updatedAt: serverTimestamp() }, { merge: true });
  });
};

// Helper function to track user session
export const trackUserSession = async (userId: string, sessionData: {
  type: 'audio_recording' | 'file_upload';
  startTime: Date;
  endTime?: Date;
  duration: number;
  fileType?: string;
  status: 'active' | 'completed' | 'failed';
}) => {
  try {
    await addDoc(collection(db, 'userSessions'), {
      userId,
      ...sessionData,
      startTime: sessionData.startTime instanceof Date ? sessionData.startTime : new Date(sessionData.startTime),
      endTime: sessionData.endTime instanceof Date ? sessionData.endTime : (sessionData.endTime ? new Date(sessionData.endTime) : undefined),
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error(t('errorTrackingUserSession', 'Error tracking user session:'), error);
  }
};

// Helper function to get user sessions count for today
export const getUserSessionsToday = async (userId: string): Promise<number> => {
  try {
    // Vereenvoudigde query zonder complexe filters om index problemen te voorkomen
    const sessionsQuery = query(
      collection(db, 'userSessions'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(sessionsQuery);
    
    // Filter lokaal op status en datum
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySessions = querySnapshot.docs.filter(doc => {
      const data = doc.data();
      const startTime = data.startTime?.toDate?.() || new Date(data.startTime);
      const status = data.status;
      
      return startTime >= today && ['completed', 'failed'].includes(status);
    });
    
    return todaySessions.length;
  } catch (error) {
    console.error(t('errorGettingUserSessionsToday', 'Error getting user sessions today:'), error);
    return 0;
  }
};

// Helper function to get user sessions count for this month
export const getUserSessionsThisMonth = async (userId: string): Promise<number> => {
  try {
    // Vereenvoudigde query zonder complexe filters om index problemen te voorkomen
    const sessionsQuery = query(
      collection(db, 'userSessions'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(sessionsQuery);
    
    // Filter lokaal op status en datum
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthSessions = querySnapshot.docs.filter(doc => {
      const data = doc.data();
      const startTime = data.startTime?.toDate?.() || new Date(data.startTime);
      const status = data.status;
      
      return startTime >= startOfMonth && ['completed', 'failed'].includes(status);
    });
    
    return monthSessions.length;
  } catch (error) {
    console.error(t('errorGettingUserSessionsThisMonth', 'Error getting user sessions this month:'), error);
    return 0;
  }
};

// Token usage tracking functions
export const updateTokenUsage = async (userId: string, inputTokens: number, outputTokens: number): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    if (!userId) throw new Error(t('userIdEmptyInTokenUsage', 'userId is leeg in Firestore token usage functie!'));
    const tokenUsageRef = doc(db, 'tokenUsage', `${userId}_${today}`);
    
    const tokenUsageDoc = await getDoc(tokenUsageRef);
    
    if (tokenUsageDoc.exists()) {
      // Update existing document
      await updateDoc(tokenUsageRef, {
        inputTokens: increment(inputTokens),
        outputTokens: increment(outputTokens),
        totalTokens: increment(inputTokens + outputTokens),
        lastUpdated: serverTimestamp()
      });
    } else {
      // Create new document
      const tokenUsage: TokenUsage = {
        userId,
        date: today,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        lastUpdated: new Date()
      };
      await setDoc(tokenUsageRef, tokenUsage);
    }
  } catch (error) {
    console.error(t('errorUpdatingTokenUsage', 'Error updating token usage:'), error);
  }
};

export const getTokenUsageToday = async (userId: string): Promise<TokenUsage | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    if (!userId) throw new Error(t('userIdEmptyInTokenUsage', 'userId is leeg in Firestore token usage functie!'));
    const tokenUsageRef = doc(db, 'tokenUsage', `${userId}_${today}`);
    const tokenUsageDoc = await getDoc(tokenUsageRef);
    
    if (tokenUsageDoc.exists()) {
      return tokenUsageDoc.data() as TokenUsage;
    }
    return null;
  } catch (error) {
    console.error(t('errorGettingTokenUsageToday', 'Error getting token usage today:'), error);
    return null;
  }
};

export const getTokenUsageThisMonth = async (userId: string): Promise<TokenUsage[]> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
    
    const tokenUsageQuery = query(
      collection(db, 'tokenUsage'),
      where('userId', '==', userId),
      where('date', '>=', startOfMonthStr)
    );
    
    const querySnapshot = await getDocs(tokenUsageQuery);
    return querySnapshot.docs.map(doc => doc.data() as TokenUsage);
  } catch (error) {
    console.error(t('errorGettingTokenUsageThisMonth', 'Error getting token usage this month:'), error);
    return [];
  }
};



export const getTotalTokenUsage = async (userId: string, period: 'monthly' | 'daily'): Promise<number> => {
  try {
    if (period === 'daily') {
      const todayUsage = await getTokenUsageToday(userId);
      return todayUsage?.totalTokens || 0;
    } else {
      const monthlyUsage = await getTokenUsageThisMonth(userId);
      const total = monthlyUsage.reduce((total, usage) => total + usage.totalTokens, 0);
      return total;
    }
  } catch (error) {
    console.error(t('errorGettingTotalTokenUsage', 'Error getting total token usage:'), error);
    return 0;
  }
};

// User preferences functions
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  try {
    if (!userId) throw new Error(t('userIdEmptyInUserPreferences', 'userId is leeg in Firestore userPreferences functie!'));
    const userPrefsRef = doc(db, 'userPreferences', userId);
    const userPrefsDoc = await getDoc(userPrefsRef);
    
    if (userPrefsDoc.exists()) {
      return userPrefsDoc.data() as UserPreferences;
    }
    return null;
  } catch (error) {
    console.error(t('errorGettingUserPreferences', 'Error getting user preferences:'), error);
    return null;
  }
};

export const saveUserPreferences = async (userId: string, preferences: Partial<UserPreferences>): Promise<void> => {
  try {
    if (!userId) throw new Error(t('userIdEmptyInUserPreferences', 'userId is leeg in Firestore userPreferences functie!'));
    const userPrefsRef = doc(db, 'userPreferences', userId);
    const existingPrefs = await getUserPreferences(userId);
    
    const updatedPrefs: UserPreferences = {
      userId,
      sessionLanguage: preferences.sessionLanguage || existingPrefs?.sessionLanguage || 'nl',
      outputLanguage: preferences.outputLanguage || existingPrefs?.outputLanguage || 'nl',
      createdAt: existingPrefs?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(userPrefsRef, updatedPrefs);
  } catch (error) {
    console.error(t('errorSavingUserPreferences', 'Error saving user preferences:'), error);
  }
};

// Stripe subscription management functions
export const updateUserStripeData = async (userId: string, stripeData: {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  subscriptionTier?: string;
  currentSubscriptionStatus?: string;
  nextBillingDate?: Date;
  currentSubscriptionStartDate?: Date;
}): Promise<void> => {
  try {
    if (!userId) throw new Error(t('userIdEmptyInStripeUpdate', 'userId is leeg in updateUserStripeData!'));
    
    const userRef = doc(db, 'users', userId);
    const updateData: any = {
      updatedAt: serverTimestamp()
    };
    
    if (stripeData.stripeCustomerId !== undefined) updateData.stripeCustomerId = stripeData.stripeCustomerId;
    if (stripeData.stripeSubscriptionId !== undefined) updateData.stripeSubscriptionId = stripeData.stripeSubscriptionId;
    if (stripeData.stripePriceId !== undefined) updateData.stripePriceId = stripeData.stripePriceId;
    if (stripeData.subscriptionTier !== undefined) updateData.subscriptionTier = stripeData.subscriptionTier;
    if (stripeData.currentSubscriptionStatus !== undefined) updateData.currentSubscriptionStatus = stripeData.currentSubscriptionStatus;
    if (stripeData.nextBillingDate !== undefined) updateData.nextBillingDate = stripeData.nextBillingDate;
    if (stripeData.currentSubscriptionStartDate !== undefined) updateData.currentSubscriptionStartDate = stripeData.currentSubscriptionStartDate;
    
    await updateDoc(userRef, updateData);
    console.log(t('stripeDataUpdated', 'Stripe gegevens bijgewerkt voor gebruiker'), userId);
  } catch (error) {
    console.error(t('errorUpdatingStripeData', 'Fout bij bijwerken Stripe gegevens:'), error);
    throw error;
  }
};

export const getUserStripeData = async (userId: string): Promise<{
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentSubscriptionStatus: string;
  nextBillingDate: Date | null;
  currentSubscriptionStartDate: Date | null;
  scheduledTierChange: any | null;
} | null> => {
  try {
    if (!userId) throw new Error(t('userIdEmptyInStripeGet', 'userId is leeg in getUserStripeData!'));
    
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        stripeCustomerId: data.stripeCustomerId || null,
        stripeSubscriptionId: data.stripeSubscriptionId || null,
        stripePriceId: data.stripePriceId || null,
        currentSubscriptionStatus: data.currentSubscriptionStatus || 'active',
        nextBillingDate: data.nextBillingDate ? data.nextBillingDate.toDate() : null,
        currentSubscriptionStartDate: data.currentSubscriptionStartDate ? data.currentSubscriptionStartDate.toDate() : null,
        scheduledTierChange: data.scheduledTierChange || null
      };
    }
    return null;
  } catch (error) {
    console.error(t('errorGettingStripeData', 'Fout bij ophalen Stripe gegevens:'), error);
    return null;
  }
};

export const scheduleSubscriptionTierChange = async (userId: string, tierChange: {
  tier: string;
  effectiveDate: Date;
  action: 'downgrade' | 'cancel';
}): Promise<void> => {
  try {
    if (!userId) throw new Error(t('userIdEmptyInScheduleChange', 'userId is leeg in scheduleSubscriptionTierChange!'));
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      scheduledTierChange: {
        tier: tierChange.tier,
        effectiveDate: tierChange.effectiveDate,
        action: tierChange.action
      },
      updatedAt: serverTimestamp()
    });
    
    console.log(t('tierChangeScheduled', 'Tier wijziging gepland voor gebruiker'), userId);
  } catch (error) {
    console.error(t('errorSchedulingTierChange', 'Fout bij plannen tier wijziging:'), error);
    throw error;
  }
};

export const clearScheduledTierChange = async (userId: string): Promise<void> => {
  try {
    if (!userId) throw new Error(t('userIdEmptyInClearSchedule', 'userId is leeg in clearScheduledTierChange!'));
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      scheduledTierChange: null,
      updatedAt: serverTimestamp()
    });
    
    console.log(t('tierChangeCleared', 'Geplande tier wijziging gewist voor gebruiker'), userId);
  } catch (error) {
    console.error(t('errorClearingTierChange', 'Fout bij wissen geplande tier wijziging:'), error);
    throw error;
  }
};

// Pricing tiers management functions
export const createPricingTier = async (tierData: {
  tier: string;
  billingCycle: string;
  priceEur: number;
  stripeProductId: string;
  stripePriceId: string;
  description: string;
  isActive: boolean;
}): Promise<void> => {
  try {
    const pricingTiersRef = collection(db, 'pricing_tiers');
    await addDoc(pricingTiersRef, {
      ...tierData,
      effectiveDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(t('pricingTierCreated', 'Pricing tier aangemaakt:'), tierData.tier);
  } catch (error) {
    console.error(t('errorCreatingPricingTier', 'Fout bij aanmaken pricing tier:'), error);
    throw error;
  }
};

export const getPricingTiers = async (): Promise<any[]> => {
  try {
    const pricingTiersRef = collection(db, 'pricing_tiers');
    const q = query(pricingTiersRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(t('errorGettingPricingTiers', 'Fout bij ophalen pricing tiers:'), error);
    return [];
  }
};

export const getPricingTierByStripePrice = async (stripePriceId: string): Promise<any | null> => {
  try {
    const pricingTiersRef = collection(db, 'pricing_tiers');
    const q = query(pricingTiersRef, where('stripePriceId', '==', stripePriceId), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    return null;
  } catch (error) {
    console.error(t('errorGettingPricingTierByStripe', 'Fout bij ophalen pricing tier via Stripe ID:'), error);
    return null;
  }
};

// Stripe webhook logging functions
export const logStripeWebhook = async (webhookData: {
  eventId: string;
  eventType: string;
  rawPayload: any;
  processed: boolean;
  processingError?: string;
}): Promise<void> => {
  try {
    const webhooksRef = collection(db, 'stripe_webhooks');
    await addDoc(webhooksRef, {
      ...webhookData,
      receivedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    console.log(t('stripeWebhookLogged', 'Stripe webhook gelogd:'), webhookData.eventType);
  } catch (error) {
    console.error(t('errorLoggingStripeWebhook', 'Fout bij loggen Stripe webhook:'), error);
    throw error;
  }
};

export const updateWebhookProcessingStatus = async (webhookId: string, processed: boolean, processingError?: string): Promise<void> => {
  try {
    const webhookRef = doc(db, 'stripe_webhooks', webhookId);
    const updateData: any = {
      processed,
      processedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    if (processingError) {
      updateData.processingError = processingError;
    }
    
    await updateDoc(webhookRef, updateData);
    console.log(t('webhookStatusUpdated', 'Webhook status bijgewerkt:'), webhookId);
  } catch (error) {
    console.error(t('errorUpdatingWebhookStatus', 'Fout bij bijwerken webhook status:'), error);
    throw error;
  }
};

export const getUnprocessedWebhooks = async (): Promise<any[]> => {
  try {
    const webhooksRef = collection(db, 'stripe_webhooks');
    const q = query(webhooksRef, where('processed', '==', false));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(t('errorGettingUnprocessedWebhooks', 'Fout bij ophalen onverwerkte webhooks:'), error);
    return [];
  }
};

export default app;
