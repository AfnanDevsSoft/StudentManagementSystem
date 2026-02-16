/**
 * Redis Client Configuration
 * Production-ready Redis client with connection pooling and error handling
 */

import Redis from 'ioredis';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  
  // Connection pooling
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  keepAlive: 30000, // 30 seconds
  connectTimeout: 10000, // 10 seconds
  commandTimeout: 5000, // 5 seconds per command
  
  // Retry strategy
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    console.log(`[REDIS] Retry attempt ${times}, next retry in ${delay}ms`);
    return delay;
  },
  
  // Reconnection handling
  reconnectOnError: (err: Error) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      console.log('[REDIS] Reconnecting due to READONLY error');
      return true;
    }
    return false;
  },
};

// Create Redis client instance
export const redis = new Redis(redisConfig);

// Connection event handlers
redis.on('connect', () => {
  console.log('✅ [REDIS] Connected to Redis server');
});

redis.on('ready', () => {
  console.log('✅ [REDIS] Redis client is ready');
});

redis.on('error', (err: Error) => {
  console.error('❌ [REDIS] Redis error:', err.message);
});

redis.on('close', () => {
  console.log('⚠️  [REDIS] Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 [REDIS] Redis reconnecting...');
});

// Graceful shutdown handler
export const closeRedis = async (): Promise<void> => {
  try {
    console.log('[REDIS] Closing Redis connection...');
    await redis.quit();
    console.log('✅ [REDIS] Redis connection closed successfully');
  } catch (error) {
    console.error('❌ [REDIS] Error closing Redis connection:', error);
    throw error;
  }
};

// Health check function
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('[REDIS] Health check failed:', error);
    return false;
  }
};

// Delete keys by pattern (for cleanup)
export const deleteKeysByPattern = async (pattern: string): Promise<number> => {
  try {
    const stream = redis.scanStream({
      match: pattern,
      count: 100
    });

    let deletedCount = 0;
    
    stream.on('data', async (keys: string[]) => {
      if (keys.length > 0) {
        const pipeline = redis.pipeline();
        keys.forEach(key => pipeline.del(key));
        const results = await pipeline.exec();
        deletedCount += results?.filter((r: any) => r[1] === 1).length || 0;
      }
    });

    return new Promise((resolve) => {
      stream.on('end', () => {
        console.log(`[REDIS] Deleted ${deletedCount} keys matching pattern: ${pattern}`);
        resolve(deletedCount);
      });
    });
  } catch (error) {
    console.error(`[REDIS] Error deleting keys by pattern ${pattern}:`, error);
    return 0;
  }
};

// Get Redis info
export const getRedisInfo = async (): Promise<any> => {
  try {
    const info = await redis.info();
    return info;
  } catch (error) {
    console.error('[REDIS] Error getting info:', error);
    return null;
  }
};

export default redis;
