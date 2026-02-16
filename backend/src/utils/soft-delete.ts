/**
 * Soft Delete Middleware
 * Provides soft delete functionality with restore capability
 */

import { prisma } from "../lib/db";
import { logger } from "../lib/logger";

export interface SoftDeleteOptions {
  /** Model name (e.g., 'student', 'user') */
  model: string;
  /** Record ID to soft delete */
  id: string;
  /** User ID performing the deletion (for audit) */
  deletedBy?: string;
  /** Reason for deletion */
  reason?: string;
}

export interface RestoreOptions {
  /** Model name (e.g., 'student', 'user') */
  model: string;
  /** Record ID to restore */
  id: string;
  /** User ID performing the restoration (for audit) */
  restoredBy?: string;
}

/**
 * Soft delete a record
 * Sets deleted_at timestamp instead of permanently deleting
 */
export async function softDelete({
  model,
  id,
  deletedBy,
  reason
}: SoftDeleteOptions): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    logger.info('Soft delete initiated', {
      component: 'soft-delete',
      event: 'soft_delete_start',
      model,
      id,
      deletedBy,
      reason
    });
    
    // Check if record exists and is not already soft-deleted
    const existing = await (prisma as any)[model].findUnique({
      where: { id },
    });
    
    if (!existing) {
      return {
        success: false,
        message: `${model} not found`,
      };
    }
    
    // Check if already soft-deleted
    if (existing.deleted_at) {
      logger.warn('Record already soft-deleted', {
        component: 'soft-delete',
        event: 'already_deleted',
        model,
        id
      });
      
      return {
        success: false,
        message: `${model} is already deleted`,
        data: existing,
      };
    }
    
    // Perform soft delete
    const deletedRecord = await (prisma as any)[model].update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by: deletedBy,
        deleted_reason: reason,
        updated_at: new Date(),
      },
    });
    
    logger.info('Soft delete completed', {
      component: 'soft-delete',
      event: 'soft_delete_complete',
      model,
      id,
      deletedBy
    });
    
    // Log to audit log
    await prisma.auditLog.create({
      data: {
        user_id: deletedBy || 'system',
        action: 'SOFT_DELETE',
        resource: model,
        resource_id: id,
        details: {
          reason,
          deleted_at: new Date(),
        },
      },
    });
    
    return {
      success: true,
      message: `${model} soft-deleted successfully`,
      data: deletedRecord,
    };
  } catch (error: any) {
    logger.error('Soft delete failed', {
      component: 'soft-delete',
      event: 'soft_delete_error',
      model,
      id,
      error: error.message,
    });
    
    return {
      success: false,
      message: `Failed to soft delete ${model}: ${error.message}`,
    };
  }
}

/**
 * Restore a soft-deleted record
 * Clears deleted_at timestamp
 */
export async function restore({
  model,
  id,
  restoredBy
}: RestoreOptions): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    logger.info('Restore initiated', {
      component: 'soft-delete',
      event: 'restore_start',
      model,
      id,
      restoredBy,
    });
    
    // Check if record exists and is soft-deleted
    const existing = await (prisma as any)[model].findUnique({
      where: { id },
    });
    
    if (!existing) {
      return {
        success: false,
        message: `${model} not found`,
      };
    }
    
    // Check if not soft-deleted
    if (!existing.deleted_at) {
      logger.warn('Record is not soft-deleted', {
        component: 'soft-delete',
        event: 'not_deleted',
        model,
        id,
      });
      
      return {
        success: false,
        message: `${model} is not deleted`,
        data: existing,
      };
    }
    
    // Perform restore
    const restoredRecord = await (prisma as any)[model].update({
      where: { id },
      data: {
        deleted_at: null,
        deleted_by: null,
        deleted_reason: null,
        restored_at: new Date(),
        restored_by: restoredBy,
        updated_at: new Date(),
      },
    });
    
    logger.info('Restore completed', {
      component: 'soft-delete',
      event: 'restore_complete',
      model,
      id,
      restoredBy,
    });
    
    // Log to audit log
    await prisma.auditLog.create({
      data: {
        user_id: restoredBy || 'system',
        action: 'RESTORE',
        resource: model,
        resource_id: id,
        details: {
          restored_at: new Date(),
          previous_deleted_at: existing.deleted_at,
        },
      },
    });
    
    return {
      success: true,
      message: `${model} restored successfully`,
      data: restoredRecord,
    };
  } catch (error: any) {
    logger.error('Restore failed', {
      component: 'soft-delete',
      event: 'restore_error',
      model,
      id,
      error: error.message,
    });
    
    return {
      success: false,
      message: `Failed to restore ${model}: ${error.message}`,
    };
  }
}

/**
 * Permanently delete a soft-deleted record
 * Only works if record is already soft-deleted
 */
export async function permanentDelete(
  model: string,
  id: string,
  deletedBy?: string
): Promise<{ success: boolean; message: string }> {
  try {
    logger.info('Permanent delete initiated', {
      component: 'soft-delete',
      event: 'permanent_delete_start',
      model,
      id,
      deletedBy,
    });
    
    // Check if record exists and is soft-deleted
    const existing = await (prisma as any)[model].findUnique({
      where: { id },
    });
    
    if (!existing) {
      return {
        success: false,
        message: `${model} not found`,
      };
    }
    
    if (!existing.deleted_at) {
      logger.warn('Cannot permanently delete non-soft-deleted record', {
        component: 'soft-delete',
        event: 'not_soft_deleted',
        model,
        id,
      });
      
      return {
        success: false,
        message: `${model} must be soft-deleted before permanent deletion`,
      };
    }
    
    // Log before deletion
    await prisma.auditLog.create({
      data: {
        user_id: deletedBy || 'system',
        action: 'PERMANENT_DELETE',
        resource: model,
        resource_id: id,
        details: {
          permanently_deleted_at: new Date(),
          original_deleted_at: existing.deleted_at,
          data_snapshot: existing, // Store full record before deletion
        },
      },
    });
    
    // Permanently delete
    await (prisma as any)[model].delete({
      where: { id },
    });
    
    logger.info('Permanent delete completed', {
      component: 'soft-delete',
      event: 'permanent_delete_complete',
      model,
      id,
      deletedBy,
    });
    
    return {
      success: true,
      message: `${model} permanently deleted`,
    };
  } catch (error: any) {
    logger.error('Permanent delete failed', {
      component: 'soft-delete',
      event: 'permanent_delete_error',
      model,
      id,
      error: error.message,
    });
    
    return {
      success: false,
      message: `Failed to permanently delete ${model}: ${error.message}`,
    };
  }
}

/**
 * Query builder that excludes soft-deleted records
 */
export function buildSoftDeleteFilter<T extends { deleted_at?: Date | null }>(
  filters?: Partial<T>
): Partial<T> {
  return {
    ...filters,
    deleted_at: null,
  } as Partial<T>;
}

/**
 * Get count of soft-deleted records
 */
export async function getSoftDeletedCount(model: string): Promise<number> {
  try {
    return await (prisma as any)[model].count({
      where: {
        deleted_at: {
          not: null,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to get soft-deleted count', {
      component: 'soft-delete',
      event: 'count_error',
      model,
      error,
    });
    return 0;
  }
}

/**
 * List soft-deleted records
 */
export async function listSoftDeleted(
  model: string,
  options: {
    limit?: number;
    offset?: number;
    orderBy?: any;
    include?: any;
  } = {}
): Promise<any[]> {
  const { limit = 10, offset = 0, orderBy = { deleted_at: 'desc' }, include } = options;
  
  try {
    return await (prisma as any)[model].findMany({
      where: {
        deleted_at: {
          not: null,
        },
      },
      orderBy,
      take: limit,
      skip: offset,
      include,
    });
  } catch (error) {
    logger.error('Failed to list soft-deleted records', {
      component: 'soft-delete',
      event: 'list_error',
      model,
      error,
    });
    return [];
  }
}

/**
 * Hard delete all soft-deleted records older than X days
 */
export async function purgeSoftDeleted(
  model: string,
  olderThanDays: number = 90,
  batchSize: number = 100
): Promise<{ success: boolean; message: string; count: number }> {
  try {
    logger.info('Purge soft-deleted initiated', {
      component: 'soft-delete',
      event: 'purge_start',
      model,
      olderThanDays,
      batchSize,
    });
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    let totalPurged = 0;
    let batchCount = 0;
    
    while (true) {
      // Find records to purge
      const recordsToPurge = await (prisma as any)[model].findMany({
        where: {
          deleted_at: {
            not: null,
            lt: cutoffDate,
          },
        },
        take: batchSize,
        select: { id: true },
      });
      
      if (recordsToPurge.length === 0) {
        break; // No more records to purge
      }
      
      // Delete records in batch
      const ids = recordsToPurge.map((r: any) => r.id);
      
      await (prisma as any)[model].deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      
      totalPurged += recordsToPurge.length;
      batchCount++;
      
      logger.debug('Purged batch', {
        component: 'soft-delete',
        event: 'purge_batch',
        model,
        batch: batchCount,
        purgedInBatch: recordsToPurge.length,
        totalPurged,
      });
    }
    
    logger.info('Purge completed', {
      component: 'soft-delete',
      event: 'purge_complete',
      model,
      totalPurged,
      batches: batchCount,
    });
    
    return {
      success: true,
      message: `Successfully purged ${totalPurged} ${model} records`,
      count: totalPurged,
    };
  } catch (error: any) {
    logger.error('Purge failed', {
      component: 'soft-delete',
      event: 'purge_error',
      model,
      error: error.message,
    });
    
    return {
      success: false,
      message: `Failed to purge soft-deleted ${model} records: ${error.message}`,
      count: 0,
    };
  }
}

export default {
  softDelete,
  restore,
  permanentDelete,
  buildSoftDeleteFilter,
  getSoftDeletedCount,
  listSoftDeleted,
  purgeSoftDeleted,
};
