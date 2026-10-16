import PageHero from "@/components/layout/PageHero";
import Icon from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";
import { photo } from "@/data/photos";
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
    { key: "sp", label: "Espécie", options: [{ value: "all", label: "Todas as espécies" }, ...(species ?? []).map((p) => ({ value: p.id, label: p.common_name }))] },
    { key: "ab", label: "Abundância", options: opt("Qualquer abundância", ABUNDANCE) },
    { key: "st", label: "Estado", options: opt("Qualquer estado", STAGE) },
    { key: "ph", label: "Flor ou fruto", options: opt("Com ou sem flor/fruto", PHENOLOGY) },
  ];
  const dueCount = all.filter(isDue).length;
  // Checkup days still to come, soonest first.
  const upcoming = all.flatMap((r) => (!r.closed_at && r.checkup_due && !isDue(r) ? [r.checkup_due] : [])).sort();
  const count = list.length === all.length ? `${all.length} ${all.length === 1 ? "registo" : "registos"}` : `A mostrar ${list.length} de ${all.length} registos`;

  return (
    <>
    <PageHero image={photo("rio-leca-balio")} kicker="Rio Leça · Porto" title="Registos">
      Todas as ocorrências de plantas invasoras ao longo do rio. Abra um registo para o ver completo.
    </PageHero>
    <main className="page-main" style={{ paddingTop: 48, paddingBottom: 140, display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>

      {/* Always shown, so people know checkups exist; it only calls for attention when some are due. */}
      {dueCount > 0 ? (
        <button className="checkup-callout" aria-pressed={f.due} onClick={() => setF({ due: !f.due })}>
          <span className="checkup-callout-icon"><Icon name="alert" size={22} /></span>
          <span style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "left", flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>{dueCount} {dueCount === 1 ? "registo precisa" : "registos precisam"} de verificação</span>
            <span style={{ fontSize: 14, opacity: 0.85 }}>{f.due ? "A mostrar só estes. Abra um e registe o que encontrou." : "Volte a estes locais e veja se as plantas ainda lá estão."}</span>
          </span>
          <span className="checkup-callout-cta">{f.due ? "Mostrar todos os registos" : "Mostrar"}</span>
        </button>
      ) : (
        <div className="checkup-callout checkup-callout-calm">
          <span className="checkup-callout-icon"><Icon name="check" size={22} /></span>
          <span style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "left", flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>Nenhum registo precisa de verificação</span>
            <span style={{ fontSize: 14, opacity: 0.85 }}>
              {upcoming.length
                ? `${upcoming.length} ${upcoming.length === 1 ? "verificação planeada" : "verificações planeadas"}. A próxima é a ${fmtDay(upcoming[0])}.`
                : "Os registos aparecem aqui quando chega a data de verificação. Defina-a ao registar uma ocorrência."}
            </span>
          </span>
          {f.due && <button className="btn btn-secondary" onClick={() => setF({ due: false })}>Mostrar todos os registos</button>}
        </div>
      )}

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div className="filters">
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Icon name="search" size={16} color="var(--color-neutral-700)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
            <input className="input" value={f.q} onChange={(e) => setF({ q: e.target.value })} placeholder="Pesquisar local, autor ou espécie" aria-label="Pesquisar registos" style={{ paddingLeft: 38, minHeight: 44, fontSize: 15, width: "100%" }} />
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
            Os meus registos
          </button>
          <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{reports ? count : error ? "" : "A carregar os registos…"}</span>
          {hasFilters && <button className="btn btn-ghost" onClick={clearFilters} style={{ padding: "6px 12px", fontSize: 14 }}>Limpar filtros</button>}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span style={{ fontSize: 14, color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>Ordenar por data</span>
            <div role="group" aria-label="Ordenar por data" style={{ display: "flex", gap: 4, padding: 4, borderRadius: "var(--radius-md)", background: "#fff", boxShadow: "inset 0 0 0 1px var(--color-neutral-400)" }}>
              {([["new", "Mais recentes"], ["old", "Mais antigos"]] as const).map(([k, label]) => (
                <button key={k} className="sort-opt" onClick={() => setF({ sort: k })} aria-pressed={f.sort === k}>
                  <Icon name="arrowDown" size={15} style={{ transform: k === "new" ? "none" : "rotate(180deg)" }} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ overflowX: "auto", background: "#fff", boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-divider)", padding: "var(--space-2) var(--space-4)" }}>
        <table className="table" style={{ width: "100%", minWidth: 980 }}>
          <thead>
            <tr>
              <th>Espécie</th><th>Data</th><th>Local</th><th>Registado por</th><th>Abundância</th><th>Estado</th><th>Flor ou fruto</th><th style={{ textAlign: "right" }}><span className="sr-only">Abrir</span></th>
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
                        {isDue(r) && <span className="tag tag-due" style={{ alignSelf: "flex-start", marginTop: 4 }}><Icon name="alert" size={12} />Verificação {dueFor(r.checkup_due!)}</span>}
                        {r.closed_at && <span className="tag tag-neutral" style={{ alignSelf: "flex-start", marginTop: 4 }}>Já não existe</span>}
                      </span>
                    </div>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{fmtDate(r.observed_at)}</td>
                  <td>{fmtLocation(r)}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {r.reporter_name || "Anónimo"}
                    {r.user_id === userId && <span style={{ color: "var(--color-neutral-700)" }}> (você)</span>}
                  </td>
                  <td><span className="tag tag-neutral" style={{ whiteSpace: "nowrap" }}>{labelOf(ABUNDANCE, r.abundance)}</span></td>
                  <td><span className="tag tag-outline" style={{ whiteSpace: "nowrap" }}>{labelOf(STAGE, r.stage)}</span></td>
                  <td><span className="tag tag-accent-2" style={{ whiteSpace: "nowrap" }}>{labelOf(PHENOLOGY, r.phenology)}</span></td>
                  <td onClick={stop}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost btn-icon" onClick={() => onView(r.id)} aria-label="Ver" title="Ver"><Icon name="eye" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {error && (
          <div style={{ padding: "48px var(--space-4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>Não foi possível carregar os registos</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{error}</span>
            <button className="btn btn-secondary" onClick={onRetry}>Tentar novamente</button>
          </div>
        )}
        {reports && all.length === 0 && (
          <div style={{ padding: "48px var(--space-4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>Ainda não há registos</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>Viu uma planta invasora junto ao Leça? Seja o primeiro a registá-la.</span>
          </div>
        )}
        {reports && all.length > 0 && list.length === 0 && f.mine && !all.some((r) => r.user_id === userId) ? (
          <div style={{ padding: "48px var(--space-4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>Ainda não fez nenhum registo</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>Viu uma planta invasora junto ao Leça? Use o botão Registar ocorrência.</span>
          </div>
        ) : reports && all.length > 0 && list.length === 0 && (
          <div style={{ padding: "48px var(--space-4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>Nenhum registo corresponde a estes filtros</span>
            <button className="btn btn-secondary" onClick={clearFilters}>Limpar filtros</button>
          </div>
        )}
      </section>
    </main>
    </>
  );
}
