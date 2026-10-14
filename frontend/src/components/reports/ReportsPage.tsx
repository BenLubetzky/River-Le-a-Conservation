import Icon from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";
import { ABUNDANCE, PHENOLOGY, STAGE } from "@/data/reportOptions";
import { stop } from "@/lib/events";
import { dueFor, fmtDay, isDue } from "@/lib/checkup";
import { fmtDate, fmtLocation, labelOf } from "@/lib/format";
import { speciesNames } from "@/lib/species";
import type { Species } from "@/types/plant";
import type { Option, Report } from "@/types/report";

// `mine`: only the logged-in user's reports. `due`: only reports whose checkup is due, longest-waiting first.
export type Filters = { q: string; sp: string; ab: string; st: string; ph: string; mine: boolean; due: boolean; sort: "new" | "old" };
export const NO_FILTERS: Filters = { q: "", sp: "all", ab: "all", st: "all", ph: "all", mine: false, due: false, sort: "new" };

export default function ReportsPage({ reports, species, userId, error, onRetry, f, setFilters, srcOf, onView }: {
  reports: Report[] | null; species: Species[] | null; userId: number; error: string; onRetry: () => void;
  f: Filters; setFilters: (fn: (f: Filters) => Filters) => void;
  srcOf: (r: Report) => string; onView: (id: number) => void;
}) {
  const setF = (patch: Partial<Filters>) => setFilters((s) => ({ ...s, ...patch }));
  const all = reports ?? [];
  const q = f.q.trim().toLowerCase();
  const list = all
    .filter((r) => {
      const p = speciesNames(species, r.species_id);
      if (f.mine && r.user_id !== userId) return false;
      if (f.due && !isDue(r)) return false;
      if (f.sp !== "all" && r.species_id !== f.sp) return false;
      if (f.ab !== "all" && r.abundance !== f.ab) return false;
      if (f.st !== "all" && r.stage !== f.st) return false;
      if (f.ph !== "all" && r.phenology !== f.ph) return false;
      if (q && !(p.common + " " + p.latin + " " + (r.location_text ?? "") + " " + (r.reporter_name ?? "")).toLowerCase().includes(q)) return false;
      return true;
    })
    .sort((a, b) => {
      if (f.due) return a.checkup_due!.localeCompare(b.checkup_due!);
      const d = Date.parse(b.observed_at) - Date.parse(a.observed_at);
      return f.sort === "new" ? d : -d;
    });
  const hasFilters = JSON.stringify({ ...f, sort: "new" }) !== JSON.stringify(NO_FILTERS);
  const clearFilters = () => setFilters((s) => ({ ...NO_FILTERS, sort: s.sort }));
  const opt = (any: string, options: Option<string>[]) => [{ value: "all", label: any }, ...options];
  const selects: { key: "sp" | "ab" | "st" | "ph"; label: string; options: { value: string; label: string }[] }[] = [
    { key: "sp", label: "Species", options: [{ value: "all", label: "All species" }, ...(species ?? []).map((p) => ({ value: p.id, label: p.common_name }))] },
    { key: "ab", label: "Abundance", options: opt("Any abundance", ABUNDANCE) },
    { key: "st", label: "State", options: opt("Any state", STAGE) },
    { key: "ph", label: "Flower or fruit", options: opt("Any flower/fruit", PHENOLOGY) },
  ];
  const dueCount = all.filter(isDue).length;
  // Checkup days still to come, soonest first.
  const upcoming = all.flatMap((r) => (!r.closed_at && r.checkup_due && !isDue(r) ? [r.checkup_due] : [])).sort();
  const count = list.length === all.length ? `${all.length} ${all.length === 1 ? "report" : "reports"}` : `Showing ${list.length} of ${all.length} reports`;

  return (
    <main className="page-main" style={{ paddingBottom: 140, display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "48px 0 8px", maxWidth: 640 }}>
        <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>Rio Leça · Porto</span>
        <h1 className="page-h1">Reports</h1>
        <p style={{ fontSize: 17, margin: 0, color: "var(--color-neutral-700)", textWrap: "pretty" }}>Every sighting of an invasive plant along the river. Open a report to see it in full.</p>
      </section>

      {/* Always shown, so people know checkups exist; it only calls for attention when some are due. */}
      {dueCount > 0 ? (
        <button className="checkup-callout" aria-pressed={f.due} onClick={() => setF({ due: !f.due })}>
          <span className="checkup-callout-icon"><Icon name="alert" size={22} /></span>
          <span style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "left", flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>{dueCount} {dueCount === 1 ? "report needs" : "reports need"} a checkup</span>
            <span style={{ fontSize: 14, opacity: 0.85 }}>{f.due ? "Showing only these. Open one and record what you found." : "Go back to these spots and see if the plants are still there."}</span>
          </span>
          <span className="checkup-callout-cta">{f.due ? "Show all reports" : "Show them"}</span>
        </button>
      ) : (
        <div className="checkup-callout checkup-callout-calm">
          <span className="checkup-callout-icon"><Icon name="check" size={22} /></span>
          <span style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "left", flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>No reports need a checkup</span>
            <span style={{ fontSize: 14, opacity: 0.85 }}>
              {upcoming.length
                ? `${upcoming.length} ${upcoming.length === 1 ? "checkup is" : "checkups are"} planned. The next one is due on ${fmtDay(upcoming[0])}.`
                : "Reports show up here once their checkup date arrives. Set one when you report an occurrence."}
            </span>
          </span>
          {f.due && <button className="btn btn-secondary" onClick={() => setF({ due: false })}>Show all reports</button>}
        </div>
      )}

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div className="filters">
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Icon name="search" size={16} color="var(--color-neutral-700)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
            <input className="input" value={f.q} onChange={(e) => setF({ q: e.target.value })} placeholder="Search place, reporter or species" aria-label="Search reports" style={{ paddingLeft: 38, minHeight: 44, fontSize: 15, width: "100%" }} />
          </div>
          {selects.map((s) => (
            <select key={s.key} className="input" value={f[s.key]} onChange={(e) => setF({ [s.key]: e.target.value })} aria-label={s.label} style={{ minHeight: 44, fontSize: 15, cursor: "pointer", width: "100%" }}>
              {s.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
          <button className="chip" aria-pressed={f.mine} onClick={() => setF({ mine: !f.mine })} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {f.mine && <Icon name="check" size={15} />}
            My reports
          </button>
          <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{reports ? count : error ? "" : "Loading reports…"}</span>
          {hasFilters && <button className="btn btn-ghost" onClick={clearFilters} style={{ padding: "6px 12px", fontSize: 14 }}>Clear filters</button>}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span style={{ fontSize: 14, color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>Sort by date</span>
            <div role="group" aria-label="Sort by date" style={{ display: "flex", gap: 4, padding: 4, borderRadius: 999, background: "var(--color-surface)", boxShadow: "inset 0 0 0 1.5px var(--color-divider)" }}>
              {([["new", "Newest first"], ["old", "Oldest first"]] as const).map(([k, label]) => (
                <button key={k} className="sort-opt" onClick={() => setF({ sort: k })} aria-pressed={f.sort === k}>
                  <Icon name="arrowDown" size={15} style={{ transform: k === "new" ? "none" : "rotate(180deg)" }} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ overflowX: "auto", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: "var(--space-2) var(--space-4)" }}>
        <table className="table" style={{ width: "100%", minWidth: 980 }}>
          <thead>
            <tr>
              <th>Species</th><th>Date</th><th>Location</th><th>Reported by</th><th>Abundance</th><th>State</th><th>Flower or fruit</th><th style={{ textAlign: "right" }}><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const p = speciesNames(species, r.species_id);
              return (
                <tr key={r.id} className="report-row" onClick={() => onView(r.id)}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                      <span style={{ width: 44, height: 44, flex: "none", borderRadius: "50%", overflow: "hidden", background: "var(--color-neutral-300)" }}>
                        <Photo src={srcOf(r)} />
                      </span>
                      <span style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, whiteSpace: "nowrap" }}>{p.common}</span>
                        <span style={{ fontSize: 13, fontStyle: "italic", color: "var(--color-accent-2-700)", whiteSpace: "nowrap" }}>{p.latin}</span>
                        {isDue(r) && <span className="tag tag-due" style={{ alignSelf: "flex-start", marginTop: 4 }}><Icon name="alert" size={12} />Checkup {dueFor(r.checkup_due!)}</span>}
                        {r.closed_at && <span className="tag tag-neutral" style={{ alignSelf: "flex-start", marginTop: 4 }}>No longer there</span>}
                      </span>
                    </div>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{fmtDate(r.observed_at)}</td>
                  <td>{fmtLocation(r)}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {r.reporter_name || "Anonymous"}
                    {r.user_id === userId && <span style={{ color: "var(--color-neutral-700)" }}> (you)</span>}
                  </td>
                  <td><span className="tag tag-neutral" style={{ whiteSpace: "nowrap" }}>{labelOf(ABUNDANCE, r.abundance)}</span></td>
                  <td><span className="tag tag-outline" style={{ whiteSpace: "nowrap" }}>{labelOf(STAGE, r.stage)}</span></td>
                  <td><span className="tag tag-accent-2" style={{ whiteSpace: "nowrap" }}>{labelOf(PHENOLOGY, r.phenology)}</span></td>
                  <td onClick={stop}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost btn-icon" onClick={() => onView(r.id)} aria-label="View" title="View"><Icon name="eye" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {error && (
          <div style={{ padding: "48px var(--space-4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>Couldn’t load reports</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{error}</span>
            <button className="btn btn-secondary" onClick={onRetry}>Try again</button>
          </div>
        )}
        {reports && all.length === 0 && (
          <div style={{ padding: "48px var(--space-4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>No reports yet</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>Seen an invasive plant along the Leça? Be the first to report it.</span>
          </div>
        )}
        {reports && all.length > 0 && list.length === 0 && f.mine && !all.some((r) => r.user_id === userId) ? (
          <div style={{ padding: "48px var(--space-4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>You haven’t made any reports yet</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>Seen an invasive plant along the Leça? Use the report button to log it.</span>
          </div>
        ) : reports && all.length > 0 && list.length === 0 && (
          <div style={{ padding: "48px var(--space-4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>No reports match these filters</span>
            <button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>
          </div>
        )}
      </section>
    </main>
  );
}
