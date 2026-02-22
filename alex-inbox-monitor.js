require('dotenv').config();
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');

const imap = new Imap({
  user: 'alexeventsales@gmail.com',
  password: 'blorhzmjqruscpof',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

const LAST_CHECK_FILE = './alex-last-check.json';

function getLastCheckTime() {
  try {
    if (fs.existsSync(LAST_CHECK_FILE)) {
      const data = JSON.parse(fs.readFileSync(LAST_CHECK_FILE, 'utf8'));
      return new Date(data.lastCheck);
    }
  } catch (err) {
    console.log('No previous check time found');
  }
  return new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: 24 hours ago
}

function saveLastCheckTime() {
  fs.writeFileSync(LAST_CHECK_FILE, JSON.stringify({ lastCheck: new Date().toISOString() }));
}

function draftReply(email) {
  const from = email.from?.text || 'Unknown';
  const subject = email.subject || 'No subject';
  const body = email.text || email.html || 'No content';
  
  // Simple reply draft based on common responses
  let reply = '';
  
  // Check for interest signals
  if (body.match(/interest|tell me more|learn more|info|curious/i)) {
    reply = `Hey,

Great to hear you're interested. 

Quick context: we've built this system for 250+ events. It's everything you need to fill seats. CRM, funnels, ads, automation, team training. 7 weeks from start to launch.

Most event hosts come to us doing one of two things:
1. Running ads with no follow-up system
2. Relying on their personal network (doesn't scale)

We fix both. Build the whole machine, train your team, hand you the keys.

What's your next event? I can walk you through exactly how we'd fill it.

Brian`;
  }
  // Check for questions about pricing
  else if (body.match(/cost|price|investment|how much/i)) {
    reply = `Hey,

Investment depends on event size and what you need built.

For context, most clients are running events with 500-5K attendees. We charge based on the revenue potential, not hours.

Typical range: $15K-$50K for the full buildout. Everything. CRM, funnels, ads, automation, training.

ROI is usually 5-10x within the first event.

Worth a quick call to see if it makes sense for your event?

https://calendly.com/alexeventsales/30min

Brian`;
  }
  // Check for timing/schedule questions
  else if (body.match(/when|timeline|schedule|availability|next week|next month/i)) {
    reply = `Hey,

We can usually kick off within a week once you're ready.

Full buildout is 7 weeks. That gets you:
- CRM installed and configured
- Sales funnels built
- Ad campaigns launched
- Team trained
- System live

If your event is more than 2 months out, we're good. Less than that, we can still make it work but it's tight.

When's your event?

Brian`;
  }
  // Check for objections/concerns
  else if (body.match(/not sure|concern|worried|hesitant|skeptical/i)) {
    reply = `Hey,

I get it. You've probably tried stuff that didn't work.

Here's the difference: we don't give you a course or advice. We build the whole thing. Your CRM. Your funnels. Your ads. Your automation. Then we train your team to run it.

You're not implementing. You're launching a machine we built for you.

250+ events. 65K+ tickets. $65M+ revenue generated for clients.

If you want references, I can connect you with clients who've done this. Happy to walk you through exactly how it works.

Worth a call?

https://calendly.com/alexeventsales/30min

Brian`;
  }
  // Default: general follow-up
  else {
    reply = `Hey,

Thanks for getting back to me.

Quick recap: we build done-for-you event sales systems. Everything from CRM to ads to team training. 7 weeks, fully installed.

We've done this for 250+ events. One client sold 3,000 tickets in 3 weeks. Another sold 600 using AI with zero human reps.

Happy to walk you through how it works and see if it fits your event.

15 minutes this week?

https://calendly.com/alexeventsales/30min

Brian Rand
Founder, Event Sales Agency
eventsalesagency.com`;
  }
  
  return reply;
}

function openInbox(cb) {
  imap.openBox('INBOX', false, cb);
}

function checkForNewEmails() {
  console.log('🔍 Checking Alex inbox for new replies...\n');
  
  imap.once('ready', function() {
    openInbox(function(err, box) {
      if (err) throw err;
      
      const lastCheck = getLastCheckTime();
      const searchCriteria = ['UNSEEN', ['SINCE', lastCheck]];
      
      imap.search(searchCriteria, function(err, results) {
        if (err) throw err;
        
        if (results.length === 0) {
          console.log('✅ No new emails');
          saveLastCheckTime();
          imap.end();
          return;
        }
        
        console.log(`📧 Found ${results.length} new email(s)\n`);
        
        const fetch = imap.fetch(results, { bodies: '', markSeen: false });
        
        fetch.on('message', function(msg, seqno) {
          msg.on('body', function(stream, info) {
            simpleParser(stream, async (err, parsed) => {
              if (err) {
                console.error('Error parsing email:', err);
                return;
              }
              
              console.log('---');
              console.log(`From: ${parsed.from?.text}`);
              console.log(`Subject: ${parsed.subject}`);
              console.log(`Date: ${parsed.date}`);
              console.log('\n📝 Drafted Reply:\n');
              
              const reply = draftReply(parsed);
              console.log(reply);
              console.log('\n---\n');
              
              // Save to file for approval
              const replyData = {
                timestamp: new Date().toISOString(),
                from: parsed.from?.text,
                subject: parsed.subject,
                originalBody: parsed.text,
                draftedReply: reply,
                approved: false
              };
              
              const repliesFile = './alex-pending-replies.json';
              let replies = [];
              if (fs.existsSync(repliesFile)) {
                replies = JSON.parse(fs.readFileSync(repliesFile, 'utf8'));
              }
              replies.push(replyData);
              fs.writeFileSync(repliesFile, JSON.stringify(replies, null, 2));
            });
          });
        });
        
        fetch.once('end', function() {
          console.log('✅ Check complete. Drafts saved to alex-pending-replies.json');
          saveLastCheckTime();
          imap.end();
        });
      });
    });
  });
  
  imap.once('error', function(err) {
    console.log('❌ IMAP Error:', err);
  });
  
  imap.once('end', function() {
    console.log('Connection ended');
  });
  
  imap.connect();
}

// Run check
checkForNewEmails();
