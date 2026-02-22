require('dotenv').config();
const axios = require('axios');

const CLICKUP_API = 'https://api.clickup.com/api/v2';
const API_TOKEN = process.env.CLICKUP_API_TOKEN;
const HENRY_SPACE_ID = '90174188953';

const headers = {
  'Authorization': API_TOKEN,
  'Content-Type': 'application/json'
};

async function createQuestionList() {
  try {
    // Create "Questions Log" list
    const response = await axios.post(
      `${CLICKUP_API}/space/${HENRY_SPACE_ID}/list`,
      {
        name: '❓ Questions Log',
        content: 'Every question Brian asks - track patterns, automate answers, build systems'
      },
      { headers }
    );
    
    console.log(`✅ Created list: Questions Log (ID: ${response.data.id})`);
    
    // Add first task as example
    const taskResponse = await axios.post(
      `${CLICKUP_API}/list/${response.data.id}/task`,
      {
        name: 'Sample: Can you join Zoom meetings with me?',
        description: `**Question:** Can you join Zoom meetings with me or do I just send Fathom transcripts?

**Answer:** Can't join live, but can process Fathom transcripts, recordings, or notes after the call.

**Action Taken:** Explained options for meeting collaboration

**Date:** 2026-02-15`,
        tags: ['Technical', 'Meetings']
      },
      { headers }
    );
    
    console.log(`✅ Added sample question task`);
    console.log(`\n🔗 View list: https://app.clickup.com/9017909997/v/li/${response.data.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createQuestionList();
