import { google } from "googleapis";
import { getGoogleEnv } from "@/lib/env";

const googleEnv = getGoogleEnv();

const auth = new google.auth.JWT({
  email: googleEnv.serviceAccountEmail,
  key: googleEnv.privateKey,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = googleEnv.sheetId;

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
    range: "Whitelist!B:B",
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
    record.device,
    record.deviceId || "",
  ]];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Attendance!A:L",
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function getAttendanceRecords() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Attendance!A:L",
  });
  const rows = res.data.values || [];
  if (rows.length === 0) return [];

  const headers = ["date", "service", "memberName", "time", "latitude", "longitude", "distance", "status", "reason", "browser", "device", "deviceId"];
  return rows.slice(1).map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || "";
    });
    return obj;
  });
}

/**
 * Check if a device has already signed attendance on a given date.
 * Returns the member name they signed for if found, null otherwise.
 */
export async function hasDeviceSignedToday(deviceId: string, date: string): Promise<string | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Attendance!C:L",
  });
  const rows = res.data.values || [];
  if (rows.length <= 1) return null; // header or empty

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowDate = row[0] || "";     // column C = date (index 0 in this range)
    const rowDeviceId = row[9] || ""; // column L = deviceId (index 9 in this range)
    if (rowDate === date && rowDeviceId === deviceId) {
      return (row[2] || "").trim();   // column E = memberName (index 2 in this range)
    }
  }
  return null;
}
