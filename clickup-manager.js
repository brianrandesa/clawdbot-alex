require('dotenv').config();
const axios = require('axios');

const CLICKUP_API = 'https://api.clickup.com/api/v2';
const API_TOKEN = process.env.CLICKUP_API_TOKEN;
const HENRY_LIST_ID = '901711001840'; // Henry To Do List

const headers = {
  'Authorization': API_TOKEN,
  'Content-Type': 'application/json'
};

async function createTask(taskData) {
  try {
    const { name, description, status, priority, dueDate, tags } = taskData;
    
    const payload = {
      name,
      description: description || '',
      status: status || 'to do',
      priority: priority || 3, // 1=urgent, 2=high, 3=normal, 4=low
      tags: tags || ['Henry'],
    };
    
    if (dueDate) {
      payload.due_date = new Date(dueDate).getTime();
    }
    
    const response = await axios.post(
      `${CLICKUP_API}/list/${HENRY_LIST_ID}/task`,
      payload,
      { headers }
    );
    
    console.log('✅ Task created:', response.data.name);
    console.log('🔗 URL:', response.data.url);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creating task:', error.response?.data || error.message);
    throw error;
  }
}

async function updateTask(taskId, updates) {
  try {
    const response = await axios.put(
      `${CLICKUP_API}/task/${taskId}`,
      updates,
      { headers }
    );
    
    console.log('✅ Task updated:', response.data.name);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating task:', error.response?.data || error.message);
    throw error;
  }
}

async function getTasks(status = null) {
  try {
    let url = `${CLICKUP_API}/list/${HENRY_LIST_ID}/task`;
    
    const params = {
      archived: false,
      subtasks: true
    };
    
    if (status) {
      params.statuses = [status];
    }
    
    const response = await axios.get(url, { headers, params });
    
    console.log(`📋 Found ${response.data.tasks.length} tasks`);
    return response.data.tasks;
  } catch (error) {
    console.error('❌ Error getting tasks:', error.response?.data || error.message);
    throw error;
  }
}

async function completeTask(taskId) {
  try {
    // Get available statuses first
    const listResponse = await axios.get(`${CLICKUP_API}/list/${HENRY_LIST_ID}`, { headers });
    const statuses = listResponse.data.statuses;
    const completeStatus = statuses.find(s => s.type === 'closed') || statuses.find(s => s.status.toLowerCase().includes('complete'));
    
    if (!completeStatus) {
      throw new Error('Could not find a "complete" status');
    }
    
    return await updateTask(taskId, { status: completeStatus.status });
  } catch (error) {
    console.error('❌ Error completing task:', error.response?.data || error.message);
    throw error;
  }
}

// Test - create a task for Henry project
if (require.main === module) {
  createTask({
    name: '🤖 Henry Email Automation - Build Bulk Sender',
    description: `**Project:** Henry Cold Email System
    
**Next Steps:**
- [ ] Create bulk sender script (sends to multiple prospects with delays)
- [ ] Create prospect CSV template
- [ ] Build first 50-prospect list using web search
- [ ] Send first 10 test emails
- [ ] Monitor results in Google Sheet

**Resources:**
- Tracking: https://docs.google.com/spreadsheets/d/1ll-ouNpaAzJzOun8ZniA1quYbmrRnjkxltb8lEsW5Sw/edit
- Email: henrythesalesguy@gmail.com
- Templates: ~/workspace/HENRY_EMAIL_TEMPLATES.md

**Status:** 90% complete - API working, ready to build bulk sender`,
    status: 'to do',
    priority: 2, // high
    tags: ['Henry', 'Email Automation', 'ESA']
  }).then(() => console.log('✅ Test task created!'));
}

module.exports = { createTask, updateTask, getTasks, completeTask };
