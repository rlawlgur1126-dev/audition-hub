import type { AuditionPost } from "./types";
import { scrapeOTR } from "./sources/otr";
import { scrapeEMK } from "./sources/emk";
import { scrapeACOM } from "./sources/acom";
import { scrapeShinsi } from "./sources/shinsi";
import { scrapeSNCO } from "./sources/snco";
import { scrapeLibrary } from "./sources/library";
import { scrapeLiveCorp } from "./sources/livecorp";
import { scrapeHJCulture } from "./sources/hjculture";

export async function collectAll(): Promise<AuditionPost[]> {
  // Avoid hammering sources in parallel (some sites rate-limit or block aggressive concurrency).
  const tasks: Array<() => Promise<AuditionPost[]>> = [
    scrapeOTR,
    scrapeEMK,
    scrapeACOM,
    scrapeShinsi,
    scrapeSNCO,
    scrapeLibrary,
    scrapeLiveCorp,
    scrapeHJCulture,
  ];

  const concurrency = Math.max(1, Math.min(3, Number(process.env.SCRAPE_CONCURRENCY || "2")));
  const delayMs = Math.max(0, Number(process.env.SCRAPE_STAGGER_MS || "250"));

  async function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  const results: PromiseSettledResult<AuditionPost[]>[] = [];
  let i = 0;
  const runners = Array.from({ length: concurrency }, async () => {
    while (i < tasks.length) {
      const idx = i++;
      if (delayMs) await sleep(delayMs);
      const t = tasks[idx];
      const r = await Promise.resolve()
        .then(() => t())
        .then((v) => ({ status: "fulfilled", value: v } as const))
        .catch((e) => ({ status: "rejected", reason: e } as const));
      results[idx] = r as any;
    }
  });
  await Promise.all(runners);

  const flat: AuditionPost[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") flat.push(...r.value);
  }

  // de-dup by (source,url)
  const seen = new Set<string>();
  const dedup = flat.filter(p => {
    const k = `${p.source}::${p.url}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // newest first by postedAt when present
  return dedup.sort((a, b) => (b.postedAt || "").localeCompare(a.postedAt || ""));
}
