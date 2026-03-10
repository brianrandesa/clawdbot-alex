# ESA Technical Infrastructure & Attribution System - March 2026

## System Architecture Overview

### **Primary Infrastructure:**
- **New Funnel (ESA Fresh):** Built by CloudCode → GitHub repo → deployed on Vercel
- **Legacy Funnel (EASSESL):** eventscalingsystem.com — old pixel, legacy campaigns (inactive)
- **CRM:** GoHighLevel (NEW sub-account) — all operations centralized here
- **Tech Stack:** Vercel + GitHub + GHL + Stape CAPI + Google Analytics + Google Ads tracking

### **Lead Capture System:**

#### **Path 1: Website Traffic (eventsalesagency.com)**
- 3-question form on Vercel site
- Hidden UTM fields capture source attribution
- API sends data to GHL → creates contact
- Tagged 'fresh new lead' 
- **Routes to qualification quiz** (NEW REQUIREMENT)

#### **Path 2: Facebook Lead Form (Native)**
- Lead fills form without leaving Facebook
- No website visit = no pixel fire
- Webhook sends data to GHL with campaign/adset/ad metadata
- Creates contact with 'fb-lead-form' tag
- **Routes to qualification quiz** (NEW REQUIREMENT)

### **Qualification Quiz System (NEW)**
**Purpose:** Gate calendar access - only qualified leads can book calls

**Who Goes Through Quiz:**
- All FB Lead Form leads
- All ESA Fresh website leads

**Who SKIPS Quiz:**
- Setter outbound (Diamond Davis) - human qualified
- Cold outreach (Kimberly Ortega) - human qualified

**Quiz Logic:**
- **Score ≥ threshold:** Tagged 'quiz-qualified' → shown calendar
- **Score < threshold:** Tagged 'quiz-disqualified' → nurture sequence
- **Attribution preserved:** UTMs/FB metadata follow through entire flow

### **Calendar System (Being Rebuilt):**
- **Current:** Multiple calendars by traffic source
- **New:** Single round-robin for Nick & Chris
- **Attribution:** Via UTM parameters in GHL, not calendar selection

## Tracking & Attribution Infrastructure

### **Facebook Pixels:**
1. **Fresh Pixel:** eventsalesagency.com (new, learning phase)
2. **Old Pixel:** eventscalingsystem.com (contaminated but has $60K+ winning data)

### **Server-Side Tracking:**
- **Stape CAPI:** Currently in OLD GHL (needs migration to NEW GHL)
- **Google Analytics:** Live on eventsalesagency.com  
- **Google Ads Conversion:** Live on eventsalesagency.com

### **Tagging Convention:**
- **ESA Fresh:** All new traffic (eventsalesagency.com)
- **EASSESL:** All legacy traffic (eventscalingsystem.com)
- **Auto-Tags:** Applied based on UTM source/medium in GHL workflows

## Traffic Sources & Attribution

### **Active Sources:**
1. **Facebook Lead Form** (native) - No website visit, webhook attribution
2. **Facebook Ads** (fresh pixel) - eventsalesagency.com traffic  
3. **Google Ads** - $25/day spend
4. **Organic Social** - Instagram, LinkedIn, TikTok, YouTube
5. **Setter Outbound** - Diamond Davis calling lead lists
6. **Cold Outreach** - Kimberly Ortega researching events
7. **Referrals** - $172K revenue source, no systematic program
8. **Direct/ChatGPT** - AI search traffic

### **Inactive But Valuable:**
- **Old Pixel Campaigns** (EASSESL) - Malachi's $60K+ winners, currently OFF

## Critical Action Items

### **Immediate (This Week):**
1. **Move Stape CAPI** - From old GHL to new GHL sub-account
2. **Build exclusion audiences** - Stop DJs/wedding planners seeing ads
3. **Reactivate winning campaigns** - Turn on EASSESL winners with proper targeting

### **Short-Term:**
1. **Consolidate calendars** - Single round-robin implementation
2. **Upload 1,000-person lookalike** - Brian's Excel list to Meta
3. **Fix attribution flow** - Ensure UTMs preserved through quiz → booking

## Content Creation Opportunities

### **Behind-the-Scenes Technical Content:**
- "Building a qualification quiz that gates our sales calendar"
- "How we track attribution across 13 different traffic sources"  
- "Why we run two Facebook pixels simultaneously"
- "The day our campaigns started attracting DJs instead of coaches"
- "Moving from multiple calendars to one round-robin system"

### **Business Systems Content:**
- "The tech stack behind our $727K service business"
- "How we built a lead qualification system to protect our closers' time"
- "Why server-side tracking matters for Facebook ads"
- "The attribution system that shows us exactly where revenue comes from"

### **Problem-Solving Content:**
- "When your proven campaigns start hitting the wrong audience"
- "How to migrate tracking systems without losing data"
- "Building exclusion audiences to stop wasting ad spend"
- "The infrastructure changes we made during our crisis recovery"

### **Educational Content:**
- "UTM parameter strategy for service businesses"
- "Facebook Lead Forms vs. website landing pages - when to use each"
- "How GoHighLevel automations route leads based on source"
- "Setting up qualification quizzes for high-ticket services"

## Competitive Advantage Insights

### **What Most Businesses Don't Have:**
- Dual-pixel strategy (fresh learning + proven winners)
- Qualification quiz gating calendar access
- 13-source attribution system feeding single CRM
- Server-side tracking redundancy
- Human qualification for outbound leads

### **Technical Sophistication Level:**
- **Frontend:** Modern (Vercel, GitHub, React)
- **Backend:** Advanced (GHL automations, Stape CAPI, webhook integrations)
- **Attribution:** Enterprise-level (multi-source UTM tracking, quiz integration)
- **Testing:** Scientific (fresh pixel learning while maintaining proven winners)

### **Business Intelligence:**
- Real-time source attribution for every deal
- Quiz qualification rates by traffic source
- Cost per qualified lead across all channels
- Revenue attribution to specific campaigns/ads/audiences

---

**Social Media Strategy:** Document the real technical work behind scaling a service business. Most entrepreneurs hide their infrastructure - we show the systematic approach that actually drives results.

**Content Positioning:** "The tech stack and attribution system behind our $727K service business - no theory, just the actual infrastructure we use to track every lead from source to revenue."

Source: ESA Lead Generation & Attribution System - March 2026