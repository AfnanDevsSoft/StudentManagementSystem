/**
 * Winston Logger Configuration
 * Production-ready logging with multiple transports and structured JSON
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Custom log format for structured JSON logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // Include error stack traces
  winston.format.json()
);

// Console format (colored, human-readable)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'sms-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error log file (errors only)
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true
    }),
    
    // Combined log file (all logs)
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true
    }),
    
    // Info log file (info level only)
    new winston.transports.File({
      filename: path.join(logsDir, 'info.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// Add console transport in non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug' // More verbose logging in development
  }));
}

// Request ID management for distributed tracing
const requestIdStore = new Map();

export const setRequestId = (req: any, requestId: string): void => {
  requestIdStore.set(req, requestId);
};

export const getRequestId = (req: any): string | undefined => {
  return requestIdStore.get(req);
};

// Custom logger methods with request context
export const createRequestLogger = (requestId: string, userId?: string) => {
  return {
    error: (message: string, meta?: any) => {
      logger.error(message, { requestId, userId, ...meta });
    },
    warn: (message: string, meta?: any) => {
      logger.warn(message, { requestId, userId, ...meta });
    },
    info: (message: string, meta?: any) => {
      logger.info(message, { requestId, userId, ...meta });
    },
    debug: (message: string, meta?: any) => {
      logger.debug(message, { requestId, userId, ...meta });
    },
    http: (message: string, meta?: any) => {
      logger.http(message, { requestId, userId, ...meta });
    }
  };
};

// Specialized loggers for different components
export const authLogger = {
  login: (userId: string, username: string, success: boolean, ip?: string) => {
    logger.info('User login', {
      component: 'authentication',
      userId,
      username,
      success,
      ip,
      event: 'login'
    });
  },
  
  logout: (userId: string, username: string) => {
    logger.info('User logout', {
      component: 'authentication',
      userId,
      username,
      event: 'logout'
    });
  },
  
  tokenRefresh: (userId: string, success: boolean) => {
    logger.info('Token refresh', {
      component: 'authentication',
      userId,
      success,
      event: 'token_refresh'
    });
  }
};

export const rbacLogger = {
  permissionCheck: (
    userId: string,
    username: string,
    permission: string,
    granted: boolean,
    resource?: string
  ) => {
    logger.info('Permission check', {
      component: 'rbac',
      userId,
      username,
      permission,
      granted,
      resource,
      event: 'permission_check'
    });
  }
};

export const cacheLogger = {
  hit: (key: string) => {
    logger.debug('Cache hit', {
      component: 'cache',
      key,
      event: 'cache_hit'
    });
  },
  
  miss: (key: string) => {
    logger.debug('Cache miss', {
      component: 'cache',
      key,
      event: 'cache_miss'
    });
  },
  
  set: (key: string, ttlSeconds: number) => {
    logger.debug('Cache set', {
      component: 'cache',
      key,
      ttlSeconds,
      event: 'cache_set'
    });
  },
  
  delete: (key: string) => {
    logger.debug('Cache delete', {
      component: 'cache',
      key,
      event: 'cache_delete'
    });
  }
};

// Graceful shutdown for logger
export const closeLogger = async (): Promise<void> => {
  return new Promise((resolve) => {
    logger.on('finish', () => {
      console.log('✅ Logger closed successfully');
      resolve();
    });
    logger.end();
  });
};

export default logger;
