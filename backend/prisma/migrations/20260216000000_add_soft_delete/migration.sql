-- Phase 3.6: Add Soft Delete Support
-- Adds deleted_at timestamp columns to critical tables for soft delete functionality

-- Add soft delete columns to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS deleted_reason TEXT,
ADD COLUMN IF NOT EXISTS restored_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS restored_by VARCHAR(255);

-- Add soft delete columns to Student table
ALTER TABLE "Student" 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS deleted_reason TEXT,
ADD COLUMN IF NOT EXISTS restored_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS restored_by VARCHAR(255);

-- Add soft delete columns to Teacher table
ALTER TABLE "Teacher" 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS deleted_reason TEXT,
ADD COLUMN IF NOT EXISTS restored_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS restored_by VARCHAR(255);

-- Add soft delete columns to Course table
ALTER TABLE "Course" 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS deleted_reason TEXT,
ADD COLUMN IF NOT EXISTS restored_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS restored_by VARCHAR(255);

-- Add soft delete columns to Enrollment table
ALTER TABLE "Enrollment" 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS deleted_reason TEXT,
ADD COLUMN IF NOT EXISTS restored_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS restored_by VARCHAR(255);

-- Add soft delete columns to Payment table
ALTER TABLE "Payment" 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS deleted_reason TEXT,
ADD COLUMN IF NOT EXISTS restored_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS restored_by VARCHAR(255);

-- Add soft delete columns to Attendance table
ALTER TABLE "Attendance" 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS deleted_reason TEXT,
ADD COLUMN IF NOT EXISTS restored_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS restored_by VARCHAR(255);

-- Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_user_deleted_at ON "User"(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_student_deleted_at ON "Student"(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teacher_deleted_at ON "Teacher"(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_course_deleted_at ON "Course"(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_enrollment_deleted_at ON "Enrollment"(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_deleted_at ON "Payment"(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attendance_deleted_at ON "Attendance"(deleted_at) WHERE deleted_at IS NOT NULL;

-- Verify soft delete columns added
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('User', 'Student', 'Teacher', 'Course', 'Enrollment', 'Payment', 'Attendance')
AND column_name IN ('deleted_at', 'deleted_by', 'restored_at')
ORDER BY table_name, column_name;
