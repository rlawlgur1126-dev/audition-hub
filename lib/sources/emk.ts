import * as cheerio from "cheerio";
import { fetchHtml, normDate, shortSnippet } from "../fetch";
import type { AuditionPost } from "../types";

/**
 * EMK 오디션 공지: https://emkmusical.com/notice_audition/
 */
export async function scrapeEMK(): Promise<AuditionPost[]> {
  const url = "https://emkmusical.com/notice_audition/";
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const posts: AuditionPost[] = [];

  // kboard 기반으로 보이는 구조를 폭넓게 파싱
  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href.includes("kboard_content_redirect") && !href.includes("notice_audition") ) return;

    const title = $(el).text().replace(/\s+/g, " ").trim();
    if (!title || title.length < 3) return;

    const row = $(el).closest("tr, li, .kboard-list-item, .kboard-list-row, .notice");
    const rowText = row.text().replace(/\s+/g, " ").trim();

    const postedAt = normDate(rowText);
    const fullUrl = href.startsWith("http") ? href : `https://emkmusical.com${href.startsWith("/") ? "" : "/"}${href}`;

    posts.push({
      source: "EMK",
      company: "EMK",
      title,
      url: fullUrl,
      postedAt,
      category: "뮤지컬",
      snippet: shortSnippet(rowText),
    });
  });

  const seen = new Set<string>();
  return posts.filter(p => (seen.has(p.url) ? false : (seen.add(p.url), true)));
}
