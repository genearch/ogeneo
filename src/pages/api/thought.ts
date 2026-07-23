// POST /api/thought — the dedicated Comet shortcut endpoint.
// Form fields (multipart or urlencoded):
//   body   (required) the thought text
//   lat, lng, place   optional location where the comet was posted
// Header: Authorization: Bearer <UPLOAD_SECRET>

import type { APIRoute } from 'astro';
import type { Env } from '../../lib/types';

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
    return json({ error: 'expected form data' }, 400);
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

  const body = str('body');
  if (!body) return json({ error: 'missing body' }, 400);
  if (body.length > 1000) return json({ error: 'too long (1000 chars max)' }, 413);

  const lat = num('lat');
  const lng = num('lng');

  const row = await env.DB.prepare(
    `INSERT INTO thoughts (body, lat, lng, place) VALUES (?1, ?2, ?3, ?4) RETURNING id`
  ).bind(body, lat, lng, str('place')).first<{ id: number }>();

  return json({ ok: true, thought_id: row?.id, located: lat != null && lng != null }, 201);
};
