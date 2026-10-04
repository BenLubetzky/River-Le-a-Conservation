import type { Species } from "@/types/plant";

/** Names to show for a species id; falls back to the id if the species isn't loaded or known. */
export const speciesNames = (species: Species[] | null, id: string) => {
  const s = species?.find((x) => x.id === id);
  return { common: s?.common_name ?? id, latin: s?.latin_name ?? "" };
};
