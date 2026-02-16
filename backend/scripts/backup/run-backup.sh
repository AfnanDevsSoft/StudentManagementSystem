#!/bin/bash

# Student Management System - Master Backup Coordinator
# Runs full system backup (database + files)

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
LOG_DIR="${LOG_DIR:-./logs}"

# Create directories
mkdir -p "${BACKUP_DIR}/database" "${BACKUP_DIR}/files" "${LOG_DIR}"

# Logging
LOG_FILE="${LOG_DIR}/backup-$(date '+%Y%m%d_%H%M%S').log"
exec > >(tee -a "${LOG_FILE}")
exec 2>&1

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Main backup coordinator
main() {
    local start_time
    start_time=$(date +%s)
    
    log "╔══════════════════════════════════════════════════════════╗"
    log "║          SMS Backup Coordinator - STARTED               ║"
    log "╚══════════════════════════════════════════════════════════╝"
    log ""
    log "Configuration:"
    log "  Backup Directory: ${BACKUP_DIR}"
    log "  Log File: ${LOG_FILE}"
    log ""
    
    local backup_success=true
    
    # Phase 1: Database Backup
    log "══════════════════════════════════════════════════════════"
    log "PHASE 1: Database Backup"
    log "══════════════════════════════════════════════════════════"
    
    if "${SCRIPT_DIR}/backup-database.sh"; then
        log "✅ Database backup completed successfully"
    else
        log "❌ Database backup failed"
        backup_success=false
    fi
    
    log ""
    
    # Phase 2: File Backup
    log "══════════════════════════════════════════════════════════"
    log "PHASE 2: File Backup"
    log "══════════════════════════════════════════════════════════"
    
    if "${SCRIPT_DIR}/backup-files.sh"; then
        log "✅ File backup completed successfully"
    else
        log "❌ File backup failed"
        backup_success=false
    fi
    
    log ""
    
    # Calculate duration
    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Summary
    log "╔══════════════════════════════════════════════════════════╗"
    if [[ "${backup_success}" == "true" ]]; then
        log "║              BACKUP COMPLETED SUCCESSFULLY              ║"
    else
        log "║               BACKUP COMPLETED WITH ERRORS              ║"
    fi
    log "╠══════════════════════════════════════════════════════════╣"
    log "║  Duration: ${duration} seconds                           ║"
    log "║  Log File: ${LOG_FILE}          ║"
    log "╚══════════════════════════════════════════════════════════╝"
    
    # Send notification if webhook configured
    if [[ -n "${WEBHOOK_URL:-}" ]]; then
        local status="success"
        if [[ "${backup_success}" == "false" ]]; then
            status="failure"
        fi
        
        curl -X POST "${WEBHOOK_URL}" \
            -H 'Content-Type: application/json' \
            -d "{\"text\":\"SMS Backup ${status} (${duration}s)\",\"status\":\"${status}\"}" \
            --silent || echo "WARN: Failed to send webhook"
    fi
    
    # Return appropriate exit code
    if [[ "${backup_success}" == "true" ]]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"
