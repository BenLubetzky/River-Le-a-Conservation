import type { Abundance, Option, Phenology, Stage } from "@/types/report";

// Choices on the report form, with the labels shown to people.
export const ABUNDANCE: Option<Abundance>[] = [
  { value: "single", label: "Planta isolada" },
  { value: "few", label: "Poucas (2–10)" },
  { value: "patch", label: "Mancha (11–100)" },
  { value: "dense", label: "Povoamento denso (100+)" },
];

export const STAGE: Option<Stage>[] = [
  { value: "seedling", label: "Plântula" },
  { value: "young", label: "Jovem" },
  { value: "mature", label: "Adulta" },
  { value: "dying", label: "A morrer ou morta" },
  { value: "treated", label: "Já tratada" },
];

export const PHENOLOGY: Option<Phenology>[] = [
  { value: "none", label: "Nenhum" },
  { value: "flower", label: "Em flor" },
  { value: "fruit", label: "Com fruto" },
  { value: "both", label: "Ambos" },
];
