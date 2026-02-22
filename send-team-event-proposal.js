const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'alexeventsales@gmail.com',
    pass: 'blorhzmjqruscpof'
  }
});

const recipients = [
  'shah@eventsalesagency.com',
  'denise@eventsalesagency.com',
  'kim@eventsalesagency.com',
  'james@eventsalesagency.com'
];

const emailTemplate = {
  from: '"Brian Rand" <alexeventsales@gmail.com>',
  subject: 'New Event - Partnership Proposal',
  text: `Hey team,

I'm putting together a new event and want to bring you in on it.

Here's what I'm thinking:

We've helped 250+ clients fill their events. We've generated $65M+ in ticket sales. We know what works.

Now it's time we run one ourselves.

I want to partner with you on this. We split revenue, you bring your expertise, and we prove our system works at scale - not just for clients, but for us.

Details:
- Event format: [High-ticket workshop/conference for event organizers & coaches]
- Timeline: Q2 2026
- Revenue model: Profit share based on contribution
- Your role: Sales, marketing, or execution (depending on your strengths)

This isn't just another event. This is us proving we can do what we sell. And scaling together.

Worth a call this week to discuss?

Let me know.

Brian Rand
Founder, Event Sales Agency
eventsalesagency.com`,
  html: `<p>Hey team,</p>

<p>I'm putting together a new event and want to bring you in on it.</p>

<p>Here's what I'm thinking:</p>

<p>We've helped 250+ clients fill their events. We've generated $65M+ in ticket sales. We know what works.</p>

<p><strong>Now it's time we run one ourselves.</strong></p>

<p>I want to partner with you on this. We split revenue, you bring your expertise, and we prove our system works at scale - not just for clients, but for us.</p>

<p><strong>Details:</strong></p>
<ul>
  <li>Event format: High-ticket workshop/conference for event organizers & coaches</li>
  <li>Timeline: Q2 2026</li>
  <li>Revenue model: Profit share based on contribution</li>
  <li>Your role: Sales, marketing, or execution (depending on your strengths)</li>
</ul>

<p>This isn't just another event. This is us proving we can do what we sell. And scaling together.</p>

<p>Worth a call this week to discuss?</p>

<p>Let me know.</p>

<p><strong>Brian Rand</strong><br>
Founder, Event Sales Agency<br>
eventsalesagency.com</p>`
};

async function sendEmails() {
  for (const recipient of recipients) {
    const mailOptions = {
      ...emailTemplate,
      to: recipient
    };
    
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Sent to ${recipient}:`, info.messageId);
    } catch (error) {
      console.error(`❌ Failed to send to ${recipient}:`, error.message);
    }
  }
}

sendEmails().then(() => {
  console.log('✅ All proposal emails sent');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
