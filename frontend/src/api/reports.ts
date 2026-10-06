import { request } from "@/api/client";
import type { NewReport, Report } from "@/types/report";

export const fetchReports = () => request<Report[]>("/reports");

function toForm(r: NewReport & { remove_photo?: boolean }) {
  const form = new FormData();
  for (const [key, value] of Object.entries(r)) {
    if (value !== undefined && value !== "") form.append(key, value instanceof File ? value : String(value));
  }
  return form;
}

export const createReport = (r: NewReport) => request<Report>("/reports", { method: "POST", body: toForm(r) });

/** Replaces every field of the report: a field left out is cleared. The photo only changes if a new one is sent or `remove_photo` is set. */
export const updateReport = (id: number, r: NewReport & { remove_photo?: boolean }) =>
  request<Report>(`/reports/${id}`, { method: "PUT", body: toForm(r) });
