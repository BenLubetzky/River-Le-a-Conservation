from pydantic import BaseModel, ConfigDict


class SpeciesOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    latin_name: str
    common_name: str
