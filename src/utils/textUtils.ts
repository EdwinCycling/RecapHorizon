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

/**
 * Convert markdown to well-formatted plain text preserving structure
 */
export const markdownToPlainText = (text: string): string => {
  if (!text) return '';
  let formatted = text.replace(/\r\n|\r/g, '\n');
  
  // First, preserve star ratings by converting them to a safe placeholder
  formatted = formatted.replace(/★+/g, (match) => `STAR_RATING_${match.length}_STARS`);
  formatted = formatted.replace(/⭐+/g, (match) => `STAR_RATING_${match.length}_STARS`);
  
  // Preserve common emoticons by converting to text descriptions
  const emojiMap: { [key: string]: string } = {
    '😀': ':grinning:',
    '😃': ':smiley:',
    '😄': ':smile:',
    '😁': ':grin:',
    '😊': ':blush:',
    '😍': ':heart_eyes:',
    '🤔': ':thinking:',
    '👍': ':thumbs_up:',
    '👎': ':thumbs_down:',
    '❤️': ':heart:',
    '💡': ':bulb:',
    '🎯': ':target:',
    '🚀': ':rocket:',
    '💪': ':muscle:',
    '🔥': ':fire:',
    '✨': ':sparkles:',
    '🎉': ':party:',
    '📈': ':chart_up:',
    '📊': ':chart:',
    '💰': ':money:',
    '🏆': ':trophy:',
    '⚡': ':lightning:',
    '🌟': ':star2:',
    '💎': ':diamond:',
    '🎪': ':circus:',
    '🎭': ':theater:',
    '🎨': ':art:',
    '📝': ':memo:',
    '📚': ':books:',
    '🔍': ':search:',
    '🎓': ':graduation_cap:',
    '💼': ':briefcase:',
    '🌍': ':earth:',
    '🌎': ':earth_americas:',
    '🌏': ':earth_asia:'
  };
  
  // Replace emojis with text descriptions
  Object.entries(emojiMap).forEach(([emoji, description]) => {
    formatted = formatted.replace(new RegExp(emoji, 'g'), description);
  });
  
  // Convert headers to uppercase with underlines
  formatted = formatted.replace(/^[ \t]*#{1,6}[ \t]*(.+)$/gm, (match, title) => {
    const cleanTitle = title.trim().toUpperCase();
    return `\n${cleanTitle}\n${'='.repeat(cleanTitle.length)}\n`;
  });
  
  // Convert bold to uppercase, keep content
  formatted = formatted.replace(/(\*\*|__)(.*?)\1/g, (match, marker, content) => content.toUpperCase());
  
  // Keep italic content but remove markers
  formatted = formatted.replace(/(\*|_)(.*?)\1/g, '$2');
  
  // Remove code blocks but keep content
  formatted = formatted.replace(/```[\s\S]*?```/g, '');
  formatted = formatted.replace(/`([^`]+)`/g, '$1');
  
  // Convert links to "text (url)" format
  formatted = formatted.replace(/!\[(.*?)\]\((.*?)\)/g, '$1');
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');
  
  // Convert blockquotes to indented text
  formatted = formatted.replace(/^[ \t]*>+[ \t]?(.*)$/gm, '    $1');
  
  // Convert unordered lists to bullets with proper spacing
  formatted = formatted.replace(/^[ \t]*([*+\-])[ \t]+(.*)$/gm, '• $2');
  
  // Convert ordered lists with proper numbering
  formatted = formatted.replace(/^[ \t]*(\d{1,3})[\.)]\s+(.*)$/gm, '$1. $2');
  
  // Clean up control characters but preserve structure
  formatted = formatted.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
  
  // Remove lines of only formatting garbage but preserve star ratings
  formatted = formatted.replace(/^\s*[&*_~`\-]+\s*$/gm, '');
  
  // Convert star rating placeholders back to stars
  formatted = formatted.replace(/STAR_RATING_(\d+)_STARS/g, (match, count) => '★'.repeat(parseInt(count)));
  
  // Preserve paragraph breaks but limit excessive spacing
  formatted = formatted.replace(/\n{4,}/g, '\n\n\n');
  
  // Trim trailing spaces per line but preserve structure
  formatted = formatted.split('\n').map(l => l.replace(/\s+$/, '')).join('\n');
  
  // Convert to CRLF for Windows compatibility
  formatted = formatted.replace(/\n/g, '\r\n');
  
  return formatted.trim();
};