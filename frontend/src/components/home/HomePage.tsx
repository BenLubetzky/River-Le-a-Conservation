import PageHero from "@/components/layout/PageHero";
import SpeciesGrid from "@/components/species/SpeciesGrid";
import Icon from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";
import { photo, type PhotoName } from "@/data/photos";
import { isDue } from "@/lib/checkup";
import type { Species } from "@/types/plant";
import type { Report } from "@/types/report";

/**
 * The main page. Guardians open it to report a plant, so the plants come first, right under a slim
 * banner; the rest (ways in, figures, how to help) follows below.
 */
export default function HomePage({ species, speciesError, onRetry, reports, onOpenPlant, onReportPlant, onReport, onReports, onDue, onMap }: {
  species: Species[] | null; speciesError: string; onRetry: () => void;
  reports: Report[] | null;
  onOpenPlant: (i: number) => void;
  /** The report form, with this species chosen. */
  onReportPlant: (i: number) => void;
  onReport: () => void;
  onReports: () => void;
  /** The reports page, showing only those whose checkup is due. */
  onDue: () => void;
  onMap: () => void;
}) {
  const toPlants = () => document.getElementById("plantas")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const all = reports ?? [];
  const due = all.filter(isDue).length;
  const cards: { img: PhotoName; title: string; text: string; link: string; onClick: () => void }[] = [
    { img: "rio-leca-margem", title: "Plantas invasoras", text: "Aprenda a reconhecer as espécies que ameaçam as margens e a distingui-las das nativas.", link: "Conhecer as plantas", onClick: toPlants },
    { img: "rio-leca-verde", title: "Registos", text: "Todas as ocorrências registadas ao longo do rio, com fotografias e notas.", link: "Ver os registos", onClick: onReports },
    { img: "ponte-sao-lazaro", title: "Mapa", text: "Onde estão as plantas invasoras, do Monte Córdova até à foz.", link: "Abrir o mapa", onClick: onMap },
    { img: "rio-leca-caminho", title: "Verificações", text: "Volte aos locais registados e veja se as plantas ainda lá estão.", link: due ? `${due} por verificar` : "Ver verificações", onClick: onDue },
  ];
  const stats = reports && species
    ? [
      { figure: species.length, label: "espécies invasoras acompanhadas" },
      { figure: all.length, label: all.length === 1 ? "ocorrência registada" : "ocorrências registadas" },
      { figure: due, label: due === 1 ? "registo à espera de verificação" : "registos à espera de verificação" },
      { figure: all.filter((r) => r.closed_at).length, label: "locais onde as plantas já não existem" },
    ]
    : null;

  return (
    <main>
      <PageHero home image={photo("rio-leca-bosque")} kicker="Rio Leça · Porto" title="Plantas invasoras do Rio Leça">
        Viu uma destas plantas junto ao rio? Toque em Registar para a assinalar, ou abra a planta para a conhecer.
      </PageHero>

      {due > 0 && (
        <div className="section-inner" style={{ paddingTop: 24 }}>
          <button className="checkup-callout" onClick={onDue}>
            <span className="checkup-callout-icon"><Icon name="alert" size={22} /></span>
            <span style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "left", flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19 }}>{due} {due === 1 ? "registo precisa" : "registos precisam"} de verificação</span>
              <span className="callout-sub" style={{ fontSize: 14, opacity: 0.85 }}>Passa perto de algum destes locais? Veja se as plantas ainda lá estão.</span>
            </span>
            <span className="checkup-callout-cta">Ver</span>
          </button>
        </div>
      )}

      <section id="plantas" className="section" style={{ paddingTop: 36, scrollMarginTop: 72 }}>
        <div className="section-inner">
          {species ? (
            <SpeciesGrid species={species} onOpen={onOpenPlant} onReport={onReportPlant} />
          ) : speciesError ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 22 }}>Não foi possível carregar as plantas</span>
              <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{speciesError}</span>
              <button className="btn btn-secondary" onClick={onRetry}>Tentar novamente</button>
            </div>
          ) : (
            <span style={{ fontSize: 15, color: "var(--color-neutral-700)" }}>A carregar as plantas…</span>
          )}
        </div>
      </section>

      <section className="section section-wash">
        <div className="section-inner" style={{ display: "flex", flexDirection: "column", gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
            <span className="intro-mark" aria-hidden="true"><Reeds /></span>
            <h2 className="section-title" style={{ margin: 0 }}>O rio é de todos. Cuidamos dele juntos.</h2>
            <p className="section-lead">
              Cada ocorrência registada ajuda a perceber onde as invasoras se estão a espalhar e onde a remoção está a resultar.
            </p>
          </div>

          {stats && (
            <div className="stats">
              {stats.map((s) => (
                <div key={s.label} className="stat">
                  <span className="stat-figure">{s.figure}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="feature-cards">
            {cards.map((c) => (
              <button key={c.title} className="feature-card" onClick={c.onClick}>
                <div className="feature-card-img"><Photo src={photo(c.img, true)} washed={false} /></div>
                <div className="feature-card-body">
                  <span className="feature-card-title">{c.title}</span>
                  <span className="feature-card-text">{c.text}</span>
                  <span className="feature-card-link">{c.link}<Icon name="chevronRight" size={16} /></span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="help-band">
        <div className="help-photo" style={{ backgroundImage: `url("${photo("rio-leca-moinho")}")` }} role="img" aria-label="O Rio Leça entre árvores, junto a um moinho" />
        <div className="help-panel">
          <h2>Como pode ajudar</h2>
          <p>Viu uma planta invasora junto ao rio? Registe-a com uma fotografia. Passa perto de um local já registado? Verifique se as plantas ainda lá estão.</p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={onReport}>Registar ocorrência</button>
            <button className="btn btn-light btn-lg" onClick={onDue}>Fazer uma verificação</button>
          </div>
        </div>
      </section>
    </main>
  );
}

/** A small line drawing of reeds, as a decorative accent. */
function Reeds() {
  return (
    <svg width="56" height="44" viewBox="0 0 56 44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 42 C14 30 12 20 8 10" />
      <path d="M22 42 C22 28 23 16 26 4" />
      <path d="M32 42 C32 32 35 24 40 16" />
      <path d="M42 42 C41 34 44 28 50 24" />
      <ellipse cx="7.5" cy="8" rx="2.4" ry="5" transform="rotate(-20 7.5 8)" fill="currentColor" />
      <ellipse cx="26.5" cy="3.5" rx="2.4" ry="5" transform="rotate(12 26.5 3.5)" fill="currentColor" />
      <path d="M2 42 H54" />
    </svg>
  );
}
