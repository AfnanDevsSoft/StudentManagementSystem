#!/bin/bash

# Student Management System - File Backup Script
# Backs up uploaded files with compression and retention

set -euo pipefail

# Configuration
UPLOADS_DIR="${UPLOADS_DIR:-./uploads}"
BACKUP_DIR="${BACKUP_DIR:-./backups/files}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
S3_BUCKET="${S3_BUCKET:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check dependencies
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v tar &> /dev/null; then
        log "ERROR: tar not found"
        exit 1
    fi
    
    if ! command -v gzip &> /dev/null; then
        log "ERROR: gzip not found"
        exit 1
    fi
    
    log "Dependencies check passed"
}

# Create backup directory
create_backup_dir() {
    log "Creating backup directory: ${BACKUP_DIR}"
    mkdir -p "${BACKUP_DIR}"
}

# Create file backup
backup_files() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_filename="uploads_${timestamp}.tar.gz"
    local backup_path="${BACKUP_DIR}/${backup_filename}"
    
    log "Starting file backup: ${backup_filename}"
    
    if [[ ! -d "${UPLOADS_DIR}" ]]; then
        log "WARN: Uploads directory does not exist: ${UPLOADS_DIR}"
        log "Creating empty backup"
        mkdir -p "${UPLOADS_DIR}"
    fi
    
    # Count files
    local file_count
    file_count=$(find "${UPLOADS_DIR}" -type f | wc -l)
    
    if [[ "${file_count}" -eq 0 ]]; then
        log "No files to backup, creating empty archive"
    else
        log "Backing up ${file_count} files from ${UPLOADS_DIR}"
    fi
    
    # Create tar.gz archive
    if tar -czf "${backup_path}" -C "$(dirname "${UPLOADS_DIR}")" "$(basename "${UPLOADS_DIR}")" 2>/dev/null; then
        local archive_size
        archive_size=$(du -h "${backup_path}" | cut -f1)
        
        log "Backup completed: ${backup_path} (${archive_size})"
        
        # Verify backup
        if tar -tzf "${backup_path}" >/dev/null 2>&1; then
            log "Backup verification passed"
        else
            log "ERROR: Backup verification failed"
            rm -f "${backup_path}"
            exit 1
        fi
        
        echo "${backup_path}"
    else
        log "ERROR: File backup failed"
        exit 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than ${RETENTION_DAYS} days"
    
    local deleted_count=0
    
    while IFS= read -r -d '' backup_file; do
        log "Deleting old backup: ${backup_file}"
        rm -f "${backup_file}"
        ((deleted_count++))
    done < <(find "${BACKUP_DIR}" -name "uploads_*.tar.gz" -mtime "+${RETENTION_DAYS}" -print0)
    
    log "Cleanup completed. Deleted ${deleted_count} old backups."
}

# Main backup function
main() {
    log "=========================================="
    log "File Backup Started"
    log "Source: ${UPLOADS_DIR}"
    log "Backup Directory: ${BACKUP_DIR}"
    log "Retention: ${RETENTION_DAYS} days"
    log "=========================================="
    
    local start_time=$(date +%s)
    local backup_path
    
    # Check dependencies
    check_dependencies
    
    # Create backup directory
    create_backup_dir
    
    # Perform backup
    if backup_path=$(backup_files); then
        log "Backup created successfully: ${backup_path}"
    else
        log "ERROR: Backup creation failed"
        exit 1
    fi
    
    # Clean up old backups
    cleanup_old_backups
    
    # Calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log "=========================================="
    log "File Backup Completed"
    log "Duration: ${duration} seconds"
    log "Backup: ${backup_path}"
    log "=========================================="
}

# Run main function
main "$@"
