import * as cheerio from "cheerio";
import { fetchHtml, normDate, shortSnippet } from "../fetch";
import type { AuditionPost } from "../types";

/**
 * 라이브러리컴퍼니 오디션 정보: https://www.librarycompany.co.kr/audition
 */
export async function scrapeLibrary(): Promise<AuditionPost[]> {
  const url = "https://www.librarycompany.co.kr/audition";
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const posts: AuditionPost[] = [];
  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const title = $(el).text().replace(/\s+/g, " ").trim();
    if (!title || title.length < 3) return;

    // library site may have modal/JS; keep simple: capture list text
    const row = $(el).closest("tr, li, .board, .list, .item");
    const rowText = row.text().replace(/\s+/g, " ").trim();
    const postedAt = normDate(rowText);

    const fullUrl = href.startsWith("http") ? href : `https://www.librarycompany.co.kr${href.startsWith("/") ? "" : "/"}${href}`;

    posts.push({
      source: "LIBRARY",
      company: "라이브러리컴퍼니",
      title,
      url: fullUrl,
      postedAt,
      category: "뮤지컬",
      snippet: shortSnippet(rowText),
    });
  });

  // if no anchors for posts, fall back to a single item from page text
  if (posts.length === 0) {
    const pageText = $("body").text();
    const m = pageText.match(/(\d{4}\.\d{2}\.\d{2})/);
    posts.push({
      source: "LIBRARY",
      company: "라이브러리컴퍼니",
      title: "오디션 정보(라이브러리컴퍼니) 페이지 확인",
      url,
      postedAt: m ? normDate(m[1]) : undefined,
      category: "기타",
      snippet: shortSnippet(pageText),
    });
  }

  const seen = new Set<string>();
  return posts.filter(p => (seen.has(p.url) ? false : (seen.add(p.url), true)));
}
