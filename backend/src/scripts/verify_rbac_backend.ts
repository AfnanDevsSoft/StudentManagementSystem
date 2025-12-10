
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

async function verifyRBAC() {
    console.log('Starting RBAC Verification...');

    // 1. Login as SuperAdmin to get baseline counts (optional, but good for context)
    // Actually, let's just login as North Admin
    console.log('Logging in as North Admin...');
    let token: string;
    let branchId: string;
    try {
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'north_admin',
            password: 'password123',
            userType: 'staff'
        });
        console.log('Login Response:', JSON.stringify(loginRes.data, null, 2));
        if (!loginRes.data.success) {
            throw new Error(loginRes.data.message || 'Login returned success: false');
        }
        token = loginRes.data.token || loginRes.data.data?.access_token;
        const user = loginRes.data.user || loginRes.data.data?.user;

        // Since /me doesn't return branch_id, fetch all branches (which should be scoped to just North Campus for this user!)
        console.log("Fetching branches to identify user's branch...");
        const branchesRes = await axios.get(`${BASE_URL}/branches`, { headers: { Authorization: `Bearer ${token}` } });

        // If strict scoping works, I should only see North Campus (or if I see all, I pick North Campus)
        const branches = branchesRes.data.data;
        const northBranch = branches.find((b: any) => b.branch_name === 'North Campus');

        if (northBranch) {
            branchId = northBranch.id;
            console.log(`Identified Branch: ${northBranch.branch_name} (${branchId})`);
        } else if (branches.length === 1) {
            branchId = branches[0].id;
            console.log(`Identified Single Available Branch: ${branches[0].branch_name} (${branchId})`);
        } else {
            console.error("Could not determine North Campus branch from available branches:", branches.map((b: any) => b.branch_name));
            return;
        }
    } catch (error: any) {
        console.error('Login failed:', error.response?.data || error.message);
        if (error.response?.data?.message) console.error('Server Message:', error.response.data.message);
        return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // Helper function to check scoping
    async function checkScoping(endpoint: string, entityName: string, itemsKey: string | null = null) {
        try {
            console.log(`Checking ${entityName}...`);
            const res = await axios.get(`${BASE_URL}/${endpoint}`, { headers });
            const data = itemsKey ? res.data.data[itemsKey] : (Array.isArray(res.data.data) ? res.data.data : []);

            if (!Array.isArray(data)) {
                console.log(`Warning: ${entityName} response is not an array (might be paginated or wrapped). Raw keys: ${Object.keys(res.data.data)}`);
                // Handle simple cases
                return;
            }

            console.log(`Fetched ${data.length} ${entityName}.`);

            let leakCount = 0;
            data.forEach((item: any) => {
                // If item has branch_id, it MUST match
                if (item.branch_id && item.branch_id !== branchId) {
                    leakCount++;
                    console.error(`DATA LEAK: Found ${entityName} from branch ${item.branch_id}! (ID: ${item.id})`);
                }
                // If item has student, check student.branch_id
                if (item.student && item.student.branch_id && item.student.branch_id !== branchId) {
                    leakCount++;
                    console.error(`DATA LEAK: Found ${entityName} for student in branch ${item.student.branch_id}! (ID: ${item.id})`);
                }
            });

            if (leakCount === 0) {
                console.log(`✅ ${entityName} Scoped Correctly.`);
            } else {
                console.error(`❌ ${entityName} FAILED SCPING. ${leakCount} leaks found.`);
            }

        } catch (error: any) {
            console.error(`Failed to fetch ${entityName}:`, error.response?.data?.message || error.message);
        }
    }

    // 2. verify Students
    await checkScoping('students', 'Students');

    // 3. verify Teachers
    await checkScoping('teachers', 'Teachers');

    // 4. verify Branches (should only see own)
    await checkScoping('branches', 'Branches');

    // 5. verify Courses
    await checkScoping('courses', 'Courses');

    // 6. verify Events
    await checkScoping('events', 'Events'); // Query might require params?

    // 7. verify Fees (optional, complex)
    // await checkScoping('fees/structure', 'Fee Structures');

    // 8. verify Library Books
    // await checkScoping('library/books', 'Books'); // Might need params

    console.log('Verification Complete.');
}

verifyRBAC();
