import Photo from "@/components/ui/Photo";
import type { Species } from "@/types/plant";

/** A card per invasive species: photo, then its names. */
export default function SpeciesGrid({ species, onOpen }: { species: Species[]; onOpen: (i: number) => void }) {
  return (
    <div className="species-grid">
      {species.map((p, i) => (
        <button key={p.id} className="species-card" onClick={() => onOpen(i)}>
          <div className="species-circle">
            <Photo src={p.photos[0]} alt={p.common_name} />
          </div>
          <div className="species-card-body">
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 22, lineHeight: 1.2, color: "var(--color-heading)" }}>{p.common_name}</span>
            <span style={{ fontSize: 15, fontStyle: "italic", color: "var(--color-neutral-700)" }}>{p.latin_name}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
