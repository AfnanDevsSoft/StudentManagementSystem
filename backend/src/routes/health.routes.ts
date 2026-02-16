import express, { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import { redis } from "../lib/redis";
import { logger } from "../lib/logger";
import { checkDatabaseHealth, checkRedisHealth } from "../utils/circuit-wrapper";
import fs from "fs";
import path from "path";

const router: Router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of all system components
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: All services healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         responseTime:
 *                           type: number
 *       503:
 *         description: One or more services unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: unhealthy
 *                 checks:
 *                   type: object
 */

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
  checks: {
    database: HealthCheck;
    redis: HealthCheck;
    storage: HealthCheck;
    memory: HealthCheck;
  };
}

// Store server start time
const startTime = Date.now();

// Helper to check memory usage
function checkMemory(): HealthCheck {
  const usage = process.memoryUsage();
  const maxHeap = 200 * 1024 * 1024; // 200MB threshold
  
  const isHealthy = usage.heapUsed < maxHeap;
  
  return {
    status: isHealthy ? 'healthy' : 'degraded',
    responseTime: Math.round(usage.heapUsed / 1024 / 1024), // MB
    error: isHealthy ? undefined : `High memory usage: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`
  };
}

// Helper to check storage
function checkStorage(): HealthCheck {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // Check if uploads directory exists and is writable
    if (!fs.existsSync(uploadsDir)) {
      // Create directory if it doesn't exist
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Test write access
    const testFile = path.join(uploadsDir, '.healthcheck');
    fs.writeFileSync(testFile, 'healthcheck');
    fs.unlinkSync(testFile);
    
    return {
      status: 'healthy',
      responseTime: 0
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: `Storage check failed: ${error.message}`
    };
  }
}

// Main health check endpoint
router.get("/", async (req: Request, res: Response) => {
  const checks: HealthResponse["checks"] = {
    database: { status: 'unhealthy', error: 'Not checked' },
    redis: { status: 'unhealthy', error: 'Not checked' },
    storage: { status: 'unhealthy', error: 'Not checked' },
    memory: { status: 'unhealthy', error: 'Not checked' }
  };

  let allHealthy = true;

  // Check database
  const dbStart = Date.now();
  try {
    const dbHealthy = await checkDatabaseHealth();
    checks.database = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      responseTime: Date.now() - dbStart,
      error: dbHealthy ? undefined : 'Database connection failed'
    };
    if (!dbHealthy) allHealthy = false;
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      responseTime: Date.now() - dbStart,
      error: error.message
    };
    allHealthy = false;
  }

  // Check Redis
  const redisStart = Date.now();
  try {
    const redisHealthy = await checkRedisHealth();
    checks.redis = {
      status: redisHealthy ? 'healthy' : 'degraded',
      responseTime: Date.now() - redisStart,
      error: redisHealthy ? undefined : 'Redis connection failed'
    };
    // Redis degraded doesn't make entire system unhealthy
  } catch (error) {
    checks.redis = {
      status: 'unhealthy',
      responseTime: Date.now() - redisStart,
      error: error.message
    };
  }

  // Check storage
  const storageStart = Date.now();
  try {
    checks.storage = checkStorage();
    checks.storage.responseTime = Date.now() - storageStart;
    if (checks.storage.status === 'unhealthy') allHealthy = false;
  } catch (error) {
    checks.storage = {
      status: 'unhealthy',
      responseTime: Date.now() - storageStart,
      error: error.message
    };
    allHealthy = false;
  }

  // Check memory
  checks.memory = checkMemory();
  if (checks.memory.status === 'unhealthy') allHealthy = false;

  const response: HealthResponse = {
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Date.now() - startTime,
    environment: process.env.NODE_ENV || 'development',
    checks
  };

  // Log health check result
  logger.info('Health check performed', {
    component: 'health',
    event: 'health_check',
    status: response.status,
    checks: {
      database: checks.database.status,
      redis: checks.redis.status,
      storage: checks.storage.status,
      memory: checks.memory.status
    }
  });

  res.status(allHealthy ? 200 : 503).json(response);
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe for Kubernetes
 *     description: Returns 200 when the service is ready to accept traffic
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get("/ready", async (req: Request, res: Response) => {
  try {
    // Quick DB check
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe for Kubernetes
 *     description: Returns 200 if the service is alive (doesn't check dependencies)
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get("/live", (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health metrics
 *     description: Returns detailed system metrics
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: Detailed metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 memory:
 *                   type: object
 *                 cpu:
 *                   type: object
 *                 database:
 *                   type: object
 */
router.get("/detailed", async (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  res.status(200).json({
    timestamp: new Date().toISOString(),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      arrayBuffers: `${Math.round((memoryUsage as any).arrayBuffers || 0 / 1024 / 1024)}MB`
    },
    cpu: {
      user: `${(cpuUsage.user / 1000).toFixed(2)}ms`,
      system: `${(cpuUsage.system / 1000).toFixed(2)}ms`
    },
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    pid: process.pid
  });
});

export default router;
