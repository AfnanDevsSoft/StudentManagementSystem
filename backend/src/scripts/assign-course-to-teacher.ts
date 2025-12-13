
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignCourse() {
    try {
        console.log('Finding user afnanteacher...');
        const user = await prisma.user.findUnique({
            where: { username: 'afnanteacher' },
            include: { teacher: true }
        });

        if (!user) {
            console.error('User afnanteacher not found');
            return;
        }

        if (!user.teacher) {
            console.error('User is not linked to a Teacher record');
            return;
        }

        console.log(`Found teacher: ${user.teacher.first_name} ${user.teacher.last_name} (${user.teacher.id})`);
        console.log(`Branch ID: ${user.branch_id}`);

        // Find a course in the same branch that isn't assigned to this teacher yet
        // or just any course to assign it to them.
        const course = await prisma.course.findFirst({
            where: { 
                branch_id: user.branch_id,
            }
        });

        if (!course) {
            console.error('No courses found in this branch');
            
            // Create a dummy course if none exists? 
            // Better to fail and know why.
            return;
        }

        console.log(`Found course: ${course.course_name} (${course.id}). Currently assigned to: ${course.teacher_id}`);

        const updatedCourse = await prisma.course.update({
            where: { id: course.id },
            data: { teacher_id: user.teacher.id }
        });

        console.log(`✅ successfully assigned course "${updatedCourse.course_name}" to afnanteacher.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

assignCourse();
