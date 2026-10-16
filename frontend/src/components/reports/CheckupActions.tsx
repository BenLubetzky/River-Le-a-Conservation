import { useState } from "react";
import CheckupDateInput from "@/components/reports/CheckupDateInput";
import PostponeCheckup from "@/components/reports/PostponeCheckup";
import Icon from "@/components/ui/Icon";
import { daysFromToday, today } from "@/lib/checkup";
import type { CheckupInput, PostponeInput } from "@/types/report";

/**
 * The checkup choices for a due report, at the bottom of the report view: still there (and when
 * to check again), gone (closes the report), update the report through the edit form, or couldn't
 * check (moves the checkup to a later day).
 */
export default function CheckupActions({ suggested, onCheckup, onPostpone, onEdit }: {
  suggested?: { days: number; species: string };
  onCheckup: (c: CheckupInput) => Promise<void>;
  onPostpone: (c: PostponeInput) => Promise<void>;
  onEdit: () => void;
}) {
  const [mode, setMode] = useState<"choose" | "still" | "gone" | "postpone">("choose");
  const [next, setNext] = useState(() => daysFromToday(suggested?.days ?? 90));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const send = async (c: CheckupInput) => {
    if (c.outcome === "still_there" && c.next_checkup && c.next_checkup <= today()) {
      setError("Choose a date after today, or no further checkup.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onCheckup(c);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };
  const back = () => {
    setMode("choose");
    setError("");
  };

  return (
    <div className="view-actions" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {mode === "choose" && (
        <>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 17 }}>What did you find there?</span>
          <div className="checkup-choices">
            <button className="view-btn view-btn-edit" onClick={() => setMode("still")}><Icon name="check" size={18} />Still there</button>
            <button className="view-btn view-btn-del" onClick={() => setMode("gone")}><Icon name="x" size={18} />No longer there</button>
            <button className="view-btn view-btn-del" onClick={onEdit} style={{ borderColor: "var(--color-accent-2-400)", color: "var(--color-accent-2-800)" }}><Icon name="pencil" size={18} />It changed</button>
            <button className="view-btn view-btn-del" onClick={() => setMode("postpone")} style={{ borderColor: "var(--color-neutral-400)", color: "var(--color-neutral-800)" }}><Icon name="calendar" size={18} />Couldn’t check</button>
          </div>
        </>
      )}
      {mode === "still" && (
        <>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 17 }}>When should it be checked again?</span>
          <CheckupDateInput id="checkup-next" value={next} onChange={setNext} suggested={suggested} noneLabel="No further checkup" />
          <div className="dialog-actions" style={{ marginTop: 0 }}>
            <button className="btn btn-ghost" onClick={back} disabled={busy}>Back</button>
            <button className="btn btn-primary" onClick={() => send({ outcome: "still_there", next_checkup: next || null })} disabled={busy}>{busy ? "Saving…" : "Confirm: still there"}</button>
          </div>
        </>
      )}
      {mode === "gone" && (
        <>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 17 }}>Close this report?</span>
          <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>It stays in the records, marked as no longer there, and won’t need checkups any more.</span>
          <div className="dialog-actions" style={{ marginTop: 0 }}>
            <button className="btn btn-ghost" onClick={back} disabled={busy}>Back</button>
            <button className="btn btn-primary" onClick={() => send({ outcome: "gone" })} disabled={busy}>{busy ? "Saving…" : "Confirm: no longer there"}</button>
          </div>
        </>
      )}
      {mode === "postpone" && <PostponeCheckup onPostpone={onPostpone} onBack={back} />}
      {error && <span role="alert" style={{ fontSize: 14, color: "var(--color-accent-800)" }}>{error}</span>}
    </div>
  );
}
