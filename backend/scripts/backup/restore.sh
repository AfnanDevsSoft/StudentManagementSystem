#!/bin/bash

# Student Management System - Restore Script
# Restores database and files from backups

set -euo pipefail

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Show usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Restore Student Management System from backup

OPTIONS:
    -t, --type TYPE          Restore type: database|files|all (default: all)
    -f, --file PATH          Specific backup file to restore
    -d, --backup-dir DIR     Backup directory to search in (default: ./backups)
    -y, --yes               Skip confirmation prompts
    -h, --help              Show this help message

EXAMPLES:
    $0 --type database --file ./backups/database/smsnow_20260216_093000.sql.gz
    $0 --type files --backup-dir ./backups
    $0 --type all --backup-dir ./backups --yes

EOF
}

# Parse arguments
RESTORE_TYPE="all"
BACKUP_FILE=""
BACKUP_DIR="./backups"
SKIP_CONFIRM=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            RESTORE_TYPE="$2"
            shift 2
            ;;
        -f|--file)
            BACKUP_FILE="$2"
            shift 2
            ;;
        -d|--backup-dir)
            BACKUP_DIR="$2"
            shift 2
            ;;
        -y|--yes)
            SKIP_CONFIRM=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log "ERROR: Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate restore type
case "${RESTORE_TYPE}" in
    database|files|all)
        ;;
    *)
        log "ERROR: Invalid restore type: ${RESTORE_TYPE}"
        usage
        exit 1
        ;;
esac

# Confirm restore
confirm_restore() {
    if [[ "${SKIP_CONFIRM}" == "true" ]]; then
        return 0
    fi
    
    log "WARNING: This will restore data from backup!"
    log "Restore type: ${RESTORE_TYPE}"
    [[ -n "${BACKUP_FILE}" ]] && log "Backup file: ${BACKUP_FILE}"
    log "Backup directory: ${BACKUP_DIR}"
    
    read -r -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [[ "${confirm}" != "yes" ]]; then
        log "Restore cancelled"
        exit 0
    fi
}

# Restore database
restore_database() {
    local backup_file="$1"
    
    log "Restoring database from: ${backup_file}"
    
    if [[ ! -f "${backup_file}" ]]; then
        log "ERROR: Backup file not found: ${backup_file}"
        exit 1
    fi
    
    # Verify backup file
    if gunzip -t "${backup_file}" 2>/dev/null; then
        log "Backup file verification passed"
    else
        log "ERROR: Backup file is corrupted: ${backup_file}"
        exit 1
    fi
    
    # Show backup info
    log "Backup information:"
    log "  File: ${backup_file}"
    log "  Size: $(du -h "${backup_file}" | cut -f1)"
    log "  Created: $(stat -c %y "${backup_file}" 2>/dev/null || stat -f %Sm "${backup_file}")"
    
    # Confirm database restore
    read -r -p "This will replace the current database. Continue? (yes/no): " confirm
    if [[ "${confirm}" != "yes" ]]; then
        log "Database restore cancelled"
        return 1
    fi
    
    # Stop application services if running
    log "Stopping application services..."
    # Add commands to stop your application
    
    # Drop and recreate database (optional - comment out if just restoring data)
    # log "Recreating database..."
    # psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -c "DROP DATABASE IF EXISTS ${POSTGRES_DB};"
    # psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -c "CREATE DATABASE ${POSTGRES_DB};"
    
    # Restore database
    log "Restoring database..."
    export PGPASSWORD="${POSTGRES_PASSWORD}"
    
    if pg_restore \
        -h "${POSTGRES_HOST}" \
        -p "${POSTGRES_PORT}" \
        -U "${POSTGRES_USER}" \
        -d "${POSTGRES_DB}" \
        --verbose \
        --no-password \
        "${backup_file}"; then
        
        log "Database restore completed successfully"
        
        # Run migrations if needed
        # log "Running database migrations..."
        # npm run db:migrate
        
        # Start application services
        log "Starting application services..."
        # Add commands to start your application
        
        return 0
    else
        log "ERROR: Database restore failed"
        return 1
    fi
}

# Restore files
restore_files() {
    local backup_file="$1"
    
    log "Restoring files from: ${backup_file}"
    
    if [[ ! -f "${backup_file}" ]]; then
        log "ERROR: Backup file not found: ${backup_file}"
        exit 1
    fi
    
    # Verify backup file
    if tar -tzf "${backup_file}" >/dev/null 2>&1; then
        log "Backup file verification passed"
    else
        log "ERROR: Backup file is corrupted: ${backup_file}"
        exit 1
    fi
    
    # Show backup info
    log "Backup information:"
    log "  File: ${backup_file}"
    log "  Size: $(du -h "${backup_file}" | cut -f1)"
    log "  Contents:"
    tar -tzf "${backup_file}" | head -10 | sed 's/^/    /'
    
    # Confirm file restore
    read -r -p "This will overwrite existing files. Continue? (yes/no): " confirm
    if [[ "${confirm}" != "yes" ]]; then
        log "File restore cancelled"
        return 1
    fi
    
    # Create backup of current files
    log "Creating backup of current files..."
    local current_backup="./backups/files/current_before_restore_$(date '+%Y%m%d_%H%M%S')"
    if [[ -d "${UPLOADS_DIR}" ]]; then
        mkdir -p "$(dirname "${current_backup}")"
        cp -r "${UPLOADS_DIR}" "${current_backup}"
        log "Current files backed up to: ${current_backup}"
    fi
    
    # Clear current uploads directory
    log "Clearing current uploads directory..."
    rm -rf "${UPLOADS_DIR:?}"/*
    
    # Restore files
    log "Restoring files..."
    if tar -xzf "${backup_file}" -C "$(dirname "${UPLOADS_DIR}")"; then
        log "File restore completed successfully"
        return 0
    else
        log "ERROR: File restore failed"
        return 1
    fi
}

# List available backups
list_backups() {
    log "Available backups in ${BACKUP_DIR}:"
    
    echo ""
    echo "Database Backups:"
    find "${BACKUP_DIR}/database" -name "*.sql.gz" -type f 2>/dev/null | while read -r file; do
        printf "  %-40s %10s %s\n" \
            "$(basename "${file}")" \
            "$(du -h "${file}" | cut -f1)" \
            "$(stat -c %y "${file}" 2>/dev/null || stat -f %Sm "${file}" 2>/dev/null)"
    done | sort -r
    
    echo ""
    echo "File Backups:"
    find "${BACKUP_DIR}/files" -name "*.tar.gz" -type f 2>/dev/null | while read -r file; do
        printf "  %-40s %10s %s\n" \
            "$(basename "${file}")" \
            "$(du -h "${file}" | cut -f1)" \
            "$(stat -c %y "${file}" 2>/dev/null || stat -f %Sm "${file}" 2>/dev/null)"
    done | sort -r
}

# Main restore function
main() {
    log "=========================================="
    log "Restore Process Started"
    log "Restore Type: ${RESTORE_TYPE}"
    log "Backup Directory: ${BACKUP_DIR}"
    log "=========================================="
    
    # Show backup file if specified
    if [[ -n "${BACKUP_FILE}" ]]; then
        log "Using backup file: ${BACKUP_FILE}"
    else
        log "No backup file specified, listing available backups:"
        list_backups
        
        read -r -p "Enter the backup file path to restore: " BACKUP_FILE
        if [[ -z "${BACKUP_FILE}" ]]; then
            log "ERROR: No backup file specified"
            exit 1
        fi
    fi
    
    # Confirm restore
    confirm_restore
    
    local restore_success=true
    
    # Perform restore based on type
    case "${RESTORE_TYPE}" in
        database)
            if ! restore_database "${BACKUP_FILE}"; then
                restore_success=false
            fi
            ;;
        files)
            if ! restore_files "${BACKUP_FILE}"; then
                restore_success=false
            fi
            ;;
        all)
            # First restore database
            log "=== Phase 1: Restoring Database ==="
            if ! restore_database "${BACKUP_FILE}"; then
                log "ERROR: Database restore failed, aborting file restore"
                restore_success=false
            else
                # Then restore files
                log "=== Phase 2: Restoring Files ==="
                if ! restore_files "${BACKUP_FILE}"; then
                    log "ERROR: File restore failed"
                    restore_success=false
                fi
            fi
            ;;
    esac
    
    # Summary
    log "=========================================="
    if [[ "${restore_success}" == "true" ]]; then
        log "Restore completed successfully"
        log "Status: RESTORED"
    else
        log "Restore completed with errors"
        log "Status: PARTIAL/FAILED"
        log "Check logs above for details"
    fi
    log "=========================================="
    
    # Start application services if needed
    if [[ "${restore_success}" == "true" ]]; then
        log "Starting application services..."
        # Add commands to start your application
    fi
}

# Show usage if no arguments provided
if [[ $# -eq 0 ]]; then
    list_backups
    echo ""
    usage
    exit 0
fi

# Run main function
main "$@"
