import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  getRequestSession,
  isSameOriginRequest,
  normalizeEmail,
} from "../../../../../lib/auth";
import { getDb } from "../../../../../lib/db";
import { verifyPassword } from "../../../../../lib/password.mjs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PATCH(request) {
  if (!isSameOriginRequest(request)) {
    return json({ ok: false, code: "forbidden" }, 403);
  }

  const session = await getRequestSession(request);
  if (!session) return json({ ok: false, code: "unauthorized" }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  const email = normalizeEmail(body?.email);
  const currentPassword = body?.currentPassword;
  if (
    !EMAIL_PATTERN.test(email) ||
    email.length > 320 ||
    typeof currentPassword !== "string" ||
    !currentPassword ||
    currentPassword.length > 1024
  ) {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  try {
    const db = await getDb();
    const users = db.collection("admin_users");
    const user = await users.findOne({
      _id: new ObjectId(session.user.id),
      status: "active",
      role: "admin",
    });
    if (!user) return json({ ok: false, code: "unauthorized" }, 401);

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) return json({ ok: false, code: "invalid_current" }, 400);

    if (normalizeEmail(user.email) === email) {
      return json({ ok: true, email }, 200);
    }

    await users.updateOne(
      { _id: user._id },
      { $set: { email, updatedAt: new Date() } },
    );

    return json({ ok: true, email }, 200);
  } catch (error) {
    if (error?.code === 11000) {
      return json({ ok: false, code: "email_taken" }, 409);
    }
    console.error("Admin email update failed:", error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}
