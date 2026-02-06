/**
 * Search Engine
 * Core service that orchestrates the Google search process
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { SearchRequest, SearchResponse } from '../types';
import { config } from '../config';
import { buildSearchUrl } from '../config/domains';
import { geoService } from './geo-service';
import { CookieHandler } from '../engines/cookie-handler';
import { CaptchaDetector } from '../engines/captcha-detector';
import { HtmlExtractor } from '../engines/html-extractor';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';

export class SearchEngine {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  /**
   * Perform a Google search
   * @param request - Search request parameters
   * @returns Search response
   */
  async search(request: SearchRequest): Promise<SearchResponse> {
    const startTime = Date.now();

    // Validate request
    if (!request.query || request.query.trim().length === 0) {
      throw new Error('Query is required');
    }

    logger.info(`Starting search for: "${request.query}"`, 'SearchEngine', {
      region: request.region || 'auto',
    });

    try {
      // Detect region if not provided
      const regionCode = request.region ||
                        (await geoService.detectLocation()).countryCode ||
                        config.search.defaultRegion;

      // Build search URL
      const targetUrl = buildSearchUrl(request.query, regionCode);

      logger.debug(`Search URL: ${targetUrl}`, 'SearchEngine');

      // Perform search with retry
      const results = await retry(
        () => this.executeSearch(targetUrl, request),
        {
          maxAttempts: config.retry.maxAttempts,
          initialBackoffMs: config.retry.backoffMs,
          retryableErrors: config.retry.retryableErrors,
          onRetry: (attempt, error) => {
            logger.warn(
              `Retrying search (attempt ${attempt})`,
              'SearchEngine',
              { error: error.message }
            );
          },
        }
      );

      // Build response
      const latency = Date.now() - startTime;

      const response: SearchResponse = {
        success: true,
        meta: {
          regionCode,
          regionName: this.getRegionName(regionCode),
          targetUrl,
          latency,
          timestamp: new Date().toISOString(),
          resultCount: results.length,
        },
        results,
      };

      // Add raw HTML if requested
      if (request.includeRawHtml) {
        // Note: This would require keeping the browser open
        // For MVP, we'll skip this to avoid memory issues
        logger.debug('Raw HTML not included in MVP', 'SearchEngine');
      }

      logger.info(
        `Search completed: ${results.length} results in ${latency}ms`,
        'SearchEngine'
      );

      return response;
    } catch (error) {
      const err = error as Error;
      logger.error(`Search failed: ${err.message}`, 'SearchEngine');

      throw error;
    } finally {
      // Clean up browser resources
      await this.cleanup();
    }
  }

  /**
   * Execute the actual search
   */
  private async executeSearch(
    targetUrl: string,
    request: SearchRequest
  ): Promise<any[]> {
    let browser: Browser | null = null;
    let context: BrowserContext | null = null;
    let page: Page | null = null;

    try {
      // Launch browser
      browser = await chromium.launch({
        headless: config.browser.headless,
        timeout: config.browser.timeout,
        slowMo: config.browser.slowMo,
      });

      // Create context
      context = await browser.newContext({
        viewport: config.browser.viewport,
        userAgent: config.browser.userAgent,
      });

      // Create page
      page = await context.newPage();

      // Navigate to search URL
      logger.debug('Navigating to search URL...', 'SearchEngine');
      await page.goto(targetUrl, {
        waitUntil: 'networkidle',
        timeout: config.browser.navigationTimeout,
      });

      // Handle cookie consent
      await CookieHandler.handle(page);

      // Check for CAPTCHA
      const hasCaptcha = await CaptchaDetector.detect(page);
      if (hasCaptcha) {
        const debugInfo = await CaptchaDetector.getDebugInfo(page);
        logger.error('CAPTCHA detected', 'SearchEngine', debugInfo);

        // Save screenshot for debugging
        const screenshotPath = `./logs/captcha-${Date.now()}.png`;
        await CaptchaDetector.saveScreenshot(page, screenshotPath);

        throw new Error('CAPTCHA_DETECTED');
      }

      // Wait for search results
      logger.debug('Waiting for search results...', 'SearchEngine');
      await page.waitForSelector('div#search', {
        timeout: config.browser.timeout,
      });

      // Extract results
      const numResults = request.numResults || config.search.maxResults;
      const results = await HtmlExtractor.extractResults(page, {
        maxResults: numResults,
      });

      if (results.length === 0) {
        logger.warn('No results found', 'SearchEngine');
      }

      return results;
    } catch (error) {
      // Re-throw with context
      throw error;
    }
  }

  /**
   * Clean up browser resources
   */
  private async cleanup(): Promise<void> {
    try {
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      logger.warn('Error during cleanup', 'SearchEngine', { error });
    }
  }

  /**
   * Get region name from country code
   */
  private getRegionName(countryCode: string): string {
    const names: Record<string, string> = {
      US: 'United States',
      JP: 'Japan',
      GB: 'United Kingdom',
      DE: 'Germany',
      FR: 'France',
      CN: 'China',
      HK: 'Hong Kong',
      TW: 'Taiwan',
      KR: 'South Korea',
      SG: 'Singapore',
      AU: 'Australia',
      CA: 'Canada',
    };

    return names[countryCode.toUpperCase()] || countryCode;
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down SearchEngine...', 'SearchEngine');
    await this.cleanup();
  }
}

// Singleton instance
export const searchEngine = new SearchEngine();
