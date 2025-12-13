import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data (Order matters due to foreign keys)
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
    console.log({ error });
  }

  console.log("✅ Data cleared!");

  // Create Branches
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
      {
        name: "West Campus",
        code: "WEST",
        address: "101 Sunset Road",
        city: "Quetta",
        state: "Balochistan",
        country: "Pakistan",
        phone: "+92-81-7654321",
        email: "west@koolhub.edu",
        principal_name: "Ms. Zainab Bibi",
        principal_email: "principal.west@koolhub.edu",
        timezone: "Asia/Karachi",
        currency: "PKR",
      },
    ],
  });
  console.log(`✅ Created ${branches.count} branches!`);

  const allBranches = await prisma.branch.findMany();
  // We will dynamically access branches instead of hardcoding variables like mainBranch/northBranch

  // Create Roles
  console.log("👥 Creating roles...");
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

  const hashedPassword = await bcryptjs.hash("password123", 10);

  // Users Data Preparation
  const usersData: any[] = [];

  // 1. Admin (Main Branch)
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

  // 2. Teachers (Assigning 5 per branch dynamically)
  // Total teachers = branches * 5
  const teachersPerBranch = 5;
  const totalTeachers = allBranches.length * teachersPerBranch;

  for (let i = 0; i < totalTeachers; i++) {
    const branchIndex = i % allBranches.length;
    const branch = allBranches[branchIndex];
    const teacherNum = i + 1;

    usersData.push({
      branch_id: branch.id,
      role_id: teacherRole.id,
      username: `teacher${teacherNum}`,
      email: `teacher${teacherNum}@koolhub.edu`,
      password_hash: hashedPassword,
      first_name: `Teacher`,
      last_name: `${teacherNum} (${branch.code})`,
      phone: `+92-300-222${String(teacherNum).padStart(5, "0")}`,
      is_active: true,
    });
  }

  // 3. Students (Assigning 40 per branch dynamically)
  // Total students = branches * 40
  const studentsPerBranch = 40;
  const totalStudents = allBranches.length * studentsPerBranch;

  for (let i = 0; i < totalStudents; i++) {
    const branchIndex = i % allBranches.length;
    const branch = allBranches[branchIndex];
    const studentNum = i + 1;

    usersData.push({
      branch_id: branch.id,
      role_id: studentRole.id,
      username: `student${studentNum}`,
      email: `student${studentNum}@koolhub.edu`,
      password_hash: hashedPassword,
      first_name: `Student`,
      last_name: `${studentNum}`,
      phone: `+92-300-888${String(studentNum).padStart(4, "0")}`,
      is_active: true,
    });
  }

  console.log(`👤 Preparing to create ${usersData.length} users...`);
  await prisma.user.createMany({ data: usersData });
  console.log(`✅ Users created!`);

  const allUsers = await prisma.user.findMany();
  const teachers = allUsers.filter((u) => u.username.startsWith("teacher"));
  const students = allUsers.filter((u) => u.username.startsWith("student"));

  // Create Academic Year for ALL branches
  console.log("📅 Creating academic years...");
  const academicYearsData = allBranches.map(branch => ({
    branch_id: branch.id,
    year: "2024-2025",
    start_date: new Date("2024-09-01"),
    end_date: new Date("2025-08-31"),
    is_current: true,
  }));

  await prisma.academicYear.createMany({ data: academicYearsData });
  const academicYears = await prisma.academicYear.findMany();

  const currentYearMain = academicYears.find(
    (y) => y.branch_id === allBranches[0].id
  )!;

  // Create Grade Levels
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

  // Create Subjects
  console.log("📚 Creating subjects...");
  const subjectData = [];
  for (const branch of allBranches) {
    subjectData.push(
      {
        branch_id: branch.id,
        name: "Mathematics",
        code: "MATH101",
        credits: 4,
      },
      { branch_id: branch.id, name: "English", code: "ENG101", credits: 3 },
      { branch_id: branch.id, name: "Science", code: "SCI101", credits: 4 },
      {
        branch_id: branch.id,
        name: "Computer Science",
        code: "CS101",
        credits: 4,
      }
    );
  }
  await prisma.subject.createMany({ data: subjectData });
  const allSubjects = await prisma.subject.findMany();

  // Create Teacher Metadata Records
  console.log("👨‍🏫 Creating teacher profile records...");
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

  // Create Courses
  console.log("📖 Creating courses...");
  const courseData = [];
  for (const branch of allBranches) {
    const branchTeachers = allTeachers.filter(
      (t) => t.branch_id === branch.id
    );
    const branchSubjects = allSubjects.filter(
      (s) => s.branch_id === branch.id
    );
    const branchGrades = allGradeLevels.filter(
      (g) => g.branch_id === branch.id
    );
    const branchYear = academicYears.find((y) => y.branch_id === branch.id)!;

    // Create a course for each subject for Grade 9 and 10
    for (let i = 0; i < branchSubjects.length; i++) {
      const teacher = branchTeachers[i % branchTeachers.length];
      const grade = branchGrades[i % 2]; // Grade 9 or 10
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

  // Create Student Metadata Records
  console.log("🎓 Creating student profile records...");

  const studentRecordsData = students.map((user, i) => {
    // Determine grade level matching their branch
    const branchGrades = allGradeLevels.filter(
      (g) => g.branch_id === user.branch_id
    );
    // Assign half to Grade 9, half to Grade 10
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

  // Create Parents (One parent for every student for verify scale)
  console.log("👨‍👩‍👧 Creating parent records...");
  const parentData = allStudents.map((stu, i) => ({
    first_name: `Parent`,
    last_name: `Of ${stu.first_name}`,
    relationship: "Father",
    primary_phone: "+92-300-9999999",
    email: `parent${i + 1}@example.com`,
    is_active: true
  }));
  await prisma.parentGuardian.createMany({ data: parentData });
  const allParents = await prisma.parentGuardian.findMany();

  // Link Parents
  console.log("🔗 Linking students with parents...");
  for (let i = 0; i < allStudents.length; i++) {
    await prisma.student.update({
      where: { id: allStudents[i].id },
      data: { parents: { connect: { id: allParents[i].id } } }
    });
  }

  // Create Enrollments
  console.log("📝 Creating student enrollments...");
  const enrollmentData = [];
  for (const student of allStudents) {
    // Find courses in student's branch
    const studentCourses = allCourses.filter(c => c.branch_id === student.branch_id);
    // Enroll in all available courses for their branch (~4 courses)
    for (const course of studentCourses) {
      enrollmentData.push({
        student_id: student.id,
        course_id: course.id,
        enrollment_date: new Date("2024-09-01"),
        status: "enrolled"
      });
    }
  }
  await prisma.studentEnrollment.createMany({ data: enrollmentData });

  // Create Grades (Randomized)
  console.log("📊 Creating grades...");
  const gradeData = [];
  for (const student of allStudents) {
    const studentCourses = allCourses.filter(c => c.branch_id === student.branch_id);
    const studentYear = academicYears.find(y => y.branch_id === student.branch_id)!;

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
        graded_by: allTeachers.find(t => t.branch_id === student.branch_id)!.id
      });
    }
  }
  await prisma.grade.createMany({ data: gradeData });

  // Create Payroll (For verification)
  console.log("💰 Creating payroll records...");
  const payrollData = allTeachers.map(t => ({
    teacher_id: t.id,
    branch_id: t.branch_id,
    month: 12,
    year: 2024,
    base_salary: 50000,
    gross_salary: 55000,
    net_salary: 53000,
    status: "paid"
  }));
  await prisma.payrollRecord.createMany({ data: payrollData });

  console.log("✨ Seeding scaled data completed successfully!");
}

main()
  .catch((e: any) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
