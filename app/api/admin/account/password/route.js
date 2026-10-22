import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  createSessionToken,
  getRequestSession,
  isSameOriginRequest,
} from "../../../../../lib/auth";
import { getDb } from "../../../../../lib/db";
import {
  hashPassword,
  MIN_PASSWORD_LENGTH,
  verifyPassword,
} from "../../../../../lib/password.mjs";

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

  const currentPassword = body?.currentPassword;
  const newPassword = body?.newPassword;
  const confirmPassword = body?.confirmPassword;
  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    typeof confirmPassword !== "string" ||
    !currentPassword ||
    currentPassword.length > 1024 ||
    newPassword.length > 1024
  ) {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return json({ ok: false, code: "weak" }, 400);
  }
  if (newPassword !== confirmPassword) {
    return json({ ok: false, code: "mismatch" }, 400);
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

    const now = new Date();
    const tokenVersion = (Number.isInteger(user.tokenVersion)
      ? user.tokenVersion
      : 0) + 1;
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash: await hashPassword(newPassword),
          passwordChangedAt: now,
          updatedAt: now,
          tokenVersion,
        },
      },
    );

    const token = await createSessionToken({
      id: user._id,
      role: user.role,
      tokenVersion,
    });

    return json({ ok: true, token }, 200);
  } catch (error) {
    console.error("Admin password update failed:", error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}
