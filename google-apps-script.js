// Google Apps Script for Wedding RSVP
// Deploy this script as a Web App in Google Apps Script

// This function handles HTTP GET and POST requests
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Guests');

  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'search') {
      return searchGuest(sheet, data.searchTerm);
    } else if (action === 'confirm') {
      return confirmGuests(sheet, data.guests);
    }

    return createResponse(false, 'Invalid action');
  } catch (error) {
    return createResponse(false, 'Error: ' + error.toString());
  }
}

// Allow GET requests for testing
function doGet(e) {
  return ContentService.createTextOutput('Wedding RSVP API is running');
}

// Search for a guest by name
function searchGuest(sheet, searchTerm) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0]; // First row is headers

  // Expected columns: Group Name | Guest Name | Attending | Timestamp
  const groupNameCol = 0;
  const guestNameCol = 1;
  const attendingCol = 2;

  // Search for the guest (case-insensitive)
  const searchLower = searchTerm.toLowerCase().trim();
  let foundGroup = null;

  for (let i = 1; i < data.length; i++) {
    const guestName = data[i][guestNameCol];
    if (guestName && guestName.toString().toLowerCase().includes(searchLower)) {
      foundGroup = data[i][groupNameCol];
      break;
    }
  }

  if (!foundGroup) {
    return createResponse(false, 'Nessun ospite trovato con questo nome');
  }

  // Get all guests in the same group
  const groupGuests = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][groupNameCol] === foundGroup) {
      groupGuests.push({
        row: i + 1, // +1 because sheet rows are 1-indexed
        name: data[i][guestNameCol],
        attending: data[i][attendingCol] === 'Sì' || data[i][attendingCol] === true
      });
    }
  }

  return createResponse(true, 'Guest group found', {
    groupName: foundGroup,
    guests: groupGuests
  });
}

// Confirm guest attendance
function confirmGuests(sheet, guests) {
  try {
    const timestamp = new Date().toLocaleString('it-IT');

    guests.forEach(guest => {
      const row = guest.row;
      const attending = guest.attending ? 'Sì' : 'No';

      // Update columns: Attending (C) and Timestamp (D)
      sheet.getRange(row, 3).setValue(attending); // Column C (Attending)
      sheet.getRange(row, 4).setValue(timestamp); // Column D (Timestamp)
    });

    return createResponse(true, 'Conferma registrata con successo!');
  } catch (error) {
    return createResponse(false, 'Errore durante la conferma: ' + error.toString());
  }
}

// Create JSON response
function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message
  };

  if (data) {
    response.data = data;
  }

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
