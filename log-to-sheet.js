const { google } = require('googleapis');

// Load service account credentials
const auth = new google.auth.GoogleAuth({
  keyFile: './alex-sheets-service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = '1-Zst1v4Q9m-QCBjDDw0_weIZKiD4eRINse10CtAxsIc';

async function logEmail(data) {
  try {
    const { date, prospectName, eventName, eventWebsite, email, status, lastContact, nextAction, notes } = data;

    // Append row to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:I',  // Updated to include Event Website column
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[date, prospectName, eventName, eventWebsite || '', email, status, lastContact, nextAction, notes]],
      },
    });

    console.log('✅ Logged to Google Sheets:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error logging to sheet:', error.message);
    throw error;
  }
}

// Test entry
if (require.main === module) {
  const testData = {
    date: new Date().toISOString().split('T')[0],
    prospectName: 'Test Prospect',
    eventName: 'Test Event 2024',
    eventWebsite: 'https://testevent.com',
    email: 'test@example.com',
    status: 'Sent',
    lastContact: new Date().toISOString().split('T')[0],
    nextAction: 'Follow-up in 3 days',
    notes: 'Test entry from Alex automation'
  };

  logEmail(testData)
    .then(() => console.log('Test complete'))
    .catch(err => console.error('Test failed:', err));
}

module.exports = { logEmail };
