import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/api/auth";
import Icon from "@/components/ui/Icon";
import Logo from "@/components/ui/Logo";

export type Page = "main" | "reports" | "map";

export default function SiteHeader({ page, onNavigate, username, dueCount, onReport }: {
  page: Page; onNavigate: (page: Page) => void; username: string;
  /** Reports whose checkup is due, shown as a badge on View reports. */
  dueCount: number;
  /** Open the report form (the header's call to action). */
  onReport: () => void;
}) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const link = (target: Page) => ({
    href: "#",
    className: "nav-pill",
    "aria-current": page === target ? ("page" as const) : undefined,
    onClick: (e: MouseEvent) => {
      e.preventDefault();
      onNavigate(target);
    },
  });
  const logOut = async () => {
    setLeaving(true);
    // Back to the login page even if the server couldn't be reached.
    await logout().catch(() => {});
    router.replace("/");
  };

  return (
    <header className="site-header">
      <nav className="site-nav">
        <a href="#" className="brand" onClick={(e) => { e.preventDefault(); onNavigate("main"); }}>
          <Logo size={40} />
          <span className="brand-name">Monitorização Leça<small>Plantas invasoras do Rio Leça</small></span>
        </a>
        <div className="nav-links">
          <a {...link("main")}>Início</a>
          <a {...link("reports")} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Registos
            {dueCount > 0 && <span className="nav-badge" title={`${dueCount} a precisar de verificação`} aria-label={`${dueCount} a precisar de verificação`}>{dueCount}</span>}
          </a>
          <a {...link("map")}>Mapa</a>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span className="header-user" style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{username}</span>
          <button className="nav-pill" onClick={logOut} disabled={leaving} aria-label="Terminar sessão" title="Terminar sessão" style={{ border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="logOut" size={15} />
            <span className="logout-label">Sair</span>
          </button>
          <button className="btn btn-primary header-cta" onClick={onReport} style={{ gap: 8 }}>
            <Icon name="pin" size={16} />
            Registar ocorrência
          </button>
        </div>
      </nav>
    </header>
  );
}
