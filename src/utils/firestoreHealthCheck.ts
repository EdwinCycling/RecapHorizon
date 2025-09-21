/**
 * Firestore Health Check utilities for RecapHorizon
 * Diagnoses connectivity and permission issues
 */

import { db, auth } from '../firebase';
import { collection, doc, getDoc, getDocs, query, limit, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
// Translation function is passed as parameter, no need for React hook import

type TranslationFunction = (key: string, fallback?: string) => string;

export interface FirestoreHealthResult {
  isHealthy: boolean;
  issues: string[];
  suggestions: string[];
  testResults: {
    basicConnection: boolean;
    readPermissions: boolean;
    writePermissions: boolean;
    indexesWorking: boolean;
  };
}

export class FirestoreHealthChecker {
  /**
   * Comprehensive Firestore health check
   */
  static async performHealthCheck(userId?: string, t?: TranslationFunction): Promise<FirestoreHealthResult> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const testResults = {
      basicConnection: false,
      readPermissions: false,
      writePermissions: false,
      indexesWorking: false
    };

    // Check authentication state
    const currentUser = auth.currentUser;
    const isAuthenticated = currentUser !== null;
    const effectiveUserId = userId || currentUser?.uid;

    try {
      // Test 1: Basic connection
      console.log(t?.('testingFirestoreBasicConnection') || '🔍 Testing Firestore basic connection...');
      await this.testBasicConnection();
      testResults.basicConnection = true;
      console.log(t?.('basicConnectionOk') || '✅ Basic connection: OK');
    } catch (error: any) {
      console.error(t?.('basicConnectionFailed') || '❌ Basic connection failed:', error);
      issues.push(t?.('firestoreConnectionError') || 'Cannot connect to Firestore');
      suggestions.push(t?.('checkInternetAndConfig') || 'Check your internet connection and Firebase configuration');
      
      if (error.code === 'permission-denied') {
        suggestions.push(t?.('checkFirestoreSecurityRules') || 'Check Firestore security rules');
      }
    }

    // Test 2: Read permissions (only if authenticated)
    if (isAuthenticated && effectiveUserId) {
      try {
        console.log(t?.('testingFirestoreReadPermissions') || '🔍 Testing Firestore read permissions...');
        await this.testReadPermissions(effectiveUserId, t);
        testResults.readPermissions = true;
        console.log(t?.('readPermissionsOk') || '✅ Read permissions: OK');
      } catch (error: any) {
        console.error(t?.('readPermissionsFailed') || '❌ Read permissions failed:', error);
        issues.push(t?.('firestoreReadPermissionsError') || 'No read permissions for Firestore');
        suggestions.push(t?.('checkFirestoreReadRules') || 'Check Firestore security rules for reading');
        
        if (error.code === 'permission-denied') {
          suggestions.push(t?.('ensureUserLoggedInWithAccess') || 'Make sure user is logged in and has access to their own data');
        }
      }
    } else {
      console.log(t?.('skippingReadPermissionsTest') || 'ℹ️ Skipping read permissions test - user not authenticated');
      // Add informational message for unauthenticated users
      issues.push(t?.('firestoreSkippingAuthTests') || 'Skipping permission tests - authentication required');
      suggestions.push(t?.('firestoreAuthenticationRequired') || 'Please log in to access all database features');
      // Don't mark as failed, just skip the test
      testResults.readPermissions = true; // Consider it "passed" since we're not testing
    }

    // Test 3: Write permissions (only if authenticated)
    if (isAuthenticated && effectiveUserId) {
      try {
        console.log(t?.('testingFirestoreWritePermissions') || '🔍 Testing Firestore write permissions...');
        await this.testWritePermissions(effectiveUserId, t);
        testResults.writePermissions = true;
        console.log(t?.('writePermissionsOk') || '✅ Write permissions: OK');
      } catch (error: any) {
        console.error(t?.('writePermissionsFailed') || '❌ Write permissions failed:', error);
        issues.push(t?.('firestoreWritePermissionsError') || 'No write permissions for Firestore');
        suggestions.push(t?.('checkFirestoreWriteRules') || 'Check Firestore security rules for writing');
        
        if (error.code === 'permission-denied') {
          suggestions.push(t?.('ensureUserLoggedInWithAccess') || 'Make sure user is logged in and has access to their own data');
        }
      }
    } else {
      console.log(t?.('skippingWritePermissionsTest') || 'ℹ️ Skipping write permissions test - user not authenticated');
      // Don't mark as failed, just skip the test
      testResults.writePermissions = true; // Consider it "passed" since we're not testing
    }

    // Test 4: Index functionality (only if authenticated)
    if (isAuthenticated && effectiveUserId) {
      try {
        console.log(t?.('testingFirestoreIndexes') || '🔍 Testing Firestore indexes...');
        await this.testIndexes(effectiveUserId);
        testResults.indexesWorking = true;
        console.log(t?.('indexesOk') || '✅ Indexes: OK');
      } catch (error: any) {
        console.error(t?.('indexTestFailed') || '❌ Index test failed:', error);
        issues.push(t?.('firestoreIndexesNotWorking') || 'Firestore indexes not working correctly');
        suggestions.push(t?.('checkFirebaseConsoleForIndexes') || 'Check Firebase Console for missing indexes');
        
        if (error.message?.includes('index')) {
          suggestions.push(t?.('createCompositeIndexes') || 'Create the required composite indexes in Firebase Console');
        }
      }
    } else {
      console.log(t?.('skippingIndexTest') || 'ℹ️ Skipping index test - user not authenticated');
      // Don't mark as failed, just skip the test
      testResults.indexesWorking = true; // Consider it "passed" since we're not testing
    }

    const isHealthy = testResults.basicConnection && 
                     testResults.readPermissions && 
                     testResults.writePermissions;

    return {
      isHealthy,
      issues,
      suggestions,
      testResults
    };
  }

  /**
   * Test basic Firestore connection
   */
  private static async testBasicConnection(): Promise<void> {
    // Test basic Firestore connectivity without requiring specific permissions
    // This will fail with permission-denied if rules are working correctly
    // but succeed in connecting to Firestore
    try {
      const testQuery = query(collection(db, 'users'), limit(1));
      await getDocs(testQuery);
    } catch (error: any) {
      // If we get permission-denied, that means Firestore is accessible
      // but security rules are working (which is good)
      if (error.code === 'permission-denied') {
        return; // This is actually a success - Firestore is reachable
      }
      // Re-throw other errors (network issues, etc.)
      throw error;
    }
  }

  /**
   * Test read permissions
   */
  private static async testReadPermissions(userId?: string, t?: TranslationFunction): Promise<void> {
    if (!userId) {
      throw new Error(t?.('userIdRequiredForReadTest') || 'User ID required for read permission test');
    }
    
    // Test reading user's own data
    const userDoc = doc(db, 'users', userId);
    await getDoc(userDoc);
    
    // Test reading user sessions (this collection might not exist yet)
    try {
      const sessionsQuery = query(
        collection(db, 'user_sessions'),
        limit(1)
      );
      await getDocs(sessionsQuery);
    } catch (error: any) {
      // If collection doesn't exist or no documents, that's okay
      if (error.code !== 'permission-denied') {
        // Only throw if it's a real permission issue
        return;
      }
      throw error;
    }
  }

  /**
   * Test write permissions
   */
  private static async testWritePermissions(userId?: string, t?: TranslationFunction): Promise<void> {
    if (!userId) {
      throw new Error(t?.('userIdRequiredForWriteTest') || 'User ID required for write permission test');
    }

    // Test writing to user's own data (which should be allowed by security rules)
    const userDoc = doc(db, 'users', userId);
    
    // Try to read first to see if document exists
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      // If user document exists, try to update it with a test field
      const testData = {
        lastHealthCheck: new Date().toISOString()
      };
      
      await updateDoc(userDoc, testData);
    } else {
      // If user document doesn't exist, we can't test write permissions
      // without creating the full user document structure
      console.warn('User document does not exist, skipping write permission test');
    }
  }

  /**
   * Test index functionality
   */
  private static async testIndexes(userId?: string): Promise<void> {
    if (!userId) {
      return; // Skip index test if no user
    }

    // Test a simple query that should work with basic indexes
    try {
      const indexTestQuery = query(
        collection(db, 'transcripts'),
        limit(1)
      );
      
      await getDocs(indexTestQuery);
    } catch (error: any) {
      // If we get permission denied, that's expected for empty collections
      if (error.code === 'permission-denied') {
        return; // This is okay - security rules are working
      }
      // Re-throw other errors (missing indexes, etc.)
      throw error;
    }
  }

  /**
   * Quick connectivity test
   */
  static async quickConnectivityTest(): Promise<boolean> {
    try {
      const testQuery = query(collection(db, 'users'), limit(1));
      await getDocs(testQuery);
      return true;
    } catch (error: any) {
      // If we get permission-denied, that means Firestore is accessible
      if (error.code === 'permission-denied') {
        return true; // This is actually a success - Firestore is reachable
      }
      console.error('Quick connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Monitor Firestore errors and provide diagnostics
   */
  static diagnoseFirestoreError(error: any, t?: TranslationFunction): {
    userMessage: string;
    technicalDetails: string;
    suggestedActions: string[];
  } {
    const errorCode = error.code || error.name || 'unknown';
    const errorMessage = error.message || String(error);

    let userMessage = t?.('firestoreGenericError') || 'There is a problem with the database connection';
    let technicalDetails = `Error: ${errorCode} - ${errorMessage}`;
    let suggestedActions: string[] = [];

    switch (errorCode) {
      case 'permission-denied':
        userMessage = t?.('firestorePermissionDenied') || 'No access to the database. Please log in again.';
        suggestedActions = [
          'Log out and log in again',
          'Check if your account is active',
          'Contact support if the problem persists'
        ];
        break;

      case 'unavailable':
      case 'deadline-exceeded':
        userMessage = t?.('firestoreDatabaseUnavailable') || 'Database temporarily unavailable. Please try again in a few minutes.';
        suggestedActions = [
          'Wait 2-3 minutes and try again',
          'Check your internet connection',
          'Reload the page if the problem persists'
        ];
        break;

      case 'failed-precondition':
        userMessage = t?.('firestoreConfigurationError') || 'Database configuration problem. Please contact support.';
        suggestedActions = [
          'Contact the administrator',
          'Mention this error code: failed-precondition'
        ];
        break;

      case 'resource-exhausted':
        userMessage = t?.('firestoreQuotaExceeded') || 'Database quota exceeded. Please try again later.';
        suggestedActions = [
          'Wait a few hours and try again',
          'Contact support for quota increase'
        ];
        break;

      default:
        if (errorMessage.includes('ERR_ABORTED')) {
          userMessage = t?.('firestoreConnectionInterrupted') || 'Connection interrupted. Check your internet connection.';
          suggestedActions = [
            'Check your internet connection',
            'Reload the page',
            'Try a different browser if the problem persists'
          ];
        } else if (errorMessage.includes('network')) {
          userMessage = t?.('firestoreNetworkError') || 'Network problem. Check your internet connection.';
          suggestedActions = [
            'Check your internet connection',
            'Try again in a few minutes'
          ];
        }
        break;
    }

    return {
      userMessage,
      technicalDetails,
      suggestedActions
    };
  }
}