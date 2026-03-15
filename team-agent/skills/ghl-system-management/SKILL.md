---
name: ghl-system-management
description: Manage GoHighLevel systems for ESA clients including snapshot customization, automation builds, funnel optimization, and QA procedures. Use when supporting Shah with GHL builds, troubleshooting client system issues, or customizing snapshots for specific client requirements.
---

# GHL System Management for ESA

This skill supports comprehensive GoHighLevel system management for ESA's client implementations across all service tiers.

## GHL Snapshot Architecture

### 4 Core Snapshot Variations
**V1 - General Business Event**
- Workshop, summit, general business events
- Standard funnel flow: Landing → Registration → Thank You → Payment
- Basic automation: Speed-to-lead + 14-day nurture
- Simple pipeline: Lead → Qualified → Booked → Attended → Sold

**V2 - High-Ticket Mastermind** 
- Premium pricing ($2K+ tickets)
- Application-based registration with approval workflow
- VIP nurture sequences with personal touches
- Multi-stage qualification pipeline

**V3 - Virtual/Hybrid Event**
- Platform integration requirements (Zoom, Teams)
- Digital asset delivery automation
- Attendance tracking and replay access
- Technical support workflows

**V4 - Multi-Day Conference**
- Complex registration with multiple session choices
- Day-by-day communication sequences
- Sponsor/exhibitor management features
- Post-event survey and follow-up automation

## Standard GHL System Components

### Core Automations (Every Client)
1. **Speed-to-Lead SMS** (90-second trigger)
2. **14-day Email/SMS Nurture Sequence**
3. **Cold Lead Reactivation Campaign**
4. **Booking Confirmation + Reminder Series**
5. **Post-Event Follow-up Sequence**

### Pipeline Configuration
**Standard Pipeline Stages:**
- New Lead (automation trigger point)
- Contacted (first outreach completed)
- Qualified (budget/need/timeline confirmed)
- Booked (call/appointment scheduled)
- Attended (showed up to interaction)
- Ticket Sold (revenue generated)

### Dashboard Setup
**Ticket Sales Tracker Components:**
- Real-time lead count
- Cost per lead trending
- Conversion rates by source
- Revenue pipeline value
- Team activity metrics

## Customization Process

### Snapshot Selection Criteria
Based on client analysis from Fathom calls:

**Choose V1 (General) when:**
- Standard workshop/seminar format
- Single-day event under $1K tickets
- Straightforward registration process
- No special platform requirements

**Choose V2 (High-Ticket) when:**
- Tickets $2K+ with application process
- Mastermind or intensive format
- High-touch sales process required
- VIP/premium attendee experience

**Choose V3 (Virtual/Hybrid) when:**
- Online or mixed delivery format
- Platform integration essential
- Digital asset delivery required
- Technical support workflows needed

**Choose V4 (Conference) when:**
- Multi-day format with sessions
- Complex registration requirements
- Sponsor/exhibitor management
- Large-scale attendee coordination

### Custom Automation Builds
Standard automations + client-specific additions:

**Event-Specific Triggers:**
- Early bird pricing deadlines
- Venue capacity warnings
- Speaker announcement releases
- Sponsor recognition campaigns

**Audience-Specific Messaging:**
- Industry terminology and pain points
- Geographic/timezone considerations
- Experience level appropriate content
- Cultural sensitivity adjustments

## QA and Testing Procedures

### Pre-Launch Checklist
**System Functionality:**
- ✅ All automation triggers firing correctly
- ✅ Pipeline stages updating automatically
- ✅ SMS/email deliverability confirmed
- ✅ Payment processing integration working
- ✅ Dashboard data populating accurately

**Client Accessibility:**
- ✅ Login credentials provided and tested
- ✅ Permission levels set appropriately
- ✅ Mobile responsiveness verified
- ✅ Integration with existing tools confirmed

**Performance Optimization:**
- ✅ Page load speeds under 3 seconds
- ✅ Form submission success rate >98%
- ✅ Email/SMS delivery rates optimal
- ✅ Error logging and monitoring active

### Troubleshooting Common Issues

**Automation Failures:**
- Check trigger conditions and timing
- Verify contact data completeness
- Confirm integration API connections
- Review automation logic and conditions

**Pipeline Issues:**
- Validate contact source attribution
- Check stage progression rules
- Verify team member permissions
- Confirm reporting data accuracy

**Performance Problems:**
- Optimize image sizes and loading
- Review third-party script conflicts
- Check server response times
- Analyze traffic patterns and scaling

## Client Training and Handoff

### Shah's QA → Ops Manager Review Process
1. **Technical QA Complete** - Shah validates all functionality
2. **Documentation Package** - SOPs and training materials ready
3. **Client Walkthrough Scheduled** - Ops Manager leads demo call
4. **Client Confirmation** - Client understands and accepts system
5. **Phase 2 Milestone Achieved** - Next phase can begin

### Training Components
**Client Team Training:**
- GHL navigation and basic usage
- Lead management workflows
- Pipeline stage progression
- Report interpretation and action items

**Ongoing Support Protocol:**
- First 7 days: Daily monitoring for issues
- Week 2-4: Every other day check-ins
- Month 2+: Weekly system health reviews
- Emergency support: Slack response <4 hours

## Integration Management

### External Platform Connections
**Common Integrations:**
- Meta Ads for lead source tracking
- Stripe/payment processors for revenue attribution
- Kixie dialer for call activity logging
- Fathom for call recording integration
- Email platforms for list synchronization

### Data Flow Architecture
**Lead Journey Tracking:**
Ad Click → Landing Page → GHL Contact → Pipeline Stage → Revenue Attribution

**Reporting Integration:**
GHL Data → ClickUp Progress Updates → Client Weekly Reports

## Advanced Customizations

### Enterprise Client Features
For DFY Ticket Sales clients ($50K+):
- Advanced lead scoring algorithms
- Custom reporting dashboards
- Multi-team permission structures
- API integrations for complex workflows

### Scaling Optimizations
As client businesses grow:
- Automation complexity increases
- Pipeline stages become more granular
- Reporting requirements expand
- Integration needs multiply

Reference [ESA Client Success Framework](../../references/esa-client-success-framework.md) for operational context and [GHL Technical Documentation](references/ghl-technical-specs.md) for detailed implementation guidance.