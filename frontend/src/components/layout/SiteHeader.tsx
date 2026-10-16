import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/api/auth";
import Icon from "@/components/ui/Icon";
import Logo from "@/components/ui/Logo";

export type Page = "main" | "reports" | "map";

export default function SiteHeader({ page, onNavigate, username, dueCount }: {
  page: Page; onNavigate: (page: Page) => void; username: string;
  /** Reports whose checkup is due, shown as a badge on View reports. */
  dueCount: number;
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
    <header style={{ position: "sticky", top: 0, zIndex: 10, background: "color-mix(in srgb, var(--color-bg) 88%, transparent)", backdropFilter: "blur(8px)", borderBottom: "2px solid var(--color-text)" }}>
      <nav className="site-nav" style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--space-4) var(--space-8)", display: "flex", alignItems: "center", gap: "var(--space-8)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Logo size={30} />
          <span className="brand-name" style={{ fontFamily: "var(--font-heading)", fontSize: 19 }}>Monitorização Leça</span>
        </div>
        <div className="nav-links" style={{ display: "flex", gap: "var(--space-2)" }}>
          <a {...link("main")}>Main</a>
          <a {...link("reports")} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            View reports
            {dueCount > 0 && <span className="nav-badge" title={`${dueCount} need a checkup`} aria-label={`${dueCount} need a checkup`}>{dueCount}</span>}
          </a>
          <a {...link("map")}>Map</a>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span className="header-user" style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{username}</span>
          <button className="nav-pill" onClick={logOut} disabled={leaving} aria-label="Log out" title="Log out" style={{ border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="logOut" size={15} />
            <span className="logout-label">Log out</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
