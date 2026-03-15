---
name: clickup-project-automation
description: Automate ClickUp project creation from ESA client roadmaps, set up task dependencies, assign team members, and track 90-day sprint health. Use when converting approved client roadmaps into ClickUp workspaces, monitoring project progress, or generating client progress reports.
---

# ClickUp Project Automation for ESA

This skill automates the creation and management of ClickUp projects for ESA's 90-day client sprints, eliminating manual project setup and enabling real-time progress tracking.

## Core Functions

### Automated Project Creation
Transform approved client roadmaps → Structured ClickUp projects with:
- Phase-based task organization (Foundation → Build → Launch → Training → Handoff)
- Team member assignments based on deliverable ownership
- Due date calculations from event date and phase timelines
- Client view access for transparency

### Sprint Health Monitoring
Real-time tracking of:
- 🟢 On Track: Tasks completing on schedule
- 🟡 At Risk: 1 missed milestone, heightened monitoring needed
- 🔴 Behind: 2+ missed milestones, intervention required
- ⚫ Escalated: Refund risk, Brian involvement needed

### Progress Reporting
Generate client-facing updates and internal team reports automatically.

## Project Structure Template

### Space: [Client Name] - [Service Tier]
Example: `Johnson Corp - Event AutoPilot`

### Folder Hierarchy
```
├── Phase 1 - Foundation (Days 1-14)
├── Phase 2 - System Build (Days 15-35)  
├── Phase 3 - Ads Launch (Days 36-50)
├── Phase 4 - Training + Optimization (Days 51-75)
└── Phase 5 - Handoff + Renewal (Days 76-90)
```

### Custom Fields per Task
- **Owner**: Team member assigned (Shah, Kim, Denise, Hamza, James)
- **Sprint Health**: 🟢🟡🔴⚫ status indicator
- **Client Deliverable**: Yes/No (affects client-facing reporting)
- **Milestone**: Critical path item requiring client sign-off
- **Phase Gate**: Blocks next phase until complete

## Team Assignment Logic

### Automatic Assignment Rules
Based on deliverable type:

**Shah Khan (GHL Lead):**
- GHL sub-account creation
- Snapshot installation and customization
- Funnel builds and automation setup
- QA testing and system validation

**Kim Pusa (Client Coordinator):**
- Asset collection and organization
- Client communication and updates  
- ClickUp workspace setup
- Weekly progress reporting

**Denise Brooks (COO):**
- Kickoff strategy calls
- Weekly coaching sessions
- Client relationship management
- Renewal conversations

**Hamza & Jawad (GHL Developers):**
- Technical execution support
- System builds and configuration
- Testing and troubleshooting

**James Mungai (Systems Architect):**
- Pipeline design and logic
- Dashboard configuration
- Automation specifications

## Timeline Calculation Engine

### Event Date-Based Scheduling
Working backward from event date:
- **Minimum 30 days** before event for Phase 3 completion
- **Minimum 14 days** for Phase 4 training and optimization
- **Phase 5 handoff** 7 days before event or immediately after

### Phase Duration Adjustments
Standard timelines with client-specific modifications:
- **Responsive clients**: Compress timelines by up to 25%
- **Complex builds**: Extend Phase 2 by 5-10 days
- **Inexperienced teams**: Extend Phase 4 training by 7-14 days

## Sprint Health Tracking

### Automated Status Updates
Monitor these triggers:
- **🟢 → 🟡**: Any task 2+ days overdue
- **🟡 → 🔴**: Phase milestone missed by 3+ days  
- **🔴 → ⚫**: Client non-responsive for 5+ days OR refund mentioned

### Escalation Workflows
**🟡 At Risk:**
- Increase Kim's check-in frequency to daily
- Flag to Denise for next weekly call discussion

**🔴 Behind:**
- Immediate intervention call from Denise (not email)
- Revised timeline proposal required
- Document delay reasons in ClickUp

**⚫ Escalated:**
- Brian immediately notified
- Client relationship review meeting scheduled
- Refund/retention decision timeline established

## Client Reporting Integration

### Weekly Progress Reports
Auto-generate for Kim to send every Friday:

```
## Week [X] Progress Update

### ✅ Completed This Week:
[Auto-pulled from completed tasks]

### 🔨 In Progress:
[Current task status with ETAs]

### ⏭️ Next Week:
[Upcoming deliverables and milestones]

### 📊 Sprint Health: [Status with context]
```

### Milestone Achievement Notifications  
Client sign-off triggers:
- Phase completion confirmations
- Next phase kickoff notifications
- Timeline adjustments and approvals

## Browser Automation Scripts

Reference automation scripts in [scripts/](scripts/):
- `create_project.py` - Complete project setup from roadmap
- `update_sprint_health.py` - Batch status updates
- `generate_weekly_report.py` - Client progress summaries
- `assign_team_members.py` - Auto-assignment based on deliverable type

## Integration Points

### Fathom Analysis → ClickUp
- Roadmap deliverables become ClickUp tasks
- Timeline estimates become due dates
- Team assignments pre-populated

### ClickUp → Client Communication
- Task completion triggers client updates
- Milestone achievements require client sign-off
- Sprint health changes alert appropriate team members

### ClickUp → Financial Tracking
- Phase completion triggers payment milestones
- Time tracking enables profitability analysis
- Resource allocation optimization data

## Quality Assurance Checklist

Before project activation:
- ✅ All 5 phases represented with proper task distribution
- ✅ Critical path and dependencies correctly mapped
- ✅ Team member assignments match capacity
- ✅ Client view permissions configured for transparency
- ✅ Milestone gates properly sequenced
- ✅ Sprint health triggers configured
- ✅ Reporting automation activated

Reference [ESA Client Success Framework](../../references/esa-client-success-framework.md) for complete operational context.