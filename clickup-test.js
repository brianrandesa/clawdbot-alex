require('dotenv').config();
const axios = require('axios');

const CLICKUP_API = 'https://api.clickup.com/api/v2';
const API_TOKEN = process.env.CLICKUP_API_TOKEN;

const headers = {
  'Authorization': API_TOKEN,
  'Content-Type': 'application/json'
};

async function testConnection() {
  try {
    // Get user info
    console.log('🔍 Testing ClickUp connection...\n');
    
    const userResponse = await axios.get(`${CLICKUP_API}/user`, { headers });
    console.log('✅ Connected as:', userResponse.data.user.username);
    console.log('📧 Email:', userResponse.data.user.email);
    
    // Get teams (workspaces)
    const teamsResponse = await axios.get(`${CLICKUP_API}/team`, { headers });
    console.log('\n📁 Workspaces:');
    
    for (const team of teamsResponse.data.teams) {
      console.log(`\n  - ${team.name} (ID: ${team.id})`);
      
      // Get spaces for this team
      const spacesResponse = await axios.get(`${CLICKUP_API}/team/${team.id}/space`, { headers });
      
      for (const space of spacesResponse.data.spaces) {
        console.log(`    └─ Space: ${space.name} (ID: ${space.id})`);
        
        // Get folders
        const foldersResponse = await axios.get(`${CLICKUP_API}/space/${space.id}/folder`, { headers });
        for (const folder of foldersResponse.data.folders) {
          console.log(`       └─ Folder: ${folder.name} (ID: ${folder.id})`);
        }
        
        // Get folderless lists
        const listsResponse = await axios.get(`${CLICKUP_API}/space/${space.id}/list`, { headers });
        for (const list of listsResponse.data.lists) {
          console.log(`       └─ List: ${list.name} (ID: ${list.id})`);
        }
      }
    }
    
    console.log('\n✅ ClickUp integration ready!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testConnection();
