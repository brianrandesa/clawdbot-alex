# Slack Digest for Victoria's Report

Victoria's 5 PM daily report can include **Slack channel analysis** if this digest is kept up to date.

## What it does

- Fetches last **24 hours** of messages from every channel the Slack bot is in (up to 30 channels, 50 messages per channel).
- Writes **`team-agent/memory/slack-digest-latest.md`**.
- Victoria's cron report reads that file and includes a Slack analysis in her Telegram report to Brian.

## Requirements

- **Token:** `SLACK_BOT_TOKEN_VICTORIA` (or `SLACK_BOT_TOKEN`) in env or in workspace root `.env`.
- **Scopes:** Bot must have `channels:read`, `channels:history`, `groups:read`, `groups:history`, `users:read`.
- **Node:** Run from `team-agent/scripts` after `npm install`.

## Run once (test)

```bash
cd /Users/esai/.openclaw/workspace/team-agent/scripts
export SLACK_BOT_TOKEN_VICTORIA="xoxb-your-token"   # or use .env
node slack-digest.js
```

Then check `team-agent/memory/slack-digest-latest.md`.

## Schedule so Victoria always has fresh data

Run the script **before** Victoria's 5 PM report (e.g. 4:50 PM ET daily). Two options:

### Option A: macOS LaunchAgent (recommended)

1. Create `~/Library/LaunchAgents/ai.openclaw.slack-digest.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>ai.openclaw.slack-digest</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/env</string>
    <string>node</string>
    <string>/Users/esai/.openclaw/workspace/team-agent/scripts/slack-digest.js</string>
  </array>
  <key>WorkingDirectory</key>
  <string>/Users/esai/.openclaw/workspace/team-agent/scripts</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string>
    <!-- Add SLACK_BOT_TOKEN_VICTORIA from your .env or secrets -->
    <key>SLACK_BOT_TOKEN_VICTORIA</key>
    <string>YOUR_TOKEN_HERE</string>
  </dict>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>16</integer>
    <key>Minute</key>
    <integer>50</integer>
  </dict>
</dict>
</plist>
```

- Runs daily at 4:50 PM local time (so digest is ready before Victoria's 5 PM report).
- Load: `launchctl load ~/Library/LaunchAgents/ai.openclaw.slack-digest.plist`

### Option B: System crontab

```bash
crontab -e
```

Add (adjust path and ensure env has token):

```
50 16 * * * cd /Users/esai/.openclaw/workspace/team-agent/scripts && node slack-digest.js
```

## Victoria's report

Victoria's cron message was updated to:

- Read `memory/slack-digest-latest.md` if present.
- Include a short Slack analysis (highlights, blockers, client/team signals) in her daily ops report to Brian on Telegram.
- If the file is missing, say so and still send the rest of the report.

## Troubleshooting

- **Missing_scope:** Add `channels:history` and `groups:history` to the Slack app's Bot Token Scopes.
- **Not in channel:** Bot must be **invited** to each channel to read history.
- **Empty digest:** Check token, channel membership, and that messages exist in the last 24h.
