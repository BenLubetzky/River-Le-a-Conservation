import Photo from "@/components/ui/Photo";
import { PLANTS } from "@/data/plants";

export default function SpeciesGrid({ photos, onOpen }: { photos: Record<string, string>; onOpen: (i: number) => void }) {
  return (
    <main className="page-main">
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", maxWidth: 640, padding: "48px 0 64px" }}>
        <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>Rio Leça · Porto</span>
        <h1 className="page-h1">Invasive plants along the river</h1>
        <p style={{ fontSize: 17, margin: 0, color: "var(--color-neutral-700)", textWrap: "pretty" }}>Non-native species crowd out the plants and animals that depend on the Leça’s banks. Learn to recognise them.</p>
      </section>

      <section className="species-grid">
        {PLANTS.map((p, i) => (
          <button key={p.id} className="species-card" onClick={() => onOpen(i)}>
            <div className="species-circle">
              <Photo src={photos[p.latin]} alt={p.common} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 var(--space-2)" }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 21, lineHeight: 1.15 }}>{p.common}</span>
              <span style={{ fontSize: 14, fontStyle: "italic", color: "var(--color-accent-2-700)" }}>{p.latin}</span>
            </div>
          </button>
        ))}
      </section>
    </main>
  );
}
