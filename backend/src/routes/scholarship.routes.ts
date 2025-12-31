import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /scholarships - List all scholarships with pagination
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [scholarships, total] = await Promise.all([
            prisma.scholarship.findMany({
                skip,
                take: limit,
                include: {
                    student: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            student_code: true,
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
            }),
            prisma.scholarship.count(),
        ]);

        res.json({
            success: true,
            data: scholarships.map(s => ({
                ...s,
                name: s.scholarship_name,
                amount: Number(s.amount),
            })),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        });
    } catch (error: any) {
        console.error('Error fetching scholarships:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /scholarships/:id - Get single scholarship
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const scholarship = await prisma.scholarship.findUnique({
            where: { id: req.params.id },
            include: {
                student: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        student_code: true,
                    },
                },
            },
        });

        if (!scholarship) {
            res.status(404).json({ success: false, message: 'Scholarship not found' });
            return;
        }

        res.json({ success: true, data: scholarship });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /scholarships - Create scholarship
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { student_id, name, scholarship_name, scholarship_type, amount, percentage, start_date, end_date, status, remarks, conditions } = req.body;

        // Get branch_id from student
        const student = await prisma.student.findUnique({
            where: { id: student_id },
            select: { branch_id: true },
        });

        if (!student) {
            res.status(400).json({ success: false, message: 'Student not found' });
            return;
        }

        // Get approver (current user) - fallback to a system user for now
        const user = (req as any).user;
        const approved_by = user?.id || student_id; // Fallback

        const scholarship = await prisma.scholarship.create({
            data: {
                student_id: student_id,
                branch_id: student.branch_id,
                scholarship_name: scholarship_name || name,
                scholarship_type: scholarship_type || 'general',
                amount: amount,
                percentage: percentage,
                start_date: new Date(start_date),
                end_date: end_date ? new Date(end_date) : null,
                status: status || 'active',
                remarks: remarks || conditions,
                approved_by: approved_by,
                approval_date: new Date(),
            },
            include: {
                student: true,
            },
        });

        res.status(201).json({ success: true, data: scholarship });
    } catch (error: any) {
        console.error('Error creating scholarship:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// PUT /scholarships/:id - Update scholarship
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const scholarship = await prisma.scholarship.update({
            where: { id: req.params.id },
            data: {
                scholarship_name: req.body.name || req.body.scholarship_name,
                amount: req.body.amount,
                start_date: req.body.start_date ? new Date(req.body.start_date) : undefined,
                end_date: req.body.end_date ? new Date(req.body.end_date) : undefined,
                status: req.body.status,
                remarks: req.body.remarks || req.body.conditions,
            },
        });

        res.json({ success: true, data: scholarship });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// DELETE /scholarships/:id - Delete scholarship
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        await prisma.scholarship.delete({
            where: { id: req.params.id },
        });

        res.json({ success: true, message: 'Scholarship deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;
