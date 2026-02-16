/**
 * Prometheus Metrics Configuration
 * Collects and exposes application metrics for monitoring
 */

import client from 'prom-client';
import { logger } from './logger';
import { Request, Response, NextFunction } from 'express';

// Create Prometheus Registry
export const register = new client.Registry();

// Set default labels for all metrics
register.setDefaultLabels({
  app: 'sms-backend',
  version: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development'
});

// Enable collection of default metrics (GC, event loop lag, memory, CPU)
client.collectDefaultMetrics({
  register,
  prefix: 'sms_',
  // Custom labels for default metrics
  labels: { component: 'system' }
});

/**
 * Custom Metrics
 */

// HTTP Request Duration Histogram
export const httpRequestDuration = new client.Histogram({
  name: 'sms_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});
register.registerMetric(httpRequestDuration);

// HTTP Request Counter
export const httpRequestTotal = new client.Counter({
  name: 'sms_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestTotal);

// Active HTTP Requests Gauge
export const activeRequests = new client.Gauge({
  name: 'sms_http_active_requests',
  help: 'Number of active HTTP requests'
});
register.registerMetric(activeRequests);

// User Login Counter
export const userLoginsTotal = new client.Counter({
  name: 'sms_user_logins_total',
  help: 'Total number of user logins',
  labelNames: ['status', 'role']
});
register.registerMetric(userLoginsTotal);

// Database Query Duration Histogram
export const dbQueryDuration = new client.Histogram({
  name: 'sms_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table', 'status'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5]
});
register.registerMetric(dbQueryDuration);

// Database Query Counter
export const dbQueryTotal = new client.Counter({
  name: 'sms_db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status']
});
register.registerMetric(dbQueryTotal);

// Active Database Connections Gauge
export const dbActiveConnections = new client.Gauge({
  name: 'sms_db_active_connections',
  help: 'Number of active database connections'
});
register.registerMetric(dbActiveConnections);

// Redis Operation Duration Histogram
export const redisOperationDuration = new client.Histogram({
  name: 'sms_redis_operation_duration_seconds',
  help: 'Duration of Redis operations in seconds',
  labelNames: ['operation', 'status'],
  buckets: [0.0001, 0.0005, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1]
});
register.registerMetric(redisOperationDuration);

// Redis Operation Counter
export const redisOperationTotal = new client.Counter({
  name: 'sms_redis_operations_total',
  help: 'Total number of Redis operations',
  labelNames: ['operation', 'status']
});
register.registerMetric(redisOperationTotal);

// Cache Hit Rate Counter
export const cacheOperationsTotal = new client.Counter({
  name: 'sms_cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'result'] // operation: get/set, result: hit/miss/success/error
});
register.registerMetric(cacheOperationsTotal);

// Circuit Breaker State Gauge
export const circuitBreakerState = new client.Gauge({
  name: 'sms_circuit_breaker_state',
  help: 'Current state of circuit breaker (0=closed, 1=half_open, 2=open)',
  labelNames: ['name']
});
register.registerMetric(circuitBreakerState);

// Circuit Breaker Events Counter
export const circuitBreakerEventsTotal = new client.Counter({
  name: 'sms_circuit_breaker_events_total',
  help: 'Total number of circuit breaker events',
  labelNames: ['name', 'event'] // event: success, failure, timeout, open, half_open, close
});
register.registerMetric(circuitBreakerEventsTotal);

// User Registration Counter
export const userRegistrationsTotal = new client.Counter({
  name: 'sms_user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['role', 'status']
});
register.registerMetric(userRegistrationsTotal);

// Student Enrollment Counter
export const studentEnrollmentsTotal = new client.Counter({
  name: 'sms_student_enrollments_total',
  help: 'Total number of student enrollments',
  labelNames: ['status']
});
register.registerMetric(studentEnrollmentsTotal);

// Payment Processing Counter
export const paymentProcessingTotal = new client.Counter({
  name: 'sms_payment_processing_total',
  help: 'Total number of payment processing operations',
  labelNames: ['status', 'method']
});
register.registerMetric(paymentProcessingTotal);

// Error Counter
export const errorsTotal = new client.Counter({
  name: 'sms_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'code', 'severity'] // severity: low/medium/high/critical
});
register.registerMetric(errorsTotal);

// Business Metrics Gauge
export const businessMetrics = new client.Gauge({
  name: 'sms_business_metrics',
  help: 'Business-level metrics',
  labelNames: ['metric_type']
});
register.registerMetric(businessMetrics);

/**
 * Middleware to collect HTTP metrics
 */
export function collectHttpMetrics(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  activeRequests.inc();
  
  const route = req.route?.path || req.path;
  
  // Override res.end to capture response time
  const originalEnd = res.end.bind(res);
  res.end = function(...args: any[]): Response {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    const statusCode = res.statusCode.toString();
    
    activeRequests.dec();
    
    // Record metrics
    httpRequestDuration.observe({
      method: req.method,
      route,
      status_code: statusCode
    }, duration);
    
    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: statusCode
    });
    
    // Log slow requests (>1 second)
    if (duration > 1) {
      logger.warn('Slow request detected', {
        component: 'metrics',
        event: 'slow_request',
        method: req.method,
        route,
        duration: `${duration.toFixed(3)}s`,
        statusCode
      });
    }
    
    // Record errors
    if (statusCode.startsWith('4') || statusCode.startsWith('5')) {
      const errorSeverity = statusCode.startsWith('5') ? 'high' : 'medium';
      
      errorsTotal.inc({
        type: 'http',
        code: statusCode,
        severity: errorSeverity
      });
    }
    
    return originalEnd(...args);
  };
  
  next();
}

/**
 * Function to update business metrics periodically
 */
export async function updateBusinessMetrics(): Promise<void> {
  try {
    // Student count
    const studentCount = await prisma.student.count();
    businessMetrics.set({ metric_type: 'total_students' }, studentCount);
    
    // Active user count (last 24 hours)
    const activeUsers = await prisma.user.count({
      where: {
        last_login: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
    businessMetrics.set({ metric_type: 'active_users_24h' }, activeUsers);
    
    // Pending admissions
    const pendingAdmissions = await prisma.admissionApplication.count({
      where: {
        status: 'PENDING'
      }
    });
    businessMetrics.set({ metric_type: 'pending_admissions' }, pendingAdmissions);
    
    // Outstanding payments
    const outstandingPayments = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: 'PENDING'
      }
    });
    businessMetrics.set(
      { metric_type: 'outstanding_payments_amount' },
      outstandingPayments._sum.amount || 0
    );
    
    logger.debug('Business metrics updated');
  } catch (error) {
    logger.error('Error updating business metrics', { error });
  }
}

/**
 * Middleware to expose metrics endpoint
 * Should be placed before any authentication if metrics need to be public
 * or protected if internal monitoring only
 */
export async function metricsEndpoint(req: Request, res: Response): Promise<void> {
  try {
    // Set appropriate headers for Prometheus
    res.set('Content-Type', register.contentType);
    
    // Optional: Add authentication for metrics endpoint
    const authToken = req.headers['x-metrics-token'];
    const expectedToken = process.env.METRICS_TOKEN;
    
    if (expectedToken && authToken !== expectedToken) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized access to metrics endpoint'
      });
      return;
    }
    
    // Get metrics
    const metrics = await register.metrics();
    res.send(metrics);
    
  } catch (error) {
    logger.error('Error generating metrics', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to generate metrics'
    });
  }
}

/**
 * Helper to record database query metrics
 */
export function recordDbMetrics(
  operation: string,
  table: string,
  durationMs: number,
  success: boolean
): void {
  const duration = durationMs / 1000; // Convert to seconds
  const status = success ? 'success' : 'error';
  
  dbQueryDuration.observe({
    operation,
    table,
    status
  }, duration);
  
  dbQueryTotal.inc({
    operation,
    table,
    status
  });
}

/**
 * Helper to record cache metrics
 */
export function recordCacheMetrics(
  operation: 'get' | 'set' | 'delete',
  result: 'hit' | 'miss' | 'success' | 'error'
): void {
  cacheOperationsTotal.inc({
    operation,
    result
  });
}

/**
 * Helper to record circuit breaker metrics
 */
export function recordCircuitBreakerMetrics(
  name: string,
  event: string
): void {
  circuitBreakerEventsTotal.inc({
    name,
    event
  });
  
  // Update state gauge (approximate)
  const stateMap: { [key: string]: number } = {
    'close': 0,
    'half_open': 1,
    'open': 2
  };
  
  if (stateMap.hasOwnProperty(event)) {
    circuitBreakerState.set({ name }, stateMap[event]);
  }
}

export default {
  register,
  collectHttpMetrics,
  metricsEndpoint,
  updateBusinessMetrics,
  recordDbMetrics,
  recordCacheMetrics,
  recordCircuitBreakerMetrics,
  // Export metrics for direct use
  httpRequestDuration,
  httpRequestTotal,
  activeRequests,
  dbQueryDuration,
  dbQueryTotal,
  cacheOperationsTotal,
  circuitBreakerState,
  circuitBreakerEventsTotal,
  errorsTotal,
  businessMetrics
};
