#!/usr/bin/env node

/**
 * Search MCP CLI
 * Command-line interface for the Search MCP server
 */

import { join } from 'path';
import { spawn } from 'child_process';

// Get the dist directory (CLI is compiled to dist/cli.js)
const distPath = join(__dirname);

// Get command from arguments
const command = process.argv[2];

function showHelp() {
  console.log(`
Search MCP Server - Web search integration for AI applications

Usage:
  search-mcp <command>

Commands:
  mcp       Start the MCP server (for Claude Desktop integration)
  start     Start the REST API server
  --version Show version number
  -h, --help Show this help message

Examples:
  search-mcp mcp      # Start MCP server for Claude Desktop
  search-mcp start    # Start REST API server on http://localhost:3000
  `);
}

function showVersion() {
  console.log('1.0.0');
}

switch (command) {
  case 'mcp': {
    const mcpServerPath = join(distPath, 'mcp-server.js');
    console.log('Starting Search MCP Server...');
    spawn('node', [mcpServerPath], { stdio: 'inherit' });
    break;
  }
  case 'start': {
    const apiServerPath = join(distPath, 'index.js');
    console.log('Starting Search MCP REST API Server...');
    spawn('node', [apiServerPath], { stdio: 'inherit' });
    break;
  }
  case '--version':
  case '-v':
    showVersion();
    break;
  case '-h':
  case '--help':
  case 'help':
    showHelp();
    break;
  default:
    if (!command) {
      showHelp();
    } else {
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
    }
}
