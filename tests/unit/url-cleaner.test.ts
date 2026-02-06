/**
 * Unit tests for URL cleaner utility
 */

import {
  cleanGoogleRedirectUrl,
  isValidUrl,
  extractDomain,
  normalizeUrl,
} from '../../src/utils/url-cleaner';

describe('URL Cleaner', () => {
  describe('cleanGoogleRedirectUrl', () => {
    test('should clean Google redirect URL with url parameter', () => {
      const url = 'https://www.google.com/url?url=https://example.com/test&sa=';
      const cleaned = cleanGoogleRedirectUrl(url);
      expect(cleaned).toBe('https://example.com/test');
    });

    test('should clean Google redirect URL with q parameter', () => {
      const url = 'https://www.google.com/url?q=https://github.com/user/repo&usg=';
      const cleaned = cleanGoogleRedirectUrl(url);
      expect(cleaned).toBe('https://github.com/user/repo');
    });

    test('should return original URL if not a redirect', () => {
      const url = 'https://example.com/page';
      const cleaned = cleanGoogleRedirectUrl(url);
      expect(cleaned).toBe('https://example.com/page');
    });

    test('should remove tracking parameters', () => {
      const url = 'https://example.com/page?utm_source=google&utm_medium=cpc&gclid=123';
      const cleaned = cleanGoogleRedirectUrl(url);
      expect(cleaned).not.toContain('utm_source');
      expect(cleaned).not.toContain('utm_medium');
      expect(cleaned).not.toContain('gclid');
    });

    test('should handle invalid URLs gracefully', () => {
      const url = 'not-a-valid-url';
      const cleaned = cleanGoogleRedirectUrl(url);
      expect(cleaned).toBe('not-a-valid-url');
    });

    test('should handle empty string', () => {
      const cleaned = cleanGoogleRedirectUrl('');
      expect(cleaned).toBe('');
    });
  });

  describe('isValidUrl', () => {
    test('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
    });

    test('should return false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });
  });

  describe('extractDomain', () => {
    test('should extract domain from URL', () => {
      expect(extractDomain('https://example.com/path')).toBe('example.com');
      expect(extractDomain('https://subdomain.example.com/path')).toBe('subdomain.example.com');
      expect(extractDomain('http://example.com:8080/path')).toBe('example.com');
    });

    test('should return empty string for invalid URL', () => {
      expect(extractDomain('not-a-url')).toBe('');
      expect(extractDomain('')).toBe('');
    });
  });

  describe('normalizeUrl', () => {
    test('should add https:// if missing', () => {
      expect(normalizeUrl('example.com')).toBe('https://example.com');
      expect(normalizeUrl('www.example.com')).toBe('https://www.example.com');
    });

    test('should not modify URLs with protocol', () => {
      expect(normalizeUrl('https://example.com')).toBe('https://example.com');
      expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    });
  });
});
