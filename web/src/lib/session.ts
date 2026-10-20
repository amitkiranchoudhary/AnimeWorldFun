import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Single-owner session: a signed cookie "<payload>.<signature>" (HMAC-SHA256).
// There are no other accounts, so the payload only carries an expiry time.

const COOKIE_NAME = "awf_owner";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 1 week

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be set (32+ characters)");
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function isValid(token: string | undefined) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export async function createOwnerSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE_SECONDS * 1000 })).toString("base64url");
  (await cookies()).set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function deleteOwnerSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function isOwner() {
  return isValid((await cookies()).get(COOKIE_NAME)?.value);
}

/** Use at the top of every owner-only page and Server Action. */
export async function requireOwner() {
  if (!(await isOwner())) redirect("/login");
}
