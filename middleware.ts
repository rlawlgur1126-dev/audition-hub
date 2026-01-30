import { NextRequest, NextResponse } from "next/server";

const COOKIE = "auditionhub_auth";

export function middleware(req: NextRequest) {
  const pass = process.env.AUDITION_HUB_PASSWORD;
  if (!pass) return NextResponse.next(); // no password set = open access

  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/login") || pathname.startsWith("/api")) return NextResponse.next();

  const cookie = req.cookies.get(COOKIE)?.value;
  if (cookie === "1") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
