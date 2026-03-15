---
name: esa-studio-full-profile
description: Create a full profile in ESA Studio (client + strategy + landing + ads + email + SMS) via API. Use when team asks to "build [Name] a site", "create full profile for [Client]", or get a Javi-level site ready in ESA Studio without manual steps.
---

# ESA Studio Full Profile

When the team requests a **full profile** or **custom site** in ESA Studio, run these two API calls then confirm in Slack.

## When to use

- "Build Javi a site"
- "Create full profile for [Client Name]"
- "Get a full funnel ready in ESA Studio for [Client]"
- Custom landing + ads + email + SMS in one go (Javi-level quality)

## API flow

**Base URL:** See TOOLS.md (e.g. https://esa-studio.vercel.app). No auth required.

### 1. Create client

- **POST** `{base}/api/create-client`
- **Body (JSON):** `{ "name": "[Client Name]", "event_name": "[Event or same as name]", "knowledge_base": "[what you know about the business]", "avatar": "[target audience]" }`
- **Response:** `{ "clientId": "uuid" }` — use this in step 2.

### 2. Run full profile

- **POST** `{base}/api/full-profile`
- **Body (JSON):** `{ "clientId": "[clientId from step 1]" }`
- **Response:** `{ "clientId", "status": "ready", "message", "landingUrl?" }`

### 3. Reply in Slack

- "Done. **[Client Name]** is ready in ESA Studio. [Open ESA Studio]({base}). Select the client to see the full funnel, landing, ads, email, and SMS."

## References

- `references/esa-studio-full-profile-flow.md` — same flow, quick ref
- `references/esa-studio-vs-victoria.md` — when to use ESA Studio vs Victoria templates
