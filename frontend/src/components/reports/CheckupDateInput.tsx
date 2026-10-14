import { useState } from "react";
import { daysFromToday, fmtDay, today } from "@/lib/checkup";

const daysUntil = (day: string) => Math.round((Date.parse(day) - Date.parse(today())) / 86_400_000);

/**
 * When to check a spot again, entered as a number of days from today (the date it lands on is
 * shown alongside), or none. `suggested` is the species' usual number of days.
 */
export default function CheckupDateInput({ id, value, onChange, suggested, noneLabel = "No checkup" }: {
  id: string;
  /** The checkup day, "YYYY-MM-DD", or "" for no checkup. */
  value: string;
  onChange: (value: string) => void;
  suggested?: { days: number; species: string };
  noneLabel?: string;
}) {
  // What's typed in the box. Kept separately so it can be empty or half-typed without turning the
  // checkup off; it follows `value` when that changes from outside (e.g. picking a species).
  const [text, setText] = useState(value ? String(daysUntil(value)) : "");
  const [shown, setShown] = useState(value);
  if (value !== shown) {
    setShown(value);
    setText(value ? String(daysUntil(value)) : "");
  }

  const type = (t: string) => {
    setText(t);
    const days = Number(t);
    if (Number.isInteger(days) && days >= 1 && days <= 3650) {
      const day = daysFromToday(days);
      setShown(day);
      onChange(day);
    }
  };
  const days = value ? daysUntil(value) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <label htmlFor={id} style={{ fontSize: 15 }}>Check again in</label>
        <input
          id={id}
          className="input"
          type="number"
          inputMode="numeric"
          min={1}
          max={3650}
          step={1}
          value={text}
          placeholder="—"
          onChange={(e) => type(e.target.value)}
          style={{ minHeight: 44, fontSize: 15, width: 96, textAlign: "center" }}
        />
        <span style={{ fontSize: 15 }}>{days === 1 ? "day" : "days"}</span>
        <span style={{ fontSize: 14, color: "var(--color-neutral-700)", flex: "1 1 auto" }}>{value ? `on ${fmtDay(value)}` : ""}</span>
        <button type="button" className="chip" aria-pressed={!value} onClick={() => onChange(value ? "" : daysFromToday(suggested?.days ?? 30))}>{noneLabel}</button>
      </div>
      {suggested ? (
        <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
          Usual for {suggested.species}: {suggested.days} days.
          {days !== suggested.days && (
            <button type="button" className="btn btn-ghost" onClick={() => onChange(daysFromToday(suggested.days))} style={{ padding: "2px 6px", fontSize: 13, marginLeft: 4 }}>Use this</button>
          )}
        </span>
      ) : (
        <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Choose a species to see its usual interval.</span>
      )}
    </div>
  );
}
