#!/bin/bash

# Student Management System - Database Backup Script
# Creates compressed backups with timestamp retention

set -euo pipefail

# Configuration
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-smsnow}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"
BACKUP_DIR="${BACKUP_DIR:-./backups/database}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check dependencies
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v pg_dump &> /dev/null; then
        log "ERROR: pg_dump not found"
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

# Perform database backup
backup_database() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_filename="${POSTGRES_DB}_${timestamp}.sql.gz"
    local backup_path="${BACKUP_DIR}/${backup_filename}"
    
    log "Starting database backup: ${backup_filename}"
    
    export PGPASSWORD="${POSTGRES_PASSWORD}"
    
    if pg_dump \
        -h "${POSTGRES_HOST}" \
        -p "${POSTGRES_PORT}" \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        -Fc \
        --verbose \
        --no-password \
        | gzip > "${backup_path}"; then
        
        local file_size=$(du -h "${backup_path}" | cut -f1)
        log "Backup completed: ${backup_path} (${file_size})"
        
        # Verify backup
        if gunzip -t "${backup_path}" 2>/dev/null; then
            log "Backup verification passed"
        else
            log "ERROR: Backup verification failed"
            rm -f "${backup_path}"
            exit 1
        fi
        
        echo "${backup_path}"
    else
        log "ERROR: Database backup failed"
        exit 1
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log "Cleaning up backups older than ${RETENTION_DAYS} days"
    
    local deleted_count=0
    
    while IFS= read -r -d '' backup_file; do
        log "Deleting old backup: ${backup_file}"
        rm -f "${backup_file}"
        ((deleted_count++))
    done < <(find "${BACKUP_DIR}" -name "${POSTGRES_DB}_*.sql.gz" -mtime "+${RETENTION_DAYS}" -print0)
    
    log "Cleanup completed. Deleted ${deleted_count} old backups."
}

# Send notification
send_notification() {
    local backup_path="$1"
    local status="$2"
    
    local webhook_url="${WEBHOOK_URL:-}"
    
    if [[ -n "${webhook_url}" ]]; then
        local payload
        if [[ "${status}" == "success" ]]; then
            payload="{\"text\":\"✅ Database backup completed: ${backup_path}\"}"
        else
            payload="{\"text\":\"❌ Database backup failed\"}"
        fi
        
        curl -X POST "${webhook_url}" \
            -H 'Content-Type: application/json' \
            -d "${payload}" \
            --silent || log "WARN: Failed to send notification"
    fi
}

# Main backup function
main() {
    log "=========================================="
    log "Database Backup Started"
    log "Database: ${POSTGRES_DB}@${POSTGRES_HOST}:${POSTGRES_PORT}"
    log "Backup Directory: ${BACKUP_DIR}"
    log "Retention: ${RETENTION_DAYS} days"
    log "=========================================="
    
    local start_time=$(date +%s)
    local backup_path
    local status="success"
    
    # Check dependencies
    check_dependencies
    
    # Create backup directory
    create_backup_dir
    
    # Perform backup
    if backup_path=$(backup_database); then
        log "Backup created successfully: ${backup_path}"
    else
        log "ERROR: Backup creation failed"
        status="failure"
        send_notification "" "${status}"
        exit 1
    fi
    
    # Clean up old backups
    cleanup_old_backups
    
    # Calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log "=========================================="
    log "Database Backup Completed (${status})"
    log "Duration: ${duration} seconds"
    log "Backup: ${backup_path}"
    log "=========================================="
    
    # Send notification
    send_notification "${backup_path}" "${status}"
}

# Run main function
main "$@"
