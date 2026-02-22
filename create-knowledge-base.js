require('dotenv').config();
const axios = require('axios');

const CLICKUP_API = 'https://api.clickup.com/api/v2';
const API_TOKEN = process.env.CLICKUP_API_TOKEN;
const HENRY_SPACE_ID = '90174188953';

const headers = {
  'Authorization': API_TOKEN,
  'Content-Type': 'application/json'
};

async function createKnowledgeBase() {
  try {
    // Create Knowledge Base list
    console.log('Creating Knowledge Base list...\n');
    
    const listResponse = await axios.post(
      `${CLICKUP_API}/space/${HENRY_SPACE_ID}/list`,
      {
        name: '📚 Henry Knowledge Base',
        content: 'All software, tools, APIs, and systems Henry uses'
      },
      { headers }
    );
    
    const listId = listResponse.data.id;
    console.log(`✅ Created list: ${listId}\n`);
    
    // Add tasks for each software/tool
    const tools = [
      {
        name: '🤖 OpenClaw (Core System)',
        description: `**What it is:** AI assistant framework - this is me, Henry

**What it does:**
- Runs on Brian's Mac
- Processes commands via Telegram
- Executes Node.js scripts
- Manages automations

**Key features:**
- Browser control (can control Chrome tabs)
- File system access (read/write/edit files)
- Command execution (run shell commands)
- Memory system (workspace files for context)
- Multi-session support

**Location:** /opt/homebrew/lib/node_modules/openclaw
**Config:** ~/.openclaw/openclaw.json
**Workspace:** ~/.openclaw/workspace

**Security:** Runs locally, no cloud access required`,
        tags: ['Core', 'System']
      },
      {
        name: '📧 Gmail (henrythesalesguy@gmail.com)',
        description: `**What it is:** Email account for Henry's outbound campaigns

**Access:**
- Email: henrythesalesguy@gmail.com
- Password: Harrythesalesguy1234
- App Password: chmhamwlufyjgtly (for SMTP)

**What we use it for:**
- Send cold emails
- Receive replies
- Track conversations

**Security:**
- 2-step verification enabled
- App password (revokable)
- Can disable IMAP/SMTP anytime

**SMTP Config:**
- Host: smtp.gmail.com
- Port: 587
- TLS: enabled

**Next:** Migrating to henry@eventsalesagency.com`,
        tags: ['Email', 'Infrastructure']
      },
      {
        name: '📊 Google Sheets API',
        description: `**What it is:** Automated logging system for email campaigns

**Tracking Sheet:**
https://docs.google.com/spreadsheets/d/1ll-ouNpaAzJzOun8ZniA1quYbmrRnjkxltb8lEsW5Sw/edit

**What it tracks:**
- Date sent
- Prospect name
- Event name
- Email address
- Status (Sent/Opened/Replied/Booked)
- Last contact
- Next action
- Notes

**Access:**
- Service account: henry-sheets-access@henry-sales-automation.iam.gserviceaccount.com
- Auth: JSON key file (henry-sheets-service-account.json)
- Permissions: Editor on the tracking sheet

**Google Cloud Project:**
- Name: Henry Sales Automation
- ID: henry-sales-automation
- Project #: 100636368312

**Security:** Service account has access ONLY to the tracking sheet, nothing else`,
        tags: ['Tracking', 'Data', 'API']
      },
      {
        name: '✅ ClickUp API',
        description: `**What it is:** Project management & task tracking

**Workspace:** Henry + Brian (ID: 9017909997)

**Lists:**
- 🤖 Henry Projects (automation tasks)
- 🏠 Personal Automation (Brian's routines)
- 💡 Backlog / Ideas (future projects)
- ❓ Questions Log (every question Brian asks)
- 📚 Knowledge Base (this list)

**Access:**
- API Token: pk_26239420_1LNZDDB9KAHJOUKJDEE3RBQPNQQBY0QA
- Permissions: Full access to Henry + Brian workspace

**What it does:**
- Auto-create tasks when Brian assigns work
- Update task status as work progresses
- Mark complete when done
- Track all questions & answers

**View workspace:**
https://app.clickup.com/9017909997/v/li/90174188953`,
        tags: ['Project Management', 'Tracking']
      },
      {
        name: '🔍 Brave Search API',
        description: `**What it is:** Web search for research & prospect finding

**Access:**
- API Key: BSAWQ3nc7E07-zuO2g_E8gCbzC22XeO
- Permissions: Read-only

**What we use it for:**
- Find event organizers
- Research prospects
- Build contact lists
- Verify information

**Limits:**
- Free tier: 2,000 queries/month
- Rate limit: Reasonable use

**Security:** Read-only API, no write access, can't modify anything`,
        tags: ['Research', 'API']
      },
      {
        name: '📅 Calendly',
        description: `**What it is:** Booking system for sales calls

**Link:** https://calendly.com/henrythesalesguy/30min

**What it does:**
- Prospects book 15-minute calls
- Integrates with calendar
- Auto-sends reminders

**Used in:**
- All email templates
- Follow-up sequences
- Cold outreach

**Next:** May switch to calendly.com/brian-eventsales or similar`,
        tags: ['Booking', 'Sales']
      },
      {
        name: '💻 Node.js Scripts',
        description: `**What they are:** Automation scripts Henry runs

**Location:** ~/.openclaw/workspace/

**Key scripts:**
- henry-send-email.js (send individual emails)
- henry-inbox-monitor.js (check for replies)
- henry-approve-replies.js (approve drafted responses)
- log-to-sheet.js (log to Google Sheets)
- clickup-manager.js (manage ClickUp tasks)
- send-test-email.js (testing)

**Dependencies:**
- nodemailer (email sending)
- googleapis (Sheets API)
- axios (API calls)
- imap (inbox monitoring)
- mailparser (email parsing)

**All installed via npm in workspace directory**`,
        tags: ['Code', 'Automation']
      },
      {
        name: '📝 Email Templates',
        description: `**Where stored:** HENRY_EMAIL_TEMPLATES.md

**Templates:**
1. Main Outreach (The System Question)
2. Pattern Interrupt (The Broken System)
3. Social Proof Heavy
4. Short & Direct

**Follow-up sequence:**
- Day 3: Check-in
- Day 7: Last touch
- Day 14: Breakup email

**Key rules:**
- NO em dashes (—) - they look like AI
- Short sentences
- Natural, human voice
- Brian's actual writing style

**Social proof:**
- 250+ events filled
- 65,000+ tickets sold
- $65M+ revenue generated
- Case studies: Deontay Wilder, Boston faith conference, Colorado Spartans`,
        tags: ['Content', 'Email']
      },
      {
        name: '🧠 Memory & Context Files',
        description: `**What they are:** Files that give Henry context about Brian and ESA

**Core files:**
- AGENTS.md (how Henry operates)
- SOUL.md (Henry's personality)
- USER.md (about Brian)
- TOOLS.md (local tool notes)
- PROJECTS.md (master project tracker)

**Memory system:**
- memory/YYYY-MM-DD.md (daily logs)
- MEMORY.md (long-term curated memory)

**Config files:**
- HENRY_SALES_CONFIG.md (campaign settings)
- HENRY_EMAIL_TEMPLATES.md (all templates)
- HENRY_GMAIL_SMTP.md (email setup)

**Security docs:**
- SECURITY_BEST_PRACTICES.md (this is new)

**All stored in:** ~/.openclaw/workspace/`,
        tags: ['System', 'Documentation']
      },
      {
        name: '🎯 Target Audience & ICP',
        description: `**Ideal prospects:**

**Include:**
- Business coaches
- Consultants
- Professional speakers
- Course creators
- High-ticket backend offers ($5K+)
- Use events as sales channel

**Exclude:**
- DJs
- Wedding planners
- Party planners
- Music festivals
- Nightclub promoters
- Photographers
- Caterers

**Event types we target:**
- Business conferences
- Mastermind events
- Training seminars
- Virtual summits
- Live workshops
- High-ticket launches

**Qualification criteria:**
- 500-5K attendees per event
- Recurring events (not one-offs)
- Selling products/services at event
- Revenue potential $100K+`,
        tags: ['Strategy', 'Sales']
      },
      {
        name: '📊 Campaign Strategy',
        description: `**Current approach:**

**Volume:**
- Start: 10-20 emails/day
- Scale: 30-50/day (if >5% response rate)
- Conservative to avoid spam flags

**Sequence:**
- Day 1: Initial outreach
- Day 3: Follow-up #1
- Day 7: Follow-up #2
- Day 14: Breakup email

**Success metrics:**
- Open rate: Track if possible
- Reply rate: >5% target
- Booked calls: Track in Sheets
- Closed deals: Ultimate goal

**A/B testing:**
- Week 1: Template #1 only
- Week 2: Add Template #2 & #3
- Week 3: Optimize based on results

**Tracking:**
- Google Sheets (automated)
- ClickUp (task updates)
- Daily review of results`,
        tags: ['Strategy', 'Marketing']
      }
    ];
    
    console.log('Adding knowledge base entries...\n');
    
    for (const tool of tools) {
      await axios.post(
        `${CLICKUP_API}/list/${listId}/task`,
        {
          name: tool.name,
          description: tool.description,
          priority: 3,
          tags: tool.tags
        },
        { headers }
      );
      console.log(`✅ Added: ${tool.name}`);
    }
    
    console.log(`\n✅ Knowledge Base complete!`);
    console.log(`🔗 View: https://app.clickup.com/9017909997/v/li/${listId}`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createKnowledgeBase();
