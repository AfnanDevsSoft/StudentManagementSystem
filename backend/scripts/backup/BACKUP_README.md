# 📦 Backup & Restore System

**Student Management System - Backup Documentation**

---

## 🎯 Overview

Comprehensive backup solution for the Student Management System with:
- **Database backups** (PostgreSQL)
- **File backups** (uploads directory)
- **Automated retention** (7 days default)
- **Verification** (integrity checks)
- **Notifications** (webhook support)

---

## 📁 Backup Structure

```
./backups/
├── database/          # PostgreSQL backups (.sql.gz)
│   └── smsnow_20260216_093000.sql.gz
├── files/             # File uploads backups (.tar.gz)
│   └── uploads_20260216_093500.tar.gz
└── logs/              # Backup operation logs
    └── backup-20260216_093000.log
```

---

## 🚀 Quick Start

### 1. Full System Backup

**Windows (PowerShell):**
```powershell
# Full backup (database + files)
.\scripts\backup\run-backup.ps1

# Database only
.\scripts\backup\backup-database.ps1

# Files only  
.\scripts\backup\backup-files.ps1
```

**Linux/macOS:**
```bash
# Full backup (database + files)
./scripts/backup/run-backup.sh

# Database only
./scripts/backup/backup-database.sh

# Files only
./scripts/backup/backup-files.sh
```

### 2. Restore from Backup

**List available backups:**
```bash
./scripts/backup/restore.sh
```

**Restore specific backup:**
```bash
./scripts/backup/restore.sh --type all --file ./backups/database/smsnow_20260216_093000.sql.gz
```

---

## ⚙️ Configuration

### Environment Variables

**Database Connection:**
```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=smsnow
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
```

**Backup Settings:**
```bash
BACKUP_DIR=./backups           # Local backup directory
RETENTION_DAYS=7               # Keep backups for 7 days
```

**Notifications (Optional):**
```bash
WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**AWS S3 (Optional):**
```bash
S3_BUCKET=your-sms-backups
AWS_REGION=us-east-1
```

---

## 📊 Automated Backups

### Windows Task Scheduler

1. **Open Task Scheduler** → Create Basic Task
2. **Name:** "SMS Database Backup"
3. **Trigger:** Daily at 2:00 AM
4. **Action:** Start a program
5. **Program:** `PowerShell.exe`
6. **Arguments:** `-ExecutionPolicy Bypass -File "C:\path\to\run-backup.ps1"`

### Linux Cron (crontab)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2:00 AM
0 2 * * * /path/to/sms-backend/scripts/backup/run-backup.sh

# Add hourly database backup
0 * * * * /path/to/sms-backend/scripts/backup/backup-database.sh
```

---

## 🔄 Manual Backup Usage

### Database Backup Only

**Windows:**
```powershell
.\scripts\backup\backup-database.ps1
```

**Linux/macOS:**
```bash
./scripts/backup/backup-database.sh
```

**Result:**
```
./backups/database/smsnow_20240216_093000.sql.gz
```

### File Backup Only

**Windows:**
```powershell
.\scripts\backup\backup-files.ps1
```

**Linux/macOS:**
```bash
./scripts/backup/backup-files.sh
```

**Result:**
```
./backups/files/uploads_20240216_093500.tar.gz
```

### Full System Backup

**Windows:**
```powershell
.\scripts\backup\run-backup.ps1
```

**Linux/macOS:**
```bash
./scripts/backup/run-backup.sh
```

**Result:**
```
./backups/database/smsnow_20240216_093000.sql.gz
./backups/files/uploads_20240216_093500.tar.gz
./logs/backup-20240216_093000.log
```

---

## 🆘 Restore from Backup

### 1. List Available Backups

```bash
./scripts/backup/restore.sh
```

**Output:**
```
Available backups in ./backups:

Database Backups:
  smsnow_20240216_093000.sql.gz            15M 2024-02-16 09:30:00
  smsnow_20240215_093000.sql.gz            14M 2024-02-15 09:30:00

File Backups:
  uploads_20240216_093500.tar.gz           25M 2024-02-16 09:35:00
  uploads_20240215_093500.tar.gz           24M 2024-02-15 09:35:00
```

### 2. Restore Database

```bash
./scripts/backup/restore.sh --type database \
  --file ./backups/database/smsnow_20240216_093000.sql.gz
```

**Process:**
1. Stop application services
2. Drop/recreate database (optional)
3. Restore from backup
4. Run migrations if needed
5. Start application services

### 3. Restore Files

```bash
./scripts/backup/restore.sh --type files \
  --file ./backups/files/uploads_20240216_093500.tar.gz
```

**Process:**
1. Create backup of current files
2. Clear uploads directory
3. Extract backup archive
4. Verify permissions

### 4. Full System Restore

```bash
./scripts/backup/restore.sh --type all \
  --file ./backups/database/smsnow_20240216_093000.sql.gz \
  --file ./backups/files/uploads_20240216_093500.tar.gz
```

---

## 🔍 Backup Verification

Every backup includes automatic verification:

**Database:**
```bash
# Verify compressed backup
gunzip -t backup.sql.gz

# Verify PostgreSQL dump format  
pg_restore --list backup.sql.gz
```

**Files:**
```bash
# Verify tar.gz archive
tar -tzf uploads.tar.gz
```

---

## 🗑️ Retention & Cleanup

**Automatic Cleanup:**
- Runs after every backup
- Deletes backups older than `RETENTION_DAYS` (default: 7 days)
- Logs all deletions

**Manual Cleanup:**
```bash
# Delete specific backup
rm ./backups/database/old_backup.sql.gz

# Clear all backups
rm -rf ./backups/*
```

---

## 📈 Monitoring

### Log Files

All backup operations logged to:
```
./logs/backup-YYYYMMDD_HHMMSS.log
```

**Log Contents:**
- Start/end timestamps
- Operation details
- File sizes
- Duration
- Success/failure status
- Error messages

### Log Example

```
[2024-02-16 09:30:00] ==========================================
[2024-02-16 09:30:00] Database Backup Started
[2024-02-16 09:30:00] Database: smsnow@localhost:5432
[2024-02-16 09:30:00] ==========================================
[2024-02-16 09:30:15] Backup completed: ./backups/database/smsnow_20240216_093000.sql.gz (15M)
[2024-02-16 09:30:18] Backup verification passed
[2024-02-16 09:30:20] Cleanup completed. Deleted 0 old backups.
[2024-02-16 09:30:20] ==========================================
[2024-02-16 09:30:20] Database Backup Completed (success)
[2024-02-16 09:30:20] Duration: 20 seconds
[2024-02-16 09:30:20] ==========================================
```

---

## ⚠️ Important Notes

### Database Credentials
- **Never** commit passwords to version control
- Use environment variables or secure vaults
- Rotate passwords regularly

### Storage Space
- Database backups: ~10-20MB per backup
- File backups: ~20-50MB per backup
- Daily backups: ~210MB/week per environment
- Plan storage capacity accordingly

### Backup Security
- Backup files contain sensitive data
- Restrict access to backup directory
- Encrypt backups if storing offsite
- Secure S3 bucket with appropriate policies

---

## 🆘 Troubleshooting

### Backup Fails: "pg_dump not found"
**Solution:** Install PostgreSQL client tools

**Windows:**
```powershell
# Download PostgreSQL installer
# https://www.postgresql.org/download/windows/
# Or use chocolatey:
choco install postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql-client
```

### Restore Fails: "Database in use"
**Solution:** Stop application services before restore

```bash
# Stop your application
npm run stop
# or
pm2 stop all
# or
docker-compose down
```

### Permission Denied Errors
**Solution:** Fix file permissions

```bash
# Linux/macOS
chmod +x ./scripts/backup/*.sh

# Windows (PowerShell as Administrator)
Get-ChildItem .\scripts\backup\*.ps1 | ForEach-Object {
    Unblock-File $_.FullName
}
```

---

## ✨ Best Practices

1. **Daily Backups:** Schedule for low-traffic hours (2-4 AM)
2. **Test Restores:** Practice restore monthly
3. **Monitor Logs:** Check backup logs daily
4. **Offsite Copies:** Store backups in multiple locations
5. **Encryption:** Enable backup encryption for sensitive data
6. **Documentation:** Keep restore procedures up-to-date
7. **Alerts:** Configure alerts for backup failures

---

**Backup System Version:** 1.0  
**Last Updated:** February 16, 2026  
**Next Review:** March 2026
