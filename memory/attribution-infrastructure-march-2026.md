# ESA Attribution & Infrastructure - Current Setup (March 2026)

## **Two-Funnel System Currently Running**

### **ESA Fresh (New)**
- **URL:** eventsalesagency.com (Vercel, GitHub repo)
- **Pixel:** Fresh pixel (new, learning phase) 
- **Tracking:** Stape CAPI + Google Analytics + Google Ads tracking
- **Flow:** 3-question form → GHL contact → 'fresh new lead' tag → **Qualification Quiz** → Calendar
- **Status:** LIVE

### **EASSESL (Legacy)**  
- **URL:** eventscalingsystem.com
- **Pixel:** Old pixel (contaminated but has winning campaign data)
- **Campaigns:** Malachi's proven winners ($60K+ attributed revenue) - **CURRENTLY OFF**
- **Status:** NEEDS REACTIVATION with proper tagging

## **Critical Infrastructure Issues**

### **1. Stape CAPI Migration Needed**
- **Problem:** Stape CAPI tracking currently in OLD GHL
- **Action:** Must migrate to NEW GHL sub-account
- **Priority:** HIGH - affects all server-side tracking

### **2. Calendar Consolidation** 
- **Current:** Multiple calendars per traffic source
- **Problem:** Uneven distribution, reporting complexity
- **Solution:** ONE round-robin calendar (Nick/Chris) with UTM attribution instead

### **3. Qualification Quiz System** ✅
- **Who goes through quiz:** FB Lead Form + ESA Fresh site leads
- **Who skips quiz:** Setter/cold outreach (already human-qualified)
- **Scoring:** Qualified → 'quiz-qualified' tag → calendar access
- **Disqualified:** 'quiz-disqualified' tag → nurture sequence

## **Traffic Source Attribution System**

### **Paid Traffic:**
1. **FB Lead Form (Native)** 
   - No website visit, webhook to GHL with campaign metadata
   - UTM: `utm_medium=lead-form`
   - Tag: `source:fb-lead-form`

2. **Facebook Ads → ESA Fresh**
   - eventsalesagency.com with fresh pixel
   - UTM: `utm_source=facebook&utm_medium=paid`
   - Tag: `source:fb-new-pixel`

3. **Facebook Ads → EASSESL** ⚠️ CURRENTLY OFF
   - eventscalingsystem.com with old pixel
   - Contains winning campaigns that closed $60K+
   - Tag: `source:fb-old-pixel`

4. **Google Ads** - $25/day
   - eventsalesagency.com with conversion tracking
   - UTM: `utm_source=google&utm_medium=cpc`
   - Tag: `source:google-ads`

### **Organic Traffic:**
- **Instagram:** Link in bio → eventsalesagency.com
- **LinkedIn:** Organic posts/profile → eventsalesagency.com  
- **TikTok:** Bio link (TikTok pixel needs setup)
- **YouTube:** Description links → eventsalesagency.com
- **Google Search:** Organic SEO traffic
- **Direct/ChatGPT:** Dawn Dahlby ($15K), Michael Mellace ($15K) from AI search

### **Outbound:**
- **Diamond Davis (Setter):** Dedicated booking link with UTMs, skips quiz
- **Kimberly Ortega (Cold Outreach):** Researches events, direct booking, skips quiz

### **Referrals:** 
- **$172K revenue source** - NO referral program currently exists
- Manual tagging required, various entry points

## **Current Data Flow**

### **Path A: Site Traffic**
1. Traffic source → Landing page (ESA Fresh or EASSESL)
2. 3-question form with hidden UTM fields
3. Form submit → GHL contact creation with custom fields
4. Auto-tagging workflow based on UTM source
5. **Qualification Quiz** (new leads only)
6. Qualified → Calendar booking | Disqualified → Nurture

### **Path B: FB Lead Form** 
1. Native Facebook form (no site visit)
2. Webhook → GHL with campaign/adset/ad metadata
3. Contact creation with 'fb-lead-form' tag
4. **Qualification Quiz** routing
5. Qualified → Calendar | Disqualified → Nurture

### **Path C: Outbound/Cold** 
1. Diamond/Kimberly book directly via dedicated links
2. UTM pre-tagged for attribution
3. **Skips qualification quiz** (already human-qualified)
4. Direct to calendar

## **GHL Custom Fields Required**

### **Attribution Fields:**
- Lead Source (dropdown)
- UTM Source, Medium, Campaign, Content, Term
- FB Form ID (for native forms)
- How Did You Hear About Us

### **Qualification Fields:**
- Lead Score (calculated from quiz)
- Quiz Status (Pending/Qualified/Disqualified/Skipped)

### **Assignment Fields:**
- Setter Name (Diamond Davis, Kimberly Ortega)
- Closer Assigned (Nick Granberry, Chris Granberry, Brian Rand)

## **Pipeline Stages (ESA FRESH)**
1. **New Lead** - Contact created with source attribution
2. **Quiz Pending** - Routed to qualification quiz
3. **Quiz Qualified** - Passed threshold, shown calendar
4. **Quiz Disqualified** - Failed threshold, nurture sequence
5. **Call Booked** - On round-robin calendar
6. **Call Completed** - Post-call disposition
7. **Follow-Up** - Automated sequences for "Not Now"
8. **Proposal Sent** - Payment link sent
9. **Closed Won** - Revenue attributed to source
10. **Closed Lost** - Lost reason captured

## **Immediate Action Items**

### **HIGH Priority:**
1. **Move Stape CAPI** from OLD GHL to NEW GHL
2. **Turn on EASSESL winning campaigns** with proper tagging
3. **Consolidate calendars** to single round-robin
4. **Upload 1,000-person lookalike list** to Meta
5. **Verify quiz routing** for both FB Lead Form and site leads

### **MEDIUM Priority:**
1. Set up Google Analytics connection to GHL
2. Connect Google Ads to GHL for automated attribution
3. Build exclusion audiences (DJs, wedding planners, etc.)
4. Set up UTM'd links for all organic social channels

### **Technical Implementation:**

**FB Lead Form Webhook Setup:**
```javascript
// Webhook payload mapping to GHL custom fields:
customField: {
  lead_source: 'FB Lead Form',
  utm_source: 'facebook',
  utm_medium: 'lead-form',
  utm_campaign: webhook.campaign_name,
  utm_content: webhook.ad_name,
  utm_term: webhook.adset_name,
  fb_form_id: webhook.form_id,
  quiz_status: 'Pending'
}
// → Tag: 'fb-lead-form', 'fresh new lead'
// → Route to: Qualification Quiz
```

**Auto-Tagging Workflow Logic:**
- UTM Medium = 'lead-form' → Tag 'source:fb-lead-form'
- UTM Source = 'facebook' + Medium = 'paid' → Tag 'source:fb-new-pixel'  
- UTM Source = 'google' + Medium = 'cpc' → Tag 'source:google-ads'
- UTM Source = 'outbound' → Tag 'source:setter-outbound', Quiz Status = 'Skipped'

## **Revenue Attribution Goals**
- Track every lead from source → campaign → ad → revenue
- Identify winning campaigns (already know "Image #2" + "Top Lookalikes" works)
- Separate fresh pixel learning from proven winners
- Enable data-driven budget allocation decisions
- Measure qualification quiz impact on close rates

## **Team Responsibilities**
- **Shah Khan:** GHL setup, webhook configuration, pipeline build
- **Muhammad/Sohaib:** Campaign execution with proper UTM tagging
- **Diamond Davis:** Setter outbound with pre-tagged booking links
- **Kimberly Ortega:** Cold outreach with attribution tracking
- **Brian:** Strategic decisions on campaign reactivation and budget allocation

This system enables full attribution from first touch → close while maintaining the qualification quiz as a gatekeeper for lead quality.