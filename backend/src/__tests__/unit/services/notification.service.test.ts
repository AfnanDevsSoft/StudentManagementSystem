import { NotificationService } from '../../../services/notification.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        notification: {
            create: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            groupBy: jest.fn(),
        },
    },
}));

describe('NotificationService Unit Tests', () => {
    const mockNotification = {
        id: 'notif-123',
        user_id: 'user-123',
        notification_type: 'in_app',
        subject: 'Test',
        message: 'Test message',
        status: 'sent',
        sent_at: new Date(),
        read_at: null,
    };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('sendNotification', () => {
        it('should send notification successfully', async () => {
            (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);
            (prisma.notification.update as jest.Mock).mockResolvedValue({ ...mockNotification, status: 'sent' });

            const result = await NotificationService.sendNotification('user-123', 'in_app', 'Test', 'Message');

            expect(result.success).toBe(true);
            expect(result.message).toContain('sent successfully');
        });
    });

    describe('getNotifications', () => {
        it('should return user notifications', async () => {
            (prisma.notification.findMany as jest.Mock).mockResolvedValue([mockNotification]);
            (prisma.notification.count as jest.Mock).mockResolvedValue(1);

            const result = await NotificationService.getNotifications('user-123');

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
        });

        it('should filter unread only', async () => {
            (prisma.notification.findMany as jest.Mock).mockResolvedValue([mockNotification]);
            (prisma.notification.count as jest.Mock).mockResolvedValue(1);

            await NotificationService.getNotifications('user-123', 20, 0, true);

            expect(prisma.notification.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ read_at: null }),
                })
            );
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            (prisma.notification.update as jest.Mock).mockResolvedValue({ ...mockNotification, read_at: new Date() });

            const result = await NotificationService.markAsRead('notif-123');

            expect(result.success).toBe(true);
            expect(result.message).toContain('marked as read');
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all notifications as read', async () => {
            (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

            const result = await NotificationService.markAllAsRead('user-123');

            expect(result.success).toBe(true);
            expect(result.message).toContain('5 notifications');
        });
    });

    describe('deleteNotification', () => {
        it('should delete notification', async () => {
            (prisma.notification.delete as jest.Mock).mockResolvedValue(mockNotification);

            const result = await NotificationService.deleteNotification('notif-123');

            expect(result.success).toBe(true);
        });
    });

    describe('sendBulkNotifications', () => {
        it('should send bulk notifications', async () => {
            (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);
            (prisma.notification.update as jest.Mock).mockResolvedValue(mockNotification);

            const result = await NotificationService.sendBulkNotifications(
                ['user-1', 'user-2'],
                'in_app',
                'Bulk Test',
                'Message'
            );

            expect(result.success).toBe(true);
            expect(result.data!.totalCount).toBe(2);
        });
    });

    describe('getNotificationStats', () => {
        it('should return notification statistics', async () => {
            (prisma.notification.count as jest.Mock).mockResolvedValue(100);
            (prisma.notification.groupBy as jest.Mock).mockResolvedValue([
                { notification_type: 'email', _count: 50 },
                { notification_type: 'in_app', _count: 50 },
            ]);

            const result = await NotificationService.getNotificationStats();

            expect(result.success).toBe(true);
            expect(result.data!.total).toBe(100);
        });
    });
});
