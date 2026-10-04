// An invasive species with its field-guide content, as returned by GET /species
// (see backend/app/schemas/species.py). Photo lists are public URLs, main photo first.

export type Characteristic = { label: string; text: string };

export type RemovalStep = { title: string; text: string };

export type LookAlike = {
  id: string;
  common_name: string;
  latin_name: string;
  photos: string[];
  shared_traits: string[];
  differences: string[];
};

export type Species = {
  id: string;
  common_name: string;
  latin_name: string;
  local_name: string;
  family: string;
  native_range: string;
  flowering: string;
  habitat: string;
  legal_status: string;
  caution: string;
  photos: string[];
  characteristics: Characteristic[];
  removal_steps: RemovalStep[];
  look_alikes: LookAlike[];
};
