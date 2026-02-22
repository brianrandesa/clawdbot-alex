require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'alexeventsales@gmail.com',
    pass: 'blorhzmjqruscpof'
  }
});

const REPLIES_FILE = './alex-pending-replies.json';

function listPendingReplies() {
  if (!fs.existsSync(REPLIES_FILE)) {
    console.log('No pending replies');
    return [];
  }
  
  const replies = JSON.parse(fs.readFileSync(REPLIES_FILE, 'utf8'));
  const pending = replies.filter(r => !r.approved && !r.rejected);
  
  if (pending.length === 0) {
    console.log('No pending replies');
    return [];
  }
  
  console.log(`📬 ${pending.length} pending reply(ies):\n`);
  pending.forEach((reply, index) => {
    console.log(`[${index + 1}] From: ${reply.from}`);
    console.log(`    Subject: ${reply.subject}`);
    console.log(`    Time: ${reply.timestamp}\n`);
  });
  
  return pending;
}

function showReply(index) {
  const replies = JSON.parse(fs.readFileSync(REPLIES_FILE, 'utf8'));
  const pending = replies.filter(r => !r.approved && !r.rejected);
  
  if (index < 0 || index >= pending.length) {
    console.log('Invalid reply index');
    return;
  }
  
  const reply = pending[index];
  console.log('\n=== ORIGINAL EMAIL ===');
  console.log(`From: ${reply.from}`);
  console.log(`Subject: ${reply.subject}`);
  console.log('\n' + reply.originalBody);
  console.log('\n=== DRAFTED REPLY ===\n');
  console.log(reply.draftedReply);
  console.log('\n===================\n');
}

async function approveAndSend(index, customReply = null) {
  const replies = JSON.parse(fs.readFileSync(REPLIES_FILE, 'utf8'));
  const pending = replies.filter(r => !r.approved && !r.rejected);
  
  if (index < 0 || index >= pending.length) {
    console.log('Invalid reply index');
    return;
  }
  
  const reply = pending[index];
  const replyText = customReply || reply.draftedReply;
  
  // Extract email from "Name <email>" format
  const emailMatch = reply.from.match(/<(.+?)>/);
  const toEmail = emailMatch ? emailMatch[1] : reply.from;
  
  try {
    await transporter.sendMail({
      from: '"Alex" <alexeventsales@gmail.com>',
      to: toEmail,
      subject: `Re: ${reply.subject.replace(/^Re: /i, '')}`,
      text: replyText,
      inReplyTo: reply.messageId,
      references: reply.messageId
    });
    
    console.log(`✅ Reply sent to ${toEmail}`);
    
    // Mark as approved in file
    const allReplies = JSON.parse(fs.readFileSync(REPLIES_FILE, 'utf8'));
    const replyIndex = allReplies.findIndex(r => 
      r.from === reply.from && 
      r.timestamp === reply.timestamp
    );
    
    if (replyIndex !== -1) {
      allReplies[replyIndex].approved = true;
      allReplies[replyIndex].sentAt = new Date().toISOString();
      fs.writeFileSync(REPLIES_FILE, JSON.stringify(allReplies, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error sending reply:', error.message);
  }
}

function rejectReply(index) {
  const replies = JSON.parse(fs.readFileSync(REPLIES_FILE, 'utf8'));
  const pending = replies.filter(r => !r.approved && !r.rejected);
  
  if (index < 0 || index >= pending.length) {
    console.log('Invalid reply index');
    return;
  }
  
  const reply = pending[index];
  const allReplies = JSON.parse(fs.readFileSync(REPLIES_FILE, 'utf8'));
  const replyIndex = allReplies.findIndex(r => 
    r.from === reply.from && 
    r.timestamp === reply.timestamp
  );
  
  if (replyIndex !== -1) {
    allReplies[replyIndex].rejected = true;
    allReplies[replyIndex].rejectedAt = new Date().toISOString();
    fs.writeFileSync(REPLIES_FILE, JSON.stringify(allReplies, null, 2));
    console.log('✅ Reply rejected');
  }
}

// Command line interface
const command = process.argv[2];
const arg = process.argv[3];

if (command === 'list') {
  listPendingReplies();
} else if (command === 'show' && arg) {
  showReply(parseInt(arg) - 1);
} else if (command === 'approve' && arg) {
  approveAndSend(parseInt(arg) - 1);
} else if (command === 'reject' && arg) {
  rejectReply(parseInt(arg) - 1);
} else {
  console.log('Usage:');
  console.log('  node alex-approve-replies.js list');
  console.log('  node alex-approve-replies.js show <number>');
  console.log('  node alex-approve-replies.js approve <number>');
  console.log('  node alex-approve-replies.js reject <number>');
}

module.exports = { listPendingReplies, showReply, approveAndSend, rejectReply };
