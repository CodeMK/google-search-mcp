# Google Search MCP

> 基于 Playwright 的 Google 搜索爬虫 - 支持地理位置本地化搜索

一个高仿真的浏览器自动化服务，通过控制真实浏览器访问 Google 搜索，获取本地化的搜索结果。

## 特性

- ✅ **本地化搜索** - 根据地理位置自动匹配 Google 域名
- ✅ **自动域名切换** - 支持 30+ 国家/地区的 Google 域名
- ✅ **智能弹窗处理** - 自动处理 Cookie 同意弹窗
- ✅ **验证码检测** - 自动检测 CAPTCHA 并记录
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

# 无头模式（生产环境建议 true）
HEADLESS=true

# 默认搜索地区
DEFAULT_REGION=US

# 最大返回结果数
MAX_RESULTS=10

# 日志级别: error, warn, info, debug
LOG_LEVEL=info
```

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
│   │   ├── cookie-handler.ts
│   │   ├── captcha-detector.ts
│   │   └── html-extractor.ts
│   │
│   ├── services/         # 核心服务
│   │   ├── search-engine.ts
│   │   └── geo-service.ts
│   │
│   ├── types/            # 类型定义
│   ├── utils/            # 工具函数
│   └── index.ts          # 入口文件
│
├── tests/                # 测试文件
├── logs/                 # 日志目录
├── .env.example          # 环境变量示例
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
- 检查是否触发验证码

### 问题：触发 CAPTCHA

- 检查 `logs/` 目录下的验证码截图
- 降低请求频率
- 考虑使用代理 IP（Phase 2 功能）

## 限制与注意事项

⚠️ **重要提示：**

1. **合法使用** - 仅用于研究和个人学习，遵守 Google 服务条款
2. **请求频率** - 避免高频请求，可能导致 IP 限制
3. **验证码** - Google 可能返回 CAPTCHA，需要人工处理
4. **资源占用** - 每次搜索约需 200-500MB 内存

## 路线图

### Phase 1: MVP ✅ (当前版本)

- [x] 基础搜索功能
- [x] 地理位置检测
- [x] Cookie 弹窗处理
- [x] 验证码检测
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

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 相关文档

- [开发文档](./DEV_GUIDE.md) - 详细的开发指南
- [产品需求文档](./prd.md) - PRD 文档

---

**注意**: 本项目仅用于学习和研究目的。使用时请遵守 Google 的服务条款和相关法律法规。
