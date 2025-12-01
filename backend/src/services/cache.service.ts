import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: Date;
  hitCount: number;
  createdAt: Date;
}

export class CacheService {
  private static cache = new Map<string, CacheEntry<any>>();
  private static stats = {
    hits: 0,
    misses: 0,
    sets: 0,
  };

  // ============= Basic Cache Operations =============

  static set<T>(key: string, value: T, ttlSeconds = 3600): void {
    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      this.cache.set(key, {
        key,
        value,
        expiresAt,
        hitCount: 0,
        createdAt: new Date(),
      });
      this.stats.sets++;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key);
      if (!entry) {
        this.stats.misses++;
        return null;
      }

      if (new Date() > entry.expiresAt) {
        this.cache.delete(key);
        this.stats.misses++;
        return null;
      }

      entry.hitCount++;
      this.stats.hits++;
      return entry.value as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  static delete(key: string): boolean {
    return this.cache.delete(key);
  }

  static exists(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  static clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, sets: 0 };
  }

  static flush(): void {
    // Remove only expired entries
    const now = new Date();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // ============= Query Result Caching =============

  static async cacheStudentsList(branchId: string, page = 1, limit = 20) {
    const cacheKey = `students:${branchId}:${page}:${limit}`;
    const cached = this.get(cacheKey);
    if (cached) return cached;

    try {
      const students = await prisma.student.findMany({
        where: { branch_id: branchId },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { first_name: true, last_name: true, email: true } },
        },
      });

      this.set(cacheKey, students, 1800); // 30 minutes
      return students;
    } catch (error) {
      console.error("Error caching students list:", error);
      return null;
    }
  }

  static async cacheTeachersList(branchId: string) {
    const cacheKey = `teachers:${branchId}`;
    const cached = this.get(cacheKey);
    if (cached) return cached;

    try {
      const teachers = await prisma.teacher.findMany({
        where: { branch_id: branchId },
        include: {
          user: { select: { first_name: true, last_name: true, email: true } },
        },
      });

      this.set(cacheKey, teachers, 1800);
      return teachers;
    } catch (error) {
      console.error("Error caching teachers list:", error);
      return null;
    }
  }

  static async cacheCoursesList(branchId: string) {
    const cacheKey = `courses:${branchId}`;
    const cached = this.get(cacheKey);
    if (cached) return cached;

    try {
      const courses = await prisma.course.findMany({
        where: { branch_id: branchId },
      });

      this.set(cacheKey, courses, 3600); // 1 hour
      return courses;
    } catch (error) {
      console.error("Error caching courses list:", error);
      return null;
    }
  }

  static async cacheBranchList() {
    const cacheKey = "branches:all";
    const cached = this.get(cacheKey);
    if (cached) return cached;

    try {
      const branches = await prisma.branch.findMany();
      this.set(cacheKey, branches, 7200); // 2 hours
      return branches;
    } catch (error) {
      console.error("Error caching branches list:", error);
      return null;
    }
  }

  static async cacheDashboardData(userId: string) {
    const cacheKey = `dashboard:${userId}`;
    const cached = this.get(cacheKey);
    if (cached) return cached;

    try {
      // Aggregate dashboard data
      const dashboardData = {
        cached_at: new Date(),
        userId,
      };

      this.set(cacheKey, dashboardData, 900); // 15 minutes
      return dashboardData;
    } catch (error) {
      console.error("Error caching dashboard data:", error);
      return null;
    }
  }

  static async cacheUserPermissions(userId: string) {
    const cacheKey = `permissions:${userId}`;
    const cached = this.get(cacheKey);
    if (cached) return cached;

    try {
      const userRoles = await prisma.userRole.findMany({
        where: { user_id: userId },
        include: {
          rbac_role: {
            include: { permissions: true },
          },
        },
      });

      const permissions = userRoles.flatMap(
        (ur: any) => ur.rbac_role.permissions
      );
      this.set(cacheKey, permissions, 1800);
      return permissions;
    } catch (error) {
      console.error("Error caching user permissions:", error);
      return null;
    }
  }

  // ============= Cache Invalidation =============

  static invalidateStudentCache(branchId?: string) {
    if (branchId) {
      this.cache.forEach((_, key) => {
        if (key.startsWith(`students:${branchId}`)) this.cache.delete(key);
      });
    } else {
      this.cache.forEach((_, key) => {
        if (key.startsWith("students:")) this.cache.delete(key);
      });
    }
  }

  static invalidateTeacherCache(branchId?: string) {
    if (branchId) {
      this.cache.delete(`teachers:${branchId}`);
    } else {
      this.cache.forEach((_, key) => {
        if (key.startsWith("teachers:")) this.cache.delete(key);
      });
    }
  }

  static invalidateCourseCache(branchId?: string) {
    if (branchId) {
      this.cache.delete(`courses:${branchId}`);
    } else {
      this.cache.forEach((_, key) => {
        if (key.startsWith("courses:")) this.cache.delete(key);
      });
    }
  }

  static invalidateBranchCache() {
    this.cache.delete("branches:all");
  }

  static invalidateDashboardCache(userId?: string) {
    if (userId) {
      this.cache.delete(`dashboard:${userId}`);
    } else {
      this.cache.forEach((_, key) => {
        if (key.startsWith("dashboard:")) this.cache.delete(key);
      });
    }
  }

  static invalidatePermissionsCache(userId?: string) {
    if (userId) {
      this.cache.delete(`permissions:${userId}`);
    } else {
      this.cache.forEach((_, key) => {
        if (key.startsWith("permissions:")) this.cache.delete(key);
      });
    }
  }

  static invalidateUserCache(userId: string) {
    this.invalidatePermissionsCache(userId);
    this.invalidateDashboardCache(userId);
  }

  static invalidateAllCache() {
    this.clear();
  }

  // ============= Performance Metrics =============

  static getStats() {
    try {
      const totalRequests = this.stats.hits + this.stats.misses;
      const hitRate =
        totalRequests > 0
          ? ((this.stats.hits / totalRequests) * 100).toFixed(2)
          : "0.00";
      const missRate =
        totalRequests > 0
          ? ((this.stats.misses / totalRequests) * 100).toFixed(2)
          : "0.00";

      return {
        success: true,
        data: {
          cache_size: this.cache.size,
          hits: this.stats.hits,
          misses: this.stats.misses,
          sets: this.stats.sets,
          total_requests: totalRequests,
          hit_rate: `${hitRate}%`,
          miss_rate: `${missRate}%`,
          memory_usage: process.memoryUsage().heapUsed,
        },
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static getDetailedStats() {
    try {
      const stats: any = {
        total_entries: this.cache.size,
        entries_by_type: {},
        most_accessed: [],
        expiring_soon: [],
      };

      const now = new Date();
      const topAccessed: CacheEntry<any>[] = [];
      const expiringSoon: CacheEntry<any>[] = [];

      this.cache.forEach((entry) => {
        const type = entry.key.split(":")[0];
        stats.entries_by_type[type] = (stats.entries_by_type[type] || 0) + 1;

        topAccessed.push(entry);

        const timeToExpiry = entry.expiresAt.getTime() - now.getTime();
        if (timeToExpiry > 0 && timeToExpiry < 300000) {
          // Less than 5 minutes
          expiringSoon.push(entry);
        }
      });

      stats.most_accessed = topAccessed
        .sort((a, b) => b.hitCount - a.hitCount)
        .slice(0, 5)
        .map((e) => ({ key: e.key, hits: e.hitCount }));

      stats.expiring_soon = expiringSoon
        .slice(0, 5)
        .map((e) => ({
          key: e.key,
          expires_in_seconds: Math.round(
            (e.expiresAt.getTime() - now.getTime()) / 1000
          ),
        }));

      return { success: true, data: stats };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static resetStats() {
    this.stats = { hits: 0, misses: 0, sets: 0 };
    return { success: true, message: "Cache stats reset" };
  }

  static getCacheEntry(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return { success: false, message: "Cache entry not found" };

    return {
      success: true,
      data: {
        key: entry.key,
        hit_count: entry.hitCount,
        created_at: entry.createdAt,
        expires_at: entry.expiresAt,
        ttl_seconds: Math.round(
          (entry.expiresAt.getTime() - new Date().getTime()) / 1000
        ),
      },
    };
  }
}
