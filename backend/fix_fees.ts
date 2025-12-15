
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- FIXING FEES ---');
    // Update fees with empty names
    const result = await prisma.fee.updateMany({
        where: {
            fee_name: ''
        },
        data: {
            fee_name: 'Tuition Fee 2025'
        }
    });

    // Also update fees that might be just named "undefined" string if any
    const result2 = await prisma.fee.updateMany({
        where: { fee_name: 'undefined' },
        data: { fee_name: 'Tuition Fee 2025' }
    });

    console.log(`Updated ${result.count + result2.count} fees.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
