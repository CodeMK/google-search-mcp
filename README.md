# Google Search MCP Server

> A Model Context Protocol (MCP) server for integrating Google Search capabilities into AI applications
>
> 用于将 Google 搜索功能集成到 AI 应用程序的模型上下文协议 (MCP) 服务器

---

## ⚠️ Disclaimer / 免责声明

**English**: This project is for educational and research purposes only. It is a personal tool designed to help developers integrate search capabilities into their AI applications. Users are responsible for ensuring their use complies with Google's Terms of Service and applicable laws and regulations.

**中文**: 本项目仅供教育和研究目的使用。这是一个帮助开发者将搜索功能集成到 AI 应用程序的个人工具。用户有责任确保其使用符合 Google 的服务条款以及适用法律法规。

**Important / 重要提示**:
- This is NOT an official Google product / 这不是 Google 的官方产品
- This is NOT affiliated with or endorsed by Google / 与 Google 无关联，未获得 Google 认可
- Respect Google's Terms of Service / 请遵守 Google 的服务条款
- Use at your own risk / 使用者需自行承担风险

---

## Features / 功能特性

- ✅ **MCP Protocol Support** - Standard Model Context Protocol implementation / MCP 协议支持
- ✅ **Localized Search** - Geographic location-based search results / 本地化搜索
- ✅ **Session Management** - Cookie-based session persistence / 会话管理
- ✅ **Rate Limiting** - Built-in request throttling for responsible use / 请求频率限制
- ✅ **REST API** - Standard HTTP interface for easy integration / REST API 接口
- ✅ **Smart Retry** - Automatic recovery with exponential backoff / 智能重试机制

---

## Quick Start / 快速开始

### Prerequisites / 前置要求

- Node.js 18+ / Node.js 18 或更高版本
- npm or yarn / npm 或 yarn 包管理器

### Installation / 安装

```bash
# Clone repository / 克隆仓库
git clone https://github.com/CodeMK/google-search-mcp.git
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

---

## API Usage / API 使用

### Search Endpoint / 搜索接口

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "TypeScript", "region": "US"}'
```

**Request Parameters / 请求参数:**

| 参数 / Param | 类型 / Type | 必填 / Required | 默认 / Default | 说明 / Description |
|:---|:---|:---:|:---|:---|
| query | string | ✅ | - | Search keyword / 搜索关键词 |
| region | string | ❌ | auto | Country code (US, JP, GB, CN, etc.) |
| numResults | number | ❌ | 10 | Number of results / 结果数量 |

**Response Example / 响应示例:**

```json
{
  "statusCode": 200,
  "result": {
    "success": true,
    "meta": {
      "regionCode": "US",
      "regionName": "United States",
      "resultCount": 5,
      "latency": 15000
    },
    "results": [
      {
        "rank": 1,
        "title": "TypeScript: JavaScript with syntax for types",
        "link": "https://www.typescriptlang.org/",
        "snippet": "TypeScript is a strongly typed programming language..."
      }
    ]
  }
}
```

---

## Configuration / 配置

### Environment Variables / 环境变量

```bash
# Server Configuration / 服务器配置
PORT=3000                    # Server port / 服务端口
HOST=0.0.0.0                 # Server host / 服务主机
LOG_LEVEL=info               # Log level / 日志级别

# Browser Configuration / 浏览器配置
HEADLESS=true                # Headless mode / 无头模式
DEVTOOLS=false               # Enable DevTools / 启用开发工具
SLOW_MO=0                    # Slow motion (ms) / 慢动作延迟

# Search Configuration / 搜索配置
DEFAULT_REGION=US            # Default region / 默认地区
MAX_RESULTS=10               # Max results per search / 最大结果数
```

---

## Responsible Use / 负责任地使用

### Rate Limiting / 速率限制

To ensure respectful and responsible use / 为确保负责任地使用:

- **Min Delay / 最小延迟**: 15 seconds between requests / 请求间隔
- **Max Delay / 最大延迟**: 30 seconds between requests / 请求间隔
- **Burst Limit / 突发限制**: Max 2 requests per 3 minutes / 3分钟内最多2个请求

### Best Practices / 最佳实践

1. **Respect robots.txt** - Follow website guidelines / 遵守网站指南
2. **Limit request frequency** - Don't overload servers / 限制请求频率
3. **Use for legitimate purposes** - Educational and research only / 仅用于合法目的
4. **Comply with ToS** - Follow Google's Terms of Service / 遵守 Google 服务条款

---

## Project Structure / 项目结构

```
google-search-mcp/
├── src/
│   ├── api/              # API routes and controllers / API 路由和控制器
│   ├── services/         # Core business logic / 核心业务逻辑
│   ├── engines/          # Browser automation / 浏览器自动化
│   ├── utils/            # Utilities and helpers / 工具函数
│   └── config/           # Configuration files / 配置文件
├── dist/                 # Compiled output / 编译输出
├── data/                 # Runtime data (cookies, cache) / 运行时数据
└── logs/                 # Application logs / 应用日志
```

---

## Development / 开发

```bash
npm run dev          # Development mode / 开发模式
npm run build        # Build TypeScript / 编译 TypeScript
npm run start        # Production mode / 生产模式
npm run test         # Run tests / 运行测试
```

---

## Troubleshooting / 故障排除

### Issue: Connection Closed / 连接被关闭

**Solution / 解决方案**:
- Wait 3-5 minutes before retrying / 等待 3-5 分钟后重试
- System has automatic retry / 系统会自动重试
- Check if burst limit was triggered / 检查是否触发突发限制

### Issue: Empty Results / 搜索结果为空

**Solution / 解决方案**:
- HTML selectors may need updates / HTML 选择器可能需要更新
- Check logs for error messages / 检查日志中的错误信息
- Try a different search query / 尝试不同的搜索词

### Issue: CAPTCHA Detected / 检测到验证码

**Solution / 解决方案**:
- Set `HEADLESS=false` in `.env` / 设置 `HEADLESS=false`
- Complete CAPTCHA manually / 手动完成验证码
- Cookies will be saved for future use / Cookies 将被保存供将来使用

---

## Legal & Ethics / 法律与伦理

### Compliance / 合规性

Users of this project must / 本项目用户必须:

- ✅ Comply with Google's Terms of Service / 遵守 Google 的服务条款
- ✅ Follow applicable laws and regulations / 遵守适用法律法规
- ✅ Respect website policies and guidelines / 尊重网站政策和指南
- ✅ Use only for legitimate educational purposes / 仅用于合法的教育目的

### Prohibited Uses / 禁止用途

- ❌ Commercial exploitation without permission / 未经许可的商业利用
- ❌ Spam or abuse of services / 垃圾信息或滥用服务
- ❌ Violating intellectual property rights / 侵犯知识产权
- ❌ Bypassing security measures for malicious purposes / 为恶意目的绕过安全措施

---

## License / 许可证

MIT License - See LICENSE file for details / 详见 LICENSE 文件

---

## Contributing / 贡献

Contributions are welcome! Please / 欢迎贡献！请:

1. Fork the repository / Fork 仓库
2. Create a feature branch / 创建功能分支
3. Make your changes / 进行更改
4. Submit a pull request / 提交 pull request

---

## Acknowledgments / 致谢

- Built with [Playwright](https://playwright.dev/) / 使用 Playwright 构建
- Follows [Model Context Protocol](https://modelcontextprotocol.io/) / 遵循 MCP 协议
- Inspired by the AI development community / 灵感来自 AI 开发社区

---

**Note / 注**: This is a personal project for learning purposes. It is not affiliated with, endorsed by, or sponsored by Google or any other company. / 这是用于学习目的的个人项目。与 Google 或任何其他公司无关联、未获认可或赞助。
