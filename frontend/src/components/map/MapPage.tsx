import { useMemo, useState } from "react";
import PageHero from "@/components/layout/PageHero";
import ReportMap, { type MapPoint } from "@/components/map/ReportMap";
import Icon from "@/components/ui/Icon";
import { photo } from "@/data/photos";
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

  // Closed reports (plants found gone) aren't current sightings, so they stay off the map.
  const shown = useMemo(() => (reports ?? []).filter((r) => !r.closed_at && (!mine || r.user_id === userId)), [reports, mine, userId]);
  const points = useMemo(
    () => shown.flatMap((r): MapPoint[] => {
      const at = riverPoint(r);
      return at ? [{ id: r.id, at, title: speciesNames(species, r.species_id).common, observedAt: r.observed_at }] : [];
    }),
    [shown, species],
  );
  const off = shown.length - points.length;

  return (
    <>
    <PageHero image={photo("ponte-sao-lazaro")} kicker="Rio Leça · Porto" title="Mapa">
      Onde foram registadas plantas invasoras ao longo do rio. Selecione um marcador para abrir o registo, ou clique em qualquer ponto junto ao rio para registar aí uma ocorrência.
    </PageHero>
    <main className="page-main" style={{ paddingTop: 40, display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <button className="chip" aria-pressed={mine} onClick={() => setMine(!mine)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {mine && <Icon name="check" size={15} />}
          Os meus registos
        </button>
        <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
          {reports
            ? `${points.length} ${points.length === 1 ? "registo" : "registos"} no mapa` + (off ? ` · ${off} sem localização junto ao rio` : "")
            : error ? "" : "A carregar os registos…"}
        </span>
      </div>

      {/* Shaped like the river area, so at the widest zoom the map shows exactly that area. */}
      <section style={{ position: "relative", width: "100%", aspectRatio: RIVER_AREA_ASPECT, maxHeight: "75vh", minHeight: 300, overflow: "hidden", background: "var(--color-surface)", boxShadow: "var(--shadow-md)" }}>
        <ReportMap points={points} onOpen={onView} onPick={onReportAt} />
        {error && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-3)", textAlign: "center", background: "color-mix(in srgb, var(--color-bg) 85%, transparent)" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>Não foi possível carregar os registos</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{error}</span>
            <button className="btn btn-secondary" onClick={onRetry}>Tentar novamente</button>
          </div>
        )}
      </section>
    </main>
    </>
  );
}
