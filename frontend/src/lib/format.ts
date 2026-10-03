import type { Option } from "@/types/report";

export const labelOf = (options: Option<string>[], value: string | null) =>
  options.find((o) => o.value === value)?.label ?? "Not recorded";

// Reports are shown in Porto time, whoever is viewing.
const DATE_FMT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Lisbon" });
export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : DATE_FMT.format(d);
};

export const fmtCoords = (lat: number, lng: number) =>
  `${Math.abs(lat).toFixed(5)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(5)}° ${lng >= 0 ? "E" : "W"}`;
