/**
 * Search MCP - Main Entry Point
 */

import { startServer } from './api/server';
import { logger } from './utils/logger';
import { searchEngine } from './services/search-engine';

async function main(): Promise<void> {
  try {
    logger.info('Starting Search MCP...', 'Main');

    // Start HTTP server
    await startServer();

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('Shutting down gracefully...', 'Main');
      await searchEngine.shutdown();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('Shutting down gracefully...', 'Main');
      await searchEngine.shutdown();
      process.exit(0);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', 'Main', { error });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', 'Main', { reason, promise });
    });

  } catch (error) {
    logger.error('Failed to start application', 'Main', { error });
    process.exit(1);
  }
}

// Start the application
main();
