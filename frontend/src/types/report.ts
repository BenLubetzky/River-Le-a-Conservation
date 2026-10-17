import type { PreparedPhoto } from "@/lib/photos";

// Values the database stores for the report form's choices (see backend/app/models/enums.py).
export type Abundance = "single" | "few" | "patch" | "dense";
export type Stage = "seedling" | "young" | "mature" | "dying" | "treated";
export type Phenology = "none" | "flower" | "fruit" | "both";

export type Option<T extends string> = { value: T; label: string };

export type CheckupOutcome = "still_there" | "updated" | "gone" | "postponed";
export type Checkup = {
  outcome: CheckupOutcome; checked_by: string; checked_at: string; notes: string | null;
  photo_urls: string[];
  /** One per photo URL: its thumbnail, or the photo itself if it has none. */
  thumb_urls: string[];
};
// A checkup that needed no edit (POST /reports/{id}/checkup).
export type CheckupInput = { outcome: "still_there"; next_checkup: string | null } | { outcome: "gone" };
// A checkup that couldn't be done, moved to a later day (POST /reports/{id}/postpone).
export type PostponeInput = { next_checkup: string; notes?: string; photos: PreparedPhoto[] };

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
  /** The photo's thumbnail, or the photo itself if it has none. */
  thumb_url: string | null;
  created_at: string;
  /** Day ("YYYY-MM-DD") from which the spot should be checked again; null for none. */
  checkup_due: string | null;
  /** Set when a checkup found the plants gone. */
  closed_at: string | null;
  checkups: Checkup[];
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
  checkup_due?: string;
  photo?: File;
  photo_thumb?: File;
};
