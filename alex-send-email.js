const nodemailer = require('nodemailer');
const { logEmail } = require('./log-to-sheet');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'alexeventsales@gmail.com',
    pass: 'blorhzmjqruscpof'
  }
});

async function sendColdEmail(prospect) {
  const { firstName, email, eventName, eventWebsite } = prospect;
  
  const subject = 'Quick question about your next event';
  const body = `Hey ${firstName},

I saw you're hosting ${eventName || 'events'}. Nice.

Quick question: do you have a system that actually fills seats, or are you running ads and hoping for the best?

We built a done-for-you event sales system that's filled 250+ events and sold 65,000+ tickets. One client sold 3,000 tickets in 3 weeks. Another sold 600 tickets using AI with zero human sales reps.

We install your CRM, build your funnels, launch your ads, and train your team all in a 7-week sprint. Not a course. A fully built machine.

Worth a 15-minute call to see if it fits?

https://calendly.com/alexeventsales/30min

Brian Rand
Founder, Event Sales Agency
eventsalesagency.com`;

  try {
    // Send email
    const info = await transporter.sendMail({
      from: '"Alex" <alexeventsales@gmail.com>',
      to: email,
      subject: subject,
      text: body
    });

    console.log('✅ Email sent to:', email);

    // Log to Google Sheets
    await logEmail({
      date: new Date().toISOString().split('T')[0],
      prospectName: `${firstName} (${prospect.lastName || ''})`.trim(),
      eventName: eventName || 'Unknown',
      eventWebsite: eventWebsite || '',
      email: email,
      status: 'Sent',
      lastContact: new Date().toISOString().split('T')[0],
      nextAction: 'Follow-up in 3 days',
      notes: `Initial outreach - Template #1`
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Log failure to sheet
    await logEmail({
      date: new Date().toISOString().split('T')[0],
      prospectName: `${firstName} (${prospect.lastName || ''})`.trim(),
      eventName: eventName || 'Unknown',
      eventWebsite: eventWebsite || '',
      email: email,
      status: 'Failed',
      lastContact: new Date().toISOString().split('T')[0],
      nextAction: 'Retry',
      notes: `Error: ${error.message}`
    });
    
    return { success: false, error: error.message };
  }
}

// Example usage
if (require.main === module) {
  const testProspect = {
    firstName: 'Brian',
    lastName: 'Test',
    email: 'james@eventsalesagency.com',
    eventName: 'Sales Summit 2024',
    eventWebsite: 'https://salessummit.com'
  };

  sendColdEmail(testProspect)
    .then(result => console.log('Result:', result))
    .catch(err => console.error('Failed:', err));
}

module.exports = { sendColdEmail };
