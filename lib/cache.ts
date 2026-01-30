import type { AuditionPost } from "./types";

type CacheValue = { ts: number; data: AuditionPost[] };
const g = globalThis as unknown as { __audition_cache?: CacheValue };

export function getCache(): CacheValue | undefined {
  return g.__audition_cache;
}

export function setCache(data: AuditionPost[]) {
  g.__audition_cache = { ts: Date.now(), data };
}

export function isFresh(ts: number, ttlSeconds: number) {
  return Date.now() - ts < ttlSeconds * 1000;
}
