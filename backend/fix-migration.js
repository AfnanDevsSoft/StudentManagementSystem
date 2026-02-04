#!/usr/bin/env node
const { Client } = require('pg');

async function fixFailedMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database...');

        // Delete the failed migration record
        const result = await client.query(
            `DELETE FROM "_prisma_migrations" 
       WHERE migration_name = '20260204080335_add_cascade_delete_to_branch' 
       AND finished_at IS NULL`
        );

        if (result.rowCount > 0) {
            console.log('✓ Removed failed migration record');
        } else {
            console.log('ℹ No failed migration found (already fixed or not present)');
        }

        await client.end();
        process.exit(0);
    } catch (error) {
        console.error('Error fixing migration:', error.message);
        // Don't fail the startup, just log and continue
        process.exit(0);
    }
}

fixFailedMigration();
