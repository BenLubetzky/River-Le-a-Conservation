import { useCallback, useEffect, useState } from "react";
import { fetchReports } from "@/api/reports";
import type { Report } from "@/types/report";

/** All reports from the backend. `reports` is null while loading. */
export function useReports() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetchReports().then(setReports, (e: Error) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const reload = () => {
    setError("");
    load();
  };
  // Show a newly submitted report without refetching everything.
  const add = (r: Report) => setReports((rs) => (rs ? [r, ...rs] : rs));
  // Show an edited report in place.
  const replace = (r: Report) => setReports((rs) => rs?.map((x) => (x.id === r.id ? r : x)) ?? rs);

  return { reports, error, reload, add, replace };
}
