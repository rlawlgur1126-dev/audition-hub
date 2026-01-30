import * as cheerio from "cheerio";
import { fetchHtml, normDate, shortSnippet } from "../fetch";
import type { AuditionPost } from "../types";

/**
 * ACOM 공지사항(오디션 포함): http://www.acommusical.com/default/community/community01.php?sub=01
 */
export async function scrapeACOM(): Promise<AuditionPost[]> {
  const url = "http://www.acommusical.com/default/community/community01.php?sub=01";
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const posts: AuditionPost[] = [];
  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href.includes("community01.php") || !href.includes("read_form")) return;
    const title = $(el).text().replace(/\s+/g, " ").trim();
    if (!title || title.length < 3) return;

    const row = $(el).closest("tr, li, .board, .list");
    const rowText = row.text().replace(/\s+/g, " ").trim();
    const postedAt = normDate(rowText);

    const fullUrl = href.startsWith("http") ? href : `http://www.acommusical.com${href.startsWith("/") ? "" : "/"}${href}`;
    const category: "뮤지컬" | "연극" | "기타" =
      title.includes("연극") ? "연극" : title.includes("뮤지컬") ? "뮤지컬" : "기타";

    // "오디션" 포함 글 위주로 우선 노출
    posts.push({
      source: "ACOM",
      company: "에이콤",
      title,
      url: fullUrl,
      postedAt,
      category,
      snippet: shortSnippet(rowText),
    });
  });

  // filter to likely audition posts first, but keep all for now
  const seen = new Set<string>();
  return posts
    .filter(p => (seen.has(p.url) ? false : (seen.add(p.url), true)))
    .sort((a,b) => (b.postedAt || "").localeCompare(a.postedAt || ""));
}
