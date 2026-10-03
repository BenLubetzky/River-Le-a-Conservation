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
import { PLANTS, plantById } from "@/data/plants";
import { useReports } from "@/hooks/useReports";
import { useWikiPhotos } from "@/hooks/useWikiPhotos";
import { photoSet } from "@/lib/photos";
import type { LookAlike } from "@/types/plant";
import type { Report } from "@/types/report";

/** The whole site: navigation between pages, and the dialogs that open over them. */
export default function RioLeca() {
  const { photos, media, loadSummary, loadMedia } = useWikiPhotos();
  const { reports, error: reportsError, reload: reloadReports, add: addReport } = useReports();

  const [page, setPage] = useState<Page>("main");
  const [sel, setSel] = useState(-1); // plant open on the main page, as an index into PLANTS
  const [gi, setGi] = useState(0); // photo shown in that plant's gallery
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [view, setView] = useState<number | null>(null); // id of the report open in the viewer
  const [reporting, setReporting] = useState(false);
  const [lb, setLb] = useState<{ look: LookAlike; i: number } | null>(null);

  const navigate = (p: Page) => {
    setSel(-1);
    setPage(p);
    window.scrollTo({ top: 0 });
  };
  const openPlant = (i: number) => {
    const p = PLANTS[i];
    p.look.forEach((l) => loadSummary(l.latin));
    loadMedia(p.latin);
    setSel(i);
    setGi(0);
    window.scrollTo({ top: 0 });
  };
  const openLookAlike = (look: LookAlike) => {
    loadMedia(look.latin);
    setLb({ look, i: 0 });
  };

  const srcOf = (r: Report) => r.photo_url || photos[plantById(r.species_id).latin] || "";
  const viewed = view != null ? reports?.find((r) => r.id === view) : undefined;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
      <SiteHeader page={page} onNavigate={navigate} />

      {page === "main" && sel < 0 && <SpeciesGrid photos={photos} onOpen={openPlant} />}
      {page === "main" && sel >= 0 && (
        <PlantDetail sel={sel} gi={gi} setGi={setGi} photos={photos} media={media} onBack={() => navigate("main")} onLookGallery={openLookAlike} />
      )}
      {page === "reports" && (
        <ReportsPage reports={reports} error={reportsError} onRetry={reloadReports} f={filters} setFilters={setFilters} srcOf={srcOf} onView={setView} />
      )}

      {viewed && <ReportView r={viewed} src={srcOf(viewed)} onClose={() => setView(null)} />}

      <ReportButton onClick={() => setReporting(true)} />

      {lb && (
        <Lightbox
          title={lb.look.common}
          subtitle={lb.look.latin}
          images={photoSet(photos, media, lb.look.latin, 10)}
          index={lb.i}
          onIndex={(i) => setLb((l) => (l ? { ...l, i } : l))}
          onClose={() => setLb(null)}
        />
      )}

      {reporting && (
        <ReportFormDialog initialSp={page === "main" ? sel : -1} photos={photos} onClose={() => setReporting(false)} onCreated={addReport} />
      )}
    </div>
  );
}
