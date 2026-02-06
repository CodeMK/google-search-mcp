/**
 * API Response type definitions
 */

/**
 * Standard API response wrapper for successful responses
 */
export interface ApiResponse<T = unknown> {
  statusCode: number;
  result: T;
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  statusCode: number;
  error: {
    code: string;
    message: string;
    retryable: boolean;
    details?: unknown;
  };
}
