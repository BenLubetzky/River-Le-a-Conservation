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

const DAY_FMT = new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const fmtDay = (day: string) => DAY_FMT.format(new Date(day + "T00:00:00Z"));

/** "pendente hoje", "pendente há 3 dias" */
export const dueFor = (day: string) => {
  const days = Math.round((Date.parse(today()) - Date.parse(day)) / 86_400_000);
  return days <= 0 ? "pendente hoje" : `pendente há ${days} ${days === 1 ? "dia" : "dias"}`;
};

export const OUTCOME_LABELS = { still_there: "Ainda existe", updated: "Atualizado", gone: "Já não existe", postponed: "Não foi possível verificar, adiado" } as const;
