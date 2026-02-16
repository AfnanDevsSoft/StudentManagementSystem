/**
 * Cache Service using Redis
 * Production-ready caching with TTL, stats, and error handling
 */

import { redis } from "../lib/redis";

interface CacheEntry<T> {
  value: T;
  expiresAt: number; // Unix timestamp in milliseconds
  hitCount: number;
  createdAt: number; // Unix timestamp in milliseconds
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
}

// In-memory stats (these are per-instance, which is fine for stats)
let cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
};

export class CacheService {
  private static readonly PREFIX = "sms:cache:";
  private static readonly STATS_KEY = "sms:cache:stats";

  /**
   * Generate cache key with prefix
   */
  private static generateKey(key: string): string {
    return `${this.PREFIX}${key}`;
  }

  /**
   * Set value in cache with TTL
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlSeconds - Time to live in seconds (default: 1 hour)
   */
  static async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(key);
      const now = Date.now();
      const expiresAt = now + (ttlSeconds * 1000);

      const entry: CacheEntry<T> = {
        value,
        expiresAt,
        hitCount: 0,
        createdAt: now
      };

      // Store in Redis with TTL
      const result = await redis.setex(
        cacheKey,
        ttlSeconds,
        JSON.stringify(entry)
      );

      if (result === 'OK') {
        cacheStats.sets++;
        // Persist stats to Redis periodically
        await this.persistStats();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`[CACHE] Error setting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.generateKey(key);
      const data = await redis.get(cacheKey);

      if (!data) {
        cacheStats.misses++;
        await this.persistStats();
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(data);
      const now = Date.now();

      // Check if expired
      if (now > entry.expiresAt) {
        // Delete expired key
        await redis.del(cacheKey);
        cacheStats.misses++;
        await this.persistStats();
        return null;
      }

      // Increment hit count
      entry.hitCount++;
      
      // Update the entry with new hit count (but don't reset TTL)
      await redis.set(cacheKey, JSON.stringify(entry), 'KEEPTTL');
      
      cacheStats.hits++;
      await this.persistStats();
      
      return entry.value;
    } catch (error) {
      console.error(`[CACHE] Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Check if key exists in cache
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(key);
      const exists = await redis.exists(cacheKey);
      return exists === 1;
    } catch (error) {
      console.error(`[CACHE] Error checking key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  static async delete(key: string): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(key);
      const result = await redis.del(cacheKey);
      
      if (result === 1) {
        cacheStats.deletes++;
        await this.persistStats();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`[CACHE] Error deleting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   * @param pattern - Pattern to match keys (e.g., "users:*")
   */
  static async deleteByPattern(pattern: string): Promise<number> {
    try {
      const fullPattern = `${this.PREFIX}${pattern}`;
      const deletedCount = await this.deleteRedisKeysByPattern(fullPattern);
      return deletedCount;
    } catch (error) {
      console.error(`[CACHE] Error deleting keys by pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Clear all cache entries for this service
   */
  static async clear(): Promise<void> {
    try {
      await this.deleteByPattern('*');
      cacheStats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
      await this.persistStats();
      console.log('[CACHE] Cache cleared successfully');
    } catch (error) {
      console.error('[CACHE] Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getStats(): CacheStats {
    return { ...cacheStats };
  }

  /**
   * Persist stats to Redis (call periodically)
   */
  private static async persistStats(): Promise<void> {
    try {
      await redis.setex(
        this.STATS_KEY,
        3600, // 1 hour TTL for stats
        JSON.stringify(cacheStats)
      );
    } catch (error) {
      console.error('[CACHE] Error persisting stats:', error);
    }
  }

  /**
   * Load stats from Redis (on startup)
   */
  static async loadStats(): Promise<void> {
    try {
      const statsData = await redis.get(this.STATS_KEY);
      if (statsData) {
        const savedStats = JSON.parse(statsData);
        cacheStats.hits = savedStats.hits || 0;
        cacheStats.misses = savedStats.misses || 0;
        cacheStats.sets = savedStats.sets || 0;
        cacheStats.deletes = savedStats.deletes || 0;
      }
    } catch (error) {
      console.error('[CACHE] Error loading stats:', error);
    }
  }

  /**
   * Get cache hit rate
   */
  static getHitRate(): number {
    const total = cacheStats.hits + cacheStats.misses;
    if (total === 0) return 0;
    return (cacheStats.hits / total) * 100;
  }

  /**
   * Private helper to delete keys by pattern
   */
  private static async deleteRedisKeysByPattern(pattern: string): Promise<number> {
    let deletedCount = 0;
    const stream = redis.scanStream({
      match: pattern,
      count: 100
    });

    return new Promise((resolve, reject) => {
      stream.on('data', async (keys: string[]) => {
        if (keys.length > 0) {
          const pipeline = redis.pipeline();
          keys.forEach(key => pipeline.del(key));
          const results = await pipeline.exec();
          deletedCount += results?.filter((r: any) => r[1] === 1).length || 0;
        }
      });

      stream.on('end', () => {
        console.log(`[CACHE] Deleted ${deletedCount} keys matching pattern: ${pattern}`);
        resolve(deletedCount);
      });

      stream.on('error', (error: Error) => {
        console.error(`[CACHE] Error in keys deletion stream:`, error);
        reject(error);
      });
    });
  }
}

export default CacheService;
