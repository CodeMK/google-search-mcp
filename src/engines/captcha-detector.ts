/**
 * CAPTCHA Detector
 * Detects CAPTCHA challenges on Google pages
 */

import { Page } from 'playwright';
import { CAPTCHA_INDICATORS, CAPTCHA_TEXT_PATTERNS } from '../config/constants';
import { logger } from '../utils/logger';

export class CaptchaDetector {
  /**
   * Detect if CAPTCHA is present on the page
   * @param page - Playwright page instance
   * @returns true if CAPTCHA is detected
   */
  static async detect(page: Page): Promise<boolean> {
    // Check for CAPTCHA DOM elements
    for (const selector of CAPTCHA_INDICATORS) {
      try {
        const element = await page.$(selector);
        if (element) {
          logger.warn(`CAPTCHA indicator found: ${selector}`, 'CaptchaDetector');
          return true;
        }
      } catch {
        continue;
      }
    }

    // Check page title for CAPTCHA-related text
    const title = await page.title().catch(() => '');
    for (const pattern of CAPTCHA_TEXT_PATTERNS) {
      if (title.toLowerCase().includes(pattern.toLowerCase())) {
        logger.warn(`CAPTCHA detected in page title: ${title}`, 'CaptchaDetector');
        return true;
      }
    }

    // Check page content
    const pageContent = await page.content();
    for (const pattern of CAPTCHA_TEXT_PATTERNS) {
      if (pageContent.toLowerCase().includes(pattern.toLowerCase())) {
        logger.warn(`CAPTCHA detected in page content`, 'CaptchaDetector');
        return true;
      }
    }

    logger.debug('No CAPTCHA detected', 'CaptchaDetector');
    return false;
  }

  /**
   * Get screenshot of the page (useful for CAPTCHA debugging)
   * @param page - Playwright page instance
   * @returns Screenshot buffer
   */
  static async getScreenshot(page: Page): Promise<Buffer> {
    return await page.screenshot({ fullPage: true });
  }

  /**
   * Save screenshot to file
   * @param page - Playwright page instance
   * @param filePath - Path to save screenshot
   */
  static async saveScreenshot(page: Page, filePath: string): Promise<void> {
    await page.screenshot({ path: filePath, fullPage: true });
    logger.info(`Screenshot saved to ${filePath}`, 'CaptchaDetector');
  }

  /**
   * Get page title and URL for debugging
   * @param page - Playwright page instance
   */
  static async getDebugInfo(page: Page): Promise<{ title: string; url: string }> {
    const title = await page.title();
    const url = page.url();
    return { title, url };
  }
}
