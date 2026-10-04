import { request } from "@/api/client";
import type { NewReport, Report } from "@/types/report";

export const fetchReports = () => request<Report[]>("/reports");

export function createReport(r: NewReport) {
  const form = new FormData();
  for (const [key, value] of Object.entries(r)) {
    if (value !== undefined && value !== "") form.append(key, value instanceof File ? value : String(value));
  }
  return request<Report>("/reports", { method: "POST", body: form });
}
