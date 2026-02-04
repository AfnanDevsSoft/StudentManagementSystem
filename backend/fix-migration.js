#!/usr/bin/env node
const { Client } = require('pg');

async function fixFailedMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database...');

        // Check if the migration exists and its state
        const check = await client.query(
            `SELECT finished_at, rolled_back_at, logs
             FROM "_prisma_migrations"
             WHERE migration_name = '20260204080335_add_cascade_delete_to_branch'`
        );

        if (check.rows.length === 0) {
            console.log('ℹ Migration record not present, will be applied fresh');
        } else {
            const row = check.rows[0];
            const isFailed = !row.finished_at || row.rolled_back_at || row.logs;

            if (isFailed) {
                const result = await client.query(
                    `DELETE FROM "_prisma_migrations"
                     WHERE migration_name = '20260204080335_add_cascade_delete_to_branch'`
                );
                console.log('✓ Removed failed migration record, will re-apply');
            } else {
                console.log('ℹ Migration already applied successfully');
            }
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
