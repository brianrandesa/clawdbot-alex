# Funnel Build Workflow – Victoria + Client Success Team

**Purpose:** Enable team to request and deploy GHL funnels via Victoria in Slack. No Brian required for standard builds.

---

## Prerequisites

- Client roadmap approved in ClickUp
- GHL sub-account exists for client
- Victoria has access to GHL MCP (ports 3100, 3101)
- Mac Studio running (browser automation)

---

## Template Types

| Template | Use When | Stages | Workflows | Funnel Pages |
|----------|----------|--------|-----------|--------------|
| `general-business` | Conferences, summits, expos | 9 | 6 | 5 |
| `high-ticket-mastermind` | $5K-$50K+ tickets, application flow | 12 | 5 | 5 |
| `virtual-hybrid` | Virtual summits, webinars, hybrid | 10 | 5 | 8 |
| `multi-day-conference` | 2-5 day events, multiple tracks | 15 | 7 | 9 |

Reference: `skills/ghl-system-management/SKILL.md` for selection criteria.

---

## Request Flow (Slack)

### Team → Victoria

**Example 1 – Full deploy**
```
@Victoria deploy general-business template for Johnson Insurance Summit. 
Sub-account: [GHL location ID or client name]. 
Client approved roadmap in ClickUp yesterday.
```

**Example 2 – Template only**
```
@Victoria we need a high-ticket-mastermind system for Martinez Mastermind. 
Sub-account ID: abc123. Roadmap approved.
```

**Example 3 – Funnel + speed-to-lead**
```
@Victoria template deployed for Smith. Can you add funnel pages and speed-to-lead?
```

### Victoria's Response Flow

1. **Confirm** – "Deploying general-business for Johnson. Sub-account [X]. Proceeding."
2. **Execute** – POST /templates/deploy, then create-funnel, speed-to-lead, QA
3. **Report** – "Done. Funnel: [link]. QA passed. Shah, please do final walkthrough."

### Victoria's Confirmation Gate

Before any deploy:
- Check roadmap approval (ClickUp or ask requester)
- Confirm sub-account/location ID
- If unclear: "Which GHL sub-account? And is the roadmap approved in ClickUp?"

---

## Execution Steps (Victoria)

1. `POST http://100.82.186.108:3101/templates/deploy` with `{"type": "general-business", "dryRun": false}` (or appropriate type)
2. `POST .../browser/create-funnel` if not included in template
3. `POST .../browser/create-speed-to-lead` – 90 second trigger
4. `POST .../browser/qa-test-funnel` – validate
5. Post results to Slack, tag Shah for QA sign-off

---

## Escalation

| Situation | Action |
|-----------|--------|
| Mac Studio unreachable | "GHL browser server is down. Mac Studio may be asleep. Brian/Shah – please check." |
| Template deploy fails | Log error, alert in Slack. Shah to troubleshoot. |
| Client not in roadmap | "Roadmap must be approved first. Kim/Denise – can you confirm?" |
| Custom build beyond template | "This needs a custom build. Shah – can you take this one?" |

---

## Handoff to Shah

After Victoria deploys:
- Shah does final technical QA
- Shah runs client walkthrough (existing process)
- Victoria does NOT do client-facing demos

---

## ESA Studio vs Victoria

| Need | Use |
|------|-----|
| Standard pipeline + funnel (4 templates) | Victoria – deploy via Slack |
| Custom landing page, headline lab, creative | ESA Studio (https://esa-studio.vercel.app) |
| Funnel already in ESA Studio, need GHL deploy | Victoria can deploy template; custom pages may need manual GHL build |
| Quick funnel for testing | Victoria – general-business |

---

*Reference: ghl-crm-integration/SKILL.md, esa-client-success-framework.md*
