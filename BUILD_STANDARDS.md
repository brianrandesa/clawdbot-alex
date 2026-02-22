# Build & Deployment Standards

## Pre-Launch Protocol (Mandatory)

Every build, deployment, or new instance **MUST** pass this checklist before going live.

### 1. Security Baseline (Read-Only)
- [ ] Run `openclaw security audit --deep`
- [ ] Check all file permissions
- [ ] Verify credential storage (no exposed tokens)
- [ ] Confirm 2FA on all critical accounts (browser control)
- [ ] Review gateway exposure settings

### 2. System Health Diagnostics
- [ ] Run `openclaw status --deep`
- [ ] Run `openclaw health --json`
- [ ] Verify all services running correctly
- [ ] Check connectivity to all required APIs
- [ ] Test channel integrations (Telegram, etc.)

### 3. Version & Update Status
- [ ] Run `openclaw update status`
- [ ] Ensure running latest stable version
- [ ] Document current version/commit

### 4. Host Security Assessment
- [ ] Firewall status check
- [ ] Open ports scan (`ss -ltnup` on Linux, `lsof -nP -iTCP -sTCP:LISTEN` on macOS)
- [ ] SSH/remote access audit
- [ ] Verify disk encryption (FileVault/LUKS/BitLocker)
- [ ] Confirm automatic security updates enabled
- [ ] Backup system verification

### 5. Risk Tolerance Alignment
Confirm deployment matches one of:
- **Home/Workstation Balanced** - Firewall on, LAN/tailnet only
- **VPS Hardened** - Deny-by-default, minimal ports, key-only SSH
- **Developer Convenience** - More permissive, explicit warnings
- **Custom** - User-defined constraints documented

### 6. Remediation Plan
- [ ] Generate full gap analysis vs target risk profile
- [ ] Document exact commands for fixes
- [ ] Include rollback strategy
- [ ] Note access preservation steps
- [ ] Flag potential lockout risks

### 7. Execution (Staged Approval)
**NEVER auto-execute.** Always:
- Show exact command
- Explain impact + rollback
- Confirm access preservation
- Get explicit approval
- Stop on unexpected output

### 8. Post-Fix Verification
Re-check everything:
- [ ] Firewall status
- [ ] Listening ports
- [ ] Remote access still works
- [ ] Re-run `openclaw security audit`
- [ ] Document final posture

### 9. Ongoing Monitoring Setup
- [ ] Schedule periodic audits via `openclaw cron`
  - `healthcheck:security-audit` (daily/weekly)
  - `healthcheck:update-status` (weekly)
- [ ] Set output location
- [ ] Test cron execution

### 10. Memory & Documentation
- [ ] Log to `memory/YYYY-MM-DD.md`:
  - What was checked
  - Key findings
  - Actions taken
  - Commands executed
  - Scheduled cron jobs
- [ ] Update `MEMORY.md` with durable decisions (risk posture, policies)
- [ ] Redact sensitive details (IPs, tokens, hostnames)

---

## Critical Rules

### Approvals Required For:
- Firewall rule changes
- Opening/closing ports
- SSH/RDP config changes
- Installing/removing packages
- Enabling/disabling services
- User/group modifications
- Scheduling tasks
- Update policy changes
- Accessing sensitive files/credentials

### Security Principles:
1. **Read-only first** - Always assess before changing
2. **Staged changes** - Never bulk-apply without review
3. **Reversible** - Always have rollback plan
4. **Access preservation** - Never risk lockout
5. **Least privilege** - Tighten where safe
6. **Credential hygiene** - Disk encryption + secure storage
7. **Explicit consent** - When unsure, ask

### What OpenClaw Does NOT Control:
- Host firewall (OS-level)
- SSH configuration
- OS automatic updates
- System packages

OpenClaw only manages:
- Its own security defaults
- File permissions
- Gateway configuration
- Service exposure

---

## Deployment Contexts

### Local Workstation (Mac/PC)
- Focus: Firewall + disk encryption + backups
- Access: Direct console or local network
- Risk: Balanced (home network)

### Remote VPS/Server
- Focus: SSH hardening + minimal ports + auto-updates
- Access: SSH with keys only (no password)
- Risk: Hardened (public internet)

### Container/VM
- Focus: Image security + network isolation
- Access: Depends on orchestration
- Risk: Varies by network exposure

---

## GitHub Sync

After any security changes or new deployment:
- Commit updated configs to GitHub
- Document in `memory/YYYY-MM-DD.md`
- Update `MEMORY.md` with durable security decisions
- Push via `./sync-to-github.sh` or wait for daily auto-sync

---

## Compliance

Every new instance, major update, or deployment **MUST**:
1. Run full healthcheck protocol
2. Document results in workspace
3. Get explicit approval for changes
4. Verify post-change
5. Schedule ongoing monitoring

**No exceptions. Security > speed.**

---

*Last Updated: February 17, 2026*
*Owner: Brian Rand / ESA*
*Enforced by: Henry (AI Assistant)*
