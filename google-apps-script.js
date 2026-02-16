// Google Apps Script for Wedding RSVP
// Deploy this script as a Web App in Google Apps Script

// This function handles HTTP GET and POST requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'search') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Guests');
      return searchGuest(sheet, data.searchTerm);
    } else if (action === 'confirm') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Guests');
      return confirmGuests(sheet, data.guests, data.foodIntolerance);
    } else if (action === 'gift') {
      const giftSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Gift Messages');
      return saveGiftMessage(giftSheet, data);
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

// Search for a guest by name (optimized)
function searchGuest(sheet, searchTerm) {
  // Get all data at once (faster than multiple getRange calls)
  const data = sheet.getDataRange().getValues();

  // Expected columns: Group Name | Guest Name | Attending | Timestamp | Food Intolerance
  const groupNameCol = 0;
  const guestNameCol = 1;
  const attendingCol = 2;
  const foodIntoleranceCol = 4;

  // Search for the guest (case-insensitive, trimmed)
  const searchLower = searchTerm.toLowerCase().trim();
  let foundGroup = null;
  let foundRow = -1;

  // Single pass to find the guest
  for (let i = 1; i < data.length; i++) {
    const guestName = data[i][guestNameCol];
    if (guestName && guestName.toString().toLowerCase().includes(searchLower)) {
      foundGroup = data[i][groupNameCol];
      foundRow = i;
      break;
    }
  }

  if (!foundGroup) {
    return createResponse(false, 'Nessun ospite trovato con questo nome');
  }

  // Get all guests in the same group + food intolerance (single pass)
  const groupGuests = [];
  let groupFoodIntolerance = '';

  for (let i = 1; i < data.length; i++) {
    if (data[i][groupNameCol] === foundGroup) {
      groupGuests.push({
        row: i + 1, // +1 because sheet rows are 1-indexed
        name: data[i][guestNameCol],
        attending: data[i][attendingCol] === 'Sì' || data[i][attendingCol] === true
      });

      // Get food intolerance from first group member that has it
      if (!groupFoodIntolerance && data[i][foodIntoleranceCol]) {
        groupFoodIntolerance = data[i][foodIntoleranceCol];
      }
    }
  }

  return createResponse(true, 'Guest group found', {
    groupName: foundGroup,
    guests: groupGuests,
    foodIntolerance: groupFoodIntolerance
  });
}

// Confirm guest attendance (optimized with batch updates)
function confirmGuests(sheet, guests, foodIntolerance) {
  try {
    const timestamp = new Date().toLocaleString('it-IT');

    // Batch update for better performance
    const updates = guests.map(guest => {
      const row = guest.row;
      const attending = guest.attending ? 'Sì' : 'No';
      return {
        row: row,
        attending: attending,
        timestamp: timestamp,
        foodIntolerance: foodIntolerance || ''
      };
    });

    // Apply all updates at once (much faster than individual setValue calls)
    updates.forEach(update => {
      const range = sheet.getRange(update.row, 3, 1, 3); // Columns C, D, E
      range.setValues([[update.attending, update.timestamp, update.foodIntolerance]]);
    });

    return createResponse(true, 'Conferma registrata con successo!');
  } catch (error) {
    return createResponse(false, 'Errore durante la conferma: ' + error.toString());
  }
}

// Save gift message
function saveGiftMessage(giftSheet, data) {
  try {
    // Create the sheet if it doesn't exist
    if (!giftSheet) {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      giftSheet = spreadsheet.insertSheet('Gift Messages');

      // Add headers
      giftSheet.getRange(1, 1, 1, 4).setValues([
        ['From', 'To', 'Message', 'Timestamp']
      ]);

      // Format headers
      const headerRange = giftSheet.getRange(1, 1, 1, 4);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f3f3f3');
    }

    const timestamp = new Date().toLocaleString('it-IT');

    // Append the new gift message
    giftSheet.appendRow([
      data.from,
      data.to,
      data.message,
      timestamp
    ]);

    return createResponse(true, 'Messaggio inviato con successo! Grazie!');
  } catch (error) {
    return createResponse(false, 'Errore durante l\'invio del messaggio: ' + error.toString());
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
