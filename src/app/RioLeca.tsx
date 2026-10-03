"use client";
/* eslint-disable @next/next/no-img-element -- photos are hot-linked from Wikimedia and user uploads (blob: URLs) */

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type MouseEvent, type ReactNode } from "react";
import { ABUND, DEMO_REPORTS, PHENO, PLANTS, STAGE, fmtDate, type LookAlike, type Report } from "./plants";

// Lucide icons, drawn at the design system's 2.75 stroke width.
const ICONS = {
  leaf: <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></>,
  arrowLeft: <><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>,
  arrowDown: <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>,
  image: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>,
  alert: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  eye: <><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></>,
  pencil: <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />,
  trash: <><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></>,
  x: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  pin: <><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></>,
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
};

function Icon({ name, size = 18, color = "currentColor", style }: { name: keyof typeof ICONS; size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

function Photo({ src, alt = "", washed = true, style }: { src?: string; alt?: string; washed?: boolean; style?: React.CSSProperties }) {
  if (!src) return null;
  return <img src={src} alt={alt} className={washed ? "washed" : undefined} style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} />;
}

const stop = (e: MouseEvent) => e.stopPropagation();
const fname = (u: string) => decodeURIComponent((u || "").split("?")[0].split("/").pop() || "").replace(/^\d+px-/, "");
const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

type Filters = { q: string; sp: string; ab: string; st: string; ph: string; sort: "new" | "old" };
const F0: Filters = { q: "", sp: "all", ab: "all", st: "all", ph: "all", sort: "new" };

type ReportForm = {
  editId?: number;
  sp: number;
  query: string;
  list: boolean;
  photo: string;
  photoName: string;
  date: string;
  abundance: string;
  stage: string;
  pheno: string;
  sent: boolean;
};

type Lightbox = { latin: string; common: string; i: number };

export default function RioLeca() {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [media, setMedia] = useState<Record<string, string[]>>({});
  const [page, setPage] = useState<"main" | "reports">("main");
  const [sel, setSel] = useState(-1);
  const [gi, setGi] = useState(0);
  const [reports, setReports] = useState<Report[]>(DEMO_REPORTS);
  const [f, setFilters] = useState<Filters>(F0);
  const [view, setView] = useState<number | null>(null);
  const [del, setDel] = useState<number | null>(null);
  const [rep, setRepState] = useState<ReportForm | null>(null);
  const [lb, setLb] = useState<Lightbox | null>(null);

  // ── Photos from Wikipedia / Wikimedia Commons ──
  const requested = useRef(new Set<string>());

  const loadSummary = useCallback((name: string) => {
    if (requested.current.has("s:" + name)) return;
    requested.current.add("s:" + name);
    fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(name.replace(/ /g, "_")))
      .then((r) => r.json())
      .then((d) => {
        const u = d.originalimage?.source || d.thumbnail?.source;
        if (u) setPhotos((p) => ({ ...p, [name]: u }));
      })
      .catch(() => {});
  }, []);

  const loadMediaList = useCallback((name: string) => {
    fetch("https://en.wikipedia.org/api/rest_v1/page/media-list/" + encodeURIComponent(name.replace(/ /g, "_")))
      .then((r) => r.json())
      .then((d) => {
        const urls = ((d.items || []) as { type: string; srcset?: { src: string }[] }[])
          .filter((i) => i.type === "image" && i.srcset && i.srcset.length)
          .map((i) => "https:" + i.srcset![i.srcset!.length - 1].src)
          .filter((u) => /\.(jpe?g)$/i.test(u) || /\.jpe?g\//i.test(u));
        setMedia((m) => ({ ...m, [name]: urls }));
      })
      .catch(() => {});
  }, []);

  const loadMedia = useCallback((name: string) => {
    if (requested.current.has("m:" + name)) return;
    requested.current.add("m:" + name);
    const cat = "https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=" + encodeURIComponent("Category:" + name) + "&gcmtype=file&gcmlimit=20&prop=imageinfo&iiprop=url|mime&iiurlwidth=1600&format=json&origin=*";
    fetch(cat)
      .then((r) => r.json())
      .then((d) => {
        const pages = Object.values(d.query?.pages || {}) as { imageinfo?: { mime: string; url: string; thumburl?: string }[] }[];
        const urls = pages.map((p) => p.imageinfo?.[0]).filter((i) => i && i.mime === "image/jpeg").map((i) => i!.thumburl || i!.url);
        if (urls.length) setMedia((m) => ({ ...m, [name]: urls }));
        else loadMediaList(name);
      })
      .catch(() => loadMediaList(name));
  }, [loadMediaList]);

  useEffect(() => {
    PLANTS.forEach((p) => loadSummary(p.latin));
  }, [loadSummary]);

  // ── Lightbox ──
  const lbImgs = (() => {
    if (!lb) return [];
    const main = photos[lb.latin] || "";
    const extra = (media[lb.latin] || []).filter((u) => fname(u) !== fname(main));
    return [main, ...extra].filter(Boolean).slice(0, 10);
  })();
  const lbStep = useCallback((d: number, n: number) => {
    if (n) setLb((l) => (l ? { ...l, i: (l.i + d + n) % n } : l));
  }, []);
  const openLb = (l: LookAlike) => {
    loadMedia(l.latin);
    setLb({ latin: l.latin, common: l.common, i: 0 });
  };

  const lbCount = lbImgs.length;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lb) return;
      if (e.key === "Escape") setLb(null);
      if (e.key === "ArrowLeft") lbStep(-1, lbCount);
      if (e.key === "ArrowRight") lbStep(1, lbCount);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb, lbCount, lbStep]);

  // ── Navigation ──
  const goMain = (e?: MouseEvent) => {
    e?.preventDefault();
    setSel(-1);
    setPage("main");
    window.scrollTo({ top: 0 });
  };
  const goReports = (e?: MouseEvent) => {
    e?.preventDefault();
    setSel(-1);
    setPage("reports");
    window.scrollTo({ top: 0 });
  };
  const openPlant = (i: number) => {
    const p = PLANTS[i];
    p.look.forEach((l) => loadSummary(l.latin));
    loadMedia(p.latin);
    setSel(i);
    setGi(0);
    window.scrollTo({ top: 0 });
  };

  // ── Report form ──
  const setRep = (patch: Partial<ReportForm>) => setRepState((r) => (r ? { ...r, ...patch } : r));
  const openReport = () => {
    const p = PLANTS[sel];
    setRepState({ sp: p ? sel : -1, query: p ? p.common : "", list: false, photo: "", photoName: "", date: nowLocal(), abundance: "", stage: "", pheno: "", sent: false });
  };
  const editReport = (id: number) => {
    const r = reports.find((x) => x.id === id);
    if (!r) return;
    setView(null);
    setRepState({ editId: id, sp: r.sp, query: PLANTS[r.sp].common, list: false, photo: r.photo || photos[PLANTS[r.sp].latin] || "", photoName: r.photo ? "Your photo" : "Current photo", date: r.date, abundance: r.abundance, stage: r.stage, pheno: r.pheno, sent: false });
  };
  const submitReport = () => {
    if (!rep) return;
    const data = { sp: rep.sp, date: rep.date, abundance: rep.abundance || "Not recorded", stage: rep.stage || "Not recorded", pheno: rep.pheno || "Not recorded" };
    if (rep.editId) {
      const keepPhoto = rep.photoName !== "Current photo";
      setReports((rs) => rs.map((x) => (x.id === rep.editId ? { ...x, ...data, photo: keepPhoto ? rep.photo : x.photo } : x)));
      setRepState(null);
      setView(rep.editId);
    } else {
      setReports((rs) => [{ id: Math.max(0, ...rs.map((x) => x.id)) + 1, ...data, photo: rep.photo, location: "Not specified", reporter: "You", notes: "" }, ...rs]);
      setRep({ sent: true, list: false });
    }
  };

  const srcOf = (r: Report) => r.photo || photos[PLANTS[r.sp].latin] || "";

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: "color-mix(in srgb, var(--color-bg) 88%, transparent)", backdropFilter: "blur(8px)", borderBottom: "2px solid var(--color-text)" }}>
        <nav className="site-nav" style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--space-4) var(--space-8)", display: "flex", alignItems: "center", gap: "var(--space-8)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span style={{ width: 30, height: 30, borderRadius: 999, background: "var(--color-accent-2-600)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="leaf" size={16} color="var(--color-accent-2-100)" />
            </span>
            <span className="brand-name" style={{ fontFamily: "var(--font-heading)", fontSize: 19 }}>Guardiões do Leça</span>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <a href="#" className="nav-pill" onClick={goMain} aria-current={page === "main" ? "page" : undefined}>Main</a>
            <a href="#" className="nav-pill" onClick={goReports} aria-current={page === "reports" ? "page" : undefined}>View reports</a>
          </div>
        </nav>
      </header>

      {page === "main" && sel < 0 && <SpeciesGrid photos={photos} onOpen={openPlant} />}

      {page === "main" && sel >= 0 && (
        <PlantDetail sel={sel} gi={gi} setGi={setGi} photos={photos} media={media} onBack={goMain} onLookGallery={openLb} />
      )}

      {page === "reports" && (
        <ReportsPage
          reports={reports}
          f={f}
          setFilters={setFilters}
          srcOf={srcOf}
          onView={setView}
          onEdit={editReport}
          onDelete={setDel}
        />
      )}

      {view != null && (() => {
        const vr = reports.find((x) => x.id === view);
        if (!vr) return null;
        return <ReportView r={vr} src={srcOf(vr)} onClose={() => setView(null)} onEdit={() => editReport(vr.id)} onDelete={() => setDel(vr.id)} />;
      })()}

      {del != null && (() => {
        const dr = reports.find((x) => x.id === del);
        if (!dr) return null;
        return (
          <div className="dialog-backdrop" onClick={() => setDel(null)} style={{ zIndex: 70 }}>
            <div className="dialog" onClick={stop} role="alertdialog" aria-modal="true" style={{ width: "min(440px,100%)" }}>
              <span className="dialog-title">Delete this report?</span>
              <p className="dialog-body" style={{ margin: 0 }}>The {PLANTS[dr.sp].common} report from {fmtDate(dr.date)} will be removed. This can’t be undone.</p>
              <div className="dialog-actions">
                <button className="btn btn-ghost" onClick={() => setDel(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => { setReports((rs) => rs.filter((x) => x.id !== del)); setDel(null); setView(null); }}>Delete</button>
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ position: "fixed", left: 0, right: 0, bottom: "var(--space-6)", display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 20 }}>
        <button className="btn btn-primary" onClick={openReport} style={{ pointerEvents: "auto", padding: "14px 28px", fontSize: 16, boxShadow: "var(--shadow-lg)", gap: 10, whiteSpace: "nowrap" }}>
          <Icon name="pin" />
          Report an occurrence
        </button>
      </div>

      {lb && (
        <div onClick={() => setLb(null)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "color-mix(in srgb, var(--color-neutral-900) 94%, transparent)", display: "flex", flexDirection: "column", padding: "var(--space-6)", gap: "var(--space-4)" }}>
          <div onClick={stop} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", color: "var(--color-neutral-100)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 24 }}>{lb.common}</span>
              <span style={{ fontSize: 14, fontStyle: "italic", color: "var(--color-accent-2-300)" }}>{lb.latin}</span>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 14, color: "var(--color-neutral-300)" }}>{lbImgs.length ? `${lb.i + 1} / ${lbImgs.length}` : ""}</span>
            <button className="lb-btn" onClick={() => setLb(null)} aria-label="Close" style={{ width: 44, height: 44 }}>
              <Icon name="x" size={20} />
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <button className="lb-btn" onClick={(e) => { e.stopPropagation(); lbStep(-1, lbImgs.length); }} aria-label="Previous" style={{ width: 52, height: 52 }}>
              <Icon name="chevronLeft" size={22} />
            </button>
            <div style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {lbImgs[lb.i] && <img src={lbImgs[lb.i]} alt={lb.common} onClick={stop} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "var(--radius-lg)" }} />}
              {!lbImgs.length && <span style={{ color: "var(--color-neutral-300)", fontSize: 15 }}>Loading photos…</span>}
            </div>
            <button className="lb-btn" onClick={(e) => { e.stopPropagation(); lbStep(1, lbImgs.length); }} aria-label="Next" style={{ width: 52, height: 52 }}>
              <Icon name="chevronRight" size={22} />
            </button>
          </div>
          <div onClick={stop} style={{ display: "flex", justifyContent: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
            {lbImgs.map((src, k) => (
              <button key={src} onClick={() => setLb({ ...lb, i: k })} onMouseEnter={() => setLb({ ...lb, i: k })} aria-label={`Photo ${k + 1}`} style={{ width: 64, height: 64, padding: 0, borderRadius: "50%", overflow: "hidden", cursor: "pointer", background: "var(--color-neutral-800)", border: `3px solid ${k === lb.i ? "var(--color-accent)" : "transparent"}`, opacity: k === lb.i ? 1 : 0.6, transition: "opacity .2s" }}>
                <Photo src={src} washed={false} />
              </button>
            ))}
          </div>
        </div>
      )}

      {rep && (
        <ReportFormDialog rep={rep} setRep={setRep} photos={photos} onClose={() => setRepState(null)} onSubmit={submitReport} />
      )}
    </div>
  );
}

// ── Main: grid of species ──

function SpeciesGrid({ photos, onOpen }: { photos: Record<string, string>; onOpen: (i: number) => void }) {
  return (
    <main className="page-main">
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", maxWidth: 640, padding: "48px 0 64px" }}>
        <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>Rio Leça · Porto</span>
        <h1 className="page-h1">Invasive plants along the river</h1>
        <p style={{ fontSize: 17, margin: 0, color: "var(--color-neutral-700)", textWrap: "pretty" }}>Non-native species crowd out the plants and animals that depend on the Leça’s banks. Learn to recognise them.</p>
      </section>

      <section className="species-grid">
        {PLANTS.map((p, i) => (
          <button key={p.id} className="species-card" onClick={() => onOpen(i)}>
            <div className="species-circle">
              <Photo src={photos[p.latin]} alt={p.common} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 var(--space-2)" }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 21, lineHeight: 1.15 }}>{p.common}</span>
              <span style={{ fontSize: 14, fontStyle: "italic", color: "var(--color-accent-2-700)" }}>{p.latin}</span>
            </div>
          </button>
        ))}
      </section>
    </main>
  );
}

// ── Main: one plant ──

function PlantDetail({ sel, gi, setGi, photos, media, onBack, onLookGallery }: {
  sel: number; gi: number; setGi: (i: number) => void;
  photos: Record<string, string>; media: Record<string, string[]>;
  onBack: () => void; onLookGallery: (l: LookAlike) => void;
}) {
  const P = PLANTS[sel];
  const main = photos[P.latin] || "";
  const extra = (media[P.latin] || []).filter((u) => fname(u) !== fname(main));
  const srcs = [main, ...extra].filter(Boolean).slice(0, 6);
  const heroSrc = srcs[gi] || main;
  const facts = [
    ["Local name", P.pt],
    ["Family", P.family],
    ["Native to", P.native],
    ["Flowering", P.flowering],
    ["Where on the Leça", P.habitat],
    ["Status", P.status],
  ];

  return (
    <main className="page-main" style={{ paddingBottom: 120, display: "flex", flexDirection: "column", gap: 48 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ alignSelf: "flex-start", marginLeft: -12, whiteSpace: "nowrap", flexShrink: 0 }}>
          <Icon name="arrowLeft" size={16} />
          All plants
        </button>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <span className="tag tag-accent">Invasive</span>
          <span className="tag tag-neutral">{P.family}</span>
        </div>
        <h1 className="detail-h1">{P.common}</h1>
        <span style={{ fontSize: 22, fontStyle: "italic", color: "var(--color-accent-2-700)" }}>{P.latin}</span>
      </div>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ width: "100%", height: "min(62vw,600px)", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--color-surface)" }}>
          <Photo src={heroSrc} alt={P.common} />
        </div>
        <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap", alignItems: "center" }}>
          {srcs.map((src, k) => (
            <button key={src} className="gallery-thumb" onClick={() => setGi(k)} aria-pressed={k === gi} aria-label={`Photo ${k + 1}`}>
              <Photo src={src} />
            </button>
          ))}
          <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Demo photos · Wikimedia Commons</span>
        </div>
      </section>

      <div className="detail-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 72, minWidth: 0 }}>
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <h2 style={{ fontSize: 36, margin: 0 }}>Characteristics</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
              {P.chars.map(([label, text]) => (
                <div key={label} className="char-row">
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 17, color: "var(--color-accent-2-700)" }}>{label}</span>
                  <p style={{ margin: 0, fontSize: 16, textWrap: "pretty" }}>{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <h2 style={{ fontSize: 36, margin: 0 }}>Native look-alikes</h2>
              <p style={{ margin: 0, fontSize: 16, color: "var(--color-neutral-700)", maxWidth: 560 }}>Native plants that can be mistaken for {P.common}. Check these differences before removing anything.</p>
            </div>
            {P.look.map((l) => (
              <div key={l.latin} style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                <div className="look-head">
                  <div style={{ width: 128, height: 128, flex: "none", borderRadius: "50%", overflow: "hidden", background: "var(--color-neutral-300)" }}>
                    <Photo src={photos[l.latin]} alt={l.common} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>Native</span>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: 26, lineHeight: 1.1 }}>{l.common}</span>
                    <span style={{ fontSize: 15, fontStyle: "italic", color: "var(--color-accent-2-700)" }}>{l.latin}</span>
                  </div>
                  <button className="btn btn-secondary" onClick={() => onLookGallery(l)} style={{ marginLeft: "auto", alignSelf: "center", whiteSpace: "nowrap", flexShrink: 0, gap: 10, padding: "14px 26px", fontSize: 16 }}>
                    <Icon name="image" size={20} />
                    More photos
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "var(--space-8)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    <h6 style={{ margin: 0, color: "var(--color-neutral-700)" }}>Looks similar</h6>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                      {l.shared.map((t) => <span key={t} className="tag tag-outline" style={{ whiteSpace: "nowrap" }}>{t}</span>)}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    <h6 style={{ margin: 0, color: "var(--color-neutral-700)" }}>How to tell them apart</h6>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                      {l.diffs.map((d) => (
                        <div key={d} style={{ display: "flex", gap: "var(--space-3)", alignItems: "baseline" }}>
                          <span style={{ width: 8, height: 8, flex: "none", borderRadius: "50%", background: "var(--color-accent)", transform: "translateY(-2px)" }} />
                          <span style={{ fontSize: 15, textWrap: "pretty" }}>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <h2 style={{ fontSize: 36, margin: 0 }}>Procedure</h2>
            <div style={{ background: "var(--color-accent-100)", borderRadius: 999, padding: "var(--space-3) var(--space-6)", display: "flex", gap: "var(--space-3)", alignItems: "center", alignSelf: "flex-start" }}>
              <Icon name="alert" color="var(--color-accent-700)" style={{ flex: "none" }} />
              <span style={{ fontSize: 15, color: "var(--color-accent-800)" }}>{P.caution}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
              {P.steps.map(([title, text], k) => (
                <div key={title} style={{ display: "flex", gap: "var(--space-6)", alignItems: "flex-start" }}>
                  <span style={{ width: 44, height: 44, flex: "none", borderRadius: "50%", background: "var(--color-accent-2-600)", color: "var(--color-accent-2-100)", fontFamily: "var(--font-heading)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>{k + 1}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 8 }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: 19 }}>{title}</span>
                    <p style={{ margin: 0, fontSize: 16, textWrap: "pretty" }}>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside style={{ position: "sticky", top: 96, background: "var(--color-accent-2-200)", borderRadius: "var(--radius-lg)", padding: "var(--space-8)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <h3 style={{ margin: 0, fontSize: 24 }}>Key facts</h3>
          {facts.map(([label, value]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <h6 style={{ margin: 0, color: "var(--color-accent-2-800)" }}>{label}</h6>
              <span style={{ fontSize: 15 }}>{value}</span>
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}

// ── Reports table ──

function ReportsPage({ reports, f, setFilters, srcOf, onView, onEdit, onDelete }: {
  reports: Report[]; f: Filters; setFilters: (fn: (f: Filters) => Filters) => void;
  srcOf: (r: Report) => string; onView: (id: number) => void; onEdit: (id: number) => void; onDelete: (id: number) => void;
}) {
  const setF = (patch: Partial<Filters>) => setFilters((s) => ({ ...s, ...patch }));
  const q = f.q.trim().toLowerCase();
  const list = reports
    .filter((r) => {
      const p = PLANTS[r.sp];
      if (f.sp !== "all" && String(r.sp) !== f.sp) return false;
      if (f.ab !== "all" && r.abundance !== f.ab) return false;
      if (f.st !== "all" && r.stage !== f.st) return false;
      if (f.ph !== "all" && r.pheno !== f.ph) return false;
      if (q && !(p.common + " " + p.latin + " " + r.location + " " + r.reporter).toLowerCase().includes(q)) return false;
      return true;
    })
    .sort((a, b) => (f.sort === "new" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
  const hasFilters = JSON.stringify({ ...f, sort: "new" }) !== JSON.stringify(F0);
  const clearFilters = () => setFilters((s) => ({ ...F0, sort: s.sort }));
  const opt = (all: string, values: string[]) => [{ value: "all", label: all }, ...values.map((v) => ({ value: v, label: v }))];
  const selects: { key: "sp" | "ab" | "st" | "ph"; label: string; options: { value: string; label: string }[] }[] = [
    { key: "sp", label: "Species", options: [{ value: "all", label: "All species" }, ...PLANTS.map((p, i) => ({ value: String(i), label: p.common }))] },
    { key: "ab", label: "Abundance", options: opt("Any abundance", ABUND) },
    { key: "st", label: "State", options: opt("Any state", STAGE) },
    { key: "ph", label: "Flower or fruit", options: opt("Any flower/fruit", PHENO) },
  ];

  return (
    <main className="page-main" style={{ paddingBottom: 140, display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "48px 0 8px", maxWidth: 640 }}>
        <span className="tag tag-accent-2" style={{ alignSelf: "flex-start" }}>Rio Leça · Porto</span>
        <h1 className="page-h1">Reports</h1>
        <p style={{ fontSize: 17, margin: 0, color: "var(--color-neutral-700)", textWrap: "pretty" }}>Every sighting of an invasive plant along the river. Open a report to see it in full, correct it or remove it.</p>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div className="filters">
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Icon name="search" size={16} color="var(--color-neutral-700)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
            <input className="input" value={f.q} onChange={(e) => setF({ q: e.target.value })} placeholder="Search place, reporter or species" aria-label="Search reports" style={{ paddingLeft: 38, minHeight: 44, fontSize: 15, width: "100%" }} />
          </div>
          {selects.map((s) => (
            <select key={s.key} className="input" value={f[s.key]} onChange={(e) => setF({ [s.key]: e.target.value })} aria-label={s.label} style={{ minHeight: 44, fontSize: 15, cursor: "pointer", width: "100%" }}>
              {s.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>
            {list.length === reports.length ? `${reports.length} reports` : `Showing ${list.length} of ${reports.length} reports`}
          </span>
          {hasFilters && <button className="btn btn-ghost" onClick={clearFilters} style={{ padding: "6px 12px", fontSize: 14 }}>Clear filters</button>}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span style={{ fontSize: 14, color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>Sort by date</span>
            <div role="group" aria-label="Sort by date" style={{ display: "flex", gap: 4, padding: 4, borderRadius: 999, background: "var(--color-surface)", boxShadow: "inset 0 0 0 1.5px var(--color-divider)" }}>
              {([["new", "Newest first"], ["old", "Oldest first"]] as const).map(([k, label]) => (
                <button key={k} className="sort-opt" onClick={() => setF({ sort: k })} aria-pressed={f.sort === k}>
                  <Icon name="arrowDown" size={15} style={{ transform: k === "new" ? "none" : "rotate(180deg)" }} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ overflowX: "auto", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: "var(--space-2) var(--space-4)" }}>
        <table className="table" style={{ width: "100%", minWidth: 860 }}>
          <thead>
            <tr>
              <th>Species</th><th>Date</th><th>Location</th><th>Abundance</th><th>State</th><th>Flower or fruit</th><th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="report-row" onClick={() => onView(r.id)}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <span style={{ width: 44, height: 44, flex: "none", borderRadius: "50%", overflow: "hidden", background: "var(--color-neutral-300)" }}>
                      <Photo src={srcOf(r)} />
                    </span>
                    <span style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, whiteSpace: "nowrap" }}>{PLANTS[r.sp].common}</span>
                      <span style={{ fontSize: 13, fontStyle: "italic", color: "var(--color-accent-2-700)", whiteSpace: "nowrap" }}>{PLANTS[r.sp].latin}</span>
                    </span>
                  </div>
                </td>
                <td style={{ whiteSpace: "nowrap" }}>{fmtDate(r.date)}</td>
                <td>{r.location}</td>
                <td><span className="tag tag-neutral" style={{ whiteSpace: "nowrap" }}>{r.abundance}</span></td>
                <td><span className="tag tag-outline" style={{ whiteSpace: "nowrap" }}>{r.stage}</span></td>
                <td><span className="tag tag-accent-2" style={{ whiteSpace: "nowrap" }}>{r.pheno}</span></td>
                <td onClick={stop}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-1)" }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => onView(r.id)} aria-label="View" title="View"><Icon name="eye" /></button>
                    <button className="btn btn-ghost btn-icon" onClick={() => onEdit(r.id)} aria-label="Edit" title="Edit"><Icon name="pencil" /></button>
                    <button className="btn btn-ghost btn-icon" onClick={() => onDelete(r.id)} aria-label="Delete" title="Delete" style={{ color: "var(--color-accent-700)" }}><Icon name="trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <div style={{ padding: "48px var(--space-4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>No reports match these filters</span>
            <button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>
          </div>
        )}
      </section>
    </main>
  );
}

// ── Single report ──

function ReportView({ r, src, onClose, onEdit, onDelete }: { r: Report; src: string; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const p = PLANTS[r.sp];
  const fields = [["Date and time", fmtDate(r.date)], ["Location", r.location], ["Abundance", r.abundance], ["State", r.stage], ["Flower or fruit", r.pheno], ["Reported by", r.reporter]];
  return (
    <div className="dialog-backdrop" onClick={onClose} style={{ zIndex: 50 }}>
      <div className="dialog" onClick={stop} role="dialog" aria-modal="true" aria-label={`Report #${r.id}`} style={{ width: "min(640px,100%)", maxHeight: "calc(100vh - 48px)", overflowY: "auto", padding: 0, gap: 0, scrollbarWidth: "thin", scrollbarColor: "var(--color-neutral-400) transparent" }}>
        <div style={{ position: "relative", height: 280, background: "var(--color-surface)", flex: "none" }}>
          <Photo src={src} alt={p.common} />
          <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 16, right: 16, width: 44, height: 44, borderRadius: "50%", border: "none", cursor: "pointer", background: "var(--color-bg)", color: "var(--color-text)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-md)" }}>
            <Icon name="x" />
          </button>
        </div>
        <div style={{ padding: "var(--space-8)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Report #{r.id}</span>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 30, lineHeight: 1.1 }}>{p.common}</span>
            <span style={{ fontSize: 15, fontStyle: "italic", color: "var(--color-accent-2-700)" }}>{p.latin}</span>
          </div>
          <div className="view-fields">
            {fields.map(([label, value]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <h6 style={{ margin: 0, color: "var(--color-accent-2-800)" }}>{label}</h6>
                <span style={{ fontSize: 15 }}>{value}</span>
              </div>
            ))}
          </div>
          {r.notes && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h6 style={{ margin: 0, color: "var(--color-accent-2-800)" }}>Notes</h6>
              <p style={{ margin: 0, fontSize: 15, textWrap: "pretty" }}>{r.notes}</p>
            </div>
          )}
        </div>
        <div className="view-actions">
          <button className="view-btn view-btn-del" onClick={onDelete}>
            <Icon name="trash" />
            Delete
          </button>
          <button className="view-btn view-btn-edit" onClick={onEdit}>
            <Icon name="pencil" />
            Edit report
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Report an occurrence / edit report ──

function Field({ label, children, style }: { label: ReactNode; children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="field" style={style}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function ReportFormDialog({ rep, setRep, photos, onClose, onSubmit }: {
  rep: ReportForm; setRep: (patch: Partial<ReportForm>) => void; photos: Record<string, string>;
  onClose: () => void; onSubmit: () => void;
}) {
  const q = rep.query.trim().toLowerCase();
  const cur = rep.sp >= 0 ? PLANTS[rep.sp].common : "";
  const options = PLANTS.map((p, i) => ({ p, i })).filter(({ p }) => !q || q === cur.toLowerCase() || (p.common + " " + p.latin + " " + p.pt).toLowerCase().includes(q));
  const groups: { key: "abundance" | "stage" | "pheno"; label: string; opts: string[] }[] = [
    { key: "abundance", label: "Abundance", opts: ABUND },
    { key: "stage", label: "State", opts: STAGE },
    { key: "pheno", label: "Flower or fruit", opts: PHENO },
  ];
  const onPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) setRep({ photo: URL.createObjectURL(file), photoName: file.name });
  };

  return (
    <div className="dialog-backdrop" onClick={onClose} style={{ zIndex: 50 }}>
      <div className="dialog" onClick={stop} role="dialog" aria-modal="true" aria-label={rep.editId ? "Edit report" : "Report an occurrence"} style={{ width: "min(580px,100%)", maxHeight: "calc(100vh - 48px)", overflowY: "auto", padding: "var(--space-8)", gap: "var(--space-6)", scrollbarWidth: "thin", scrollbarColor: "var(--color-neutral-400) transparent" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-4)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="dialog-title" style={{ fontSize: 28 }}>{rep.editId ? "Edit report" : "Report an occurrence"}</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>Rio Leça · Porto</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>

        {!rep.sent && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <Field label="Species" style={{ position: "relative" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Icon name="search" size={16} color="var(--color-neutral-700)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
                <input
                  className="input"
                  value={rep.query}
                  onChange={(e) => setRep({ query: e.target.value, list: true, sp: -1 })}
                  onFocus={(e) => { e.target.select(); setRep({ list: true }); }}
                  placeholder="Search invasive species"
                  aria-label="Species"
                  style={{ paddingLeft: 38, paddingRight: 40, minHeight: 44, fontSize: 15 }}
                />
                <button onClick={() => setRep({ list: !rep.list })} aria-label="Show list" style={{ position: "absolute", right: 6, width: 32, height: 32, border: "none", background: "transparent", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text)" }}>
                  <Icon name="chevronDown" size={16} />
                </button>
              </div>
              {rep.list && (
                <div role="listbox" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 5, background: "var(--color-bg)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", padding: "var(--space-2)", maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                  {options.map(({ p, i }) => (
                    <button key={p.id} role="option" aria-selected={i === rep.sp} className="species-opt" onClick={() => setRep({ sp: i, query: p.common, list: false })}>
                      <span style={{ width: 32, height: 32, flex: "none", borderRadius: "50%", overflow: "hidden", background: "var(--color-surface)" }}>
                        <Photo src={photos[p.latin]} />
                      </span>
                      <span style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 15 }}>{p.common}</span>
                        <span style={{ fontSize: 13, fontStyle: "italic", color: "var(--color-accent-2-700)" }}>{p.latin}</span>
                      </span>
                    </button>
                  ))}
                  {options.length === 0 && <span style={{ padding: 10, fontSize: 14, color: "var(--color-neutral-700)" }}>No species match “{rep.query}”</span>}
                </div>
              )}
            </Field>

            <Field label="Photo">
              <label className="photo-drop">
                <input type="file" accept="image/*" onChange={onPhoto} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
                <span style={{ width: 64, height: 64, flex: "none", borderRadius: "50%", overflow: "hidden", background: "var(--color-accent-2-200)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {rep.photo ? <Photo src={rep.photo} washed={false} /> : <Icon name="camera" size={24} color="var(--color-accent-2-800)" />}
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 16 }}>{rep.photo ? "Change photo" : "Add a photo"}</span>
                  <span style={{ fontSize: 13, color: "var(--color-neutral-700)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rep.photoName || "Choose an image from your computer"}</span>
                </span>
              </label>
            </Field>

            <Field label="Date and time">
              <input className="input" type="datetime-local" value={rep.date} onChange={(e) => setRep({ date: e.target.value })} aria-label="Date and time" style={{ minHeight: 44, fontSize: 15 }} />
            </Field>

            {groups.map((g) => (
              <Field key={g.key} label={g.label}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                  {g.opts.map((v) => (
                    <button key={v} className="chip" aria-pressed={rep[g.key] === v} onClick={() => setRep({ [g.key]: v })}>{v}</button>
                  ))}
                </div>
              </Field>
            ))}

            <div className="dialog-actions" style={{ marginTop: 0 }}>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={onSubmit} disabled={rep.sp < 0 || !rep.date}>{rep.editId ? "Save changes" : "Submit report"}</button>
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
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
