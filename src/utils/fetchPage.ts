// fetchPage.ts - Verbeterde URL fetching implementatie
// Browser-compatible delay function
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

type TranslationFunction = (key: string, fallback?: string) => string;

export interface FetchOptions {
  timeoutMs?: number;
  retries?: number;
  retryDelay?: number;
  userAgent?: string;
  followRedirects?: boolean;
  maxRedirects?: number;
}

export interface FetchResult {
  content: string;
  url: string;
  status: number;
  headers: Record<string, string>;
  finalUrl?: string;
  metadata?: {
    title?: string;
    description?: string;
    contentType?: string;
  };
}

export class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public url?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

/**
 * Verbeterde HTML fetch functie met timeout, retry logic en betere error handling
 */
export async function fetchHTML(
  url: string, 
  options: FetchOptions = {},
  t?: TranslationFunction
): Promise<FetchResult> {
  const {
    timeoutMs = 15000,
    retries = 2,
    retryDelay: initialRetryDelay = 1000,
    userAgent = "RecapHorizon/1.0 (+https://recaphorizon.app)",
    followRedirects = true,
    maxRedirects = 5
  } = options;
  
  let retryDelay = initialRetryDelay;

  // Validate URL
  if (!url || typeof url !== 'string') {
    throw new FetchError('Invalid URL provided', undefined, url);
  }

  // Ensure URL has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {

      
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: followRedirects ? 'follow' : 'manual',
        headers: {
          "User-Agent": userAgent,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,nl;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "DNT": "1",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Cache-Control": "no-cache"
        }
      });

      clearTimeout(timeout);

      // Handle redirects manually if needed
      if (!followRedirects && (response.status >= 300 && response.status < 400)) {
        const location = response.headers.get('location');
        if (location) {
          throw new FetchError(`Redirect to ${location} (redirects disabled)`, response.status, url);
        }
      }

      if (!response.ok) {
        throw new FetchError(
          `HTTP error! Status: ${response.status} ${response.statusText}`,
          response.status,
          url
        );
      }

      // Check content type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
        console.warn(t?.('fetchContentTypeWarning', `[FetchHTML] Warning: Content-Type is '${contentType}', expected HTML`) || `[FetchHTML] Warning: Content-Type is '${contentType}', expected HTML`);
      }

      const htmlContent = await response.text();
      
      if (!htmlContent || htmlContent.trim().length === 0) {
        throw new FetchError('Empty response received', response.status, url);
      }

      // Extract metadata from HTML
      const metadata = extractMetadata(htmlContent, t);

      // Convert headers to plain object
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });


      
      return {
        content: htmlContent,
        url: url,
        status: response.status,
        headers,
        finalUrl: response.url,
        metadata: {
          ...metadata,
          contentType
        }
      };

    } catch (error) {
      clearTimeout(timeout);
      lastError = error as Error;
      
      // Fetch attempt failed

      // Don't retry on certain errors
      if (error instanceof FetchError && error.status) {
        // Don't retry on client errors (4xx) except 408, 429
        if (error.status >= 400 && error.status < 500 && 
            error.status !== 408 && error.status !== 429) {
          throw error;
        }
      }

      // Don't retry on abort errors
      if (lastError.name === 'AbortError') {
        throw new FetchError(
          `Request timeout after ${timeoutMs}ms`,
          undefined,
          url,
          lastError
        );
      }

      // Wait before retry (except on last attempt)
      if (attempt < retries) {
        await delay(retryDelay);
        // Exponential backoff
        retryDelay *= 1.5;
      }
    }
  }

  // All attempts failed
  throw new FetchError(
    `Failed to fetch after ${retries + 1} attempts: ${lastError?.message}`,
    undefined,
    url,
    lastError || undefined
  );
}

/**
 * Extract metadata from HTML content
 */
function extractMetadata(html: string, t?: TranslationFunction): { title?: string; description?: string } {
  const metadata: { title?: string; description?: string } = {};
  
  try {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
    }
    
    // Extract description from meta tag
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                     html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
    if (descMatch) {
      metadata.description = descMatch[1].trim();
    }
  } catch (error) {
    // Error extracting metadata
  }
  
  return metadata;
}

/**
 * Fetch multiple URLs concurrently with proper error handling
 */
export async function fetchMultipleHTML(
  urls: string[],
  options: FetchOptions = {},
  maxConcurrent: number = 3,
  t?: TranslationFunction
): Promise<Array<FetchResult | FetchError>> {
  if (!urls || urls.length === 0) {
    return [];
  }


  
  const results: Array<FetchResult | FetchError> = [];
  
  // Process URLs in batches to avoid overwhelming the server
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(async (url) => {
      try {
        return await fetchHTML(url, options, t);
      } catch (error) {
        // Failed to fetch URL
        return error as FetchError;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Small delay between batches to be respectful
    if (i + maxConcurrent < urls.length) {
      await delay(500);
    }
  }
  
  const successful = results.filter(r => !(r instanceof FetchError)).length;
  
  return results;
}

/**
 * Extract clean text content from HTML
 */
export function extractTextFromHTML(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove unwanted elements
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 'aside',
      '.advertisement', '.ads', '.social-share', '.comments',
      '[role="banner"]', '[role="navigation"]', '[role="complementary"]'
    ];
    
    unwantedSelectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    // Get text content
    const textContent = doc.body?.textContent || doc.textContent || '';
    
    // Clean up whitespace
    return textContent
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
      
  } catch (error) {
    // Error parsing HTML
    // Fallback: simple regex-based cleaning
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}