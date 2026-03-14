# OpenClaw ↔ Voice Agent Bridge

**Purpose:** Connect the voice agent (Victoria) to OpenClaw for shared identity and future context sync.

---

## Voice Agent Folder

*Path TBD – Brian is building in another Cursor window*

Once known, add path here and ensure these files are synced or linked.

---

## Phase 1: Shared Identity (Immediate)

**Copy or symlink to voice agent folder:**

| Source | Purpose |
|--------|---------|
| `team-agent/AGENTS.md` | Victoria's identity, capabilities, boundaries |
| `team-agent/IDENTITY.md` | Name, vibe, emoji |
| `team-agent/references/esa-client-success-framework.md` | Client onboarding, offer stack |
| `team-agent/references/funnel-build-workflow.md` | Funnel deploy flow (for when voice handles requests) |
| `team-agent/skills/ghl-crm-integration/SKILL.md` | GHL capabilities (summary for voice context) |

**Voice agent should:**
- Use same tone, boundaries, escalation rules
- Know client success flow (onboarding, sprint phases, templates)
- When asked "deploy a funnel" → either guide to Slack @Victoria, or (Phase 2) trigger via OpenClaw

---

## Phase 2: OpenClaw Gateway Integration (Future)

**If voice needs live data:**
- OpenClaw gateway: `http://localhost:18789` (token auth)
- Potential endpoints: get pipeline summary, funnel status, client list
- Voice agent calls OpenClaw → gets context → responds

**If voice needs to trigger actions:**
- Voice: "Deploy general-business for Johnson"
- Voice agent → POST to OpenClaw task queue or Victoria session
- Victoria executes, reports back

**Requires:** API design, OpenClaw extension for voice-triggered tasks.

---

## Phase 3: Unified Victoria (Stretch)

- One Victoria backend
- Voice and Slack are both channels to same agent
- Shared memory, shared context
- Requires OpenClaw multi-channel architecture support

---

*Part of Open Claw Superpower Team Plan – March 2026*
