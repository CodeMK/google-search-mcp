/**
 * Search-related type definitions
 */

/**
 * Search request input
 */
export interface SearchRequest {
  query: string;              // Search query string
  region?: string;            // Target region code (default: auto-detected)
  numResults?: number;        // Number of results to return (default: 10)
  includeRawHtml?: boolean;   // Include raw HTML in response (default: false)
}

/**
 * Individual search result
 */
export interface SearchResult {
  rank: number;               // Result ranking (1-based)
  title: string;              // Page title
  link: string;               // Actual URL (cleaned from redirects)
  displayUrl: string;         // Display URL (as shown in search results)
  snippet: string;            // Result description/summary
}

/**
 * Response metadata
 */
export interface ResponseMeta {
  regionCode: string;         // Actual region code used
  regionName: string;         // Region/country name
  targetUrl: string;          // Full URL that was accessed
  usedProxy?: string;         // Proxy used (obfuscated, for debugging)
  latency: number;            // Total execution time in milliseconds
  timestamp: string;          // ISO 8601 timestamp
  resultCount: number;        // Number of results returned
}

/**
 * Complete search response
 */
export interface SearchResponse {
  success: boolean;
  meta: ResponseMeta;
  results: SearchResult[];
  rawHtml?: string;           // Optional raw HTML content
}

/**
 * @deprecated Use ApiErrorResponse from types/api.ts instead
 * Kept for backward compatibility
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;             // Error code
    message: string;          // Human-readable error message
    retryable: boolean;       // Whether the request can be retried
    details?: unknown;        // Additional error details
  };
}
