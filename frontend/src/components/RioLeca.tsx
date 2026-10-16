"use client";

import { useCallback, useState } from "react";
import ReportButton from "@/components/layout/ReportButton";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader, { type Page } from "@/components/layout/SiteHeader";
import HomePage from "@/components/home/HomePage";
import MapPage from "@/components/map/MapPage";
import ReportFormDialog from "@/components/reports/ReportFormDialog";
import ReportView from "@/components/reports/ReportView";
import ReportsPage, { NO_FILTERS, type Filters } from "@/components/reports/ReportsPage";
import Lightbox from "@/components/species/Lightbox";
import PlantDetail from "@/components/species/PlantDetail";
import { checkReport, postponeCheckup } from "@/api/reports";
import { useReports } from "@/hooks/useReports";
import { useSpecies } from "@/hooks/useSpecies";
import { isDue } from "@/lib/checkup";
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
  const [reportAt, setReportAt] = useState<{ lat: number; lng: number } | undefined>(); // spot picked on the map
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

  const reportHere = useCallback((lat: number, lng: number) => {
    setReportAt({ lat, lng });
    setReporting(true);
  }, []);

  const plant = species && sel >= 0 ? species[sel] : undefined;
  // Reports without an uploaded photo show the species' main photo instead.
  const srcOf = (r: Report) => r.photo_url || species?.find((s) => s.id === r.species_id)?.photos[0] || "";
  const viewed = view != null ? reports?.find((r) => r.id === view) : undefined;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
      <SiteHeader page={page} onNavigate={navigate} username={user.username} dueCount={reports?.filter(isDue).length ?? 0} onReport={() => setReporting(true)} />

      {page === "main" && !plant && (
        <HomePage
          species={species} speciesError={speciesError} onRetry={reloadSpecies} reports={reports}
          onOpenPlant={openPlant}
          onReports={() => navigate("reports")}
          onDue={() => { setFilters({ ...NO_FILTERS, due: true }); navigate("reports"); }}
          onMap={() => navigate("map")}
          onReport={() => setReporting(true)}
        />
      )}
      {page === "main" && plant && (
        <PlantDetail plant={plant} gi={gi} setGi={setGi} onBack={() => navigate("main")} onLookGallery={(look) => setLb({ look, i: 0 })} />
      )}
      {page === "reports" && (
        <ReportsPage reports={reports} species={species} userId={user.id} error={reportsError} onRetry={reloadReports} f={filters} setFilters={setFilters} srcOf={srcOf} onView={setView} />
      )}
      {page === "map" && (
        <MapPage reports={reports} species={species} userId={user.id} error={reportsError} onRetry={reloadReports} onView={setView} onReportAt={reportHere} />
      )}

      {viewed && (
        <ReportView
          r={viewed}
          names={speciesNames(species, viewed.species_id)}
          src={srcOf(viewed)}
          onClose={() => setView(null)}
          checkupDays={species?.find((s) => s.id === viewed.species_id)?.checkup_days}
          onEdit={!viewed.closed_at && (viewed.user_id === user.id || isDue(viewed)) && species ? () => setEditing(viewed) : undefined}
          onCheckup={isDue(viewed) ? async (c) => replaceReport(await checkReport(viewed.id, c)) : undefined}
          onPostpone={isDue(viewed) ? async (c) => replaceReport(await postponeCheckup(viewed.id, c)) : undefined}
        />
      )}

      <SiteFooter onNavigate={navigate} />

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
        <ReportFormDialog species={species ?? []} username={user.username} initialSp={page === "main" ? sel : -1} initialCoords={reportAt} onClose={() => { setReporting(false); setReportAt(undefined); }} onSaved={addReport} />
      )}
    </div>
  );
}
