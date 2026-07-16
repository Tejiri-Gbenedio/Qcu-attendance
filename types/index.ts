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
  deviceId: string;
}

export interface AttendanceRequest {
  name: string;
  password: string;
  latitude: number;
  longitude: number;
  browser: string;
  device: string;
  service: string;
  deviceId: string;
  adminPassword?: string;
}

export const ALLOWED_SERVICES = ["Sunday", "Thursday", "Other"] as const;