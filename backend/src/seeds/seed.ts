import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Comprehensive Database Seed Script
 * Seeds ALL essential data for a fresh database installation:
 * - Branches, Roles, Users, Academic Years, Grade Levels, Subjects
 * - Teachers, Courses, Students, Parents, Enrollments, Grades
 * - RBAC Permissions and Roles
 * - Fee Structures, Working Days, Payroll
 * - SuperAdmin user with full access
 */

async function main() {
  console.log("🌱 Starting Comprehensive Database Seeding...\n");

  // ==================== CLEAR EXISTING DATA ====================
  console.log("🗑️  Clearing existing data...");
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log("Note: Some tables may not exist yet.", error);
  }
  console.log("✅ Data cleared!\n");

  // ==================== 1. BRANCHES ====================
  console.log("📍 Creating branches...");
  const branches = await prisma.branch.createMany({
    data: [
      {
        name: "Main Campus",
        code: "MAIN",
        address: "123 School Street",
        city: "Karachi",
        state: "Sindh",
        country: "Pakistan",
        phone: "+92-21-1234567",
        email: "main@koolhub.edu",
        principal_name: "Dr. Ahmed Khan",
        principal_email: "principal@koolhub.edu",
        timezone: "Asia/Karachi",
        currency: "PKR",
      },
      {
        name: "North Campus",
        code: "NORTH",
        address: "456 Education Ave",
        city: "Lahore",
        state: "Punjab",
        country: "Pakistan",
        phone: "+92-42-7654321",
        email: "north@koolhub.edu",
        principal_name: "Prof. Fatima Ali",
        principal_email: "principal.north@koolhub.edu",
        timezone: "Asia/Karachi",
        currency: "PKR",
      },
      {
        name: "East Campus",
        code: "EAST",
        address: "789 Sunrise Blvd",
        city: "Islamabad",
        state: "Federal",
        country: "Pakistan",
        phone: "+92-51-1234567",
        email: "east@koolhub.edu",
        principal_name: "Dr. Yasir Shah",
        principal_email: "principal.east@koolhub.edu",
        timezone: "Asia/Karachi",
        currency: "PKR",
      },
    ],
  });
  console.log(`✅ Created ${branches.count} branches!`);

  const allBranches = await prisma.branch.findMany();

  // ==================== 2. LEGACY ROLES ====================
  console.log("👥 Creating legacy roles...");
  await prisma.role.createMany({
    data: [
      {
        name: "SuperAdmin",
        description: "System administrator with full access",
        is_system: true,
        permissions: {
          users: ["create", "read", "update", "delete"],
          students: ["create", "read", "update", "delete"],
          teachers: ["create", "read", "update", "delete"],
          courses: ["create", "read", "update", "delete"],
          "*": ["*"],
        },
      },
      {
        name: "BranchAdmin",
        description: "Branch administrator",
        is_system: true,
        permissions: { users: ["create", "read", "update"] },
      },
      {
        name: "Teacher",
        description: "Classroom instructor",
        is_system: true,
        permissions: {
          courses: ["read"],
          students: ["read"],
          grades: ["create", "read", "update"],
        },
      },
      {
        name: "Student",
        description: "Student user",
        is_system: true,
        permissions: {
          grades: ["read"],
          courses: ["read"],
        },
      },
    ],
  });

  const allRoles = await prisma.role.findMany();
  const superAdminRole = allRoles.find((r) => r.name === "SuperAdmin")!;
  const teacherRole = allRoles.find((r) => r.name === "Teacher")!;
  const studentRole = allRoles.find((r) => r.name === "Student")!;
  console.log(`✅ Created ${allRoles.length} legacy roles!`);

  // ==================== 3. RBAC PERMISSIONS ====================
  console.log("🔐 Creating RBAC permissions...");
  const permissionsData = [
    // USER MANAGEMENT
    { permission_name: "users:create", resource: "users", action: "create", description: "Create new users" },
    { permission_name: "users:read", resource: "users", action: "read", description: "View user details" },
    { permission_name: "users:update", resource: "users", action: "update", description: "Update user information" },
    { permission_name: "users:delete", resource: "users", action: "delete", description: "Delete users" },

    // BRANCH MANAGEMENT
    { permission_name: "branches:create", resource: "branches", action: "create", description: "Create new branches" },
    { permission_name: "branches:read", resource: "branches", action: "read", description: "View branch details" },
    { permission_name: "branches:update", resource: "branches", action: "update", description: "Update branch information" },
    { permission_name: "branches:delete", resource: "branches", action: "delete", description: "Delete branches" },

    // ROLE MANAGEMENT
    { permission_name: "roles:create", resource: "roles", action: "create", description: "Create new roles" },
    { permission_name: "roles:read", resource: "roles", action: "read", description: "View role details" },
    { permission_name: "roles:update", resource: "roles", action: "update", description: "Update role permissions" },
    { permission_name: "roles:delete", resource: "roles", action: "delete", description: "Delete roles" },

    // STUDENT MANAGEMENT
    { permission_name: "students:create", resource: "students", action: "create", description: "Create new students" },
    { permission_name: "students:read", resource: "students", action: "read", description: "View student details" },
    { permission_name: "students:update", resource: "students", action: "update", description: "Update student information" },
    { permission_name: "students:delete", resource: "students", action: "delete", description: "Delete students" },
    { permission_name: "students:read_own", resource: "students", action: "read_own", description: "View own student profile" },

    // TEACHER MANAGEMENT
    { permission_name: "teachers:create", resource: "teachers", action: "create", description: "Create new teachers" },
    { permission_name: "teachers:read", resource: "teachers", action: "read", description: "View teacher details" },
    { permission_name: "teachers:update", resource: "teachers", action: "update", description: "Update teacher information" },
    { permission_name: "teachers:delete", resource: "teachers", action: "delete", description: "Delete teachers" },

    // COURSE MANAGEMENT
    { permission_name: "courses:create", resource: "courses", action: "create", description: "Create new courses" },
    { permission_name: "courses:read", resource: "courses", action: "read", description: "View course details" },
    { permission_name: "courses:update", resource: "courses", action: "update", description: "Update course information" },
    { permission_name: "courses:delete", resource: "courses", action: "delete", description: "Delete courses" },

    // ATTENDANCE MANAGEMENT
    { permission_name: "attendance:create", resource: "attendance", action: "create", description: "Mark attendance" },
    { permission_name: "attendance:read", resource: "attendance", action: "read", description: "View attendance records" },
    { permission_name: "attendance:update", resource: "attendance", action: "update", description: "Update attendance records" },
    { permission_name: "attendance:delete", resource: "attendance", action: "delete", description: "Delete attendance records" },
    { permission_name: "attendance:read_own", resource: "attendance", action: "read_own", description: "View own attendance" },

    // GRADE MANAGEMENT
    { permission_name: "grades:create", resource: "grades", action: "create", description: "Enter grades" },
    { permission_name: "grades:read", resource: "grades", action: "read", description: "View grade records" },
    { permission_name: "grades:update", resource: "grades", action: "update", description: "Update grades" },
    { permission_name: "grades:delete", resource: "grades", action: "delete", description: "Delete grades" },
    { permission_name: "grades:read_own", resource: "grades", action: "read_own", description: "View own grades" },

    // ADMISSION MANAGEMENT
    { permission_name: "admissions:create", resource: "admissions", action: "create", description: "Create admission applications" },
    { permission_name: "admissions:read", resource: "admissions", action: "read", description: "View admissions" },
    { permission_name: "admissions:update", resource: "admissions", action: "update", description: "Update admission status" },
    { permission_name: "admissions:delete", resource: "admissions", action: "delete", description: "Delete admissions" },

    // FINANCE MANAGEMENT
    { permission_name: "finance:create", resource: "finance", action: "create", description: "Create fee records" },
    { permission_name: "finance:read", resource: "finance", action: "read", description: "View financial records" },
    { permission_name: "finance:update", resource: "finance", action: "update", description: "Update financial records" },
    { permission_name: "finance:delete", resource: "finance", action: "delete", description: "Delete financial records" },
    { permission_name: "finance:read_own", resource: "finance", action: "read_own", description: "View own fee status" },

    // PAYROLL MANAGEMENT
    { permission_name: "payroll:create", resource: "payroll", action: "create", description: "Generate payroll" },
    { permission_name: "payroll:read", resource: "payroll", action: "read", description: "View payroll records" },
    { permission_name: "payroll:update", resource: "payroll", action: "update", description: "Update payroll" },
    { permission_name: "payroll:read_own", resource: "payroll", action: "read_own", description: "View own payroll" },

    // LIBRARY MANAGEMENT
    { permission_name: "library:create", resource: "library", action: "create", description: "Add library items" },
    { permission_name: "library:read", resource: "library", action: "read", description: "View library catalog" },
    { permission_name: "library:update", resource: "library", action: "update", description: "Update library items" },
    { permission_name: "library:delete", resource: "library", action: "delete", description: "Delete library items" },

    // HEALTH RECORDS
    { permission_name: "health:create", resource: "health", action: "create", description: "Create health records" },
    { permission_name: "health:read", resource: "health", action: "read", description: "View health records" },
    { permission_name: "health:update", resource: "health", action: "update", description: "Update health records" },
    { permission_name: "health:delete", resource: "health", action: "delete", description: "Delete health records" },

    // SCHOLARSHIP MANAGEMENT
    { permission_name: "scholarships:create", resource: "scholarships", action: "create", description: "Create scholarships" },
    { permission_name: "scholarships:read", resource: "scholarships", action: "read", description: "View scholarships" },
    { permission_name: "scholarships:update", resource: "scholarships", action: "update", description: "Update scholarships" },
    { permission_name: "scholarships:delete", resource: "scholarships", action: "delete", description: "Delete scholarships" },

    // ANALYTICS & REPORTS
    { permission_name: "analytics:read", resource: "analytics", action: "read", description: "View analytics and reports" },
    { permission_name: "reports:generate", resource: "reports", action: "generate", description: "Generate reports" },
    { permission_name: "reports:export", resource: "reports", action: "export", description: "Export data" },

    // ANNOUNCEMENTS & MESSAGING
    { permission_name: "announcements:create", resource: "announcements", action: "create", description: "Create announcements" },
    { permission_name: "announcements:read", resource: "announcements", action: "read", description: "View announcements" },
    { permission_name: "messaging:send", resource: "messaging", action: "send", description: "Send messages" },
    { permission_name: "messaging:read", resource: "messaging", action: "read", description: "Read messages" },

    // ASSIGNMENTS
    { permission_name: "assignments:create", resource: "assignments", action: "create", description: "Create assignments" },
    { permission_name: "assignments:read", resource: "assignments", action: "read", description: "View assignments" },
    { permission_name: "assignments:update", resource: "assignments", action: "update", description: "Update assignments" },
    { permission_name: "assignments:submit", resource: "assignments", action: "submit", description: "Submit assignments" },

    // SYSTEM ADMINISTRATION
    { permission_name: "system:settings", resource: "system", action: "settings", description: "Modify system settings" },
    { permission_name: "system:audit", resource: "system", action: "audit", description: "View audit logs" },
    { permission_name: "system:backup", resource: "system", action: "backup", description: "Manage backups" },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { permission_name: perm.permission_name },
      update: {},
      create: perm,
    });
  }
  const allPermissions = await prisma.permission.findMany();
  console.log(`✅ Created ${allPermissions.length} RBAC permissions!`);

  // ==================== 4. RBAC ROLES (GLOBAL) ====================
  console.log("🎭 Creating global RBAC roles...");

  // SuperAdmin RBAC Role (All Permissions) - GLOBAL
  await prisma.rBACRole.upsert({
    where: { role_name: "SuperAdmin" },
    update: { permissions: { set: allPermissions.map((p) => ({ id: p.id })) } },
    create: {
      role_name: "SuperAdmin",
      description: "System administrator with full access",
      is_system: true,
      branch_id: null,
      permissions: { connect: allPermissions.map((p) => ({ id: p.id })) },
    },
  });

  // BranchAdmin RBAC Role - GLOBAL
  const branchAdminPermNames = [
    "users:create", "users:read", "users:update",
    "students:create", "students:read", "students:update", "students:delete",
    "teachers:create", "teachers:read", "teachers:update", "teachers:delete",
    "courses:create", "courses:read", "courses:update", "courses:delete",
    "attendance:create", "attendance:read", "attendance:update",
    "grades:create", "grades:read", "grades:update",
    "admissions:create", "admissions:read", "admissions:update",
    "finance:create", "finance:read", "finance:update",
    "payroll:create", "payroll:read", "payroll:update",
    "library:create", "library:read", "library:update",
    "health:create", "health:read", "health:update",
    "scholarships:create", "scholarships:read", "scholarships:update",
    "analytics:read", "reports:generate", "reports:export",
    "announcements:create", "announcements:read",
    "messaging:send", "messaging:read",
  ];
  const branchAdminPerms = allPermissions.filter((p) => branchAdminPermNames.includes(p.permission_name));
  await prisma.rBACRole.upsert({
    where: { role_name: "BranchAdmin" },
    update: { permissions: { set: branchAdminPerms.map((p) => ({ id: p.id })) } },
    create: {
      role_name: "BranchAdmin",
      description: "Branch administrator with management access",
      is_system: true,
      branch_id: null,
      permissions: { connect: branchAdminPerms.map((p) => ({ id: p.id })) },
    },
  });

  // Teacher RBAC Role - GLOBAL
  const teacherPermNames = [
    "students:read", "courses:read", "courses:update",
    "attendance:create", "attendance:read", "attendance:update",
    "grades:create", "grades:read", "grades:update",
    "assignments:create", "assignments:read", "assignments:update",
    "announcements:create", "announcements:read",
    "messaging:send", "messaging:read", "library:read", "payroll:read_own",
  ];
  const teacherPerms = allPermissions.filter((p) => teacherPermNames.includes(p.permission_name));
  await prisma.rBACRole.upsert({
    where: { role_name: "Teacher" },
    update: { permissions: { set: teacherPerms.map((p) => ({ id: p.id })) } },
    create: {
      role_name: "Teacher",
      description: "Teaching staff with class management access",
      is_system: true,
      branch_id: null,
      permissions: { connect: teacherPerms.map((p) => ({ id: p.id })) },
    },
  });

  // Student RBAC Role - GLOBAL
  const studentPermNames = [
    "students:read_own", "courses:read", "attendance:read_own", "grades:read_own",
    "assignments:read", "assignments:submit", "announcements:read",
    "messaging:read", "library:read", "finance:read_own",
  ];
  const studentPerms = allPermissions.filter((p) => studentPermNames.includes(p.permission_name));
  await prisma.rBACRole.upsert({
    where: { role_name: "Student" },
    update: { permissions: { set: studentPerms.map((p) => ({ id: p.id })) } },
    create: {
      role_name: "Student",
      description: "Student with access to own academic records",
      is_system: true,
      branch_id: null,
      permissions: { connect: studentPerms.map((p) => ({ id: p.id })) },
    },
  });

  const rbacRoles = await prisma.rBACRole.count();
  console.log(`✅ Created ${rbacRoles} global RBAC roles!`);

  // ==================== 5. USERS ====================
  const hashedPassword = await bcryptjs.hash("password123", 10);
  const superAdminPassword = await bcryptjs.hash("SuperAdmin@123", 10);

  console.log("👤 Creating users...");
  const usersData: any[] = [];

  // SuperAdmin user (global access)
  usersData.push({
    branch_id: allBranches[0].id,
    role_id: superAdminRole.id,
    username: "superadmin",
    email: "superadmin@koolhub.edu",
    password_hash: superAdminPassword,
    first_name: "Super",
    last_name: "Admin",
    phone: "+92-300-0000000",
    is_active: true,
  });

  // Branch Admin for Main Campus
  usersData.push({
    branch_id: allBranches[0].id,
    role_id: superAdminRole.id,
    username: "admin1",
    email: "admin1@koolhub.edu",
    password_hash: hashedPassword,
    first_name: "System",
    last_name: "Admin",
    phone: "+92-300-1111111",
    is_active: true,
  });

  // Teachers (5 per branch)
  const teachersPerBranch = 5;
  for (let i = 0; i < allBranches.length * teachersPerBranch; i++) {
    const branch = allBranches[i % allBranches.length];
    usersData.push({
      branch_id: branch.id,
      role_id: teacherRole.id,
      username: `teacher${i + 1}`,
      email: `teacher${i + 1}@koolhub.edu`,
      password_hash: hashedPassword,
      first_name: `Teacher`,
      last_name: `${i + 1} (${branch.code})`,
      phone: `+92-300-222${String(i + 1).padStart(5, "0")}`,
      is_active: true,
    });
  }

  // Students (40 per branch)
  const studentsPerBranch = 40;
  for (let i = 0; i < allBranches.length * studentsPerBranch; i++) {
    const branch = allBranches[i % allBranches.length];
    usersData.push({
      branch_id: branch.id,
      role_id: studentRole.id,
      username: `student${i + 1}`,
      email: `student${i + 1}@koolhub.edu`,
      password_hash: hashedPassword,
      first_name: `Student`,
      last_name: `${i + 1}`,
      phone: `+92-300-888${String(i + 1).padStart(4, "0")}`,
      is_active: true,
    });
  }

  await prisma.user.createMany({ data: usersData });
  const allUsers = await prisma.user.findMany();
  const teachers = allUsers.filter((u) => u.username.startsWith("teacher"));
  const students = allUsers.filter((u) => u.username.startsWith("student"));
  console.log(`✅ Created ${allUsers.length} users (1 superadmin, ${teachers.length} teachers, ${students.length} students)!`);

  // ==================== 6. ACADEMIC YEARS ====================
  console.log("📅 Creating academic years...");
  await prisma.academicYear.createMany({
    data: allBranches.map((branch) => ({
      branch_id: branch.id,
      year: "2024-2025",
      start_date: new Date("2024-09-01"),
      end_date: new Date("2025-08-31"),
      is_current: true,
    })),
  });
  const academicYears = await prisma.academicYear.findMany();
  console.log(`✅ Created ${academicYears.length} academic years!`);

  // ==================== 7. GRADE LEVELS ====================
  console.log("🎓 Creating grade levels...");
  const gradeLevelData = [];
  for (const branch of allBranches) {
    gradeLevelData.push(
      { branch_id: branch.id, name: "Grade 9", code: "G9", sort_order: 1 },
      { branch_id: branch.id, name: "Grade 10", code: "G10", sort_order: 2 },
      { branch_id: branch.id, name: "Grade 11", code: "G11", sort_order: 3 },
      { branch_id: branch.id, name: "Grade 12", code: "G12", sort_order: 4 }
    );
  }
  await prisma.gradeLevel.createMany({ data: gradeLevelData });
  const allGradeLevels = await prisma.gradeLevel.findMany();
  console.log(`✅ Created ${allGradeLevels.length} grade levels!`);

  // ==================== 8. SUBJECTS ====================
  console.log("📚 Creating subjects...");
  const subjectData = [];
  for (const branch of allBranches) {
    subjectData.push(
      { branch_id: branch.id, name: "Mathematics", code: "MATH101", credits: 4 },
      { branch_id: branch.id, name: "English", code: "ENG101", credits: 3 },
      { branch_id: branch.id, name: "Science", code: "SCI101", credits: 4 },
      { branch_id: branch.id, name: "Computer Science", code: "CS101", credits: 4 }
    );
  }
  await prisma.subject.createMany({ data: subjectData });
  const allSubjects = await prisma.subject.findMany();
  console.log(`✅ Created ${allSubjects.length} subjects!`);

  // ==================== 9. TEACHERS (profiles) ====================
  console.log("👨‍🏫 Creating teacher profiles...");
  await prisma.teacher.createMany({
    data: teachers.map((user, i) => ({
      branch_id: user.branch_id,
      user_id: user.id,
      employee_code: `EMP${String(i + 1).padStart(3, "0")}`,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      hire_date: new Date("2020-01-15"),
      employment_type: "full_time",
      department: ["Mathematics", "English", "Science"][i % 3],
      designation: "Teacher",
      qualification: "Masters",
      years_experience: 5 + (i % 5),
    })),
  });
  const allTeachers = await prisma.teacher.findMany();
  console.log(`✅ Created ${allTeachers.length} teacher profiles!`);

  // ==================== 10. COURSES ====================
  console.log("📖 Creating courses...");
  const courseData = [];
  for (const branch of allBranches) {
    const branchTeachers = allTeachers.filter((t) => t.branch_id === branch.id);
    const branchSubjects = allSubjects.filter((s) => s.branch_id === branch.id);
    const branchGrades = allGradeLevels.filter((g) => g.branch_id === branch.id);
    const branchYear = academicYears.find((y) => y.branch_id === branch.id)!;

    for (let i = 0; i < branchSubjects.length; i++) {
      const teacher = branchTeachers[i % branchTeachers.length];
      const grade = branchGrades[i % 2];
      courseData.push({
        branch_id: branch.id,
        academic_year_id: branchYear.id,
        subject_id: branchSubjects[i].id,
        grade_level_id: grade.id,
        teacher_id: teacher.id,
        course_name: `${branchSubjects[i].name} - ${grade.name}`,
        course_code: `${branchSubjects[i].code}-${grade.code}-${branch.code}`,
        max_students: 40,
        room_number: `Room ${100 + i}`,
        building: "Main Block",
      });
    }
  }
  await prisma.course.createMany({ data: courseData });
  const allCourses = await prisma.course.findMany();
  console.log(`✅ Created ${allCourses.length} courses!`);

  // ==================== 11. STUDENTS (profiles) ====================
  console.log("🎓 Creating student profiles...");
  const studentRecordsData = students.map((user, i) => {
    const branchGrades = allGradeLevels.filter((g) => g.branch_id === user.branch_id);
    const gradeLevel = branchGrades[i % 2];
    return {
      branch_id: user.branch_id,
      user_id: user.id,
      student_code: `STU${String(i + 1).padStart(5, "0")}`,
      first_name: user.first_name,
      last_name: user.last_name,
      date_of_birth: new Date("2008-01-01"),
      gender: i % 2 === 0 ? "Male" : "Female",
      nationality: "Pakistani",
      admission_date: new Date("2024-09-01"),
      admission_status: "approved",
      current_grade_level_id: gradeLevel.id,
      is_active: true,
    };
  });
  await prisma.student.createMany({ data: studentRecordsData });
  const allStudents = await prisma.student.findMany();
  console.log(`✅ Created ${allStudents.length} student profiles!`);

  // ==================== 12. PARENTS ====================
  console.log("👨‍👩‍👧 Creating parent records...");
  const parentData = allStudents.map((stu, i) => ({
    first_name: `Parent`,
    last_name: `Of ${stu.first_name}`,
    relationship: "Father",
    primary_phone: "+92-300-9999999",
    email: `parent${i + 1}@example.com`,
    is_active: true,
  }));
  await prisma.parentGuardian.createMany({ data: parentData });
  const allParents = await prisma.parentGuardian.findMany();

  // Link students with parents
  for (let i = 0; i < allStudents.length; i++) {
    await prisma.student.update({
      where: { id: allStudents[i].id },
      data: { parents: { connect: { id: allParents[i].id } } },
    });
  }
  console.log(`✅ Created ${allParents.length} parents and linked to students!`);

  // ==================== 13. ENROLLMENTS ====================
  console.log("📝 Creating student enrollments...");
  const enrollmentData = [];
  for (const student of allStudents) {
    const studentCourses = allCourses.filter((c) => c.branch_id === student.branch_id);
    for (const course of studentCourses) {
      enrollmentData.push({
        student_id: student.id,
        course_id: course.id,
        enrollment_date: new Date("2024-09-01"),
        status: "enrolled",
      });
    }
  }
  await prisma.studentEnrollment.createMany({ data: enrollmentData });
  console.log(`✅ Created ${enrollmentData.length} enrollments!`);

  // ==================== 14. GRADES ====================
  console.log("📊 Creating grades...");
  const gradeData = [];
  for (const student of allStudents) {
    const studentCourses = allCourses.filter((c) => c.branch_id === student.branch_id);
    const studentYear = academicYears.find((y) => y.branch_id === student.branch_id)!;
    for (const course of studentCourses) {
      gradeData.push({
        student_id: student.id,
        course_id: course.id,
        academic_year_id: studentYear.id,
        assessment_type: "Midterm",
        assessment_name: "Midterm Exam",
        score: 60 + Math.floor(Math.random() * 40),
        max_score: 100,
        grade_date: new Date(),
        graded_by: allTeachers.find((t) => t.branch_id === student.branch_id)!.id,
      });
    }
  }
  await prisma.grade.createMany({ data: gradeData });
  console.log(`✅ Created ${gradeData.length} grades!`);

  // ==================== 15. FEE STRUCTURES ====================
  console.log("💰 Creating fee structures...");
  const feeData = [];
  for (const branch of allBranches) {
    const branchYear = academicYears.find((y) => y.branch_id === branch.id)!;
    feeData.push(
      {
        branch_id: branch.id,
        academic_year_id: branchYear.id,
        fee_name: "Tuition Fee",
        fee_type: "tuition",
        amount: 25000,
        due_date: new Date("2024-09-15"),
        is_recurring: true,
        recurring_frequency: "monthly",
      },
      {
        branch_id: branch.id,
        academic_year_id: branchYear.id,
        fee_name: "Lab Fee",
        fee_type: "lab",
        amount: 5000,
        due_date: new Date("2024-09-15"),
        is_recurring: false,
      },
      {
        branch_id: branch.id,
        academic_year_id: branchYear.id,
        fee_name: "Library Fee",
        fee_type: "library",
        amount: 2000,
        due_date: new Date("2024-09-15"),
        is_recurring: false,
      },
      {
        branch_id: branch.id,
        academic_year_id: branchYear.id,
        fee_name: "Sports Fee",
        fee_type: "sports",
        amount: 3000,
        due_date: new Date("2024-09-15"),
        is_recurring: false,
      }
    );
  }
  await prisma.fee.createMany({ data: feeData });
  console.log(`✅ Created ${feeData.length} fee structures!`);

  // ==================== 16. WORKING DAYS ====================
  // NOTE: WorkingDaysConfig schema changed - skipping for now
  console.log("📆 Skipping working days configuration (schema mismatch)...");
  // The WorkingDaysConfig model now requires: total_days, start_date, end_date
  // This seed file needs to be updated when those values are known

  // ==================== 17. PAYROLL ====================
  console.log("💵 Creating payroll records...");
  const payrollData = allTeachers.map((t) => ({
    teacher_id: t.id,
    branch_id: t.branch_id,
    month: 12,
    year: 2024,
    base_salary: 50000,
    gross_salary: 55000,
    net_salary: 53000,
    status: "paid",
  }));
  await prisma.payrollRecord.createMany({ data: payrollData });
  console.log(`✅ Created ${payrollData.length} payroll records!`);

  // ==================== SUMMARY ====================
  console.log("\n" + "=".repeat(50));
  console.log("✨ COMPREHENSIVE SEEDING COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(50));
  console.log("\n📊 Summary:");
  console.log(`   • Branches: ${allBranches.length}`);
  console.log(`   • Legacy Roles: ${allRoles.length}`);
  console.log(`   • RBAC Permissions: ${allPermissions.length}`);
  console.log(`   • RBAC Roles: ${rbacRoles}`);
  console.log(`   • Users: ${allUsers.length}`);
  console.log(`   • Teachers: ${allTeachers.length}`);
  console.log(`   • Students: ${allStudents.length}`);
  console.log(`   • Courses: ${allCourses.length}`);
  console.log(`   • Fee Structures: ${feeData.length}`);
  console.log(`   • Working Days: (skipped - schema mismatch)`);
  console.log("\n🔑 Login Credentials:");
  console.log("   SuperAdmin: superadmin@koolhub.edu / SuperAdmin@123");
  console.log("   Admin: admin1@koolhub.edu / password123");
  console.log("   Teacher: teacher1@koolhub.edu / password123");
  console.log("   Student: student1@koolhub.edu / password123");
  console.log("\n");
}

main()
  .catch((e: any) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
