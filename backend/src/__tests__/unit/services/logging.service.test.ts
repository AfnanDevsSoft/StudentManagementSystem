import { LoggingService } from '../../../services/logging.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        log: { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), deleteMany: jest.fn() },
        systemHealthCheck: { create: jest.fn() },
        $queryRaw: jest.fn(),
    },
}));

describe('LoggingService Unit Tests', () => {
    const mockLog = { id: 'log-123', level: 'info', message: 'Test', timestamp: new Date() };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('logInfo', () => {
        it('should create info log', async () => {
            (prisma.log.create as jest.Mock).mockResolvedValue(mockLog);
            await LoggingService.logInfo('Test message', { key: 'value' });
            expect(prisma.log.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ level: 'info' })
            }));
        });
    });

    describe('logWarning', () => {
        it('should create warning log', async () => {
            (prisma.log.create as jest.Mock).mockResolvedValue({ ...mockLog, level: 'warn' });
            await LoggingService.logWarning('Warning message');
            expect(prisma.log.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ level: 'warn' })
            }));
        });
    });

    describe('logError', () => {
        it('should create error log with stack trace', async () => {
            (prisma.log.create as jest.Mock).mockResolvedValue({ ...mockLog, level: 'error' });
            const error = new Error('Test error');
            await LoggingService.logError('Error occurred', error);
            expect(prisma.log.create).toHaveBeenCalled();
        });
    });

    describe('logDebug', () => {
        it('should create debug log', async () => {
            (prisma.log.create as jest.Mock).mockResolvedValue({ ...mockLog, level: 'debug' });
            await LoggingService.logDebug('Debug message');
            expect(prisma.log.create).toHaveBeenCalled();
        });
    });

    describe('logApiRequest', () => {
        it('should log API request', async () => {
            (prisma.log.create as jest.Mock).mockResolvedValue(mockLog);
            await LoggingService.logApiRequest('GET', '/api/users', 'u-123', 200, 50);
            expect(prisma.log.create).toHaveBeenCalled();
        });
    });

    describe('getErrorRate', () => {
        it('should return error rate', async () => {
            (prisma.log.count as jest.Mock).mockResolvedValueOnce(100).mockResolvedValueOnce(5);
            const result = await LoggingService.getErrorRate({ start: new Date(), end: new Date() });
            expect(result.success).toBe(true);
            expect(result.data!.error_rate).toBe('5.00%');
        });
    });

    describe('checkMemoryUsage', () => {
        it('should return memory stats', async () => {
            const result = await LoggingService.checkMemoryUsage();
            expect(result.rss_mb).toBeDefined();
            expect(result.heap_used_mb).toBeDefined();
        });
    });

    describe('archiveLogs', () => {
        it('should delete old logs', async () => {
            (prisma.log.deleteMany as jest.Mock).mockResolvedValue({ count: 100 });
            const result = await LoggingService.archiveLogs(30);
            expect(result.success).toBe(true);
            expect(result.data!.deleted_count).toBe(100);
        });
    });

    describe('exportLogs', () => {
        it('should export logs as JSON', async () => {
            (prisma.log.findMany as jest.Mock).mockResolvedValue([mockLog]);
            const result = await LoggingService.exportLogs(new Date(), new Date(), 'json');
            expect(result.success).toBe(true);
        });

        it('should export logs as CSV', async () => {
            (prisma.log.findMany as jest.Mock).mockResolvedValue([mockLog]);
            const result = await LoggingService.exportLogs(new Date(), new Date(), 'csv');
            expect(result.success).toBe(true);
            expect(result.format).toBe('csv');
        });
    });
});
