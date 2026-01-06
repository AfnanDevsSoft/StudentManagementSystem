import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fix Student RBAC role permissions
 * Students need basic read permissions to access their own data through the APIs
 */
async function fixStudentPermissions() {
    console.log('🔧 Fixing Student RBAC Role Permissions...\n');
    console.log('='.repeat(80));

    try {
        // Permissions that students need to access their own data
        const requiredPermissions = [
            'students:read',       // Need this to access student endpoints
            'branches:read',       // Need for dashboard
            'courses:read',        // Already have but confirming
            'grades:read',         // For viewing grades
            'attendance:read',     // For viewing attendance
            'finance:read',        // For viewing fees
            'announcements:read',  // For announcements
            'messaging:read',      // For messages
            'assignments:read',    // For assignments
        ];

        // Find Student RBAC role
        const studentRole = await prisma.rBACRole.findFirst({
            where: { role_name: 'Student' },
            include: { permissions: true }
        });

        if (!studentRole) {
            console.log('❌ No "Student" RBAC role found!');
            return;
        }

        console.log(`\n✅ Found Student RBAC Role: ${studentRole.role_name}`);
        console.log(`   Current permissions: ${studentRole.permissions.map(p => p.permission_name).join(', ')}`);

        // Find or create each required permission
        const currentPermNames = studentRole.permissions.map(p => p.permission_name);
        let added = 0;
        let alreadyExists = 0;

        for (const permName of requiredPermissions) {
            if (currentPermNames.includes(permName)) {
                alreadyExists++;
                console.log(`   ⏭️  Already has: ${permName}`);
                continue;
            }

            // Find the permission in the database
            let permission = await prisma.permission.findFirst({
                where: { permission_name: permName }
            });

            // If permission doesn't exist, create it
            if (!permission) {
                const [resource, action] = permName.split(':');
                permission = await prisma.permission.create({
                    data: {
                        permission_name: permName,
                        resource: resource,
                        action: action,
                        description: `${action} access to ${resource}`,
                    }
                });
                console.log(`   📝 Created permission: ${permName}`);
            }

            // Link permission to Student role
            await prisma.rBACRole.update({
                where: { id: studentRole.id },
                data: {
                    permissions: {
                        connect: { id: permission.id }
                    }
                }
            });

            console.log(`   ✅ Added: ${permName}`);
            added++;
        }

        console.log('\n' + '='.repeat(80));
        console.log('📊 SUMMARY');
        console.log('='.repeat(80));
        console.log(`   Already had: ${alreadyExists}`);
        console.log(`   Newly added: ${added}`);

        // Show final permissions
        const updatedRole = await prisma.rBACRole.findFirst({
            where: { role_name: 'Student' },
            include: { permissions: true }
        });
        console.log(`\n   Final permissions: ${updatedRole?.permissions.map(p => p.permission_name).join(', ')}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixStudentPermissions();
