/**
 * Geo-location Service
 * Detects geographic location based on IP address
 */

import { GeoInfo, CachedGeoInfo } from '../types';
import { logger } from '../utils/logger';

export interface GeoDetectionOptions {
  cacheEnabled?: boolean;
  cacheTtl?: number;          // Cache TTL in milliseconds
}

export class GeoService {
  private cache: Map<string, CachedGeoInfo> = new Map();
  private cacheTtl: number;
  private cacheEnabled: boolean;

  // Free IP geolocation APIs
  private readonly geolocationApis = [
    {
      url: 'https://ipapi.co/json/',
      parse: (data: any) => ({
        countryCode: data.country,
        countryName: data.country_name,
        ip: data.ip,
        region: data.region,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      }),
    },
    {
      url: 'https://ip-api.com/json/',
      parse: (data: any) => ({
        countryCode: data.countryCode,
        countryName: data.country,
        ip: data.query,
        region: data.region,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
      }),
    },
    {
      url: 'https://api.ipify.org?format=json',
      parse: (data: any) => ({
        countryCode: 'US', // Default if only IP is returned
        countryName: 'United States',
        ip: data.ip,
      }),
    },
  ];

  constructor(options: GeoDetectionOptions = {}) {
    this.cacheEnabled = options.cacheEnabled ?? true;
    this.cacheTtl = options.cacheTtl ?? 3600000; // 1 hour default
  }

  /**
   * Detect location based on IP
   * @param ip - Optional IP address (defaults to current public IP)
   * @returns Geo information
   */
  async detectLocation(ip?: string): Promise<GeoInfo> {
    const cacheKey = ip || 'current';

    // Check cache
    if (this.cacheEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
        logger.debug(`Using cached geo info for ${cacheKey}`, 'GeoService');
        const { timestamp, ...geoInfo } = cached;
        return geoInfo;
      }
    }

    // Fetch from APIs
    const geoInfo = await this.fetchFromApis(ip);

    // Update cache
    if (this.cacheEnabled) {
      this.cache.set(cacheKey, { ...geoInfo, timestamp: Date.now() });
    }

    return geoInfo;
  }

  /**
   * Fetch geo info from available APIs (with fallback)
   */
  private async fetchFromApis(_ip?: string): Promise<GeoInfo> {
    const errors: Error[] = [];

    for (const api of this.geolocationApis) {
      try {
        logger.debug(`Trying geolocation API: ${api.url}`, 'GeoService');

        const response = await timeout(
          fetch(api.url),
          10000,
          'Geolocation API timeout'
        );

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        const geoInfo = api.parse(data);

        logger.info(
          `Detected location: ${geoInfo.countryName} (${geoInfo.countryCode})`,
          'GeoService',
          { ip: geoInfo.ip }
        );

        return geoInfo;
      } catch (error) {
        const err = error as Error;
        errors.push(err);
        logger.warn(
          `Geolocation API failed: ${err.message}`,
          'GeoService'
        );
        continue;
      }
    }

    // All APIs failed - use default location
    logger.warn(
      'All geolocation APIs failed, using default location (US)',
      'GeoService'
    );

    // Return default US location as fallback
    return {
      countryCode: 'US',
      countryName: 'United States',
      ip: 'unknown',
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Geo location cache cleared', 'GeoService');
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

/**
 * Timeout promise utility
 */
function timeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

// Singleton instance
export const geoService = new GeoService();
