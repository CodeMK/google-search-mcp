# Google Search MCP 服务器

> 用于将 Google 搜索功能集成到 AI 应用程序的模型上下文协议 (MCP) 服务器

---

**Language / 语言**: [English](README.md) | [中文](README.zh-CN.md)

---

## ⚠️ 免责声明

**本项目仅供教育和研究目的使用。** 这是一个帮助开发者将搜索功能集成到 AI 应用程序的个人工具。用户有责任确保其使用符合 Google 的服务条款以及适用法律法规。

**重要提示:**
- 这**不是** Google 的官方产品
- 与 Google **无关联**，未获得认可
- 请遵守 Google 的服务条款
- 使用者需自行承担风险

---

## 功能特性

- ✅ **MCP 协议支持** - 标准的模型上下文协议实现
- ✅ **本地化搜索** - 基于地理位置的搜索结果
- ✅ **会话管理** - 基于 Cookie 的会话持久化
- ✅ **速率限制** - 内置请求节流，确保负责任地使用
- ✅ **REST API** - 标准的 HTTP 接口，易于集成
- ✅ **智能重试** - 指数退避的自动恢复机制

---

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装

```bash
# 克隆仓库
git clone https://github.com/CodeMK/google-search-mcp.git
cd google-search-mcp

# 安装依赖
npm install

# 安装 Playwright 浏览器
npx playwright install chromium

# 复制环境变量配置
cp .env.example .env

# 启动服务
npm start
```

---

## API 使用

### 搜索接口

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "TypeScript", "region": "US"}'
```

**请求参数:**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|:---|:---|:---:|:---|:---|
| query | string | ✅ | - | 搜索关键词 |
| region | string | ❌ | auto | 国家代码 (US, JP, GB, CN 等) |
| numResults | number | ❌ | 10 | 结果数量 |

**响应示例:**

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

## 配置

### 环境变量

```bash
# 服务器配置
PORT=3000                    # 服务端口
HOST=0.0.0.0                 # 服务主机
LOG_LEVEL=info               # 日志级别

# 浏览器配置
HEADLESS=true                # 无头模式
DEVTOOLS=false               # 启用开发工具
SLOW_MO=0                    # 慢动作延迟 (毫秒)

# 搜索配置
DEFAULT_REGION=US            # 默认地区
MAX_RESULTS=10               # 每次搜索最大结果数
```

---

## 负责任地使用

### 速率限制

为确保负责任地使用:

- **最小延迟**: 请求间隔 15 秒
- **最大延迟**: 请求间隔 30 秒
- **突发限制**: 3 分钟内最多 2 个请求

### 最佳实践

1. **尊重 robots.txt** - 遵守网站指南
2. **限制请求频率** - 不要使服务器过载
3. **合法目的使用** - 仅用于教育和研究
4. **遵守服务条款** - 遵守 Google 的服务条款

---

## 项目结构

```
google-search-mcp/
├── src/
│   ├── api/              # API 路由和控制器
│   ├── services/         # 核心业务逻辑
│   ├── engines/          # 浏览器自动化
│   ├── utils/            # 工具函数和辅助函数
│   └── config/           # 配置文件
├── dist/                 # 编译输出
├── data/                 # 运行时数据 (cookies, 缓存)
└── logs/                 # 应用日志
```

---

## 开发

```bash
npm run dev          # 开发模式
npm run build        # 编译 TypeScript
npm run start        # 生产模式
npm run test         # 运行测试
```

---

## 故障排除

### 问题: 连接被关闭

**解决方案:**
- 等待 3-5 分钟后重试
- 系统会自动重试
- 检查是否触发突发限制

### 问题: 搜索结果为空

**解决方案:**
- HTML 选择器可能需要更新
- 检查日志中的错误信息
- 尝试不同的搜索词

### 问题: 检测到验证码

**解决方案:**
- 在 `.env` 中设置 `HEADLESS=false`
- 手动完成验证码
- Cookies 将被保存供将来使用

---

## 法律与伦理

### 合规性

本项目用户必须:

- ✅ 遵守 Google 的服务条款
- ✅ 遵守适用法律法规
- ✅ 尊重网站政策和指南
- ✅ 仅用于合法的教育目的

### 禁止用途

- ❌ 未经许可的商业利用
- ❌ 垃圾信息或滥用服务
- ❌ 侵犯知识产权
- ❌ 为恶意目的绕过安全措施

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 贡献

欢迎贡献！请:

1. Fork 仓库
2. 创建功能分支
3. 进行更改
4. 提交 pull request

---

## 致谢

- 使用 [Playwright](https://playwright.dev/) 构建
- 遵循 [模型上下文协议](https://modelcontextprotocol.io/)
- 灵感来自 AI 开发社区

---

**注**: 这是用于学习目的的个人项目。与 Google 或任何其他公司无关联、未获认可或赞助。
