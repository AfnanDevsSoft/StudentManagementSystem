/**
 * Direct Database Seeder Script
 * Creates: 1 Branch, 1 Role, 3 Students, 2 Teachers, 1 Admin
 * Run with: npx ts-node seed-test-data.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface CreatedUser {
    id: string;
    email: string;
    password: string;
    role: string;
    name: string;
    entityId?: string;
}

const createdUsers: CreatedUser[] = [];
let createdBranchId: string = '';
let adminRoleId: string = '';
let teacherRoleId: string = '';
let studentRoleId: string = '';

function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function seedData() {
    console.log('🚀 Starting test data seeding...\n');

    try {
        // Step 1: Create a Branch
        console.log('📍 Creating Branch...');
        const branch = await prisma.branch.create({
            data: {
                id: generateUUID(),
                name: 'Test Campus ' + Date.now().toString().slice(-4),
                code: 'TEST' + Date.now().toString().slice(-4),
                address: '123 Education Street',
                city: 'Karachi',
                state: 'Sindh',
                country: 'Pakistan',
                phone: '+92-21-1234567',
                email: 'test@school.edu',
                is_active: true
            }
        });

        createdBranchId = branch.id;
        console.log(`✅ Branch created: ${branch.name} (ID: ${createdBranchId})\n`);

        // Step 2: Create Roles
        console.log('🔐 Creating Roles...');
        const adminRole = await prisma.role.create({
            data: {
                id: generateUUID(),
                branch_id: createdBranchId,
                name: 'admin',
                description: 'Administrator role',
                is_system: true
            }
        });
        adminRoleId = adminRole.id;

        const teacherRole = await prisma.role.create({
            data: {
                id: generateUUID(),
                branch_id: createdBranchId,
                name: 'teacher',
                description: 'Teacher role',
                is_system: true
            }
        });
        teacherRoleId = teacherRole.id;

        const studentRole = await prisma.role.create({
            data: {
                id: generateUUID(),
                branch_id: createdBranchId,
                name: 'student',
                description: 'Student role',
                is_system: true
            }
        });
        studentRoleId = studentRole.id;
        console.log(`✅ Roles created: admin, teacher, student\n`);

        // Step 3: Create Admin User
        console.log('👤 Creating Admin User...');
        const adminPassword = 'Admin@123';
        const adminHash = await bcrypt.hash(adminPassword, 10);
        const adminEmail = `admin${Date.now().toString().slice(-4)}@school.edu`;

        const adminUser = await prisma.user.create({
            data: {
                id: generateUUID(),
                email: adminEmail,
                username: `admin${Date.now().toString().slice(-4)}`,
                password_hash: adminHash,
                role_id: adminRoleId,
                branch_id: createdBranchId,
                first_name: 'System',
                last_name: 'Admin',
                is_active: true
            }
        });

        createdUsers.push({
            id: adminUser.id,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            name: 'System Admin'
        });
        console.log(`✅ Admin created: ${adminUser.id}\n`);

        // Step 4: Create Teachers
        console.log('👨‍🏫 Creating Teachers...');
        for (let i = 1; i <= 2; i++) {
            const teacherPassword = `Teacher${i}@123`;
            const teacherHash = await bcrypt.hash(teacherPassword, 10);
            const timestamp = Date.now().toString().slice(-4);
            const teacherEmail = `teacher${i}_${timestamp}@school.edu`;
            const teacherUsername = `teacher${i}_${timestamp}`;

            // Create user account
            const teacherUser = await prisma.user.create({
                data: {
                    id: generateUUID(),
                    email: teacherEmail,
                    username: teacherUsername,
                    password_hash: teacherHash,
                    role_id: teacherRoleId,
                    branch_id: createdBranchId,
                    first_name: `Teacher${i}`,
                    last_name: `Smith${i}`,
                    is_active: true
                }
            });

            // Create teacher record
            const teacher = await prisma.teacher.create({
                data: {
                    id: generateUUID(),
                    user_id: teacherUser.id,
                    branch_id: createdBranchId,
                    employee_code: `EMP${timestamp}${i}`,
                    first_name: `Teacher${i}`,
                    last_name: `Smith${i}`,
                    email: teacherEmail,
                    phone: `+92-300-000000${i}`,
                    hire_date: new Date('2024-01-15'),
                    employment_type: 'Full-time',
                    department: i === 1 ? 'Mathematics' : 'Science',
                    designation: 'Senior Teacher',
                    qualification: i === 1 ? 'M.Sc Mathematics' : 'M.Sc Physics',
                    is_active: true
                }
            });

            createdUsers.push({
                id: teacherUser.id,
                email: teacherEmail,
                password: teacherPassword,
                role: 'teacher',
                name: `Teacher${i} Smith${i}`,
                entityId: teacher.id
            });
            console.log(`✅ Teacher ${i} created: User=${teacherUser.id}, Teacher=${teacher.id}`);
        }
        console.log('');

        // Step 5: Create Students
        console.log('👨‍🎓 Creating Students...');
        for (let i = 1; i <= 3; i++) {
            const studentPassword = `Student${i}@123`;
            const studentHash = await bcrypt.hash(studentPassword, 10);
            const timestamp = Date.now().toString().slice(-4);
            const studentEmail = `student${i}_${timestamp}@school.edu`;
            const studentUsername = `student${i}_${timestamp}`;

            // Create user account
            const studentUser = await prisma.user.create({
                data: {
                    id: generateUUID(),
                    email: studentEmail,
                    username: studentUsername,
                    password_hash: studentHash,
                    role_id: studentRoleId,
                    branch_id: createdBranchId,
                    first_name: `Student${i}`,
                    last_name: `Khan${i}`,
                    is_active: true
                }
            });

            // Create student record
            const student = await prisma.student.create({
                data: {
                    id: generateUUID(),
                    user_id: studentUser.id,
                    branch_id: createdBranchId,
                    student_code: `STU${timestamp}${i}`,
                    first_name: `Student${i}`,
                    last_name: `Khan${i}`,
                    date_of_birth: new Date(`200${5 + i}-0${i}-1${i}`),
                    gender: i % 2 === 0 ? 'Female' : 'Male',
                    current_address: `${i}23 Student Street, Karachi`,
                    admission_date: new Date('2024-09-01'),
                    admission_status: 'enrolled',
                    is_active: true
                }
            });

            createdUsers.push({
                id: studentUser.id,
                email: studentEmail,
                password: studentPassword,
                role: 'student',
                name: `Student${i} Khan${i}`,
                entityId: student.id
            });
            console.log(`✅ Student ${i} created: User=${studentUser.id}, Student=${student.id}`);
        }
        console.log('');

        // Print summary
        console.log('='.repeat(70));
        console.log('🎉 TEST DATA SEEDING COMPLETE!');
        console.log('='.repeat(70));
        console.log(`\n📍 Branch ID: ${createdBranchId}`);
        console.log(`   Branch Name: ${branch.name}\n`);
        console.log('📋 LOGIN CREDENTIALS:');
        console.log('-'.repeat(70));

        createdUsers.forEach(user => {
            console.log(`\n${user.role.toUpperCase()} - ${user.name}`);
            console.log(`  User ID: ${user.id}`);
            if (user.entityId) {
                console.log(`  ${user.role.charAt(0).toUpperCase() + user.role.slice(1)} ID: ${user.entityId}`);
            }
            console.log(`  Email: ${user.email}`);
            console.log(`  Password: ${user.password}`);
        });

        console.log('\n' + '='.repeat(70));
        console.log('\n💡 Use any of the above email/password combinations to login!');
        console.log('='.repeat(70));

    } catch (error: any) {
        console.error('❌ Error seeding data:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seeder
seedData();
