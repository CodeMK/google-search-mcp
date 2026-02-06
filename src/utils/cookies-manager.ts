/**
 * Cookies Manager
 * Utility for managing browser cookies from real browser sessions
 */

import fs from 'fs';
import path from 'path';
import { BrowserContext, Cookie } from 'playwright';
import { logger } from './logger';

export interface StoredCookies {
  cookies: Cookie[];
  timestamp: string;
  domain: string;
}

export class CookiesManager {
  private cookiesDir: string;

  constructor(cookiesDir: string = './data/cookies') {
    this.cookiesDir = cookiesDir;
    this.ensureDirectoryExists();
  }

  /**
   * Ensure cookies directory exists
   */
  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.cookiesDir)) {
      fs.mkdirSync(this.cookiesDir, { recursive: true });
      logger.info(`Created cookies directory: ${this.cookiesDir}`, 'CookiesManager');
    }
  }

  /**
   * Save cookies to file
   */
  async saveCookies(
    context: BrowserContext,
    domain: string = 'google.com'
  ): Promise<string> {
    const cookies = await context.cookies();
    const timestamp = new Date().toISOString();
    const filename = `cookies-${domain}-${Date.now()}.json`;
    const filepath = path.join(this.cookiesDir, filename);

    const data: StoredCookies = {
      cookies,
      timestamp,
      domain,
    };

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

    logger.info(`Saved ${cookies.length} cookies to ${filename}`, 'CookiesManager', {
      domain,
      timestamp,
    });

    return filepath;
  }

  /**
   * Load cookies from file
   */
  async loadCookies(
    context: BrowserContext,
    filepath: string
  ): Promise<boolean> {
    try {
      if (!fs.existsSync(filepath)) {
        logger.warn(`Cookies file not found: ${filepath}`, 'CookiesManager');
        return false;
      }

      const content = fs.readFileSync(filepath, 'utf-8');
      const data: StoredCookies = JSON.parse(content);

      await context.addCookies(data.cookies);

      logger.info(
        `Loaded ${data.cookies.length} cookies from ${filepath}`,
        'CookiesManager',
        { domain: data.domain, timestamp: data.timestamp }
      );

      return true;
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to load cookies: ${err.message}`, 'CookiesManager');
      return false;
    }
  }

  /**
   * Load latest cookies for a domain
   */
  async loadLatestCookies(
    context: BrowserContext,
    domain: string = 'google.com'
  ): Promise<boolean> {
    const files = this.getCookieFiles(domain);

    if (files.length === 0) {
      logger.warn(`No cookies found for domain: ${domain}`, 'CookiesManager');
      return false;
    }

    // Get the latest file
    const latestFile = files[0];
    const filepath = path.join(this.cookiesDir, latestFile);

    return this.loadCookies(context, filepath);
  }

  /**
   * Get list of cookie files for a domain, sorted by modification time
   */
  getCookieFiles(domain: string = 'google.com'): string[] {
    try {
      const allFiles = fs.readdirSync(this.cookiesDir);

      // Filter files for the domain
      const domainFiles = allFiles
        .filter((file) => file.startsWith(`cookies-${domain}`))
        .map((file) => {
          const filepath = path.join(this.cookiesDir, file);
          const stats = fs.statSync(filepath);
          return { file, mtime: stats.mtimeMs };
        })
        .sort((a, b) => b.mtime - a.mtime) // Sort by modification time, newest first
        .map((item) => item.file);

      return domainFiles;
    } catch (error) {
      logger.warn('Failed to read cookies directory', 'CookiesManager', { error });
      return [];
    }
  }

  /**
   * Clear old cookie files (keep only the latest N files)
   */
  clearOldCookies(domain: string = 'google.com', keepCount: number = 3): void {
    try {
      const files = this.getCookieFiles(domain);

      if (files.length <= keepCount) {
        return;
      }

      // Delete older files
      const filesToDelete = files.slice(keepCount);
      filesToDelete.forEach((file) => {
        const filepath = path.join(this.cookiesDir, file);
        fs.unlinkSync(filepath);
        logger.debug(`Deleted old cookies file: ${file}`, 'CookiesManager');
      });

      logger.info(
        `Cleared ${filesToDelete.length} old cookie files`,
        'CookiesManager'
      );
    } catch (error) {
      logger.warn('Failed to clear old cookies', 'CookiesManager', { error });
    }
  }

  /**
   * Import cookies from Chrome browser
   * This is a helper method that guides users to manually export cookies
   */
  static getChromeExportInstructions(): string {
    return `
╔════════════════════════════════════════════════════════════════════════════╗
║                  CHROME COOKIES EXPORT INSTRUCTIONS                       ║
╚════════════════════════════════════════════════════════════════════════════╝

To export cookies from Chrome:

1. Install the "EditThisCookie" extension:
   https://chrome.google.com/webstore/detail/editthiscookie/

2. Go to google.com and make sure you're logged in

3. Click the EditThisCookie extension icon

4. Click "Export" and save as JSON

5. Place the JSON file in: ./data/cookies/imported-cookies.json

6. The file format should be:
   {
     "cookies": [
       {
         "name": "SID",
         "value": "...",
         "domain": ".google.com",
         "path": "/",
         "expirationDate": 1234567890,
         "secure": true,
         "httpOnly": true,
         "sameSite": "no_restriction"
       }
     ]
   }

Alternative method (using Chrome DevTools):

1. Open Chrome DevTools (F12)

2. Go to Application > Cookies > https://www.google.com

3. Select all cookies and copy them

4. Save to ./data/cookies/imported-cookies.json
`;
  }
}

// Export singleton instance
export const cookiesManager = new CookiesManager();
