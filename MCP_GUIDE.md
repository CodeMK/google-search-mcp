# Search MCP - 使用指南

## 🎯 什么是 MCP 服务器？

MCP (Model Context Protocol) 是一个开放协议，允许 AI 应用程序（如 Claude Desktop）与外部工具和数据源进行通信。

本项目现在提供两种运行模式：
1. **REST API 模式** - HTTP 接口，适合 Web 应用
2. **MCP 服务器模式** - stdio 接口，适合 Claude Desktop

---

## 📦 安装和编译

```bash
# 克隆仓库
git clone https://github.com/CodeMK/search-mcp.git
cd search-mcp

# 安装依赖
npm install

# 编译 TypeScript
npm run build
```

---

## 🔧 配置 Claude Desktop

### 步骤 1: 找到 Claude Desktop 配置文件

**Windows**:
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS**:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### 步骤 2: 添加 MCP 服务器配置

打开配置文件，添加以下内容：

```json
{
  "mcpServers": {
    "search": {
      "command": "search-mcp",
      "args": ["mcp"],
      "env": {
        "HEADLESS": "true",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**重要**:
- 将 `D:\\search-mcp` 替换为你的实际项目路径
- Windows 使用双反斜杠 `\\`
- macOS/Linux 使用正斜杠 `/`

### 步骤 3: 重启 Claude Desktop

完全退出 Claude Desktop，然后重新启动。

---

## ✅ 验证 MCP 服务器

### 在 Claude Desktop 中验证

1. 打开 Claude Desktop
2. 在聊天框中输入：

```
请使用 search 工具搜索 "TypeScript tutorial"
```

3. Claude 会调用 MCP 服务器的 `search` 工具
4. 你应该看到搜索结果返回

---

## 🛠️ 可用工具

### search

搜索网络并返回结果。

**参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| query | string | ✅ | 搜索关键词 |
| region | string | ❌ | 国家代码 (US, JP, GB, CN 等)，默认自动检测 |
| numResults | number | ❌ | 返回结果数 (1-10)，默认 10 |

**示例**:

```
使用 search 搜索 "AI 编程工具"，返回 5 个结果
```

---

## 🧪 本地测试（可选）

如果你想在不使用 Claude Desktop 的情况下测试 MCP 服务器：

```bash
# 运行 MCP 服务器（从 npm）
search-mcp mcp

# 或从源码运行
npm run start:mcp
```

服务器会启动并等待 stdio 输入。这主要用于调试，实际使用时应该通过 Claude Desktop 调用。

---

## 📊 两种模式对比

### REST API 模式

```bash
search-mcp start
# 或
npm start
# 服务器运行在 http://localhost:3000
```

**适用场景**:
- ✅ Web 应用集成
- ✅ 编程方式调用
- ✅ 需要远程访问

### MCP 服务器模式

```bash
search-mcp mcp
# 或
npm run start:mcp
# 通过 stdio 与 Claude Desktop 通信
```

**适用场景**:
- ✅ Claude Desktop 集成
- ✅ AI 辅助编程
- ✅ 本地开发

---

## 🔍 故障排除

### Claude Desktop 无法连接 MCP 服务器

**检查清单**:

1. ✅ 确认项目已编译: `npm run build`
2. ✅ 确认路径正确: 检查 `claude_desktop_config.json` 中的路径
3. ✅ 确认依赖已安装: `npm install`
4. ✅ 查看日志文件: `logs/` 目录
5. ✅ 重启 Claude Desktop

### 工具调用失败

**可能原因**:
- 首次使用需要手动解决验证码
- 速率限制触发（等待 3-5 分钟）
- 连接被关闭（等待后重试）

**解决方案**:
1. 临时设置 `HEADLESS=false`
2. 手动完成验证码
3. Cookies 会自动保存

---

## 📝 开发模式

### 开发 REST API
```bash
npm run dev
```

### 开发 MCP 服务器
```bash
npm run dev:mcp
```

---

## 🎓 更多信息

- [MCP 协议规范](https://modelcontextprotocol.io/)
- [Claude Desktop 文档](https://docs.anthropic.com/claude/docs/mcp)
- [项目 GitHub](https://github.com/codemk/search-mcp)

---

## ⚠️ 重要提示

- 首次使用可能需要手动解决验证码
- **请遵守 [Google 服务条款](https://policies.google.com/terms)**
- **请尊重 [Google 自动查询指南](https://support.google.com/websearch/answer/86640)**
- 仅供教育和研究目的
- 不要过度频繁请求（已内置速率限制）
