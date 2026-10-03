/* eslint-disable @next/next/no-img-element -- photos are hot-linked from Wikimedia */
import { useEffect } from "react";
import Icon from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";
import { stop } from "@/lib/events";

/** Full-screen photo viewer. Arrow keys step through the photos; Escape closes it. */
export default function Lightbox({ title, subtitle, images, index, onIndex, onClose }: {
  title: string;
  subtitle: string;
  images: string[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const n = images.length;
  const step = (d: number) => {
    if (n) onIndex((index + d + n) % n);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && n) onIndex((index - 1 + n) % n);
      if (e.key === "ArrowRight" && n) onIndex((index + 1) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, n, onIndex, onClose]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, background: "color-mix(in srgb, var(--color-neutral-900) 94%, transparent)", display: "flex", flexDirection: "column", padding: "var(--space-6)", gap: "var(--space-4)" }}>
      <div onClick={stop} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", color: "var(--color-neutral-100)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 24 }}>{title}</span>
          <span style={{ fontSize: 14, fontStyle: "italic", color: "var(--color-accent-2-300)" }}>{subtitle}</span>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 14, color: "var(--color-neutral-300)" }}>{n ? `${index + 1} / ${n}` : ""}</span>
        <button className="lb-btn" onClick={onClose} aria-label="Close" style={{ width: 44, height: 44 }}>
          <Icon name="x" size={20} />
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <button className="lb-btn" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous" style={{ width: 52, height: 52 }}>
          <Icon name="chevronLeft" size={22} />
        </button>
        <div style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {images[index] && <img src={images[index]} alt={title} onClick={stop} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "var(--radius-lg)" }} />}
          {!n && <span style={{ color: "var(--color-neutral-300)", fontSize: 15 }}>Loading photos…</span>}
        </div>
        <button className="lb-btn" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next" style={{ width: 52, height: 52 }}>
          <Icon name="chevronRight" size={22} />
        </button>
      </div>
      <div onClick={stop} style={{ display: "flex", justifyContent: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
        {images.map((src, k) => (
          <button key={src} onClick={() => onIndex(k)} onMouseEnter={() => onIndex(k)} aria-label={`Photo ${k + 1}`} style={{ width: 64, height: 64, padding: 0, borderRadius: "50%", overflow: "hidden", cursor: "pointer", background: "var(--color-neutral-800)", border: `3px solid ${k === index ? "var(--color-accent)" : "transparent"}`, opacity: k === index ? 1 : 0.6, transition: "opacity .2s" }}>
            <Photo src={src} washed={false} />
          </button>
        ))}
      </div>
    </div>
  );
}
