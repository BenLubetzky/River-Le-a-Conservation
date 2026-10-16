import { useState, type ReactNode } from "react";
import CheckupActions from "@/components/reports/CheckupActions";
import Lightbox from "@/components/species/Lightbox";
import Icon from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";
import { ABUNDANCE, PHENOLOGY, STAGE } from "@/data/reportOptions";
import { stop } from "@/lib/events";
import { OUTCOME_LABELS, dueFor, fmtDay, isDue } from "@/lib/checkup";
import { fmtCoords, fmtDate, labelOf } from "@/lib/format";
import type { CheckupInput, PostponeInput, Report } from "@/types/report";

export default function ReportView({ r, names: p, src, checkupDays, onClose, onEdit, onCheckup, onPostpone }: {
  r: Report; names: { common: string; latin: string }; src: string;
  /** The species' suggested days until the next checkup. */
  checkupDays?: number;
  onClose: () => void;
  /** Given when the viewer may edit: their own report, or any report whose checkup is due. */
  onEdit?: () => void;
  /** Given when the report's checkup is due. */
  onCheckup?: (c: CheckupInput) => Promise<void>;
  /** Given when the report's checkup is due. */
  onPostpone?: (c: PostponeInput) => Promise<void>;
}) {
  // A checkup's photos, open full screen.
  const [lb, setLb] = useState<{ photos: string[]; i: number; title: string } | null>(null);
  const due = isDue(r);
  const hasCoords = r.latitude != null && r.longitude != null;
  const fields: [string, ReactNode][] = [
    ["Date and time", fmtDate(r.observed_at)],
    ["Location", r.location_text || (hasCoords ? "" : "Not specified")],
    ["Abundance", labelOf(ABUNDANCE, r.abundance)],
    ["State", labelOf(STAGE, r.stage)],
    ["Flower or fruit", labelOf(PHENOLOGY, r.phenology)],
    ["Reported by", r.reporter_name || "Anonymous"],
    ["Next checkup", r.closed_at ? "None, report closed" : r.checkup_due ? fmtDay(r.checkup_due) : "None planned"],
  ];
  if (hasCoords) {
    const href = `https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=17/${r.latitude}/${r.longitude}`;
    fields[1][1] = (
      <>
        {r.location_text && <>{r.location_text}<br /></>}
        <a href={href} target="_blank" rel="noreferrer">{fmtCoords(r.latitude!, r.longitude!)}</a>
      </>
    );
  }
  return (
    <div className="dialog-backdrop" onClick={onClose} style={{ zIndex: 50 }}>
      <div className="dialog" onClick={stop} role="dialog" aria-modal="true" aria-label={`Report #${r.id}`} style={{ width: "min(640px,100%)", maxHeight: "calc(100vh - 48px)", overflowY: "auto", padding: 0, gap: 0, scrollbarWidth: "thin", scrollbarColor: "var(--color-neutral-400) transparent" }}>
        <div style={{ position: "relative", height: 280, background: "var(--color-surface)", flex: "none" }}>
          <Photo src={src} alt={p.common} />
          <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 16, right: 16, width: 44, height: 44, borderRadius: "50%", border: "none", cursor: "pointer", background: "var(--color-bg)", color: "var(--color-text)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-md)" }}>
            <Icon name="x" />
          </button>
        </div>
        <div style={{ padding: "var(--space-8)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Report #{r.id}{!r.photo_url && " · reference photo, none was uploaded"}</span>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 30, lineHeight: 1.1 }}>{p.common}</span>
            <span style={{ fontSize: 15, fontStyle: "italic", color: "var(--color-accent-2-700)" }}>{p.latin}</span>
          </div>
          {due && (
            <div role="status" style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-md)", background: "var(--color-accent-100)", color: "var(--color-accent-800)", border: "1.5px solid var(--color-accent-400)" }}>
              <Icon name="alert" size={20} style={{ flex: "none", marginTop: 1 }} />
              <span style={{ fontSize: 14 }}>
                <strong>Checkup {dueFor(r.checkup_due!)}.</strong> Go back to the spot and record what you found below. Anyone can do this.
              </span>
            </div>
          )}
          {r.closed_at && (
            <div role="status" style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-md)", background: "var(--color-neutral-200)", color: "var(--color-neutral-800)", fontSize: 14 }}>
              <Icon name="check" size={18} style={{ flex: "none" }} />
              Closed on {fmtDate(r.closed_at)}: the plants were no longer there.
            </div>
          )}
          <div className="view-fields">
            {fields.map(([label, value]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <h6 style={{ margin: 0, color: "var(--color-accent-2-800)" }}>{label}</h6>
                <span style={{ fontSize: 15 }}>{value}</span>
              </div>
            ))}
          </div>
          {r.notes && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h6 style={{ margin: 0, color: "var(--color-accent-2-800)" }}>Notes</h6>
              <p style={{ margin: 0, fontSize: 15, textWrap: "pretty", whiteSpace: "pre-line" }}>{r.notes}</p>
            </div>
          )}
          {r.checkups.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h6 style={{ margin: 0, color: "var(--color-accent-2-800)" }}>Checkups</h6>
              {r.checkups.map((c, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                  <span style={{ fontSize: 15 }}>
                    {OUTCOME_LABELS[c.outcome]} <span style={{ color: "var(--color-neutral-700)" }}>· {c.checked_by} · {fmtDate(c.checked_at)}</span>
                  </span>
                  {c.notes && <p style={{ margin: 0, fontSize: 14, textWrap: "pretty", whiteSpace: "pre-line", paddingLeft: "var(--space-3)", borderLeft: "2px solid var(--color-divider)" }}>{c.notes}</p>}
                  {c.photo_urls.length > 0 && (
                    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                      {c.photo_urls.map((url, j) => (
                        <button key={url} onClick={() => setLb({ photos: c.photo_urls, i: j, title: `${OUTCOME_LABELS[c.outcome]} · ${c.checked_by}` })} aria-label={`Open photo ${j + 1}`} style={{ width: 64, height: 64, padding: 0, border: "none", borderRadius: "var(--radius-md)", overflow: "hidden", cursor: "pointer" }}>
                          <Photo src={url} washed={false} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {due && onCheckup && onPostpone && onEdit ? (
          <CheckupActions suggested={checkupDays ? { days: checkupDays, species: p.common } : undefined} onCheckup={onCheckup} onPostpone={onPostpone} onEdit={onEdit} />
        ) : onEdit && (
          <div className="view-actions" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
            <button className="view-btn view-btn-edit" onClick={onEdit}>
              <Icon name="pencil" size={18} />
              Edit report
            </button>
          </div>
        )}
      </div>
      {/* Inside the backdrop, so its clicks mustn't reach the backdrop and close the report too. */}
      {lb && (
        <div onClick={stop}>
          <Lightbox title={lb.title} subtitle={`Report #${r.id}`} images={lb.photos} index={lb.i} onIndex={(i) => setLb((l) => (l ? { ...l, i } : l))} onClose={() => setLb(null)} />
        </div>
      )}
    </div>
  );
}
