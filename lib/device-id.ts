"use client";

const DEVICE_ID_KEY = "qcu_device_id";

/**
 * Returns a persistent unique identifier for this device.
 * Generated once, stored in localStorage, survives page refreshes.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
