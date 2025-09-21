import { useEffect, useCallback } from 'react';
import { sessionManager } from '../utils/security';

interface UseSessionActivityProps {
  sessionId: string;
  onSessionExpired: () => void;
  onSessionWarning?: (timeRemaining: number) => void;
}

export const useSessionActivity = ({
  sessionId,
  onSessionExpired,
  onSessionWarning
}: UseSessionActivityProps) => {
  
  // Track user activity to refresh session
  const trackActivity = useCallback(() => {
    if (!sessionId) return;
    
    const validation = sessionManager.validateSession(sessionId);
    if (!validation.valid) {
      onSessionExpired();
      return;
    }
    
    // Refresh session on activity
    const refreshResult = sessionManager.refreshSession(sessionId);
    if (!refreshResult.success) {
      onSessionExpired();
    }
  }, [sessionId, onSessionExpired]);
  
  // Check for session timeout warnings
  const checkSessionWarning = useCallback(() => {
    if (!sessionId) return;
    
    const warning = sessionManager.getSessionTimeoutWarning(sessionId);
    if (warning.showWarning && onSessionWarning && warning.timeRemaining) {
      onSessionWarning(warning.timeRemaining);
    }
  }, [sessionId, onSessionWarning]);
  
  // Set up activity listeners
  useEffect(() => {
    if (!sessionId) return;
    
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];
    
    // Throttle activity tracking to avoid excessive calls
    let lastActivity = 0;
    const throttleMs = 30000; // 30 seconds
    
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity > throttleMs) {
        lastActivity = now;
        trackActivity();
      }
    };
    
    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    // Set up periodic session validation
    const validationInterval = setInterval(() => {
      const validation = sessionManager.validateSession(sessionId);
      if (!validation.valid) {
        onSessionExpired();
      }
    }, 60000); // Check every minute
    
    // Set up warning check
    const warningInterval = setInterval(checkSessionWarning, 30000); // Check every 30 seconds
    
    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearInterval(validationInterval);
      clearInterval(warningInterval);
    };
  }, [sessionId, trackActivity, checkSessionWarning, onSessionExpired]);
  
  // Manual session refresh function
  const refreshSession = useCallback(() => {
    if (!sessionId) return false;
    
    const result = sessionManager.refreshSession(sessionId);
    if (!result.success) {
      onSessionExpired();
      return false;
    }
    return true;
  }, [sessionId, onSessionExpired]);
  
  // Validate current session
  const validateCurrentSession = useCallback(() => {
    if (!sessionId) return false;
    
    const validation = sessionManager.validateSession(sessionId);
    if (!validation.valid) {
      onSessionExpired();
      return false;
    }
    return true;
  }, [sessionId, onSessionExpired]);
  
  return {
    refreshSession,
    validateCurrentSession,
    trackActivity
  };
};

export default useSessionActivity;