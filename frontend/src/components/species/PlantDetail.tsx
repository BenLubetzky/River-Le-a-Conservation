import Icon from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";
import { PLANTS } from "@/data/plants";
import { photoSet } from "@/lib/photos";
import type { LookAlike } from "@/types/plant";

export default function PlantDetail({ sel, gi, setGi, photos, media, onBack, onLookGallery }: {
  sel: number; gi: number; setGi: (i: number) => void;
  photos: Record<string, string>; media: Record<string, string[]>;
  onBack: () => void; onLookGallery: (l: LookAlike) => void;
}) {
  const P = PLANTS[sel];
  const srcs = photoSet(photos, media, P.latin, 6);
  const heroSrc = srcs[gi] || srcs[0];
  const facts = [
    ["Local name", P.pt],
    ["Family", P.family],
    ["Native to", P.native],
    ["Flowering", P.flowering],
    ["Where on the Leça", P.habitat],
    ["Status", P.status],
  ];

  return (
    <main className="page-main" style={{ paddingBottom: 120, display: "flex", flexDirection: "column", gap: 48 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ alignSelf: "flex-start", marginLeft: -12, whiteSpace: "nowrap", flexShrink: 0 }}>
          <Icon name="arrowLeft" size={16} />
          All plants
        </button>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <span className="tag tag-accent">Invasive</span>
          <span className="tag tag-neutral">{P.family}</span>
        </div>
        <h1 className="detail-h1">{P.common}</h1>
        <span style={{ fontSize: 22, fontStyle: "italic", color: "var(--color-accent-2-700)" }}>{P.latin}</span>
      </div>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ width: "100%", height: "min(62vw,600px)", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--color-surface)" }}>
          <Photo src={heroSrc} alt={P.common} />
        </div>
        <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", alignItems: "center" }}>
          {srcs.map((src, k) => (
            <button key={src} className="gallery-thumb" onClick={() => setGi(k)} aria-pressed={k === gi} aria-label={`Photo ${k + 1}`}>
              <Photo src={src} />
            </button>
          ))}
          <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Demo photos · Wikimedia Commons</span>
        </div>
      </section>

      <div className="detail-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 72, minWidth: 0 }}>
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <h2 style={{ fontSize: 36, margin: 0 }}>Characteristics</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
              {P.chars.map(([label, text]) => (
                <div key={label} className="char-row">
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 17, color: "var(--color-accent-2-700)" }}>{label}</span>
                  <p style={{ margin: 0, fontSize: 16, textWrap: "pretty" }}>{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <h2 style={{ fontSize: 36, margin: 0 }}>Native look-alikes</h2>
              <p style={{ margin: 0, fontSize: 16, color: "var(--color-neutral-700)", maxWidth: 560 }}>Native plants that can be mistaken for {P.common}. Check these differences before removing anything.</p>
            </div>
            {P.look.map((l) => (
              <div key={l.latin} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                <div className="look-head">
                  <div style={{ width: 128, height: 128, flex: "none", borderRadius: "50%", overflow: "hidden", background: "var(--color-neutral-300)" }}>
                    <Photo src={photos[l.latin]} alt={l.common} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>Native</span>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: 26, lineHeight: 1.1 }}>{l.common}</span>
                    <span style={{ fontSize: 15, fontStyle: "italic", color: "var(--color-accent-2-700)" }}>{l.latin}</span>
                  </div>
                  <button className="btn btn-secondary" onClick={() => onLookGallery(l)} style={{ marginLeft: "auto", alignSelf: "center", whiteSpace: "nowrap", flexShrink: 0, gap: 10, padding: "14px 26px", fontSize: 16 }}>
                    <Icon name="image" size={20} />
                    More photos
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "var(--space-8)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    <h6 style={{ margin: 0, color: "var(--color-neutral-700)" }}>Looks similar</h6>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                      {l.shared.map((t) => <span key={t} className="tag tag-outline" style={{ whiteSpace: "nowrap" }}>{t}</span>)}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    <h6 style={{ margin: 0, color: "var(--color-neutral-700)" }}>How to tell them apart</h6>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                      {l.diffs.map((d) => (
                        <div key={d} style={{ display: "flex", gap: "var(--space-3)", alignItems: "baseline" }}>
                          <span style={{ width: 8, height: 8, flex: "none", borderRadius: "50%", background: "var(--color-accent)", transform: "translateY(-2px)" }} />
                          <span style={{ fontSize: 15, textWrap: "pretty" }}>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <h2 style={{ fontSize: 36, margin: 0 }}>Procedure</h2>
            <div style={{ background: "var(--color-accent-100)", borderRadius: 999, padding: "var(--space-3) var(--space-6)", display: "flex", gap: "var(--space-3)", alignItems: "center", alignSelf: "flex-start" }}>
              <Icon name="alert" color="var(--color-accent-700)" style={{ flex: "none" }} />
              <span style={{ fontSize: 15, color: "var(--color-accent-800)" }}>{P.caution}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
              {P.steps.map(([title, text], k) => (
                <div key={title} style={{ display: "flex", gap: "var(--space-6)", alignItems: "flex-start" }}>
                  <span style={{ width: 44, height: 44, flex: "none", borderRadius: "50%", background: "var(--color-accent-2-600)", color: "var(--color-accent-2-100)", fontFamily: "var(--font-heading)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>{k + 1}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 8 }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: 19 }}>{title}</span>
                    <p style={{ margin: 0, fontSize: 16, textWrap: "pretty" }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside style={{ position: "sticky", top: 96, background: "var(--color-accent-2-200)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <h3 style={{ margin: 0, fontSize: 24 }}>Key facts</h3>
          {facts.map(([label, value]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <h6 style={{ margin: 0, color: "var(--color-accent-2-800)" }}>{label}</h6>
              <span style={{ fontSize: 15 }}>{value}</span>
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}
