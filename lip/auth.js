// Shared session helpers for the Athar admin API.
//
// Replaces the old model (a single static ADMIN_API_TOKEN shipped in
// client-side JS, sent on every write) with a short-lived, httpOnly,
// signed session cookie issued only after a successful /api/login.
// The browser can't read or forge this cookie's contents, and it isn't
// sitting in the page source the way the old token was.
//
// Requires the "jose" package (`npm install jose`) and a SESSION_SECRET
// environment variable set on the Vercel project (any long random string —
// e.g. `openssl rand -hex 32`).

import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "athar_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

// Issues a signed session token for the given account email and returns the
// Set-Cookie header value to send back to the browser.
export async function createSessionCookie(email) {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS)
    .sign(getSecretKey());

  const parts = [
    `${COOKIE_NAME}=${token}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${SESSION_TTL_SECONDS}`
  ];
  return parts.join("; ");
}

// Returns a Set-Cookie header value that immediately expires the session
// cookie, for use on logout.
export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function readCookie(req, name) {
  const header = req.headers.cookie || "";
  const match = header.split(";").map(function (c) { return c.trim(); })
    .find(function (c) { return c.startsWith(name + "="); });
  return match ? match.slice(name.length + 1) : null;
}

// Verifies the session cookie on an incoming request. Returns the decoded
// payload ({ email, iat, exp }) if valid, or null if missing/invalid/expired.
export async function verifySession(req) {
  const token = readCookie(req, COOKIE_NAME);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch (error) {
    return null;
  }
}

// Convenience guard for API routes: verifies the session and, if invalid,
// writes a 401 response and returns null. Otherwise returns the session
// payload so the caller can proceed.
//
// Usage in a route handler:
//   const session = await requireAuth(req, res);
//   if (!session) return; // requireAuth already sent the 401
export async function requireAuth(req, res) {
  const session = await verifySession(req);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return session;
}
