# Google Search MCP / Google 搜索爬虫

> 基于 Playwright 的 Google 搜索爬虫 - 支持地理位置本地化搜索
>
> A Google search scraper based on Playwright - supports localized search by geographic location

---

## 功能 / Features

- ✅ **本地化搜索** - 根据地理位置自动匹配 Google 域名 / Localized search - Auto-matches Google domains by location
- ✅ **CAPTCHA 绕过** - Cookies 管理，自动保存/加载 / CAPTCHA bypass - Cookie management with auto-save/load
- ✅ **人类行为模拟** - 随机延迟、鼠标移动、滚动 / Human behavior simulation - Random delays, mouse movement, scrolling
- ✅ **请求频率限制** - 自动控制请求频率，避免被检测 / Rate limiting - Auto-controlled request frequency to avoid detection
- ✅ **智能重试** - 连接失败自动恢复 / Smart retry - Auto-recovery on connection failures
- ✅ **REST API** - 标准化的 HTTP 接口 / Standard HTTP API

---

## 快速开始 / Quick Start

### 安装 / Installation

```bash
# Clone repository / 克隆仓库
git clone <repository-url>
cd google-search-mcp

# Install dependencies / 安装依赖
npm install

# Install Playwright browser / 安装 Playwright 浏览器
npx playwright install chromium

# Copy environment config / 复制环境变量配置
cp .env.example .env

# Start server / 启动服务
npm start
```

### 首次使用 / First Time Use

**重要 / Important**: 首次使用需要手动解决一次 Google CAPTCHA / First time use requires manually solving Google CAPTCHA once.

1. 修改 `.env` 文件 / Edit `.env` file:
   ```bash
   HEADLESS=false  # Set to false to solve CAPTCHA manually / 设为 false 手动解决验证码
   ```

2. 启动服务并搜索 / Start service and search:
   ```bash
   npm start
   curl -X POST http://localhost:3000/api/search \
     -H "Content-Type: application/json" \
     -d '{"query": "test"}'
   ```

3. 浏览器会自动打开，手动完成验证码 / Browser opens automatically, complete CAPTCHA manually

4. Cookies 自动保存，改回 headless 模式 / Cookies auto-saved, switch back to headless mode:
   ```bash
   HEADLESS=true
   ```

---

## API 使用 / API Usage

### 执行搜索 / Execute Search

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "TypeScript", "region": "US"}'
```

**请求参数 / Request Parameters:**

| 参数 / Param | 类型 / Type | 必填 / Required | 默认 / Default | 说明 / Description |
|:---|:---|:---:|:---|:---|
| query | string | ✅ | - | 搜索关键词 / Search query |
| region | string | ❌ | auto | 国家代码 / Country code (US, JP, GB, etc.) |
| numResults | number | ❌ | 10 | 返回结果数 / Result count |

**响应示例 / Response Example:**

```json
{
  "statusCode": 200,
  "result": {
    "success": true,
    "meta": {
      "regionCode": "US",
      "resultCount": 5
    },
    "results": [
      {
        "rank": 1,
        "title": "TypeScript: JavaScript with syntax for types.",
        "link": "https://www.typescriptlang.org/",
        "snippet": "TypeScript is a strongly typed programming language..."
      }
    ]
  }
}
```

---

## 重要说明 / Important Notes

### 请求频率限制 / Rate Limiting

为了避免被 Google 检测 / To avoid detection by Google:
- **最小延迟 / Min delay**: 15 秒 / seconds
- **最大延迟 / Max delay**: 30 秒 / seconds
- **突发限制 / Burst limit**: 3 分钟内最多 2 个请求 / Max 2 requests per 3 minutes

### 故障排除 / Troubleshooting

**问题 / Issue**: 连接被关闭 / Connection closed

**解决方案 / Solution**:
- 等待 3-5 分钟后重试 / Wait 3-5 minutes before retry
- 系统会自动重试 / System auto-retries
- 检查是否触发了突发限制 / Check if burst limit was triggered

**问题 / Issue**: 搜索结果为空 / Empty search results

- HTML 选择器可能需要更新 / HTML selectors may need updates
- 检查日志中的错误信息 / Check error messages in logs

---

## 配置 / Configuration

`.env` 文件 / File:

```bash
PORT=3000                    # 服务端口 / Server port
HEADLESS=true                # 无头模式 / Headless mode
DEFAULT_REGION=US            # 默认地区 / Default region
MAX_RESULTS=10               # 最大结果数 / Max results
LOG_LEVEL=info               # 日志级别 / Log level
```

---

## 项目结构 / Project Structure

```
src/
├── api/              # API 层 / API layer
├── services/         # 核心服务 / Core services
├── engines/          # 执行引擎 / Execution engines
├── utils/            # 工具函数 / Utilities
│   ├── cookies-manager.ts     # Cookies 管理 / Cookie management
│   ├── human-behavior.ts      # 人类行为模拟 / Human behavior simulation
│   ├── rate-limiter.ts        # 速率限制器 / Rate limiter
│   └── smart-retry.ts         # 智能重试 / Smart retry
└── config/           # 配置 / Configuration
```

---

## 开发 / Development

```bash
npm run dev          # 开发模式 / Dev mode
npm run build        # 编译 / Build
npm run test         # 测试 / Test
```

---

## 许可证 / License

MIT License

---

**注意 / Note**: 本项目仅用于学习和研究目的 / This project is for learning and research purposes only.
