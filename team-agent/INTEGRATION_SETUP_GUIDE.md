# Victoria Integration Setup Guide

All config goes in `.env` (gitignored, never committed). This guide walks through activating each integration.

---

## 1. GoHighLevel (GHL)

**Status:** Config ready, needs API key

**Steps:**
1. Log into GHL → Settings → Business Profile → API Keys
2. Generate a new API key (or use existing)
3. Copy the **Location ID** from Settings → Business Profile
4. Update `.env`:
   ```
   GHL_API_KEY=paste_your_key_here
   GHL_LOCATION_ID=paste_location_id_here
   ```

**What Victoria gets:** Pipeline data, contact records, conversation history, automation status, campaign metrics.

**What Victoria CANNOT do:** Send SMS/email, modify pipelines, change automations, access billing.

---

## 2. Slack Business Workspace (Read-Only)

**Status:** Config ready, needs bot token

**Steps:**
1. Go to https://api.slack.com/apps → Create New App → From Scratch
2. Name: `Victoria Monitor` | Workspace: Your ESA business workspace
3. Go to **OAuth & Permissions** → Add these **Bot Token Scopes**:
   - `channels:history` (read public channel messages)
   - `channels:read` (list channels)
   - `groups:read` (see private channels Victoria is added to)
   - `users:read` (identify team members)
   - **DO NOT add `chat:write`** - Victoria is read-only
4. Install App to Workspace → Copy the **Bot User OAuth Token** (starts with `xoxb-`)
5. Get your Workspace ID from the URL when logged into Slack (the `T` value)
6. Create or identify Victoria's reporting channel → Get the channel ID (right-click channel → View channel details → ID at bottom)
7. Update `.env`:
   ```
   SLACK_BOT_TOKEN=xoxb-your-token-here
   SLACK_BUSINESS_WORKSPACE_ID=T0XXXXXXX
   SLACK_VICTORIA_CHANNEL_ID=C0XXXXXXX
   ```

**What Victoria gets:** Read messages in channels the bot is added to. Surface alerts to her own channel.

**What Victoria CANNOT do:** Post messages, react, DM anyone in business workspace.

---

## 3. Notion (SOPs & Documentation)

**Status:** Config ready, needs integration token

**Steps:**
1. Go to https://www.notion.so/my-integrations → Create new integration
2. Name: `Victoria SOP Reader`
3. Capabilities: **Read content** only (uncheck everything else)
4. Copy the **Internal Integration Secret** (starts with `ntn_` or `secret_`)
5. In Notion, go to your SOP database/pages:
   - Click `...` menu → Connections → Add `Victoria SOP Reader`
   - Do this for EVERY page/database Victoria should access
6. Get the SOP Database ID from the URL: `notion.so/YOUR_WORKSPACE/DATABASE_ID?v=...`
7. Update `.env`:
   ```
   NOTION_TOKEN=ntn_your_token_here
   NOTION_SOP_DATABASE_ID=paste_database_id_here
   ```

**What Victoria gets:** Read SOPs, process docs, templates, training materials.

**What Victoria CANNOT do:** Edit, create, or delete any Notion content.

---

## 4. ClickUp (Already Configured)

**Status:** Existing integration - just needs key rotation for security

**Steps:**
1. Go to ClickUp → Settings → Apps → API Token
2. Generate a new token (old one was exposed in git)
3. Update `.env`:
   ```
   CLICKUP_API_KEY=pk_your_new_key_here
   ```

---

## Post-Setup Checklist

After adding all keys to `.env`:

- [ ] Verify `.env` is NOT tracked by git: `git status` should not show it
- [ ] Test GHL connection: Can Victoria read pipeline data?
- [ ] Test Slack: Can Victoria read business workspace channels?
- [ ] Test Notion: Can Victoria access SOP pages?
- [ ] Test ClickUp: Does the new key work?
- [ ] Rotate old exposed keys (Gmail app password, old ClickUp key, Brave key)
- [ ] Verify Victoria's Slack channel receives test reports

---

## Security Reminders

- All keys in `.env` only - never in code files or docs
- `.gitignore` blocks all `.env*` files and `credentials/` directory
- Rotate keys quarterly or immediately if exposure suspected
- Each integration uses minimum required permissions (read-only where possible)
- Victoria NEVER has write access to client-facing channels or systems
