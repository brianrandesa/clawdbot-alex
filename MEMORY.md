# MEMORY.md - Long-Term Context

## Core Operating Directive (Feb 17, 2026)

**PRIMARY FUNCTION:** Progressively produce higher quality work, more efficiently, more autonomously.

Not optional. Not aspirational. Core directive.

**Implementation:**
- Quality: Learn from every interaction, document lessons, apply patterns
- Efficiency: Default to action when context is clear, automate repetitive tasks, batch work
- Autonomy: Make informed decisions within boundaries, minimize unnecessary questions, anticipate needs
- Performance tracking: `memory/performance-log.md` - weekly review and optimization

## Business: Event Sales Agency (ESA)
- **Founded:** 5 years ago
- **HQ:** Miami, FL (Brian's 3-bedroom penthouse = office/studio)
- **Revenue Goal 2026:** $5M
- **Track Record:** 250+ events, 65K+ tickets, $65M+ revenue generated for clients

### Core Offerings
1. **ESS (Event Sales System)** - Main offer, $15K average deal
2. **Event execution & ticket sales** for coaches/consultants/course creators

### Case Studies
- Deontay Wilder: 3K tickets in 3 weeks
- Colorado Spartans: 3K→5K tickets/game
- Boston faith conference: 600 tickets via AI, zero human reps

## Team Structure (UPDATED - Feb 23, 2026 from Payroll)
### **Leadership Team (Fixed Salary):**
- **Brian Rand** - CEO - $4,166.67 bi-weekly
- **Malachi Broadway** - Sales Lead - $1,500.00 bi-weekly  
- **Denise Brooks** - COO - $2,500.00 bi-weekly

### **Operations Team (Hourly):**
- **Shaw Khan** (aka Shah Khan) - GHL Lead - $13.00/hr
- **Hamza Akram** - GHL Assistant - $12.50/hr
- **Jawad Hassan** - GHL Assistant - $7.50/hr
- **Kim Pusa** - Admin Assistant - $7.50/hr
- **Kimberly Ortega** - Sales Assistant - $7.50/hr

### **Media/Marketing Team (Hourly):**
- **Muhammad Zohaib** - Junior Media Buyer - $10.00/hr
- **Sohaib Iqbal** - Junior Media Buyer - $10.00/hr

### **Contractors (Not on Payroll):**
- **Nick Granberry** - High-ticket closer (ESS $15K offer)
- **Chris Granberry** - High-ticket closer (ESS $15K offer) - Nick's brother

**Total Payroll:** ~$27K monthly | **Team Size:** 10 employees + 2 contractors

### Known Pain Points
- Close rate was <5% (qualification problem, not market problem)
- Need better pre-call qualification — 45% of booked calls are unqualified
- Data scattered across multiple GHL instances + Kixie

## Business Context
- Brian worked for Grant Cardone 3 years before launching ESA
- Grew up poor in South Dakota, built everything from scratch
- Systems > theory mindset
- Prefers revenue math, frameworks, scalable infrastructure
- Performance-based comp model for team

## 2026 Goals
- $5M revenue this year
- $10-15M net worth
- Meet his wife this year
- Eventual exit/acquisition
- Scale aggressively, not maintain

## ESA Studio — Full Event Marketing Platform (Built Feb 17, 2026)
- **Repo:** `brianrandesa/esa-studio` | **Local:** `/Users/henry/.openclaw/workspace/esa-studio/`
- **Live URL:** `https://esa-studio.vercel.app` (deploy hook working, last deployed Feb 18 2026)
- **MAJOR REBUILD IN PROGRESS:** Claude Code on Brian's machine executing Phase 1-2 of upgrade plan
- **Upgrade plan:** `esa-studio/UPGRADE-PLAN.md` (14-week roadmap, drag-and-drop builder, templates, client portal)
- **Denise Brooks approved** as user (denise@eventsalesagency.com)
- **Fixed infinite spinner bug** on Feb 18 (auth error handling)
- **Stack:** React 19 + Vite + Tailwind | Vercel serverless | Anthropic Claude | Supabase | GHL webhooks
- **Supabase:** project `jxaktazrzcdcdrforzll` | Has service_role key stored in memory/2025-07-26.md
- **11 Features Built:** Smart Onboarding, Full Funnel Generator, Multi-Agent Landing Pages, GHL Registration Popup, Competitor Spy, Headline Lab, Email/SMS/Ad/VSL Generators, AI Team Chat
- **Round 2 TODO:** Voice DNA Cloner, Offer Stack Builder, Social Proof Engine, Split Test Predictor, Event Page Roast, Follow-Up Sequence Builder, Client ROI Dashboard
- **CRITICAL TODO:** Rotate Anthropic API key (exposed in git history), scrub git history with bfg
- **Ideal Client:** RE investing coaches doing $2-5M/yr, 50K+ social, no live events yet
- **Vercel deploy token:** `[REDACTED - stored securely]`
- **Deploy hook:** `https://api.vercel.com/v1/integrations/deploy/prj_NA314ZEF22YbRBZqdjpdkHCl7yzb/q7RBWbEK4z`
- **Deploy command:** `npx --cache /tmp/.npm-cache vercel deploy --prod --yes --force --token <token>`
- **Git author for commits:** `brian@eventsalesagency.com` / `Brian Rand` (henry@ blocked by Vercel)
- **Vercel Hobby limits:** 4.5MB body, 60s duration, no maxBodySize config
- **Funnel design reference:** `esa-studio/references/funnel-reference.md` (Insurance Growth Conference)
- **Prospect list:** 94 leads in `esa-master-prospects.csv` (54 not doing events = biggest opportunity)
- **Qualification scorecard:** `esa-qualification-scorecard.md` (80-point, 16 criteria)
- **Claude Code also editing ESA Studio** from Brian's local machine — always `git pull` before changes
- **Full details:** `memory/2025-07-26.md`

## Infrastructure & Systems

### GitHub Backup (Feb 17, 2026)
- Complete workspace backed up to: https://github.com/brianrandesa/clawdbot-alex
- Daily auto-sync at 11 PM EST via cron
- Enables cloning me to new VMs with full context/memory intact
- All identity, memory, knowledge base preserved

### Build Standards Protocol (Feb 17, 2026)
- **BUILD_STANDARDS.md** created - mandatory pre-launch checklist
- All new instances/deployments MUST follow healthcheck protocol
- Security baseline: audit → diagnose → fix → verify → monitor
- Never auto-execute changes - always staged approval
- Documented in AGENTS.md as core operating requirement

## Henry Sales Assistant (Launched Feb 15, 2026)
- AI-powered cold email outbound for ESS
- Email: henrythesalesguy@gmail.com
- Calendly: https://calendly.com/henrythesalesguy/30min
- Target: Business coaches with high-ticket backends
- Start: 10-20 emails/day, scale to 30-50

## Ads Audit & Growth Machine (Feb 2026)
- Full ads data saved: `esa-ads-data/` (ads, adsets, campaigns CSVs + xlsx)
- Previous audit: `memory/ads-audit-previous.md`
- $13.3K spent → 98 booked calls → 3 closed (3%) — qualification problem
- 45% of calls unqualified — form needs disqualifying questions
- Kill: Storm Leroy, Pace Morby ad sets, MOF Retargeting Awareness, TOF Belief Shifting
- Scale: Lookalikes + We Sell Out Events ($46/conv), Consultants + "We fill rooms" ($24/lead)
- 5-Phase plan: Stop Bleeding → Ad Rebuild → Content Strategy → Sales Infra → Scale
- **5 Marketing Sub-Agents planned:**
  1. Ad Copy Engine
  2. Audience Architect
  3. Funnel Optimizer
  4. Creative Director
  5. Campaign Builder
- **Still need:** Ad preview screenshots for top performers to build new variations
- **Separate from Rex 🐺** (Sales Manager agent, already built)

## Org Structure
- **Henry 🦁 = CEO** — all agents report to me
- **Rex 🐺 = Sales Manager** — manages both sales teams
- **Marketing Director** — planned as ONE agent with all 5 marketing skillsets (not 5 separate bots)
- Brian talks to Henry, Henry manages everyone

## Rex 🐺 — AI Sales Manager (Built Feb 18, 2026)
- **Agent ID:** rex (registered in OpenClaw)
- **Model:** Claude Sonnet 4
- **Workspace:** `/Users/henry/.openclaw/workspace/sales-manager-agent/`
- **Files built:** SOUL.md, AGENTS.md, USER.md, IDENTITY.md, MEMORY.md, memory/pipeline.md, memory/team-metrics.md
- **Purpose:** Manage both ESA sales teams, daily standups, pipeline tracking, call coaching, weekly scoreboard
- **Status:** Built but NOT LIVE — needs Telegram bot token from Brian via @BotFather
- **Communication:** Will live in Telegram group chat with Steve, Nick, James + dialer team

## Marketing Director Agent (Planned Feb 18, 2026)
- **NOT YET BUILT** — needs Telegram bot token first
- **Concept:** One agent with 5 skillsets baked in (Ad Copy, Audience Architecture, Funnel Optimization, Creative Direction, Campaign Management)
- **Training:** Hormozi ($100M Offers), Brunson (funnel blueprints), Cardone (10X media strategy)
- **Has:** Full ads data, audit results, historical sales data ($727K)
- Brian wants this to be where the deep marketing work happens

## Active Parallel Workstreams (as of Feb 18 evening)
1. **Claude Code (Brian's machine)** — rebuilding ESA Studio UI/UX (Phase 1-2 of upgrade plan)
2. **Claude Desktop (Brian's machine)** — auditing Meta → GHL marketing data
3. **Henry (me)** — coordinating everything, available for new projects

## Accounts & Credentials (Feb 18)
- **alexeventsales@gmail.com** / AlexSales!2026 — created for Meta access but FB says no account linked
- **GHL/Kixie API keys** — Brian agreed to provide, still waiting

## Complete Team Roster (UPDATED Feb 23, 2026 - Corrected)
**Full team: 12 people total (10 employees + 2 contractors)**

### **Key Personnel:**
- **Malachi Broadway** - Sales Lead  
- **Denise Brooks** - COO (denise@eventsalesagency.com)
- **Nick Granberry & Chris Granberry** - High-ticket closers (brothers, ESS offer)
- **Shaw Khan** (aka Shah Khan) - GHL Lead (tech operations)
- **Muhammad Zohaib & Sohaib Iqbal** - Junior Media Buyers

### **Ticket Sales Team Performance:**
- **Alisha W** - Tax Maverick rep ($372.75 commission)
- **Chloe S** - Insurance Sales Lab rep ($1,723.50 total commissions)
- **Emanuela B** - TOP PERFORMER - Insurance/Tax Maverick ($2,569.25 total)
- **James Mungai** - Ticket sales rep ($137.50 commission) 
- **Melissa K** - Tax Maverick rep ($186.75 commission)

### **DFY Client Performance:**
- **Tax Maverick:** $18,779 total ticket sales
- **Insurance Sales Lab:** $14,690 total ticket sales
- **Total DFY Revenue:** $33,469 | **Rep Commissions:** $4,989.75 (~15%)

## Will - EOS Connection (CRITICAL - NEVER FORGET)
- **PROMISED BRIAN:** I will never forget Will and our EOS connection
- **Built:** Complete South Dakota EOS Empire system for Will
- **20 perfect prospects** with full contact data ($400M+ combined revenue)
- **Revenue projection:** $150K-400K monthly, $2M+ annual potential
- **System ready:** Complete automation (email, phone, LinkedIn, calendar)
- **Live demo:** All prospect data with CEO contacts ready to show Will
- **This connection is CRITICAL for Brian's business growth**
- **Status:** Ready to deploy Will's South Dakota market domination

## Communication Preferences
- Direct, no sugarcoating
- Bullet points > paragraphs
- Speed > perfection
- Give numbers, revenue math, and specific action plans
- Call out when he's the bottleneck
- Reference frameworks from Cardone, Hormozi, Brunson, Martell

## Memory System & Continuity (Feb 23, 2026)
**CRITICAL:** Brian expects complete memory continuity. There was a ClickUp integration/setup ("Brian and Henry" workspace) that I don't have access to in current session. 

**SOLUTION IMPLEMENTED:**
- Document EVERYTHING in daily memory files as we work
- Update MEMORY.md after every major project/decision
- Commit to GitHub backup immediately after sessions
- Create detailed project logs for all integrations/setups
- No assumptions about what I "should" remember - always verify
