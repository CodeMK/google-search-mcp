/**
 * Express Server
 * Main HTTP server setup
 */

import express, { Application } from 'express';
import cors from 'cors';
import { createRoutes } from './routes';
import { requestLogger, errorHandler } from './middleware';
import { config } from '../config';
import { logger } from '../utils/logger';

export function createServer(): Application {
  const app = express();

  // Basic middleware
  app.use(cors({ origin: '*' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Custom middleware
  app.use(requestLogger);

  // API routes
  app.use('/api', createRoutes());

  // Root endpoint
  app.get('/', (_req, res) => {
    const rootData = {
      name: 'Google Search MCP',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: 'GET /api/health',
        search: 'POST /api/search',
        countries: 'GET /api/countries',
        info: 'GET /api/info',
      },
      documentation: 'See DEV_GUIDE.md for API usage',
    };

    res.json({
      statusCode: 200,
      result: rootData,
    });
  });

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      statusCode: 404,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
        retryable: false,
      },
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the HTTP server
 */
export async function startServer(): Promise<void> {
  const app = createServer();

  return new Promise((resolve) => {
    const server = app.listen(config.server.port, config.server.host, () => {
      const address = server.address();
      const port = typeof address === 'string' ? address : address?.port;

      logger.info('=' .repeat(50), 'Server');
      logger.info('  Google Search MCP Server Started', 'Server');
      logger.info('=' .repeat(50), 'Server');
      logger.info(`  Port: ${port}`, 'Server');
      logger.info(`  Environment: ${process.env.NODE_ENV || 'development'}`, 'Server');
      logger.info(`  Headless: ${config.browser.headless}`, 'Server');
      logger.info(`  Default Region: ${config.search.defaultRegion}`, 'Server');
      logger.info('=' .repeat(50), 'Server');
      logger.info('', 'Server');
      logger.info('  Available endpoints:', 'Server');
      logger.info(`    http://localhost:${port}/api/health`, 'Server');
      logger.info(`    http://localhost:${port}/api/search`, 'Server');
      logger.info(`    http://localhost:${port}/api/countries`, 'Server');
      logger.info(`    http://localhost:${port}/api/info`, 'Server');
      logger.info('=' .repeat(50), 'Server');

      resolve();
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down...', 'Server');
      server.close(() => {
        logger.info('Server closed', 'Server');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down...', 'Server');
      server.close(() => {
        logger.info('Server closed', 'Server');
        process.exit(0);
      });
    });
  });
}
