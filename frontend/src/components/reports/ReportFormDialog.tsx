import { useState, type ChangeEvent } from "react";
import { createReport, updateReport } from "@/api/reports";
import Field from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";
import { ABUNDANCE, PHENOLOGY, STAGE } from "@/data/reportOptions";
import { stop } from "@/lib/events";
import { fmtCoords, nowLocalInput, toLocalInput } from "@/lib/format";
import type { Species } from "@/types/plant";
import type { Abundance, Phenology, Report, Stage } from "@/types/report";

type ReportForm = {
  sp: number;
  query: string;
  list: boolean;
  photo: File | null;
  photoUrl: string;
  /** Editing: take the report's current photo off. */
  removePhoto: boolean;
  date: string;
  abundance: Abundance | "";
  stage: Stage | "";
  phenology: Phenology | "";
  coords: { lat: number; lng: number } | null;
  locating: boolean;
  locationError: string;
  locationText: string;
  notes: string;
  submitting: boolean;
  error: string;
  sent: boolean;
};

const emptyForm = (species: Species[], sp: number): ReportForm => {
  const p = species[sp];
  return {
    sp: p ? sp : -1, query: p ? p.common_name : "", list: false, photo: null, photoUrl: "", removePhoto: false, date: nowLocalInput(),
    abundance: "", stage: "", phenology: "", coords: null, locating: false, locationError: "", locationText: "",
    notes: "", submitting: false, error: "", sent: false,
  };
};

// The form filled in with an existing report, for editing it.
const formFrom = (species: Species[], r: Report): ReportForm => ({
  ...emptyForm(species, species.findIndex((p) => p.id === r.species_id)),
  photoUrl: r.photo_url ?? "",
  date: toLocalInput(new Date(r.observed_at)),
  abundance: r.abundance ?? "", stage: r.stage ?? "", phenology: r.phenology ?? "",
  coords: r.latitude != null && r.longitude != null ? { lat: r.latitude, lng: r.longitude } : null,
  locationText: r.location_text ?? "",
  notes: r.notes ?? "",
});

// Photos picked in this form are previewed through blob: URLs, which need releasing.
const releasePreview = (url: string) => {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
};

export default function ReportFormDialog({ species, username, initialSp, editing, onClose, onSaved }: {
  species: Species[];
  /** The logged-in user, who the report is saved under. */
  username: string;
  /** Index into `species` to preselect, or -1 for none. */
  initialSp: number;
  /** The report to edit. Without it, the form makes a new one. */
  editing?: Report;
  onClose: () => void;
  onSaved: (report: Report) => void;
}) {
  const [rep, setRepState] = useState<ReportForm>(() => (editing ? formFrom(species, editing) : emptyForm(species, initialSp)));
  const setRep = (patch: Partial<ReportForm>) => setRepState((r) => ({ ...r, ...patch }));
  const close = () => {
    releasePreview(rep.photoUrl);
    onClose();
  };
  const submit = async () => {
    if (rep.sp < 0 || !rep.date || rep.submitting) return;
    setRep({ submitting: true, error: "", list: false });
    try {
      const fields = {
        species_id: species[rep.sp].id,
        // The form's date is local wall-clock time; send it with the viewer's timezone.
        observed_at: new Date(rep.date).toISOString(),
        abundance: rep.abundance || undefined,
        stage: rep.stage || undefined,
        phenology: rep.phenology || undefined,
        latitude: rep.coords?.lat,
        longitude: rep.coords?.lng,
        location_text: rep.locationText.trim() || undefined,
        notes: rep.notes.trim() || undefined,
        photo: rep.photo ?? undefined,
      };
      if (editing) {
        onSaved(await updateReport(editing.id, { ...fields, remove_photo: rep.removePhoto }));
        close();
        return;
      }
      onSaved(await createReport(fields));
      setRep({ submitting: false, sent: true });
    } catch (e) {
      setRep({ submitting: false, error: (e as Error).message });
    }
  };

  const q = rep.query.trim().toLowerCase();
  const cur = rep.sp >= 0 ? species[rep.sp].common_name : "";
  const options = species.map((p, i) => ({ p, i })).filter(({ p }) => !q || q === cur.toLowerCase() || (p.common_name + " " + p.latin_name + " " + p.local_name).toLowerCase().includes(q));
  const groups = [
    { key: "abundance", label: "Abundance", opts: ABUNDANCE },
    { key: "stage", label: "State", opts: STAGE },
    { key: "phenology", label: "Flower or fruit", opts: PHENOLOGY },
  ] as const;
  const onPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setRep({ error: "That photo is larger than 10 MB. Please choose a smaller one." });
      return;
    }
    releasePreview(rep.photoUrl);
    setRep({ photo: file, photoUrl: URL.createObjectURL(file), error: "" });
  };
  const removePhoto = () => {
    releasePreview(rep.photoUrl);
    setRep({ photo: null, photoUrl: "", removePhoto: true });
  };
  const locate = () => {
    if (!("geolocation" in navigator)) {
      setRep({ locationError: "This browser can’t share its location." });
      return;
    }
    setRep({ locating: true, locationError: "" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setRep({ locating: false, coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      (err) => setRep({ locating: false, locationError: err.code === err.PERMISSION_DENIED ? "Location permission was denied." : "Couldn’t get your location. Try again." }),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const title = editing ? `Edit report #${editing.id}` : "Report an occurrence";

  return (
    <div className="dialog-backdrop" onClick={close} style={{ zIndex: 50 }}>
      <div className="dialog" onClick={stop} role="dialog" aria-modal="true" aria-label={title} style={{ width: "min(580px,100%)", maxHeight: "calc(100vh - 48px)", overflowY: "auto", padding: "var(--space-8)", gap: "var(--space-6)", scrollbarWidth: "thin", scrollbarColor: "var(--color-neutral-400) transparent" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-4)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="dialog-title" style={{ fontSize: 28 }}>{title}</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>Rio Leça · Porto</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={close} aria-label="Close"><Icon name="x" /></button>
        </div>

        {!rep.sent && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <Field label="Species" htmlFor="rep-species" style={{ position: "relative" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Icon name="search" size={16} color="var(--color-neutral-700)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
                <input
                  id="rep-species"
                  className="input"
                  value={rep.query}
                  onChange={(e) => setRep({ query: e.target.value, list: true, sp: -1 })}
                  onFocus={(e) => { e.target.select(); setRep({ list: true }); }}
                  placeholder="Search invasive species"
                  autoComplete="off"
                  style={{ paddingLeft: 38, paddingRight: 40, minHeight: 44, fontSize: 15 }}
                />
                <button onClick={() => setRep({ list: !rep.list })} aria-label="Show list" style={{ position: "absolute", right: 6, width: 32, height: 32, border: "none", background: "transparent", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text)" }}>
                  <Icon name="chevronDown" size={16} />
                </button>
              </div>
              {rep.list && (
                <div role="listbox" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 5, background: "var(--color-bg)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", padding: "var(--space-2)", maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                  {options.map(({ p, i }) => (
                    <button key={p.id} role="option" aria-selected={i === rep.sp} className="species-opt" onClick={() => setRep({ sp: i, query: p.common_name, list: false })}>
                      <span style={{ width: 32, height: 32, flex: "none", borderRadius: "50%", overflow: "hidden", background: "var(--color-surface)" }}>
                        <Photo src={p.photos[0]} />
                      </span>
                      <span style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 15 }}>{p.common_name}</span>
                        <span style={{ fontSize: 13, fontStyle: "italic", color: "var(--color-accent-2-700)" }}>{p.latin_name}</span>
                      </span>
                    </button>
                  ))}
                  {options.length === 0 && <span style={{ padding: 10, fontSize: 14, color: "var(--color-neutral-700)" }}>No species match “{rep.query}”</span>}
                </div>
              )}
            </Field>

            <Field label="Photo">
              <label className="photo-drop">
                <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={onPhoto} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
                <span style={{ width: 64, height: 64, flex: "none", borderRadius: "50%", overflow: "hidden", background: "var(--color-accent-2-200)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {rep.photoUrl ? <Photo src={rep.photoUrl} washed={false} /> : <Icon name="camera" size={24} color="var(--color-accent-2-800)" />}
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 16 }}>{rep.photoUrl ? "Change photo" : "Add a photo"}</span>
                  <span style={{ fontSize: 13, color: "var(--color-neutral-700)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rep.photo?.name || "JPEG, PNG, WebP or HEIC, up to 10 MB"}</span>
                </span>
              </label>
              {rep.photoUrl && (
                <button className="btn btn-ghost" onClick={removePhoto} style={{ padding: "4px 8px", fontSize: 13, marginTop: "var(--space-1)" }}>Remove photo</button>
              )}
            </Field>

            <Field label="Date and time" htmlFor="rep-date">
              <input id="rep-date" className="input" type="datetime-local" value={rep.date} max={nowLocalInput()} onChange={(e) => setRep({ date: e.target.value })} style={{ minHeight: 44, fontSize: 15 }} />
            </Field>

            <Field label="Location" htmlFor="rep-location">
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
                  <button className="btn btn-secondary" onClick={locate} disabled={rep.locating} style={{ gap: 8, padding: "10px 18px" }}>
                    <Icon name="pin" size={16} />
                    {rep.locating ? "Finding you…" : rep.coords ? "Update my location" : "Use my location"}
                  </button>
                  {rep.coords && (
                    <span style={{ fontSize: 14, display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      {fmtCoords(rep.coords.lat, rep.coords.lng)}
                      <button className="btn btn-ghost" onClick={() => setRep({ coords: null })} style={{ padding: "4px 8px", fontSize: 13 }}>Remove</button>
                    </span>
                  )}
                  {rep.locationError && <span style={{ fontSize: 13, color: "var(--color-accent-700)" }}>{rep.locationError}</span>}
                </div>
                <input id="rep-location" className="input" value={rep.locationText} maxLength={200} onChange={(e) => setRep({ locationText: e.target.value })} placeholder="Describe the spot (optional), e.g. right bank near the footbridge" style={{ minHeight: 44, fontSize: 15 }} />
              </div>
            </Field>

            {groups.map((g) => (
              <Field key={g.key} label={g.label}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                  {g.opts.map((o) => {
                    const on = rep[g.key] === o.value;
                    return <button key={o.value} className="chip" aria-pressed={on} onClick={() => setRep({ [g.key]: on ? "" : o.value })}>{o.label}</button>;
                  })}
                </div>
              </Field>
            ))}

            {/* Always the logged-in user: the API saves the report under them. */}
            <Field label="Reported by" htmlFor="rep-name">
              <input id="rep-name" className="input" value={username} readOnly style={{ minHeight: 44, fontSize: 15, color: "var(--color-neutral-700)", cursor: "default" }} />
            </Field>

            <Field label="Notes (optional)" htmlFor="rep-notes">
              <textarea id="rep-notes" className="input" value={rep.notes} maxLength={2000} onChange={(e) => setRep({ notes: e.target.value })} placeholder="Anything that helps: how it’s spreading, access, nearby landmarks…" style={{ fontSize: 15, borderRadius: "var(--radius-md)", paddingBlock: 10 }} />
            </Field>

            {rep.error && (
              <div role="alert" style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)", fontSize: 14, display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                <Icon name="alert" size={16} style={{ flex: "none" }} />
                {rep.error}
              </div>
            )}

            <div className="dialog-actions" style={{ marginTop: 0 }}>
              <button className="btn btn-ghost" onClick={close}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={rep.sp < 0 || !rep.date || rep.submitting}>{editing ? (rep.submitting ? "Saving…" : "Save changes") : rep.submitting ? "Sending…" : "Submit report"}</button>
            </div>
          </div>
        )}

        {rep.sent && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "var(--space-4)", padding: "var(--space-4) 0" }}>
            <span style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-accent-2-600)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="check" size={28} color="var(--color-accent-2-100)" />
            </span>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 24 }}>Thank you</span>
            <p style={{ margin: 0, fontSize: 15, textWrap: "pretty" }}>Your report of {cur} has been recorded.</p>
            <button className="btn btn-primary" onClick={close}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
