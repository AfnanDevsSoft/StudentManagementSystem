
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

async function main() {
    console.log('--- VERIFYING STUDENT USER CREATION ---');
    try {
        // 1. Login as SuperAdmin
        console.log('1. Logging in as SuperAdmin...');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'admin1',
            password: 'password123'
        });
        const adminToken = adminLogin.data.token;
        console.log('   Admin Login Successful.');

        // 2. Get a Branch
        console.log('2. Fetching Branch ID...');
        const branches = await axios.get(`${BASE_URL}/branches`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const branchId = branches.data.data[0].id;
        console.log(`   Using Branch ID: ${branchId}`);

        // 3. Create Student with Configured User
        console.log('3. Creating Student with User Account...');
        const timestamp = Date.now();
        const studentData = {
            first_name: 'Test',
            last_name: `Student_${timestamp}`,
            student_code: `ST_${timestamp}`,
            date_of_birth: '2010-01-01',
            admission_date: '2024-01-01',
            branch_id: branchId,
            // User Credentials
            username: `student_${timestamp}`,
            password: 'password123',
            personal_email: `student_${timestamp}@example.com`
        };

        const createRes = await axios.post(`${BASE_URL}/students`, studentData, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        console.log('   Student Created:', createRes.data.id);
        if (createRes.data.user) {
            console.log('   Linked User Found in Response:', createRes.data.user.username);
        } else {
            console.error('   ❌ FAILED: Response missing linked User object');
        }

        // 4. Trace Login with New Credentials
        console.log(`4. Attempting Login as New Student (student_${timestamp})...`);
        try {
            const studentLogin = await axios.post(`${BASE_URL}/auth/login`, {
                username: `student_${timestamp}`,
                password: 'password123'
            });

            console.log('   Login Successful!');
            const studentToken = studentLogin.data.token;
            const studentUser = studentLogin.data.user;

            console.log(`   User Role: ${studentUser.role.name}`);

            if (studentUser.role.name === 'Student') {
                console.log('   ✅ SUCCESS: User created with correct Student role.');
            } else {
                console.error(`   ❌ FAIL: Incorrect Role. Expected 'Student', got '${studentUser.role.name}'`);
            }

            // 5. Verify /me endpoint
            const meRes = await axios.get(`${BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${studentToken}` }
            });
            console.log('   /auth/me Validation: OK');

        } catch (loginError: any) {
            console.error('   ❌ LOGIN FAILED:', loginError.response?.data || loginError.message);
        }

    } catch (error: any) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

main();
