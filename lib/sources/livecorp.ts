import * as cheerio from "cheerio";
import { fetchHtml, normDate, shortSnippet } from "../fetch";
import type { AuditionPost } from "../types";

/**
 * 콘텐츠제작사 라이브(주) 공지: http://www.livecorp.co.kr/board/board.php?bo_table=notice
 * (오디션 관련 키워드가 섞여 있을 수 있어 '오디션' 키워드 필터를 권장)
 */
export async function scrapeLiveCorp(): Promise<AuditionPost[]> {
  const url = "http://www.livecorp.co.kr/board/board.php?bo_table=notice";
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const posts: AuditionPost[] = [];
  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href.includes("bo_table=notice")) return;

    const title = $(el).text().replace(/\s+/g, " ").trim();
    if (!title || title.length < 3) return;

    const row = $(el).closest("tr, li, .list");
    const rowText = row.text().replace(/\s+/g, " ").trim();
    const postedAt = normDate(rowText);

    const fullUrl = href.startsWith("http") ? href : `http://www.livecorp.co.kr/board/${href.replace(/^\//, "")}`;

    const category: "뮤지컬" | "연극" | "기타" =
      title.includes("뮤지컬") ? "뮤지컬" : title.includes("연극") ? "연극" : "기타";

    posts.push({
      source: "LIVE",
      company: "라이브(주)",
      title,
      url: fullUrl,
      postedAt,
      category,
      snippet: shortSnippet(rowText),
    });
  });

  const seen = new Set<string>();
  return posts.filter(p => (seen.has(p.url) ? false : (seen.add(p.url), true)));
}
