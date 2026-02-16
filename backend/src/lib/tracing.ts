/**
 * OpenTelemetry Distributed Tracing Configuration
 * Provides request flow visibility and performance bottleneck identification
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { trace, context, Span, SpanStatusCode } from '@opentelemetry/api';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// Initialize OpenTelemetry SDK
let sdk: NodeSDK | null = null;

/**
 * Initialize distributed tracing
 * Called once during application startup
 */
export function initTracing(): void {
  if (sdk) {
    logger.warn('Tracing already initialized');
    return;
  }

  // Configure Jaeger exporter
  const jaegerExporter = new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
    serviceName: 'sms-backend',
  });

  // Create span processor
  const spanProcessor = new BatchSpanProcessor(jaegerExporter, {
    maxExportBatchSize: 512,
    scheduledDelayMillis: 5000,
    exportTimeoutMillis: 30000,
  });

  // Initialize SDK
  sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'sms-backend',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
      [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'student-management',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    }),
    spanProcessor: spanProcessor,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Configure specific instrumentations
        '@opentelemetry/instrumentation-http': {
          ignoreIncomingPaths: ['/health', '/metrics', '/favicon.ico'],
          ignoreOutgoingUrls: [/jaeger/],
        },
        '@opentelemetry/instrumentation-pg': {
          enhancedDatabaseReporting: true,
        },
      }),
    ],
  });

  // Start the SDK
  sdk.start()
    .then(() => {
      logger.info('OpenTelemetry tracing initialized', {
        component: 'tracing',
        event: 'tracing_initialized',
        exporter: 'jaeger',
      });
    })
    .catch((error) => {
      logger.error('Failed to initialize tracing', {
        component: 'tracing',
        event: 'tracing_init_error',
        error,
      });
    });

  // Handle shutdown
  process.on('SIGTERM', async () => {
    if (sdk) {
      await sdk.shutdown();
      logger.info('OpenTelemetry SDK shut down');
    }
  });
}

/**
 * Shutdown tracing (call during graceful shutdown)
 */
export async function shutdownTracing(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    sdk = null;
    logger.info('OpenTelemetry tracing shut down', {
      component: 'tracing',
      event: 'tracing_shutdown',
    });
  }
}

/**
 * Create a new trace with a single span
 * @param name - Name of the span
 * @param fn - Function to execute within the span
 * @param parentSpan - Optional parent span for context
 */
export async function traceSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  parentSpan?: Span
): Promise<T> {
  const tracer = trace.getTracer('sms-backend');
  const ctx = parentSpan ? trace.setSpan(context.active(), parentSpan) : undefined;

  return tracer.startActiveSpan(name, {}, ctx, async (span) => {
    try {
      span.setAttribute('span.type', 'internal');
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Express middleware for request tracing
 * Automatically traces all HTTP requests
 */
export function tracingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const tracer = trace.getTracer('sms-backend');
  
  // Get or create trace ID
  const traceId = req.headers['x-trace-id']?.toString() || uuidv4();
  req.headers['x-trace-id'] = traceId;
  res.setHeader('X-Trace-ID', traceId);

  // Create span for HTTP request
  const span = tracer.startSpan(`${req.method} ${req.route?.path || req.path}`, {
    attributes: {
      'http.method': req.method,
      'http.url': req.originalUrl,
      'http.target': req.path,
      'http.host': req.get('host'),
      'http.user_agent': req.get('User-Agent'),
      'http.request_id': req.headers['x-request-id'],
      'net.peer.ip': req.ip,
      'span.type': 'http',
      'component': 'express',
    },
  });

  // Override res.end to capture response
  const originalEnd = res.end.bind(res);
  res.end = function(...args: any[]): Response {
    span.setAttribute('http.status_code', res.statusCode);
    
    if (res.statusCode >= 400) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: `HTTP ${res.statusCode}`,
      });
    } else {
      span.setStatus({ code: SpanStatusCode.OK });
    }
    
    span.end();
    return originalEnd(...args);
  };

  // Store span in request for child spans
  (req as any).traceSpan = span;
  (req as any).traceId = traceId;
  
  next();
}

/**
 * Trace a database operation
 * @param operation - Operation name (e.g., 'findOne', 'create')
 * @param table - Table/Model name
 * @param fn - Database operation function
 */
export async function traceDatabase<T>(
  operation: string,
  table: string,
  fn: () => Promise<T>,
  parentSpan?: Span
): Promise<T> {
  return traceSpan(
    `${table}.${operation}`,
    async (span) => {
      span.setAttribute('db.operation', operation);
      span.setAttribute('db.table', table);
      span.setAttribute('span.type', 'database');
      span.setAttribute('component', 'prisma');
      
      try {
        const startTime = Date.now();
        const result = await fn();
        const duration = Date.now() - startTime;
        
        span.setAttribute('db.duration_ms', duration);
        span.setAttribute('db.success', true);
        
        return result;
      } catch (error) {
        span.setAttribute('db.success', false);
        span.setAttribute('db.error', error instanceof Error ? error.message : String(error));
        throw error;
      }
    },
    parentSpan
  );
}

/**
 * Trace an external API call
 * @param service - External service name
 * @param operation - API operation
 * @param fn - API call function
 */
export async function traceExternalApi<T>(
  service: string,
  operation: string,
  fn: () => Promise<T>,
  parentSpan?: Span
): Promise<T> {
  return traceSpan(
    `${service}.${operation}`,
    async (span) => {
      span.setAttribute('peer.service', service);
      span.setAttribute('http.method', operation);
      span.setAttribute('span.type', 'external');
      span.setAttribute('component', 'http-client');
      
      try {
        const result = await fn();
        span.setAttribute('http.success', true);
        return result;
      } catch (error) {
        span.setAttribute('http.success', false);
        throw error;
      }
    },
    parentSpan
  );
}

/**
 * Create a child span for granular tracing
 * @param name - Span name
 * @param fn - Function to execute
 * @param parentSpan - Parent span or request object
 */
export async function traceChild<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  parentSpan: Span | Request
): Promise<T> {
  const span = typeof parentSpan === 'object' && 'end' in parentSpan ? parentSpan : (parentSpan as any).traceSpan;
  
  if (!span) {
    // No parent span, run without tracing
    return fn({} as Span);
  }
  
  const tracer = trace.getTracer('sms-backend');
  const ctx = trace.setSpan(context.active(), span);
  
  return tracer.startActiveSpan(name, {}, ctx, async (childSpan) => {
    try {
      childSpan.setAttribute('span.type', 'internal');
      const result = await fn(childSpan);
      childSpan.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      childSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      childSpan.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      childSpan.end();
    }
  });
}

/**
 * Get current trace ID for logging
 */
export function getCurrentTraceId(): string | undefined {
  const currentSpan = trace.getSpan(context.active());
  if (currentSpan) {
    const spanContext = currentSpan.spanContext();
    return spanContext.traceId;
  }
  return undefined;
}

/**
 * Attach trace context to logs
 */
export function withTraceContext<T>(span: Span | Request, fn: () => T): T {
  const traceId = span instanceof Span ? span.spanContext().traceId : (span as any).traceId;
  
  if (traceId) {
    // Store trace ID in async context - this would need cls-hooked or node 14+ AsyncLocalStorage
    // For now, we'll return the value directly
  }
  
  return fn();
}

export default {
  initTracing,
  shutdownTracing,
  traceSpan,
  traceChild,
  traceDatabase,
  traceExternalApi,
  tracingMiddleware,
  getCurrentTraceId,
  withTraceContext,
};
