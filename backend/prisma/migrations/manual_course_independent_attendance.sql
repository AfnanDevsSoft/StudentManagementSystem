-- Safe migration for course-independent attendance
-- This script modifies the attendance table without losing data

-- Step 1: Add branch_id column (nullable first to allow existing rows)
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS branch_id UUID;

-- Step 2: Populate branch_id from student's branch for existing records
UPDATE attendance a 
SET branch_id = s.branch_id 
FROM students s 
WHERE a.student_id = s.id 
AND a.branch_id IS NULL;

-- Step 3: Make branch_id NOT NULL after populating
ALTER TABLE attendance 
ALTER COLUMN branch_id SET NOT NULL;

-- Step 4: Make course_id nullable
ALTER TABLE attendance 
ALTER COLUMN course_id DROP NOT NULL;

-- Step 5: Drop the old unique constraint (student_id, course_id, date)
ALTER TABLE attendance 
DROP CONSTRAINT IF EXISTS attendance_student_id_course_id_date_key;

-- Step 6: Add new unique constraint (student_id, date) - one attendance per day
ALTER TABLE attendance 
ADD CONSTRAINT attendance_student_id_date_key UNIQUE (student_id, date);

-- Step 7: Add index on branch_id for faster filtering
CREATE INDEX IF NOT EXISTS attendance_branch_id_idx ON attendance (branch_id);

-- Done! View the table structure
\d attendance
