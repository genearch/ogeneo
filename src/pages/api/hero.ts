// POST /api/hero — update the homepage hero (occasional, deliberate).
// Form fields (all optional; only provided fields change):
//   title  — headline (line breaks preserved)
//   sub    — the handwritten subtitle
//   file   — hero image; replaces the village line art on the right
//   clear_image=1 — remove the image, restore the village art
// Header: Authorization: Bearer <UPLOAD_SECRET>

import type { APIRoute } from 'astro';
import { uploadToCloudinary } from '../../lib/cloudinary';
import type { Env } from '../../lib/types';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env as Env;

  const auth = request.headers.get('authorization') ?? '';
  if (!env.UPLOAD_SECRET || auth !== `Bearer ${env.UPLOAD_SECRET}`) {
    return json({ error: 'unauthorized' }, 401);
  }

  let form: FormData;
  try { form = await request.formData(); } catch { return json({ error: 'expected form data' }, 400); }

  const str = (k: string) => {
    const v = form.get(k);
    return typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
  };

  const row = await env.DB.prepare(`SELECT value FROM settings WHERE key = 'hero'`).first<{ value: string }>();
  let hero: { title?: string; sub?: string; image_public_id?: string } = {};
  try { hero = row ? JSON.parse(row.value) : {}; } catch { /* ignore */ }

  const title = str('title');
  const sub = str('sub');
  if (title) hero.title = title;
  if (sub) hero.sub = sub;
  if (str('clear_image')) delete hero.image_public_id;

  const file = form.get('file');
  if (file instanceof Blob && file.size > 0) {
    if (file.size > 25 * 1024 * 1024) return json({ error: 'file too large (25 MB max)' }, 413);
    try {
      const uploaded = await uploadToCloudinary(file, {
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        apiKey: env.CLOUDINARY_API_KEY,
        apiSecret: env.CLOUDINARY_API_SECRET,
        folder: 'ogeneo/hero',
      });
      hero.image_public_id = uploaded.public_id;
    } catch (e) {
      return json({ error: `hero image upload failed: ${(e as Error).message}` }, 502);
    }
  }

  await env.DB.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES ('hero', ?1, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = ?1, updated_at = datetime('now')`
  ).bind(JSON.stringify(hero)).run();

  return json({ ok: true, hero }, 201);
};
