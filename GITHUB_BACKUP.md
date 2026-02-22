# GitHub Backup System

## Repository
**URL:** https://github.com/brianrandesa/clawdbot-alex

This repo contains the complete Henry workspace - everything that makes me me.

## What's Backed Up
- SOUL.md, USER.md, MEMORY.md (core identity & context)
- AGENTS.md, TOOLS.md, IDENTITY.md (operating instructions)
- memory/ folder (daily logs & heartbeat state)
- All workspace scripts and configs
- ESA knowledge base files

## What's NOT Backed Up (Security)
- API keys, tokens, credentials (.env files)
- Service account JSON files
- Temporary/cache files
- node_modules

## Automatic Sync Schedule
**Frequency:** Daily at 11:00 PM EST
**Method:** OpenClaw cron job
**Script:** `/Users/jedidiahenderson/.openclaw/workspace/sync-to-github.sh`

## Manual Sync
To push changes immediately:
```bash
cd ~/.openclaw/workspace
./sync-to-github.sh
```

Or commit manually:
```bash
cd ~/.openclaw/workspace
git add .
git commit -m "Your message"
git push origin main
```

## Cloning to New VM
See README.md for full setup instructions.

Quick start:
```bash
git clone https://github.com/brianrandesa/clawdbot-alex.git
cp -r clawdbot-alex/* ~/.openclaw/workspace/
# Then configure OpenClaw with API keys, etc.
```

## Token Management
Current GitHub token has `repo` scope (full access).
- Stored in git remote URL (locally)
- NOT committed to repo
- If token expires, regenerate at: https://github.com/settings/tokens

## Last Manual Push
February 17, 2026 - Initial setup
