
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

async function main() {
    console.log('--- VERIFYING RBAC SECURITY ---');
    try {
        // 1. Login as Student
        console.log('Logging in as Student (student1)...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'student1',
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('Login successful. Token received.');

        // 2. Try to Access Restricted Resource (GET /users)
        console.log('Attempting to access GET /users (Admin Only)...');
        try {
            const usersRes = await axios.get(`${BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('❌ VULNERABLE: Student was able to fetch users list!');
            console.log(`Response Status: ${usersRes.status}`);
            console.log(`Records fetched: ${usersRes.data.data.length}`);
        } catch (err: any) {
            if (err.response?.status === 403 || err.response?.status === 401) {
                console.log('✅ SECURE: Access Denied (403/401).');
            } else {
                console.log(`⚠️ Check Failed: ${err.message}`);
            }
        }

    } catch (error: any) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

main();
