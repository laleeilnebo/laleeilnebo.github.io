# Wedding RSVP Setup Guide

This guide will help you set up the Google Sheets integration for your wedding RSVP system.

## Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Wedding RSVP" (or any name you prefer)
4. Rename the first sheet to "Guests"

## Step 2: Set Up Sheet Structure

In the "Guests" sheet, create the following headers in row 1:

| A | B | C | D |
|---|---|---|---|
| Group Name | Guest Name | Attending | Timestamp |

### Example Data:

| Group Name | Guest Name | Attending | Timestamp |
|------------|------------|-----------|-----------|
| Famiglia Rossi | Mario Rossi | | |
| Famiglia Rossi | Laura Rossi | | |
| Famiglia Rossi | Luca Rossi | | |
| Famiglia Bianchi | Giovanni Bianchi | | |
| Famiglia Bianchi | Maria Bianchi | | |

**Important Notes:**
- **Group Name**: All guests in the same family/group should have the same group name
- **Guest Name**: Individual guest names
- **Attending**: Will be automatically filled with "Sì" or "No" when guests confirm
- **Timestamp**: Will be automatically filled when guests confirm

## Step 3: Set Up Google Apps Script

1. In your Google Sheet, click **Extensions** > **Apps Script**
2. Delete any existing code in the editor
3. Copy all the code from `google-apps-script.js` file and paste it into the Apps Script editor
4. Click **Save** (disk icon) and give your project a name (e.g., "Wedding RSVP")

## Step 4: Deploy as Web App

1. In the Apps Script editor, click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
3. Configure the deployment:
   - **Description**: "Wedding RSVP v1"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. Review permissions:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** > **Go to [Project Name] (unsafe)**
   - Click **Allow**
6. Copy the **Web app URL** - it should look like:
   ```
   https://script.google.com/macros/s/XXXXXXXXXXXXX/exec
   ```

## Step 5: Update Your Website

1. Open the `script.js` file in your website
2. Find line 55 where it says:
   ```javascript
   const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'` with your Web app URL:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/XXXXXXXXXXXXX/exec';
   ```
4. Save the file

## Step 6: Test the System

1. Add some test guest data to your Google Sheet
2. Open your website
3. Scroll to the "Conferma Presenza" section
4. Search for a guest name
5. Check/uncheck attendance
6. Click "Conferma"
7. Check your Google Sheet to verify the data was updated

## How It Works

### User Flow:
1. Guest enters their name in the search box
2. System searches Google Sheet for matching name
3. Displays all guests in the same group
4. Guest can check/uncheck each person's attendance
5. Click "Conferma" to save
6. Data is saved to Google Sheet with timestamp

### Google Sheet Updates:
- Column C (Attending): Updates to "Sì" or "No"
- Column D (Timestamp): Updates with current date/time in Italian format

## Troubleshooting

### "Nessun ospite trovato"
- Make sure the guest name exists in your Google Sheet
- Check spelling and capitalization
- The search is case-insensitive and searches for partial matches

### CORS Errors in Console
- This is expected behavior when using `mode: 'no-cors'`
- The form will still work, but you won't see detailed errors
- For better debugging during development, you can temporarily remove `mode: 'no-cors'` from the fetch calls

### Permissions Error
- Make sure you deployed the script with "Who has access: Anyone"
- Re-authorize the script if needed

### Data Not Updating
- Check that your sheet is named "Guests" (case-sensitive)
- Verify the column headers match exactly: Group Name, Guest Name, Attending, Timestamp
- Check the Apps Script logs: **Extensions** > **Apps Script** > **Executions**

## Updating the Script

If you need to make changes to the Google Apps Script:

1. Edit the code in Apps Script editor
2. Click **Save**
3. Click **Deploy** > **Manage deployments**
4. Click the edit icon (pencil) next to your deployment
5. Change the version to "New version"
6. Click **Deploy**

The URL will remain the same, so you don't need to update your website.

## Privacy & Security

- The Google Sheet is only accessible to you
- The Web App is accessible to anyone with the URL
- Guest data is stored in your personal Google Drive
- Consider making the sheet view-only for yourself to prevent accidental edits

## Support

For issues or questions:
- Check the [Google Apps Script documentation](https://developers.google.com/apps-script)
- Review the Apps Script execution logs for errors
- Test the API directly by visiting the Web App URL in your browser (should show "Wedding RSVP API is running")
