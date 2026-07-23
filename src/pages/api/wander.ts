// POST /api/wander — set Currently Wandering deliberately (its own Shortcut).
// Form fields: place (required), note, lat, lng, country (2-letter), timezone
// Header: Authorization: Bearer <UPLOAD_SECRET>

import type { APIRoute } from 'astro';
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
  const num = (k: string) => {
    const v = str(k); if (v == null) return null;
    const n = Number(v); return Number.isFinite(n) ? n : null;
  };

  const place = str('place');
  if (!place) return json({ error: 'missing place' }, 400);

  const state = {
    place,
    note: str('note') ?? '',
    since: new Date().toISOString().slice(0, 10),
    lat: num('lat') ?? undefined,
    lng: num('lng') ?? undefined,
    country: (str('country') ?? undefined)?.slice(0, 2),
    timezone: str('timezone') ?? undefined,
  };

  await env.DB.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES ('currently_wandering', ?1, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = ?1, updated_at = datetime('now')`
  ).bind(JSON.stringify(state)).run();

  return json({ ok: true, wandering: state }, 201);
};
