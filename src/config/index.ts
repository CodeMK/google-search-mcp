/**
 * Application Configuration
 * Central configuration for the entire application
 */

import { config as dotenvConfig } from 'dotenv';
import { USER_AGENTS, VIEWPORT_PRESETS, TIMEOUTS } from './constants';

// Load environment variables
dotenvConfig();

export interface AppConfig {
  // Server configuration
  server: {
    port: number;
    host: string;
    corsEnabled: boolean;
  };

  // Browser configuration
  browser: {
    headless: boolean;
    viewport: { width: number; height: number };
    userAgent: string;
    timeout: number;
    navigationTimeout: number;
    slowMo: number;           // Slow down operations (ms) for debugging
    devtools: boolean;        // Open DevTools in non-headless mode
  };

  // Search configuration
  search: {
    defaultRegion: string;    // Default country code
    maxResults: number;       // Max results to return
    includeRawHtml: boolean;  // Include raw HTML in response
    waitForResults: boolean;  // Wait for search results to load
  };

  // Proxy configuration (for future Phase 2)
  proxy: {
    enabled: boolean;
    list: string[];           // List of proxy URLs
    timeout: number;
  };

  // Retry configuration
  retry: {
    maxAttempts: number;
    backoffMs: number;
    retryableErrors: string[];
  };

  // Logging configuration
  logging: {
    level: string;            // error, warn, info, debug
    format: string;           // json, simple
    fileEnabled: boolean;
    filePath: string;
  };
}

/**
 * Default application configuration
 */
export const config: AppConfig = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    corsEnabled: process.env.CORS_ENABLED !== 'false',
  },

  browser: {
    headless: process.env.HEADLESS !== 'false',
    viewport: VIEWPORT_PRESETS.desktop,
    userAgent: process.env.USER_AGENT || USER_AGENTS.desktop,
    timeout: TIMEOUTS.elementWait,
    navigationTimeout: TIMEOUTS.navigation,
    slowMo: parseInt(process.env.SLOW_MO || '0', 10),
    devtools: process.env.DEVTOOLS === 'true',
  },

  search: {
    defaultRegion: process.env.DEFAULT_REGION || 'US',
    maxResults: parseInt(process.env.MAX_RESULTS || '10', 10),
    includeRawHtml: process.env.INCLUDE_RAW_HTML === 'true',
    waitForResults: true,
  },

  proxy: {
    enabled: process.env.PROXY_ENABLED === 'true',
    list: process.env.PROXY_LIST?.split(',').filter(Boolean) || [],
    timeout: parseInt(process.env.PROXY_TIMEOUT || '10000', 10),
  },

  retry: {
    maxAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3', 10),
    backoffMs: parseInt(process.env.RETRY_BACKOFF_MS || '1000', 10),
    retryableErrors: [
      'Timeout',
      'Network',
      'CAPTCHA',
      'NavigationTimeout',
    ],
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'simple',
    fileEnabled: process.env.LOG_FILE_ENABLED === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
  },
};

/**
 * Validate configuration
 * @throws Error if configuration is invalid
 */
export function validateConfig(): void {
  const { server, browser, search } = config;

  if (server.port < 1 || server.port > 65535) {
    throw new Error(`Invalid server port: ${server.port}`);
  }

  if (!search.defaultRegion || search.defaultRegion.length !== 2) {
    throw new Error(`Invalid default region: ${search.defaultRegion}`);
  }

  if (browser.timeout < 0) {
    throw new Error(`Invalid browser timeout: ${browser.timeout}`);
  }

  if (search.maxResults < 1) {
    throw new Error(`Invalid max results: ${search.maxResults}`);
  }
}

// Validate config on import
try {
  validateConfig();
} catch (error) {
  const err = error as Error;
  console.error('Configuration validation failed:', err.message);
  process.exit(1);
}
