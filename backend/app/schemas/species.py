from pydantic import BaseModel

from app.models import Species


class CharacteristicOut(BaseModel):
    label: str
    text: str


class RemovalStepOut(BaseModel):
    title: str
    text: str


class LookAlikeOut(BaseModel):
    id: str
    common_name: str
    latin_name: str
    photos: list[str]
    shared_traits: list[str]
    differences: list[str]


class SpeciesOut(BaseModel):
    id: str
    common_name: str
    latin_name: str
    local_name: str
    family: str
    native_range: str
    flowering: str
    habitat: str
    legal_status: str
    caution: str
    photos: list[str]  # public URLs, main photo first
    characteristics: list[CharacteristicOut]
    removal_steps: list[RemovalStepOut]
    look_alikes: list[LookAlikeOut]

    @classmethod
    def from_model(cls, s: Species) -> "SpeciesOut":
        return cls(
            id=s.id, common_name=s.common_name, latin_name=s.latin_name, local_name=s.local_name,
            family=s.family, native_range=s.native_range, flowering=s.flowering, habitat=s.habitat,
            legal_status=s.legal_status, caution=s.caution,
            photos=[p.url for p in s.photos],
            characteristics=[CharacteristicOut(label=c.label, text=c.text) for c in s.characteristics],
            removal_steps=[RemovalStepOut(title=r.title, text=r.text) for r in s.removal_steps],
            look_alikes=[
                LookAlikeOut(
                    id=l.native_plant.id, common_name=l.native_plant.common_name, latin_name=l.native_plant.latin_name,
                    photos=[p.url for p in l.native_plant.photos],
                    shared_traits=l.shared_traits, differences=l.differences,
                )
                for l in s.look_alikes
            ],
        )
