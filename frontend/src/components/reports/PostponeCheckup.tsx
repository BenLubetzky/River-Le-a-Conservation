import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Icon from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";
import { daysFromToday, fmtDay, today } from "@/lib/checkup";
import { preparePhoto, type PreparedPhoto } from "@/lib/photos";
import type { PostponeInput } from "@/types/report";

const QUICK = [
  { label: "1 semana", days: 7 },
  { label: "2 semanas", days: 14 },
  { label: "3 semanas", days: 21 },
  { label: "1 mês", days: 30 },
];
const MAX_PHOTOS = 6; // matches the API

/**
 * The spot couldn't be checked: pick a later day to try again (a quick choice, or any date), and
 * optionally say why in a note and photos.
 */
export default function PostponeCheckup({ onPostpone, onBack }: {
  onPostpone: (c: PostponeInput) => Promise<void>;
  onBack: () => void;
}) {
  const [next, setNext] = useState(() => daysFromToday(7));
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<(PreparedPhoto & { url: string })[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Free the previews when the form goes away.
  const shown = useRef(photos);
  useEffect(() => {
    shown.current = photos;
  }, [photos]);
  useEffect(() => () => shown.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const addPhotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // so picking the same file again still fires
    if (photos.length + files.length > MAX_PHOTOS) {
      setError(`Adicione no máximo ${MAX_PHOTOS} fotografias.`);
      return;
    }
    setError("");
    setPreparing(true);
    try {
      // Shrunk, with thumbnails, before they're added.
      const prepared = await Promise.all(files.map(preparePhoto));
      const added = prepared.map((p) => ({ ...p, url: URL.createObjectURL(p.thumb ?? p.file) }));
      setPhotos((ps) => [...ps, ...added]);
    } catch (err) {
      setError((err as Error).message);
    }
    setPreparing(false);
  };
  const removePhoto = (i: number) => {
    URL.revokeObjectURL(photos[i].url);
    setPhotos(photos.filter((_, j) => j !== i));
  };

  const send = async () => {
    if (!next || next <= today()) {
      setError("Escolha uma data depois de hoje.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onPostpone({ next_checkup: next, notes: notes.trim() || undefined, photos: photos.map(({ file, thumb }) => ({ file, thumb })) });
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <>
      <span style={{ fontFamily: "var(--font-heading)", fontSize: 17 }}>Quando deve ser verificado?</span>
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        {QUICK.map((q) => {
          const day = daysFromToday(q.days);
          return <button key={q.days} type="button" className="chip" aria-pressed={next === day} onClick={() => setNext(day)}>{q.label}</button>;
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <label htmlFor="postpone-date" style={{ fontSize: 15 }}>Ou escolha uma data</label>
        <input
          id="postpone-date"
          className="input"
          type="date"
          min={daysFromToday(1)}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          style={{ minHeight: 44, fontSize: 15, width: "auto" }}
        />
        {next > today() && <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{fmtDay(next)}</span>}
      </div>
      <label htmlFor="postpone-notes" style={{ fontSize: 15, marginTop: "var(--space-2)" }}>
        Notas <span style={{ color: "var(--color-neutral-700)" }}>(opcional)</span>
      </label>
      <textarea
        id="postpone-notes"
        className="input"
        value={notes}
        maxLength={2000}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Porque não foi possível verificar? Caminho alagado, sem acesso, vedado…"
        style={{ fontSize: 15, borderRadius: "var(--radius-md)", paddingBlock: 10, minHeight: 88 }}
      />
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        {photos.map((p, i) => (
          <div key={p.url} style={{ position: "relative", width: 72, height: 72, borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <Photo src={p.url} washed={false} alt={p.file.name} />
            <button type="button" onClick={() => removePhoto(i)} aria-label={`Remover ${p.file.name}`} style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: "50%", border: "none", cursor: "pointer", background: "var(--color-bg)", color: "var(--color-text)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
        {preparing && <span style={{ alignSelf: "center", fontSize: 14, color: "var(--color-neutral-700)" }}>A preparar…</span>}
        {!preparing && photos.length < MAX_PHOTOS && (
          <label className="photo-add" title="Adicionar fotografias (opcional)">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple onChange={addPhotos} style={{ display: "none" }} />
            <Icon name="imagePlus" size={24} />
            <span style={{ fontSize: 12 }}>{photos.length ? "Mais" : "Fotografias"}</span>
          </label>
        )}
      </div>
      <div className="dialog-actions" style={{ marginTop: 0 }}>
        <button className="btn btn-ghost" onClick={onBack} disabled={busy}>Voltar</button>
        <button className="btn btn-primary" onClick={send} disabled={busy || preparing}>{busy ? "A guardar…" : "Confirmar: adiar"}</button>
      </div>
      {error && <span role="alert" style={{ fontSize: 14, color: "var(--color-accent-800)" }}>{error}</span>}
    </>
  );
}
