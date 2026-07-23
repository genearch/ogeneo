// V1 "AI" enrichment: heuristic Experience grouping + tag inference.
// Groups a new Moment into an existing Experience when it is close in
// time AND place; otherwise starts a new Experience once a second nearby
// Moment shows up. Upgrade path: Workers AI for captions/weather later.

import type { Env, Moment } from './types';

const MAX_GAP_HOURS = 8;
const MAX_DISTANCE_KM = 30;

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function hoursBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 3_600_000;
}

/** Infer simple tags from caption + metadata. */
export function inferTags(caption: string | null, source: string): string[] {
  const tags = new Set<string>();
  if (source === 'meta') tags.add('first-person');
  const text = (caption ?? '').toLowerCase();
  const dictionary: Record<string, string> = {
    lily: 'lily', fog: 'fog', beach: 'coast', ocean: 'ocean', coast: 'coast',
    road: 'roadtrip', drive: 'drive', sunset: 'golden-hour', sunrise: 'morning',
    coffee: 'cafe', garden: 'garden', home: 'home', hike: 'hike', trail: 'hike',
  };
  for (const [word, tag] of Object.entries(dictionary)) {
    if (text.includes(word)) tags.add(tag);
  }
  return [...tags];
}

/** Attach the moment to an Experience (existing or new). Returns experience_id or null. */
export async function groupIntoExperience(env: Env, moment: Moment): Promise<number | null> {
  if (!moment.captured_at) return null;

  // Nearest recent moment with an experience
  const { results } = await env.DB.prepare(
    `SELECT m.*, e.id AS exp_id FROM moments m
     JOIN experiences e ON m.experience_id = e.id
     WHERE m.id != ?1
     ORDER BY ABS(strftime('%s', m.captured_at) - strftime('%s', ?2)) ASC
     LIMIT 5`
  ).bind(moment.id, moment.captured_at).all<Moment & { exp_id: number }>();

  for (const cand of results ?? []) {
    const timeOk = hoursBetween(cand.captured_at, moment.captured_at) <= MAX_GAP_HOURS;
    const distOk =
      moment.lat == null || cand.lat == null
        ? true // no GPS: trust the time window
        : haversineKm(moment.lat, moment.lng!, cand.lat, cand.lng!) <= MAX_DISTANCE_KM;
    if (timeOk && distOk) {
      await env.DB.prepare(
        `UPDATE experiences SET
           start_at = MIN(start_at, ?1), end_at = MAX(end_at, ?1)
         WHERE id = ?2`
      ).bind(moment.captured_at, cand.exp_id).run();
      return cand.exp_id;
    }
  }

  // No experience matched: is there a loose moment nearby in time/space to pair with?
  const { results: loose } = await env.DB.prepare(
    `SELECT * FROM moments
     WHERE experience_id IS NULL AND id != ?1
     ORDER BY ABS(strftime('%s', captured_at) - strftime('%s', ?2)) ASC
     LIMIT 5`
  ).bind(moment.id, moment.captured_at).all<Moment>();

  for (const cand of loose ?? []) {
    const timeOk = hoursBetween(cand.captured_at, moment.captured_at) <= MAX_GAP_HOURS;
    const distOk =
      moment.lat == null || cand.lat == null
        ? true
        : haversineKm(moment.lat, moment.lng!, cand.lat, cand.lng!) <= MAX_DISTANCE_KM;
    if (timeOk && distOk) {
      const first = cand.captured_at < moment.captured_at ? cand : moment;
      const last = first === cand ? moment : cand;
      const place = moment.place ?? cand.place ?? null;
      const title = place
        ? `${place}, ${new Date(first.captured_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
        : `Moments of ${new Date(first.captured_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
      const ins = await env.DB.prepare(
        `INSERT INTO experiences (title, start_at, end_at, place, lat, lng)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING id`
      ).bind(title, first.captured_at, last.captured_at, place, moment.lat, moment.lng)
        .first<{ id: number }>();
      if (ins) {
        await env.DB.prepare(`UPDATE moments SET experience_id = ?1 WHERE id IN (?2, ?3)`)
          .bind(ins.id, cand.id, moment.id).run();
        return ins.id;
      }
    }
  }
  return null;
}
