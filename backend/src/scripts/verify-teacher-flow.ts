
import axios from 'axios';

const API_URL = 'http://localhost:3003/api/v1';

async function verifyFlow() {
    try {
        console.log('1. Logging in as Branch Admin (afnanahmed)...');
        const adminLogin = await axios.post(`${API_URL}/auth/login`, {
            username: 'afnanahmed',
            password: 'password1234'
        });

        console.log('Login Response:', JSON.stringify(adminLogin.data, null, 2));

        if (!adminLogin.data.success) {
            throw new Error('Admin login failed');
        }

        const adminToken = adminLogin.data.token;
        console.log('✅ Admin logged in. Token received.');

        // Generate unique teacher credentials
        const timestamp = Date.now();
        const username = `ver_teacher_${timestamp}`;
        const password = 'password123';
        const email = `${username}@example.com`;

        console.log(`2. Creating new Teacher: ${username}...`);
        const createTeacher = await axios.post(
            `${API_URL}/teachers`,
            {
                employee_code: `EMP_${timestamp}`,
                first_name: "Verified",
                last_name: "Teacher",
                email: email,
                phone: "+923001234567",
                hire_date: "2024-01-01",
                employment_type: "Full-Time",
                username: username,
                password: password,
                designation: "Test Teacher",
                department: "Science",
                qualification: "M.Sc"
            },
            {
                headers: { Authorization: `Bearer ${adminToken}` }
            }
        );

        if (!createTeacher.data.success) {
            throw new Error(`Teacher creation failed: ${createTeacher.data.message}`);
        }
        console.log('✅ Teacher created successfully.');
        console.log('   User ID:', createTeacher.data.data.user_id);
        console.log('   Branch ID:', createTeacher.data.data.branch_id);

        console.log('3. Attempting to Login as New Teacher...');
        const teacherLogin = await axios.post(`${API_URL}/auth/login`, {
            username: username,
            password: password
        });

        if (!teacherLogin.data.success) {
            throw new Error('Teacher login failed');
        }

        console.log('✅ Teacher login successful!');
        console.log('   Token:', teacherLogin.data.token ? 'Received' : 'Missing');
        console.log('   Role:', teacherLogin.data.user.role.name);

        if (teacherLogin.data.user.role.name === 'Teacher') {
            console.log('🎉 VERIFICATION PASSED: Teacher account created and linked correctly.');
        } else {
            console.error('❌ VERIFICATION FAILED: Incorrect role assigned.');
        }

    } catch (error: any) {
        console.error('❌ Verification Failed:', error.response?.data || error.message);
    }
}

verifyFlow();
