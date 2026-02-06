/**
 * MCP Server Test Script
 * Simple test to verify MCP server functionality
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPServer(): Promise<void> {
  console.log('🚀 Starting MCP Server test...\n');

  // Spawn MCP server process
  const serverPath = join(__dirname, '..', 'dist', 'mcp-server.js');
  const serverProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  // Create client transport
  const transport = new StdioClientTransport({
    stderr: 'inherit',
  });

  try {
    // Connect transport to server process
    const client = new Client(
      {
        name: 'test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    // Manual connection to stdio
    await client.connect(transport);

    // Wait for connection
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Connected to MCP server\n');

    // List tools
    console.log('📋 Listing available tools...');
    const toolsResponse = await client.listTools();
    console.log('Available tools:', JSON.stringify(toolsResponse, null, 2));
    console.log('\n');

    // Call search tool
    console.log('🔍 Testing search tool...');
    const searchResponse = await client.callTool({
      name: 'search',
      arguments: {
        query: 'TypeScript tutorial',
        numResults: 3,
      },
    });

    console.log('Search result:');
    console.log(JSON.stringify(searchResponse, null, 2));
    console.log('\n');

    console.log('✅ MCP server test completed successfully!');

    // Cleanup
    await client.close();
    serverProcess.kill();

  } catch (error) {
    console.error('❌ Test failed:', error);
    serverProcess.kill();
    process.exit(1);
  }
}

// Run test
testMCPServer();
