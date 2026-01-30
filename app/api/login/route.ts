import { NextRequest, NextResponse } from "next/server";

const COOKIE = "auditionhub_auth";

export async function POST(req: NextRequest) {
  const pass = process.env.AUDITION_HUB_PASSWORD;
  if (!pass) return NextResponse.json({ ok: true });

  const body = await req.json().catch(() => ({}));
  const pw = String(body?.pw || "");
  if (pw !== pass) return NextResponse.json({ ok: false }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
