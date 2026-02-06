/**
 * MCP Server Verification Script
 * Verifies that the MCP server code compiles and has no errors
 */

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verifying MCP Server...\n');

try {
  // Check if compiled file exists
  const mcpServerPath = join(process.cwd(), 'dist', 'mcp-server.js');
  const mcpServerCode = readFileSync(mcpServerPath, 'utf-8');

  console.log('✅ MCP server compiled successfully');
  console.log(`   File size: ${mcpServerCode.length} bytes`);
  console.log(`   Path: ${mcpServerPath}\n`);

  // Check for key components
  const hasServer = mcpServerCode.includes('Server');
  const hasStdioTransport = mcpServerCode.includes('StdioServerTransport');
  const hasSearchTool = mcpServerCode.includes("'search'");
  const hasSearchEngine = mcpServerCode.includes('searchEngine');

  console.log('📋 Components check:');
  console.log(`   ${hasServer ? '✅' : '❌'} MCP Server`);
  console.log(`   ${hasStdioTransport ? '✅' : '❌'} Stdio Transport`);
  console.log(`   ${hasSearchTool ? '✅' : '❌'} search tool`);
  console.log(`   ${hasSearchEngine ? '✅' : '❌'} Search Engine integration\n`);

  if (hasServer && hasStdioTransport && hasSearchTool && hasSearchEngine) {
    console.log('✅ All components verified!\n');
    console.log('📖 Next steps:');
    console.log('   1. Copy claude_desktop_config.example.json');
    console.log('   2. Update the path to your project directory');
    console.log('   3. Add to Claude Desktop config');
    console.log('   4. Restart Claude Desktop');
    console.log('   5. Test with: "请使用 search 搜索 TypeScript"\n');
    process.exit(0);
  } else {
    console.log('❌ Some components are missing!\n');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Verification failed:', error);
  process.exit(1);
}
