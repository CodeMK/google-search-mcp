/**
 * Domain Mapping Configuration
 * Maps country codes to Google domains and default languages
 */

export interface DomainMapping {
  countryCode: string;      // Country code: JP, US, HK
  countryName: string;      // Country name: Japan, United States, Hong Kong
  domain: string;           // Google domain: www.google.co.jp
  language: string;         // Default language: ja, en, zh
}

export const DOMAIN_MAP: Record<string, DomainMapping> = {
  // Americas
  US: { countryCode: 'US', countryName: 'United States', domain: 'www.google.com', language: 'en' },
  CA: { countryCode: 'CA', countryName: 'Canada', domain: 'www.google.ca', language: 'en' },
  BR: { countryCode: 'BR', countryName: 'Brazil', domain: 'www.google.com.br', language: 'pt-BR' },
  MX: { countryCode: 'MX', countryName: 'Mexico', domain: 'www.google.com.mx', language: 'es' },
  AR: { countryCode: 'AR', countryName: 'Argentina', domain: 'www.google.com.ar', language: 'es' },

  // Europe
  GB: { countryCode: 'GB', countryName: 'United Kingdom', domain: 'www.google.co.uk', language: 'en-GB' },
  DE: { countryCode: 'DE', countryName: 'Germany', domain: 'www.google.de', language: 'de' },
  FR: { countryCode: 'FR', countryName: 'France', domain: 'www.google.fr', language: 'fr' },
  IT: { countryCode: 'IT', countryName: 'Italy', domain: 'www.google.it', language: 'it' },
  ES: { countryCode: 'ES', countryName: 'Spain', domain: 'www.google.es', language: 'es' },
  NL: { countryCode: 'NL', countryName: 'Netherlands', domain: 'www.google.nl', language: 'nl' },
  RU: { countryCode: 'RU', countryName: 'Russia', domain: 'www.google.ru', language: 'ru' },
  PL: { countryCode: 'PL', countryName: 'Poland', domain: 'www.google.pl', language: 'pl' },
  TR: { countryCode: 'TR', countryName: 'Turkey', domain: 'www.google.com.tr', language: 'tr' },

  // Asia Pacific
  CN: { countryCode: 'CN', countryName: 'China', domain: 'www.google.com', language: 'zh-CN' },
  HK: { countryCode: 'HK', countryName: 'Hong Kong', domain: 'www.google.com.hk', language: 'zh-HK' },
  TW: { countryCode: 'TW', countryName: 'Taiwan', domain: 'www.google.com.tw', language: 'zh-TW' },
  JP: { countryCode: 'JP', countryName: 'Japan', domain: 'www.google.co.jp', language: 'ja' },
  KR: { countryCode: 'KR', countryName: 'South Korea', domain: 'www.google.co.kr', language: 'ko' },
  SG: { countryCode: 'SG', countryName: 'Singapore', domain: 'www.google.com.sg', language: 'en' },
  IN: { countryCode: 'IN', countryName: 'India', domain: 'www.google.co.in', language: 'en' },
  ID: { countryCode: 'ID', countryName: 'Indonesia', domain: 'www.google.co.id', language: 'id' },
  TH: { countryCode: 'TH', countryName: 'Thailand', domain: 'www.google.co.th', language: 'th' },
  VN: { countryCode: 'VN', countryName: 'Vietnam', domain: 'www.google.com.vn', language: 'vi' },
  AU: { countryCode: 'AU', countryName: 'Australia', domain: 'www.google.com.au', language: 'en' },
  NZ: { countryCode: 'NZ', countryName: 'New Zealand', domain: 'www.google.co.nz', language: 'en' },

  // Middle East & Africa
  SA: { countryCode: 'SA', countryName: 'Saudi Arabia', domain: 'www.google.com.sa', language: 'ar' },
  AE: { countryCode: 'AE', countryName: 'United Arab Emirates', domain: 'www.google.ae', language: 'en' },
  ZA: { countryCode: 'ZA', countryName: 'South Africa', domain: 'www.google.co.za', language: 'en' },
  EG: { countryCode: 'EG', countryName: 'Egypt', domain: 'www.google.com.eg', language: 'ar' },
};

/**
 * Get domain mapping by country code
 * @param countryCode - ISO country code (JP, US, HK, etc.)
 * @returns Domain mapping, or US default if not found
 */
export function getDomainMapping(countryCode: string): DomainMapping {
  const code = countryCode.toUpperCase();
  return DOMAIN_MAP[code] || DOMAIN_MAP.US;
}

/**
 * Build search URL with localization parameters
 * @param query - Search query string
 * @param countryCode - Target country code
 * @returns Complete Google search URL
 */
export function buildSearchUrl(query: string, countryCode: string): string {
  const mapping = getDomainMapping(countryCode);
  const baseUrl = `https://${mapping.domain}/search`;
  const params = new URLSearchParams({
    q: query,
    hl: mapping.language,
    gl: countryCode.toLowerCase(),
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Get all supported country codes
 * @returns Array of supported country codes
 */
export function getSupportedCountries(): string[] {
  return Object.keys(DOMAIN_MAP).sort();
}

/**
 * Get all supported countries with names
 * @returns Array of country info with code and name
 */
export function getCountryList(): Array<{ code: string; name: string }> {
  return Object.values(DOMAIN_MAP)
    .map(mapping => ({
      code: mapping.countryCode,
      name: mapping.countryName,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * Check if country code is supported
 * @param countryCode - Country code to check
 * @returns true if supported
 */
export function isCountrySupported(countryCode: string): boolean {
  return countryCode.toUpperCase() in DOMAIN_MAP;
}
