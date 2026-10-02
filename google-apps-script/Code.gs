// Returns only employee names; never dates, times, or payment data.
const TIMESHEET_ID = '1cj2SrpFLsMnXlJPeovr8Tw8LHNXDNrzrxRiry2R_3vo';
const RESPONSES_TAB = '1 απαντήσεις φόρμας';

function doGet() {
  try {
    const sheet = SpreadsheetApp.openById(TIMESHEET_ID).getSheetByName(RESPONSES_TAB);
    if (!sheet) throw new Error('Missing response sheet');
    const lastRow = sheet.getLastRow();
    const rows = lastRow > 1 ? sheet.getRange(2, 3, lastRow - 1, 1).getDisplayValues() : [];
    const seen = new Set();
    const names = [];
    rows.forEach(function (row) {
      const name = String(row[0]).normalize('NFC').trim().replace(/\s+/g, ' ');
      const key = name.toLocaleUpperCase('el-GR');
      if (name && name.length <= 120 && !seen.has(key)) {
        seen.add(key);
        names.push(name);
      }
    });
    names.sort(function (a, b) { return a.localeCompare(b, 'el'); });
    return ContentService.createTextOutput(JSON.stringify({ names: names }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Employee directory unavailable' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
