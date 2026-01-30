import * as cheerio from "cheerio";
import { fetchHtml, normDate, shortSnippet } from "../fetch";
import type { AuditionPost } from "../types";

/**
 * 신시컴퍼니 오디션 페이지: https://www.iseensee.com/Home/Community/Audition.aspx
 */
export async function scrapeShinsi(): Promise<AuditionPost[]> {
  const url = "https://www.iseensee.com/Home/Community/Audition.aspx";
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const posts: AuditionPost[] = [];
  // table rows with links
  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href.includes("Audition.aspx?")) return;
    const title = $(el).text().replace(/\s+/g, " ").trim();
    if (!title || title.length < 3) return;
    const row = $(el).closest("tr, li");
    const rowText = row.text().replace(/\s+/g, " ").trim();

    const postedAt = normDate(rowText);
    const fullUrl = href.startsWith("http") ? href : `https://www.iseensee.com${href.startsWith("/") ? "" : "/"}${href}`;

    const category: "뮤지컬" | "연극" | "기타" =
      title.includes("연극") ? "연극" : "뮤지컬";

    posts.push({
      source: "SHINSI",
      company: "신시컴퍼니",
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
