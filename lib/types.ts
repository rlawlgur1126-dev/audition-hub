export type SourceKey =
  | "OTR"
  | "EMK"
  | "ACOM"
  | "ODCOMPANY"
  | "LIBRARY"
  | "SHINSI"
  | "SNCO"
  | "LIVE"
  | "HJCULTURE"
  | "CJENM";

export type Category = "뮤지컬" | "연극" | "기타";

export type AuditionPost = {
  source: SourceKey;
  company: string;
  title: string;
  url: string;
  postedAt?: string;   // YYYY-MM-DD (if available)
  deadline?: string;   // YYYY-MM-DD (if available)
  category: Category;
  snippet?: string;    // short excerpt for preview (keep short for copyright safety)
};
