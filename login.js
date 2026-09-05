// POST /api/login  { email, password }  ->  { ok: true, account: { name, email } }
//
// Credentials are checked here, server-side, against the account record in
// KV — not in the browser. On success this sets the httpOnly session
// cookie via lib/auth.js; the browser never sees a secret it could leak.
//
// NOTE: the account password is still stored as plain text in KV (carried
// over from the current data model). That's a separate improvement worth
// making — hash it with bcrypt/scrypt and compare hashes here — but is out
// of scope for this pass, which focuses on removing the client-exposed
// static token.

import { kv } from "@vercel/kv";
import { createSessionCookie } from "../lib/auth.js";

const MENU_KEY = "athar-menu-data";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  let data;
  try {
    data = await kv.get(MENU_KEY);
  } catch (error) {
    console.error("KV read failed in /api/login:", error);
    return res.status(500).json({ error: "Could not reach the data store. Check the KV connection env vars on Vercel." });
  }

  const account = data && data.account;
  if (!account) {
    return res.status(500).json({ error: "No account configured" });
  }

  const emailMatch = String(email).trim().toLowerCase() === String(account.email).toLowerCase();
  const passwordMatch = password === account.password;
  if (!emailMatch || !passwordMatch) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Signing the session cookie needs SESSION_SECRET. Without this try/catch,
  // a missing env var crashes the function with an opaque 500 instead of a
  // message that actually points at the fix.
  let cookie;
  try {
    cookie = await createSessionCookie(account.email);
  } catch (error) {
    console.error("Session cookie signing failed in /api/login:", error);
    return res.status(500).json({ error: "Server is missing its SESSION_SECRET environment variable. Set it in the Vercel project settings and redeploy." });
  }

  res.setHeader("Set-Cookie", cookie);
  return res.status(200).json({ ok: true, account: { name: account.name, email: account.email } });
}
