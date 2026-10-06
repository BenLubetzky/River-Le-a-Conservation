import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/api/auth";
import Icon from "@/components/ui/Icon";

export type Page = "main" | "reports";

export default function SiteHeader({ page, onNavigate, username }: { page: Page; onNavigate: (page: Page) => void; username: string }) {
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
          <span style={{ width: 30, height: 30, borderRadius: 999, background: "var(--color-accent-2-600)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="leaf" size={16} color="var(--color-accent-2-100)" />
          </span>
          <span className="brand-name" style={{ fontFamily: "var(--font-heading)", fontSize: 19 }}>Guardiões do Leça</span>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <a {...link("main")}>Main</a>
          <a {...link("reports")}>View reports</a>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span className="header-user" style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{username}</span>
          <button className="nav-pill" onClick={logOut} disabled={leaving} style={{ border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="logOut" size={15} />
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
}
