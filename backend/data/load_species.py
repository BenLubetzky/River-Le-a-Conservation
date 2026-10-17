"""Load the field-guide content in data/invasoras_draft.json into the database.

Run from the backend folder with `uv run python -m data.load_species`. It replaces every species and
native plant with what the file holds, in one transaction. Species that reports still point to can't
be removed, so if the file drops one of those the load stops and nothing changes.
"""
import json
from pathlib import Path

from sqlalchemy import delete

from app.database.session import SessionLocal
from app.models import (Characteristic, LookAlike, NativePlant, NativePlantPhoto, RemovalStep, Species,
                        SpeciesPhoto)

DATA = Path(__file__).with_name("invasoras_draft.json")
SPECIES_FIELDS = ("latin_name", "common_name", "local_name", "family", "native_range", "flowering", "habitat",
                  "legal_status", "caution", "display_order", "checkup_days")


def main() -> None:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    with SessionLocal.begin() as db:
        for table in (LookAlike, SpeciesPhoto, Characteristic, RemovalStep, NativePlantPhoto):
            db.execute(delete(table))
        db.execute(delete(NativePlant))
        db.execute(delete(Species).where(Species.id.not_in([s["id"] for s in data["species"]])))

        for n in data["native_plants"]:
            db.merge(NativePlant(id=n["id"], latin_name=n["latin_name"], common_name=n["common_name"],
                                 photos=[NativePlantPhoto(position=i, url=u) for i, u in enumerate(n["photos"])]))
        db.flush()

        for s in data["species"]:
            db.merge(Species(
                id=s["id"], **{f: s[f] for f in SPECIES_FIELDS},
                photos=[SpeciesPhoto(position=i, url=u) for i, u in enumerate(s["photos"])],
                characteristics=[Characteristic(position=i, label=c["label"], text=c["text"])
                                 for i, c in enumerate(s["characteristics"])],
                removal_steps=[RemovalStep(position=i, title=r["title"], text=r["text"])
                               for i, r in enumerate(s["removal_steps"])],
                look_alikes=[LookAlike(position=i, native_plant_id=l["native_plant_id"],
                                       shared_traits=l["shared_traits"], differences=l["differences"])
                             for i, l in enumerate(s["look_alikes"])],
            ))
    print(f"Loaded {len(data['species'])} species and {len(data['native_plants'])} native plants.")


if __name__ == "__main__":
    main()
