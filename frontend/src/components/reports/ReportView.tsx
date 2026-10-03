import type { ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";
import { plantById } from "@/data/plants";
import { ABUNDANCE, PHENOLOGY, STAGE } from "@/data/reportOptions";
import { stop } from "@/lib/events";
import { fmtCoords, fmtDate, labelOf } from "@/lib/format";
import type { Report } from "@/types/report";

export default function ReportView({ r, src, onClose }: { r: Report; src: string; onClose: () => void }) {
  const p = plantById(r.species_id);
  const hasCoords = r.latitude != null && r.longitude != null;
  const fields: [string, ReactNode][] = [
    ["Date and time", fmtDate(r.observed_at)],
    ["Location", r.location_text || (hasCoords ? "" : "Not specified")],
    ["Abundance", labelOf(ABUNDANCE, r.abundance)],
    ["State", labelOf(STAGE, r.stage)],
    ["Flower or fruit", labelOf(PHENOLOGY, r.phenology)],
    ["Reported by", r.reporter_name || "Anonymous"],
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
        </div>
      </div>
    </div>
  );
}
