import { request } from "@/api/client";
import type { Species } from "@/types/plant";

export const fetchSpecies = () => request<Species[]>("/species");
