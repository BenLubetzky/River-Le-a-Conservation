import Icon from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";
import type { Species } from "@/types/plant";

/**
 * A card per invasive species: photo and names open its page; the button under them goes straight
 * to the report form with that species chosen.
 */
export default function SpeciesGrid({ species, onOpen, onReport }: {
  species: Species[];
  onOpen: (i: number) => void;
  onReport: (i: number) => void;
}) {
  return (
    <div className="species-grid">
      {species.map((p, i) => (
        <div key={p.id} className="species-card">
          <button className="species-card-open" onClick={() => onOpen(i)}>
            <div className="species-circle">
              <Photo src={p.photos[0]} alt={p.common_name} />
            </div>
            <div className="species-card-body">
              <span className="species-name">{p.common_name}</span>
              <span className="species-latin">{p.latin_name}</span>
            </div>
          </button>
          <button className="species-card-report" onClick={() => onReport(i)} aria-label={`Registar ocorrência de ${p.common_name}`}>
            <Icon name="pin" size={17} />
            Registar
          </button>
        </div>
      ))}
    </div>
  );
}
