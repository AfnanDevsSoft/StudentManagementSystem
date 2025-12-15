
import { FeeService } from './src/services/fee.service';
import { PrismaClient } from '@prisma/client';

// Mock context for SuperAdmin
const mockUserContext = {
    id: "debug-user",
    role: { name: 'SuperAdmin' },
    branch_id: "debug-branch"
};

async function main() {
    console.log("--- DEBUGGING FEE SERVICE OUTPUT ---");
    try {
        const result = await FeeService.getFeeRecords(
            undefined, // studentId
            undefined, // status
            10, // limit
            0, // offset
            undefined, // branchId
            mockUserContext
        );

        console.log("Success:", result.success);
        console.log("Count:", result.data?.length);
        if (result.data && result.data.length > 0) {
            console.log("First Record Fee:", JSON.stringify(result.data[0].fee, null, 2));
            console.log("First Record Student:", JSON.stringify(result.data[0].student, null, 2));
        } else {
            console.log("No records found.");
        }

    } catch (e) {
        console.error("SERVICE ERROR:", e);
    }
}

main();
