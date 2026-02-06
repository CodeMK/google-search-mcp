/**
 * Cookie Consent Handler
 * Automatically handles cookie consent popups on Google
 */

import { Page } from 'playwright';
import { COOKIE_CONSENT_SELECTORS } from '../config/constants';
import { logger } from '../utils/logger';

export class CookieHandler {
  /**
   * Handle cookie consent popup
   * Tries multiple selectors and clicks the first matching accept button
   * @param page - Playwright page instance
   * @returns true if button was clicked, false otherwise
   */
  static async handle(page: Page): Promise<boolean> {
    logger.debug('Checking for cookie consent popup...', 'CookieHandler');

    for (const selector of COOKIE_CONSENT_SELECTORS) {
      try {
        // Wait briefly for element to appear
        const element = await page.$(selector);

        if (element) {
          logger.debug(`Found cookie button with selector: ${selector}`, 'CookieHandler');

          // Click the button
          await element.click();
          await page.waitForTimeout(500); // Wait for popup to close

          logger.info('Cookie consent popup handled', 'CookieHandler');
          return true;
        }
      } catch (error) {
        // Element not found or interaction failed, continue to next selector
        continue;
      }
    }

    logger.debug('No cookie consent popup found', 'CookieHandler');
    return false;
  }

  /**
   * Check if cookie consent popup is present
   * @param page - Playwright page instance
   */
  static async isPresent(page: Page): Promise<boolean> {
    for (const selector of COOKIE_CONSENT_SELECTORS) {
      try {
        const element = await page.$(selector);
        if (element) return true;
      } catch {
        continue;
      }
    }
    return false;
  }

  /**
   * Wait for cookie consent to appear (with timeout)
   * @param page - Playwright page instance
   * @param timeout - Max wait time in ms (default: 2000)
   */
  static async waitForPopup(page: Page, timeout = 2000): Promise<boolean> {
    try {
      await page.waitForSelector(COOKIE_CONSENT_SELECTORS[0], { timeout });
      return true;
    } catch {
      return false;
    }
  }
}
