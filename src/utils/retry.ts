/**
 * Retry utility with exponential backoff
 */

import { logger } from './logger';

export interface RetryOptions {
  maxAttempts: number;
  initialBackoffMs: number;
  maxBackoffMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param options - Retry configuration
 * @returns Result of the function
 * @throws Last error if all attempts fail
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxAttempts,
    initialBackoffMs,
    maxBackoffMs = 30000,
    backoffMultiplier = 2,
    retryableErrors = [],
    onRetry,
  } = options;

  let lastError: Error = new Error('Unknown error');
  let currentBackoff = initialBackoffMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if this is the last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Check if error is retryable
      const isRetryable =
        retryableErrors.length === 0 ||
        retryableErrors.some(retryableError =>
          error instanceof Error && error.message.includes(retryableError)
        );

      if (!isRetryable) {
        logger.debug(
          'Error is not retryable',
          'retry',
          { error: lastError.message }
        );
        throw lastError;
      }

      // Log retry attempt
      logger.warn(
        `Attempt ${attempt} failed, retrying...`,
        'retry',
        { error: lastError.message, attempt, maxAttempts }
      );

      // Call retry callback
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Wait before retry
      const waitTime = Math.min(currentBackoff, maxBackoffMs);
      await sleep(waitTime);

      // Increase backoff for next attempt
      currentBackoff *= backoffMultiplier;
    }
  }

  // All attempts failed
  logger.error(
    `All ${maxAttempts} attempts failed`,
    'retry',
    { lastError: lastError?.message }
  );
  throw lastError!;
}

/**
 * Sleep for specified milliseconds
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a timeout promise that rejects after specified time
 * @param ms - Timeout in milliseconds
 * @param message - Error message
 */
export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  message = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}
