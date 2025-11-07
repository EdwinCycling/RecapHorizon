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

/**
 * Convert markdown to sanitized HTML.
 * - Escapes all user-provided text content
 * - Supports headings (#, ##, ... ######), bold/italic, inline code, block code, lists, blockquotes, paragraphs, links (http/https only)
 * - Produces a minimal, readable HTML structure safe for dangerouslySetInnerHTML
 */
export const markdownToSanitizedHtml = (input: string): string => {
  if (!input) return '<p></p>';

  const escapeHtml = (s: string): string => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const isSafeUrl = (url: string): boolean => {
    const u = url.trim();
    return /^https?:\/\//i.test(u);
  };

  const processInline = (text: string): string => {
    // Links: [text](url)
    let out = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => {
      const safeLabel = escapeHtml(label);
      const url = href.trim();
      if (isSafeUrl(url)) {
        const safeUrl = escapeHtml(url);
        return `<a href="${safeUrl}" rel="nofollow noopener noreferrer" target="_blank">${safeLabel}</a>`;
      }
      // Fallback: show as plain text to avoid unsafe protocols
      return `${safeLabel} (${escapeHtml(url)})`;
    });

    // Inline code: `code`
    out = out.replace(/`([^`]+)`/g, (_m, code) => `<code>${escapeHtml(code)}</code>`);

    // Bold: **text** or __text__
    out = out.replace(/(\*\*|__)(.*?)\1/g, (_m, _marker, content) => `<strong>${escapeHtml(content)}</strong>`);

    // Italic: *text* or _text_
    out = out.replace(/(\*|_)(.*?)\1/g, (_m, _marker, content) => `<em>${escapeHtml(content)}</em>`);

    return out;
  };

  // Normalize newlines
  const text = input.replace(/\r\n|\r/g, '\n');
  const lines = text.split('\n');
  const html: string[] = [];
  let i = 0;
  let inCode = false;
  let codeBuffer: string[] = [];

  const flushParagraph = (paraLines: string[]) => {
    if (!paraLines.length) return;
    const content = paraLines.join(' ').trim();
    if (!content) return;
    html.push(`<p>${processInline(content)}</p>`);
  };

  while (i < lines.length) {
    const line = lines[i];
    // Handle fenced code blocks
    if (/^```/.test(line)) {
      if (!inCode) {
        inCode = true;
        codeBuffer = [];
      } else {
        // Closing fence
        const codeHtml = escapeHtml(codeBuffer.join('\n'));
        html.push(`<pre><code>${codeHtml}</code></pre>`);
        inCode = false;
        codeBuffer = [];
      }
      i += 1;
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
      i += 1;
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = Math.min(6, h[1].length);
      const title = escapeHtml(h[2].trim());
      html.push(`<h${level}>${title}</h${level}>`);
      i += 1;
      continue;
    }

    // Blockquote group
    if (/^\s*>\s?/.test(line)) {
      const blk: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        const content = lines[i].replace(/^\s*>\s?/, '');
        blk.push(processInline(content));
        i += 1;
      }
      html.push(`<blockquote>${blk.join('<br/>')}</blockquote>`);
      continue;
    }

    // Unordered list group
    if (/^\s*([*+\-])\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*([*+\-])\s+/.test(lines[i])) {
        const item = lines[i].replace(/^\s*([*+\-])\s+/, '');
        items.push(`<li>${processInline(item)}</li>`);
        i += 1;
      }
      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Ordered list group
    if (/^\s*\d{1,3}[\.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d{1,3}[\.)]\s+/.test(lines[i])) {
        const item = lines[i].replace(/^\s*\d{1,3}[\.)]\s+/, '');
        items.push(`<li>${processInline(item)}</li>`);
        i += 1;
      }
      html.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // Blank lines separate paragraphs
    if (/^\s*$/.test(line)) {
      // push an explicit break to improve readability
      html.push('<br/>');
      i += 1;
      continue;
    }

    // Paragraph accumulation
    const para: string[] = [line];
    i += 1;
    while (i < lines.length && !/^\s*$/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !/^\s*([*+\-])\s+/.test(lines[i]) &&
      !/^\s*\d{1,3}[\.)]\s+/.test(lines[i]) &&
      !/^(#{1,6})\s+/.test(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    flushParagraph(para);
  }

  // If an unclosed code block remains, flush it safely
  if (inCode && codeBuffer.length) {
    const codeHtml = escapeHtml(codeBuffer.join('\n'));
    html.push(`<pre><code>${codeHtml}</code></pre>`);
  }

  // Clean excessive breaks
  const joined = html.join('\n')
    .replace(/(?:<br\/>\s*){3,}/g, '<br/><br/>' )
    .trim();

  return joined || '<p></p>';
};