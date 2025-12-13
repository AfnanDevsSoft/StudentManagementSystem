-- DropForeignKey
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_assignment_id_fkey";

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
