import React from 'react';
import { sanitizeTextInput } from './security';

/**
 * Utility function to safely truncate text with ellipsis
 */
export const safeTruncate = (text: string, maxLength: number): string => {
  const sanitized = sanitizeTextInput(text, maxLength * 2); // Allow double for processing
  
  if (sanitized.length <= maxLength) {
    return sanitized;
  }
  
  return sanitized.substring(0, maxLength - 3) + '...';
};

/**
 * Utility function to safely format text for display
 */
export const safeFormat = (text: string, options?: {
  maxLength?: number;
  preserveNewlines?: boolean;
}): string => {
  const { maxLength = 1000, preserveNewlines = false } = options || {};
  
  let formatted = sanitizeTextInput(text, maxLength);
  
  if (preserveNewlines) {
    formatted = formatted.replace(/\n/g, '<br>');
  }
  
  return formatted;
};

/**
 * Hook for safely processing text content
 */
export function useSafeText(content: string, maxLength?: number): string {
  return React.useMemo(() => {
    return sanitizeTextInput(content, maxLength);
  }, [content, maxLength]);
}