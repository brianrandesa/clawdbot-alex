/**
 * ESA GHL Templates
 *
 * Pre-built template configurations for ESA's 4 snapshot variations.
 * These templates define the pipeline stages, automations, funnels,
 * and workflows that get deployed for each client type.
 *
 * Template Types:
 * 1. General Business Events (conferences, summits, expos)
 * 2. High-Ticket Masterminds (small group, high price)
 * 3. Virtual/Hybrid Events (online or mixed format)
 * 4. Multi-Day Conferences (2-5 day events)
 */

// ========== SHARED CONFIG ==========

const SHARED_PIPELINE_STAGES = [
  { name: 'New Lead' },
  { name: 'Contacted' },
  { name: 'Qualified' },
  { name: 'Booked' },
  { name: 'Attended' },
  { name: 'Ticket Sold' },
];

const SHARED_TAGS = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Booked Call',
  'No Show',
  'Attended Call',
  'Interested',
  'Not Interested',
  'Ticket Purchased',
  'Follow Up',
  'Hot Lead',
  'Cold Lead',
  'DQ',
  'DNQ - Wrong Fit',
  'DNQ - Budget',
  'DNQ - Timing',
  'Referral',
  'VIP',
];

const SHARED_CUSTOM_FIELDS = [
  { name: 'Event Name', dataType: 'TEXT' },
  { name: 'Event Date', dataType: 'DATE' },
  { name: 'Ticket Type', dataType: 'SINGLE_OPTIONS' },
  { name: 'Ticket Price', dataType: 'MONETORY' },
  { name: 'Lead Source', dataType: 'TEXT' },
  { name: 'Ad Campaign', dataType: 'TEXT' },
  { name: 'Notes from Call', dataType: 'LARGE_TEXT' },
  { name: 'Follow Up Date', dataType: 'DATE' },
];

const SPEED_TO_LEAD_SMS = {
  delay: 90, // seconds
  message: 'Hey {{contact.first_name}}! Thanks for your interest in {{custom_values.event_name}}. We just got your info and wanted to reach out right away. When\'s a good time for a quick call?',
};

const NURTURE_SEQUENCE_14DAY = [
  { day: 0, type: 'sms', body: 'Hey {{contact.first_name}}! Quick reminder about our call. Looking forward to chatting about {{custom_values.event_name}}!' },
  { day: 1, type: 'email', subject: 'Your Next Step', body: 'Following up on your interest in {{custom_values.event_name}}...' },
  { day: 3, type: 'sms', body: '{{contact.first_name}}, have you had a chance to think about {{custom_values.event_name}}? Limited spots available!' },
  { day: 5, type: 'email', subject: 'What Other Attendees Are Saying', body: 'Social proof and testimonials...' },
  { day: 7, type: 'sms', body: 'Hey {{contact.first_name}} - halfway through the week. Just checking in about {{custom_values.event_name}}. Any questions?' },
  { day: 10, type: 'email', subject: 'Special Offer Inside', body: 'Limited time offer for {{custom_values.event_name}}...' },
  { day: 12, type: 'sms', body: '{{contact.first_name}}, spots for {{custom_values.event_name}} are filling up. Want to lock yours in?' },
  { day: 14, type: 'email', subject: 'Last Chance', body: 'Final opportunity to join {{custom_values.event_name}}...' },
];

// ========== TEMPLATE 1: GENERAL BUSINESS ==========

export const GENERAL_BUSINESS = {
  name: 'ESA General Business Event',
  description: 'For conferences, summits, expos, and general business events.',
  pipeline: {
    name: 'Event Sales Pipeline',
    stages: [
      ...SHARED_PIPELINE_STAGES,
      { name: 'Payment Plan' },
      { name: 'Paid in Full' },
      { name: 'Refund Requested' },
    ],
  },
  tags: [
    ...SHARED_TAGS,
    'General Admission',
    'VIP Ticket',
    'Speaker',
    'Sponsor',
    'Exhibitor',
    'Early Bird',
  ],
  customFields: [
    ...SHARED_CUSTOM_FIELDS,
    { name: 'Company Name', dataType: 'TEXT' },
    { name: 'Industry', dataType: 'TEXT' },
    { name: 'Team Size', dataType: 'NUMERICAL' },
  ],
  funnel: {
    name: 'Event Registration Funnel',
    pages: [
      { name: 'Landing Page', type: 'opt-in' },
      { name: 'Registration', type: 'form' },
      { name: 'Checkout', type: 'order' },
      { name: 'Thank You', type: 'thank-you' },
      { name: 'Upsell - VIP Upgrade', type: 'upsell' },
    ],
  },
  workflows: [
    {
      name: 'Speed-to-Lead SMS',
      trigger: 'Form Submission',
      actions: ['Wait 90s', 'Send SMS', 'Create Task', 'Internal Notification'],
    },
    {
      name: '14-Day Nurture Sequence',
      trigger: 'Tag Added: New Lead',
      actions: NURTURE_SEQUENCE_14DAY.map(m => `Day ${m.day}: ${m.type.toUpperCase()}`),
    },
    {
      name: 'Booking Confirmation',
      trigger: 'Appointment Created',
      actions: ['Send SMS Confirmation', 'Send Email Confirmation', 'Add Tag: Booked Call'],
    },
    {
      name: 'No Show Follow-Up',
      trigger: 'Appointment Status: No Show',
      actions: ['Wait 30m', 'Send SMS', 'Add Tag: No Show', 'Create Task: Reschedule'],
    },
    {
      name: 'Ticket Purchase Confirmation',
      trigger: 'Payment Received',
      actions: ['Add Tag: Ticket Purchased', 'Move Pipeline: Ticket Sold', 'Send Confirmation Email', 'Internal Notification'],
    },
    {
      name: 'Reactivation Blast',
      trigger: 'Manual / Campaign',
      actions: ['Send SMS', 'Wait 2d', 'Send Email', 'Wait 3d', 'Send SMS', 'Create Task'],
    },
  ],
  calendar: {
    name: 'Discovery Call Calendar',
    description: 'Book a call to learn about the event',
    duration: 30,
  },
  forms: [
    {
      name: 'Lead Capture Form',
      fields: ['First Name', 'Last Name', 'Email', 'Phone', 'Company Name'],
    },
    {
      name: 'Application Form',
      fields: ['First Name', 'Last Name', 'Email', 'Phone', 'Company Name', 'Industry', 'Team Size', 'Goals for Attending'],
    },
  ],
};

// ========== TEMPLATE 2: HIGH-TICKET MASTERMIND ==========

export const HIGH_TICKET_MASTERMIND = {
  name: 'ESA High-Ticket Mastermind',
  description: 'For exclusive masterminds, retreats, and high-ticket small group events ($5K-$50K+ tickets).',
  pipeline: {
    name: 'Mastermind Sales Pipeline',
    stages: [
      { name: 'Application Received' },
      { name: 'Application Reviewed' },
      { name: 'Interview Scheduled' },
      { name: 'Interview Completed' },
      { name: 'Approved' },
      { name: 'Offer Sent' },
      { name: 'Negotiation' },
      { name: 'Deposit Paid' },
      { name: 'Paid in Full' },
      { name: 'Waitlisted' },
      { name: 'Declined' },
      { name: 'Refund' },
    ],
  },
  tags: [
    ...SHARED_TAGS,
    'Mastermind Applicant',
    'Application Complete',
    'Interview Scheduled',
    'Approved',
    'Waitlisted',
    'Declined',
    'Deposit Paid',
    'Full Payment',
    'Alumni',
    'Referral Source',
    'High Net Worth',
    '7-Figure Business',
    '8-Figure Business',
  ],
  customFields: [
    ...SHARED_CUSTOM_FIELDS,
    { name: 'Business Revenue', dataType: 'MONETORY' },
    { name: 'Years in Business', dataType: 'NUMERICAL' },
    { name: 'Business Type', dataType: 'TEXT' },
    { name: 'Goals', dataType: 'LARGE_TEXT' },
    { name: 'Biggest Challenge', dataType: 'LARGE_TEXT' },
    { name: 'How Did You Hear About Us', dataType: 'TEXT' },
    { name: 'Investment Level', dataType: 'SINGLE_OPTIONS' },
  ],
  funnel: {
    name: 'Mastermind Application Funnel',
    pages: [
      { name: 'Landing Page', type: 'opt-in' },
      { name: 'Application', type: 'application' },
      { name: 'Application Received', type: 'thank-you' },
      { name: 'Book Interview', type: 'calendar' },
      { name: 'Interview Confirmation', type: 'confirmation' },
    ],
  },
  workflows: [
    {
      name: 'Application Speed-to-Lead',
      trigger: 'Form Submission: Application',
      actions: ['Wait 60s', 'Send Personal SMS', 'Create Review Task', 'Internal Alert to Closer'],
    },
    {
      name: 'Application Review Reminder',
      trigger: 'Pipeline: Application Received',
      actions: ['Wait 2h', 'Internal Notification: Review Application', 'Create Task'],
    },
    {
      name: 'Interview Prep Sequence',
      trigger: 'Appointment Created: Interview',
      actions: ['Send Confirmation SMS', 'Send Prep Email', '24h Reminder SMS', '1h Reminder SMS'],
    },
    {
      name: 'Post-Interview Follow-Up',
      trigger: 'Pipeline: Interview Completed',
      actions: ['Send Thank You SMS', 'Wait 4h', 'Send Offer Email', 'Create Follow-Up Task'],
    },
    {
      name: 'Waitlist Nurture',
      trigger: 'Tag Added: Waitlisted',
      actions: ['Send Waitlist SMS', 'Weekly Check-In Email', 'Move when Spot Opens'],
    },
  ],
  calendar: {
    name: 'Mastermind Interview',
    description: 'Exclusive interview to determine mutual fit',
    duration: 45,
  },
  forms: [
    {
      name: 'Mastermind Application',
      fields: ['First Name', 'Last Name', 'Email', 'Phone', 'Business Name', 'Business Revenue', 'Years in Business', 'Goals', 'Biggest Challenge', 'Investment Readiness', 'How Did You Hear About Us'],
    },
  ],
};

// ========== TEMPLATE 3: VIRTUAL/HYBRID ==========

export const VIRTUAL_HYBRID = {
  name: 'ESA Virtual/Hybrid Event',
  description: 'For virtual summits, webinars, hybrid events, and online conferences.',
  pipeline: {
    name: 'Virtual Event Pipeline',
    stages: [
      { name: 'Registered' },
      { name: 'Confirmed' },
      { name: 'Reminder Sent' },
      { name: 'Attended Live' },
      { name: 'Watched Replay' },
      { name: 'Engaged' },
      { name: 'Offer Presented' },
      { name: 'Purchased' },
      { name: 'No Show' },
      { name: 'Replay Sent' },
    ],
  },
  tags: [
    ...SHARED_TAGS,
    'Virtual Attendee',
    'Hybrid - In Person',
    'Hybrid - Virtual',
    'Attended Live',
    'Watched Replay',
    'Engaged in Chat',
    'Asked Question',
    'Downloaded Resource',
    'Free Ticket',
    'Paid Ticket',
    'Upgrade Offer Shown',
    'Upgraded',
  ],
  customFields: [
    ...SHARED_CUSTOM_FIELDS,
    { name: 'Timezone', dataType: 'TEXT' },
    { name: 'Attendance Type', dataType: 'SINGLE_OPTIONS' },
    { name: 'Watch Time', dataType: 'NUMERICAL' },
    { name: 'Chat Engagement', dataType: 'CHECKBOX' },
    { name: 'Replay Link Sent', dataType: 'CHECKBOX' },
  ],
  funnel: {
    name: 'Virtual Event Registration Funnel',
    pages: [
      { name: 'Landing Page', type: 'opt-in' },
      { name: 'Registration', type: 'form' },
      { name: 'Thank You + Add to Calendar', type: 'thank-you' },
      { name: 'Live Event Room', type: 'webinar' },
      { name: 'Replay Page', type: 'replay' },
      { name: 'Offer Page', type: 'sales' },
      { name: 'Checkout', type: 'order' },
      { name: 'Order Confirmation', type: 'confirmation' },
    ],
  },
  workflows: [
    {
      name: 'Registration Confirmation',
      trigger: 'Form Submission: Registration',
      actions: ['Send Confirmation Email with Calendar Link', 'Send SMS Confirmation', 'Add Tag: Registered'],
    },
    {
      name: 'Pre-Event Reminder Sequence',
      trigger: 'Tag Added: Registered',
      actions: ['7-Day Email', '3-Day Email', '1-Day SMS', 'Morning-of SMS', '15-Min SMS with Link'],
    },
    {
      name: 'Live Event Engagement',
      trigger: 'Webhook: Joined Live',
      actions: ['Add Tag: Attended Live', 'Move Pipeline: Attended Live', 'Track Watch Time'],
    },
    {
      name: 'No Show Replay',
      trigger: 'Event Ended + No Attendance',
      actions: ['Wait 2h', 'Send Replay Email', 'Send Replay SMS', 'Add Tag: No Show'],
    },
    {
      name: 'Post-Event Sales',
      trigger: 'Event Ended',
      actions: ['Send Offer Email', 'Wait 1d', 'Follow-Up SMS', 'Wait 2d', 'Last Chance Email'],
    },
  ],
  calendar: {
    name: 'Post-Event Strategy Call',
    description: 'Book a call to discuss next steps after the virtual event',
    duration: 30,
  },
  forms: [
    {
      name: 'Virtual Event Registration',
      fields: ['First Name', 'Email', 'Phone', 'Timezone'],
    },
    {
      name: 'Hybrid Event Registration',
      fields: ['First Name', 'Last Name', 'Email', 'Phone', 'Attendance Type (Virtual/In-Person)', 'Timezone'],
    },
  ],
};

// ========== TEMPLATE 4: MULTI-DAY CONFERENCE ==========

export const MULTI_DAY_CONFERENCE = {
  name: 'ESA Multi-Day Conference',
  description: 'For 2-5 day conferences, retreats, and extended events with multiple tracks.',
  pipeline: {
    name: 'Conference Sales Pipeline',
    stages: [
      { name: 'Interest Expressed' },
      { name: 'Contacted' },
      { name: 'Discovery Call Booked' },
      { name: 'Discovery Call Completed' },
      { name: 'Proposal Sent' },
      { name: 'Follow-Up' },
      { name: 'Negotiation' },
      { name: 'Early Bird Purchase' },
      { name: 'Standard Purchase' },
      { name: 'VIP Purchase' },
      { name: 'Group Purchase' },
      { name: 'Payment Plan Active' },
      { name: 'Fully Paid' },
      { name: 'Cancelled' },
      { name: 'Refund' },
    ],
  },
  tags: [
    ...SHARED_TAGS,
    'Day 1 Only',
    'Full Conference',
    'VIP Pass',
    'Speaker Pass',
    'Sponsor',
    'Exhibitor',
    'Early Bird',
    'Standard Ticket',
    'Group Rate',
    'Payment Plan',
    'Travel Assistance Needed',
    'Hotel Block',
    'Dietary Requirements',
    'Accessibility Needs',
    'Returning Attendee',
    'First Timer',
  ],
  customFields: [
    ...SHARED_CUSTOM_FIELDS,
    { name: 'Pass Type', dataType: 'SINGLE_OPTIONS' },
    { name: 'Days Attending', dataType: 'MULTIPLE_OPTIONS' },
    { name: 'Track Preference', dataType: 'MULTIPLE_OPTIONS' },
    { name: 'Hotel Needed', dataType: 'CHECKBOX' },
    { name: 'Dietary Requirements', dataType: 'TEXT' },
    { name: 'Group Size', dataType: 'NUMERICAL' },
    { name: 'Previous Attendee', dataType: 'CHECKBOX' },
    { name: 'Special Requests', dataType: 'LARGE_TEXT' },
  ],
  funnel: {
    name: 'Conference Registration Funnel',
    pages: [
      { name: 'Conference Landing Page', type: 'landing' },
      { name: 'Speaker Lineup', type: 'content' },
      { name: 'Schedule/Agenda', type: 'content' },
      { name: 'Ticket Selection', type: 'pricing' },
      { name: 'Registration Form', type: 'form' },
      { name: 'Checkout', type: 'order' },
      { name: 'Order Confirmation', type: 'thank-you' },
      { name: 'Group Registration', type: 'form' },
      { name: 'Upsell - VIP Upgrade', type: 'upsell' },
    ],
  },
  workflows: [
    {
      name: 'Speed-to-Lead',
      trigger: 'Form Submission',
      actions: ['Wait 90s', 'Send SMS', 'Create Task', 'Internal Notification'],
    },
    {
      name: 'Early Bird Countdown',
      trigger: 'Registration',
      actions: ['Send Early Bird Email', '7d Reminder', '3d Urgency SMS', '1d Last Chance', 'Price Increase Notification'],
    },
    {
      name: 'Pre-Conference Prep',
      trigger: 'Purchase Confirmed',
      actions: ['Welcome Email', '30d Logistics Email', '14d Travel Info', '7d Schedule Preview', '1d Final Details SMS'],
    },
    {
      name: 'Group Sales Outreach',
      trigger: 'Tag Added: Group Rate',
      actions: ['Assign to Group Sales Rep', 'Send Group Package Email', 'Create Follow-Up Task', 'Internal Alert'],
    },
    {
      name: 'Day-of Engagement',
      trigger: 'Event Day',
      actions: ['Morning Welcome SMS', 'Session Reminders', 'Feedback Survey', 'Photo Gallery Link'],
    },
    {
      name: 'Post-Conference',
      trigger: 'Event Ended',
      actions: ['Thank You Email', 'Feedback Survey', 'Wait 3d', 'Early Bird Next Year Offer', 'Wait 7d', 'Content Recap Email'],
    },
    {
      name: 'Payment Plan Management',
      trigger: 'Payment Plan Started',
      actions: ['Confirm Plan Email', 'Payment Reminders', 'Failed Payment Alert', 'Plan Complete Notification'],
    },
  ],
  calendar: {
    name: 'Conference Info Call',
    description: 'Learn about the conference, ask questions, and get registered',
    duration: 30,
  },
  forms: [
    {
      name: 'Conference Registration',
      fields: ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Pass Type', 'Days Attending', 'Dietary Requirements', 'Hotel Needed'],
    },
    {
      name: 'Group Registration',
      fields: ['Group Contact Name', 'Email', 'Phone', 'Company', 'Group Size', 'Pass Type', 'Special Requests'],
    },
    {
      name: 'Speaker Application',
      fields: ['Full Name', 'Email', 'Phone', 'Topic/Title', 'Bio', 'Speaking Experience', 'Website/Social Links'],
    },
  ],
};

// ========== TEMPLATE REGISTRY ==========

export const TEMPLATES = {
  'general-business': GENERAL_BUSINESS,
  'high-ticket-mastermind': HIGH_TICKET_MASTERMIND,
  'virtual-hybrid': VIRTUAL_HYBRID,
  'multi-day-conference': MULTI_DAY_CONFERENCE,
};

export function getTemplate(type) {
  const template = TEMPLATES[type];
  if (!template) {
    throw new Error(`Unknown template type: ${type}. Available: ${Object.keys(TEMPLATES).join(', ')}`);
  }
  return template;
}

export function listTemplates() {
  return Object.entries(TEMPLATES).map(([key, t]) => ({
    id: key,
    name: t.name,
    description: t.description,
    pipelineStages: t.pipeline.stages.length,
    tags: t.tags.length,
    customFields: t.customFields.length,
    funnelPages: t.funnel.pages.length,
    workflows: t.workflows.length,
    forms: t.forms.length,
  }));
}
