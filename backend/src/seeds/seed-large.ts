
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

// Helpers for random data
const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Ahmed", "Muhammad", "Fatima", "Ali", "Hassan", "Hussain", "Zainab", "Ayesha", "Omar", "Bilal"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Khan", "Ali", "Shah", "Raza", "Hussain", "Ahmed", "Malik", "Chaudhry", "Butt", "Sheikh"];

const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

async function main() {
    console.log("🌱 Starting Large Scale Database Seeding...\n");

    // ==================== CLEAR EXISTING DATA ====================
    console.log("🗑️  Clearing existing data...");
    const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
    const tables = tablenames
        .map(({ tablename }) => tablename)
        .filter((name) => name !== "_prisma_migrations")
        .map((name) => `"public"."${name}"`)
        .join(", ");

    try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
        console.log("Note: Some tables may not exist yet.");
    }
    console.log("✅ Data cleared!\n");

    // ==================== ROLES & PERMISSIONS ====================
    // (Copied reused logic from original seed for consistency)
    console.log("🔐 Creating RBAC setup...");
    const permissionsData = [
        "users", "branches", "roles", "students", "teachers", "courses", "attendance", "grades",
        "admissions", "finance", "payroll", "library", "health", "scholarships", "analytics",
        "reports", "announcements", "messaging", "assignments", "system"
    ].flatMap(resource => {
        const actions = ["create", "read", "update", "delete"];
        if (resource === "students" || resource === "grades" || resource === "attendance" || resource === "finance" || resource === "payroll") actions.push("read_own");
        if (resource === "assignments") actions.push("submit");
        if (resource === "messaging") actions.push("send");
        if (resource === "reports") actions.push("generate", "export");

        return actions.map(action => ({
            permission_name: `${resource}:${action}`,
            resource,
            action,
            description: `${action} ${resource}`
        }));
    });

    // Filter duplicates usually handled by upsert but here we construct unique list
    const uniquePerms = Array.from(new Map(permissionsData.map(item => [item.permission_name, item])).values());

    for (const perm of uniquePerms) {
        await prisma.permission.create({ data: perm });
    }
    const allPermissions = await prisma.permission.findMany();

    // Create Standard Roles
    const rolesDef = [
        { name: "SuperAdmin", desc: "System Super Admin", isSystem: true, perms: allPermissions },
        { name: "BranchAdmin", desc: "Branch Manager", isSystem: true, perms: allPermissions.filter(p => !p.permission_name.startsWith("system")) }, // Simplified: give most perms
        { name: "Teacher", desc: "Teacher", isSystem: true, perms: allPermissions.filter(p => ["courses", "students", "attendance", "grades", "assignments", "announcements", "messaging"].includes(p.resource) && p.action !== "delete") },
        { name: "Student", desc: "Student", isSystem: true, perms: allPermissions.filter(p => (p.action === "read_own" || p.action === "read" || p.action === "submit") && ["courses", "grades", "attendance", "assignments", "announcements"].includes(p.resource)) }
    ];

    for (const roleDef of rolesDef) {
        await prisma.rBACRole.create({
            data: {
                role_name: roleDef.name,
                description: roleDef.desc,
                is_system: roleDef.isSystem,
                permissions: { connect: roleDef.perms.map(p => ({ id: p.id })) }
            }
        });
    }
    const superAdminRole = await prisma.rBACRole.findUnique({ where: { role_name: "SuperAdmin" } });
    const teacherRole = await prisma.rBACRole.findUnique({ where: { role_name: "Teacher" } });
    const studentRole = await prisma.rBACRole.findUnique({ where: { role_name: "Student" } });

    // Legacy Roles (required by User model relation)
    const legacyRoles = await prisma.role.createMany({
        data: rolesDef.map(r => ({ name: r.name, description: r.desc, is_system: true }))
    });
    const allLegacyRoles = await prisma.role.findMany();

    const passwordHash = await bcryptjs.hash("password123", 10);

    // ==================== BRANCH CREATION ====================
    console.log("📍 Creating 5 branches...");
    const branchesData = [
        { name: "Main Campus (Islamabad)", code: "ISB-MAIN", city: "Islamabad" },
        { name: "North Campus (Rawalpindi)", code: "RWP-NORTH", city: "Rawalpindi" },
        { name: "East Campus (Lahore)", code: "LHR-EAST", city: "Lahore" },
        { name: "West Campus (Peshawar)", code: "PEW-WEST", city: "Peshawar" },
        { name: "South Campus (Karachi)", code: "KHI-SOUTH", city: "Karachi" }
    ];

    const createdBranches = [];
    for (const b of branchesData) {
        const branch = await prisma.branch.create({
            data: {
                name: b.name,
                code: b.code,
                city: b.city,
                country: "Pakistan",
                currency: "PKR",
                timezone: "Asia/Karachi",
                address: `Sector ${getRandomInt(1, 10)}, ${b.city}`,
                phone: `+92-${getRandomInt(300, 399)}-${getRandomInt(1000000, 9999999)}`,
                email: `info.${b.code.toLowerCase()}@afnandevssms.com`,
                principal_name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
                principal_email: `principal.${b.code.toLowerCase()}@afnandevssms.com`
            }
        });
        createdBranches.push(branch);
    }

    // Super Admin User
    await prisma.user.create({
        data: {
            username: "superadmin",
            email: "superadmin@afnandevssms.com",
            password_hash: passwordHash,
            first_name: "Super",
            last_name: "Admin",
            branch_id: createdBranches[0].id,
            role_id: allLegacyRoles.find(r => r.name === "SuperAdmin")!.id,
            is_active: true
        }
    });

    // ==================== PER BRANCH DATA ====================
    for (const branch of createdBranches) {
        console.log(`\n🏢 Processing ${branch.name}...`);

        // 1. Academic Year
        const academicYear = await prisma.academicYear.create({
            data: {
                branch_id: branch.id,
                year: "2024-2025",
                start_date: new Date("2024-08-01"),
                end_date: new Date("2025-06-30"),
                is_current: true
            }
        });

        // 2. Grade Levels
        const gradeLevels = [];
        const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
        for (const [idx, gName] of grades.entries()) {
            gradeLevels.push(await prisma.gradeLevel.create({
                data: { branch_id: branch.id, name: gName, code: `G${9 + idx}-${branch.code}`, sort_order: idx + 1 }
            }));
        }

        // 3. Subjects
        const subjects = [];
        const subjList = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "Urdu", "Islamiat"];
        for (const [idx, sName] of subjList.entries()) {
            subjects.push(await prisma.subject.create({
                data: { branch_id: branch.id, name: sName, code: `${sName.substring(0, 3).toUpperCase()}-${branch.code}`, credits: 3 }
            }));
        }

        // 4. Fee Structures
        const fees = [];
        fees.push(await prisma.fee.create({
            data: { branch_id: branch.id, fee_name: "Admission Fee", fee_type: "OneTime", amount: 20000, due_date: new Date() }
        }));
        fees.push(await prisma.fee.create({
            data: { branch_id: branch.id, fee_name: "Monthly Tuition", fee_type: "Monthly", amount: 15000, due_date: new Date() }
        }));

        // 5. Teachers (50) and User Accounts
        console.log("   --> Creating 50 Teachers...");
        const branchTeachers = [];
        for (let i = 1; i <= 50; i++) {
            const fn = getRandomElement(firstNames);
            const ln = getRandomElement(lastNames);
            const email = `teacher${i}.${branch.code.toLowerCase()}@sms.com`;

            const user = await prisma.user.create({
                data: {
                    branch_id: branch.id,
                    username: `teacher${i}_${branch.code}`,
                    email: email,
                    password_hash: passwordHash,
                    first_name: fn,
                    last_name: ln,
                    role_id: allLegacyRoles.find(r => r.name === "Teacher")!.id,
                    is_active: true
                }
            });

            const teacher = await prisma.teacher.create({
                data: {
                    branch_id: branch.id,
                    user_id: user.id,
                    employee_code: `EMP-${branch.code}-${i}`,
                    first_name: fn,
                    last_name: ln,
                    email: email,
                    hire_date: getRandomDate(new Date(2020, 0, 1), new Date(2023, 0, 1)),
                    employment_type: "Permanent",
                    designation: "Senior Teacher",
                    salary_grade: "17"
                }
            });
            branchTeachers.push(teacher);

            // Payroll Record
            await prisma.payrollRecord.create({
                data: {
                    teacher_id: teacher.id,
                    branch_id: branch.id,
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    base_salary: getRandomInt(50000, 90000),
                    gross_salary: getRandomInt(55000, 95000),
                    net_salary: getRandomInt(53000, 93000),
                    status: "Processed"
                }
            });
        }

        // 6. Courses (10)
        console.log("   --> Creating 10 Courses...");
        const branchCourses = [];
        for (let i = 0; i < 10; i++) {
            const subject = subjects[i % subjects.length];
            const grade = gradeLevels[i % gradeLevels.length];
            const teacher = branchTeachers[i % branchTeachers.length];

            const course = await prisma.course.create({
                data: {
                    branch_id: branch.id,
                    academic_year_id: academicYear.id,
                    subject_id: subject.id,
                    grade_level_id: grade.id,
                    teacher_id: teacher.id,
                    course_name: `${subject.name} (${grade.name})`,
                    course_code: `CRS-${branch.code}-${i}`,
                    room_number: `R-${100 + i}`
                }
            });
            branchCourses.push(course);
        }

        // 7. Students (50) and Enrollments/Attendance/Grades/Fees
        console.log("   --> Creating 50 Students & Related Data...");
        for (let i = 1; i <= 50; i++) {
            const fn = getRandomElement(firstNames);
            const ln = getRandomElement(lastNames);
            const email = `student${i}.${branch.code.toLowerCase()}@sms.com`;

            const user = await prisma.user.create({
                data: {
                    branch_id: branch.id,
                    username: `student${i}_${branch.code}`,
                    email: email,
                    password_hash: passwordHash,
                    first_name: fn,
                    last_name: ln,
                    role_id: allLegacyRoles.find(r => r.name === "Student")!.id,
                    is_active: true
                }
            });

            const student = await prisma.student.create({
                data: {
                    branch_id: branch.id,
                    user_id: user.id,
                    student_code: `STU-${branch.code}-${i}`,
                    first_name: fn,
                    last_name: ln,
                    date_of_birth: getRandomDate(new Date(2005, 0, 1), new Date(2010, 0, 1)),
                    gender: Math.random() > 0.5 ? "Male" : "Female",
                    admission_date: new Date(),
                    admission_status: "Active"
                }
            });

            // Enrolling in random courses (3 per student)
            const myCourses = branchCourses.sort(() => 0.5 - Math.random()).slice(0, 3);
            for (const course of myCourses) {
                // Enrollment
                await prisma.studentEnrollment.create({
                    data: {
                        student_id: student.id,
                        course_id: course.id,
                        enrollment_date: new Date(),
                        status: "Active"
                    }
                });

                // Grades
                await prisma.grade.create({
                    data: {
                        student_id: student.id,
                        course_id: course.id,
                        academic_year_id: academicYear.id,
                        assessment_type: "Mid Term",
                        assessment_name: "Mid Term Exam",
                        score: getRandomInt(40, 95),
                        max_score: 100,
                        grade_date: new Date(),
                        graded_by: course.teacher_id
                    }
                });
            }

            // Attendance (Last 15 days)
            for (let d = 0; d < 15; d++) {
                const date = new Date();
                date.setDate(date.getDate() - d);
                await prisma.attendance.create({
                    data: {
                        student_id: student.id,
                        branch_id: branch.id,
                        date: date,
                        status: Math.random() > 0.1 ? "Present" : "Absent",
                        recorded_by: branchTeachers[0].id // Just using first teacher as recorder
                    }
                });
            }

            // Fee Payments
            if (Math.random() > 0.2) { // 80% paid
                await prisma.feePayment.create({
                    data: {
                        student_id: student.id,
                        fee_id: fees[1].id, // Tuition
                        amount_paid: 15000,
                        payment_date: new Date(),
                        payment_method: "Bank Transfer",
                        status: "Paid",
                        recorded_by: branchTeachers[0].id
                    }
                });
            }
        }

        // 8. Admission Applications (15)
        console.log("   --> Creating 15 Admission Applications...");
        for (let i = 1; i <= 15; i++) {
            await prisma.admissionApplication.create({
                data: {
                    branch_id: branch.id,
                    application_number: `APP-${branch.code}-${Date.now()}-${i}`,
                    applicant_email: `applicant${i}@test.com`,
                    applicant_phone: "03001234567",
                    applicant_data: {
                        item: "Sample Data",
                        firstName: getRandomElement(firstNames),
                        lastName: getRandomElement(lastNames)
                    },
                    status: i % 3 === 0 ? "Accepted" : "Pending",
                    application_date: new Date()
                }
            });
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✨ LARGE SCALE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("5 Branches, ~250 Teachers, ~250 Students, ~2500 Attendance Records created.");
    console.log("=".repeat(50));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
