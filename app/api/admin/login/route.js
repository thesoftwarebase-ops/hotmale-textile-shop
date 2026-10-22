import { NextResponse } from "next/server";
import { authenticate, isSameOriginRequest } from "../../../../lib/auth";

function json(body, status) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return json({ ok: false, code: "forbidden" }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  const email = body?.email;
  const password = body?.password;
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    email.length > 320 ||
    !password ||
    password.length > 1024
  ) {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  try {
    const result = await authenticate({ email, password });

    if (!result.ok) {
      return json({ ok: false, code: result.code }, 401);
    }

    return json(
      {
        ok: true,
        token: result.token,
        expiresAt: result.expiresAt,
        user: result.user,
      },
      200,
    );
  } catch (error) {
    console.error("Admin login failed:", error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}
