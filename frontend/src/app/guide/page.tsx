"use client";

import RioLeca from "@/components/RioLeca";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function Guide() {
  const { user, error, retry } = useCurrentUser();

  if (!user) {
    return (
      <main className="page-main" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", paddingTop: 120, textAlign: "center" }}>
        {error ? (
          <>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 22 }}>Couldn’t check your login</span>
            <span style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>{error}</span>
            <button className="btn btn-secondary" onClick={retry}>Try again</button>
          </>
        ) : (
          <span style={{ fontSize: 15, color: "var(--color-neutral-700)" }}>Loading…</span>
        )}
      </main>
    );
  }
  return <RioLeca user={user} />;
}
