# Google Search MCP Server

> A Model Context Protocol (MCP) server for integrating Google Search capabilities into AI applications
>
> 🤖 **Native Claude Desktop integration** - Use Google Search directly in Claude!

---

**Language / 语言**: [English](README.md) | [中文](README.zh-CN.md)

---

## ⚠️ Disclaimer

**This project is for educational and research purposes only.** It is a personal tool designed to help developers integrate search capabilities into their AI applications. Users are responsible for ensuring their use complies with Google's Terms of Service and applicable laws and regulations.

**Important:**
- This is **NOT** an official Google product
- This is **NOT** affiliated with or endorsed by Google
- Respect Google's Terms of Service
- Use at your own risk

---

## Features

- ✅ **MCP Protocol Support** - Native Claude Desktop integration via Model Context Protocol
- ✅ **REST API** - Standard HTTP interface for web applications
- ✅ **Localized Search** - Geographic location-based search results
- ✅ **Session Management** - Cookie-based session persistence
- ✅ **Rate Limiting** - Built-in request throttling for responsible use
- ✅ **Smart Retry** - Automatic recovery with exponential backoff

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/CodeMK/google-search-mcp.git
cd google-search-mcp

# Install dependencies
npm install

# Install Playwright browser
npx playwright install chromium

# Copy environment config
cp .env.example .env

# Build the project
npm run build
```

### Choose Your Mode

This project supports **two modes** - choose based on your use case:

#### 🤖 MCP Server Mode (Recommended for Claude Desktop)

Perfect for AI-assisted development with Claude Desktop:

```bash
npm run start:mcp
```

Then configure Claude Desktop following the [MCP Setup Guide](#-claude-desktop-setup) below.

#### 🌐 REST API Mode (For Web Applications)

Traditional HTTP API for web applications:

```bash
npm start
```

Server runs on `http://localhost:3000/api/search`

---

## 🤖 Claude Desktop Setup

### Step 1: Find Config File

**Windows**:
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS**:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Step 2: Add Configuration

```json
{
  "mcpServers": {
    "google-search": {
      "command": "node",
      "args": ["D:\\google-search-mcp\\dist\\mcp-server.js"],
      "env": {
        "HEADLESS": "true",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**Important**: Replace `D:\\google-search-mcp` with your actual project path.

### Step 3: Restart Claude Desktop

Completely quit and restart Claude Desktop.

### Step 4: Test

In Claude Desktop, type:
```
Please use google_search to find "TypeScript tutorial"
```

---

## API Usage

### REST API Endpoint

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "TypeScript", "region": "US"}'
```

### MCP Tool (Claude Desktop)

Available as the `google_search` tool in Claude Desktop conversations.

**Request Parameters:**

| Param | Type | Required | Default | Description |
|:---|:---|:---:|:---|:---|
| query | string | ✅ | - | Search keyword |
| region | string | ❌ | auto | Country code (US, JP, GB, CN, etc.) |
| numResults | number | ❌ | 10 | Number of results |

**Response Example:**

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

## Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3000                    # REST API server port
HOST=0.0.0.0                 # Server host
LOG_LEVEL=info               # Log level

# Browser Configuration
HEADLESS=true                # Headless mode
DEVTOOLS=false               # Enable DevTools
SLOW_MO=0                    # Slow motion (ms)

# Search Configuration
DEFAULT_REGION=US            # Default region
MAX_RESULTS=10               # Max results per search
```

---

## Responsible Use

### Rate Limiting

To ensure respectful and responsible use:

- **Min Delay**: 15 seconds between requests
- **Max Delay**: 30 seconds between requests
- **Burst Limit**: Max 2 requests per 3 minutes

### Best Practices

1. **Respect robots.txt** - Follow website guidelines
2. **Limit request frequency** - Don't overload servers
3. **Use for legitimate purposes** - Educational and research only
4. **Comply with ToS** - Follow Google's Terms of Service

---

## Project Structure

```
google-search-mcp/
├── src/
│   ├── mcp-server.ts      # MCP server entry point ⭐ NEW
│   ├── index.ts           # REST API entry point
│   ├── api/               # REST API routes
│   ├── services/          # Core business logic
│   ├── engines/           # Browser automation
│   ├── utils/             # Utilities
│   └── config/            # Configuration
├── dist/                  # Compiled output
├── data/                  # Runtime data (cookies)
├── logs/                  # Application logs
└── scripts/               # Utility scripts
```

---

## Development

```bash
npm run dev          # REST API development mode
npm run dev:mcp      # MCP server development mode ⭐ NEW
npm run build        # Build TypeScript
npm run start        # Production REST API mode
npm run start:mcp    # Production MCP mode ⭐ NEW
npm run test         # Run tests
```

---

## Documentation

- 📘 **[MCP_GUIDE.md](MCP_GUIDE.md)** - Complete MCP setup and usage guide
- 🍪 **[COOKIES_GUIDE.md](COOKIES_GUIDE.md)** - CAPTCHA and cookie management
- 📝 **[DEV_GUIDE.md](DEV_GUIDE.md)** - Development guide

---

## Troubleshooting

### Claude Desktop Cannot Connect

1. ✅ Verify build: `npm run build`
2. ✅ Check config path in `claude_desktop_config.json`
3. ✅ Ensure dependencies installed: `npm install`
4. ✅ Restart Claude Desktop completely

### CAPTCHA Detected

1. Set `HEADLESS=false` in `.env`
2. Restart the server
3. Complete CAPTCHA manually in browser
4. Cookies will be saved for future use

### Connection Closed

- Wait 3-5 minutes before retrying
- System has automatic retry mechanism
- Check if burst limit was triggered

---

## Legal & Ethics

### Compliance

Users of this project must:

- ✅ Comply with Google's Terms of Service
- ✅ Follow applicable laws and regulations
- ✅ Respect website policies and guidelines
- ✅ Use only for legitimate educational purposes

### Prohibited Uses

- ❌ Commercial exploitation without permission
- ❌ Spam or abuse of services
- ❌ Violating intellectual property rights
- ❌ Bypassing security measures for malicious purposes

---

## License

MIT License - See [LICENSE](LICENSE) file for details

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## Acknowledgments

- Built with [Playwright](https://playwright.dev/)
- Implements [Model Context Protocol](https://modelcontextprotocol.io/)
- Inspired by the AI development community

---

## Resources

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Desktop Documentation](https://docs.anthropic.com/claude/docs/mcp)
- [Playwright Documentation](https://playwright.dev/)

---

**Note**: This is a personal project for learning purposes. It is not affiliated with, endorsed by, or sponsored by Google or any other company.
