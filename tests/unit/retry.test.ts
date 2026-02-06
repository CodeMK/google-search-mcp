/**
 * Unit tests for retry utility
 */

import { retry, sleep } from '../../src/utils/retry';

describe('Retry Utility', () => {
  describe('retry', () => {
    test('should succeed on first attempt', async () => {
      let attempts = 0;
      const fn = jest.fn(async () => {
        attempts++;
        return 'success';
      });

      const result = await retry(fn, {
        maxAttempts: 3,
        initialBackoffMs: 10,
      });

      expect(result).toBe('success');
      expect(attempts).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should retry on failure', async () => {
      let attempts = 0;
      const fn = jest.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary error');
        }
        return 'success';
      });

      const result = await retry(fn, {
        maxAttempts: 5,
        initialBackoffMs: 10,
      });

      expect(result).toBe('success');
      expect(attempts).toBe(3);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('should fail after max attempts', async () => {
      const fn = jest.fn(async () => {
        throw new Error('Permanent error');
      });

      await expect(
        retry(fn, {
          maxAttempts: 3,
          initialBackoffMs: 10,
          retryableErrors: ['Temporary'],
        })
      ).rejects.toThrow('Permanent error');

      expect(fn).toHaveBeenCalledTimes(1); // Not retryable, so only called once
    });

    test('should call onRetry callback', async () => {
      let attempts = 0;
      const retryCallback = jest.fn();

      const fn = jest.fn(async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Temporary error');
        }
        return 'success';
      });

      await retry(fn, {
        maxAttempts: 5,
        initialBackoffMs: 10,
        retryableErrors: ['Temporary'],
        onRetry: retryCallback,
      });

      expect(retryCallback).toHaveBeenCalledTimes(1);
      expect(retryCallback).toHaveBeenCalledWith(1, expect.any(Error));
    });

    test('should not retry non-retryable errors', async () => {
      const fn = jest.fn(async () => {
        throw new Error('Permanent error');
      });

      await expect(
        retry(fn, {
          maxAttempts: 3,
          initialBackoffMs: 10,
          retryableErrors: ['Temporary', 'Timeout'],
        })
      ).rejects.toThrow('Permanent error');

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should respect max backoff', async () => {
      const fn = jest.fn(async () => {
        throw new Error('Temporary error');
      });

      const startTime = Date.now();
      await expect(
        retry(fn, {
          maxAttempts: 4,
          initialBackoffMs: 50,
          maxBackoffMs: 100,
          backoffMultiplier: 10,
          retryableErrors: ['Temporary'],
        })
      ).rejects.toThrow();

      const elapsed = Date.now() - startTime;
      // Should be less than if maxBackoff wasn't applied
      expect(elapsed).toBeLessThan(400);
    });
  });

  describe('sleep', () => {
    test('should sleep for specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(150);
    });
  });
});
