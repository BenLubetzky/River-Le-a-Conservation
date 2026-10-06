// Values the database stores for the report form's choices (see backend/app/models/enums.py).
export type Abundance = "single" | "few" | "patch" | "dense";
export type Stage = "seedling" | "young" | "mature" | "dying" | "treated";
export type Phenology = "none" | "flower" | "fruit" | "both";

export type Option<T extends string> = { value: T; label: string };

// A report as returned by the backend (see backend/app/schemas/report.py).
export type Report = {
  id: number;
  species_id: string;
  observed_at: string;
  abundance: Abundance | null;
  stage: Stage | null;
  phenology: Phenology | null;
  latitude: number | null;
  longitude: number | null;
  location_text: string | null;
  reporter_name: string | null;
  /** Who made it, and so who can edit it. Null for older reports and deleted users. */
  user_id: number | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
};

// What the report form sends to the backend.
export type NewReport = {
  species_id: string;
  observed_at: string;
  abundance?: Abundance;
  stage?: Stage;
  phenology?: Phenology;
  latitude?: number;
  longitude?: number;
  location_text?: string;
  notes?: string;
  photo?: File;
};
