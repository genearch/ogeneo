// POST /api/upload — receiving end of the Share Sheet → Shortcut pipeline.
//
// Multipart form fields (from the iPhone Shortcut):
//   file          (required) the original image
//   captured_at   ISO 8601 capture date (falls back to now)
//   lat, lng      GPS, optional
//   camera_make, camera_model, filename, caption   optional
//   source        'iphone' | 'meta' (defaults by camera_make containing 'meta')
//
// Headers:
//   Authorization: Bearer <UPLOAD_SECRET>
//
// Flow: auth → Cloudinary signed upload → insert Moment → tag inference →
// Experience grouping → published (it is on the site immediately).

import type { APIRoute } from 'astro';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { groupIntoExperience, inferTags } from '../../lib/enrich';
import { maybeUpdateWandering } from '../../lib/wander';
import type { Env, Moment } from '../../lib/types';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env as Env;

  const auth = request.headers.get('authorization') ?? '';
  if (!env.UPLOAD_SECRET || auth !== `Bearer ${env.UPLOAD_SECRET}`) {
    return json({ error: 'unauthorized' }, 401);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'expected multipart/form-data' }, 400);
  }

  const file = form.get('file');
  if (!(file instanceof Blob) || file.size === 0) {
    return json({ error: 'missing file' }, 400);
  }
  if (file.size > 25 * 1024 * 1024) {
    return json({ error: 'file too large (25 MB max)' }, 413);
  }

  const str = (k: string) => {
    const v = form.get(k);
    return typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
  };
  const num = (k: string) => {
    const v = str(k);
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const capturedRaw = str('captured_at');
  const captured_at =
    capturedRaw && !Number.isNaN(Date.parse(capturedRaw))
      ? new Date(capturedRaw).toISOString()
      : new Date().toISOString();
  const camera_make = str('camera_make');
  const source =
    str('source') ??
    ((camera_make ?? '').toLowerCase().includes('meta') ? 'meta' : 'iphone');
  const caption = str('caption');
  const lat = num('lat');
  const lng = num('lng');

  // 1. Media to Cloudinary
  let uploaded;
  try {
    uploaded = await uploadToCloudinary(file, {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    });
  } catch (e) {
    return json({ error: `media upload failed: ${(e as Error).message}` }, 502);
  }

  // 2. Enrich + insert Moment
  const tags = inferTags(caption, source);
  const is_lily = tags.includes('lily') ? 1 : 0;

  const row = await env.DB.prepare(
    `INSERT INTO moments
       (captured_at, source, caption, filename, camera_make, camera_model,
        lat, lng, cloudinary_public_id, width, height, ai_tags, is_lily)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)
     RETURNING *`
  ).bind(
    captured_at, source, caption, str('filename'), camera_make, str('camera_model'),
    lat, lng, uploaded.public_id, uploaded.width, uploaded.height,
    JSON.stringify(tags), is_lily
  ).first<Moment>();

  if (!row) return json({ error: 'insert failed' }, 500);

  // 3. Group into an Experience (best-effort; never blocks publishing)
  let experience_id: number | null = null;
  try {
    experience_id = await groupIntoExperience(env, row);
  } catch {
    /* grouping is an enhancement, not a requirement */
  }

  // 4. Apollo's dynamic wandering: far-from-the-pin photos move the pin
  try {
    await maybeUpdateWandering(env, row);
  } catch {
    /* also best-effort */
  }

  return json({
    ok: true,
    moment_id: row.id,
    experience_id,
    url: `/moments/${row.id}`,
    cloudinary_public_id: uploaded.public_id,
    tags,
    lily: is_lily === 1,
  }, 201);
};
