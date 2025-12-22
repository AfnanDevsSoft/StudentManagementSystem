import HealthService from '../../../services/health.service';
import { prisma } from '../../../lib/db';

jest.mock('../../../lib/db', () => ({
    prisma: {
        healthRecord: { findUnique: jest.fn(), upsert: jest.fn(), create: jest.fn() },
        medicalCheckup: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
        vaccination: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
        medicalIncident: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
        student: { findUnique: jest.fn() },
    },
}));

describe('HealthService Unit Tests', () => {
    const mockHealthRecord = { id: 'hr-123', student_id: 's-123', blood_group: 'O+' };
    const mockCheckup = { id: 'ck-123', health_record_id: 'hr-123', height: 170, weight: 60 };
    const mockVaccination = { id: 'vac-123', vaccine_name: 'COVID-19', dose_number: 1 };
    const mockIncident = { id: 'inc-123', student_id: 's-123', severity: 'minor' };

    beforeEach(() => { jest.clearAllMocks(); });

    describe('getHealthRecord', () => {
        it('should return health record', async () => {
            (prisma.healthRecord.findUnique as jest.Mock).mockResolvedValue(mockHealthRecord);
            const result = await HealthService.getHealthRecord('s-123');
            expect(result.success).toBe(true);
        });
    });

    describe('upsertHealthRecord', () => {
        it('should create or update health record', async () => {
            (prisma.healthRecord.upsert as jest.Mock).mockResolvedValue(mockHealthRecord);
            const result = await HealthService.upsertHealthRecord('s-123', { blood_group: 'O+' });
            expect(result.success).toBe(true);
        });
    });

    describe('getMedicalCheckups', () => {
        it('should return medical checkups', async () => {
            (prisma.healthRecord.findUnique as jest.Mock).mockResolvedValue(mockHealthRecord);
            (prisma.medicalCheckup.findMany as jest.Mock).mockResolvedValue([mockCheckup]);
            const result = await HealthService.getMedicalCheckups('s-123');
            expect(result.success).toBe(true);
        });

        it('should error if no health record', async () => {
            (prisma.healthRecord.findUnique as jest.Mock).mockResolvedValue(null);
            const result = await HealthService.getMedicalCheckups('s-123');
            expect(result.success).toBe(false);
        });
    });

    describe('addMedicalCheckup', () => {
        it('should add medical checkup', async () => {
            (prisma.healthRecord.findUnique as jest.Mock).mockResolvedValue(mockHealthRecord);
            (prisma.medicalCheckup.create as jest.Mock).mockResolvedValue(mockCheckup);
            const result = await HealthService.addMedicalCheckup('s-123', { checkup_date: new Date(), height: 170 });
            expect(result.success).toBe(true);
        });
    });

    describe('getVaccinations', () => {
        it('should return vaccinations', async () => {
            (prisma.healthRecord.findUnique as jest.Mock).mockResolvedValue(mockHealthRecord);
            (prisma.vaccination.findMany as jest.Mock).mockResolvedValue([mockVaccination]);
            const result = await HealthService.getVaccinations('s-123');
            expect(result.success).toBe(true);
        });
    });

    describe('addVaccination', () => {
        it('should add vaccination', async () => {
            (prisma.healthRecord.findUnique as jest.Mock).mockResolvedValue(mockHealthRecord);
            (prisma.vaccination.create as jest.Mock).mockResolvedValue(mockVaccination);
            const result = await HealthService.addVaccination('s-123', { vaccine_name: 'COVID-19', administered_date: new Date() });
            expect(result.success).toBe(true);
        });
    });

    describe('getMedicalIncidents', () => {
        it('should return medical incidents', async () => {
            (prisma.medicalIncident.findMany as jest.Mock).mockResolvedValue([mockIncident]);
            const result = await HealthService.getMedicalIncidents('s-123');
            expect(result.success).toBe(true);
        });
    });

    describe('reportIncident', () => {
        it('should report incident', async () => {
            (prisma.medicalIncident.create as jest.Mock).mockResolvedValue(mockIncident);
            const result = await HealthService.reportIncident({ student_id: 's-123', incident_type: 'injury', severity: 'minor' });
            expect(result.success).toBe(true);
        });
    });
});
