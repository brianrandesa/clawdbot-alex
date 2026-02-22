require('dotenv').config();
const axios = require('axios');

const CLICKUP_API = 'https://api.clickup.com/api/v2';
const API_TOKEN = process.env.CLICKUP_API_TOKEN;
const HENRY_SPACE_ID = '90174188953'; // Henry To Do List space

const headers = {
  'Authorization': API_TOKEN,
  'Content-Type': 'application/json'
};

async function createList(spaceId, name, content) {
  try {
    const response = await axios.post(
      `${CLICKUP_API}/space/${spaceId}/list`,
      { name, content },
      { headers }
    );
    console.log(`✅ Created list: ${name} (ID: ${response.data.id})`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error creating list ${name}:`, error.response?.data || error.message);
    throw error;
  }
}

async function createTask(listId, taskData) {
  try {
    const response = await axios.post(
      `${CLICKUP_API}/list/${listId}/task`,
      taskData,
      { headers }
    );
    console.log(`  ✅ Created task: ${taskData.name}`);
    return response.data;
  } catch (error) {
    console.error(`  ❌ Error creating task:`, error.response?.data || error.message);
    throw error;
  }
}

async function createSubtask(parentTaskId, subtaskData) {
  try {
    const response = await axios.post(
      `${CLICKUP_API}/task/${parentTaskId}/subtask`,
      subtaskData,
      { headers }
    );
    console.log(`    ✅ Created subtask: ${subtaskData.name}`);
    return response.data;
  } catch (error) {
    console.error(`    ❌ Error creating subtask:`, error.response?.data || error.message);
    throw error;
  }
}

async function setupClickUp() {
  console.log('🚀 Building ClickUp structure...\n');

  // Create Lists
  console.log('📋 Creating Lists...');
  
  const henryProjectsList = await createList(
    HENRY_SPACE_ID,
    '🤖 Henry Projects',
    'ESA automation, outreach, business tools'
  );
  
  const personalList = await createList(
    HENRY_SPACE_ID,
    '🏠 Personal Automation',
    'Life organization, routines, health, reminders'
  );
  
  const backlogList = await createList(
    HENRY_SPACE_ID,
    '💡 Backlog / Ideas',
    'Future projects and ideas to explore'
  );

  console.log('\n✅ Lists created!\n');

  // Create Henry Projects tasks
  console.log('📝 Creating Henry Projects tasks...');
  
  const henryOutreachTask = await createTask(henryProjectsList.id, {
    name: '🤖 Henry Outreach Machine - Cold Email System',
    description: `**Goal:** Fully automated cold email outbound for Event Sales Agency

**Target:** Business coaches, consultants, speakers with events (exclude DJs, weddings, etc.)
**Volume:** Start 10-20 emails/day, scale to 30-50 based on results
**Tracking:** Automated logging to Google Sheets

**Resources:**
- Email: henrythesalesguy@gmail.com
- Tracking: https://docs.google.com/spreadsheets/d/1ll-ouNpaAzJzOun8ZniA1quYbmrRnjkxltb8lEsW5Sw/edit
- Templates: HENRY_EMAIL_TEMPLATES.md
- Scripts: henry-*.js

**Status:** 90% complete - API working, ready for bulk sending`,
    priority: 2,
    tags: ['ESA', 'Email Automation', 'Revenue']
  });

  // Add subtasks to Henry Outreach
  await createSubtask(henryOutreachTask.id, {
    name: 'Build bulk sender script (send to 10-50 prospects with delays)'
  });
  
  await createSubtask(henryOutreachTask.id, {
    name: 'Create prospect CSV template'
  });
  
  await createSubtask(henryOutreachTask.id, {
    name: 'Build first 50-prospect list (web search)'
  });
  
  await createSubtask(henryOutreachTask.id, {
    name: 'Send first 10 test emails'
  });
  
  await createSubtask(henryOutreachTask.id, {
    name: 'Monitor metrics (opens, replies, bookings)'
  });
  
  await createSubtask(henryOutreachTask.id, {
    name: 'Scale to 30-50/day if response rate >5%'
  });

  // Create Personal Automation tasks
  console.log('\n📝 Creating Personal Automation tasks...');
  
  const dailyRoutinesTask = await createTask(personalList.id, {
    name: '⏰ Daily Routines & Reminders',
    description: `**Goal:** Automate daily routine reminders and tracking

**Areas:**
- Morning routine (workout, peptides)
- Therapy sessions
- Evening wind-down
- Health tracking

**Method:** OpenClaw cron jobs + notifications`,
    priority: 2,
    tags: ['Personal', 'Health', 'Routine']
  });

  await createSubtask(dailyRoutinesTask.id, {
    name: 'Audit current daily routine & pain points'
  });
  
  await createSubtask(dailyRoutinesTask.id, {
    name: 'Set up morning routine reminders (workout, peptides)'
  });
  
  await createSubtask(dailyRoutinesTask.id, {
    name: 'Therapy session reminders'
  });

  const calendarTask = await createTask(personalList.id, {
    name: '📅 Calendar Management & Event Reminders',
    description: `**Goal:** Proactive calendar awareness and reminders

**Features:**
- 2-hour heads up before events
- Daily/weekly calendar summary
- Travel time calculations
- Meeting prep reminders

**Integration:** Google Calendar + OpenClaw heartbeat checks`,
    priority: 3,
    tags: ['Personal', 'Calendar', 'Productivity']
  });

  await createSubtask(calendarTask.id, {
    name: 'Connect Google Calendar API'
  });
  
  await createSubtask(calendarTask.id, {
    name: 'Build event reminder system (2hr before)'
  });
  
  await createSubtask(calendarTask.id, {
    name: 'Daily calendar summary (morning)'
  });

  const goalsTask = await createTask(personalList.id, {
    name: '🎯 Life Goals Tracking & Reminders',
    description: `**Goal:** Stay focused on big personal goals

**Key Goals:**
- Meet future wife (2026 priority)
- Malachi moving out (timeline TBD)
- $5M revenue target (ESA)
- $10-15M net worth
- Health optimization

**Method:** Weekly check-ins, milestone tracking, accountability`,
    priority: 3,
    tags: ['Personal', 'Goals', 'Life']
  });

  await createSubtask(goalsTask.id, {
    name: 'Weekly goal check-in automation'
  });
  
  await createSubtask(goalsTask.id, {
    name: 'Malachi move-out timeline tracker'
  });
  
  await createSubtask(goalsTask.id, {
    name: 'Dating/relationship goal reminders'
  });

  console.log('\n✅ ClickUp structure built!\n');
  console.log('🔗 View workspace: https://app.clickup.com/9017909997/v/li/90174188953');
}

setupClickUp();
