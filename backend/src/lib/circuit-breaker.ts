/**
 * Circuit Breaker Configuration
 * Prevents cascade failures and provides graceful degradation
 */

import CircuitBreaker from 'opossum';
import { logger } from './logger';

// Default circuit breaker options
export const DEFAULT_BREAKER_OPTIONS = {
  // Time to wait before trying again (30 seconds)
  timeout: 10000, // 10 seconds
  
  // When true, the circuit breaker will enter halfOpen state after resetTimeout
  resetTimeout: 30000, // 30 seconds
  
  // The error threshold percentage before opening the circuit (50%)
  errorThresholdPercentage: 50,
  
  // The minimum number of requests before calculating error rate (20 requests)
  errorThresholdCount: 20,
  
  // The minimum number of requests before calculating error rate
  // Set to 0 to enable immediately
  minimumRps: 0,
  
  // Whether to enable snapshotting for monitoring
  capacity: 100,
  
  // Whether the breaker should start in a closed state
  rollingCountTimeout: 10000, // 10 seconds window
  
  // Number of buckets for the rolling count
  rollingCountBuckets: 10,
  
  // Enables circuit breaker snapshotting
  rollingPercentilesEnabled: true,
  
  // Time to wait between health checks
  healthCheckInterval: 5000,
  
  // Health check function - if this fails, circuit opens
  healthCheckEnabled: true,
};

/**
 * Circuit breaker state change handler
 */
function onCircuitStateChange(
  circuit: CircuitBreaker,
  oldState: string,
  newState: string
): void {
  logger.warn('Circuit breaker state changed', {
    component: 'circuit-breaker',
    event: 'state_change',
    name: circuit.name,
    oldState,
    newState,
    stats: circuit.stats
  });
}

/**
 * Circuit breaker fallback handler
 */
function onCircuitFallback(
  circuit: CircuitBreaker,
  result: any,
  error: Error
): void {
  logger.warn('Circuit breaker fallback executed', {
    component: 'circuit-breaker',
    event: 'fallback',
    name: circuit.name,
    error: error?.message,
    result
  });
}

/**
 * Circuit breaker error handler
 */
function onCircuitError(
  circuit: CircuitBreaker,
  error: Error
): void {
  logger.error('Circuit breaker error', {
    component: 'circuit-breaker',
    event: 'error',
    name: circuit.name,
    error: error.message,
    stack: error.stack,
    stats: circuit.stats
  });
}

/**
 * Circuit breaker timeout handler
 */
function onCircuitTimeout(
  circuit: CircuitBreaker
): void {
  logger.warn('Circuit breaker timeout', {
    component: 'circuit-breaker',
    event: 'timeout',
    name: circuit.name,
    timeout: circuit.options.timeout
  });
}

/**
 * Circuit breaker success handler
 */
function onCircuitSuccess(
  circuit: CircuitBreaker
): void {
  logger.debug('Circuit breaker success', {
    component: 'circuit-breaker',
    event: 'success',
    name: circuit.name,
    stats: circuit.stats
  });
}

/**
 * Create a circuit breaker for a function
 * @param func - The function to wrap
 * @param name - Name of the circuit breaker (for logging)
 * @param options - Custom options
 * @returns Configured circuit breaker
 */
export function createCircuitBreaker<T extends any[], R>(
  func: (...args: T) => Promise<R>,
  name: string,
  options?: Partial<typeof DEFAULT_BREAKER_OPTIONS>
): CircuitBreaker {
  
  // Create breaker with custom options
  const breaker = new CircuitBreaker(func, {
    ...DEFAULT_BREAKER_OPTIONS,
    ...options,
    name
  });
  
  // Register event handlers
  breaker.on('stateChange', (oldState, newState) => {
    onCircuitStateChange(breaker, oldState, newState);
  });
  
  breaker.on('fallback', (result, error) => {
    onCircuitFallback(breaker, result, error);
  });
  
  breaker.on('error', (error) => {
    onCircuitError(breaker, error);
  });
  
  breaker.on('timeout', () => {
    onCircuitTimeout(breaker);
  });
  
  breaker.on('success', () => {
    onCircuitSuccess(breaker);
  });
  
  logger.info('Circuit breaker created', {
    component: 'circuit-breaker',
    event: 'created',
    name
  });
  
  return breaker;
}

/**
 * Predefined circuit breakers for common operations
 */

// Database operations breaker (stricter settings)
export const databaseBreaker = (func: any, name: string) => createCircuitBreaker(
  func,
  `database:${name}`,
  {
    timeout: 5000, // 5 seconds for DB queries
    errorThresholdPercentage: 30, // More sensitive (30% errors)
    resetTimeout: 60000, // Wait 60 seconds before retry
  }
);

// External API calls breaker
export const externalApiBreaker = (func: any, name: string) => createCircuitBreaker(
  func,
  `external-api:${name}`,
  {
    timeout: 10000, // 10 seconds for external APIs
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  }
);

// File operations breaker
export const fileBreaker = (func: any, name: string) => createCircuitBreaker(
  func,
  `file:${name}`,
  {
    timeout: 15000, // 15 seconds for file ops
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  }
);

// Cache operations breaker
export const cacheBreaker = (func: any, name: string) => createCircuitBreaker(
  func,
  `cache:${name}`,
  {
    timeout: 2000, // 2 seconds for cache (fast fail)
    errorThresholdPercentage: 50,
    resetTimeout: 10000, // 10 seconds for cache
  }
);

// Fallback responses for circuit breakers
export const FALLBACK_RESPONSES = {
  database: {
    success: false,
    message: 'Database temporarily unavailable',
    code: 'SERVICE_UNAVAILABLE',
    circuitBreaker: 'open'
  },
  
  externalApi: {
    success: false,
    message: 'External service temporarily unavailable',
    code: 'SERVICE_UNAVAILABLE',
    circuitBreaker: 'open'
  },
  
  file: {
    success: false,
    message: 'File service temporarily unavailable',
    code: 'SERVICE_UNAVAILABLE',
    circuitBreaker: 'open'
  },
  
  cache: {
    success: false,
    message: 'Cache temporarily unavailable',
    code: 'SERVICE_UNAVAILABLE',
    circuitBreaker: 'open'
  },
  
  default: {
    success: false,
    message: 'Service temporarily unavailable',
    code: 'SERVICE_UNAVAILABLE',
    circuitBreaker: 'open'
  }
};

/**
 * Get circuit breaker status for monitoring
 */
export function getCircuitBreakerStatus(breaker: CircuitBreaker) {
  const stats = breaker.stats;
  return {
    name: breaker.name,
    state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
    stats: {
      requests: stats.requests,
      timeouts: stats.timeouts,
      successful: stats.successful,
      failed: stats.failures,
      rejects: stats.rejects,
      errors: stats.errors,
      totalLatency: stats.totalLatency,
      meanLatency: stats.mean || 0,
      percentiles: stats.percentiles || {}
    },
    healthCheckEnabled: breaker.healthCheckEnabled,
    resetTimeout: breaker.options.resetTimeout,
    timeout: breaker.options.timeout
  };
}

/**
 * Health check function to determine if circuit should be closed
 */
export async function defaultHealthCheck(): Promise<boolean> {
  // Basic health check - can be modified
  return true;
}

export default {
  createCircuitBreaker,
  databaseBreaker,
  externalApiBreaker,
  fileBreaker,
  cacheBreaker,
  getCircuitBreakerStatus,
  FALLBACK_RESPONSES,
  DEFAULT_BREAKER_OPTIONS
};
