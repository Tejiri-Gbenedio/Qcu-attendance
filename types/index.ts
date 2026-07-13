export interface AppConfig {
  churchLat: string;
  churchLng: string;
  allowedRadius: string;
  sharedPassword: string;
  adminPassword: string;
  isOpen: string; // "true" | "false"
}

export interface AttendanceRecord {
  date: string;
  service: string;
  memberName: string;
  time: string;
  latitude: string;
  longitude: string;
  distance: string;
  status: "Approved" | "Rejected";
  reason: string;
  browser: string;
  device: string;
}