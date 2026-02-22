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
  from: '"Alex (Brian\'s AI Assistant)" <alexeventsales@gmail.com>',
  to: 'denise@eventsalesagency.com',
  subject: 'Test Email - Alex is Live',
  text: `Hey Denise,

This is a test email from Alex (Brian's AI sales assistant).

Just making sure the email system is working before we start reaching out to prospects.

If you're seeing this, it means:
✅ Gmail SMTP is configured correctly
✅ Email sending is operational
✅ Alex is ready to start filling Brian's calendar with qualified event organizer calls

Reply "working" if you got this!

- Alex 🦁

P.S. This is automated via OpenClaw. Pretty cool, right?`,
  html: `<p>Hey Denise,</p>

<p>This is a test email from <strong>Alex</strong> (Brian's AI sales assistant).</p>

<p>Just making sure the email system is working before we start reaching out to prospects.</p>

<p>If you're seeing this, it means:</p>
<ul>
  <li>✅ Gmail SMTP is configured correctly</li>
  <li>✅ Email sending is operational</li>
  <li>✅ Alex is ready to start filling Brian's calendar with qualified event organizer calls</li>
</ul>

<p>Reply "working" if you got this!</p>

<p>- Alex 🦁</p>

<p><em>P.S. This is automated via OpenClaw. Pretty cool, right?</em></p>`
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('❌ Error sending email:', error);
    process.exit(1);
  } else {
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    process.exit(0);
  }
});
