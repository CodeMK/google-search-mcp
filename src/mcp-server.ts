/**
 * Search MCP Server
 * Model Context Protocol server for web search integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { searchEngine } from './services/search-engine';
import { SearchRequest } from './types';
import { logger } from './utils/logger';

/**
 * Create and start the MCP server
 */
async function main(): Promise<void> {
  // Create MCP server instance
  const server = new Server(
    {
      name: 'search-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register the Search tool
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'search',
          description:
            'Search the web and get results. Supports geographic localization and customizable result count.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search query string',
              },
              region: {
                type: 'string',
                description: 'Country code for localized search (e.g., US, JP, GB, CN). Defaults to auto-detect.',
                default: 'auto',
              },
              numResults: {
                type: 'number',
                description: 'Number of results to return (1-10). Defaults to 10.',
                default: 10,
                minimum: 1,
                maximum: 10,
              },
            },
            required: ['query'],
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'search') {
      try {
        const searchRequest: SearchRequest = {
          query: String(args?.query || ''),
          region: args?.region ? String(args.region) : undefined,
          numResults: args?.numResults ? Number(args.numResults) : undefined,
        };

        logger.info(`MCP: Received search request: "${searchRequest.query}"`, 'MCPServer');

        // Perform search
        const results = await searchEngine.search(searchRequest);

        // Format results for MCP response
        const formattedResults = results.results.map((result) => ({
          rank: result.rank,
          title: result.title,
          link: result.link,
          snippet: result.snippet || '',
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                query: searchRequest.query,
                region: results.meta.regionCode,
                regionName: results.meta.regionName,
                resultCount: results.meta.resultCount,
                latency: results.meta.latency,
                results: formattedResults,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        const err = error as Error;
        logger.error(`MCP: Search failed: ${err.message}`, 'MCPServer');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: err.message,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Start the server using stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('Search MCP Server started and ready', 'MCPServer');
  logger.error('STDIO server running - waiting for MCP client messages...', 'MCPServer');
}

// Start the MCP server
main().catch((error) => {
  logger.error('Failed to start MCP server', 'MCPServer', { error });
  process.exit(1);
});
