/**
 * URL cleaning utility
 * Removes Google redirect parameters and cleans URLs
 */

/**
 * Clean Google redirect URLs to get the actual destination URL
 * @param url - Potentially redirect URL
 * @returns Cleaned URL or original if not a redirect
 */
export function cleanGoogleRedirectUrl(url: string): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);

    // Google redirect URL format: https://www.google.com/url?url=<real_url>&...
    if (
      parsed.hostname.includes('google.com') &&
      (parsed.pathname === '/url' || parsed.pathname === '/local/url')
    ) {
      const realUrl = parsed.searchParams.get('url') ||
                      parsed.searchParams.get('q') ||
                      parsed.searchParams.get('target');

      if (realUrl) {
        return realUrl;
      }
    }

    // Remove common tracking parameters
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'gclid',
      'fbclid',
      'msclkid',
    ];

    trackingParams.forEach(param => {
      parsed.searchParams.delete(param);
    });

    return parsed.toString();
  } catch (error) {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Validate if a URL is well-formed
 * @param url - URL to validate
 * @returns true if valid
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Reject javascript: and data: URLs
    if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 * @param url - URL to extract from
 * @returns Domain name or empty string
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return '';
  }
}

/**
 * Normalize URL by adding protocol if missing
 * @param url - URL to normalize
 * @returns Normalized URL
 */
export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}
