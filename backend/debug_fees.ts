
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- FEE STRUCTURES ---');
    const fees = await prisma.fee.findMany({
        select: { id: true, fee_name: true, fee_type: true, amount: true }
    });
    console.dir(fees, { depth: null });
    console.log(`Total Fees: ${fees.length}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
