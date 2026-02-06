# Google Search MCP Server

> A Model Context Protocol (MCP) server for integrating Google Search capabilities into AI applications

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

- ✅ **MCP Protocol Support** - Standard Model Context Protocol implementation
- ✅ **Localized Search** - Geographic location-based search results
- ✅ **Session Management** - Cookie-based session persistence
- ✅ **Rate Limiting** - Built-in request throttling for responsible use
- ✅ **REST API** - Standard HTTP interface for easy integration
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

# Start server
npm start
```

---

## API Usage

### Search Endpoint

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "TypeScript", "region": "US"}'
```

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
PORT=3000                    # Server port
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
│   ├── api/              # API routes and controllers
│   ├── services/         # Core business logic
│   ├── engines/          # Browser automation
│   ├── utils/            # Utilities and helpers
│   └── config/           # Configuration files
├── dist/                 # Compiled output
├── data/                 # Runtime data (cookies, cache)
└── logs/                 # Application logs
```

---

## Development

```bash
npm run dev          # Development mode
npm run build        # Build TypeScript
npm run start        # Production mode
npm run test         # Run tests
```

---

## Troubleshooting

### Issue: Connection Closed

**Solution:**
- Wait 3-5 minutes before retrying
- System has automatic retry
- Check if burst limit was triggered

### Issue: Empty Results

**Solution:**
- HTML selectors may need updates
- Check logs for error messages
- Try a different search query

### Issue: CAPTCHA Detected

**Solution:**
- Set `HEADLESS=false` in `.env`
- Complete CAPTCHA manually
- Cookies will be saved for future use

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
- Follows [Model Context Protocol](https://modelcontextprotocol.io/)
- Inspired by the AI development community

---

**Note**: This is a personal project for learning purposes. It is not affiliated with, endorsed by, or sponsored by Google or any other company.
