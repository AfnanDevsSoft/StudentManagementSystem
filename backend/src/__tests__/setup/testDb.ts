import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import { setPrismaClient } from '../../lib/db';

const execAsync = promisify(exec);

// Use separate test database with correct credentials
const testDatabaseUrl = process.env.DATABASE_URL?.replace('/schoolManagement', '/schoolManagement_test') ||
    'postgresql://postgres:admin123@localhost:5432/schoolManagement_test';

export const prisma = new PrismaClient({
    datasources: {
        db: {
            url: testDatabaseUrl,
        },
    },
});

// Inject test prisma instance into services
setPrismaClient(prisma);

/**
 * Setup test database - Run migrations and clear data
 */
export async function setupTestDatabase() {
    try {
        console.log('📦 Setting up test database...');

        // Run Prisma migrations
        process.env.DATABASE_URL = testDatabaseUrl;
        await execAsync('npx prisma migrate deploy');

        console.log('✅ Test database ready');
    } catch (error) {
        console.error('❌ Test database setup failed:', error);
        throw error;
    }
}

/**
 * Clear all data from test database
 */
export async function clearDatabase() {
    const tablenames = await prisma.$queryRaw<
        Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
        .map(({ tablename }) => tablename)
        .filter((name) => name !== '_prisma_migrations')
        .map((name) => `"public"."${name}"`)
        .join(', ');

    try {
        // Disable triggers and truncate with cascade
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
    } catch (error) {
        console.log({ error });
    }
}

/**
 * Teardown test database
 */
export async function teardownTestDatabase() {
    await prisma.$disconnect();
}

/**
 * Reset database - Clear and reseed
 */
export async function resetDatabase() {
    await clearDatabase();
    // Optionally seed minimal required data
}
