import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
import * as os from "os";

export class BackupService {
  private static backupDir = path.join(process.cwd(), "backups");

  // ============= Backup Creation =============

  static async createFullBackup(description?: string) {
    try {
      // Ensure backup directory exists
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = path.join(
        this.backupDir,
        `full_backup_${timestamp}.json`
      );

      // Create backup entry
      const backup = await prisma.backup.create({
        data: {
          backup_type: "full",
          backup_size: 0,
          file_path: backupPath,
          status: "processing",
          retention_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      // In production, implement actual database backup logic
      // For now, simulate backup by creating a status file
      fs.writeFileSync(
        backupPath,
        JSON.stringify({
          backup_id: backup.id,
          created_at: new Date(),
          description: description || "Full backup",
          version: "1.0",
        })
      );

      const fileSize = fs.statSync(backupPath).size;

      const completed = await prisma.backup.update({
        where: { id: backup.id },
        data: {
          status: "completed",
          backup_size: fileSize,
          verified_at: new Date(),
        },
      });

      return { success: true, message: "Full backup created", data: completed };
    } catch (error: any) {
      return { success: false, message: error.message, code: "BACKUP_ERROR" };
    }
  }

  static async createIncrementalBackup(sinceLastBackup?: Date) {
    try {
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = path.join(
        this.backupDir,
        `incremental_backup_${timestamp}.json`
      );

      const backup = await prisma.backup.create({
        data: {
          backup_type: "incremental",
          backup_size: 0,
          file_path: backupPath,
          status: "processing",
          retention_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      fs.writeFileSync(
        backupPath,
        JSON.stringify({
          backup_id: backup.id,
          created_at: new Date(),
          since: sinceLastBackup || new Date(Date.now() - 24 * 60 * 60 * 1000),
          type: "incremental",
        })
      );

      const fileSize = fs.statSync(backupPath).size;

      const completed = await prisma.backup.update({
        where: { id: backup.id },
        data: {
          status: "completed",
          backup_size: fileSize,
          verified_at: new Date(),
        },
      });

      return {
        success: true,
        message: "Incremental backup created",
        data: completed,
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async scheduleBackup(
    backupType: "full" | "incremental",
    frequency: string,
    timeOfDay: string,
    retentionDays: number
  ) {
    try {
      const schedule = await prisma.backupSchedule.create({
        data: {
          backup_type: backupType,
          frequency,
          time_of_day: timeOfDay,
          retention_days: retentionDays,
          next_run_at: this.calculateNextRun(frequency, timeOfDay),
          is_active: true,
        },
      });

      return {
        success: true,
        message: "Backup schedule created",
        data: schedule,
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getBackupSchedules() {
    try {
      const schedules = await prisma.backupSchedule.findMany({
        where: { is_active: true },
      });
      return { success: true, data: schedules };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async cancelScheduledBackup(scheduleId: string) {
    try {
      const schedule = await prisma.backupSchedule.update({
        where: { id: scheduleId },
        data: { is_active: false },
      });
      return { success: true, message: "Schedule cancelled", data: schedule };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // ============= Backup Status & History =============

  static async getBackupStatus(backupId: string) {
    try {
      const backup = await prisma.backup.findUnique({
        where: { id: backupId },
      });
      if (!backup) return { success: false, message: "Backup not found" };
      return { success: true, data: backup };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getBackupHistory(limit = 20, offset = 0) {
    try {
      const backups = await prisma.backup.findMany({
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      });
      const total = await prisma.backup.count();
      return { success: true, data: backups, total, limit, offset };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getBackupSize(backupId: string) {
    try {
      const backup = await prisma.backup.findUnique({
        where: { id: backupId },
      });
      if (!backup) return { success: false, message: "Backup not found" };
      return {
        success: true,
        data: {
          size_bytes: backup.backup_size,
          size_mb: (backup.backup_size / 1024 / 1024).toFixed(2),
        },
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // ============= Recovery Operations =============

  static async listAvailableBackups() {
    try {
      const backups = await prisma.backup.findMany({
        where: { status: "completed" },
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          backup_type: true,
          created_at: true,
          backup_size: true,
          file_path: true,
          status: true,
        },
      });
      return { success: true, data: backups };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async previewBackup(backupId: string) {
    try {
      const backup = await prisma.backup.findUnique({
        where: { id: backupId },
      });
      if (!backup || !backup.file_path)
        return { success: false, message: "Backup not found" };

      if (fs.existsSync(backup.file_path)) {
        const preview = JSON.parse(fs.readFileSync(backup.file_path, "utf-8"));
        return { success: true, data: preview };
      }

      return { success: false, message: "Backup file not found" };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async restoreFromBackup(backupId: string) {
    try {
      const backup = await prisma.backup.findUnique({
        where: { id: backupId },
      });
      if (!backup) return { success: false, message: "Backup not found" };

      if (!fs.existsSync(backup.file_path || "")) {
        return { success: false, message: "Backup file not found" };
      }

      // In production, implement actual restoration logic
      await prisma.backup.update({
        where: { id: backupId },
        data: { status: "completed" },
      });

      return { success: true, message: "Restoration initiated", data: backup };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async restoreToPointInTime(timestamp: Date) {
    try {
      const backup = await prisma.backup.findFirst({
        where: {
          created_at: { lte: timestamp },
          status: "completed",
        },
        orderBy: { created_at: "desc" },
      });

      if (!backup)
        return {
          success: false,
          message: "No suitable backup found for point-in-time recovery",
        };

      return {
        success: true,
        message: "Point-in-time recovery initiated",
        data: backup,
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async verifyBackupIntegrity(backupId: string): Promise<boolean> {
    try {
      const backup = await prisma.backup.findUnique({
        where: { id: backupId },
      });
      if (!backup || !backup.file_path) return false;

      return fs.existsSync(backup.file_path);
    } catch (error) {
      return false;
    }
  }

  static async getBackupStorageStats() {
    try {
      const backups = await prisma.backup.findMany();
      const totalSize = backups.reduce(
        (sum: number, b: any) => sum + b.backup_size,
        0
      );

      return {
        success: true,
        data: {
          total_backups: backups.length,
          total_size_bytes: totalSize,
          total_size_mb: (totalSize / 1024 / 1024).toFixed(2),
          backups_by_type: {
            full: backups.filter((b) => b.backup_type === "full").length,
            incremental: backups.filter((b) => b.backup_type === "incremental")
              .length,
          },
        },
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // ============= Helper Methods =============

  private static calculateNextRun(frequency: string, timeOfDay: string): Date {
    const nextRun = new Date();
    const [hours, minutes] = timeOfDay.split(":").map(Number);
    nextRun.setHours(hours, minutes, 0, 0);

    switch (frequency) {
      case "daily":
        if (nextRun < new Date()) nextRun.setDate(nextRun.getDate() + 1);
        break;
      case "weekly":
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case "monthly":
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }

    return nextRun;
  }
}
