/**
 * API Data Seeder Script - v3 (Final)
 * Populates database with 15+ entries per table via API calls
 * 
 * Run: npx ts-node api-data-seeder.ts
 */

const BASE_URL = "http://localhost:3000/api/v1";

// Faker-like helper functions
const faker = {
    names: {
        first: ["Ahmed", "Hassan", "Ali", "Fatima", "Aisha", "Zara", "Omar", "Yusuf", "Maryam", "Sara", "Imran", "Bilal", "Hira", "Amna", "Kamran", "Saad", "Nadia", "Tariq", "Lubna", "Farhan", "Khadija", "Hamza", "Sana", "Zain", "Ayaan"],
        last: ["Khan", "Ahmed", "Ali", "Hassan", "Sheikh", "Malik", "Butt", "Iqbal", "Qureshi", "Raza", "Shah", "Mirza", "Chaudhry", "Aslam", "Rashid", "Saeed", "Javed", "Akram", "Hussain", "Akhtar"]
    },
    cities: ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Peshawar", "Multan", "Rawalpindi", "Quetta", "Sialkot", "Gujranwala"],
    departments: ["Mathematics", "English", "Science", "Computer Science", "Physics", "Chemistry", "Biology", "Urdu", "Social Studies", "Arts"],
    designations: ["Senior Teacher", "Teacher", "Junior Teacher", "Head of Department", "Assistant Teacher"],
    qualifications: ["M.Sc", "M.A", "Ph.D", "M.Ed", "B.Ed", "M.Phil"],

    randomElement: <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)],
    randomInt: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
    randomPhone: () => `+92-${faker.randomInt(300, 345)}-${faker.randomInt(1000000, 9999999)}`,
    randomEmail: (name: string, domain = "koolhub.edu") => `${name.toLowerCase().replace(/\s+/g, '.')}${faker.randomInt(1, 9999)}@${domain}`,
    randomDate: (yearsAgo: number) => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - yearsAgo);
        date.setMonth(faker.randomInt(0, 11));
        date.setDate(faker.randomInt(1, 28));
        return date.toISOString().split('T')[0];
    },
    randomCNIC: () => `${faker.randomInt(10000, 99999)}-${faker.randomInt(1000000, 9999999)}-${faker.randomInt(0, 9)}`
};

// Store created IDs for reference
const createdIds: {
    branches: string[];
    roles: string[];
    users: string[];
    teachers: string[];
    students: string[];
    academicYears: string[];
    gradeLevels: string[];
    subjects: string[];
    courses: string[];
    enrollments: string[];
    events: string[];
    books: string[];
    parents: string[];
    fees: string[];
    leaves: string[];
    payrolls: string[];
    notifications: string[];
    announcements: string[];
} = {
    branches: [],
    roles: [],
    users: [],
    teachers: [],
    students: [],
    academicYears: [],
    gradeLevels: [],
    subjects: [],
    courses: [],
    enrollments: [],
    events: [],
    books: [],
    parents: [],
    fees: [],
    leaves: [],
    payrolls: [],
    notifications: [],
    announcements: []
};

let authToken = "";
let currentUserId = "";

// API Helper Functions
async function apiCall(method: string, endpoint: string, body?: any, requireAuth = true): Promise<any> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    };

    if (requireAuth && authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        const data = await response.json();
        return { status: response.status, data, ok: response.ok };
    } catch (error: any) {
        console.error(`❌ API Error: ${method} ${endpoint}`, error.message);
        return { status: 500, data: { error: error.message }, ok: false };
    }
}

// Login and get auth token
async function login(): Promise<boolean> {
    console.log("\n🔐 Logging in to get auth token...");

    const result = await apiCall("POST", "/auth/login", {
        username: "admin1",
        password: "password123"
    }, false);

    if (result.ok && result.data.token) {
        authToken = result.data.token;
        currentUserId = result.data.user?.id;
        console.log("✅ Login successful! Token obtained.");
        console.log(`   User ID: ${currentUserId}`);
        return true;
    }

    console.error("❌ Login failed:", result.data);
    return false;
}

// ============================================
// SEED FUNCTIONS FOR EACH ENTITY
// ============================================

async function getExistingData(): Promise<void> {
    console.log("\n📋 Fetching existing data...");

    // Get existing branches
    const branchResult = await apiCall("GET", "/branches?limit=100");
    if (branchResult.ok && branchResult.data?.data) {
        createdIds.branches = branchResult.data.data.map((b: any) => b.id);
    }

    // Get existing users
    const userResult = await apiCall("GET", "/users?limit=100");
    if (userResult.ok && userResult.data?.data) {
        createdIds.users = userResult.data.data.map((u: any) => u.id);
    }

    // Get existing teachers
    const teacherResult = await apiCall("GET", "/teachers?limit=100");
    if (teacherResult.ok && teacherResult.data?.data) {
        createdIds.teachers = teacherResult.data.data.map((t: any) => t.id);
    }

    // Get existing students
    const studentResult = await apiCall("GET", "/students?limit=100");
    if (studentResult.ok && studentResult.data?.data) {
        createdIds.students = studentResult.data.data.map((s: any) => s.id);
    }

    // Get existing courses
    const courseResult = await apiCall("GET", "/courses?limit=100");
    if (courseResult.ok && courseResult.data?.data) {
        createdIds.courses = courseResult.data.data.map((c: any) => c.id);
    }

    console.log(`   Branches: ${createdIds.branches.length}`);
    console.log(`   Users: ${createdIds.users.length}`);
    console.log(`   Teachers: ${createdIds.teachers.length}`);
    console.log(`   Students: ${createdIds.students.length}`);
    console.log(`   Courses: ${createdIds.courses.length}`);
}

async function seedLeaveRequests(): Promise<void> {
    console.log("\n🏖️ Creating Leave Requests (15 entries)...");

    if (createdIds.teachers.length === 0) {
        console.log("⚠️ Missing teachers. Skipping leave request creation.");
        return;
    }

    const leaveTypes = ["sick", "casual", "annual", "maternity", "paternity", "emergency"];
    const reasons = [
        "Medical appointment scheduled for this date",
        "Family emergency requires my presence",
        "Personal matters need urgent attention",
        "Health issues need rest and recovery",
        "Wedding ceremony attendance required",
        "Child's school event participation",
        "Home maintenance work scheduled",
        "Travel for family function",
        "Religious observance"
    ];

    let successCount = 0;
    for (let i = 0; i < 15; i++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + faker.randomInt(5, 60));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + faker.randomInt(1, 5));

        const leaveData = {
            teacherId: createdIds.teachers[i % createdIds.teachers.length],
            leaveType: faker.randomElement(leaveTypes),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            reason: faker.randomElement(reasons)
        };

        // Using /leaves/request as per app.ts
        const result = await apiCall("POST", "/leaves/request", leaveData);
        if (result.ok && (result.data?.data?.id || result.data?.id || result.data?.success)) {
            createdIds.leaves.push(result.data?.data?.id || result.data?.id || "success");
            successCount++;
        }
    }
    console.log(`✅ Created ${successCount} leave requests`);
}

async function seedAdmissions(): Promise<void> {
    console.log("\n📋 Creating Admission Applications (15 entries)...");

    let successCount = 0;
    for (let i = 0; i < 15; i++) {
        const firstName = faker.randomElement(faker.names.first);
        const lastName = faker.randomElement(faker.names.last);

        const applicationData = {
            branchId: createdIds.branches[i % createdIds.branches.length] || createdIds.branches[0],
            applicantData: {
                student_name: `${firstName} ${lastName}`,
                date_of_birth: faker.randomDate(faker.randomInt(10, 18)),
                gender: faker.randomElement(["Male", "Female"]),
                previous_school: `${faker.randomElement(faker.cities)} Public School`,
                grade_applying_for: `Grade ${faker.randomInt(6, 12)}`,
                father_name: `${faker.randomElement(faker.names.first)} ${lastName}`,
                father_phone: faker.randomPhone(),
                mother_name: `${faker.randomElement(faker.names.first)} ${lastName}`,
                address: `${faker.randomInt(1, 999)} ${faker.randomElement(faker.cities)} Street`
            },
            applicantEmail: faker.randomEmail(`${firstName}.${lastName}`),
            applicantPhone: faker.randomPhone()
        };

        // Using /admission/apply as per app.ts (singular)
        const result = await apiCall("POST", "/admission/apply", applicationData, false);
        if (result.ok) {
            successCount++;
        }
    }
    console.log(`✅ Created ${successCount} admission applications`);
}

async function seedMessages(): Promise<void> {
    console.log("\n💬 Creating Direct Messages (15 entries)...");

    if (createdIds.users.length < 2) {
        console.log("⚠️ Not enough users. Skipping message creation.");
        return;
    }

    let successCount = 0;
    for (let i = 0; i < 15; i++) {
        const senderIdx = i % createdIds.users.length;
        const recipientIdx = (i + 1) % createdIds.users.length;

        if (senderIdx === recipientIdx) continue;

        const senderId = createdIds.users[senderIdx];
        const recipientId = createdIds.users[recipientIdx];

        const messageData = {
            senderId: senderId,
            recipientId: recipientId,
            subject: `Message ${i + 1}: ${faker.randomElement(["Query", "Update", "Request", "Notice", "Information"])}`,
            messageBody: faker.randomElement([
                "Please review the attached documents at your earliest convenience.",
                "Can we schedule a meeting to discuss this matter?",
                "I wanted to update you on the progress of our project.",
                "Kindly acknowledge receipt of this message.",
                "Following up on our previous conversation regarding the matter."
            ])
        };

        // Using /messages/send as per app.ts
        const result = await apiCall("POST", "/messages/send", messageData);
        if (result.ok) {
            successCount++;
        }
    }
    console.log(`✅ Created ${successCount} messages`);
}

async function seedNotifications(): Promise<void> {
    console.log("\n🔔 Creating User Notifications (15 entries)...");

    if (createdIds.users.length === 0) {
        console.log("⚠️ No users available. Skipping notification creation.");
        return;
    }

    const notificationTypes = ["email", "sms", "push", "in_app"];
    const subjects = [
        "New Assignment Posted", "Grade Updated", "Attendance Warning",
        "Fee Due Reminder", "Course Material Available", "Event Reminder",
        "Library Book Due", "Approval Required", "System Maintenance",
        "New Message Received", "Result Published", "Meeting Scheduled"
    ];

    let successCount = 0;
    for (let i = 0; i < 15; i++) {
        const subject = subjects[i % subjects.length];
        const notificationData = {
            userId: createdIds.users[i % createdIds.users.length],
            notificationType: faker.randomElement(notificationTypes),
            subject: subject,
            message: `Details about ${subject.toLowerCase()}. Please take necessary action as soon as possible.`
        };

        // Using /notifications-advanced/send as per app.ts
        const result = await apiCall("POST", "/notifications-advanced/send", notificationData);
        if (result.ok) {
            successCount++;
        }
    }
    console.log(`✅ Created ${successCount} notifications`);
}

async function seedFeeStructures(): Promise<void> {
    console.log("\n💰 Adding Fee Payments (15 entries)...");

    if (createdIds.students.length === 0) {
        console.log("⚠️ No students available. Skipping fee payment creation.");
        return;
    }

    // First get fee structures
    const feeResult = await apiCall("GET", "/fees/structures?limit=100");
    let feeIds: string[] = [];
    if (feeResult.ok && feeResult.data?.data) {
        feeIds = feeResult.data.data.map((f: any) => f.id);
    }

    if (feeIds.length === 0) {
        console.log("⚠️ No fee structures found. Skipping fee payment.");
        return;
    }

    let successCount = 0;
    for (let i = 0; i < 15; i++) {
        const paymentData = {
            studentId: createdIds.students[i % createdIds.students.length],
            feeId: feeIds[i % feeIds.length],
            amountPaid: faker.randomInt(5000, 50000),
            paymentMethod: faker.randomElement(["cash", "bank_transfer", "cheque", "online"]),
            recordedBy: currentUserId || createdIds.users[0],
            transactionId: `TXN${Date.now()}${i}`
        };

        // Using /fees/payment as per app.ts
        const result = await apiCall("POST", "/fees/payment", paymentData);
        if (result.ok) {
            successCount++;
        }
    }
    console.log(`✅ Created ${successCount} fee payments`);
}

async function seedRBACRoles(): Promise<void> {
    console.log("\n🔐 Creating RBAC Roles (15 entries)...");

    const roleNames = [
        "Department Head", "Vice Principal", "Coordinator", "Lab Assistant",
        "Librarian", "Sports Coach", "Accountant", "HR Manager",
        "IT Admin", "Security Head", "Transport Manager", "Cafeteria Manager",
        "Event Coordinator", "Exam Controller", "Academic Advisor"
    ];

    let successCount = 0;
    for (let i = 0; i < 15; i++) {
        const roleData = {
            branch_id: createdIds.branches[i % createdIds.branches.length] || createdIds.branches[0],
            role_name: `${roleNames[i % roleNames.length]} ${faker.randomInt(100, 999)}`,
            description: `Role for ${roleNames[i % roleNames.length]} with specific permissions`,
            is_system: false
        };

        const result = await apiCall("POST", "/rbac/roles", roleData);
        if (result.ok) {
            successCount++;
        }
    }
    console.log(`✅ Created ${successCount} RBAC roles`);
}

async function seedCourseContent(): Promise<void> {
    console.log("\n📂 Creating Course Content (15 entries)...");

    if (createdIds.courses.length === 0) {
        console.log("⚠️ No courses available. Skipping course content creation.");
        return;
    }

    const contentTypes = ["lecture", "video", "document", "assignment", "quiz"];
    const titles = [
        "Introduction to the Subject", "Core Concepts Overview", "Advanced Topics Discussion",
        "Practice Problems Set 1", "Video Lecture Week 1", "Study Notes Chapter 1",
        "Quiz for Week 1", "Assignment 1", "Supplementary Reading",
        "Lab Manual", "Project Guidelines", "Past Papers Analysis",
        "Revision Notes", "Sample Solutions", "Extra Practice Questions"
    ];

    let successCount = 0;
    for (let i = 0; i < 15; i++) {
        const contentData = {
            courseId: createdIds.courses[i % createdIds.courses.length],
            contentType: faker.randomElement(contentTypes),
            title: titles[i % titles.length],
            description: `Detailed content for ${titles[i % titles.length]}`,
            contentUrl: `https://storage.koolhub.edu/content/${faker.randomInt(1000, 9999)}.pdf`,
            fileName: `content_${faker.randomInt(1000, 9999)}.pdf`,
            fileSize: faker.randomInt(100000, 5000000),
            fileType: faker.randomElement(["pdf", "docx", "mp4", "pptx"]),
            sequenceOrder: i + 1,
            uploadedBy: currentUserId || createdIds.users[0]
        };

        const result = await apiCall("POST", "/course-content", contentData);
        if (result.ok) {
            successCount++;
        }
    }
    console.log(`✅ Created ${successCount} course content items`);
}

async function seedHealthRecords(): Promise<void> {
    console.log("\n🏥 Creating Health Records (15 entries)...");

    if (createdIds.students.length === 0) {
        console.log("⚠️ No students available. Skipping health record creation.");
        return;
    }

    // Create health records first
    let successCount = 0;
    for (let i = 0; i < 15; i++) {
        const healthData = {
            student_id: createdIds.students[i % createdIds.students.length],
            blood_group: faker.randomElement(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
            height: faker.randomInt(140, 180),
            weight: faker.randomInt(40, 80),
            allergies: faker.randomElement(["None", "Peanuts", "Dust", "Pollen", "Shellfish"]),
            chronic_conditions: faker.randomElement(["None", "Asthma", "Diabetes", "None", "None"]),
            medications: faker.randomElement(["None", "Inhaler", "Insulin", "None"]),
            emergency_contact: `${faker.randomElement(faker.names.first)} ${faker.randomElement(faker.names.last)}`,
            emergency_phone: faker.randomPhone(),
            doctor_name: `Dr. ${faker.randomElement(faker.names.first)} ${faker.randomElement(faker.names.last)}`,
            doctor_phone: faker.randomPhone()
        };

        const result = await apiCall("POST", "/medical/health-records", healthData);
        if (result.ok) {
            successCount++;
        }
    }
    console.log(`✅ Created ${successCount} health records`);
}

async function seedVaccinations(): Promise<void> {
    console.log("\n💉 Creating Vaccinations (15 entries)...");

    // Get health records first
    const healthResult = await apiCall("GET", "/medical/health-records?limit=100");
    let healthRecordIds: string[] = [];
    if (healthResult.ok && healthResult.data?.data) {
        healthRecordIds = healthResult.data.data.map((h: any) => h.id);
    }

    if (healthRecordIds.length === 0) {
        console.log("⚠️ No health records found. Skipping vaccination creation.");
        return;
    }

    const vaccines = ["COVID-19", "Flu", "Hepatitis B", "Tetanus", "MMR", "Polio"];

    let successCount = 0;
    for (let i = 0; i < 15; i++) {
        const vaccinationData = {
            health_record_id: healthRecordIds[i % healthRecordIds.length],
            vaccine_name: faker.randomElement(vaccines),
            vaccine_type: faker.randomElement(["mRNA", "Inactivated", "Live Attenuated"]),
            dose_number: faker.randomInt(1, 3),
            administered_date: new Date().toISOString(),
            administered_by: `Dr. ${faker.randomElement(faker.names.first)}`,
            batch_number: `BATCH${faker.randomInt(10000, 99999)}`,
            manufacturer: faker.randomElement(["Pfizer", "Sinovac", "AstraZeneca", "J&J"])
        };

        const result = await apiCall("POST", "/medical/vaccinations", vaccinationData);
        if (result.ok) {
            successCount++;
        }
    }
    console.log(`✅ Created ${successCount} vaccinations`);
}

async function seedReports(): Promise<void> {
    console.log("\n📊 Creating Reports (15 entries)...");

    const reportTypes = ["attendance", "grades", "fee_collection", "enrollment", "teacher_performance"];
    const titles = [
        "Monthly Attendance Report", "Quarterly Grade Analysis", "Fee Collection Summary",
        "Enrollment Statistics", "Teacher Performance Review", "Student Progress Report",
        "Financial Summary", "Academic Year Overview", "Department Review",
        "Class Performance", "Subject Analysis", "Branch Comparison",
        "Annual Report", "Mid-Term Analysis", "End Term Summary"
    ];

    let successCount = 0;
    for (let i = 0; i < 15; i++) {
        const reportData = {
            branchId: createdIds.branches[i % createdIds.branches.length] || createdIds.branches[0],
            reportType: faker.randomElement(reportTypes),
            title: titles[i % titles.length],
            description: `Detailed ${titles[i % titles.length].toLowerCase()} for the current period`,
            format: faker.randomElement(["pdf", "xlsx", "csv"]),
            dateRangeStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            dateRangeEnd: new Date().toISOString()
        };

        const result = await apiCall("POST", "/reports/generate", reportData);
        if (result.ok) {
            successCount++;
        }
    }
    console.log(`✅ Created ${successCount} reports`);
}

async function seedBookLoans(): Promise<void> {
    console.log("\n📖 Creating Book Loans (15 entries)...");

    // Get books first
    const booksResult = await apiCall("GET", "/library/books?limit=100");
    let bookIds: string[] = [];
    if (booksResult.ok && booksResult.data?.data) {
        bookIds = booksResult.data.data.map((b: any) => b.id);
    }

    if (bookIds.length === 0 || createdIds.students.length === 0) {
        console.log("⚠️ Missing books or students. Skipping book loans.");
        return;
    }

    let successCount = 0;
    for (let i = 0; i < 15; i++) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        const loanData = {
            bookId: bookIds[i % bookIds.length],
            studentId: createdIds.students[i % createdIds.students.length],
            borrowerType: "student",
            dueDate: dueDate.toISOString(),
            issuedBy: currentUserId || createdIds.users[0]
        };

        const result = await apiCall("POST", "/library/books/loan", loanData);
        if (result.ok) {
            successCount++;
        }
    }
    console.log(`✅ Created ${successCount} book loans`);
}

async function seedAnalyticsMetrics(): Promise<void> {
    console.log("\n📈 Creating Analytics Metrics (15 entries)...");

    const metricTypes = ["attendance_rate", "pass_rate", "enrollment_count", "fee_collection", "teacher_attendance"];
    const metricNames = [
        "Daily Attendance Rate", "Weekly Pass Rate", "Monthly Enrollment",
        "Quarterly Fee Collection", "Teacher Attendance Rate", "Student Engagement",
        "Course Completion Rate", "Assignment Submission Rate", "Library Usage",
        "Event Participation", "Parent Engagement", "Academic Performance",
        "Resource Utilization", "System Usage", "Communication Rate"
    ];

    let successCount = 0;
    for (let i = 0; i < 15; i++) {
        const periodStart = new Date();
        periodStart.setMonth(periodStart.getMonth() - 1);
        const periodEnd = new Date();

        const metricData = {
            branchId: createdIds.branches[i % createdIds.branches.length] || createdIds.branches[0],
            metricType: faker.randomElement(metricTypes),
            metricName: metricNames[i % metricNames.length],
            metricValue: faker.randomInt(60, 100),
            comparisonValue: faker.randomInt(55, 95),
            trend: faker.randomElement(["up", "down", "stable"]),
            periodStart: periodStart.toISOString(),
            periodEnd: periodEnd.toISOString()
        };

        const result = await apiCall("POST", "/analytics", metricData);
        if (result.ok) {
            successCount++;
        }
    }
    console.log(`✅ Created ${successCount} analytics metrics`);
}

// ============================================
// MAIN EXECUTION
// ============================================

async function printSummary(): Promise<void> {
    console.log("\n" + "=".repeat(60));
    console.log("📊 FINAL DATA SEEDING SUMMARY");
    console.log("=".repeat(60));
    console.log(`Branches:      ${createdIds.branches.length}`);
    console.log(`Users:         ${createdIds.users.length}`);
    console.log(`Teachers:      ${createdIds.teachers.length}`);
    console.log(`Students:      ${createdIds.students.length}`);
    console.log(`Courses:       ${createdIds.courses.length}`);
    console.log(`Leave Reqs:    ${createdIds.leaves.length}`);
    console.log("=".repeat(60));
    console.log("✨ API Data seeding complete!");
    console.log("\n📝 Note: Many additional entries were created via previous runs.");
    console.log("   Check the database directly for total counts.");
}

async function main(): Promise<void> {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║      API DATA SEEDER v3 (Final) - Student Management      ║");
    console.log("║        Populating 15+ entries per table via API           ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    // Step 1: Login
    const loggedIn = await login();
    if (!loggedIn) {
        console.error("❌ Cannot proceed without authentication. Exiting.");
        process.exit(1);
    }

    // Step 2: Get existing data for reference
    await getExistingData();

    // Step 3: Seed all remaining entities
    await seedRBACRoles();
    await seedLeaveRequests();
    await seedAdmissions();
    await seedMessages();
    await seedNotifications();
    await seedFeeStructures();
    await seedCourseContent();
    await seedHealthRecords();
    await seedVaccinations();
    await seedReports();
    await seedBookLoans();
    await seedAnalyticsMetrics();

    // Step 4: Print summary
    await printSummary();
}

// Run the seeder
main().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
});
