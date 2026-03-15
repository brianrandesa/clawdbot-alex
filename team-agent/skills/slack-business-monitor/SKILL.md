# Slack Business Workspace Monitor

## PURPOSE
Read-only monitoring of ESA's business Slack workspace to provide operational context and surface important team/client activity back to Victoria's reporting channel.

## ACCESS LEVEL
**READ-ONLY** - Victoria can observe but NEVER post in business workspace channels.

## WHAT VICTORIA MONITORS
- **Client channels** (`#[clientname]-esa`): Delivery updates, client requests, blockers
- **Team channels** (`#operations`, `#sales`, `#fulfillment`): Process discussions, resource needs
- **General/announcements**: Company updates, policy changes

## WHAT VICTORIA REPORTS BACK
Surface to Victoria's own Slack channel + Notion:
- Client escalation signals (refund mentions, frustration, missed deadlines)
- Team blockers or resource conflicts
- Project milestone completions
- Process questions that reveal training gaps
- Deadline risks across active projects

## BOUNDARIES
- **NO direct messaging** to clients or team in business workspace
- **NO posting** in any business workspace channel
- Reports go ONLY to Victoria's dedicated channel and Telegram via Henry
- Sensitive/HR matters are never reported - operational signals only

## ENV VARIABLES REQUIRED
```
SLACK_BOT_TOKEN - Bot token with read scopes only
SLACK_BUSINESS_WORKSPACE_ID - The ESA business workspace
SLACK_VICTORIA_CHANNEL_ID - Where Victoria posts summaries
```

## REPORTING CADENCE
- **Real-time**: Escalation triggers (refund, cancellation, critical blockers)
- **3x daily**: Morning briefing (9AM ET), midday pulse (1PM ET), end-of-day digest (5PM ET)
- **Weekly**: Friday summary of all client project statuses observed
