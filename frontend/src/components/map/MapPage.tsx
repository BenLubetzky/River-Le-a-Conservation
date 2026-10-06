import { useMemo, useState } from "react";
import ReportMap, { type MapPoint } from "@/components/map/ReportMap";
import Icon from "@/components/ui/Icon";
import { RIVER_AREA_ASPECT, riverPoint } from "@/lib/riverArea";
import { speciesNames } from "@/lib/species";
import type { Species } from "@/types/plant";
import type { Report } from "@/types/report";

export default function MapPage({ reports, species, userId, error, onRetry, onView, onReportAt }: {
  reports: Report[] | null; species: Species[] | null; userId: number; error: string; onRetry: () => void;
  onView: (id: number) => void;
  /** Open the report form with this spot as the location. */
  onReportAt: (lat: number, lng: number) => void;
}) {
  const [mine, setMine] = useState(false);

  const shown = useMemo(() => (reports ?? []).filter((r) => !mine || r.user_id === userId), [reports, mine, userId]);
  const points = useMemo(
    () => shown.flatMap((r): MapPoint[] => {
      const at = riverPoint(r);
      return at ? [{ id: r.id, at, title: speciesNames(species, r.species_id).common, observedAt: r.observed_at }] : [];
    }),
    [shown, species],
  );
  const off = shown.length - points.length;

  return (
    <main className="page-main" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "48px 0 0", maxWidth: 640 }}>
        <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>Rio Leça · Porto</span>
        <h1 className="page-h1">Map</h1>
        <p style={{ fontSize: 17, margin: 0, color: "var(--color-neutral-700)", textWrap: "pretty" }}>Where invasive plants have been reported along the river. Select a marker to open its report, or click anywhere along the river to report a sighting there.</p>
      </section>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <button className="chip" aria-pressed={mine} onClick={() => setMine(!mine)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {mine && <Icon name="check" size={15} />}
          My reports
        </button>
        <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
          {reports
            ? `${points.length} ${points.length === 1 ? "report" : "reports"} on the map` + (off ? ` · ${off} without a location along the river` : "")
            : error ? "" : "Loading reports…"}
        </span>
      </div>

      {/* Shaped like the river area, so at the widest zoom the map shows exactly that area. */}
      <section style={{ position: "relative", width: "100%", aspectRatio: RIVER_AREA_ASPECT, maxHeight: "75vh", minHeight: 300, borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)" }}>
        <ReportMap points={points} onOpen={onView} onPick={onReportAt} />
        {error && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-3)", textAlign: "center", background: "color-mix(in srgb, var(--color-bg) 85%, transparent)" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>Couldn’t load reports</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{error}</span>
            <button className="btn btn-secondary" onClick={onRetry}>Try again</button>
          </div>
        )}
      </section>
    </main>
  );
}
