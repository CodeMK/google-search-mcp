/**
 * HTML Extractor
 * Extracts search results from Google SERP
 */

import { Page } from 'playwright';
import { SearchResult } from '../types';
import { SEARCH_SELECTORS } from '../config/constants';
import { logger } from '../utils/logger';
import { cleanGoogleRedirectUrl } from '../utils/url-cleaner';

export interface ExtractionOptions {
  maxResults?: number;
  extractMainContent?: boolean;
}

export class HtmlExtractor {
  /**
   * Extract search results from the page
   * @param page - Playwright page instance
   * @param options - Extraction options
   * @returns Array of search results
   */
  static async extractResults(
    page: Page,
    options: ExtractionOptions = {}
  ): Promise<SearchResult[]> {
    const { maxResults = 10 } = options;

    logger.debug('Extracting search results...', 'HtmlExtractor');

    try {
      const results = await page.evaluate(
        ([selectors, limit]: readonly [any, number]) => {
          const items: any[] = [];

          // Find all result containers
          const resultContainers = document.querySelectorAll(
            selectors.resultItem
          );

          // Limit results
          const count = Math.min(resultContainers.length, limit);

          for (let i = 0; i < count; i++) {
            const container = resultContainers[i] as Element;

            // Extract title
            const titleEl = container.querySelector(selectors.title);
            const title = titleEl?.textContent?.trim() || '';

            // Extract link
            const linkEl = container.querySelector(selectors.link);
            const link = (linkEl as HTMLAnchorElement)?.href || '';

            // Extract display URL
            const displayUrlEl = container.querySelector(selectors.displayUrl);
            const displayUrl = displayUrlEl?.textContent?.trim() ||
                              linkEl?.getAttribute('href') || '';

            // Extract snippet
            const snippetEl = container.querySelector(selectors.snippet);
            const snippet = snippetEl?.textContent?.trim() || '';

            if (title && link) {
              items.push({
                rank: i + 1,
                title,
                link,
                displayUrl,
                snippet,
              });
            }
          }

          return items;
        },
        [SEARCH_SELECTORS, maxResults] as const
      );

      // Clean URLs
      const cleanedResults = results.map((r: any) => ({
        ...r,
        link: cleanGoogleRedirectUrl(r.link),
      }));

      logger.info(`Extracted ${cleanedResults.length} results`, 'HtmlExtractor');

      return cleanedResults as SearchResult[];
    } catch (error) {
      logger.error('Failed to extract results', 'HtmlExtractor', { error });
      return [];
    }
  }

  /**
   * Get raw HTML content
   * @param page - Playwright page instance
   * @param options - Extraction options
   * @returns HTML content
   */
  static async extractHtml(
    page: Page,
    options: ExtractionOptions = {}
  ): Promise<string> {
    const { extractMainContent = false } = options;

    if (extractMainContent) {
      // Extract only the search results section
      const html = await page.evaluate(
        ([selectors]: readonly [any]) => {
          const container = document.querySelector(selectors.resultsContainer);
          return container ? container.innerHTML : document.body.innerHTML;
        },
        [SEARCH_SELECTORS] as const
      );

      return html;
    }

    return await page.content();
  }

  /**
   * Extract both results and HTML
   * @param page - Playwright page instance
   * @param options - Extraction options
   */
  static async extractAll(
    page: Page,
    options: ExtractionOptions = {}
  ): Promise<{ results: SearchResult[]; html: string }> {
    const results = await this.extractResults(page, options);
    const html = await this.extractHtml(page, options);

    return { results, html };
  }
}
