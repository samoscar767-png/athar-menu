import { head, put } from '@vercel/blob';

const PATHNAME = 'athar-menu-data.json';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const info = await head(PATHNAME).catch(function () { return null; });
      if (!info) {
        res.status(404).json({ error: 'not_found' });
        return;
      }
      const upstream = await fetch(info.url, { cache: 'no-store' });
      if (!upstream.ok) {
        res.status(502).json({ error: 'upstream_failed' });
        return;
      }
      const json = await upstream.json();
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json(json);
    } catch (err) {
      res.status(500).json({ error: 'read_failed', message: err.message });
    }
    return;
  }

  if (req.method === 'POST') {
    const token = req.headers['x-admin-token'];
    if (!process.env.ADMIN_API_TOKEN || token !== process.env.ADMIN_API_TOKEN) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    try {
      const body = req.body;
      if (!body || !body.sections || !body.items || !body.account) {
        res.status(400).json({ error: 'invalid_payload' });
        return;
      }
      await put(PATHNAME, JSON.stringify(body), {
        access: 'public',
        contentType: 'application/json',
        allowOverwrite: true,
        addRandomSuffix: false
      });
      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: 'write_failed', message: err.message });
    }
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'method_not_allowed' });
}
