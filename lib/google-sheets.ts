import { google } from "googleapis";

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

export async function getConfig() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Config!A:B",
  });
  const rows = res.data.values || [];
  const config: Record<string, string> = {};
  rows.forEach(([key, value]) => {
    if (key) config[key] = value;
  });
  return config;
}

export async function updateConfig(newConfig: Record<string, string>) {
  const values = Object.entries(newConfig).map(([key, value]) => [key, String(value)]);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: "Config!A1",
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function getWhitelist() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Whitelist!A:A",
  });
  const rows = res.data.values || [];
  return rows.flat().map((name) => name.trim().toLowerCase()).filter(Boolean);
}

export async function appendAttendance(record: Record<string, string>) {
  const values = [[
    record.date,
    record.service,
    record.memberName,
    record.time,
    record.latitude,
    record.longitude,
    record.distance,
    record.status,
    record.reason,
    record.browser,
    record.device
  ]];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Attendance!A:K",
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function getAttendanceRecords() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Attendance!A:K",
  });
  const rows = res.data.values || [];
  if (rows.length === 0) return [];
  
  const headers = ["date", "service", "memberName", "time", "latitude", "longitude", "distance", "status", "reason", "browser", "device"];
  return rows.slice(1).map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || "";
    });
    return obj;
  });
}