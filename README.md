# Henry - ESA Assistant Instance

This repository contains the complete workspace and context for Henry, the AI assistant for Brian Rand / Event Sales Agency (ESA).

## What's In Here

This is a snapshot of Henry's complete state, including:

- **SOUL.md** - Core personality and operating principles
- **USER.md** - Everything about Brian (background, preferences, communication style)
- **MEMORY.md** - Long-term curated memories and context
- **AGENTS.md** - Agent operating instructions and conventions
- **TOOLS.md** - Local tool configurations and notes
- **IDENTITY.md** - Name, avatar, emoji, vibe
- **HEARTBEAT.md** - Periodic check routines (if exists)
- **memory/** - Daily logs and context (YYYY-MM-DD.md files)

## Setting Up This Instance on a New VM

### Prerequisites

1. **OpenClaw installed** - Follow: https://docs.openclaw.ai/getting-started
2. **Telegram Bot** (or other messaging channel) configured
3. **API Keys** ready (Anthropic, etc.)

### Installation Steps

1. **Clone this repo:**
   ```bash
   git clone https://github.com/brianrandesa/clawdbot-alex.git ~/henry-workspace
   ```

2. **Copy workspace files to OpenClaw:**
   ```bash
   cp -r ~/henry-workspace/* ~/.openclaw/workspace/
   ```

3. **Configure OpenClaw:**
   
   Edit `~/.openclaw/config.yaml` (or use `openclaw gateway config.apply`):
   
   - Set your Telegram bot token
   - Configure Anthropic API key
   - Set workspace path: `~/.openclaw/workspace`
   - Configure any other channels/services
   
   **Critical settings:**
   - `workspace.enabled: true`
   - `workspace.path: /path/to/.openclaw/workspace`
   - Load SOUL.md, USER.md, MEMORY.md, AGENTS.md, TOOLS.md, IDENTITY.md in workspace context

4. **Restart OpenClaw:**
   ```bash
   openclaw gateway restart
   ```

5. **Verify:**
   - Message your bot on Telegram
   - Henry should respond with full context/memory intact
   - Test memory: ask "What do you know about Brian?" or "What's ESA's revenue goal?"

### What You'll Need to Reconfigure

This repo does NOT include sensitive credentials. You'll need to set up:

- **Telegram Bot Token** - Create new bot or use existing via BotFather
- **Anthropic API Key** - From console.anthropic.com
- **OpenClaw Gateway Token** - Generated on first run
- **Any other service integrations** (email, calendar, etc.)

### Maintaining Continuity

- Henry's memory files are included - this is his brain
- To keep continuity, regularly commit updates to this repo:
  ```bash
  cd ~/.openclaw/workspace
  git add .
  git commit -m "Memory update - [date]"
  git push
  ```

- Or set up automatic backups via cron

### File Structure

```
workspace/
├── README.md          # This file
├── SOUL.md            # Who Henry is
├── USER.md            # About Brian
├── MEMORY.md          # Long-term memory
├── AGENTS.md          # Agent instructions
├── TOOLS.md           # Local tool configs
├── IDENTITY.md        # Name/avatar/emoji
├── HEARTBEAT.md       # Periodic checks (optional)
└── memory/            # Daily logs
    ├── 2026-02-15.md
    ├── 2026-02-16.md
    ├── 2026-02-17.md
    └── heartbeat-state.json
```

### Troubleshooting

**Henry doesn't remember anything:**
- Check that workspace files are in the correct path
- Verify OpenClaw config has `workspace.enabled: true`
- Check that context files are being loaded (check logs)

**Henry acts different:**
- Make sure SOUL.md and AGENTS.md are loaded
- Verify the agent personality hasn't been overridden in config

**Can't push updates:**
- Regenerate GitHub PAT if expired
- Check repo permissions

### Support

- OpenClaw docs: https://docs.openclaw.ai
- OpenClaw Discord: https://discord.com/invite/clawd
- Henry was built with OpenClaw version: latest (Feb 2026)

---

**Note:** This is a living instance. Henry learns and updates his memory daily. Commit changes regularly to maintain continuity across instances.

**Last Updated:** February 17, 2026
