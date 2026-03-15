# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## ESA Studio (full profile flow)

- **Base URL:** https://esabuilder.com
- **Create client:** POST `https://esabuilder.com/api/create-client` — Body: `{ "name", "event_name?", "knowledge_base?", "avatar?" }` → returns `{ "clientId" }`
- **Full profile:** POST `https://esabuilder.com/api/full-profile` — Body: `{ "clientId" }` (or `{ "brief" }` to create + run in one step) → returns `{ "clientId", "status": "ready", "message", "landingUrl?" }`
- **Send plan (Victoria → ESA Studio):** POST `https://esabuilder.com/api/strategy` — Body: `{ "clientId": "uuid", "plan": "full plan text" }` → plan appears in ESA Studio → Victoria's Plan tab for that client
- **Send checklist (Victoria → ESA Builder):** POST `https://esabuilder.com/api/checklist` — Body: `{ "clientId": "uuid", "replaceExisting": true, "tasks": [ { "title": "...", "assignedTo": "Shaw"|"Jawad"|"Hamza"|"Zoe"|"Denise"|"Kim"|"Brian"|"Diamond", "phase": "Phase 1", "dueDate": "YYYY-MM-DD" } ] }` → tasks appear in ESA Builder; team can add more and check off
- **Add one task (in ESA Builder):** POST `https://esabuilder.com/api/checklist/task` — Body: `{ "clientId": "uuid", "title": "...", "assignedTo?", "dueDate?" }` → appends one task

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
