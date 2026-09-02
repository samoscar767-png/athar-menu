import { put } from '@vercel/blob';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB, matches the client-side limit

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const token = req.headers['x-admin-token'];
  if (!process.env.ADMIN_API_TOKEN || token !== process.env.ADMIN_API_TOKEN) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  try {
    const body = req.body;
    const dataUrl = body && body.dataUrl;
    if (!dataUrl || typeof dataUrl !== 'string') {
      res.status(400).json({ error: 'invalid_payload' });
      return;
    }

    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/.exec(dataUrl);
    if (!match) {
      res.status(400).json({ error: 'invalid_image_data' });
      return;
    }

    const contentType = match[1];
    const buffer = Buffer.from(match[2], 'base64');

    if (buffer.length > MAX_BYTES) {
      res.status(413).json({ error: 'file_too_large' });
      return;
    }

    const ext = (contentType.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const rawName = typeof body.filename === 'string' ? body.filename : 'image';
    const safeName = rawName.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 40) || 'image';
    const pathname = 'menu-images/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '-' + safeName + '.' + ext;

    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType: contentType,
      addRandomSuffix: false
    });

    res.status(200).json({ url: blob.url });
  } catch (err) {
    res.status(500).json({ error: 'upload_failed', message: err.message });
  }
}
