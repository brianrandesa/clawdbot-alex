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

**Base URL:** https://esabuilder.com (see TOOLS.md). No auth required.

### 1. Create client

- **POST** `{base}/api/create-client`
- **Body (JSON):** `{ "name": "[Client Name]", "event_name": "[Event or same as name]", "knowledge_base": "[what you know about the business]", "avatar": "[target audience]" }`
- **Response:** `{ "clientId": "uuid" }` — use this in step 2.

### 2. Run full profile

- **POST** `{base}/api/full-profile`
- **Body (JSON):** `{ "clientId": "[clientId from step 1]" }`
- **Response:** `{ "clientId", "status": "ready", "message", "landingUrl?" }`

### 3. Reply in Slack

- "Done. **[Client Name]** is ready in ESA Studio. [Open ESA Studio](https://esabuilder.com). Select the client to see the full funnel, landing, ads, email, and SMS."

## Sending the plan into ESA Studio

When you build a plan in Slack (client success plan, launch plan, strategy), send it so the team sees it in ESA Studio:

- **POST** `https://esabuilder.com/api/strategy`
- **Body (JSON):** `{ "clientId": "[client UUID]", "plan": "[full plan text]" }`
- The plan appears in ESA Studio under **Victoria's Plan** for that client.

## Sending the checklist into ESA Builder

When you create the plan/checklist in the client's Slack channel (after Fathom, recordings, etc.), push the task list so it becomes the single to-do list for the team in ESA Builder:

- **POST** `https://esabuilder.com/api/checklist`
- **Body (JSON):** `{ "clientId": "[client UUID]", "replaceExisting": true, "tasks": [ { "title": "Task title", "assignedTo": "Shaw", "phase": "Phase 1", "dueDate": "2026-03-12" }, ... ] }`
- **Assignees:** Use only these names in `assignedTo`: **Shaw, Jawad, Hamza, Zoe, Denise, Kim, Brian, Diamond**. (Dropdown in ESA Builder is limited to these.)
- Fields: `title` (required), `assignedTo`, `phase`, `dueDate` (YYYY-MM-DD). Set `replaceExisting: true` to replace the client's checklist.
- Tasks appear in ESA Builder under Victoria's Plan + Checklist; the team can add more tasks and check off when done.
- Reply in Slack: "Plan and checklist are in ESA Builder for [Client]. Open the client and check Victoria's Plan."

## References

- `references/esa-studio-full-profile-flow.md` — same flow, quick ref
- `references/esa-studio-vs-victoria.md` — when to use ESA Studio vs Victoria templates
