import PageHero from "@/components/layout/PageHero";
import Icon from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";
import type { LookAlike, Species } from "@/types/plant";

export default function PlantDetail({ plant: P, gi, setGi, onBack, onLookGallery }: {
  plant: Species; gi: number; setGi: (i: number) => void;
  onBack: () => void; onLookGallery: (l: LookAlike) => void;
}) {
  const srcs = P.photos;
  const heroSrc = srcs[gi] || srcs[0];
  const facts = [
    ["Família", P.family],
    ["Origem", P.native_range],
    ["Floração", P.flowering],
    ["Onde no Leça", P.habitat],
    ["Estatuto", P.legal_status],
  ];

  return (
    <>
    <PageHero image={srcs[0]} kicker={`Planta invasora · ${P.family}`} title={P.common_name}>
      <i>{P.latin_name}</i>
    </PageHero>
    <main className="page-main" style={{ paddingTop: 24, paddingBottom: 120, display: "flex", flexDirection: "column", gap: 40 }}>
      <button className="btn btn-ghost" onClick={onBack} style={{ alignSelf: "flex-start", marginLeft: -12, whiteSpace: "nowrap", flexShrink: 0 }}>
        <Icon name="arrowLeft" size={16} />
        Todas as plantas
      </button>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ width: "100%", height: "min(62vw,560px)", overflow: "hidden", background: "var(--color-surface)" }}>
          <Photo src={heroSrc} alt={P.common_name} />
        </div>
        <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", alignItems: "center" }}>
          {srcs.map((src, k) => (
            <button key={src} className="gallery-thumb" onClick={() => setGi(k)} aria-pressed={k === gi} aria-label={`Fotografia ${k + 1}`}>
              <Photo src={src} />
            </button>
          ))}
          <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Fotografias ilustrativas · Wikimedia Commons</span>
        </div>
      </section>

      <div className="detail-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 72, minWidth: 0 }}>
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <h2 className="section-title" style={{ margin: 0 }}>Características</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
              {P.characteristics.map(({ label, text }) => (
                <div key={label} className="char-row">
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 17, color: "var(--color-accent-2-700)" }}>{label}</span>
                  <p style={{ margin: 0, fontSize: 16, textWrap: "pretty" }}>{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <h2 className="section-title" style={{ margin: 0 }}>Plantas nativas parecidas</h2>
              <p style={{ margin: 0, fontSize: 16, color: "var(--color-neutral-700)", maxWidth: 560 }}>Plantas nativas que se podem confundir com esta espécie ({P.common_name}). Confirme estas diferenças antes de arrancar seja o que for.</p>
            </div>
            {P.look_alikes.map((l) => (
              <div key={l.id} style={{ background: "var(--color-wash)", borderLeft: "6px solid var(--color-accent-2-500)", padding: "var(--space-8)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                <div className="look-head">
                  <div style={{ width: 160, height: 120, flex: "none", overflow: "hidden", background: "var(--color-neutral-300)" }}>
                    <Photo src={l.photos[0]} alt={l.common_name} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>Nativa</span>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: 26, lineHeight: 1.1 }}>{l.common_name}</span>
                    <span style={{ fontSize: 15, fontStyle: "italic", color: "var(--color-accent-2-700)" }}>{l.latin_name}</span>
                  </div>
                  <button className="btn btn-secondary" onClick={() => onLookGallery(l)} style={{ marginLeft: "auto", alignSelf: "center", whiteSpace: "nowrap", flexShrink: 0, gap: 10, padding: "14px 26px", fontSize: 16 }}>
                    <Icon name="image" size={20} />
                    Mais fotografias
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "var(--space-8)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    <h6 style={{ margin: 0, color: "var(--color-neutral-700)" }}>Semelhanças</h6>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                      {l.shared_traits.map((t) => <span key={t} className="tag tag-outline" style={{ whiteSpace: "nowrap" }}>{t}</span>)}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    <h6 style={{ margin: 0, color: "var(--color-neutral-700)" }}>Como as distinguir</h6>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                      {l.differences.map((d) => (
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
            <h2 className="section-title" style={{ margin: 0 }}>Como remover</h2>
            <div style={{ background: "var(--color-accent-100)", borderLeft: "6px solid var(--color-accent)", padding: "var(--space-3) var(--space-6)", display: "flex", gap: "var(--space-3)", alignItems: "center", alignSelf: "flex-start" }}>
              <Icon name="alert" color="var(--color-accent-700)" style={{ flex: "none" }} />
              <span style={{ fontSize: 15, color: "var(--color-accent-800)" }}>{P.caution}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
              {P.removal_steps.map(({ title, text }, k) => (
                <div key={title} style={{ display: "flex", gap: "var(--space-6)", alignItems: "flex-start" }}>
                  <span style={{ width: 44, height: 44, flex: "none", borderRadius: "50%", background: "var(--color-blue)", color: "#fff", fontFamily: "var(--font-heading)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>{k + 1}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 8 }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: 19 }}>{title}</span>
                    <p style={{ margin: 0, fontSize: 16, textWrap: "pretty" }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside style={{ position: "sticky", top: 96, background: "var(--color-accent-2-600)", color: "#fff", padding: "var(--space-8)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <h3 style={{ margin: 0, fontSize: 24, color: "#fff" }}>Dados principais</h3>
          {facts.map(([label, value]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <h6 style={{ margin: 0, color: "var(--color-lime)" }}>{label}</h6>
              <span style={{ fontSize: 15 }}>{value}</span>
            </div>
          ))}
        </aside>
      </div>
    </main>
    </>
  );
}
