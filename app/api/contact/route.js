import { NextResponse } from "next/server";
import { getPage } from "../../../lib/data";
import { getDb } from "../../../lib/db";
import { getEmailSettings } from "../../../lib/settings";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function respond(body, status) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * POST /api/contact — enquiry endpoint.
 *
 * The JSON contract the form consumes today:
 *   200 { ok: true, code: "sent", message, receivedAt }
 *   400 { ok: false, code: "invalid", message, errors }
 *   500 { ok: false, code: "failed", message }
 *
 * Enquiries are stored in MongoDB for the admin inbox. The client
 * forwards stored enquiries to Web3Forms after this route succeeds.
 */
export async function POST(request) {
  const page = await getPage("contact");
  const form = page.form;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return respond(
      { ok: false, code: "invalid", message: form.invalidMessage, errors: {} },
      400,
    );
  }

  const name = String(payload?.name ?? "").trim();
  const email = String(payload?.email ?? "").trim();
  const phone = String(payload?.phone ?? "").trim();
  const message = String(payload?.message ?? "").trim();
  const phoneDigits = phone.replace(/\D/g, "");

  const errors = {};
  if (!name || name.length > 120) errors.name = form.fieldErrors.name;
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    errors.email = form.fieldErrors.email;
  }
  if (phoneDigits && (phoneDigits.length < 7 || phoneDigits.length > 15)) {
    errors.phone = form.fieldErrors.phone;
  }
  if (!message || message.length > 4000) {
    errors.message = form.fieldErrors.message;
  }

  if (Object.keys(errors).length > 0) {
    return respond(
      {
        ok: false,
        code: "invalid",
        message: form.invalidMessage,
        errors,
      },
      400,
    );
  }

  const receivedAt = new Date();
  const enquiry = {
    name,
    email,
    phone,
    message,
    source: "contact",
    status: "new",
    createdAt: receivedAt,
    updatedAt: receivedAt,
  };

  let emailKey = "";

  try {
    const db = await getDb();
    await db.collection("enquiries").insertOne(enquiry);
    const settings = await getEmailSettings(db).catch((error) => {
      console.error("Contact email settings read failed:", error.message);
      return null;
    });
    emailKey = settings?.accessKey ?? "";
  } catch (error) {
    console.error("Contact enquiry failed:", error.message);
    return respond(
      {
        ok: false,
        code: "failed",
        message: form.errorMessage,
      },
      500,
    );
  }

  return respond(
    {
      ok: true,
      code: "sent",
      message: form.successMessage,
      receivedAt: receivedAt.toISOString(),
      emailKey: emailKey || null,
    },
    200,
  );
}
