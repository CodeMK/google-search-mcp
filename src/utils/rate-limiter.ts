/**
 * Rate Limiter
 * Simulates human-like request frequency to avoid detection
 */

import { logger } from './logger';

export interface RateLimiterOptions {
  minDelayMs: number;  // Minimum delay between requests
  maxDelayMs: number;  // Maximum delay between requests
  burstLimit?: number; // Max requests in burst period
  burstPeriodMs?: number; // Burst period in ms
}

export class RateLimiter {
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private burstResetTime: number = 0;
  private options: RateLimiterOptions;

  constructor(options: RateLimiterOptions = {
    minDelayMs: 5000,   // 5 seconds minimum
    maxDelayMs: 15000,  // 15 seconds maximum
    burstLimit: 3,      // Max 3 requests
    burstPeriodMs: 60000, // In 60 seconds
  }) {
    this.options = options;
  }

  /**
   * Wait before making next request (simulates human behavior)
   */
  async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // Reset burst counter if period has passed
    if (now - this.burstResetTime > (this.options.burstPeriodMs || 60000)) {
      this.requestCount = 0;
      this.burstResetTime = now;
    }

    // Check burst limit
    if (this.options.burstLimit && this.requestCount >= this.options.burstLimit) {
      const waitTime = this.burstResetTime + (this.options.burstPeriodMs || 60000) - now;
      if (waitTime > 0) {
        logger.info(`Rate limit: waiting ${waitTime}ms (burst limit reached)`, 'RateLimiter');
        await this.sleep(waitTime);
        this.requestCount = 0;
        this.burstResetTime = Date.now();
      }
    }

    // Calculate random delay between requests (human-like behavior)
    if (this.lastRequestTime > 0) {
      const minDelay = this.options.minDelayMs;
      const maxDelay = this.options.maxDelayMs;
      const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

      const remainingDelay = randomDelay - timeSinceLastRequest;

      if (remainingDelay > 0) {
        logger.debug(`Rate limit: waiting ${remainingDelay}ms before request`, 'RateLimiter');
        await this.sleep(remainingDelay);
      }
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset the rate limiter (for testing)
   */
  reset(): void {
    this.lastRequestTime = 0;
    this.requestCount = 0;
    this.burstResetTime = 0;
  }

  /**
   * Get current stats
   */
  getStats() {
    return {
      lastRequestTime: this.lastRequestTime,
      requestCount: this.requestCount,
      timeUntilReset: this.burstResetTime + (this.options.burstPeriodMs || 60000) - Date.now(),
    };
  }
}

// Singleton instance for API requests
export const apiRateLimiter = new RateLimiter({
  minDelayMs: 15000,   // 15 seconds minimum between searches
  maxDelayMs: 30000,  // 30 seconds maximum
  burstLimit: 2,      // Max 2 rapid requests
  burstPeriodMs: 180000, // In 3 minutes
});
