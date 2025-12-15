
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- LATEST 10 PAYMENTS ---');
    const payments = await prisma.feePayment.findMany({
        take: 10,
        orderBy: { created_at: 'desc' }, // Check creation order first
        include: {
            student: { select: { first_name: true, last_name: true, branch_id: true } },
            // fee: true // Fee relation might be named differently? let's check basic first
        }
    });

    console.dir(payments, { depth: null });

    console.log('--- COUNT ---');
    const count = await prisma.feePayment.count();
    console.log(`Total Payments: ${count}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
