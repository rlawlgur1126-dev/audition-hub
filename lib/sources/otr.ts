import * as cheerio from "cheerio";
import { fetchHtml, normDate, shortSnippet } from "../fetch";
import type { AuditionPost, Category } from "../types";

function ensureListParams(input: string): string {
  const u = new URL(input);
  if (!u.searchParams.get("mode")) u.searchParams.set("mode", "list");
  if (!u.searchParams.get("list_type")) u.searchParams.set("list_type", "list");
  if (!u.searchParams.get("order_by")) u.searchParams.set("order_by", "fn_pid");
  if (!u.searchParams.get("order_type")) u.searchParams.set("order_type", "desc");
  return u.toString();
}

async function scrapeOTRUrl(url: string, category: "뮤지컬" | "연극"): Promise<AuditionPost[]> {
  const html = await fetchHtml(ensureListParams(url));
  const $ = cheerio.load(html);

  const posts: AuditionPost[] = [];

  // OTR의 상세 링크 패턴은 두 가지가 섞여 나옴:
  // 1) /audition/?vid=12345
  // 2) /audition/?mode=view&vid=12345 ... (일부 템플릿)
  const anchors = $("a[href*='/audition/?'][href*='vid=']");
  anchors.each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href.includes("vid=")) return;

    let title = $(el).text().replace(/\s+/g, " ").trim();

    // 제목이 비어 있으면 같은 행에서 보강
    if (!title || title.length < 2) {
      const row = $(el).closest("tr, li, .list-item, .item, .row, .board_list, .board_list_table, table");
      title = row.find(".subject, .title, .tit, td").first().text().replace(/\s+/g, " ").trim() || title;
    }
    if (!title || title.length < 2) return;

    const row = $(el).closest("tr, li, .list-item, .item, .row, .board_list, .board_list_table, table");
    const rowText = row.text().replace(/\s+/g, " ").trim();

    const postedAt =
      normDate(rowText.match(/(\d{4}[./-]\d{1,2}[./-]\d{1,2})/)?.[1]) || undefined;

    const fullUrl = href.startsWith("http")
      ? href
      : `https://otr.co.kr${href.startsWith("/") ? "" : "/"}${href}`;

    posts.push({
      source: "OTR",
      company: "OTR",
      title,
      url: fullUrl,
      postedAt,
      category: category as Category,
      snippet: shortSnippet(rowText || title),
    });
  });

  // fallback: if nothing found, try common list selector (td.subject a)
  if (posts.length === 0) {
    $("td.subject a, .subject a, .title a").each((_, el) => {
      const href = $(el).attr("href") || "";
      if (!href.includes("vid=")) return;
      const title = $(el).text().replace(/\s+/g, " ").trim();
      if (!title) return;
      const fullUrl = href.startsWith("http")
        ? href
        : `https://otr.co.kr${href.startsWith("/") ? "" : "/"}${href}`;
      posts.push({
        source: "OTR",
        company: "OTR",
        title,
        url: fullUrl,
        category: category as Category,
        snippet: title,
      });
    });
  }

  const seen = new Set<string>();
  return posts
    .filter((p) => (seen.has(p.url) ? false : (seen.add(p.url), true)))
    .sort((a, b) => (b.postedAt || "").localeCompare(a.postedAt || ""));
}

export async function scrapeOTR(): Promise<AuditionPost[]> {
  const musicalUrl = "https://otr.co.kr/audition/?board_name=audition&category1=%EB%AE%A4%EC%A7%80%EC%BB%AC";
  const playUrl = "https://otr.co.kr/audition/?board_name=audition&category1=%EC%97%B0%EA%B7%B9";

  const [musical, play] = await Promise.all([
    scrapeOTRUrl(musicalUrl, "뮤지컬"),
    scrapeOTRUrl(playUrl, "연극"),
  ]);

  return [...musical, ...play].sort((a, b) => (b.postedAt || "").localeCompare(a.postedAt || ""));
}
