-- CreateTable
CREATE TABLE "time_slots" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "slot_name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "slot_type" TEXT NOT NULL DEFAULT 'class',
    "sort_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "room_number" TEXT NOT NULL,
    "room_name" TEXT,
    "building" TEXT,
    "floor" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 40,
    "room_type" TEXT NOT NULL DEFAULT 'classroom',
    "facilities" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_entries" (
    "id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "time_slot_id" UUID NOT NULL,
    "room_id" UUID,
    "day_of_week" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timetable_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_records" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "blood_group" TEXT,
    "height" DECIMAL(5,2),
    "weight" DECIMAL(5,2),
    "allergies" TEXT,
    "chronic_conditions" TEXT,
    "medications" TEXT,
    "emergency_contact" TEXT,
    "emergency_phone" TEXT,
    "doctor_name" TEXT,
    "doctor_phone" TEXT,
    "insurance_provider" TEXT,
    "insurance_number" TEXT,
    "notes" TEXT,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_checkups" (
    "id" UUID NOT NULL,
    "health_record_id" UUID NOT NULL,
    "checkup_date" TIMESTAMP(3) NOT NULL,
    "height" DECIMAL(5,2),
    "weight" DECIMAL(5,2),
    "blood_pressure" TEXT,
    "temperature" DECIMAL(4,2),
    "pulse_rate" INTEGER,
    "vision_left" TEXT,
    "vision_right" TEXT,
    "dental_checkup" BOOLEAN NOT NULL DEFAULT false,
    "doctor_name" TEXT,
    "findings" TEXT,
    "recommendations" TEXT,
    "next_checkup_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_checkups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccinations" (
    "id" UUID NOT NULL,
    "health_record_id" UUID NOT NULL,
    "vaccine_name" TEXT NOT NULL,
    "vaccine_type" TEXT,
    "dose_number" INTEGER DEFAULT 1,
    "administered_date" TIMESTAMP(3) NOT NULL,
    "administered_by" TEXT,
    "batch_number" TEXT,
    "manufacturer" TEXT,
    "next_dose_date" TIMESTAMP(3),
    "side_effects" TEXT,
    "certificate_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vaccinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_incidents" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "incident_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "incident_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "treatment_given" TEXT,
    "attended_by" TEXT,
    "parent_notified" BOOLEAN NOT NULL DEFAULT false,
    "hospital_visit" BOOLEAN NOT NULL DEFAULT false,
    "hospital_name" TEXT,
    "follow_up_required" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_notes" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_type" TEXT NOT NULL,
    "target_audience" TEXT NOT NULL DEFAULT 'all',
    "grade_level_id" UUID,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT,
    "end_time" TEXT,
    "location" TEXT,
    "organizer" TEXT,
    "is_holiday" BOOLEAN NOT NULL DEFAULT false,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_rule" TEXT,
    "attachments" JSONB,
    "created_by" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "books" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "isbn" TEXT,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT,
    "publication_year" INTEGER,
    "category" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "total_copies" INTEGER NOT NULL DEFAULT 1,
    "available_copies" INTEGER NOT NULL DEFAULT 1,
    "shelf_location" TEXT,
    "description" TEXT,
    "cover_image_url" TEXT,
    "price" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_loans" (
    "id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "student_id" UUID,
    "teacher_id" UUID,
    "borrower_type" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "return_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "renewed_count" INTEGER NOT NULL DEFAULT 0,
    "issued_by" UUID NOT NULL,
    "returned_to" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_fines" (
    "id" UUID NOT NULL,
    "loan_id" UUID NOT NULL,
    "fine_amount" DECIMAL(10,2) NOT NULL,
    "days_overdue" INTEGER NOT NULL,
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "payment_status" TEXT NOT NULL DEFAULT 'unpaid',
    "payment_date" TIMESTAMP(3),
    "payment_method" TEXT,
    "waived" BOOLEAN NOT NULL DEFAULT false,
    "waived_by" UUID,
    "waived_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_fines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "time_slots_branch_id_slot_name_key" ON "time_slots"("branch_id", "slot_name");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_branch_id_room_number_key" ON "rooms"("branch_id", "room_number");

-- CreateIndex
CREATE INDEX "timetable_entries_course_id_idx" ON "timetable_entries"("course_id");

-- CreateIndex
CREATE INDEX "timetable_entries_day_of_week_idx" ON "timetable_entries"("day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_entries_course_id_time_slot_id_day_of_week_key" ON "timetable_entries"("course_id", "time_slot_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "health_records_student_id_key" ON "health_records"("student_id");

-- CreateIndex
CREATE INDEX "medical_checkups_health_record_id_idx" ON "medical_checkups"("health_record_id");

-- CreateIndex
CREATE INDEX "medical_checkups_checkup_date_idx" ON "medical_checkups"("checkup_date");

-- CreateIndex
CREATE INDEX "vaccinations_health_record_id_idx" ON "vaccinations"("health_record_id");

-- CreateIndex
CREATE INDEX "vaccinations_administered_date_idx" ON "vaccinations"("administered_date");

-- CreateIndex
CREATE INDEX "medical_incidents_student_id_idx" ON "medical_incidents"("student_id");

-- CreateIndex
CREATE INDEX "medical_incidents_incident_date_idx" ON "medical_incidents"("incident_date");

-- CreateIndex
CREATE INDEX "events_branch_id_idx" ON "events"("branch_id");

-- CreateIndex
CREATE INDEX "events_start_date_idx" ON "events"("start_date");

-- CreateIndex
CREATE INDEX "events_event_type_idx" ON "events"("event_type");

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn");

-- CreateIndex
CREATE INDEX "books_branch_id_idx" ON "books"("branch_id");

-- CreateIndex
CREATE INDEX "books_isbn_idx" ON "books"("isbn");

-- CreateIndex
CREATE INDEX "books_title_idx" ON "books"("title");

-- CreateIndex
CREATE INDEX "book_loans_book_id_idx" ON "book_loans"("book_id");

-- CreateIndex
CREATE INDEX "book_loans_student_id_idx" ON "book_loans"("student_id");

-- CreateIndex
CREATE INDEX "book_loans_teacher_id_idx" ON "book_loans"("teacher_id");

-- CreateIndex
CREATE INDEX "book_loans_status_idx" ON "book_loans"("status");

-- CreateIndex
CREATE INDEX "book_fines_loan_id_idx" ON "book_fines"("loan_id");

-- CreateIndex
CREATE INDEX "book_fines_payment_status_idx" ON "book_fines"("payment_status");

-- AddForeignKey
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_time_slot_id_fkey" FOREIGN KEY ("time_slot_id") REFERENCES "time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_checkups" ADD CONSTRAINT "medical_checkups_health_record_id_fkey" FOREIGN KEY ("health_record_id") REFERENCES "health_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccinations" ADD CONSTRAINT "vaccinations_health_record_id_fkey" FOREIGN KEY ("health_record_id") REFERENCES "health_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_incidents" ADD CONSTRAINT "medical_incidents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_loans" ADD CONSTRAINT "book_loans_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_loans" ADD CONSTRAINT "book_loans_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_loans" ADD CONSTRAINT "book_loans_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_fines" ADD CONSTRAINT "book_fines_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "book_loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
