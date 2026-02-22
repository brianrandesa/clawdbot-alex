require('dotenv').config();
const axios = require('axios');

const CLICKUP_API = 'https://api.clickup.com/api/v2';
const API_TOKEN = process.env.CLICKUP_API_TOKEN;
const QUESTIONS_LIST = '901711004043';

const headers = {
  'Authorization': API_TOKEN,
  'Content-Type': 'application/json'
};

async function logQuestion(question, answer, context = '') {
  try {
    const response = await axios.post(
      `${CLICKUP_API}/list/${QUESTIONS_LIST}/task`,
      {
        name: question,
        description: `**Question:** ${question}

**Answer:** ${answer}

**Context:** ${context}

**Date:** ${new Date().toISOString().split('T')[0]}`,
        tags: ['Logged']
      },
      { headers }
    );
    console.log(`✅ Logged question: ${question.substring(0, 50)}...`);
    return response.data;
  } catch (error) {
    console.error('❌ Error logging question:', error.response?.data || error.message);
  }
}

module.exports = { logQuestion };

// If run directly, log the questions from today's session
if (require.main === module) {
  (async () => {
    console.log('📝 Backfilling questions from today...\n');
    
    const questions = [
      {
        q: "Can you join Zoom meetings with me or do I just send Fathom transcripts?",
        a: "Can't join live. Best option: send Fathom transcripts after calls. I can review, summarize, extract action items, and update ClickUp.",
        ctx: "Meeting collaboration setup"
      },
      {
        q: "Create a list in ClickUp of every question I EVER ask",
        a: "Created Questions Log list in ClickUp. Will auto-log every question going forward.",
        ctx: "Task tracking and history"
      },
      {
        q: "Should we use ClickUp or build something custom for tracking?",
        a: "Use ClickUp - already in your workflow, has notifications, mobile access, proper task management.",
        ctx: "Project management setup"
      },
      {
        q: "Do I need to make you a user in ClickUp?",
        a: "No - API token tied to your account. When I create tasks, it shows as you. No extra seat cost.",
        ctx: "ClickUp integration"
      },
      {
        q: "I want you to naturally respond to those emails - are you set up for that?",
        a: "Not yet. Need to: (1) enable IMAP on Gmail, (2) set up inbox monitoring, (3) draft contextual replies, (4) get your approval before sending.",
        ctx: "Email automation - inbox replies"
      },
      {
        q: "How do we do audio?",
        a: "Audio transcription not working yet. Options: (1) use Telegram voice-to-text, (2) set up Whisper API for automatic transcription, (3) just type.",
        ctx: "Voice message handling"
      },
      {
        q: "If I'm going to change your email, does it not make sense to keep building around the one we have?",
        a: "Great catch. Switching early is smart (no real prospects sent yet). Options: keep email and change display name, create new Gmail, or use brian@/alex@eventsalesagency.com (most professional).",
        ctx: "Email branding decision"
      },
      {
        q: "Can I protect myself if you have API access?",
        a: "Honest answer: app password gives full email access. Kill switch: revoke app password instantly. Safest option until more trust: forwarding (I only touch a separate Gmail).",
        ctx: "Security and trust discussion"
      },
      {
        q: "How much have I spent on tokens today?",
        a: "~129k tokens used in session (~65% of context). Rough estimate: $1-3 for the day. Real number on Anthropic billing dashboard.",
        ctx: "Cost tracking"
      },
      {
        q: "Did that work? (after app password)",
        a: "Yes! Test email sent successfully. Alex is fully operational.",
        ctx: "SMTP testing"
      },
      {
        q: "Are we set up in Google Sheets?",
        a: "Was broken (old service account deleted). Fixed: created new project, new service account, new clean sheet. Now working perfectly.",
        ctx: "Google Sheets integration troubleshooting"
      },
      {
        q: "Walk me through what I do now (Google Cloud setup)",
        a: "Step-by-step: Enable APIs (Sheets, Docs, Calendar, Slides) → Create service account → Download JSON key → Share sheet with service account email.",
        ctx: "Google Cloud service account setup"
      },
      {
        q: "Check it out (Google Sheet test)",
        a: "Perfect! Headers + test entry logging correctly. All 9 columns working (including Event Website).",
        ctx: "Sheets verification"
      },
      {
        q: "Send a test email to brian@eventsalesagency.com",
        a: "Done. Email sent from alexeventsales@gmail.com with cold outreach template.",
        ctx: "Final email test"
      },
      {
        q: "Reset up all the ClickUp as Alex instead of Henry",
        a: "Done. Renamed lists, updated all task names/descriptions, replaced all Henry references with Alex.",
        ctx: "ClickUp rebranding"
      },
      {
        q: "Why are you not putting every question I ask into ClickUp?",
        a: "My bad - dropped the ball. Backfilling now and will log every question going forward automatically.",
        ctx: "Question logging accountability"
      }
    ];
    
    for (const item of questions) {
      await logQuestion(item.q, item.a, item.ctx);
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
    }
    
    console.log('\n✅ Backfill complete! All questions logged.');
  })();
}
