
import axios from 'axios';

async function main() {
    console.log('--- VERIFYING CORS HEADERS ---');
    try {
        const response = await axios.options('http://localhost:3000/api/v1/users/roles', {
            headers: {
                'Origin': 'http://localhost:5173',
                'Access-Control-Request-Method': 'GET'
            }
        });

        console.log('✅ OPTIONS Request Status:', response.status);
        console.log('✅ Access-Control-Allow-Origin:', response.headers['access-control-allow-origin']);

        if (response.headers['access-control-allow-origin'] === 'http://localhost:5173') {
            console.log('✅ CORS verification PASSED');
        } else {
            console.error('❌ CORS verification FAILED: Origin matches ' + response.headers['access-control-allow-origin']);
        }

    } catch (error: any) {
        console.error('❌ Request Failed:', error.message);
        if (error.response) {
            console.error('Headers:', error.response.headers);
        }
    }
}

main();
