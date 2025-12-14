import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const s = await prisma.user.findFirst({
        where: { role: { name: 'Student' } },
        include: { role: true }
    });
    console.log('Student Username:', s?.username);
}
main().catch(console.error).finally(() => prisma.$disconnect());
