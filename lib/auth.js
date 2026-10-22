import { randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { SignJWT, jwtVerify } from "jose";
import { getDb } from "./db";
import { hashPassword, verifyPassword } from "./password.mjs";

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;
const JWT_ISSUER = "hotmale-cms";
const JWT_AUDIENCE = "hotmale-admin";
const JWT_ALGORITHM = "HS256";

let dummyHashPromise = null;

export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function isSameOriginRequest(request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return false;
  }
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_JWT_SECRET is not configured.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user) {
  const tokenVersion = Number.isInteger(user.tokenVersion)
    ? user.tokenVersion
    : 0;

  return new SignJWT({ role: user.role, ver: tokenVersion })
    .setProtectedHeader({ alg: JWT_ALGORITHM, typ: "JWT" })
    .setSubject(String(user.id ?? user._id))
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setJti(randomBytes(16).toString("hex"))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

function getDummyHash() {
  if (!dummyHashPromise) {
    dummyHashPromise = hashPassword(randomBytes(24).toString("base64url"));
  }
  return dummyHashPromise;
}

export async function authenticate({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const db = await getDb();
  const now = new Date();

  const user = await db
    .collection("admin_users")
    .findOne({ email: normalizedEmail, status: "active" });

  let valid = false;
  if (user) {
    valid = await verifyPassword(password, user.passwordHash);
  } else {
    await verifyPassword(password, await getDummyHash());
  }

  if (!valid) {
    return { ok: false, code: "invalid" };
  }

  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  const token = await createSessionToken(user);
  await db
    .collection("admin_users")
    .updateOne({ _id: user._id }, { $set: { lastLoginAt: now } });

  return {
    ok: true,
    token,
    expiresAt,
    user: {
      id: String(user._id),
      email: user.email,
      name: user.name || user.email,
      role: user.role,
    },
  };
}

async function verifySessionToken(token) {
  let payload;
  try {
    ({ payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }));
  } catch {
    return null;
  }

  const userId = typeof payload.sub === "string" ? payload.sub : "";
  if (!ObjectId.isValid(userId) || !Number.isFinite(payload.exp)) return null;

  const db = await getDb();
  const user = await db
    .collection("admin_users")
    .findOne({ _id: new ObjectId(userId), status: "active" });
  if (!user || user.role !== "admin") return null;

  const tokenVersion = Number.isInteger(user.tokenVersion)
    ? user.tokenVersion
    : 0;
  if (payload.ver !== tokenVersion) return null;

  return {
    user: {
      id: String(user._id),
      email: user.email,
      name: user.name || user.email,
      role: user.role,
    },
    expiresAt: new Date(payload.exp * 1000),
  };
}

export async function getRequestSession(request) {
  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return verifySessionToken(token);
}
