import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getRequestSession, isSameOriginRequest } from "../auth";
import { CMS_CACHE_TAG } from "./cache";

export function json(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function requireAdmin(request, { mutating = false } = {}) {
  if (mutating && !isSameOriginRequest(request)) {
    return { error: json({ ok: false, code: "forbidden" }, 403) };
  }

  const session = await getRequestSession(request);
  if (!session) {
    return { error: json({ ok: false, code: "unauthorized" }, 401) };
  }

  return { session };
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function revalidateContent({ paths = [] } = {}) {
  try {
    revalidateTag(CMS_CACHE_TAG, { expire: 0 });
    revalidatePath("/", "layout");
    revalidatePath("/sitemap.xml");
    for (const path of new Set(paths.filter(Boolean))) {
      revalidatePath(path);
    }
  } catch (error) {
    console.error("Content revalidation failed:", error.message);
  }
}

export function serializeDoc(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}
