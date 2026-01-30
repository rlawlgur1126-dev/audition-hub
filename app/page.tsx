"use client";

import { useEffect, useMemo, useState } from "react";
import type { AuditionPost, SourceKey, Category } from "../lib/types";

type TopTab = "OTR" | "COMPANIES";
type OtrSub = "ALL" | "뮤지컬" | "연극";

type CompanyTab =
  | "ALL"
  | "EMK"
  | "ACOM"
  | "SHINSI"
  | "SNCO"
    | "LIVE"
    | "HJCULTURE"
  | "LIBRARY"
  | "ODCOMPANY";

function pillStyle() {
  return {
    display: "inline-block",
    padding: "2px 8px",
    border: "1px solid #ddd",
    borderRadius: 999,
    fontSize: 12,
    lineHeight: 1.4,
    whiteSpace: "nowrap" as const,
  };
}

function tabBtn(active: boolean) {
  return {
    padding: "9px 12px",
    borderRadius: 12,
    border: "1px solid " + (active ? "#111" : "#ddd"),
    background: active ? "#111" : "#fff",
    color: active ? "#fff" : "#111",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700 as const,
  };
}

function subTabBtn(active: boolean) {
  return {
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid " + (active ? "#111" : "#ddd"),
    background: active ? "#111" : "#fff",
    color: active ? "#fff" : "#111",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700 as const,
  };
}

export default function Home() {
  const [data, setData] = useState<AuditionPost[]>([]);
  const [loading, setLoading] = useState(false);

  const [topTab, setTopTab] = useState<TopTab>("OTR");
  const [otrSub, setOtrSub] = useState<OtrSub>("ALL");
  const [companyTab, setCompanyTab] = useState<CompanyTab>("ALL");

  const [q, setQ] = useState("");
  const [onlyAudition, setOnlyAudition] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      const json = await res.json();
      setData(Array.isArray(json.posts) ? json.posts : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    let scoped = data;

    if (topTab === "OTR") {
      scoped = scoped.filter((p) => p.source === "OTR");
      if (otrSub !== "ALL") scoped = scoped.filter((p) => p.category === otrSub);
    } else {
      const allowed: SourceKey[] = ["EMK", "ACOM", "SHINSI", "SNCO", "LIVE", "HJCULTURE", "LIBRARY", "ODCOMPANY"];
      scoped = scoped.filter((p) => allowed.includes(p.source));
      if (companyTab !== "ALL") scoped = scoped.filter((p) => p.source === companyTab);
    }

    return scoped.filter((p) => {
      const hay = `${p.company} ${p.title} ${p.snippet || ""}`.toLowerCase();
      if (q.trim() && !hay.includes(q.trim().toLowerCase())) return false;

      if (onlyAudition) {
        const t = `${p.title} ${p.snippet || ""}`;
        if (!/(오디션|audition|캐스팅|casting|배우 모집|모집|전형|지원)/.test(t)) return false;
      }
      return true;
    });
  }, [data, topTab, otrSub, companyTab, q, onlyAudition]);

  const headerTitle = topTab === "OTR" ? "OTR 오디션 보드" : "제작사 오디션 보드";

  return (
    <main className="container">
      <header className="headerRow">
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>{headerTitle}</h1>
          <p style={{ margin: "6px 0 0", color: "#555", fontSize: 13 }}>
            공지는 <b>제목/메타/원문 링크</b> 중심으로 집계합니다.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ccc", background: "#fff" }}
        >
          {loading ? "새로고침 중…" : "새로고침"}
        </button>
      </header>

      {/* top tabs */}
      <section style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button style={tabBtn(topTab === "OTR")} onClick={() => setTopTab("OTR")}>
          OTR (뮤지컬/연극)
        </button>
        <button style={tabBtn(topTab === "COMPANIES")} onClick={() => setTopTab("COMPANIES")}>
          제작사
        </button>
      </section>

      {/* subtabs */}
      {topTab === "OTR" ? (
        <section style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button style={subTabBtn(otrSub === "ALL")} onClick={() => setOtrSub("ALL")}>
            전체
          </button>
          <button style={subTabBtn(otrSub === "뮤지컬")} onClick={() => setOtrSub("뮤지컬")}>
            뮤지컬
          </button>
          <button style={subTabBtn(otrSub === "연극")} onClick={() => setOtrSub("연극")}>
            연극
          </button>
        </section>
      ) : (
        <section style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {(
            [
              ["ALL", "전체"],
              ["EMK", "EMK"],
              ["ACOM", "에이콤"],
              ["SHINSI", "신시컴퍼니"],
              ["SNCO", "에스앤코"],
                            ["LIVE", "라이브(주)"],
              ["HJCULTURE", "HJ컬쳐"],
            ] as const
          ).map(([key, label]) => (
            <button key={key} style={subTabBtn(companyTab === (key as CompanyTab))} onClick={() => setCompanyTab(key as CompanyTab)}>
              {label}
            </button>
          ))}
        </section>
      )}

      {/* controls */}
      <section className="controlsGrid">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="검색(작품명/배역/제작사/키워드)"
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 10 }}
        />
        <label
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: "10px 10px",
            justifyContent: "center",
          }}
        >
          <input type="checkbox" checked={onlyAudition} onChange={(e) => setOnlyAudition(e.target.checked)} />
          <span style={{ fontSize: 13 }}>오디션만 보기</span>
        </label>
      </section>

      {/* table */}
      <section style={{ marginTop: 14 }}>
        <div style={{ color: "#555", fontSize: 13, marginBottom: 8 }}>결과 {visible.length}건</div>

        <div style={{ border: "1px solid #eee", borderRadius: 14, overflow: "hidden" }}>
          <div
            className="listHeaderRow"
            style={{
              display: "grid",
              gap: 0,
              padding: "10px 12px",
              background: "#fafafa",
              borderBottom: "1px solid #eee",
              fontSize: 12,
              color: "#666",
            }}
          >
            <div>출처/제작사</div>
            <div>장르</div>
            <div>제목</div>
            <div>작성일</div>
          </div>

          {visible.map((p, idx) => (
            <div
              key={`${p.source}-${p.url}-${idx}`}
              className="listRow"
              style={{
                display: "grid",
                padding: "12px 12px",
                borderBottom: "1px solid #f1f1f1",
                alignItems: "start",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{p.company}</div>
                <div style={{ marginTop: 4 }}>
                  <span style={pillStyle()}>{p.source}</span>
                </div>
              </div>
              <div style={{ fontSize: 13 }}>
                <span style={pillStyle()}>{p.category}</span>
              </div>
              <div>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 14, fontWeight: 700, textDecoration: "none", color: "#111" }}
                >
                  {p.title}
                </a>
                {p.snippet && (
                  <div style={{ marginTop: 6, color: "#666", fontSize: 12, lineHeight: 1.35 }}>{p.snippet}</div>
                )}
              </div>
              <div style={{ fontSize: 13, color: "#444" }}>{p.postedAt || "-"}</div>
            </div>
          ))}

          {visible.length === 0 && (
            <div style={{ padding: 18, color: "#666" }}>조건에 맞는 공고가 없습니다. (탭/검색어/필터를 조정해보세요)</div>
          )}
        </div>
      </section>

      <footer style={{ marginTop: 18, color: "#777", fontSize: 12, lineHeight: 1.55 }}>
        <div>⚠️ 공지글 “전문 복제”는 약관/저작권 리스크가 있어 기본값에서 제외했습니다.</div>
        <div style={{ marginTop: 6 }}>
          <a href="/status" style={{ color: "#111", textDecoration: "none", fontWeight: 800 }}>
            소스 상태 보기
          </a>
        </div>
      </footer>
    </main>
  );
}
