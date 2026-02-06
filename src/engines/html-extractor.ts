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
        ([, limit]: readonly [any, number]) => {
          const items: any[] = [];

          // NEW APPROACH: Find h3 elements first, then extract from their parent containers
          // This is more reliable because h3 titles are the core of search results
          const h3Elements = Array.from(document.querySelectorAll('h3'));
          const resultCount = Math.min(h3Elements.length, limit);

          console.log(`[DEBUG] Found ${h3Elements.length} h3 elements`);

          for (let i = 0; i < resultCount; i++) {
            const h3El = h3Elements[i];
            const title = h3El.textContent?.trim() || '';

            // Find the link - either the h3 itself is in an anchor, or its sibling/parent is
            let linkEl: HTMLAnchorElement | null = h3El.closest('a');
            if (!linkEl && h3El.parentElement) {
              linkEl = h3El.parentElement.querySelector('a[href]');
            }
            if (!linkEl && h3El.nextElementSibling) {
              const temp = h3El.nextElementSibling.querySelector('a[href]');
              linkEl = temp as HTMLAnchorElement | null;
            }

            // Get link from the anchor element
            let link = '';
            if (linkEl) {
              link = linkEl.href || linkEl.getAttribute('href') || '';
            }

            // If still no link, try to find any http link near the h3
            if (!link && h3El.parentElement) {
              const parent = h3El.parentElement;
              const nearbyLink = parent.querySelector('a[href*="http"]') as HTMLAnchorElement | null;
              if (nearbyLink) link = nearbyLink.href;
            }

            // Extract snippet - look for it near the h3
            let snippet = '';
            const parent = h3El.parentElement;
            if (parent) {
              // Try sibling divs or children
              const snippetEl = parent.nextElementSibling?.querySelector('div[style*="-webkit-line-clamp"], span.aCOpRe, div.VwiC3b')
                || parent.querySelector('div[style*="-webkit-line-clamp"], span.aCOpRe, div.VwiC3b');
              snippet = snippetEl?.textContent?.trim() || '';
            }

            // Extract display URL - find cite element nearby
            let displayUrl = '';
            if (parent) {
              const citeEl = parent.querySelector('cite') || parent.nextElementSibling?.querySelector('cite');
              displayUrl = citeEl?.textContent?.trim() || '';
            }

            // Only add if we have at least title and link starting with http
            if (title && link && (link.startsWith('http://') || link.startsWith('https://'))) {
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

      // If no results found, try to debug by getting page structure
      if (cleanedResults.length === 0) {
        logger.warn('No results extracted, attempting debug extraction', 'HtmlExtractor');
        await this.debugPageStructure(page);
      }

      return cleanedResults as SearchResult[];
    } catch (error) {
      logger.error('Failed to extract results', 'HtmlExtractor', { error });
      return [];
    }
  }

  /**
   * Debug helper to understand page structure when extraction fails
   */
  private static async debugPageStructure(page: Page): Promise<void> {
    try {
      const debugInfo = await page.evaluate(() => {
        // Find potential result containers
        const allDivs = document.querySelectorAll('div');
        const classes = new Set<string>();

        allDivs.forEach(div => {
          const className = div.className;
          if (typeof className === 'string' && className.includes('Mjj')) {
            classes.add(className);
          }
        });

        // Check for any h3 elements
        const h3Elements = document.querySelectorAll('h3');
        const h3Texts = Array.from(h3Elements).slice(0, 5).map(h3 => ({
          text: h3.textContent?.substring(0, 50),
          parentClass: h3.parentElement?.className,
          grandParentClass: h3.parentElement?.parentElement?.className,
        }));

        // Check for any links with http
        const links = Array.from(document.querySelectorAll('a[href*="http"]')).slice(0, 5).map(a => ({
          href: (a as HTMLAnchorElement).href?.substring(0, 50),
          text: a.textContent?.substring(0, 30),
          parentClass: a.parentElement?.className,
        }));

        return {
          potentialClasses: Array.from(classes),
          h3Count: h3Elements.length,
          h3Samples: h3Texts,
          linkSamples: links,
          bodyClass: document.body?.className,
        };
      });

      logger.debug('Page structure debug info', 'HtmlExtractor', debugInfo);
    } catch (error) {
      logger.error('Failed to debug page structure', 'HtmlExtractor', { error });
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
