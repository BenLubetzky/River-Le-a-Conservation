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
      setError("Escolha uma data depois de hoje, ou nenhuma nova verificação.");
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
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 17 }}>O que encontrou no local?</span>
          <div className="checkup-choices">
            <button className="view-btn view-btn-edit" onClick={() => setMode("still")}><Icon name="check" size={18} />Ainda existe</button>
            <button className="view-btn view-btn-del" onClick={() => setMode("gone")}><Icon name="x" size={18} />Já não existe</button>
            <button className="view-btn view-btn-del" onClick={onEdit} style={{ borderColor: "var(--color-accent-2-400)", color: "var(--color-accent-2-800)" }}><Icon name="pencil" size={18} />Mudou</button>
            <button className="view-btn view-btn-del" onClick={() => setMode("postpone")} style={{ borderColor: "var(--color-neutral-400)", color: "var(--color-neutral-800)" }}><Icon name="calendar" size={18} />Não foi possível verificar</button>
          </div>
        </>
      )}
      {mode === "still" && (
        <>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 17 }}>Quando deve ser verificado de novo?</span>
          <CheckupDateInput id="checkup-next" value={next} onChange={setNext} suggested={suggested} noneLabel="Sem nova verificação" />
          <div className="dialog-actions" style={{ marginTop: 0 }}>
            <button className="btn btn-ghost" onClick={back} disabled={busy}>Voltar</button>
            <button className="btn btn-primary" onClick={() => send({ outcome: "still_there", next_checkup: next || null })} disabled={busy}>{busy ? "A guardar…" : "Confirmar: ainda existe"}</button>
          </div>
        </>
      )}
      {mode === "gone" && (
        <>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 17 }}>Encerrar este registo?</span>
          <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>Fica no arquivo, marcado como já não existente, e deixa de precisar de verificações.</span>
          <div className="dialog-actions" style={{ marginTop: 0 }}>
            <button className="btn btn-ghost" onClick={back} disabled={busy}>Voltar</button>
            <button className="btn btn-primary" onClick={() => send({ outcome: "gone" })} disabled={busy}>{busy ? "A guardar…" : "Confirmar: já não existe"}</button>
          </div>
        </>
      )}
      {mode === "postpone" && <PostponeCheckup onPostpone={onPostpone} onBack={back} />}
      {error && <span role="alert" style={{ fontSize: 14, color: "var(--color-accent-800)" }}>{error}</span>}
    </div>
  );
}
