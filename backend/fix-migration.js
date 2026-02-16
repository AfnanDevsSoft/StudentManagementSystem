#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');

async function fixFailedMigration() {
    const prisma = new PrismaClient();
    try {
        const deleted = await prisma.$executeRawUnsafe(
            `DELETE FROM "_prisma_migrations" WHERE migration_name = '20260204080335_add_cascade_delete_to_branch' AND (finished_at IS NULL OR logs IS NOT NULL)`
        );
        if (deleted > 0) {
            console.log('✓ Removed failed migration record, will re-apply');
        } else {
            console.log('ℹ No failed migration to fix');
        }
    } catch (error) {
        console.error('Migration fix error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixFailedMigration();
