# CONTINUITY PROTOCOL - NEVER LOSE CONTEXT AGAIN

## THE PROBLEM
Henry's session dropped during Mac Studio migration backup creation. Context lost. Brian frustrated. **THIS CANNOT HAPPEN AGAIN.**

## MANDATORY SOLUTIONS

### 1. IMMEDIATE MEMORY SAVES
- **After every major decision/action** → Update memory files
- **Before long-running commands** → Save state
- **Critical project updates** → Commit to memory immediately
- **No "mental notes"** - everything goes in files

### 2. BACKUP REDUNDANCY  
```bash
# Multiple backup methods for critical operations
cd ~/.openclaw

# Method 1: Local backup
tar -czf henry-backup-$(date +%Y%m%d-%H%M).tar.gz workspace agents credentials

# Method 2: GitHub auto-sync (already setup)
git add -A && git commit -m "Auto-backup $(date)" && git push

# Method 3: External storage
cp henry-backup-*.tar.gz /Volumes/ExternalDrive/ 2>/dev/null || echo "External drive not mounted"
```

### 3. SESSION STATE PRESERVATION
- **Document active tasks** in `memory/active-tasks.md`
- **Save command outputs** immediately 
- **Track progress** on multi-step operations
- **Session checkpoints** every 15 minutes

### 4. COMMUNICATION PROTOCOL
- **"Working on X..."** messages for long operations
- **Progress updates** during critical tasks
- **"Task complete"** confirmations
- **Never go silent** during important operations

### 5. AUTOMATED SAFEGUARDS
```bash
# Auto-save every 10 minutes (via cron)
*/10 * * * * cd ~/.openclaw/workspace && git add -A && git commit -m "Auto-save $(date)" && git push

# Heartbeat monitoring
# If no activity for 5+ minutes during critical tasks → auto-save state
```

### 6. CRITICAL TASK PROTOCOL
**Before any critical operation:**
1. Save current state to memory
2. Document what's about to happen  
3. Set up progress monitoring
4. Create rollback plan
5. Execute with frequent updates

**During operation:**
- Update every 2-3 minutes
- Save intermediate progress
- Confirm each major step

**After completion:**
- Document results
- Update memory files
- Confirm success
- Clean up temp files

## IMMEDIATE ACTIONS

### 1. CREATE MAC STUDIO BACKUP NOW
```bash
cd ~/.openclaw
tar -czf henry-mac-studio-complete-$(date +%Y%m%d-%H%M).tar.gz workspace agents credentials telegram cron openclaw.json
echo "Backup created: henry-mac-studio-complete-$(date +%Y%m%d-%H%M).tar.gz"
```

### 2. GITHUB BACKUP VERIFICATION
```bash
cd ~/.openclaw/workspace
git status
git add -A
git commit -m "Pre-migration backup $(date)"
git push
```

### 3. DOCUMENT ALL CURRENT ESA PROJECTS
- EventClaw.AI website status
- Mac Studio migration plan
- ESA Business Assistant deployment
- All AI agent status

## NEVER AGAIN RULES

1. **No long silences** during critical operations
2. **Save state before risky commands**  
3. **Document everything immediately**
4. **Multiple backup methods always**
5. **Progress updates every few minutes**
6. **Session recovery plans ready**

## BRIAN'S GUARANTEE
**Henry will maintain perfect continuity. No dropped context. No lost progress. Every critical task gets completed with full documentation and backup.**

**This protocol is now mandatory for all ESA operations.**

---

*Created: March 10, 2026*  
*Owner: Brian Rand*  
*Enforced by: Henry*