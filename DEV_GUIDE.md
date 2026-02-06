# Google 搜索爬虫开发文档

| 文档版本 | V1.0 |
| :--- | :--- |
| **文档类型** | 开发实施指南 |
| **目标读者** | 研发人员 |

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈选型](#2-技术栈选型)
3. [项目结构设计](#3-项目结构设计)
4. [核心模块拆解](#4-核心模块拆解)
5. [数据流转设计](#5-数据流转设计)
6. [接口定义](#6-接口定义)
7. [开发阶段规划](#7-开发阶段规划)
8. [测试用例](#8-测试用例)

---

## 1. 项目概述

### 1.1 项目目标

构建一个基于 Playwright 的浏览器自动化服务，实现：
- 根据地理位置自动匹配 Google 域名
- 执行本地化搜索并返回结构化数据
- 支持多地区、高并发的搜索请求

### 1.2 核心价值

| 特性 | 说明 |
|:---|:---|
| **本地化精准** | 直接访问当地 Google 域名 + 当地代理 IP |
| **高可用性** | 自动重试、IP 切换、验证码检测 |
| **易集成** | 标准化 JSON 输出，支持 MCP/HTTP 调用 |

---

## 2. 技术栈选型

```
┌─────────────────────────────────────────────────────────────┐
│                         技术栈                                │
├─────────────────────────────────────────────────────────────┤
│  语言:        TypeScript / Node.js                          │
│  自动化:      Playwright (Chromium)                         │
│  HTTP 服务:   Express.js / Fastify                          │
│  队列:        Bull (Redis based)                            │
│  代理:        HTTP/HTTPS/SOCKS5 代理池                       │
│  部署:        Docker + Docker Compose                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 项目结构设计

```
google-search-mcp/
├── src/
│   ├── config/                    # 配置模块
│   │   ├── index.ts              # 配置入口
│   │   ├── domains.ts            # 域名映射字典
│   │   └── constants.ts          # 常量定义
│   │
│   ├── types/                     # 类型定义
│   │   ├── search.ts             # 搜索相关类型
│   │   ├── proxy.ts              # 代理相关类型
│   │   └── browser.ts            # 浏览器相关类型
│   │
│   ├── services/                  # 核心服务
│   │   ├── geo-service.ts        # 地理位置服务 [Phase 1]
│   │   ├── proxy-manager.ts      # 代理管理器 [Phase 2]
│   │   ├── browser-pool.ts       # 浏览器实例池 [Phase 2]
│   │   └── search-engine.ts      # 搜索执行引擎 [Phase 1]
│   │
│   ├── engines/                   # 执行引擎
│   │   ├── playwright-engine.ts  # Playwright 封装
│   │   ├── cookie-handler.ts     # Cookie 弹窗处理
│   │   ├── captcha-detector.ts   # 验证码检测
│   │   └── html-extractor.ts     # HTML 数据提取
│   │
│   ├── utils/                     # 工具函数
│   │   ├── retry.ts              # 重试机制
│   │   ├── logger.ts             # 日志工具
│   │   └── url-cleaner.ts        # URL 清洗
│   │
│   ├── api/                       # API 层
│   │   ├── routes.ts             # 路由定义
│   │   ├── handlers.ts           # 请求处理器
│   │   └── middleware.ts         # 中间件
│   │
│   ├── queue/                     # 队列系统
│   │   ├── queue-manager.ts      # 队列管理
│   │   └── job-processor.ts      # 任务处理器
│   │
│   └── index.ts                   # 服务入口
│
├── tests/                         # 测试
│   ├── unit/                     # 单元测试
│   └── integration/              # 集成测试
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 4. 核心模块拆解

### 4.1 配置模块 (config/)

**职责**: 管理域名映射、系统配置

#### 4.1.1 域名映射字典 (domains.ts)

```typescript
// src/config/domains.ts

export interface DomainMapping {
  countryCode: string;      // 国家代码: JP, US, HK
  domain: string;           // Google 域名: www.google.co.jp
  language: string;         // 默认语言: ja, en, zh
}

export const DOMAIN_MAP: Record<string, DomainMapping> = {
  US: { countryCode: 'US', domain: 'www.google.com', language: 'en' },
  HK: { countryCode: 'HK', domain: 'www.google.com.hk', language: 'zh-HK' },
  TW: { countryCode: 'TW', domain: 'www.google.com.tw', language: 'zh-TW' },
  JP: { countryCode: 'JP', domain: 'www.google.co.jp', language: 'ja' },
  KR: { countryCode: 'KR', domain: 'www.google.co.kr', language: 'ko' },
  GB: { countryCode: 'GB', domain: 'www.google.co.uk', language: 'en-GB' },
  DE: { countryCode: 'DE', domain: 'www.google.de', language: 'de' },
  FR: { countryCode: 'FR', domain: 'www.google.fr', language: 'fr' },
  // ... 更多国家
};

/**
 * 根据国家代码获取域名映射
 * @param countryCode 国家代码
 * @returns 域名映射，不存在则返回默认 US
 */
export function getDomainMapping(countryCode: string): DomainMapping {
  return DOMAIN_MAP[countryCode.toUpperCase()] || DOMAIN_MAP.US;
}

/**
 * 构建搜索 URL
 * @param query 搜索关键词
 * @param countryCode 国家代码
 * @returns 完整的搜索 URL
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
```

#### 4.1.2 系统配置 (index.ts)

```typescript
// src/config/index.ts

export interface AppConfig {
  // 浏览器配置
  browser: {
    headless: boolean;
    viewport: { width: number; height: number };
    userAgent: string;
    timeout: number;           // 页面加载超时 (ms)
    navigationTimeout: number; // 导航超时 (ms)
  };

  // 代理配置
  proxy: {
    enabled: boolean;
    pool: string[];            // 代理列表
    maxRetries: number;
    timeout: number;
  };

  // 浏览器池配置
  pool: {
    minInstances: number;      // 最小实例数
    maxInstances: number;      // 最大实例数
    instanceTimeout: number;   // 实例最大存活时间
    idleTimeout: number;       // 空闲超时
  };

  // 重试配置
  retry: {
    maxAttempts: number;
    backoffMs: number;
    retryableErrors: string[];
  };
}

export const config: AppConfig = {
  browser: {
    headless: true,
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timeout: 30000,
    navigationTimeout: 60000,
  },
  proxy: {
    enabled: true,
    pool: process.env.PROXY_LIST?.split(',') || [],
    maxRetries: 3,
    timeout: 10000,
  },
  pool: {
    minInstances: 2,
    maxInstances: 10,
    instanceTimeout: 300000,  // 5 分钟
    idleTimeout: 60000,       // 1 分钟
  },
  retry: {
    maxAttempts: 3,
    backoffMs: 1000,
    retryableErrors: ['Timeout', 'Network', 'CAPTCHA'],
  },
};
```

---

### 4.2 类型定义 (types/)

#### 4.2.1 搜索类型 (search.ts)

```typescript
// src/types/search.ts

export interface SearchRequest {
  query: string;              // 搜索关键词
  region?: string;            // 目标地区代码，默认自动检测
  numResults?: number;        // 返回结果数量，默认 10
}

export interface SearchResult {
  rank: number;               // 排名
  title: string;              // 标题
  link: string;               // 真实 URL (已清洗)
  displayUrl: string;         // 显示 URL
  snippet: string;            // 摘要
}

export interface SearchResponse {
  meta: ResponseMeta;
  results: SearchResult[];
  rawHtml?: string;           // 可选的原始 HTML
}

export interface ResponseMeta {
  regionCode: string;         // 实际使用的地区代码
  targetUrl: string;          // 访问的 URL
  usedProxy?: string;         // 使用的代理 (脱敏)
  latency: number;            // 耗时 (ms)
  timestamp: string;          // 时间戳
}
```

#### 4.2.2 代理类型 (proxy.ts)

```typescript
// src/types/proxy.ts

export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  protocol: 'http' | 'https' | 'socks5';
}

export interface ProxyInfo extends ProxyConfig {
  countryCode?: string;       // 代理所属国家
  lastCheckTime?: Date;       // 上次检查时间
  isHealthy?: boolean;        // 健康状态
}

export interface ProxyPool {
  available: ProxyInfo[];     // 可用代理
  inUse: Set<string>;         // 使用中
  blackList: Set<string>;     // 黑名单
}
```

#### 4.2.3 浏览器类型 (browser.ts)

```typescript
// src/types/browser.ts

import { Browser, BrowserContext, Page } from 'playwright';

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

export interface BrowserPool {
  instances: Map<string, BrowserInstance>;
  available: string[];
  maxInstances: number;
}
```

---

### 4.3 服务层 (services/)

#### 4.3.1 地理位置服务 (geo-service.ts) [Phase 1]

**职责**: 检测当前 IP 的地理位置

```typescript
// src/services/geo-service.ts

export interface GeoInfo {
  countryCode: string;
  countryName: string;
  ip: string;
}

export class GeoService {
  private cache: Map<string, GeoInfo> = new Map();
  private cacheTtl = 3600000; // 1 小时

  /**
   * 检测 IP 的地理位置
   * @param ip IP 地址，可选，默认检测当前出口 IP
   */
  async detectLocation(ip?: string): Promise<GeoInfo> {
    const cacheKey = ip || 'current';

    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached['timestamp'] < this.cacheTtl) {
      return cached;
    }

    // 调用 IP 定位 API (可使用 ipapi.co, ip-api.com 等)
    const response = await fetch(`https://ipapi.co/${ip || ''}/json/`);
    const data = await response.json();

    const geoInfo: GeoInfo = {
      countryCode: data.country_code,
      countryName: data.country_name,
      ip: data.ip,
    };

    // 更新缓存
    this.cache.set(cacheKey, { ...geoInfo, timestamp: Date.now() });

    return geoInfo;
  }

  /**
   * 检测代理 IP 的地理位置
   */
  async detectProxyLocation(proxy: ProxyConfig): Promise<GeoInfo> {
    // 通过代理发送请求检测
    const proxyUrl = `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
    // 实现略
    return this.detectLocation();
  }
}
```

---

#### 4.3.2 代理管理器 (proxy-manager.ts) [Phase 2]

**职责**: 管理代理池，包括健康检查、IP 轮换

```typescript
// src/services/proxy-manager.ts

export class ProxyManager {
  private pool: ProxyPool;
  private geoService: GeoService;

  constructor(proxyConfigs: ProxyConfig[]) {
    this.geoService = new GeoService();
    this.pool = {
      available: proxyConfigs.map(p => ({ ...p })),
      inUse: new Set(),
      blackList: new Set(),
    };
  }

  /**
   * 获取指定国家的代理
   * @param countryCode 国家代码
   */
  async acquireProxy(countryCode?: string): Promise<ProxyConfig | null> {
    // 筛选可用代理
    let candidates = this.pool.available.filter(p =>
      !this.pool.inUse.has(this.getKey(p)) &&
      !this.pool.blackList.has(this.getKey(p))
    );

    // 如果指定国家，优先匹配
    if (countryCode) {
      const matched = candidates.filter(p => p.countryCode === countryCode);
      if (matched.length > 0) {
        candidates = matched;
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    // 随机选择
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    this.pool.inUse.add(this.getKey(selected));

    return selected;
  }

  /**
   * 释放代理
   */
  releaseProxy(proxy: ProxyConfig): void {
    this.pool.inUse.delete(this.getKey(proxy));
  }

  /**
   * 将代理加入黑名单
   */
  blacklistProxy(proxy: ProxyConfig, reason: string): void {
    const key = this.getKey(proxy);
    this.pool.blackList.add(key);
    this.pool.inUse.delete(key);

    // 记录日志
    console.log(`Proxy ${key} blacklisted: ${reason}`);
  }

  /**
   * 健康检查
   */
  async healthCheck(proxy: ProxyConfig): Promise<boolean> {
    try {
      // 通过代理访问 Google
      // 实现略
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 批量健康检查 (定期执行)
   */
  async batchHealthCheck(): Promise<void> {
    const tasks = this.pool.available.map(async (proxy) => {
      const isHealthy = await this.healthCheck(proxy);
      if (!isHealthy) {
        this.blacklistProxy(proxy, 'health_check_failed');
      }
    });
    await Promise.all(tasks);
  }

  private getKey(proxy: ProxyConfig): string {
    return `${proxy.host}:${proxy.port}`;
  }
}
```

---

#### 4.3.3 浏览器实例池 (browser-pool.ts) [Phase 2]

**职责**: 管理 Playwright 实例的创建、复用、销毁

```typescript
// src/services/browser-pool.ts

export class BrowserPool {
  private pool: BrowserPool;
  private config: AppConfig['pool'];

  constructor(config: AppConfig['pool']) {
    this.config = config;
    this.pool = {
      instances: new Map(),
      available: [],
      maxInstances: config.maxInstances,
    };

    // 启动时创建最小实例数
    this.initialize();

    // 定期清理空闲实例
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * 初始化浏览器实例
   */
  private async initialize(): Promise<void> {
    for (let i = 0; i < this.config.minInstances; i++) {
      await this.createInstance();
    }
  }

  /**
   * 创建新的浏览器实例
   */
  private async createInstance(proxy?: ProxyConfig): Promise<BrowserInstance> {
    const id = `browser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const browser = await playwright.chromium.launch({
      headless: this.config.headless,
      proxy: proxy ? {
        server: `${proxy.protocol}://${proxy.host}:${proxy.port}`,
        username: proxy.username,
        password: proxy.password,
      } : undefined,
    });

    const context = await browser.newContext({
      viewport: this.config.viewport,
      userAgent: this.config.userAgent,
    });

    const page = await context.newPage();

    const instance: BrowserInstance = {
      id,
      browser,
      context,
      page,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      inUse: true,
      proxy: proxy ? `${proxy.host}:${proxy.port}` : undefined,
    };

    this.pool.instances.set(id, instance);

    return instance;
  }

  /**
   * 获取可用的浏览器实例
   */
  async acquire(proxy?: ProxyConfig): Promise<BrowserInstance> {
    // 尝试获取空闲实例
    const availableId = this.pool.available.shift();

    if (availableId) {
      const instance = this.pool.instances.get(availableId);
      if (instance) {
        instance.inUse = true;
        instance.lastUsedAt = new Date();
        return instance;
      }
    }

    // 没有空闲实例，创建新的
    if (this.pool.instances.size < this.pool.maxInstances) {
      return await this.createInstance(proxy);
    }

    // 等待有空闲实例
    return await this.waitForAvailable(proxy);
  }

  /**
   * 释放浏览器实例
   */
  release(instance: BrowserInstance): void {
    instance.inUse = false;
    instance.lastUsedAt = new Date();
    this.pool.available.push(instance.id);
  }

  /**
   * 销毁实例
   */
  private async destroyInstance(instance: BrowserInstance): Promise<void> {
    await instance.context.close();
    await instance.browser.close();
    this.pool.instances.delete(instance.id);

    const idx = this.pool.available.indexOf(instance.id);
    if (idx > -1) {
      this.pool.available.splice(idx, 1);
    }
  }

  /**
   * 清理超时实例
   */
  private async cleanup(): Promise<void> {
    const now = Date.now();

    for (const [id, instance] of this.pool.instances) {
      if (instance.inUse) continue;

      // 超时销毁
      if (now - instance.lastUsedAt.getTime() > this.config.instanceTimeout) {
        await this.destroyInstance(instance);
        continue;
      }

      // 维持最小实例数
      if (this.pool.instances.size > this.config.minInstances &&
          now - instance.lastUsedAt.getTime() > this.config.idleTimeout) {
        await this.destroyInstance(instance);
      }
    }
  }

  /**
   * 等待可用实例
   */
  private async waitForAvailable(proxy?: ProxyConfig): Promise<BrowserInstance> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const availableId = this.pool.available.shift();
        if (availableId) {
          clearInterval(interval);
          const instance = this.pool.instances.get(availableId);
          if (instance) {
            instance.inUse = true;
            resolve(instance);
          }
        }
      }, 100);
    });
  }

  /**
   * 关闭所有实例
   */
  async closeAll(): Promise<void> {
    const tasks = Array.from(this.pool.instances.values()).map(
      instance => this.destroyInstance(instance)
    );
    await Promise.all(tasks);
  }
}
```

---

#### 4.3.4 搜索执行引擎 (search-engine.ts) [Phase 1]

**职责**: 核心搜索逻辑编排

```typescript
// src/services/search-engine.ts

export class SearchEngine {
  private geoService: GeoService;
  private proxyManager: ProxyManager;
  private browserPool: BrowserPool;
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
    this.geoService = new GeoService();
    this.proxyManager = new ProxyManager(config.proxy.pool);
    this.browserPool = new BrowserPool(config.pool);
  }

  /**
   * 执行搜索
   */
  async search(request: SearchRequest): Promise<SearchResponse> {
    const startTime = Date.now();

    // 1. 确定目标地区
    const regionCode = request.region || await this.detectRegion();

    // 2. 获取代理
    const proxy = await this.proxyManager.acquireProxy(regionCode);

    // 3. 构建搜索 URL
    const targetUrl = buildSearchUrl(request.query, regionCode);

    // 4. 获取浏览器实例
    const browserInstance = await this.browserPool.acquire(proxy);

    try {
      // 5. 执行搜索
      const results = await this.executeSearch(
        browserInstance.page,
        targetUrl,
        request.query
      );

      // 6. 构建响应
      return {
        meta: {
          regionCode,
          targetUrl,
          usedProxy: proxy ? this.maskProxy(proxy) : undefined,
          latency: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
        results,
      };
    } finally {
      // 7. 释放资源
      this.browserPool.release(browserInstance);
      if (proxy) {
        this.proxyManager.releaseProxy(proxy);
      }
    }
  }

  /**
   * 检测当前地区
   */
  private async detectRegion(): Promise<string> {
    const geoInfo = await this.geoService.detectLocation();
    return geoInfo.countryCode;
  }

  /**
   * 执行页面搜索
   */
  private async executeSearch(
    page: Page,
    url: string,
    query: string
  ): Promise<SearchResult[]> {
    // 导航到搜索页
    await page.goto(url, { waitUntil: 'networkidle' });

    // 处理 Cookie 弹窗
    await this.handleCookieConsent(page);

    // 检测验证码
    if (await this.detectCaptcha(page)) {
      throw new Error('CAPTCHA_DETECTED');
    }

    // 等待搜索结果加载
    await page.waitForSelector('div#search', { timeout: this.config.browser.timeout });

    // 提取结果
    return await this.extractResults(page);
  }

  /**
   * 处理 Cookie 同意弹窗
   */
  private async handleCookieConsent(page: Page): Promise<void> {
    try {
      const acceptButton = await page.$('text=Accept all, text=I agree, button[aria-label="Accept"]');
      if (acceptButton) {
        await acceptButton.click();
        await page.waitForTimeout(500);
      }
    } catch {
      // 弹窗可能不存在，忽略错误
    }
  }

  /**
   * 检测验证码
   */
  private async detectCaptcha(page: Page): Promise<boolean> {
    const captchaIndicators = [
      'iframe[src*="recaptcha"]',
      'div[class*="captcha"]',
      'form[action*="captcha"]',
    ];

    for (const selector of captchaIndicators) {
      const element = await page.$(selector);
      if (element) return true;
    }

    return false;
  }

  /**
   * 提取搜索结果
   */
  private async extractResults(page: Page): Promise<SearchResult[]> {
    const results = await page.evaluate(() => {
      const items: SearchResult[] = [];

      // Google 搜索结果选择器
      const resultElements = document.querySelectorAll('div[data-hveid]');

      resultElements.forEach((element, index) => {
        const titleEl = element.querySelector('h3');
        const linkEl = element.querySelector('a');
        const snippetEl = element.querySelector('div[data-hveid] span');

        if (titleEl && linkEl) {
          items.push({
            rank: index + 1,
            title: titleEl.textContent || '',
            link: linkEl.href,
            displayUrl: linkEl.textContent || '',
            snippet: snippetEl?.textContent || '',
          });
        }
      });

      return items;
    });

    // 清洗 URL (去除 Google 跳转参数)
    return results.map(r => ({
      ...r,
      link: this.cleanUrl(r.link),
    }));
  }

  /**
   * 清洗 Google 跳转 URL
   */
  private cleanUrl(url: string): string {
    try {
      const parsed = new URL(url);

      // Google 跳转 URL 格式: https://www.google.com/url?url=<real_url>&...
      if (parsed.hostname.includes('google.com') && parsed.pathname === '/url') {
        const realUrl = parsed.searchParams.get('url');
        if (realUrl) return realUrl;
      }

      return url;
    } catch {
      return url;
    }
  }

  /**
   * 代理 IP 脱敏
   */
  private maskProxy(proxy: ProxyConfig): string {
    return `${proxy.host}:${proxy.port}`;
  }
}
```

---

### 4.4 引擎层 (engines/)

#### 4.4.1 Cookie 处理器

```typescript
// src/engines/cookie-handler.ts

export class CookieHandler {
  static async handle(page: Page): Promise<void> {
    const selectors = [
      'button:has-text("Accept all")',
      'button:has-text("I agree")',
      'button[aria-label="Accept"]',
      'div[role="button"]:has-text("Accept")',
    ];

    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          await page.waitForTimeout(500);
          return;
        }
      } catch {
        continue;
      }
    }
  }
}
```

#### 4.4.2 验证码检测器

```typescript
// src/engines/captcha-detector.ts

export class CaptchaDetector {
  private static readonly CAPTCHA_INDICATORS = [
    'iframe[src*="recaptcha"]',
    'div[id*="captcha"]',
    'div[class*="captcha"]',
    'form[action*="captcha"]',
    '[id*="recaptcha"]',
    '[class*="recaptcha"]',
    'text=I\'m not a robot',
    'text=unusual traffic',
  ];

  static async detect(page: Page): Promise<boolean> {
    for (const selector of this.CAPTCHA_INDICATORS) {
      const element = await page.$(selector);
      if (element) return true;
    }

    // 检查页面标题
    const title = await page.title();
    if (title.includes('CAPTCHA') || title.includes('Unusual traffic')) {
      return true;
    }

    return false;
  }

  static async getScreenshot(page: Page): Promise<Buffer> {
    return await page.screenshot({ fullPage: true });
  }
}
```

#### 4.4.3 HTML 提取器

```typescript
// src/engines/html-extractor.ts

export interface ExtractionOptions {
  includeScripts?: boolean;
  includeStyles?: boolean;
  extractMainContent?: boolean;
}

export class HtmlExtractor {
  static async extract(page: Page, options: ExtractionOptions = {}): Promise<string> {
    const html = await page.content();

    if (!options.extractMainContent) {
      return this.cleanHtml(html, options);
    }

    // 提取主要内容
    return await page.evaluate((opts) => {
      const searchResults = document.querySelector('#search');
      if (searchResults) {
        return searchResults.innerHTML;
      }
      return document.body.innerHTML;
    }, options);
  }

  private static cleanHtml(html: string, options: ExtractionOptions): string {
    let cleaned = html;

    if (!options.includeScripts) {
      cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    if (!options.includeStyles) {
      cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    }

    return cleaned;
  }
}
```

---

### 4.5 API 层 (api/)

#### 4.5.1 路由定义

```typescript
// src/api/routes.ts

import { Router } from 'express';

const router = Router();

/**
 * POST /api/search
 * 执行搜索
 */
router.post('/search', async (req, res) => {
  try {
    const request: SearchRequest = req.body;

    // 参数验证
    if (!request.query) {
      return res.status(400).json({ error: 'query is required' });
    }

    // 执行搜索
    const engine = new SearchEngine(config);
    const response = await engine.search(request);

    res.json(response);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/health
 * 健康检查
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /api/proxies/status
 * 代理池状态
 */
router.get('/proxies/status', async (req, res) => {
  // 返回代理池状态
  res.json({ /* ... */ });
});

export default router;
```

---

### 4.6 工具函数 (utils/)

#### 4.6.1 重试机制

```typescript
// src/utils/retry.ts

export interface RetryOptions {
  maxAttempts: number;
  backoffMs: number;
  retryableErrors: string[];
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 检查是否可重试
      const isRetryable = options.retryableErrors.some(e =>
        error.message.includes(e)
      );

      if (!isRetryable || attempt === options.maxAttempts) {
        throw error;
      }

      // 退避等待
      await new Promise(resolve =>
        setTimeout(resolve, options.backoffMs * attempt)
      );
    }
  }

  throw lastError;
}
```

---

## 5. 数据流转设计

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              数据流转图                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│   API    │────▶│  Queue   │────▶│  Engine  │
└──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                                          │
                              ┌──────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  1. 获取地区代码  │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  2. 匹配域名映射  │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  3. 获取代理 IP  │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  4. 获取浏览器    │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  5. 导航到 URL   │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  6. 处理弹窗     │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  7. 检测验证码   │
                    └────────┬────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
              ┌─────────┐         ┌─────────┐
              │  成功   │         │  失败   │
              └────┬────┘         └────┬────┘
                   │                   │
                   ▼                   ▼
          ┌─────────────────┐  ┌─────────────────┐
          │  8. 提取结果     │  │  9. 重试/报错   │
          └────────┬────────┘  └─────────────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ 10. 清洗数据     │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ 11. 封装响应     │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ 12. 释放资源     │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ 13. 返回结果     │
          └─────────────────┘
```

---

## 6. 接口定义

### 6.1 HTTP API

#### POST /api/search

**请求:**

```json
{
  "query": "keyword",
  "region": "JP",
  "numResults": 10
}
```

**响应:**

```json
{
  "meta": {
    "regionCode": "JP",
    "targetUrl": "https://www.google.co.jp/search?q=keyword",
    "usedProxy": "xxx.xxx.xxx.xxx:8080",
    "latency": 3500,
    "timestamp": "2025-01-15T10:30:00Z"
  },
  "results": [
    {
      "rank": 1,
      "title": "Example Title",
      "link": "https://example.com",
      "displayUrl": "example.com › path",
      "snippet": "Example description text..."
    }
  ]
}
```

**错误响应:**

```json
{
  "error": "CAPTCHA_DETECTED",
  "message": "CAPTCHA challenge detected",
  "retryable": false
}
```

### 6.2 MCP 接口 (可选)

```typescript
interface MCPServer {
  search_google(params: {
    query: string;
    region?: string;
  }): Promise<SearchResponse>;
}
```

---

## 7. 开发阶段规划

### Phase 1: MVP (最小可行产品) - 2-3 周

**目标**: 实现基础搜索功能

| 任务 | 描述 | 产出 |
|:---|:---|:---|
| 1.1 | 项目脚手架搭建 | 目录结构、TypeScript 配置 |
| 1.2 | 配置模块开发 | 域名映射、常量定义 |
| 1.3 | Playwright 集成 | 基础浏览器控制 |
| 1.4 | 搜索逻辑实现 | 导航、输入、结果提取 |
| 1.5 | Cookie 弹窗处理 | 自动点击同意 |
| 1.6 | HTTP API 搭建 | Express 基础接口 |
| 1.7 | 单元测试 | 核心逻辑覆盖 |

**验收标准:**
- [ ] 能够执行搜索并返回结果
- [ ] 支持指定地区代码
- [ ] 自动处理 Cookie 弹窗

---

### Phase 2: 高可用性 - 2-3 周

**目标**: 增强稳定性和可扩展性

| 任务 | 描述 | 产出 |
|:---|:---|:---|
| 2.1 | 代理池管理 | 代理获取、健康检查 |
| 2.2 | 浏览器实例池 | 实例复用、自动扩缩容 |
| 2.3 | 验证码检测 | 自动识别、告警 |
| 2.4 | 重试机制 | 指数退避、IP 切换 |
| 2.5 | 队列系统 | Bull 队列集成 |
| 2.6 | 监控日志 | 结构化日志、指标采集 |

**验收标准:**
- [ ] 支持并发请求
- [ ] 自动重试失败任务
- [ ] 浏览器实例复用

---

### Phase 3: 优化完善 - 1-2 周

**目标**: 性能优化、功能完善

| 任务 | 描述 | 产出 |
|:---|:---|:---|
| 3.1 | URL 清洗优化 | 处理各类跳转格式 |
| 3.2 | 结果提取增强 | 支持更多结果类型 |
| 3.3 | 性能优化 | 减少等待时间、资源优化 |
| 3.4 | Docker 化 | Dockerfile、docker-compose |
| 3.5 | 文档完善 | API 文档、部署文档 |

**验收标准:**
- [ ] Docker 一键部署
- [ ] API 文档完整
- [ ] 性能达标 (单次 < 5s)

---

### Phase 4: 高级特性 (可选)

| 功能 | 描述 |
|:---|:---|
| 分布式部署 | 多地区节点部署 |
| 结果缓存 | Redis 缓存热点查询 |
| 深度抓取 | 自动抓取目标网页正文 |
| 多搜索类型 | 图片、新闻、学术搜索 |

---

## 8. 测试用例

### 8.1 单元测试

```typescript
// tests/unit/domains.test.ts

describe('DomainMapping', () => {
  test('should return correct domain for JP', () => {
    const mapping = getDomainMapping('JP');
    expect(mapping.domain).toBe('www.google.co.jp');
  });

  test('should fallback to US for unknown country', () => {
    const mapping = getDomainMapping('UNKNOWN');
    expect(mapping.domain).toBe('www.google.com');
  });

  test('should build correct search URL', () => {
    const url = buildSearchUrl('test', 'JP');
    expect(url).toContain('google.co.jp');
    expect(url).toContain('q=test');
  });
});
```

### 8.2 集成测试

```typescript
// tests/integration/search.test.ts

describe('Search Integration', () => {
  test('should perform search and return results', async () => {
    const engine = new SearchEngine(config);
    const response = await engine.search({
      query: 'test',
      region: 'US',
    });

    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results[0]).toHaveProperty('title');
    expect(response.results[0]).toHaveProperty('link');
  });

  test('should handle cookie consent', async () => {
    // 测试弹窗处理
  });

  test('should detect captcha', async () => {
    // 测试验证码检测
  });
});
```

### 8.3 端到端测试

```bash
# 测试脚本

#!/bin/bash

# 1. 本地化测试
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test","region":"JP"}' | jq .

# 2. 并发测试
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/search \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"test $i\",\"region\":\"US\"}" &
done
wait

# 3. 错误恢复测试
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"","region":"US"}' | jq .
```

---

## 9. 部署指南

### 9.1 Dockerfile

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制代码
COPY . .

# 构建
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动
CMD ["node", "dist/index.js"]
```

### 9.2 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PROXY_LIST=${PROXY_LIST}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped
```

---

## 10. 附录

### 10.1 环境变量

| 变量 | 描述 | 默认值 |
|:---|:---|:---|
| `NODE_ENV` | 运行环境 | `development` |
| `PORT` | 服务端口 | `3000` |
| `PROXY_LIST` | 代理列表 (逗号分隔) | - |
| `REDIS_URL` | Redis 连接 | - |
| `HEADLESS` | 无头模式 | `true` |
| `LOG_LEVEL` | 日志级别 | `info` |

### 10.2 依赖清单

```json
{
  "dependencies": {
    "playwright": "^1.40.0",
    "express": "^4.18.0",
    "bull": "^4.12.0",
    "redis": "^4.6.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "typescript": "^5.3.0",
    "jest": "^29.7.0"
  }
}
```

---

**文档版本**: V1.0
**最后更新**: 2025-01-15
**维护者**: 开发团队
