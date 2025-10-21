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
import { showDiamondTokenToast } from './utils/toastNotification';

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
  console.error('Missing required Firebase environment variables:', missingVars);
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
  // Opt-in emulator usage via env flag to avoid accidental writes to production
  const useEmulators = String(import.meta.env.VITE_USE_FIREBASE_EMULATOR || '').toLowerCase() === 'true';
  if (useEmulators) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.warn('Firebase: Connected to local emulators for Auth (9099) and Firestore (8080)');
    } catch (e) {
      console.error('Failed to connect Firebase emulators:', e);
    }
  } else {
    console.info('Firebase: Using remote services (set VITE_USE_FIREBASE_EMULATOR=true to use local emulators in dev)');
  }
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
        hasHadPaidSubscription: false, // New users start with false
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
  // Zorg dat de user-doc bestaat en voldoet aan security rules (createdAt, etc.)
  await ensureUserDocument(userId);
  await setDoc(userRef, { lastDailyUsageDate: today }, { merge: true });
  if (type === 'audio') {
    await updateDoc(userRef, { dailyAudioCount: increment(1), updatedAt: serverTimestamp() }).catch(async () => {
      // Bij eerste creatie: voeg createdAt toe zodat create door de rules mag
      await setDoc(userRef, { dailyAudioCount: 1, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
    });
  } else {
    await updateDoc(userRef, { dailyUploadCount: increment(1), updatedAt: serverTimestamp() }).catch(async () => {
      await setDoc(userRef, { dailyUploadCount: 1, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
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
  
  console.debug('[Firebase] getUserMonthlyTokens()', { userId, authUid: auth.currentUser?.uid });
  
  // Check if user is authenticated before attempting Firebase operations
  if (!auth.currentUser) {
    console.warn('Token usage retrieval unavailable: user not authenticated');
    return { month: currentMonth, inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }
  
  // Verify the userId matches the authenticated user
  if (auth.currentUser.uid !== userId) {
    console.warn('Token usage retrieval unavailable: userId mismatch');
    return { month: currentMonth, inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }
  
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const data = userSnap.exists() ? userSnap.data() as Record<string, unknown> : {};
    console.debug('[Firebase] getUserMonthlyTokens: userDoc exists?', userSnap.exists(), {
      tokensMonth: (data as any).tokensMonth,
      monthlyInputTokens: (data as any).monthlyInputTokens,
      monthlyOutputTokens: (data as any).monthlyOutputTokens,
      currentMonth
    });
    if (data.tokensMonth === currentMonth) {
      return {
        month: currentMonth,
        inputTokens: (data.monthlyInputTokens as number) || 0,
        outputTokens: (data.monthlyOutputTokens as number) || 0,
        totalTokens: ((data.monthlyInputTokens as number) || 0) + (((data.monthlyOutputTokens as number) || 0) * 5)
      };
    }
    // Reset for a new month
    console.info('[Firebase] getUserMonthlyTokens: resetting month, setting counters to 0', { currentMonth });
    await setDoc(userRef, {
      tokensMonth: currentMonth,
      monthlyInputTokens: 0,
      monthlyOutputTokens: 0,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { month: currentMonth, inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  } catch (error: any) {
    // Handle Firebase permissions errors gracefully
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      console.warn('Token usage retrieval unavailable due to permissions. Returning default values.');
      return { month: currentMonth, inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    } else {
      console.error('Failed to get token usage:', error);
      throw error; // Re-throw other errors
    }
  }
};

export const getUserMonthlySessions = async (userId: string): Promise<MonthlySessionsUsage> => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (!userId) throw new Error(t('userIdEmptyInFirestoreUser', 'userId is leeg in Firestore user functie!'));
  console.debug('[Firebase] getUserMonthlySessions()', { userId });
  const userRef = doc(db, 'users', userId);
  await ensureUserDocument(userId);
  const userSnap = await getDoc(userRef);
  const data = userSnap.exists() ? userSnap.data() as Record<string, unknown> : {};
  console.debug('[Firebase] getUserMonthlySessions: userDoc exists?', userSnap.exists(), {
    sessionsMonth: (data as any).sessionsMonth,
    monthlySessionsCount: (data as any).monthlySessionsCount,
    currentMonth
  });
  if (data.sessionsMonth === currentMonth) {
    return { month: currentMonth, sessions: (data.monthlySessionsCount as number) || 0 };
  }
  console.info('[Firebase] getUserMonthlySessions: resetting month, setting sessions to 0', { currentMonth });
  await setDoc(userRef, { sessionsMonth: currentMonth, monthlySessionsCount: 0, updatedAt: serverTimestamp() }, { merge: true });
  return { month: currentMonth, sessions: 0 };
};

export const getUserMonthlyAudioMinutes = async (userId: string): Promise<MonthlyAudioUsage> => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (!userId) throw new Error(t('userIdEmptyInFirestoreUser', 'userId is leeg in Firestore user functie!'));
  console.debug('[Firebase] getUserMonthlyAudioMinutes()', { userId });
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const data = userSnap.exists() ? userSnap.data() as Record<string, unknown> : {};
  console.debug('[Firebase] getUserMonthlyAudioMinutes: userDoc exists?', userSnap.exists(), {
    audioMinutesMonth: (data as any).audioMinutesMonth,
    monthlyAudioMinutes: (data as any).monthlyAudioMinutes,
    currentMonth
  });
  
  if (data.audioMinutesMonth === currentMonth) {
    return { month: currentMonth, minutes: (data.monthlyAudioMinutes as number) || 0 };
  }
  
  // Reset for a new month
  console.info('[Firebase] getUserMonthlyAudioMinutes: resetting month, setting minutes to 0', { currentMonth });
  await setDoc(userRef, {
    audioMinutesMonth: currentMonth,
    monthlyAudioMinutes: 0,
    lastAudioResetDate: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
  
  return { month: currentMonth, minutes: 0 };
};

export const addUserMonthlyTokens = async (userId: string, inputTokens: number, outputTokens: number): Promise<void> => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (!userId) throw new Error(t('userIdEmptyInFirestoreUser', 'userId is leeg in Firestore user functie!'));
  
  // Check if user is authenticated before attempting Firebase operations
  if (!auth.currentUser) {
    console.warn('Token usage tracking unavailable: user not authenticated');
    return; // Don't throw error, just skip tracking
  }
  
  // Verify the userId matches the authenticated user
  if (auth.currentUser.uid !== userId) {
    console.warn('Token usage tracking unavailable: userId mismatch');
    return; // Don't throw error, just skip tracking
  }
  
  try {
    const userRef = doc(db, 'users', userId);
    await ensureUserDocument(userId);
    await setDoc(userRef, { tokensMonth: currentMonth }, { merge: true });
    await updateDoc(userRef, {
      monthlyInputTokens: increment(inputTokens),
      monthlyOutputTokens: increment(outputTokens),
      updatedAt: serverTimestamp()
    }).catch(async () => {
      await setDoc(userRef, {
        monthlyInputTokens: inputTokens,
        monthlyOutputTokens: outputTokens,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true });
    });

    // Show toast notification for Diamond tier users
    try {
      const userTier = await getUserSubscriptionTier(userId);
      if (userTier === 'diamond') {
        showDiamondTokenToast(inputTokens, outputTokens, userTier);
      }
    } catch (toastError) {
      // Don't let toast errors affect the main functionality
      console.warn('Failed to show Diamond tier toast notification:', toastError);
    }
  } catch (error: any) {
    // Handle Firebase permissions errors gracefully
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      console.warn('Token usage tracking unavailable due to permissions. Functionality continues normally.');
      return; // Don't throw, just log warning and continue
    } else {
      console.error('Failed to update token usage:', error);
      throw error; // Re-throw other errors
    }
  }
};

// Monthly sessions count (no history) on user document
export interface MonthlySessionsUsage {
  month: string; // YYYY-MM
  sessions: number;
}

// Duplicate getUserMonthlySessions removed; using earlier implementation with debug logging.

// Get user's monthly sessions count
export const getUserMonthlySessionsCount = async (userId: string): Promise<number> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return 0;
    }
    
    const userData = userDoc.data();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    // Check if we need to reset monthly count
    if (userData.sessionsMonth !== currentMonth) {
      // Reset monthly count for new month
      await updateDoc(userRef, {
        monthlySessionsCount: 0,
        sessionsMonth: currentMonth
      });
      return 0;
    }
    
    return userData.monthlySessionsCount || 0;
  } catch (error) {
    console.error('Error getting user monthly sessions:', error);
    return 0;
  }
};

// Get user's monthly audio minutes
export const getUserMonthlyAudioMinutesCount = async (userId: string): Promise<number> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return 0;
    }
    
    const userData = userDoc.data();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    // Check if we need to reset monthly count
    if (userData.audioMinutesMonth !== currentMonth) {
      // Reset monthly count for new month
      await updateDoc(userRef, {
        monthlyAudioMinutes: 0,
        audioMinutesMonth: currentMonth,
        lastAudioResetDate: new Date()
      });
      return 0;
    }
    
    return userData.monthlyAudioMinutes || 0;
  } catch (error) {
    console.error('Error getting user monthly audio minutes:', error);
    return 0;
  }
};

export const incrementUserMonthlySessions = async (userId: string): Promise<void> => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (!userId) throw new Error(t('userIdEmptyInFirestoreUser', 'userId is leeg in Firestore user functie!'));
    const userRef = doc(db, 'users', userId);
  await ensureUserDocument(userId);
  await setDoc(userRef, { sessionsMonth: currentMonth }, { merge: true });
  await updateDoc(userRef, { monthlySessionsCount: increment(1), updatedAt: serverTimestamp() }).catch(async () => {
    await setDoc(userRef, { monthlySessionsCount: 1, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }, { merge: true });
  });
};

// Increment user's monthly audio minutes
export const incrementUserMonthlyAudioMinutes = async (userId: string, minutes: number): Promise<void> => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (!userId) throw new Error(t('userIdEmptyInFirestoreUser', 'userId is leeg in Firestore user functie!'));
  const userRef = doc(db, 'users', userId);
  
  try {
    // Ensure we're tracking the current month
    await setDoc(userRef, { audioMinutesMonth: currentMonth }, { merge: true });
    
    await updateDoc(userRef, {
      monthlyAudioMinutes: increment(minutes),
      updatedAt: serverTimestamp()
    }).catch(async () => {
      await setDoc(userRef, {
        monthlyAudioMinutes: minutes,
        audioMinutesMonth: currentMonth,
        lastAudioResetDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    });
  } catch (error: any) {
    // Handle Firebase permissions errors gracefully
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      console.warn('Audio minutes tracking unavailable due to permissions. Recording functionality continues normally.');
      return; // Don't throw, just log warning and continue
    } else {
      console.error('Failed to update audio minutes:', error);
      throw error; // Re-throw other errors
    }
  }
};

// Monthly audio minutes tracking (no history) on user document
export interface MonthlyAudioUsage {
  month: string; // YYYY-MM
  minutes: number;
}

// Duplicate getUserMonthlyAudioMinutes removed; using earlier implementation with debug logging.

export const addUserMonthlyAudioMinutes = async (userId: string, minutes: number): Promise<void> => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (!userId) throw new Error(t('userIdEmptyInFirestoreUser', 'userId is leeg in Firestore user functie!'));
  const userRef = doc(db, 'users', userId);
  await ensureUserDocument(userId);
  
  // Ensure we're tracking the current month
  await setDoc(userRef, { audioMinutesMonth: currentMonth }, { merge: true });
  
  await updateDoc(userRef, {
    monthlyAudioMinutes: increment(minutes),
    updatedAt: serverTimestamp()
  }).catch(async () => {
    await setDoc(userRef, {
      monthlyAudioMinutes: minutes,
      audioMinutesMonth: currentMonth,
      lastAudioResetDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });
  });
};

// Helper function to get remaining audio minutes for user's tier
export const getRemainingAudioMinutes = async (userId: string): Promise<{ remaining: number; total: number; used: number }> => {
  try {
    const userTier = await getUserSubscriptionTier(userId);
    const monthlyUsage = await getUserMonthlyAudioMinutes(userId);
    
    // Define tier limits
    const tierLimits = {
      'Free': 60,
      'Silver': 500,
      'Gold': 1000,
      'Enterprise': 2500,
      'Diamond': 2500
    };
    
    const totalAllowed = tierLimits[userTier as keyof typeof tierLimits] || 60;
    const used = monthlyUsage.minutes;
    const remaining = Math.max(0, totalAllowed - used);
    
    return { remaining, total: totalAllowed, used };
  } catch (error) {
    console.error('Error getting remaining audio minutes:', error);
    return { remaining: 0, total: 60, used: 0 };
  }
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
  // Check if user is authenticated before attempting Firebase operations
  if (!auth.currentUser) {
    console.warn('Token usage retrieval unavailable: user not authenticated');
    return null;
  }
  
  // Verify the userId matches the authenticated user
  if (auth.currentUser.uid !== userId) {
    console.warn('Token usage retrieval unavailable: userId mismatch');
    return null;
  }
  
  try {
    const today = new Date().toISOString().split('T')[0];
    if (!userId) throw new Error(t('userIdEmptyInTokenUsage', 'userId is leeg in Firestore token usage functie!'));
    const tokenUsageRef = doc(db, 'tokenUsage', `${userId}_${today}`);
    const tokenUsageDoc = await getDoc(tokenUsageRef);
    
    if (tokenUsageDoc.exists()) {
      return tokenUsageDoc.data() as TokenUsage;
    }
    return null;
  } catch (error: any) {
    // Handle Firebase permissions errors gracefully
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      console.warn('Token usage retrieval unavailable due to permissions. Returning null.');
      return null;
    } else {
      console.error(t('errorGettingTokenUsageToday', 'Error getting token usage today:'), error);
      return null;
    }
  }
};

export const getTokenUsageThisMonth = async (userId: string): Promise<TokenUsage[]> => {
  // Check if user is authenticated before attempting Firebase operations
  if (!auth.currentUser) {
    console.warn('Token usage retrieval unavailable: user not authenticated');
    return [];
  }
  
  // Verify the userId matches the authenticated user
  if (auth.currentUser.uid !== userId) {
    console.warn('Token usage retrieval unavailable: userId mismatch');
    return [];
  }
  
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
    const results = querySnapshot.docs.map(doc => doc.data() as TokenUsage);
    return results;
  } catch (error: any) {
    // Handle Firebase permissions errors gracefully
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      console.warn('Token usage retrieval unavailable due to permissions. Returning empty array.');
      return [];
    } else {
      console.error(t('errorGettingTokenUsageThisMonth', 'Error getting token usage this month:'), error);
      return [];
    }
  }
};



// Debug function to check if any token usage data exists
export const debugTokenUsageData = async (userId: string): Promise<void> => {
  try {
    const todayUsage = await getTokenUsageToday(userId);
    const monthlyUsage = await getTokenUsageThisMonth(userId);
    const totalMonthly = monthlyUsage.reduce((sum, usage) => sum + (usage.totalTokens || 0), 0);
  } catch (error) {
    // Debug token usage data error
  }
};

export const getTotalTokenUsage = async (userId: string, period: 'daily' | 'monthly' = 'monthly'): Promise<number> => {
  // Check if user is authenticated before attempting Firebase operations
  if (!auth.currentUser) {
    console.warn('Token usage retrieval unavailable: user not authenticated');
    return 0;
  }
  
  // Verify the userId matches the authenticated user
  if (auth.currentUser.uid !== userId) {
    console.warn('Token usage retrieval unavailable: userId mismatch');
    return 0;
  }
  
  try {
    if (period === 'daily') {
      const dailyUsage = await getTokenUsageToday(userId);
      return dailyUsage?.totalTokens || 0;
    } else {
      const monthlyUsageArray = await getTokenUsageThisMonth(userId);
      const total = monthlyUsageArray.reduce((sum, usage) => sum + usage.totalTokens, 0);
      return total;
    }
  } catch (error: any) {
    // Handle Firebase permissions errors gracefully
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      console.warn('Token usage retrieval unavailable due to permissions. Returning 0.');
      return 0;
    } else {
      console.error('Failed to get total token usage:', error);
      return 0;
    }
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
    // Error getting user preferences
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
    // Error saving user preferences
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
  } catch (error) {
    // Error updating Stripe data
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
    // Error getting Stripe data
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
  } catch (error) {
    // Error scheduling tier change
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
  } catch (error) {
    // Error clearing tier change
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
  } catch (error) {
    // Error creating pricing tier
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

// Referral validation function
export const validateReferralCode = async (referralCode: string): Promise<{ isValid: boolean; referrerData?: any }> => {
  try {
    if (import.meta.env.DEV) console.debug('[REFERRAL] Validating referral code:', referralCode);
    
    if (!referralCode || referralCode.trim() === '') {
    if (import.meta.env.DEV) console.debug('[REFERRAL] Empty referral code provided');
      return { isValid: false };
    }

    const trimmedCode = referralCode.trim();
    if (import.meta.env.DEV) console.debug('[REFERRAL] Checking code:', trimmedCode);
    
    // Try to get the referral code document directly
    const referralCodeRef = doc(db, 'referral_codes', trimmedCode);
    const referralCodeDoc = await getDoc(referralCodeRef);
    
    if (import.meta.env.DEV) console.debug('[REFERRAL] Code exists:', referralCodeDoc.exists());
    
    if (!referralCodeDoc.exists()) {
    if (import.meta.env.DEV) console.debug('[DEBUG] No referral code document found for:', trimmedCode);
      return { isValid: false };
    }
    
    const referralCodeData = referralCodeDoc.data();
    if (import.meta.env.DEV) console.debug('[DEBUG] Referral code data:', referralCodeData);
    
    // Check if the referral code is active
    if (!referralCodeData.active) {
    if (import.meta.env.DEV) console.debug('[DEBUG] Referral code is not active:', trimmedCode);
      return { isValid: false };
    }
    
    // Return referrer data from the referral_codes collection
    // This avoids the need to access user documents which require authentication
    const referrerData = {
      id: referralCodeData.userId,
      email: referralCodeData.userEmail,
      referralCode: trimmedCode
    };
    
    if (import.meta.env.DEV) console.debug('[DEBUG] Referral code validation successful:', referrerData);
    
    return { 
      isValid: true, 
      referrerData
    };
  } catch (error) {
    console.error('[DEBUG] Error in validateReferralCode:', error);
    return { isValid: false };
  }
};

// Server-side referral validation (more secure alternative)
export const validateReferralCodeServerSide = async (referralCode: string): Promise<{ isValid: boolean; referrerData?: any }> => {
  try {
    if (import.meta.env.DEV) console.debug('[REFERRAL] Server-side validation for code:', referralCode);
    
    if (!referralCode || referralCode.trim() === '') {
    if (import.meta.env.DEV) console.debug('[REFERRAL] Empty referral code provided');
      return { isValid: false };
    }

    const response = await fetch('/.netlify/functions/referral-validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ referralCode: referralCode.trim() })
    });

    if (!response.ok) {
      console.error('[REFERRAL] Server validation failed:', response.status, response.statusText);
      return { isValid: false };
    }

    const result = await response.json();
    if (import.meta.env.DEV) console.debug('[REFERRAL] Server validation result:', result);
    
    return result;
  } catch (error) {
    console.error('[REFERRAL] Error in server-side validation:', error);
    // Fallback to client-side validation if server-side fails
    if (import.meta.env.DEV) console.debug('[REFERRAL] Falling back to client-side validation');
    return validateReferralCode(referralCode);
  }
};

export default app;
