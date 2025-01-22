let previousValue; // Global variable to store the old value
let rowData = {};  // Global object to temporarily store new row data

function onEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const spreadsheetId = spreadsheet.getId();
  const userEmail = Session.getActiveUser().getEmail();
  const localTimestamp = new Date().toLocaleString();

  const oldValue = e.oldValue || 'N/A';
  const newValue = e.value || 'N/A';
  
  const startRow = range.getRow();
  const startColumn = range.getColumn();

  const columnMapping = {
    1: 'Snum',
    2: 'NAME',
    3: 'REGNO'
  };

  const uri = 'https://807d-122-187-117-179.ngrok-free.app'; // Your server URL

  const isNewEntry = oldValue === 'N/A' && newValue !== 'N/A';
  const isDataUpdate = oldValue !== 'N/A' && newValue !== oldValue;

  // If Snum is entered, create a new row with null for NAME and REGNO
  if (startColumn === 1 && isNewEntry) {
    rowData['Snum'] = newValue;  // Set Snum from the new value
    rowData['NAME'] = null;       // Initialize NAME as null
    rowData['REGNO'] = null;      // Initialize REGNO as null
    rowData['isNewEntry'] = true; // Flag to indicate it's a new entry

    sendDataToServer(rowData);
    rowData = {}; // Reset rowData after sending

  } else if (isDataUpdate && columnMapping[startColumn]) {
    const changeData = {
      spreadsheetId: spreadsheetId,
      userEmail: userEmail,
      userRole: "editor",
      localTimestamp: localTimestamp,
      sheetId: sheet.getSheetId(),
      sheetName: sheet.getName(),
      startRow: startRow,
      startColumn: startColumn,
      oldValue: oldValue,
      newValue: newValue,
      isNewEntry: false,  // This is an update to an existing row
      changeType: "edit",
      Snum: startColumn === 1 ? newValue : rowData.Snum, // Capture Snum from column 1
      NAME: startColumn === 2 ? newValue : rowData.NAME, // Capture NAME from column 2
      REGNO: startColumn === 3 ? newValue : rowData.REGNO 
    };

    const options = {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(changeData)
    };

    try {
      UrlFetchApp.fetch(`${uri}/api/sync`, options);
    } catch (error) {
      Logger.log('Error sending data: ' + error.toString());
    }
  }
}

function sendDataToServer(rowData) {
  const uri = 'https://807d-122-187-117-179.ngrok-free.app'; // Replace with your actual ngrok/server URL

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(rowData)
  };

  try {
    // Send the row data to your Node.js server
    UrlFetchApp.fetch(`${uri}/api/sync`, options);
  } catch (error) {
    Logger.log('Error sending row data: ' + error.toString());
  }
}

function onSelectionChange(e) {
  previousValue = e.range.getValue();
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Sync Setup')
    .addItem('Authorize and Sync', 'authorizeAndSync')
    .addToUi();
}

function authorizeAndSync() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const spreadsheetId = spreadsheet.getId();
  const spreadsheetName = spreadsheet.getName();
  const owner = DriveApp.getFileById(spreadsheetId).getOwner().getEmail();
  const creationDate = DriveApp.getFileById(spreadsheetId).getDateCreated();

  Logger.log('Spreadsheet ID: ' + spreadsheetId);
  Logger.log('Spreadsheet Name: ' + spreadsheetName);
  Logger.log('Owner: ' + owner);
  Logger.log('Creation Date: ' + creationDate);

  const url = 'https://807d-122-187-117-179.ngrok-free.app/api/sync'; // Replace with your server URL
  const payload = {
    spreadsheetId: spreadsheetId,
    spreadsheetName: spreadsheetName,
    owner: owner,
    creationDate: creationDate.toISOString()
  };

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const message = response.getResponseCode() === 200 ? 
        'Sync setup successfully!' : 'Error setting up sync!';
    SpreadsheetApp.getActiveSpreadsheet().toast(message, 'Sync Status', 5);
  } catch (error) {
    Logger.log('Error during sync setup: ' + error.toString());
  }
}
