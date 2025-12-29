-- CreateTable
CREATE TABLE "working_days_config" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "academic_year_id" UUID,
    "grade_level_id" UUID,
    "total_days" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "working_days_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_summaries" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "academic_year_id" UUID,
    "total_working_days" INTEGER NOT NULL,
    "days_present" INTEGER NOT NULL DEFAULT 0,
    "days_absent" INTEGER NOT NULL DEFAULT 0,
    "days_late" INTEGER NOT NULL DEFAULT 0,
    "days_excused" INTEGER NOT NULL DEFAULT 0,
    "attendance_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "meets_minimum" BOOLEAN NOT NULL DEFAULT false,
    "last_calculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "working_days_config_branch_id_idx" ON "working_days_config"("branch_id");

-- CreateIndex
CREATE INDEX "working_days_config_academic_year_id_idx" ON "working_days_config"("academic_year_id");

-- CreateIndex
CREATE INDEX "working_days_config_is_active_idx" ON "working_days_config"("is_active");

-- CreateIndex
CREATE INDEX "attendance_summaries_entity_type_idx" ON "attendance_summaries"("entity_type");

-- CreateIndex
CREATE INDEX "attendance_summaries_entity_id_idx" ON "attendance_summaries"("entity_id");

-- CreateIndex
CREATE INDEX "attendance_summaries_branch_id_idx" ON "attendance_summaries"("branch_id");

-- CreateIndex
CREATE INDEX "attendance_summaries_academic_year_id_idx" ON "attendance_summaries"("academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_summaries_entity_type_entity_id_academic_year_id_key" ON "attendance_summaries"("entity_type", "entity_id", "academic_year_id");

-- AddForeignKey
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_fee_id_fkey" FOREIGN KEY ("fee_id") REFERENCES "fees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_days_config" ADD CONSTRAINT "working_days_config_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_days_config" ADD CONSTRAINT "working_days_config_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_days_config" ADD CONSTRAINT "working_days_config_grade_level_id_fkey" FOREIGN KEY ("grade_level_id") REFERENCES "grade_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_summaries" ADD CONSTRAINT "attendance_summaries_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_summaries" ADD CONSTRAINT "attendance_summaries_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;
