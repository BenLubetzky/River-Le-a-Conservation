"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { fetchMe, login } from "@/api/auth";
import Field from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Already logged in: skip straight to the guide.
  useEffect(() => {
    fetchMe().then(() => router.replace("/guide"), () => {});
  }, [router]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await login(username, password);
      router.replace("/guide");
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-8)", padding: "var(--space-8) 16px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", textAlign: "center" }}>
        <span style={{ width: 64, height: 64, borderRadius: 999, background: "var(--color-accent-2-600)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-md)" }}>
          <Icon name="leaf" size={30} color="var(--color-accent-2-100)" />
        </span>
        <h1 className="page-h1">Guardiões do Leça</h1>
        <span style={{ fontSize: 16, color: "var(--color-neutral-700)" }}>Invasive plants of the Rio Leça · Porto</span>
      </div>

      <form onSubmit={submit} className="card elev-md" style={{ width: "min(400px, 100%)", padding: "var(--space-8)", gap: "var(--space-6)" }}>
        <span className="dialog-title" style={{ fontSize: 26 }}>Log in</span>

        <Field label="Username" htmlFor="login-username">
          <input id="login-username" className="input" value={username} maxLength={50} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoFocus required style={{ minHeight: 44, fontSize: 15, background: "var(--color-bg)" }} />
        </Field>
        <Field label="Password" htmlFor="login-password">
          <input id="login-password" className="input" type="password" value={password} maxLength={200} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required style={{ minHeight: 44, fontSize: 15, background: "var(--color-bg)" }} />
        </Field>

        {error && (
          <div role="alert" style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)", fontSize: 14, display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <Icon name="alert" size={16} style={{ flex: "none" }} />
            {error}
          </div>
        )}

        <button type="submit" className="view-btn view-btn-edit" disabled={!username || !password || submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <span style={{ fontSize: 13, color: "var(--color-neutral-700)", textAlign: "center" }}>Accounts are created by the project team.</span>
    </main>
  );
}
