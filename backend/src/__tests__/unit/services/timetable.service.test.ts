import TimetableService from '../../../services/timetable.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        timeSlot: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
        room: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
        timetableEntry: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
        studentEnrollment: { findMany: jest.fn() },
        course: { findUnique: jest.fn() },
    },
}));

describe('TimetableService Unit Tests', () => {
    const mockTimeSlot = { id: 'ts-123', slot_name: 'Period 1', start_time: '08:00', end_time: '09:00', branch_id: 'b-123' };
    const mockRoom = { id: 'room-123', room_number: '101', building: 'Main', branch_id: 'b-123' };
    const mockEntry = { id: 'entry-123', day_of_week: 1, course_id: 'c-123', time_slot_id: 'ts-123' };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('getTimeSlots', () => {
        it('should return time slots for branch', async () => {
            (prisma.timeSlot.findMany as jest.Mock).mockResolvedValue([mockTimeSlot]);
            const result = await TimetableService.getTimeSlots('b-123');
            expect(result.success).toBe(true);
            expect(result.data).toEqual([mockTimeSlot]);
        });
    });

    describe('createTimeSlot', () => {
        it('should create time slot', async () => {
            (prisma.timeSlot.create as jest.Mock).mockResolvedValue(mockTimeSlot);
            const result = await TimetableService.createTimeSlot({ branch_id: 'b-123', slot_name: 'Period 1' });
            expect(result.success).toBe(true);
            expect(result.message).toContain('created successfully');
        });
    });

    describe('updateTimeSlot', () => {
        it('should update time slot', async () => {
            (prisma.timeSlot.update as jest.Mock).mockResolvedValue(mockTimeSlot);
            const result = await TimetableService.updateTimeSlot('ts-123', { slot_name: 'Updated' });
            expect(result.success).toBe(true);
        });
    });

    describe('deleteTimeSlot', () => {
        it('should soft delete time slot', async () => {
            (prisma.timeSlot.update as jest.Mock).mockResolvedValue({ ...mockTimeSlot, is_active: false });
            const result = await TimetableService.deleteTimeSlot('ts-123');
            expect(result.success).toBe(true);
        });
    });

    describe('getRooms', () => {
        it('should return rooms for branch', async () => {
            (prisma.room.findMany as jest.Mock).mockResolvedValue([mockRoom]);
            const result = await TimetableService.getRooms('b-123');
            expect(result.success).toBe(true);
        });
    });

    describe('createRoom', () => {
        it('should create room', async () => {
            (prisma.room.create as jest.Mock).mockResolvedValue(mockRoom);
            const result = await TimetableService.createRoom({ branch_id: 'b-123', room_number: '101' });
            expect(result.success).toBe(true);
        });
    });

    describe('getCourseTimetable', () => {
        it('should return course timetable', async () => {
            (prisma.timetableEntry.findMany as jest.Mock).mockResolvedValue([mockEntry]);
            const result = await TimetableService.getCourseTimetable('c-123');
            expect(result.success).toBe(true);
        });
    });

    describe('getTeacherTimetable', () => {
        it('should return teacher timetable', async () => {
            (prisma.timetableEntry.findMany as jest.Mock).mockResolvedValue([mockEntry]);
            const result = await TimetableService.getTeacherTimetable('t-123');
            expect(result.success).toBe(true);
        });
    });

    describe('getStudentTimetable', () => {
        it('should return student timetable via enrollments', async () => {
            (prisma.studentEnrollment.findMany as jest.Mock).mockResolvedValue([{ course_id: 'c-123' }]);
            (prisma.timetableEntry.findMany as jest.Mock).mockResolvedValue([mockEntry]);
            const result = await TimetableService.getStudentTimetable('s-123');
            expect(result.success).toBe(true);
        });
    });

    describe('createTimetableEntry', () => {
        it('should create timetable entry when no conflicts', async () => {
            (prisma.course.findUnique as jest.Mock).mockResolvedValue({ teacher_id: 't-123' });
            (prisma.timetableEntry.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.timetableEntry.create as jest.Mock).mockResolvedValue(mockEntry);

            const result = await TimetableService.createTimetableEntry({
                course_id: 'c-123', time_slot_id: 'ts-123', day_of_week: 1, academic_year_id: 'ay-123'
            });
            expect(result.success).toBe(true);
        });
    });

    describe('deleteTimetableEntry', () => {
        it('should delete timetable entry', async () => {
            (prisma.timetableEntry.delete as jest.Mock).mockResolvedValue(mockEntry);
            const result = await TimetableService.deleteTimetableEntry('entry-123');
            expect(result.success).toBe(true);
        });
    });
});
