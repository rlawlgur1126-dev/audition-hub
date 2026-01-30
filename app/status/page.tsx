"use client";

import { useEffect, useState } from "react";

type SourceStatus = {
  source: string;
  ok: boolean;
  count?: number;
  error?: string;
  hint?: string;
};

export default function StatusPage() {
  const [items, setItems] = useState<SourceStatus[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      const json = await res.json();
      setItems(Array.isArray(json?.status) ? json.status : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="container">
      <header className="headerRow">
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>소스 상태</h1>
          <p style={{ margin: "6px 0 0", color: "#555", fontSize: 13 }}>
            일부 사이트는 <b>자동 수집을 정책적으로 제한</b>할 수 있습니다.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ccc", background: "#fff" }}
        >
          {loading ? "불러오는 중…" : "새로고침"}
        </button>
      </header>

      <section style={{ marginTop: 14 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 14, overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "160px 90px 90px 1fr",
              gap: 0,
              padding: "10px 12px",
              background: "#fafafa",
              borderBottom: "1px solid #eee",
              fontSize: 12,
              color: "#666",
            }}
          >
            <div>소스</div>
            <div>상태</div>
            <div>건수</div>
            <div>메모</div>
          </div>

          {items.map((s, idx) => (
            <div
              key={`${s.source}-${idx}`}
              style={{
                display: "grid",
                gridTemplateColumns: "160px 90px 90px 1fr",
                padding: "12px 12px",
                borderBottom: "1px solid #f1f1f1",
                alignItems: "start",
              }}
            >
              <div style={{ fontWeight: 800 }}>{s.source}</div>
              <div style={{ fontWeight: 800 }}>{s.ok ? "OK" : "FAIL"}</div>
              <div>{typeof s.count === "number" ? s.count : "-"}</div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.35 }}>
                {s.ok ? s.hint || "-" : `${s.hint || "-"}${s.error ? `\n${s.error}` : ""}`}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div style={{ padding: 18, color: "#666" }}>상태 정보가 없습니다.</div>
          )}
        </div>
      </section>

      <footer style={{ marginTop: 18, color: "#777", fontSize: 12, lineHeight: 1.55 }}>
        <a href="/" style={{ color: "#111", textDecoration: "none", fontWeight: 800 }}>
          ← 돌아가기
        </a>
      </footer>
    </main>
  );
}
