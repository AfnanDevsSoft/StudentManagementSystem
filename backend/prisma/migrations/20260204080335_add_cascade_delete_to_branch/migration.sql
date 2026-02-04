-- DropForeignKey (IF EXISTS to handle partial re-runs)
ALTER TABLE "academic_years" DROP CONSTRAINT IF EXISTS "academic_years_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "admission_applications" DROP CONSTRAINT IF EXISTS "admission_applications_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "analytics_metrics" DROP CONSTRAINT IF EXISTS "analytics_metrics_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "communication_logs" DROP CONSTRAINT IF EXISTS "communication_logs_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "payroll_records" DROP CONSTRAINT IF EXISTS "payroll_records_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT IF EXISTS "reports_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT IF EXISTS "students_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "teachers" DROP CONSTRAINT IF EXISTS "teachers_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_branch_id_fkey";

-- AlterTable (add columns only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admission_applications' AND column_name = 'created_by') THEN
        ALTER TABLE "admission_applications" ADD COLUMN "created_by" UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admission_applications' AND column_name = 'rejection_reason') THEN
        ALTER TABLE "admission_applications" ADD COLUMN "rejection_reason" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admission_applications' AND column_name = 'student_id') THEN
        ALTER TABLE "admission_applications" ADD COLUMN "student_id" UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admission_applications' AND column_name = 'student_username') THEN
        ALTER TABLE "admission_applications" ADD COLUMN "student_username" TEXT;
    END IF;
END $$;

-- CreateTable (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS "admission_documents" (
    "id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_data" BYTEA NOT NULL,
    "document_type" TEXT NOT NULL DEFAULT 'attachment',
    "application_id" UUID NOT NULL,
    "uploaded_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey (drop first if exists to ensure correct definition, then re-add)
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_branch_id_fkey";
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "students" DROP CONSTRAINT IF EXISTS "students_branch_id_fkey";
ALTER TABLE "students" ADD CONSTRAINT "students_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teachers" DROP CONSTRAINT IF EXISTS "teachers_branch_id_fkey";
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "academic_years" DROP CONSTRAINT IF EXISTS "academic_years_branch_id_fkey";
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_branch_id_fkey";
ALTER TABLE "courses" ADD CONSTRAINT "courses_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payroll_records" DROP CONSTRAINT IF EXISTS "payroll_records_branch_id_fkey";
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "admission_applications" DROP CONSTRAINT IF EXISTS "admission_applications_branch_id_fkey";
ALTER TABLE "admission_applications" ADD CONSTRAINT "admission_applications_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "admission_documents" DROP CONSTRAINT IF EXISTS "admission_documents_application_id_fkey";
ALTER TABLE "admission_documents" ADD CONSTRAINT "admission_documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "admission_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "communication_logs" DROP CONSTRAINT IF EXISTS "communication_logs_branch_id_fkey";
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_branch_id_fkey";
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reports" DROP CONSTRAINT IF EXISTS "reports_branch_id_fkey";
ALTER TABLE "reports" ADD CONSTRAINT "reports_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "analytics_metrics" DROP CONSTRAINT IF EXISTS "analytics_metrics_branch_id_fkey";
ALTER TABLE "analytics_metrics" ADD CONSTRAINT "analytics_metrics_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
