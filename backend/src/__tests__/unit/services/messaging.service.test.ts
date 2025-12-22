import { MessagingService } from '../../../services/messaging.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        user: { findUnique: jest.fn() },
        directMessage: { create: jest.fn(), findMany: jest.fn(), update: jest.fn(), updateMany: jest.fn(), count: jest.fn() },
    },
}));

describe('MessagingService Unit Tests', () => {
    const mockMessage = { id: 'msg-123', sender_id: 'u-1', recipient_id: 'u-2', subject: 'Test', message_body: 'Hello' };
    const mockUser = { id: 'u-1', first_name: 'John', last_name: 'Doe', email: 'john@test.com' };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('sendMessage', () => {
        it('should send message successfully', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (prisma.directMessage.create as jest.Mock).mockResolvedValue(mockMessage);
            const result = await MessagingService.sendMessage('u-1', 'u-2', { subject: 'Test', messageBody: 'Hello' });
            expect(result.success).toBe(true);
            expect(result.message).toContain('sent successfully');
        });

        it('should fail if users not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            const result = await MessagingService.sendMessage('u-1', 'u-2', { subject: 'Test', messageBody: 'Hello' });
            expect(result.success).toBe(false);
        });
    });

    describe('getInboxMessages', () => {
        it('should return inbox with pagination', async () => {
            (prisma.directMessage.findMany as jest.Mock).mockResolvedValue([mockMessage]);
            (prisma.directMessage.count as jest.Mock).mockResolvedValue(1);
            const result = await MessagingService.getInboxMessages('u-2');
            expect(result.success).toBe(true);
            expect(result.pagination).toBeDefined();
        });
    });

    describe('getSentMessages', () => {
        it('should return sent messages', async () => {
            (prisma.directMessage.findMany as jest.Mock).mockResolvedValue([mockMessage]);
            (prisma.directMessage.count as jest.Mock).mockResolvedValue(1);
            const result = await MessagingService.getSentMessages('u-1');
            expect(result.success).toBe(true);
        });
    });

    describe('getConversation', () => {
        it('should return conversation between users', async () => {
            (prisma.directMessage.findMany as jest.Mock).mockResolvedValue([mockMessage]);
            const result = await MessagingService.getConversation('u-1', 'u-2');
            expect(result.success).toBe(true);
        });
    });

    describe('markAsRead', () => {
        it('should mark message as read', async () => {
            (prisma.directMessage.update as jest.Mock).mockResolvedValue({ ...mockMessage, read_at: new Date() });
            const result = await MessagingService.markAsRead('msg-123');
            expect(result.success).toBe(true);
        });
    });

    describe('markMultipleAsRead', () => {
        it('should mark multiple messages as read', async () => {
            (prisma.directMessage.updateMany as jest.Mock).mockResolvedValue({ count: 3 });
            const result = await MessagingService.markMultipleAsRead(['msg-1', 'msg-2', 'msg-3']);
            expect(result.success).toBe(true);
        });
    });

    describe('deleteMessage', () => {
        it('should soft delete message', async () => {
            (prisma.directMessage.update as jest.Mock).mockResolvedValue({ ...mockMessage, is_deleted: true });
            const result = await MessagingService.deleteMessage('msg-123');
            expect(result.success).toBe(true);
        });
    });

    describe('searchMessages', () => {
        it('should search messages', async () => {
            (prisma.directMessage.findMany as jest.Mock).mockResolvedValue([mockMessage]);
            const result = await MessagingService.searchMessages('u-1', 'test');
            expect(result.success).toBe(true);
        });
    });

    describe('getUnreadCount', () => {
        it('should return unread count', async () => {
            (prisma.directMessage.count as jest.Mock).mockResolvedValue(5);
            const result = await MessagingService.getUnreadCount('u-2');
            expect(result.success).toBe(true);
            expect(result.data!.unreadCount).toBe(5);
        });
    });
});
