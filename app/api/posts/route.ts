import { NextResponse } from "next/server";
import { collectAll } from "../../../lib/aggregate";
import { getCache, setCache, isFresh } from "../../../lib/cache";

export const runtime = "nodejs";

export async function GET() {
  const ttl = Number(process.env.CACHE_TTL_SECONDS || "600");
  const cache = getCache();
  const commonHeaders = {
    // Vercel edge cache for the API response (reduces origin hits -> fewer blocks/rate limits).
    "Cache-Control": `s-maxage=${ttl}, stale-while-revalidate=86400`,
  };

  if (cache && isFresh(cache.ts, ttl)) {
    return NextResponse.json({ cached: true, ts: cache.ts, posts: cache.data }, { headers: commonHeaders });
  }
  const posts = await collectAll();
  setCache(posts);
  return NextResponse.json({ cached: false, ts: Date.now(), posts }, { headers: commonHeaders });
}
