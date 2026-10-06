"use client";

import { useState } from "react";
import ReportButton from "@/components/layout/ReportButton";
import SiteHeader, { type Page } from "@/components/layout/SiteHeader";
import ReportFormDialog from "@/components/reports/ReportFormDialog";
import ReportView from "@/components/reports/ReportView";
import ReportsPage, { NO_FILTERS, type Filters } from "@/components/reports/ReportsPage";
import Lightbox from "@/components/species/Lightbox";
import PlantDetail from "@/components/species/PlantDetail";
import SpeciesGrid from "@/components/species/SpeciesGrid";
import { useReports } from "@/hooks/useReports";
import { useSpecies } from "@/hooks/useSpecies";
import { speciesNames } from "@/lib/species";
import type { LookAlike } from "@/types/plant";
import type { Report } from "@/types/report";
import type { User } from "@/types/user";

/** The whole site: navigation between pages, and the dialogs that open over them. */
export default function RioLeca({ user }: { user: User }) {
  const { species, error: speciesError, reload: reloadSpecies } = useSpecies();
  const { reports, error: reportsError, reload: reloadReports, add: addReport, replace: replaceReport } = useReports();

  const [page, setPage] = useState<Page>("main");
  const [sel, setSel] = useState(-1); // plant open on the main page, as an index into `species`
  const [gi, setGi] = useState(0); // photo shown in that plant's gallery
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [view, setView] = useState<number | null>(null); // id of the report open in the viewer
  const [reporting, setReporting] = useState(false);
  const [editing, setEditing] = useState<Report | null>(null); // own report open in the form
  const [lb, setLb] = useState<{ look: LookAlike; i: number } | null>(null);

  const navigate = (p: Page) => {
    setSel(-1);
    setPage(p);
    window.scrollTo({ top: 0 });
  };
  const openPlant = (i: number) => {
    setSel(i);
    setGi(0);
    window.scrollTo({ top: 0 });
  };

  const plant = species && sel >= 0 ? species[sel] : undefined;
  // Reports without an uploaded photo show the species' main photo instead.
  const srcOf = (r: Report) => r.photo_url || species?.find((s) => s.id === r.species_id)?.photos[0] || "";
  const viewed = view != null ? reports?.find((r) => r.id === view) : undefined;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
      <SiteHeader page={page} onNavigate={navigate} username={user.username} />

      {page === "main" && !species && (
        <main className="page-main" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", paddingTop: 120, textAlign: "center" }}>
          {speciesError ? (
            <>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 22 }}>Couldn’t load the plants</span>
              <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{speciesError}</span>
              <button className="btn btn-secondary" onClick={reloadSpecies}>Try again</button>
            </>
          ) : (
            <span style={{ fontSize: 15, color: "var(--color-neutral-700)" }}>Loading plants…</span>
          )}
        </main>
      )}
      {page === "main" && species && !plant && <SpeciesGrid species={species} onOpen={openPlant} />}
      {page === "main" && plant && (
        <PlantDetail plant={plant} gi={gi} setGi={setGi} onBack={() => navigate("main")} onLookGallery={(look) => setLb({ look, i: 0 })} />
      )}
      {page === "reports" && (
        <ReportsPage reports={reports} species={species} error={reportsError} onRetry={reloadReports} f={filters} setFilters={setFilters} srcOf={srcOf} onView={setView} />
      )}

      {viewed && (
        <ReportView
          r={viewed}
          names={speciesNames(species, viewed.species_id)}
          src={srcOf(viewed)}
          onClose={() => setView(null)}
          onEdit={viewed.user_id === user.id && species ? () => setEditing(viewed) : undefined}
        />
      )}

      <ReportButton onClick={() => setReporting(true)} />

      {lb && (
        <Lightbox
          title={lb.look.common_name}
          subtitle={lb.look.latin_name}
          images={lb.look.photos}
          index={lb.i}
          onIndex={(i) => setLb((l) => (l ? { ...l, i } : l))}
          onClose={() => setLb(null)}
        />
      )}

      {editing && (
        <ReportFormDialog species={species ?? []} username={user.username} initialSp={-1} editing={editing} onClose={() => setEditing(null)} onSaved={replaceReport} />
      )}

      {reporting && (
        <ReportFormDialog species={species ?? []} username={user.username} initialSp={page === "main" ? sel : -1} onClose={() => setReporting(false)} onSaved={addReport} />
      )}
    </div>
  );
}
