import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.auditLog.deleteMany({});
  await prisma.communicationLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.admissionApplication.deleteMany({});
  await prisma.admissionForm.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.payrollRecord.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.teacherAttendance.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.studentEnrollment.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.gradeLevel.deleteMany({});
  await prisma.academicYear.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.parentGuardian.deleteMany({});
  await prisma.userBranch.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.branch.deleteMany({});

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
    ],
  });
  console.log(`✅ Created ${branches.count} branches!`);

  const allBranches = await prisma.branch.findMany();
  const mainBranch = allBranches[0];
  const northBranch = allBranches[1];

  // Create Roles
  console.log("👥 Creating roles...");
  const roles = await prisma.role.createMany({
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
  console.log(`✅ Created ${roles.count} roles!`);

  const allRoles = await prisma.role.findMany();
  const superAdminRole = allRoles.find((r: any) => r.name === "SuperAdmin")!;
  const teacherRole = allRoles.find((r: any) => r.name === "Teacher")!;
  const studentRole = allRoles.find((r: any) => r.name === "Student")!;

  const hashedPassword = await bcryptjs.hash("password123", 10);

  // Create Users
  console.log("👤 Creating users...");
  const users = await prisma.user.createMany({
    data: [
      {
        branch_id: mainBranch.id,
        role_id: superAdminRole.id,
        username: "admin1",
        email: "admin1@koolhub.edu",
        password_hash: hashedPassword,
        first_name: "System",
        last_name: "Admin",
        phone: "+92-300-1111111",
        is_active: true,
      },
      {
        branch_id: mainBranch.id,
        role_id: teacherRole.id,
        username: "teacher1",
        email: "teacher1@koolhub.edu",
        password_hash: hashedPassword,
        first_name: "Muhammad",
        last_name: "Ahmed",
        phone: "+92-300-3333333",
        is_active: true,
      },
      {
        branch_id: mainBranch.id,
        role_id: teacherRole.id,
        username: "teacher2",
        email: "teacher2@koolhub.edu",
        password_hash: hashedPassword,
        first_name: "Ayesha",
        last_name: "Khan",
        phone: "+92-300-4444444",
        is_active: true,
      },
      {
        branch_id: mainBranch.id,
        role_id: teacherRole.id,
        username: "teacher3",
        email: "teacher3@koolhub.edu",
        password_hash: hashedPassword,
        first_name: "Hassan",
        last_name: "Ali",
        phone: "+92-300-5555555",
        is_active: true,
      },
      ...Array.from({ length: 20 }, (_, i) => ({
        branch_id: mainBranch.id,
        role_id: studentRole.id,
        username: `student${i + 1}`,
        email: `student${i + 1}@koolhub.edu`,
        password_hash: hashedPassword,
        first_name: `Student${i + 1}`,
        last_name: `User`,
        phone: `+92-300-${String(8000000 + i).padStart(7, "0")}`,
        is_active: true,
      })),
    ],
  });
  console.log(`✅ Created ${users.count} users!`);

  const allUsers = await prisma.user.findMany();
  const teacher1 = allUsers.find((u: any) => u.username === "teacher1")!;
  const teacher2 = allUsers.find((u: any) => u.username === "teacher2")!;
  const teacher3 = allUsers.find((u: any) => u.username === "teacher3")!;
  const studentUsers = allUsers.filter((u: any) =>
    u.username?.startsWith("student")
  );

  // Create Academic Year
  console.log("📅 Creating academic years...");
  const academicYears = await prisma.academicYear.createMany({
    data: [
      {
        branch_id: mainBranch.id,
        year: "2024-2025",
        start_date: new Date("2024-09-01"),
        end_date: new Date("2025-08-31"),
        is_current: true,
      },
    ],
  });
  console.log(`✅ Created ${academicYears.count} academic years!`);

  const currentYear = (await prisma.academicYear.findMany())[0];

  // Create Grade Levels
  console.log("🎓 Creating grade levels...");
  const gradeLevels = await prisma.gradeLevel.createMany({
    data: [
      { branch_id: mainBranch.id, name: "Grade 9", code: "G9", sort_order: 1 },
      {
        branch_id: mainBranch.id,
        name: "Grade 10",
        code: "G10",
        sort_order: 2,
      },
      {
        branch_id: mainBranch.id,
        name: "Grade 11",
        code: "G11",
        sort_order: 3,
      },
      {
        branch_id: mainBranch.id,
        name: "Grade 12",
        code: "G12",
        sort_order: 4,
      },
    ],
  });
  console.log(`✅ Created ${gradeLevels.count} grade levels!`);

  const allGradeLevels = await prisma.gradeLevel.findMany();
  const grade9 = allGradeLevels[0];
  const grade10 = allGradeLevels[1];

  // Create Subjects
  console.log("📚 Creating subjects...");
  const subjects = await prisma.subject.createMany({
    data: [
      {
        branch_id: mainBranch.id,
        name: "Mathematics",
        code: "MATH101",
        credits: 4,
      },
      {
        branch_id: mainBranch.id,
        name: "English",
        code: "ENG101",
        credits: 3,
      },
      {
        branch_id: mainBranch.id,
        name: "Science",
        code: "SCI101",
        credits: 4,
      },
      {
        branch_id: mainBranch.id,
        name: "Computer Science",
        code: "CS101",
        credits: 4,
      },
    ],
  });
  console.log(`✅ Created ${subjects.count} subjects!`);

  const allSubjects = await prisma.subject.findMany();
  const mathSubject = allSubjects[0];
  const engSubject = allSubjects[1];
  const sciSubject = allSubjects[2];

  // Create Teachers
  console.log("👨‍🏫 Creating teacher records...");
  const teacherRecords = await prisma.teacher.createMany({
    data: [
      {
        branch_id: mainBranch.id,
        user_id: teacher1.id,
        employee_code: "EMP001",
        first_name: "Muhammad",
        last_name: "Ahmed",
        email: "teacher1@koolhub.edu",
        phone: "+92-300-3333333",
        hire_date: new Date("2020-01-15"),
        employment_type: "full_time",
        department: "Mathematics",
        designation: "Senior Teacher",
        qualification: "M.Sc Mathematics",
        years_experience: 8,
      },
      {
        branch_id: mainBranch.id,
        user_id: teacher2.id,
        employee_code: "EMP002",
        first_name: "Ayesha",
        last_name: "Khan",
        email: "teacher2@koolhub.edu",
        phone: "+92-300-4444444",
        hire_date: new Date("2021-06-01"),
        employment_type: "full_time",
        department: "English",
        designation: "Teacher",
        qualification: "M.A English",
        years_experience: 5,
      },
      {
        branch_id: mainBranch.id,
        user_id: teacher3.id,
        employee_code: "EMP003",
        first_name: "Hassan",
        last_name: "Ali",
        email: "teacher3@koolhub.edu",
        phone: "+92-300-5555555",
        hire_date: new Date("2019-08-10"),
        employment_type: "full_time",
        department: "Science",
        designation: "Senior Teacher",
        qualification: "M.Sc Physics",
        years_experience: 10,
      },
    ],
  });
  console.log(`✅ Created ${teacherRecords.count} teacher records!`);

  const allTeachers = await prisma.teacher.findMany();

  // Create Courses
  console.log("📖 Creating courses...");
  const courses = await prisma.course.createMany({
    data: [
      {
        branch_id: mainBranch.id,
        academic_year_id: currentYear.id,
        subject_id: mathSubject.id,
        grade_level_id: grade9.id,
        teacher_id: allTeachers[0].id,
        course_name: "Mathematics Grade 9",
        course_code: "MATH9A",
        max_students: 40,
        room_number: "Room 101",
        building: "Building A",
      },
      {
        branch_id: mainBranch.id,
        academic_year_id: currentYear.id,
        subject_id: engSubject.id,
        grade_level_id: grade9.id,
        teacher_id: allTeachers[1].id,
        course_name: "English Grade 9",
        course_code: "ENG9A",
        max_students: 35,
        room_number: "Room 102",
        building: "Building A",
      },
      {
        branch_id: mainBranch.id,
        academic_year_id: currentYear.id,
        subject_id: sciSubject.id,
        grade_level_id: grade9.id,
        teacher_id: allTeachers[2].id,
        course_name: "Science Grade 9",
        course_code: "SCI9A",
        max_students: 40,
        room_number: "Lab 201",
        building: "Building B",
      },
    ],
  });
  console.log(`✅ Created ${courses.count} courses!`);

  const allCourses = await prisma.course.findMany();

  // Create Students
  console.log("🎓 Creating student records...");
  const studentRecords = await prisma.student.createMany({
    data: studentUsers.map((user: any, i: number) => ({
      branch_id: mainBranch.id,
      user_id: user.id,
      student_code: `STU${String(i + 1).padStart(5, "0")}`,
      first_name: `Student${i + 1}`,
      last_name: "User",
      date_of_birth: new Date(2008 + Math.floor(i / 5), i % 12, i % 28 || 1),
      gender: i % 2 === 0 ? "Male" : "Female",
      blood_group: ["A+", "B+", "O+", "AB+"][i % 4],
      nationality: "Pakistani",
      admission_date: new Date("2024-09-01"),
      admission_status: "approved",
      current_grade_level_id: i < 10 ? grade9.id : grade10.id,
      is_active: true,
    })),
  });
  console.log(`✅ Created ${studentRecords.count} student records!`);

  // Create Parents
  console.log("👨‍👩‍👧 Creating parent records...");
  const parents = await prisma.parentGuardian.createMany({
    data: Array.from({ length: 15 }, (_, i) => ({
      first_name: `Father${i + 1}`,
      last_name: `Guardian`,
      relationship: "father",
      primary_phone: `+92-300-${String(9000000 + i).padStart(7, "0")}`,
      email: `parent${i + 1}@email.com`,
      occupation: ["Engineer", "Doctor", "Businessman", "Teacher"][i % 4],
      cnic: `${String(12345 + i).padStart(5, "0")}-123456-${String(
        i + 1
      ).padStart(1, "0")}`,
    })),
  });
  console.log(`✅ Created ${parents.count} parent records!`);

  const allParents = await prisma.parentGuardian.findMany();
  const allStudents = await prisma.student.findMany();

  // Link students with parents
  console.log("🔗 Linking students with parents...");
  for (let i = 0; i < Math.min(allStudents.length, allParents.length); i++) {
    await prisma.student.update({
      where: { id: allStudents[i].id },
      data: {
        parents: {
          connect: { id: allParents[i % allParents.length].id },
        },
      },
    });
  }
  console.log("✅ Linked students with parents!");

  // Create Enrollments
  console.log("📝 Creating student enrollments...");
  const enrollments = await prisma.studentEnrollment.createMany({
    data: allStudents.slice(0, 15).flatMap((student: any, i: number) => [
      {
        student_id: student.id,
        course_id: allCourses[0].id,
        enrollment_date: new Date("2024-09-01"),
        status: "enrolled",
      },
      {
        student_id: student.id,
        course_id: allCourses[1].id,
        enrollment_date: new Date("2024-09-01"),
        status: "enrolled",
      },
      {
        student_id: student.id,
        course_id: allCourses[2].id,
        enrollment_date: new Date("2024-09-01"),
        status: "enrolled",
      },
    ]),
  });
  console.log(`✅ Created ${enrollments.count} enrollments!`);

  // Create Grades
  console.log("📊 Creating grades...");
  const grades = await prisma.grade.createMany({
    data: allStudents.slice(0, 10).flatMap((student: any, i: number) => [
      {
        student_id: student.id,
        course_id: allCourses[0].id,
        academic_year_id: currentYear.id,
        assessment_type: "quiz",
        assessment_name: "Quiz 1",
        score: 75 + Math.random() * 25,
        max_score: 100,
        weight: 10,
        grade_date: new Date(),
        graded_by: allTeachers[0].id,
      },
      {
        student_id: student.id,
        course_id: allCourses[1].id,
        academic_year_id: currentYear.id,
        assessment_type: "midterm",
        assessment_name: "Midterm Exam",
        score: 80 + Math.random() * 20,
        max_score: 100,
        weight: 30,
        grade_date: new Date(),
        graded_by: allTeachers[1].id,
      },
    ]),
  });
  console.log(`✅ Created ${grades.count} grades!`);

  // Create Attendance
  console.log("📍 Creating attendance records...");
  const now = new Date();
  const attendanceRecords = await prisma.attendance.createMany({
    data: allStudents.slice(0, 12).flatMap((student: any, i: number) => [
      {
        student_id: student.id,
        course_id: allCourses[0].id,
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        status: "present",
        recorded_by: allTeachers[0].id,
      },
      {
        student_id: student.id,
        course_id: allCourses[1].id,
        date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        status: i % 3 === 0 ? "absent" : "present",
        recorded_by: allTeachers[1].id,
      },
    ]),
  });
  console.log(`✅ Created ${attendanceRecords.count} attendance records!`);

  // Create Teacher Attendance
  console.log("📍 Creating teacher attendance...");
  const teacherAttendance = await prisma.teacherAttendance.createMany({
    data: allTeachers.flatMap((teacher: any, i: number) => [
      {
        teacher_id: teacher.id,
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        status: "present",
      },
      {
        teacher_id: teacher.id,
        date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        status: "present",
      },
    ]),
  });
  console.log(
    `✅ Created ${teacherAttendance.count} teacher attendance records!`
  );

  // Create Payroll
  console.log("💰 Creating payroll records...");
  const payrollRecords = await prisma.payrollRecord.createMany({
    data: allTeachers.map((teacher: any, i: number) => ({
      teacher_id: teacher.id,
      branch_id: mainBranch.id,
      month: 11,
      year: 2024,
      base_salary: 100000 + i * 5000,
      allowances: 10000,
      gross_salary: 110000 + i * 5000,
      deductions: 5000,
      net_salary: 105000 + i * 5000,
      days_worked: 22,
      status: "approved",
    })),
  });
  console.log(`✅ Created ${payrollRecords.count} payroll records!`);

  // Create Notifications
  console.log("🔔 Creating notifications...");
  const notifications = await prisma.notification.createMany({
    data: studentUsers.slice(0, 15).map((user: any, i: number) => ({
      user_id: user.id,
      notification_type: "email",
      subject: `Notification ${i + 1}`,
      message: `You have a new notification: Message ${i + 1}`,
      status: "sent",
      sent_at: new Date(),
    })),
  });
  console.log(`✅ Created ${notifications.count} notifications!`);

  console.log("✨ Seeding completed successfully!");
  console.log(`
    Total Records Created:
    - 2 Branches
    - 4 Roles
    - 24 Users (3 Teachers + 20 Students + 1 Admin)
    - 3 Teachers
    - 20 Students
    - 1 Academic Year
    - 4 Grade Levels
    - 4 Subjects
    - 3 Courses
    - 45 Student Enrollments
    - 20 Grades
    - 24 Attendance Records
    - 6 Teacher Attendance Records
    - 3 Payroll Records
    - 15 Parent/Guardian Records
    - 15 Notifications
    TOTAL: 200+ Records
  `);
}

main()
  .catch((e: any) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
