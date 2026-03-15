---
name: fathom-call-analysis
description: Analyze Fathom call transcripts from ESA kickoff strategy calls to extract client goals, event math, and custom requirements, then generate custom 90-day sprint roadmaps. Use when processing ESA client onboarding calls, converting Fathom transcripts into actionable project plans, or creating custom roadmaps from discovery call data.
---

# Fathom Call Analysis for ESA Client Onboarding

This skill processes Fathom call transcripts from ESA's 60-minute kickoff strategy calls and converts them into custom client roadmaps for ClickUp execution.

## Core Function

Transform raw Fathom transcripts → Custom 90-day sprint roadmaps ready for client sign-off and ClickUp implementation.

## Key Extraction Points

### Client Event Details
- Event name, date, location (virtual/in-person/hybrid)
- Ticket pricing structure and tiers (GA, VIP, etc.)
- Revenue goals and ticket quantity targets
- Target audience and existing audience size
- Team members who will use the system

### Event Math Model
- Total tickets needed × price per ticket = revenue goal
- Identify any gaps between current capacity and goals
- Timeline constraints based on event date
- Marketing budget and ad spend capacity

### Custom Requirements Analysis
- What deviates from standard ESA framework?
- Special integrations or platform requirements
- Unique automation needs or funnel modifications
- Client team skill level and training needs

### GHL Snapshot Selection
Based on call analysis, determine which snapshot to use:
- **V1**: General business event (workshop, summit)
- **V2**: High-ticket mastermind  
- **V3**: Virtual/hybrid event
- **V4**: Multi-day conference

## Roadmap Generation Process

### Phase Customization
Start with standard 5-phase structure, then customize:

1. **Foundation (Days 1-14)** - Adjust based on client responsiveness patterns
2. **System Build (Days 15-35)** - Customize based on GHL snapshot and special requirements
3. **Ads Launch (Days 36-50)** - Timeline based on event date and audience readiness
4. **Training + Optimization (Days 51-75)** - Scope based on team experience level
5. **Handoff + Renewal (Days 76-90)** - Custom success metrics and next event planning

### Deliverable Assignment
Map specific deliverables to team members:
- **Shah/Hamza**: GHL builds and technical execution
- **Kim**: Asset collection, client communication, ClickUp setup
- **Denise**: Strategy calls, client relationship management
- **James**: Automation logic and dashboard configuration

## Output Format

Generate roadmap using this structure:

```
# [Client Name] Custom 90-Day Sprint Roadmap

## Client Overview
- Event: [Name, Date, Location]
- Goals: [Revenue target, ticket quantity]
- Audience: [Size, type, existing platform]
- Team: [Key contacts, experience level]

## Event Math Model
- Tickets needed: [X]
- Price per ticket: $[X]
- Revenue goal: $[X]
- Marketing budget: $[X]
- Timeline: [X weeks to event]

## GHL System: [Snapshot version selected + rationale]

## Custom Elements
- [List deviations from standard framework]
- [Special requirements or integrations]
- [Team training needs]

## Phase-by-Phase Breakdown
[Detailed phase breakdown with custom deliverables and owners]

## Success Metrics
- [Custom KPIs based on client goals]
- [Milestone checkpoints for sign-off]
```

## Quality Checks

Before roadmap delivery:
- ✅ All custom requirements captured
- ✅ Event math validates against goals  
- ✅ Timeline realistic for event date
- ✅ Team assignments match capabilities
- ✅ Scope boundaries clearly defined
- ✅ Client-specific language used throughout

## Integration Points

This roadmap becomes:
1. **ClickUp master project** (Kim creates from this)
2. **Slack pinned message** (for client reference)
3. **Sprint execution guide** (team pulls tasks from this)
4. **Scope protection document** (client signs off on this)

Reference [ESA Client Success Framework](../references/esa-client-success-framework.md) for complete context on ESA's operational standards.