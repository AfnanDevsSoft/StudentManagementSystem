-- Fix cascade delete for branch foreign keys
-- Run this SQL on your production database

DO $$ 
BEGIN
    -- Users
    ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_branch_id_fkey";
    ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_fkey" 
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- Students
    ALTER TABLE "students" DROP CONSTRAINT IF EXISTS "students_branch_id_fkey";
    ALTER TABLE "students" ADD CONSTRAINT "students_branch_id_fkey" 
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- Teachers
    ALTER TABLE "teachers" DROP CONSTRAINT IF EXISTS "teachers_branch_id_fkey";
    ALTER TABLE "teachers" ADD CONSTRAINT "teachers_branch_id_fkey" 
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- Academic Years
    ALTER TABLE "academic_years" DROP CONSTRAINT IF EXISTS "academic_years_branch_id_fkey";
    ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_branch_id_fkey" 
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- Courses
    ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_branch_id_fkey";
    ALTER TABLE "courses" ADD CONSTRAINT "courses_branch_id_fkey" 
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- Payroll Records
    ALTER TABLE "payroll_records" DROP CONSTRAINT IF EXISTS "payroll_records_branch_id_fkey";
    ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_branch_id_fkey" 
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- Admission Applications
    ALTER TABLE "admission_applications" DROP CONSTRAINT IF EXISTS "admission_applications_branch_id_fkey";
    ALTER TABLE "admission_applications" ADD CONSTRAINT "admission_applications_branch_id_fkey" 
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- Communication Logs
    ALTER TABLE "communication_logs" DROP CONSTRAINT IF EXISTS "communication_logs_branch_id_fkey";
    ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_branch_id_fkey" 
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- Audit Logs
    ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_branch_id_fkey";
    ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_branch_id_fkey" 
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- Reports
    ALTER TABLE "reports" DROP CONSTRAINT IF EXISTS "reports_branch_id_fkey";
    ALTER TABLE "reports" ADD CONSTRAINT "reports_branch_id_fkey" 
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- Analytics Metrics
    ALTER TABLE "analytics_metrics" DROP CONSTRAINT IF EXISTS "analytics_metrics_branch_id_fkey";
    ALTER TABLE "analytics_metrics" ADD CONSTRAINT "analytics_metrics_branch_id_fkey" 
        FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
END $$;

-- Verify the changes
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    CASE confdeltype 
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
    END AS on_delete_action
FROM pg_constraint 
WHERE contype = 'f' 
  AND confrelid::regclass::text = 'branches'
ORDER BY conrelid::regclass::text;
