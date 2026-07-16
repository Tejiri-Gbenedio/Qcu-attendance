/**
 * Format a Date in West Africa Time (Africa/Lagos, UTC+1).
 * Avoids relying on Intl timezone support which may not work
 * on all server environments (e.g. Vercel Lambda).
 */

const LAGOS_OFFSET_MS = 60 * 60 * 1000; // UTC+1

function toLagosDate(date: Date): Date {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000 + LAGOS_OFFSET_MS);
}

export function formatLagosTime(date: Date): string {
  const d = toLagosDate(date);
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export function formatLagosTimeWithSeconds(date: Date): string {
  const d = toLagosDate(date);
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const seconds = d.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes}:${seconds} ${ampm}`;
}

export function formatLagosDate(date: Date): string {
  const d = toLagosDate(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatLagosDateLong(date: Date): string {
  const d = toLagosDate(date);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
