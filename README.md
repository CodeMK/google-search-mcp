# Google Search MCP

> 基于 Playwright 的 Google 搜索爬虫 - 支持地理位置本地化搜索

一个高仿真的浏览器自动化服务，通过控制真实浏览器访问 Google 搜索，获取本地化的搜索结果。

## 特性

- ✅ **本地化搜索** - 根据地理位置自动匹配 Google 域名
- ✅ **自动域名切换** - 支持 30+ 国家/地区的 Google 域名
- ✅ **智能弹窗处理** - 自动处理 Cookie 同意弹窗
- ✅ **验证码检测** - 自动检测 CAPTCHA 并记录
- ✅ **CAPTCHA 绕过** - 支持 Cookies 管理和自动保存/加载
- ✅ **人类行为模拟** - 随机延迟、鼠标移动、滚动等行为模拟
- ✅ **请求频率限制** - 自动控制请求频率，避免被检测
- ✅ **浏览器指纹优化** - 使用最新的 User-Agent 和反检测脚本
- ✅ **自动重试** - 失败自动重试，支持指数退避
- ✅ **REST API** - 标准化的 HTTP 接口
- ✅ **TypeScript** - 完整的类型定义

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- 操作系统: Linux, macOS, Windows

### 安装

```bash
# 1. 克隆项目
git clone <repository-url>
cd google-search-mcp

# 2. 安装依赖
npm install

# 3. 安装 Playwright 浏览器
npx playwright install chromium

# 4. 复制环境变量配置
cp .env.example .env

# 5. 启动服务
npm run dev
```

### 配置

编辑 `.env` 文件配置服务：

```bash
# 服务端口
PORT=3000

# 无头模式（生产环境建议 true，首次使用建议 false 手动解决 CAPTCHA）
HEADLESS=true

# 默认搜索地区
DEFAULT_REGION=US

# 最大返回结果数
MAX_RESULTS=10

# 日志级别: error, warn, info, debug
LOG_LEVEL=info
```

## 首次使用 - 获取 Google Cookies

**重要**: 首次使用需要手动解决一次 Google CAPTCHA 来获取有效的 Cookies。

### 方法 1：非 Headless 模式（推荐）

1. 修改 `.env` 文件：
   ```bash
   HEADLESS=false
   ```

2. 启动服务：
   ```bash
   npm start
   ```

3. 发送搜索请求：
   ```bash
   curl -X POST http://localhost:3000/api/search \
     -H "Content-Type: application/json" \
     -d '{"query": "test"}'
   ```

4. 浏览器会自动打开，**手动完成 Google 的验证码**

5. Cookies 会自动保存到 `data/cookies/` 目录

6. 改回 headless 模式：
   ```bash
   HEADLESS=true
   ```

### 方法 2：手动导入 Cookies

参考 [COOKIES_GUIDE.md](./COOKIES_GUIDE.md) 文件了解如何从真实浏览器导出 Cookies。

## 使用方法

### 启动服务

```bash
# 开发模式（带热重载）
npm run dev:watch

# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

### API 使用

#### 1. 执行搜索

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "TypeScript",
    "region": "JP",
    "numResults": 5
  }'
```

**请求参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| query | string | ✅ | - | 搜索关键词 |
| region | string | ❌ | auto | 国家代码 (US, JP, GB, etc.) |
| numResults | number | ❌ | 10 | 返回结果数量 |
| includeRawHtml | boolean | ❌ | false | 是否包含原始 HTML |

**响应示例：**

```json
{
  "statusCode": 200,
  "result": {
    "success": true,
    "meta": {
      "regionCode": "JP",
      "regionName": "Japan",
      "targetUrl": "https://www.google.co.jp/search?q=TypeScript",
      "latency": 3500,
      "timestamp": "2025-01-15T10:30:00Z",
      "resultCount": 5
    },
    "results": [
      {
        "rank": 1,
        "title": "TypeScript: JavaScript with syntax for types.",
        "link": "https://www.typescriptlang.org/",
        "displayUrl": "www.typescriptlang.org",
        "snippet": "TypeScript is a strongly typed programming language that builds on JavaScript..."
      }
    ]
  }
}
```

#### 2. 健康检查

```bash
curl http://localhost:3000/api/health
```

#### 3. 获取支持的国家列表

```bash
curl http://localhost:3000/api/countries
```

#### 4. 获取服务信息

```bash
curl http://localhost:3000/api/info
```

## 请求频率限制

为了避免被 Google 检测，API 自动应用以下频率限制：

- **最小延迟**: 8 秒
- **最大延迟**: 20 秒
- **突发限制**: 2 分钟内最多 3 个请求
- **随机化**: 每次请求之间的延迟是随机的，模拟真人行为

### 示例：连续请求的时间间隔

```
请求 1: 立即执行
请求 2: 等待 ~12 秒
请求 3: 等待 ~15 秒
请求 4: 触发突发限制，等待 ~2 分钟
请求 5: 等待 ~10 秒
```

## 项目结构

```
google-search-mcp/
├── src/
│   ├── api/              # API 层
│   │   ├── routes.ts     # 路由定义
│   │   ├── server.ts     # 服务器配置
│   │   └── middleware.ts # 中间件
│   │
│   ├── config/           # 配置模块
│   │   ├── index.ts      # 主配置
│   │   ├── domains.ts    # 域名映射
│   │   └── constants.ts  # 常量定义
│   │
│   ├── engines/          # 执行引擎
│   │   ├── cookie-handler.ts      # Cookie 弹窗处理
│   │   ├── captcha-detector.ts    # CAPTCHA 检测
│   │   └── html-extractor.ts      # HTML 结果提取
│   │
│   ├── services/         # 核心服务
│   │   ├── search-engine.ts       # 搜索引擎
│   │   └── geo-service.ts         # 地理位置服务
│   │
│   ├── types/            # 类型定义
│   ├── utils/            # 工具函数
│   │   ├── cookies-manager.ts     # Cookies 管理
│   │   ├── human-behavior.ts      # 人类行为模拟
│   │   ├── rate-limiter.ts        # 速率限制器
│   │   └── ...
│   └── index.ts          # 入口文件
│
├── data/cookies/         # Cookies 存储目录（自动生成）
├── logs/                 # 日志目录
├── scripts/              # 工具脚本
│   └── import-cookies.js # Cookies 导入脚本
├── .env.example          # 环境变量示例
├── COOKIES_GUIDE.md      # Cookies 使用指南
├── package.json
├── tsconfig.json
└── README.md
```

## 支持的地区

| 代码 | 国家/地区 | Google 域名 |
|:---|:---|:---|
| US | 美国 | google.com |
| JP | 日本 | google.co.jp |
| GB | 英国 | google.co.uk |
| DE | 德国 | google.de |
| FR | 法国 | google.fr |
| CN | 中国 | google.com |
| HK | 香港 | google.com.hk |
| TW | 台湾 | google.com.tw |
| KR | 韩国 | google.co.kr |
| ... | 更多 | 见 `/api/countries` |

## 开发

### 可用脚本

```bash
# 开发
npm run dev              # 启动开发服务器
npm run dev:watch        # 启动开发服务器（监听文件变化）

# 构建
npm run build            # 编译 TypeScript

# 测试
npm run test             # 运行测试
npm run test:watch       # 监听模式运行测试

# 代码质量
npm run lint             # 代码检查
npm run format           # 代码格式化
```

### 本地开发

1. 确保 `.env` 中 `HEADLESS=false` 可以看到浏览器运行
2. 设置 `LOG_LEVEL=debug` 查看详细日志
3. 设置 `SLOW_MO=100` 减慢操作速度便于观察

## 部署

### Docker 部署

```bash
# 1. 构建镜像
docker build -t google-search-mcp .

# 2. 运行容器
docker run -d \
  -p 3000:3000 \
  -e PORT=3000 \
  -e HEADLESS=true \
  --name google-search \
  google-search-mcp

# 3. 查看日志
docker logs -f google-search
```

### Docker Compose

```bash
docker-compose up -d
```

### 生产环境建议

1. **使用进程管理器** - PM2 或 systemd
2. **配置反向代理** - Nginx 或 Caddy
3. **启用日志文件** - `LOG_FILE_ENABLED=true`
4. **设置监控** - 使用监控工具跟踪服务状态
5. **定期更新 Cookies** - 确保 Cookies 有效性

## 故障排除

### 问题：浏览器启动失败

```bash
# 重新安装 Playwright 浏览器
npx playwright install chromium
```

### 问题：搜索结果为空

- 检查网络连接
- 尝试不同的地区代码
- 查看日志中的错误信息
- 检查 HTML 选择器是否需要更新

### 问题：触发 CAPTCHA

**解决方案**：

1. 检查 `logs/` 目录下的验证码截图
2. 降低请求频率（已自动限制）
3. 使用非 headless 模式手动解决一次验证码
4. 确保使用了有效的 Google Cookies

### 问题：Cookies 无效

- 从真实浏览器重新导出 Cookies
- 确保 Cookies 未过期（建议 7 天内）
- 检查 Cookies 是否包含 Google SID 和 NID

### 问题：连接被关闭（ERR_CONNECTION_CLOSED）

- 说明请求频率过高，等待 3-5 分钟后重试
- 检查是否触发了突发限制（2 分钟内超过 3 个请求）
- 考虑使用代理 IP（未来功能）

## 限制与注意事项

⚠️ **重要提示：**

1. **合法使用** - 仅用于研究和个人学习，遵守 Google 服务条款
2. **请求频率** - 避免高频请求，可能导致 IP 限制（已自动限制 8-20 秒）
3. **验证码** - Google 可能返回 CAPTCHA，需要人工处理一次获取 Cookies
4. **资源占用** - 每次搜索约需 200-500MB 内存
5. **Cookies 有效期** - Cookies 通常有效 7-30 天，建议定期更新
6. **中国大陆用户** - 建议使用代理以避免严格的检测

## 反爬虫机制说明

本项目实现了多种反检测机制：

1. **Cookies 管理** - 使用真实浏览器的 Cookies
2. **浏览器指纹优化** - 使用最新的 Chrome User-Agent
3. **反检测脚本** - 隐藏 webdriver 属性，模拟真实浏览器
4. **人类行为模拟** - 随机延迟、鼠标移动、页面滚动
5. **请求频率限制** - 自动控制请求间隔

但 Google 的反爬虫机制在不断更新，可能需要：
- 定期更新 User-Agent
- 重新获取 Cookies
- 调整请求频率
- 使用代理 IP

## 路线图

### Phase 1: MVP ✅ (已完成)

- [x] 基础搜索功能
- [x] 地理位置检测
- [x] Cookie 弹窗处理
- [x] 验证码检测
- [x] CAPTCHA 绕过（Cookies）
- [x] 人类行为模拟
- [x] 请求频率限制
- [x] REST API

### Phase 2: 高可用性 (规划中)

- [ ] 代理 IP 池管理
- [ ] 浏览器实例池
- [ ] 队列系统
- [ ] 健康检查

### Phase 3: 优化完善 (规划中)

- [ ] 性能优化
- [ ] 缓存机制
- [ ] 分布式部署
- [ ] 自动更新 User-Agent

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 相关文档

- [开发文档](./DEV_GUIDE.md) - 详细的开发指南
- [Cookies 使用指南](./COOKIES_GUIDE.md) - 如何获取和管理 Cookies
- [产品需求文档](./prd.md) - PRD 文档

---

**注意**: 本项目仅用于学习和研究目的。使用时请遵守 Google 的服务条款和相关法律法规。
