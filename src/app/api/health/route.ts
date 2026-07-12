import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export function GET() {
  return NextResponse.json(
    { ok: true, service: "emranlabs" },
    { status: 200, headers },
  );
}

export function HEAD() {
  return new Response(null, { status: 200, headers });
}
