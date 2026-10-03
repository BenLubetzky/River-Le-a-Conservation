import type { Abundance, Option, Phenology, Stage } from "@/types/report";

// Choices on the report form, with the labels shown to people.
export const ABUNDANCE: Option<Abundance>[] = [
  { value: "single", label: "Single plant" },
  { value: "few", label: "Few (2–10)" },
  { value: "patch", label: "Patch (11–100)" },
  { value: "dense", label: "Dense stand (100+)" },
];

export const STAGE: Option<Stage>[] = [
  { value: "seedling", label: "Seedling" },
  { value: "young", label: "Young" },
  { value: "mature", label: "Mature" },
  { value: "dying", label: "Dying or dead" },
  { value: "treated", label: "Already treated" },
];

export const PHENOLOGY: Option<Phenology>[] = [
  { value: "none", label: "None" },
  { value: "flower", label: "In flower" },
  { value: "fruit", label: "In fruit" },
  { value: "both", label: "Both" },
];
