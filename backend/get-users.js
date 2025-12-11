const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUsers() {
    const users = await prisma.user.findMany({
        orderBy: { created_at: 'desc' },
        take: 10,
        include: { role: true }
    });
    console.log('Recent Users:');
    for (const u of users) {
        console.log('---');
        console.log('Username:', u.username);
        console.log('Email:', u.email);
        console.log('Role:', u.role?.name);
        console.log('Active:', u.is_active);
    }
    await prisma.$disconnect();
}
getUsers().catch(console.error);
