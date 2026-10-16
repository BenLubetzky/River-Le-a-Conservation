import type { Report } from "@/types/report";

// Checkup dates are whole days ("YYYY-MM-DD"), counted in UTC like the API does, so the site and
// the API always agree on which reports are due.

export const today = () => new Date().toISOString().slice(0, 10);

/** The day `days` days after today. */
export const daysFromToday = (days: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Its checkup day has come and it hasn't been closed. */
export const isDue = (r: Report) => !r.closed_at && !!r.checkup_due && r.checkup_due <= today();

const DAY_FMT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const fmtDay = (day: string) => DAY_FMT.format(new Date(day + "T00:00:00Z"));

/** "due today", "due for 3 days" */
export const dueFor = (day: string) => {
  const days = Math.round((Date.parse(today()) - Date.parse(day)) / 86_400_000);
  return days <= 0 ? "due today" : `due for ${days} ${days === 1 ? "day" : "days"}`;
};

export const OUTCOME_LABELS = { still_there: "Still there", updated: "Updated", gone: "No longer there", postponed: "Couldn’t check, postponed" } as const;
