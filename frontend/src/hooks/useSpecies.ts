import { useCallback, useEffect, useState } from "react";
import { fetchSpecies } from "@/api/species";
import type { Species } from "@/types/plant";

/** The invasive species and their content from the backend. `species` is null while loading. */
export function useSpecies() {
  const [species, setSpecies] = useState<Species[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetchSpecies().then(setSpecies, (e: Error) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const reload = () => {
    setError("");
    load();
  };

  return { species, error, reload };
}
