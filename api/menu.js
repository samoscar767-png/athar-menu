// GET  /api/menu  -> current menu data (public — the storefront reads this)
// POST /api/menu  -> replaces the stored menu data (admin-only)
//
// Reconstructed to match what data.js currently expects. If your real
// api/menu.js has additional logic (validation, partial updates, etc.),
// port that over — the only change needed here is swapping the
// x-admin-token header check for requireAuth(req, res).

import { kv } from "@vercel/kv";
import { requireAuth } from "../lib/auth.js";

const MENU_KEY = "athar-menu-data";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const data = await kv.get(MENU_KEY);
    if (!data) return res.status(404).json({ error: "No menu data found" });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const session = await requireAuth(req, res);
    if (!session) return; // requireAuth already sent 401

    const body = req.body;
    if (!body || !body.sections || !body.items || !body.account) {
      return res.status(400).json({ error: "Invalid menu payload" });
    }

    await kv.set(MENU_KEY, body);
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
