# Alex Inbox Monitoring Setup

## Issue
IMAP access needs to be enabled for alexeventsales@gmail.com

## How to Enable IMAP

1. **Go to Gmail Settings:**
   - Log into alexeventsales@gmail.com
   - Click gear icon (⚙️) → "See all settings"

2. **Enable IMAP:**
   - Go to "Forwarding and POP/IMAP" tab
   - Under "IMAP access", select "Enable IMAP"
   - Click "Save Changes"

3. **Test the Connection:**
   Once IMAP is enabled, run:
   ```bash
   node alex-inbox-monitor.js
   ```

## How the System Works

### 1. Inbox Monitoring
Run `node alex-inbox-monitor.js` to check for new replies.

This will:
- Check inbox for new emails
- Detect replies to outbound campaigns
- Draft contextual responses based on email content
- Save drafts to `alex-pending-replies.json`

### 2. Review Drafts
```bash
# List all pending replies
node alex-approve-replies.js list

# View a specific draft
node alex-approve-replies.js show 1
```

### 3. Approve & Send
```bash
# Approve and send draft #1
node alex-approve-replies.js approve 1

# Reject draft #1 (won't send)
node alex-approve-replies.js reject 1
```

## Automated Responses

The system drafts replies based on:
- **Interest signals** → Walk through the system, ask about next event
- **Pricing questions** → Investment range ($15K-$50K), ROI context
- **Timeline questions** → 7-week buildout, scheduling availability
- **Objections** → Address concerns, offer references
- **Default** → General follow-up, calendar link

## Integration with OpenClaw

Once IMAP is working, I can:
- Run inbox checks automatically via heartbeats
- Send you Telegram notifications when new replies arrive
- Let you approve/edit drafts via chat (no command line needed)

## Next Steps

1. Enable IMAP in Gmail settings (see above)
2. Test: `node alex-inbox-monitor.js`
3. Once working, I'll automate it completely
