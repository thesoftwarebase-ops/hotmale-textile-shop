import { NextResponse } from "next/server";
import { getRequestSession } from "../../../../lib/auth";
import { getDb } from "../../../../lib/db";

function json(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request) {
  const session = await getRequestSession(request);
  if (!session) return json({ ok: false, code: "unauthorized" }, 401);

  try {
    const db = await getDb();
    const enquiries = db.collection("enquiries");
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [items, total, lastSevenDays] = await Promise.all([
      enquiries.find({}).sort({ createdAt: -1 }).limit(20).toArray(),
      enquiries.countDocuments({}),
      enquiries.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    return json({
      ok: true,
      total,
      lastSevenDays,
      enquiries: items.map(({ _id, ...item }) => ({
        id: String(_id),
        ...item,
      })),
    });
  } catch (error) {
    console.error("Enquiry list failed:", error.message);
    return json({ ok: false, code: "server_error" }, 500);
  }
}
