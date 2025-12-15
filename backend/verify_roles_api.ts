
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

async function main() {
    console.log('--- VERIFYING ROLES API ---');
    try {
        // 1. Login
        console.log('Logging in as Admin (admin)...');
        // Admin should definitely have access
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'test123'
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful.');

        // 2. Fetch Roles
        console.log('Fetching Roles from /users/roles ...');
        try {
            const rolesRes = await axios.get(`${BASE_URL}/users/roles`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log(`✅ Roles fetched successfully: Status ${rolesRes.status}`);
            console.log(`   Count: ${rolesRes.data.data.length}`);
            console.log('   Sample Role:', rolesRes.data.data[0]);

        } catch (err: any) {
            console.error('❌ Failed to fetch roles:', err.message);
            if (err.response) {
                console.error(`Status: ${err.response.status}`);
                console.error('Response:', err.response.data);
            }
        }

    } catch (error: any) {
        console.error('❌ Test Failed (Login/Setup):', error.message);
    }
}

main();
