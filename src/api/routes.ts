/**
 * API Routes
 * HTTP endpoints for the search service
 */

import { Router, Request, Response } from 'express';
import { SearchRequest, SearchResponse } from '../types';
import { ApiResponse, ApiErrorResponse } from '../types/api';
import { searchEngine } from '../services/search-engine';
import { logger } from '../utils/logger';
import { HTTP_STATUS } from '../config/constants';

const router = Router;

/**
 * Create API routes
 */
export function createRoutes(): Router {
  const api = router();

  /**
   * POST /api/search
   * Execute a Google search
   */
  api.post('/search', async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    try {
      // Parse request
      const searchRequest: SearchRequest = req.body;

      // Validate
      if (!searchRequest.query || searchRequest.query.trim().length === 0) {
        const errorResponse: ApiErrorResponse = {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          error: {
            code: 'INVALID_QUERY',
            message: 'Query parameter is required',
            retryable: false,
          },
        };
        res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse);
        return;
      }

      logger.info(
        `API request: search="${searchRequest.query}" region=${searchRequest.region || 'auto'}`,
        'API'
      );

      // Execute search
      const response = await searchEngine.search(searchRequest);

      // Wrap in standard format
      const apiResponse: ApiResponse<SearchResponse> = {
        statusCode: HTTP_STATUS.OK,
        result: response,
      };

      res.status(HTTP_STATUS.OK).json(apiResponse);
    } catch (error) {
      const err = error as Error;
      logger.error(`API error: ${err.message}`, 'API', { error: err });

      // Determine error type
      const isRetryable = err.message.includes('CAPTCHA') ||
                         err.message.includes('Timeout') ||
                         err.message.includes('Network');

      const statusCode = isRetryable
        ? HTTP_STATUS.SERVICE_UNAVAILABLE
        : HTTP_STATUS.INTERNAL_ERROR;

      const errorResponse: ApiErrorResponse = {
        statusCode,
        error: {
          code: err.message.split(' ')[0] || 'SEARCH_ERROR',
          message: err.message,
          retryable: isRetryable,
        },
      };

      res.status(statusCode).json(errorResponse);
    } finally {
      const duration = Date.now() - startTime;
      logger.debug(`Request completed in ${duration}ms`, 'API');
    }
  });

  /**
   * GET /api/health
   * Health check endpoint
   */
  api.get('/health', (_req: Request, res: Response) => {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };

    const apiResponse: ApiResponse<typeof healthData> = {
      statusCode: HTTP_STATUS.OK,
      result: healthData,
    };

    res.status(HTTP_STATUS.OK).json(apiResponse);
  });

  /**
   * GET /api/countries
   * Get list of supported countries
   */
  api.get('/countries', (_req: Request, res: Response) => {
    const { getCountryList } = require('../config/domains');
    const countries = getCountryList();

    const countriesData = {
      countries,
      count: countries.length,
    };

    const apiResponse: ApiResponse<typeof countriesData> = {
      statusCode: HTTP_STATUS.OK,
      result: countriesData,
    };

    res.status(HTTP_STATUS.OK).json(apiResponse);
  });

  /**
   * GET /api/info
   * Get service information
   */
  api.get('/info', (_req: Request, res: Response) => {
    const { config } = require('../config');
    const { getSupportedCountries } = require('../config/domains');

    const infoData = {
      name: 'Google Search MCP',
      version: '1.0.0',
      description: 'Google Search Scraper with Playwright',
      features: [
        'Localized search based on geographic location',
        'Automatic domain matching',
        'Cookie consent handling',
        'CAPTCHA detection',
        'Retry mechanism',
      ],
      supportedCountries: getSupportedCountries().length,
      defaultRegion: config.search.defaultRegion,
      maxResults: config.search.maxResults,
    };

    const apiResponse: ApiResponse<typeof infoData> = {
      statusCode: HTTP_STATUS.OK,
      result: infoData,
    };

    res.status(HTTP_STATUS.OK).json(apiResponse);
  });

  return api;
}
