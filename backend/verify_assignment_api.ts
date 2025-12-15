
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

async function main() {
    console.log('--- VERIFYING ASSIGNMENT API ---');
    try {
        // 1. Login as Teacher
        console.log('Logging in as Teacher (teacher)...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            username: 'teacher',
            password: 'test123'
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful.');

        // 2. Get Course ID for MATH101
        // We might not have a public search endpoint for courses, so let's try to list courses for this teacher
        // Or we can query the database if we were using prisma, but let's stick to API if possible.
        // If we can't find it easily via API, we might need to assume it exists or use prisma to find it.
        // Let's assume we can fetch teacher's courses.
        // Based on routes, there might not be "my-courses" but let's see...
        // Let's try to just guess or skip this if difficult. 
        // Actually, let's use Prisma inside this script to get the IDs to ensure test robustness, 
        // passing them to the API calls.

        // Dynamic import workaround if needed or just require
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const course = await prisma.course.findFirst({
            where: { course_code: 'MATH101' }
        });

        if (!course) {
            throw new Error('Course MATH101 not found. Please run create-test-users.js first.');
        }
        console.log(`Found Course: ${course.course_name} (${course.id})`);

        // 3. Create Assignment
        const assignmentData = {
            title: 'Test Assignment ' + Date.now(),
            description: 'This is a test assignment created by verification script',
            course_id: course.id,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
            max_score: 100,
            status: 'active'
        };

        console.log('Creating Assignment...');
        const createRes = await axios.post(`${BASE_URL}/assignments`, assignmentData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (createRes.status === 201) {
            console.log('✅ Assignment Created Successfully!');
            const assignmentId = createRes.data.data.id; // Adjust based on actual response structure
            console.log(`   ID: ${assignmentId}`);

            // 4. Verify by Fetching
            console.log('Fetching Assignments for Course...');
            const getRes = await axios.get(`${BASE_URL}/assignments/course/${course.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const assignments = getRes.data.data;
            const found = assignments.find((a: any) => a.id === assignmentId);

            if (found) {
                console.log('✅ Assignment found in list.');
            } else {
                console.error('❌ Assignment NOT found in list.');
            }

            // 5. Delete Assignment
            console.log('Deleting Assignment...');
            await axios.delete(`${BASE_URL}/assignments/${assignmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Assignment Deleted.');

        } else {
            console.error('❌ Failed to create assignment:', createRes.data);
        }

        await prisma.$disconnect();

    } catch (error: any) {
        console.error('❌ Test Failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

main();
