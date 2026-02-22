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
  'kim@eventsalesagency.com',
  'james@eventsalesagency.com'
];

const emailTemplate = {
  from: '"Alex" <alexeventsales@gmail.com>',
  subject: 'Quick question about your next event',
  text: `Hey,

Saw you're running events. Nice.

Quick question - you got a system that actually fills seats, or just running ads and hoping people show up?

We built a done-for-you event sales system. Filled 250+ events, sold 65,000+ tickets. One client sold 3,000 tickets in 3 weeks. Another sold 600 using AI with zero sales reps.

We install your CRM, build your funnels, launch your ads, train your team. 7 weeks. Not a course. A fully built machine.

Worth 15 minutes to see if it fits?

https://calendly.com/alexeventsales/30min

Brian Rand
Founder, Event Sales Agency
eventsalesagency.com`
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
  console.log('✅ All emails sent');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
