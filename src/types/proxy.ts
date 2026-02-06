/**
 * Proxy-related type definitions
 */

/**
 * Proxy configuration
 */
export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  protocol: 'http' | 'https' | 'socks5';
}

/**
 * Proxy information with health status
 */
export interface ProxyInfo extends ProxyConfig {
  countryCode?: string;       // Country code of the proxy
  lastCheckTime?: Date;       // Last health check time
  isHealthy?: boolean;        // Health status
  responseTime?: number;      // Response time in milliseconds
}

/**
 * Proxy pool state
 */
export interface ProxyPool {
  available: ProxyInfo[];     // Available proxies
  inUse: Set<string>;         // Currently in use
  blackList: Set<string>;     // Blacklisted proxies
}
