import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function runMigration() {
    try {
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, "../prisma/migrations/20251226_rename_ids_add_working_days/migration.sql"),
            "utf-8"
        );

        console.log("Running migration SQL...");
        await prisma.$executeRawUnsafe(migrationSQL);
        console.log("✅ Migration completed successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

runMigration();
