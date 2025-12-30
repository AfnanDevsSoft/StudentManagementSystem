import { EmployeeIdService } from "../services/employee-id.service";

/**
 * Migration script to generate Employee IDs and Admission Numbers
 * for existing users and students
 */

async function migrateIds() {
    console.log("🔄 Starting ID migration...\n");

    try {
        // Generate Employee IDs for existing staff
        console.log("👥 Generating Employee IDs for staff...");
        const employeeResult = await EmployeeIdService.bulkGenerateEmployeeIds();
        console.log(`✅ Generated ${employeeResult.generated} employee IDs`);
        console.log(`⏭️  Skipped ${employeeResult.skipped} users\n`);

        // Generate Admission Numbers for existing students
        console.log("🎓 Generating Admission Numbers for students...");
        const admissionResult = await EmployeeIdService.bulkGenerateAdmissionNumbers();
        console.log(`✅ Generated ${admissionResult.generated} admission numbers`);
        console.log(`⏭️  Skipped ${admissionResult.skipped} students\n`);

        console.log("✨ ID migration completed successfully!");
    } catch (error: any) {
        console.error("❌ Migration failed:", error.message);
        process.exit(1);
    }
}

migrateIds()
    .then(() => {
        console.log("\n✅ Migration script completed");
        process.exit(0);
    })
    .catch((error: any) => {
        console.error("\n❌ Migration script failed:", error);
        process.exit(1);
    });
