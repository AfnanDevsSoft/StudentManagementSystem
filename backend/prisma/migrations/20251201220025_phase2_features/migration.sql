-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "report_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "generated_by" UUID NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "report_format" TEXT NOT NULL DEFAULT 'pdf',
    "file_url" TEXT,
    "file_size" INTEGER,
    "filters" JSONB,
    "date_range_start" TIMESTAMP(3),
    "date_range_end" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'completed',
    "error_message" TEXT,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "last_downloaded" TIMESTAMP(3),
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_metrics" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "metric_type" TEXT NOT NULL,
    "metric_name" TEXT NOT NULL,
    "metric_value" DOUBLE PRECISION NOT NULL,
    "comparison_value" DOUBLE PRECISION,
    "trend" TEXT,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "filters" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_contents" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "content_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content_url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_size" INTEGER,
    "file_type" TEXT,
    "duration" INTEGER,
    "sequence_order" INTEGER NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "last_accessed" TIMESTAMP(3),
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direct_messages" (
    "id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "subject" TEXT,
    "message_body" TEXT NOT NULL,
    "attachment_url" TEXT,
    "read_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_announcements" (
    "id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "announcement_type" TEXT NOT NULL DEFAULT 'general',
    "attachment_url" TEXT,
    "scheduled_for" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_branch_id_idx" ON "reports"("branch_id");

-- CreateIndex
CREATE INDEX "reports_report_type_idx" ON "reports"("report_type");

-- CreateIndex
CREATE INDEX "reports_generated_at_idx" ON "reports"("generated_at");

-- CreateIndex
CREATE INDEX "analytics_metrics_branch_id_idx" ON "analytics_metrics"("branch_id");

-- CreateIndex
CREATE INDEX "analytics_metrics_metric_type_idx" ON "analytics_metrics"("metric_type");

-- CreateIndex
CREATE INDEX "analytics_metrics_period_start_idx" ON "analytics_metrics"("period_start");

-- CreateIndex
CREATE INDEX "course_contents_course_id_idx" ON "course_contents"("course_id");

-- CreateIndex
CREATE INDEX "course_contents_content_type_idx" ON "course_contents"("content_type");

-- CreateIndex
CREATE INDEX "course_contents_uploaded_at_idx" ON "course_contents"("uploaded_at");

-- CreateIndex
CREATE INDEX "direct_messages_sender_id_idx" ON "direct_messages"("sender_id");

-- CreateIndex
CREATE INDEX "direct_messages_recipient_id_idx" ON "direct_messages"("recipient_id");

-- CreateIndex
CREATE INDEX "direct_messages_created_at_idx" ON "direct_messages"("created_at");

-- CreateIndex
CREATE INDEX "class_announcements_course_id_idx" ON "class_announcements"("course_id");

-- CreateIndex
CREATE INDEX "class_announcements_created_by_idx" ON "class_announcements"("created_by");

-- CreateIndex
CREATE INDEX "class_announcements_created_at_idx" ON "class_announcements"("created_at");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_metrics" ADD CONSTRAINT "analytics_metrics_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_contents" ADD CONSTRAINT "course_contents_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_announcements" ADD CONSTRAINT "class_announcements_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
