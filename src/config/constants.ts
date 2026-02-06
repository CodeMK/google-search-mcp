/**
 * Application Constants
 */

// User Agent strings for different platforms (Updated to latest versions)
export const USER_AGENTS = {
  desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
};

// Multiple user agents for rotation (helps avoid detection)
export const USER_AGENT_POOL = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
];

// Cookie consent button selectors (multiple languages)
export const COOKIE_CONSENT_SELECTORS = [
  'button:has-text("Accept all")',
  'button:has-text("I agree")',
  'button:has-text("Accept")',
  'button:has-text("Agree")',
  'button:has-text("接受所有")',
  'button:has-text("同意")',
  'button:has-text("同意所有")',
  'button[aria-label="Accept"]',
  'button[aria-label="I agree"]',
  'div[role="button"]:has-text("Accept")',
  'div[role="button"]:has-text("I agree")',
  'text=Accept all',
  'text=I agree',
  'text=Accept',
  'text=Agree',
];

// CAPTCHA detection indicators
export const CAPTCHA_INDICATORS = [
  'iframe[src*="recaptcha"]',
  'iframe[src*="recaptcha/api"]',
  'div[id*="captcha"]',
  'div[class*="captcha"]',
  'form[action*="captcha"]',
  '[id*="recaptcha"]',
  '[class*="recaptcha"]',
  '.g-recaptcha',
  '#recaptcha',
];

// CAPTCHA related text in page content
export const CAPTCHA_TEXT_PATTERNS = [
  'CAPTCHA',
  'unusual traffic',
  'verify you are human',
  'please complete the security check',
  'this page is protected by',
];

// Google search result selectors
export const SEARCH_SELECTORS = {
  // Main container
  resultsContainer: 'div#search',
  // Individual result
  resultItem: 'div[data-hveid]',
  // Title
  title: 'h3',
  // Link
  link: 'a',
  // Snippet/description
  snippet: 'div[data-hveid] span, div.VwiC3b',
  // Display URL
  displayUrl: 'div[data-hveid] cite, div.wwWE2c',
  // Related searches
  relatedSearches: 'div#kp', // Knowledge panel
  // Pagination
  nextButton: 'a#pnnext',
};

// Error types
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  CAPTCHA_DETECTED = 'CAPTCHA_DETECTED',
  TIMEOUT = 'TIMEOUT',
  NO_RESULTS = 'NO_RESULTS',
  INVALID_QUERY = 'INVALID_QUERY',
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  BROWSER_CRASHED = 'BROWSER_CRASHED',
}

// Retry configuration
export const RETRY_CONFIG = {
  maxAttempts: 3,
  initialBackoffMs: 1000,
  maxBackoffMs: 10000,
  backoffMultiplier: 2,
};

// Browser viewport presets
export const VIEWPORT_PRESETS = {
  desktop: { width: 1920, height: 1080 },
  laptop: { width: 1366, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  navigation: 30000,      // Page navigation
  elementWait: 10000,     // Waiting for element
  searchLoad: 15000,      // Search results loading
  browserLaunch: 30000,   // Browser launch
  default: 5000,          // Default timeout
};

// Human behavior simulation settings
export const HUMAN_BEHAVIOR = {
  // Random delays (in milliseconds)
  typingDelay: { min: 50, max: 150 },
  clickDelay: { min: 100, max: 300 },
  scrollDelay: { min: 500, max: 1500 },
  pageLoadWait: { min: 2000, max: 4000 },

  // Mouse movement settings
  mouseSpeed: { min: 100, max: 300 },
  mouseJitter: 5, // Random pixel offset for mouse movement

  // Scroll behavior
  scrollAmount: { min: 100, max: 500 },
  scrollSteps: { min: 2, max: 5 },

  // Random chance of performing human-like actions
  chanceOfRandomScroll: 0.3,    // 30% chance
  chanceOfRandomPause: 0.2,     // 20% chance
  chanceOfMouseMovement: 0.5,   // 50% chance
};

// Viewport size variations for realism
export const VIEWPORT_VARIATIONS = [
  { width: 1920, height: 1080 },  // Full HD
  { width: 1366, height: 768 },   // Laptop
  { width: 1440, height: 900 },   // MacBook
  { width: 1536, height: 864 },   // Common laptop
  { width: 2560, height: 1440 },  // 2K
];
