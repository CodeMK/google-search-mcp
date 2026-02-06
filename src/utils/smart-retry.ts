/**
 * Enhanced Retry Mechanism with Auto-Recovery
 * Handles connection failures gracefully with automatic recovery
 */

import { logger } from './logger';

export interface RetryOptions {
  maxAttempts: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
  retryableErrors: string[];
  onRetry?: (attempt: number, error: Error) => void;
  extraDelayOnFailure?: number; // Extra delay when connection closes
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

/**
 * Enhanced retry function with automatic recovery
 */
export async function smartRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxAttempts = 5,
    initialBackoffMs = 1000,
    maxBackoffMs = 60000,
    retryableErrors = ['Timeout', 'Network', 'CAPTCHA', 'CONNECTION_CLOSED'],
    onRetry,
    extraDelayOnFailure = 30000, // Extra 30s wait on connection close
  } = options;

  let lastError: Error | null = null;
  let backoffMs = initialBackoffMs;
  let consecutiveFailures = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Add extra delay if there were previous failures (cooldown)
      if (attempt > 1 && consecutiveFailures > 0) {
        const cooldownDelay = Math.min(
          extraDelayOnFailure * consecutiveFailures,
          120000 // Max 2 minutes cooldown
        );

        logger.info(
          `Cooling down for ${cooldownDelay}ms before attempt ${attempt} (${consecutiveFailures} previous failures)`,
          'SmartRetry'
        );

        await sleep(cooldownDelay);
      }

      const result = await fn();

      // Success - reset failure counter
      if (consecutiveFailures > 0) {
        logger.info(
          `Recovery successful after ${consecutiveFailures} failures`,
          'SmartRetry'
        );
        consecutiveFailures = 0;
      }

      return result;
    } catch (error) {
      const err = error as Error;
      lastError = err;
      consecutiveFailures++;

      // Check if error is retryable
      const isRetryable = retryableErrors.some(code =>
        err.message.includes(code) || err.name.includes(code)
      );

      if (!isRetryable || attempt >= maxAttempts) {
        logger.error(
          `All ${attempt} attempts failed, giving up`,
          'SmartRetry',
          { error: err.message }
        );
        throw err;
      }

      // Check if it's a connection closed error - add extra delay
      const isConnectionError = err.message.includes('CONNECTION_CLOSED') ||
                               err.message.includes('ERR_CONNECTION_CLOSED');

      let currentDelay = backoffMs;
      if (isConnectionError) {
        currentDelay = Math.max(currentDelay, extraDelayOnFailure);
        logger.warn(
          `Connection closed by Google - adding extra delay`,
          'SmartRetry'
        );
      }

      logger.warn(
        `Attempt ${attempt}/${maxAttempts} failed: ${err.message.substring(0, 100)}`,
        'SmartRetry'
      );

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, err);
      }

      // Wait before retry with exponential backoff
      await sleep(currentDelay);

      // Increase backoff for next attempt (exponential backoff)
      backoffMs = Math.min(backoffMs * 2, maxBackoffMs);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error('All retry attempts failed');
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a circuit breaker pattern
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private isOpen = false;

  constructor(
    private threshold = 3,
    private cooldown = 120000 // 2 minutes cooldown
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.isOpen) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;

      if (timeSinceLastFailure > this.cooldown) {
        // Try to close the circuit
        this.isOpen = false;
        this.failureCount = 0;
        logger.info('Circuit breaker reset', 'CircuitBreaker');
      } else {
        const waitTime = this.cooldown - timeSinceLastFailure;
        throw new Error(
          `Circuit breaker is open. Waiting ${waitTime}ms before retry.`
        );
      }
    }

    try {
      const result = await fn();

      // Success - reset failure count
      this.failureCount = 0;
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      // Open circuit if threshold reached
      if (this.failureCount >= this.threshold) {
        this.isOpen = true;
        logger.warn(
          `Circuit breaker opened after ${this.failureCount} failures`,
          'CircuitBreaker'
        );
      }

      throw error;
    }
  }

  reset(): void {
    this.isOpen = false;
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }

  getState() {
    return {
      isOpen: this.isOpen,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Global circuit breaker instance
export const searchCircuitBreaker = new CircuitBreaker(3, 120000);
