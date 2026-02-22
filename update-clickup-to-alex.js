require('dotenv').config();
const axios = require('axios');

const CLICKUP_API = 'https://api.clickup.com/api/v2';
const API_TOKEN = process.env.CLICKUP_API_TOKEN;

const headers = {
  'Authorization': API_TOKEN,
  'Content-Type': 'application/json'
};

// List IDs from our workspace
const HENRY_PROJECTS_LIST = '901711002045';
const PERSONAL_LIST = '901711002046';
const BACKLOG_LIST = '901711002047';
const QUESTIONS_LIST = '901711004043';
const KNOWLEDGE_BASE_LIST = '901711006667';

async function getTasks(listId) {
  try {
    const response = await axios.get(
      `${CLICKUP_API}/list/${listId}/task`,
      { headers }
    );
    return response.data.tasks;
  } catch (error) {
    console.error(`Error getting tasks from list ${listId}:`, error.response?.data || error.message);
    return [];
  }
}

async function updateTask(taskId, updates) {
  try {
    await axios.put(
      `${CLICKUP_API}/task/${taskId}`,
      updates,
      { headers }
    );
    console.log(`✅ Updated task ${taskId}`);
  } catch (error) {
    console.error(`❌ Error updating task ${taskId}:`, error.response?.data || error.message);
  }
}

async function renameList(listId, newName) {
  try {
    await axios.put(
      `${CLICKUP_API}/list/${listId}`,
      { name: newName },
      { headers }
    );
    console.log(`✅ Renamed list to: ${newName}`);
  } catch (error) {
    console.error(`❌ Error renaming list:`, error.response?.data || error.message);
  }
}

async function updateAllToAlex() {
  console.log('🔄 Updating ClickUp from Henry to Alex...\n');
  
  // Update list names
  console.log('📋 Renaming lists...');
  await renameList(HENRY_PROJECTS_LIST, '🤖 Alex Projects');
  
  // Get all tasks from all lists
  console.log('\n📝 Updating tasks...');
  
  const lists = [
    { id: HENRY_PROJECTS_LIST, name: 'Alex Projects' },
    { id: PERSONAL_LIST, name: 'Personal Automation' },
    { id: BACKLOG_LIST, name: 'Backlog' },
    { id: QUESTIONS_LIST, name: 'Questions Log' },
    { id: KNOWLEDGE_BASE_LIST, name: 'Knowledge Base' }
  ];
  
  for (const list of lists) {
    console.log(`\nProcessing ${list.name}...`);
    const tasks = await getTasks(list.id);
    
    for (const task of tasks) {
      let needsUpdate = false;
      let updates = {};
      
      // Check name
      if (task.name.includes('Henry') || task.name.includes('henry')) {
        updates.name = task.name
          .replace(/Henry/g, 'Alex')
          .replace(/henry/g, 'alex')
          .replace(/henrythesalesguy/g, 'alexeventsales');
        needsUpdate = true;
      }
      
      // Check description
      if (task.description && (task.description.includes('Henry') || task.description.includes('henry'))) {
        updates.description = task.description
          .replace(/Henry/g, 'Alex')
          .replace(/henry/g, 'alex')
          .replace(/henrythesalesguy@gmail.com/g, 'alexeventsales@gmail.com')
          .replace(/henrythesalesguy/g, 'alexeventsales')
          .replace(/henry-/g, 'alex-')
          .replace(/HENRY_/g, 'ALEX_');
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        console.log(`  Updating: ${task.name}`);
        await updateTask(task.id, updates);
      }
    }
  }
  
  console.log('\n✅ All ClickUp updates complete!');
}

updateAllToAlex();
