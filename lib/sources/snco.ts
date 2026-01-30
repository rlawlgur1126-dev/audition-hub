import * as cheerio from "cheerio";
import { fetchHtml, normDate, shortSnippet } from "../fetch";
import type { AuditionPost } from "../types";

/**
 * S&CO 오디션 게시판: https://sncokorea.com/audition
 */
export async function scrapeSNCO(): Promise<AuditionPost[]> {
  const url = "https://sncokorea.com/audition";
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const posts: AuditionPost[] = [];
  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href.includes("boardPost")) return;
    const title = $(el).text().replace(/\s+/g, " ").trim();
    if (!title || title.length < 3) return;

    const row = $(el).closest("tr, li, .board, .post");
    const rowText = row.text().replace(/\s+/g, " ").trim();
    const postedAt = normDate(rowText);

    const fullUrl = href.startsWith("http") ? href : `https://sncokorea.com${href.startsWith("/") ? "" : "/"}${href}`;

    posts.push({
      source: "SNCO",
      company: "에스앤코",
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
