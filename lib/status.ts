import type { SourceKey } from "./types";
import { scrapeOTR } from "./sources/otr";
import { scrapeEMK } from "./sources/emk";
import { scrapeACOM } from "./sources/acom";
import { scrapeODCompany } from "./sources/odcompany";
import { scrapeShinsi } from "./sources/shinsi";
import { scrapeSNCO } from "./sources/snco";
import { scrapeLibrary } from "./sources/library";
import { scrapeLiveCorp } from "./sources/livecorp";
import { scrapeHJCulture } from "./sources/hjculture";

export type SourceStatus = {
  source: SourceKey | "OTR";
  ok: boolean;
  count?: number;
  error?: string;
  hint?: string;
};

function parseHttpStatus(err: unknown): number | null {
  const msg = String((err as any)?.message || err || "");
  const m = msg.match(/Fetch failed\s+(\d{3})/);
  return m ? Number(m[1]) : null;
}

async function wrap(source: SourceStatus["source"], fn: () => Promise<any[]>): Promise<SourceStatus> {
  try {
    const items = await fn();
    return { source, ok: true, count: items.length };
  } catch (e) {
    const code = parseHttpStatus(e);
    let hint = "페이지 구조/선택자 변경 가능성";
    if (code === 403) hint = "접근 제한(403) — 해당 사이트 정책상 서버에서 자동 수집이 차단될 수 있음";
    if (code === 404) hint = "URL 변경(404) 가능성";
    if (code === 429) hint = "요청 과다(429) — 캐시 TTL을 늘리거나 호출 빈도 감소";
    return { source, ok: false, error: String((e as any)?.message || e), hint };
  }
}

export async function collectStatus(): Promise<SourceStatus[]> {
  return await Promise.all([
    wrap("OTR" as any, scrapeOTR),
    wrap("EMK", scrapeEMK),
    wrap("ACOM", scrapeACOM),
    wrap("ODCOMPANY", scrapeODCompany),
    wrap("SHINSI", scrapeShinsi),
    wrap("SNCO", scrapeSNCO),
    wrap("LIBRARY", scrapeLibrary),
    wrap("LIVE", scrapeLiveCorp),
    wrap("HJCULTURE", scrapeHJCulture),
  ]);
}
