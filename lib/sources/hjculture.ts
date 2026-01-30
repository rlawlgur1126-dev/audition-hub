import * as cheerio from "cheerio";
import { fetchHtml, normDate, shortSnippet } from "../fetch";
import type { AuditionPost } from "../types";

/**
 * HJ컬쳐 NOTICE는 /NOTICE 에 리스트가 있고, 개별 글은 /forum/view/{id} 형태로 이동합니다.
 * 일부 환경에선 NOTICE 본문에 텍스트가 빈약하게 보이지만, 실제 링크(a href)는 존재합니다.
 */
export async function scrapeHJCulture(): Promise<AuditionPost[]> {
  const url = "https://hjculture.com/NOTICE";
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const posts: AuditionPost[] = [];

  // 1) /forum/view/ 링크를 우선 수집
  $("a[href*='/forum/view/']").each((_, el) => {
    const href = $(el).attr("href") || "";
    const title = $(el).text().replace(/\s+/g, " ").trim();

    const fullUrl = href.startsWith("http")
      ? href
      : `https://hjculture.com${href.startsWith("/") ? "" : "/"}${href}`;

    // title이 비어있으면 같은 행/카드에서 보강
    let t = title;
    if (!t || t.length < 2) {
      const row = $(el).closest("tr, li, .item, .row, .post, .board, .notice, .table-row");
      t =
        row.find("td, .title, .subject, .tit, h3, h4").first().text().replace(/\s+/g, " ").trim() || t;
    }
    if (!t || t.length < 2) return;

    const row = $(el).closest("tr, li, .item, .row, .post, .board, .notice, .table-row");
    const rowText = row.text().replace(/\s+/g, " ").trim();
    const postedAt = normDate(rowText.match(/(\d{4}[./-]\d{1,2}[./-]\d{1,2})/)?.[1]) || undefined;

    posts.push({
      source: "HJCULTURE",
      company: "HJ컬쳐",
      title: t,
      url: fullUrl,
      postedAt,
      category: "뮤지컬",
      snippet: shortSnippet(rowText || t),
    });
  });

  // 2) 만약 0건이면, 검색결과에서 보이는 /forum/view/ 패턴을 보강하기 위해 www 도메인도 한번 더 시도
  if (posts.length === 0) {
    const html2 = await fetchHtml("https://www.hjculture.com/NOTICE");
    const $$ = cheerio.load(html2);
    $$("a[href*='/forum/view/']").each((_, el) => {
      const href = $$(el).attr("href") || "";
      const title = $$(el).text().replace(/\s+/g, " ").trim();
      const fullUrl = href.startsWith("http")
        ? href
        : `https://www.hjculture.com${href.startsWith("/") ? "" : "/"}${href}`;
      if (!title) return;
      posts.push({
        source: "HJCULTURE",
        company: "HJ컬쳐",
        title,
        url: fullUrl,
        category: "뮤지컬",
        snippet: shortSnippet(title),
      });
    });
  }

  // de-dup
  const seen = new Set<string>();
  return posts.filter((p) => (seen.has(p.url) ? false : (seen.add(p.url), true)));
}
