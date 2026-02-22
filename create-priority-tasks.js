require('dotenv').config();
const { createTask } = require('./clickup-manager');

async function createPriorityTasks() {
  // Task 1: Personal Life Automation
  await createTask({
    name: '🏠 Personal Life Automation - Setup & Reminders',
    description: `**Goal:** Get Brian's personal life organized and automated with Henry's help

**Areas to Set Up:**
- [ ] Daily routines & reminders (workout, peptides, therapy, etc.)
- [ ] Calendar management & event reminders
- [ ] Important dates & follow-ups
- [ ] Health tracking & reminders
- [ ] Shopping lists & errands
- [ ] Personal finance reminders (bills, etc.)
- [ ] Relationship management (Malachi moving out timeline, dating goals)

**Next Steps:**
1. Audit current routines & pain points
2. Set up recurring reminders via OpenClaw cron
3. Build personal dashboard/tracking system
4. Test & refine based on what actually helps

**Priority:** High - This is foundation for everything else`,
    status: 'to do',
    priority: 2, // high
    tags: ['Personal', 'Automation', 'Henry']
  });

  // Task 2: Complete Henry Outreach Machine
  await createTask({
    name: '🤖 Henry Outreach Machine - Complete Build',
    description: `**Goal:** Make Henry a fully automated outreach system for ESA cold email

**Remaining Tasks:**
- [ ] Build bulk prospect sender (10-50 emails/day with delays)
- [ ] Create prospect CSV template
- [ ] Build first 50-prospect list (business coaches/consultants with events)
- [ ] Send first 10 test emails
- [ ] Monitor metrics in Google Sheet (opens, replies, bookings)
- [ ] Scale to 30-50/day based on results
- [ ] Add follow-up automation (3-touch sequence)

**Status:** 90% complete - API working, ready for bulk sending

**Resources:**
- Tracking: https://docs.google.com/spreadsheets/d/1ll-ouNpaAzJzOun8ZniA1quYbmrRnjkxltb8lEsW5Sw/edit
- Email: henrythesalesguy@gmail.com

**Priority:** High - Revenue generation`,
    status: 'to do',
    priority: 2, // high
    tags: ['Henry', 'Email Automation', 'ESA', 'Revenue']
  });

  console.log('✅ Priority tasks created!');
}

createPriorityTasks();
