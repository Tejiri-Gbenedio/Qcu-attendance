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

/**
 * Append an attendance record to the Attendance sheet.
 * If the record's date differs from the last non-empty date in the sheet,
 * a blank separator row is inserted first so each attendance day is visually grouped.
 */
export async function appendAttendance(record: Record<string, string>) {
  // Read column A (dates) to find the last non-empty date
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Attendance!A:A",
  });
  const rows = res.data.values || [];

  if (rows.length > 1) {
    // Scan from bottom to find the last non-empty date (skip header at index 0)
    let lastDate = "";
    for (let i = rows.length - 1; i >= 1; i--) {
      const val = (rows[i][0] || "").trim();
      if (val !== "") {
        lastDate = val;
        break;
      }
    }
    // If the date has changed, insert a blank separator row first
    if (lastDate !== "" && lastDate !== record.date) {
      const emptyRow = Array(12).fill("");
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Attendance!A:L",
        valueInputOption: "RAW",
        requestBody: { values: [emptyRow] },
      });
    }
  }

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
 * Check if a device has already signed an *approved* attendance on a given date.
 * Only approved sign-ins count — a rejected attempt (outside geofence) does not
 * lock the device, so the member can retry. Returns the member name of the
 * approved sign-in if found, null otherwise.
 *
 * Sheet columns (A:L): A=date, B=service, C=memberName, D=time, E=lat, F=lng,
 * G=distance, H=status, I=reason, J=browser, K=device, L=deviceId.
 */
export async function hasDeviceSignedToday(deviceId: string, date: string): Promise<string | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Attendance!A:L",
  });
  const rows = res.data.values || [];
  if (rows.length <= 1) return null; // header or empty

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowDate = row[0] || "";      // A = date
    const rowMember = row[2] || "";    // C = memberName
    const rowStatus = row[7] || "";    // H = status
    const rowDeviceId = row[11] || ""; // L = deviceId
    if (rowDate === date && rowDeviceId === deviceId && rowStatus === "Approved") {
      return rowMember.trim();
    }
  }
  return null;
}

/**
 * Delete all rejected attendance records from the Attendance sheet.
 * Only rows where status (column H) is "Approved" are kept.
 * The header row is always preserved.
 *
 * Sheet columns (A:L): A=date, B=service, C=memberName, D=time, E=lat, F=lng,
 * G=distance, H=status, I=reason, J=browser, K=device, L=deviceId.
 *
 * @returns The number of deleted (rejected) records.
 */
export async function deleteRejectedAttendance(): Promise<number> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Attendance!A:L",
  });

  const rows = res.data.values || [];
  if (rows.length <= 1) return 0; // header only or empty

  const header = rows[0];
  const records = rows.slice(1);

  const approved = records.filter((row) => row[7] === "Approved");
  const rejected = records.filter((row) => row[7] !== "Approved");

  if (rejected.length === 0) return 0;

  // Clear the entire Attendance data range
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: "Attendance!A:L",
  });

  // Write back header + approved records
  const newValues = [header, ...approved];
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: "Attendance!A1",
    valueInputOption: "RAW",
    requestBody: { values: newValues },
  });

  return rejected.length;
}
