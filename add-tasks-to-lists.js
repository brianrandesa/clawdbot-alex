require('dotenv').config();
const axios = require('axios');

const CLICKUP_API = 'https://api.clickup.com/api/v2';
const API_TOKEN = process.env.CLICKUP_API_TOKEN;

const headers = {
  'Authorization': API_TOKEN,
  'Content-Type': 'application/json'
};

const HENRY_PROJECTS_LIST = '901711002045';
const PERSONAL_LIST = '901711002046';

async function createTask(listId, taskData) {
  try {
    const response = await axios.post(
      `${CLICKUP_API}/list/${listId}/task`,
      taskData,
      { headers }
    );
    console.log(`✅ Created: ${taskData.name}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error:`, error.response?.data || error.message);
    throw error;
  }
}

async function addTasks() {
  console.log('Adding tasks to Henry Projects...\n');
  
  // Henry Outreach task
  await createTask(HENRY_PROJECTS_LIST, {
    name: '🤖 Henry Outreach Machine - Finish & Launch',
    description: `**Goal:** Complete cold email automation system for ESA

**What's Done:**
✅ Email infrastructure (henrythesalesguy@gmail.com)
✅ SMTP working
✅ Google Sheets API (auto-logs every send)
✅ Test emails sent successfully

**What's Left:**
- Build bulk sender (10-50 emails/day with delays)
- Create prospect CSV template
- Build first 50-prospect list
- Send first 10 test emails
- Monitor & scale

**Resources:**
- Tracking: https://docs.google.com/spreadsheets/d/1ll-ouNpaAzJzOun8ZniA1quYbmrRnjkxltb8lEsW5Sw/edit
- Templates: HENRY_EMAIL_TEMPLATES.md`,
    priority: 2,
    tags: ['ESA', 'Revenue', 'Email']
  });

  console.log('\nAdding tasks to Personal Automation...\n');
  
  // Daily routines
  await createTask(PERSONAL_LIST, {
    name: '⏰ Daily Routine Reminders',
    description: `**Goal:** Automate morning/evening routines

**Setup:**
- Morning: Workout, peptides
- Therapy session reminders
- Evening wind-down

**Method:** OpenClaw cron jobs`,
    priority: 2,
    tags: ['Personal', 'Health']
  });

  // Calendar
  await createTask(PERSONAL_LIST, {
    name: '📅 Calendar Management',
    description: `**Goal:** Proactive calendar awareness

**Features:**
- 2-hour event reminders
- Daily morning summary
- Travel time alerts

**Integration:** Google Calendar API`,
    priority: 3,
    tags: ['Personal', 'Productivity']
  });

  // Life goals
  await createTask(PERSONAL_LIST, {
    name: '🎯 Life Goals Tracking',
    description: `**Key Goals:**
- Meet future wife (2026)
- Malachi moving out
- $5M revenue (ESA)
- $10-15M net worth
- Health optimization

**Method:** Weekly check-ins`,
    priority: 3,
    tags: ['Personal', 'Goals']
  });

  console.log('\n✅ All tasks added!');
}

addTasks();
