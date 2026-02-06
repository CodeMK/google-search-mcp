/**
 * Human Behavior Simulator
 * Simulates human-like behavior to avoid detection
 */

import { Page } from 'playwright';
import { HUMAN_BEHAVIOR, VIEWPORT_VARIATIONS, USER_AGENT_POOL } from '../config/constants';
import { logger } from './logger';

export class HumanBehaviorSimulator {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get random number in range
   */
  private randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  /**
   * Sleep for random duration
   */
  async randomDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = this.randomInRange(minMs, maxMs);
    await this.page.waitForTimeout(delay);
  }

  /**
   * Simulate human-like mouse movement
   */
  async simulateMouseMove(): Promise<void> {
    try {
      const viewport = this.page.viewportSize();
      if (!viewport) return;

      const x = this.randomInRange(100, viewport.width - 100);
      const y = this.randomInRange(100, viewport.height - 100);

      // Add some jitter
      const jitterX = this.randomInRange(-HUMAN_BEHAVIOR.mouseJitter, HUMAN_BEHAVIOR.mouseJitter);
      const jitterY = this.randomInRange(-HUMAN_BEHAVIOR.mouseJitter, HUMAN_BEHAVIOR.mouseJitter);

      await this.page.mouse.move(x + jitterX, y + jitterY, {
        steps: this.randomInRange(5, 15), // Make movement more natural
      });

      logger.debug(`Moved mouse to (${x}, ${y})`, 'HumanBehavior');
    } catch (error) {
      // Ignore mouse movement errors
    }
  }

  /**
   * Simulate human-like scrolling
   */
  async simulateScroll(): Promise<void> {
    try {
      const scrollSteps = this.randomInRange(
        HUMAN_BEHAVIOR.scrollSteps.min,
        HUMAN_BEHAVIOR.scrollSteps.max
      );

      for (let i = 0; i < scrollSteps; i++) {
        const scrollAmount = this.randomInRange(
          HUMAN_BEHAVIOR.scrollAmount.min,
          HUMAN_BEHAVIOR.scrollAmount.max
        );

        await this.page.evaluate((amount) => {
          window.scrollBy(0, amount);
        }, scrollAmount);

        await this.randomDelay(
          HUMAN_BEHAVIOR.scrollDelay.min,
          HUMAN_BEHAVIOR.scrollDelay.max
        );
      }

      logger.debug(`Scrolled ${scrollSteps} times`, 'HumanBehavior');
    } catch (error) {
      // Ignore scroll errors
    }
  }

  /**
   * Simulate random human behavior before search
   */
  async simulatePreSearchBehavior(): Promise<void> {
    // Random mouse movement
    if (Math.random() < HUMAN_BEHAVIOR.chanceOfMouseMovement) {
      await this.simulateMouseMove();
      await this.randomDelay(100, 500);
    }

    // Random pause
    if (Math.random() < HUMAN_BEHAVIOR.chanceOfRandomPause) {
      await this.randomDelay(500, 1500);
    }
  }

  /**
   * Simulate behavior after page load
   */
  async simulatePostLoadBehavior(): Promise<void> {
    // Wait random time after page load
    await this.randomDelay(
      HUMAN_BEHAVIOR.pageLoadWait.min,
      HUMAN_BEHAVIOR.pageLoadWait.max
    );

    // Random scroll
    if (Math.random() < HUMAN_BEHAVIOR.chanceOfRandomScroll) {
      await this.simulateScroll();
    }
  }

  /**
   * Get random viewport from variations
   */
  static getRandomViewport(): { width: number; height: number } {
    const variations = VIEWPORT_VARIATIONS;
    return variations[Math.floor(Math.random() * variations.length)];
  }

  /**
   * Get random user agent from pool
   */
  static getRandomUserAgent(): string {
    const pool = USER_AGENT_POOL;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}

export const humanBehavior = {
  /**
   * Apply random fingerprint to browser context
   */
  getRandomViewport() {
    return HumanBehaviorSimulator.getRandomViewport();
  },

  getRandomUserAgent() {
    return HumanBehaviorSimulator.getRandomUserAgent();
  },

  /**
   * Create simulator instance for a page
   */
  forPage(page: Page) {
    return new HumanBehaviorSimulator(page);
  },
};
