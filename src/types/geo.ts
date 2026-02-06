/**
 * Geo-location related type definitions
 */

/**
 * Geographic information
 */
export interface GeoInfo {
  countryCode: string;        // ISO 3166-1 alpha-2 country code
  countryName: string;        // Full country name
  ip: string;                 // IP address
  region?: string;            // Region/state code
  city?: string;              // City name
  latitude?: number;          // Latitude
  longitude?: number;         // Longitude
  timezone?: string;          // Timezone
}

/**
 * Cached geo info with timestamp
 */
export interface CachedGeoInfo extends GeoInfo {
  timestamp: number;          // Cache timestamp (epoch)
}
