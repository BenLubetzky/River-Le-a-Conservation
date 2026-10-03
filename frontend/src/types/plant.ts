export type LookAlike = {
  common: string;
  latin: string;
  shared: string[];
  diffs: string[];
};

export type Plant = {
  id: string;
  common: string;
  latin: string;
  pt: string;
  family: string;
  native: string;
  flowering: string;
  habitat: string;
  status: string;
  chars: [string, string][];
  look: LookAlike[];
  caution: string;
  steps: [string, string][];
};
