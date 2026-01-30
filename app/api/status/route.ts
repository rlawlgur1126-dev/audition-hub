export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { collectStatus } from "../../../lib/status";

export async function GET() {
  const status = await collectStatus();
  return NextResponse.json({ status });
}
