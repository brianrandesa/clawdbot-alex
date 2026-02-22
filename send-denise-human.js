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

const mailOptions = {
  from: '"Alex" <alexeventsales@gmail.com>',
  to: 'denise@eventsalesagency.com',
  subject: 'Quick question about your next event',
  text: `Hey Denise,

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

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('✅ Email sent to Denise:', info.response);
  }
});
