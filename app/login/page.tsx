"use client";

import { useMemo, useState } from "react";

export default function LoginPage() {
  const nextPath = useMemo(() => {
    if (typeof window === "undefined") return "/";
    const u = new URL(window.location.href);
    return u.searchParams.get("next") || "/";
  }, []);

  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pw }),
    });
    if (!res.ok) {
      setErr("비밀번호가 틀렸습니다.");
      return;
    }
    window.location.href = nextPath;
  }

  return (
    <main style={{ maxWidth: 560, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Audition Hub</h1>
      <p style={{ color: "#555", marginTop: 0 }}>비밀번호를 입력하면 접근 가능합니다.</p>
      <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />
        <button style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", background: "#fff" }}>
          Enter
        </button>
      </form>
      {err && <p style={{ color: "crimson", marginTop: 10 }}>{err}</p>}
    </main>
  );
}
