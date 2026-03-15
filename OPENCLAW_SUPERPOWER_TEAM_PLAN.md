# Open Claw Superpower Team Plan

**Owner:** Brian Rand  
**Created:** March 14, 2026  
**Scope:** Security, communication, Victoria client success, voice agent, funnel building

---

## Executive Summary

This plan consolidates five workstreams into one execution roadmap:

1. **Security hardening** – All agents, all surfaces
2. **Communication alignment** – Consistent rules, escalation, when to speak
3. **Victoria + Client Success** – Team uses her in Slack for funnel builds, GHL deployments
4. **Voice agent integration** – Connect voice Victoria to OpenClaw for continuity
5. **Agent alignment** – Shared standards, unified identity

---

## PART 1: Security Hardening

### 1.1 Run Full Audit (Day 1)

```bash
openclaw security audit --deep
openclaw status --deep
openclaw health --json
```

### 1.2 Credential & Key Hygiene

| Item | Status | Action |
|------|--------|--------|
| Anthropic API key in git history | CRITICAL | Rotate key, scrub with BFG |
| GHL API key | Verify | Check PIT vs OAuth, rotation schedule |
| GHL browser credentials | Stored in .env | Confirm .env in .gitignore |
| Telegram bot tokens | Env vars | Verify no leaks |
| OPENCLAW_GATEWAY_TOKEN | Env | Confirm secure |

### 1.3 GHL MCP Server Hardening

- **Current:** `100.82.186.108:3100` (Tailscale IP), auth by IP only
- **Verify:** Ports 3100/3101 not exposed to public internet
- **Add:** Optional token auth layer for defense in depth

### 1.4 Per-Agent Security Checklist

Each agent (Henry, Rex, Victoria, Sebastian, Marcus) gets:

- [ ] No PII in logs or memory files
- [ ] External actions gated (email, SMS, posts = ask first)
- [ ] Scope boundaries enforced in AGENTS.md

---

## PART 2: Communication Alignment

### 2.1 Shared Communication Rules (All Agents)

Add to each agent's AGENTS.md:

```
## COMMUNICATION RULES (Shared)
- NEVER use em dashes (—) in any outreach. Use periods or hyphens.
- NO EMOJIS in client-facing copy (emails, SMS, ads, funnels)
- Professional business language. Human, not robotic.
- Discord/WhatsApp: No markdown tables. Bullet lists only.
- Quality > quantity. One thoughtful response beats fragments.
```

### 2.2 Escalation Matrix (Unified)

| Escalate To | When |
|-------------|------|
| Brian | Refunds, legal, enterprise issues, $25K+ deals |
| Denise | Client relationship, scope changes, ops decisions |
| Victoria | Process questions, funnel builds, GHL, SOPs |
| Henry | Strategic, cross-agent, executive visibility |

### 2.3 When to Speak (Group Chats)

- **Respond:** Direct mention, genuine value, correction, summary when asked
- **Stay silent:** Casual banter, already answered, "yeah/nice" responses
- **React:** Use emoji reactions for lightweight acknowledgment

---

## PART 3: Victoria + Client Success + Funnel Building

### 3.1 Current State vs Target

| Aspect | Current | Target |
|--------|---------|--------|
| GHL access | Read-only (documented) | Read + write + browser automation |
| Slack | "Never post in business channels" | Active in #client-success, #funnel-builds |
| Funnel builds | Shah/Hamza manual | Victoria deploys templates, team requests via Slack |
| ESA Studio | Separate app, Brian/Denise | Team uses via Victoria guidance or direct link |

### 3.2 Victoria's New Capabilities

**GHL Write Operations (with safeguards):**

- Deploy template: `POST /templates/deploy` – `general-business`, `high-ticket-mastermind`, `virtual-hybrid`, `multi-day-conference`
- Create funnel: `POST /browser/create-funnel`
- Add funnel pages, workflows, speed-to-lead, QA test
- Create pipelines, tags, custom fields
- **NEVER:** Send SMS/email to clients, delete contacts, touch "(DO NOT TOUCH)" pipelines

**Client Success Workflow:**

1. Team member in Slack: "@Victoria deploy general-business template for Johnson summit"
2. Victoria: Confirms client/sub-account, runs template deploy, creates funnel, runs QA
3. Victoria: Reports completion, links to GHL, logs in ClickUp if needed

### 3.3 Slack Channel Structure for Client Success

| Channel | Purpose | Who | Victoria Role |
|---------|---------|-----|---------------|
| `#client-success` | Funnel builds, GHL deployments, client system requests | Denise, Kim, Shah, Hamza, James | **Primary** – @Victoria for builds |
| `#funnel-builds` | Dedicated funnel/GHL build requests (optional split) | GHL team + ops | Execute templates, create funnels |
| `#esa-ops` or existing | General ops, process questions | Full team | Answer SOPs, link to Notion |
| `#victoria-reports` | Victoria's digest, alerts (if separate) | Brian, Denise | Daily digest, escalation alerts |

**Recommendation:** Start with `#client-success` as the single channel for funnel + client success. Add `#funnel-builds` only if volume justifies it.

### 3.4 ESA Studio Connection

**Option A – Victoria guides to ESA Studio**

- Team: "I need a landing page for Johnson"
- Victoria: "Use ESA Studio: https://esabuilder.com. Create client Johnson, run Full Funnel Generator. I can deploy the GHL snapshot after you're done."

**Option B – Victoria does GHL, ESA Studio for advanced**

- Standard client systems: Victoria deploys GHL templates directly
- Custom landing pages, headline lab, creative: Team uses ESA Studio
- Victoria bridges: Takes ESA Studio output specs, executes in GHL where possible

**Option C – API bridge (future)**

- ESA Studio triggers webhook → Victoria/OpenClaw receives → deploys to GHL
- Requires ESA Studio backend changes

**Immediate:** Implement Option A + B. Victoria handles template deployments; team uses ESA Studio for custom creative. Document in Victoria's AGENTS.md.

### 3.5 Funnel Build Flow (No Brian Required)

```
Client roadmap approved (ClickUp) 
  → Kim/Denise: "@Victoria we need a general-business system for [Client X], sub-account [ID]"
  → Victoria: Deploys template, creates funnel, speed-to-lead, QA
  → Victoria: "Done. Funnel: [link]. QA passed. Shah, please do final walkthrough."
  → Shah: QA + client walkthrough (existing process)
```

**Gate:** Roadmap must be approved before Victoria deploys. Victoria checks ClickUp or asks for confirmation.

---

## PART 4: Voice Agent Integration

### 4.1 Voice Agent + OpenClaw Goals

- Same Victoria identity (knowledge, tone, scope)
- Voice as another channel – call in, get help
- OpenClaw memory/context available to voice (when connected)
- Shared client success workflows (funnel status, next steps)

### 4.2 Integration Options

| Approach | How | Pros | Cons |
|----------|-----|------|------|
| **Shared identity** | Voice agent uses same SOUL.md, USER.md, client framework | Consistent experience | Manual sync of docs |
| **OpenClaw API** | Voice agent calls OpenClaw gateway for context | Real-time memory, pipeline | Requires API design |
| **Victoria as backend** | Voice → OpenClaw Victoria session → response | Single source of truth | Latency, complexity |
| **Event-driven** | Voice actions (e.g. "deploy funnel") → OpenClaw task queue | Async, scalable | More plumbing |

**Phase 1:** Shared identity. Voice agent folder gets copies of (or symlinks to) Victoria's AGENTS.md, references, client framework. Same personality, same boundaries.

**Phase 2:** If voice needs live data (pipeline, funnel status), add OpenClaw gateway endpoint or MCP-style tool that voice agent can call.

### 4.3 Voice Agent Folder Convention

```
/Users/esai/[voice-agent-folder]/
  identity/           <- Link or copy from team-agent
  references/         <- esa-client-success-framework, ghl skill summary
  .openclaw/          <- Optional: workspace-state for future bridge
```

**Action:** Once you share the voice agent folder path, we can add an OPENCLAW_VOICE_BRIDGE.md with exact sync instructions.

---

## PART 5: Agent Alignment

### 5.1 Shared Files All Agents Should Respect

- `AGENTS.md` (workspace root) – Core directive, memory, safety
- `BUILD_STANDARDS.md` – Pre-launch protocol
- `MEMORY.md` – Business context (main session only)
- Copy rules: NO em dashes, NO emojis in client copy

### 5.2 Agent-Specific Updates

| Agent | Updates Needed |
|-------|----------------|
| **Victoria** | GHL write + browser; Slack channel participation; funnel workflow |
| **Henry** | Confirm escalation paths, when to hand off to Victoria |
| **Rex** | Sales focus; funnel status from Victoria when relevant |
| **Sebastian** | Health only; no client/ops overlap |
| **Marcus** | Social only; no GHL/client success |

### 5.3 OpenClaw Config Tweaks

- Add Slack channel IDs for `#client-success` to Victoria's allowlist (if using allowlist)
- Victoria's Slack: `requireMention: true` stays – team @Victoria for requests
- Ensure `groupPolicy: "open"` so Victoria can be in `#client-success`

---

## Implementation Order

### Week 1: Foundation

1. Run security audit, fix critical items
2. Update Victoria AGENTS.md – GHL write + funnel workflow
3. Create `#client-success` in Slack, add Victoria
4. Document funnel build flow in team-agent/references/

### Week 2: Client Success Live

1. First real funnel build via Victoria in #client-success
2. Refine prompts, add confirmation gates
3. Connect ESA Studio usage (when to use which)
4. Update Victoria's INTEGRATION_SETUP_GUIDE if needed

### Week 3: Communication + Voice

1. Add shared communication rules to all agent AGENTS.md files
2. Set up voice agent identity sync (shared docs)
3. Document voice → OpenClaw bridge options for Phase 2

### Week 4: Hardening + Review

1. Complete security checklist
2. Run full BUILD_STANDARDS.md protocol
3. Update MEMORY.md with new workflows
4. Performance review – what worked, what to tune

---

## Files to Create/Update

| File | Action |
|------|--------|
| `team-agent/AGENTS.md` | Add GHL write, funnel workflow, #client-success |
| `team-agent/references/funnel-build-workflow.md` | New – step-by-step |
| `team-agent/references/esa-studio-vs-victoria.md` | New – when to use which |
| `AGENTS.md` (root) | Add shared communication rules ref |
| `memory/2026-03-14.md` | Log this plan |
| `OPENCLAW_VOICE_BRIDGE.md` | New – when voice folder known |

---

## Open Questions for Brian

1. **Voice agent path:** What's the exact folder path? (Different Cursor window = likely outside workspace)
2. **#client-success exists?** Or create new? Who should be in it?
3. **ESA Studio access:** Does Kim, Shah, Hamza, James have logins? Or is it Brian/Denise only?
4. **Template deploy confirmation:** Should Victoria ask "Confirm sub-account X for Client Y?" before every deploy, or is that overkill?
