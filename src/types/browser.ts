/**
 * Browser-related type definitions
 */

import { Browser, BrowserContext, Page } from 'playwright';

/**
 * Browser instance wrapper
 */
export interface BrowserInstance {
  id: string;
  browser: Browser;
  context: BrowserContext;
  page: Page;
  createdAt: Date;
  lastUsedAt: Date;
  inUse: boolean;
  proxy?: string;
}

/**
 * Browser pool state
 */
export interface BrowserPool {
  instances: Map<string, BrowserInstance>;
  available: string[];
  maxInstances: number;
}

/**
 * Browser pool configuration
 */
export interface BrowserPoolConfig {
  minInstances: number;
  maxInstances: number;
  instanceTimeout: number;    // Max lifetime in ms
  idleTimeout: number;        // Idle timeout in ms
}
