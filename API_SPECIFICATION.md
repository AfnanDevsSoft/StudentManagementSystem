# API SPECIFICATION - COMPLETE REFERENCE

**Version:** 1.0  
**Date:** November 30, 2025  
**Status:** Ready for Implementation

---

## TABLE OF CONTENTS

1. [Authentication & Authorization](#authentication--authorization)
2. [Branch Management](#branch-management)
3. [User & Role Management](#user--role-management)
4. [Student Management](#student-management)
5. [Teacher Management](#teacher-management)
6. [Academic Management](#academic-management)
7. [Attendance Management](#attendance-management)
8. [Grades & Assessment](#grades--assessment)
9. [Admissions](#admissions)
10. [Payroll Management](#payroll-management)
11. [Communications](#communications)
12. [Analytics & Reporting](#analytics--reporting)
13. [System Administration](#system-administration)

---

## AUTHENTICATION & AUTHORIZATION

### 1.1 User Login

```
POST /api/v1/auth/login
Content-Type: application/json

Request:
{
  "username": "string",
  "password": "string",
  "branch_id": "uuid (optional)"
}

Response (200):
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "role": "string",
    "branch_id": "uuid",
    "branch_name": "string",
    "permissions": ["string"],
    "access_token": "string",
    "refresh_token": "string",
    "expires_in": 3600
  }
}
```

### 1.2 Token Refresh

```
POST /api/v1/auth/refresh
Authorization: Bearer {access_token}

Response (200):
{
  "access_token": "string",
  "expires_in": 3600
}
```

### 1.3 User Logout

```
POST /api/v1/auth/logout
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 1.4 Change Password

```
POST /api/v1/auth/change-password
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "current_password": "string",
  "new_password": "string",
  "confirm_password": "string"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 1.5 Verify Email (Two-Factor)

```
POST /api/v1/auth/verify-otp
Content-Type: application/json

Request:
{
  "email": "string",
  "otp": "string"
}

Response (200):
{
  "success": true,
  "verified": true
}
```

---

## BRANCH MANAGEMENT

### 2.1 Create Branch

```
POST /api/v1/branches
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "name": "string",
  "code": "string (unique)",
  "address": "string",
  "city": "string",
  "state_province": "string",
  "country": "string",
  "postal_code": "string",
  "phone": "string",
  "email": "string",
  "website": "string",
  "principal_name": "string",
  "principal_email": "string",
  "timezone": "string",
  "currency": "string",
  "settings": {}
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "code": "string",
    ...
  }
}
```

### 2.2 List Branches

```
GET /api/v1/branches?skip=0&limit=20&search=string

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "code": "string",
      "city": "string",
      "is_active": boolean
    }
  ],
  "pagination": {
    "total": 10,
    "skip": 0,
    "limit": 20,
    "has_more": false
  }
}
```

### 2.3 Get Branch Details

```
GET /api/v1/branches/:branch_id

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "code": "string",
    "address": "string",
    "city": "string",
    ...
  }
}
```

### 2.4 Update Branch

```
PATCH /api/v1/branches/:branch_id
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "name": "string (optional)",
  "address": "string (optional)",
  ...
}

Response (200):
{
  "success": true,
  "data": {...}
}
```

### 2.5 Deactivate Branch

```
DELETE /api/v1/branches/:branch_id
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "message": "Branch deactivated"
}
```

---

## USER & ROLE MANAGEMENT

### 3.1 Create User

```
POST /api/v1/users
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "branch_id": "uuid",
  "role_id": "uuid",
  "username": "string (unique)",
  "email": "string (unique)",
  "password": "string",
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "send_welcome_email": boolean
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "object",
    "branch_id": "uuid"
  }
}
```

### 3.2 List Users by Branch

```
GET /api/v1/branches/:branch_id/users?skip=0&limit=20&role_id=uuid

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "first_name": "string",
      "role": "string",
      "is_active": boolean,
      "last_login": "timestamp"
    }
  ],
  "pagination": {...}
}
```

### 3.3 Get User Profile

```
GET /api/v1/users/:user_id

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "phone": "string",
    "profile_photo_url": "string",
    "role": "object",
    "branch_id": "uuid",
    "created_at": "timestamp"
  }
}
```

### 3.4 Update User

```
PATCH /api/v1/users/:user_id
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "phone": "string (optional)",
  "profile_photo_url": "string (optional)"
}

Response (200):
{
  "success": true,
  "data": {...}
}
```

### 3.5 List Roles by Branch

```
GET /api/v1/branches/:branch_id/roles

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "is_system": boolean,
      "permissions": ["string"]
    }
  ]
}
```

### 3.6 Create Custom Role

```
POST /api/v1/branches/:branch_id/roles
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "name": "string",
  "description": "string",
  "permissions": ["string"]
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "permissions": ["string"]
  }
}
```

---

## STUDENT MANAGEMENT

### 4.1 Create Student

```
POST /api/v1/students
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "branch_id": "uuid",
  "first_name": "string",
  "middle_name": "string (optional)",
  "last_name": "string",
  "date_of_birth": "date",
  "gender": "string",
  "blood_group": "string (optional)",
  "nationality": "string",
  "mother_tongue": "string (optional)",
  "cnic": "string (optional)",
  "permanent_address": "string",
  "current_address": "string (optional)",
  "city": "string",
  "postal_code": "string",
  "personal_phone": "string",
  "personal_email": "string",
  "admission_date": "date",
  "current_grade_level_id": "uuid",
  "previous_school": "string (optional)",
  "has_special_needs": boolean,
  "special_needs_description": "string (optional)",
  "parent_ids": ["uuid"] // Links to parents
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "student_code": "string (auto-generated)",
    "first_name": "string",
    "admission_status": "pending",
    ...
  }
}
```

### 4.2 List Students by Branch

```
GET /api/v1/branches/:branch_id/students?skip=0&limit=20&grade_level_id=uuid&search=string

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "student_code": "string",
      "first_name": "string",
      "last_name": "string",
      "date_of_birth": "date",
      "current_grade_level_id": "uuid",
      "admission_status": "string",
      "is_active": boolean
    }
  ],
  "pagination": {...}
}
```

### 4.3 Get Student Profile (Full)

```
GET /api/v1/students/:student_id

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "student_code": "string",
    "personal_info": {...},
    "contact_info": {...},
    "academic_info": {...},
    "parents": [
      {
        "id": "uuid",
        "name": "string",
        "relationship": "string",
        "contact_info": {...}
      }
    ],
    "enrollments": [...],
    "attendance": {...},
    "grades": [...],
    "created_at": "timestamp"
  }
}
```

### 4.4 Update Student

```
PATCH /api/v1/students/:student_id
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  // Any student field can be updated
  "current_address": "string",
  "personal_phone": "string",
  ...
}

Response (200):
{
  "success": true,
  "data": {...}
}
```

### 4.5 Add Parent/Guardian

```
POST /api/v1/students/:student_id/parents
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "first_name": "string",
  "last_name": "string",
  "relationship": "string",
  "phone": "string",
  "email": "string",
  "occupation": "string (optional)",
  "organization": "string (optional)",
  "is_primary_contact": boolean
}

Response (201):
{
  "success": true,
  "data": {...}
}
```

### 4.6 Get Student Transcript

```
GET /api/v1/students/:student_id/transcript?academic_year_id=uuid

Response (200):
{
  "success": true,
  "data": {
    "student_info": {...},
    "academic_history": [
      {
        "academic_year": "string",
        "courses": [
          {
            "course_name": "string",
            "final_grade": "string",
            "gpa_points": "decimal"
          }
        ],
        "gpa": "decimal",
        "promotion_status": "string"
      }
    ]
  }
}
```

---

## TEACHER MANAGEMENT

### 5.1 Create Teacher

```
POST /api/v1/teachers
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "branch_id": "uuid",
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone": "string",
  "date_of_birth": "date",
  "gender": "string",
  "nationality": "string",
  "cnic": "string",
  "hire_date": "date",
  "employment_type": "string",
  "department": "string",
  "designation": "string",
  "qualification_level": "string",
  "qualifications": ["string"],
  "certifications": [],
  "years_of_experience": "integer",
  "personal_address": "string",
  "create_user_account": boolean,
  "reporting_manager_id": "uuid (optional)"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "employee_code": "string (auto-generated)",
    "first_name": "string",
    ...
  }
}
```

### 5.2 List Teachers by Branch

```
GET /api/v1/branches/:branch_id/teachers?skip=0&limit=20&department=string&search=string

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employee_code": "string",
      "first_name": "string",
      "last_name": "string",
      "designation": "string",
      "department": "string",
      "employment_status": "string"
    }
  ],
  "pagination": {...}
}
```

### 5.3 Get Teacher Profile

```
GET /api/v1/teachers/:teacher_id

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "employee_code": "string",
    "personal_info": {...},
    "employment_details": {...},
    "qualifications": [...],
    "certifications": [...],
    "assigned_courses": [
      {
        "id": "uuid",
        "course_name": "string",
        "grade_level": "string"
      }
    ],
    "performance_metrics": {...}
  }
}
```

### 5.4 Update Teacher

```
PATCH /api/v1/teachers/:teacher_id
Authorization: Bearer {access_token}
Content-Type: application/json

Response (200):
{
  "success": true,
  "data": {...}
}
```

### 5.5 Teacher Attendance

```
GET /api/v1/teachers/:teacher_id/attendance?month=int&year=int

Response (200):
{
  "success": true,
  "data": {
    "teacher_name": "string",
    "month": "integer",
    "year": "integer",
    "records": [
      {
        "date": "date",
        "check_in": "time",
        "check_out": "time",
        "status": "string",
        "remarks": "string"
      }
    ],
    "summary": {
      "total_days": 22,
      "present_days": 20,
      "absent_days": 2,
      "half_days": 0
    }
  }
}
```

### 5.6 Record Teacher Attendance

```
POST /api/v1/teachers/:teacher_id/attendance
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "date": "date",
  "check_in": "time",
  "check_out": "time",
  "status": "string"
}

Response (201):
{
  "success": true,
  "data": {...}
}
```

---

## ACADEMIC MANAGEMENT

### 6.1 Create Academic Year

```
POST /api/v1/academic-years
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "branch_id": "uuid",
  "year": "string (e.g., 2024-2025)",
  "start_date": "date",
  "end_date": "date",
  "settings": {}
}

Response (201):
{
  "success": true,
  "data": {...}
}
```

### 6.2 List Academic Years

```
GET /api/v1/branches/:branch_id/academic-years

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "year": "string",
      "start_date": "date",
      "end_date": "date",
      "is_current": boolean
    }
  ]
}
```

### 6.3 Create Course

```
POST /api/v1/courses
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "branch_id": "uuid",
  "academic_year_id": "uuid",
  "subject_id": "uuid",
  "grade_level_id": "uuid",
  "teacher_id": "uuid",
  "course_name": "string",
  "course_code": "string (unique)",
  "description": "string",
  "max_students": 40,
  "room_number": "string",
  "building": "string",
  "schedule": {
    "monday": {"start": "09:00", "end": "10:00"},
    ...
  }
}

Response (201):
{
  "success": true,
  "data": {...}
}
```

### 6.4 List Courses by Academic Year

```
GET /api/v1/academic-years/:academic_year_id/courses?teacher_id=uuid&grade_level_id=uuid

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "course_code": "string",
      "course_name": "string",
      "teacher_name": "string",
      "grade_level": "string",
      "max_students": 40,
      "enrolled_students": 35
    }
  ]
}
```

### 6.5 Enroll Student in Course

```
POST /api/v1/courses/:course_id/enrollments
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "student_id": "uuid",
  "enrollment_date": "date"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "course_id": "uuid",
    "status": "enrolled"
  }
}
```

### 6.6 List Course Enrollments

```
GET /api/v1/courses/:course_id/enrollments

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "student_name": "string",
      "enrollment_date": "date",
      "status": "string"
    }
  ]
}
```

---

## ATTENDANCE MANAGEMENT

### 7.1 Record Student Attendance

```
POST /api/v1/attendance
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "course_id": "uuid",
  "student_id": "uuid",
  "date": "date",
  "status": "string",
  "remarks": "string (optional)"
}

Response (201):
{
  "success": true,
  "data": {...}
}
```

### 7.2 Bulk Record Attendance

```
POST /api/v1/attendance/bulk
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "course_id": "uuid",
  "date": "date",
  "records": [
    {
      "student_id": "uuid",
      "status": "string"
    }
  ]
}

Response (201):
{
  "success": true,
  "data": [...]
}
```

### 7.3 Get Student Attendance

```
GET /api/v1/students/:student_id/attendance?course_id=uuid&start_date=date&end_date=date

Response (200):
{
  "success": true,
  "data": {
    "student_name": "string",
    "records": [...],
    "summary": {
      "total_days": 100,
      "present_days": 92,
      "absent_days": 8,
      "attendance_percentage": 92
    }
  }
}
```

---

## GRADES & ASSESSMENT

### 8.1 Record Grade

```
POST /api/v1/grades
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "student_id": "uuid",
  "course_id": "uuid",
  "academic_year_id": "uuid",
  "assessment_type": "string",
  "assessment_name": "string",
  "score": decimal,
  "max_score": decimal,
  "weight": decimal,
  "grade_date": "date",
  "remarks": "string (optional)"
}

Response (201):
{
  "success": true,
  "data": {...}
}
```

### 8.2 Bulk Upload Grades

```
POST /api/v1/grades/bulk-upload
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Request:
{
  "file": "<CSV/Excel file>",
  "course_id": "uuid",
  "academic_year_id": "uuid"
}

Response (201):
{
  "success": true,
  "imported_count": 150,
  "errors": []
}
```

### 8.3 Get Student Grades

```
GET /api/v1/students/:student_id/grades?course_id=uuid&academic_year_id=uuid

Response (200):
{
  "success": true,
  "data": {
    "records": [
      {
        "assessment_type": "string",
        "assessment_name": "string",
        "score": decimal,
        "max_score": decimal,
        "weight": decimal,
        "date": "date"
      }
    ],
    "final_grade": "string (A, B, C, etc)",
    "gpa_points": decimal
  }
}
```

### 8.4 Get Class Grade Summary

```
GET /api/v1/courses/:course_id/grade-summary?academic_year_id=uuid

Response (200):
{
  "success": true,
  "data": {
    "course_name": "string",
    "academic_year": "string",
    "total_students": 35,
    "average_score": 78.5,
    "highest_score": 95,
    "lowest_score": 45,
    "grade_distribution": {
      "A": 8,
      "B": 12,
      "C": 10,
      "D": 4,
      "F": 1
    }
  }
}
```

---

## ADMISSIONS

### 9.1 Create Admission Form

```
POST /api/v1/admission-forms
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "branch_id": "uuid",
  "academic_year_id": "uuid",
  "form_name": "string",
  "form_template": {
    // Dynamic form schema
    "fields": [...]
  }
}

Response (201):
{
  "success": true,
  "data": {...}
}
```

### 9.2 Submit Admission Application

```
POST /api/v1/admission-applications
Content-Type: application/json

Request:
{
  "branch_id": "uuid",
  "admission_form_id": "uuid",
  "academic_year_id": "uuid",
  "applicant_data": {...},
  "applicant_email": "string",
  "applicant_phone": "string"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "application_number": "string",
    "status": "submitted",
    "application_date": "date"
  }
}
```

### 9.3 List Admission Applications

```
GET /api/v1/admission-applications?branch_id=uuid&academic_year_id=uuid&status=string&skip=0&limit=20

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "application_number": "string",
      "applicant_email": "string",
      "applicant_phone": "string",
      "status": "string",
      "application_date": "date",
      "payment_status": "string"
    }
  ],
  "pagination": {...}
}
```

### 9.4 Review Application

```
PATCH /api/v1/admission-applications/:application_id
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "status": "string",
  "review_notes": "string",
  "approval_decision": "approved|rejected"
}

Response (200):
{
  "success": true,
  "data": {...}
}
```

---

## PAYROLL MANAGEMENT

### 10.1 Create Salary Structure

```
POST /api/v1/salary-structures
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "branch_id": "uuid",
  "structure_name": "string",
  "base_salary": decimal,
  "allowances": {
    "housing": decimal,
    "transport": decimal,
    "other": decimal
  },
  "deductions": {
    "tax_rate": decimal,
    "social_security_rate": decimal,
    "other": decimal
  }
}

Response (201):
{
  "success": true,
  "data": {...}
}
```

### 10.2 Generate Payroll

```
POST /api/v1/payroll-records/generate
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "branch_id": "uuid",
  "month": integer,
  "year": integer,
  "salary_structure_id": "uuid"
}

Response (202):
{
  "success": true,
  "message": "Payroll generation started",
  "job_id": "uuid"
}
```

### 10.3 List Payroll Records

```
GET /api/v1/payroll-records?branch_id=uuid&month=int&year=int&teacher_id=uuid

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "teacher_name": "string",
      "month": integer,
      "year": integer,
      "base_salary": decimal,
      "allowances": decimal,
      "gross_salary": decimal,
      "deductions": decimal,
      "net_salary": decimal,
      "status": "string"
    }
  ]
}
```

### 10.4 Get Payslip

```
GET /api/v1/payroll-records/:payroll_id

Response (200):
{
  "success": true,
  "data": {
    "payslip_html": "string",
    "pdf_url": "string"
  }
}
```

### 10.5 Request Leave

```
POST /api/v1/leave-requests
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "teacher_id": "uuid",
  "leave_type": "string",
  "start_date": "date",
  "end_date": "date",
  "reason": "string"
}

Response (201):
{
  "success": true,
  "data": {...}
}
```

---

## COMMUNICATIONS

### 11.1 Log Communication

```
POST /api/v1/communications
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "student_id": "uuid",
  "parent_id": "uuid (optional)",
  "communication_type": "string",
  "subject": "string",
  "message": "string",
  "attachments": ["url"]
}

Response (201):
{
  "success": true,
  "data": {...}
}
```

### 11.2 Bulk Communication (Email/SMS)

```
POST /api/v1/communications/bulk
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "recipient_type": "string",
  "recipients": ["uuid"],
  "communication_type": "string",
  "subject": "string",
  "message": "string",
  "template": "string (optional)"
}

Response (202):
{
  "success": true,
  "message": "Bulk communication queued",
  "job_id": "uuid"
}
```

---

## ANALYTICS & REPORTING

### 12.1 Student Analytics Dashboard

```
GET /api/v1/analytics/students?branch_id=uuid&academic_year_id=uuid

Response (200):
{
  "success": true,
  "data": {
    "total_students": 500,
    "active_students": 485,
    "enrollment_by_grade": {...},
    "attendance_summary": {...},
    "performance_summary": {...},
    "at_risk_students": [...]
  }
}
```

### 12.2 Generate Report

```
POST /api/v1/reports
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "report_type": "string",
  "branch_id": "uuid",
  "academic_year_id": "uuid",
  "filters": {},
  "format": "pdf|excel|csv"
}

Response (202):
{
  "success": true,
  "message": "Report generation started",
  "job_id": "uuid"
}
```

---

## SYSTEM ADMINISTRATION

### 13.1 List Audit Logs

```
GET /api/v1/audit-logs?branch_id=uuid&user_id=uuid&entity_type=string&start_date=date&end_date=date

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": "string",
      "action": "string",
      "entity_type": "string",
      "entity_name": "string",
      "status": "string",
      "created_at": "timestamp"
    }
  ]
}
```

---

**END OF API SPECIFICATION**
