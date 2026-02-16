/**
 * Timeout Middleware
 * Prevents requests from hanging indefinitely
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

/**
 * Request timeout configuration
 */
export interface TimeoutConfig {
  /** Timeout duration in milliseconds */
  timeoutMs: number;
  /** Custom message for timeout response */
  message?: string;
  /** Whether to log timeout errors */
  logErrors?: boolean;
}

// Default timeout: 30 seconds
const DEFAULT_TIMEOUT_MS = 30000;

// Track active requests
const activeRequests = new Map<string, NodeJS.Timeout>();

/**
 * Creates a timeout middleware with specified duration
 * @param config - Timeout configuration
 * @returns Express middleware
 */
export const createTimeoutMiddleware = (config?: TimeoutConfig) => {
  const timeoutMs = config?.timeoutMs || DEFAULT_TIMEOUT_MS;
  const message = config?.message || `Request timeout after ${timeoutMs}ms`;
  const logErrors = config?.logErrors !== false; // Default to true

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestId = req.headers['x-request-id'] as string || 'unknown';
    const startTime = Date.now();
    
    // Skip timeout for development (optional - remove in production)
    if (process.env.NODE_ENV === 'development' && !config) {
      logger.debug('Timeout skipped in development mode', {
        requestId,
        url: req.originalUrl
      });
      return next();
    }

    // Set up timeout
    const timeout = setTimeout(() => {
      const duration = Date.now() - startTime;
      
      if (logErrors) {
        logger.warn('Request timeout', {
          component: 'timeout',
          event: 'request_timeout',
          requestId,
          method: req.method,
          url: req.originalUrl,
          timeoutMs,
          duration
        });
      }

      // Clean up tracking
      activeRequests.delete(requestId);

      // Send timeout response
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          message: 'Request timeout. Please try again.',
          code: 'REQUEST_TIMEOUT',
          timeoutMs
        });
      }
    }, timeoutMs);

    // Store timeout reference
    activeRequests.set(requestId, timeout);

    // Clean up timeout when response finishes
    res.on('finish', () => {
      clearTimeout(timeout);
      activeRequests.delete(requestId);
      
      logger.debug('Timeout cleared', {
        component: 'timeout',
        event: 'timeout_cleared',
        requestId,
        method: req.method,
        url: req.originalUrl,
        duration: Date.now() - startTime
      });
    });

    res.on('error', () => {
      clearTimeout(timeout);
      activeRequests.delete(requestId);
    });

    res.on('close', () => {
      clearTimeout(timeout);
      activeRequests.delete(requestId);
    });

    next();
  };
};

/**
 * Default timeout middleware (30 seconds)
 */
export const timeoutMiddleware = createTimeoutMiddleware();

/**
 * Creates a timeout middleware for specific routes with custom duration
 * @param timeoutMs - Timeout in milliseconds
 * @returns Express middleware
 */
export const createRouteTimeout = (timeoutMs: number) => {
  return createTimeoutMiddleware({ timeoutMs });
};

/**
 * Database query timeout
 * Prevents database queries from hanging
 */
export const DATABASE_TIMEOUT_MS = 10000; // 10 seconds

export interface QueryOptions {
  timeoutMs?: number;
}

/**
 * Create a timeout promise for database queries
 * @param query - The query promise
 * @param timeoutMs - Timeout duration
 * @param description - Description for error message
 * @returns Query result or throws timeout error
 */
export async function withTimeout<T>(
  query: Promise<T>,
  timeoutMs: number = DATABASE_TIMEOUT_MS,
  description: string = 'Database query'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${description} timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([query, timeoutPromise]);
}

/**
 * Cleanup on server shutdown
 * Clears all active timeouts
 */
export const cleanupTimeouts = (): void => {
  const activeCount = activeRequests.size;
  
  activeRequests.forEach((timeout, requestId) => {
    clearTimeout(timeout);
    logger.debug('Cleared timeout on shutdown', {
      component: 'timeout',
      event: 'timeout_cleanup',
      requestId
    });
  });
  
  activeRequests.clear();
  
  if (activeCount > 0) {
    logger.info(`Cleared ${activeCount} active timeouts on shutdown`, {
      component: 'timeout',
      event: 'cleanup_complete'
    });
  }
};

/**
 * Monitor active request count
 * Useful for health checks and monitoring
 */
export const getActiveRequestCount = (): number => {
  return activeRequests.size;
};

/**
 * Get list of active requests (for debugging)
 */
export const getActiveRequests = (): string[] => {
  return Array.from(activeRequests.keys());
};

export default {
  createTimeoutMiddleware,
  timeoutMiddleware,
  createRouteTimeout,
  withTimeout,
  DATABASE_TIMEOUT_MS,
  cleanupTimeouts,
  getActiveRequestCount,
  getActiveRequests
};
