import bcrypt from 'bcryptjs';

/**
 * Test data fixtures for consistent testing - Updated to match actual Prisma schema
 */

// Test Users
export const testUsers = {
    admin: {
        email: 'admin@test.com',
        username: 'admin@test.com',
        password: 'Admin@123',
        password_hash: bcrypt.hashSync('Admin@123', 10),
        first_name: 'Test',
        last_name: 'Admin',
        phone: '+1234567890',
        role_id: '', // Will be set dynamically in tests
        is_active: true,
    },
    superadmin: {
        email: 'superadmin@test.com',
        username: 'superadmin@test.com',
        password: 'Super@123',
        password_hash: bcrypt.hashSync('Super@123', 10),
        first_name: 'Super',
        last_name: 'Admin',
        phone: '+1234567891',
        role_id: '', // Will be set dynamically in tests
        is_active: true,
    },
    teacher: {
        email: 'teacher@test.com',
        username: 'teacher@test.com',
        password: 'Teacher@123',
        password_hash: bcrypt.hashSync('Teacher@123', 10),
        first_name: 'Test',
        last_name: 'Teacher',
        phone: '+1234567892',
        role_id: '', // Will be set dynamically in tests
        is_active: true,
    },
    student: {
        email: 'student@test.com',
        username: 'student@test.com',
        password: 'Student@123',
        password_hash: bcrypt.hashSync('Student@123', 10),
        first_name: 'Test',
        last_name: 'Student',
        phone: '+1234567893',
        role_id: '', // Will be set dynamically in tests
        is_active: true,
    },
    parent: {
        email: 'parent@test.com',
        username: 'parent@test.com',
        password: 'Parent@123',
        password_hash: bcrypt.hashSync('Parent@123', 10),
        first_name: 'Test',
        last_name: 'Parent',
        phone: '+1234567894',
        role_id: '', // Will be set dynamically in tests
        is_active: true,
    },
};

// Test Branch
export const testBranch = {
    code: `TEST-${Date.now()}`,
    name: `Test Campus ${Date.now()}`,
    address: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    postal_code: '12345',
    country: 'Test Country',
    phone: '+1234567890',
    email: 'test@campus.com',
    website: 'https://test.campus.com',
    is_active: true,
};

// Test Academic Year
export const testAcademicYear = {
    year: '2024',
    start_date: new Date('2024-09-01'),
    end_date: new Date('2025-06-30'),
};

// Test Grade Levels
export const testGradeLevels = [
    {
        name: 'Grade 1',
        code: 'G1',
        is_active: true,
    },
    {
        name: 'Grade 2',
        code: 'G2',
        is_active: true,
    },
];

// Test Subjects
export const testSubjects = [
    {
        name: 'Mathematics',
        code: 'MATH-101',
        is_active: true,
    },
    {
        name: 'Science',
        code: 'SCI-101',
        is_active: true,
    },
    {
        name: 'English',
        code: 'ENG-101',
        is_active: true,
    },
];

// Test Student Data
export const testStudentData = {
    student_code: 'STU-TEST-001',
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: new Date('2010-01-01'),
    gender: 'Male',
    admission_date: new Date('2024-09-01'),
    permanent_address: '456 Student Ave, Test City, Test State, Test Country, 12345',
    current_address: '456 Student Ave, Test City, Test State, Test Country, 12345',
    postal_code: '12345',
    is_active: true,
};

// Test Teacher Data - Updated with correct field names
export const testTeacherData = {
    employee_code: 'TEACH-TEST-001', // Changed from employee_id
    first_name: 'Jane',
    last_name: 'Smith',
    date_of_birth: new Date('1985-05-15'),
    gender: 'Female',
    email: 'jane.smith@test.com',
    phone: '+1234567896',
    personal_address: '789 Teacher Rd', // Changed from address
    hire_date: new Date('2020-09-01'), // Added required field
    employment_type: 'full_time', // Added required field
    qualification: 'Masters',
    years_experience: 5, // Changed from years_of_experience
    is_active: true,
};

// Test Course Data - Updated with correct field names
export const testCourseData = {
    course_name: 'Introduction to Mathematics', // Changed from name
    course_code: 'MATH-101-2024', // Changed from code
    description: 'Basic mathematics for Grade 1',
    max_students: 30,
    is_active: true,
};

/**
 * Helper to create complete test user with profile
 */
export function createTestUser(type: keyof typeof testUsers) {
    return {
        ...testUsers[type],
        created_at: new Date(),
        updated_at: new Date(),
    };
}
