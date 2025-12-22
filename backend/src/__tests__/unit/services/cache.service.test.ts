import { CacheService } from '../../../services/cache.service';

describe('CacheService Unit Tests', () => {
    beforeEach(() => { CacheService.clear(); });

    describe('set and get', () => {
        it('should set and get a value', () => {
            CacheService.set('test-key', { data: 'test' });
            const result = CacheService.get('test-key');
            expect(result).toEqual({ data: 'test' });
        });

        it('should return null for non-existent key', () => {
            const result = CacheService.get('nonexistent');
            expect(result).toBeNull();
        });

        it('should return null for expired key', () => {
            CacheService.set('expired', 'value', -1); // TTL of -1 seconds
            const result = CacheService.get('expired');
            expect(result).toBeNull();
        });
    });

    describe('delete', () => {
        it('should delete a key', () => {
            CacheService.set('to-delete', 'value');
            expect(CacheService.delete('to-delete')).toBe(true);
            expect(CacheService.get('to-delete')).toBeNull();
        });
    });

    describe('exists', () => {
        it('should return true for existing key', () => {
            CacheService.set('exists-key', 'value');
            expect(CacheService.exists('exists-key')).toBe(true);
        });

        it('should return false for non-existent key', () => {
            expect(CacheService.exists('nonexistent')).toBe(false);
        });
    });

    describe('clear', () => {
        it('should clear all cache entries', () => {
            CacheService.set('key1', 'value1');
            CacheService.set('key2', 'value2');
            CacheService.clear();
            expect(CacheService.get('key1')).toBeNull();
            expect(CacheService.get('key2')).toBeNull();
        });
    });

    describe('getStats', () => {
        it('should return cache statistics', () => {
            CacheService.set('key', 'value');
            CacheService.get('key');
            CacheService.get('nonexistent');
            const stats = CacheService.getStats();
            expect(stats.success).toBe(true);
            expect(stats.data!.hits).toBe(1);
            expect(stats.data!.misses).toBe(1);
        });
    });

    describe('invalidation', () => {
        it('should invalidate student cache', () => {
            CacheService.set('students:b-123:1:20', []);
            CacheService.invalidateStudentCache('b-123');
            expect(CacheService.exists('students:b-123:1:20')).toBe(false);
        });

        it('should invalidate all cache', () => {
            CacheService.set('key1', 'value1');
            CacheService.set('key2', 'value2');
            CacheService.invalidateAllCache();
            expect(CacheService.getStats().data!.cache_size).toBe(0);
        });
    });

    describe('resetStats', () => {
        it('should reset cache stats', () => {
            CacheService.set('key', 'value');
            CacheService.get('key');
            CacheService.resetStats();
            const stats = CacheService.getStats();
            expect(stats.data!.hits).toBe(0);
        });
    });
});
