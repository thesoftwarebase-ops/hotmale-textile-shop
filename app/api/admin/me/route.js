import { NextResponse } from "next/server";
import { getRequestSession } from "../../../../lib/auth";

export async function GET(request) {
  const session = await getRequestSession(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, code: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      user: session.user,
      expiresAt: session.expiresAt,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
