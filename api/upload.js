// POST /api/upload  { dataUrl, filename }  ->  { url }
//
// Uploads a base64 data URL (already resized client-side in admin.js) to
// Vercel Blob storage and returns the public URL. Admin-only.

import { put } from "@vercel/blob";
import { requireAuth } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await requireAuth(req, res);
  if (!session) return; // requireAuth already sent 401

  const { dataUrl, filename } = req.body || {};
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    return res.status(400).json({ error: "dataUrl must be a base64 image data URL" });
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) {
    return res.status(400).json({ error: "Malformed image data URL" });
  }
  const contentType = match[1];
  const buffer = Buffer.from(match[2], "base64");

  const safeName = String(filename || "image").replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `menu/${Date.now()}-${safeName}.${contentType.split("/")[1]}`;

  const blob = await put(key, buffer, {
    access: "public",
    contentType: contentType
  });

  return res.status(200).json({ url: blob.url });
}
