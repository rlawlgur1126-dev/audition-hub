import * as cheerio from "cheerio";
import { fetchHtml, normDate, shortSnippet } from "../fetch";
import type { AuditionPost } from "../types";

/**
 * 오디컴퍼니 오디션 공지: (예시)
 * https://www.odmusical.com/kor/audition/notice?...
 */
export async function scrapeODCompany(): Promise<AuditionPost[]> {
  const url = "https://www.odmusical.com/kor/audition/notice?ca=&idx=18&page=1&sel_search=&txt_search=&viewMode=view";
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const posts: AuditionPost[] = [];
  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href.includes("/kor/audition/")) return;
    const title = $(el).text().replace(/\s+/g, " ").trim();
    if (!title || title.length < 3) return;

    const row = $(el).closest("tr, li, .list, .row");
    const rowText = row.text().replace(/\s+/g, " ").trim();
    const postedAt = normDate(rowText);

    const fullUrl = href.startsWith("http") ? href : `https://www.odmusical.com${href.startsWith("/") ? "" : "/"}${href}`;

    posts.push({
      source: "ODCOMPANY",
      company: "오디컴퍼니",
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
