import EventsService from '../../../services/events.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        event: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
    },
}));

describe('EventsService Unit Tests', () => {
    const mockEvent = { id: 'evt-123', title: 'Annual Day', branch_id: 'b-123', event_type: 'cultural', is_active: true };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('getEvents', () => {
        it('should return events for branch', async () => {
            (prisma.event.findMany as jest.Mock).mockResolvedValue([mockEvent]);
            const result = await EventsService.getEvents('b-123');
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
        });

        it('should filter by event type', async () => {
            (prisma.event.findMany as jest.Mock).mockResolvedValue([mockEvent]);
            await EventsService.getEvents('b-123', { eventType: 'cultural' });
            expect(prisma.event.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ event_type: 'cultural' })
            }));
        });
    });

    describe('getUpcomingEvents', () => {
        it('should return upcoming events', async () => {
            (prisma.event.findMany as jest.Mock).mockResolvedValue([mockEvent]);
            const result = await EventsService.getUpcomingEvents('b-123');
            expect(result.success).toBe(true);
        });
    });

    describe('createEvent', () => {
        it('should create event', async () => {
            (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);
            const result = await EventsService.createEvent({
                branch_id: 'b-123', title: 'Test Event', start_date: new Date(), end_date: new Date()
            });
            expect(result.success).toBe(true);
        });
    });

    describe('updateEvent', () => {
        it('should update event', async () => {
            (prisma.event.update as jest.Mock).mockResolvedValue({ ...mockEvent, title: 'Updated' });
            const result = await EventsService.updateEvent('evt-123', { title: 'Updated' });
            expect(result.success).toBe(true);
        });
    });

    describe('deleteEvent', () => {
        it('should soft delete event', async () => {
            (prisma.event.update as jest.Mock).mockResolvedValue({ ...mockEvent, is_active: false });
            const result = await EventsService.deleteEvent('evt-123');
            expect(result.success).toBe(true);
        });
    });

    describe('getMonthlyCalendar', () => {
        it('should return monthly calendar', async () => {
            (prisma.event.findMany as jest.Mock).mockResolvedValue([mockEvent]);
            const result = await EventsService.getMonthlyCalendar('b-123', 2024, 12);
            expect(result.success).toBe(true);
        });
    });
});
