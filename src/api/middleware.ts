/**
 * API Middleware
 * Request/response middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '../types/api';
import { logger } from '../utils/logger';

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url, ip } = req;
    const { statusCode } = res;

    logger.info(
      `${method} ${url} ${statusCode} - ${duration}ms`,
      'HTTP',
      { ip }
    );
  });

  next();
}

/**
 * Error handler middleware
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Unhandled error', 'Middleware', {
    error: err.message,
    stack: err.stack,
  });

  const errorResponse: ApiErrorResponse = {
    statusCode: 500,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      retryable: false,
    },
  };

  res.status(500).json(errorResponse);
}

/**
 * JSON body parser with validation
 */
export function jsonBodyParser(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (!req.is('application/json')) {
      const errorResponse: ApiErrorResponse = {
        statusCode: 400,
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Content-Type must be application/json',
          retryable: false,
        },
      };
      res.status(400).json(errorResponse);
      return;
    }
  }
  next();
}
