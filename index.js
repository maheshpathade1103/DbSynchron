const { google } = require('googleapis');
const sheets = google.sheets('v4');
const mysql = require('mysql2');
const cors = require('cors');
const express = require('express');
require('dotenv').config();
const app = express();

app.use(express.json());
app.use(cors());

// Google Sheets API setup
async function getGoogleSheetsData(spreadsheetId) {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.access_cred,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1',
  });
  console.log('Data fetched from Google Sheets:', response.data.values);
  return response.data.values;
}

// Endpoint to get Google Sheets data
app.get('/api/getData/:spreadsheetId', async (req, res) => {
  console.log('Received Spreadsheet ID:', req.params.spreadsheetId);
  try {
    const { spreadsheetId } = req.params;
    const data = await getGoogleSheetsData(spreadsheetId);

    res.json({ data });
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sriyush@1920',
  database: 'superjoin',
});

// Create the table if not exists
const setupDatabase = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS SuperJoin (
      Snum INT AUTO_INCREMENT PRIMARY KEY,
      NAME VARCHAR(255),
      REGNO VARCHAR(255)
    )
  `;
  db.query(createTableQuery, (error) => {
    if (error) throw error;
    console.log('Table created or exists already.');
  });
};
// Endpoint to update an entry
app.put('/api/updateEntry', async (req, res) => {
  const { Snum, NAME, REGNO, spreadsheetId } = req.body;

  try {
    const updateQuery = `UPDATE SuperJoin SET NAME = ?, REGNO = ? WHERE Snum = ?`;
    db.query(updateQuery, [NAME || null, REGNO || null, Snum], async (error, results) => {
      if (error) {
        console.error('Error updating MySQL entry:', error.message);
        return res.status(500).json({ message: 'Error updating entry in MySQL.' });
      }

      console.log(`Updated MySQL entry for Snum ${Snum}.`);

      // Update Google Sheets
      const rowToUpdate =   Number(Snum) + 1; 
      await updateGoogleSheetAfterInsert(spreadsheetId, rowToUpdate, NAME, REGNO,Snum);

      res.status(200).json({ message: 'Entry updated successfully!' });
    });
  } catch (error) {
    console.error('Error updating entry:', error.message);
    res.status(500).json({ message: 'Error updating entry.' });
  }
});

setupDatabase();
function insertNewEntry({ Snum, NAME, REGNO, spreadsheetId }) {
  const checkQuery = 'SELECT * FROM SuperJoin WHERE Snum = ?';
  
  db.query(checkQuery, [Snum], (error, results) => {
    if (error) {
      console.error('Error checking existing row:', error.message);
      return;
    }

    if (results.length > 0) {
      console.log(`Snum ${Snum} already exists. Updating instead...`);
      // Call update function here if you want to update the existing entry
      updateExistingEntry(Snum, NAME, REGNO);
    } else {
      const insertQuery = 'INSERT INTO SuperJoin (Snum, NAME, REGNO) VALUES (?, ?, ?)';
      db.query(insertQuery, [Snum, NAME || null, REGNO || null], (insertError, insertResults) => {
        if (insertError) {
          console.error('Error inserting new row:', insertError.message);
          return;
        }
        console.log('Inserted new row with ID:', insertResults.insertId);
        updateGoogleSheetAfterInsert(spreadsheetId, insertResults.insertId, NAME, REGNO);
      });
    }
  });
}
// Function to delete a row from MySQL and Google Sheets
async function deleteEntry(Snum, spreadsheetId) {
  // Delete from MySQL
  const deleteQuery = 'DELETE FROM SuperJoin WHERE Snum = ?';

  db.query(deleteQuery, [Snum], async (error, results) => {
    if (error) {
      console.error('Error deleting row from MySQL:', error.message);
      return;
    }

    console.log(`Deleted row with Snum ${Snum} from MySQL`);

    // Update Google Sheets by clearing the row
    try {
      const range = `Sheet1!A${Snum}:C${Snum}`; // Assuming Snum corresponds to the row number
      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.access_cred,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheetsClient = google.sheets({ version: 'v4', auth });
      await sheetsClient.spreadsheets.values.clear({
        spreadsheetId: spreadsheetId,
        range: range,
      });

      console.log(`Cleared Google Sheet row ${Snum}`);
    } catch (error) {
      console.error('Error clearing Google Sheet row:', error.message);
    }
  });
}

// Endpoint to delete data
app.delete('/api/deleteEntry/:spreadsheetId/:Snum', (req, res) => {
  const { spreadsheetId, Snum } = req.params;

  try {
    deleteEntry(Snum, spreadsheetId);
    res.status(200).send({ success: true, message: 'Entry deleted successfully!' });
  } catch (error) {
    console.error('Error deleting entry:', error.message);
    res.status(500).send({ success: false, message: 'Error deleting entry.' });
  }
});


// Function to update Google Sheet after inserting a new entry
async function updateGoogleSheetAfterInsert(spreadsheetId, rowToUpdate, NAME, REGNO,Snum) {
  try {

    const range = `Sheet1!A${rowToUpdate}:C${rowToUpdate}`; // Assuming Snum corresponds to the row number
    const values = [[rowToUpdate, NAME || null, REGNO || null]]; // Prepare data

    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.access_cred,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheetsClient = google.sheets({ version: 'v4', auth });
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId: spreadsheetId, // Use the actual spreadsheet ID
      range: range,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    console.log(`Updated Google Sheet at row ${rowToUpdate} with NAME: ${NAME}, REGNO: ${REGNO}`);
  } catch (error) {
    console.error('Error updating Google Sheet after insert:', error.message);
  }
}

// Sync data between Google Sheets and MySQL
app.post('/api/sync', (req, res) => {
  const { isNewEntry, Snum, NAME, REGNO, spreadsheetId } = req.body;

  if (isNewEntry) {
    console.log('New entry detected. Inserting into MySQL:', req.body);
    if (Snum) {
      insertNewEntry({ Snum, NAME, REGNO, spreadsheetId }); // Insert new row into MySQL with NAME and REGNO
      res.status(200).send({ success: true, message: 'New entry added!' });
    } else {
      res.status(400).send({ success: false, message: 'Missing Snum for new entry.' });
    }
  } else {
    // Handle updates (existing logic)
    const { spreadsheetId, sheetId, startRow, startColumn, oldValue, newValue } = req.body;
    syncGoogleSheetToMySQL(spreadsheetId, sheetId, startRow, startColumn, oldValue, newValue, NAME, REGNO); // Update MySQL row
    res.status(200).send({ success: true, message: 'Sync successful!' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Function to sync data from Google Sheets to MySQL
async function syncGoogleSheetToMySQL(spreadsheetId, sheetId, row, column, oldValue, newValue, NAME, REGNO) {
  const columnNames = {
    1: 'Snum',
    2: 'NAME',
    3: 'REGNO',
  };
  
  const columnName = columnNames[column];

  if (!columnName) {
    console.error('Invalid column index:', column);
    return;
  }

  try {
    console.log(`Updating MySQL for column: ${columnName}, Old Value: ${oldValue}, New Value: ${newValue}`);

    // Update existing entries based on Snum
    const updateQuery = `UPDATE SuperJoin SET ${columnName} = ? WHERE Snum = ?`;
    db.query(updateQuery, [newValue || null, row], (error, results) => {
      if (error) throw error;

      console.log(`MySQL updated successfully for ${columnName}, Row: ${row}, Old Value: ${oldValue}, New Value: ${newValue}`);
    });
  } catch (error) {
    console.error('Error syncing data from Google Sheets to MySQL:', error.message);
  }
}
async function syncMySQLToGoogleSheet() {
  try {
    db.query('SELECT * FROM SuperJoin', (error, results) => {
      if (error) throw error;

      const sheetData = results.map(row => Object.values(row));

      const googleSheetId = 'sheet1';
      const range = 'Sheet1!A1';

      updateGoogleSheet(sheetData, googleSheetId, range);
    });
  } catch (error) {
    console.error('Error syncing data from MySQL to Google Sheets:', error.message);
  }
}
module.exports = {
  syncMySQLToGoogleSheet,
  syncGoogleSheetToMySQL,
};
