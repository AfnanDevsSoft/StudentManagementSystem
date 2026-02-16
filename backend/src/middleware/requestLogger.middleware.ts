import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../lib/logger';

/**
 * HTTP Request Logger Middleware
 * Logs all HTTP requests with structured data for monitoring and debugging
 */

// Store for request start times to calculate duration
const requestStartTime = new WeakMap<Request, number>();

/**
 * Generate unique request ID for distributed tracing
 */
export const generateRequestId = (): string => {
  return uuidv4();
};

/**
 * Request logger middleware
 * Logs incoming requests and responses
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate or get request ID from header
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  
  // Set request ID in headers for downstream services
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  // Store request start time
  requestStartTime.set(req, Date.now());
  
  // Log incoming request
  logger.info('Incoming request', {
    component: 'http',
    event: 'request_start',
    requestId,
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type')
  });

  // Override res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function(body: any): Response {
    // Calculate request duration
    const startTime = requestStartTime.get(req);
    const duration = startTime ? Date.now() - startTime : 0;
    
    // Log response
    logger.info('Response sent', {
      component: 'http',
      event: 'response_end',
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
      // Don't log sensitive data
      hasBody: !!body && typeof body === 'object'
    });

    return originalJson(body);
  };

  next();
};

/**
 * Error logger middleware
 * Logs errors with full context
 */
export const errorLogger = (error: any, req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string;
  const startTime = requestStartTime.get(req);
  const duration = startTime ? Date.now() - startTime : 0;
  
  logger.error('Request error', {
    component: 'http',
    event: 'request_error',
    requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode || 500,
    duration: `${duration}ms`,
    error: error.message,
    stack: error.stack,
    // Additional error context
    name: error.name,
    code: error.code
  });

  next(error);
};

/**
 * Slow request logger
 * Logs requests that take longer than threshold (1 second default)
 */
export const slowRequestLogger = (thresholdMs = 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    // Check after response is sent
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      if (duration > thresholdMs) {
        const requestId = req.headers['x-request-id'] as string;
        logger.warn('Slow request detected', {
          component: 'performance',
          event: 'slow_request',
          requestId,
          method: req.method,
          url: req.originalUrl,
          duration: `${duration}ms`,
          threshold: `${thresholdMs}ms`
        });
      }
    });
    
    next();
  };
};

/**
 * Authentication logger
 * Logs authentication-related events
 */
interface AuthLogData {
  userId?: string;
  username?: string;
  ip?: string;
  success: boolean;
  message: string;
  [key: string]: any;
}

export const logAuthEvent = (event: string, data: AuthLogData): void => {
  logger.info(`Auth: ${event}`, {
    component: 'authentication',
    event: `auth_${event.toLowerCase()}`,
    ...data
  });
};

/**
 * Request ID getter for use in services
 */
export const getRequestId = (req: Request): string | undefined => {
  return req.headers['x-request-id'] as string;
};

export default {
  requestLogger,
  errorLogger,
  slowRequestLogger,
  logAuthEvent,
  getRequestId,
  generateRequestId
};
