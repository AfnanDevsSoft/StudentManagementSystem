-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "permission_name" TEXT NOT NULL,
    "description" TEXT,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rbac_roles" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "role_name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rbac_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rbac_role_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications_new" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_new_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "sms_notifications" BOOLEAN NOT NULL DEFAULT false,
    "in_app_notifications" BOOLEAN NOT NULL DEFAULT true,
    "muted_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "device_token" TEXT NOT NULL,
    "device_type" TEXT NOT NULL,
    "device_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" UUID NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_health_checks" (
    "id" UUID NOT NULL,
    "check_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" JSONB,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_health_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_exports" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "export_type" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "filters" JSONB,
    "file_url" TEXT,
    "file_size" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_schedules" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "export_type" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "filters" JSONB,
    "recipients" TEXT[],
    "next_run_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "export_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backups" (
    "id" UUID NOT NULL,
    "backup_type" TEXT NOT NULL,
    "backup_size" INTEGER NOT NULL,
    "file_path" TEXT,
    "cloud_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "retention_until" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_schedules" (
    "id" UUID NOT NULL,
    "backup_type" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "time_of_day" TEXT NOT NULL,
    "retention_days" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "next_run_at" TIMESTAMP(3) NOT NULL,
    "last_run_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backup_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToRBACRole" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_permission_name_key" ON "permissions"("permission_name");

-- CreateIndex
CREATE INDEX "permissions_resource_idx" ON "permissions"("resource");

-- CreateIndex
CREATE INDEX "rbac_roles_branch_id_idx" ON "rbac_roles"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "rbac_roles_branch_id_role_name_key" ON "rbac_roles"("branch_id", "role_name");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_roles_branch_id_idx" ON "user_roles"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_rbac_role_id_branch_id_key" ON "user_roles"("user_id", "rbac_role_id", "branch_id");

-- CreateIndex
CREATE INDEX "notifications_new_user_id_idx" ON "notifications_new"("user_id");

-- CreateIndex
CREATE INDEX "notifications_new_created_at_idx" ON "notifications_new"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "device_tokens_user_id_idx" ON "device_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_user_id_device_token_key" ON "device_tokens"("user_id", "device_token");

-- CreateIndex
CREATE INDEX "logs_level_idx" ON "logs"("level");

-- CreateIndex
CREATE INDEX "logs_timestamp_idx" ON "logs"("timestamp");

-- CreateIndex
CREATE INDEX "system_health_checks_check_type_idx" ON "system_health_checks"("check_type");

-- CreateIndex
CREATE INDEX "system_health_checks_checked_at_idx" ON "system_health_checks"("checked_at");

-- CreateIndex
CREATE INDEX "file_exports_user_id_idx" ON "file_exports"("user_id");

-- CreateIndex
CREATE INDEX "file_exports_created_at_idx" ON "file_exports"("created_at");

-- CreateIndex
CREATE INDEX "export_schedules_user_id_idx" ON "export_schedules"("user_id");

-- CreateIndex
CREATE INDEX "export_schedules_next_run_at_idx" ON "export_schedules"("next_run_at");

-- CreateIndex
CREATE INDEX "backups_created_at_idx" ON "backups"("created_at");

-- CreateIndex
CREATE INDEX "backups_backup_type_idx" ON "backups"("backup_type");

-- CreateIndex
CREATE INDEX "backup_schedules_next_run_at_idx" ON "backup_schedules"("next_run_at");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRBACRole_AB_unique" ON "_PermissionToRBACRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRBACRole_B_index" ON "_PermissionToRBACRole"("B");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_rbac_role_id_fkey" FOREIGN KEY ("rbac_role_id") REFERENCES "rbac_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRBACRole" ADD CONSTRAINT "_PermissionToRBACRole_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRBACRole" ADD CONSTRAINT "_PermissionToRBACRole_B_fkey" FOREIGN KEY ("B") REFERENCES "rbac_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
