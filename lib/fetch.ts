import iconv from "iconv-lite";

export function shortSnippet(text: string, max = 140) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export function normDate(input?: string | null): string | undefined {
  if (!input) return undefined;
  const s = input.trim().replace(/\./g, "-").replace(/\//g, "-");
  const m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return undefined;
  const y = m[1];
  const mm = m[2].padStart(2, "0");
  const dd = m[3].padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

type Charset = "utf-8" | "euc-kr" | "cp949";

function detectCharset(headers: Headers, htmlSample?: string): Charset {
  const ct = (headers.get("content-type") || "").toLowerCase();
  if (ct.includes("euc-kr") || ct.includes("ks_c_5601")) return "euc-kr";
  if (ct.includes("cp949")) return "cp949";

  const sample = (htmlSample || "").toLowerCase();
  if (sample.includes("charset=euc-kr") || sample.includes("charset=ks_c_5601")) return "euc-kr";
  if (sample.includes("charset=cp949")) return "cp949";

  return "utf-8";
}

/**
 * HTML fetch with charset handling.
 * - 일부 국내 사이트(에이콤 등)는 EUC-KR/CP949 인코딩을 사용해 UTF-8로 읽으면 깨집니다.
 * - content-type/meta charset을 우선 사용하고, 없으면 "깨짐(�)" 비율로 CP949 fallback 합니다.
 */
export async function fetchHtml(url: string, init?: RequestInit): Promise<string> {
  const controller = new AbortController();
  const timeoutMs = Number(process.env.FETCH_TIMEOUT_MS || "12000");
  const t = setTimeout(() => controller.abort(), timeoutMs);

  const res = await fetch(url, {
    redirect: "follow",
    signal: controller.signal,
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.7,en;q=0.6",
      // NOTE: Do not attempt to spoof or bypass bot defenses.
      // Keep headers minimal and standards-compliant.
      referer: url,
      ...(init?.headers || {}),
    },
    ...init,
  });

  clearTimeout(t);

  // Fail fast on non-2xx so callers can surface status in /api/status.
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status}`);
  }

  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);

  // preview for meta detection
  const previewUtf8 = buf.slice(0, Math.min(buf.length, 8192)).toString("utf8");
  const declared = detectCharset(res.headers, previewUtf8);

  if (declared === "euc-kr") return iconv.decode(buf, "euc-kr");
  if (declared === "cp949") return iconv.decode(buf, "cp949");

  // default utf8, but fallback when garbled
  const textUtf8 = buf.toString("utf8");
  const replacementCount = (textUtf8.match(/\uFFFD/g) || []).length; // '�'
  // if lots of replacement chars, try cp949
  if (replacementCount >= 5 || replacementCount / Math.max(1, textUtf8.length) > 0.0005) {
    const cp = iconv.decode(buf, "cp949");
    // sanity: cp949 result should reduce replacement chars dramatically
    const cpReplacement = (cp.match(/\uFFFD/g) || []).length;
    if (cpReplacement < replacementCount) return cp;
    // also try euc-kr as fallback
    const eu = iconv.decode(buf, "euc-kr");
    const euReplacement = (eu.match(/\uFFFD/g) || []).length;
    if (euReplacement < replacementCount) return eu;
  }

  return textUtf8;
}
