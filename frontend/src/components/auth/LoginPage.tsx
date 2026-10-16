"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { fetchMe, login } from "@/api/auth";
import Field from "@/components/ui/Field";
import Icon from "@/components/ui/Icon";
import Logo from "@/components/ui/Logo";
import { photo } from "@/data/photos";

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
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-8)", padding: "var(--space-8) 16px", background: `linear-gradient(rgba(0, 32, 30, 0.55), rgba(0, 32, 30, 0.7)), url("${photo("rio-leca-bosque")}") center / cover` }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", textAlign: "center" }}>
        <span style={{ borderRadius: 999, display: "flex", boxShadow: "0 0 0 4px rgba(255, 255, 255, 0.9)" }}>
          <Logo size={64} />
        </span>
        <h1 className="page-h1" style={{ color: "#fff" }}>Monitorização Leça</h1>
        <span style={{ fontSize: 17, color: "rgba(255, 255, 255, 0.9)" }}>Plantas invasoras do Rio Leça · Porto</span>
      </div>

      <form onSubmit={submit} className="card elev-lg" style={{ width: "min(420px, 100%)", padding: "40px", gap: "var(--space-6)", borderTop: "6px solid var(--color-lime)" }}>
        <span className="dialog-title" style={{ fontSize: 28, color: "var(--color-heading)" }}>Iniciar sessão</span>

        <Field label="Nome de utilizador" htmlFor="login-username">
          <input id="login-username" className="input" value={username} maxLength={50} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoFocus required style={{ minHeight: 44, fontSize: 15, background: "#fff" }} />
        </Field>
        <Field label="Palavra-passe" htmlFor="login-password">
          <input id="login-password" className="input" type="password" value={password} maxLength={200} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required style={{ minHeight: 44, fontSize: 15, background: "#fff" }} />
        </Field>

        {error && (
          <div role="alert" style={{ background: "var(--color-accent-100)", color: "var(--color-accent-800)", borderRadius: "var(--radius-md)", padding: "var(--space-3) var(--space-4)", fontSize: 14, display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
            <Icon name="alert" size={16} style={{ flex: "none" }} />
            {error}
          </div>
        )}

        <button type="submit" className="view-btn view-btn-edit" disabled={!username || !password || submitting}>
          {submitting ? "A entrar…" : "Entrar"}
        </button>
      </form>

      <span style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.85)", textAlign: "center" }}>As contas são criadas pela equipa do projeto.</span>
    </main>
  );
}
