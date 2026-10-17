import { request } from "@/api/client";
import type { CheckupInput, NewReport, PostponeInput, Report } from "@/types/report";

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

/** Record a checkup that needed no edit. Anyone can, once the report is due. */
export const checkReport = (id: number, c: CheckupInput) =>
  request<Report>(`/reports/${id}/checkup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) });

/** Record that the spot couldn't be checked, and move the checkup to a later day. Anyone can, once the report is due. */
export function postponeCheckup(id: number, c: PostponeInput) {
  const form = new FormData();
  form.append("next_checkup", c.next_checkup);
  if (c.notes) form.append("notes", c.notes);
  for (const p of c.photos) form.append("photos", p.file);
  // One per photo, in the same order; an empty file for a photo without a thumbnail.
  if (c.photos.some((p) => p.thumb)) {
    for (const p of c.photos) form.append("photo_thumbs", p.thumb ?? new File([], "nenhuma.jpg", { type: "image/jpeg" }));
  }
  return request<Report>(`/reports/${id}/postpone`, { method: "POST", body: form });
}
