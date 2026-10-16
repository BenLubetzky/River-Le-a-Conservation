import type { Page } from "@/components/layout/SiteHeader";
import Logo from "@/components/ui/Logo";
import { PHOTO_CREDITS } from "@/data/photos";

export default function SiteFooter({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "flex", borderRadius: 999, boxShadow: "0 0 0 2px rgba(255, 255, 255, 0.85)" }}><Logo size={40} /></span>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19, color: "#fff" }}>Monitorização Leça</span>
          </div>
          <p style={{ margin: 0, maxWidth: 360 }}>
            Um projeto dos guardiões do Rio Leça para registar, acompanhar e remover as plantas invasoras ao longo das suas margens.
          </p>
        </div>
        <div>
          <h4>Explorar</h4>
          <ul className="footer-links">
            <li><button onClick={() => onNavigate("main")}>Plantas invasoras</button></li>
            <li><button onClick={() => onNavigate("reports")}>Registos</button></li>
            <li><button onClick={() => onNavigate("map")}>Mapa</button></li>
          </ul>
        </div>
        <div>
          <h4>Fotografias do Rio Leça</h4>
          <div className="footer-credits">
            {PHOTO_CREDITS.map((c) => (
              <span key={c.name}>
                <a href={c.source} target="_blank" rel="noreferrer">{c.title}</a> · {c.author} · {c.license}
              </span>
            ))}
            <span style={{ marginTop: 6 }}>Fotografias das espécies: Wikimedia Commons.</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">Rio Leça · Porto</div>
    </footer>
  );
}
