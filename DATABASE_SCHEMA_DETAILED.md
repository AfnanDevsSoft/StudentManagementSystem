# DATABASE SCHEMA - DETAILED SPECIFICATIONS

**Version:** 1.0  
**Date:** November 30, 2025

---

## TABLE OF CONTENTS

1. [User & Authentication Tables](#user--authentication-tables)
2. [Branch Management Tables](#branch-management-tables)
3. [Student Management Tables](#student-management-tables)
4. [Teacher Management Tables](#teacher-management-tables)
5. [Academic Management Tables](#academic-management-tables)
6. [Admissions Tables](#admissions-tables)
7. [Payroll Tables](#payroll-tables)
8. [System Tables](#system-tables)

---

## USER & AUTHENTICATION TABLES

### users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  role_id UUID NOT NULL REFERENCES roles(id),
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  profile_photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP NULL,
  login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_branch ON users(branch_id);
CREATE INDEX idx_users_role ON users(role_id);
```

### roles Table

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_roles_name ON roles(name);
```

### user_branches Table

```sql
CREATE TABLE user_branches (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  access_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, branch_id)
);
```

---

## BRANCH MANAGEMENT TABLES

### branches Table

```sql
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state_province VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  principal_name VARCHAR(255),
  principal_email VARCHAR(255),
  logo_url TEXT,
  banner_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(10) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  settings JSONB, -- Holiday calendar, working hours, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_branches_code ON branches(code);
```

---

## STUDENT MANAGEMENT TABLES

### students Table

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES users(id),
  student_code VARCHAR(50) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20),
  blood_group VARCHAR(10),
  nationality VARCHAR(100),
  mother_tongue VARCHAR(100),
  cnic VARCHAR(50),
  passport_number VARCHAR(50),

  -- Address
  permanent_address TEXT,
  current_address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),

  -- Contact
  personal_phone VARCHAR(20),
  personal_email VARCHAR(255),

  -- Academic
  admission_date DATE NOT NULL,
  admission_status VARCHAR(50) DEFAULT 'pending',
  current_grade_level_id UUID REFERENCES grade_levels(id),
  previous_school VARCHAR(255),
  transfer_certificate_url TEXT,

  -- Photos & Documents
  profile_photo_url TEXT,
  birth_certificate_url TEXT,
  cnic_copy_url TEXT,

  -- Special Needs
  has_special_needs BOOLEAN DEFAULT false,
  special_needs_description TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  graduation_date DATE,
  graduation_status VARCHAR(50), -- graduated, promoted, retained, dropped

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_code ON students(student_code);
CREATE INDEX idx_students_branch ON students(branch_id);
CREATE INDEX idx_students_user ON students(user_id);
```

### parents_guardians Table

```sql
CREATE TABLE parents_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50), -- father, mother, guardian, uncle, aunt
  primary_phone VARCHAR(20),
  secondary_phone VARCHAR(20),
  email VARCHAR(255),
  occupation VARCHAR(100),
  organization VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  cnic VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### student_parents Table

```sql
CREATE TABLE student_parents (
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents_guardians(id) ON DELETE CASCADE,
  is_primary_contact BOOLEAN DEFAULT false,
  custody_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, parent_id)
);
```

### communication_logs Table

```sql
CREATE TABLE communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES parents_guardians(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  communication_type VARCHAR(50), -- email, sms, phone, meeting, written
  subject VARCHAR(255),
  message TEXT,
  attachments JSONB,
  status VARCHAR(50), -- pending, sent, read, failed
  read_at TIMESTAMP NULL,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comm_student ON communication_logs(student_id);
CREATE INDEX idx_comm_parent ON communication_logs(parent_id);
CREATE INDEX idx_comm_date ON communication_logs(created_at);
```

---

## TEACHER MANAGEMENT TABLES

### teachers Table

```sql
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES users(id),
  employee_code VARCHAR(50) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  nationality VARCHAR(100),
  cnic VARCHAR(50),

  -- Employment
  hire_date DATE NOT NULL,
  employment_type VARCHAR(50), -- full_time, part_time, contract, substitute
  department VARCHAR(100),
  designation VARCHAR(100),
  qualification_level VARCHAR(100), -- Bachelor, Master, PhD, etc.
  qualifications TEXT, -- JSON array of qualifications
  certifications JSONB,
  years_of_experience INT,

  -- Contact
  office_phone VARCHAR(20),
  office_location VARCHAR(100),
  personal_address TEXT,

  -- Work Details
  reporting_manager_id UUID REFERENCES teachers(id),
  salary_grade VARCHAR(50),

  -- Status
  is_active BOOLEAN DEFAULT true,
  employment_status VARCHAR(50), -- active, on_leave, suspended, terminated
  suspension_reason TEXT,
  termination_date DATE,

  -- Documents
  profile_photo_url TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teachers_code ON teachers(employee_code);
CREATE INDEX idx_teachers_branch ON teachers(branch_id);
```

### teacher_attendance Table

```sql
CREATE TABLE teacher_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status VARCHAR(20), -- present, absent, half_day, late, on_leave
  is_holiday BOOLEAN DEFAULT false,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(teacher_id, date)
);

CREATE INDEX idx_teach_att_date ON teacher_attendance(date);
CREATE INDEX idx_teach_att_teacher ON teacher_attendance(teacher_id);
```

---

## ACADEMIC MANAGEMENT TABLES

### academic_years Table

```sql
CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  year VARCHAR(20) NOT NULL, -- e.g., "2024-2025"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  settings JSONB, -- Grading scale, promotion rules, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(branch_id, year)
);
```

### grade_levels Table

```sql
CREATE TABLE grade_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  sort_order INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(branch_id, code)
);
```

### subjects Table

```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  credits INT,
  is_elective BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(branch_id, code)
);
```

### courses Table

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  grade_level_id UUID NOT NULL REFERENCES grade_levels(id),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  course_name VARCHAR(255) NOT NULL,
  course_code VARCHAR(50) UNIQUE,
  description TEXT,
  max_students INT DEFAULT 40,
  room_number VARCHAR(50),
  building VARCHAR(100),

  -- Schedule
  schedule JSONB, -- {monday: {start: "09:00", end: "10:00"}, ...}

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_academic_year ON courses(academic_year_id);
CREATE INDEX idx_courses_teacher ON courses(teacher_id);
```

### student_enrollments Table

```sql
CREATE TABLE student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_date DATE NOT NULL,
  status VARCHAR(50), -- enrolled, completed, dropped, failed, withdrawn
  final_grade VARCHAR(10),
  gpa_points DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id)
);

CREATE INDEX idx_enroll_student ON student_enrollments(student_id);
CREATE INDEX idx_enroll_course ON student_enrollments(course_id);
```

### attendance Table

```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  date DATE NOT NULL,
  status VARCHAR(20), -- present, absent, late, excused, half_day
  recorded_by UUID NOT NULL REFERENCES teachers(id),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id, date)
);

CREATE INDEX idx_att_student ON attendance(student_id);
CREATE INDEX idx_att_course ON attendance(course_id);
CREATE INDEX idx_att_date ON attendance(date);
```

### grades Table

```sql
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  assessment_type VARCHAR(50), -- quiz, assignment, project, midterm, final, participation
  assessment_name VARCHAR(255),
  score DECIMAL(5, 2) NOT NULL,
  max_score DECIMAL(5, 2) DEFAULT 100,
  weight DECIMAL(5, 2), -- Percentage weight in final grade
  grade_date DATE NOT NULL,
  remarks TEXT,
  graded_by UUID NOT NULL REFERENCES teachers(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_course ON grades(course_id);
CREATE INDEX idx_grades_date ON grade_date;
```

---

## ADMISSIONS TABLES

### admission_forms Table

```sql
CREATE TABLE admission_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  form_name VARCHAR(255) NOT NULL,
  form_template JSONB NOT NULL, -- Dynamic form structure
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### admission_applications Table

```sql
CREATE TABLE admission_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  admission_form_id UUID NOT NULL REFERENCES admission_forms(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  application_number VARCHAR(50) UNIQUE NOT NULL,
  applicant_data JSONB NOT NULL,
  applicant_email VARCHAR(255),
  applicant_phone VARCHAR(20),
  status VARCHAR(50), -- submitted, under_review, approved, rejected, enrolled
  application_date DATE NOT NULL,
  review_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  review_date DATE,
  payment_status VARCHAR(50), -- pending, paid, refunded
  enrollment_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_number ON admission_applications(application_number);
CREATE INDEX idx_app_status ON admission_applications(status);
CREATE INDEX idx_app_email ON admission_applications(applicant_email);
```

---

## PAYROLL TABLES

### salary_structures Table

```sql
CREATE TABLE salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  structure_name VARCHAR(255) NOT NULL,
  base_salary DECIMAL(10, 2) NOT NULL,
  allowances JSONB, -- {housing: 5000, transport: 2000, ...}
  deductions JSONB, -- {tax_rate: 0.15, social_security: 0.05, ...}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(branch_id, structure_name)
);
```

### payroll_records Table

```sql
CREATE TABLE payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  year INT NOT NULL,
  base_salary DECIMAL(10, 2) NOT NULL,
  allowances DECIMAL(10, 2) DEFAULT 0,
  gross_salary DECIMAL(10, 2) NOT NULL,
  deductions DECIMAL(10, 2) DEFAULT 0,
  net_salary DECIMAL(10, 2) NOT NULL,
  days_worked INT,
  days_absent INT,
  leave_days INT,
  overtime_hours DECIMAL(5, 2),
  calculation_details JSONB,
  status VARCHAR(50), -- draft, approved, paid
  paid_date DATE,
  payslip_url TEXT,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(teacher_id, month, year)
);

CREATE INDEX idx_payroll_teacher ON payroll_records(teacher_id);
CREATE INDEX idx_payroll_month_year ON payroll_records(month, year);
```

### leave_requests Table

```sql
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL, -- annual, sick, casual, emergency, unpaid
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INT NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID REFERENCES users(id),
  approval_date DATE,
  approval_comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leave_teacher ON leave_requests(teacher_id);
CREATE INDEX idx_leave_status ON leave_requests(status);
```

---

## SYSTEM TABLES

### notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50), -- email, sms, in_app
  subject VARCHAR(255),
  message TEXT,
  data JSONB,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, read
  sent_at TIMESTAMP NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_created ON notifications(created_at);
```

### audit_logs Table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  action VARCHAR(100), -- create, read, update, delete, login, etc.
  entity_type VARCHAR(100), -- student, teacher, course, etc.
  entity_id UUID,
  entity_name VARCHAR(255),
  changes JSONB, -- Before/after values
  ip_address VARCHAR(50),
  user_agent TEXT,
  status VARCHAR(50), -- success, failure
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
```

---

**END OF DATABASE SCHEMA DOCUMENT**
