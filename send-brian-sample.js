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
  to: 'brian@eventsalesagency.com',
  subject: 'Quick question about your next event',
  text: `Hey Brian,

I saw you're hosting events. Nice.

Quick question: do you have a system that actually fills seats, or are you running ads and hoping for the best?

We built a done-for-you event sales system that's filled 250+ events and sold 65,000+ tickets. One client sold 3,000 tickets in 3 weeks. Another sold 600 tickets using AI with zero human sales reps.

We install your CRM, build your funnels, launch your ads, and train your team all in a 7-week sprint. Not a course. A fully built machine.

Worth a 15-minute call to see if it fits?

https://calendly.com/alexeventsales/30min

Brian Rand
Founder, Event Sales Agency
eventsalesagency.com`
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('✅ Sample email sent to Brian:', info.response);
  }
});
