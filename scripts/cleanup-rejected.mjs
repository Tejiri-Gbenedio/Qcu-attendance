// Standalone script to delete all rejected attendance records from the Google Sheet.
// Keeps only approved records. Run with: node --env-file=.env.local scripts/cleanup-rejected.mjs

import { google } from "googleapis";

const sheetId = process.env.GOOGLE_SHEET_ID;
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
let key = process.env.GOOGLE_PRIVATE_KEY;

if (!sheetId || !email || !key) {
  console.error("Missing required environment variables.");
  console.error("Ensure GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY are set.");
  process.exit(1);
}

key = key.replace(/\\n/g, "\n");

const auth = new google.auth.JWT({
  email,
  key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

async function cleanup() {
  console.log("Fetching attendance records...");

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Attendance!A:L",
  });

  const rows = res.data.values || [];
  if (rows.length <= 1) {
    console.log("No attendance records found (header only or empty). Nothing to do.");
    return;
  }

  const header = rows[0];
  const records = rows.slice(1);

  const approved = records.filter((row) => row[7] === "Approved");
  const rejected = records.filter((row) => row[7] !== "Approved");

  console.log(`Total records: ${records.length}`);
  console.log(`  Approved: ${approved.length}`);
  console.log(`  Rejected: ${rejected.length}`);

  if (rejected.length === 0) {
    console.log("No rejected records to delete. Sheet is already clean.");
    return;
  }

  console.log("\nClearing Attendance sheet...");
  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: "Attendance!A:L",
  });

  console.log(`Writing back ${approved.length} approved records...`);
  const newValues = [header, ...approved];
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: "Attendance!A1",
    valueInputOption: "RAW",
    requestBody: { values: newValues },
  });

  console.log(`\n[OK] Successfully deleted ${rejected.length} rejected record(s).`);
  console.log(`[OK] Kept ${approved.length} approved record(s).`);
  console.log("[OK] Attendance sheet has been cleaned up successfully.");
}

cleanup().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
