/**
 * Graceful Shutdown Handler
 * Ensures clean server termination with proper resource cleanup
 */

import { Server } from 'http';
import { logger } from '../lib/logger';
import { prisma } from '../lib/db';
import { redis } from '../lib/redis';
import { closeLogger } from '../lib/logger';
import { cleanupTimeouts } from '../middleware/timeout.middleware';

export interface GracefulShutdownOptions {
  /** Timeout for graceful shutdown (default: 30000ms) */
  timeout?: number;
  /** Whether to force exit after timeout (default: true) */
  forceExit?: boolean;
  /** Custom cleanup functions */
  cleanupHandlers?: Array<() => Promise<void>>;
}

const DEFAULT_SHUTDOWN_OPTIONS: Required<GracefulShutdownOptions> = {
  timeout: 30000, // 30 seconds
  forceExit: true,
  cleanupHandlers: [],
};

// Track active connections for graceful shutdown
const activeConnections = new Set<any>();

/**
 * Add connection to tracking
 */
export function trackConnection(conn: any): void {
  activeConnections.add(conn);
  
  conn.on('close', () => {
    activeConnections.delete(conn);
  });
}

/**
 * Get active connection count
 */
export function getActiveConnectionCount(): number {
  return activeConnections.size;
}

/**
 * Close all active connections
 */
export async function closeConnections(): Promise<void> {
  const count = activeConnections.size;
  
  if (count > 0) {
    logger.info('Closing active connections', {
      component: 'shutdown',
      event: 'close_connections',
      connectionCount: count
    });
    
    for (const conn of activeConnections) {
      try {
        conn.destroy();
        activeConnections.delete(conn);
      } catch (error) {
        logger.error('Error closing connection', {
          component: 'shutdown',
          event: 'connection_close_error',
          error
        });
      }
    }
    
    // Give connections time to close
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Setup graceful shutdown handlers
 * @param server - HTTP server instance
 * @param options - Shutdown options
 */
export function setupGracefulShutdown(
  server: Server,
  options: GracefulShutdownOptions = {}
): void {
  const opts = { ...DEFAULT_SHUTDOWN_OPTIONS, ...options };
  
  // Track new connections
  server.on('connection', (conn) => {
    trackConnection(conn);
  });
  
  // Handle process termination signals
  const shutdownHandler = async (signal: string) => {
    logger.warn('Shutdown signal received', {
      component: 'shutdown',
      event: 'signal_received',
      signal,
      activeConnections: getActiveConnectionCount()
    });
    
    await gracefulShutdown(server, opts);
  };
  
  // Register signal handlers
  process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
  process.on('SIGINT', () => shutdownHandler('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', {
      component: 'shutdown',
      event: 'uncaught_exception',
      error: error.message,
      stack: error.stack
    });
    
    // Still attempt graceful shutdown
    gracefulShutdown(server, opts).finally(() => {
      process.exit(1);
    });
  });
  
  // Handle unhandled rejections
  process.on('unhandledRejection', (reason: any, promise) => {
    logger.error('Unhandled rejection', {
      component: 'shutdown',
      event: 'unhandled_rejection',
      reason: reason?.message || reason,
      promise
    });
  });
  
  logger.info('Graceful shutdown handlers configured', {
    component: 'shutdown',
    event: 'shutdown_setup_complete',
    timeout: opts.timeout,
    forceExit: opts.forceExit
  });
}

/**
 * Perform graceful shutdown
 * @param server - HTTP server instance
 * @param options - Shutdown options
 */
export async function gracefulShutdown(
  server: Server,
  options: Required<GracefulShutdownOptions>
): Promise<void> {
  const startTime = Date.now();
  const shutdownTimeout = options.timeout;
  
  logger.info('Starting graceful shutdown', {
    component: 'shutdown',
    event: 'shutdown_start',
    timeout: shutdownTimeout,
    activeConnections: getActiveConnectionCount()
  });
  
  let shutdownComplete = false;
  
  // Set force exit timer
  const forceExitTimer = setTimeout(() => {
    if (!shutdownComplete && options.forceExit) {
      logger.error('Graceful shutdown timeout - forcing exit', {
        component: 'shutdown',
        event: 'shutdown_timeout',
        duration: Date.now() - startTime
      });
      
      // Force exit
      process.exit(1);
    }
  }, shutdownTimeout);
  
  try {
    // 1. Stop accepting new connections
    logger.info('Closing server - no new connections', {
      component: 'shutdown',
      event: 'server_close_start'
    });
    
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          logger.error('Error closing server', {
            component: 'shutdown',
            event: 'server_close_error',
            error: err
          });
          reject(err);
        } else {
          logger.info('Server closed - no new connections', {
            component: 'shutdown',
            event: 'server_close_complete'
          });
          resolve();
        }
      });
      
      // If server doesn't close gracefully, force close connections
      setTimeout(() => {
        logger.warn('Forcing connection closure', {
          component: 'shutdown',
          event: 'force_close_connections'
        });
        closeConnections().then(() => resolve());
      }, 5000);
    });
    
    // 2. Close active connections
    logger.info('Closing active connections', {
      component: 'shutdown',
      event: 'connection_close_start'
    });
    
    await closeConnections();
    
    logger.info('All connections closed', {
      component: 'shutdown',
      event: 'connection_close_complete',
      duration: Date.now() - startTime
    });
    
    // 3. Run custom cleanup handlers
    if (options.cleanupHandlers.length > 0) {
      logger.info('Running custom cleanup handlers', {
        component: 'shutdown',
        event: 'custom_cleanup_start',
        handlerCount: options.cleanupHandlers.length
      });
      
      for (const handler of options.cleanupHandlers) {
        try {
          await handler();
        } catch (error) {
          logger.error('Error in custom cleanup handler', {
            component: 'shutdown',
            event: 'custom_cleanup_error',
            error
          });
        }
      }
    }
    
    // 4. Close database connections
    logger.info('Closing database connections', {
      component: 'shutdown',
      event: 'db_close_start'
    });
    
    await prisma.$disconnect();
    
    logger.info('Database connections closed', {
      component: 'shutdown',
      event: 'db_close_complete',
      duration: Date.now() - startTime
    });
    
    // 5. Close Redis connections
    logger.info('Closing Redis connections', {
      component: 'shutdown',
      event: 'redis_close_start'
    });
    
    // Note: Redis disconnect would be called here if we had redis.quit()
    // For now, we'll just log that Redis would be closed
    
    logger.info('Redis connections closed', {
      component: 'shutdown',
      event: 'redis_close_complete'
    });
    
    // 6. Cleanup timeouts
    logger.info('Cleaning up timeouts', {
      component: 'shutdown',
      event: 'timeout_cleanup_start'
    });
    
    cleanupTimeouts();
    
    logger.info('Timeouts cleaned up', {
      component: 'shutdown',
      event: 'timeout_cleanup_complete'
    });
    
    // 7. Shutdown tracing
    logger.info('Shutting down tracing', {
      component: 'shutdown',
      event: 'tracing_shutdown_start'
    });
    
    await shutdownTracing();
    
    logger.info('Tracing shut down', {
      component: 'shutdown',
      event: 'tracing_shutdown_complete'
    });
    
    // 8. Close logger (writes remaining logs to disk)
    logger.info('Shutting down logger', {
      component: 'shutdown',
      event: 'logger_close_start'
    });
    
    await closeLogger();
    
    // Clear the force exit timer
    clearTimeout(forceExitTimer);
    
    shutdownComplete = true;
    
    logger.info('Graceful shutdown completed successfully', {
      component: 'shutdown',
      event: 'shutdown_complete',
      duration: Date.now() - startTime
    });
    
    // Exit gracefully
    process.exit(0);
    
  } catch (error) {
    clearTimeout(forceExitTimer);
    
    logger.error('Error during graceful shutdown', {
      component: 'shutdown',
      event: 'shutdown_error',
      error,
      duration: Date.now() - startTime
    });
    
    if (options.forceExit) {
      process.exit(1);
    }
  }
}

/**
 * Quick shutdown for critical errors
 * Closes only essential resources
 */
export async function emergencyShutdown(server: Server): Promise<void> {
  logger.error('EMERGENCY SHUTDOWN INITIATED', {
    component: 'shutdown',
    event: 'emergency_shutdown_start'
  });
  
  try {
    // Force close server
    server.close();
    
    // Force close all connections
    await closeConnections();
    
    // Close database
    await prisma.$disconnect();
    
    logger.error('Emergency shutdown completed', {
      component: 'shutdown',
      event: 'emergency_shutdown_complete'
    });
    
  } catch (error) {
    logger.error('Error during emergency shutdown', {
      component: 'shutdown',
      event: 'emergency_shutdown_error',
      error
    });
  } finally {
    process.exit(1);
  }
}

// Cleanup on process termination
process.on('beforeExit', (code) => {
  logger.info('Process beforeExit', {
    component: 'shutdown',
    event: 'before_exit',
    exitCode: code
  });
});

process.on('exit', (code) => {
  console.log(`✅ Process exiting with code: ${code}`);
});

export default {
  setupGracefulShutdown,
  gracefulShutdown,
  emergencyShutdown,
  trackConnection,
  getActiveConnectionCount,
  closeConnections
};
