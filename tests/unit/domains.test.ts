/**
 * Unit tests for domain mapping
 */

import { getDomainMapping, buildSearchUrl, getSupportedCountries, isCountrySupported, getCountryList } from '../../src/config/domains';

describe('Domain Mapping', () => {
  describe('getDomainMapping', () => {
    test('should return correct domain for JP', () => {
      const mapping = getDomainMapping('JP');
      expect(mapping.domain).toBe('www.google.co.jp');
      expect(mapping.countryCode).toBe('JP');
      expect(mapping.countryName).toBe('Japan');
      expect(mapping.language).toBe('ja');
    });

    test('should return correct domain for US', () => {
      const mapping = getDomainMapping('US');
      expect(mapping.domain).toBe('www.google.com');
      expect(mapping.countryCode).toBe('US');
      expect(mapping.countryName).toBe('United States');
      expect(mapping.language).toBe('en');
    });

    test('should return correct domain for GB', () => {
      const mapping = getDomainMapping('GB');
      expect(mapping.domain).toBe('www.google.co.uk');
      expect(mapping.countryCode).toBe('GB');
      expect(mapping.countryName).toBe('United Kingdom');
    });

    test('should fallback to US for unknown country', () => {
      const mapping = getDomainMapping('UNKNOWN');
      expect(mapping.domain).toBe('www.google.com');
      expect(mapping.countryCode).toBe('US');
      expect(mapping.countryName).toBe('United States');
    });

    test('should handle lowercase input', () => {
      const mapping = getDomainMapping('jp');
      expect(mapping.domain).toBe('www.google.co.jp');
      expect(mapping.countryCode).toBe('JP');
      expect(mapping.countryName).toBe('Japan');
    });
  });

  describe('buildSearchUrl', () => {
    test('should build correct URL for JP', () => {
      const url = buildSearchUrl('test query', 'JP');
      expect(url).toContain('www.google.co.jp');
      expect(url).toContain('q=test+query');
      expect(url).toContain('hl=ja');
      expect(url).toContain('gl=jp');
    });

    test('should build correct URL for US', () => {
      const url = buildSearchUrl('typescript', 'US');
      expect(url).toContain('www.google.com');
      expect(url).toContain('q=typescript');
      expect(url).toContain('hl=en');
      expect(url).toContain('gl=us');
    });

    test('should handle special characters in query', () => {
      const url = buildSearchUrl('hello world', 'JP');
      expect(url).toContain('q=hello+world');
    });
  });

  describe('getSupportedCountries', () => {
    test('should return array of country codes', () => {
      const countries = getSupportedCountries();
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
      expect(countries).toContain('US');
      expect(countries).toContain('JP');
      expect(countries).toContain('GB');
    });
  });

  describe('getCountryList', () => {
    test('should return array of countries with code and name', () => {
      const countries = getCountryList();
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);

      // Check first item structure
      expect(countries[0]).toHaveProperty('code');
      expect(countries[0]).toHaveProperty('name');
      expect(typeof countries[0].code).toBe('string');
      expect(typeof countries[0].name).toBe('string');
    });

    test('should include specific countries', () => {
      const countries = getCountryList();

      const us = countries.find(c => c.code === 'US');
      expect(us).toBeDefined();
      expect(us?.name).toBe('United States');

      const jp = countries.find(c => c.code === 'JP');
      expect(jp).toBeDefined();
      expect(jp?.name).toBe('Japan');

      const cn = countries.find(c => c.code === 'CN');
      expect(cn).toBeDefined();
      expect(cn?.name).toBe('China');
    });

    test('should be sorted by country code', () => {
      const countries = getCountryList();
      const codes = countries.map(c => c.code);
      const sortedCodes = [...codes].sort();
      expect(codes).toEqual(sortedCodes);
    });
  });

  describe('isCountrySupported', () => {
    test('should return true for supported countries', () => {
      expect(isCountrySupported('US')).toBe(true);
      expect(isCountrySupported('JP')).toBe(true);
      expect(isCountrySupported('GB')).toBe(true);
    });

    test('should return false for unsupported countries', () => {
      expect(isCountrySupported('XX')).toBe(false);
      expect(isCountrySupported('INVALID')).toBe(false);
    });

    test('should handle lowercase input', () => {
      expect(isCountrySupported('us')).toBe(true);
      expect(isCountrySupported('jp')).toBe(true);
    });
  });
});
