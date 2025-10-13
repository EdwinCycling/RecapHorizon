import React from 'react';
import { sanitizeTextInput } from './security';

/**
 * Safe HTML rendering component that sanitizes content to prevent XSS attacks
 */
interface SafeHtmlProps {
  content: string;
  className?: string;
  maxLength?: number;
  allowBasicFormatting?: boolean;
}

/**
 * Component that safely renders HTML content by sanitizing it first
 * Use this for any user-generated content that needs to be displayed
 */
export const SafeHtml: React.FC<SafeHtmlProps> = ({ 
  content, 
  className = '', 
  maxLength = 50000,
  allowBasicFormatting = false 
}) => {
  const sanitizedContent = sanitizeTextInput(content, maxLength);
  
  if (allowBasicFormatting) {
    // Allow only basic formatting tags that are safe
    const allowedTags = ['b', 'i', 'em', 'strong', 'br', 'p'];
    let processedContent = sanitizedContent;
    
    // Convert newlines to <br> tags for basic formatting
    processedContent = processedContent.replace(/\n/g, '<br>');
    
    // Remove any HTML tags that aren't in the allowed list
    processedContent = processedContent.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (match, tagName) => {
      return allowedTags.includes(tagName.toLowerCase()) ? match : '';
    });
    
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    );
  }
  
  // For plain text, just render as text content (safest option)
  return (
    <div className={className}>
      {sanitizedContent}
    </div>
  );
};

/**
 * Component for safely displaying user names/titles
 */
export const SafeUserText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const safeText = React.useMemo(() => {
    return sanitizeTextInput(text, 200); // Limit user text to 200 chars
  }, [text]);
  return <span className={className}>{safeText}</span>;
};

export default SafeHtml;