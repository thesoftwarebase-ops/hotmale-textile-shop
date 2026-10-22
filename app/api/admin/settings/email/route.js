import {
  json,
  readJson,
  requireAdmin,
} from "../../../../../lib/cms/api";
import { getDb } from "../../../../../lib/db";
import {
  EMAIL_SETTINGS_ID,
  getEmailSettings,
  isValidWeb3FormsKey,
  normalizeWeb3FormsKey,
} from "../../../../../lib/settings";

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const db = await getDb();
    const settings = await getEmailSettings(db);
    return json({
      ok: true,
      accessKey: settings?.accessKey ?? "",
      updatedAt: settings?.updatedAt ?? null,
    });
  } catch (error) {
    console.error("Email settings read failed:", error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}

export async function PUT(request) {
  const auth = await requireAdmin(request, { mutating: true });
  if (auth.error) return auth.error;

  const body = await readJson(request);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  const accessKey = normalizeWeb3FormsKey(body.accessKey);
  if (accessKey && !isValidWeb3FormsKey(accessKey)) {
    return json(
      { ok: false, code: "invalid", errors: { accessKey: true } },
      422,
    );
  }

  try {
    const db = await getDb();
    const now = new Date();
    await db.collection("settings").updateOne(
      { _id: EMAIL_SETTINGS_ID },
      {
        $set: { accessKey, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );

    return json({ ok: true, accessKey, updatedAt: now });
  } catch (error) {
    console.error("Email settings update failed:", error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}
